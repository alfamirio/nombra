// Full entry point (`nombra/full`): everything in `nombra` plus the extra dictionaries (city, country,
// fruit, plant). Same API; only the locale packs are bigger.

import { full as en } from './locales/en.js';
import { full as es } from './locales/es.js';
import { createApi } from './core.js';

export { defineDictionary, createRng, hashSeed, FORMATS } from './core.js';
export { en, es };

export const locales = { en, es };

export const { createGenerator, generate, generateMany } = createApi(locales);

export default createGenerator;
