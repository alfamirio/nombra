// English pack (default locale): dictionaries and presets in one file. English has no grammatical gender.
// It is the reference for the other packs: they use the same dictionary names, tags and preset ids.

import { defineDictionary } from '../core.js';

const define = (def) => defineDictionary({ locale: 'en', ...def });

// Shared word lists: cities and countries are keyed in English (london, new york, south korea…) and
// every other locale reuses them, mapping the names it spells differently (see `NAMES` and
// `COUNTRY_NAMES` in es.js). English is the reference locale, so the lists live in this file.
// Format: "name:gender#tag#tag" (gender is used by Spanish only: m or f).
// Tags are the same in every locale:
//   continents:  europe asia africa america oceania
//   kinds:       capital port island historic   (countries only use island)
//   origin:      hispanic (Spanish-speaking countries)
// Multi-word names use spaces, never hyphens or apostrophes (slug formats would squash them).

// ---------------------------------------------------------------- cities
export const cities = [
    // ---- Europe
    'london:m#europe#capital#port', 'paris:m#europe#capital', 'berlin:m#europe#capital',
    'madrid:m#europe#capital#hispanic', 'rome:f#europe#capital#historic', 'lisbon:f#europe#capital#port',
    'vienna:f#europe#capital', 'prague:f#europe#capital#historic', 'budapest:m#europe#capital',
    'warsaw:f#europe#capital', 'amsterdam:m#europe#capital#port', 'brussels:f#europe#capital',
    'dublin:m#europe#capital#port', 'oslo:m#europe#capital#port', 'stockholm:m#europe#capital#port',
    'copenhagen:f#europe#capital#port', 'helsinki:m#europe#capital#port', 'athens:f#europe#capital#historic',
    'reykjavik:m#europe#capital#port#island', 'tallinn:m#europe#capital#port', 'riga:f#europe#capital#port',
    'vilnius:m#europe#capital', 'belgrade:m#europe#capital', 'bucharest:m#europe#capital',
    'sofia:f#europe#capital', 'kyiv:m#europe#capital', 'moscow:f#europe#capital',
    'saint petersburg:m#europe#port', 'istanbul:m#europe#asia#port#historic', 'zurich:m#europe',
    'geneva:f#europe', 'edinburgh:m#europe#capital', 'munich:m#europe', 'hamburg:m#europe#port',
    'cologne:f#europe', 'frankfurt:m#europe', 'venice:f#europe#port#historic', 'florence:f#europe#historic',
    'milan:m#europe', 'naples:f#europe#port', 'turin:m#europe', 'porto:m#europe#port',
    'bruges:f#europe#historic', 'krakow:f#europe#historic', 'dubrovnik:f#europe#port#historic', 'barcelona:f#europe#hispanic#port',
    'seville:f#europe#hispanic#historic', 'valencia:f#europe#hispanic#port', 'granada:f#europe#hispanic#historic',
    'toledo:m#europe#hispanic#historic', 'salamanca:f#europe#hispanic#historic', 'bilbao:m#europe#hispanic#port',
    'malaga:f#europe#hispanic#port',

    // ---- Asia
    'tokyo:m#asia#capital#port', 'kyoto:m#asia#historic', 'osaka:f#asia#port', 'seoul:m#asia#capital',
    'beijing:m#asia#capital', 'shanghai:m#asia#port', 'hong kong:m#asia#port#island', 'taipei:f#asia#capital',
    'singapore:m#asia#capital#port#island', 'bangkok:m#asia#capital#port', 'hanoi:m#asia#capital',
    'manila:f#asia#capital#port#island', 'jakarta:f#asia#capital#port#island', 'delhi:m#asia#capital',
    'mumbai:f#asia#port', 'kolkata:f#asia#port', 'bangalore:f#asia', 'kathmandu:m#asia#capital',
    'colombo:m#asia#capital#port#island', 'dhaka:f#asia#capital', 'karachi:m#asia#port', 'lahore:m#asia',
    'kabul:m#asia#capital', 'tehran:m#asia#capital', 'baghdad:m#asia#capital', 'damascus:m#asia#capital#historic',
    'jerusalem:f#asia#capital#historic', 'beirut:m#asia#capital#port', 'dubai:m#asia#port', 'doha:f#asia#capital#port',
    'riyadh:m#asia#capital', 'tashkent:f#asia#capital', 'samarkand:f#asia#historic', 'almaty:f#asia',
    'ulaanbaatar:m#asia#capital',

    // ---- Africa
    'cairo:m#africa#capital#historic', 'alexandria:f#africa#port#historic', 'casablanca:f#africa#port',
    'marrakesh:m#africa#historic', 'tangier:m#africa#port', 'fez:m#africa#historic', 'tunis:m#africa#capital#port',
    'algiers:m#africa#capital#port', 'lagos:m#africa#port', 'accra:f#africa#capital#port',
    'dakar:m#africa#capital#port', 'nairobi:m#africa#capital', 'addis ababa:f#africa#capital',
    'kampala:f#africa#capital', 'kigali:f#africa#capital', 'kinshasa:f#africa#capital',
    'luanda:f#africa#capital#port', 'maputo:m#africa#capital#port', 'johannesburg:m#africa',
    'cape town:f#africa#port', 'durban:f#africa#port', 'windhoek:m#africa#capital',
    'zanzibar:f#africa#port#island', 'timbuktu:f#africa#historic', 'antananarivo:f#africa#capital',

    // ---- America
    'new york:f#america#port', 'los angeles:m#america#port', 'san francisco:m#america#port',
    'chicago:m#america', 'boston:m#america#port', 'seattle:f#america#port', 'miami:m#america#port',
    'new orleans:f#america#port', 'washington:m#america#capital', 'toronto:m#america',
    'montreal:m#america', 'vancouver:m#america#port', 'quebec:m#america', 'mexico city:f#america#capital#hispanic',
    'oaxaca:f#america#hispanic#historic', 'guadalajara:f#america#hispanic', 'havana:f#america#capital#hispanic#port#island',
    'san juan:m#america#capital#hispanic#port#island', 'santo domingo:m#america#capital#hispanic#port#island',
    'kingston:m#america#capital#port#island', 'nassau:m#america#capital#port#island', 'panama:f#america#capital#hispanic#port',
    'guatemala:f#america#capital#hispanic', 'tegucigalpa:f#america#capital#hispanic',
    'managua:f#america#capital#hispanic', 'san jose:m#america#capital#hispanic',
    'bogota:f#america#capital#hispanic', 'medellin:f#america#hispanic', 'cartagena:f#america#hispanic#port#historic',
    'caracas:f#america#capital#hispanic', 'quito:m#america#capital#hispanic', 'lima:f#america#capital#hispanic#port',
    'cusco:m#america#hispanic#historic', 'la paz:f#america#capital#hispanic', 'santiago:m#america#capital#hispanic',
    'valparaiso:m#america#hispanic#port', 'buenos aires:m#america#capital#hispanic#port',
    'cordoba:f#america#hispanic#historic', 'montevideo:m#america#capital#hispanic#port',
    'asuncion:f#america#capital#hispanic', 'rio de janeiro:m#america#port', 'sao paulo:m#america',
    'salvador:m#america#port', 'brasilia:f#america#capital',

    // ---- Oceania
    'sydney:m#oceania#port', 'melbourne:m#oceania#port', 'brisbane:f#oceania#port', 'perth:f#oceania#port',
    'adelaide:f#oceania#port', 'canberra:f#oceania#capital', 'hobart:f#oceania#port#island',
    'auckland:m#oceania#port', 'wellington:f#oceania#capital#port', 'christchurch:f#oceania',
    'queenstown:f#oceania', 'suva:f#oceania#capital#port#island', 'honolulu:f#oceania#port#island',
    'papeete:f#oceania#capital#port#island', 'noumea:f#oceania#capital#port#island',
];

