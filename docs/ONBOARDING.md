# Onboarding a new substrate

This is the 5-stage MVP for taking e2e-ai-kit to a new substrate.
"MVP" means "enough to ship a green spec, not the perfect onboarding."
The three contracts ([`case-schema`](../contracts/case-schema.md),
[`app-context-schema`](../contracts/app-context-schema.md),
[`slot-contract`](../contracts/slot-contract.md)) are mandatory at each
stage; the prose around them will harden as substrates #2 / #3 expose
gaps.

> **Stage gating**: each stage has a lint that must pass before the
> next stage starts. Lint failures mean the stage isn't done — do not
> proceed.

## Phase 0 — Substrate eligibility (5 min)

Decide GO / NO-GO before spending any time on stages 1-4.

- [ ] Substrate is a web application with discoverable HTTP routes
- [ ] Substrate has a recognizable admin surface (qor, Django admin,
      Rails admin, custom — any structured CRUD UI)
- [ ] Substrate has authentication (otherwise Phase 1 Auth contract is
      N/A — proceed but flag)
- [ ] You can run a clean local instance (probes need a reachable
      target)
- [ ] You have read access to the source code

**Output**: a single GO/NO-GO line with rationale, written into the
substrate's `tests/PURPOSE.md` (or equivalent) preamble.

## Phase 1 — Fill the framework slot (half day)

Why this is first: app.context.md probes in Phase 2 rely on selector
and wait strategies defined in the slot.

- [ ] Choose `<framework>` (playwright, cypress, ...) and
      `<admin_stack>` (qor, rails-admin, django-admin, custom, ...)
- [ ] Create `.claude/skills/<framework>-<admin_stack>/SKILL.md` with
      the required frontmatter (see
      [`../contracts/slot-contract.md`](../contracts/slot-contract.md))
- [ ] Walk the 9 required S1-S9 sections; write `unknown — TBD` for
      any the substrate has not yet surfaced
- [ ] Hand-drive 5-10 simple page interactions on the substrate
      locally; as quirks surface, fill the relevant section. **Do not
      copy from mcd-website's `playwright-qor` skill** — that would
      import qor and mcd-website assumptions into a different
      substrate
- [ ] Run `skill-slot-lint` (planned CLI: `npx e2e-ai-kit lint slot`)
      — must pass

**Output**: a non-empty, lint-passing slot SKILL.md that lets a single
simple spec run.

## Phase 2 — Fill the Application Context Document (1-2 days)

- [ ] Create `tests/app.context.md` per
      [`../contracts/app-context-schema.md`](../contracts/app-context-schema.md)
      (10 required sections + frontmatter)
- [ ] For `source: probe` sections (Environments, Permission model,
      Route map, Auth strategy), run the corresponding Exploration
      Agent probe — auto-fills
- [ ] For `source: human` sections (Product summary, State machines,
      Known quirks, Out of scope), hand-write
- [ ] For `source: probe+human` sections (Auth strategy), probe drafts
      and **a human must sign** `last_verified_by_human` before it is
      trusted
- [ ] Run `app-context-lint` — must pass

**Output**: a substrate map that lets the Test Case Agent start work.

## Phase 3 — Write one case (half day)

- [ ] Pick the smallest, **least important** happy path on the
      substrate. Avoid publish flows, RBAC, anything money-related
- [ ] Ask the Test Case Agent to produce `tests/cases/<feature>.md`
      per [`../contracts/case-schema.md`](../contracts/case-schema.md);
      expect `status: pending-approval`
- [ ] Review by hand. Fill `reviewer_checked` based on the case's
      `case_type` (see [`../CONTEXT.md`](../CONTEXT.md) § Case (the
      artifact)). Flip `status: approved` + fill `approved_by` /
      `approved_at`
- [ ] Run `case-lint` — must pass

**Output**: one approved case that passes lint.

## Phase 4 — Run one spec (half day)

- [ ] Automation Agent reads the approved case → writes the spec file
      + page object(s)
- [ ] Run the spec — **must pass**
- [ ] If it passes: onboarding is complete. The substrate is now
      consuming the Product end-to-end.
- [ ] If it does not: return to Phase 1 or Phase 2; the slot or
      app.context.md is missing something the Automation Agent needs.

**Output**: one green spec. **Portability moves from "claim" to
"finding" the moment a second substrate reaches this step.**

## Phase 5 — Write back to the Product (ongoing)

Onboarding is self-iterative. As you encounter gaps:

- [ ] Things this ONBOARDING.md should have said but didn't → PR to
      this file
- [ ] Cross-framework methodology issues you discovered → PR to
      e2e-ai-kit [`CONTEXT.md`](../CONTEXT.md)
- [ ] Framework × admin-stack quirks you found → stay in your
      substrate's slot

## Time budget

5 phases total ≤ **1 week** of focused work. Going over usually means
the **Product** has a gap (unclear contract, missing scaffolding), not
that the substrate is unusually hard. Stop and PR the Product before
hard-pushing the substrate.
