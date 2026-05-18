---
feature: api-broken-family
case_type: family
status: approved
generated_by: claude-opus-4-7
generated_at: 2026-05-19
source_docs:
  - models/example/api.go
classification: regular
tier_ceiling: 2
lives_in: tests/specs/example-family.spec.ts
storage_states_required:
  - tests/auth/developer.json
approved_by: zealot@theplant.jp
approved_at: 2026-05-19
reviewer_checked:
  - validators_verified
---

# Family case with a reviewer_checked value from the wrong enum

`validators_verified` is for happy-path cases. family's enum is
family_members_enumerated / shared_assertions_identified /
per_member_specifics_noted.

## Family members

| Resource | JSON |
|---|---|
| A | a.json |
