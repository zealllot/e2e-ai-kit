#!/usr/bin/env -S npx tsx
import { run } from '../src/cli.ts';

process.exit(await run(process.argv.slice(2)));
