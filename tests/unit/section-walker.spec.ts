import { test, expect } from '@playwright/test';

import { walkSections } from '../../src/parser/section-walker.ts';

test('walkSections: empty body → empty array', () => {
  expect(walkSections('')).toEqual([]);
});

test('walkSections: body without headings → empty array', () => {
  expect(walkSections('Just some prose, no headings here.')).toEqual([]);
});

test('walkSections: single H2 → one section', () => {
  const body = '## Required fields\n\nTitle is required.\n';
  const sections = walkSections(body);
  expect(sections).toHaveLength(1);
  expect(sections[0]?.title).toBe('Required fields');
  expect(sections[0]?.level).toBe(2);
  expect(sections[0]?.content).toContain('Title is required');
  expect(sections[0]?.metadata).toEqual({});
});

test('walkSections: H2 / H3 / H2 → three sections in order with correct levels', () => {
  const body = '## A\nA body\n### A.1\nA.1 body\n## B\nB body';
  const sections = walkSections(body);
  expect(sections.map((s) => [s.title, s.level])).toEqual([
    ['A', 2],
    ['A.1', 3],
    ['B', 2],
  ]);
});

test('walkSections: content captures text between this heading and the next of any depth', () => {
  const body = '## A\nA body\n## B\nB body\n';
  const sections = walkSections(body);
  expect(sections[0]?.content).toBe('A body');
  expect(sections[1]?.content).toBe('B body');
});

test('walkSections: embedded HTML inside section content is preserved verbatim', () => {
  const body = '## X\n<details>\n<summary>note</summary>\n</details>\n';
  const sections = walkSections(body);
  expect(sections[0]?.content).toContain('<details>');
});

test('walkSections: # inside a fenced code block is NOT a heading', () => {
  const body = '## Real heading\n```sh\n# this is a shell comment, not a heading\n```\n## Another real heading';
  const sections = walkSections(body);
  expect(sections.map((s) => s.title)).toEqual(['Real heading', 'Another real heading']);
});

test('walkSections: text before the first heading is dropped (caller can use parseFrontmatter for that)', () => {
  const body = 'Some intro text.\n\n## First section\nbody.';
  const sections = walkSections(body);
  expect(sections).toHaveLength(1);
  expect(sections[0]?.title).toBe('First section');
});

test('walkSections: trailing whitespace trimmed from content', () => {
  const body = '## A\nbody\n\n\n';
  expect(walkSections(body)[0]?.content).toBe('body');
});
