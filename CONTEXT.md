# Domain Glossary

This file is a glossary, not a spec. Implementation details belong in
code, ADRs, or feature docs — not here.

## Core terms

### The Product
The generalizable, AI-assisted E2E testing **kit** in this repository.
Designed to be onboarded onto *any* qor-like (and eventually any)
legacy admin codebase and produce both (a) a usable test suite and
(b) a sustainable maintenance loop.

**Not** to be confused with:
- **The Substrate** — the host project on which the Product is being
  used. The first substrate is mcd-website. Substrate-specific code is
  substrate, not Product.
- **The Output** — the artifacts the Product produces in a given
  substrate (test specs, page objects, case `.md` files, storageStates,
  matrix SoT). The Output is substrate-specific by definition.

### Product Success Criteria
Two co-equal criteria — both must hold for the Product to be
considered successful:
1. **Portability** — the Product can be moved to a new substrate and
   produce Output there without rebuilding the methodology from
   scratch.
2. **Coverage Yield** — when onboarded onto a substrate, the Product
   produces *high coverage* (not just "any tests"). The ~1800 tests on
   mcd-website are evidence for this criterion on that substrate; they
   are **not** "byproducts."

Both criteria are currently **hypotheses being validated**, not
**findings**. Until a second substrate has been onboarded, Portability
is unproven. Until coverage is measured against a defined yardstick
(% cells covered, % state-machine paths covered, regression catch
rate), Coverage Yield is anecdotal. `PURPOSE.md` marks each
load-bearing claim as either *hypothesis* or *finding*, with the
falsifiability criteria explicit.

### Substrate
The host project being tested. The first substrate is `mcd-website`.
A future substrate (another qor admin, or eventually a non-qor admin)
is the validation that the Product is actually portable, not just
*claimed* to be portable.

### Output
What the Product produces *in* a substrate. Output is project-specific
and intentionally non-portable: resource list, role list, routes,
business concepts (e.g. on mcd-website: MMR, MDS, JMA), case `.md`
files, page objects, storageStates, the matrix.

## Product components

The Product is composed of six load-bearing components plus one
acknowledged gap. Anything *not* on this list is either Substrate,
Output, or framework-slot content (see below) — not Product.

1. **Agent Pipeline** — 4 stages (Exploration → Test Case → Automation
   → Maintenance) with 2 human gates (approve case, approve T2 diff).
   Stage-internal tooling (e.g. discover probes) is implementation
   detail, not a separate component.
2. **Case-as-`.md`** — markdown file with frontmatter, advancing
   `pending-approval → approved`. The human/AI interface. Schema in
   [`contracts/case-schema.md`](./contracts/case-schema.md).
3. **Tier 1/2/3 + safety-critical circuit breaker** — the AI
   modification boundary. The *abstraction* is Product; concrete
   examples (selector drift, wait strategy, etc.) live in framework
   slots. Canonical authority:
   [`skills/maintenance/SKILL.md`](./skills/maintenance/SKILL.md).
4. **SoT-Doc-DriftCheck triplet** — a generalizable pattern: any
   "cataloged" structure in the substrate gets a SoT in code, a
   generated doc, and a drift-check test. Permission matrix is its
   instance on mcd-website; other substrates may instantiate it on API
   endpoints, feature flags, validators, etc.
5. **Skill-as-sediment convention** — every Agent-discovered quirk
   gets written into a skill file
   (`.claude/skills/<framework>/SKILL.md` or subordinate skill files),
   so it is not re-discovered next run.
6. **Application Context Document** — required upstream artifact for
   every substrate. Contents are substrate-specific (Output); the
   *requirement that it exist before pipeline runs* and *its expected
   shape* are Product contract. Schema in
   [`contracts/app-context-schema.md`](./contracts/app-context-schema.md).

### Gap (Product roadmap)

7. **Onboarding flow** — currently a 5-stage MVP in
   [`docs/ONBOARDING.md`](./docs/ONBOARDING.md). Until it has been
   exercised on a second substrate, Portability is a *claim*, not a
   *finding*.

## Case (the artifact)

A **Case** is a single markdown file under the substrate's `tests/cases/`
that captures the *intent* of one feature's tests. It is the human/AI
interface between the Test Case Agent (which writes it) and the
Automation Agent (which reads it to generate spec code), and the
artifact a human reviewer approves.

