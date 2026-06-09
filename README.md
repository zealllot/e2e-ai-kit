# e2e-ai-kit

A generalizable, AI-assisted E2E testing kit. Onboard it onto any
qor-like (and eventually any) legacy admin codebase to produce both
(a) a usable test suite and (b) a sustainable maintenance loop.

> **Status: v0.1 internal preview.** First substrate (mcd-website)
> validated this design end-to-end with ~1800 specs. Second substrate
> not yet onboarded — Portability remains a *hypothesis*, not a
> *finding*, until then.

## Read order for newcomers

1. [`PURPOSE.md`](./PURPOSE.md) — manifesto: what this kit is, what it
   tries to prove, where each load-bearing claim currently stands
2. [`CONTEXT.md`](./CONTEXT.md) — glossary: Product / Substrate / Output,
   the six Product components, three contracts, risk triples, governance
3. [`docs/WORKFLOW.md`](./docs/WORKFLOW.md) — day-to-day operating
   model: the four workflows, SLAs, and what you should/shouldn't do
4. [`docs/ONBOARDING.md`](./docs/ONBOARDING.md) — 5-stage MVP for taking
   the kit to a new substrate
5. [`docs/adr/`](./docs/adr/) — load-bearing design decisions (currently 2)

## Repository layout

```
.
├── CONTEXT.md                          glossary (canonical)
├── PURPOSE.md                          manifesto + status board
├── docs/
│   ├── WORKFLOW.md                     day-to-day operating model
│   ├── ONBOARDING.md                   5-stage onboarding for new substrates
│   └── adr/                            architecture decision records
├── contracts/                          the 3 contracts a substrate must satisfy
│   ├── case-schema.md                  case `.md` schema (Product component 2)
│   ├── app-context-schema.md           Application Context Document schema (6)
│   └── slot-contract.md                framework slot contract (5)
├── skills/                             cross-framework Product skills (4-stage pipeline + sedimentation)
│   ├── e2e-kit/SKILL.md                one-entry orchestrator — routes to the stages below, stops at human gates
│   ├── exploration/SKILL.md            stage 1 — probe substrate, fill app.context.md
│   ├── write-case/SKILL.md             stage 2 — write reviewable case `.md`
│   ├── automation/SKILL.md             stage 3 — approved case → spec + page object
│   ├── maintenance/SKILL.md            stage 4 — Tier 1/2/3 classification (single authority)
│   └── sedimentation/SKILL.md          Workflow C — route a discovery to its home
├── src/                                lint CLI implementation (case / app-context / slot)
├── bin/e2e-ai-kit.js                   lint CLI entrypoint
├── install.sh                          installer: symlink skills + global `e2e-ai-kit` command
├── scripts/                            (placeholder — the lints live in src/, not here)
└── templates/                          (placeholder — substrate scaffolding, not yet shipped)
```

## What lives where (and what doesn't)

- **In this repo (Product)**: methodology, contracts, cross-framework
  skills (`exploration` / `write-case` / `automation` / `maintenance` /
  `sedimentation`), lints, onboarding flow, templates.
- **NOT in this repo (Substrate)**: anything tied to a specific
  business or admin app — resource lists, role lists, routes, business
  concepts, individual case `.md` contents, specs, page objects,
  permission matrices, framework-slot *contents* (the slot itself is
  Product; what fills it on a given substrate is Substrate).

See [`CONTEXT.md`](./CONTEXT.md) for the strict Product / Substrate /
Output boundary.

## Installation

```bash
git clone <e2e-ai-kit>
cd e2e-ai-kit && ./install.sh
```

`install.sh` installs the kit's deps once in the clone, symlinks the
skills under `skills/` into `~/.claude/skills/`, symlinks `contracts/`
so skill links resolve, and generates a global `e2e-ai-kit` command that
runs the lint CLI **from the clone** (via the clone's own `tsx`). A
substrate therefore needs zero local dependencies and never has to know
where the kit lives — from any project:

```bash
e2e-ai-kit lint case          # validates tests/cases/*.md
e2e-ai-kit lint app-context   # validates tests/app.context.md
e2e-ai-kit lint slot          # validates .claude/skills/<framework>/SKILL.md
```

Update later with `git pull` in the clone — no reinstall needed. If
install.sh prints a PATH notice, add `~/.local/bin` to your PATH once.

## Distribution (still planned)

- npm package `@theplant/e2e-ai-kit` — a published package with compiled
  JS so `npm install` works standalone (today the CLI runs via the
  clone's `tsx`, set up by `install.sh`)
- GitHub template repo — greenfield substrates start from a scaffold

## Status of load-bearing claims

See [`PURPOSE.md`](./PURPOSE.md) for the full status board. Short version:

- 2 of 6 hypotheses are at *finding* level (only on one substrate)
- 4 of 6 are *hypotheses* awaiting validation
- Portability is unverified until a second substrate completes
  [`docs/ONBOARDING.md`](./docs/ONBOARDING.md) end-to-end
