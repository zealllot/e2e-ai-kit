# Case `.md` schema

> **Status: stub.** The design intent is captured in
> [`../CONTEXT.md`](../CONTEXT.md) § Case (the artifact) and § Risk
> management commitment (rubber-stamp mitigation). This file will hold
> the full YAML frontmatter spec + body-section spec + per-`case_type`
> `reviewer_checked` enums. Until then, see CONTEXT.md and the working
> case files in the first substrate (`mcd-website/tests/cases/*.md`)
> for examples.

## What this file will contain (TODO)

- Full YAML frontmatter spec
  - Always-required fields: `feature`, `case_type`, `status`,
    `generated_by`, `generated_at`, `source_docs`
  - Required when `status: approved`: `approved_by`, `approved_at`,
    `reviewer_checked: [...]`, optional `approval_caveat`
  - Required when `case_type != reference`: `classification`,
    `tier_ceiling`, `lives_in`, `storage_states_required`
  - Per-`case_type` optional/required fields (e.g. `state_machine`
    block for `state-machine` cases)
- Required body sections per `case_type`
- `reviewer_checked` enum values per `case_type`
- Example case files (one per `case_type`)
- `case-lint` invariants (the lint CLI will enforce this spec)

## Related Product components

- Product component 2 — Case-as-`.md`
- Risk mitigation — Rubber-stamp case approval
  ([`../CONTEXT.md`](../CONTEXT.md) § Risk management commitment)
- Governance — Case approval SLA (5 working days, fast-mode override)
  ([`../CONTEXT.md`](../CONTEXT.md) § Governance)
