"use strict";
// Espace administrateur DicMed : statistiques (mots les plus lus), dictionnaire en chiffres, contributions.
const sb = window.dicmedSupabase;
const $ = s => document.querySelector(s);
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === false) continue;
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? "" : v);
  }
  e.append(...kids.flat(Infinity).filter(x => x != null && x !== false));
  return e;
}
const msg = (el, t) => { el.textContent = t; };

// ---------------------------------------------------------------- connexion
function afficher(session) {
  $("#connexion").hidden = !!session; $("#app").hidden = !session;
  if (session) vue(sessionStorage.getItem("dicmed_vue_admin") || "stats");
}
if (!sb) msg($("#lm"), "Connexion impossible : supabase-config.js est introuvable (il doit se trouver à la racine du site).");
else {
  sb.auth.getSession().then(({data}) => afficher(data && data.session));
  $("#lf").addEventListener("submit", async e => {
    e.preventDefault(); $("#lb").disabled = true; msg($("#lm"), "");
    const {data, error} = await sb.auth.signInWithPassword({email: $("#em").value.trim(), password: $("#pw").value});
    $("#lb").disabled = false;
    if (error) msg($("#lm"), "Identifiants incorrects."); else { $("#pw").value = ""; afficher(data.session); }
  });
  $("#out").onclick = async () => { await sb.auth.signOut(); afficher(null); };
}

// ---------------------------------------------------------------- navigation
const VUES = ["stats", "dico", "contrib"], OUVRIR = {stats: statistiques, dico: dictionnaire, contrib: contributions};
document.querySelectorAll("#menu button").forEach(b => b.onclick = () => vue(b.dataset.v));
function vue(n) {
  sessionStorage.setItem("dicmed_vue_admin", n);
  VUES.forEach(v => { $("#v-" + v).hidden = v !== n; document.querySelector(`#menu [data-v=${v}]`).classList.toggle("on", v === n); });
  OUVRIR[n]();
}

// ---------------------------------------------------------------- statistiques : mots les plus lus
$("#periode").onchange = statistiques;
async function statistiques() {
  const jours = +$("#periode").value, zone = $("#top");
  zone.replaceChildren(h("p", {class: "vide"}, "Chargement…"));
  const [t, n] = await Promise.all([sb.rpc("top_fiches", {jours, limite: 20}), sb.rpc("total_vues", {jours})]);
  if (t.error) {
    const absent = t.error.code === "PGRST202" || /function|fonction/i.test(t.error.message || "");
    zone.replaceChildren(h("p", {class: "err"}, absent ? "Les statistiques ne sont pas encore activées. Exécutez le fichier supabase_stats.sql dans Supabase (SQL Editor), après avoir remplacé VOTRE_EMAIL_ADMIN." : "Erreur : " + t.error.message));
    return;
  }
  $("#k-vues").textContent = n.error ? "—" : String(n.data);
  const max = Math.max(1, ...t.data.map(r => Number(r.vues)));
  zone.replaceChildren(...(t.data.length ? t.data.map((r, i) => h("div", {class: "ligne"},
    h("span", {class: "rang"}, String(i + 1)), h("span", {class: "nom"}, r.terme),
    h("span", {class: "barre"}, h("i", {style: "width:" + Math.round(100 * r.vues / max) + "%"})), h("b", {}, String(r.vues))))
    : [h("p", {class: "vide"}, "Aucune lecture enregistrée sur cette période.")]));
}

