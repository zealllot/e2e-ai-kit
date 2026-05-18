import { test, expect } from '@playwright/test';

import {
  CASE_TYPES,
  getCaseTypeSpec,
  isKnownCaseType,
  listCaseTypes,
  UnknownCaseTypeError,
} from '../../src/registry/case-types.ts';

test('CASE_TYPES is exactly the five-element closed enum', () => {
  expect(listCaseTypes()).toEqual(['happy-path', 'state-machine', 'reference', 'family', 'save-flow']);
  expect(CASE_TYPES).toHaveLength(5);
});

test('isKnownCaseType: returns true for every value in the enum', () => {
  for (const kind of CASE_TYPES) {
    expect(isKnownCaseType(kind)).toBe(true);
  }
});

test('isKnownCaseType: returns false for an unknown value', () => {
  expect(isKnownCaseType('random-thing')).toBe(false);
});

test('getCaseTypeSpec: happy-path returns the expected shape', () => {
  const spec = getCaseTypeSpec('happy-path');
  expect(spec.caseType).toBe('happy-path');
  expect(spec.requiredFrontmatter).toContain('feature');
  expect(spec.requiredFrontmatter).toContain('case_type');
  expect(spec.requiredFrontmatter).toContain('status');
  expect(spec.requiredOnApproved).toContain('approved_by');
  expect(spec.requiredOnApproved).toContain('approved_at');
  expect(spec.requiredOnApproved).toContain('reviewer_checked');
  expect(spec.requiredBodySections).toEqual(['Required fields', 'Tests']);
  expect(spec.reviewerCheckedEnum).toContain('validators_verified');
});

test('getCaseTypeSpec: a value not in the closed enum throws UnknownCaseTypeError', () => {
  expect(() => getCaseTypeSpec('random-thing')).toThrow(UnknownCaseTypeError);
});

test('getCaseTypeSpec: state-machine has state-transition reviewer checks + Tests/State machine/Roles sections', () => {
  const spec = getCaseTypeSpec('state-machine');
  expect(spec.reviewerCheckedEnum).toContain('state_transitions_verified');
  expect(spec.reviewerCheckedEnum).toContain('role_x_state_matrix_verified');
  expect(spec.requiredBodySections).toEqual(['State machine', 'Roles & access', 'Tests']);
});

test('getCaseTypeSpec: reference forbids lives_in and storage_states_required', () => {
  const spec = getCaseTypeSpec('reference');
  expect(spec.forbiddenFrontmatter).toContain('lives_in');
  expect(spec.forbiddenFrontmatter).toContain('storage_states_required');
  expect(spec.requiredFrontmatter).not.toContain('lives_in');
});

test('getCaseTypeSpec: family requires ## Family members and family-specific reviewer checks', () => {
  const spec = getCaseTypeSpec('family');
  expect(spec.requiredBodySections).toContain('Family members');
  expect(spec.reviewerCheckedEnum).toContain('family_members_enumerated');
});

test('getCaseTypeSpec: save-flow requires three body sections for form/save/failure', () => {
  const spec = getCaseTypeSpec('save-flow');
  expect(spec.requiredBodySections).toEqual(['Form preconditions', 'Save assertion', 'Failure modes']);
  expect(spec.reviewerCheckedEnum).toContain('form_preconditions_complete');
});

test('getCaseTypeSpec: every value in CASE_TYPES is now registered (Slice 2)', () => {
  for (const kind of CASE_TYPES) {
    expect(() => getCaseTypeSpec(kind)).not.toThrow();
  }
});
