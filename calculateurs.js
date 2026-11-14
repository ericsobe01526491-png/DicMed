"use strict";
// Calculateurs médicaux DicMed : tous les calculs se font dans le navigateur (aucune donnée envoyée ni enregistrée).
// Utilise $ et h définis dans app.js. Chaque calculateur est décrit par un objet : champs, calcul, formule, précautions, références.
(function () {
  const JOUR = 86400000, LB = 0.45359237;
  const REDUIT = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COUL = {bleu: "#6db3ff", vert: "#18c8c4", orange: "#ffa94d", rouge: "#ff6b6b"};
  const fmt = (x, d = 1) => new Intl.NumberFormat("fr-FR", {minimumFractionDigits: d, maximumFractionDigits: d}).format(x);
  const num = s => { const t = String(s == null ? "" : s).trim().replace(",", "."); return /^\d+(\.\d+)?$/.test(t) ? parseFloat(t) : NaN; };
  const msDate = s => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); if (!m) return NaN;
    const d = Date.UTC(+m[1], +m[2] - 1, +m[3]), o = new Date(d);
    return o.getUTCMonth() === +m[2] - 1 && o.getUTCDate() === +m[3] ? d : NaN;
  };
  const jour = ms => new Date(ms).toLocaleDateString("fr-FR", {weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC"});
  const aujourdhui = () => { const n = new Date(); return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") + "-" + String(n.getDate()).padStart(2, "0"); };
  const NS = "http://www.w3.org/2000/svg";
  const s = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.flat().forEach(x => e.append(x)); return e; };

  // ------------------------------------------------------------ graphiques (SVG et CSS, légèrement animés)
  function graphIMC({m, poids, unite}) {
    const W = 320, H = 200, g = 14, d = 14, haut = 34, bas = 46, base = H - bas;
    const w0 = 15 * m * m, w1 = 42 * m * m;
    const X = w => g + (Math.min(w1, Math.max(w0, w)) - w0) / (w1 - w0) * (W - g - d);
    const Y = b => haut + (1 - (Math.min(42, Math.max(15, b)) - 15) / 27) * (base - haut);
    const aff = w => unite === "lb" ? Math.round(w / LB) + " lb" : Math.round(w) + " kg";
    const svg = s("svg", {viewBox: "0 0 " + W + " " + H, class: "graph graph-imc", role: "img", "aria-label": "Position du poids sur l’échelle de corpulence"});
    [[15, 18.5, COUL.bleu, "Maigreur"], [18.5, 25, COUL.vert, "Normal"], [25, 30, COUL.orange, "Surpoids"], [30, 42, COUL.rouge, "Obésité"]].forEach(([a, b, col, nom], i) => {
      const xa = X(a * m * m), xb = X(b * m * m), ya = Y(a), yb = Y(b);
      svg.append(s("path", {d: "M" + xa + " " + base + " L" + xa + " " + ya + " L" + xb + " " + yb + " L" + xb + " " + base + " Z", fill: col, opacity: ".16"}),
        s("path", {d: "M" + xa + " " + ya + " L" + xb + " " + yb, stroke: col, "stroke-width": 4, "stroke-linecap": "round", fill: "none", pathLength: 1, class: "trait", style: "animation-delay:" + (0.1 + i * 0.18) + "s"}),
        s("text", {x: (xa + xb) / 2, y: haut - 14, "text-anchor": "middle", class: "z-nom", fill: col}, nom));
    });
    [18.5, 25, 30].forEach(b => { const x = X(b * m * m); svg.append(s("line", {x1: x, x2: x, y1: haut - 4, y2: base, class: "z-ligne"}), s("text", {x, y: base + 14, "text-anchor": "middle", class: "z-kg"}, aff(b * m * m))); });
    const x = X(poids), y = Y(poids / (m * m));
    svg.append(s("line", {x1: x, x2: x, y1: y, y2: base, class: "mq-ligne"}),
      s("g", {class: "pt"}, s("circle", {cx: x, cy: y, r: 11, class: "anneau"}), s("circle", {cx: x, cy: y, r: 6, class: "mq"}),
        s("rect", {x: x - 30, y: base + 22, width: 60, height: 18, rx: 9, class: "mq-pastille"}), s("text", {x, y: base + 35, "text-anchor": "middle", class: "mq-txt"}, aff(poids))));
    return svg;
  }
  function jauge({min, max, zones, valeur, dec = 0, vers}) {
    const pct = v => Math.min(100, Math.max(0, (v - min) / (max - min) * 100));
    const marq = h("span", {class: "marqueur", "aria-hidden": "true"});
    const barre = h("div", {class: "jauge-barre"}, zones.map(z => h("span", {class: "seg", style: "left:" + pct(z[0]) + "%;width:" + (pct(z[1]) - pct(z[0])) + "%;background:" + z[2]})), marq);
    const reperes = h("div", {class: "jauge-reperes"}, zones.slice(1).map(z => h("span", {style: "left:" + pct(z[0]) + "%"}, fmt(z[0], dec))));
    const legende = h("div", {class: "jauge-legende"}, zones.map(z => h("span", {}, h("i", {class: "puce", style: "background:" + z[2]}), z[3])));
    requestAnimationFrame(() => requestAnimationFrame(() => { marq.style.left = pct(valeur) + "%"; }));
    return h("div", {class: "jauge", role: "img", "aria-label": "Position du résultat sur l’échelle"}, barre, reperes, legende);
  }
  function goutteAnim(exact) {
    const sec = 60 / exact, dur = Math.min(6, Math.max(0.35, sec));
    return h("div", {class: "perfuseur", style: "--duree:" + dur + "s"}, h("div", {class: "chambre", "aria-hidden": "true"}, h("span", {class: "g"}), h("span", {class: "niveau"})),
      h("p", {class: "legende"}, "Une goutte toutes les " + fmt(sec, 1) + " s" + (sec < 0.35 ? " (animation ralentie)" : "")));
  }
  function barresBilan(A, P) {
    const max = Math.max(A, P, 1), cibles = [];
    const ligne = (nom, val, cl) => { const i = h("i", {class: cl}); cibles.push([i, 100 * val / max]); return h("div", {class: "bb"}, h("span", {}, nom), h("div", {class: "bb-piste"}, i), h("b", {}, fmt(val, 0) + " ml")); };
    const bloc = h("div", {class: "barres-bilan"}, ligne("Apports", A, "app"), ligne("Pertes", P, "per"));
    requestAnimationFrame(() => requestAnimationFrame(() => cibles.forEach(([i, w]) => { i.style.width = w + "%"; })));
    return bloc;
  }
  function animerNombre(el, r) {
    if (REDUIT || r.nombre === undefined) return;
    const plus = r.principal.startsWith("+"), t0 = performance.now(), D = 800;
    const etape = t => { const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3); if (k < 1) { el.textContent = (plus ? "+" : "") + fmt(r.nombre * e, r.dec); requestAnimationFrame(etape); } else el.textContent = r.principal; };
    requestAnimationFrame(etape);
  }

  // ------------------------------------------------------------ définition des calculateurs
  const CATEGORIES = [["nutrition", "Nutrition et anthropométrie"], ["cardio", "Cardiologie"], ["soins", "Soins infirmiers"],
    ["obstetrique", "Gynécologie et obstétrique"], ["biologie", "Biologie et néphrologie"], ["conversions", "Calculs et conversions médicales"]];
  const AVERT = "Outil d’information : le résultat n’est ni un diagnostic ni une prescription. Il ne remplace pas l’avis d’un professionnel de santé.";
  const POIDS = {id: "poids", label: "Poids", unite: "kg", min: 2, max: 400, pas: 1, depart: 70, aide: "Ex. : 70"};
  const TAILLE = {id: "taille", label: "Taille", unite: "cm", min: 50, max: 250, pas: 1, depart: 170, aide: "Ex. : 175"};
  const PAS = {id: "pas", label: "Pression systolique (PAS)", unite: "mmHg", min: 50, max: 300, pas: 1, depart: 120, aide: "Ex. : 120"};
  const PAD = {id: "pad", label: "Pression diastolique (PAD)", unite: "mmHg", min: 20, max: 200, pas: 1, depart: 80, aide: "Ex. : 80"};
  const verifPA = v => v.pas <= v.pad ? "La pression systolique doit être supérieure à la pression diastolique." : null;
  const metrique = v => v.systeme !== "imperial", imperial = v => v.systeme === "imperial";

  const CALCULATEURS = [
    {id: "imc", cat: "nutrition", nom: "Indice de masse corporelle (IMC)", titrePanneau: "Calculez votre indice de masse corporelle",
      def: "L’IMC compare le poids à la taille pour situer la corpulence d’un adulte.",
      utilite: "Premier repère du statut pondéral (maigreur, surpoids, obésité) et du suivi d’un poids dans le temps.",
      champs: [{id: "systeme", label: "Système d’unités", type: "bascule", options: [["metrique", "Métrique (kg, cm)"], ["imperial", "Impérial (lb, pieds)"]], defaut: "metrique"},
        {...POIDS, visible: metrique}, {...TAILLE, visible: metrique},
        {id: "poids_lb", label: "Poids", unite: "lb", min: 4, max: 880, pas: 1, depart: 150, aide: "Ex. : 154", visible: imperial},
        {id: "taille_ft", label: "Taille : pieds", unite: "ft", min: 1, max: 8, pas: 1, depart: 5, aide: "Ex. : 5", visible: imperial},
        {id: "taille_in", label: "Taille : pouces", unite: "in", min: 0, max: 11.9, pas: 1, depart: 6, aide: "Ex. : 9", visible: imperial},
        {id: "age", label: "Âge (facultatif)", unite: "ans", min: 2, max: 120, pas: 1, depart: 30, optionnel: true, aide: "Ex. : 30"}],
      verif: v => {
        const kg = imperial(v) ? v.poids_lb * LB : v.poids, cm = imperial(v) ? (v.taille_ft * 12 + v.taille_in) * 2.54 : v.taille;
        return kg < 2 || kg > 400 ? "Le poids doit correspondre à une valeur comprise entre 2 et 400 kg." : (cm < 50 || cm > 250 ? "La taille doit correspondre à une valeur comprise entre 50 et 250 cm." : null);
      },
      calc: v => {
        const imp = imperial(v), kg = imp ? v.poids_lb * LB : v.poids, cm = imp ? (v.taille_ft * 12 + v.taille_in) * 2.54 : v.taille, m = cm / 100;
        const imc = kg / (m * m), mineur = v.age != null && v.age < 18;
        let titre, niveau;
        if (mineur) { titre = "Seuils adultes non applicables (moins de 18 ans)"; niveau = "info"; }
        else if (imc < 16) { titre = "Insuffisance pondérale : maigreur sévère"; niveau = "alerte"; }
        else if (imc < 17) { titre = "Insuffisance pondérale : maigreur modérée"; niveau = "vigilance"; }
        else if (imc < 18.5) { titre = "Insuffisance pondérale : maigreur légère"; niveau = "vigilance"; }
        else if (imc < 25) { titre = "Corpulence normale"; niveau = "ok"; }
        else if (imc < 30) { titre = "Surpoids"; niveau = "vigilance"; }
        else if (imc < 35) { titre = "Obésité de classe I (modérée)"; niveau = "vigilance"; }
        else if (imc < 40) { titre = "Obésité de classe II (sévère)"; niveau = "alerte"; }
        else { titre = "Obésité de classe III (massive)"; niveau = "alerte"; }
        const aff = x => imp ? fmt(x / LB, 0) + " lb" : fmt(x, 0) + " kg";
        const lignes = [["Valeur exacte", fmt(imc, 2) + " kg/m²"]];
        if (!mineur) lignes.push(["Poids pour un IMC normal (18,5 à 24,9) à votre taille", aff(18.5 * m * m) + " à " + aff(24.9 * m * m)]);
        return {principal: fmt(imc), nombre: imc, dec: 1, unite: "kg/m²", titre, niveau, lignes,
          explication: mineur ? "Chez l’enfant et l’adolescent, l’IMC s’interprète sur les courbes de croissance (percentiles) du carnet de santé selon l’âge et le sexe, pas avec les seuils de l’adulte. Demandez conseil à un professionnel de santé."
            : "Classes de l’OMS chez l’adulte : moins de 18,5 insuffisance pondérale ; 18,5 à 24,9 normale ; 25 à 29,9 surpoids ; 30 à 34,9 obésité de classe I ; 35 à 39,9 classe II ; 40 et plus classe III.",
          graphique: mineur ? null : () => graphIMC({m, poids: kg, unite: imp ? "lb" : "kg"})};
      },
      formule: "IMC = poids (kg) ÷ taille² (m²), la taille étant convertie de cm en m (1 lb = 0,4536 kg ; 1 pouce = 2,54 cm).",
      precautions: ["Les seuils ci-dessus concernent les adultes. Chez l’enfant et l’adolescent, l’IMC s’interprète sur les courbes de croissance (percentiles), pas avec ces seuils.",
        "L’IMC ne distingue pas la masse musculaire de la masse grasse et peut être trompeur chez les sportifs, les personnes âgées ou pendant la grossesse. Il ne s’applique pas aux femmes enceintes.", AVERT],
      refs: ["Organisation mondiale de la santé (OMS) : classification de l’IMC chez l’adulte.", "Haute Autorité de santé (HAS) : surpoids et obésité de l’adulte."]},
    {id: "bsa", cat: "nutrition", nom: "Surface corporelle (Mosteller)",
      def: "La surface corporelle est l’aire de la peau, estimée à partir du poids et de la taille.",
      utilite: "Mesure utilisée en médecine pour normaliser certains paramètres physiologiques (par exemple le débit cardiaque).",
      champs: [POIDS, TAILLE],
      calc: v => {
        const a = Math.sqrt(v.taille * v.poids / 3600);
        return {principal: fmt(a, 2), nombre: a, dec: 2, unite: "m²", titre: "Surface corporelle estimée", niveau: "info", lignes: [],
          explication: "À titre de repère, la surface corporelle moyenne d’un adulte est d’environ 1,7 à 1,9 m². Ce calculateur ne calcule aucune dose de médicament."};
      },
      formule: "Formule de Mosteller : surface (m²) = √[ taille (cm) × poids (kg) ÷ 3600 ].",
      precautions: ["C’est une estimation : d’autres formules existent (Du Bois) et donnent des valeurs légèrement différentes.", AVERT],
      refs: ["Mosteller RD. Simplified calculation of body-surface area. N Engl J Med 1987 ; 317 : 1098."]},
    {id: "whtr", cat: "nutrition", nom: "Rapport tour de taille / taille",
      def: "Ce rapport compare le tour de taille à la taille : il reflète la graisse accumulée autour de l’abdomen.",
      utilite: "Repère simple du risque cardiométabolique, complémentaire de l’IMC.",
      champs: [{id: "tour", label: "Tour de taille", unite: "cm", min: 30, max: 250, pas: 1, depart: 80, aide: "Ex. : 82"}, TAILLE],
      calc: v => {
        const r = v.tour / v.taille;
        let titre, niveau;
        if (r < 0.4) { titre = "Rapport bas"; niveau = "info"; }
        else if (r < 0.5) { titre = "Zone de faible risque"; niveau = "ok"; }
        else if (r < 0.6) { titre = "Risque cardiométabolique accru"; niveau = "vigilance"; }
        else { titre = "Risque cardiométabolique élevé"; niveau = "alerte"; }
        return {principal: fmt(r, 2), nombre: r, dec: 2, unite: "", titre, niveau, lignes: [],
          explication: "Repère courant : garder son tour de taille en dessous de la moitié de sa taille (rapport inférieur à 0,50). Interprétation indicative : moins de 0,40 bas ; 0,40 à 0,49 faible risque ; 0,50 à 0,59 risque accru ; 0,60 et plus risque élevé.",
          graphique: () => jauge({min: 0.3, max: 0.8, dec: 2, valeur: r, zones: [[0.3, 0.4, COUL.bleu, "Bas"], [0.4, 0.5, COUL.vert, "Faible risque"], [0.5, 0.6, COUL.orange, "Risque accru"], [0.6, 0.8, COUL.rouge, "Risque élevé"]]})};
      },
      formule: "Rapport = tour de taille (cm) ÷ taille (cm).",
      precautions: ["Interprétation indicative chez l’adulte. Elle ne s’applique pas directement aux enfants, ni pendant la grossesse.", "Le tour de taille doit être mesuré à mi-distance entre la dernière côte et la crête iliaque.", AVERT],
      refs: ["Ashwell M, Hsieh SD. Six reasons why the waist-to-height ratio is a rapid and effective global indicator for health risks of obesity. Int J Food Sci Nutr 2005.", "NICE : recommandations sur le surpoids et l’obésité (rapport tour de taille / taille)."]},

    {id: "pam", cat: "cardio", nom: "Pression artérielle moyenne (PAM)",
      def: "La PAM est la pression moyenne qui pousse le sang dans les artères pendant tout le cycle cardiaque.",
      utilite: "Elle reflète la pression de perfusion des organes ; elle est surveillée surtout en soins critiques.",
      champs: [PAS, PAD], verif: verifPA,
      calc: v => {
        const p = (v.pas + 2 * v.pad) / 3;
        let titre, niveau;
        if (p < 65) { titre = "PAM basse"; niveau = "alerte"; }
        else if (p < 70) { titre = "À la limite basse"; niveau = "vigilance"; }
        else if (p <= 100) { titre = "Dans la plage habituelle"; niveau = "ok"; }
        else { titre = "PAM élevée"; niveau = "vigilance"; }
        return {principal: fmt(p), nombre: p, dec: 1, unite: "mmHg", titre, niveau, lignes: [],
          explication: "Plage habituelle chez l’adulte au repos : environ 70 à 100 mmHg. Une PAM inférieure à 65 mmHg peut compromettre la perfusion des organes : en cas de symptômes (malaise, confusion, froideur, essoufflement), demandez un avis médical urgent.",
          graphique: () => jauge({min: 40, max: 140, valeur: p, zones: [[40, 65, COUL.rouge, "Basse"], [65, 70, COUL.orange, "Limite"], [70, 100, COUL.vert, "Habituelle"], [100, 140, COUL.orange, "Élevée"]]})};
      },
      formule: "PAM ≈ (PAS + 2 × PAD) ÷ 3 (approximation).",
      precautions: ["Cette formule est une approximation : elle suppose une fréquence cardiaque normale. Elle devient moins fiable en cas de tachycardie ou de rythme irrégulier.", "Seule une mesure invasive donne la PAM réelle.", AVERT],
      refs: ["Formule d’approximation de la PAM, enseignée en physiologie cardiovasculaire.", "Surviving Sepsis Campaign : objectif initial de PAM ≥ 65 mmHg en réanimation."]},
    {id: "pp", cat: "cardio", nom: "Pression pulsée",
      def: "La pression pulsée est la différence entre la pression systolique et la pression diastolique.",
      utilite: "Elle reflète la force d’éjection du cœur et la rigidité des artères.",
      champs: [PAS, PAD], verif: verifPA,
      calc: v => {
        const d = v.pas - v.pad, prop = 100 * d / v.pas;
        let titre, niveau;
        if (d < 25 || prop < 25) { titre = "Pression pulsée étroite"; niveau = "alerte"; }
        else if (d < 30) { titre = "Plutôt basse"; niveau = "vigilance"; }
        else if (d <= 50) { titre = "Habituelle"; niveau = "ok"; }
        else if (d < 60) { titre = "Légèrement élevée"; niveau = "vigilance"; }
        else { titre = "Élevée"; niveau = "alerte"; }
        return {principal: fmt(d, 0), nombre: d, dec: 0, unite: "mmHg", titre, niveau, lignes: [["Part de la pression systolique", fmt(prop, 0) + " %"]],
          explication: "Valeur habituelle : environ 30 à 50 mmHg. Une pression pulsée élevée (60 mmHg et plus) peut traduire une rigidité des artères, fréquente avec l’âge. Une pression pulsée très étroite (moins de 25 mmHg, ou moins de 25 % de la systolique) peut évoquer un faible débit cardiaque et justifie un avis médical rapide.",
          graphique: () => jauge({min: 0, max: 100, valeur: d, zones: [[0, 25, COUL.rouge, "Étroite"], [25, 30, COUL.orange, "Basse"], [30, 50, COUL.vert, "Habituelle"], [50, 60, COUL.orange, "Élevée"], [60, 100, COUL.rouge, "Très élevée"]]})};
      },
      formule: "Pression pulsée = PAS − PAD.",
      precautions: ["Une seule mesure ne suffit pas : l’interprétation repose sur des mesures répétées et sur le contexte clinique.", AVERT],
      refs: ["Recommandations ESC/ESH sur la prise en charge de l’hypertension artérielle (pression pulsée comme marqueur de risque)."]},

    {id: "gouttes", cat: "soins", nom: "Débit de perfusion en gouttes/minute",
      def: "Ce calcul donne le nombre de gouttes à compter par minute pour perfuser un volume sur une durée donnée avec une perfusion par gravité.",
      utilite: "Régler le régulateur de débit d’une perfusion sans pompe.",
      champs: [{id: "volume", label: "Volume à perfuser", unite: "ml", min: 1, max: 10000, pas: 50, depart: 500, aide: "Ex. : 500"},
        {id: "duree", label: "Durée", min: 1, max: 4320, pas: 1, depart: 4, aide: "Ex. : 4"},
        {id: "unite", label: "Unité de la durée", type: "choix", options: [["h", "heures"], ["min", "minutes"]], defaut: "h"},
        {id: "facteur", label: "Facteur de goutte du dispositif", type: "choix", defaut: "20",
          options: [["20", "20 gouttes/ml (perfuseur standard)"], ["15", "15 gouttes/ml"], ["10", "10 gouttes/ml (transfusion)"], ["60", "60 gouttes/ml (microperfuseur)"], ["autre", "Autre valeur…"]]},
        {id: "facteurAutre", label: "Facteur de goutte (autre)", unite: "gouttes/ml", min: 1, max: 100, pas: 1, depart: 20, visible: v => v.facteur === "autre", aide: "Lisez-le sur l’emballage"}],
      verif: v => { const m = v.unite === "h" ? v.duree * 60 : v.duree; return m < 1 ? "La durée doit être d’au moins 1 minute." : (v.unite === "h" && v.duree > 72 ? "La durée ne peut pas dépasser 72 heures." : null); },
      calc: v => {
        const f = v.facteur === "autre" ? v.facteurAutre : parseFloat(v.facteur);
        const min = v.unite === "h" ? v.duree * 60 : v.duree;
        const exact = v.volume * f / min, arrondi = Math.round(exact), mlh = v.volume / (min / 60);
        const alertes = ["Vérifiez le facteur de goutte inscrit sur l’emballage du dispositif et le débit prescrit. Un double contrôle par un second professionnel est recommandé.",
          "Une perfusion par gravité reste approximative (hauteur du flacon, viscosité, position du bras) : surveillez régulièrement le débit réel.", "Ce résultat n’est pas une prescription."];
        if (arrondi < 1) alertes.unshift("Le débit est inférieur à 1 goutte/minute : utilisez une pompe ou un régulateur de débit adapté.");
        else if (Math.abs(arrondi - exact) / exact > 0.03) alertes.unshift("Le débit est faible : l’arrondi à l’entier le plus proche modifie sensiblement le débit réel (écart de " + fmt(100 * Math.abs(arrondi - exact) / exact, 0) + " %). Préférez une pompe si possible.");
        return {principal: fmt(arrondi, 0), nombre: arrondi, dec: 0, unite: "gouttes/min", titre: "Débit à régler", niveau: "info",
          lignes: [["Volume", fmt(v.volume, 0) + " ml"], ["Durée", fmt(min, 0) + " min"], ["Facteur de goutte", fmt(f, 0) + " gouttes/ml"], ["Valeur exacte avant arrondi", fmt(exact, 2) + " gouttes/min"],
            ["Équivalent", fmt(mlh, 1) + " ml/h"], ["Rythme", "1 goutte toutes les " + fmt(60 / exact, 1) + " s"]],
          explication: "Le résultat est arrondi à l’entier le plus proche, car on ne peut compter que des gouttes entières.", alertes, graphique: () => goutteAnim(exact)};
      },
      formule: "Débit (gouttes/min) = volume (ml) × facteur de goutte (gouttes/ml) ÷ durée (min).",
      precautions: ["Avec un microperfuseur de 60 gouttes/ml, le nombre de gouttes par minute est égal au débit en ml/h.", "Ne jamais utiliser ce résultat à la place d’une prescription ou d’un protocole de service.", AVERT],
      refs: ["Calcul de débit de perfusion : formule standard enseignée en soins infirmiers."]},
    {id: "mlh", cat: "soins", nom: "Débit de perfusion en ml/heure",
      def: "Ce calcul donne le débit en millilitres par heure pour perfuser un volume sur une durée donnée.",
      utilite: "Programmer une pompe ou un pousse-seringue électrique.",
      champs: [{id: "volume", label: "Volume", unite: "ml", min: 1, max: 20000, pas: 50, depart: 500, aide: "Ex. : 1000"}, {id: "heures", label: "Durée", unite: "heures", min: 0.1, max: 168, pas: 0.5, depart: 8, aide: "Ex. : 8"}],
      calc: v => {
        const d = v.volume / v.heures;
        return {principal: fmt(d, 1), nombre: d, dec: 1, unite: "ml/h", titre: "Débit à programmer", niveau: "info",
          lignes: [["Volume", fmt(v.volume, 0) + " ml"], ["Durée", fmt(v.heures, 1) + " h"], ["Équivalent", fmt(d / 60, 2) + " ml/min"]],
          explication: "Arrondissez selon les possibilités de la pompe utilisée (certaines acceptent une décimale).",
          alertes: ["Vérifiez le débit prescrit et la programmation de la pompe. Un double contrôle est recommandé.", "Ce résultat n’est pas une prescription."]};
      },
      formule: "Débit (ml/h) = volume (ml) ÷ durée (h).",
      precautions: ["Certains médicaments imposent des débits maximum : respectez toujours la prescription et le protocole du service.", AVERT],
      refs: ["Calcul de débit de perfusion : formule standard enseignée en soins infirmiers."]},
    {id: "bilan", cat: "soins", nom: "Bilan hydrique",
      def: "Le bilan hydrique compare tout ce que le patient a reçu (apports) à tout ce qu’il a éliminé (pertes) sur une période.",
      utilite: "Surveiller l’équilibre en eau, notamment en cas de perfusion, de diurèse ou de déshydratation.",
      champs: [{id: "apports", label: "Apports", type: "lignes", sugg: ["Boissons", "Alimentation", "Perfusion", "Médicaments IV", "Produits sanguins"]},
        {id: "pertes", label: "Pertes", type: "lignes", sugg: ["Urines", "Vomissements", "Selles liquides", "Drain", "Aspiration"]}],
      calc: v => {
        const t = l => l.reduce((a, x) => a + x.ml, 0), A = t(v.apports), P = t(v.pertes), b = A - P;
        let titre, niveau;
        if (Math.abs(b) <= 50) { titre = "Bilan équilibré"; niveau = "ok"; } else if (b > 0) { titre = "Bilan positif"; niveau = "vigilance"; } else { titre = "Bilan négatif"; niveau = "vigilance"; }
        return {principal: (b > 0 ? "+" : "") + fmt(b, 0), nombre: b, dec: 0, unite: "ml", titre, niveau, lignes: [["Total des apports", fmt(A, 0) + " ml"], ["Total des pertes", fmt(P, 0) + " ml"]],
          explication: "Un bilan positif signifie que le patient a reçu plus qu’il n’a éliminé ; un bilan négatif, l’inverse. Par convention d’affichage, un écart de 50 ml ou moins est présenté comme équilibré.",
          alertes: ["Les pertes insensibles (respiration, transpiration, de l’ordre de 500 à 800 ml par jour chez l’adulte) ne sont pas comptées ici, ni la fièvre ni les pertes digestives non mesurées."],
          graphique: () => barresBilan(A, P)};
      },
      formule: "Bilan = total des apports (ml) − total des pertes (ml).",
      precautions: ["Un bilan doit être interprété avec le poids, la clinique et la biologie ; seul le médecin conclut.", AVERT],
      refs: ["Surveillance du bilan entrées-sorties : pratique courante en soins infirmiers et en réanimation."]},

    {id: "ga", cat: "obstetrique", nom: "Âge gestationnel",
      def: "L’âge gestationnel est la durée écoulée depuis le premier jour des dernières règles, exprimée en semaines d’aménorrhée (SA) et en jours.",
      utilite: "Situer le stade de la grossesse et organiser son suivi.",
      champs: [{id: "ddr", label: "Premier jour des dernières règles", type: "date"}, {id: "ref", label: "Date de référence du calcul", type: "date", defaut: aujourdhui}],
      verif: v => {
        const j = (v.ref - v.ddr) / JOUR;
        return j < 0 ? "La date des dernières règles doit être antérieure ou égale à la date de référence." : (j > 308 ? "Cette date correspond à plus de 44 semaines d’aménorrhée : vérifiez les dates saisies." : null);
      },
      calc: v => {
        const j = Math.round((v.ref - v.ddr) / JOUR), sa = Math.floor(j / 7), r = j % 7;
        const tri = sa < 14 ? "1er trimestre" : sa < 28 ? "2e trimestre" : "3e trimestre";
        const alertes = ["La datation repose sur une date de dernières règles fiable et un cycle de 28 jours : l’échographie de datation du 1er trimestre peut la corriger."];
        if (sa >= 42) alertes.unshift("Au-delà de 42 SA : situation à discuter sans attendre avec la sage-femme ou le médecin.");
        return {principal: sa + " SA + " + r + " j", unite: "", titre: tri, niveau: sa >= 42 ? "alerte" : "info",
          lignes: [["Jours d’aménorrhée", j + " jours"], ["Semaines de grossesse révolues (depuis la conception)", Math.max(0, sa - 2) + " semaines environ"], ["Date de référence", jour(v.ref)]],
          explication: "1 SA = 7 jours depuis le premier jour des dernières règles. Le 1er trimestre va jusqu’à 13 SA + 6 jours, le 2e jusqu’à 27 SA + 6 jours.", alertes,
          graphique: () => jauge({min: 0, max: 42, valeur: j / 7, zones: [[0, 14, "#9be9e6", "1er trimestre"], [14, 28, "#18c8c4", "2e trimestre"], [28, 42, "#0ea5b0", "3e trimestre"]]})};
      },
      formule: "Jours = date de référence − date des dernières règles ; SA = quotient de ces jours par 7, le reste donnant les jours.",
      precautions: ["Le calcul suppose une datation fiable. Si l’échographie du 1er trimestre donne une date différente, c’est elle qui fait foi pour le suivi.", AVERT],
      refs: ["Haute Autorité de santé (HAS) : suivi et orientation des femmes enceintes."]},
    {id: "dpa", cat: "obstetrique", nom: "Date probable d’accouchement (DPA)",
      def: "La DPA est la date estimée de l’accouchement, à 40 semaines d’aménorrhée.",
      utilite: "Planifier le suivi de la grossesse et les échéances importantes.",
      champs: [{id: "ddr", label: "Premier jour des dernières règles", type: "date"}, {id: "cycle", label: "Durée habituelle du cycle", unite: "jours", min: 20, max: 45, pas: 1, depart: 28, defaut: "28", aide: "28 si le cycle est régulier"}],
      verif: v => v.ddr > msDate(aujourdhui()) ? "La date des dernières règles ne peut pas être dans le futur." : null,
      calc: v => {
        const adj = v.cycle - 28, dpa = v.ddr + (280 + adj) * JOUR, t37 = v.ddr + (259 + adj) * JOUR, t41 = v.ddr + (293 + adj) * JOUR;
        return {principal: jour(dpa), unite: "", titre: "Date probable d’accouchement", niveau: "info",
          lignes: [["Cycle pris en compte", v.cycle + " jours (ajustement de " + (adj > 0 ? "+" : "") + adj + " j)"], ["Début du terme (37 SA)", jour(t37)], ["Fin du terme (41 SA + 6 j)", jour(t41)]],
          explication: "Il s’agit d’une estimation, pas d’une date certaine : la plupart des bébés naissent dans les jours ou les semaines autour de cette date.",
          alertes: ["Appelez votre maternité ou votre sage-femme dès les premiers signes de travail, de perte de liquide, de saignement ou de diminution des mouvements du bébé, quelle que soit la date."],
          graphique: () => { const auj = (msDate(aujourdhui()) - v.ddr) / JOUR / 7; return h("div", {}, jauge({min: 0, max: 42, valeur: auj, zones: [[0, 14, "#9be9e6", "1er trimestre"], [14, 28, "#18c8c4", "2e trimestre"], [28, 42, "#0ea5b0", "3e trimestre"]]}),
            h("p", {class: "legende"}, auj < 0 || auj > 42 ? "Aujourd’hui : hors de la période de grossesse calculée." : "Aujourd’hui : " + Math.floor(auj) + " SA + " + Math.round((auj - Math.floor(auj)) * 7) % 7 + " j")); }};
      },
      formule: "DPA = premier jour des dernières règles + 280 jours + (durée du cycle − 28 jours). C’est la règle de Naegele, ajustée à la durée du cycle.",
      precautions: ["Le calcul suppose une date de dernières règles fiable et une ovulation vers le milieu du cycle. La date fixée à l’échographie de datation peut remplacer celle-ci.", AVERT],
      refs: ["Baskett TF, Nagele F. Naegele’s rule: a reappraisal. BJOG 2000 ; 107 : 1433-1435.", "Haute Autorité de santé (HAS) : suivi et orientation des femmes enceintes."]}
  ];
  window.CALC_DICMED = CALCULATEURS;

  // ------------------------------------------------------------ interface
  const zone = $("#calc-zone");
  if (!zone) return;
  const NIVEAUX = {ok: "Dans la norme", info: "Information", vigilance: "À surveiller", alerte: "Vigilance"};
  const texteCopie = (c, valeurs, r) => ["DicMed — " + c.nom, ...c.champs.filter(f => f.type !== "lignes" && valeurs[f.id] !== undefined && valeurs[f.id] !== "" && !(f.visible && !f.visible(valeurs))).map(f => f.label + " : " + valeurs[f.id] + (f.unite ? " " + f.unite : "")),
    "Résultat : " + r.principal + (r.unite ? " " + r.unite : "") + " — " + r.titre, ...r.lignes.map(l => l[0] + " : " + l[1]), "Calculé le " + new Date().toLocaleDateString("fr-FR") + ". Ne remplace pas l’avis d’un professionnel de santé."].join("\n");
  async function copier(t, bouton) {
    try { await navigator.clipboard.writeText(t); }
    catch { const a = h("textarea", {style: "position:fixed;opacity:0"}); a.value = t; document.body.append(a); a.select(); try { document.execCommand("copy"); } catch {} a.remove(); }
    const avant = bouton.textContent; bouton.textContent = "Copié ✓"; setTimeout(() => { bouton.textContent = avant; }, 1600);
  }
  const saisie = n => String(Math.round(n * 10) / 10).replace(".", ",");
  function stepper(f, input) {
    const maj = sens => {
      let n = num(input.value);
      n = isNaN(n) ? (f.depart !== undefined ? f.depart : f.min) : n + sens * (f.pas || 1);
      input.value = saisie(Math.min(f.max, Math.max(f.min, n)));
      input.dispatchEvent(new Event("input", {bubbles: true}));
    };
    return h("div", {class: "stepper"}, h("button", {type: "button", class: "pm", "aria-label": "Diminuer : " + f.label, onclick: () => maj(-1)}, "−"), input,
      h("button", {type: "button", class: "pm", "aria-label": "Augmenter : " + f.label, onclick: () => maj(1)}, "+"));
  }
  function bascule(f) {
    let val = f.defaut || f.options[0][0];
    const maj = () => boutons.forEach(b => { b.classList.toggle("on", b.dataset.k === val); b.setAttribute("aria-pressed", String(b.dataset.k === val)); });
    const boutons = f.options.map(([k, lib]) => h("button", {type: "button", "data-k": k, onclick: () => { val = k; maj(); el.dispatchEvent(new Event("change", {bubbles: true})); }}, lib));
    const el = h("div", {class: "bascule", role: "group", "aria-label": f.label}, boutons);
    Object.defineProperty(el, "value", {get: () => val, set: k => { val = k; maj(); }});
    maj(); return el;
  }
  function catalogue() {
    zone.replaceChildren(...CATEGORIES.map(([cle, nom]) => {
      const liste = CALCULATEURS.filter(c => c.cat === cle);
      return h("section", {class: "calc-cat"}, h("h2", {}, nom),
        liste.length ? h("div", {class: "grid"}, liste.map(c => h("button", {class: "card", type: "button", onclick: () => detail(c)}, h("strong", {}, c.nom), h("span", {class: "snip"}, c.def))))
          : h("p", {class: "vide"}, "Calculateurs bientôt disponibles."));
    }));
    window.scrollTo(0, 0);
  }
  function ligneBilan(champ, ligne) {
    const lib = h("input", {type: "text", class: "lib", placeholder: "Libellé (facultatif)", list: "sugg-" + champ.id, autocomplete: "off", "aria-label": "Libellé"});
    const ml = h("input", {type: "text", class: "ml", inputmode: "decimal", placeholder: "ml", autocomplete: "off", "aria-label": "Volume en ml"});
    const sup = h("button", {type: "button", class: "ghost sup", "aria-label": "Supprimer la ligne", onclick: () => { if (ligne.parentNode.children.length > 1) ligne.remove(); else { lib.value = ""; ml.value = ""; } }}, "✕");
    ligne.append(lib, ml, sup); return ligne;
  }

  function detail(c) {
    const entrees = {}, enveloppes = {}, erreurs = {};
    const form = h("form", {class: "calc-form", novalidate: true, autocomplete: "off"});
    c.champs.forEach(f => {
      let ctrl, large = false;
      if (f.type === "lignes") {
        const liste = h("div", {class: "lignes"}); liste.append(ligneBilan(f, h("div", {class: "ligne-bilan"})));
        ctrl = h("div", {class: "bloc-lignes"}, liste, h("datalist", {id: "sugg-" + f.id}, f.sugg.map(x => h("option", {value: x}))),
          h("button", {type: "button", class: "ghost", onclick: () => liste.append(ligneBilan(f, h("div", {class: "ligne-bilan"})))}, "+ Ajouter une ligne"));
        ctrl.liste = liste; entrees[f.id] = ctrl; large = true;
      } else if (f.type === "bascule") { ctrl = bascule(f); entrees[f.id] = ctrl; large = true; }
      else if (f.type === "choix") { ctrl = h("select", {id: "c-" + f.id}, f.options.map(([val, lib]) => h("option", {value: val, selected: val === f.defaut}, lib))); entrees[f.id] = ctrl; large = true; }
      else if (f.type === "date") { ctrl = h("input", {id: "c-" + f.id, type: "date", value: typeof f.defaut === "function" ? f.defaut() : ""}); entrees[f.id] = ctrl; large = true; }
      else {
        const input = h("input", {id: "c-" + f.id, type: "text", inputmode: "decimal", placeholder: f.aide || "", value: f.defaut || "", autocomplete: "off", "aria-describedby": "e-" + f.id});
        entrees[f.id] = input; ctrl = stepper(f, input);
      }
      const err = h("p", {class: "erreur", id: "e-" + f.id, role: "alert"}); erreurs[f.id] = err;
      const etiquette = f.type === "bascule" ? null : f.type === "lignes" ? h("span", {class: "etiquette"}, f.label + " (ml)") : h("label", {for: "c-" + f.id}, f.label + (f.unite && !large ? " (" + f.unite + ")" : ""));
      enveloppes[f.id] = h("div", {class: "champ" + (large ? " large" : "")}, etiquette, ctrl, err);
      form.append(enveloppes[f.id]);
    });
    const brut = () => Object.fromEntries(c.champs.filter(f => f.type !== "lignes").map(f => [f.id, entrees[f.id].value]));
    const majVisibles = () => c.champs.forEach(f => { if (f.visible) enveloppes[f.id].hidden = !f.visible(brut()); });
    form.addEventListener("input", majVisibles); form.addEventListener("change", majVisibles); majVisibles();
    const globale = h("p", {class: "erreur global", role: "alert"});
    const resultat = h("section", {class: "calc-res", "aria-live": "polite"});
    const reinit = h("button", {type: "button", class: "ghost"}, "Réinitialiser");
    form.append(globale, h("div", {class: "calc-actions"}, h("button", {type: "submit", class: "btn"}, "Calculer"), reinit));

    function lire() {
      const v = {}; let ok = true, premier = null;
      Object.values(erreurs).forEach(e => { e.textContent = ""; }); globale.textContent = "";
      const faute = (f, m) => { erreurs[f.id].textContent = m; ok = false; premier = premier || f; };
      c.champs.forEach(f => {
        if (f.visible && !f.visible(brut())) return;
        if (f.type === "lignes") {
          const lignes = [...entrees[f.id].liste.children].map(l => ({lib: l.querySelector(".lib").value.trim(), brut: l.querySelector(".ml").value.trim()})).filter(l => l.lib || l.brut);
          const res = [];
          lignes.forEach(l => { const n = num(l.brut); if (l.brut === "") faute(f, "Indiquez un volume pour chaque ligne remplie."); else if (isNaN(n) || n > 20000) faute(f, "Volume invalide : saisissez un nombre positif en ml (20 000 ml au maximum)."); else res.push({lib: l.lib, ml: n}); });
          v[f.id] = res; return;
        }
        const val = entrees[f.id].value;
        if (f.type === "choix" || f.type === "bascule") { v[f.id] = val; return; }
        if (f.type === "date") { const d = msDate(val); if (isNaN(d)) faute(f, "Choisissez une date valide."); else v[f.id] = d; return; }
        const n = num(val);
        if (String(val).trim() === "") { if (f.optionnel) v[f.id] = null; else faute(f, "Ce champ est obligatoire."); }
        else if (isNaN(n)) faute(f, "Saisissez un nombre (par exemple 70 ou 70,5).");
        else if (n < f.min || n > f.max) faute(f, "La valeur doit être comprise entre " + fmt(f.min, f.min % 1 ? 1 : 0) + " et " + fmt(f.max, f.max % 1 ? 1 : 0) + (f.unite ? " " + f.unite : "") + ".");
        else v[f.id] = n;
      });
      if (ok && c.champs.some(f => f.type === "lignes") && v.apports.length + v.pertes.length === 0) { globale.textContent = "Saisissez au moins un apport ou une perte."; ok = false; }
      if (ok && c.verif) { const m = c.verif(v); if (m) { globale.textContent = m; ok = false; } }
      if (!ok && premier && entrees[premier.id].focus) entrees[premier.id].focus();
      return ok ? v : null;
    }
    form.addEventListener("submit", e => {
      e.preventDefault(); const v = lire(); if (!v) { resultat.replaceChildren(); return; }
      const r = c.calc(v), saisies = brut();
      const copie = h("button", {type: "button", class: "ghost"}, "Copier le résultat");
      copie.onclick = () => copier(texteCopie(c, saisies, r), copie);
      const anim = h("span", {class: "anim", "aria-hidden": "true"}, r.principal);
      resultat.replaceChildren(h("div", {class: "res-carte niveau-" + r.niveau},
        h("p", {class: "res-valeur"}, h("span", {class: "sr-only"}, r.principal), anim, r.unite ? h("span", {class: "res-unite"}, " " + r.unite) : null),
        h("p", {class: "res-titre"}, h("span", {class: "pastille"}, NIVEAUX[r.niveau]), " " + r.titre),
        r.graphique ? r.graphique() : null,
        r.lignes.length ? h("dl", {class: "res-lignes"}, r.lignes.map(([k, val]) => [h("dt", {}, k), h("dd", {}, val)])) : null,
        h("p", {}, r.explication),
        r.alertes ? h("ul", {class: "res-alertes"}, r.alertes.map(a => h("li", {}, a))) : null, copie));
      animerNombre(anim, r);
      resultat.scrollIntoView({behavior: REDUIT ? "auto" : "smooth", block: "nearest"});
    });
    reinit.onclick = () => {
      c.champs.forEach(f => {
        if (f.type === "lignes") entrees[f.id].liste.replaceChildren(ligneBilan(f, h("div", {class: "ligne-bilan"})));
        else if (f.type === "date") entrees[f.id].value = typeof f.defaut === "function" ? f.defaut() : "";
        else entrees[f.id].value = f.defaut || (f.type === "choix" ? f.options[0][0] : "");
      });
      Object.values(erreurs).forEach(e => { e.textContent = ""; }); globale.textContent = ""; resultat.replaceChildren(); majVisibles();
    };
    zone.replaceChildren(h("button", {type: "button", class: "ghost retour-calc", onclick: catalogue}, "← Tous les calculateurs"),
      h("article", {class: "calc-detail"}, h("h2", {}, c.nom), h("p", {class: "calc-def"}, c.def), h("p", {class: "calc-utilite"}, h("b", {}, "Utilité médicale : "), c.utilite),
        h("p", {class: "calc-securite"}, AVERT),
        h("div", {class: "calc-panneau"}, h("h3", {class: "panneau-titre"}, c.titrePanneau || c.nom), form, resultat),
        h("section", {class: "calc-info"}, h("h3", {}, "Formule utilisée"), h("p", {class: "formule"}, c.formule),
          h("h3", {}, "Précautions et limites"), h("ul", {}, c.precautions.map(p => h("li", {}, p))),
          h("h3", {}, "Références"), h("ul", {class: "refs"}, c.refs.map(p => h("li", {}, p))))));
    window.scrollTo(0, 0);
  }
  catalogue();
})();