A Case carries a **`case_type`** that determines (a) what frontmatter
fields are required, (b) what body sections are required, and (c) what
items a reviewer must check before approving.

### Case types (closed enum)

| `case_type` | Purpose | Reviewer must verify (at minimum) |
|---|---|---|
| `happy-path` | One feature, one happy path + edge cases | validators verified, edge cases listed, permission scenarios complete |
| `state-machine` | Workflow with state transitions (publish, approval) | the above + state transitions verified, role × state matrix verified |
| `reference` | Shared pattern, not itself runnable (e.g. JSON publish foundation) | pattern accurate, related runnable cases enumerated; **must not** declare `lives_in` |
| `family` | Multiple resources sharing one mechanism (e.g. all banner JSONs) | family members enumerated, shared assertions identified, per-member specifics noted |
| `save-flow` | Form save with upstream preconditions (image upload, dependent fields) | form preconditions complete, save assertion specific, failure modes enumerated |

The enum is intentionally closed. Adding a new `case_type` requires a
PR that updates this glossary, updates the case lint, updates the
reviewer playbook, and notifies anyone with an in-flight case.

## Risk management commitment

The Product treats risks as **{Risk, Mitigation, Detection} triples**.
A naked risk with no mitigation is either upgraded to a triple or
explicitly marked `mitigation: UNRESOLVED`. The known triples
(committed 2026-05-18):

| Risk | Mitigation | Detection |
|---|---|---|
| Skill rot | Sedimentation is a **pipeline stage**: each Agent run outputs `discoveries.log`; pipeline auto-diffs against current skill and opens a skill PR | CI flags Agent output containing "I rediscovered X" patterns |
| Rubber-stamp case approval | Case `.md` frontmatter requires `approved_by`, `approved_at`, `reviewer_checked: [...]`; CI rejects `status: approved` if checklist empty | Spot-check audit of every Nth case by a second reviewer |
| Manual edits to generated tables | (a) Banner on generated `.md`; (b) `matrix-sync` drift check is a CI required check; (c) CODEOWNERS on `tests/permissions/` | (b) is its own detection |
| `./dev.sh all` (or substrate equivalent) silently breaks → tests skip | Split skip reasons: `precondition-not-met` (business) vs `environment-broken` (infra). The latter is a **fail**, not a skip. Health-check at test setup; fail-fast if daemon/workers down | Monitor skip count; alert on sudden jumps |
| Tier creep (safety-critical → Tier 2) | CODEOWNERS on `tests/specs/safety-critical/` + on `@safety-critical` header diffs. Maintenance Agent's Tier classification is **monotonic** (T1→T2→T3 single direction); downgrade attempts fail CI | git log audit of safety-critical entries + header changes, weekly |

The original framing of safety-critical as "the path itself is the
breaker, not maintainer's judgment in the moment" is replaced by:
**path + header are triggers; CODEOWNERS gate is the breaker.** The
judgment is moved from the moment of failure to the moment of PR
review, which is a different kind of judgment with different
guardrails.

## Governance

### Human-gate SLAs

A gate without a stall policy is a deadlock waiting to happen. The
Product specifies three gates; SLAs are ordered by **rediscovery
cost**, not by importance.

| Gate | SLA | On expiry | Fast-mode override |
|---|---|---|---|
| Case approval | 5 working days | Case → `status: stale`; Automation Agent must refuse to consume stale cases; Test Case Agent regenerates | `approval_caveat: fast-mode-skip` — reviewer accepts case without full check, recorded on the record |
| T2 diff approval (Maintenance Agent) | 3 working days | PR auto-closes; same failure not re-proposed by Agent for 1 week | None |
| Sediment PR (skill / app.context auto-PRs) | 2 working days | PR → draft; same quirk not re-PR'd; Skill-Rot detection flags repeated rediscovery | None |

### Maintenance Agent trigger

- **Auto**: any Product spec failing in PR CI
- **Manual**: substrate-specific CLI (e.g. `npx playwright maintenance --grep <spec>`)
- **Scheduled**: explicitly NOT supported — cost control
- Not triggered by: lint failures, build failures

