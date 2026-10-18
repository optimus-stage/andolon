// Game data shared by every chapter: ranks, tags, names, support links.
// Level and map data lives in chapters.js; the globals below are filled from the active chapter.
// Map scale: 1 km = 190 px. Centre (0,0) = the goal. North is up.

// ---- active chapter (pick one with ?chapter=<id>; the first chapter is the default) ----
const CHAPTER = CHAPTERS.find(c => c.id === new URLSearchParams(location.search).get('chapter')) || CHAPTERS[0];
const BAL = CHAPTER.balance;

const MAP_R = BAL.mapR;                // radius of the circular map
const RINGS = BAL.rings;               // barricade ring radii (outer to inner)
const GATE_NEEDS = BAL.gateNeeds;      // crowd size needed to open each gate
const GATES_PER_RING = BAL.gatesPerRing;
const HOUSE_COUNT = BAL.houseCount;
const POLICE_PER_ZONE = BAL.policePerZone;
const GATE_HALF = BAL.gateHalf;
const GOAL = BAL.goal;
const NEED_HOLD = BAL.needHold, NEED_CROWD = BAL.needCrowd;
const MAX_DAY = BAL.maxDay, DAY_SECONDS = BAL.daySeconds;
const TIME_PAR = BAL.timePar;
const BYSTANDERS = BAL.bystanders;
const RECRUIT_R = BAL.recruitR;
const START = BAL.start;
const RIVAL_MAX = BAL.rival.max, RIVAL_BLOCK = BAL.rival.block, RIVAL_RECRUIT_EVERY = BAL.rival.recruitEvery;
const RIVAL_TARGET = BAL.rival.target;
const RIVAL_HUNT = BAL.rival.hunt, RIVAL_LOSE = BAL.rival.lose, RIVAL_HUNT_SPEED = BAL.rival.huntSpeed;
const RIVAL_ARMED_CHANCE = BAL.rival.armedChance, GUN_RANGE = BAL.rival.gunRange, GUN_CD = BAL.rival.gunCd, GUN_AIM = BAL.rival.gunAim;
const RESCUE_NEED = BAL.rescue.need, RESCUE_TIME = BAL.rescue.time, RESCUE_R = BAL.rescue.r, DETAIN_HOLD = BAL.rescue.detainHold;
const DISPERSE_GOAL = BAL.police.disperseGoal;   // police side: crowds to disperse to win
const MARCH_MAX = BAL.police.marchMax;           // police side: largest AI protester crowd

const STATIONS = CHAPTER.map.stations, AYNAGHOR = CHAPTER.map.aynaghor, HOSPITALS = CHAPTER.map.hospitals;
const NAMED_MOSQUES = CHAPTER.map.namedMosques, NAMED_COFFEE = CHAPTER.map.namedCoffee;
const LANDMARKS = CHAPTER.map.landmarks, RIVER = CHAPTER.map.river;
const CHANTS = CHAPTER.flavor.chants, HEADLINES = CHAPTER.flavor.headlines;

// ---- scoring and titles (same for every chapter) ----
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
  fast:        {bn: 'বজ্রগতি',            en: 'Storm Speed', desc: 'Held the Minar in record time.'},
  unbreakable: {bn: 'অপরাজেয়',                en: 'Unbreakable', desc: 'Won without a single beating.'},
  mass:        {bn: 'জনসমুদ্র',              en: 'Sea of People', desc: 'Marched with a huge crowd.'},
  laststand:   {bn: 'শেষ প্রহরী',            en: 'Last Stand', desc: 'Won after a trip to the hospital.'},
  breaker:     {bn: 'প্রাচীরভাঙা',    en: 'Barricade Breaker', desc: 'Broke through every barricade.'},
  first:       {bn: 'প্রথম হুংকার',          en: 'First Roar', desc: 'Took the first step toward the Minar.'},
  mid:         {bn: 'নির্ভীক',              en: 'Fearless', desc: 'Kept marching past the barricades.'},
  inner:       {bn: 'দুর্দমনীয়',                en: 'Indomitable', desc: 'Pushed deep into the inner ring.'},
};
// Friendly roasts when Day 30 ends without holding the Shaheed Minar
const ROASTS = {
  biriyani: {tag: 'বিরিয়ানি বিপ্লবী',        line: '৩০ দিন পার, বিরিয়ানির লাইনেই দিন শেষ!', en: 'Biriyani Revolutionary', desc: 'Spent more time at the stall than the march.'},
  alone:    {tag: 'একলা চলো রে',             line: 'একাই একশো ভাবলেন, কিন্তু গুনে দেখি ১!', en: 'Lone Walker', desc: 'Marched with almost nobody.'},
  afraid:   {tag: 'ঘরমুখো যোদ্ধা',   line: 'ব্যারিকেড দেখেই ঘরের পথ ধরলেন?', en: 'Barricade Dodger', desc: 'Never got past the first barricade.'},
  fb:       {tag: 'ফেসবুক বিপ্লবী',           line: 'পোস্ট তো অনেক করলেন, রাজপথে এলেন কই?', en: 'Facebook Revolutionary', desc: 'Posted plenty, marched little.'},
};

