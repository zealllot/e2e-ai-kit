import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { test, expect } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, '..', '..', 'bin', 'e2e-ai-kit.js');
const FIXTURE_DIR = resolve(__dirname, '..', 'fixtures', 'cases');

function runCli(args: string[]): { code: number; stdout: string; stderr: string } {
  const out = spawnSync(BIN, args, { encoding: 'utf8' });
  return { code: out.status ?? -1, stdout: out.stdout, stderr: out.stderr };
}

test('CLI: lint good-state-machine.md → exit 0', () => {
  const result = runCli(['lint', 'case', resolve(FIXTURE_DIR, 'good-state-machine.md')]);
  expect(result.code, `stdout=${result.stdout}`).toBe(0);
});

test('CLI: lint bad-state-machine-missing-section.md → case.body.section_missing for State machine', () => {
  const result = runCli(['lint', 'case', resolve(FIXTURE_DIR, 'bad-state-machine-missing-section.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('case.body.section_missing');
  expect(result.stdout).toContain('State machine');
});

test('CLI: lint good-reference.md → exit 0', () => {
  const result = runCli(['lint', 'case', resolve(FIXTURE_DIR, 'good-reference.md')]);
  expect(result.code, `stdout=${result.stdout}`).toBe(0);
});

test('CLI: lint bad-reference-declares-lives-in.md → case.frontmatter.lives_in_forbidden', () => {
  const result = runCli(['lint', 'case', resolve(FIXTURE_DIR, 'bad-reference-declares-lives-in.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('case.frontmatter.lives_in_forbidden');
});

test('CLI: lint good-family.md → exit 0', () => {
  const result = runCli(['lint', 'case', resolve(FIXTURE_DIR, 'good-family.md')]);
  expect(result.code, `stdout=${result.stdout}`).toBe(0);
});

test('CLI: lint bad-family-invalid-reviewer-check.md → case.frontmatter.reviewer_checked_invalid_value', () => {
  const result = runCli(['lint', 'case', resolve(FIXTURE_DIR, 'bad-family-invalid-reviewer-check.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('case.frontmatter.reviewer_checked_invalid_value');
});

test('CLI: lint good-save-flow.md → exit 0', () => {
  const result = runCli(['lint', 'case', resolve(FIXTURE_DIR, 'good-save-flow.md')]);
  expect(result.code, `stdout=${result.stdout}`).toBe(0);
});

test('CLI: lint bad-save-flow-missing-failure-modes.md → case.body.section_missing for Failure modes', () => {
  const result = runCli(['lint', 'case', resolve(FIXTURE_DIR, 'bad-save-flow-missing-failure-modes.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('case.body.section_missing');
  expect(result.stdout).toContain('Failure modes');
});
