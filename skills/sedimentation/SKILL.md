---
name: sedimentation
description: Use when an Agent run finishes and produced a discoveries.log (or you otherwise learned a new quirk) and you must persist each discovery so it is never re-discovered. Classifies every discovery with "Would this still hold under a different framework?" and proposes a PR to ONE of three destinations (framework slot / app.context.md §7 Known quirks / this repo's CONTEXT.md). Substrate business terms NEVER go in the framework slot.
---

# Sedimentation Agent — route a discovery to its ONE home

This Skill is Workflow C in [`../../docs/WORKFLOW.md`](../../docs/WORKFLOW.md)
and Product component 5 ("Skill-as-sediment convention"). Its job is to
turn things an Agent *learned* into things the next run *knows*, so the
same quirk is never re-discovered. It **proposes** a PR to the correct
target; it never pushes or merges without human review.

## When to use

- A `write-case` / Automation / `maintenance` run finished and emitted a
  `discoveries.log` (or any list of "things I learned this run")
- You are reviewing such a log and need to sediment each entry
- You manually hit a quirk and want to record it so it stops re-surfacing

## When NOT to use

- Writing a test case — that is the `write-case` Skill
- Generating spec code / page objects — that is the Automation Agent
- Classifying a test **failure** (auto-fix vs diff vs bug) — that is the
  `maintenance` Skill (Tier classification). Sedimentation persists
  KNOWLEDGE; it does not fix tests
- A substrate that is not onboarded yet (no `tests/app.context.md`, no
  framework slot) — run `docs/ONBOARDING.md` Phases 0-2 first

## Inputs the Agent needs

Gather these before routing. If any is missing, **stop and ask**.

1. **The discovery** — one sentence per learning. Batch a log into one
   row per discovery; each routes independently
2. **`tests/app.context.md`** of the substrate — to check §7 Known quirks
   for duplicates and to write a business quirk there
3. **The substrate's `.claude/skills/<framework>/SKILL.md`** (and any
   `quirks/<scope>.md`) — to check for duplicates and to write a
   framework quirk there
4. **The substrate's `.e2e-ai-kit.json`** — the `substrate_business_terms`
   list. A discovery mentioning any of these is a business quirk and must
   NOT land in the slot
5. **This repo's `CONTEXT.md`** — destination for cross-substrate
   methodology issues, and dedup target for them

## The classification flow

Run **once per discovery**. The single canonical question:
**"Would this still hold under a different framework?"**

```
For each discovery:
   │
   ▼
Would this still hold under a DIFFERENT framework?
   │
   ├ NO  → it is a framework × admin-stack quirk
   │        → substrate .claude/skills/<framework>/SKILL.md
   │          (or subordinate quirks/<scope>.md)
   │
   └ YES → it holds regardless of framework. Is it…
            │
            ├ a substrate BUSINESS quirk (domain concept, one substrate)
            │     → substrate tests/app.context.md § 7 Known quirks
            │
            └ a cross-substrate METHODOLOGY issue (about the kit itself)
                  → this repo's CONTEXT.md (or Product roadmap)
```

## Routing table (canonical — matches CONTEXT.md "Sedimentation routing")

| Discovery flavour | Auto-PR target (VERBATIM) | Self-check lint |
|---|---|---|
| New framework × admin-stack quirk | substrate's `.claude/skills/<framework>/SKILL.md` (or `quirks/<scope>.md`) | `lint slot` |
| New substrate business quirk | substrate's `tests/app.context.md § 7 Known quirks` | `lint app-context` |
| New cross-substrate methodology issue | this repo's `CONTEXT.md` (or Product roadmap) | none (prose doc) |

## Hard boundaries (these are the teeth)

| Rule | Why | ruleId that catches a violation |
|---|---|---|
| NEVER put a substrate business term/concept in the framework slot | It belongs in app.context.md §7 Known quirks | `slot.forbidden.substrate_business_term` |
| NEVER duplicate Tier 1/2/3 logic into a slot | Tier authority is `skills/maintenance/SKILL.md` alone | `slot.forbidden.tier_classification` |
| A framework quirk must NOT go into app.context.md, and vice versa | The classifier question, not convenience, decides the home | (mis-route caught at review / by lint above) |
| Do NOT sediment the same discovery twice | Dedup against what already lives in the target before opening the PR | — |

