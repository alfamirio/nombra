# nombra

Name generator built from **patterns** (`animal + adjective`…) with seeds and word lists in **English** (default) and **Spanish** (with gender agreement). No dependencies; works in Node ≥ 20 and in the browser (ESM).

```js
import { generate, generateMany } from 'nombra';

generate('animal-adjective');                       // "nimble-otter"         (en by default)
generate('animal-adjective', { locale: 'es' });     // "lince-nomada"
generateMany('animal-adjective', 3);                // ["calm-otter", "brave-fox", …]
generate('thing-adjective', { seed: 7 });           // always the same name for the same seed
```

## Basic and full

Two builds, same API, same locales:

| | `nombra` (basic) | `nombra/full` |
|---|---|---|
| Dictionaries | `animal`, `adjective`, `thing`, `color` | basic + `city`, `country`, `fruit`, `plant` |
| Presets | `animal-adjective`, `thing-adjective`, `color-thing`, `docker-style`, `phonetic` | basic + `city-adjective`, `fruit-adjective`, `plant-adjective`, `country-adjective` |
| Browser bundle | `dist/nombra.min.js` | `dist/nombra.full.min.js` |

```js
import { generate } from 'nombra';                  // basic
import { generate as generateFull } from 'nombra/full';

generateFull('city-adjective', { locale: 'es' });   // "roma-serena"
```

The same preset and seed give the same name in both builds. The CLI and the demo use the full build. Things marked **(full)** below do not exist in the basic build.

## Presets

Same ids in every locale; the word order is each language's own.

| Preset | `en` template | `es` template |
|---|---|---|
| `animal-adjective` | `{adjective} {animal}` | `{animal} {adjective@animal}` |
| `thing-adjective` | `{adjective} {thing}` | `{thing} {adjective@thing}` |
| `color-thing` | `{color} {thing}` | `{thing} {color@thing}` |
| `city-adjective` (full) | `{adjective} {city}` | `{city} {adjective@city}` |
| `fruit-adjective` (full) | `{adjective} {fruit}` | `{fruit} {adjective@fruit}` |
| `plant-adjective` (full) | `{adjective} {plant}` | `{plant} {adjective@plant}` |
| `country-adjective` (full) | `{adjective} {country}` | `{country} {adjective@country}` |
| `docker-style` | `{adjective} {animal} {num}` | `{animal} {adjective@animal} {num}` |
| `phonetic` | `{pseudo:2} {pseudo:2}` | `{pseudo:2} {pseudo:2}` |

Every locale has the same dictionaries and tags, so **a template means the same in every language**: only `locale` changes the words. Word order is yours: adjective before the noun in English, `{adjective@animal}` after it in Spanish.

## Templates

You can pass a template instead of a preset. Parts are separated by spaces.

| Syntax | Meaning |
|---|---|
| `{animal}` | Random entry from the dictionary |
| `{animal#marine}` | Only entries with that tag (`{animal#bird#marine}` needs both) |
| `{adjective@animal}` | Adjective that agrees in gender with the `{animal}` part (Spanish; harmless no-op in English) |
| `{num}` / `{num:6}` | N-digit number (default 4, no leading zero) |
| `{hex:6}` | N hex characters |
| `{pseudo:3}` | Pronounceable made-up word of N syllables |
| `of` | Literal text |

```js
generate('{city#oceania} {animal#marine}');                                        // "sydney-narwhal"
generate('{city#hispanic} {adjective@city}', { locale: 'es' });                    // "lima-serena"
generate('{animal#marine} {adjective@animal}', { locale: 'es', seed: 3 });         // same template works in 'en' too
```

Tags (the same in every locale, each with at least 10 entries; a test enforces it):

| Dictionary | Tags |
|---|---|
| `animal` | `#mammal` `#bird` `#marine` `#insect` `#reptile` (reptiles and amphibians) |
| `adjective` | `#weather` `#speed` `#mood` |
| `thing` | `#nature` `#sound` |
| `color` | `#metal` `#gem` |
| `city` (full) | `#europe` `#asia` `#africa` `#america` `#oceania` `#capital` `#port` `#island` `#historic` `#hispanic` |
| `fruit` (full) | `#citrus` `#berry` `#tropical` `#orchard` |
| `plant` (full) | `#tree` `#flower` `#herb` |
| `country` (full) | `#europe` `#asia` `#africa` `#america` `#oceania` `#island` `#hispanic` |

Tags go before the agreement: `{animal#mammal} {adjective#speed@animal}`. City and country names are spelled in each language (`londres`, `corea del sur`).

## Options

- `locale`: `'en'` (default) or `'es'`.
- `seed`: with a seed on the call, `generate` is a pure function (same seed, same name). On `createGenerator({ seed })` it fixes the *sequence*.
- `format`: `kebab` (default), `snake`, `camel`, `pascal`, `title`, `space` or a function `(words) => string`.
- `asciiExtended`: `false` by default, so names are plain ASCII (`ñ` → `n`, `ü` → `u`) in every format. Set `true` to keep accents (`ruiseñor-enérgico`). CLI: `--ascii-extended`.
- `alliterate`: all words start with the same letter.
- `unique` (in `generateMany`): no repeats within the batch; throws if you ask for more than `capacity(pattern)`.

