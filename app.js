"use strict";
const SING = {maladie:"Maladie", muscle:"Muscle", hormone:"Hormone", tissu:"Tissu", anatomie:"Anatomie", reflexe:"Réflexe naturel", jargon:"Jargon médical", biologie:"Biologie"};
const PLUR = {maladie:"Maladies", muscle:"Muscles", hormone:"Hormones", tissu:"Tissus", anatomie:"Anatomie", reflexe:"Réflexes naturels", jargon:"Jargon médical", biologie:"Biologie"};
const LABELS = {nom_medical:"Nom médical", etymologie:"Étymologie", nature:"Nature", definition_situation_anatomique:"Situation", fonction:"Fonction", localisation:"Localisation", origine:"Origine", insertion:"Insertion", trajet_rapports_anatomiques:"Trajet et rapports", innervation:"Innervation", vascularisation:"Vascularisation", terminaison:"Terminaison", synergie_antagonisme:"Synergie et antagonisme", variations_anatomiques:"Variations anatomiques", abreviation:"Abréviation", nature_chimique:"Nature chimique", glande_ou_organe_producteur:"Producteur", cellules_productrices:"Cellules productrices", explication_medicale:"Explication médicale", contexte_utilisation:"Contexte d’utilisation", synonyme_officiel:"Synonyme ou terme officiel", mecanisme_physiologique:"Mécanisme physiologique", facteurs_declenchants:"Facteurs déclenchants", regulation:"Régulation", role_organisme:"Rôle dans l’organisme", role_physiologique:"Rôle physiologique", origine_production:"Origine et production", valeurs_reference:"Valeurs de référence", facteurs_influencant:"Facteurs influençant les valeurs", causes_augmentation:"Causes d’augmentation", causes_diminution:"Causes de diminution", signes_cliniques_variations:"Signes et manifestations cliniques", methodes_dosage:"Méthodes de dosage", interet_diagnostique:"Intérêt diagnostique", consequences_variations:"Conséquences des variations", prise_en_charge_anomalies:"Prise en charge des anomalies", caracteristiques_biologiques:"Caractéristiques biologiques", antigenes:"Antigènes", anticorps:"Anticorps", genetique_heredite:"Génétique et hérédité", repartition:"Répartition", compatibilite_transfusionnelle:"Compatibilité transfusionnelle", incompatibilite_immunologique:"Incompatibilité immunologique", examens_biologiques:"Examens biologiques", importance_clinique:"Importance clinique", particularites:"Particularités", classification:"Classification", etiologie:"Étiologie", agent_pathogene:"Agent pathogène", physiopathologie:"Physiopathologie", facteurs_risque:"Facteurs de risque", epidemiologie:"Épidémiologie", mode_transmission:"Mode de transmission", periode_incubation:"Période d’incubation", mode_survenue:"Mode de survenue", delai_apparition:"Délai d’apparition", signes_fonctionnels:"Signes fonctionnels", signes_physiques:"Signes physiques", examens_complementaires:"Examens complémentaires", diagnostic_positif:"Diagnostic positif", diagnostic_differentiel:"Diagnostic différentiel", evolution:"Évolution", complications:"Complications", traitement_medical:"Traitement médical", traitement_chirurgical:"Traitement chirurgical", pronostic:"Pronostic", prevention:"Prévention", anomalies_associees:"Anomalies associées", etude_clinique:"Étude clinique", causes_agent_pathogene:"Causes", traitement:"Traitement", pathologies:"Pathologies associées", sources:"Sources indiquées (à vérifier)"};
const SKIP = new Set(["id","terme","latin","type","systeme","categorie","resume","synonymes","definition","nature","src","groupe","ordre","relu","l","n","repertoire"]);
const PAGE = 60;
// Mode administrateur : si une session Supabase est ouverte dans ce navigateur, les chiffres (nombre de fiches, compteurs) s'affichent.
if (window.dicmedSupabase && dicmedSupabase.auth) {
  dicmedSupabase.auth.getSession().then(({data}) => { if (data && data.session) document.body.classList.add("est-admin"); }).catch(() => {});
}
// Statistiques : une lecture anonyme (id et nom de la fiche, sans donnée personnelle), une fois par fiche et par session
function compterVue(f) {
  if (!window.dicmedSupabase || document.body.classList.contains("est-admin")) return;
  try { if (sessionStorage.getItem("dicmed_vu_" + f.id)) return; sessionStorage.setItem("dicmed_vu_" + f.id, "1"); } catch {}
  try { dicmedSupabase.from("vues_fiches").insert({fiche_id: f.id, terme: f.terme}).then(() => {}, () => {}); } catch {}
}
const VERSION = "20261105b";
const $ = s => document.querySelector(s);
const norm = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/œ/gi, "oe").replace(/[’']/g, " ").toLowerCase().trim();
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
// Création d'éléments : tout le texte passe par textContent (pas de HTML injecté)
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  e.append(...kids.flat(Infinity).filter(x => x != null && x !== false));
  return e;
}
// Distance de Levenshtein bornée : sert à tolérer les fautes de frappe
function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let p = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const c = [i]; let min = i;
    for (let j = 1; j <= b.length; j++) {
      c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (c[j] < min) min = c[j];
    }
    if (min > max) return max + 1;
    p = c;
  }
  return p[b.length];
}

