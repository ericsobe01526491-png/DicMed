"use strict";
// Décoder un mot médical. Utilise h, norm, $, fiches et openFiche définis dans app.js.
// Morceaux de mots : type|formes|sens|exemple   (p = préfixe, r = radical, s = suffixe ; « / » sépare les variantes)
const RACINES = `
p|a/an|absence, privation|anémie
p|anti|contre|antiseptique
p|brady|lent|bradycardie
p|dia|à travers|diarrhée
p|dys|difficulté, trouble|dyspnée
p|endo|à l'intérieur|endocardite
p|épi|sur, au-dessus|épigastralgie
p|ex/exo|à l'extérieur, hors de|exophtalmie
p|hémi|moitié|hémiplégie
p|hyper|au-dessus, en excès|hypertension
p|hypo|au-dessous, insuffisant|hypotension
p|inter|entre|intercostal
p|intra|à l'intérieur de|intramusculaire
p|macro|grand|macroglossie
p|micro|petit|microcéphalie
p|néo|nouveau|néonatal
p|oligo/olig|peu, en petite quantité|oligurie
p|para|à côté de, près de|parathyroïde
p|péri|autour|péricardite
p|poly|nombreux, beaucoup|polyurie
p|post|après|postnatal
p|pré|avant|prénatal
p|sub|sous|sublingual
p|supra|au-dessus de|suprarénal
p|tachy|rapide|tachycardie
p|trans|à travers|transthoracique
r|abdomin|abdomen|abdominal
r|amygdal|amygdale|amygdalite
r|angi|vaisseau|angiographie
r|append/appendic|appendice|appendicectomie
r|aort|aorte|aortite
r|arthr|articulation|arthrose
r|artér/arter|artère|artérite
r|bactéri|bactérie|bactériémie
r|bronch|bronche|bronchite
r|card/cardi|cœur|cardiologie
r|carcin|cancer|carcinome
r|cérébr|cerveau|cérébral
r|céphal|tête|microcéphalie
r|chim/chimi|produit chimique|chimiothérapie
r|chondr|cartilage|chondrome
r|cholécyst|vésicule biliaire|cholécystite
r|col/côl|côlon|colite
r|cost|côte|intercostal
r|crani|crâne|craniotomie
r|cyan|bleu|cyanose
r|cyst|vessie|cystite
r|cyt|cellule|cytologie
r|dactyl|doigt|polydactylie
r|derm/dermat|peau|dermatologie
r|électr|électricité|électrocardiogramme
r|encéphal|encéphale, cerveau|encéphalite
r|entér/enter|intestin|entérite
r|érythr|rouge|érythrocyte
r|gastr|estomac|gastrite
r|glyc/gluc|sucre|glycémie
r|gloss|langue|glossite
r|gynéc|femme|gynécologie
r|hém/hémat|sang|hématome
r|hépat|foie|hépatite
r|hist|tissu|histologie
r|hydr|eau|hydrocéphalie
r|hystér|utérus|hystérectomie
r|immun|immunité, défense|immunologie
r|kali|potassium|kaliémie
r|kin/kinési|mouvement|kinésithérapie
r|laryng|larynx|laryngite
r|leuc|blanc|leucémie
r|lingu|langue|sublingual
r|lip|graisse|lipome
r|lith|pierre, calcul|lithiase
r|lymph|lymphe|lymphome
r|mamm|sein|mammographie
r|mast|sein|mastite
r|mélan|noir|mélanome
r|méning|méninges|méningite
r|muscul|muscle|musculaire
r|my|muscle|myopathie
r|myc|champignon|mycose
r|myél|moelle|myélite
r|nat|naissance|néonatal
r|natr|sodium|natrémie
r|nécr|mort des tissus|nécrose
r|néphr|rein|néphrologie
r|neur/névr|nerf|neurologie
r|oc/ocul|œil|oculaire
r|onc|tumeur|oncologie
r|ophtalm|œil|ophtalmologie
r|orch/orchi|testicule|orchite
r|oste|os|ostéite
r|ot|oreille|otite
r|ovari|ovaire|ovariectomie
r|pancréat|pancréas|pancréatite
r|path|maladie, souffrance|pathologie
r|périton|péritoine|péritonite
r|pharyng|pharynx|pharyngite
r|phléb|veine|phlébite
r|pleur|plèvre|pleurite
r|pneumon/pneum|poumon|pneumonie
r|pod|pied|podologie
r|proct|anus, rectum|proctologie
r|prostat|prostate|prostatite
r|psych|esprit, mental|psychiatrie
r|pulmon|poumon|pulmonaire
r|radi|rayon|radiologie
r|ren|rein|rénal
r|rhin|nez|rhinite
r|scler|dur, durcissement|sclérose
r|sept/septic|infection|septicémie
r|splén|rate|splénomégalie
r|spondyl|vertèbre|spondylarthrite
r|stomat|bouche|stomatite
r|tension/tensi|pression artérielle|hypertension
r|thorac/thorax|thorax|thoracotomie
r|thromb|caillot|thrombose
r|thyr/thyroïd|thyroïde|thyroïdite
r|toxic/toxi/tox|poison|toxicologie
r|trache|trachée|trachéite
r|ur|urine, voies urinaires|urologie
r|vir|virus|virologie
s|ase|enzyme|lipase
s|al/ale|relatif à|abdominal
s|aire|relatif à|pulmonaire
s|algie|douleur|névralgie
s|cèle|hernie, tuméfaction|hydrocèle
s|cide|qui tue|bactéricide
s|cyte|cellule|érythrocyte
s|cytose|augmentation du nombre de cellules|leucocytose
s|ectomie|ablation chirurgicale|appendicectomie
s|émie|présence dans le sang|anémie
s|esthésie|sensibilité|anesthésie
s|gène|qui produit, qui provoque|pathogène
s|gramme|image, tracé|électrocardiogramme
s|graphie|enregistrement, imagerie|radiographie
s|iase|affection due à la présence de|lithiase
s|iatrie|médecine, soin|psychiatrie
s|ie|état, affection|tachycardie
s|ique|relatif à|gastrique
s|ite|inflammation|bronchite
s|logie|étude|néphrologie
s|logue|spécialiste|cardiologue
s|lyse|destruction, dissolution|hémolyse
s|mégalie|augmentation de volume|cardiomégalie
s|mètre|instrument de mesure|tensiomètre
s|oïde|qui ressemble à|thyroïde
s|ome|tumeur|mélanome
s|ose|affection chronique, souvent dégénérative|arthrose
s|pathie|maladie|cardiopathie
s|pénie|manque, diminution|leucopénie
s|phagie|action d'avaler|dysphagie
s|phasie|parole, langage|aphasie
s|plasie|formation, développement|dysplasie
s|plastie|réparation chirurgicale|rhinoplastie
s|plégie|paralysie|hémiplégie
s|pnée|respiration|dyspnée
s|rrhée/rhée|écoulement|diarrhée
s|rragie/ragie|jaillissement, flux|hémorragie
s|scope|instrument d'observation|endoscope
s|scopie|examen visuel|endoscopie
s|stase|arrêt, blocage|hémostase
s|stomie|ouverture créée par chirurgie|colostomie
s|thérapie|traitement, soin|chimiothérapie
s|tomie|incision, section|thoracotomie
s|trophie|nutrition, croissance|hypertrophie
s|urie|présence dans l'urine|polyurie
`.trim().split("\n").map(l => {
  const [k, f, sens, ex] = l.split("|"), noms = f.split("/");
  const base = noms.map(x => norm(x).replace(/[^a-z]/g, "")), formes = new Set(base);
  if (k === "r") base.forEach(b => formes.add(b + "o"));      // voyelle de liaison : gastr + o
  return {k, base, formes: [...formes], sens, ex,
          label: k === "p" ? noms[0] + "-" : k === "s" ? "-" + noms[0] : noms[0] + "(o)-"};
});
const FORMES = new Map(), RANG = {p: 0, r: 1, s: 2};
let MAXF = 1;
RACINES.forEach(r => r.formes.forEach(x => {
  if (!FORMES.has(x)) FORMES.set(x, []);
  FORMES.get(x).push(r); MAXF = Math.max(MAXF, x.length);
}));

