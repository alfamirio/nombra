import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createGenerator, defineDictionary, generate, locales } from '../src/full.js';
import * as basic from '../src/index.js';
import { joinWords, stripDiacritics } from '../src/core.js';
import { run } from '../src/cli.js';
import { cities, countries } from '../src/locales/en.js';
import { feminine, inferGender, morphology } from '../src/locales/es.js';

const normalize = (text) => stripDiacritics(text).toLowerCase();

// =====================================================================================
// GLOBAL (English is the default locale and the reference for every other locale)
// =====================================================================================

describe('global: engine', () => {
  const animals = defineDictionary({
    name: 'animal', type: 'noun',
    entries: ['fox', 'otter', 'lynx#feline', 'owl#flying'],
  });
  const adjectives = defineDictionary({ name: 'adj', type: 'adjective', entries: ['olive', 'happy', 'calm'] });
  const make = (options = {}) => createGenerator({ locale: null, dictionaries: [animals, adjectives], ...options });
  const T = '{animal} {adj}';

  test('same seed → same name; different seeds vary', () => {
    const g = make();
    assert.equal(g.generate(T, { seed: 'abc' }), g.generate(T, { seed: 'abc' }));
    assert.ok(new Set(Array.from({ length: 30 }, (_, i) => g.generate(T, { seed: i }))).size > 3);
  });

  test('two generators with the same seed give the same sequence', () => {
    assert.deepEqual(make({ seed: 99 }).generateMany(T, 10), make({ seed: 99 }).generateMany(T, 10));
  });

  test('without morphology words are invariable', () => {
    const g = make();
    const allowed = ['olive', 'happy', 'calm'];
    for (let seed = 0; seed < 50; seed++) assert.ok(allowed.includes(g.words('{animal} {adj@animal}', { seed })[1]));
  });

  test('tags filter a dictionary', () => {
    const g = make();
    for (let seed = 0; seed < 20; seed++) assert.equal(g.words('{animal#feline}', { seed })[0], 'lynx');
  });

  test('formats', () => {
    const g = make();
    const words = g.words(T, { seed: 3 });
    assert.equal(g.generate(T, { seed: 3, format: 'snake' }), words.join('_'));
    assert.equal(g.generate(T, { seed: 3, format: 'space' }), words.join(' '));
    assert.throws(() => g.generate('{animal}', { format: 'nope' }), /Unknown format/);
    assert.ok(g.generate('{animal}', { seed: 1, format: (w) => `<${w[0]}>` }).startsWith('<'));
  });

  test('accents are removed by default; asciiExtended keeps them', () => {
    const g = createGenerator({ locale: null, dictionaries: [defineDictionary({ name: 'x', entries: ['zürich'] })] });
    assert.equal(g.generate('{x}'), 'zurich');
    assert.equal(g.generate('{x}', { format: 'title' }), 'Zurich');
    assert.equal(g.generate('{x}', { asciiExtended: true }), 'zürich');
    assert.equal(g.generate('{x}', { format: 'title', asciiExtended: true }), 'Zürich');
  });

  test('alliteration: all words share the initial', () => {
    const g = createGenerator();
    for (let seed = 0; seed < 100; seed++) {
      const [a, b] = g.words('animal-adjective', { seed, alliterate: true });
      assert.equal(a.normalize('NFD')[0], b.normalize('NFD')[0]);
    }
    const none = createGenerator({
      locale: null,
      dictionaries: [defineDictionary({ name: 'a', entries: ['one'] }), defineDictionary({ name: 'b', entries: ['two'] })],
    });
    assert.throws(() => none.generate('{a} {b}', { alliterate: true }), /no initial letter/);
  });

  test('unique: whole batch without repeats, up to full capacity, any seed', () => {
    const g = make();
    const total = g.capacity(T); // 12
    for (let seed = 0; seed < 100; seed++) {
      assert.equal(new Set(g.generateMany(T, total, { unique: true, seed })).size, total);
    }
    assert.throws(() => g.generateMany('{animal}', 5, { unique: true }), RangeError);
  });

  test('capacity counts combinations', () => {
    const g = make();
    assert.equal(g.capacity(T), 12);
    assert.equal(g.capacity('{animal} {adj} {num:2}'), 12 * 90);
    assert.equal(g.capacity(T, { alliterate: true }), 2); // (otter, owl) × olive
  });

  test('num, hex and pseudo respect their size', () => {
    const g = make();
    assert.match(g.words('{num:6}', { seed: 1 })[0], /^[1-9]\d{5}$/);
    assert.match(g.words('{hex:8}', { seed: 1 })[0], /^[0-9a-f]{8}$/);
    assert.match(g.words('{pseudo:3}', { seed: 1 })[0], /^([bdfgklmnprstvz][aeiou]){3}$/);
  });

  test('template and dictionary errors', () => {
    const g = make();
    assert.throws(() => g.generate('{nothing}'), /not registered/);
    assert.throws(() => g.generate('{animal} {adj@zzz}'), /no \{zzz\} part/);
    assert.throws(() => g.generate('{animal'), /Unclosed/);
    assert.throws(() => g.generate('{animal|pl}'), /Modifiers are not supported/);
    assert.throws(() => g.generate('{animal#nope}'), /no entry/);
    assert.throws(() => g.generate('{num:99}'), /between 1 and 12/);
    assert.throws(() => g.generate('{animal:3}'), /only num, hex and pseudo/);
    assert.throws(() => g.generate('{adj@adj}'), /also an adjective/);
    assert.throws(() => g.generate('no-such-pattern'), /not found/);
    assert.throws(() => g.generate(), /Give a registered pattern/);
    assert.throws(() => createGenerator({ locale: 'fr' }), /Unknown locale/);
  });

  test('defineDictionary validates', () => {
    assert.throws(() => defineDictionary({ name: 'x', entries: [] }), /at least one/);
    assert.throws(() => defineDictionary({ name: 'x', entries: ['a', 'a'] }), /duplicate/);
    assert.throws(() => defineDictionary({ name: 'x', type: 'noun', entries: ['a:z'] }), /invalid gender/);
    assert.throws(() => defineDictionary({ name: 'x y', entries: ['a'] }), /Invalid dictionary name/);
  });

  test('custom patterns and default pattern', () => {
    const g = make({ patterns: { mine: { template: T, format: 'snake' } }, defaultPattern: 'mine' });
    assert.match(g.generate(), /^[a-z]+_[a-z]+$/);
    assert.deepEqual(Object.keys(g.patterns), ['mine']);
  });

  test('English is the default locale; own words go on top of the pack', () => {
    assert.deepEqual(Object.keys(locales), ['en', 'es']);
    assert.deepEqual(createGenerator().generateMany('animal-adjective', 5, { seed: 1 }), createGenerator({ locale: 'en' }).generateMany('animal-adjective', 5, { seed: 1 }));
    assert.match(generate('animal-adjective', { seed: 1 }), /^[a-z]+-[a-z]+$/);
    assert.equal(generate('animal-adjective', { seed: 1 }), generate('animal-adjective', { locale: 'en', seed: 1 }));
    const g = createGenerator({
      locale: 'en',
      dictionaries: [defineDictionary({ name: 'planet', entries: ['mars', 'venus'] })],
      patterns: { mission: '{planet} {animal}' },
    });
    assert.match(g.generate('mission'), /^(mars|venus)-[a-z]+$/);
    assert.ok(g.capacity('animal-adjective') > 0);
  });
});

