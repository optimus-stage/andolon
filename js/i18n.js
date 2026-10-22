// ---------- English / Bangla ----------
// tr('English text with {vars}', {vars}) returns the Bangla version when the language is Bangla. Text without a translation stays English.
// Static page text is marked data-t="id" in index.html; its Bangla HTML is in BNH below.
let LANG = 'en';
try { LANG = localStorage.getItem('da_lang') || ((navigator.language || '').toLowerCase().indexOf('bn') === 0 ? 'bn' : 'en'); } catch (e) {}
const bnDigits = s => String(s).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
function tr(k, v){
  let s = (LANG === 'bn' && BN[k]) || k;
  if (v) s = s.replace(/\{(\w+)\}/g, (m, n) => n in v ? v[n] : m);
  return LANG === 'bn' ? bnDigits(s) : s;
}
const isBn = () => LANG === 'bn';
const loc = n => { const s = Number(n).toLocaleString('en-US'); return LANG === 'bn' ? bnDigits(s) : s; };
const nd = v => LANG === 'bn' ? bnDigits(v) : String(v);

const BN = {
  // --- menu and buttons ---
  'Start marching': 'মিছিল শুরু করুন', 'Start patrol': 'টহল শুরু করুন', 'How to play': 'কীভাবে খেলবেন',
  'Protester': 'আন্দোলনকারী', 'Officer': 'অফিসার',
  'Andolonkari': 'আন্দোলনকারী', 'Police': 'পুলিশ',
  'Leaderboard': 'লিডারবোর্ড', 'Your division (for the leaderboard)': 'আপনার বিভাগ (লিডারবোর্ডের জন্য)',
  'Select your division': 'আপনার বিভাগ বাছাই করুন', 'Division': 'বিভাগ', 'All divisions': 'সব বিভাগ',
  'Submit score to leaderboard': 'স্কোর লিডারবোর্ডে জমা দিন', 'View leaderboard': 'লিডারবোর্ড দেখুন',
  'Submits your name, division and score. Your photo is never uploaded.': 'আপনার নাম, বিভাগ ও স্কোর জমা হবে। আপনার ছবি কখনো আপলোড হয় না।',
  'Please choose your division first.': 'আগে আপনার বিভাগ বাছাই করুন।',
  'Submitting...': 'জমা হচ্ছে...', 'Submitted ✓': 'জমা হয়েছে ✓',
  'You are #{n} of {m} on the board (your best: {b}).': 'বোর্ডে {m} জনের মধ্যে আপনি {n} নম্বরে (আপনার সেরা: {b})।',
  'Could not submit. Check your connection and try again.': 'জমা দেওয়া যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।',
  'Loading...': 'লোড হচ্ছে...', 'No scores yet. Be the first!': 'এখনো কোনো স্কোর নেই। প্রথম হোন!',
  'Could not load the leaderboard. Check your connection and try again.': 'লিডারবোর্ড লোড করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।',
  'Nickname': 'ডাকনাম', 'Choose a nickname': 'একটি ডাকনাম বাছাই করুন',
  'Shown on the leaderboard. You can change it once every 7 days.': 'লিডারবোর্ডে দেখানো হবে। প্রতি ৭ দিনে একবার বদলাতে পারবেন।',
  'Please enter a nickname.': 'অনুগ্রহ করে একটি ডাকনাম লিখুন।',
  'Use 1 to 24 letters, numbers, spaces, dots, dashes or underscores.': 'ডাকনামে ১ থেকে ২৪টি অক্ষর, সংখ্যা, স্পেস, ডট, ড্যাশ বা আন্ডারস্কোর ব্যবহার করুন।',
  'That nickname is reserved. Please pick another.': 'এই ডাকনামটি সংরক্ষিত। অন্য একটি বাছাই করুন।',
  'That nickname is already taken. Please pick another.': 'এই ডাকনামটি আগেই নেওয়া হয়েছে। অন্য একটি বাছাই করুন।',
  'You can change your nickname again in {n} days.': 'আপনি আবার {n} দিন পরে ডাকনাম বদলাতে পারবেন।',
  'Could not save that nickname. It may be taken or reserved. Please try another.': 'ডাকনামটি সংরক্ষণ করা যায়নি। এটি নেওয়া বা সংরক্ষিত হতে পারে। অন্য একটি চেষ্টা করুন।',
  'Keep your record on any device.': 'যেকোনো ডিভাইসে আপনার রেকর্ড রাখুন।', 'Save my progress with Google': 'গুগল দিয়ে আমার অগ্রগতি সংরক্ষণ করুন',
  'Signed in as {e}': '{e} হিসেবে সাইন ইন করা', 'Sign out': 'সাইন আউট',
  'Sign out? This device will become a new anonymous player. Your record stays on your Google account.': 'সাইন আউট করবেন? এই ডিভাইস নতুন বেনামি খেলোয়াড় হয়ে যাবে। আপনার রেকর্ড আপনার গুগল অ্যাকাউন্টেই থাকবে।',
  'Signed in. Welcome back, {n}!': 'সাইন ইন হয়েছে। আবার স্বাগতম, {n}!', 'Saved. Your record now follows your Google account.': 'সংরক্ষিত। আপনার রেকর্ড এখন আপনার গুগল অ্যাকাউন্টের সঙ্গে থাকবে।',
  'Sign-in was cancelled.': 'সাইন ইন বাতিল করা হয়েছে।', 'Could not sign in. Try again.': 'সাইন ইন করা যায়নি। আবার চেষ্টা করুন।',
  'Daily Challenge': 'দৈনিক চ্যালেঞ্জ', "Today's twist: {t}": 'আজকের বিশেষত্ব: {t}', '{n} of {m} attempts left': '{m}টির মধ্যে {n}টি সুযোগ বাকি',
  '🔥 {n}-day streak': '🔥 টানা {n} দিন', 'Resets in {t}': 'নতুন চ্যালেঞ্জ {t} পরে',
  "Play today's challenge": 'আজকের চ্যালেঞ্জ খেলুন', 'Come back tomorrow': 'কাল আবার আসুন', "Today's board": 'আজকের বোর্ড', 'Today': 'আজ', 'All-time': 'সর্বকালের',
  "Submit to today's board": 'আজকের বোর্ডে জমা দিন',
  "You are #{n} of {m} on today's board (your best today: {b}).": 'আজকের বোর্ডে {m} জনের মধ্যে আপনি {n} নম্বরে (আজকের সেরা: {b})।',
  'Try again ({n} left)': 'আবার চেষ্টা করুন ({n}টি বাকি)', 'Andolon Daily · {d}': 'আন্দোলন দৈনিক · {d}',
  'Andolon Daily Challenge {d}: {s} pts. Can you beat me?': 'আন্দোলন দৈনিক চ্যালেঞ্জ {d}: {s} পয়েন্ট। আমাকে হারাতে পারবেন?',
  'Big turnout': 'বিশাল জমায়েত', 'Rival surge': 'প্রতিপক্ষের ঢল', 'Thin crowds': 'পাতলা ভিড়', 'Big marches': 'বড় মিছিল', 'More marches': 'বেশি মিছিল', 'Standard day': 'সাধারণ দিন',
  'Profile': 'প্রোফাইল', 'My profile': 'আমার প্রোফাইল', 'Achievements': 'অর্জন', '{n} of {m} unlocked': '{m}টির মধ্যে {n}টি অর্জিত',
  'New achievement': 'নতুন অর্জন', 'New achievements': 'নতুন অর্জনসমূহ',
  'Games played': 'খেলা হয়েছে', 'Wins': 'জয়', 'Win rate': 'জয়ের হার', 'Time played': 'খেলার সময়', 'Best crowd': 'সর্বোচ্চ জনতা',
  'Best score (Andolonkari)': 'সেরা স্কোর (আন্দোলনকারী)', 'Best score (Police)': 'সেরা স্কোর (পুলিশ)', 'Barricades broken': 'ভাঙা ব্যারিকেড',
  'Rival clashes won': 'জেতা সংঘাত', 'Crowds dispersed (total)': 'মোট ছত্রভঙ্গ জনতা', 'Daily challenges': 'দৈনিক চ্যালেঞ্জ', 'Best streak': 'সেরা ধারা', 'Times detained': 'আটক হয়েছেন',
  '{n} min': '{n} মিনিট', '{h} h {m} min': '{h} ঘণ্টা {m} মিনিট',
  'Your profile is saved on this device. Sign in with Google to keep it on any device.': 'আপনার প্রোফাইল এই ডিভাইসে সংরক্ষিত। যেকোনো ডিভাইসে রাখতে গুগল দিয়ে সাইন ইন করুন।',
  'Your profile is saved on this device.': 'আপনার প্রোফাইল এই ডিভাইসে সংরক্ষিত।',
  'First Steps': 'প্রথম পদক্ষেপ', 'Finish your first game.': 'আপনার প্রথম খেলা শেষ করুন।',
  'Minar Held': 'মিনার দখলে', 'Hold the Shaheed Minar as Andolonkari.': 'আন্দোলনকারী হয়ে শহীদ মিনার ধরে রাখুন।',
  'Growing Crowd': 'বাড়ন্ত জনতা', 'March with 25 people at once.': 'একসঙ্গে ২৫ জন নিয়ে মিছিল করুন।',
  'Sea of People': 'জনসমুদ্র', 'March with 60 people at once.': 'একসঙ্গে ৬০ জন নিয়ে মিছিল করুন।',
  'Wall Breaker': 'প্রাচীরভাঙা', 'Break 10 police barricades.': '১০টি পুলিশ ব্যারিকেড ভাঙুন।',
  'Deep Inside': 'গভীরে', 'Reach the inner ring in one run.': 'এক খেলায় ভেতরের বলয়ে পৌঁছান।',
  'Unbreakable': 'অপরাজেয়', 'Win without a single beating.': 'একবারও মার না খেয়ে জিতুন।',
  'Storm Speed': 'বজ্রগতি', 'Win in under 150 seconds.': '১৫০ সেকেন্ডের কম সময়ে জিতুন।',
  'Rival Breaker': 'প্রতিপক্ষ-দমন', 'Win 10 clashes against rival crowds.': 'প্রতিপক্ষ জনতার সঙ্গে ১০টি সংঘাতে জিতুন।',
  'Back on Your Feet': 'আবার উঠে দাঁড়ানো', 'Recover at hospitals 5 times.': '৫ বার হাসপাতালে সেরে উঠুন।',
  'Chai Break': 'চা-বিরতি', "Drink Mamar Tong's tea 5 times.": 'মামার টঙের চা ৫ বার খান।',
  'Taken to Thana': 'থানায় যাত্রা', 'Get detained once. It happens to the best.': 'একবার আটক হোন। সেরাদেরও হয়।',
  'Daily Starter': 'দৈনিক শুরু', 'Finish a daily challenge.': 'একটি দৈনিক চ্যালেঞ্জ শেষ করুন।',
  'Daily Habit': 'দৈনিক অভ্যাস', 'Reach a 3-day streak.': 'টানা ৩ দিন খেলুন।',
  'Daily Devotion': 'দৈনিক নিষ্ঠা', 'Reach a 7-day streak.': 'টানা ৭ দিন খেলুন।',
  'Order Restored': 'শৃঙ্খলা ফিরেছে', 'Win as Police.': 'পুলিশ হয়ে জিতুন।',
  'Cool Head': 'ঠান্ডা মাথা', 'Win as Police with public anger under 25.': 'জনরোষ ২৫-এর নিচে রেখে পুলিশ হয়ে জিতুন।',
  'Full Force': 'পূর্ণ বাহিনী', 'Lead a squad of 10 officers.': '১০ জন অফিসারের দলের নেতৃত্ব দিন।',
  'Crowd Control': 'ভিড় নিয়ন্ত্রণ', 'Disperse 50 crowds in total.': 'মোট ৫০টি জনতা ছত্রভঙ্গ করুন।',
  'Smoke Master': 'ধোঁয়াশা-ওস্তাদ', 'Use 5 smoke grenades in one run.': 'এক খেলায় ৫টি ধোঁয়ার গ্রেনেড ব্যবহার করুন।',
  'Veteran': 'অভিজ্ঞ', 'Play 25 games.': '২৫টি খেলা খেলুন।',
  'Both Sides': 'দুই পক্ষই', 'Win as Andolonkari and as Police.': 'আন্দোলনকারী ও পুলিশ দুই পক্ষ হয়েই জিতুন।',
  'Legend of the Minar': 'মিনারের কিংবদন্তি', 'Score 5,000 points as Andolonkari.': 'আন্দোলনকারী হয়ে ৫,০০০ পয়েন্ট স্কোর করুন।',
  'Close': 'বন্ধ করুন', 'Report an inappropriate name': 'অনুপযুক্ত নাম জানান',
  'Barishal': 'বরিশাল', 'Chattogram': 'চট্টগ্রাম', 'Dhaka': 'ঢাকা', 'Khulna': 'খুলনা', 'Mymensingh': 'ময়মনসিংহ', 'Rajshahi': 'রাজশাহী', 'Rangpur': 'রংপুর', 'Sylhet': 'সিলেট', 'Outside Bangladesh': 'বাংলাদেশের বাইরে',
  'Get game updates on WhatsApp': 'হোয়াটসঅ্যাপে গেমের আপডেট পান',
  'New updates are coming. Join the WhatsApp group to hear first': 'নতুন আপডেট আসছে। সবার আগে জানতে হোয়াটসঅ্যাপ গ্রুপে যোগ দিন',
  ': scan the QR code.': ': QR কোড স্ক্যান করুন।', 'Open WhatsApp group': 'হোয়াটসঅ্যাপ গ্রুপ খুলুন',
  'Enjoyed the game? Gift your Neta a cup of tea 🍵': 'খেলাটা ভালো লেগেছে? আপনার নেতাকে এক কাপ চা উপহার দিন 🍵',
  'Optional and non-refundable. It does not unlock anything in the game.': 'ঐচ্ছিক এবং ফেরতযোগ্য নয়। এতে গেমে কিছু খোলে না।',
  'Copy': 'কপি', 'Copied ✓': 'কপি হয়েছে ✓',
  'Oops! Your Neta is not accepting gift currently, thanks for your generosity by the way 😊': 'ইস! আপনার নেতা এখন উপহার নিচ্ছেন না, তবে আপনার উদারতার জন্য ধন্যবাদ 😊',

  // --- how-to-play cards ---
  'You are fast': 'আপনি দ্রুত',
  'Hold the round pad to move.': 'নড়তে গোল প্যাড চেপে ধরুন।', 'Move the mouse to walk.': 'হাঁটতে মাউস নাড়ান।',
  ' You are faster than any crowd and can run through barricades.': ' আপনি যেকোনো জনতার চেয়ে দ্রুত এবং ব্যারিকেডের ভেতর দিয়ে ছুটতে পারেন।',
  'Build your squad': 'আপনার দল গড়ুন',
  'Walk into the blue officers on the streets to add them to your squad (up to 14). A bigger squad scatters more people.': 'রাস্তার নীল পোশাকের অফিসারদের কাছে গেলে তারা আপনার দলে যোগ দেবে (সর্বোচ্চ ১৪ জন)। দল বড় হলে বেশি মানুষ ছত্রভঙ্গ হয়।',
  'Break up the crowds': 'জনতা ছত্রভঙ্গ করুন',
  'Tap STRIKE, SMOKE or FIRE. Nobody is hurt, people just run away.': 'STRIKE, SMOKE বা FIRE চাপুন। কেউ আহত হয় না, মানুষ শুধু পালিয়ে যায়।',
  'Click or Space to strike, G for smoke, F for warning shots. Nobody is hurt, people just run away.': 'স্ট্রাইকে ক্লিক বা স্পেস, ধোঁয়ার জন্য G, সতর্কতামূলক গুলির জন্য F। কেউ আহত হয় না, মানুষ শুধু পালিয়ে যায়।',
  'Protect the Minar': 'মিনার রক্ষা করুন',
  'Disperse {n} crowds before one holds the Shaheed Minar. Using force raises public anger, and at 100 you lose.': 'কোনো জনতা শহীদ মিনার দখলে রাখার আগেই {n}টি জনতা ছত্রভঙ্গ করুন। বল প্রয়োগে জনরোষ বাড়ে, ১০০ হলে আপনি হেরে যাবেন।',
  'Walk and gather': 'হাঁটুন ও মানুষ জড়ো করুন',
  'Hold the round pad to walk.': 'হাঁটতে গোল প্যাড চেপে ধরুন।',
  ' Walk into bystanders to bring them along.': ' পথচারীদের কাছে গেলে তারা সঙ্গে যোগ দেবে।',
  'Pass the barricades': 'ব্যারিকেড পার হোন',
  'Bricks and barriers block the road. With enough people ({list}) stand at a checkpoint and tap STRIKE a few times to break it.': 'ইট ও ব্যারিকেড রাস্তা আটকে রাখে। যথেষ্ট লোক ({list}) নিয়ে চেকপয়েন্টে দাঁড়িয়ে কয়েকবার STRIKE চাপুন, ভেঙে যাবে।',
  'Bricks and barriers block the road. With enough people ({list}) stand at a checkpoint and click or press Space a few times to break it.': 'ইট ও ব্যারিকেড রাস্তা আটকে রাখে। যথেষ্ট লোক ({list}) নিয়ে চেকপয়েন্টে দাঁড়িয়ে কয়েকবার ক্লিক বা স্পেস চাপুন, ভেঙে যাবে।',
  'Stay safe': 'নিরাপদ থাকুন',
  'Police sticks cost morale. Heal at hospitals or biryani stalls. If your morale runs out you will be detained.': 'পুলিশের লাঠির আঘাতে মনোবল কমে। হাসপাতাল বা বিরিয়ানির স্টলে সেরে উঠুন। মনোবল শেষ হলে আপনি আটক হবেন।',
  'Hold the Minar': 'মিনার ধরে রাখুন',
  'Reach the Shaheed Minar with {a} people and hold it for {b} seconds. You have {c} days, about 4 minutes.': '{a} জন নিয়ে শহীদ মিনারে পৌঁছে {b} সেকেন্ড ধরে রাখুন। আপনার হাতে {c} দিন, প্রায় ৪ মিনিট।',
  "Let's go": 'চলুন শুরু করি', 'Got it': 'বুঝেছি', 'Next': 'পরের', 'Skip': 'বাদ দিন',

  // --- in-game messages ---
  'Touch and hold a direction on the round pad to walk. Lift to stop.': 'হাঁটতে গোল প্যাডে দিক ধরে রাখুন। থামতে আঙুল তুলুন।',
  'Use STRIKE, SMOKE and FIRE. Walk into officers to recruit them.': 'STRIKE, SMOKE ও FIRE ব্যবহার করুন। অফিসারদের দলে নিতে তাদের কাছে যান।',
  'Click or Space: strike. G: smoke. F: fire. Walk into officers to recruit them.': 'ক্লিক বা স্পেস: স্ট্রাইক। G: ধোঁয়া। F: গুলি। অফিসারদের দলে নিতে তাদের কাছে যান।',
  'Equal crowds: the protesters win the clash! You lost {a}, they lost {b}{s}': 'সমান জনতা: সংঘাতে আন্দোলনকারীরা জেতে! আপনার {a} জন গেল, তাদের {b} জন গেল{s}',
  'Clash with a rival crowd! You lost {a}, they lost {b}{s}': 'প্রতিপক্ষ জনতার সঙ্গে সংঘাত! আপনার {a} জন গেল, তাদের {b} জন গেল{s}',
  ' ({n} switched sides)': ' ({n} জন পক্ষ বদলাল)',
  'Beaten by the police! Find a hospital{h} to recover.': 'পুলিশের মার খেয়েছেন! সেরে উঠতে হাসপাতাল খুঁজুন{h}।',
  'Police beat back part of your crowd': 'পুলিশ আপনার জনতার একাংশকে হটিয়ে দিল',
  'Someone from your crowd was detained at {s}. Rescue them!': 'আপনার জনতার একজনকে {s}-এ আটক করা হয়েছে। তাঁকে ছাড়িয়ে আনুন!',
  'The police have caught you!': 'পুলিশ আপনাকে ধরে ফেলেছে!',
  'Taken to {s}': '{s}-এ নিয়ে যাওয়া হলো',
  'Crowd dispersed! {a} of {b}': 'জনতা ছত্রভঙ্গ! {b}-এর মধ্যে {a}',
  'Out of smoke grenades. One comes back every few seconds.': 'ধোঁয়ার গ্রেনেড শেষ। কয়েক সেকেন্ড পরপর একটি ফিরে আসে।',
  'Out of rounds. One comes back every few seconds.': 'গুলি শেষ। কয়েক সেকেন্ড পরপর একটি ফিরে আসে।',
  'An officer joins your squad ({n})': 'একজন অফিসার আপনার দলে যোগ দিলেন ({n})',
  'This police barricade needs {n} people to break. You have {m}.': 'এই পুলিশ ব্যারিকেড ভাঙতে {n} জন লাগবে। আপনার আছে {m} জন।',
  'The police barricade gives way. Keep moving!': 'পুলিশ ব্যারিকেড ভেঙে পড়ল। এগিয়ে চলুন!',
  '{n} more strike to break it.': 'ভাঙতে আরও {n}টি স্ট্রাইক লাগবে।', '{n} more strikes to break it.': 'ভাঙতে আরও {n}টি স্ট্রাইক লাগবে।',
  'Press STRIKE to break this police barricade.': 'এই পুলিশ ব্যারিকেড ভাঙতে STRIKE চাপুন।',
  'Click or press Space to break this police barricade.': 'এই পুলিশ ব্যারিকেড ভাঙতে ক্লিক করুন বা স্পেস চাপুন।',
  'Internet shutdown! Leave within 4 seconds or you will lose your crowd.': 'ইন্টারনেট বন্ধ! ৪ সেকেন্ডের মধ্যে বেরিয়ে যান, নইলে জনতা হারাবেন।',
  'No signal: {n} people lost contact and left. Get out of the shutdown zone!': 'সিগন্যাল নেই: {n} জন যোগাযোগ হারিয়ে চলে গেলেন। বন্ধ এলাকা থেকে বেরিয়ে আসুন!',
  'A rival crowd gave up and left': 'একটি প্রতিপক্ষ জনতা হাল ছেড়ে চলে গেল',
  'Treated at {h}. You are back on your feet!': '{h}-এ চিকিৎসা হয়েছে। আপনি আবার উঠে দাঁড়িয়েছেন!',
  'মামার টঙের চা! Morale boost and extra speed': 'মামার টঙের চা! মনোবল ও গতি বাড়ল',
  'Tired and hungry: someone headed home': 'ক্লান্ত ও ক্ষুধার্ত: একজন বাড়ির পথ ধরলেন',
  'A video goes viral. {n} more people join you!': 'একটি ভিডিও ভাইরাল। আরও {n} জন আপনার সঙ্গে যোগ দিলেন!',
  'Armed rivals fired! {n} people scattered. Get out of their range!': 'সশস্ত্র প্রতিপক্ষ গুলি ছুড়েছে! {n} জন ছত্রভঙ্গ। তাদের পাল্লা থেকে সরে যান!',
  'Armed rivals fired! Get out of their range!': 'সশস্ত্র প্রতিপক্ষ গুলি ছুড়েছে! তাদের পাল্লা থেকে সরে যান!',

  // --- HUD ---
  'Day {n}': 'দিন {n}', 'of {n}': '/ {n}', 'Score {n}': 'স্কোর {n}', 'Crowd: {n}': 'জনতা: {n}', 'Time: {n}s': 'সময়: {n} সে.',
  'Morale': 'মনোবল', 'Anger': 'জনরোষ',
  'Next police barricade needs {n} people': 'পরের ব্যারিকেডে {n} জন লাগবে', 'All barricades passed!': 'সব ব্যারিকেড পার হয়েছে!',
  'INJURED: find a hospital': 'আহত: হাসপাতাল খুঁজুন',
  '{d} km': '{d} কিমি', 'Hospital {d} km': 'হাসপাতাল {d} কিমি', '{n} km · {m} people': '{n} কিমি · {m} জন', 'NO SIGNAL': 'সিগন্যাল নেই',
  'A bigger rival crowd is in the square. Out-recruit them.': 'চত্বরে একটি বড় প্রতিপক্ষ জনতা আছে। তাদের চেয়ে বেশি লোক জোগাড় করুন।',
  'HOLDING THE SHAHEED MINAR': 'শহীদ মিনার ধরে রাখা হচ্ছে', 'You need {n} people to hold the Shaheed Minar': 'শহীদ মিনার ধরে রাখতে {n} জন লাগবে',
  'RELEASED': 'মুক্ত', 'DETAINED': 'আটক', '{n} freed · {s}': '{n} জন মুক্ত · {s}',
  'Dispersed {a}/{b}': 'ছত্রভঙ্গ {a}/{b}', 'Squad: {n}': 'দল: {n}', 'Smoke {a}/3     Rounds {b}/6': 'ধোঁয়া {a}/৩     গুলি {b}/৬',
  'Click/Space strike · G smoke · F fire': 'ক্লিক/স্পেস স্ট্রাইক · G ধোঁয়া · F গুলি',
  'A CROWD IS HOLDING THE MINAR': 'একটি জনতা মিনার ধরে রেখেছে',
  'STRIKE': 'স্ট্রাইক', 'SMOKE': 'ধোঁয়া', 'FIRE': 'গুলি',

  // --- map labels ---
  'OPEN': 'খোলা', 'POLICE BARRICADE: {n} people': 'পুলিশ ব্যারিকেড: {n} জন', ' · {n} hits left': ' · আর {n}টি আঘাত',
  'CROWD {n}': 'জনতা {n}', 'RIVAL {n}': 'প্রতিপক্ষ {n}', 'ARMED {n}': 'সশস্ত্র {n}', 'INTERNET SHUTDOWN': 'ইন্টারনেট বন্ধ',
  '{n} held · bring {m} people': '{n} জন আটক · {m} জন নিয়ে আসুন',
  'Mosque': 'মসজিদ', 'Temple': 'মন্দির', 'Monastery': 'বিহার', 'Church': 'গির্জা', 'Coffee Shop': 'চায়ের দোকান',
  'Buriganga': 'বুড়িগঙ্গা', 'Hatirjheel': 'হাতিরঝিল', 'Motijheel': 'মতিঝিল', 'Dhanmondi': 'ধানমন্ডি', 'Gulshan': 'গুলশান', 'Mirpur': 'মিরপুর', 'Uttara': 'উত্তরা', 'Old Dhaka': 'পুরান ঢাকা', 'Jatrabari': 'যাত্রাবাড়ী', 'Shahbag': 'শাহবাগ',
  'Shahbag Thana': 'শাহবাগ থানা', 'Dhanmondi Thana': 'ধানমন্ডি থানা', 'Motijheel Thana': 'মতিঝিল থানা', 'Jatrabari Thana': 'যাত্রাবাড়ী থানা', 'Gulshan Thana': 'গুলশান থানা', 'Mirpur Thana': 'মিরপুর থানা', 'Uttara Thana': 'উত্তরা থানা', 'Aynaghor': 'আয়নাঘর',
  'Shahbag': 'শাহবাগ', 'DMC': 'ঢাকা মেডিকেল (ডিএমসি)', 'BSMMU': 'বিএসএমএমইউ', 'Jatrabari Hospital': 'যাত্রাবাড়ী হাসপাতাল', 'United Hospital': 'ইউনাইটেড হাসপাতাল', 'Mirpur Hospital': 'মিরপুর হাসপাতাল', 'Uttara Hospital': 'উত্তরা হাসপাতাল',
  'Baitul Mukarram': 'বায়তুল মুকাররম', 'Shahbag Coffee': 'শাহবাগ কফি',
  'POLICE': 'পুলিশ',

  // --- ranks, tags and card ---
  'Newcomer': 'নবীন', 'Volunteer': 'স্বেচ্ছাসেবক', 'Organiser': 'সংগঠক', 'Leader': 'নেতা', 'Legend': 'কিংবদন্তি',
  'Constable': 'কনস্টেবল', 'Naik': 'নায়েক', 'Sub-Inspector': 'উপ-পরিদর্শক', 'Inspector': 'পরিদর্শক', 'Superintendent': 'পুলিশ সুপার', 'Commissioner': 'কমিশনার',
  'Bronze': 'ব্রোঞ্জ', 'Silver': 'রুপা', 'Gold': 'সোনা', 'Platinum': 'প্লাটিনাম', 'Diamond': 'হীরা',
  'Held the Minar in record time.': 'রেকর্ড সময়ে মিনার দখলে রেখেছেন।', 'Won without a single beating.': 'একবারও মার না খেয়ে জিতেছেন।',
  'Marched with a huge crowd.': 'বিশাল জনতা নিয়ে মিছিল করেছেন।', 'Won after a trip to the hospital.': 'হাসপাতাল ঘুরে এসে জিতেছেন।',
  'Broke through every barricade.': 'প্রতিটি ব্যারিকেড ভেঙেছেন।', 'Took the first step toward the Minar.': 'মিনারের দিকে প্রথম পদক্ষেপ নিয়েছেন।',
  'Kept marching past the barricades.': 'ব্যারিকেড পেরিয়েও মিছিল চালিয়ে গেছেন।', 'Pushed deep into the inner ring.': 'ভেতরের বলয়ে অনেকটা এগিয়েছেন।',
  'Spent more time at the stall than the march.': 'মিছিলের চেয়ে স্টলে বেশি সময় কাটিয়েছেন।', 'Marched with almost nobody.': 'প্রায় একা মিছিল করেছেন।',
  'Never got past the first barricade.': 'প্রথম ব্যারিকেডও পার হতে পারেননি।', 'Posted plenty, marched little.': 'পোস্ট করেছেন অনেক, হেঁটেছেন কম।',
  'Kept order with very little force.': 'খুব কম বল প্রয়োগে শৃঙ্খলা রেখেছেন।', 'Cleared the streets in record time.': 'রেকর্ড সময়ে রাস্তা ফাঁকা করেছেন।',
  'Led a big squad to the finish.': 'বড় দল নিয়ে শেষ পর্যন্ত নেতৃত্ব দিয়েছেন।', 'Used smoke to clear the way.': 'ধোঁয়া ব্যবহার করে পথ পরিষ্কার করেছেন।',
  'Held the line to the end.': 'শেষ পর্যন্ত লাইন ধরে রেখেছেন।', 'Too much force turned the public against you.': 'অতিরিক্ত বল প্রয়োগে জনগণ আপনার বিরুদ্ধে চলে গেছে।',
  'A crowd reached the Minar before you could stop it.': 'আপনি থামানোর আগেই একটি জনতা মিনারে পৌঁছে গেছে।', 'Too few officers to hold the line.': 'লাইন ধরে রাখার মতো অফিসার ছিল না।',
  'SCORE': 'স্কোর', 'VICTORY': 'বিজয়', 'HELD THE MINAR': 'মিনার দখলে', 'TIME UP': 'সময় শেষ', 'DAY {n} ENDED': 'দিন {n} শেষ',
  'Peak crowd': 'সর্বোচ্চ জনতা', 'Most people marching with you at once.': 'একসঙ্গে আপনার সঙ্গে হাঁটা সবচেয়ে বেশি মানুষ।',
  'NEW BEST': 'নতুন সেরা', 'BEST SCORE': 'সেরা স্কোর', 'BARRICADES': 'ব্যারিকেড', '{a} of {b}': '{b}-এর মধ্যে {a}',
  'NEXT: {n}': 'পরের: {n}', '{n} pts': '{n} পয়েন্ট', 'NEXT RANK': 'পরের র‍্যাঙ্ক', 'Maxed': 'সর্বোচ্চ',
  'Fictional game · Play Andolon': 'কাল্পনিক গেম · আন্দোলন খেলুন', 'Andolon · Day {n} of {m}': 'আন্দোলন · দিন {n} / {m}', 'Andolon · Day {n}': 'আন্দোলন · দিন {n}',
  'ORDER HELD': 'শৃঙ্খলা রক্ষিত', 'SQUARE SECURED': 'চত্বর সুরক্ষিত', 'STOOD DOWN': 'সরে দাঁড়ালেন', 'TOO MUCH FORCE': 'অতিরিক্ত বল', 'LINE BROKEN': 'লাইন ভাঙল', 'MINAR HELD': 'মিনার দখলে',
  'Crowds dispersed': 'ছত্রভঙ্গ জনতা', 'Marches broken up before the Minar.': 'মিনারে পৌঁছানোর আগেই ভাঙা মিছিল।', 'SQUAD PEAK': 'দলের সর্বোচ্চ',

  // --- end screens ---
  'Shaheed Minar <span>held!</span>': 'শহীদ মিনার <span>দখলে!</span>',
  'Your crowd of <b>{n}</b> held the square on <b>Day {d}</b>.': 'আপনার <b>{n}</b> জনের জনতা <b>{d} দিনে</b> চত্বর ধরে রেখেছে।',
  'Day {n} <span>is over</span>': 'দিন {n} <span>শেষ</span>', 'You are a <b>{t}</b>. {d}': 'আপনি একজন <b>{t}</b>। {d}',
  'Taken to <span>Aynaghor</span>': '<span>আয়নাঘরে</span> নেওয়া হলো', 'The police van took you to Aynaghor. The game is over.': 'পুলিশের গাড়ি আপনাকে আয়নাঘরে নিয়ে গেছে। খেলা শেষ।',
  'Detained at <span>{s}</span>': '<span>{s}</span>-এ আটক', 'You were caught by the police and taken by van. The game is over.': 'পুলিশ আপনাকে ধরে গাড়িতে করে নিয়ে গেছে। খেলা শেষ।',
  'Order <span>restored!</span>': 'শৃঙ্খলা <span>ফিরেছে!</span>', 'Your squad dispersed <b>{n}</b> crowds by <b>Day {d}</b>.': 'আপনার দল <b>{d} দিনের</b> মধ্যে <b>{n}</b>টি জনতা ছত্রভঙ্গ করেছে।',
  'Stood <span>down</span>': 'সরে <span>দাঁড়ালেন</span>', 'Too much force: public anger reached its limit and you were pulled back.': 'অতিরিক্ত বল প্রয়োগ: জনরোষ সীমা ছাড়ালে আপনাকে সরিয়ে নেওয়া হয়েছে।',
  'The Minar <span>was held</span>': 'মিনার <span>দখল হয়ে গেছে</span>', 'A crowd held the Shaheed Minar. Break up marches sooner next time.': 'একটি জনতা শহীদ মিনার ধরে রেখেছে। পরের বার আরও আগে মিছিল ভাঙুন।',
  'Share card': 'কার্ড শেয়ার করুন', 'Save to Photos': 'ছবি হিসেবে সংরক্ষণ', 'Download': 'ডাউনলোড', 'March again': 'আবার মিছিল', 'Patrol again': 'আবার টহল',
  'Use default avatar': 'ডিফল্ট ছবি ব্যবহার করুন', 'Put your own photo on the card (optional)': 'কার্ডে নিজের ছবি দিন (ঐচ্ছিক)',
  'Tip: tap Save to Photos, or press and hold the card, to keep it in your Gallery.': 'টিপস: গ্যালারিতে রাখতে "ছবি হিসেবে সংরক্ষণ" চাপুন, অথবা কার্ডটি চেপে ধরে রাখুন।',
  'Your photo stays on your device. It is only drawn onto this card. Fictional game; characters and events are not real people or incidents.': 'আপনার ছবি আপনার ডিভাইসেই থাকে। এটি শুধু এই কার্ডে আঁকা হয়। কাল্পনিক গেম; চরিত্র ও ঘটনা বাস্তব মানুষ বা ঘটনা নয়।',
  'About &amp; Disclaimer': 'পরিচিতি ও দাবিত্যাগ', 'About & Disclaimer': 'পরিচিতি ও দাবিত্যাগ',
  'Play as Andolonkari': 'আন্দোলনকারী হয়ে খেলুন', 'Play as Police': 'পুলিশ হয়ে খেলুন',
  'I held the Central Shaheed Minar in Andolon! {r}, {s} pts.': 'আমি আন্দোলনে কেন্দ্রীয় শহীদ মিনার দখলে রেখেছি! {r}, {s} পয়েন্ট।',
  'Andolon called me "{t}". Can you do better?': 'আন্দোলন আমাকে "{t}" ডাকল। আপনি কি আরও ভালো করতে পারবেন?',
  'I was detained at {st} in Andolon. {s} pts.': 'আন্দোলনে আমাকে {st}-এ আটক করা হয়েছে। {s} পয়েন্ট।',
  'I led the police squad in Andolon and dispersed {n} crowds. {r}, {s} pts.': 'আমি আন্দোলনে পুলিশ দলের নেতৃত্ব দিয়ে {n}টি জনতা ছত্রভঙ্গ করেছি। {r}, {s} পয়েন্ট।',
  'The crowds beat my police squad in Andolon. {s} pts. Can you do better?': 'আন্দোলনে জনতা আমার পুলিশ দলকে হারিয়ে দিয়েছে। {s} পয়েন্ট। আপনি কি আরও ভালো করতে পারবেন?',
  'Card saved to your Downloads. Open Gallery or Google Photos and look in the Downloads folder.': 'কার্ড আপনার ডাউনলোডে সংরক্ষিত হয়েছে। গ্যালারি বা গুগল ফটোজ খুলে ডাউনলোড ফোল্ডারে দেখুন।',
  'Saved! If you do not see it in Gallery, press and hold the card and tap <b>Download image</b>.': 'সংরক্ষিত! গ্যালারিতে না দেখলে কার্ডটি চেপে ধরে <b>Download image</b> চাপুন।',
  'Press and hold the card, then tap <b>Save to Photos</b> (or Save Image).': 'কার্ডটি চেপে ধরে <b>Save to Photos</b> (বা Save Image) চাপুন।',
  'Your card': 'আপনার কার্ড',
};

