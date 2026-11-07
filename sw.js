"use strict";
// Service worker DicMed : permet d'utiliser le dictionnaire sans connexion.
// Stratégie : le RÉSEAU D'ABORD (toujours la dernière version quand on est en ligne), le cache seulement hors connexion.
const CACHE = "dicmed-v3";
const FICHIERS = ["./", "index.html", "style.css", "app.js", "decoder.js", "bio.js", "pwa.js", "manifest.webmanifest",
                  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "data/termes.json", "data/bio.json"];

self.addEventListener("install", e => e.waitUntil(
  caches.open(CACHE)
    .then(c => Promise.all(FICHIERS.map(f => c.add(new Request(f, {cache: "reload"})).catch(() => {}))))
    .then(() => self.skipWaiting())));

// À l'activation : on supprime les anciens caches ; si c'est une mise à jour, les pages ouvertes sont rechargées pour afficher la nouvelle version.
self.addEventListener("activate", e => e.waitUntil((async () => {
  const noms = await caches.keys();
  const anciens = noms.filter(k => k.startsWith("dicmed-") && k !== CACHE);
  await Promise.all(anciens.map(k => caches.delete(k)));
  await self.clients.claim();
  if (anciens.length) {
    const fenetres = await self.clients.matchAll({type: "window"});
    fenetres.forEach(c => c.navigate(c.url).catch(() => {}));
  }
})()));

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  // On ne touche ni aux appels vers d'autres sites (Supabase), ni à l'espace administrateur
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.includes("/admin/")) return;
  e.respondWith(
    fetch(new Request(r.url, {cache: "no-cache", credentials: "same-origin"}))
      .then(rep => {
        if (rep.ok) { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(r.url, copie)); }
        return rep;
      })
      .catch(() => caches.open(CACHE).then(c => c.match(r.url, {ignoreSearch: true}).then(x => x || (r.mode === "navigate" ? c.match("index.html", {ignoreSearch: true}) : undefined))))
  );
});
