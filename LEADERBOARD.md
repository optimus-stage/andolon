# Leaderboard setup (Firebase)

The leaderboard stays hidden until `js/firebase-config.js` has your Firebase config.

1. Go to https://console.firebase.google.com and create a project (Analytics is not needed).
2. **Build > Authentication > Get started > Sign-in method**: enable **Anonymous**.
3. **Build > Firestore Database > Create database** (production mode, pick a region near Bangladesh such as `asia-south1`).
4. **Firestore > Rules**: paste the contents of `firestore.rules` and publish.
5. **Project settings > Your apps > Web (`</>`)**: register an app and copy the `firebaseConfig` values (`apiKey`, `authDomain`, `projectId`, `appId`) into `js/firebase-config.js`.
6. **Authentication > Settings > Authorized domains**: add your site domain (for example `optimus-stage.github.io`).
7. Optional: in Google Cloud console, restrict the API key to your website's domain (HTTP referrers).

Data: one document per player per board (`lb_protester`, `lb_police`), keyed by the anonymous user id, holding name, division, best score, rank title, a peak stat and the day. The rules only let a player write their own document, and a score can only go up.

## Play counter

Each time someone starts a game, the page adds 1 to `stats/global` in Firestore: `games` (every start), `games_protester`, `games_police`, and `players` (once per device, the first time it plays). Open **Firestore Database > stats > global** in the Firebase console to read the numbers. Nothing personal is stored. Re-publish `firestore.rules` after updating, since it now includes the `stats` rule.

`players` counts devices/browsers, so one person on two phones counts twice, and clearing browser data counts again.