describe('global: every locale follows the same contract', () => {
  test('each locale has the same eight roles and enough entries', () => {
    for (const [locale, pack] of Object.entries(locales)) {
      assert.equal(pack.dictionaries.length, 8, locale);
      for (const dict of pack.dictionaries) assert.ok(dict.entries.length >= 20, `${locale}/${dict.name}`);
    }
  });

  test('every entry gives a clean kebab name', () => {
    for (const [locale, pack] of Object.entries(locales)) {
      for (const dict of pack.dictionaries) {
        for (const entry of dict.entries) {
          const forms = dict.type === 'adjective' ? [entry.forms.m, entry.forms.f] : [entry.text];
          for (const form of forms) {
            const slug = joinWords(form.split(/\s+/), 'kebab');
            assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${locale}/${dict.name}: "${form}" → "${slug}"`);
          }
        }
      }
    }
  });

  // One vocabulary for templates: the same dictionary names and the same tags in every locale.
  // English is the reference.
  test('every locale uses the same dictionary names, types and tags as English', () => {
    const shape = (pack) =>
      pack.dictionaries.map((d) => ({ name: d.name, type: d.type, tags: [...new Set(d.entries.flatMap((e) => e.tags))].sort() }));
    assert.deepEqual(shape(locales.en).map((d) => d.name), ['animal', 'adjective', 'thing', 'color', 'city', 'fruit', 'plant', 'country']);
    for (const [locale, pack] of Object.entries(locales)) assert.deepEqual(shape(pack), shape(locales.en), locale);
  });

  test('cities: known tags only, all used, no accent-insensitive duplicates', () => {
    const allowed = ['europe', 'asia', 'africa', 'america', 'oceania', 'capital', 'port', 'island', 'historic', 'hispanic'];
    for (const [locale, pack] of Object.entries(locales)) {
      const dict = pack.dictionaries.find((d) => d.name === 'city');
      const used = new Set(dict.entries.flatMap((e) => e.tags));
      for (const tag of used) assert.ok(allowed.includes(tag), `${locale}: unknown #${tag}`);
      for (const tag of allowed) assert.ok(used.has(tag), `${locale}: #${tag} has no entries`);
      const seen = new Set(dict.entries.map((e) => normalize(e.text)));
      assert.equal(seen.size, dict.entries.length, `${locale}: duplicates`);
    }
  });

  test('the shared city list is keyed in English', () => {
    const keys = cities.map((raw) => raw.split('#')[0].split(':')[0]);
    assert.deepEqual(locales.en.city.entries.map((e) => e.text), keys);
    for (const english of ['london', 'rome', 'new york', 'tokyo', 'mexico city', 'saint petersburg']) assert.ok(keys.includes(english), english);
    for (const spanish of ['londres', 'roma', 'nueva york', 'tokio', 'ciudad de méxico', 'san petersburgo']) assert.ok(!keys.includes(spanish), spanish);
  });

  // Slug formats strip everything but letters and digits, so a hyphen inside a name would be squashed.
  test('multi-word names use spaces, not hyphens or apostrophes', () => {
    for (const pack of Object.values(locales)) {
      for (const entry of pack.city.entries) assert.ok(!/[-']/.test(entry.text), entry.text);
      assert.ok(pack.city.entries.some((e) => e.text === 'buenos aires'));
    }
  });

  test('guard: every city in the shared list has a gender and a continent', () => {
    const continents = ['europe', 'asia', 'africa', 'america', 'oceania'];
    for (const raw of cities) {
      const [head, ...tags] = raw.split('#');
      assert.match(head, /^[^:]+:[mf]$/, raw);
      assert.ok(tags.some((tag) => continents.includes(tag)), raw);
    }
  });

  test('{adjective#weather} gives weather words in every locale', () => {
    const expected = { en: ['sunny', 'rainy', 'snowy', 'stormy'], es: ['soleado', 'lluvioso', 'nevado', 'tormentoso'] };
    for (const [locale, pack] of Object.entries(locales)) {
      const weather = new Set(pack.adjective.entries.filter((e) => e.tags.includes('weather')).map((e) => e.text));
      for (const word of expected[locale]) assert.ok(weather.has(word), `${locale}: ${word}`);
      assert.ok(weather.size >= 10 && weather.size < pack.adjective.entries.length, locale);
      const forms = new Set(pack.adjective.entries.filter((e) => e.tags.includes('weather')).flatMap((e) => [e.forms.m, e.forms.f]));
      const g = createGenerator({ locale });
      const template = locale === 'en' ? '{adjective#weather} {city}' : '{city} {adjective#weather@city}';
      for (let seed = 0; seed < 60; seed++) {
        const words = g.words(template, { seed });
        assert.ok(forms.has(locale === 'en' ? words[0] : words.at(-1)), `${locale}: ${words.join(' ')}`);
      }
    }
  });

  // A tag with a handful of entries gives names that repeat too fast to be useful.
  test('every tag has at least 10 entries in every locale', () => {
    for (const [locale, pack] of Object.entries(locales)) {
      for (const dict of pack.dictionaries) {
        const counts = new Map();
        for (const entry of dict.entries) for (const tag of entry.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
        for (const [tag, n] of counts) assert.ok(n >= 10, `${locale}/${dict.name}#${tag} has only ${n} entries`);
      }
    }
  });

  test('every locale has the expected tags per dictionary', () => {
    const expected = {
      animal: ['bird', 'insect', 'mammal', 'marine', 'reptile'],
      adjective: ['mood', 'speed', 'weather'],
      thing: ['nature', 'sound'],
      color: ['gem', 'metal'],
      city: ['africa', 'america', 'asia', 'capital', 'europe', 'hispanic', 'historic', 'island', 'oceania', 'port'],
      fruit: ['berry', 'citrus', 'orchard', 'tropical'],
      plant: ['flower', 'herb', 'tree'],
      country: ['africa', 'america', 'asia', 'europe', 'hispanic', 'island', 'oceania'],
    };
    for (const [locale, pack] of Object.entries(locales)) {
      for (const dict of pack.dictionaries) {
        const tags = [...new Set(dict.entries.flatMap((e) => e.tags))].sort();
        assert.deepEqual(tags, expected[dict.name], `${locale}/${dict.name}`);
      }
    }
  });

  test('countries: shared English-keyed list, unique, explicit gender, Spanish spellings', () => {
    assert.equal(new Set(countries.map((c) => c.split(/[:#]/)[0])).size, countries.length);
    for (const raw of countries) assert.match(raw, /^[a-z ]+:[mf]#/, raw);
    const es = createGenerator({ locale: 'es' });
    assert.equal(es.generate('{country#hispanic} {adjective@country}', { seed: 3 }).split('-').length, 2);
    const names = locales.es.dictionaries.find((d) => d.name === 'country').entries.map((e) => e.text);
    for (const name of ['españa', 'japón', 'méxico', 'corea del sur', 'brasil']) assert.ok(names.includes(name), name);
  });

  test('fruit and plant: same words in the tagged groups, no accent-insensitive duplicates', () => {
    for (const [locale, pack] of Object.entries(locales)) {
      for (const name of ['fruit', 'plant', 'country']) {
        const dict = pack.dictionaries.find((d) => d.name === name);
        const seen = new Set(dict.entries.map((e) => normalize(e.text)));
        assert.equal(seen.size, dict.entries.length, `${locale}/${name}: duplicates`);
      }
    }
  });

  test('every locale defines the same preset ids', () => {
    const ids = (l) => Object.keys(locales[l].presets).sort();
    for (const locale of Object.keys(locales)) assert.deepEqual(ids(locale), ids('en'), locale);
  });

  // Same keywords in every language: only the locale changes the words (and gender agreement).
  test('the same template works in every locale', () => {
    const templates = ['{animal#marine} {adjective@animal}', '{city#hispanic} {adjective@city}', '{thing} {color@thing} {hex:4}', '{animal#mammal} {adjective#speed@animal}', '{thing#sound} {color#gem@thing}', '{fruit#tropical} {adjective@fruit}', '{plant#herb} {adjective@plant}', '{country#island} {adjective@country}'];
    for (const locale of Object.keys(locales)) {
      const g = createGenerator({ locale });
      for (const template of templates) {
        const name = g.generate(template, { seed: 5 });
        assert.match(name, /^[a-z0-9]+(-[a-z0-9]+)+$/, `${locale}: ${template} → ${name}`);
      }
    }
    const en = createGenerator({ locale: 'en' });
    const es = createGenerator({ locale: 'es' });
    assert.notEqual(es.generate('{animal} {adjective@animal}', { seed: 5 }), en.generate('{animal} {adjective@animal}', { seed: 5 }));
  });

  test('every preset has a template and a description', () => {
    for (const [locale, pack] of Object.entries(locales)) {
      for (const [id, preset] of Object.entries(pack.presets)) {
        assert.match(id, /^[a-z]+(-[a-z]+)*$/, id);
        assert.ok(preset.template.includes('{'), `${locale}/${id}: template has no parts`);
        assert.ok(preset.description?.length > 5, `${locale}/${id}: no description`);
      }
    }
  });

  // The examples in each description are the first thing users see: they must be real outputs.
  test('description examples can be generated (all locales)', () => {
    for (const locale of Object.keys(locales)) {
      const g = createGenerator({ locale });
      for (const [id, preset] of Object.entries(locales[locale].presets)) {
        const total = g.capacity(id);
        if (total > 40000) continue; // docker-style and phonetic contain random parts
        const reachable = new Set();
        for (let seed = 0; seed < total * 40 && reachable.size < total; seed++) reachable.add(g.generate(id, { seed }));
        for (const example of preset.description.replace(/\s*\(.*\)/, '').split(', ')) {
          assert.ok(reachable.has(example), `${locale}/${id}: example "${example}" cannot be generated`);
        }
      }
    }
  });

  test('every preset generates clean kebab names in every locale', () => {
    for (const locale of Object.keys(locales)) {
      const g = createGenerator({ locale, seed: 1 });
      for (const id of Object.keys(locales[locale].presets)) {
        for (let i = 0; i < 200; i++) assert.match(g.generate(id), /^[a-z0-9]+(-[a-z0-9]+)+$/, `${locale}/${id}`);
      }
    }
  });
});

describe('global: basic (nombra) and full (nombra/full) builds', () => {
  const BASIC = ['animal', 'adjective', 'thing', 'color'];
  const EXTRA = ['city', 'fruit', 'plant', 'country'];
  const EXTRA_PRESETS = ['city-adjective', 'fruit-adjective', 'plant-adjective', 'country-adjective'];
  const tagsOf = (dict) => [...new Set(dict.entries.flatMap((e) => e.tags))].sort();

  test('basic has the four everyday dictionaries, full adds the extras', () => {
    for (const locale of Object.keys(locales)) {
      assert.deepEqual(basic.locales[locale].dictionaries.map((d) => d.name), BASIC, locale);
      assert.deepEqual(locales[locale].dictionaries.map((d) => d.name), [...BASIC, ...EXTRA], locale);
      for (const name of BASIC) assert.equal(basic.locales[locale][name], locales[locale][name], `${locale}/${name} is shared`);
      for (const name of EXTRA) assert.equal(basic.locales[locale][name], undefined, `${locale}/${name} is not in basic`);
    }
    assert.deepEqual(Object.keys(basic.locales), Object.keys(locales));
  });

  test('basic presets are the full ones without the extra dictionaries', () => {
    for (const locale of Object.keys(locales)) {
      const ids = Object.keys(basic.locales[locale].presets).sort();
      assert.deepEqual(ids, Object.keys(locales[locale].presets).filter((id) => !EXTRA_PRESETS.includes(id)).sort(), locale);
      for (const id of ids) assert.deepEqual(basic.locales[locale].presets[id], locales[locale].presets[id], `${locale}/${id}`);
    }
  });

  test('extras only work in full', () => {
    for (const locale of Object.keys(locales)) {
      for (const id of EXTRA_PRESETS) {
        assert.throws(() => basic.generate(id, { locale }), `${locale}/${id}`);
        assert.ok(generate(id, { locale, seed: 1 }));
      }
      assert.throws(() => basic.generate('{country}', { locale }));
    }
  });

  test('the same seed gives the same names in both builds', () => {
    for (const locale of Object.keys(locales)) {
      for (const id of Object.keys(basic.locales[locale].presets)) {
        assert.equal(basic.generate(id, { locale, seed: 11 }), generate(id, { locale, seed: 11 }), `${locale}/${id}`);
      }
    }
  });

  test('basic tags are the same as in full', () => {
    for (const locale of Object.keys(locales)) {
      for (const name of BASIC) assert.deepEqual(tagsOf(basic.locales[locale][name]), tagsOf(locales[locale][name]));
    }
  });

  test('basic: default export, default locale and unknown locale', () => {
    assert.equal(basic.default, basic.createGenerator);
    assert.ok(basic.createGenerator().generate('animal-adjective'));
    assert.throws(() => basic.createGenerator({ locale: 'xx' }), /Unknown locale "xx"\. Available: en, es/);
  });

  test('package.json exposes both entry points', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    assert.equal(pkg.exports['.'].default, './src/index.js');
    assert.equal(pkg.exports['./full'].default, './src/full.js');
    for (const file of [pkg.exports['./full'].types, pkg.exports['./full'].default]) {
      readFileSync(new URL(`../${file}`, import.meta.url));
    }
    for (const bundle of ['nombra.min.js', 'nombra.esm.min.js', 'nombra.full.min.js', 'nombra.full.esm.min.js']) {
      assert.ok(pkg.files.includes(`dist/${bundle}`), bundle);
    }
  });
});

describe('global: English pack', () => {
  test('adjectives never change', () => {
    for (const a of locales.en.adjective.entries) assert.equal(a.forms.m, a.forms.f);
    for (const dict of locales.en.dictionaries.filter((d) => d.type === 'noun')) {
      for (const entry of dict.entries) assert.equal(entry.gender, null, `${dict.name}/${entry.text}`);
    }
  });

  test('presets put the adjective first', () => {
    assert.equal(locales.en.presets['animal-adjective'].template, '{adjective} {animal}');
    assert.equal(locales.en.presets['color-thing'].template, '{color} {thing}');
  });

  test('city tags filter', () => {
    const g = createGenerator({ locale: 'en' });
    const adjectives = new Set(locales.en.adjective.entries.map((a) => a.forms.m));
    for (let seed = 0; seed < 100; seed++) assert.ok(adjectives.has(g.words('{adjective} {city}', { seed })[0]));
    const hispanic = new Set(locales.en.city.entries.filter((e) => e.tags.includes('hispanic')).map((e) => e.text));
    for (const name of ['madrid', 'lima', 'bogota', 'havana']) assert.ok(hispanic.has(name), name);
    for (let seed = 0; seed < 50; seed++) assert.ok(hispanic.has(g.words('{city#hispanic}', { seed }).join(' ')));
  });

  test('English spellings of cities', () => {
    const names = new Set(locales.en.city.entries.map((e) => e.text));
    for (const name of ['london', 'rome', 'new york', 'tokyo', 'mexico city', 'saint petersburg']) assert.ok(names.has(name), name);
  });
});

describe('global: cli', () => {
  const BIN = new URL('../bin/nombra.js', import.meta.url).pathname;

  function cli(...argv) {
    let out = '';
    let err = '';
    const code = run(argv, { stdout: { write: (s) => (out += s) }, stderr: { write: (s) => (err += s) } });
    return { code, out, err, lines: out.split('\n').filter(Boolean) };
  }

  test('no arguments: one English kebab-case name', () => {
    const r = cli();
    assert.equal(r.code, 0);
    assert.match(r.lines[0], /^[a-z]+-[a-z]+$/);
  });

  test('-n, --seed and --locale', () => {
    const a = cli('city-adjective', '-n', '5', '--seed', '7');
    assert.equal(a.lines.length, 5);
    assert.deepEqual(a.lines, cli('city-adjective', '--count', '5', '--seed', '7').lines);
    assert.notDeepEqual(a.lines, cli('city-adjective', '-n', '5', '--seed', '8').lines);
    const expected = createGenerator({ locale: 'en' }).generateMany('animal-adjective', 3, { seed: 'x' });
    assert.deepEqual(cli('animal-adjective', '-n', '3', '-s', 'x', '-L', 'en').lines, expected);
    assert.deepEqual(cli('animal-adjective', '-n', '3', '-s', 'x').lines, expected); // English by default
    assert.equal(cli('-L', 'fr').code, 2);
    // The same template works in every language.
    const template = '{animal#marine} {adjective@animal}';
    assert.match(cli(template, '-L', 'en', '-s', 'x').lines[0], /^[a-z]+-[a-z]+$/);
  });

  test('--format; names never contain accents', () => {
    assert.match(cli('-f', 'snake', '-s', '1').lines[0], /^[a-z]+_[a-z]+$/);
    assert.match(cli('-f', 'title', '-s', '1').lines[0], /^[A-Z][a-z]+ [A-Z][a-z]+$/);
    for (const format of ['kebab', 'title', 'space']) assert.match(cli('-n', '300', '-f', format).out, /^[\x00-\x7f]*$/);
  });

  test('template, alliteration and unique', () => {
    assert.match(cli('{animal#marine} {adjective} {hex:4}', '-L', 'en', '-s', 'x').lines[0], /^[a-z]+-[a-z]+-[0-9a-f]{4}$/);
    for (const line of cli('-a', '-n', '50', '-s', '3').lines) {
      const [a, b] = line.split('-');
      assert.equal(a[0], b[0]);
    }
    const total = createGenerator({ locale: 'en' }).capacity('{color}');
    assert.equal(new Set(cli('{color}', '-L', 'en', '-n', String(total), '-u').lines).size, total);
    assert.equal(cli('{color}', '-L', 'en', '-n', String(total + 1), '-u').code, 1);
  });

  test('--json, --list, --version, --help', () => {
    assert.equal(JSON.parse(cli('-n', '3', '--json').out).length, 3);
    const list = JSON.parse(cli('--list', '--json', '-L', 'en').out);
    assert.equal(list.presets['animal-adjective'].template, '{adjective} {animal}');
    assert.equal(list.dictionaries.length, locales.en.dictionaries.length);
    assert.match(cli('--list').out, /Presets \(en\)[\s\S]*Dictionaries \(en\)/);
    const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
    assert.equal(cli('-v').out.trim(), version);
    assert.match(cli('--help').out, /Usage:/);
    assert.match(cli('--help').out, /en \| es \(default en\)/);
  });

  test('errors and exit codes', () => {
    assert.equal(cli('--foo').code, 2);
    assert.match(cli('--foo').err, /Unknown option/);
    assert.equal(cli('-n', '0').code, 2);
    assert.equal(cli('-n', '1.5').code, 2);
    assert.equal(cli('a', 'b').code, 2);
    const missing = cli('nope');
    assert.equal(missing.code, 1);
    assert.match(missing.err, /not found/);
  });

  test('real executable works', () => {
    const out = execFileSync(process.execPath, [BIN, '-n', '2', '-s', '1'], { encoding: 'utf8' });
    assert.equal(out.trim().split('\n').length, 2);
    assert.equal(spawnSync(process.execPath, [BIN, '--foo'], { encoding: 'utf8' }).status, 2);
  });

  // Needs a POSIX shell (`sh`, `head`, /dev/null).
  test('closes the pipe cleanly (EPIPE)', { skip: process.platform === 'win32' }, () => {
    const piped = spawnSync('sh', ['-c', `"${process.execPath}" "${BIN}" -n 200000 | head -1 > /dev/null`], { encoding: 'utf8' });
    assert.doesNotMatch(piped.stderr, /EPIPE|Unhandled/);
  });
});

// =====================================================================================
// SPANISH (additional locale: `es`)
// =====================================================================================

describe('es: gender agreement in the engine', () => {
  const animales = defineDictionary({
    name: 'animal', type: 'noun', morphology,
    entries: ['zorro', 'ardilla', 'lince:m#felino', 'ave:f#volador'],
  });
  const adjetivos = defineDictionary({ name: 'adj', type: 'adjective', morphology, entries: ['sereno', 'feliz', 'audaz'] });
  const g = createGenerator({ locale: null, dictionaries: [animales, adjetivos] });

  test('adjectives agree in gender', () => {
    for (let seed = 0; seed < 100; seed++) {
      const [animal, adj] = g.words('{animal} {adj@animal}', { seed });
      if (animal === 'ardilla') assert.ok(['serena', 'feliz', 'audaz'].includes(adj));
      if (animal === 'zorro') assert.ok(['sereno', 'feliz', 'audaz'].includes(adj));
    }
  });

  test('accents are removed by default; asciiExtended keeps them', () => {
    const accents = createGenerator({ locale: null, dictionaries: [defineDictionary({ name: 'x', entries: ['cádiz', 'ñandú'] })] });
    assert.deepEqual(accents.generateMany('{x}', 20, { seed: 1 }).filter((n) => /[^a-z]/.test(n)), []);
    assert.ok(accents.generateMany('{x}', 20, { seed: 1, asciiExtended: true }).some((n) => /[áñú]/.test(n)));
  });
});

describe('es: morphology', () => {
  test('feminine and gender inference', () => {
    const cases = { sereno: 'serena', capitán: 'capitana', pintor: 'pintora', juguetón: 'juguetona', bailarín: 'bailarina', feliz: 'feliz', valiente: 'valiente' };
    for (const [m, f] of Object.entries(cases)) assert.equal(feminine(m), f);
    for (const w of ['zorro', 'faro', 'delfín', 'reloj']) assert.equal(inferGender(w), 'm', w);
    for (const w of ['ardilla', 'canción', 'ciudad', 'pasión']) assert.equal(inferGender(w), 'f', w);
  });

  test('metal and gem colors keep their form in the feminine', () => {
    const forms = new Map(locales.es.color.entries.map((e) => [e.text, e.forms]));
    for (const word of ['acero', 'hierro', 'platino', 'cromo', 'latón', 'zafiro', 'ópalo', 'topacio']) assert.equal(forms.get(word).f, word, word);
    assert.equal(forms.get('dorado').f, 'dorada');
    assert.equal(forms.get('plateado').f, 'plateada');
  });

  test('explicit gender in the dictionaries', () => {
    const byText = (dict, text) => dict.entries.find((e) => e.text === text);
    assert.equal(byText(locales.es.thing, 'mapa').gender, 'm');
    assert.equal(byText(locales.es.thing, 'luz').gender, 'f');
    assert.equal(byText(locales.es.animal, 'liebre').gender, 'f');
    assert.equal(byText(locales.es.animal, 'serpiente').gender, 'f');
  });
});

describe('es: dictionaries and presets', () => {
  test('Spanish cities carry an explicit gender and adjectives agree', () => {
    const g = createGenerator({ locale: 'es' });
    const cityDict = locales.es.city;
    const byText = new Map(cityDict.entries.map((e) => [e.text, e]));
    for (const e of cityDict.entries) assert.ok(e.gender === 'm' || e.gender === 'f', e.text);
    for (const [name, gender] of Object.entries({ londres: 'm', roma: 'f', tokio: 'm', lima: 'f', 'nueva york': 'f', 'ciudad de méxico': 'f' })) {
      assert.equal(byText.get(name).gender, gender, name);
    }
    const adjectives = new Map(locales.es.adjective.entries.flatMap((a) => [[a.forms.m, a], [a.forms.f, a]]));
    for (let seed = 0; seed < 400; seed++) {
      const words = g.words('{city} {adjective@city}', { seed });
      const entry = byText.get(words.slice(0, -1).join(' '));
      assert.ok(entry, words.join(' '));
      assert.equal(words.at(-1), adjectives.get(words.at(-1)).forms[entry.gender]);
    }
  });

  test('Spanish spellings of cities', () => {
    const names = new Set(locales.es.city.entries.map((e) => e.text));
    for (const name of ['londres', 'roma', 'nueva york', 'tokio', 'ciudad de méxico', 'san petersburgo', 'sevilla']) assert.ok(names.has(name), name);
    for (const name of ['london', 'rome', 'new york', 'tokyo', 'mexico city', 'saint petersburg', 'seville']) assert.ok(!names.has(name), name);
    // Same number of cities, same tags, same order as the English list.
    const tagsOf = (pack) => pack.city.entries.map((e) => e.tags.join('#'));
    assert.deepEqual(tagsOf(locales.es), tagsOf(locales.en));
  });

  test('presets put the adjective after the noun and agree with it', () => {
    assert.equal(locales.es.presets['animal-adjective'].template, '{animal} {adjective@animal}');
    assert.equal(locales.es.presets['color-thing'].template, '{thing} {color@thing}');
    assert.equal(locales.es.presets['docker-style'].template, '{animal} {adjective@animal} {num}');
  });
});

describe('es: cli', () => {
  function cli(...argv) {
    let out = '';
    let err = '';
    const code = run(argv, { stdout: { write: (s) => (out += s) }, stderr: { write: (s) => (err += s) } });
    return { code, out, err, lines: out.split('\n').filter(Boolean) };
  }

  test('--locale es', () => {
    const expected = createGenerator({ locale: 'es' }).generateMany('animal-adjective', 3, { seed: 'x' });
    assert.deepEqual(cli('animal-adjective', '-n', '3', '-s', 'x', '-L', 'es').lines, expected);
    assert.match(cli('{animal#marine} {adjective@animal}', '-L', 'es', '-s', 'x').lines[0], /^[a-z]+-[a-z]+$/);
  });

  test('names have no accents unless --ascii-extended', () => {
    assert.match(cli('-L', 'es', '-n', '300', '--ascii-extended').out, /[áéíóúñ]/);
    assert.doesNotMatch(cli('-L', 'es', '-n', '300').out, /[^\x00-\x7f]/);
  });

  test('--list -L es', () => {
    const list = JSON.parse(cli('--list', '--json', '-L', 'es').out);
    assert.equal(list.locale, 'es');
    assert.equal(list.presets['animal-adjective'].template, '{animal} {adjective@animal}');
    assert.match(cli('--list', '-L', 'es').out, /Presets \(es\)[\s\S]*Dictionaries \(es\)/);
  });
});