## Your own dictionaries and patterns

```js
import { createGenerator, defineDictionary } from 'nombra';

const planet = defineDictionary({ name: 'planet', entries: ['mercury', 'venus', 'mars'] });

const gen = createGenerator({
  locale: 'en',                       // pack loaded first (default); `null` gives an empty generator
  dictionaries: [planet],
  patterns: { mission: { template: '{planet} {adjective} {animal}', format: 'snake' } },
});
gen.generate('mission');              // "venus_calm_otter"
```

| `type` | Use | Entries |
|---|---|---|
| `noun` | Nouns, optional gender | `"fox"`, `"mapa:m"`, `"delfín:m#marine"` |
| `adjective` | Words that agree with a noun | `"sereno"`, `"marrón\|marrón"` (explicit feminine) |
| `plain` (default) | Standalone words | `"zaragoza"` |

Gender and feminine forms come from the dictionary's `morphology` (`{ feminine, inferGender }`); without it words are invariable, as in English. The Spanish rules are at the top of `src/locales/es.js`; exceptions go in the entry (`mapa:m`).

### Adding a language

Create `src/locales/<code>.js` that exports `basic` and `full` packs (use `src/locales/en.js` as a model; `es.js` shows how to add morphology), and register them in `src/index.js` (basic) and `src/full.js` (full). Keep the extra dictionaries marked `/* @__PURE__ */` and out of `basic`, and avoid object spread inside `basic`: that is what lets the basic bundle drop them (`npm run build:dist` fails if it does not). English is the reference: use the same preset ids, dictionary names and tags, so templates stay portable; the "global" tests in `test/nombra.test.js` enforce it, and your language's own tests go in a separate `describe` after them. The city and country lists are in `src/locales/en.js`, keyed in English: import them and add a small map for the names your language spells differently (see `NAMES` and `COUNTRY_NAMES` in `src/locales/es.js`).

## Import only what you need

```js
import * as en from 'nombra/locales/en';
import { createGenerator } from 'nombra/core';

const gen = createGenerator({ dictionaries: en.dictionaries, patterns: en.presets });
```
`nombra/locales/en` is the basic pack; `en.full` is the full one. `sideEffects: false` allows tree-shaking.

## Browser (single file)

```html
<script src="https://cdn.jsdelivr.net/npm/nombra@0.1.0/dist/nombra.min.js"></script>   <!-- basic; nombra.full.min.js for everything -->
<script>
  Nombra.generate('animal-adjective', { locale: 'en' });
</script>

<script type="module">
  import { generate } from 'https://cdn.jsdelivr.net/npm/nombra@0.1.0/dist/nombra.esm.min.js';
</script>
```

Four bundles: `nombra.min.js` / `nombra.esm.min.js` (basic) and `nombra.full.min.js` / `nombra.full.esm.min.js` (full), all with both locales. `npm run build:dist` builds them and checks that the basic ones carry no extra words.

## CLI

```bash
npx nombra                                  # one name
npx nombra city-adjective -n 5              # five names
npx nombra animal-adjective -L es -s 7      # Spanish, fixed seed
npx nombra docker-style -f snake
npx nombra '{animal#marine} {adjective} {hex:4}'
npx nombra --list -L es                     # presets and dictionaries
```

Flags: `-n` count, `-s` seed, `-L` locale, `-f` format, `-a` alliterate, `-u` unique, `--ascii-extended`, `--json`, `-l` list; `--help` shows them all. Exit code `0` on success, `1` if generation fails (unknown pattern, not enough unique names…), `2` for bad arguments. Works in pipes: `nombra -n 1000 | head`.

## Demo

`docs/index.html` is a single-file page (no build step). A sticky top bar holds the language, the edition (basic or full) and a red bin that deletes the saved settings, which are remembered in `localStorage`. It runs the full bundle; the basic edition is the same packs reduced to the basic dictionaries.

Published site: GitHub Pages serves `docs/` with the `nombra.full.min.js` attached to the **latest GitHub release** (the Pages job in `.github/workflows/ci.yml` copies it next to the page on every push to `main`). Locally the page falls back to your own build:

```bash
npm install && npm run build:dist     # re-run after changing src/
python3 -m http.server 8000           # then open http://localhost:8000/docs/
```

## API

- `createGenerator(options?)` → generator. Methods: `generate`, `generateMany`, `words`, `capacity`, `addDictionary`, `addPattern`, `dictionaries`, `patterns`.
- `generate(pattern?, opts?)`, `generateMany(pattern, n, opts?)` → shortcuts using a shared generator per locale.
- `defineDictionary({ name, type, locale, morphology, entries })`.
- `locales`, `en`, `es`, `FORMATS`, `createRng`, `hashSeed`.

TypeScript types are in `types/`.

## Known limitations

- Gender agreement covers regular cases; irregular words are explicit entries.
- Multi-word names (`new york`) are split into words when formatted (`new-york`). Write them with spaces: a hyphen inside a name is dropped by the slug formats (`stoke-on-trent` would become `stokeontrent`).

## Development

```
npm install          # only for the build (esbuild)
npm test             # node:test, no install needed (global/English tests first, then Spanish)
npm run build:dist   # dist/ bundles + sanity checks (the demo needs them)
```

## License

[MIT](LICENSE)
