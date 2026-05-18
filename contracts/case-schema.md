# Case `.md` schema

> Status: `happy-path` complete (v0.2). Other 4 `case_type` values
> registered in the closed enum but not yet specified — Slice 2
> (kit issue #3) fills them in.

A **Case** is a markdown file under the substrate's `tests/cases/`
directory. Its frontmatter conforms to this schema; its body
conforms to the per-`case_type` section requirements below.

The full taxonomy lives in [`../CONTEXT.md` § Case (the artifact)](../CONTEXT.md).
This file is the **enforceable** spec — what `npx e2e-ai-kit lint
case` reads.

## Closed `case_type` enum

| Value | Status | Spec |
|---|---|---|
| `happy-path` | **available** | this file (below) |
| `state-machine` | reserved | Slice 2 |
| `reference` | reserved | Slice 2 |
| `family` | reserved | Slice 2 |
| `save-flow` | reserved | Slice 2 |

Any case using a value outside this five-element enum fails lint with
`ruleId: case.frontmatter.case_type_unknown`. Any case using a
reserved value fails with
`ruleId: case.frontmatter.case_type_not_yet_registered`.

## Frontmatter (always-required keys)

These keys MUST be present and non-empty on every case file, regardless
of `case_type` or `status`. Lint fires
`case.frontmatter.<key>_required` per missing key.

| Key | Type | Notes |
|---|---|---|
| `feature` | string | Unique slug; conventionally matches the file's basename (without `.md`) |
| `case_type` | string | Member of the closed enum above |
| `status` | string | `pending-approval` or `approved` (rule: `case.frontmatter.status_invalid` if anything else) |

## Frontmatter required for `happy-path`

In addition to the always-required keys, `happy-path` requires:

| Key | Type | Notes |
|---|---|---|
| `generated_by` | string | Agent + model identifier, e.g. `claude-opus-4-7 (Test Case Agent)` |
| `generated_at` | string (YYYY-MM-DD) | Date the case was produced |
| `source_docs` | array of strings | Files the Test Case Agent read; entries may include `:line` |
| `classification` | string | `regular` or `safety-critical` |
| `tier_ceiling` | integer (1, 2, or 3) | Max auto-fix tier the Maintenance Agent may apply |
| `lives_in` | string | Path to the spec file that implements this case |
| `storage_states_required` | array of strings | storageState file paths the spec uses |

## Frontmatter required when `status: approved`

Recording an approval is the rubber-stamp risk mitigation (Q4-2 in
`../CONTEXT.md` § Risk management). Lint enforces:

| Key | Type | Notes |
|---|---|---|
| `approved_by` | string | Reviewer's identifier (email, GitHub handle); rule: `case.frontmatter.approved_by_required` |
| `approved_at` | string (YYYY-MM-DD) | rule: `case.frontmatter.approved_at_required` |
| `reviewer_checked` | array of strings | Non-empty; rule: `case.frontmatter.reviewer_checked_non_empty`. Each element must be in the case_type's `reviewerCheckedEnum`; rule: `case.frontmatter.reviewer_checked_invalid_value` |

Optional companion key:

| Key | Type | Notes |
|---|---|---|
| `approval_caveat` | string | Free-text record of any review shortcut (e.g. `fast-mode-skip`). Optional but encouraged when the reviewer did not cover the full checklist |

### `reviewer_checked` enum for `happy-path`

The reviewer of an approved `happy-path` case must record which
boxes they actually checked, drawn from this closed list:

- `validators_verified`
- `edge_cases_listed`
- `permission_scenarios_complete`

A `reviewer_checked: []` empty list when `status: approved` is itself
a violation (`case.frontmatter.reviewer_checked_non_empty`).

## Required body sections for `happy-path`

The body must contain these H2 (`##`) headings, in any order:

- `## Required fields`
- `## Tests`

Missing sections produce `ruleId: case.body.section_missing` with
the section name in the `section` field.

The body MAY contain additional sections beyond these (the lint does
not currently restrict extras).

## Optional frontmatter (not enforced)

The kit recognizes but does not currently enforce these keys; they're
common conventions on mcd-website's cases:

- `admin_routes`: array of admin URL paths the spec exercises
- `public_urls`: array of public URLs the spec verifies (api-json
  cases)
- `related_cases`: array of references to peer case files

## Full example (lints clean)

See `../tests/fixtures/cases/good-happy-path.md`.

## Negative example (lints with one violation)

See `../tests/fixtures/cases/bad-missing-approved-by.md` — produces
`case.frontmatter.approved_by_required`.

## CLI invocation

```sh
npx e2e-ai-kit lint case                                # default glob: tests/cases/*.md
npx e2e-ai-kit lint case tests/cases/my-feature.md     # single file
npx e2e-ai-kit lint case tests/cases/*.md              # explicit glob (shell-expanded)
```

Exit codes:
- 0 — all files passed
- 1 — at least one file failed
- 2 — usage / argument error

When `GITHUB_ACTIONS=true` is set, output uses GitHub Actions
annotation format (`::error file=...,line=...::message`).

## Related

- [`../CONTEXT.md` § Case (the artifact)](../CONTEXT.md)
- [`../CONTEXT.md` § Risk management commitment](../CONTEXT.md) (Q4-2 rubber-stamp mitigation)
- [`../docs/WORKFLOW.md`](../docs/WORKFLOW.md) (4-Agent pipeline, where case lint sits)
- `../tests/fixtures/cases/` — example fixtures (good + bad)
