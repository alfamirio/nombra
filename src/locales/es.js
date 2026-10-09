// Spanish pack (additional locale): morphology, dictionaries and presets in one file.
// The English pack is the reference: same dictionary names, tags and preset ids; only the words,
// the word order in presets and the gender agreement change.

import { defineDictionary } from '../core.js';
import { cities, countries } from './en.js';

// ---------------------------------------------------------------- morphology
// Basic Spanish morphology: gender only. Covers regular cases; exceptions are explicit
// in the dictionaries ("mapa:m", "marrón|marrón").

/**
 * Default gender of a noun. Ending in -a, -ción, -sión, -dad, -tad, -tud or -umbre → feminine;
 * everything else → masculine. (mapa, día, planeta, cometa… need an explicit ":m" in the
 * dictionary; so do feminine nouns ending in -e or a consonant: "serpiente:f", "luz:f".)
 */
export function inferGender(word) {
  return /(a|ción|sión|dad|tad|tud|umbre)$/i.test(word) ? 'f' : 'm';
}

const FEMININE_RULES = [
  [/ón$/i, 'ona'], // juguetón → juguetona
  [/án$/i, 'ana'], // capitán → capitana
  [/ín$/i, 'ina'], // bailarín → bailarina
  [/or$/i, 'ora'], // pintor → pintora
  [/o$/i, 'a'], // sereno → serena
];

/** Feminine of an adjective or trade. If no rule applies it is invariable. */
export function feminine(word) {
  for (const [re, replacement] of FEMININE_RULES) {
    if (re.test(word)) return word.replace(re, replacement);
  }
  return word;
}

export const morphology = { feminine, inferGender };

const define = (def) => defineDictionary({ locale: 'es', morphology, ...def });

// -------------------------------------------------------------- dictionaries

// Tags: #mammal, #bird, #marine, #insect, #reptile (reptiles and amphibians). Default gender: -a → f, otherwise m.
export const animal = define({
  name: 'animal',
  type: 'noun',
  entries: [
    // Mammals
    'zorro#mammal', 'lobo#mammal', 'oso#mammal', 'ciervo#mammal', 'jabalí:m#mammal', 'tejón:m#mammal', 'erizo#mammal', 'ardilla#mammal', 'nutria#mammal',
    'castor:m#mammal', 'mapache:m#mammal', 'gato#mammal', 'ratón:m#mammal', 'liebre:f#mammal', 'conejo#mammal', 'murciélago:m#mammal',
    'koala:m#mammal', 'panda:m#mammal', 'lémur:m#mammal', 'canguro#mammal', 'lince:m#mammal', 'alpaca#mammal', 'llama#mammal', 'camello#mammal',
    'bisonte:m#mammal', 'gamo#mammal', 'corzo#mammal', 'armiño#mammal', 'marta#mammal', 'comadreja#mammal', 'topo#mammal', 'perro#mammal',
    // Birds
    'búho#bird', 'lechuza#bird', 'halcón:m#bird', 'águila:f#bird', 'cuervo#bird', 'gorrión:m#bird',
    'cigüeña#bird', 'colibrí:m#bird', 'tucán:m#bird', 'flamenco#bird', 'petirrojo#bird',
    'mochuelo#bird', 'urraca#bird', 'golondrina#bird', 'grulla#bird', 'cernícalo:m#bird',
    'ruiseñor:m#bird', 'jilguero#bird', 'alondra#bird', 'vencejo#bird', 'garza#bird', 'loro#bird',
    'cisne:m#bird', 'pingüino#bird#marine', 'gaviota#bird#marine', 'pelícano#bird#marine',
    'cormorán:m#bird#marine', 'albatros:m#bird#marine',
    // Marine
    'ballena#marine', 'delfín:m#marine', 'pulpo#marine', 'tiburón:m#marine', 'medusa#marine',
    'foca#marine', 'cangrejo#marine', 'morsa#marine', 'narval:m#marine', 'calamar:m#marine',
    'manta#marine', 'raya#marine', 'salmón:m#marine', 'atún:m#marine', 'sepia#marine',
    'cachalote:m#marine', 'orca#marine', 'nautilo#marine', 'langosta#marine', 'anguila#marine',
    'besugo#marine', 'lenguado#marine', 'esturión:m#marine',
    // Insects
    'libélula#insect', 'mariposa#insect', 'luciérnaga#insect', 'escarabajo#insect',
    'mantis:f#insect', 'hormiga#insect', 'abeja#insect', 'grillo#insect', 'cigarra#insect',
    'polilla#insect', 'mariquita#insect', 'avispa#insect', 'saltamontes:m#insect',
    // Reptiles and amphibians
    'camaleón:m#reptile', 'salamandra#reptile', 'lagarto#reptile', 'iguana#reptile', 'rana#reptile', 'sapo#reptile', 'tortuga#reptile', 'serpiente:f#reptile',
    'cocodrilo#reptile', 'tritón:m#reptile', 'ajolote:m#reptile', 'culebra#reptile', 'lagartija#reptile', 'araña',
  ],
});

