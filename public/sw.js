const CACHE_NAME = "the-village-web-app-v1";

const PRECACHE_URLS = [
  "/brand/favicon-192x192.png",
  "/brand/favicon-512x512.png",
  "/brand/apple-touch-icon.png",
  "/brand/app-icon-dark.png",
  "/brand/logo-horizontal-dark.png",
  "/brand/logo-horizontal-light.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).catch(() => {
        if (request.mode === "navigate") {
          return caches.match("/");
        }

        return Response.error();
      });
    })
  );
});
