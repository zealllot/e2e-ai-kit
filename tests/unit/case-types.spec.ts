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

test('getCaseTypeSpec: closed-enum but not-yet-registered case_type throws (awaits Slice 2)', () => {
  expect(() => getCaseTypeSpec('state-machine')).toThrow(UnknownCaseTypeError);
  expect(() => getCaseTypeSpec('reference')).toThrow(UnknownCaseTypeError);
  expect(() => getCaseTypeSpec('family')).toThrow(UnknownCaseTypeError);
  expect(() => getCaseTypeSpec('save-flow')).toThrow(UnknownCaseTypeError);
});