// Automatic feminine: -o → -a, -or → -ora, -ón → -ona; the rest is invariable.
// Meant to go after the noun: {animal} {adjective@animal}. Tags: #weather, #speed, #mood.
export const adjective = define({
  name: 'adjective',
  type: 'adjective',
  entries: [
    'audaz', 'ágil#speed', 'alegre#mood', 'astuto', 'amable', 'afable', 'apacible#mood',
    'bravo', 'bondadoso', 'brillante', 'bromista', 'bello',
    'curioso', 'calmado#mood', 'cauto', 'cálido', 'constante', 'cordial', 'centelleante',
    'dulce', 'decidido', 'divertido#mood', 'distraído', 'discreto', 'delicado',
    'elegante', 'enérgico', 'eterno', 'espléndido', 'efímero',
    'feroz', 'feliz#mood', 'fiel', 'fuerte', 'fugaz#speed', 'fantástico',
    'gentil', 'genial', 'gracioso', 'generoso', 'gallardo',
    'hábil', 'heroico', 'honesto', 'humilde', 'hermoso',
    'intrépido', 'inquieto#mood', 'ingenioso', 'intenso', 'inmenso',
    'jovial#mood', 'justo', 'juguetón#mood', 'jocoso',
    'luminoso', 'leal', 'ligero#speed', 'libre', 'lúcido', 'lento',
    'mágico', 'misterioso', 'modesto', 'melancólico#mood', 'místico', 'majestuoso',
    'noble', 'nocturno', 'nítido', 'nómada', 'nostálgico#mood',
    'observador', 'osado', 'optimista#mood', 'ordenado', 'original',
    'paciente', 'pícaro', 'plateado', 'poético', 'pacífico', 'perezoso', 'puntual',
    'rápido#speed', 'radiante', 'risueño#mood', 'robusto', 'rebelde',
    'sereno#mood', 'silencioso', 'sabio', 'solitario', 'sutil', 'soñador#mood', 'salvaje',
    'tímido#mood', 'tenaz', 'travieso', 'tranquilo#mood', 'tenue', 'testarudo',
    'único', 'unido', 'ufano',
    'valiente', 'veloz#speed', 'vivaz#speed', 'vigilante', 'viajero', 'vagabundo',
    'zurdo', 'zalamero',
    // Weather
    'soleado#weather', 'lluvioso#weather', 'nevado#weather', 'nublado#weather', 'ventoso#weather', 'tormentoso#weather', 'brumoso#weather', 'nebuloso#weather',
    'helado#weather', 'escarchado#weather', 'húmedo#weather', 'templado#weather', 'bochornoso#weather', 'despejado#weather', 'gélido#weather', 'invernal#weather',
    // Speed (#speed; more speed words are tagged in the list above)
    'raudo#speed', 'presto#speed', 'presuroso#speed', 'vertiginoso#speed',
  ],
});

// Objects, landscapes and abstract things with character. Tags: #nature, #sound.
export const thing = define({
  name: 'thing',
  type: 'noun',
  entries: [
    'silencio', 'tormenta#nature', 'eco:m#sound', 'sombra', 'luz:f', 'marea#nature', 'ola#nature', 'hoguera', 'puerta',
    'camino', 'umbral:m', 'horizonte:m#nature', 'refugio', 'susurro#sound', 'estrella#nature', 'ceniza', 'cristal:m',
    'pergamino', 'laberinto', 'jardín:m', 'invernadero', 'faro', 'ancla', 'paraguas', 'brújula',
    'farol:m', 'reloj:m', 'tren:m', 'puente:m', 'ventana', 'nube:f#nature', 'lámpara', 'mapa:m',
    'llave:f', 'campana#sound', 'barco', 'globo', 'cuaderno', 'violín:m#sound', 'tambor:m#sound', 'molino',
    'espejo', 'linterna', 'bicicleta', 'piedra#nature', 'sombrero', 'carta', 'balcón:m', 'bosque#nature',
    'río#nature', 'montaña#nature', 'isla#nature', 'duna#nature', 'volcán:m#nature', 'cascada#nature', 'aurora#nature', 'noche:f', 'flor:f#nature',
    'hoja#nature', 'cueva#nature', 'fuente:f', 'calle:f', 'torre:f', 'cumbre:f#nature', 'tarde:f', 'árbol:m#nature',
    'semilla#nature', 'raíz:f#nature', 'vela', 'estación:f', 'canción:f#sound', 'arena#nature', 'bruma#nature',
    // Sounds (#sound)
    'trueno#sound', 'melodía#sound', 'ritmo#sound', 'nana#sound', 'murmullo#sound', 'zumbido#sound',
    'coro#sound', 'rumor#sound',
  ],
});

