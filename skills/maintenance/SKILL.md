---
name: maintenance
description: Use when Playwright tests fail and you need to decide whether to auto-fix, propose a diff for human review, or file a bug. Activate after a `npx playwright test` run has produced failures — never blindly modify a failing test before this Skill has classified it.
---

# Maintenance Agent — Tier-classified failure handling

## When to use

- After `npx playwright test` produces ≥1 failure
- After a Playwright trace points at a specific selector / assertion / route mismatch
- After someone says "test X is failing, fix it" — **do not jump to a fix; classify first**

## When NOT to use

- For a flaky test (intermittent pass/fail without code change). That's a different problem class — investigate flakiness, do not run this Skill
- For a test that has never passed yet (still in Automation phase iterating to green)
- For type errors / compilation failures — those belong to ordinary code review

## Inputs the Agent needs

Before producing the report, gather these. If any is missing, **stop and ask**.

1. **The failure output**: full `--reporter=list` or `error-context.md` for each failing test
2. **The recent code diff**: `git diff <base>..HEAD` for files in the substrate's source directories (anything that could change UI / validators / routes)
3. **The test file path(s)** of every failing test (Tier-3 detection hinges on this)
4. **24-hour history**: was the test passing on `main` 24h ago? (`git log --since='24 hours ago' -- <test-file>` or CI history if available)

## The classification flow

Run this decision flow **once per failing test**. Don't batch — each failure gets its own row in the report.

```
                  ┌─────────────────────────────────────────┐
                  │ For each failing test:                  │
                  └───────────────────┬─────────────────────┘
                                      │
                ┌─────────────────────▼─────────────────────┐
                │  Is the test in tests/specs/safety-       │
                │  critical/ OR does it have a              │
                │  // @safety-critical header OR does its   │
                │  name contain (rbac|permission|billing|   │
                │  invoice|ledger|payment|refund|state-     │
                │  transition)?                             │
                └─────┬──────────────────────────────┬──────┘
                      │ yes                          │ no
                      ▼                              ▼
                ┌──────────────┐         ┌────────────────────────┐
                │ TIER 3       │         │  Was the test passing  │
                │ never modify │         │  on main 24h ago AND   │
                │ → file bug   │         │  the PR's code diff    │
                └──────────────┘         │  does NOT touch any    │
                                         │  file under test?      │
                                         └───┬────────────────┬───┘
                                             │ yes            │ no
                                             ▼                ▼
                                       ┌──────────────┐  ┌────────────────────┐
                                       │ TIER 3       │  │ Examine the diff   │
                                       │ regression   │  │ + failure messages │
                                       │ → file bug   │  └─────────┬──────────┘
                                       └──────────────┘            │
                                                                   ▼
                                         ┌─────────────────────────────────────┐
                                         │ Does the fix require any of:        │
                                         │   - changing expect(...) VALUES     │
                                         │   - new waitFor* gates              │
                                         │   - test navigation path changes    │
                                         │   - Page Object method signature    │
                                         │     changes (new params, new return)│
                                         │   - new fixtures or storageState    │
                                         │   - case-Markdown updates (cases/*) │
                                         └─────┬──────────────────────┬────────┘
                                               │ yes (any)            │ no
                                               ▼                      ▼
                                         ┌─────────────┐        ┌──────────────────┐
                                         │ TIER 2      │        │ TIER 1           │
                                         │ propose     │        │ auto-fix         │
                                         │ diff, await │        │ - text drift     │
                                         │ approval    │        │ - waitForTimeout │
                                         └─────────────┘        │   → expect()     │
                                                                │ - CSS → getByRole│
                                                                │ - copy update +  │
                                                                │   matching commit│
                                                                └──────────────────┘
```

## Tier 1 — auto-fix scope (and guardrails)

**Permitted automatic fixes**:
- Selector drift: `getByText('Save')` → `getByText('Save changes')`
- Replace `waitForTimeout` with `expect(...).toBeVisible()`
- Replace CSS / XPath selector with `getByRole` / `getByLabel`
- Update visible-text assertion when copy intentionally changed and
  `git log -S "<old text>"` shows the change happened in the PR under test

