// Engine: text utilities, seeded RNG, template parser, dictionaries, formats and the generator.
// Language-agnostic: language packs live in ./locales/.

// ================================================================== text

/** Removes accents and diaeresis (ñ → n, ü → u). */
export function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
}

/** First letter, accent-free and lowercase (used for alliteration). */
function initial(s) {
  return stripDiacritics(s).charAt(0).toLowerCase();
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ================================================================== rng
// Seeded PRNG (mulberry32) + string hash (xmur3). Works the same in the browser and in Node.

/** Turns any seed (number or text) into a 32-bit integer. */
export function hashSeed(seed) {
  const str = String(seed);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

function randomSeed() {
  const c = globalThis.crypto;
  if (c && typeof c.getRandomValues === 'function') {
    return c.getRandomValues(new Uint32Array(1))[0];
  }
  return (Math.random() * 4294967296) >>> 0;
}

/**
 * Creates a pseudo-random generator. Without a seed it uses system entropy.
 * @param {string|number} [seed]
 */
export function createRng(seed) {
  let a = seed === undefined ? randomSeed() : hashSeed(seed);

  /** Number in [0, 1). */
  function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [0, n). */
  function int(n) {
    return Math.floor(next() * n);
  }

  /** Random element of a non-empty array. */
  function pick(list) {
    return list[int(list.length)];
  }

  return { next, int, pick };
}

// ================================================================== phonetic
// Made-up but pronounceable words: consonant+vowel syllables.

const CONSONANTS = ['b', 'd', 'f', 'g', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z'];
const VOWELS = ['a', 'e', 'i', 'o', 'u'];

/** Upper bound of distinct combinations for n syllables. */
function pseudoSpace(syllables) {
  return (CONSONANTS.length * VOWELS.length) ** syllables;
}

/** Builds a word of `syllables` syllables, never repeating the previous syllable. */
function pseudoWord(rng, syllables = 2) {
  let word = '';
  let previous = '';
  for (let i = 0; i < syllables; i++) {
    let syllable;
    do {
      syllable = rng.pick(CONSONANTS) + rng.pick(VOWELS);
    } while (syllable === previous);
    word += syllable;
    previous = syllable;
  }
  return word;
}

// ================================================================== format

export const FORMATS = ['kebab', 'snake', 'camel', 'pascal', 'title', 'space'];

const SLUG_FORMATS = new Set(['kebab', 'snake', 'camel', 'pascal']);
// Lowercase connectors in `title` format (es + en). Simple on purpose: no per-locale plumbing.
const SMALL_WORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'en', 'a', 'al', 'con', 'of', 'the', 'and', 'in', 'on']);

/**
 * Joins generated words according to the requested format.
 * @param {string[]} words
 * @param {string|((words: string[]) => string)} format
 * @param {boolean} asciiExtended  false (default): plain ASCII, accents removed (ñ → n).
 *                                 true: accented letters are kept (á, ñ, ü…).
 */
export function joinWords(words, format = 'kebab', asciiExtended = false) {
  if (typeof format === 'function') return format([...words]);
  if (!FORMATS.includes(format)) {
    throw new RangeError(`Unknown format "${format}". Available: ${FORMATS.join(', ')}`);
  }

  let list = words.map((w) => (asciiExtended ? w : stripDiacritics(w)).toLowerCase());
  if (SLUG_FORMATS.has(format)) {
    const forbidden = asciiExtended ? /[^\p{L}\p{N}]/gu : /[^a-z0-9]/g;
    list = list.map((w) => w.replace(forbidden, ''));
  }
  list = list.filter(Boolean);

  switch (format) {
    case 'kebab':
      return list.join('-');
    case 'snake':
      return list.join('_');
    case 'camel':
      return list.map((w, i) => (i === 0 ? w : capitalize(w))).join('');
    case 'pascal':
      return list.map(capitalize).join('');
    case 'title':
      return list.map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : capitalize(w))).join(' ');
    default:
      return list.join(' ');
  }
}

// ================================================================== template
//
// Syntax (parts are separated by spaces; the format decides how they are joined):
//   {animal}              random entry from the "animal" dictionary
//   {animal#marine}       only entries with that tag (several: {animal#bird#marine})
//   {adjective@animal}    adjective that agrees in gender with {animal}
//   {num} {num:6}         N-digit number (default 4)
//   {hex:6}               N hex characters (default 4)
//   {pseudo:3}            made-up word of N syllables (default 2)
//   of                    literal text