// Colors are adjectives, so they agree ("casa roja", "faro turquesa"). Tags: #metal, #gem.
export const color = define({
  name: 'color',
  type: 'adjective',
  entries: [
    'rojo', 'azul', 'verde', 'amarillo', 'naranja', 'violeta', 'turquesa#gem', 'ámbar', 'dorado#metal',
    'plateado#metal', 'índigo|índigo', 'carmesí', 'escarlata', 'granate#gem', 'lila', 'magenta', 'añil',
    'marfil', 'esmeralda#gem', 'coral#gem', 'cobre#metal', 'cian', 'blanco', 'negro', 'gris', 'rosa',
    'celeste', 'ocre', 'marrón|marrón', 'morado', 'bronce#metal', 'perla#gem', 'azabache',
    // Metals (#metal) and gems (#gem). Explicit feminine ('zafiro|zafiro') where the -o rule would be wrong.
    'acero|acero#metal', 'hierro|hierro#metal', 'platino|platino#metal', 'latón|latón#metal', 'peltre#metal',
    'cromo|cromo#metal',
    'rubí#gem', 'zafiro|zafiro#gem', 'jade#gem', 'ópalo|ópalo#gem', 'topacio|topacio#gem', 'ónix#gem',
    'amatista#gem',
  ],
});

// {city} {adjective@city} → "roma serena". Tags: {city#capital}, {city#hispanic}…
// The shared list is keyed in English; these are the names Spanish spells differently.
const NAMES = {
  london: 'londres',
  rome: 'roma',
  lisbon: 'lisboa',
  vienna: 'viena',
  prague: 'praga',
  warsaw: 'varsovia',
  brussels: 'bruselas',
  dublin: 'dublín',
  copenhagen: 'copenhague',
  athens: 'atenas',
  moscow: 'moscú',
  'saint petersburg': 'san petersburgo',
  istanbul: 'estambul',
  zurich: 'zúrich',
  geneva: 'ginebra',
  edinburgh: 'edimburgo',
  munich: 'múnich',
  cologne: 'colonia',
  venice: 'venecia',
  florence: 'florencia',
  milan: 'milán',
  naples: 'nápoles',
  turin: 'turín',
  bruges: 'brujas',
  krakow: 'cracovia',
  seville: 'sevilla',
  malaga: 'málaga',
  berlin: 'berlín',
  paris: 'parís',
  amsterdam: 'ámsterdam',
  stockholm: 'estocolmo',
  reykjavik: 'reikiavik',
  tallinn: 'tallin',
  vilnius: 'vilna',
  belgrade: 'belgrado',
  bucharest: 'bucarest',
  kyiv: 'kiev',
  sofia: 'sofía',
  hamburg: 'hamburgo',
  frankfurt: 'fráncfort',
  porto: 'oporto',
  tokyo: 'tokio',
  kyoto: 'kioto',
  seoul: 'seúl',
  beijing: 'pekín',
  shanghai: 'shanghái',
  singapore: 'singapur',
  jakarta: 'yakarta',
  taipei: 'taipéi',
  dhaka: 'daca',
  kathmandu: 'katmandú',
  tehran: 'teherán',
  baghdad: 'bagdad',
  damascus: 'damasco',
  jerusalem: 'jerusalén',
  dubai: 'dubái',
  riyadh: 'riad',
  tashkent: 'taskent',
  samarkand: 'samarcanda',
  ulaanbaatar: 'ulán bator',
  alexandria: 'alejandría',
  marrakesh: 'marrakech',
  tangier: 'tánger',
  tunis: 'túnez',
  algiers: 'argel',
  johannesburg: 'johannesburgo',
  'cape town': 'ciudad del cabo',
  'addis ababa': 'adís abeba',
  timbuktu: 'tombuctú',
  'new york': 'nueva york',
  'new orleans': 'nueva orleans',
  'mexico city': 'ciudad de méxico',
  havana: 'la habana',
  panama: 'panamá',
  bogota: 'bogotá',
  medellin: 'medellín',
  'san jose': 'san josé',
  valparaiso: 'valparaíso',
  cordoba: 'córdoba',
  asuncion: 'asunción',
  'rio de janeiro': 'río de janeiro',
  'sao paulo': 'são paulo',
  sydney: 'sídney',
  adelaide: 'adelaida',
  noumea: 'numea',
};