// Fictional names for other detained people (shown in small photo cards)
const NAMES = ['রাফি', 'তানভীর', 'সাদিয়া', 'নুসরাত', 'মেহেদী', 'আরিফ', 'ফারিহা', 'শিহাব', 'তামিম', 'জেরিন'];

// ---- Police side ----
const PRANKS = [
  {min: 0,    bn: 'কনস্টেবল',       en: 'Constable',      metal: 'Bronze',   stars: 1, fr: ['#d9966a','#a85f33'], edge: '#6b3517', strip: '#e6b48f', box: '#f6e3d3', ink: '#3a1c0a', art: '#2b2420', art2: '#352c27', m: ['#e8a070','#b8693a','#7a3d1c'], ribbon: ['#a85a2c','#d98a55']},
  {min: 600,  bn: 'নায়েক',         en: 'Naik',           metal: 'Silver',   stars: 2, fr: ['#e4e9ef','#a2acb8'], edge: '#5d6672', strip: '#cfd6de', box: '#f1f4f7', ink: '#1d232b', art: '#272b33', art2: '#30353f', m: ['#eef2f7','#aab4c2','#6c7685'], ribbon: ['#8d9bb0','#c5d0de']},
  {min: 1500, bn: 'উপ-পরিদর্শক',    en: 'Sub-Inspector',  metal: 'Gold',     stars: 3, fr: ['#ffe27a','#d49a14'], edge: '#8a5f05', strip: '#f1d77a', box: '#fbf0bf', ink: '#412402', art: '#2b2a22', art2: '#35342a', m: ['#fff1a6','#f0b72a','#b07a08'], ribbon: ['#c8861a','#ffd24d']},
  {min: 3000, bn: 'পরিদর্শক',       en: 'Inspector',      metal: 'Platinum', stars: 4, fr: ['#dff3ff','#7fb4de'], edge: '#2d6a9e', strip: '#b9dcf5', box: '#eaf6fd', ink: '#0b2b47', art: '#1d2b3d', art2: '#263a52', m: ['#f2fbff','#9fd0f0','#4d8fc4'], ribbon: ['#3f7fb8','#8cc4ee'], wings: true},
  {min: 5000, bn: 'পুলিশ সুপার',     en: 'Superintendent', metal: 'Diamond',  stars: 5, fr: ['#b8f1ff','#7a6cf0'], edge: '#3b2fa8', strip: '#c9c2ff', box: '#ecebff', ink: '#171044', art: '#1b1b3a', art2: '#26264d', m: ['#e6fbff','#6fd6f5','#6a5be0'], ribbon: ['#4a3fc9','#79d4f5'], wings: true, glow: true},
  {min: 7500, bn: 'কমিশনার',        en: 'Commissioner',   metal: 'Legend',   stars: 5, fr: ['#3a0d14','#14070a'], edge: '#e8b53a', strip: '#6e1a26', box: '#2a1015', ink: '#ffe9b0', art: '#120a0c', art2: '#1e1013', m: ['#fff0b0','#e8b53a','#a8300f'], ribbon: ['#8d1a2c','#e8b53a'], wings: true, glow: true, dark: true},
];
const PTAGS = {
  calm:        {bn: 'ঠান্ডা মাথা',      en: 'Cool Head',       desc: 'Kept order with very little force.'},
  swift:       {bn: 'বিদ্যুৎ বাহিনী',    en: 'Lightning Squad', desc: 'Cleared the streets in record time.'},
  full:        {bn: 'পূর্ণ বাহিনী',      en: 'Full Force',      desc: 'Led a big squad to the finish.'},
  smoke:       {bn: 'ধোঁয়াশা-ওস্তাদ',   en: 'Smoke Master',    desc: 'Used smoke to clear the way.'},
  steady:      {bn: 'অবিচল',          en: 'Steady Hands',    desc: 'Held the line to the end.'},
  overreach:   {bn: 'বাড়াবাড়ি',       en: 'Overreach',       desc: 'Too much force turned the public against you.'},
  slow:        {bn: 'দেরিতে সাড়া',     en: 'Slow Response',   desc: 'A crowd reached the Minar before you could stop it.'},
  outnumbered: {bn: 'সংখ্যায় কম',      en: 'Outnumbered',     desc: 'Too few officers to hold the line.'},
};

// Optional support ("Buy your Neta a cha"). Leave all empty to hide it everywhere.
// bkashNumber: shown with a Copy button. While it is empty, the button shows closedMessage instead (set both empty to hide the button).
const SUPPORT = {bkashNumber: '', closedMessage: 'Oops! Your Neta is not accepting gift currently, thanks for your generosity by the way 😊'};
// Optional WhatsApp group for game updates. qr: path to your QR image, e.g. 'img/whatsapp-qr.png'. link: the group invite link (lets phone users tap instead of scan).
const WHATSAPP = {qr: 'img/whatsapp-qr.png', link: 'https://chat.whatsapp.com/F3ihSA2kTBEL7egenBkNZL'};
