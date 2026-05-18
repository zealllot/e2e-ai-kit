# Why e2e-ai-kit exists

This kit is a generalizable, AI-assisted E2E testing methodology +
toolset. mcd-website is its first substrate; you (or your team) are
the next substrate. See [`CONTEXT.md`](./CONTEXT.md) for the full
glossary (Product / Substrate / Output / case types / Tier
classification / etc.).

## What we're trying to prove

Two co-equal success criteria — both currently **hypotheses**, not findings:

| Criterion | Falsifiable form | Current state |
|---|---|---|
| **Portability** | After a second substrate onboards via [`docs/ONBOARDING.md`](./docs/ONBOARDING.md), the Product produces a green spec in ≤1 week using the 3 contracts, without rebuilding methodology from scratch | UNVERIFIED — only mcd-website so far |
| **Coverage Yield** | After onboarding, ≥X% of substrate's auth × resource cells / state-machine paths are covered (X is per-substrate, set in Phase 0 of onboarding) | mcd-website: 2541/2541 permission cells covered; ~1800 specs total. Threshold X for new substrates: TBD per substrate |

## Six load-bearing hypotheses

The Product's design rests on six hypotheses. Each is recorded with a
**falsifiable form** and a **status** (`hypothesis` = design intent
awaiting evidence; `finding` = supported by evidence on at least one
substrate). Do not read findings here that are not labeled findings.

| # | Hypothesis | Falsifies when | Current evidence | Status |
|---|---|---|---|---|
| 1 | The Product produces non-trivial coverage on legacy admin code | After full onboarding, coverage < the substrate's agreed X% of cells / paths | mcd-website: 2541/2541 permission cells, 6 publish state machines, JSON publish loop, sidebar/menu invariants | finding (n=1 substrate) |
| 2 | Sedimentation prevents re-discovery of the same quirk | The same skill-documented quirk reappears as a fresh "discovery" in ≥3 subsequent Agent runs | N=1 anecdote (the `playwright-qor` skill prevented re-discovery of MediaBox dual-output behavior on later runs) | hypothesis — needs more data points |
| 3 | The SoT-Doc-DriftCheck triplet catches structural drift mechanically | For an enumerated cataloged structure, deliberately introducing a violation in CI does NOT fail the check | mcd-website matrix→Markdown drift check enforces byte equality (1 strong invariant; the prior "≥8 drift classes" framing overstated this) | finding (1 instance) |
| 4 | The Tier-3 circuit breaker prevents AI overreach on safety-critical surfaces | Any historical Maintenance Agent invocation on a safety-critical failure silently modified the spec instead of filing a bug | No Maintenance Agent invocation on safety-critical has been logged yet | hypothesis — untested |
| 5 | Cases are reviewable by non-authors | Non-author reviewer cannot summarize the test's intent + scenario in <30s for ≥X% of sampled cases | No measurement yet — the case `.md` format + `test.step()` narratives are designed for this, but the property is unmeasured | hypothesis — aspirational |
| 6 | Per-feature cost converges with substrate experience | Time-to-first-passing-spec for case N is ≥ case 1's after N ≥ M cases (cost = human review + Agent wall clock) | N=2 anecdote (1st vs 8th JSON publish case on mcd-website) — full time series unavailable | hypothesis — under-measured |

**Read carefully**: only Hypotheses 1 and 3 currently have evidence at
*finding* level, and only on one substrate. Hypotheses 2, 4, 5, 6 are
design intent awaiting validation. This honest split is part of the
Product's contract with its readers.

## What this Product is NOT

- Not "AI runs during tests." AI runs while *generating* and
  *maintaining* tests; tests run without AI. (Cost discipline.)
- Not a regression-by-volume strategy ("we have N tests, so we're fine").
- Not framework-locked. The framework slot (B2 design — see
  [`docs/adr/0001-product-substrate-output.md`](./docs/adr/0001-product-substrate-output.md))
  keeps framework × admin-stack specifics on each substrate; the
  methodology survives a framework swap.
- Not a one-shot artifact — it expects to be maintained by both humans
  and AI Agents indefinitely.
- Not a substitute for unit tests in the substrate's source language.

## See also

- [`CONTEXT.md`](./CONTEXT.md) — glossary, six Product components, three contracts, risk triples, governance
- [`docs/ONBOARDING.md`](./docs/ONBOARDING.md) — 5-stage MVP onboarding for a new substrate
- [`docs/adr/0001-product-substrate-output.md`](./docs/adr/0001-product-substrate-output.md) — Product/Substrate/Output split + B2 framework slot
- [`docs/adr/0002-extract-to-separate-repo.md`](./docs/adr/0002-extract-to-separate-repo.md) — why this kit lives in its own repo
- [`contracts/case-schema.md`](./contracts/case-schema.md) — case `.md` schema
- [`contracts/app-context-schema.md`](./contracts/app-context-schema.md) — substrate Application Context Document schema
- [`contracts/slot-contract.md`](./contracts/slot-contract.md) — framework slot contract
- [`skills/maintenance/SKILL.md`](./skills/maintenance/SKILL.md) — Tier 1/2/3 classification (single authority)
