# Using e2e-ai-kit

A practical guide: how to install it, what the day-to-day process looks
like, what each step **produces**, and how the five skills do the actual
testing work.

> One-line model: **AI generates and maintains the tests; running the
> tests needs no AI.** You describe intent and approve; the skills produce
> the artifacts; `e2e-ai-kit lint` + Playwright verify them.

For the *why* and the strict Product/Substrate boundary see
[`../CONTEXT.md`](../CONTEXT.md); for taking the kit to a brand-new
project see [`./ONBOARDING.md`](./ONBOARDING.md).

---

## 1. Install (once per machine)

```bash
git clone <e2e-ai-kit>
cd e2e-ai-kit && ./install.sh
```

`install.sh` (clone-and-symlink model):

- installs the kit's own deps once **in the clone** (so your project needs none);
- symlinks the five skills into `~/.claude/skills/` (Claude Code finds them globally);
- symlinks `contracts/` so skill links resolve;
- generates a global **`e2e-ai-kit`** command that runs the lint CLI **from the clone**.

If it prints a PATH notice, add `~/.local/bin` to your PATH once. Update
later with `git pull` in the clone — no reinstall. After this, from *any*
project: `e2e-ai-kit lint case|app-context|slot`.

Your project (the **substrate**) needs zero local dependencies and never
has to know where the kit lives.

---

## 2. Is the project onboarded yet?

This guide is for a project that is **already onboarded** — meaning it has:

- `tests/app.context.md` — the application map
- `.claude/skills/<framework>/SKILL.md` — the framework slot (e.g. `playwright-qor`)

If those don't exist yet, run the one-time onboarding first
([`./ONBOARDING.md`](./ONBOARDING.md), ~1 week): the `exploration` skill
fills `app.context.md`, you hand-write the human sections and the
framework slot, then write+run your first case. After that, you're in the
daily loop below.

---

## 3. The pipeline at a glance

```
Exploration → Test Case → Automation → Maintenance      (+ Sedimentation)
   probe        write       generate       fix-or-          record
   the app      intent      real code      file-bug         learnings
                   │            ▲
                   └─ 👤 you approve here ─┘   ← the one human gate
```

You drive it in plain language; each stage is a skill. The **only** step
that must be a human is approving a case.

---

## 4. The five skills — when to use, what you say, what it produces

| Skill | Trigger it when… | You say (example) | It produces | Self-check |
|---|---|---|---|---|
| `exploration` | onboarding, or routes/permissions/login changed | "re-probe the routes and permissions" | fills the `probe` sections of `tests/app.context.md` | `e2e-ai-kit lint app-context` |
| `write-case` | you want to add/change a test's **intent** | "write a test for widget create" | `tests/cases/<feature>.md` at `status: pending-approval` | `e2e-ai-kit lint case` |
| `automation` | a case is **approved** and needs code | "generate the spec for this approved case" | `tests/specs/<feature>.spec.ts` + page object(s) | `playwright test` |
| `maintenance` | a previously-green spec **fails** in CI | "this spec is failing, handle it" | a fix PR, a review-diff PR, or a bug ticket (by Tier) | re-run `playwright test` |
| `sedimentation` | a run **learned** a new quirk | "record this quirk so we don't rediscover it" | a PR to app.context §7 / the slot / CONTEXT | `e2e-ai-kit lint slot`/`app-context` |

You normally don't name the skill — describe the task and Claude Code
picks the matching one from its `Use when…` description. You *can* name it.

---

## 5. What gets generated (the artifacts)

| Artifact | Path | By | What it is |
|---|---|---|---|
| Application map | `tests/app.context.md` | exploration (+human) | routes, roles, auth, state machines, known quirks |
| Case | `tests/cases/<feature>.md` | write-case | the **intent** of a feature's tests — human-reviewable, not code |
| Spec + page object | `tests/specs/<feature>.spec.ts`, `tests/pages/…` | automation | the runnable Playwright test |
| Safety-critical spec | `tests/specs/safety-critical/…` | automation | same, but parked where Maintenance treats it as Tier 3 |
| Maintenance/bug report | `test-results/…` | maintenance | classification + proposed fix or bug |

