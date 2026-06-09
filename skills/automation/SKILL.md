---
name: automation
description: Use when an APPROVED case `.md` (status: approved) exists and its Playwright spec must be generated or regenerated. Turns the case's intent into runnable spec + page-object code, iterating to green; follows the substrate's framework slot (S1-S9) for HOW. Consumes only approved cases, writes code never the case, and never embeds Tier 1/2/3 logic.
---

# Automation Agent — case intent → runnable spec code

This Skill is stage 3 of the 4-Agent pipeline
(Exploration → Test Case → **Automation** → Maintenance). It reads an
*approved* case and writes the **spec code + page object(s)** that
implement its intent, iterating until the spec runs green. It writes
**code, not the case** — and never re-derives Tier logic.

## When to use

- An approved case (`status: approved`) exists and its spec at
  `lives_in` must be generated
- A requirement change produced a newly-approved or updated case whose
  spec must be (re)generated

## When NOT to use

- The case is still `pending-approval`, or has gone **stale** past the
  5-day review SLA (`docs/WORKFLOW.md` Workflow A) — **refuse**; route
  back to `write-case` / the human. Do not write code from it
- A previously-**green** spec is now FAILING — that is the
  `maintenance` Skill (Tier classification), not this one
- Writing or editing the case `.md` itself — that is `write-case`

## Inputs the Agent needs (stop-and-ask if missing)

Gather these before writing a line of code. If any is missing,
**stop and ask** — do not invent selectors, routes, or auth states.

1. **The approved case file** — `status: approved`, passing
   `e2e-ai-kit lint case <file>`. Read `lives_in`,
   `storage_states_required`, `classification`, `tier_ceiling`
2. **The framework slot** — `.claude/skills/<framework>/SKILL.md` in
   the substrate; supplies HOW (S1-S9). Do not guess framework idioms
3. **The auth states** — every `tests/auth/*.json` listed in
   `storage_states_required` must exist (which roles are logged in)
4. **A runnable local target** — the substrate app reachable locally so
   the spec can iterate to green (`npx playwright test`)

## The flow

```
1. GATE on the case:
     - e2e-ai-kit lint case <file>   must exit 0
     - status: approved                  (else REFUSE → write-case/human)
     - not stale past the 5-day SLA      (else REFUSE → write-case)
2. Read the framework slot S1-S9. The code obeys it, not your habits.
3. Decide the spec path:
     - classification: safety-critical → tests/specs/safety-critical/
       (this is what Maintenance's Tier-3 detection keys on)
     - else → the case's `lives_in` verbatim
4. Write the page object(s) per S5; the spec per S6 naming.
     - Use storage_states_required for auth (S7 isolation)
     - Selectors per S1, waits per S2, forms per S3, actions per S4
     - Avoid every S8 anti-pattern; apply S9 cost discipline
5. Record tier_ceiling faithfully (a comment); do NOT act on it and do
   NOT embed Tier 1/2/3 logic — that authority is maintenance/SKILL.md
6. Iterate to green: npx playwright test <spec>   (budget below)
7. Hand off the green spec; note any discovery for sedimentation (C)
```

## What comes from where

| Concern | Authority | Never source it from |
|---|---|---|
| Selectors, waits, forms, actions (S1-S4) | framework slot | your defaults |
| Page Object layout, test naming (S5, S6) | framework slot | the case body |
| Parallelism, storageState isolation (S7) | framework slot + `storage_states_required` | guessing |
| What to assert (fields, errors, transitions) | the case body | the slot |
| Spec path + auth roles | case `lives_in` / `storage_states_required` | invention |
| Tier 1/2/3 classification | `../maintenance/SKILL.md` | the slot, your code |

## Refuse-or-proceed table

| Case state | Action |
|---|---|
| `status: approved`, lint exit 0, fresh | Proceed — generate the spec |
| `status: pending-approval` | REFUSE → human approval gate / `write-case` |
| Approved but stale > 5-day SLA | REFUSE → `write-case` regenerates |
| Lint exits 1 (any ruleId) | REFUSE → `write-case` fixes the case first |
| `case_type: reference` (no `lives_in`) | Not runnable — nothing to generate |

## Spec-path rule (Tier-3 hook)

- `classification: safety-critical` → spec lives under
  `tests/specs/safety-critical/<feature>.spec.ts`. The Maintenance
  Agent's Tier-3 detection keys on this path — placing it elsewhere
  silently downgrades safety enforcement. Do not move it to dodge Tier 3
