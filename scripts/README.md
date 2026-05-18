# scripts/

Planned location for the lint CLIs that enforce the three contracts.

## Planned scripts (TODO)

| Script | Purpose | Reference |
|---|---|---|
| `case-lint.ts` | Validate case `.md` files against the schema | [`../contracts/case-schema.md`](../contracts/case-schema.md) |
| `app-context-lint.ts` | Validate substrate's `tests/app.context.md` against the schema | [`../contracts/app-context-schema.md`](../contracts/app-context-schema.md) |
| `skill-slot-lint.ts` | Validate `.claude/skills/<framework>/SKILL.md` against the slot contract | [`../contracts/slot-contract.md`](../contracts/slot-contract.md) |

These will be exposed via a CLI such as `npx e2e-ai-kit lint case`,
`npx e2e-ai-kit lint app-context`, `npx e2e-ai-kit lint slot`. The
`package.json` and CLI wrapper do not exist yet.

## When these scripts get built

Per [`../docs/ONBOARDING.md`](../docs/ONBOARDING.md), each stage gates
on a lint pass. The first substrate (mcd-website) is currently
operating without these lints; the first substrate to require them
will be substrate #2, which is the trigger to write them. Until then,
this directory is a placeholder.
