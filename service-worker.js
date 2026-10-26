const CACHE_NAME = "dicmed-cache-v3";

const FICHIERS_A_METTRE_EN_CACHE = [
"./",
"./index.html",
"./style.css",
"./script.js",
"./manifest.json",
"./data/gemini.json/dictionnaire%20(1).json"
];

self.addEventListener("install", (event) => {
event.waitUntil(
(async () => {
const cache = await caches.open(CACHE_NAME);


  for (const fichier of FICHIERS_A_METTRE_EN_CACHE) {
    try {
      const reponse = await fetch(fichier);

      if (reponse.ok) {
        await cache.put(fichier, reponse);
      }
    } catch (erreur) {
      console.warn("Fichier non mis en cache :", fichier, erreur);
    }
  }
})()


);

self.skipWaiting();
});

self.addEventListener("activate", (event) => {
event.waitUntil(
(async () => {
const nomsCaches = await caches.keys();


  await Promise.all(
    nomsCaches
      .filter(
        (nom) =>
          nom.startsWith("dicmed-cache-") &&
          nom !== CACHE_NAME
      )
      .map((nom) => caches.delete(nom))
  );

  await self.clients.claim();
})()


);
});

self.addEventListener("fetch", (event) => {
if (event.request.method !== "GET") return;

const url = new URL(event.request.url);

if (url.origin !== self.location.origin) return;

event.respondWith(
(async () => {
const cache = await caches.open(CACHE_NAME);
const reponseEnCache = await cache.match(event.request);


  if (reponseEnCache) return reponseEnCache;

  try {
    const reponse = await fetch(event.request);

    if (reponse.ok) {
      await cache.put(event.request, reponse.clone());
    }

    return reponse;
  } catch (erreur) {
    return new Response("Contenu indisponible hors connexion.", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }
})()


);
});
