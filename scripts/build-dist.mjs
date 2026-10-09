// Builds the single-file bundles for using the library in a browser. Two flavors:
//
//   basic (`nombra`):       animal, adjective, thing, color
//   full  (`nombra/full`):  basic + city, country, fruit, plant
//
//   dist/nombra.min.js           classic script: <script src="…"></script> → global `Nombra`
//   dist/nombra.esm.min.js       ES module:       import { generate } from '…/nombra.esm.min.js'
//   dist/nombra.full.min.js      same, full flavor
//   dist/nombra.full.esm.min.js
//
// Afterwards it checks all of them work, and that the basic ones do not carry the extra words.
// On any failure it exits with an error.

import { readFileSync, mkdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import path from 'node:path';

// esbuild is a devDependency, only needed to build dist/. If it is missing, say what to do.
async function loadEsbuild() {
  try {
    return await import('esbuild');
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND' || !String(error.message).includes('esbuild')) throw error;
    console.error('esbuild is missing; it comes with the dev dependencies.');
    console.error('Run first:  npm install');
    process.exit(1);
  }
}

const { build } = await loadEsbuild();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = (...parts) => path.join(root, ...parts);
const { version } = JSON.parse(readFileSync(at('package.json'), 'utf8'));

const banner = `/*! nombra v${version} | MIT */`;
const common = {
  bundle: true,
  minify: true,
  target: 'es2020',
  legalComments: 'none',
  banner: { js: banner },
  logLevel: 'warning',
};

const FLAVORS = {
  basic: { entry: 'index.js', prefix: 'nombra' },
  full: { entry: 'full.js', prefix: 'nombra.full' },
};

mkdirSync(at('dist'), { recursive: true });

for (const { entry, prefix } of Object.values(FLAVORS)) {
  const entryPoints = [at('src', entry)];
  await build({ ...common, entryPoints, format: 'iife', globalName: 'Nombra', outfile: at('dist', `${prefix}.min.js`) });
  await build({ ...common, entryPoints, format: 'esm', outfile: at('dist', `${prefix}.esm.min.js`) });
}

// ------------------------------------------------------------------ checks

function assert(condition, message) {
  if (!condition) {
    console.error(`build-dist: ${message}`);
    process.exit(1);
  }
}

// Words that only exist in the extra dictionaries (cities, countries, fruit, plants), in both locales.
const EXTRA_WORDS = ['reykjavik', 'timbuktu', 'tegucigalpa', 'kiribati', 'mangosteen', 'lavender', 'zarzamora', 'pomelo'];

const names = [];
for (const [flavor, { entry, prefix }] of Object.entries(FLAVORS)) {
  const full = flavor === 'full';
  const src = await import(pathToFileURL(at('src', entry)).href);
  const classic = readFileSync(at('dist', `${prefix}.min.js`), 'utf8');

  // 1) The classic script runs in a context without Node (like a browser) and defines the global.
  const sandbox = { crypto: globalThis.crypto, console };
  vm.createContext(sandbox);
  vm.runInContext(classic + '\nglobalThis.Nombra = Nombra;', sandbox);
  const N = sandbox.Nombra;
  assert(N && typeof N.generate === 'function', `${prefix}: the Nombra global does not expose generate()`);
  assert(typeof N.createGenerator === 'function', `${prefix}: createGenerator is missing`);
  assert(Object.keys(N.locales).join() === Object.keys(src.locales).join(), `${prefix}: the global is missing locales`);
  const preset = full ? 'city-adjective' : 'animal-adjective';
  const a = N.generate(preset, { seed: 7 });
  const b = N.generate('animal-adjective', { seed: 7, locale: 'en' });
  assert(/^[a-z]+(-[a-z]+)+$/.test(a) && /^[a-z]+(-[a-z]+)+$/.test(b), `${prefix}: unexpected names: ${a}, ${b}`);

  // 2) The ES module matches the classic script and the source.
  const esm = await import(pathToFileURL(at('dist', `${prefix}.esm.min.js`)).href);
  assert(esm.generate(preset, { seed: 7 }) === a, `${prefix}: ESM and classic script differ`);
  assert(src.generate('animal-adjective', { seed: 7, locale: 'en' }) === b, `${prefix}: the bundle differs from the source`);
  assert(typeof esm.default === 'function', `${prefix}: the ESM does not export createGenerator by default`);

  // 3) The flavors contain what they promise: basic has no extras, full has them all.
  const present = EXTRA_WORDS.filter((w) => classic.includes(w));
  if (full) assert(present.length === EXTRA_WORDS.length, `${prefix}: missing extra words: ${EXTRA_WORDS.filter((w) => !present.includes(w))}`);
  else assert(present.length === 0, `${prefix}: the basic bundle carries extra words (tree-shaking broke): ${present}`);
  assert(Object.keys(N.locales.en.presets).includes('city-adjective') === full, `${prefix}: wrong presets for this flavor`);

  names.push(`${prefix}: "${a}"`);
}

// ------------------------------------------------------------------ summary

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
for (const { prefix } of Object.values(FLAVORS)) {
  for (const file of [`${prefix}.min.js`, `${prefix}.esm.min.js`]) {
    const buf = readFileSync(at('dist', file));
    console.log(`dist/${file.padEnd(26)} ${kb(statSync(at('dist', file)).size)}  (${kb(gzipSync(buf).length)} gzip)`);
  }
}
console.log(`checked (seed 7): ${names.join(' | ')}`);
