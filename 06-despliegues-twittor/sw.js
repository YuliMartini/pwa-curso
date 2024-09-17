importScripts("js/sw-utils.js");

const STATIC_CACHE = "static-v4";
const DYNAMIC_CACHE = "dynamic-v2";
const IMMUTABLE_CACHE = "immutable-v1";
const APP_SHELL = [
  // "/",
  "index.html",
  "css/style.css",
  "img/favicon.ico",
  "img/avatars/spiderman.jpg",
  "img/avatars/thor.jpg",
  "img/avatars/wolverine.jpg",
  "img/avatars/hulk.jpg",
  "img/avatars/ironman.jpg",
  "js/app.js",
  "js/sw-utils.js",
];
const APP_SHELL_IMMUTABLE = [
  "https://fonts.googleapis.com/css?family=Quicksand:300,400",
  "https://fonts.googleapis.com/css?family=Lato:400,300",
  "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
  "css/animate.css",
  "js/libs/jquery.js",
];

self.addEventListener("install", (event) => {
  const cacheStaticPromise = caches
    .open(STATIC_CACHE)
    .then((cache) => cache.addAll(APP_SHELL));

  const cacheImmutablePromise = caches
    .open(IMMUTABLE_CACHE)
    .then((cache) => cache.addAll(APP_SHELL_IMMUTABLE));

  event.waitUntil(Promise.all([cacheStaticPromise, cacheImmutablePromise]));
});

self.addEventListener("activate", (event) => {
  const respuesta = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== STATIC_CACHE && key.includes("static")) {
        return caches.delete(key);
      }
      if (key !== DYNAMIC_CACHE && key.includes("dynamic")) {
        return caches.delete(key);
      }
    });
  });

  event.waitUntil(respuesta);
});

// cache with network fallback
self.addEventListener("fetch", (event) => {
  const respuesta = caches.match(event.request).then((resp) => {
    if (resp) {
      return resp;
    } else {
      return fetch(event.request).then((newResp) => {
        return updateDynamicCache(DYNAMIC_CACHE, event.request, newResp);
      });
    }
  });

  event.respondWith(respuesta);
});
