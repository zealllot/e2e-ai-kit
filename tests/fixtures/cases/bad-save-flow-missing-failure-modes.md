---
feature: example-save-broken
case_type: save-flow
status: approved
generated_by: claude-opus-4-7
generated_at: 2026-05-19
source_docs:
  - models/example/save_handler.go
classification: regular
tier_ceiling: 2
lives_in: tests/specs/example-save-broken.spec.ts
storage_states_required:
  - tests/auth/developer.json
approved_by: zealot@theplant.jp
approved_at: 2026-05-19
reviewer_checked:
  - form_preconditions_complete
---

# Save-flow case missing ## Failure modes section

## Form preconditions

Image upload completes.

## Save assertion

POST succeeds.
