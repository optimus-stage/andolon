// Chapters: each chapter is one map plus its balance numbers and flavour text.
// To add a chapter, append an object below. data.js reads the active chapter and turns it into the globals the game uses.
// Map scale: 1 km = 190 px. Centre (0,0) = the goal. North is up. Positions are stylised, not survey-accurate.
//
// Open the game with ?chapter=<id> to play a chapter; the first one is the default.

const CHAPTERS = [
  {
    id: 'dhaka-march',
    title: {en: 'The March to the Minar', bn: 'শহীদ মিনারের পথে'},

    // ---- balance: change these numbers to make a chapter easier or harder ----
    balance: {
      mapR: 3100,                      // radius of the circular map
      rings: [2300, 1500, 800],        // barricade ring radii (outer to inner)
      gateNeeds: [6, 14, 25],          // crowd size needed to open each gate
      gatesPerRing: [6, 2, 2],         // number of police barricades on the outer, middle and inner rings
      houseCount: 240,                 // solid houses on the map
      policePerZone: [4, 6, 3, 4],     // police in each zone, outermost to centre
      gateHits: 3,                     // strikes needed to break a barricade (when the crowd is big enough)
      gateHalf: 85,                    // half-width of a gate gap in px
      goal: {x: 0, y: 0, r: 130},
      needHold: 10, needCrowd: 15,     // hold the goal for 10s with 15 people
      maxDay: 30, daySeconds: 8,       // 30 days x 8 seconds = 4 minutes
      timePar: 180,                    // winning faster than this earns a speed bonus
      bystanders: [180, 150, 120, 90], // starting bystanders per zone, outer to centre
      recruitR: 32,                    // how close you must get to bring a bystander along
      start: {x: -300, y: -2900},      // where the player starts (north edge)
      rival: {
        max: 14, block: 8, recruitEvery: 4,  // crowd size cap, size that can block the square, seconds between recruits
        target: 12,                          // rival crowds kept on the map (about 3 per zone)
        hunt: 450, lose: 700, huntSpeed: 100, // chase range, give-up range, chase speed (you are always faster)
        armedChance: 0.25, gunRange: 260, gunCd: 5, gunAim: 0.6,   // armed crowds: share, range, seconds between shots, warning time
      },
      rescue: {need: 8, time: 6, r: 140, detainHold: 60},   // people needed, seconds, ring radius, seconds before detainees are freed anyway
      police: {disperseGoal: 10, marchMax: 40},             // police side: crowds to disperse to win, largest AI crowd
    },

    // ---- map content ----
    map: {
      // Police stations a detained protester can be taken to (plus the Aynaghor).
      stations: [
        {name: 'Shahbag Thana',    x: -330, y: -170},
        {name: 'Dhanmondi Thana',  x: -486, y: -285},
        {name: 'Motijheel Thana',  x: 400,  y: -42},
        {name: 'Jatrabari Thana',  x: 716,  y: 437},
        {name: 'Gulshan Thana',    x: 190,  y: -1270},
        {name: 'Mirpur Thana',     x: -550, y: -1570},
        {name: 'Uttara Thana',     x: -342, y: -3040},
      ],
      aynaghor: {name: 'Aynaghor', x: 60, y: -1420},
      // Hospitals: after being beaten by police, walk into one to recover energy.
      hospitals: [
        {name: 'DMC',                  x: -120, y: 330},
        {name: 'BSMMU',                x: -230, y: -420},
        {name: 'Jatrabari Hospital',   x: 800,  y: 350},
        {name: 'United Hospital',      x: 360,  y: -1300},
        {name: 'Mirpur Hospital',      x: -700, y: -1700},
        {name: 'Uttara Hospital',      x: -250, y: -2800},
      ],
      // Named mosques and coffee shops (more random ones are generated on the map)
      namedMosques: [{name: 'Baitul Mukarram', x: 270, y: 110}],
      namedCoffee: [{name: 'Shahbag Coffee', x: -210, y: -90}],
      // Decorative landmarks (label only)
      landmarks: [
        {name: 'Hatirjheel', x: 130, y: -380, kind: 'lake'},
        {name: 'Motijheel', x: 380, y: 60, kind: 'area'},
        {name: 'Dhanmondi', x: -560, y: -380, kind: 'area'},
        {name: 'Gulshan', x: 260, y: -1180, kind: 'area'},
        {name: 'Mirpur', x: -650, y: -1480, kind: 'area'},
        {name: 'Uttara', x: -420, y: -2950, kind: 'area'},
        {name: 'Old Dhaka', x: 170, y: 560, kind: 'area'},
        {name: 'Jatrabari', x: 760, y: 560, kind: 'area'},
        {name: 'Shahbag', x: -150, y: -260, kind: 'area'},
      ],
      // Buriganga river (decorative), as points
      river: [[-2300, 700], [-1400, 1150], [-600, 1300], [100, 1180], [800, 1050], [1700, 1250], [2500, 1700]],
    },

    // ---- flavour text ----
    flavor: {
      chants: [
        {call: ['ক্ষমতা না, জনতা?', 'Khomota na, Jonota?'], resp: ['জনতা জনতা!', 'Jonota jonota!']},
        {call: ['দালালি না রাজপথ?', 'Dalali na Rajpath?'],  resp: ['রাজপথ রাজপথ!', 'Rajpath Rajpath!']},
        {call: ['আপোষ না সংগ্রাম?', 'Aposh na shongram?'],  resp: ['সংগ্রাম সংগ্রাম!', 'Shongram shongram!']},
        {call: ['শান্তি না সংঘাত?', 'Shanti na shonghat?'],    resp: ['শান্তি শান্তি!', 'Shanti shanti!']},
      ],
      // Fictional breaking-news ticker (Bangla)
      headlines: [
        'মামার টঙে চায়ের দাম বাড়েনি, তবে বিস্কুটের সাইজ ছোট হয়েছে বলে অভিযোগ',
        'বিরিয়ানির প্লেটে আলু খুঁজতে গিয়ে দুই বন্ধুর মধ্যে ঠান্ডা যুদ্ধ',
        'মিছিলে হাঁটতে হাঁটতে মোবাইলের চার্জ শেষ, সেলফি আর হলো না',
        'হাসপাতালের সামনের ফুচকাওয়ালার বিক্রি বেড়েছে তিনগুণ',
        'রিকশাচালক বললেন, "ভাড়া নিয়ে দরদাম করবেন না, আজ আমিও মিছিলে"',
        'ব্যারিকেডের পাশে বসে খালু সুডোকু সমাধানে ব্যস্ত, পুলিশও অবাক',
        'মশার দল আজও নিরপেক্ষ: সবাইকে সমানভাবে কামড়াল',
        'লোডশেডিংয়ে অন্ধকার, তবু মিছিলের স্লোগান আরও জোরালো',
        'চা খেতে এসে ভুল করে মিছিলের সামনে চলে গেলেন এক ভাই, এখন তিনিই নেতা',
        'মিছিলের পেছনে এক বিড়াল নিয়মিত হাঁটছে, নাম দেওয়া হয়েছে "ক্যাপ্টেন মিউ"',
        'ক্লান্ত এক কর্মী ঘোষণা করলেন, "আর দশ মিনিট হাঁটলে রাজপথেই ঘুমিয়ে পড়ব"',
        'ফেসবুক বিপ্লবীদের আজ রাজপথে দেখা গেল, তবে শুধু সেলফির জন্য',
      ],
    },
  },
];
