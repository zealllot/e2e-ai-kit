---
feature: example-publish
case_type: state-machine
status: approved
generated_by: claude-opus-4-7
generated_at: 2026-05-19
source_docs:
  - models/example/publish.go
classification: safety-critical
tier_ceiling: 3
lives_in: tests/specs/safety-critical/example-publish.spec.ts
storage_states_required:
  - tests/auth/developer.json
  - tests/auth/editor.json
approved_by: zealot@theplant.jp
approved_at: 2026-05-19
reviewer_checked:
  - validators_verified
  - state_transitions_verified
  - role_x_state_matrix_verified
---

# Example — Publish state machine

## State machine

Draft → Review → Approved → Published

## Roles & access

Editor can Request Review; Approver can Approve; Publisher can Publish.

## Tests

### TP1: Developer full happy path