// ------------------------------------------------------------- countries
// Same format and tags as cities, plus #island (kinds) and no #capital/#port/#historic.
export const countries = [
    // ---- Europe
    'spain:f#europe#hispanic', 'portugal:m#europe', 'france:f#europe', 'italy:f#europe', 'germany:f#europe',
    'greece:f#europe', 'ireland:f#europe#island', 'iceland:f#europe#island', 'norway:f#europe',
    'sweden:f#europe', 'finland:f#europe', 'denmark:f#europe', 'poland:f#europe', 'austria:f#europe',
    'switzerland:f#europe', 'belgium:f#europe', 'netherlands:f#europe', 'croatia:f#europe', 'hungary:f#europe',
    'czechia:f#europe', 'romania:f#europe', 'bulgaria:f#europe', 'serbia:f#europe', 'estonia:f#europe',
    'latvia:f#europe', 'lithuania:f#europe', 'ukraine:f#europe', 'malta:f#europe#island', 'cyprus:m#europe#island',
    'albania:f#europe', 'slovenia:f#europe', 'slovakia:f#europe', 'luxembourg:m#europe', 'montenegro:m#europe',
    'monaco:m#europe', 'andorra:f#europe',

    // ---- Asia
    'japan:m#asia#island', 'china:f#asia', 'india:f#asia', 'thailand:f#asia', 'vietnam:m#asia', 'malaysia:f#asia',
    'indonesia:f#asia#island', 'singapore:m#asia#island', 'south korea:f#asia', 'nepal:m#asia', 'bhutan:m#asia',
    'mongolia:f#asia', 'kazakhstan:m#asia', 'uzbekistan:m#asia', 'iran:m#asia', 'iraq:m#asia', 'turkey:f#asia',
    'israel:m#asia', 'jordan:f#asia', 'lebanon:m#asia', 'saudi arabia:f#asia', 'pakistan:m#asia',
    'bangladesh:m#asia', 'cambodia:f#asia', 'laos:m#asia', 'taiwan:m#asia#island', 'qatar:m#asia',
    'oman:m#asia', 'armenia:f#asia',

    // ---- Africa
    'egypt:m#africa', 'morocco:m#africa', 'algeria:f#africa', 'tunisia:m#africa', 'libya:f#africa',
    'nigeria:f#africa', 'ghana:m#africa', 'senegal:m#africa', 'kenya:f#africa', 'ethiopia:f#africa',
    'tanzania:f#africa', 'uganda:f#africa', 'rwanda:m#africa', 'angola:f#africa', 'mozambique:m#africa',
    'namibia:f#africa', 'botswana:m#africa', 'zimbabwe:m#africa', 'zambia:f#africa', 'madagascar:m#africa#island',
    'mali:m#africa', 'south africa:f#africa', 'mauritius:m#africa#island', 'cameroon:m#africa', 'gabon:m#africa',
    'sudan:m#africa',

    // ---- America
    'canada:m#america', 'mexico:m#america#hispanic', 'cuba:f#america#hispanic#island', 'jamaica:f#america#island',
    'haiti:m#america#island', 'dominican republic:f#america#hispanic#island', 'costa rica:f#america#hispanic',
    'panama:m#america#hispanic', 'guatemala:f#america#hispanic', 'honduras:f#america#hispanic',
    'el salvador:m#america#hispanic', 'nicaragua:f#america#hispanic', 'colombia:f#america#hispanic',
    'venezuela:f#america#hispanic', 'ecuador:m#america#hispanic', 'peru:m#america#hispanic',
    'bolivia:f#america#hispanic', 'chile:m#america#hispanic', 'argentina:f#america#hispanic',
    'uruguay:m#america#hispanic', 'paraguay:m#america#hispanic', 'brazil:m#america', 'belize:m#america',

    // ---- Oceania
    'australia:f#oceania', 'new zealand:f#oceania', 'fiji:m#oceania#island', 'samoa:f#oceania#island',
    'tonga:f#oceania#island', 'vanuatu:m#oceania#island', 'palau:m#oceania#island', 'kiribati:m#oceania#island',
    'tuvalu:m#oceania#island', 'nauru:m#oceania#island', 'micronesia:f#oceania#island',
    'papua new guinea:f#oceania#island',
];

