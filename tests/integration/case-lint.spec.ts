import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { test, expect } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, '..', '..', 'bin', 'e2e-ai-kit.js');
const FIXTURE_DIR = resolve(__dirname, '..', 'fixtures', 'cases');

function runCli(args: string[], env: NodeJS.ProcessEnv = {}): { code: number; stdout: string; stderr: string } {
  // Spawn the bin directly so the shebang `#!/usr/bin/env -S npx tsx`
  // takes effect — invoking via `node BIN` would skip the shebang and
  // fail on the .ts import.
  const out = spawnSync(BIN, args, {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  return { code: out.status ?? -1, stdout: out.stdout, stderr: out.stderr };
}

test('CLI: lint case on good-happy-path.md → exit 0', () => {
  const result = runCli(['lint', 'case', resolve(FIXTURE_DIR, 'good-happy-path.md')]);
  expect(result.code, `stdout=${result.stdout}\nstderr=${result.stderr}`).toBe(0);
  expect(result.stdout).toMatch(/ok/);
});

test('CLI: lint case on bad-missing-approved-by.md → exit 1 + reports case.frontmatter.approved_by_required', () => {
  const result = runCli(['lint', 'case', resolve(FIXTURE_DIR, 'bad-missing-approved-by.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('case.frontmatter.approved_by_required');
});

test('CLI: GITHUB_ACTIONS=true triggers ::error:: annotation format', () => {
  const result = runCli(
    ['lint', 'case', resolve(FIXTURE_DIR, 'bad-missing-approved-by.md')],
    { GITHUB_ACTIONS: 'true' },
  );
  expect(result.code).toBe(1);
  expect(result.stdout).toMatch(/^::error file=.*::/m);
  expect(result.stdout).toContain('case.frontmatter.approved_by_required');
});

test('CLI: no args → exit 2 with usage', () => {
  const result = runCli([]);
  expect(result.code).toBe(2);
  expect(result.stdout).toContain('usage');
});

test('CLI: unknown lint kind → exit 2', () => {
  const result = runCli(['lint', 'random-thing']);
  expect(result.code).toBe(2);
});

test('CLI: unknown subcommand → exit 2', () => {
  const result = runCli(['format', 'case']);
  expect(result.code).toBe(2);
});
