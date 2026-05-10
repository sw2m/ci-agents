# ci-agents

Agent / Team / Panel review infrastructure for GitHub Actions.

Three layers, each independently usable:

- **Agent** (`sw2m/ci-agents/agent`) — Run a single AI agent with schema validation and retry.
- **Team** (`sw2m/ci-agents/team`) — Run N agents on the same task, evaluate alignment via a user-provided evaluator.
- **Panel** (`sw2m/ci-agents/panel`) — Aggregate category results with a ruling algorithm (any-fail, majority, or custom script).

All actions are pure: structured data in (`shared` module), structured data out (`shared` + step outputs). No side effects — no comments, no reviews, no issues. The consumer decides what to do with the results.

## Data flow

```
shared.set(ns, "context", data)
        ↓
  Agent / Team / Panel
        ↓
shared.get(ns, "result|alignment|ruling")
```

## Budget tracking

The 7-5-3-1-0 decay schedule is applied at the highest layer used. Panel reads prior comments to determine the round, then includes `round` and `budget` in the ruling output. The consumer uses this to decide whether to continue iterating.

## Dependencies

- [sw2m/octoscript](https://github.com/sw2m/octoscript) — Deno runtime, shared/output/serde/frontmatter globals
