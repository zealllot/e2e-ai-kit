---
name: tier-violator
description: Slot that incorrectly defines Tier 1/2/3 inline.
framework: example-framework
admin_stack: example-admin
required_sections: [S1, S2, S3, S4, S5, S6, S7, S8, S9]
---

# Tier-violator slot

## Selector strategy

Prefer getByRole.

## Wait / readiness strategy

networkidle.

## Form input strategy

Fill by label.

## Action / state-transition driving

Click action buttons.

## Page Object structure convention

`pages/*.page.ts`.

## Test naming + file layout

`<feature>-<intent>.spec.ts`.

## Parallelism + data isolation

One worker per role.

## Anti-patterns

Don't `console.log(page.content())`.

## Cost discipline

`trace: 'on-first-retry'`.

## Tiered fix classification (forbidden duplicate)

### Tier 1 — Auto-fix, open PR

Apply directly and open a PR. Guardrail: no expect() value changes.

### Tier 2 — Diff-for-review

Open PR + request human approval.

### Tier 3 — File bug, do NOT touch test

Open Jira/Linear bug; do not modify the test.
