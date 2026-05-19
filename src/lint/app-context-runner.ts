import { readFileSync } from 'node:fs';

import { parseFrontmatter, FrontmatterParseError } from '../parser/frontmatter.ts';
import { normalizeSectionTitle, walkSections, type Section } from '../parser/section-walker.ts';
import {
  ALWAYS_REQUIRED_FRONTMATTER,
  APP_CONTEXT_SECTIONS,
  findSection,
  isValidSource,
  listRequiredSectionTitles,
  stripOrdinalPrefix,
} from '../registry/app-context-sections.ts';
import type { LintError, LintResult } from './runner.ts';

/**
 * Lint a substrate's `tests/app.context.md` against the kit's
 * Application Context Document schema. Returns a structured LintResult;
 * the CLI decides exit code from `result.ok`.
 */
export function lintAppContextFile(filepath: string): LintResult {
  const errors: LintError[] = [];
  const warnings: LintError[] = [];

  let raw: string;
  try {
    raw = readFileSync(filepath, 'utf8');
  } catch (e) {
    errors.push({
      file: filepath,
      ruleId: 'app_context.file.read_failed',
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
        ruleId: 'app_context.frontmatter.invalid_yaml',
        message: e.message,
      });
      return { ok: false, errors, warnings };
    }
    throw e;
  }

  const { meta, body } = parsed;

  // (1) Always-required frontmatter keys.
  for (const key of ALWAYS_REQUIRED_FRONTMATTER) {
    if (meta[key] === undefined || meta[key] === null || meta[key] === '') {
      errors.push({
        file: filepath,
        ruleId: `app_context.frontmatter.${key}_required`,
        message: `required frontmatter key '${key}' is missing or empty`,
      });
    }
  }

  // (2) Required sections present.
  const sections = walkSections(body);
  // Map (ordinal-prefix-stripped + parenthesized-suffix-stripped) → Section
  const present = new Map<string, Section>();
  for (const s of sections) {
    present.set(normalizeSectionTitle(stripOrdinalPrefix(s.title)), s);
  }

  for (const title of listRequiredSectionTitles()) {
    if (!present.has(title)) {
      errors.push({
        file: filepath,
        ruleId: 'app_context.body.section_missing',
        section: title,
        message: `required section '## ${title}' is missing`,
      });
    }
  }

  // (3) Each known section's metadata.
  for (const [title, section] of present) {
    const spec = findSection(title);
    if (!spec) continue; // unknown section — allowed (might be the H1 title or extras)

    const source = section.metadata['source'];
    if (source === undefined || source === '') {
      errors.push({
        file: filepath,
        ruleId: 'app_context.section.source_marker_missing',
        section: title,
        message: `section '## ${title}' is missing its '<!-- source: ... -->' marker`,
      });
      continue;
    }
    if (!isValidSource(source)) {
      errors.push({
        file: filepath,
        ruleId: 'app_context.section.source_invalid',
        section: title,
        message: `section '## ${title}' has unrecognized source '${source}'; valid: human, probe, probe+human, agent`,
      });
      continue;
    }
    if (source !== spec.source) {
      errors.push({
        file: filepath,
        ruleId: 'app_context.section.source_mismatch',
        section: title,
        message: `section '## ${title}' declares source='${source}' but the schema specifies '${spec.source}'`,
      });
    }

    if (spec.requireHumanVerification && source === 'probe+human') {
      const verifiedAt = section.metadata['last_verified_by_human'];
      if (verifiedAt === undefined || verifiedAt === '') {
        errors.push({
          file: filepath,
          ruleId: 'app_context.section.last_verified_by_human_required',
          section: title,
          message: `section '## ${title}' uses source: probe+human but does not declare 'last_verified_by_human'`,
        });
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