**Hard guardrail** — never change *any* of these as Tier 1:
- The numeric/string value inside `expect(x).toBe(VALUE)` or `toContainText(VALUE)` if `VALUE` represents a business invariant (price, count, sum, threshold)
- Anything that would shorten the assertion (e.g. removing a follow-up `.toBe(visible)` to "make it pass")

If the fix would require breaking a guardrail, **escalate to Tier 2**.

## Tier 2 — propose diff, await human approval

The Agent should produce:
- A unified diff (`git diff`-style) of the proposed change
- A one-paragraph "Why" — what in the code diff motivates this test change
- A one-paragraph "Risk" — what could go wrong if this fix masks a real bug

The Agent must NOT merge or push. Open a fix branch + write the diff to disk; let a human read it.

## Tier 3 — never modify the test, file a bug

Conditions:
- File path contains `safety-critical/`
- File has `// @safety-critical` header in the first 3 lines
- Test name (full path including describe) contains any of:
  `rbac`, `permission`, `billing`, `invoice`, `ledger`, `payment`,
  `refund`, `state-transition`
- The test was passing on `main` 24h ago and the PR under test does not
  touch the file being tested (suspect real regression)

Action: produce a `bug-report.md` with:
- Title (concise, includes the safety-critical surface)
- Reproduction: the failing assertion, the validator/code line, the
  expected vs actual values
- Affected files (test file + production source file)
- Recommended owner team (look up via `git blame` or CODEOWNERS)
- DO NOT propose a test-side fix in this report

If integration is available, also create the bug ticket via Jira/Linear MCP.

## Iteration budget

- **3 iterations max** per test. If the proposed Tier 1 fix doesn't make
  the test pass after applying + re-running, stop and re-classify as Tier 2
- Total wall-clock budget across all failing tests: 15 minutes. If
  exceeded, stop and ask the human

## Output format — Markdown report

Produce exactly one Markdown file at
`test-results/maintenance-report-<YYYY-MM-DD-HHMM>.md` with this shape:

```markdown
# Maintenance Report — <YYYY-MM-DD HH:MM>

## Summary
- N failing tests classified
- T1 (auto): X | T2 (review): Y | T3 (bug): Z
- Wall-clock spent: N seconds

## Per-failure

### 1. <failing test name> — TIER <N>
**Path**: `tests/specs/...`
**Failure**: <one-line summary of error>
**Code diff signal**: <line of `git diff` that explains the failure, or "none found">

**Classification reasoning**: <one paragraph>

**Recommended action** (Tier 1):
\`\`\`diff
<unified diff of proposed change>
\`\`\`

**Recommended action** (Tier 2):
- Proposed change in: `<file>`
- Diff written to: `test-results/proposed-fixes/<n>-<short>.patch`
- Why: <one paragraph>
- Risk: <one paragraph>
- Reviewer: <git blame oldest-author OR CODEOWNERS lookup>

**Recommended action** (Tier 3):
- DO NOT modify the test
- Bug report written to: `test-results/bug-reports/<n>-<short>.md`
- Suspected production-code regression in: `<file>:<line>`

---
(repeat per failure)
```

## What NOT to do

- Do not modify any test file directly during this Skill — only propose
- Do not push to remote (the Agent doesn't have authorization for that)
- Do not file a bug for a test that's been failing since it was written
  (that's an Automation problem, not a regression)
- Do not assume a Tier 1 fix is safe just because Playwright accepts the
  new selector — verify the test still tests what it was meant to test
  (re-read the related `tests/cases/<feature>.md` if one exists)

## Examples (from the first substrate, mcd-website)

| Failure shape | Tier | Rationale |
|---|---|---|
| `EC1` regex doesn't match because validator wording changed from "cannot be blank" to "is required" | 1 | Text drift, with a matching commit in this PR that touches the validator source. Update the regex. |
| `Happy Path` fails because a new required field was added (`Notes` is now `is required`) | 2 | Page Object needs a new method, test case markdown needs updating to reflect the new required field. Human reviewer must confirm the new field is intentional. |
| `coupon-pricing.spec.ts` (under `tests/specs/safety-critical/`) fails because the `< StorefrontPrice` validator was removed | 3 | The path is safety-critical; the broken assertion is a business invariant (pricing). File a bug, do not modify the test. |
