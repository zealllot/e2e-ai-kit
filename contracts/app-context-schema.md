# Application Context Document schema

> **Status: stub.** The design intent is captured in
> [`../CONTEXT.md`](../CONTEXT.md) § Product components (component 6).
> This file will hold the full section spec + frontmatter requirements
> + the `source: probe | human | probe+human` semantics + the probe
> family that auto-fills `source: probe` sections. Until then, see the
> working `tests/app.context.md` in the first substrate
> (`mcd-website/tests/app.context.md`) for an example.

## What this file will contain (TODO)

- Frontmatter spec: `substrate`, `last_full_exploration`,
  `exploration_agent`
- 10 required sections + 1 optional section, each with:
  - Per-section metadata format (`source:`, `last_probed`,
    `last_curated`, `last_verified_by_human`, `revision_notes`)
  - `source:` semantics:
    - `probe` — Agent auto-fills; humans must NOT hand-edit; refresh
      by re-running the probe
    - `human` — humans write; Agent must NOT overwrite
    - `probe+human` — probe drafts; humans verify and sign
- Required sections (with skip-if-N/A rules):
  1. Product summary + critical journeys (human)
  2. Environments (probe)
  3. Permission model — roles + groups (probe, if substrate has auth)
  4. Auth strategy (probe+human, if substrate has auth)
  5. Route map (probe)
  6. State machines (human, if substrate has them)
  7. Known quirks — substrate-level, NOT framework-level (human)
  8. External systems (human, if any)
  9. Out of scope (human)
  10. Exploration log (agent, append-only)
- Optional: Notifications / on-call (human)
- Probe family + which probe owns which section
- `app-context-lint` invariants (required sections present, source
  markers present, freshness thresholds)
- The substrate vs framework quirks boundary rule: **"would this
  quirk still hold under a different framework?"** Yes → here. No →
  framework slot.

## Related Product components

- Product component 6 — Application Context Document (required
  upstream artifact)
- Product component 5 — Skill-as-sediment (the boundary between this
  doc and the framework slot)
- Governance — Sediment PR SLA (2 working days)
  ([`../CONTEXT.md`](../CONTEXT.md) § Governance)
