# AI Log Triage Copilot

A small tool that reads a raw infrastructure log line and tells you: how serious is this, what category of problem is it, what's probably wrong, and what to do about it — with the AI's answers checked against a hand-labelled test set instead of just trusted blindly.

This is a stripped-down, portfolio-sized version of the kind of log-analysis work I did at IP Global, where I built utilities to speed up troubleshooting from raw logs.

## Why this exists

Most "AI project" portfolio pieces are a thin wrapper around a chat API. This one is small on purpose, but includes the three things that actually matter in production AI work and that most demo projects skip:

1. **Structured output** — the model must return a fixed JSON shape, not free-form text, so it can be used by other code.
2. **An evaluation set** — 24 hand-labelled example logs with a known correct answer, so accuracy is a real measured number, not a vibe.
3. **Graceful failure handling** — if the model's output doesn't parse, or its own confidence is low, the tool flags it for human review instead of pretending it's right.

## How to run it

```bash
npm install    # no dependencies to install, but this checks Node works
node analyze.js
```

That's it. **By default it runs in mock mode** — no API key, no signup, no cost — using simple keyword rules as a stand-in for the AI, just so you can see the whole pipeline (call model → parse response → score against answer key) working immediately.

## Switching on the real AI

1. Get a free API key at [console.anthropic.com](https://console.anthropic.com) (new accounts get a small amount of free credit).
2. Copy `.env.example` to `.env` and paste your key in.
3. Run `node analyze.js` again — it automatically detects the key and switches to real mode.

**Cost:** this uses Claude Haiku (the smallest, cheapest model), specifically because a task like log classification doesn't need a large model. Running all 24 test logs costs a fraction of a US cent. That choice — using a small model instead of the biggest one available — is itself a real engineering decision worth mentioning: not every AI task needs the most expensive model.

## What the output looks like

```
#1 severity ❌ [got:low exp:high]  category ✅ [got:network exp:network]  confidence:low
...
── scorecard ──
total logs tested:     24
severity accuracy:     18/24 (75.0%)
category accuracy:     20/24 (83.3%)
unparseable responses: 0
```

Full results are also written to `results.json` after each run.

## Project structure

```
logs.js       — the 24 test logs + the "correct" answer for each
analyze.js    — sends each log to the model, parses the reply, scores it
.env.example  — template for your API key (real .env is git-ignored)
```

## Possible next steps

- Swap the mock rules for a second real model (e.g. a smaller one) and compare accuracy vs. cost between the two
- Add a simple web page on top so it's clickable instead of a terminal script
- Track cost-per-log and latency alongside accuracy
- Grow the test set past 24 examples and split into a "training" set (used to refine the prompt) and a held-out "test" set (never looked at while writing the prompt) — this is how real ML evaluation avoids fooling itself
