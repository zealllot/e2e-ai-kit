---
name: write-case
description: Use when asked to write a test for a substrate feature, or to add/update a case after a requirement change. Produces a `tests/cases/<feature>.md` at status pending-approval, conforming to contracts/case-schema.md — never writes spec code (that is the Automation Agent) and never self-approves (that is the human gate).
---

# Test Case Agent — write a case `.md`

This Skill is stage 2 of the 4-Agent pipeline
(Exploration → **Test Case** → Automation → Maintenance). It turns a
feature request into a reviewable **intent** document — not runnable
code. The Automation Agent consumes the *approved* case later and
writes the spec; a human approves in between.

## When to use

- "Write a test for `<feature>`" on an onboarded substrate
- A requirement changed and a case must be added or updated to match
- Splitting one sprawling feature into multiple cases

## When NOT to use

- Writing or fixing the Playwright **spec code / page objects** — that
  is the Automation Agent, not this Skill
- A spec is **failing** and you must decide auto-fix vs bug — use the
  `maintenance` Skill (Tier classification)
- The substrate has not been onboarded yet (no `tests/app.context.md`,
  no framework slot) — run `docs/ONBOARDING.md` Phases 0-2 first

## Inputs the Agent needs

Gather these before writing. If any is missing, **stop and ask** —
do not invent field lists, validators, or routes.

1. **The feature** — what flow is under test, in one sentence
2. **`tests/app.context.md`** — the substrate map (routes, permission
   model, state machines, known quirks). The case must not contradict it
3. **The relevant source files** — validators, models, routes that
   define the real required fields and error messages. Every claim in
   the case body traces to one of these, recorded in `source_docs` with
   `:line` where possible
4. **For a requirement-change update**: the existing case file + what
   changed, so the diff is minimal and `source_docs` stays accurate

## The flow

```
1. Pick case_type from the closed enum (see table below)
2. Identify the real required fields / states / failure modes
   FROM SOURCE — never guess. Record each source in source_docs:line
3. Write tests/cases/<feature>.md:
     - frontmatter per the case_type's required keys
     - status: pending-approval   (NEVER approved — that is the human)
     - body: the H2 sections this case_type requires
4. Self-verify: e2e-ai-kit lint case tests/cases/<feature>.md
     must exit 0. Fix any ruleId it reports, re-run until green
5. Hand off: tell the human it is pending-approval and what to review
```

## Pick the `case_type` (closed enum)

| Choose | When the feature is… | Required body H2 sections |
|---|---|---|
| `happy-path` | one feature, one happy path + edge cases | `## Required fields`, `## Tests` |
| `state-machine` | a status/lifecycle with role-gated transitions | `## State machine`, `## Roles & access`, `## Tests` |
| `save-flow` | a create/update form where the **save** is the point | `## Form preconditions`, `## Save assertion`, `## Failure modes` |
| `family` | several near-identical variants sharing assertions | `## Family members` |
| `reference` | documentation of a reusable pattern, **not runnable** | `## Pattern` |

A value outside this five-element enum fails lint with
`case.frontmatter.case_type_unknown`.

## Frontmatter rules

**Always required** (any type, any status) — non-empty:
`feature`, `case_type`, `status`.

- `feature` — slug, conventionally the filename without `.md`
- `status` — write **`pending-approval`**. Anything but
  `pending-approval`/`approved` fires `case.frontmatter.status_invalid`

**Runnable types** (`happy-path`, `state-machine`, `family`,
`save-flow`) additionally require:

| Key | What to write |
|---|---|
| `generated_by` | `claude-<model> (Test Case Agent)` |
| `generated_at` | today, `YYYY-MM-DD` |
| `source_docs` | array of files you read; use `path:line` |
| `classification` | `safety-critical` if the feature touches rbac / permission / billing / invoice / ledger / payment / refund / state-transition; else `regular` |
| `tier_ceiling` | max auto-fix tier Maintenance may apply: `1` cosmetic-only, `2` typical, `3` only when justified. Safety-critical features take a **low** ceiling |
| `lives_in` | intended spec path, e.g. `tests/specs/<feature>.spec.ts` (the file need not exist yet — this is the promise the Automation Agent fulfils) |
| `storage_states_required` | array of `tests/auth/*.json` the spec will need (which roles must be logged in) |

**`reference` type** requires only `generated_by`, `generated_at`,
`source_docs`, and **forbids** `lives_in`
(`case.frontmatter.lives_in_forbidden`) and `storage_states_required`
(`..._forbidden`) — it is docs, not a runnable spec.

**NEVER write these** — they belong to the human approval gate, and the
lint only demands them once `status: approved`:
`approved_by`, `approved_at`, `reviewer_checked`. Leaving the case at
`pending-approval` without them is correct and passes lint.

## Body — write the intent, traceably

- Every required field, error string, and state transition must come
  from a real source file, not memory. If you can't cite it, you don't
  know it — go read it or ask
- Name tests with stable IDs (`HP:`, `EC1:`, …) and a `test.step()`-style
  narrative so a non-author can grasp intent in <30s
- The body MAY contain extra sections beyond the required ones; lint
  does not restrict extras

## Self-check (mandatory before hand-off)

```sh
e2e-ai-kit lint case tests/cases/<feature>.md   # must exit 0
```

If it exits 1, the output names the `ruleId` and the missing key /
section — fix exactly that and re-run. Do not hand a case to the human
that you have not seen pass lint.

## What NOT to do

- Do **not** set `status: approved` or fill `approved_by` /
  `approved_at` / `reviewer_checked` — that is the reviewer's job and
  forging it defeats the rubber-stamp mitigation (Q4-2)
- Do **not** write spec code or page objects — stop at the `.md`
- Do **not** invent required fields or error messages — trace every one
  to a `source_docs` entry
- Do **not** copy field lists from another substrate or from
  `app.context.md` examples — read this substrate's source
- Do **not** add a `case_type` outside the five-element enum without a
  PR that updates `CONTEXT.md`, the case lint, and the reviewer playbook

## Example (happy-path, pending-approval)

```markdown
---
feature: coupon-create
case_type: happy-path
status: pending-approval
generated_by: claude-opus-4-8 (Test Case Agent)
generated_at: 2026-06-09
source_docs:
  - models/coupon/validators.go:48
  - config/routes.rb:212
classification: regular
tier_ceiling: 2
lives_in: tests/specs/coupon-create.spec.ts
storage_states_required:
  - tests/auth/developer.json
---

# Coupon — Create

## Required fields

| Field | Source | Notes |
|---|---|---|
| Code | validators.go:48 | required, unique, ≤ 32 chars |
| Discount | validators.go:55 | required, > 0 |

## Tests

### HP: Happy Path — creates a Draft coupon
1. Open `/admin/coupon/new`
2. Fill Code + Discount
3. Submit. Expect redirect to detail with Code visible.

### EC1: empty Code
- Fill Discount, skip Code
- Expect: `Code cannot be blank`
```

## Related

- [`../../contracts/case-schema.md`](../../contracts/case-schema.md) — the enforceable schema this Skill targets
- [`../maintenance/SKILL.md`](../maintenance/SKILL.md) — stage 4; defines the Tier ceiling `tier_ceiling` caps
- [`../../docs/WORKFLOW.md`](../../docs/WORKFLOW.md) — Workflow A, where this Skill sits
- `../../tests/fixtures/cases/` — good + bad case examples
