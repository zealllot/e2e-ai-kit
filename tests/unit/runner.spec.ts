import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { test, expect } from '@playwright/test';

import { lintCaseFile } from '../../src/lint/runner.ts';

function makeTempFile(content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'e2e-ai-kit-test-'));
  const path = join(dir, 'case.md');
  writeFileSync(path, content);
  return path;
}

function fixtureGoodHappyPath(): string {
  return `---
feature: my-feature
case_type: happy-path
status: approved
generated_by: claude-opus-4-7
generated_at: 2026-05-19
source_docs:
  - models/foo.go
admin_routes:
  - /admin/foo
classification: regular
tier_ceiling: 2
lives_in: tests/specs/my-feature.spec.ts
storage_states_required:
  - tests/auth/developer.json
approved_by: zealot@theplant.jp
approved_at: 2026-05-19
reviewer_checked:
  - validators_verified
  - edge_cases_listed
---

# My Feature — Create

## Required fields

| Field | Source | Notes |
|---|---|---|
| Title | shared validator | required |

## Tests

### HP: Happy Path

1. Open /admin/foo/new
2. Fill Title
3. Submit
`;
}

test('lintCaseFile: a well-formed approved happy-path case lints ok', () => {
  const path = makeTempFile(fixtureGoodHappyPath());
  try {
    const result = lintCaseFile(path);
    expect(result.errors, JSON.stringify(result.errors, null, 2)).toEqual([]);
    expect(result.ok).toBe(true);
  } finally {
    rmSync(path, { force: true });
  }
});

test('lintCaseFile: approved case missing approved_by → ruleId case.frontmatter.approved_by_required', () => {
  const bad = fixtureGoodHappyPath().replace(/approved_by: zealot@theplant\.jp\n/, '');
  const path = makeTempFile(bad);
  try {
    const result = lintCaseFile(path);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.ruleId === 'case.frontmatter.approved_by_required')).toBe(true);
  } finally {
    rmSync(path, { force: true });
  }
});

test('lintCaseFile: approved case with empty reviewer_checked → reviewer_checked_non_empty', () => {
  const bad = fixtureGoodHappyPath().replace(/reviewer_checked:\n  - validators_verified\n  - edge_cases_listed\n/, 'reviewer_checked: []\n');
  const path = makeTempFile(bad);
  try {
    const result = lintCaseFile(path);
    expect(result.errors.some((e) => e.ruleId === 'case.frontmatter.reviewer_checked_non_empty')).toBe(true);
  } finally {
    rmSync(path, { force: true });
  }
});

test('lintCaseFile: reviewer_checked value outside enum → reviewer_checked_invalid_value', () => {
  const bad = fixtureGoodHappyPath().replace(/- validators_verified/, '- not_a_real_check');
  const path = makeTempFile(bad);
  try {
    const result = lintCaseFile(path);
    expect(result.errors.some((e) => e.ruleId === 'case.frontmatter.reviewer_checked_invalid_value')).toBe(true);
  } finally {
    rmSync(path, { force: true });
  }
});

test('lintCaseFile: case_type not in closed enum → case_type_unknown', () => {
  const bad = fixtureGoodHappyPath().replace(/case_type: happy-path/, 'case_type: random-thing');
  const path = makeTempFile(bad);
  try {
    const result = lintCaseFile(path);
    expect(result.errors.some((e) => e.ruleId === 'case.frontmatter.case_type_unknown')).toBe(true);
  } finally {
    rmSync(path, { force: true });
  }
});

// Slice 2 (kit issue #3) registered all five case_type values, so the
// "case_type_not_yet_registered" ruleId is currently unreachable. The
// ruleId stays in the runner as a safety net for any future case_type
// that lands in the closed enum but ships unregistered.

test('lintCaseFile: missing required body section → case.body.section_missing', () => {
  const bad = fixtureGoodHappyPath().replace(/## Tests[\s\S]*$/, '');
  const path = makeTempFile(bad);
  try {
    const result = lintCaseFile(path);
    expect(result.errors.some((e) => e.ruleId === 'case.body.section_missing' && e.section === 'Tests')).toBe(true);
  } finally {
    rmSync(path, { force: true });
  }
});

test('lintCaseFile: pending-approval case does NOT require approved_by', () => {
  const pending = fixtureGoodHappyPath()
    .replace(/status: approved/, 'status: pending-approval')
    .replace(/approved_by: zealot@theplant\.jp\n/, '')
    .replace(/approved_at: 2026-05-19\n/, '')
    .replace(/reviewer_checked:\n  - validators_verified\n  - edge_cases_listed\n/, '');
  const path = makeTempFile(pending);
  try {
    const result = lintCaseFile(path);
    expect(result.errors, JSON.stringify(result.errors, null, 2)).toEqual([]);
    expect(result.ok).toBe(true);
  } finally {
    rmSync(path, { force: true });
  }
});

test('lintCaseFile: invalid status value → status_invalid', () => {
  const bad = fixtureGoodHappyPath().replace(/status: approved/, 'status: in-review');
  const path = makeTempFile(bad);
  try {
    const result = lintCaseFile(path);
    expect(result.errors.some((e) => e.ruleId === 'case.frontmatter.status_invalid')).toBe(true);
  } finally {
    rmSync(path, { force: true });
  }
});

test('lintCaseFile: file not found → ruleId case.file.read_failed', () => {
  const result = lintCaseFile('/tmp/nonexistent/definitely-not-there.md');
  expect(result.ok).toBe(false);
  expect(result.errors[0]?.ruleId).toBe('case.file.read_failed');
});

test('lintCaseFile: malformed YAML in frontmatter → case.frontmatter.invalid_yaml', () => {
  const path = makeTempFile('---\n{ broken: yaml }}}\n---\n');
  try {
    const result = lintCaseFile(path);
    expect(result.errors.some((e) => e.ruleId === 'case.frontmatter.invalid_yaml')).toBe(true);
  } finally {
    rmSync(path, { force: true });
  }
});
