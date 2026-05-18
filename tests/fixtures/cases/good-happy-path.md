---
feature: example-create
case_type: happy-path
status: approved
generated_by: claude-opus-4-7
generated_at: 2026-05-19
source_docs:
  - models/example/validators.go:120
admin_routes:
  - /admin/example
  - /admin/example/new
classification: regular
tier_ceiling: 2
lives_in: tests/specs/example-create.spec.ts
storage_states_required:
  - tests/auth/developer.json
approved_by: zealot@theplant.jp
approved_at: 2026-05-19
reviewer_checked:
  - validators_verified
  - edge_cases_listed
  - permission_scenarios_complete
---

# Example — Create

## Required fields

| Field | Source | Notes |
|---|---|---|
| Title | shared validator | required, ≤ 100 chars |
| ImageBox | upstream validator | required |

## Tests

### HP: Happy Path — creates a Draft Example

1. Open `/admin/example/new`
2. Fill Title + ImageBox
3. Submit. Expect redirect to detail page with saved Title visible.

### EC1: empty Title

- Fill ImageBox but skip Title
- Expect: `Title cannot be blank`
