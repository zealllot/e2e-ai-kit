import { readFileSync } from 'node:fs';

import { parseFrontmatter, FrontmatterParseError } from '../parser/frontmatter.ts';
import { walkSections } from '../parser/section-walker.ts';
import {
  getCaseTypeSpec,
  isKnownCaseType,
  CASE_TYPES,
  UnknownCaseTypeError,
} from '../registry/case-types.ts';

export interface LintError {
  file: string;
  line?: number | undefined;
  section?: string | undefined;
  ruleId: string;
  message: string;
}

export interface LintResult {
  ok: boolean;
  errors: LintError[];
  warnings: LintError[];
}

const ALWAYS_REQUIRED = ['feature', 'case_type', 'status'] as const;
const VALID_STATUSES = ['pending-approval', 'approved'] as const;

/**
 * Lint a single case `.md` file against the case-type registry. The
 * returned `LintResult` is purely descriptive; the CLI decides exit
 * code from `result.ok`.
 */
export function lintCaseFile(filepath: string): LintResult {
  const errors: LintError[] = [];
  const warnings: LintError[] = [];

  let raw: string;
  try {
    raw = readFileSync(filepath, 'utf8');
  } catch (e) {
    errors.push({
      file: filepath,
      ruleId: 'case.file.read_failed',
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
        ruleId: 'case.frontmatter.invalid_yaml',
        message: e.message,
      });
      return { ok: false, errors, warnings };
    }
    throw e;
  }

  const { meta, body } = parsed;

  // (1) Required-on-every-case frontmatter keys.
  for (const key of ALWAYS_REQUIRED) {
    if (meta[key] === undefined || meta[key] === null || meta[key] === '') {
      errors.push({
        file: filepath,
        ruleId: `case.frontmatter.${key}_required`,
        message: `required frontmatter key '${key}' is missing or empty`,
      });
    }
  }
  if (errors.length > 0) return { ok: false, errors, warnings };

  const status = String(meta['status']);
  if (!(VALID_STATUSES as ReadonlyArray<string>).includes(status)) {
    errors.push({
      file: filepath,
      ruleId: 'case.frontmatter.status_invalid',
      message: `status must be one of ${VALID_STATUSES.join(', ')}; got '${status}'`,
    });
  }

  // (2) case_type must be in the closed enum and have a registered spec.
  const caseType = String(meta['case_type']);
  if (!isKnownCaseType(caseType)) {
    errors.push({
      file: filepath,
      ruleId: 'case.frontmatter.case_type_unknown',
      message: `case_type '${caseType}' is not in the closed enum (${CASE_TYPES.join(', ')})`,
    });
    return { ok: false, errors, warnings };
  }

  let spec;
  try {
    spec = getCaseTypeSpec(caseType);
  } catch (e) {
    if (e instanceof UnknownCaseTypeError) {
      errors.push({
        file: filepath,
        ruleId: 'case.frontmatter.case_type_not_yet_registered',
        message: `case_type '${caseType}' is in the closed enum but not yet registered in this kit version`,
      });
      return { ok: false, errors, warnings };
    }
    throw e;
  }

  // (3) requiredFrontmatter (per case_type spec).
  for (const key of spec.requiredFrontmatter) {
    if (meta[key] === undefined || meta[key] === null || meta[key] === '') {
      errors.push({
        file: filepath,
        ruleId: `case.frontmatter.${key}_required`,
        message: `frontmatter key '${key}' is required for case_type '${caseType}'`,
      });
    }
  }

  // (4) forbiddenFrontmatter (per case_type spec — Slice 1: empty for happy-path).
  for (const key of spec.forbiddenFrontmatter) {
    if (meta[key] !== undefined) {
      errors.push({
        file: filepath,
        ruleId: `case.frontmatter.${key}_forbidden`,
        message: `frontmatter key '${key}' is forbidden for case_type '${caseType}'`,
      });
    }
  }

  // (5) requiredOnApproved (when status: approved).
  if (status === 'approved') {
    for (const key of spec.requiredOnApproved) {
      const value = meta[key];
      if (value === undefined || value === null) {
        errors.push({
          file: filepath,
          ruleId: `case.frontmatter.${key}_required`,
          message: `frontmatter key '${key}' is required when status is 'approved'`,
        });
      } else if (key === 'reviewer_checked') {
        if (!Array.isArray(value) || value.length === 0) {
          errors.push({
            file: filepath,
            ruleId: 'case.frontmatter.reviewer_checked_non_empty',
            message: `'reviewer_checked' must be a non-empty array when status is 'approved'`,
          });
        } else {
          for (const item of value) {
            if (!spec.reviewerCheckedEnum.includes(String(item))) {
              errors.push({
                file: filepath,
                ruleId: 'case.frontmatter.reviewer_checked_invalid_value',
                message: `'reviewer_checked' contains '${item}', which is not in the allowed enum for case_type '${caseType}': ${spec.reviewerCheckedEnum.join(', ')}`,
              });
            }
          }
        }
      } else if (typeof value === 'string' && value.length === 0) {
        errors.push({
          file: filepath,
          ruleId: `case.frontmatter.${key}_required`,
          message: `frontmatter key '${key}' must be a non-empty string when status is 'approved'`,
        });
      }
    }
  }

  // (6) requiredBodySections (per case_type spec).
  const sectionTitles = new Set(walkSections(body).map((s) => s.title));
  for (const required of spec.requiredBodySections) {
    if (!sectionTitles.has(required)) {
      errors.push({
        file: filepath,
        ruleId: `case.body.section_missing`,
        section: required,
        message: `required body section '## ${required}' is missing`,
      });
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