// Bengali roast titles keep their own Bangla in data.js; their English description gets translated above or here
Object.assign(BN, {
  'Biriyani Revolutionary': 'বিরিয়ানি বিপ্লবী', 'Lone Walker': 'একলা চলো রে', 'Barricade Dodger': 'ঘরমুখো যোদ্ধা', 'Facebook Revolutionary': 'ফেসবুক বিপ্লবী',
});

// Bangla HTML for the fixed page text
const BNH = {
  intro: '<b>আন্দোলন</b> একটি সিঙ্গেল-প্লেয়ার গেম। আপনার চরিত্র বেছে নিয়ে শুরু করুন।',
  roleprot: 'আন্দোলনকারী<small>মিছিল এগিয়ে নিন</small>',
  rolepol: 'পুলিশ<small>লাইন ধরে রাখুন</small>',
  yourname: 'আপনার নাম',
  installtip: 'টিপস: বড় ও ফুল-স্ক্রিন গেমের জন্য আন্দোলনকে হোম স্ক্রিনে যোগ করুন (ব্রাউজার মেনু থেকে Install app বা Add to Home screen)।',
  rules: '<div class="goal"><b>লক্ষ্য:</b> সাদা পোশাকে একটি জনতা গড়ে তুলুন, পুলিশের ব্যারিকেড ভেঙে এগিয়ে যান এবং <b>১৫ জন নিয়ে ১০ সেকেন্ড</b> ধরে <b>কেন্দ্রীয় শহীদ মিনার</b> দখলে রাখুন।</div>' +
    '<details class="full"><summary>সম্পূর্ণ নিয়ম</summary><ul>' +
    '<li><b>মাউস নাড়িয়ে</b> হাঁটুন। ফোনে নিচে বাঁ দিকের গোল প্যাডে দিক ধরে রাখুন। পথচারীদের কাছে গেলে তারা সঙ্গে যোগ দেবে।</li>' +
    '<li><b>পুলিশ ব্যারিকেড</b> (বাইরের বলয়ে ৬টি, ভেতরের প্রতিটি বলয়ে ২টি) ভাঙতে যথেষ্ট লোক লাগে: প্রথমে ৬, তারপর ১৪, তারপর ২৫ জন। ব্যারিকেডের কাছে গিয়ে কয়েকবার <b>স্ট্রাইক</b> করুন (ফোনে STRIKE বোতাম, কম্পিউটারে ক্লিক বা স্পেস)। শুধু দাঁড়িয়ে থাকলে হবে না।</li>' +
    '<li><b>পুলিশ (নীল)</b> লাঠি হাতে থাকে। প্রতিটি আঘাতে মনোবল কমে। মনোবল প্রায় শেষ হলে আঘাত করলে পুলিশের গাড়ি আপনাকে থানা বা আয়নাঘরে নিয়ে যাবে এবং খেলা শেষ হবে।</li>' +
    '<li><b>হাসপাতাল</b> মার খাওয়ার পর মনোবল ফিরিয়ে দেয়। <b>বিরিয়ানি</b> স্টলেও মনোবল ফেরে, আর <b>মামার টঙের চা</b> দ্রুত চাঙ্গা করে।</li>' +
    '<li><b>প্রতিপক্ষ</b> (কালো পোশাক) পুলিশের পক্ষে থাকে এবং দেখা হলে আপনার জনতার সঙ্গে লড়ে। বড় জনতা জেতে, সমান হলে আন্দোলনকারীরা জেতে। চত্বরে বড় প্রতিপক্ষ জনতা থাকলে আপনি সেটি ধরে রাখতে পারবেন না।</li>' +
    '<li>দালানকোঠা শক্ত, তাই রাস্তা ধরে ঘুরে যান।</li>' +
    '<li>আপনার হাতে <b>৩০ দিন</b> (প্রায় ৪ মিনিট)। স্কোর আসে জনতার আকার, পার করা ব্যারিকেড, জেতা সংঘাত ও গতি থেকে। শব্দ বন্ধ করতে <b>M</b> চাপুন (বা স্পিকারে ট্যাপ করুন)।</li>' +
    '</ul></details>',
  rules2: '<div class="goal police"><b>লক্ষ্য:</b> আন্দোলনকারী জনতাকে থামান। কোনো জনতা <b>কেন্দ্রীয় শহীদ মিনার</b> (১৫ জন, ১০ সেকেন্ড) দখলে রাখার আগেই <b>১০টি জনতা ছত্রভঙ্গ করুন</b>, আর <b>জনরোষ</b> ১০০-র নিচে রাখুন।</div>' +
    '<details class="full"><summary>সম্পূর্ণ নিয়ম</summary><ul>' +
    '<li>আন্দোলনকারীরা কম্পিউটার-চালিত। তারা মানুষ জড়ো করে মিনারের দিকে এগোয়। <b>আপনি যেকোনো জনতার চেয়ে দ্রুত</b> এবং ব্যারিকেডের ভেতর দিয়ে হাঁটতে পারেন, তাই তাদের ধাওয়া করুন।</li>' +
    '<li><b>মাউস নাড়িয়ে</b> হাঁটুন। ফোনে নিচে বাঁ দিকের গোল প্যাড ব্যবহার করুন; STRIKE, SMOKE ও FIRE ডান দিকে।</li>' +
    '<li><b>অফিসার নিন:</b> রাস্তার নীল পোশাকের অফিসারদের কাছে গেলে তারা আপনার দলে যোগ দেবে (সর্বোচ্চ ১৪ জন)। দল বড় হলে প্রতি আঘাতে বেশি মানুষ ছত্রভঙ্গ হয়।</li>' +
    '<li><b>স্ট্রাইক</b> (ক্লিক বা স্পেস, বা STRIKE বোতাম) কাছের মানুষদের ছত্রভঙ্গ করে। <b>ধোঁয়ার গ্রেনেড</b> (G বা SMOKE) এমন মেঘ তৈরি করে যা জনতাকে ধীর করে ভেঙে দেয়। <b>সতর্কতামূলক গুলি</b> (F বা FIRE) সামনের মানুষদের ছত্রভঙ্গ করে। কেউ আহত হয় না: মানুষ শুধু পালিয়ে যায়। ধোঁয়া ও গুলি সময়ের সঙ্গে ফিরে আসে।</li>' +
    '<li>কোনো জনতায় কেউ না থাকলে আরও কয়েকটি আঘাতে বা কয়েক সেকেন্ড ধোঁয়ায় সেটি ছত্রভঙ্গ হয়ে যায়।</li>' +
    '<li>বল প্রয়োগে <b>জনরোষ</b> বাড়ে, আর রাগী জনতা দ্রুত বড় হয়। সংযত থাকলে রোষ ধীরে কমে। ১০০ হলে আপনাকে সরিয়ে নেওয়া হবে এবং খেলা শেষ।</li>' +
    '<li>দুটি জনতা মিললে বড় একটি জনতা হয়, তাই আগে আগেই ভাঙুন। শব্দ বন্ধ করতে <b>M</b> চাপুন (বা স্পিকারে ট্যাপ করুন)।</li>' +
    '</ul></details>',
  fictional: 'কাল্পনিক গেম। চরিত্র ও ঘটনা বাস্তব মানুষ বা ঘটনা নয়। মানচিত্র শৈলীবদ্ধ।',
  aboutlink: 'পরিচিতি ও দাবিত্যাগ',
  rotate: '<span class="rotphone">📱</span><p>খেলতে ফোনটি ঘোরান</p><small>আন্দোলন ল্যান্ডস্কেপে খেলতে হয়</small>',
  abouth: 'নির্মাতা ও গেম সম্পর্কে',
  about: '<p>আমি <b>সাব্বির আহমেদ</b>, প্রযুক্তিপ্রেমী; আইইউটি থেকে ইলেকট্রিক্যাল অ্যান্ড ইলেকট্রনিক ইঞ্জিনিয়ারিংয়ে পড়েছি। নতুন নতুন ধারণা নিয়ে ভাবতে এবং সৃজনশীল প্রকল্পের মাধ্যমে সেগুলো বাস্তবে রূপ দিতে আমার ভালো লাগে।</p>' +
    '<p><b>আন্দোলন</b> একটি স্বাধীনভাবে তৈরি কাল্পনিক গেম, যা কৌতূহল থেকে এবং এই ভূখণ্ডের প্রতিবাদ ও বিপ্লবের দীর্ঘ ইতিহাস থেকে অনুপ্রাণিত। এটি কোনো রাজনৈতিক, ধর্মীয়, সামাজিক বা মতাদর্শিক অবস্থানকে তুলে ধরে না বা সমর্থন করে না, এবং কোনো বাস্তব ঘটনা, সরকার, প্রতিষ্ঠান, দল, গোষ্ঠী বা ব্যক্তি সম্পর্কে তথ্যগত দাবিও করে না। এটি বিনোদন ও সৃজনশীল প্রকাশের জন্য তৈরি, একে সংবাদসূত্র বা ঐতিহাসিক দলিল হিসেবে গণ্য করা উচিত নয়।</p>' +
    '<h3>দাবিত্যাগ</h3>' +
    '<p>এই গেমের সঙ্গে কোনো রাজনৈতিক দল, সরকারি সংস্থা, আইন-শৃঙ্খলা রক্ষাকারী বাহিনী, শিক্ষার্থী সংগঠন, গণমাধ্যম, অন্য কোনো সংস্থা বা বাস্তব ব্যক্তির সম্পর্ক, পৃষ্ঠপোষকতা বা অনুমোদন নেই।</p>' +
    '<p>গেমে কার্টুন চরিত্রদের নিয়ে শৈলীবদ্ধ, গ্রাফিক নয় এমন সংঘাত দেখানো হয়েছে এবং লাঠি, গুলি ও বিস্ফোরণের শব্দ রয়েছে। এতে কোনো বাস্তব ফুটেজ বা বাস্তব ব্যক্তির চিত্র নেই। এর বিষয়বস্তু সহিংসতা, বেআইনি আচরণ বা জনশৃঙ্খলা ভঙ্গকে মহিমান্বিত করা, উৎসাহিত করা বা সেসবের নির্দেশনা দেওয়ার উদ্দেশ্যে নয়।</p>' +
    '<p>কোনো জীবিত বা মৃত ব্যক্তি, সংস্থা, স্থান বা ঘটনার সঙ্গে মিল থাকলে তা কাকতালীয়। গেমের কোনো কিছুই আইনি, রাজনৈতিক, নিরাপত্তাসংক্রান্ত বা অন্য কোনো পেশাদার পরামর্শ নয়। বাস্তব বিক্ষোভে অংশ নিতে বা তার প্রতিক্রিয়া জানাতে এই গেমকে দিকনির্দেশনা হিসেবে ব্যবহার করা উচিত নয়।</p>' +
    '<h3>গোপনীয়তা ও ব্যবহারকারীর বিষয়বস্তু</h3>' +
    '<p>আপনি যে ছবি বাছাই করেন তা কার্ড তৈরির জন্য আপনার ব্রাউজারেই প্রক্রিয়া করা হয় এবং কখনো আপলোড করা হয় না। আপনি যদি লিডারবোর্ডে স্কোর জমা দেওয়া বেছে নেন, তাহলে আপনার ডাকনাম, বিভাগ, স্কোর ও র‍্যাঙ্ক একটি Firebase (গুগল) সার্ভারে পাঠানো ও সংরক্ষিত হয় এবং প্রকাশ্যে দেখা যায়। ডাকনাম অনন্য এবং ৭ দিনে একবার বদলানো যায়। আপনি বেনামে সাইন ইন থাকেন এবং কোনো ইমেইল বা ফোন নম্বর নেওয়া হয় না, যদি না আপনি গুগল দিয়ে অগ্রগতি সংরক্ষণ করা বেছে নেন: সেক্ষেত্রে গুগল আপনার অ্যাকাউন্টের ইমেইল ও নাম Firebase-কে দেয়, শুধু আপনার রেকর্ড অন্য ডিভাইসে নিয়ে যেতে। চাইলে ডাকনাম ব্যবহার করুন, আর আপনার এন্ট্রি মুছতে নির্মাতার সঙ্গে যোগাযোগ করুন। আপনার নাম ও সেরা স্কোর আপনার ডিভাইসের ব্রাউজারের লোকাল স্টোরেজেও সংরক্ষিত থাকতে পারে, যা আপনি যেকোনো সময় মুছে ফেলতে পারেন।</p>' +
    '<p>আপনি কার্ড শেয়ার করলে কী এবং কার সঙ্গে শেয়ার করবেন তা আপনার নিয়ন্ত্রণে। অনুগ্রহ করে শুধু নিজের বা অনুমতিপ্রাপ্ত ছবি ব্যবহার করুন।</p>' +
    '<h3>হালনাগাদ ও যোগাযোগ</h3>' +
    '<p>এই দাবিত্যাগ সময়ে সময়ে পরিবর্তিত হতে পারে। কোনো বিষয়বস্তু অনুপযুক্ত বা ক্ষতিকর মনে হলে নির্মাতার সঙ্গে যোগাযোগ করুন, যাতে দ্রুত তা পর্যালোচনা করা যায়।</p>' +
    '<p>যোগাযোগ: <a href="mailto:bizwithsabbir@gmail.com">bizwithsabbir@gmail.com</a> · <a href="privacy.html" target="_blank" rel="noopener">গোপনীয়তা নীতি</a></p>',
  aboutthanks: '<b>আন্দোলন খেলার জন্য ধন্যবাদ। খেলা উপভোগ করুন এবং দায়িত্বশীলভাবে শেয়ার করুন।</b>',
};

