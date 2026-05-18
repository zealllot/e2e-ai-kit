import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { lintAppContextFile } from './lint/app-context-runner.ts';
import { lintCaseFile, type LintResult } from './lint/runner.ts';
import { lintSlotFile } from './lint/slot-runner.ts';
import { formatResult } from './lint/result-formatter.ts';

interface CliResult {
  exitCode: number;
  output: string;
}

interface KindConfig {
  /** Default glob directory when no files supplied (read all .md). */
  defaultDir?: string;
  /** Default specific file when no files supplied. */
  defaultFile?: string;
}

const KINDS: Record<string, KindConfig> = {
  case: { defaultDir: 'tests/cases' },
  'app-context': { defaultFile: 'tests/app.context.md' },
  slot: { defaultDir: '.claude/skills' },
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
  if (!kind || !(kind in KINDS)) {
    return {
      exitCode: 2,
      output: `unknown lint kind '${kind ?? ''}'. Valid: ${Object.keys(KINDS).join(', ')}\n`,
    };
  }

  const filesToLint = files.length > 0 ? files : defaultFilesForKind(kind);

  if (filesToLint.length === 0) {
    const cfg = KINDS[kind];
    const hint = cfg?.defaultFile ?? `${cfg?.defaultDir}/*.md`;
    return {
      exitCode: 2,
      output: `no files matched. Default for '${kind}': ${hint} (missing or empty)\n`,
    };
  }

  let anyFailure = false;
  const outputs: string[] = [];

  for (const file of filesToLint) {
    let result: LintResult;
    if (kind === 'case') {
      result = lintCaseFile(file);
    } else if (kind === 'app-context') {
      result = lintAppContextFile(file);
    } else if (kind === 'slot') {
      result = lintSlotFile(file);
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
  const cfg = KINDS[kind];
  if (!cfg) return [];
  if (cfg.defaultFile) {
    return existsSync(cfg.defaultFile) ? [cfg.defaultFile] : [];
  }
  const dir = cfg.defaultDir;
  if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) return [];
  if (kind === 'slot') {
    // `.claude/skills/<framework>/SKILL.md` — one subdirectory deep.
    // Skip the maintenance/ subdirectory (vendored from the kit — not a
    // substrate-owned framework slot).
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      if (entry === 'maintenance') continue;
      const sub = join(dir, entry);
      if (statSync(sub).isDirectory()) {
        const skillFile = join(sub, 'SKILL.md');
        if (existsSync(skillFile)) out.push(skillFile);
      }
    }
    return out;
  }
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(dir, f));
}

function usage(): string {
  return [
    'usage: e2e-ai-kit lint <kind> [files...]',
    '',
    `  kinds: ${Object.keys(KINDS).join(', ')}`,
    '  when no files are given, the kind\'s default is used',
    '',
    'examples:',
    '  e2e-ai-kit lint case',
    '  e2e-ai-kit lint case tests/cases/my-feature.md',
    '  e2e-ai-kit lint app-context',
    '  e2e-ai-kit lint app-context path/to/app.context.md',
    '  e2e-ai-kit lint slot',
    '  e2e-ai-kit lint slot .claude/skills/playwright-qor/SKILL.md',
    '',
  ].join('\n') + '\n';
}
