---
feature: api-json-publish-foundation
case_type: reference
status: approved
generated_by: claude-opus-4-7
generated_at: 2026-05-19
source_docs:
  - docs/processes/json-files-catalog.md
approved_by: zealot@theplant.jp
approved_at: 2026-05-19
reviewer_checked:
  - pattern_accurate
  - related_runnable_cases_enumerated
---

# API JSON publish foundation

This case is a reference / shared pattern, not itself runnable. It
explains the architecture every per-resource api-json case builds on.

## Pattern

The qor "Publish" action does NOT write the public JSON directly. The
mcd-daemon process polls every 60s and writes JSON to S3 when a
resource's `DataLastUpdatedAt` advances.

## Related runnable cases

- api-banner-json (family)
- api-coupons-json (family)
