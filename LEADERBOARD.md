# Leaderboard setup (Firebase)

The leaderboard stays hidden until `js/firebase-config.js` has your Firebase config.

1. Go to https://console.firebase.google.com and create a project (Analytics is not needed).
2. **Build > Authentication > Get started > Sign-in method**: enable **Anonymous** and **Google** (Google is used for the optional "Save my progress with Google" button; set a project support email when asked).
3. **Build > Firestore Database > Create database** (production mode, pick a region near Bangladesh such as `asia-south1`).
4. **Firestore > Rules**: paste the contents of `firestore.rules` and publish.
5. **Project settings > Your apps > Web (`</>`)**: register an app and copy the `firebaseConfig` values (`apiKey`, `authDomain`, `projectId`, `appId`) into `js/firebase-config.js`.
6. **Authentication > Settings > Authorized domains**: add your site domain (for example `optimus-stage.github.io`).
7. Optional: in Google Cloud console, restrict the API key to your website's domain (HTTP referrers).

Data: one document per player per board (`lb_protester`, `lb_police`), keyed by the anonymous user id, holding name, division, best score, rank title, a peak stat and the day. The rules only let a player write their own document, and a score can only go up.

## Play counter

Each time someone starts a game, the page adds 1 to `stats/global` in Firestore: `games` (every start), `games_protester`, `games_police`, and `players` (once per device, the first time it plays). Open **Firestore Database > stats > global** in the Firebase console to read the numbers. Nothing personal is stored. Re-publish `firestore.rules` after updating, since it now includes the `stats` rule.

`players` counts devices/browsers, so one person on two phones counts twice, and clearing browser data counts again.

## Nicknames and accounts

- `players/{uid}`: the player's nickname, division and when the nickname last changed (only the owner can read it). A nickname can be changed once every 7 days.
- `names/{lower-case nickname}`: claims a nickname so two players can never share one. Claiming, releasing and the player record are written together, and `firestore.rules` rejects any attempt to hold a nickname without owning it.
- Leaderboard entries must carry the owner's registered nickname.
- Optional Google sign-in links the anonymous account to a Google account (same user id), so the record follows the player to other devices. If that Google account already has a record, the game switches to it.
- Republish `firestore.rules` after pulling this update. Leaderboard entries created before nicknames existed stay visible; their owners register a nickname the next time they submit.
- The rules can be tested locally with the Firebase emulator (`firebase emulators:exec --only firestore ...`).

## Daily challenge

- Everyone gets the same map, crowds and "twist" each day (Bangladesh time, UTC+6, new challenge at midnight). The date seeds the game's random numbers (`seedGame` in `js/core.js`); twists are in `js/daily.js` and `js/state.js` / `js/police.js`.
- 3 attempts per day per side, counted on the device. The best score of the day goes to `daily/{dayKey}/{protester|police}/{uid}` (one document per player; a score can only go up). A daily run also updates the all-time board.
- `firestore.rules` accepts only today's board, or yesterday's for a run that finishes just after midnight, and the entry name must be the player's registered nickname.
- Streak: consecutive days with at least one finished daily run, kept on the device and shown on the board.
- Republish `firestore.rules` after pulling this update.

## Profile and achievements

- `js/profile.js` keeps a lifetime profile on the device (`da_profile` in localStorage): games, wins, best scores, time played, barricades broken and so on, plus 23 achievements. Every finished game updates it; new achievements show on the end screen, and the Profile button (menu and end screen) opens the full view.
- Players signed in with Google also keep a private copy in `profiles/{uid}` (owner-only). On sign-in, or after a game, the device and the copy are merged: the larger counter wins, achievements are combined. Playing on two devices before signing in therefore keeps the larger counters, not the sum.
- To add an achievement, append an entry to `ACHIEVEMENTS` in `js/profile.js` and add its Bangla text to `js/i18n.js`.
- Republish `firestore.rules` after pulling this update (new `profiles` rules: counters can only go up).

## "Beat my score" challenge links

- Every game runs on a seed. The end screen has **Challenge a friend** (and the Share card text also carries the link): `?seed=...&r=p|c&s=score&n=name[&t=twist]`. Nothing is stored on a server; the link is the whole challenge.
- A friend opening it sees a banner, accepts, and plays the same map and starting crowds as the sharer (the same seed; what happens after the start depends on how each person plays). The end screen then says whether they beat the score, with "Try the challenge again" and "Challenge a friend" to send one back.
- Links are validated (integer seed and score in range, known side, name stripped of control characters and `<>`, shown as plain text), and ignored if malformed.
- `stats/global` gets a `challenges` counter: games started from a challenge link, to measure how well sharing works. Republish `firestore.rules` after pulling this update.

## Analytics counters

Totals only (no names, ids or per-player history), written to `stats/global` and to one document per Bangladesh day (`stats/d20261022`) in small batches (`statsAdd` in `js/leaderboard.js`). Only the owner can read them: the rules allow reading `stats` only for the verified Google account `bizwithsabbir@gmail.com` (everyone can still add to the counters). Read them on **`/stats.html`** after signing in with that account (a live page with finish rate, win rate, where protesters' games end, barricade rings passed, return rate, shares, language and device split, and the last 14 days) or in the Firebase console under Firestore > stats.

| Group | Counters |
|---|---|
| Start | `games`, `games_protester`, `games_police`, `players` (new devices), `lang_bn`, `lang_en`, `dev_touch`, `dev_desktop`, `daily_start`, `challenges` |
| Returning | `ret_d1` (a device back on a later day), `ret_d7` (back a week or more later), each counted once per device |
| End | `fin_p`, `fin_c`, `win_p`, `win_c`, `end_timeout`, `end_detained`, `pend_held`, `pend_anger`, `ring0` to `ring3` (barricade rings a protester had passed when the game ended), `daily_fin`, `challenge_wins` |
| Features | `share_card`, `share_challenge`, `tut_done`, `tut_skip`, `lb_submits`, `daily_submits`, `google_links`, `profile_opens` |

- The rules accept only `stats/global` and today's day document, only these keys, and only increases of 1 to 5 per write. Republish `firestore.rules` after pulling this update.
- Numbers count devices and browsers, not people. A single hot document handles roughly one write per second, which is plenty for now; if the game gets very popular, switch the counters to sharded documents.
- To add a counter: add the key to the lists in `firestore.rules`, call `trackEvent('key')` (or add it to `trackStart` / `trackEnd`), and show it in `stats.html`.
