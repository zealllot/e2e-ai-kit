import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { lintCaseFile, type LintResult } from './lint/runner.ts';
import { formatResult } from './lint/result-formatter.ts';

interface CliResult {
  exitCode: number;
  output: string;
}

const DEFAULT_GLOBS: Record<string, string> = {
  case: 'tests/cases',
};

/**
 * CLI entrypoint. Parses argv into a (subcommand, kind, files) tuple
 * and dispatches.
 *
 * Examples:
 *   e2e-ai-kit lint case
 *   e2e-ai-kit lint case tests/cases/my-feature.md
 *   e2e-ai-kit lint case tests/cases/*.md
 *
 * Exit codes:
 *   0 — all files passed
 *   1 — at least one file failed
 *   2 — usage / argument error
 */
export async function run(argv: string[]): Promise<number> {
  const result = await runInternal(argv);
  process.stdout.write(result.output);
  return result.exitCode;
}

async function runInternal(argv: string[]): Promise<CliResult> {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    return { exitCode: 2, output: usage() };
  }

  const [subcommand, kind, ...files] = argv;
  if (subcommand !== 'lint') {
    return { exitCode: 2, output: `unknown subcommand '${subcommand}'\n\n${usage()}` };
  }
  if (!kind || !(kind in DEFAULT_GLOBS)) {
    return {
      exitCode: 2,
      output: `unknown lint kind '${kind ?? ''}'. Valid: ${Object.keys(DEFAULT_GLOBS).join(', ')}\n`,
    };
  }

  const filesToLint = files.length > 0 ? files : defaultFilesForKind(kind);

  if (filesToLint.length === 0) {
    return {
      exitCode: 2,
      output: `no files matched. Glob default for '${kind}': ${DEFAULT_GLOBS[kind]}/*.md (directory missing or empty)\n`,
    };
  }

  let anyFailure = false;
  const outputs: string[] = [];

  for (const file of filesToLint) {
    let result: LintResult;
    if (kind === 'case') {
      result = lintCaseFile(file);
    } else {
      return { exitCode: 2, output: `unsupported lint kind '${kind}'\n` };
    }
    if (!result.ok) anyFailure = true;
    if (!result.ok || result.warnings.length > 0) {
      outputs.push(formatResult(result));
    }
  }

  if (!anyFailure) {
    outputs.push(`ok (${filesToLint.length} file${filesToLint.length === 1 ? '' : 's'} linted)\n`);
  }

  return { exitCode: anyFailure ? 1 : 0, output: outputs.join('') };
}

function defaultFilesForKind(kind: string): string[] {
  const dir = DEFAULT_GLOBS[kind];
  if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(dir, f));
}

function usage(): string {
  return [
    'usage: e2e-ai-kit lint <kind> [files...]',
    '',
    `  kinds: ${Object.keys(DEFAULT_GLOBS).join(', ')}`,
    '  when no files are given, the kind\'s default glob is used',
    '',
    'examples:',
    '  e2e-ai-kit lint case',
    '  e2e-ai-kit lint case tests/cases/my-feature.md',
    '',
  ].join('\n') + '\n';
}
