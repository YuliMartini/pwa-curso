const CACHE_STATIC_NAME = "static-v4";
const CACHE_DYNAMIC_NAME = "dynamic-v1";
const CACHE_IMMUTABLE_NAME = "immutable-v1";
const CACHE_DYNAMIC_LIMIT = 50;

const limpiarCache = (cacheName, numeroItems) => {
  caches.open(cacheName).then((cache) => {
    return cache.keys().then((keys) => {
      if (keys.length > numeroItems) {
        cache.delete(keys[0]).then(limpiarCache(cacheName, numeroItems));
      }
    });
  });
};

self.addEventListener("install", (event) => {
  const cacheStaticPromise = caches.open(CACHE_STATIC_NAME).then((cache) => {
    return cache.addAll([
      "/",
      "/index.html",
      "/css/style.css",
      "/img/main.jpg",
      "/js/app.js",
      "/img/no-img.jpg",
      "/pages/offline.html",
    ]);
  });

  const cacheImmutablePromise = caches
    .open(CACHE_IMMUTABLE_NAME)
    .then((cache) =>
      cache.add(
        "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
      )
    );

  event.waitUntil(Promise.all([cacheStaticPromise, cacheImmutablePromise]));
});

self.addEventListener("activate", (event) => {
  const respuesta = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== CACHE_STATIC_NAME && key.includes("static")) {
        return caches.delete(key);
      }
    });
  });

  event.waitUntil(respuesta);
});

self.addEventListener("fetch", (event) => {
  //' 2- Cache with Network Fallback
  const respuesta = caches.match(event.request).then((res) => {
    if (res) return res;
    // No existe el archivo, tengo que ir a la web
    return fetch(event.request)
      .then((newResp) => {
        caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
          cache.put(event.request, newResp);
          limpiarCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
        });
        return newResp.clone();
      })
      .catch((error) => {
        if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/pages/offline.html");
        }
      });
  });

  event.respondWith(respuesta);
});
