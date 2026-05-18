# templates/

Planned location for scaffolding a new substrate's Product-facing files
during Onboarding Phase 1 / 2 / 3.

## Planned templates (TODO)

- `app.context.md.template` — empty 10-section skeleton with frontmatter
  + per-section `<!-- source: ... -->` markers, for Onboarding Phase 2
- `skill-slot.md.template` — empty S1-S9 skeleton with frontmatter, for
  Onboarding Phase 1
- `case.md.template` (per `case_type`) — frontmatter + body skeleton
  for Onboarding Phase 3 and ongoing case writing
- `codeowners.template` — CODEOWNERS lines for `safety-critical/`,
  `permissions/`, generated `.md` files (the Q4-3 / Q4-5 mitigations)

## Distribution

These templates will eventually ship via:
- `npx e2e-ai-kit init` (CLI, planned) — copy templates into the
  substrate at the right paths
- GitHub template repo (planned) — for greenfield substrates

Until then, this directory is a placeholder.