const PART_RE = /\{[^{}]*\}|[^\s{}]+/g;
const BUILTIN_DEFAULTS = { num: 4, hex: 4, pseudo: 2 };

function parsePart(src) {
  if (!src.startsWith('{')) return { kind: 'literal', text: src, source: src };

  if (src.includes('|')) throw new SyntaxError(`Modifiers are not supported: ${src}`);
  const [head, ref] = src.slice(1, -1).split('@').map((s) => s.trim());
  const [namePart, ...tags] = head.split('#').map((s) => s.trim());
  const [name, arg] = namePart.split(':').map((s) => s.trim());

  if (!name) throw new SyntaxError(`Empty token in template: ${src}`);

  if (name in BUILTIN_DEFAULTS) {
    const size = arg === undefined ? BUILTIN_DEFAULTS[name] : Number(arg);
    if (!Number.isInteger(size) || size < 1 || size > 12) {
      throw new RangeError(`${src}: size must be an integer between 1 and 12`);
    }
    return { kind: name, size, source: src };
  }

  if (arg !== undefined) {
    throw new SyntaxError(`${src}: only num, hex and pseudo take a size (":${arg}")`);
  }

  return { kind: 'dict', name, tags: tags.filter(Boolean), ref: ref || null, source: src };
}

/** Turns a template into a list of parts. Needs no dictionaries. */
function parseTemplate(template) {
  if (typeof template !== 'string' || !template.trim()) {
    throw new TypeError('The template must be a non-empty string');
  }
  if (template.replace(PART_RE, '').trim()) {
    throw new SyntaxError(`Unclosed or nested braces in template: "${template}"`);
  }

  const parts = template.match(PART_RE).map(parsePart);

  for (const part of parts) {
    if (part.kind === 'dict' && part.ref && !parts.some((p) => p.kind === 'dict' && p.name === part.ref)) {
      throw new SyntaxError(`${part.source}: the template has no {${part.ref}} part to agree with`);
    }
  }
  return parts;
}

// ================================================================== dictionary
//
// Types:
//   noun       noun with optional gender (m/f)
//   adjective  adjective that agrees with a noun (masculine + feminine forms)
//   plain      standalone word, no agreement
//
// String entries:
//   noun/plain  "fox"  "mapa:m"  "delfín:m#marine"      (":m"/":f" gender, "#tag" tags)
//   adjective   "sereno" (automatic feminine)  "marrón|marrón" (explicit feminine)
// Tags are filtered in templates: {animal#marine}.
//
// Language rules come from `morphology` ({ feminine, inferGender }); without it, words are
// invariable and nouns have no gender (English).

const DICTIONARY = Symbol.for('nombra.dictionary');
const TYPES = ['noun', 'adjective', 'plain'];
const IDENTITY = { feminine: (word) => word, inferGender: () => null };
const NAME_RE = /^[\p{L}][\p{L}\p{N}_-]*$/u;

export function isDictionary(value) {
  return Boolean(value) && value[DICTIONARY] === true;
}

function entryFromString(src) {
  const [body, ...tags] = src.split('#');
  const [text, gender] = body.split(':').map((s) => s.trim());
  const entry = { text, tags: tags.map((t) => t.trim()).filter(Boolean) };
  if (gender) entry.gender = gender;
  return entry;
}

function normalizeEntry(raw, type, name, morphology) {
  const entry = typeof raw === 'string' ? entryFromString(raw) : { ...raw };
  if (typeof entry.text !== 'string' || !entry.text.trim()) {
    throw new TypeError(`Dictionary "${name}": invalid entry ${JSON.stringify(raw)}`);
  }

  const out = { text: entry.text.trim(), tags: Object.freeze([...(entry.tags ?? [])]) };

  if (type === 'adjective') {
    const [masculine, explicit] = out.text.split('|').map((s) => s.trim());
    out.text = masculine;
    out.forms = Object.freeze({ m: masculine, f: explicit || morphology.feminine(masculine) });
  } else {
    const gender = entry.gender ?? (type === 'noun' ? morphology.inferGender(out.text) : null);
    if (gender !== null && gender !== 'm' && gender !== 'f') {
      throw new RangeError(`Dictionary "${name}": invalid gender "${gender}" in "${out.text}" (use m or f)`);
    }
    out.gender = gender;
  }

  out.initial = initial(out.text);
  return Object.freeze(out);
}

