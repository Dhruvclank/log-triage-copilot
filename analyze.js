// analyze.js
//
// What this does, in plain terms:
//   1. Takes each log line from logs.js
//   2. Asks an AI model to classify it (severity + category + fix suggestion)
//   3. Compares the AI's answer to the "expected" answer we wrote ourselves
//   4. Prints a scorecard: how many did it get right?
//
// Two modes:
//   MOCK MODE (default, no setup needed) — uses a simple built-in rule-based
//   stand-in for the AI, so you can see the whole pipeline work right now,
//   for free, with nothing installed.
//
//   REAL MODE — set ANTHROPIC_API_KEY in a .env file and it calls the real
//   Claude API instead. Costs a fraction of a penny per log.
//
// Run it with:  node analyze.js

import { logs } from "./logs.js";
import { readFileSync, writeFileSync, existsSync } from "fs";

// ---------- tiny manual .env loader (no extra packages needed) ----------
function loadEnv() {
  if (!existsSync(".env")) return {};
  const contents = readFileSync(".env", "utf-8");
  const env = {};
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key) env[key.trim()] = rest.join("=").trim();
  }
  return env;
}
const env = { ...loadEnv(), ...process.env };
const API_KEY = env.ANTHROPIC_API_KEY;
const MOCK_MODE = !API_KEY;

// ---------- the instructions we give the AI ----------
const SYSTEM_PROMPT = `You are a log triage assistant for a DevOps team.
You will be given one raw log line. Respond with ONLY a JSON object, no other text, in exactly this shape:

{
  "severity": "low" | "medium" | "high",
  "category": "network" | "auth" | "resource" | "database" | "config" | "service",
  "root_cause": "one short sentence, plain language",
  "suggested_fix": "one short sentence, plain language",
  "confidence": "low" | "medium" | "high"
}

If you are not confident, set "confidence" to "low" rather than guessing wildly.`;

// ---------- REAL MODE: call the actual Claude API ----------
async function callClaudeReal(logText) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001", // small + cheap model, good enough for this task
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Log line:\n${logText}` }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const raw = data.content?.find((c) => c.type === "text")?.text ?? "";
  return raw;
}

// ---------- MOCK MODE: a dumb stand-in so this runs today for free ----------
// This is NOT real AI — it's simple keyword matching, just so you can see
// the full pipeline (call model -> parse -> score) working end to end
// before you ever touch an API key.
function callClaudeMock(logText) {
  const lower = logText.toLowerCase();

  let category = "service";
  if (/(timeout|upstream|latency|ssl|handshake|req\/min|502)/.test(lower)) category = "network";
  else if (/(login|auth|jwt|password|unauthorized|token)/.test(lower)) category = "auth";
  else if (/(disk|memory|oom|cache hit|usage)/.test(lower)) category = "resource";
  else if (/(db|database|replication|postgres|pool)/.test(lower)) category = "database";
  else if (/(config|certificate|expired|deploy|rollback|api key)/.test(lower)) category = "config";

  let severity = "low";
  if (/(critical|oom|exhausted|failed|expired|exception|500|full)/.test(lower)) severity = "high";
  else if (/(warn|climbing|increased|lag|retried|3x)/.test(lower)) severity = "medium";

  return JSON.stringify({
    severity,
    category,
    root_cause: "(mock) pattern-matched from keywords in the log line",
    suggested_fix: "(mock) placeholder — swap in a real API key to get a real suggestion",
    confidence: "low",
  });
}

// ---------- parse the model's reply safely ----------
function parseResponse(raw) {
  try {
    // strip markdown fences if the model added them anyway
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.severity || !parsed.category) throw new Error("missing fields");
    return { ok: true, parsed };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ---------- run everything ----------
async function main() {
  console.log(MOCK_MODE ? "── running in MOCK MODE (no API key found) ──\n" : "── running in REAL MODE (calling Claude API) ──\n");

  const results = [];
  let severityMatches = 0;
  let categoryMatches = 0;
  let parseFailures = 0;

  for (const log of logs) {
    let raw;
    try {
      raw = MOCK_MODE ? callClaudeMock(log.text) : await callClaudeReal(log.text);
    } catch (err) {
      console.log(`#${log.id} ⚠️  API call failed: ${err.message} — marking as needs-review`);
      results.push({ id: log.id, status: "api_error", error: err.message });
      continue;
    }

    const { ok, parsed, error } = parseResponse(raw);

    if (!ok) {
      parseFailures++;
      console.log(`#${log.id} ⚠️  could not parse model output (${error}) — flagged for human review`);
      results.push({ id: log.id, status: "unparseable", raw });
      continue;
    }

    const severityMatch = parsed.severity === log.expected.severity;
    const categoryMatch = parsed.category === log.expected.category;
    if (severityMatch) severityMatches++;
    if (categoryMatch) categoryMatches++;

    const mark = (b) => (b ? "✅" : "❌");
    console.log(
      `#${log.id} severity ${mark(severityMatch)} [got:${parsed.severity} exp:${log.expected.severity}]  ` +
      `category ${mark(categoryMatch)} [got:${parsed.category} exp:${log.expected.category}]  ` +
      `confidence:${parsed.confidence ?? "n/a"}`
    );

    results.push({
      id: log.id,
      log: log.text,
      expected: log.expected,
      got: parsed,
      severityMatch,
      categoryMatch,
    });
  }

  const total = logs.length;
  const severityAcc = ((severityMatches / total) * 100).toFixed(1);
  const categoryAcc = ((categoryMatches / total) * 100).toFixed(1);

  console.log("\n── scorecard ──");
  console.log(`total logs tested:     ${total}`);
  console.log(`severity accuracy:     ${severityMatches}/${total} (${severityAcc}%)`);
  console.log(`category accuracy:     ${categoryMatches}/${total} (${categoryAcc}%)`);
  console.log(`unparseable responses: ${parseFailures}`);
  if (MOCK_MODE) {
    console.log("\nNote: this was mock mode (keyword rules, not real AI).");
    console.log("Add a real ANTHROPIC_API_KEY to .env and re-run to test the actual model.");
  }

  writeFileSync("results.json", JSON.stringify({ mode: MOCK_MODE ? "mock" : "real", severityAcc, categoryAcc, results }, null, 2));
  console.log("\nFull results written to results.json");
}

main();
