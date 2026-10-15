#Andolon (আন্দোলন)

Single-player browser game inspired by the recent movement in Bangladesh. Fictional characters and events; stylised map.

## Run
Open `index.html` in a browser (no build, no server needed). To share online, upload this whole folder to any static host (GitHub Pages, Netlify, Vercel).

## Files
- `index.html`: page and start menu
- `css/style.css`: styles
- `js/data.js`: map size, rings, barricade sizes, police stations, Aynaghor, hospitals, landmarks, chants, Bangla news headlines, names
- `js/events.js`: the 1 July to 36 July timeline (edit the event names here)
- `js/game.js`: game logic, drawing, sounds, police van arrest, shareable photo card

## Rules
- Walk with the mouse, recruit bystanders (they turn white and join you). Your name shows above your head.
- 3 rings of police barricades: 6 barricades on the outer ring (6 people each), 2 on the middle ring (14 people), 2 on the inner ring (25 people).
- Police (blue, with sticks) patrol every zone: 1 in the outermost, then 2, 3 and 4 towards the centre. Each hit costs 25 morale and makes a beating sound. If they hit you when your morale is 25 or less, a police van takes you to a thana or Aynaghor and the game ends.
- After a beating you are injured (slower). Walk into a hospital to recover morale. A green arrow points to the nearest one.
- বিরিয়ানি stalls restore morale while you stand in them. মামার টঙের চা huts give an instant morale and speed boost (they refill after 45 seconds).
- Rivals (black clothes) support the police and are never hit by them. When a rival crowd meets yours they fight: both sides lose people, the smaller side loses more, and a tie goes to the protesters. Fights sometimes add gunshot and grenade-blast sounds with a flash on screen (no gore).
- Houses, mosques, coffee shops and hospitals are solid; only about 110 houses are on the map.
- Win: hold the Central Shaheed Minar with 15 people for 10 seconds.
- The date and event names (1 July to 36 July) are shown large at the top-left. Edit them in `js/events.js`.
- End screens produce a shareable PNG photo card (Web Share on phones, download on desktop). You can upload your own photo on the start screen or on the card screen; it replaces the avatar and never leaves your device. Press M to mute sound.

## Tuning
Difficulty numbers are at the top of `js/data.js` (barricade sizes, gates per ring, hold time, crowd needed). Day length is `DAY_SECONDS` in `js/events.js`. Police strength is in `strikePlayer()` in `js/game.js`.
