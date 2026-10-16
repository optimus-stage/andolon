# Andolon (আন্দোলন)

Single-player browser game inspired by popular protest movements in Bangladesh. Fictional characters and events; stylised map.

## Run
Open `index.html` in a browser (no build, no server needed). To share online, upload this whole folder to any static host (GitHub Pages, Netlify, Vercel).

## Files
- `index.html`: page and start menu
- `css/style.css`: styles
- `js/data.js`: map size, rings, barricade sizes, day length, score weights, ranks, tags and roasts (Bengali), police stations, hospitals, landmarks, chants, news headlines
- `js/game.js`: game logic, drawing, sounds, police van arrest, scoring, shareable photo card

## Rules
- Walk with the mouse (or touch and hold on a phone). Recruit bystanders and they join your crowd in white. Your name shows above your head.
- Police barricades: 6 on the outer ring (6 people each), 2 on the middle ring (14 people), 2 on the inner ring (25 people).
- Police (blue, with sticks) patrol every zone: 4 in the outermost, 6 in the next, then 3 and 4 towards the centre. Each hit costs 25 morale. If they hit you when your morale is 25 or less, a police van takes you to a thana or Aynaghor and the game ends.
- After a beating you are injured (slower). Walk into a hospital to recover morale. A green arrow points to the nearest one.
- Biriyani stalls restore morale while you stand in them. Mama r Tong er Cha huts give an instant morale and speed boost (they refill after 45 seconds).
- Rivals (black clothes) support the police and are never hit by them. They recruit slowly and stop at 12 members. When a rival crowd meets yours they fight: the smaller side loses more, and a tie goes to the protesters. About 40% of beaten rivals switch to your side, and the rest go home for a while. A rival crowd with no one left gives up, and a new small one appears later. A rival crowd of 8 or more that is bigger than yours stops you holding the square.
- Win: hold the Central Shaheed Minar with 15 people for 10 seconds.
- The game lasts 30 days (8 seconds each, about 4 minutes). The top-left shows Day 1, Day 2, and so on, plus your live score.
- Breaking barricades makes a crumbling sound with a dust cloud, and a police siren wails while a van takes you away. The news ticker scrolls on its own.
- Bystanders slowly refill over time so the map never runs empty.

## Score, ranks and tags
- Score = 5 per person recruited + 10 per person in your crowd (peak crowd if you did not win) + 300 per barricade ring passed + 20 per fight won. A win adds 2000 plus 5 per second faster than 180 seconds. If you are detained the score is multiplied by 0.6, and if time runs out by 0.8.
- Ranks: নবীন (Newcomer), স্বেচ্ছাসেবক (Volunteer, 500+), সংগঠক (Organiser, 1,500+), নেতা (Leader, 3,000+), কিংবদন্তি (Legend, 5,000+).
- Special tags for winners: ঝড়ের গতি, অদম্য, জনসমুদ্র, শেষ লড়াই, ব্যারিকেড ভাঙনকারী. For detained players: প্রথম হুংকার (First Roar), অকুতোভয় (Fearless), দুর্জয় (Indomitable).
- If Day 30 ends without a win you get a friendly roast tag instead of a rank: বিরিয়ানি বিপ্লবী, একলা চলো রে, ব্যারিকেডের ভয়ে ঘরমুখো or ফেসবুক বিপ্লবী.
- End screens produce a shareable PNG photo card (Web Share on phones, download on desktop). You can upload your own photo on the start screen or on the card screen; it replaces the avatar and never leaves your device. Your best score is saved in your browser. Press M to mute sound.

## Hunting rivals and rescues
- Rival crowds (about 12, three per zone) now chase you when you are close in the same zone. They are slower than you, so run early. They still recruit bystanders, and equal-sized crowds go to the protesters.
- About 1 in 4 rival crowds is **armed** (red ring and ARMED label). Within range and with no building in the way they give a short warning (!) and fire: a quarter of your crowd scatters and you lose morale.
- People detained by police are held at a thana. An orange arrow, a dashed path and a minimap dot lead to it. Bring 8 people inside the dashed ring for 6 seconds to free them. A green card pops up when they are released. Freed people join your crowd and count as recruits. Held people also go free by themselves after 60 seconds.

## Internet shutdown
The grey dashed zones play radio static. Stay inside for 4 seconds and your crowd starts losing people, about 20% every 1.2 seconds, until you leave.

## Tuning
Everything is at the top of `js/data.js`: gates per ring, barricade sizes, crowd needed, day length, bystander counts, rival limits, score weights, ranks, tags and roast lines. Police strength is in `strikePlayer()` in `js/game.js`.

## Playing as police

Choose **Police** on the start screen. You lead the police and the protester crowds are AI. They gather people and march toward the Central Shaheed Minar. You are faster than any crowd.

- Win by dispersing 10 crowds. Lose if a crowd of 15 holds the Minar for 10 seconds, or if public anger reaches 100.
- Walk into the blue officers on the streets to add them to your squad (up to 14).
- **Strike** (click, Space or the STRIKE button), **smoke grenade** (G or SMOKE) and **warning shots** (F or FIRE) scatter people. Nobody is hurt.
- Force raises **public anger**; angry crowds recruit faster. Smoke and rounds come back over time.
- Tuning constants live in `js/data.js` (`DISPERSE_GOAL`, `MARCH_MAX`) and the top of the police section in `js/game.js`.
