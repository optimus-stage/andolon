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