The **case** (`.md`) is the heart of it: a short, readable document of
"what we test and why" that a non-author can grasp in under a minute. It's
the contract between you (who approves) and `automation` (which codes it).

---

## 6. Daily use — add a test (the common flow)

```
① You:        "Write a test for <feature>."
                   ↓ write-case
② write-case: reads app.context.md + the feature's source
              → writes tests/cases/<feature>.md (status: pending-approval)
              → self-checks: e2e-ai-kit lint case  (must pass)
                   ↓
③ 👤 You:     review it. Does it test the right fields / edge cases?
              fill reviewer_checked + approved_by + approved_at,
              set status: approved
                   ↓ automation
④ automation: reads the APPROVED case + the framework slot (S1-S9) + the
              Tier boundary → writes spec + page object → runs to green
                   ↓
⑤ PR → merge
```

Notes:

- `write-case` traces every field/error message to a real source file
  (`source_docs: path:line`) — it won't invent them.
- `automation` **refuses** a case that isn't `approved` (or has gone stale)
  — it routes you back to approve first.

---

## 7. Daily use — change a test when requirements change

Decide *what* changed, then touch the matching source — never hand-edit a
generated file:

| What changed | Touch this | Skill | Then |
|---|---|---|---|
| A feature's test **content** (fields, validation, failure modes) | `tests/cases/<feature>.md` | `write-case` (update) | re-approve → `automation` regenerates the spec |
| **App structure** (routes, permissions, env, login) | `tests/app.context.md` probe sections | `exploration` (re-probe) | back to §6 to add/change the case |
| Just **UI drift** (selector/copy changed, intent unchanged) — spec went red in CI | nothing in the case | `maintenance` | see §8 |

---

## 8. Daily use — a test failed in CI

Trigger `maintenance` ("this spec is failing, classify and handle it"). It
sorts each failure into a Tier:

- **Tier 1** — selector drift, `waitForTimeout`→`expect`, copy update →
  auto-fixes, opens a PR (green CI can auto-merge).
- **Tier 2** — changed `expect()` values, route change, Page Object
  signature change → opens a **draft PR for your review** (3-day SLA).
- **Tier 3** — safety-critical path, or a regression that was green 24h ago
  → **does NOT touch the test; files a bug ticket** instead.

Tier authority lives only in
[`../skills/maintenance/SKILL.md`](../skills/maintenance/SKILL.md).

---

## 9. Two rules that never bend

1. **The human gate is mandatory.** `write-case` always produces
   `pending-approval` and never fills `approved_by`/`reviewer_checked`;
   `automation` refuses unapproved/stale cases. Approval is your job.
2. **Change the source of truth, not the generated artifact.** When a
   requirement moves a permission matrix / state machine / route, edit the
   source (e.g. `matrix.ts`, `app.context.md`) and let the tool regenerate
   — don't hand-edit the generated `.md` or spec.

---

## 10. Verification reference

Every machine check is one of these — skills run them as their self-check,
and you (or CI) can run them by hand:

```bash
e2e-ai-kit lint case          # tests/cases/*.md      vs contracts/case-schema.md
e2e-ai-kit lint app-context   # tests/app.context.md  vs contracts/app-context-schema.md
e2e-ai-kit lint slot          # .claude/skills/<fw>/SKILL.md vs contracts/slot-contract.md
# exit 0 = pass, 1 = a file violated the schema (prints the ruleId), 2 = usage error

npx playwright test           # run the generated specs (no AI involved)
```

## See also

- [`./WORKFLOW.md`](./WORKFLOW.md) — the four workflows, SLAs, governance
- [`./ONBOARDING.md`](./ONBOARDING.md) — taking the kit to a new project
- [`../contracts/`](../contracts/) — the three schemas the lints enforce
- [`../skills/`](../skills/) — the five skills' full instructions
