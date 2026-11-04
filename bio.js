"use strict";
// Rubrique « Bio » : lit data/bio.json {"fiches": [...]}.
// Tant que « fiches » est vide, un message « en préparation » s'affiche.
// Champs d'une fiche : nom (obligatoire), description, usages (liste), precautions, sources (liste).
const BIO_CHAMPS = [["usages", "Usages"], ["precautions", "Précautions"], ["sources", "Sources"]];
const RUBRIQUES = [["data/bio.json", "#bio-liste"]];
function carteBio(f) {
  const bloc = (titre, v) => h("section", {}, h("h4", {}, titre),
    Array.isArray(v) ? h("ul", {}, v.map(x => h("li", {}, x))) : h("p", {}, v));
  return h("details", {class: "bio-fiche"},
    h("summary", {}, h("strong", {}, f.nom), f.description && h("span", {class: "snip"}, f.description)),
    BIO_CHAMPS.filter(([k]) => f[k] && f[k].length).map(([k, t]) => bloc(t, f[k])));
}
RUBRIQUES.forEach(([fichier, zone]) => fetch(fichier + "?v=" + VERSION)
  .then(r => r.ok ? r.json() : {fiches: []})
  .catch(() => ({fiches: []}))
  .then(d => {
    const liste = (d.fiches || []).filter(f => f && f.nom);
    $(zone).replaceChildren(...(liste.length ? liste.map(carteBio)
      : [h("p", {class: "vide"}, "Cette rubrique est en préparation. Les premiers contenus seront publiés prochainement.")]));
  }));

// Rubrique « Réflexe naturel » : les fiches du dictionnaire de type « reflexe », regroupées par partie puis par groupe (déroulants)
function afficherReflexes() {
  const liste = fiches.filter(f => f.type === "reflexe").sort((a, b) => a.ordre - b.ordre), zone = $("#reflexe-liste");
  if (!liste.length) {
    zone.replaceChildren(h("p", {class: "vide"}, "Cette rubrique est en préparation. Les premiers contenus seront publiés prochainement."));
    return;
  }
  const parties = new Map();
  liste.forEach(f => {
    if (!parties.has(f.categorie)) parties.set(f.categorie, new Map());
    const g = parties.get(f.categorie), k = f.groupe || "";
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(f);
  });
  zone.replaceChildren(...[...parties].map(([partie, groupes]) => {
    const n = [...groupes.values()].reduce((s, l) => s + l.length, 0);
    return h("details", {class: "partie"},
      h("summary", {}, h("strong", {}, partie), h("small", {}, n + (n > 1 ? " fiches" : " fiche"))),
      [...groupes].map(([g, l]) => g
        ? h("details", {class: "groupe"}, h("summary", {}, g, h("small", {}, String(l.length))), h("div", {class: "grid"}, l.map(card)))
        : h("div", {class: "grid"}, l.map(card))));
  }));
}
