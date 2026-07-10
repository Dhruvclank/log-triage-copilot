# AI Log Triage Copilot

A tool that reads a raw infrastructure log line and answers three questions: how serious is this, what's probably wrong, and what should someone do about it. It's a portfolio-sized version of log analysis work I did at IP Global, where I built utilities to speed up troubleshooting from raw logs.

## What makes this different from a typical AI demo

Most AI portfolio projects are a thin wrapper around a chat API: type a prompt, get a paragraph back, done. This project is small on purpose, but it includes three things that matter in real production AI work and that most demo projects skip.

**1. Structured output.** The model has to return a fixed JSON shape (severity, category, root cause, suggested fix, confidence), not free text. That's what lets the output actually be used by other code instead of just being read by a human.

**2. A real evaluation set.** There are 24 hand-labelled example logs with a known correct answer, written before the model ever saw them. That means accuracy is a measured number, not a guess. Current result: 75% severity accuracy, 83.3% category accuracy in mock mode (see below for what that means).

**3. Graceful failure handling.** If the model's response doesn't parse correctly, or its own stated confidence is low, the tool flags that log for human review instead of pretending the answer is right.

## Live demo

There's a clickable results viewer here: `[add your live demo link once it's on Vercel]`. You can browse all 24 logs, filter to just the mismatches, and see exactly what the model got right and wrong.

## How it works

```
logs.js       the 24 test logs, each with a hand written correct answer
analyze.js    sends each log to the model, parses the reply, scores it against the answer key
results.json  the output of the last run, also used by the live demo page
```

The model is asked to respond in strict JSON. Each response is checked against the expected severity and category, and the script prints a per log result plus an overall accuracy score.

## Running it yourself

```bash
node analyze.js
```

By default this runs in mock mode: no API key, no signup, no cost. It uses simple keyword rules as a stand in for the AI, purely so the whole pipeline (call model, parse response, score it) can be seen working immediately. That's the 75% and 83.3% numbers mentioned above.

To run it against the real Claude API instead, add an Anthropic API key to a `.env` file (see `.env.example`) and run it again. It automatically switches to real mode. The model used is Claude Haiku, the smallest and cheapest available, since a classification task like this doesn't need a large model. That choice, using a small model instead of the biggest one available, is itself a deliberate engineering decision worth mentioning: not every AI task needs the most expensive model.

## Possible next steps

- Compare accuracy and cost between two different sized models
- Grow the test set and split it into a set used to refine the prompt and a held out set never looked at while writing the prompt, which is how real evaluation avoids fooling itself
- Track latency and cost per log alongside accuracy