let fiches = [], byId = new Map(), view = [], approx = false;
let favs = new Set(store.get("dicmed_favoris_v2", []));
let type = "tous", letter = "", query = "", shown = PAGE;

function prepare(f) {
  const syn = [].concat(f.synonymes || []);
  const txt = norm([f.terme, f.latin, f.abreviation, ...syn].filter(Boolean).join(" "));
  f.n = {name: norm(f.terme), syn: syn.map(norm), all: txt,
         words: [...new Set(txt.split(/[^a-z0-9]+/).filter(w => w.length > 1))], res: norm(f.resume || "")};
  const c = f.n.name[0] || "#";
  f.l = /[a-z]/.test(c) ? c.toUpperCase() : "#";
}
function score(f, q, t) {
  const n = f.n;
  if (n.name === q || n.syn.includes(q)) return 100;
  if (n.name.startsWith(q)) return 85;
  if (n.syn.some(s => s.startsWith(q))) return 80;
  if (n.words.some(w => w.startsWith(q))) return 65;
  if (t.every(x => n.all.includes(x))) return 50;
  return n.res.includes(q) ? 20 : 0;
}
function proche(f, t) {
  return t.every(x => x.length >= 4 && f.n.words.some(w => {
    const m = x.length > 6 ? 2 : 1;
    return lev(x, w, m) <= m || lev(x, w.slice(0, x.length), 1) <= 1;
  }));
}
function compute() {
  const pool = fiches.filter(f => type === "tous" || (type === "favoris" ? favs.has(f.id) : f.type === type));
  const q = norm(query), t = q.split(/\s+/).filter(Boolean);
  approx = false;
  if (!q) return pool;
  let res = pool.map(f => [score(f, q, t), f]).filter(x => x[0]);
  if (!res.length) { res = pool.filter(f => proche(f, t)).map(f => [1, f]); approx = res.length > 0; }
  return res.sort((a, b) => b[0] - a[0]).map(x => x[1]);
}