/**
 * @param {{ name: string, type?: 'noun'|'adjective'|'plain', locale?: string,
 *           morphology?: { feminine(w: string): string, inferGender(w: string): 'm'|'f'|null },
 *           entries: Array<string|object> }} def
 */
export function defineDictionary(def) {
  const { name, type = 'plain', locale = null, morphology = IDENTITY, entries } = def ?? {};

  if (typeof name !== 'string' || !NAME_RE.test(name)) {
    throw new TypeError(`Invalid dictionary name: ${JSON.stringify(name)} (letters, numbers, "_" or "-")`);
  }
  if (!TYPES.includes(type)) {
    throw new RangeError(`Dictionary "${name}": unknown type "${type}" (${TYPES.join(', ')})`);
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new TypeError(`Dictionary "${name}": needs at least one entry`);
  }

  const normalized = entries.map((raw) => normalizeEntry(raw, type, name, morphology));

  const seen = new Set();
  for (const entry of normalized) {
    if (seen.has(entry.text)) throw new Error(`Dictionary "${name}": duplicate entry "${entry.text}"`);
    seen.add(entry.text);
  }

  return Object.freeze({ [DICTIONARY]: true, name, type, locale, entries: Object.freeze(normalized) });
}

// ================================================================== linking

const MAX_UNIQUE_ATTEMPTS = 1000;
const MAX_UNIQUE_ATTEMPTS_CAP = 500000;

/** Resolves dictionaries, tags and agreements of an already parsed template. */
function link(parts, dictionaries) {
  const linked = parts.map((part) => {
    if (part.kind !== 'dict') return part;

    const dict = dictionaries.get(part.name);
    if (!dict) {
      const available = [...dictionaries.keys()].join(', ') || '(none)';
      throw new Error(`Dictionary "${part.name}" is not registered. Available: ${available}`);
    }
    if (part.ref && dict.type !== 'adjective') {
      throw new Error(`${part.source}: only "adjective" dictionaries can use @agreement ("${part.name}" is "${dict.type}")`);
    }

    const entries = part.tags.length
      ? dict.entries.filter((entry) => part.tags.every((tag) => entry.tags.includes(tag)))
      : dict.entries;
    if (entries.length === 0) {
      throw new Error(`${part.source}: no entry in "${part.name}" has the tags ${part.tags.join(', ')}`);
    }
    return { ...part, dict, entries };
  });

  return linked.map((part) => {
    if (part.kind !== 'dict' || !part.ref) return part;
    const refIndex = linked.findIndex((p) => p.kind === 'dict' && p.name === part.ref);
    if (linked[refIndex].dict.type === 'adjective') {
      throw new Error(`${part.source}: cannot agree with "${part.ref}" because it is also an adjective`);
    }
    return { ...part, refIndex };
  });
}

// ================================================================== alliteration

const groupCache = new WeakMap();

/** Groups entries by initial letter (memoised per list). */
function groupByInitial(entries) {
  let groups = groupCache.get(entries);
  if (!groups) {
    groups = new Map();
    for (const entry of entries) {
      if (!groups.has(entry.initial)) groups.set(entry.initial, []);
      groups.get(entry.initial).push(entry);
    }
    groupCache.set(entries, groups);
  }
  return groups;
}

function commonLetters(groupsList) {
  const [first, ...rest] = groupsList;
  return [...first.keys()].filter((letter) => rest.every((g) => g.has(letter)));
}

// ================================================================== generation

function selectEntries(parts, rng, alliterate) {
  const lists = parts.map((part) => (part.kind === 'dict' ? part.entries : null));
  if (!alliterate) return lists.map((list) => (list ? rng.pick(list) : null));

  const groups = lists.filter(Boolean).map(groupByInitial);
  if (groups.length === 0) return lists.map(() => null);

  const letters = commonLetters(groups);
  if (letters.length === 0) {
    throw new Error('alliterate: the pattern dictionaries share no initial letter');
  }
  const letter = rng.pick(letters);
  return lists.map((list) => (list ? rng.pick(groupByInitial(list).get(letter)) : null));
}

function randomDigits(rng, size) {
  let digits = String(1 + rng.int(9)); // no leading zero
  for (let i = 1; i < size; i++) digits += rng.int(10);
  return digits;
}

function randomHex(rng, size) {
  let hex = '';
  for (let i = 0; i < size; i++) hex += rng.int(16).toString(16);
  return hex;
}

