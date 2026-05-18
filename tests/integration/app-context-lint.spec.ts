import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { test, expect } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, '..', '..', 'bin', 'e2e-ai-kit.js');
const FIXTURE_DIR = resolve(__dirname, '..', 'fixtures', 'app-context');

function runCli(args: string[]): { code: number; stdout: string; stderr: string } {
  const out = spawnSync(BIN, args, { encoding: 'utf8' });
  return { code: out.status ?? -1, stdout: out.stdout, stderr: out.stderr };
}

test('CLI: lint app-context good fixture → exit 0', () => {
  const result = runCli(['lint', 'app-context', resolve(FIXTURE_DIR, 'good-app-context.md')]);
  expect(result.code, `stdout=${result.stdout}`).toBe(0);
});

test('CLI: bad-app-context-missing-section.md → app_context.body.section_missing', () => {
  const result = runCli(['lint', 'app-context', resolve(FIXTURE_DIR, 'bad-app-context-missing-section.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('app_context.body.section_missing');
  expect(result.stdout).toContain('Known quirks');
  expect(result.stdout).toContain('Out of scope');
});

test('CLI: bad-app-context-missing-source-marker.md → app_context.section.source_marker_missing', () => {
  const result = runCli(['lint', 'app-context', resolve(FIXTURE_DIR, 'bad-app-context-missing-source-marker.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('app_context.section.source_marker_missing');
  expect(result.stdout).toContain('Product summary');
});

test('CLI: bad-app-context-missing-human-verification.md → last_verified_by_human_required', () => {
  const result = runCli(['lint', 'app-context', resolve(FIXTURE_DIR, 'bad-app-context-missing-human-verification.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('app_context.section.last_verified_by_human_required');
  expect(result.stdout).toContain('Auth strategy');
});

test('CLI: app-context without --files uses default tests/app.context.md (or fails with usage if absent)', () => {
  // From the kit repo root, no tests/app.context.md exists. Expect usage-style failure.
  const result = runCli(['lint', 'app-context']);
  expect(result.code).toBe(2);
  expect(result.stdout).toContain('app.context.md');
});
