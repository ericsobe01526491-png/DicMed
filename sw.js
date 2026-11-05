"use strict";
// Service worker DicMed : permet d'utiliser le dictionnaire sans connexion.
// La version vient de l'adresse d'enregistrement (sw.js?v=…) : changer VERSION dans app.js suffit à déclencher la mise à jour.
const V = new URL(self.location.href).searchParams.get("v") || "0";
const CACHE = "dicmed-" + V;
const FICHIERS = ["./", "index.html", "style.css", "app.js", "decoder.js", "bio.js", "pwa.js", "manifest.webmanifest",
                  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "data/termes.json", "data/bio.json"];
self.addEventListener("install", e => e.waitUntil(
  caches.open(CACHE)
    .then(c => Promise.all(FICHIERS.map(f => c.add(new Request(f, {cache: "reload"})).catch(() => {}))))
    .then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("dicmed-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  // On ne touche ni aux appels vers d'autres sites (Supabase), ni à l'espace administrateur
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.includes("/admin/")) return;
  const reseau = () => fetch(r).then(rep => {
    if (rep.ok) { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(r, copie)); }
    return rep;
  });
  const cache = () => caches.match(r, {ignoreSearch: true});
  if (r.mode === "navigate" || u.pathname.includes("/data/")) {       // pages et données : le réseau d'abord (contenu à jour), le cache hors connexion
    e.respondWith(reseau().catch(() => cache().then(x => x || caches.match("index.html", {ignoreSearch: true}))));
  } else e.respondWith(cache().then(x => x || reseau()));            // fichiers du site : le cache d'abord (rapide)
});
