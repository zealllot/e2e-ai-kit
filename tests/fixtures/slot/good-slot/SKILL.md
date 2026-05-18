---
name: example-framework-example-admin
description: Slot for example-framework on example-admin. Conformant per slot-contract.md.
framework: example-framework
admin_stack: example-admin
required_sections: [S1, S2, S3, S4, S5, S6, S7, S8, S9]
---

# example-framework slot for example-admin

For Tier 1/2/3 failure classification, see
[`../maintenance/SKILL.md`](../maintenance/SKILL.md) — that is the
single authority. Substrate-specific auth / business content lives in
the substrate's `tests/app.context.md`.

## Selector strategy

Prefer `getByRole`. Avoid CSS class selectors.

## Wait / readiness strategy

Use `networkidle` for server-rendered pages.

## Form input strategy

Fill by label; for file uploads, use `setInputFiles` with an inline buffer.

## Action / state-transition driving

Click the action button, confirm the modal, poll the state badge.

## Page Object structure convention

`tests/pages/<resource>.page.ts`. One class per admin resource.

## Test naming + file layout

`<feature>-<intent>.spec.ts`.

## Parallelism + data isolation

One Playwright worker per role; storageState segmentation prevents
session bleed.

## Anti-patterns

- Don't `console.log(page.content())` — dump structured JSON via
  `page.evaluate` instead.
- Don't bypass authentication in production specs.

## Cost discipline

`trace: 'on-first-retry'` in CI; `screenshot: 'only-on-failure'`.