// -------------------------------------------------------------- dictionaries

// Tags: #mammal, #bird, #marine, #insect, #reptile (reptiles and amphibians).
export const animal = define({
  name: 'animal',
  type: 'noun',
  entries: [
    // Mammals
    'fox#mammal', 'wolf#mammal', 'bear#mammal', 'deer#mammal', 'badger#mammal', 'hedgehog#mammal', 'squirrel#mammal', 'otter#mammal', 'beaver#mammal', 'raccoon#mammal',
    'cat#mammal', 'hare#mammal', 'rabbit#mammal', 'bat#mammal', 'koala#mammal', 'panda#mammal', 'lemur#mammal', 'kangaroo#mammal', 'lynx#mammal', 'alpaca#mammal', 'llama#mammal',
    'camel#mammal', 'bison#mammal', 'moose#mammal', 'weasel#mammal', 'mole#mammal', 'ferret#mammal', 'stoat#mammal', 'marten#mammal', 'ibex#mammal', 'yak#mammal', 'dog#mammal',
    // Birds
    'owl#bird', 'hawk#bird', 'eagle#bird', 'raven#bird', 'sparrow#bird', 'stork#bird',
    'hummingbird#bird', 'toucan#bird', 'flamingo#bird', 'robin#bird', 'magpie#bird',
    'swallow#bird', 'crane#bird', 'kestrel#bird', 'nightingale#bird', 'finch#bird', 'lark#bird',
    'swift#bird', 'heron#bird', 'parrot#bird', 'swan#bird',
    'penguin#bird#marine', 'gull#bird#marine', 'pelican#bird#marine', 'cormorant#bird#marine',
    'albatross#bird#marine',
    // Marine
    'whale#marine', 'dolphin#marine', 'octopus#marine', 'shark#marine', 'jellyfish#marine',
    'seal#marine', 'crab#marine', 'walrus#marine', 'narwhal#marine', 'squid#marine', 'manta#marine',
    'stingray#marine', 'salmon#marine', 'tuna#marine', 'cuttlefish#marine', 'orca#marine',
    'nautilus#marine', 'lobster#marine', 'eel#marine', 'sturgeon#marine',
    // Insects
    'dragonfly#insect', 'butterfly#insect', 'firefly#insect', 'beetle#insect', 'mantis#insect',
    'ant#insect', 'bee#insect', 'cricket#insect', 'cicada#insect', 'moth#insect', 'ladybug#insect',
    'wasp#insect', 'grasshopper#insect',
    // Reptiles and amphibians
    'chameleon#reptile', 'salamander#reptile', 'lizard#reptile', 'iguana#reptile', 'frog#reptile', 'toad#reptile', 'tortoise#reptile', 'snake#reptile', 'crocodile#reptile',
    'newt#reptile', 'axolotl#reptile', 'gecko#reptile',
  ],
});

