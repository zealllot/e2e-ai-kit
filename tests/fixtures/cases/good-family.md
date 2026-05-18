---
feature: api-banner-json
case_type: family
status: approved
generated_by: claude-opus-4-7
generated_at: 2026-05-19
source_docs:
  - models/coupon_banner/api.go
classification: regular
tier_ceiling: 2
lives_in: tests/specs/api-json/banner-json.spec.ts
storage_states_required:
  - tests/auth/developer.json
approved_by: zealot@theplant.jp
approved_at: 2026-05-19
reviewer_checked:
  - family_members_enumerated
  - shared_assertions_identified
  - per_member_specifics_noted
---

# Banners & ads — public JSON loop

## Family members

| # | Admin resource | JSON file | Daypart-keyed? |
|---|---|---|---|
| 1 | Coupon Banners | coupon_banners.json | yes |
| 2 | App Menu Banners | generic_menu_banners.json | no |

## Shared assertion

Every member's JSON has version, update_date, and a container key.
