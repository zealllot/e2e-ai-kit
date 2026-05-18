# Application Context Document schema

> Status: v0.2 shipped (Slice 3). Enforced by `npx e2e-ai-kit lint
> app-context`.

A substrate's **Application Context Document** lives at a single
canonical path: `tests/app.context.md` (in the substrate, not in this
kit). It is the upstream artifact every Test Case Agent reads to know
what the substrate looks like before producing case files.

The kit enforces frontmatter, required sections, per-section `source:`
markers, and human-verification metadata on `probe+human` sections.

## Frontmatter

| Key | Type | Notes |
|---|---|---|
| `substrate` | string | Identifier for the substrate (e.g. `mcd-website`). Rule: `app_context.frontmatter.substrate_required` |
| `last_full_exploration` | string (YYYY-MM-DD) | Date Exploration Agent last regenerated probe-sourced sections. Rule: `app_context.frontmatter.last_full_exploration_required` |
| `exploration_agent` | string | Agent identifier + model. Rule: `app_context.frontmatter.exploration_agent_required` |

## Required sections

Eleven H2 sections in document order. Each section's heading text may be
prefixed with `## <N>. ` for ordering (the lint strips numeric
prefixes before matching). Each section must declare its
`<!-- source: ... -->` HTML comment as the first non-blank line under
the heading.

| # | Section | source | Required |
|---|---|---|---|
| 1 | Product summary | `human` | yes |
| 2 | Environments | `probe` | yes |
| 3 | User roles + Groups | `probe` | yes |
| 4 | Auth strategy | `probe+human` | yes (with `last_verified_by_human`) |
| 5 | Route map | `probe` | yes |
| 6 | State machines | `human` | yes |
| 7 | Known quirks | `human` | yes |
| 8 | External systems | `human` | yes |
| 9 | Notifications | `human` | no (optional) |
| 10 | Out of scope | `human` | yes |
| 11 | Exploration log | `agent` | yes |

Missing required section → `app_context.body.section_missing` with the
canonical title in the `section` field.

## Per-section source marker

Each section MUST declare an HTML comment of the form:

```html
<!-- source: <type>, last_probed: 2026-05-19, last_curated: 2026-05-19 -->
```

Recognized keys:

- `source` (required) — one of `human`, `probe`, `probe+human`,
  `agent`. Lint rules:
  - missing → `app_context.section.source_marker_missing`
  - unrecognized value → `app_context.section.source_invalid`
  - value disagrees with the schema → `app_context.section.source_mismatch`
- `last_probed` — date the Exploration Agent last refreshed this
  section. Conventional but not enforced in v0.2.
- `last_curated` — date a human last edited this section.
  Conventional but not enforced in v0.2.
- `last_verified_by_human` — required on `source: probe+human`
  sections. Rule: `app_context.section.last_verified_by_human_required`
  if missing.

Multi-line comments are supported; newlines inside the comment are
folded.

## Sedimentation routing reminder

A new substrate-specific quirk discovered by an Agent run goes into
`## 7. Known quirks` (this document), NOT into the framework slot.
The slot enforces this with its own forbidden-content rules — see
[`slot-contract.md`](./slot-contract.md).

## Examples

- Good: `../tests/fixtures/app-context/good-app-context.md`
- Bad (missing section): `bad-app-context-missing-section.md` →
  `app_context.body.section_missing`
- Bad (missing source marker): `bad-app-context-missing-source-marker.md`
  → `app_context.section.source_marker_missing`
- Bad (probe+human without last_verified_by_human):
  `bad-app-context-missing-human-verification.md` →
  `app_context.section.last_verified_by_human_required`

## CLI invocation

```sh
npx e2e-ai-kit lint app-context                          # default: tests/app.context.md
npx e2e-ai-kit lint app-context path/to/app.context.md   # explicit
```

Exit codes: 0 / 1 / 2 (same convention as `lint case`).

## Related

- [`./case-schema.md`](./case-schema.md)
- [`../CONTEXT.md` § Product components (component 6)](../CONTEXT.md)
- [`../docs/WORKFLOW.md`](../docs/WORKFLOW.md)