// Meant to go before the noun: {adjective} {animal}. Tags: #weather, #speed, #mood.
export const adjective = define({
  name: 'adjective',
  type: 'adjective',
  entries: [
    'agile#speed', 'amber', 'amiable', 'bold', 'brave', 'bright', 'brisk#speed', 'calm#mood', 'candid', 'careful',
    'clever', 'cosmic', 'cozy', 'cunning', 'curious', 'daring', 'dapper', 'eager#mood', 'elegant',
    'epic', 'faithful', 'fearless', 'fierce', 'fleet#speed', 'friendly', 'gentle', 'gleaming', 'graceful',
    'grand', 'happy#mood', 'hardy', 'humble', 'jolly#mood', 'keen', 'kind', 'lively', 'loyal', 'lucky',
    'lunar', 'merry#mood', 'mighty', 'modest', 'mystic', 'nimble#speed', 'noble', 'nomad', 'patient',
    'playful#mood', 'polite', 'proud', 'quick#speed', 'quiet', 'radiant', 'restless#mood', 'rowdy', 'sage',
    'serene#mood', 'shy#mood', 'silent', 'sleepy#mood', 'sly', 'snowy#weather', 'solar', 'steady', 'stoic', 'stormy#weather',
    'sturdy', 'subtle', 'sunny#weather', 'swift#speed', 'tender', 'tidy', 'tranquil#mood', 'trusty', 'vivid',
    'wandering', 'warm', 'whimsical#mood', 'wild', 'wise', 'witty', 'zesty',
    // Weather (#weather; 'sunny#weather', 'snowy#weather' and 'stormy#weather' are in the list above)
    'rainy#weather', 'cloudy#weather', 'windy#weather', 'foggy#weather', 'misty#weather', 'frosty#weather', 'icy#weather', 'breezy#weather', 'hazy#weather', 'balmy#weather',
    'humid#weather', 'wintry#weather', 'gusty#weather', 'dewy#weather', 'drizzly#weather', 'sultry#weather',
    // Speed (#speed; more speed words are tagged in the list above)
    'rapid#speed', 'speedy#speed', 'zippy#speed', 'hasty#speed',
  ],
});