// ---------------------------------------------------------------- le dictionnaire en chiffres (réservé à l'administrateur)
let TERMES = null;
const TYPES = {maladie: "Maladies", muscle: "Muscles", hormone: "Hormones", tissu: "Tissus", anatomie: "Anatomie", reflexe: "Réflexes naturels", jargon: "Jargon médical", biologie: "Biologie"};
function barres(zone, compte) {
  const max = Math.max(1, ...compte.map(x => x[1]));
  zone.replaceChildren(...compte.map(([nom, n], i) => h("div", {class: "ligne"}, h("span", {class: "rang"}, String(i + 1)), h("span", {class: "nom"}, nom),
    h("span", {class: "barre"}, h("i", {style: "width:" + Math.round(100 * n / max) + "%"})), h("b", {}, String(n)))));
}
async function dictionnaire() {
  try {
    if (!TERMES) TERMES = (await (await fetch("../data/termes.json?v=" + Date.now())).json()).termes;
    const tri = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
    const t = {}, s = {};
    TERMES.forEach(f => { t[TYPES[f.type] || f.type] = (t[TYPES[f.type] || f.type] || 0) + 1; s[f.systeme || "—"] = (s[f.systeme || "—"] || 0) + 1; });
    const kpi = (l, v) => h("div", {class: "kpi"}, h("span", {}, l), h("b", {}, String(v)));
    $("#k-dico").replaceChildren(kpi("Fiches", TERMES.length), kpi("À relire", TERMES.filter(f => f.relu === false).length),
      kpi("Sans définition", TERMES.filter(f => !f.definition).length), kpi("Types", Object.keys(t).length));
    barres($("#par-type"), tri(t)); barres($("#par-sys"), tri(s));
  } catch (e) { $("#k-dico").replaceChildren(h("p", {class: "err"}, "Impossible de lire data/termes.json.")); }
}

// ---------------------------------------------------------------- contributions
let CONTRIB = [], filtre = "TOUTES";
$("#rafr").onclick = contributions;
const STAT = {EN_ATTENTE: "En attente", ACCEPTEE: "Acceptée", REFUSEE: "Refusée"};
async function contributions() {
  msg($("#cm"), "Chargement…");
  let r = await sb.from("suggestions").select("*").order("created_at", {ascending: false});
  if (r.error) r = await sb.from("suggestions").select("*");
  if (r.error) { msg($("#cm"), "Erreur : " + r.error.message); return; }
  CONTRIB = r.data || []; msg($("#cm"), ""); listeContrib();
}
function listeContrib() {
  const n = k => k === "TOUTES" ? CONTRIB.length : CONTRIB.filter(c => c.statut === k).length;
  $("#filtres").replaceChildren(...[["TOUTES", "Toutes"], ...Object.entries(STAT)].map(([k, l]) =>
    h("button", {type: "button", class: filtre === k ? "on" : null, onclick: () => { filtre = k; listeContrib(); }}, l + " (" + n(k) + ")")));
  const l = CONTRIB.filter(c => filtre === "TOUTES" || c.statut === filtre);
  $("#liste").replaceChildren(...(l.length ? l.map(carte) : [h("p", {class: "vide"}, "Aucune contribution.")]));
}
function carte(c) {
  const cleMotif = Object.keys(c).find(k => /(motif|refus|reason)/i.test(k) && !/statut/i.test(k));
  const champ = (t, v) => v ? h("div", {class: "champ"}, h("b", {}, t), v) : null;
  const motif = h("input", {type: "text", placeholder: "Motif du refus (facultatif)", "aria-label": "Motif du refus"});
  const decider = async statut => {
    const maj = {statut}; if (statut === "REFUSEE" && cleMotif && motif.value.trim()) maj[cleMotif] = motif.value.trim();
    const {error} = await sb.from("suggestions").update(maj).eq("id", c.id);
    if (error) msg($("#cm"), "Erreur : " + error.message); else { c.statut = statut; if (maj[cleMotif]) c[cleMotif] = maj[cleMotif]; listeContrib(); }
  };
  return h("article", {class: "carte"},
    h("header", {}, h("div", {}, h("span", {class: "badge"}, String(c.type || "").replace(/_/g, " ")), " ", h("b", {}, c.terme_propose || c.terme_cible || "")),
      h("span", {class: "badge st-" + c.statut}, STAT[c.statut] || c.statut || "")),
    champ("Rubrique concernée", c.champ_cible), champ("Contenu proposé", c.contenu_propose), champ("Justification / source", c.justification),
    cleMotif && c[cleMotif] ? champ("Motif du refus", c[cleMotif]) : null,
    c.statut === "EN_ATTENTE" ? h("div", {class: "actions"}, motif, h("button", {class: "ok", type: "button", onclick: () => decider("ACCEPTEE")}, "Accepter"), h("button", {class: "ko", type: "button", onclick: () => decider("REFUSEE")}, "Refuser")) : null);
}
