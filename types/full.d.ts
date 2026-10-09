// Types of `nombra/full`: the same API as `nombra`, with bigger locale packs.
import type { Dictionary, Locale, LocalePack } from './index.js';
import createGenerator from './index.js';

export * from './index.js';

/** Full pack: the basic dictionaries plus city, country, fruit and plant (same tags in every locale). */
export interface FullLocalePack extends LocalePack {
  city: Dictionary;
  fruit: Dictionary;
  plant: Dictionary;
  country: Dictionary;
}

export const locales: Record<Locale, FullLocalePack>;
export const en: FullLocalePack;
export const es: FullLocalePack;

export default createGenerator;
