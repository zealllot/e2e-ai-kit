# Framework slot contract

> Status: v0.2 shipped (Slice 4). Enforced by `npx e2e-ai-kit lint slot`.

A substrate's **framework slot** lives at
`.claude/skills/<framework>/SKILL.md` (in the substrate; the path is
fixed by Claude Code conventions and is not negotiable). The slot
captures framework × admin-stack specifics — Playwright + qor on
mcd-website, Cypress + Rails admin on a hypothetical substrate #2,
etc.

The slot is the kit's **B2 multi-framework hook**. Substrate-specific
business content does NOT belong here (it lives in
`tests/app.context.md`), and cross-framework Product authority (Tier
classification) is also forbidden (it lives in
[`../skills/maintenance/SKILL.md`](../skills/maintenance/SKILL.md)).

## Frontmatter

Five keys are required. Missing any of them fires
`slot.frontmatter.<key>_required`.

| Key | Type | Notes |
|---|---|---|
| `name` | string | Claude Code skill convention |
| `description` | string | Claude Code skill convention |
| `framework` | string | Test framework name (e.g. `playwright`) |
| `admin_stack` | string | Admin stack name (e.g. `qor`) |
| `required_sections` | array | Slot's own declared sections; informational; the lint enforces S1-S9 below regardless of what this field claims |

Frontmatter that fails to parse as YAML fires
`slot.frontmatter.invalid_yaml`.

## Required slot sections (S1-S9)

Substrate slots MUST contain a heading whose text matches each of the
following nine canonical titles verbatim. The lint matches by exact
title equality (substrates choose H2 vs deeper, but the title text is
fixed). Missing section → `slot.body.section_missing` with the
canonical title in the `section` field.

| Id | Required heading | Purpose |
|---|---|---|
| S1 | `Selector strategy` | Selector preference (e.g. `getByRole` over CSS) |
| S2 | `Wait / readiness strategy` | How to know a page is ready in this framework × admin-stack combo |
| S3 | `Form input strategy` | Handling form types peculiar to the admin stack |
| S4 | `Action / state-transition driving` | How action buttons drive workflows |
| S5 | `Page Object structure convention` | Page Object directory layout + class shape |
| S6 | `Test naming + file layout` | Naming conventions for spec files |
| S7 | `Parallelism + data isolation` | Worker count, storageState segmentation |
| S8 | `Anti-patterns` | "Never do this" list |
| S9 | `Cost discipline` | Tracing, screenshot, logging cost controls |

## Forbidden content

Two categories trigger violations.

### Inline Tier 1/2/3 classification

`slot.forbidden.tier_classification` fires when the slot body contains
≥ 2 heuristically-detected Tier definitions (a heading `### Tier N` or
a line like `Tier N — Auto-fix, open PR`). The slot must REFERENCE
the kit's maintenance skill instead of duplicating it.

Acceptable:

```md
For Tier 1/2/3 failure classification, see
[`../maintenance/SKILL.md`](../maintenance/SKILL.md) — single authority.
```

Forbidden:

```md
### Tier 1 — Auto-fix, open PR
Apply directly and open a PR. Guardrail: ...

### Tier 2 — Diff-for-review
Open PR + request human approval. ...
```

### Substrate business terms

`slot.forbidden.substrate_business_term` fires when the slot body
mentions any string listed in the substrate's `.e2e-ai-kit.json`. The
lint walks up from the linted file looking for that config file;
malformed JSON or missing files silently disable the check.

Example `.e2e-ai-kit.json` (substrate-owned, in the substrate root):

```json
{
  "substrate_business_terms": ["MMR", "MDS", "JMA"]
}
```

If a slot's body mentions `MMR coupon` or `MDS data`, those are
substrate-specific concepts that belong in
`tests/app.context.md § 7 Known quirks`, not in the framework slot.

## Examples

- Good: `../tests/fixtures/slot/good-slot/SKILL.md`
- Bad (missing S3-S9): `../tests/fixtures/slot/bad-slot-missing-section/`
  → `slot.body.section_missing`
- Bad (inline Tier definitions): `.../bad-slot-tier-defined/`
  → `slot.forbidden.tier_classification`
- Bad (business term leak): `.../bad-slot-business-term/`
  → `slot.forbidden.substrate_business_term`

## CLI invocation

```sh
npx e2e-ai-kit lint slot                                       # default: every .claude/skills/<framework>/SKILL.md (skips maintenance/)
npx e2e-ai-kit lint slot .claude/skills/playwright-qor/SKILL.md
```

Exit codes: 0 / 1 / 2 (same convention as `lint case`).

## Related

- [`./case-schema.md`](./case-schema.md)
- [`./app-context-schema.md`](./app-context-schema.md)
- [`../CONTEXT.md` § Framework slot](../CONTEXT.md)
- [`../docs/adr/0001-product-substrate-output.md`](../docs/adr/0001-product-substrate-output.md)
- [`../skills/maintenance/SKILL.md`](../skills/maintenance/SKILL.md) (single authority for Tier classification)