// Découpe un mot (sans accents) en préfixes, radicaux, suffixes (dans cet ordre) ; les lettres inconnues coûtent plus cher
function decouper(w) {
  const n = w.length, dp = Array.from({length: n + 1}, () => [null, null, null]);
  dp[0][0] = {c: 0};
  for (let i = 0; i < n; i++) for (let r = 0; r < 3; r++) {
    const cur = dp[i][r];
    if (!cur) continue;
    const essai = (j, r2, cout, piece) => {
      const c = cur.c + cout;
      if (!dp[j][r2] || c < dp[j][r2].c) dp[j][r2] = {c, de: [i, r], piece};
    };
    essai(i + 1, r, 3, {u: true});
    for (let len = 1; len <= MAXF && i + len <= n; len++)
      for (const rc of FORMES.get(w.slice(i, i + len)) || [])
        if (RANG[rc.k] >= r) essai(i + len, RANG[rc.k], 1, {rc});
  }
  let fin = null;
  for (let r = 0; r < 3; r++) if (dp[n][r] && (!fin || dp[n][r].c < dp[n][fin].c)) fin = r;
  const out = [];
  for (let i = n, r = fin; i > 0;) {
    const s = dp[i][r], [i0, r0] = s.de, last = out[0];
    if (s.piece.u && last && last.u) last.a = i0;                  // lettres inconnues voisines : on les regroupe
    else out.unshift({...s.piece, a: i0, b: i});
    i = i0; r = r0;
  }
  return out;
}
function analyser(brut) {
  const chars = [...brut.trim()], idx = [];
  let w = "";
  chars.forEach((c, i) => { for (const x of norm(c).replace(/[^a-z]/g, "")) { w += x; idx.push(i); } });
  if (w.length < 3) return null;
  const txt = (a, b) => chars.slice(idx[a], b < w.length ? idx[b] : chars.length).join("").replace(/[^\p{L}]/gu, "");
  const morceaux = decouper(w).map(p => {
    const t = txt(p.a, p.b), lv = p.rc && p.rc.k === "r" && !p.rc.base.includes(w.slice(p.a, p.b)) ? t.slice(-1) : "";
    return {...p, t: lv ? t.slice(0, -1) : t, lv};
  });
  const connu = morceaux.reduce((s, p) => s + (p.rc ? p.b - p.a : 0), 0);
  return {morceaux, taux: connu / w.length, complet: morceaux.every(p => p.rc)};
}

