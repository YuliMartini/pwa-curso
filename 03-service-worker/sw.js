// Ciclo de vida del SW

//ideal para descargar assets, crear un cache
self.addEventListener("install", (event) => {
  console.log("SW: instalando...");

  const instalaciones = new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("SW: Instañaciones terminadas");
      resolve();
      self.skipWaiting();
    }, 1);
  });

  event.waitUntil(instalaciones);
});

// cuando el SW toma el control de la aplicacion
// ideal para borrar stale cache
self.addEventListener("activate", (event) => {
  console.log("SW: Activo y listo para controlar la app");
});

//fetch: manejo de peticiones HTTP
self.addEventListener("fetch", (event) => {
  // aplicar estrategoas del cache
  //   console.log("SW: ", event.request.url);
  //   if (event.request.url.includes("https://reqres.in/")) {
  //     const resp = new Response(`{ ok: false, message: 'jajaja' }`);
  //     event.respondWith(resp);
  //   }
});

// sync: recuperamos la conexion a internet
self.addEventListener("sync", (event) => {
  console.log("Tenemos conexión!");
  console.log(event);
  console.log(event.tag);
});

//push: manejar las push notifications
self.addEventListener("push", (event) => {
  console.log("Notificación recibida");
});
