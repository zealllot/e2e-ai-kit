---
name: business-leak
description: Slot mentions substrate business terms.
framework: example-framework
admin_stack: example-admin
required_sections: [S1, S2, S3, S4, S5, S6, S7, S8, S9]
---

# Slot with leaked business terms

## Selector strategy

Prefer getByRole.

## Wait / readiness strategy

networkidle.

## Form input strategy

For MMR coupon creation, fill the catalog-id field first.

## Action / state-transition driving

The MDS data save action requires a follow-up republish step.

## Page Object structure convention

`pages/*.page.ts`.

## Test naming + file layout

`<feature>-<intent>.spec.ts`.

## Parallelism + data isolation

One worker per role.

## Anti-patterns

Don't reference JMA-specific state in this slot.

## Cost discipline

`trace: 'on-first-retry'`.
