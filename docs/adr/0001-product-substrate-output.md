# Product / Substrate / Output split, with a multi-framework-pluggable slot

This kit is meant to be reusable across substrates, not bolted to its
first substrate (mcd-website). Without an enforced split, "Product"
content (methodology, contracts, cross-framework skills) drifts into
substrate-specific corners and stops being portable.

**Decision**: we structurally distinguish **Product** (this kit's
components, contracts, cross-framework skills, onboarding flow),
**Substrate** (the host project — mcd-website is the first), and
**Output** (substrate-specific artifacts the kit produces). The
framework slot at `.claude/skills/<framework>/SKILL.md` (in the
substrate) is **B2: multi-framework pluggable** — a contract-bounded
slot whose content is filled per substrate. See
[`../../CONTEXT.md`](../../CONTEXT.md) § Core terms and § Framework slot
for the full taxonomy.

## Considered options

- **B1 — framework-agnostic**: no slot, no framework specifics
  anywhere. Rejected — every substrate would re-discover its framework
  × admin-stack quirks from scratch.
- **B2 — multi-framework pluggable** (chosen): contract-bounded slot,
  substrate fills it.
- **B3 — locked to Playwright + qor**: assume one framework × one
  admin stack forever. Rejected — eliminates portability, contradicts
  the Product's stated purpose.

## Consequences

- Cross-framework Product components (Tier classification,
  sedimentation rules, case schema, app-context schema) have a single
  authoritative location in this repo and are **forbidden** in the
  slot. Drift between the two is treated as a Product bug.
- Substrates fill the slot once during onboarding (Phase 1 of
  [`../ONBOARDING.md`](../ONBOARDING.md)) and accumulate quirks via
  the sedimentation pipeline.
- The first substrate (mcd-website) must clean up two pieces of slot
  drift to honor this decision retroactively: Tier classification was
  duplicated in `playwright-qor` Rule 6 (delete; reference
  `skills/maintenance/SKILL.md` instead); auth strategy in
  `playwright-qor` Rule 4 is substrate-specific (move to mcd-website's
  `tests/app.context.md § 4 Auth strategy`).
- A future substrate's framework slot (e.g. `cypress-rails`) inherits
  the slot contract but is otherwise independent — slot drift between
  substrates is expected and fine.