function card(f) {
  return h("button", {class: "card", type: "button", onclick: () => openFiche(f.id)},
    h("span", {class: "badge t-" + f.type}, SING[f.type]),
    h("strong", {}, f.terme),
    h("span", {class: "snip"}, f.resume || f.categorie));
}
function render() {
  if (!fiches.length) return;
  const all = compute();
  const present = new Set(all.map(f => f.l));
  view = letter ? all.filter(f => f.l === letter) : all;

  const counts = {tous: fiches.length, favoris: [...favs].filter(id => byId.has(id)).length};
  fiches.forEach(f => counts[f.type] = (counts[f.type] || 0) + 1);
  $("#chips").replaceChildren(...[["tous", "Tous"], ...Object.entries(PLUR), ["favoris", "♡ Favoris"]].map(([k, l]) =>
    h("button", {class: "chip" + (type === k ? " on" : ""), type: "button", "aria-pressed": String(type === k),
      onclick: () => { type = k; letter = ""; shown = PAGE; render(); }}, l + " ", h("small", {class: "stat"}, String(counts[k] || 0)))));
  $("#abc").replaceChildren(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(L =>
    h("button", {type: "button", class: letter === L ? "on" : null, disabled: !present.has(L),
      "aria-label": "Termes en " + L, onclick: () => { letter = letter === L ? "" : L; shown = PAGE; render(); }}, L)));

  const q = query.trim();
  const nom = q ? "Résultats pour « " + q + " »" : type === "tous" ? "Tous les termes" : type === "favoris" ? "Favoris" : PLUR[type];
  $("#titre").replaceChildren(nom, h("span", {class: "stat"}, view.length + (view.length > 1 ? " fiches" : " fiche")));

  const list = $("#list");
  list.replaceChildren();
  if (approx) list.append(h("p", {class: "approx"}, "Aucun résultat exact pour « " + q + " ». Voici des termes proches."));
  if (!view.length) {
    list.append(h("p", {class: "empty"}, q ? "Aucun terme trouvé pour « " + q + " ». Vérifiez l’orthographe ou essayez un synonyme."
      : type === "favoris" ? "Aucun favori pour l’instant. Ouvrez une fiche puis touchez ♡ Favoris." : "Aucune fiche à afficher."));
  }
  let grid = null, last = "";
  view.slice(0, shown).forEach(f => {
    if (!q && f.l !== last) { last = f.l; list.append(h("h3", {class: "letter"}, last)); grid = h("div", {class: "grid"}); list.append(grid); }
    else if (q && !grid) { grid = h("div", {class: "grid"}); list.append(grid); }
    grid.append(card(f));
  });
  $("#more").hidden = view.length <= shown;
}

// ---------------------------------------------------------------- liens entre termes
// Index construit une seule fois : suite de mots normalisés (nom, nom sans parenthèse, synonymes) -> id de la fiche.
// Les termes ambigus (« tête » : tête du pancréas, tête de l'humérus…) sont exclus.
const STOP = new Set(["tete", "corps", "face", "base", "queue", "col", "angle", "tronc", "partie"]);
const LIENS = new Map(), PREMIERS = new Set();
let NMAX = 1, pile = [], courant = "";
function mots(s) {
  return [...String(s).matchAll(/[\p{L}\p{N}]+/gu)].map(m => ({
    w: norm(m[0]).replace(/[^a-z0-9]/g, ""), i: m.index, e: m.index + m[0].length}));
}
function indexerLiens() {
  for (const f of fiches) {
    const noms = [f.terme.replace(/\s*\([^)]*\)\s*$/, ""), f.terme, ...[].concat(f.synonymes || [])];
    for (const nom of noms) {
      const m = mots(nom).map(x => x.w), k = m.join(" ");
      if (k.replace(/ /g, "").length < 4 || STOP.has(k) || LIENS.has(k)) continue;
      LIENS.set(k, f.id); PREMIERS.add(m[0]); NMAX = Math.max(NMAX, m.length);
    }
  }
  NMAX = Math.min(NMAX, 10);
}
// Transforme un texte en morceaux de texte et liens cliquables ; un terme n'est lié qu'à sa première apparition dans la fiche
function lier(texte, f, deja) {
  const M = mots(texte), sortie = [];
  let dernier = 0, i = 0;
  while (i < M.length) {
    let cible = null, n = 0;
    if (PREMIERS.has(M[i].w)) {
      for (n = Math.min(NMAX, M.length - i); n > 0; n--) {
        const id = LIENS.get(M.slice(i, i + n).map(x => x.w).join(" "));
        if (id && id !== f.id && !deja.has(id)) { cible = id; break; }
      }
    }
    if (!cible) { i++; continue; }
    const a = M[i].i, b = M[i + n - 1].e;
    sortie.push(texte.slice(dernier, a),
      h("a", {href: "#" + cible, class: "lien", onclick: e => { e.preventDefault(); aller(cible); }}, texte.slice(a, b)));
    deja.add(cible); dernier = b; i += n;
  }
  sortie.push(texte.slice(dernier));
  return sortie;
}
function aller(id) { if (courant && dlg.open) pile.push(courant); openFiche(id); }

