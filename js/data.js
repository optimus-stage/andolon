// Game data: map landmarks, police stations, chants, fictional news headlines, names.
// Map scale: 1 km = 190 px. Centre (0,0) = Central Shaheed Minar. North is up.
// Positions come from approximate real coordinates (stylised, not survey-accurate).

const MAP_R = 3100;                    // radius of the circular map
const RINGS = [2300, 1500, 800];       // barricade ring radii (outer to inner)
const GATE_NEEDS = [6, 14, 25];        // crowd size needed to open each gate
const GATES_PER_RING = [6, 2, 2];      // number of police barricades on the outer, middle and inner rings
const HOUSE_COUNT = 110;               // solid houses on the map (kept few on purpose)
const POLICE_PER_ZONE = [1, 2, 3, 4];  // police from the outer zone to the centre
const GATE_HALF = 85;                  // half-width of a gate gap in px
const GOAL = {x: 0, y: 0, r: 130};
const NEED_HOLD = 10, NEED_CROWD = 15; // hold the Shaheed Minar for 10s with 15 people
const MAX_DAY = 30, DAY_SECONDS = 8;     // 30 days x 8 seconds = 4 minutes
const TIME_PAR = 180;                   // winning faster than this earns a speed bonus
const BYSTANDERS = [180, 150, 120, 90]; // starting bystanders per zone, outer to centre
const RECRUIT_R = 32;                   // how close you must get to bring a bystander along
const RIVAL_MAX = 12, RIVAL_BLOCK = 8, RIVAL_RECRUIT_EVERY = 4;   // rival crowd size cap, size that can block the square, seconds between recruits
const SCORE = {recruit: 5, crowd: 10, ring: 300, clash: 20, win: 2000, speed: 5, detained: 0.6, timeout: 0.8};

// Ranks by score (Bengali + English)
const RANKS = [
  {min: 0,    bn: 'নবীন',        en: 'Newcomer'},
  {min: 500,  bn: 'স্বেচ্ছাসেবক', en: 'Volunteer'},
  {min: 1500, bn: 'সংগঠক',       en: 'Organiser'},
  {min: 3000, bn: 'নেতা',        en: 'Leader'},
  {min: 5000, bn: 'কিংবদন্তি',    en: 'Legend'},
];
// Special tags shown on the final card
const TAGS = {
  fast:        {bn: 'ঝড়ের গতি',            en: 'Storm Speed'},
  unbreakable: {bn: 'অদম্য',                en: 'Unbreakable'},
  mass:        {bn: 'জনসমুদ্র',              en: 'Sea of People'},
  laststand:   {bn: 'শেষ লড়াই',            en: 'Last Stand'},
  breaker:     {bn: 'ব্যারিকেড ভাঙনকারী',    en: 'Barricade Breaker'},
  first:       {bn: 'প্রথম কণ্ঠ',            en: 'First Voice'},
  mid:         {bn: 'মাঝপথের যোদ্ধা',        en: 'Midway Fighter'},
  inner:       {bn: 'ভেতরের সীমানা পর্যন্ত', en: 'Made It to the Inner Line'},
};
// Friendly roasts when Day 30 ends without holding the Shaheed Minar
const ROASTS = {
  biriyani: {tag: 'বিরিয়ানি বিপ্লবী',        line: '৩০ দিন পার, বিরিয়ানির লাইনেই দিন শেষ!'},
  alone:    {tag: 'একলা চলো রে',             line: 'একাই একশো ভাবলেন, কিন্তু গুনে দেখি ১!'},
  afraid:   {tag: 'ব্যারিকেডের ভয়ে ঘরমুখো',   line: 'ব্যারিকেড দেখেই ঘরের পথ ধরলেন?'},
  fb:       {tag: 'ফেসবুক বিপ্লবী',           line: 'পোস্ট তো অনেক করলেন, রাজপথে এলেন কই?'},
};
const START = {x: -300, y: -2900};     // north edge (Uttara side)

// Police stations a detained protester can be taken to (plus Aynaghor).
const STATIONS = [
  {name: 'Shahbag Thana',    x: -57,  y: -150},
  {name: 'Dhanmondi Thana',  x: -486, y: -285},
  {name: 'Motijheel Thana',  x: 400,  y: -42},
  {name: 'Jatrabari Thana',  x: 716,  y: 437},
  {name: 'Gulshan Thana',    x: 190,  y: -1270},
  {name: 'Mirpur Thana',     x: -550, y: -1570},
  {name: 'Uttara Thana',     x: -342, y: -3040},
];
const AYNAGHOR = {name: 'Aynaghor', x: 60, y: -1420};

