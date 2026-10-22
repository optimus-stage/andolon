// Service worker: the game is always fetched fresh when online (so updates show up at once) and every file it loads is kept,
// so the game still opens with no connection. Online features (leaderboard, play counter) simply wait for a connection.
const CACHE = 'andolon-runtime';
self.addEventListener('install', e => {
  self.skipWaiting();
  // keep the whole game from the first visit: read index.html and store everything it points to
  e.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE), html = await (await fetch('index.html', {cache: 'no-store'})).text();
      const urls = ['index.html', 'manifest.webmanifest'];
      html.replace(/(?:src|href)="([^"#]+)"/g, (m, u) => { if (!/^(https?:|mailto:|data:)/.test(u)) urls.push(u); });
      await Promise.all(urls.map(u => cache.add(new Request(u, {cache: 'reload'})).catch(() => {})));
    } catch (err) {}
  })());
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(async () => (await caches.match(req)) || (req.mode === 'navigate' ? (await caches.match('index.html')) : undefined) || Response.error())
  );
});