// Objects, landscapes and abstract things with character. Tags: #nature, #sound.
export const thing = define({
  name: 'thing',
  type: 'noun',
  entries: [
    'silence', 'storm#nature', 'echo#sound', 'shadow', 'light', 'tide#nature', 'wave#nature', 'bonfire', 'door', 'path',
    'threshold', 'horizon#nature', 'shelter', 'whisper#sound', 'star#nature', 'ash', 'crystal', 'scroll', 'maze',
    'garden', 'greenhouse', 'lighthouse', 'anchor', 'umbrella', 'compass', 'lantern', 'clock',
    'train', 'bridge', 'window', 'cloud#nature', 'lamp', 'map', 'key', 'bell#sound', 'boat', 'balloon',
    'notebook', 'violin#sound', 'drum#sound', 'windmill', 'mirror', 'bicycle', 'stone#nature', 'hat', 'letter',
    'balcony', 'forest#nature', 'river#nature', 'mountain#nature', 'island#nature', 'dune#nature', 'volcano#nature', 'waterfall#nature', 'aurora#nature',
    'night', 'flower#nature', 'leaf#nature', 'cave#nature', 'fountain', 'street', 'tower', 'summit#nature', 'evening', 'tree#nature',
    'seed#nature', 'root#nature', 'candle', 'station', 'song#sound', 'sand#nature', 'mist#nature', 'harbor',
    // Sounds (#sound)
    'thunder#sound', 'chime#sound', 'melody#sound', 'rhythm#sound', 'lullaby#sound', 'murmur#sound',
    'rustle#sound', 'hum#sound',
  ],
});

// Tags: #metal, #gem.
export const color = define({
  name: 'color',
  type: 'adjective',
  entries: [
    'red', 'blue', 'green', 'yellow', 'orange', 'violet', 'turquoise#gem', 'golden#metal', 'silver#metal', 'indigo',
    'crimson', 'scarlet', 'maroon', 'lilac', 'magenta', 'ivory', 'emerald#gem', 'coral#gem', 'copper#metal',
    'cyan', 'white', 'black', 'gray', 'pink', 'teal', 'ochre', 'brown', 'purple', 'bronze#metal', 'pearl#gem',
    // Metals (#metal) and gems (#gem)
    'steel#metal', 'iron#metal', 'platinum#metal', 'brass#metal', 'pewter#metal', 'chrome#metal',
    'ruby#gem', 'sapphire#gem', 'jade#gem', 'opal#gem', 'topaz#gem', 'garnet#gem', 'onyx#gem', 'amethyst#gem',
  ],
});

// The shared list is already in English spelling. Gender is only used by Spanish, so it is dropped here.
// {adjective} {city} → "calm paris". Multi-word names use spaces (not hyphens): slug formats
// would otherwise squash "stoke-on-trent".

export const city = /* @__PURE__ */ define({
  name: 'city',
  type: 'noun',
  entries: /* @__PURE__ */ cities.map((raw) => {
    const [head, ...tags] = raw.split('#');
    const [text] = head.split(':');
    return { text, tags };
  }),
});

// Tags: #citrus, #berry, #tropical, #orchard (apples, pears, stone fruit). Grape, melon, watermelon, kiwi and date are untagged.
export const fruit = /* @__PURE__ */ define({
  name: 'fruit',
  type: 'noun',
  entries: [
    'lemon#citrus', 'lime#citrus', 'orange#citrus', 'mandarin#citrus', 'grapefruit#citrus', 'clementine#citrus', 'kumquat#citrus', 'yuzu#citrus', 'citron#citrus', 'bergamot#citrus', 'tangerine#citrus',
    'strawberry#berry', 'raspberry#berry', 'blueberry#berry', 'blackberry#berry', 'cranberry#berry', 'blackcurrant#berry', 'redcurrant#berry', 'gooseberry#berry', 'elderberry#berry', 'mulberry#berry', 'lingonberry#berry',
    'mango#tropical', 'papaya#tropical', 'pineapple#tropical', 'banana#tropical', 'coconut#tropical', 'guava#tropical', 'passionfruit#tropical', 'lychee#tropical', 'mangosteen#tropical', 'rambutan#tropical', 'tamarind#tropical', 'carambola#tropical', 'avocado#tropical',
    'apple#orchard', 'pear#orchard', 'peach#orchard', 'plum#orchard', 'apricot#orchard', 'cherry#orchard', 'nectarine#orchard', 'quince#orchard', 'fig#orchard', 'pomegranate#orchard', 'persimmon#orchard', 'damson#orchard',
    'grape', 'melon', 'watermelon', 'kiwi', 'date',
  ],
});

