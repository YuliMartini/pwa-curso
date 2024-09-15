// const CACHE_NAME = "cache-1";
const CACHE_STATIC_NAME = "static-v2";
const CACHE_DYNAMIC_NAME = "dynamic-v1";
const CACHE_IMMUTABLE_NAME = "immutable-v1";
const CACHE_DYNAMIC_LIMIT = 50;

const limpiarCache = (cacheName, numberItems) => {
  caches.open(cacheName).then((cache) => {
    return cache.keys().then((keys) => {
      if (keys.length > numberItems) {
        cache.delete(keys[0]).then(limpiarCache(cacheName, numberItems));
      }
    });
  });
};

self.addEventListener("install", (event) => {
  //app shell
  const cacheStaticPromise = caches.open(CACHE_STATIC_NAME).then((cache) => {
    return cache.addAll([
      "/",
      "/index.html",
      "/css/style.css",
      "/img/main.jpg",
      "/img/no-img.jpg",
      "/js/app.js",
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

// Estrategias del cache
self.addEventListener("fetch", (event) => {
  //'1 - Cache only
  // toda la aplicacion es servida desde el cache
  // event.respondWith(caches.match(event.request));
  //'2 - Cache with Netwwork fallback - (then cache)
  //   const respuesta = caches.match(event.request).then((resp) => {
  //     if (resp) return resp;
  //     // si no existe el archivo en cache, entonces hay que buscarlo en la web
  //     console.log("No existe: ", event.request.url);
  //     return fetch(event.request).then((newResponse) => {
  //       caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
  //         cache.put(event.request, newResponse);
  //         limpiarCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
  //       });
  //       return newResponse.clone();
  //     });
  //   });
  //   event.respondWith(respuesta)
  //'3 - Network with cache fallback
  //   const respuesta = fetch(event.request)
  //     .then((resp) => {
  //       if (!resp) return caches.match(event.request);
  //       caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
  //         cache.put(event.request, resp);
  //         limpiarCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
  //       });
  //       return resp.clone();
  //     })
  //     .catch((error) => {
  //       return caches.match(event.request);
  //     });
  //   event.respondWith(respuesta);
  //'4 - Cache with network update
  // útil cuando el rendimiento es crítico, pero las actualizaciones siempre estarán un paso atrás
  //   if (event.request.url.includes("bootsrap")) {
  //     return event.respondWith(caches.match(event.request));
  //   }
  //   const respuesta = caches.open(CACHE_STATIC_NAME).then((cache) => {
  //     fetch(event.request).then((newResponse) => {
  //       //actualizar cache
  //       cache.put(event.request, newResponse);
  //     });
  //     return cache.match(event.request);
  //   });
  //   event.respondWith(respuesta);
  //'5 - Cache & Network race
  // cual de los dos responde primero -

  const respuesta = new Promise((resolve, reject) => {
    let rechazada = false;

    const falloUnaVez = () => {
      // entrará aquí si falló el fetch y no existe en cache
      if (rechazada) {
        // evalua si es una imagen lo que se debe retornar
        if (/\.(png|jpg)$/i.test(event.request.url)) {
          resolve(caches.match("/img/no-img.jpg"));
        } else {
          reject("No se encontró respuesta");
        }
      } else {
        rechazada = true;
      }
    };

    fetch(event.request)
      .then((resp) => {
        resp.ok ? resolve(resp) : falloUnaVez();
      })
      .catch(falloUnaVez);

    caches
      .match(event.request)
      .then((resp) => {
        resp ? resolve(resp) : falloUnaVez();
      })
      .catch(falloUnaVez);
  });

  event.respondWith(respuesta);
});
