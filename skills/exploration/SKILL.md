---
name: exploration
description: Use when onboarding a substrate (Phase 2) or re-probing after routes / permissions / environments / auth change. Probes a running substrate to fill the `probe` and `probe+human` sections of its `tests/app.context.md`, conforming to contracts/app-context-schema.md — never self-signs the human-verification marker on Auth strategy, and never writes the human-authored sections (Product summary, State machines, Known quirks, External systems, Out of scope).
---

# Exploration Agent — probe a substrate, fill `app.context.md`

This Skill is stage 1 of the 4-Agent pipeline
(**Exploration** → Test Case → Automation → Maintenance). It probes a
running substrate and fills the *machine-knowable* parts of that
substrate's `tests/app.context.md` (which lives in the SUBSTRATE, not in
this kit). The Test Case Agent reads the result later to know what the
substrate looks like before writing any case.

## When to use

- ONBOARDING **Phase 2** — first time the substrate gets an
  `app.context.md`, after Phase 1 (the framework slot) is in place
- A requirement change moved routes, permissions, environments, or auth
  — re-probe the affected `probe` / `probe+human` sections

## When NOT to use

- Writing a test case (`tests/cases/<feature>.md`) — that is the
  `write-case` Skill (stage 2)
- Writing or fixing Playwright spec code / page objects — that is the
  Automation Agent (stage 3)
- Editing the framework slot / kit files — that is Phase 1, not this Skill
- Filling the **human** sections (Product summary, State machines, Known
  quirks, External systems, Out of scope) — those are hand-written

## Inputs the Agent needs (stop-and-ask if missing)

Gather these before probing. If any is missing, **stop and ask** — do
not invent routes, roles, or environments from another substrate.

1. **A reachable running local instance** of the substrate (a base URL
   that responds). Without it there is nothing to probe
2. **Read access to the substrate source** — routes file, auth /
   session config, role / permission definitions
3. **The app-context schema** — `contracts/app-context-schema.md`, so the
   section titles, `source:` markers, and frontmatter keys are verbatim

## The flow

```
1. Confirm inputs above. No running instance / no source → STOP, ask.
2. Set frontmatter: substrate, last_full_exploration (today, YYYY-MM-DD),
   exploration_agent (claude-<model> (Exploration Agent)).
3. Probe + fill ONLY the sections this Agent owns (table below). Write
   each section's <!-- source: ... --> marker as the FIRST non-blank line.
4. §4 Auth strategy: DRAFT it, set last_probed, but DO NOT write
   last_verified_by_human — a human signs that. Flag it for review.
5. New BUSINESS quirk found while probing? Do NOT invent it into the doc.
   Flag it for a human to add to §7 Known quirks (a human section).
6. Self-check: lint app-context must exit 0 (command below). Fix the
   reported ruleId, re-run until green.
7. Hand off: tell the human which §4 marker awaits their signature.
```

## Sections this Agent owns

The doc has eleven H2 sections (verbatim titles from the schema). This
Agent fills only the non-`human` ones; it must leave the `human` sections
for a human and must not touch the framework slot.

| # | Section | source | This Agent |
|---|---|---|---|
| 1 | Product summary | `human` | leave for human |
| 2 | Environments | `probe` | **fill** |
| 3 | User roles + Groups | `probe` | **fill** |
| 4 | Auth strategy | `probe+human` | **draft only**, human signs |
| 5 | Route map | `probe` | **fill** |
| 6 | State machines | `human` | leave for human |
| 7 | Known quirks | `human` | leave for human (flag new ones) |
| 8 | External systems | `human` | leave for human |
| 9 | Notifications | `human` | optional; leave for human |
| 10 | Out of scope | `human` | leave for human |
| 11 | Exploration log | `agent` | **fill** (append this run) |

## Source markers — verbatim, first non-blank line under the heading

| source value | Marker shape (first non-blank line) |
|---|---|
| `probe` | `<!-- source: probe, last_probed: YYYY-MM-DD -->` |
| `probe+human` | `<!-- source: probe+human, last_probed: YYYY-MM-DD, last_verified_by_human: YYYY-MM-DD -->` |
| `agent` | `<!-- source: agent, append_only: true -->` |

- The marker's `source` value MUST match the schema for that section, or
  lint fires `app_context.section.source_mismatch`. An unrecognized value
  fires `app_context.section.source_invalid`.
