import type { LintError, LintResult } from './runner.ts';

const GHA_ENABLED = process.env.GITHUB_ACTIONS === 'true';

/**
 * Format a LintResult for human reading or for GitHub Actions
 * annotations. Toggled by the `GITHUB_ACTIONS=true` env var (set
 * automatically inside a GitHub Actions runner).
 */
export function formatResult(result: LintResult, opts: { ghaMode?: boolean } = {}): string {
  const ghaMode = opts.ghaMode ?? GHA_ENABLED;
  if (result.ok && result.warnings.length === 0) {
    return 'ok\n';
  }
  const lines: string[] = [];
  for (const err of result.errors) {
    lines.push(ghaMode ? formatGha(err, 'error') : formatTerminal(err, 'error'));
  }
  for (const warn of result.warnings) {
    lines.push(ghaMode ? formatGha(warn, 'warning') : formatTerminal(warn, 'warning'));
  }
  return lines.join('\n') + '\n';
}

function formatTerminal(err: LintError, severity: 'error' | 'warning'): string {
  const where = err.line ? `${err.file}:${err.line}` : err.file;
  const sec = err.section ? ` [section: ${err.section}]` : '';
  return `${severity}: ${where}${sec} (${err.ruleId})\n  ${err.message}`;
}

function formatGha(err: LintError, severity: 'error' | 'warning'): string {
  const parts: string[] = [`file=${err.file}`];
  if (err.line) parts.push(`line=${err.line}`);
  parts.push(`title=${err.ruleId}`);
  return `::${severity} ${parts.join(',')}::${err.message}`;
}
