const CACHE_NAME = "nagrik-cache-v1";
const OFFLINE_URL = "/";
 
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(["/", "/manifest.json", "/icon.svg"]))
  );
});
 
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
self.addEventListener("fetch", (event) => {
  const { request } = event;
 
  // Only handle plain http/https GET requests. Browser extensions can inject
  // requests with other schemes (chrome-extension://, moz-extension://, etc.)
  // and the Cache API throws if we ever try to cache those.
  if (!request.url.startsWith("http") || request.method !== "GET") return;
 
  // Never cache API calls — always go to the network so data stays fresh
  if (request.url.includes("/api/")) return;
 
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL));
    })
  );
});