export interface Section {
  /** Heading text, with leading `#` markers stripped. */
  title: string;
  /** Heading depth (number of `#`s). H1 = 1, H2 = 2, etc. */
  level: number;
  /** Section content between this heading and the next heading of equal or higher level. */
  content: string;
  /** Reserved for HTML-comment metadata parsed in Slice 3 (app-context-lint). Empty {} here. */
  metadata: Record<string, string>;
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;

/**
 * Walk a markdown body string and return a flat list of its sections in
 * document order. A "section" begins at any ATX-style heading (`# ...`,
 * `## ...`, etc.) and runs until the next heading of the same or
 * shallower depth.
 *
 * Slice 1 returns `metadata: {}` for every section. Slice 3 (Issue #4)
 * enhances the walker to parse HTML-comment metadata (e.g.
 * `<!-- source: probe, last_probed: 2026-05-19 -->`) immediately
 * following each heading.
 *
 * Edge cases:
 * - Empty document → empty array.
 * - Body containing no headings → empty array (caller can still inspect
 *   the unparsed body via parseFrontmatter's `body` field).
 * - HTML / code fences inside content are preserved verbatim.
 */
export function walkSections(body: string): Section[] {
  const lines = body.split('\n');
  const sections: Section[] = [];
  let current: { title: string; level: number; lines: string[] } | null = null;
  let inFenced = false;

  const flush = () => {
    if (!current) return;
    sections.push({
      title: current.title,
      level: current.level,
      content: current.lines.join('\n').replace(/\s+$/g, ''),
      metadata: {},
    });
  };

  for (const line of lines) {
    // Don't treat `#` lines inside fenced code blocks as headings.
    if (/^\s*```/.test(line)) inFenced = !inFenced;
    const headingMatch = !inFenced ? line.match(HEADING_RE) : null;
    if (headingMatch) {
      flush();
      current = {
        title: headingMatch[2] ?? '',
        level: headingMatch[1]?.length ?? 1,
        lines: [],
      };
      continue;
    }
    if (current) current.lines.push(line);
  }
  flush();
  return sections;
}
