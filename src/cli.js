// nombra CLI. `run` takes argv and output streams so it can be tested without processes.

import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { createGenerator, locales, FORMATS } from './full.js';

const DEFAULT_PATTERN = 'animal-adjective';

const HELP = `nombra — generate names from patterns

Usage:
  nombra [pattern|template] [options]

Examples:
  nombra                                   one name (${DEFAULT_PATTERN})
  nombra city-adjective -n 5               five names
  nombra animal-adjective --locale es      Spanish words
  nombra docker-style --seed 7 -f snake    fixed result, snake_case
  nombra "{animal#marine} {adjective} {hex:4}"
  nombra --list                            presets and dictionaries

Options:
  -n, --count <n>     how many names (default 1)
  -s, --seed <text>   same seed, same result
  -L, --locale <l>    ${Object.keys(locales).join(' | ')} (default en)
  -f, --format <f>    ${FORMATS.join(' | ')}
  -a, --alliterate    every word starts with the same letter
      --ascii-extended  keep accents (default: plain ASCII, accents removed)
  -u, --unique        no repeated names
      --json          JSON output
  -l, --list          list presets and dictionaries
  -v, --version
  -h, --help
`;

const OPTIONS = {
  count: { type: 'string', short: 'n' },
  seed: { type: 'string', short: 's' },
  locale: { type: 'string', short: 'L' },
  format: { type: 'string', short: 'f' },
  alliterate: { type: 'boolean', short: 'a' },
  unique: { type: 'boolean', short: 'u' },
  'ascii-extended': { type: 'boolean' },
  json: { type: 'boolean' },
  list: { type: 'boolean', short: 'l' },
  version: { type: 'boolean', short: 'v' },
  help: { type: 'boolean', short: 'h' },
};

class UsageError extends Error {}

function readVersion() {
  return JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
}

function parseCount(value) {
  if (value === undefined) return 1;
  const n = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(n) || n < 1) {
    throw new UsageError(`--count must be an integer greater than 0 (got "${value}")`);
  }
  return n;
}

function print(stream, text) {
  stream.write(text.endsWith('\n') ? text : `${text}\n`);
}

/**
 * @param {string[]} argv  arguments without `node` and the script
 * @param {{ stdout?: {write(s: string): void}, stderr?: {write(s: string): void} }} [io]
 * @returns {number} exit code
 */
export function run(argv, io = {}) {
  const stdout = io.stdout ?? process.stdout;
  const stderr = io.stderr ?? process.stderr;

  try {
    let parsed;
    try {
      parsed = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true });
    } catch (error) {
      throw new UsageError(error.message.split('. To specify')[0]);
    }
    const { values, positionals } = parsed;

    if (values.help) return print(stdout, HELP), 0;
    if (values.version) return print(stdout, readVersion()), 0;
    if (positionals.length > 1) throw new UsageError('Give a single pattern; quote it if it is a template');

    const locale = values.locale ?? 'en';
    if (!(locale in locales)) throw new UsageError(`Unknown locale "${locale}" (${Object.keys(locales).join(', ')})`);
    const generator = createGenerator({ locale });

    if (values.list) {
      const presets = generator.patterns;
      const dictionaries = generator.dictionaries;
      if (values.json) {
        print(stdout, JSON.stringify({ locale, presets, dictionaries }, null, 2));
      } else {
        const width = Math.max(...Object.keys(presets).map((id) => id.length));
        print(stdout, `Presets (${locale}):`);
        for (const [id, p] of Object.entries(presets)) print(stdout, `  ${id.padEnd(width)}  ${p.template.padEnd(38)}  ${p.description}`);
        print(stdout, `\nDictionaries (${locale}):`);
        for (const d of dictionaries) print(stdout, `  ${d.name.padEnd(12)}  ${d.type.padEnd(9)}  ${d.size} words`);
      }
      return 0;
    }

    const count = parseCount(values.count);
    const options = {};
    if (values.seed !== undefined) options.seed = values.seed;
    if (values.format !== undefined) options.format = values.format;
    if (values.alliterate) options.alliterate = true;
    if (values.unique) options.unique = true;
    if (values['ascii-extended']) options.asciiExtended = true;

    const names = generator.generateMany(positionals[0] ?? DEFAULT_PATTERN, count, options);
    print(stdout, values.json ? JSON.stringify(names, null, 2) : names.join('\n'));
    return 0;
  } catch (error) {
    print(stderr, `nombra: ${error.message}`);
    if (error instanceof UsageError) print(stderr, 'Try "nombra --help" for the options.');
    return error instanceof UsageError ? 2 : 1;
  }
}