/** Returns the unformatted word list of a linked template. */
function compose(parts, rng, alliterate) {
  const picks = selectEntries(parts, rng, alliterate);
  const texts = new Array(parts.length);
  const grammar = new Array(parts.length);

  // Pass 1: everything that does not depend on another part.
  parts.forEach((part, i) => {
    switch (part.kind) {
      case 'literal':
        texts[i] = part.text;
        break;
      case 'num':
        texts[i] = randomDigits(rng, part.size);
        break;
      case 'hex':
        texts[i] = randomHex(rng, part.size);
        break;
      case 'pseudo':
        texts[i] = pseudoWord(rng, part.size);
        break;
      case 'dict':
        if (part.dict.type !== 'adjective') {
          const entry = picks[i];
          texts[i] = entry.text;
          grammar[i] = { gender: entry.gender ?? 'm' };
        }
        break;
    }
  });

  // Pass 2: adjectives take their gender from their noun.
  parts.forEach((part, i) => {
    if (part.kind !== 'dict' || part.dict.type !== 'adjective') return;
    const gender = part.ref ? grammar[part.refIndex].gender : 'm';
    texts[i] = gender === 'f' ? picks[i].forms.f : picks[i].forms.m;
  });

  return texts.flatMap((text) => String(text).split(/\s+/)).filter(Boolean);
}

function combinations(parts, alliterate) {
  let fixed = 1;
  const lists = [];
  for (const part of parts) {
    if (part.kind === 'num') fixed *= 9 * 10 ** (part.size - 1);
    else if (part.kind === 'hex') fixed *= 16 ** part.size;
    else if (part.kind === 'pseudo') fixed *= pseudoSpace(part.size);
    else if (part.kind === 'dict') lists.push(part.entries);
  }
  if (lists.length === 0) return fixed;
  if (!alliterate) return lists.reduce((total, list) => total * list.length, fixed);

  const groups = lists.map(groupByInitial);
  let total = 0;
  for (const letter of commonLetters(groups)) {
    total += groups.reduce((product, g) => product * g.get(letter).length, 1);
  }
  return total * fixed;
}

// ================================================================== factory

/**
 * @param {object} [options]
 * @param {Array}  [options.dictionaries]   dictionaries (defineDictionary result or definition)
 * @param {object} [options.patterns]       { id: "{template}" | { template, alliterate, format, asciiExtended, description } }
 * @param {string|number} [options.seed]    seed for the generator's own sequence
 * @param {boolean} [options.asciiExtended]  keep accents (default false: plain ASCII)
 * @param {string} [options.format]         kebab (default), snake, camel, pascal, title, space or a function
 * @param {string} [options.defaultPattern] pattern used when generate() gets none
 */
