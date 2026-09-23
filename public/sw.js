// Kaiwa service worker: installable app + offline fallback.
// Bump VERSION when this file's caching rules change.
const VERSION = "v1";
const STATIC_CACHE = `kaiwa-static-${VERSION}`;
const PAGE_CACHE = `kaiwa-pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icon-192.png", "/icon.svg", "/manifest.json"];
const MAX_PAGES = 30;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("kaiwa-") && k !== STATIC_CACHE && k !== PAGE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only same-origin GETs. API calls, auth and streaming chat always go to the network.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Hashed build assets never change: cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
    );
    return;
  }

  // Pages: network-first so content is fresh; fall back to the last copy, then the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches
              .open(PAGE_CACHE)
              .then((c) => c.put(request, copy))
              .then(() => trimCache(PAGE_CACHE, MAX_PAGES));
          }
          return res;
        })
        .catch(async () => (await caches.match(request)) ?? caches.match(OFFLINE_URL))
    );
  }
});
