// const CACHE_NAME = 'cache-1';
const CACHE_STATIC_NAME = "static-v2";
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

self.addEventListener("fetch", (event) => {
  //' 5- Cache & Network Race
  const respuesta = new Promise((resolve, reject) => {
    let rechazada = false;

    const falloUnaVez = () => {
      if (rechazada) {
        if (/\.(png|jpg)$/i.test(event.request.url)) {
          resolve(caches.match("/img/no-img.jpg"));
        } else {
          reject("No se encontro respuesta");
        }
      } else {
        rechazada = true;
      }
    };

    fetch(event.request)
      .then((res) => {
        res.ok ? resolve(res) : falloUnaVez();
      })
      .catch(falloUnaVez);

    caches
      .match(event.request)
      .then((res) => {
        res ? resolve(res) : falloUnaVez();
      })
      .catch(falloUnaVez);
  });

  event.respondWith(respuesta);

  //' 4- Cache with network update
  // Rendimiento es crítico
  // Siempre estarán un paso atrás
  // if ( event.request.url.includes('bootstrap') ) {
  //     return event.respondWith( caches.match( event.request ) );
  // }

  // const respuesta = caches.open( CACHE_STATIC_NAME ).then( cache => {
  //     fetch( event.request ).then( newRes =>
  //             cache.put( event.request, newRes ));
  //     return cache.match( event.request );
  // });

  // event.respondWith( respuesta );

  //' 3- Network with cache fallback
  // const respuesta = fetch( event.request ).then( res => {

  //     if ( !res ) return caches.match( event.request );
  //     caches.open( CACHE_DYNAMIC_NAME )
  //         .then( cache => {
  //             cache.put( event.request, res );
  //             limpiarCache( CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT );
  //         });
  //     return res.clone();
  // }).catch( err =>{
  //     return caches.match( event.request );
  // });

  // event.respondWith( respuesta );

  //' 2- Cache with Network Fallback
  // const respuesta = caches.match( event.request )
  //     .then( res => {
  //         if ( res ) return res;
  //         // No existe el archivo
  //         // tengo que ir a la web
  //         console.log('No existe', event.request.url );

  //         return fetch( event.request ).then( newResp => {
  //             caches.open( CACHE_DYNAMIC_NAME )
  //                 .then( cache => {
  //                     cache.put( event.request, newResp );
  //                     limpiarCache( CACHE_DYNAMIC_NAME, 50 );
  //                 });
  //             return newResp.clone();
  //         });
  //     });

  // event.respondWith( respuesta );

  //' 1- Cache Only
  // event.respondWith( caches.match( event.request ) );
});
