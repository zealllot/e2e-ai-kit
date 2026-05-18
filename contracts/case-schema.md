# Case `.md` schema

> Status: all 5 `case_type` values registered and enforced (v0.2,
> Slices 1-2 shipped). Slices 3 (app-context-lint) and 4
> (skill-slot-lint) live in sibling contract docs.

A **Case** is a markdown file under the substrate's `tests/cases/`
directory. Its frontmatter conforms to this schema; its body
conforms to the per-`case_type` section requirements below.

The full taxonomy lives in [`../CONTEXT.md` § Case (the artifact)](../CONTEXT.md).
This file is the **enforceable** spec — what `npx e2e-ai-kit lint
case` reads.

## Closed `case_type` enum

| Value | Required body sections | Forbidden frontmatter |
|---|---|---|
| `happy-path` | `Required fields`, `Tests` | — |
| `state-machine` | `State machine`, `Roles & access`, `Tests` | — |
| `reference` | `Pattern` | `lives_in`, `storage_states_required` |
| `family` | `Family members` | — |
| `save-flow` | `Form preconditions`, `Save assertion`, `Failure modes` | — |

Any case using a value outside this five-element enum fails lint with
`ruleId: case.frontmatter.case_type_unknown`.

## Frontmatter (always-required keys)

These keys MUST be present and non-empty on every case file, regardless
of `case_type` or `status`. Lint fires
`case.frontmatter.<key>_required` per missing key.

| Key | Type | Notes |
|---|---|---|
| `feature` | string | Unique slug; conventionally matches the file's basename (without `.md`) |
| `case_type` | string | Member of the closed enum above |
| `status` | string | `pending-approval` or `approved` (rule: `case.frontmatter.status_invalid` if anything else) |

## Frontmatter required for runnable case_types

These keys apply to `happy-path`, `state-machine`, `family`, and
`save-flow` (every case_type except `reference`):

| Key | Type | Notes |
|---|---|---|
| `generated_by` | string | Agent + model identifier, e.g. `claude-opus-4-7 (Test Case Agent)` |
| `generated_at` | string (YYYY-MM-DD) | Date the case was produced |
| `source_docs` | array of strings | Files the Test Case Agent read; entries may include `:line` |
| `classification` | string | `regular` or `safety-critical` |
| `tier_ceiling` | integer (1, 2, or 3) | Max auto-fix tier the Maintenance Agent may apply |
| `lives_in` | string | Path to the spec file that implements this case |
| `storage_states_required` | array of strings | storageState file paths the spec uses |

## Frontmatter required for `reference`

Reference cases are documentation, not runnable specs. They require
only the always-required keys plus:

| Key | Type | Notes |
|---|---|---|
| `generated_by` | string | Agent + model identifier |
| `generated_at` | string (YYYY-MM-DD) | — |
| `source_docs` | array of strings | — |

And **forbid**:

| Key | Rule |
|---|---|
| `lives_in` | `case.frontmatter.lives_in_forbidden` |
| `storage_states_required` | `case.frontmatter.storage_states_required_forbidden` |

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

### `reviewer_checked` enum per `case_type`

The reviewer of an approved case must record which boxes they actually
checked. Allowed values are scoped per case_type; using a value from
the wrong enum fires `case.frontmatter.reviewer_checked_invalid_value`.

| case_type | Allowed `reviewer_checked` values |
|---|---|
| `happy-path` | `validators_verified`, `edge_cases_listed`, `permission_scenarios_complete` |
| `state-machine` | the above + `state_transitions_verified`, `role_x_state_matrix_verified` |
| `reference` | `pattern_accurate`, `related_runnable_cases_enumerated` |
| `family` | `family_members_enumerated`, `shared_assertions_identified`, `per_member_specifics_noted` |
| `save-flow` | `form_preconditions_complete`, `save_assertion_specific`, `failure_modes_enumerated` |

A `reviewer_checked: []` empty list when `status: approved` is itself
a violation (`case.frontmatter.reviewer_checked_non_empty`).

## Required body sections per `case_type`

The body must contain these H2 (`##`) headings, in any order:

| case_type | Required H2 sections |
|---|---|
| `happy-path` | `## Required fields`, `## Tests` |
| `state-machine` | `## State machine`, `## Roles & access`, `## Tests` |
| `reference` | `## Pattern` |
| `family` | `## Family members` |
| `save-flow` | `## Form preconditions`, `## Save assertion`, `## Failure modes` |

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

## Examples

| case_type | Good fixture | Bad fixture + ruleId triggered |
|---|---|---|
| `happy-path` | `good-happy-path.md` | `bad-missing-approved-by.md` → `case.frontmatter.approved_by_required` |
| `state-machine` | `good-state-machine.md` | `bad-state-machine-missing-section.md` → `case.body.section_missing` |
| `reference` | `good-reference.md` | `bad-reference-declares-lives-in.md` → `case.frontmatter.lives_in_forbidden` |
| `family` | `good-family.md` | `bad-family-invalid-reviewer-check.md` → `case.frontmatter.reviewer_checked_invalid_value` |
| `save-flow` | `good-save-flow.md` | `bad-save-flow-missing-failure-modes.md` → `case.body.section_missing` |

All fixtures live in `../tests/fixtures/cases/`.

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
