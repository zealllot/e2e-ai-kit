export interface Section {
  /** Heading text, with leading `#` markers stripped. */
  title: string;
  /** Heading depth (number of `#`s). H1 = 1, H2 = 2, etc. */
  level: number;
  /** Section content between this heading and the next heading of equal or higher level. */
  content: string;
  /**
   * HTML-comment metadata parsed from a `<!-- key: value, key: value -->`
   * comment placed as the first non-empty line under the heading. Empty
   * `{}` if no such comment is present.
   */
  metadata: Record<string, string>;
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;
const HTML_COMMENT_RE = /<!--\s*([\s\S]*?)\s*-->/;

/**
 * Walk a markdown body string and return a flat list of its sections in
 * document order. A "section" begins at any ATX-style heading (`# ...`,
 * `## ...`, etc.) and runs until the next heading of the same or
 * shallower depth.
 *
 * HTML-comment metadata: if the first non-blank line under a heading is
 * a single HTML comment of the form `<!-- key: value, key: value -->`,
 * it is parsed into `section.metadata` and consumed from the content.
 * Multi-line comments are supported (newlines inside the comment are
 * folded). Malformed comments are passed through as content with empty
 * `metadata`.
 *
 * Edge cases:
 * - Empty document → empty array.
 * - Body containing no headings → empty array.
 * - HTML / code fences inside content are preserved verbatim.
 */
export function walkSections(body: string): Section[] {
  const lines = body.split('\n');
  const sections: Section[] = [];
  let current: { title: string; level: number; lines: string[] } | null = null;
  let inFenced = false;

  const flush = () => {
    if (!current) return;
    const { metadata, remainingLines } = extractLeadingMetadata(current.lines);
    sections.push({
      title: current.title,
      level: current.level,
      content: remainingLines.join('\n').replace(/\s+$/g, ''),
      metadata,
    });
  };

  for (const line of lines) {
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

function extractLeadingMetadata(lines: string[]): { metadata: Record<string, string>; remainingLines: string[] } {
  let firstNonBlank = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if ((lines[i] ?? '').trim() !== '') {
      firstNonBlank = i;
      break;
    }
  }
  if (firstNonBlank === -1) return { metadata: {}, remainingLines: lines };

  const first = lines[firstNonBlank] ?? '';
  if (!first.trimStart().startsWith('<!--')) return { metadata: {}, remainingLines: lines };

  // Find end of the comment, possibly spanning multiple lines.
  let endIdx = -1;
  let block = '';
  for (let i = firstNonBlank; i < lines.length; i += 1) {
    block += lines[i] + '\n';
    if ((lines[i] ?? '').includes('-->')) {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) return { metadata: {}, remainingLines: lines };

  const match = block.match(HTML_COMMENT_RE);
  if (!match) return { metadata: {}, remainingLines: lines };

  const meta = parseMetaContent(match[1] ?? '');
  if (Object.keys(meta).length === 0) return { metadata: {}, remainingLines: lines };
  const remaining = [...lines.slice(0, firstNonBlank), ...lines.slice(endIdx + 1)];
  return { metadata: meta, remainingLines: remaining };
}

function parseMetaContent(raw: string): Record<string, string> {
  const folded = raw.replace(/\s*\n\s*/g, ' ').trim();
  if (folded === '') return {};
  const meta: Record<string, string> = {};
  for (const part of folded.split(',')) {
    const trimmed = part.trim();
    if (trimmed === '') continue;
    const colon = trimmed.indexOf(':');
    if (colon === -1) return {}; // not key:value form — treat whole comment as plain HTML, no metadata
    const key = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    if (key === '') return {};
    meta[key] = value;
  }
  return meta;
}