// Hospitals: after being beaten by police, walk into one to recover energy (approximate positions).
const HOSPITALS = [
  {name: 'Dhaka Medical (DMCH)', x: 40,   y: 175},
  {name: 'BSMMU',                x: -110, y: -125},
  {name: 'Jatrabari Hospital',   x: 800,  y: 350},
  {name: 'United Hospital',      x: 360,  y: -1300},
  {name: 'Mirpur Hospital',      x: -700, y: -1700},
  {name: 'Uttara Hospital',      x: -250, y: -2800},
];
// Named mosques and coffee shops (more random ones are generated on the map)
const NAMED_MOSQUES = [{name: 'Baitul Mukarram', x: 270, y: 110}];
const NAMED_COFFEE = [{name: 'Shahbag Coffee', x: -210, y: -90}];

// Decorative landmarks (label only)
const LANDMARKS = [
  {name: 'Hatirjheel', x: 130, y: -380, kind: 'lake'},
  {name: 'Motijheel', x: 380, y: 60, kind: 'area'},
  {name: 'Dhanmondi', x: -560, y: -380, kind: 'area'},
  {name: 'Gulshan', x: 260, y: -1180, kind: 'area'},
  {name: 'Mirpur', x: -650, y: -1480, kind: 'area'},
  {name: 'Uttara', x: -420, y: -2950, kind: 'area'},
  {name: 'Old Dhaka', x: 170, y: 560, kind: 'area'},
  {name: 'Jatrabari', x: 760, y: 560, kind: 'area'},
  {name: 'Shahbag', x: -150, y: -260, kind: 'area'},
];
// Buriganga river (decorative), as points
const RIVER = [[-2300, 700], [-1400, 1150], [-600, 1300], [100, 1180], [800, 1050], [1700, 1250], [2500, 1700]];

const CHANTS = [
  {call: ['ক্ষমতা না, জনতা?', 'Khomota na, Jonota?'], resp: ['জনতা জনতা!', 'Jonota jonota!']},
  {call: ['দালালি না রাজপথ?', 'Dalali na Rajpath?'],  resp: ['রাজপথ রাজপথ!', 'Rajpath Rajpath!']},
  {call: ['আপোষ না সংগ্রাম?', 'Aposh na shongram?'],  resp: ['সংগ্রাম সংগ্রাম!', 'Shongram shongram!']},
];

// Fictional breaking-news ticker (Bangla)
const HEADLINES = [
  'চায়ের দোকানে বিস্কুট শেষ, দোকানদার বললেন, "এত চাহিদা আশা করিনি"',
  'রিকশাচালকের ঘোষণা: ব্যানার হাতে থাকলে ভাড়া মাফ',
  'যানজটকে ঐতিহ্যবাহী স্থান ঘোষণার দাবি তুলল ক্লান্ত যাত্রীরা',
  'সংবাদ সম্মেলনে বক্তৃতার মাঝখানে নিজের ফোনের রিংটোন বেজে উঠল',
  'শহীদ মিনারের চত্বরে কবুতরের লাইন, মন্তব্য করতে অস্বীকৃতি',
  'ইন্টারনেট ধীর হতেই মানুষ আবার গল্প করতে শিখল',
  'পাড়ার খালা ত্রাণ মন্ত্রণালয়ের চেয়েও দ্রুত নাশতা বিলি করছেন',
  'ছাত্রের আবিষ্কার: হাইলাইটার কলম ব্যক্তিত্ব নয়',
  'হেলমেট পরে চায়ের আড্ডায় দেখা গেল প্রতিপক্ষ দলকে',
  'এক কাপ চায়ে তিনজনের দাম মিটিয়ে দিলেন অচেনা এক ভাই',
];

// Fictional names for other detained people (shown in small photo cards)
const NAMES = ['রাফি', 'তানভীর', 'সাদিয়া', 'নুসরাত', 'মেহেদী', 'আরিফ', 'ফারিহা', 'শিহাব', 'তামিম', 'জেরিন'];