export function createGenerator(options = {}) {
  const dictionaries = new Map();
  const patterns = new Map();
  const linkCache = new Map();
  const rng = createRng(options.seed);
  const defaults = { format: options.format ?? 'kebab', asciiExtended: options.asciiExtended ?? false };

  function resolve(spec) {
    const target = spec ?? options.defaultPattern;
    let def;
    if (typeof target === 'string') {
      if (target.includes('{')) {
        def = { template: target };
      } else {
        def = patterns.get(target);
        if (!def) {
          const available = [...patterns.keys()].join(', ') || '(none)';
          throw new Error(`Pattern "${target}" not found. Available: ${available}`);
        }
      }
    } else if (target && typeof target.template === 'string') {
      def = target;
    } else {
      throw new TypeError('Give a registered pattern, a template with {braces} or an object { template }');
    }

    let linked = linkCache.get(def.template);
    if (!linked) {
      linked = link(parseTemplate(def.template), dictionaries);
      linkCache.set(def.template, linked);
    }
    return { def, linked };
  }

  function produce(spec, r, opts, seen) {
    const { def, linked } = resolve(spec);
    const alliterate = opts.alliterate ?? def.alliterate ?? false;
    const format = opts.format ?? def.format ?? defaults.format;
    const asciiExtended = opts.asciiExtended ?? def.asciiExtended ?? defaults.asciiExtended;

    // Without `seen` one attempt is enough. With `seen`, the last free name of a pattern with
    // N combinations takes N draws on average, so attempts scale with capacity.
    const attempts = seen
      ? Math.min(MAX_UNIQUE_ATTEMPTS_CAP, Math.max(MAX_UNIQUE_ATTEMPTS, combinations(linked, alliterate) * 30))
      : 1;

    for (let attempt = 0; attempt < attempts; attempt++) {
      const name = joinWords(compose(linked, r, alliterate), format, asciiExtended);
      if (!seen) return name;
      if (!seen.has(name)) {
        seen.add(name);
        return name;
      }
    }
    throw new Error('No unused names left for this pattern: add more words or ask for fewer');
  }

  const generator = {
    addDictionary(dictionary) {
      const dict = isDictionary(dictionary) ? dictionary : defineDictionary(dictionary);
      dictionaries.set(dict.name, dict);
      linkCache.clear();
      return generator;
    },

    addPattern(id, definition) {
      const def = typeof definition === 'string' ? { template: definition } : { ...definition };
      parseTemplate(def.template); // fail early on invalid syntax
      patterns.set(id, Object.freeze(def));
      linkCache.clear();
      return generator;
    },

    /** One name. With `seed` it is a pure function: same seed, same name. */
    generate(spec, opts = {}) {
      const r = opts.seed !== undefined ? createRng(opts.seed) : rng;
      return produce(spec, r, opts, null);
    },

    /** `count` names. With `unique: true` no two are equal within the batch. */
    generateMany(spec, count, opts = {}) {
      if (!Number.isInteger(count) || count < 0) {
        throw new RangeError('count must be an integer >= 0');
      }
      const r = opts.seed !== undefined ? createRng(opts.seed) : rng;
      let seen = null;
      if (opts.unique) {
        const total = generator.capacity(spec, opts);
        if (count > total) {
          throw new RangeError(`Asked for ${count} unique names but the pattern only allows ${total} combinations`);
        }
        seen = new Set();
      }
      return Array.from({ length: count }, () => produce(spec, r, opts, seen));
    },

    /** Unformatted words, e.g. ['fox', 'calm']. */
    words(spec, opts = {}) {
      const { def, linked } = resolve(spec);
      const r = opts.seed !== undefined ? createRng(opts.seed) : rng;
      return compose(linked, r, opts.alliterate ?? def.alliterate ?? false);
    },

    /** Number of distinct combinations a pattern allows. */
    capacity(spec, opts = {}) {
      const { def, linked } = resolve(spec);
      return combinations(linked, opts.alliterate ?? def.alliterate ?? false);
    },

    get dictionaries() {
      return [...dictionaries.values()].map((d) => ({ name: d.name, type: d.type, size: d.entries.length }));
    },

    get patterns() {
      return Object.fromEntries([...patterns].map(([id, def]) => [id, def]));
    },
  };

  for (const dictionary of options.dictionaries ?? []) generator.addDictionary(dictionary);
  for (const [id, definition] of Object.entries(options.patterns ?? {})) generator.addPattern(id, definition);

  return generator;
}

// ------------------------------------------------------------- locale API
// Turns locale packs into the public API (createGenerator, generate, generateMany). Shared by the basic
// entry point (index.js) and the full one (full.js): they only differ in the packs they pass.

export function createApi(locales) {
  /**
   * Generator with a locale pack loaded (default 'en'). `locale: null` gives an empty generator.
   * Your own `dictionaries` and `patterns` are added on top of the pack.
   */
  function createLocaleGenerator(options = {}) {
    const { locale = 'en', dictionaries = [], patterns = {}, ...rest } = options;
    if (locale === null) return createGenerator({ ...rest, dictionaries, patterns });
    const pack = locales[locale];
    if (!pack) throw new RangeError(`Unknown locale "${locale}". Available: ${Object.keys(locales).join(', ')}`);
    return createGenerator({
      ...rest,
      dictionaries: [...pack.dictionaries, ...dictionaries],
      patterns: { ...pack.presets, ...patterns },
    });
  }

  const shared = new Map();
  function sharedFor(locale = 'en') {
    if (!shared.has(locale)) shared.set(locale, createLocaleGenerator({ locale, defaultPattern: 'animal-adjective' }));
    return shared.get(locale);
  }

  /** One name. `generate('animal-adjective', { locale: 'en', seed: 7 })` is deterministic. */
  function generate(spec, { locale, ...opts } = {}) {
    return sharedFor(locale).generate(spec, opts);
  }
  /** Several names. */
  function generateMany(spec, count, { locale, ...opts } = {}) {
    return sharedFor(locale).generateMany(spec, count, opts);
  }

  return { createGenerator: createLocaleGenerator, generate, generateMany };
}
