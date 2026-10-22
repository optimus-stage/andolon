# Publishing Andolon on Google Play (web wrapper)

The Play Store app is a thin shell (a Trusted Web Activity) that opens the live website full screen. The game itself is always the website, so merging to `main` updates players immediately. A new Play release is only needed when the shell changes (icon, name, target Android version).

## 1. Put the site on its own domain
Digital Asset Links must be served from the **root** of a domain (`https://yourdomain/.well-known/assetlinks.json`), so a project path such as `github.io/andolon/` does not work.
- Buy a domain, then in the repo's GitHub Pages settings set it as the custom domain (this creates a `CNAME` file). Enable HTTPS.
- The repo already has `.nojekyll`, which lets GitHub Pages serve the `.well-known` folder.
- Add the domain to Firebase: Authentication > Settings > Authorized domains.

## 2. Build the app
1. Open https://www.pwabuilder.com and enter the site URL. It checks the manifest and service worker (both are ready).
2. Choose **Android > Google Play**. Set package id (for example `com.yourname.andolon`), app name, version, and "Signing key: new" (or let Play manage signing).
3. Download the package. Keep the signing key file safe.

## 3. Prove you own the site
PWABuilder gives a `assetlinks.json` file (or you create it from the SHA-256 fingerprint in Play Console > Setup > App signing). Add it to the repo at `.well-known/assetlinks.json` and publish:
```json
[{"relation": ["delegate_permission/common.handle_all_urls"],
  "target": {"namespace": "android_app", "package_name": "com.yourname.andolon",
             "sha256_cert_fingerprints": ["AA:BB:...:FF"]}}]
```
Without it the app opens with a browser address bar.

## 4. Play Console
- Create the app, one-time $25 developer fee. New personal accounts must usually run a closed test with a minimum number of testers for a set period before production; check Google's current rules.
- Privacy policy URL: `https://yourdomain/privacy.html` (already in the repo).
- **Data safety form**: collected data = name (nickname) and in-app score/progress, shared publicly on the leaderboard; anonymous device/user ID (Firebase). No ads, no location, no contacts. Data can be deleted on request (email in the policy).
- **Content rating questionnaire**: fictional, cartoon, non-graphic conflict involving police and crowds; stick/gunfire sound effects. Answer honestly. Mention that the game is fictional and not tied to real events.
- **User-generated content**: leaderboard names are public; the leaderboard has a "Report an inappropriate name" link and the policy explains removal.
- Store listing: short and full description, 512 px icon, feature graphic (1024x500), phone screenshots (landscape).

## 5. Updating later
- Game changes: merge to `main` as usual; nothing to upload to Play.
- Shell changes only: rebuild in PWABuilder with a higher version code and upload a new release.

## Offline
`sw.js` keeps every file the game loads. When online the game is always fetched fresh, so updates show up at once; with no connection it opens from the saved copy. The leaderboard and play counter need a connection.