// ---------------------------------------------------------------- affichage
const cle = s => norm(s).replace(/[^a-z0-9]/g, "");
function decoderMot(mot) {
  mot = mot.trim();
  $("#dq").value = mot;
  const zone = $("#dres");
  zone.replaceChildren();
  if (!mot) return;
  const res = analyser(mot);
  if (!res || res.taux < 0.6) {
    zone.append(h("p", {class: "empty"}, "Je n’ai pas reconnu de morceaux grecs ou latins dans « " + mot + " ». Essayez un terme médical plus long ou l’un des exemples ci-dessus."));
    return;
  }
  const racines = res.morceaux.filter(p => p.rc);
  const fiche = fiches.find(f => cle(f.terme) === cle(mot));
  zone.append(h("div", {class: "dcard"},
    h("p", {class: "dmot"}, res.morceaux.map((p, k) => [k > 0 && h("span", {class: "dot"}, "·"),
      h("span", {class: p.rc ? null : "inc"}, p.rc ? p.t : p.t || "?"), p.lv && h("span", {class: "lv"}, p.lv)])),
    h("div", {}, racines.map(p => h("div", {class: "drow"}, h("b", {}, p.rc.label), h("span", {}, p.rc.sens), h("small", {}, "ex. " + p.rc.ex)))),
    h("div", {class: "mam"}, h("small", {}, "MOT À MOT"), h("p", {}, res.morceaux.map(p => p.rc ? p.rc.sens.split(",")[0] : "?").join(" + "))),
    !res.complet && h("p", {class: "dnote"}, "Décodage partiel : la partie en rouge n’a pas été reconnue."),
    h("p", {class: "dnote"}, "Le sens d’origine aide à retenir un mot, mais seul le sens médical complet fait foi."),
    fiche && h("button", {class: "btn", type: "button", onclick: () => openFiche(fiche.id)}, "Voir la fiche « " + fiche.terme + " »")));
}
const EXEMPLES = ["gastro-entérite", "cardiomégalie", "hypertension", "appendicectomie", "polyurie", "anémie", "hémorragie", "tachycardie", "néphrologie", "arthrose"];
$("#dex").replaceChildren(...EXEMPLES.map(m => h("button", {class: "chip", type: "button", onclick: () => decoderMot(m)}, m)));
$("#df").addEventListener("submit", e => { e.preventDefault(); decoderMot($("#dq").value); });