- otherwise → the case's `lives_in` path, verbatim
- `tier_ceiling` is a downstream cap the Maintenance Agent honors;
  Automation only **records** it (a header comment) — it does not branch
  on it

## Self-check (mandatory before hand-off)

```sh
e2e-ai-kit lint case <case-file>     # exit 0 AND status: approved — before any code
npx playwright test <spec>               # must run green
```

- The three lints (`case`, `slot`, `app-context`) do **not** lint spec
  code. The gate on the code is: **the spec runs green AND obeys the
  slot's S1-S9 + anti-patterns**, reviewed against the case intent
- **Iteration budget: 3 attempts** to reach green (consistent with
  maintenance's discipline). If still red after 3, stop and ask the
  human — the case intent or the slot may be wrong, not the code
- Re-read the case body before claiming done: a green spec that no
  longer tests the case's intent is a failure

## What NOT to do

- Do **not** consume a case that is not `status: approved`, or one gone
  stale — refuse and route back
- Do **not** write or edit the case `.md` — that is `write-case`
- Do **not** embed Tier 1/2/3 definitions in code or in the slot —
  reference `../maintenance/SKILL.md` (single authority)
- Do **not** move a safety-critical spec out of
  `tests/specs/safety-critical/` to dodge Tier 3
- Do **not** invent selectors, routes, or auth states — trace them to
  the slot, the case, and `storage_states_required`
- Do **not** violate slot S8 anti-patterns or S9 cost discipline to
  make a test pass faster
- Do **not** "make it green" by shortening an assertion away from the
  case intent

## Example (consume the approved happy-path, write the spec)

Given `tests/cases/example-create.md` (`status: approved`,
`classification: regular`, `tier_ceiling: 2`,
`lives_in: tests/specs/example-create.spec.ts`,
`storage_states_required: [tests/auth/developer.json]`) and the
framework slot at `.claude/skills/example-framework-example-admin/`:

1. Gate: `e2e-ai-kit lint case tests/cases/example-create.md` → exit
   0; `status: approved`; fresh. Proceed.
2. Slot S5 → `tests/pages/<resource>.page.ts`, one class per resource.
   Write `tests/pages/example.page.ts`.
3. `classification: regular` → spec path is the `lives_in` value:
   `tests/specs/example-create.spec.ts` (not `safety-critical/`).
4. Generate, obeying the slot:

```ts
// case: tests/cases/example-create.md  tier_ceiling: 2 (Maintenance honors; not enforced here)
import { test, expect } from '@playwright/test';
import { ExamplePage } from '../pages/example.page';

test.use({ storageState: 'tests/auth/developer.json' }); // storage_states_required (S7)

test('example-create — HP: creates a Draft Example', async ({ page }) => {
  const ex = new ExamplePage(page);
  await ex.gotoNew();                       // S2: networkidle for server-rendered
  await ex.fill({ title: 'Hello', image: 'fixtures/x.png' }); // S1 getByLabel, S3 setInputFiles
  await ex.submit();
  await expect(page.getByText('Hello')).toBeVisible(); // case intent: Title visible on detail
});

test('example-create — EC1: empty Title', async ({ page }) => {
  const ex = new ExamplePage(page);
  await ex.gotoNew();
  await ex.fill({ image: 'fixtures/x.png' });
  await ex.submit();
  await expect(page.getByText('Title cannot be blank')).toBeVisible(); // case EC1
});
```

5. `npx playwright test tests/specs/example-create.spec.ts` → green
   within 3 attempts. Hand off.

## Related

- [`../../contracts/case-schema.md`](../../contracts/case-schema.md) — the case it CONSUMES (`status`, `lives_in`, `storage_states_required`, `classification`, `tier_ceiling`)
- [`../../contracts/slot-contract.md`](../../contracts/slot-contract.md) — the framework slot it READS for HOW (S1-S9, forbidden content)
- [`../maintenance/SKILL.md`](../maintenance/SKILL.md) — stage 4; single authority for Tier 1/2/3 + the safety-critical path hook
- [`../write-case/SKILL.md`](../write-case/SKILL.md) — stage 2; produces the case this Skill consumes
- [`../../docs/WORKFLOW.md`](../../docs/WORKFLOW.md) — Workflow A (approval + 5-day SLA), Workflow C (sedimentation)
