---
feature: example-broken
case_type: happy-path
status: approved
generated_by: claude-opus-4-7
generated_at: 2026-05-19
source_docs:
  - models/example/validators.go
admin_routes:
  - /admin/example
classification: regular
tier_ceiling: 2
lives_in: tests/specs/example-broken.spec.ts
storage_states_required:
  - tests/auth/developer.json
approved_at: 2026-05-19
reviewer_checked:
  - validators_verified
---

# Broken Example

## Required fields

| Field | Source | Notes |
|---|---|---|
| Title | shared | required |

## Tests

### HP: dummy