let filtre = "tous";
const NOMS = {p: "Préfixes", r: "Radicaux", s: "Suffixes"};
function listerRacines() {
  $("#dfilt").replaceChildren(...[["tous", "Tous"], ...Object.entries(NOMS)].map(([k, l]) =>
    h("button", {class: "chip" + (filtre === k ? " on" : ""), type: "button", onclick: () => { filtre = k; listerRacines(); }},
      l + " ", h("small", {class: "stat"}, String(k === "tous" ? RACINES.length : RACINES.filter(r => r.k === k).length)))));
  $("#dliste").replaceChildren(...RACINES.filter(r => filtre === "tous" || r.k === filtre).map(r =>
    h("div", {class: "card"}, h("strong", {}, r.label), h("span", {class: "snip"}, r.sens),
      h("button", {class: "ex", type: "button", onclick: () => { decoderMot(r.ex); window.scrollTo(0, 0); }}, "ex. " + r.ex))));
}
listerRacines();

// ---------------------------------------------------------------- navigation Dictionnaire / Décoder / Bio
const VUES = {dico: ["#vue-dico", "#n-dico"], decoder: ["#vue-decoder", "#n-dec"], bio: ["#vue-bio", "#n-bio"], reflexe: ["#vue-reflexe", "#n-reflexe"]};
let vueCourante = "dico";
function vue(nom) {
  vueCourante = nom;
  for (const [k, [v, n]] of Object.entries(VUES)) {
    const sv = $(v), sn = $(n);
    if (sv) sv.hidden = k !== nom;
    if (sn) { sn.classList.toggle("on", k === nom); sn.setAttribute("aria-current", k === nom ? "page" : "false"); }
  }
  document.body.classList.toggle("reflexe", nom === "reflexe");      // fond orange dans la rubrique Réflexe naturel
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = nom === "reflexe" ? "#8a3b00" : "#075e65";
}
for (const [k, [, n]] of Object.entries(VUES)) {
  const el = $(n);
  if (el) el.onclick = e => {
    e.preventDefault(); vue(k); dialOuvrir(false);
    history.replaceState(null, "", k === "dico" ? location.pathname + location.search : "#" + k);
    window.scrollTo(0, 0);
  };
}
$("#fiche").addEventListener("close", () => { if (vueCourante !== "dico") history.replaceState(null, "", "#" + vueCourante); });
if (VUES[location.hash.slice(1)]) vue(location.hash.slice(1));

// Menu rond « + » en bas à gauche : s'ouvre au toucher, se referme après un choix, un clic ailleurs ou la touche Échap
const dial = $("#dial"), dialBtn = $("#dial-btn");
function dialOuvrir(ouvrir) {
  if (!dial) return;
  dial.classList.toggle("ouvert", ouvrir);
  dialBtn.setAttribute("aria-expanded", String(ouvrir));
  dialBtn.setAttribute("aria-label", ouvrir ? "Fermer le menu des rubriques" : "Ouvrir le menu des rubriques");
}
if (dialBtn) {
  dialBtn.onclick = () => dialOuvrir(!dial.classList.contains("ouvert"));
  document.addEventListener("click", e => { if (!dial.contains(e.target)) dialOuvrir(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") dialOuvrir(false); });
}
