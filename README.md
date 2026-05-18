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
├── skills/
│   └── maintenance/SKILL.md            Tier 1/2/3 classification (3, single authority)
├── scripts/                            lints + CLIs (case-lint, app-context-lint, ...)
└── templates/                          scaffolding for new substrates
```

## What lives where (and what doesn't)

- **In this repo (Product)**: methodology, contracts, cross-framework
  skills (`maintenance`), lints, onboarding flow, templates.
- **NOT in this repo (Substrate)**: anything tied to a specific
  business or admin app — resource lists, role lists, routes, business
  concepts, individual case `.md` contents, specs, page objects,
  permission matrices, framework-slot *contents* (the slot itself is
  Product; what fills it on a given substrate is Substrate).

See [`CONTEXT.md`](./CONTEXT.md) for the strict Product / Substrate /
Output boundary.

## Distribution (planned)

- npm package `@theplant/e2e-ai-kit` — provides lint CLIs and templates
- GitHub template repo — greenfield substrates start from a known-good scaffold

Neither is shipped yet. mcd-website (first substrate) currently
vendors the kit by direct file copy during onboarding.

## Status of load-bearing claims

See [`PURPOSE.md`](./PURPOSE.md) for the full status board. Short version:

- 2 of 6 hypotheses are at *finding* level (only on one substrate)
- 4 of 6 are *hypotheses* awaiting validation
- Portability is unverified until a second substrate completes
  [`docs/ONBOARDING.md`](./docs/ONBOARDING.md) end-to-end
