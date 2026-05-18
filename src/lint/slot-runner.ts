import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { parseFrontmatter, FrontmatterParseError } from '../parser/frontmatter.ts';
import { walkSections } from '../parser/section-walker.ts';
import {
  listRequiredSlotTitles,
  SLOT_REQUIRED_FRONTMATTER,
} from '../registry/slot-sections.ts';
import type { LintError, LintResult } from './runner.ts';

/**
 * Lint a substrate's framework slot (`.claude/skills/<framework>/SKILL.md`)
 * against the slot contract. Three categories of violation:
 *
 *   1. Required frontmatter key missing
 *   2. Required S1-S9 section missing
 *   3. Forbidden content present:
 *      a. Tier 1/2/3 classification defined inline (must reference the
 *         maintenance skill instead)
 *      b. Substrate business terms (read from `.e2e-ai-kit.json` at
 *         the substrate root) — these are framework-slot leaks
 */
export function lintSlotFile(filepath: string): LintResult {
  const errors: LintError[] = [];
  const warnings: LintError[] = [];

  let raw: string;
  try {
    raw = readFileSync(filepath, 'utf8');
  } catch (e) {
    errors.push({
      file: filepath,
      ruleId: 'slot.file.read_failed',
      message: `cannot read file: ${e instanceof Error ? e.message : String(e)}`,
    });
    return { ok: false, errors, warnings };
  }

  let parsed;
  try {
    parsed = parseFrontmatter(raw);
  } catch (e) {
    if (e instanceof FrontmatterParseError) {
      errors.push({
        file: filepath,
        ruleId: 'slot.frontmatter.invalid_yaml',
        message: e.message,
      });
      return { ok: false, errors, warnings };
    }
    throw e;
  }

  const { meta, body } = parsed;

  // (1) Required frontmatter keys.
  for (const key of SLOT_REQUIRED_FRONTMATTER) {
    if (meta[key] === undefined || meta[key] === null || meta[key] === '') {
      errors.push({
        file: filepath,
        ruleId: `slot.frontmatter.${key}_required`,
        message: `required frontmatter key '${key}' is missing or empty`,
      });
    }
  }

  // (2) Required S1-S9 section titles.
  const titles = new Set(walkSections(body).map((s) => s.title));
  for (const title of listRequiredSlotTitles()) {
    if (!titles.has(title)) {
      errors.push({
        file: filepath,
        ruleId: 'slot.body.section_missing',
        section: title,
        message: `required slot section '## ${title}' is missing (the slot's heading text must match the canonical title verbatim)`,
      });
    }
  }

  // (3a) Forbidden: inline Tier 1/2/3 classification.
  // Heuristic: a heading or em-dash-prefixed line that DEFINES a tier
  // (e.g. `### Tier 1 — Auto-fix, open PR`) is a violation. A passing
  // mention or reference link is allowed.
  const TIER_DEFINITION_RE = /(?:^#{1,6}\s+Tier\s+[1-3]\b|\bTier\s+[1-3]\s*[—–-]\s+\S)/gm;
  const tierMatches = body.match(TIER_DEFINITION_RE);
  if (tierMatches && tierMatches.length >= 2) {
    errors.push({
      file: filepath,
      ruleId: 'slot.forbidden.tier_classification',
      message: `slot defines Tier 1/2/3 classification inline (${tierMatches.length} occurrences). This is owned by skills/maintenance/SKILL.md in the kit; the slot must reference, not duplicate.`,
    });
  }

  // (3b) Forbidden: substrate business terms.
  const config = loadSubstrateConfig(filepath);
  if (config && Array.isArray(config.substrate_business_terms)) {
    for (const term of config.substrate_business_terms) {
      if (typeof term !== 'string' || term.length === 0) continue;
      const re = new RegExp(`\\b${escapeRegex(term)}\\b`);
      if (re.test(body)) {
        errors.push({
          file: filepath,
          ruleId: 'slot.forbidden.substrate_business_term',
          message: `slot mentions substrate-business term '${term}' (configured in .e2e-ai-kit.json). Substrate-specific content belongs in tests/app.context.md § Known quirks, not in the framework slot.`,
        });
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

interface SubstrateConfig {
  substrate_business_terms?: ReadonlyArray<string>;
}

/**
 * Walk up from the linted file's directory to find a `.e2e-ai-kit.json`
 * configuration file. Stops at the filesystem root or after 10
 * directories (whichever first). Returns null if not found or if the
 * file is malformed (silent skip — the check is opt-in).
 */
function loadSubstrateConfig(filepath: string): SubstrateConfig | null {
  let dir = dirname(resolve(filepath));
  for (let depth = 0; depth < 12; depth += 1) {
    const candidate = resolve(dir, '.e2e-ai-kit.json');
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      try {
        return JSON.parse(readFileSync(candidate, 'utf8')) as SubstrateConfig;
      } catch {
        return null;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