The business-term boundary is mechanical: the slot lint walks up to the
substrate's `.e2e-ai-kit.json` and fires
`slot.forbidden.substrate_business_term` for any listed term (e.g.
`MMR`, `MDS`, `JMA`) it finds in the slot body. So a mis-routed domain
concept fails CI rather than silently rotting in the wrong file.

## Self-check (mandatory before opening the PR)

After writing the proposed change into the target file, run the matching
lint and require **exit 0**:

```sh
# routed into a framework slot — catches business-term / Tier leaks
e2e-ai-kit lint slot <slotfile>

# routed into app.context.md — catches schema / §7 issues
e2e-ai-kit lint app-context <file>
```

If lint exits 1 it names the
`ruleId` — fix exactly that and re-run until green. A business term you
wrongly tried to route into the slot surfaces here as
`slot.forbidden.substrate_business_term`: move it to app.context.md §7
Known quirks and re-lint both files.

## SLA & Skill-Rot detection

- **SLA: 2 working days** — the shortest of the three governance SLAs,
  because rediscovery cost is highest: unmerged sediment means the same
  quirk is found again next run and the noise amplifies
- An expired sediment PR is dropped to **draft**
- **Skill-Rot detection** monitors Agent output for "I rediscovered X"
  patterns — a recurring rediscovery means a sediment PR never merged or
  was routed to the wrong home; re-run the classifier on that discovery

## What NOT to do

- Do **not** push or merge — propose a PR to the target and let a human
  review (this is the same rubber-stamp gate the other Skills respect)
- Do **not** route a business term/domain concept into the slot — it
  fails `slot.forbidden.substrate_business_term`; §7 Known quirks is its
  home
- Do **not** copy Tier 1/2/3 definitions into the slot — reference
  `../maintenance/SKILL.md`; duplicating fires
  `slot.forbidden.tier_classification`
- Do **not** dump a framework quirk into app.context.md (or a business
  quirk into the slot) — let the classifier question decide
- Do **not** open a PR you have not seen pass the matching lint
- Do **not** re-sediment something already present in the target

## Example

`discoveries.log` from a `write-case` run on substrate `mcd-website`:

| # | Discovery | "Holds under a different framework?" | Route |
|---|---|---|---|
| 1 | The qor admin save button only enables after the file-upload XHR returns 200 | No — Playwright × qor admin-stack timing | `.claude/skills/playwright-qor/SKILL.md` (or `quirks/save-flow.md`) |
| 2 | An `MMR` coupon may not be issued once its parent `MDS` batch is closed | Yes, and it is a domain rule (one substrate) | `tests/app.context.md § 7 Known quirks` |
| 3 | Save-flow cases should always assert post-redirect state, not just the toast | Yes, and it is a kit methodology lesson | this repo's `CONTEXT.md` |

Routing #2 into the slot would fire
`slot.forbidden.substrate_business_term` on `MMR`/`MDS` — proof the
boundary is mechanical, not just a guideline. After writing #1 into the
slot, `lint slot` must exit 0; after writing #2 into app.context.md,
`lint app-context` must exit 0.

## Related

- [`../../docs/WORKFLOW.md`](../../docs/WORKFLOW.md) — Workflow C, the 3-way auto-PR routing + 2-day SLA + Skill-Rot detection
- [`../../CONTEXT.md`](../../CONTEXT.md) — "Sedimentation routing" table and the classifier rule (methodology destination)
- [`../../contracts/slot-contract.md`](../../contracts/slot-contract.md) — `slot.forbidden.substrate_business_term` + `slot.forbidden.tier_classification`
- [`../../contracts/app-context-schema.md`](../../contracts/app-context-schema.md) — §7 Known quirks is where substrate business quirks go
- [`../maintenance/SKILL.md`](../maintenance/SKILL.md) — sole authority for Tier 1/2/3; never duplicate it into a slot