Outputs by tier:
- T1 → PR, auto-merge eligible (passes CI = merges)
- T2 → draft PR + review request
- T3 → no spec change; opens a bug ticket

### Lint gates

| Lint | CI required | Pre-commit |
|---|---|---|
| `case-lint` | required | no |
| `app-context-lint` | required | no |
| `skill-slot-lint` | required | no |
| substrate's `matrix-sync` (where SoT-Doc-DriftCheck is instantiated) | required | no |

Lint failures block merge; **no auto-fix on lints** (auto-fix on a
governance lint silently launders violations, which contradicts the
five risk mitigations above).

### Framework slot

Per the multi-framework-pluggable decision
([ADR-0001](./docs/adr/0001-product-substrate-output.md)): the Product
reserves a **slot** at `.claude/skills/<framework>/SKILL.md` (in the
substrate) for framework- and admin-stack-specific quirks. mcd-website
fills the slot with `playwright-qor`. A future substrate on
Rails+Cypress would fill it with `cypress-rails`, etc. The *slot* and
the *sedimentation rules* are Product; the slot *content* is not.

#### Slot contract

A slot MUST cover **and only cover** these 9 categories. Anything
cross-framework (Tier classification, case schema, application context
schema, sedimentation rules) lives in the Product's central docs, not
in the slot. Anything substrate-specific (business names,
env-specific auth flows) lives in the substrate's `tests/app.context.md`,
not in the slot.

| # | Required slot section | Example (playwright-qor) |
|---|---|---|
| S1 | Selector strategy | Prefer `getByRole`, avoid `.class` |
| S2 | Wait / readiness strategy | Server-rendered qor needs `networkidle` |
| S3 | Form input strategy (framework × admin-stack quirks) | MediaBox bypass, MDL-wrapped controls |
| S4 | Action / state-transition driving | qor action buttons + confirmation modal |
| S5 | Page Object structure convention | `pages/*.page.ts`, one class per resource |
| S6 | Test naming + file layout | `<feature>-<intent>.spec.ts` |
| S7 | Parallelism + data isolation | Worker count, storageState segmentation |
| S8 | Anti-patterns ("Never do this") | Don't `console.log(page.content())` |
| S9 | Cost discipline | `trace: 'on-first-retry'`, screenshot policy |

Full contract: [`contracts/slot-contract.md`](./contracts/slot-contract.md).

#### Forbidden in slot

- Tier 1/2/3 classification → lives in [`skills/maintenance/SKILL.md`](./skills/maintenance/SKILL.md) (Product component 3, single authority)
- Case `.md` schema → lives in [`contracts/case-schema.md`](./contracts/case-schema.md) (Product component 2)
- Application context schema → lives in [`contracts/app-context-schema.md`](./contracts/app-context-schema.md) (Product component 6)
- Sedimentation rules → cross-slot Product convention (Product component 5)
- Substrate business names / domain concepts (e.g. on mcd-website: MMR, MDS, JMA) → live in the substrate's `tests/app.context.md § Known quirks`

#### Sedimentation routing

Every Agent run produces a `discoveries.log`. The pipeline classifies
each discovery and opens a PR to one of three places:

| Discovery flavour | Auto-PR target |
|---|---|
| New framework × admin-stack quirk | substrate's `.claude/skills/<framework>/SKILL.md` (or `quirks/<scope>.md`) |
| New substrate business quirk | substrate's `tests/app.context.md § 7 Known quirks` |
| New cross-substrate methodology issue | this repo's `CONTEXT.md` or Product roadmap |

Classifier rule: **"Would this still hold under a different framework?"**
Yes → substrate `app.context.md`. No → slot.

### Explicitly **not** Product (substrate-specific Output)

- Resource list, role list, routes
- Business concepts (e.g. on mcd-website: MMR, MDS, JMA)
- Domain source-language structs / models
- The auth setup *implementation* (2FA flow, TOTP scrape, storageState
  files) — the *requirement* of "stable per-role persisted auth" is
  Product contract; *how* a given framework satisfies it is framework
  slot content; *what* credentials a given substrate uses is substrate
  Output.
- All test specs, page objects, the matrix contents, individual
  case `.md` contents
