# scripts/

> **Status update:** the lint CLIs described here as "planned" have
> **shipped**. They are implemented in [`../src/`](../src/) (parser,
> registry, per-kind lint runners) with the entrypoint at
> [`../bin/e2e-ai-kit.js`](../bin/e2e-ai-kit.js), and exposed as the
> global `e2e-ai-kit` command (see [`../README.md`](../README.md) §
> Installation):
>
> ```sh
> e2e-ai-kit lint case          # contracts/case-schema.md
> e2e-ai-kit lint app-context   # contracts/app-context-schema.md
> e2e-ai-kit lint slot          # contracts/slot-contract.md
> ```

The three contracts enforced:

| Lint | Validates | Contract |
|---|---|---|
| `lint case` | `tests/cases/*.md` | [`../contracts/case-schema.md`](../contracts/case-schema.md) |
| `lint app-context` | `tests/app.context.md` | [`../contracts/app-context-schema.md`](../contracts/app-context-schema.md) |
| `lint slot` | `.claude/skills/<framework>/SKILL.md` | [`../contracts/slot-contract.md`](../contracts/slot-contract.md) |

This directory is retained as a placeholder for any future standalone
scripts; the lint logic itself lives in `src/`, not here.