export const city = /* @__PURE__ */ define({
  name: 'city',
  type: 'noun',
  entries: /* @__PURE__ */ cities.map((raw) => {
    const [head, ...tags] = raw.split('#');
    const [key, gender] = head.split(':');
    return { text: NAMES[key] ?? key, gender, tags };
  }),
});

// Tags: #citrus, #berry, #tropical, #orchard. Default gender: -a → f, otherwise m.
export const fruit = /* @__PURE__ */ define({
  name: 'fruit',
  type: 'noun',
  entries: [
    'limón#citrus', 'lima#citrus', 'naranja#citrus', 'mandarina#citrus', 'pomelo#citrus', 'clementina#citrus', 'kumquat#citrus', 'yuzu#citrus', 'cidra#citrus', 'bergamota#citrus', 'toronja#citrus',
    'fresa#berry', 'frambuesa#berry', 'arándano#berry', 'mora#berry', 'grosella#berry', 'zarzamora#berry', 'fresón#berry', 'casis#berry', 'endrina#berry', 'mirtilo#berry', 'madroño#berry',
    'mango#tropical', 'papaya#tropical', 'piña#tropical', 'plátano#tropical', 'coco#tropical', 'guayaba#tropical', 'maracuyá:f#tropical', 'lichi#tropical', 'mangostán#tropical', 'rambután#tropical', 'tamarindo#tropical', 'carambola#tropical', 'aguacate#tropical', 'chirimoya#tropical',
    'manzana#orchard', 'pera#orchard', 'melocotón#orchard', 'ciruela#orchard', 'albaricoque#orchard', 'cereza#orchard', 'nectarina#orchard', 'membrillo#orchard', 'higo#orchard', 'granada#orchard', 'caqui#orchard', 'níspero#orchard',
    'uva', 'sandía', 'melón', 'kiwi', 'dátil',
  ],
});

// Tags: #tree, #flower, #herb. Untagged: helecho, bambú, musgo, hiedra, cactus, aloe, trébol, junco.
export const plant = /* @__PURE__ */ define({
  name: 'plant',
  type: 'noun',
  entries: [
    'roble#tree', 'arce#tree', 'abedul#tree', 'pino#tree', 'cedro#tree', 'sauce#tree', 'olmo#tree', 'fresno#tree', 'haya#tree', 'ciprés#tree', 'tilo#tree', 'olivo#tree', 'abeto#tree', 'enebro#tree', 'álamo#tree', 'nogal#tree', 'castaño#tree', 'avellano#tree',
    'rosa#flower', 'lirio#flower', 'tulipán#flower', 'margarita#flower', 'orquídea#flower', 'lavanda#flower', 'violeta#flower', 'jazmín#flower', 'amapola#flower', 'iris:m#flower', 'loto#flower', 'peonía#flower', 'narciso#flower', 'girasol#flower', 'caléndula#flower', 'camelia#flower', 'magnolia#flower',
    'albahaca#herb', 'menta#herb', 'tomillo#herb', 'romero#herb', 'orégano#herb', 'perejil#herb', 'eneldo#herb', 'hinojo#herb', 'cebollino#herb', 'estragón#herb', 'cilantro#herb', 'acedera#herb', 'laurel#herb',
    'helecho', 'bambú', 'musgo', 'hiedra', 'cactus', 'aloe', 'trébol', 'junco',
  ],
});

