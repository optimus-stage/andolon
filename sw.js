// Minimal service worker: it only makes the game installable. It does not cache anything, so updates always load fresh.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
