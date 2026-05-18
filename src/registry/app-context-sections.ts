/**
 * Application Context Document section registry. Single source of truth
 * for which sections every substrate's tests/app.context.md must
 * declare, with what `source:` type, and which keys are required when
 * `source: probe+human`.
 *
 * Section ordering in the registry mirrors the order documented in
 * CONTEXT.md § Product components (component 6). The numeric prefix is
 * a convention (`## 1. Product summary`); the lint matches by the
 * section's TITLE TEXT (after stripping any leading `<num>. ` prefix).
 */

export type SectionSource = 'human' | 'probe' | 'probe+human' | 'agent';

export interface AppContextSection {
  /** Canonical title (without numeric prefix). */
  title: string;
  /** Numeric ordering hint for documentation; not enforced by lint. */
  ordinal: number;
  source: SectionSource;
  required: boolean;
  /**
   * If true, the section MUST declare `last_verified_by_human` in its
   * metadata when `source: probe+human`. Currently true for any
   * probe+human section.
   */
  requireHumanVerification?: boolean;
}

export const APP_CONTEXT_SECTIONS: ReadonlyArray<AppContextSection> = [
  { title: 'Product summary', ordinal: 1, source: 'human', required: true },
  { title: 'Environments', ordinal: 2, source: 'probe', required: true },
  { title: 'User roles + Groups', ordinal: 3, source: 'probe', required: true },
  {
    title: 'Auth strategy',
    ordinal: 4,
    source: 'probe+human',
    required: true,
    requireHumanVerification: true,
  },
  { title: 'Route map', ordinal: 5, source: 'probe', required: true },
  { title: 'State machines', ordinal: 6, source: 'human', required: true },
  { title: 'Known quirks', ordinal: 7, source: 'human', required: true },
  { title: 'External systems', ordinal: 8, source: 'human', required: true },
  { title: 'Notifications', ordinal: 9, source: 'human', required: false },
  { title: 'Out of scope', ordinal: 10, source: 'human', required: true },
  { title: 'Exploration log', ordinal: 11, source: 'agent', required: true },
];

const VALID_SOURCES: SectionSource[] = ['human', 'probe', 'probe+human', 'agent'];

export function isValidSource(value: string): value is SectionSource {
  return (VALID_SOURCES as ReadonlyArray<string>).includes(value);
}

/** List required-section titles for quick set comparison. */
export function listRequiredSectionTitles(): ReadonlyArray<string> {
  return APP_CONTEXT_SECTIONS.filter((s) => s.required).map((s) => s.title);
}

/** Look up a registered section by its title text (numeric prefix stripped). */
export function findSection(title: string): AppContextSection | undefined {
  return APP_CONTEXT_SECTIONS.find((s) => s.title === title);
}

const ORDINAL_PREFIX_RE = /^\d+\.\s+/;

/** Strip a leading `<num>. ` prefix from a section heading text, if present. */
export function stripOrdinalPrefix(title: string): string {
  return title.replace(ORDINAL_PREFIX_RE, '').trim();
}

export const ALWAYS_REQUIRED_FRONTMATTER = ['substrate', 'last_full_exploration', 'exploration_agent'] as const;
