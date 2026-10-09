export type Format = 'kebab' | 'snake' | 'camel' | 'pascal' | 'title' | 'space';
export type FormatOption = Format | ((words: string[]) => string);
export type DictionaryType = 'noun' | 'adjective' | 'plain';
export type Locale = 'en' | 'es';

export interface Morphology {
  feminine(word: string): string;
  inferGender(word: string): 'm' | 'f' | null;
}

export interface DictionaryDefinition {
  name: string;
  type?: DictionaryType;
  locale?: string;
  /** Language rules. Without it words are invariable and nouns have no gender. */
  morphology?: Morphology;
  /** "fox", "mapa:m", "delfín:m#marine", "marrón|marrón" or an object. */
  entries: Array<string | { text: string; gender?: 'm' | 'f'; feminine?: string; tags?: string[] }>;
}

/** A normalised entry, as stored in a dictionary. */
export interface DictionaryEntry {
  readonly text: string;
  readonly tags: readonly string[];
  /** Accent-free lowercase first letter (used for alliteration). */
  readonly initial: string;
  /** Nouns only; `null` when the language has no gender or it cannot be inferred. */
  readonly gender?: 'm' | 'f' | null;
  /** Adjectives only. */
  readonly forms?: { readonly m: string; readonly f: string };
}

export interface Dictionary {
  readonly name: string;
  readonly type: DictionaryType;
  readonly locale: string | null;
  readonly entries: ReadonlyArray<DictionaryEntry>;
}

export interface PatternDefinition {
  template: string;
  alliterate?: boolean;
  format?: FormatOption;
  asciiExtended?: boolean;
  description?: string;
}

export type PatternSpec = string | PatternDefinition;

export interface GeneratorOptions {
  /** Locale pack to load. Default "en" (the reference locale); `null` for an empty generator. */
  locale?: Locale | null;
  /** Added on top of the locale pack. */
  dictionaries?: Array<Dictionary | DictionaryDefinition>;
  patterns?: Record<string, string | PatternDefinition>;
  /** Seed of the generator's own sequence. */
  seed?: string | number;
  format?: FormatOption;
  /** Keep accents (á, ñ…). Default false: plain ASCII. */
  asciiExtended?: boolean;
  defaultPattern?: string;
}

export interface GenerateOptions {
  /** With a seed the call is pure: same seed, same result. */
  seed?: string | number;
  format?: FormatOption;
  asciiExtended?: boolean;
  alliterate?: boolean;
  /** Only used by generateMany: no repeats within the batch. */
  unique?: boolean;
}

export interface Generator {
  addDictionary(dictionary: Dictionary | DictionaryDefinition): this;
  addPattern(id: string, definition: string | PatternDefinition): this;
  generate(pattern?: PatternSpec, options?: GenerateOptions): string;
  generateMany(pattern: PatternSpec | undefined, count: number, options?: GenerateOptions): string[];
  /** Unformatted words. */
  words(pattern?: PatternSpec, options?: GenerateOptions): string[];
  capacity(pattern?: PatternSpec, options?: Pick<GenerateOptions, 'alliterate'>): number;
  readonly dictionaries: Array<{ name: string; type: DictionaryType; size: number }>;
  readonly patterns: Record<string, PatternDefinition>;
}

/** Basic pack (`nombra`): the four everyday dictionaries. Every locale has the same ones, with the same tags. */
export interface LocalePack {
  dictionaries: Dictionary[];
  presets: Record<string, PatternDefinition>;
  animal: Dictionary;
  adjective: Dictionary;
  thing: Dictionary;
  color: Dictionary;
}

export function createGenerator(options?: GeneratorOptions): Generator;
export function defineDictionary(definition: DictionaryDefinition): Dictionary;
export function createRng(seed?: string | number): { next(): number; int(n: number): number; pick<T>(list: readonly T[]): T };
export function hashSeed(seed: string | number): number;

export const FORMATS: readonly Format[];
export const locales: Record<Locale, LocalePack>;
export const en: LocalePack;
export const es: LocalePack;

// Shape of the `nombra/locales/<code>` entry points (they share this file).
export const dictionaries: Dictionary[];
export const presets: Record<string, PatternDefinition>;

export function generate(pattern?: PatternSpec, options?: GenerateOptions & { locale?: Locale }): string;
export function generateMany(pattern: PatternSpec | undefined, count: number, options?: GenerateOptions & { locale?: Locale }): string[];

export default createGenerator;
