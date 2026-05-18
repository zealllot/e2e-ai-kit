/**
 * Case-type registry. Single source of truth for what each case_type
 * requires in frontmatter, body sections, and `reviewer_checked` enum.
 *
 * The five-element closed enum matches CONTEXT.md § Case (the artifact).
 * Slice 1 (this commit) registers only `happy-path` in full; the other
 * four kinds are listed for the closed-enum check but throw
 * UnknownCaseTypeError on a full lookup so Slice 2 (kit issue #3) is
 * the only PR that can register them.
 */

export const CASE_TYPES = [
  'happy-path',
  'state-machine',
  'reference',
  'family',
  'save-flow',
] as const;

export type CaseType = (typeof CASE_TYPES)[number];

export interface CaseTypeSpec {
  caseType: CaseType;
  /** Frontmatter keys that MUST be present regardless of status. */
  requiredFrontmatter: ReadonlyArray<string>;
  /** Additional frontmatter keys that MUST be present when status: approved. */
  requiredOnApproved: ReadonlyArray<string>;
  /**
   * Frontmatter keys forbidden for this case_type. Slice 1 only uses
   * this for `reference` (which must not declare `lives_in`); empty
   * here for `happy-path`.
   */
  forbiddenFrontmatter: ReadonlyArray<string>;
  /** Required H2 section titles in the body. */
  requiredBodySections: ReadonlyArray<string>;
  /** Allowed values inside the `reviewer_checked` array. */
  reviewerCheckedEnum: ReadonlyArray<string>;
}

export class UnknownCaseTypeError extends Error {
  constructor(public readonly caseType: string) {
    super(`Unknown or not-yet-registered case_type: '${caseType}'`);
    this.name = 'UnknownCaseTypeError';
  }
}

const HAPPY_PATH: CaseTypeSpec = {
  caseType: 'happy-path',
  requiredFrontmatter: [
    'feature',
    'case_type',
    'status',
    'generated_by',
    'generated_at',
    'source_docs',
    'classification',
    'tier_ceiling',
    'lives_in',
    'storage_states_required',
  ],
  requiredOnApproved: ['approved_by', 'approved_at', 'reviewer_checked'],
  forbiddenFrontmatter: [],
  requiredBodySections: ['Required fields', 'Tests'],
  reviewerCheckedEnum: [
    'validators_verified',
    'edge_cases_listed',
    'permission_scenarios_complete',
  ],
};

const REGISTRY: Partial<Record<CaseType, CaseTypeSpec>> = {
  'happy-path': HAPPY_PATH,
};

export function getCaseTypeSpec(caseType: string): CaseTypeSpec {
  if (!isKnownCaseType(caseType)) {
    throw new UnknownCaseTypeError(caseType);
  }
  const spec = REGISTRY[caseType];
  if (!spec) {
    throw new UnknownCaseTypeError(`${caseType} (in closed enum but not yet implemented; awaiting Slice 2)`);
  }
  return spec;
}

export function isKnownCaseType(value: string): value is CaseType {
  return (CASE_TYPES as ReadonlyArray<string>).includes(value);
}

/** Return the closed five-element enum of case_type values. */
export function listCaseTypes(): ReadonlyArray<CaseType> {
  return CASE_TYPES;
}