// ---------------------------------------------------------------- fiche
const dlg = $("#fiche");
function openFiche(id) {
  const f = byId.get(id);
  if (!f) return;
  const box = $("#fb"), deja = new Set();
  courant = id;
  box.replaceChildren(...[
    h("div", {class: "fhead"},
      pile.length > 0 && h("button", {class: "back", type: "button", onclick: () => openFiche(pile.pop())}, "‹ Retour"),
      h("span", {class: "badge t-" + f.type}, SING[f.type]), h("span", {class: "sys"}, f.systeme),
      h("button", {class: "icon x", type: "button", "aria-label": "Fermer", onclick: () => dlg.close()}, "✕")),
    h("h2", {}, f.terme),
    f.latin && h("p", {class: "latin"}, f.latin),
    f.synonymes && h("p", {class: "syn"}, "Aussi : " + [].concat(f.synonymes).join(", ")),
    f.nature && h("p", {class: "pill"}, "Nature : " + f.nature),
    f.definition && h("p", {class: "lead"}, lier(f.definition, f, deja))].filter(Boolean));
  const cles = [...Object.keys(LABELS).filter(k => k in f), ...Object.keys(f).filter(k => !SKIP.has(k) && !(k in LABELS))];
  // Rubriques déroulantes : la première est ouverte, un bouton ouvre ou referme tout
  const rubs = [];
  cles.forEach(k => {
    const v = f[k];
    if (!(typeof v === "string" || (Array.isArray(v) && v.every(x => typeof x === "string")))) return;
    rubs.push(h("details", {class: "rub", open: rubs.length === 0},
      h("summary", {}, LABELS[k] || k.replace(/_/g, " ").replace(/^./, c => c.toUpperCase())),
      Array.isArray(v) ? h("ul", {}, v.map(x => h("li", {}, lier(x, f, deja)))) : h("p", {}, lier(v, f, deja))));
  });
  if (rubs.length > 1) box.append(h("div", {class: "tout"}, h("button", {type: "button", class: "ghost",
    onclick: e => { const ouvrir = rubs.some(d => !d.open); rubs.forEach(d => { d.open = ouvrir; }); e.target.textContent = ouvrir ? "Tout replier" : "Tout déplier"; }}, "Tout déplier")));
  box.append(...rubs);
  const voisins = fiches.filter(x => x !== f && (f.groupe ? x.groupe === f.groupe : x.categorie === f.categorie)).slice(0, 6);
  if (voisins.length) box.append(h("section", {}, h("h4", {}, "Dans la même catégorie : " + (f.groupe || f.categorie)),
    h("div", {class: "rel"}, voisins.map(x => h("button", {type: "button", onclick: () => aller(x.id)}, x.terme)))));
  box.scrollTop = 0;

  const liste = view.includes(f) ? view : fiches, k = liste.indexOf(f);
  $("#prev").disabled = k <= 0;
  $("#next").disabled = k >= liste.length - 1;
  $("#prev").onclick = () => openFiche(liste[k - 1].id);
  $("#next").onclick = () => openFiche(liste[k + 1].id);
  const bf = $("#fav");
  const maj = () => { bf.textContent = favs.has(id) ? "♥ Favori" : "♡ Favoris"; };
  maj();
  bf.onclick = () => { favs.has(id) ? favs.delete(id) : favs.add(id); store.set("dicmed_favoris_v2", [...favs]); maj(); render(); };
  const bs = $("#share");
  bs.onclick = async () => {
    try {
      if (navigator.share) await navigator.share({title: "DicMed — " + f.terme, text: f.resume || f.terme, url: location.href});
      else { await navigator.clipboard.writeText(location.href); bs.textContent = "Lien copié"; setTimeout(() => bs.textContent = "Partager", 1800); }
    } catch {}
  };
  history.replaceState(null, "", "#" + id);
  if (!dlg.open) dlg.showModal();
  compterVue(f);
}
dlg.addEventListener("close", () => { pile = []; courant = ""; history.replaceState(null, "", location.pathname + location.search); });
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

