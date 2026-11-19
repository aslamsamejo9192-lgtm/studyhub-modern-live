/* MDCAT Prime PWA service worker.
   Caches the app shell so the app installs and opens offline.
   Navigation / index.html is network-first with the HTTP cache bypassed
   (fresh version when online, cached shell when offline) — a stale
   first-open after a site update must never be served from cache.
   Only same-origin requests are handled; Firebase / CDN calls always
   go to the network. */
var CACHE = "mdcat-prime-v2";
var SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/logo.jpg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (e.request.mode === "navigate" || url.pathname === "/" || url.pathname === "/index.html") {
    e.respondWith(
      /* "no-cache" forces a real network revalidation — the browser HTTP
         cache must never answer a navigation with a stale index.html. */
      fetch(e.request, { cache: "no-cache" }).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (hit) {
          return hit || caches.match("/index.html");
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      });
    })
  );
});
