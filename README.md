# ci-agents

GitHub Actions for AI-powered code review using a three-layer architecture:

- **Agent** — Runs a single AI agent (Claude or Gemini) with a prompt, validates output against a JSON Schema, retries on structural failure.
- **Team** — Runs N agents on the same task, passes outputs to an alignment evaluator, produces an alignment report. *(future)*
- **Panel** — Aggregates team/agent results across categories, applies a ruling algorithm (any-fail, majority, custom), produces a ruling report. *(future)*

Actions are pure functions: inputs to structured outputs via `shared`. No side effects — consumer workflows decide what to do with the results.

Depends on [sw2m/octoscript](https://github.com/sw2m/octoscript) for the Deno runtime and shared/output/artifact/serde modules.