// ---------------------------------------------------------------- thème et taille du texte
const root = document.documentElement;
function theme(t) { root.dataset.theme = t; $("#theme").textContent = t === "dark" ? "☀" : "☾"; store.set("dicmed_theme", t); }
theme(store.get("dicmed_theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("#theme").onclick = () => theme(root.dataset.theme === "dark" ? "light" : "dark");
const TAILLES = [100, 112, 125];
let ti = store.get("dicmed_taille", 0);
const taille = () => { root.style.fontSize = TAILLES[ti] + "%"; store.set("dicmed_taille", ti); };
taille();
$("#size").onclick = () => { ti = (ti + 1) % TAILLES.length; taille(); };

// ---------------------------------------------------------------- recherche
$("#q").addEventListener("input", e => { query = e.target.value; letter = ""; shown = PAGE; render(); });
$("#sf").addEventListener("submit", e => e.preventDefault());
$("#more").onclick = () => { shown += PAGE; render(); };

// ---------------------------------------------------------------- contributions (Supabase)
const cd = $("#contrib");
$("#contrib-open").onclick = () => cd.showModal();
$("#c-close").onclick = () => cd.close();
$("#c-type").onchange = () => {
  const nouveau = $("#c-type").value === "nouveau_terme";
  $("#c-new").hidden = !nouveau; $("#c-old").hidden = nouveau;
};
$("#cform").addEventListener("submit", async e => {
  e.preventDefault();
  const msg = $("#c-msg"), btn = $("#c-send"), t = $("#c-type").value, nouveau = t === "nouveau_terme";
  const terme = (nouveau ? $("#c-terme") : $("#c-cible")).value.trim();
  if (!terme) { msg.textContent = nouveau ? "Indiquez le terme proposé." : "Indiquez le terme concerné."; return; }
  if (!window.dicmedSupabase) { msg.textContent = "L’envoi n’est pas disponible pour le moment."; return; }
  btn.disabled = true; msg.textContent = "";
  try {
    const {error} = await window.dicmedSupabase.from("suggestions").insert({
      type: t, terme_propose: nouveau ? terme : null, terme_cible: nouveau ? null : terme,
      champ_cible: nouveau ? null : $("#c-rubrique").value, contenu_propose: $("#c-contenu").value.trim(),
      justification: $("#c-just").value.trim() || null, statut: "EN_ATTENTE"});
    if (error) throw error;
    $("#cform").reset(); $("#c-type").onchange();
    msg.textContent = "Merci, votre contribution est envoyée.";
  } catch (err) {
    console.error(err);
    msg.textContent = "Envoi impossible. Réessayez plus tard.";
  } finally { btn.disabled = false; }
});

// ---------------------------------------------------------------- démarrage
const CHEMINS = ["data/termes.json", "termes.json"];
async function charger() {
  const erreurs = [];
  for (const c of CHEMINS) {
    try {
      const r = await fetch(c + "?v=" + VERSION, {cache: "no-cache"});
      if (!r.ok) { erreurs.push(c + " : erreur " + r.status); continue; }
      return await r.json();
    } catch (e) { erreurs.push(c + " : " + e.message); }
  }
  throw new Error(erreurs.join("\n"));
}
// Accepte aussi l'ancien format du dictionnaire (champs « nom » et « section_source »)
function adapter(f, i) {
  if (!f.terme) f.terme = f.nom || "";
  if (!f.id) f.id = (norm(f.terme).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "fiche") + "-" + i;
  if (!SING[f.type]) f.type = "anatomie";
  f.systeme = f.systeme || "";
  f.categorie = f.categorie || f.section_source || "";
  if (!f.resume && typeof f.definition === "string") f.resume = f.definition.split(/(?<=[.!?])\s/)[0];
}
charger()
  .then(d => {
    fiches = (Array.isArray(d) ? d : d.termes || []).filter(f => f && (f.terme || f.nom));
    if (!fiches.length) throw new Error("Le fichier est lu, mais ne contient aucune fiche (champ « termes » attendu).");
    fiches.forEach((f, i) => { adapter(f, i); prepare(f); byId.set(f.id, f); });
    indexerLiens();
    $("#nb").textContent = fiches.length + " fiches.";
    if ($("#ver")) $("#ver").textContent = "Version " + VERSION + " · " + fiches.length + " fiches";
    render();
    if (typeof afficherReflexes === "function") afficherReflexes();
    const id = location.hash.slice(1);
    if (byId.has(id)) openFiche(id);
  })
  .catch(err => {
    console.error(err);
    $("#list").replaceChildren(
      h("p", {class: "empty"}, "Impossible de charger les fiches."),
      h("p", {class: "empty"}, location.protocol === "file:"
        ? "La page est ouverte directement depuis un fichier. Ouvrez-la depuis un serveur web (adresse en http:// ou https://)."
        : "Vérifiez que le fichier data/termes.json existe à côté de index.html."),
      h("pre", {class: "empty"}, String(err.message)));
  });
