"use strict";
// Rubrique « Bio » (fruits, légumes, plantes) : lit data/bio.json, avec recherche et filtre par catégorie.
// La fiche s'ouvre dans la même fenêtre que celles du dictionnaire. Utilise $, h, norm, byId, view, openFiche et VERSION de app.js.
let bioListe = [], bioCat = "Toutes", bioQuery = "", bioMontre = 60;
function bioInit() {
  const zone = $("#bio-liste");
  const champ = h("input", {type: "search", class: "bio-q", placeholder: "Rechercher un fruit, un légume…", "aria-label": "Rechercher dans Bio"});
  const chips = h("div", {class: "chips"}), liste = h("div", {class: "grid"});
  const plus = h("button", {type: "button", class: "btn more", hidden: true}, "Afficher plus");
  const maj = () => {
    const q = norm(bioQuery), cats = ["Toutes", ...new Set(bioListe.map(f => f.categorie))];
    chips.replaceChildren(...cats.map(c => h("button", {type: "button", class: "chip" + (bioCat === c ? " on" : ""), onclick: () => { bioCat = c; bioMontre = 60; maj(); }},
      c + " ", h("small", {class: "stat"}, String(c === "Toutes" ? bioListe.length : bioListe.filter(f => f.categorie === c).length)))));
    const l = bioListe.filter(f => (bioCat === "Toutes" || f.categorie === bioCat) && (!q || f.n.includes(q)));
    liste.replaceChildren(...(l.length ? l.slice(0, bioMontre).map(f => h("button", {class: "card", type: "button", onclick: () => { view = l; openFiche(f.id); }},
      h("span", {class: "badge t-bio"}, f.categorie), h("strong", {}, f.terme), h("span", {class: "snip"}, f.latin || f.resume || ""))) : [h("p", {class: "empty"}, "Aucun résultat.")]));
    plus.hidden = l.length <= bioMontre;
  };
  champ.oninput = () => { bioQuery = champ.value; bioMontre = 60; maj(); };
  plus.onclick = () => { bioMontre += 60; maj(); };
  zone.replaceChildren(champ, chips, liste, plus);
  maj();
}
fetch("data/bio.json?v=" + VERSION)
  .then(r => r.ok ? r.json() : {fiches: []})
  .catch(() => ({fiches: []}))
  .then(d => {
    bioListe = (d.fiches || []).filter(f => f && (f.terme || f.nom)).map(f => {
      f.terme = f.terme || f.nom; f.type = "bio"; f.categorie = f.categorie || "Bio";
      f.id = f.id || "bio-" + norm(f.terme).replace(/[^a-z0-9]+/g, "-");
      f.n = norm([f.terme, f.latin, ...(f.synonymes || [])].filter(Boolean).join(" "));
      byId.set(f.id, f); return f;
    });
    if (bioListe.length) bioInit();
    else $("#bio-liste").replaceChildren(h("p", {class: "vide"}, "Cette rubrique est en préparation. Les premiers contenus seront publiés prochainement."));
  });

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
      h("summary", {}, h("strong", {}, partie), h("small", {class: "stat"}, n + (n > 1 ? " fiches" : " fiche"))),
      [...groupes].map(([g, l]) => g
        ? h("details", {class: "groupe"}, h("summary", {}, g, h("small", {class: "stat"}, String(l.length))), h("div", {class: "grid"}, l.map(card)))
        : h("div", {class: "grid"}, l.map(card))));
  }));
}
