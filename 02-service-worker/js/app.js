// confirmar si podemos usar el SW
if (navigator.serviceWorker) {
  navigator.serviceWorker.register("/sw.js");
}
