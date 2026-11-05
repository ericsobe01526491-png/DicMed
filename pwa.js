"use strict";
// Application installable (PWA) : service worker, bouton « Installer » et aide selon l'appareil. Utilise $, h et VERSION de app.js.
let invite = null;
const installee = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const btnInstall = $("#installer"), aideInstall = $("#aide-install");
if (btnInstall) {
  if (installee()) btnInstall.hidden = true;
  btnInstall.onclick = async () => {
    if (invite) { invite.prompt(); await invite.userChoice.catch(() => {}); invite = null; }
    else if (aideInstall) aideInstall.showModal();
  };
}
if ($("#aide-fermer")) $("#aide-fermer").onclick = () => aideInstall.close();
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); invite = e; });
window.addEventListener("appinstalled", () => { invite = null; if (btnInstall) btnInstall.hidden = true; });

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  const avait = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("sw.js?v=" + VERSION).catch(() => {});
  navigator.serviceWorker.addEventListener("controllerchange", () => {       // nouvelle version installée : on propose d'actualiser
    if (!avait || document.getElementById("maj")) return;
    document.body.append(h("div", {id: "maj", role: "status", class: "maj"}, "Une nouvelle version est disponible. ",
      h("button", {type: "button", onclick: () => location.reload()}, "Actualiser")));
  });
}
