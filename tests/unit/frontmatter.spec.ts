import { test, expect } from '@playwright/test';

import { parseFrontmatter, FrontmatterParseError } from '../../src/parser/frontmatter.ts';

test('parseFrontmatter: no frontmatter → empty meta, body unchanged', () => {
  const input = '# Heading\n\nSome text.';
  const { meta, body } = parseFrontmatter(input);
  expect(meta).toEqual({});
  expect(body).toBe(input);
});

test('parseFrontmatter: well-formed frontmatter → parsed meta, body without it', () => {
  const input = '---\nfeature: foo\nstatus: approved\n---\n# Heading\n';
  const { meta, body } = parseFrontmatter(input);
  expect(meta).toEqual({ feature: 'foo', status: 'approved' });
  expect(body).toBe('# Heading\n');
});

test('parseFrontmatter: malformed YAML → throws FrontmatterParseError', () => {
  const input = '---\n  this:\n    is: not:\n  valid yaml: at all }}}\n---\nBody.';
  expect(() => parseFrontmatter(input)).toThrow(FrontmatterParseError);
});

test('parseFrontmatter: --- inside body is NOT re-interpreted as frontmatter', () => {
  const input = '---\nfeature: foo\n---\nBody before.\n---\nbody after horizontal rule.';
  const { meta, body } = parseFrontmatter(input);
  expect(meta).toEqual({ feature: 'foo' });
  expect(body).toContain('---');
  expect(body).toContain('horizontal rule');
});

test('parseFrontmatter: multi-line YAML string in frontmatter', () => {
  const input = '---\nfeature: foo\ndescription: |\n  line one\n  line two\n---\nBody.';
  const { meta } = parseFrontmatter(input);
  expect(meta['description']).toBe('line one\nline two\n');
});

test('parseFrontmatter: empty frontmatter → empty meta', () => {
  const input = '---\n\n---\nBody only.';
  const { meta, body } = parseFrontmatter(input);
  expect(meta).toEqual({});
  expect(body).toBe('Body only.');
});

test('parseFrontmatter: top-level array in frontmatter throws (must be mapping)', () => {
  const input = '---\n- one\n- two\n---\nBody.';
  expect(() => parseFrontmatter(input)).toThrow(/mapping/);
});

test('parseFrontmatter: list and object values supported in mapping', () => {
  const input = '---\nfeature: foo\nsource_docs:\n  - a.go\n  - b.go:42\nreviewer_checked:\n  - validators_verified\n  - edge_cases_listed\n---\n';
  const { meta } = parseFrontmatter(input);
  expect(meta['source_docs']).toEqual(['a.go', 'b.go:42']);
  expect(meta['reviewer_checked']).toEqual(['validators_verified', 'edge_cases_listed']);
});
