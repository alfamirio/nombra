// Basic entry point (`nombra`): the four everyday dictionaries (animal, adjective, thing, color) in
// English and Spanish. For cities, countries, fruit and plants use `nombra/full`.

import { basic as en } from './locales/en.js';
import { basic as es } from './locales/es.js';
import { createApi } from './core.js';

export { defineDictionary, createRng, hashSeed, FORMATS } from './core.js';
export { en, es };

// English first: it is the default locale and the reference for the others.
export const locales = { en, es };

export const { createGenerator, generate, generateMany } = createApi(locales);

export default createGenerator;
