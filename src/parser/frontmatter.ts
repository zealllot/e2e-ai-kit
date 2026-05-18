import { parse as parseYaml, YAMLParseError } from 'yaml';

export interface ParsedDocument {
  /** Parsed YAML frontmatter. Empty object if no frontmatter present. */
  meta: Record<string, unknown>;
  /** Document body (markdown after frontmatter). Whole input if no frontmatter. */
  body: string;
}

export class FrontmatterParseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'FrontmatterParseError';
  }
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * Parse a markdown document with optional YAML frontmatter.
 *
 * Frontmatter form:
 *   ---
 *   key: value
 *   ---
 *   <body>
 *
 * - No frontmatter → `meta` is `{}`, `body` is the whole input.
 * - Malformed YAML inside frontmatter → throws FrontmatterParseError.
 * - Empty frontmatter (---\n\n---\n) → `meta` is `{}`, `body` is the rest.
 * - `---` appearing inside the body (after the closing `---`) is not
 *   re-interpreted as frontmatter.
 */
export function parseFrontmatter(input: string): ParsedDocument {
  const match = input.match(FRONTMATTER_RE);
  if (!match) {
    return { meta: {}, body: input };
  }
  const rawYaml = match[1] ?? '';
  const body = input.slice(match[0].length);

  if (rawYaml.trim().length === 0) {
    return { meta: {}, body };
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(rawYaml);
  } catch (e) {
    if (e instanceof YAMLParseError) {
      throw new FrontmatterParseError(`Invalid YAML in frontmatter: ${e.message}`, e);
    }
    throw new FrontmatterParseError(`Failed to parse frontmatter: ${String(e)}`, e);
  }

  if (parsed === null || parsed === undefined) {
    return { meta: {}, body };
  }
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new FrontmatterParseError(
      `Frontmatter must be a YAML mapping, got ${Array.isArray(parsed) ? 'array' : typeof parsed}`,
    );
  }
  return { meta: parsed as Record<string, unknown>, body };
}
