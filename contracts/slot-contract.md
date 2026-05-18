# Framework slot contract

> **Status: stub.** The design intent is captured in
> [`../CONTEXT.md`](../CONTEXT.md) § Framework slot. This file will
> hold the full per-section spec for S1-S9, the forbidden-content
> list with rationale, the slot frontmatter spec, the sedimentation
> routing rules, and the lint that enforces it.

## Quick reference

A framework slot lives at `.claude/skills/<framework>-<admin_stack>/SKILL.md`
in the substrate (the path is fixed by Claude Code, not negotiable).
The slot MUST cover and ONLY cover these 9 categories:

| # | Required slot section | Example (`playwright-qor` on mcd-website) |
|---|---|---|
| S1 | Selector strategy | Prefer `getByRole`, avoid `.class` |
| S2 | Wait / readiness strategy | Server-rendered qor needs `networkidle` |
| S3 | Form input strategy (framework × admin-stack quirks) | MediaBox bypass, MDL-wrapped controls |
| S4 | Action / state-transition driving | qor action buttons + confirmation modal |
| S5 | Page Object structure convention | `pages/*.page.ts`, one class per resource |
| S6 | Test naming + file layout | `<feature>-<intent>.spec.ts` |
| S7 | Parallelism + data isolation | Worker count, storageState segmentation |
| S8 | Anti-patterns ("Never do this") | Don't `console.log(page.content())` |
| S9 | Cost discipline | `trace: 'on-first-retry'`, screenshot policy |

## Forbidden in the slot

These belong elsewhere; their presence in a slot is a lint failure.

- Tier 1/2/3 classification → [`../skills/maintenance/SKILL.md`](../skills/maintenance/SKILL.md) is the single authority (Product component 3)
- Case `.md` schema → [`./case-schema.md`](./case-schema.md) (Product component 2)
- Application context schema → [`./app-context-schema.md`](./app-context-schema.md) (Product component 6)
- Sedimentation rules → cross-slot Product convention (Product component 5)
- Substrate business names / domain concepts → substrate's
  `tests/app.context.md § Known quirks`

## What this file will contain (TODO)

- Per-section S1-S9 detailed spec (what "covered" means; minimum
  content; failure modes if missing)
- Required slot SKILL.md frontmatter:
  - `name`, `description` (existing Claude Code convention)
  - `framework`, `admin_stack`, `version`, `required_sections`
- Optional `quirks/<scope>.md` sub-files: when to split, naming
- Sedimentation routing decision table (3-way classifier)
- `skill-slot-lint` invariants
- Cleanup guidance for slots that drifted before this contract existed
  (mcd-website's `playwright-qor` has Tier classification in Rule 6
  and substrate-specific auth in Rule 4 — both must be moved)

## Related Product components

- Product component 5 — Skill-as-sediment
- Product component 3 — Tier classification (the slot must NOT
  duplicate this; it must reference)
- Governance — Sediment PR SLA (2 working days)
  ([`../CONTEXT.md`](../CONTEXT.md) § Governance)
