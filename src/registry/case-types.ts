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

const RUNNABLE_REQUIRED_FRONTMATTER = [
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
] as const;

const REFERENCE_REQUIRED_FRONTMATTER = [
  'feature',
  'case_type',
  'status',
  'generated_by',
  'generated_at',
  'source_docs',
] as const;

const REQUIRED_ON_APPROVED = ['approved_by', 'approved_at', 'reviewer_checked'] as const;

const HAPPY_PATH: CaseTypeSpec = {
  caseType: 'happy-path',
  requiredFrontmatter: RUNNABLE_REQUIRED_FRONTMATTER,
  requiredOnApproved: REQUIRED_ON_APPROVED,
  forbiddenFrontmatter: [],
  requiredBodySections: ['Required fields', 'Tests'],
  reviewerCheckedEnum: [
    'validators_verified',
    'edge_cases_listed',
    'permission_scenarios_complete',
  ],
};

const STATE_MACHINE: CaseTypeSpec = {
  caseType: 'state-machine',
  requiredFrontmatter: RUNNABLE_REQUIRED_FRONTMATTER,
  requiredOnApproved: REQUIRED_ON_APPROVED,
  forbiddenFrontmatter: [],
  requiredBodySections: ['State machine', 'Roles & access', 'Tests'],
  reviewerCheckedEnum: [
    'validators_verified',
    'edge_cases_listed',
    'permission_scenarios_complete',
    'state_transitions_verified',
    'role_x_state_matrix_verified',
  ],
};

const REFERENCE: CaseTypeSpec = {
  caseType: 'reference',
  requiredFrontmatter: REFERENCE_REQUIRED_FRONTMATTER,
  requiredOnApproved: REQUIRED_ON_APPROVED,
  // reference cases are NOT runnable; declaring lives_in or
  // storage_states_required would mislead the Automation Agent.
  forbiddenFrontmatter: ['lives_in', 'storage_states_required'],
  requiredBodySections: ['Pattern'],
  reviewerCheckedEnum: [
    'pattern_accurate',
    'related_runnable_cases_enumerated',
  ],
};

const FAMILY: CaseTypeSpec = {
  caseType: 'family',
  requiredFrontmatter: RUNNABLE_REQUIRED_FRONTMATTER,
  requiredOnApproved: REQUIRED_ON_APPROVED,
  forbiddenFrontmatter: [],
  requiredBodySections: ['Family members'],
  reviewerCheckedEnum: [
    'family_members_enumerated',
    'shared_assertions_identified',
    'per_member_specifics_noted',
  ],
};

const SAVE_FLOW: CaseTypeSpec = {
  caseType: 'save-flow',
  requiredFrontmatter: RUNNABLE_REQUIRED_FRONTMATTER,
  requiredOnApproved: REQUIRED_ON_APPROVED,
  forbiddenFrontmatter: [],
  requiredBodySections: ['Form preconditions', 'Save assertion', 'Failure modes'],
  reviewerCheckedEnum: [
    'form_preconditions_complete',
    'save_assertion_specific',
    'failure_modes_enumerated',
  ],
};

const REGISTRY: Partial<Record<CaseType, CaseTypeSpec>> = {
  'happy-path': HAPPY_PATH,
  'state-machine': STATE_MACHINE,
  reference: REFERENCE,
  family: FAMILY,
  'save-flow': SAVE_FLOW,
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