// swap the fixed page text to the current language (each element remembers its English HTML)
function applyLang(){
  document.documentElement.lang = LANG === 'bn' ? 'bn' : 'en'; document.body.classList.toggle('bn', LANG === 'bn');
  document.querySelectorAll('[data-t]').forEach(el => {
    if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
    el.innerHTML = LANG === 'bn' && BNH[el.dataset.t] ? BNH[el.dataset.t] : el.dataset.en;
  });
  const pn = document.getElementById('pname'); if (pn) pn.placeholder = tr(role === 'police' ? 'Officer' : 'Protester');
  const lb = document.getElementById('langbtn'); if (lb) lb.textContent = LANG === 'bn' ? 'English' : 'বাংলা';
  const ab = document.getElementById('aboutx'); if (ab) ab.setAttribute('aria-label', tr('Close'));
  const hs = document.getElementById('howbtn'); if (hs) hs.textContent = tr('How to play');
  const go = document.getElementById('go'); if (go && go.dataset.keep !== '1') go.textContent = tr(role === 'police' ? 'Start patrol' : 'Start marching');
  const lbb = document.getElementById('lbbtn'); if (lbb) lbb.textContent = tr('Leaderboard');
  const mdiv = document.getElementById('mdivlbl'); if (mdiv) mdiv.firstChild.nodeValue = tr('Your division (for the leaderboard)') + ' ';
  const sel = document.getElementById('mdiv'); if (sel && typeof divOptions === 'function') sel.innerHTML = divOptions(getDivision());
  if (typeof repaintAccounts === 'function') repaintAccounts();
  if (typeof refreshDaily === 'function') refreshDaily();
  if (typeof refreshProfileBtn === 'function') refreshProfileBtn();
  const slot = document.getElementById('supportslot'); if (slot && typeof supportHTML === 'function') slot.innerHTML = supportHTML();
}
function setLang(l){
  LANG = l; try { localStorage.setItem('da_lang', l); } catch (e) {}
  applyLang();
  if (typeof setupTicker === 'function') setupTicker();
}
// place names: translated when the language is Bangla
const placeName = n => tr(n);
// the default player name is shown in the current language
const shortStn = n => LANG === 'bn' ? tr(n).replace(' থানা', '') : n.replace(' Thana', '');
const dispName = n => n === 'Protester' || n === 'Officer' ? tr(n) : n;