- §4 needs `last_verified_by_human` — but **the Agent does not write its
  own date there**. Hand the section to a human, who fills it after
  verifying. Missing it on the final trusted doc fires
  `app_context.section.last_verified_by_human_required`; that is the
  human's gate, not yours to forge.

## The §4 / §7 boundary (do not cross either)

- **§4 Auth strategy is `probe+human`**: probe the login flow (2FA?
  SSO? storage-state shape?) and draft it. Then **stop** — a human must
  sign `last_verified_by_human` before the auth claim is trusted. Forging
  that date defeats the human-verification gate.
- **§7 Known quirks is `human`**: a substrate BUSINESS quirk you discover
  while probing does NOT go into a `probe` section and you do NOT invent
  it. Flag it for a human to add to §7. (Sedimentation: business facts
  sediment into §7, never into the framework slot.)

## Self-check (mandatory before hand-off)

```sh
e2e-ai-kit lint app-context tests/app.context.md   # must exit 0
```

If it exits 1, the output names the `ruleId`. Map it and fix exactly that:

| ruleId | Meaning |
|---|---|
| `app_context.frontmatter.substrate_required` | add `substrate:` |
| `app_context.frontmatter.last_full_exploration_required` | add `last_full_exploration:` (YYYY-MM-DD) |
| `app_context.frontmatter.exploration_agent_required` | add `exploration_agent:` |
| `app_context.body.section_missing` | a required H2 section is absent (named in `section`) |
| `app_context.section.source_marker_missing` | no `<!-- source: ... -->` as first non-blank line |
| `app_context.section.source_invalid` | `source` value not one of human/probe/probe+human/agent |
| `app_context.section.source_mismatch` | `source` disagrees with the schema for that section |
| `app_context.section.last_verified_by_human_required` | §4 missing `last_verified_by_human` (human signs) |

Do not hand a doc to the human that you have not seen pass lint.

## What NOT to do

- Do **not** write `last_verified_by_human` on §4 yourself — only a human
  signs it after verifying the auth flow
- Do **not** fill the `human` sections (§1, §6, §7, §8, §9, §10) — leave
  them for a human; flag new business quirks for §7, never invent them
- Do **not** write cases (stage 2) or spec code (stage 3) or touch the
  framework slot (Phase 1)
- Do **not** copy routes, roles, or environments from another substrate
  or from the schema example — probe THIS substrate's running instance
  and read THIS substrate's source
- Do **not** change a section's `source:` value to make lint pass — the
  value is fixed by the schema; fix the content, not the marker

## Example (probe-filled sections, §4 awaiting human signature)

```markdown
---
substrate: mcd-website
last_full_exploration: 2026-06-09
exploration_agent: claude-opus-4-8 (Exploration Agent)
---

# mcd-website Application Map

## 2. Environments
<!-- source: probe, last_probed: 2026-06-09 -->

| Env | Base URL |
|---|---|
| local | http://localhost:9500 |
| dev | https://dev.mcd.example |

## 3. User roles + Groups
<!-- source: probe, last_probed: 2026-06-09 -->

`developer`, `editor`, `viewer` (from `config/roles.go:14`).

## 4. Auth strategy
<!-- source: probe+human, last_probed: 2026-06-09 -->

DRAFT: cookie session, local has 2FA via TOTP. storageState per role
under `tests/auth/<role>.json`.
> Awaiting human: add `last_verified_by_human: YYYY-MM-DD` to the marker
> above once the auth flow is verified.

## 5. Route map
<!-- source: probe, last_probed: 2026-06-09 -->

`/admin/coupon`, `/admin/order` (from `config/routes.go`).

## 11. Exploration log
<!-- source: agent, append_only: true -->

- 2026-06-09 — full probe; §2/§3/§5 refreshed, §4 drafted (pending human).
```

The human sections (§1, §6, §7, §8, §9, §10) stay hand-written; this
Agent leaves them alone. After a human signs §4's
`last_verified_by_human`, the whole doc passes lint as trusted.

## Related

- [`../../contracts/app-context-schema.md`](../../contracts/app-context-schema.md) — the enforceable schema this Skill targets
- [`../write-case/SKILL.md`](../write-case/SKILL.md) — stage 2; reads the `app.context.md` this Skill produces
- [`../maintenance/SKILL.md`](../maintenance/SKILL.md) — stage 4; failure-tier classification
- [`../../docs/WORKFLOW.md`](../../docs/WORKFLOW.md) — where this Skill sits in the pipeline
- `../../tests/fixtures/app-context/good-app-context.md` — the canonical good shape
