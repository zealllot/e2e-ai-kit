---
feature: example-save
case_type: save-flow
status: approved
generated_by: claude-opus-4-7
generated_at: 2026-05-19
source_docs:
  - models/example/save_handler.go
classification: regular
tier_ceiling: 2
lives_in: tests/specs/example-save.spec.ts
storage_states_required:
  - tests/auth/developer.json
approved_by: zealot@theplant.jp
approved_at: 2026-05-19
reviewer_checked:
  - form_preconditions_complete
  - save_assertion_specific
  - failure_modes_enumerated
---

# Example — Save flow

## Form preconditions

- Image upload completes (qor MediaBox bypass)
- Dependent field "Catalog" exists

## Save assertion

After submit, expect URL `/admin/example/<id>` and Title visible on detail page.

## Failure modes

- Image missing → "Image is required"
- Catalog empty → "Catalog cannot be blank"
