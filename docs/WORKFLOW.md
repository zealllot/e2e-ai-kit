# How e2e-ai-kit works in practice

This is the day-to-day operating model: what gets triggered when, who
reviews what, and where each artifact lives. For the *why*, see
[`../CONTEXT.md`](../CONTEXT.md). For the *intent*, see
[`../PURPOSE.md`](../PURPOSE.md). For *taking the kit to a new
project*, see [`./ONBOARDING.md`](./ONBOARDING.md).

> **Repository convention**: this doc is written from the Product's
> point of view. Substrate-specific examples reference mcd-website as
> substrate #1. A second substrate would substitute its own paths
> wherever you see `mcd-website/...`.

## Two repos, two roles

```
e2e-ai-kit (Product)               mcd-website (Substrate #1)
─────────────────────              ──────────────────────────
CONTEXT.md (glossary)              CLAUDE.md (substrate business notes)
PURPOSE.md (status board)          tests/PURPOSE.md (how this substrate uses the kit)
docs/ONBOARDING.md (5-stage)       tests/app.context.md (application map content)
docs/adr/ (design decisions)       tests/cases/*.md (this substrate's cases)
contracts/ (the 3 contracts)       tests/specs/ (spec output)
skills/maintenance/SKILL.md        tests/permissions/matrix.ts (SoT content)
scripts/ (lint CLIs)               .claude/skills/playwright-qor/ (slot content)
templates/ (scaffolding)           .claude/skills/maintenance/ (vendored from kit)
```

**One-line classifier**: **"Does this still hold under a different
substrate?"** Yes → it belongs in e2e-ai-kit. No → it belongs in the
substrate.

## The four workflows

### A. Writing a new feature test (most common)

```
"Write a test for X"
   ↓
Test Case Agent
   ├ reads contracts/case-schema.md (this repo)
   ├ reads tests/app.context.md (substrate)
   ├ reads source files identified in app.context.md
   └ writes tests/cases/<feature>.md, status: pending-approval
   ↓
Human review                                  ← SLA 5 working days
   ├ fills reviewer_checked: [validators_verified, edge_cases_listed, ...]
   ├ fills approved_by / approved_at
   ├ urgent? use approval_caveat: fast-mode-skip (recorded on the record)
   └ stale after 5d → Test Case Agent regenerates
   ↓
case-lint must pass in CI
   ↓
Automation Agent
   ├ reads approved case
   ├ reads skills/maintenance/SKILL.md (Tier boundary)
   ├ reads substrate's framework slot (.claude/skills/<framework>/)
   └ writes spec + page object
   ↓
spec passes → PR → merge
```

### B. A test fails in PR CI (reactive)

```
PR CI fail
   ↓
Maintenance Agent fires automatically
(not scheduled, not manual-only — cost discipline)
   ↓
Classify per skills/maintenance/SKILL.md decision tree
   ├ Tier 3 — safety-critical/ path, @safety-critical header, business
   │          invariants, regression vs main 24h ago
   │     → do not modify spec; open a bug ticket
   │
   ├ Tier 2 — changes expect() values, new waitFor gates, route changes,
   │          Page Object signature changes, new fixtures/storageState
   │     → open a draft PR + request review
   │     → SLA 3 working days; expired PR auto-closes;
   │       same failure not re-proposed by Agent for 1 week
   │
   └ Tier 1 — selector drift, waitForTimeout → expect(), CSS → getByRole,
              copy update with a matching commit in the same PR
         → open PR; CI green = auto-merge eligible
```

**Hard rules**: tier classification is **monotonic** (T1 → T2 → T3
only; downgrades fail CI). Safety-critical entries and `@safety-critical`
header changes go through CODEOWNERS.

### C. An Agent discovers something new (sedimentation)

```
Agent run completes → produces discoveries.log
   ↓
Pipeline classifier: "Would this still hold under a different framework?"
   ↓
   ├ No (framework × admin-stack quirk)
   │     → auto-PR to substrate's .claude/skills/<framework>/SKILL.md
   │
   ├ Yes, but substrate-specific (business quirk)
   │     → auto-PR to substrate's tests/app.context.md § Known quirks
   │
   └ Yes, cross-substrate (methodology issue)
         → auto-PR to e2e-ai-kit/CONTEXT.md
   ↓
SLA 2 working days
(shortest of the three SLAs, because rediscovery cost is highest:
 unmerged sediment = same quirk found again next run = noise amplifies)
   ↓
Expired → PR → draft; Skill-Rot detection monitors Agent output for
"I rediscovered X" patterns
```

### D. Onboarding a second substrate (per `docs/ONBOARDING.md`)

Five gated phases, total budget ≤ 1 week:

```
Phase 0  Substrate eligibility (GO / NO-GO)               5 min
Phase 1  Fill the framework slot (S1-S9)                  half day
Phase 2  Fill app.context.md (10 sections, source markers) 1-2 days
Phase 3  Write the first case (smallest non-critical HP)  half day
Phase 4  Run the first spec — MUST PASS                   half day
Phase 5  Write back to Product (ongoing)
```

Each phase gates on a lint pass. **The instant Phase 4 turns green on
a second substrate, Portability moves from `hypothesis` to `finding`
in [`../PURPOSE.md`](../PURPOSE.md).**

## Current state vs target state

| Concern | Current (substrate #1) | Target (after kit v1.0) |
|---|---|---|
| 4-Agent pipeline | informal, lives in operator's head + skill docs | same, plus governance SLAs enforced |
| Tier classification | functional | sole authority in `skills/maintenance/SKILL.md`; slot duplication removed |
| Case `.md` | ~13 cases, schema half-emergent | strict schema; closed `case_type` enum; mandatory `reviewer_checked` |
| Application Context Document | 475 lines, no schema | 11 required sections + per-section `source:` markers + probe split |
| Framework slot | `playwright-qor` mixes Playwright generic + qor + mcd-website | covers only S1-S9; cross-framework and substrate content forbidden |
| Sedimentation | "remember to update the skill" | auto-PR pipeline with 3-way routing |
| Lint gates | 1 (matrix-sync drift) | 4 (case-lint, app-context-lint, skill-slot-lint, matrix-sync), all CI-required |
| Risk management | 5 named risks, no mitigations | 5 {risk, mitigation, detection} triples |
| Governance | none | 3 gates with SLAs + Maintenance Agent trigger model + CODEOWNERS |
| Second substrate | does not exist | onboarding doc ready; B2 unverified until then |

> **Update (kit v0.2):** several v1.0 targets above have since shipped on
> the **Product** side — the 4-stage pipeline + sedimentation are now
> invokable skills (`exploration` / `write-case` / `automation` /
> `maintenance` / `sedimentation`), three of the four lint gates ship
> (`e2e-ai-kit lint case|app-context|slot`; matrix-sync stays
> substrate-side), and `install.sh` distributes them. Still open:
> CI-required enforcement and a second substrate.

## Your day-to-day responsibilities

In order of frequency (highest first):

1. **Approve cases** (5-day SLA) — typically 1-3 times per week
2. **Approve T2 diff PRs** (3-day SLA) — whenever Maintenance Agent
   classifies a CI failure as Tier 2
3. **Approve sediment PRs** (2-day SLA) — whenever an Agent learns
   something new
4. **Run a full 5-phase onboarding** — when a second substrate appears

## What you should NOT do

- Don't hand-edit generated `.md` files (e.g. on mcd-website:
  `READ.md`, `WRITE.md`, `MENU.md`) — edit the source-of-truth
  (`matrix.ts` or its substrate equivalent) instead
- Don't move a spec out of `safety-critical/` to dodge Tier 3 — it
  goes through CODEOWNERS for a reason
- Don't add `@safety-critical` to a spec just to *grant* it that
  status without review — CODEOWNERS catches this too
- Don't `skip()` a test with reason `"backend unavailable"` — that's
  `environment-broken`, which is a **fail**, not a skip. Use
  `precondition-not-met` only for genuine business preconditions
- Don't add a new `case_type` to the closed enum without a PR that
  updates [`../CONTEXT.md`](../CONTEXT.md), the case lint, and the
  reviewer playbook, and notifies anyone with an in-flight case

## Trigger cheat-sheet

| You want to … | This triggers … |
|---|---|
| Add a feature test | Workflow A (Phase 3-4 of normal flow) |
| Diagnose a CI failure | Workflow B (Maintenance Agent classifies) |
| Bring the kit to a new project | Workflow D (5-phase onboarding) |
| Capture a quirk the Agent just learned | Workflow C (auto-PR routed by classifier) |
| Update what the kit considers Product vs Substrate | PR to `CONTEXT.md` + likely an ADR |
| Add a new `case_type` | PR to `CONTEXT.md` + case lint + reviewer playbook |
| Change a Tier rule | PR to `skills/maintenance/SKILL.md` (single authority) |

## See also

- [`../CONTEXT.md`](../CONTEXT.md) — glossary, six Product components, three contracts, risk triples, governance details
- [`../PURPOSE.md`](../PURPOSE.md) — manifesto + status of the six load-bearing hypotheses
- [`./ONBOARDING.md`](./ONBOARDING.md) — 5-stage MVP onboarding
- [`./adr/0001-product-substrate-output.md`](./adr/0001-product-substrate-output.md) — the Product / Substrate / Output split
- [`./adr/0002-extract-to-separate-repo.md`](./adr/0002-extract-to-separate-repo.md) — why this kit lives in its own repo