// {country} {adjective@country} → "japón sereno". Same shared English-keyed list as cities.
const COUNTRY_NAMES = {
  spain: 'españa',
  germany: 'alemania',
  greece: 'grecia',
  ireland: 'irlanda',
  iceland: 'islandia',
  norway: 'noruega',
  sweden: 'suecia',
  finland: 'finlandia',
  denmark: 'dinamarca',
  poland: 'polonia',
  switzerland: 'suiza',
  belgium: 'bélgica',
  netherlands: 'holanda',
  croatia: 'croacia',
  hungary: 'hungría',
  czechia: 'chequia',
  romania: 'rumanía',
  slovakia: 'eslovaquia',
  slovenia: 'eslovenia',
  lithuania: 'lituania',
  latvia: 'letonia',
  ukraine: 'ucrania',
  cyprus: 'chipre',
  luxembourg: 'luxemburgo',
  monaco: 'mónaco',
  france: 'francia',
  italy: 'italia',
  japan: 'japón',
  thailand: 'tailandia',
  malaysia: 'malasia',
  singapore: 'singapur',
  'south korea': 'corea del sur',
  bhutan: 'bután',
  kazakhstan: 'kazajistán',
  uzbekistan: 'uzbekistán',
  iran: 'irán',
  iraq: 'irak',
  turkey: 'turquía',
  jordan: 'jordania',
  lebanon: 'líbano',
  'saudi arabia': 'arabia saudí',
  pakistan: 'pakistán',
  bangladesh: 'bangladés',
  cambodia: 'camboya',
  qatar: 'catar',
  oman: 'omán',
  taiwan: 'taiwán',
  egypt: 'egipto',
  morocco: 'marruecos',
  algeria: 'argelia',
  tunisia: 'túnez',
  libya: 'libia',
  kenya: 'kenia',
  ethiopia: 'etiopía',
  rwanda: 'ruanda',
  botswana: 'botsuana',
  zimbabwe: 'zimbabue',
  mali: 'malí',
  'south africa': 'sudáfrica',
  mauritius: 'mauricio',
  cameroon: 'camerún',
  gabon: 'gabón',
  sudan: 'sudán',
  canada: 'canadá',
  mexico: 'méxico',
  haiti: 'haití',
  'dominican republic': 'república dominicana',
  panama: 'panamá',
  peru: 'perú',
  brazil: 'brasil',
  belize: 'belice',
  'new zealand': 'nueva zelanda',
  fiji: 'fiyi',
  palau: 'palaos',
  'papua new guinea': 'papúa nueva guinea',
};

export const country = /* @__PURE__ */ define({
  name: 'country',
  type: 'noun',
  entries: /* @__PURE__ */ countries.map((raw) => {
    const [head, ...tags] = raw.split('#');
    const [key, gender] = head.split(':');
    return { text: COUNTRY_NAMES[key] ?? key, gender, tags };
  }),
});

// Two packs, like English: `basic` (what `nombra` ships) and `full` (`nombra/full`, adds cities,
// countries, fruit and plants). The extras are marked PURE and kept out of `basic`.

export const dictionaries = [animal, adjective, thing, color];

// ------------------------------------------------------------------ presets
// Ids are shared across locales; templates are per locale.

export const presets = {
  'animal-adjective': { template: '{animal} {adjective@animal}', description: 'zorro-sereno, ardilla-valiente' },
  'thing-adjective': { template: '{thing} {adjective@thing}', description: 'estrella-tranquila, faro-valiente' },
  'color-thing': { template: '{thing} {color@thing}', description: 'faro-turquesa, ancla-ambar' },
  'docker-style': {
    template: '{animal} {adjective@animal} {num}',
    description: 'zorro-sereno-4821 (numeric suffix to avoid collisions)',
  },
  phonetic: { template: '{pseudo:2} {pseudo:2}', description: 'mako-rivu, telo-nami (pronounceable made-up words)' },
};

const extraPresets = {
  'city-adjective': { template: '{city} {adjective@city}', description: 'roma-serena, tokio-valiente' },
  'fruit-adjective': { template: '{fruit} {adjective@fruit}', description: 'mango-soleado, cereza-valiente' },
  'plant-adjective': { template: '{plant} {adjective@plant}', description: 'helecho-tranquilo, roble-audaz' },
  'country-adjective': { template: '{country} {adjective@country}', description: 'islandia-serena, japon-valiente' },
};

export const basic = { dictionaries, presets, animal, adjective, thing, color };

export const full = {
  dictionaries: [animal, adjective, thing, color, city, fruit, plant, country],
  presets: /* @__PURE__ */ Object.assign({}, presets, extraPresets),
  animal, adjective, thing, color, city, fruit, plant, country,
};
