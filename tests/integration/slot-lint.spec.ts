import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { test, expect } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, '..', '..', 'bin', 'e2e-ai-kit.js');
const FIXTURE_DIR = resolve(__dirname, '..', 'fixtures', 'slot');

function runCli(args: string[]): { code: number; stdout: string; stderr: string } {
  const out = spawnSync(BIN, args, { encoding: 'utf8' });
  return { code: out.status ?? -1, stdout: out.stdout, stderr: out.stderr };
}

test('CLI: lint slot good-slot → exit 0', () => {
  const result = runCli(['lint', 'slot', resolve(FIXTURE_DIR, 'good-slot', 'SKILL.md')]);
  expect(result.code, `stdout=${result.stdout}`).toBe(0);
});

test('CLI: bad-slot-missing-section → multiple slot.body.section_missing', () => {
  const result = runCli(['lint', 'slot', resolve(FIXTURE_DIR, 'bad-slot-missing-section', 'SKILL.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('slot.body.section_missing');
  expect(result.stdout).toContain('Form input strategy');
  expect(result.stdout).toContain('Cost discipline');
});

test('CLI: bad-slot-tier-defined → slot.forbidden.tier_classification', () => {
  const result = runCli(['lint', 'slot', resolve(FIXTURE_DIR, 'bad-slot-tier-defined', 'SKILL.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('slot.forbidden.tier_classification');
});

test('CLI: bad-slot-business-term (with sibling .e2e-ai-kit.json) → slot.forbidden.substrate_business_term', () => {
  const result = runCli(['lint', 'slot', resolve(FIXTURE_DIR, 'bad-slot-business-term', 'SKILL.md')]);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain('slot.forbidden.substrate_business_term');
  expect(result.stdout).toContain('MMR');
});