// Tags: #tree, #flower, #herb. Fern, bamboo, moss, ivy, cactus, aloe, clover and reed are untagged.
export const plant = /* @__PURE__ */ define({
  name: 'plant',
  type: 'noun',
  entries: [
    'oak#tree', 'maple#tree', 'birch#tree', 'pine#tree', 'cedar#tree', 'willow#tree', 'elm#tree', 'ash#tree', 'beech#tree', 'cypress#tree', 'linden#tree', 'olive#tree', 'fir#tree', 'juniper#tree', 'poplar#tree', 'walnut#tree', 'chestnut#tree', 'hazel#tree',
    'rose#flower', 'lily#flower', 'tulip#flower', 'daisy#flower', 'orchid#flower', 'lavender#flower', 'violet#flower', 'jasmine#flower', 'poppy#flower', 'iris#flower', 'lotus#flower', 'peony#flower', 'daffodil#flower', 'sunflower#flower', 'marigold#flower', 'camellia#flower', 'magnolia#flower',
    'basil#herb', 'mint#herb', 'thyme#herb', 'rosemary#herb', 'oregano#herb', 'parsley#herb', 'dill#herb', 'fennel#herb', 'chive#herb', 'tarragon#herb', 'cilantro#herb', 'sorrel#herb', 'bay#herb',
    'fern', 'bamboo', 'moss', 'ivy', 'cactus', 'aloe', 'clover', 'reed',
  ],
});

// Shared English-keyed list, like cities: {adjective} {country} → "brave japan". Gender is dropped here.
export const country = /* @__PURE__ */ define({
  name: 'country',
  type: 'noun',
  entries: /* @__PURE__ */ countries.map((raw) => {
    const [head, ...tags] = raw.split('#');
    const [text] = head.split(':');
    return { text, tags };
  }),
});

// Two packs per locale. `basic` is what `nombra` ships: the four everyday dictionaries. `full` (what
// `nombra/full` ships) adds cities, countries, fruit and plants. The extras are marked PURE and kept out
// of `basic`, so a bundle built from the basic entry point does not contain their words.

export const dictionaries = [animal, adjective, thing, color];

// ------------------------------------------------------------------ presets
// Preset ids are shared by every locale; English puts the adjective first.

export const presets = {
  'animal-adjective': { template: '{adjective} {animal}', description: 'calm-otter, brave-fox' },
  'thing-adjective': { template: '{adjective} {thing}', description: 'quiet-harbor, bold-lantern' },
  'color-thing': { template: '{color} {thing}', description: 'red-lantern, silver-bridge' },
  'docker-style': {
    template: '{adjective} {animal} {num}',
    description: 'calm-otter-4821 (numeric suffix to avoid collisions)',
  },
  phonetic: { template: '{pseudo:2} {pseudo:2}', description: 'mako-rivu, telo-nami (pronounceable made-up words)' },
};

const extraPresets = {
  'city-adjective': { template: '{adjective} {city}', description: 'calm-paris, brave-tokyo' },
  'fruit-adjective': { template: '{adjective} {fruit}', description: 'sunny-mango, brave-cherry' },
  'plant-adjective': { template: '{adjective} {plant}', description: 'quiet-fern, bold-oak' },
  'country-adjective': { template: '{adjective} {country}', description: 'calm-iceland, brave-japan' },
};

export const basic = { dictionaries, presets, animal, adjective, thing, color };

export const full = {
  dictionaries: [animal, adjective, thing, color, city, fruit, plant, country],
  presets: /* @__PURE__ */ Object.assign({}, presets, extraPresets),
  animal, adjective, thing, color, city, fruit, plant, country,
};
