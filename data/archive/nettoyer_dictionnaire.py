#!/usr/bin/env python3
"""
DicMed — nettoyage du dictionnaire.

Usage :
    python3 nettoyer_dictionnaire.py dictionnaire.json dossier_de_sortie

Produit :
    dossier_de_sortie/termes.json          (fiches propres, une fiche par ligne)
    dossier_de_sortie/rapport_nettoyage.md (ce qui a été changé + ce qui reste à vérifier)

Le fichier source n'est jamais modifié. Le script peut être relancé à chaque
mise à jour du dictionnaire.
"""
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dictionnaire.json")
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("sortie")

# Champs de la source qui ne sont pas conservés (remplacés ou inutiles pour le site)
CHAMPS_IGNORES = {
    "contenu_original",        # copie brute du texte Word (43 % du poids du fichier)
    "numero_source",           # conservé sous la forme « src »
    "numero_document_source",
    "fichier_source",
    "section_source",          # remplacé par « categorie » + « systeme »
    "type",                    # remplacé par notre « type »
    "nom",                     # remplacé par « terme »
}
ETYMOLOGIE_GENERIQUE = "Nom formé à partir de termes grecs ou latins"


# ---------------------------------------------------------------- utilitaires
def sans_accents(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return (s.replace("œ", "oe").replace("Œ", "OE")
             .replace("æ", "ae").replace("Æ", "AE").replace("’", "'"))


def slug(s: str) -> str:
    s = sans_accents(s).lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def nettoyer_texte(s: str) -> str:
    s = unicodedata.normalize("NFC", s).replace("\u00a0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r" *\n *", "\n", s)
    # saut de ligne en plein milieu d'une phrase (retour à la ligne Word) : on recolle
    s = re.sub(r"\n(?=[a-zà-ÿœ’'(])", " ", s)
    return s.strip()


def retirer_emojis(s: str) -> str:
    return "".join(c for c in s
                   if unicodedata.category(c) != "So" and c not in "\ufe0f\u200d")


def est_vide(v) -> bool:
    return v is None or v == "" or v == [] or v == {}


def nettoyer_valeur(v):
    if isinstance(v, str):
        return nettoyer_texte(v)
    if isinstance(v, list):
        sortie, vus = [], set()
        for x in v:
            x = nettoyer_valeur(x)
            if est_vide(x):
                continue
            cle = sans_accents(json.dumps(x, ensure_ascii=False)).lower().rstrip(". ")
            if cle in vus:
                continue
            vus.add(cle)
            sortie.append(x)
        return sortie
    if isinstance(v, dict):
        return {k: nettoyer_valeur(x) for k, x in v.items() if not est_vide(nettoyer_valeur(x))}
    return v


def majuscule_initiale(s: str) -> str:
    return s[:1].upper() + s[1:] if s else s


# ---------------------------------------------------------------- noms
def traiter_nom(nom: str):
    """Retourne (terme, latin, synonymes_extraits, casse_corrigee)."""
    nom = nettoyer_texte(retirer_emojis(nom))
    latin, synonymes = None, []

    m = re.search(r"\s*\(((?:Musculus|Musculi|Tunica|Diaphragma)[^)]*)\)\s*$", nom)
    if m:
        latin = m.group(1).strip()
        nom = nom[:m.start()].strip()

    m = re.search(r"\s*\((muscle [^)]*)\)\s*$", nom)
    if m:
        synonymes.append(majuscule_initiale(m.group(1).strip()))
        nom = nom[:m.start()].strip()

    casse = False
    lettres = [c for c in nom if c.isalpha()]
    if len(lettres) > 3 and all(c.isupper() for c in lettres):
        sans_article = re.sub(r"^L['’]", "", nom)   # « L'LUETTE » : article saisi par erreur
        base = majuscule_initiale(sans_article.lower())
        # acronymes et chiffres romains entre parenthèses (RGO, BPCO, VII…) : on les garde en majuscules
        base = re.sub(r"\(([^)]*)\)",
                      lambda m: "(" + (m.group(1).upper() if len(m.group(1)) <= 4 else m.group(1)) + ")",
                      base)
        nom, casse = base, True
    return nom, latin, synonymes, casse


# ---------------------------------------------------------------- catégories
def libelle_section(section: str) -> str:
    s = nettoyer_texte(retirer_emojis(section))
    s = re.sub(r"^(?:[IVX]+|[A-Z]|\d+)\.\s+", "", s)
    return majuscule_initiale(s.lower())


# (système, mots-clés cherchés dans la section, sans accents, en majuscules)
REGLES_SYSTEMES = [
    ("Endocrinien", ["HORMONES"]),
    ("Grossesse et fœtus", ["FOETUS", "PLACENTA", "MEMBRANES FOETALES", "OMBILICAL", "WHARTON",
                            "INTERVILLEUX", "PLAQUE BASALE", "PLAQUE CHORIALE", "VILLOSITES"]),
    ("Sang et immunité", ["SANG", "CELLULES SANGUINES", "HEMATOPOIETIQUES", "IMMUNITE", "VIH"]),
    ("Système nerveux", ["NERVEUX", "CERVEAU", "MOELLE EPINIERE", "MENINGES", "SYMPATHIQUE", "PARASYMPATHIQUE"]),
    ("Organes des sens", ["VISUEL", "OEIL", "OREILLE", "GUSTATIF", "OLFACTIF"]),
    ("Respiratoire", ["RESPIRATOIRE"]),
    ("Cardiovasculaire", ["CARDIOVASCULAIRE", "ARTERES", "VEINES"]),
    ("Digestif", ["DIGESTIF", "BOUCHE", "DUODENUM", "ESTOMAC", "GROS INTESTIN", "INTESTIN GRELE",
                  "OESOPHAGE", "PANCREAS", "PHARYNX", "VOIES BILIAIRES", "VESICULE BILIAIRE",
                  "GLANDES SALIVAIRES", "GLANDES ANNEXES", "MASTICATEUR", "GENCIVES", "LANGUE"]),
    ("Reproducteur", ["REPRODUCTEUR", "UTERUS", "OVAIRES", "TESTICULES", "TROMPES", "VAGIN",
                      "VULVE", "EPIDIDYME", "SPERMATIQUES", "ORGANES EXTERNES"]),
    ("Locomoteur", ["MUSCLES", "OS DE LA FACE", "OS DU CRANE", "ARTICULATION", "MEMBRE",
                    "COLONNE", "BASSIN", "CAGE THORACIQUE", "MANDIBULE", "MAXILLAIRE", "STRUCTURES ASSOCIEES"]),
    ("Peau et annexes", ["PEAU", "ANNEXES CUTANEES"]),
    ("Endocrinien", ["GLANDES"]),
]

RE_MUSCLE = re.compile(r"^(?:(?:premier|deuxieme|troisieme|quatrieme)\s+)?muscles?\b|^diaphragme")
RE_TISSU = re.compile(
    r"^(?:epithelium|tissu|cartilage|fibrocartilage|fibres|cellules|neurones|interneurones|"
    r"astrocytes|oligodendrocytes|microglies|cardiomyocytes|urothelium|ectoderme|mesoderme|"
    r"endoderme|mesenchyme|moelle osseuse rouge)\b")


def classer(terme: str, section: str, brut: dict):
    """Retourne (type, systeme)."""
    sec = sans_accents(retirer_emojis(section)).upper()
    nom = sans_accents(terme).lower()
    generique = sec == "ANATOMIE ET HISTOLOGIE"

    if brut.get("type"):
        typ = "maladie"
    elif sec.startswith("HORMONES") or "nature_chimique" in brut:
        typ = "hormone"
    elif RE_MUSCLE.match(nom) or "MUSCLES" in sec:
        typ = "muscle"
    elif generique and RE_TISSU.match(nom):
        typ = "tissu"
    else:
        typ = "anatomie"

    if generique:
        systeme = "Tissus et cellules" if typ == "tissu" else (
            "Locomoteur" if typ == "muscle" else "Non classé")
        return typ, systeme

    for systeme, mots in REGLES_SYSTEMES:
        if any(re.search(r"\b" + re.escape(m), sec) for m in mots):
            return typ, systeme
    return typ, "Non classé"


# ---------------------------------------------------------------- réparation des pathologies
MARQUEUR_PATHO = "Principales pathologies et maladies"


def est_titre_section(ligne: str) -> bool:
    """Titre de section Word qui a « fuité » dans la fiche (« III. MÉNINGES », « 🫀 APPAREIL … »)."""
    l = retirer_emojis(ligne).strip()
    if re.match(r"^(?:[IVX]+|[A-Z]|\d+)\.\s+\S", l):
        return True
    lettres = [c for c in l if c.isalpha()]
    return len(lettres) >= 6 and all(c.isupper() for c in lettres)


def reparer_pathologies(brut: dict, fiche: dict, stats: Counter):
    """Dans ~100 fiches, la liste des pathologies est collée à la fin du champ « fonction »
    (et parfois suivie d'un titre de section). La structure d'origine, ligne par ligne,
    est conservée dans « contenu_original » : on s'en sert pour séparer proprement."""
    fonction = fiche.get("fonction")
    if not isinstance(fonction, str) or MARQUEUR_PATHO not in fonction:
        return

    tete, _, queue = fonction.partition(MARQUEUR_PATHO)
    items = []
    lignes = []
    for bloc in brut.get("contenu_original") or []:
        lignes += [l.strip() for l in str(bloc).split("\n") if l.strip()]
    debut = next((i for i, l in enumerate(lignes) if l.startswith(MARQUEUR_PATHO)), None)
    if debut is not None:
        reste = lignes[debut][len(MARQUEUR_PATHO):].strip()
        if reste:
            items.append(reste)
        for l in lignes[debut + 1:]:
            if est_titre_section(l):
                stats["titres_section_parasites_retires"] += 1
                break
            items.append(l)

    if items:
        stats["pathologies_reparees"] += 1
    else:
        # pas de structure de secours : on garde le texte tel quel, sans le titre parasite
        queue = queue.strip()
        queue = re.sub(r"\s+(?:[IVX]+|[A-Z])\.\s+[A-ZÀ-ÝŒ][A-ZÀ-ÝŒ’' \-]+$", "", queue)
        items = [queue] if queue else []
        stats["pathologies_non_decoupees"] += 1

    fiche["fonction"] = tete.strip()
    if not fiche["fonction"]:
        del fiche["fonction"]
    existantes = fiche.get("pathologies", [])
    if isinstance(existantes, str):
        existantes = [existantes]
    fusion = nettoyer_valeur(existantes + items)
    if fusion:
        fiche["pathologies"] = fusion


# ---------------------------------------------------------------- transformation
def transformer(brut: dict, stats: Counter) -> dict:
    terme, latin, syn_extra, casse = traiter_nom(brut["nom"])
    if casse:
        stats["noms_casse_corrigee"] += 1
        stats["_liste_casse"] = stats.get("_liste_casse", [])
        stats["_liste_casse"].append((brut["nom"], terme))
    if latin:
        stats["noms_latin_separe"] += 1
    if syn_extra:
        stats["noms_synonyme_extrait"] += 1

    typ, systeme = classer(terme, brut["section_source"], brut)
    fiche = {"terme": terme}
    if latin:
        fiche["latin"] = latin
    fiche["type"] = typ
    fiche["systeme"] = systeme
    fiche["categorie"] = libelle_section(brut["section_source"])

    for cle, valeur in brut.items():
        if cle in CHAMPS_IGNORES:
            continue
        valeur = nettoyer_valeur(valeur)
        if est_vide(valeur):
            continue
        if isinstance(valeur, str) and valeur in ("—", "–", "-"):   # simple tiret = champ vide
            stats["valeurs_tiret_retirees"] += 1
            continue
        fiche[cle] = valeur

    # titres de section numérotés (« I. SANG ») égarés au milieu d'une liste
    for cle, valeur in list(fiche.items()):
        if isinstance(valeur, list):
            propre = [x for x in valeur
                      if not (isinstance(x, str)
                              and re.match(r"^(?:[IVX]+|[A-Z]|\d+)\.\s+[A-ZÀ-ÝŒ]", retirer_emojis(x)))]
            if len(propre) != len(valeur):
                stats["titres_section_parasites_retires"] += len(valeur) - len(propre)
                if propre:
                    fiche[cle] = propre
                else:
                    del fiche[cle]

    reparer_pathologies(brut, fiche, stats)

    # Étymologie générique (même phrase pour 95 hormones) : inutile pour le lecteur
    if isinstance(fiche.get("etymologie"), str) and fiche["etymologie"].startswith(ETYMOLOGIE_GENERIQUE):
        del fiche["etymologie"]
        stats["etymologies_generiques_retirees"] += 1

    # Synonymes extraits du nom
    if syn_extra:
        actuels = fiche.get("synonymes", [])
        if isinstance(actuels, str):
            actuels = [actuels]
        fiche["synonymes"] = nettoyer_valeur(actuels + syn_extra)

    # « Nature : … » en tête des définitions de maladies -> champ séparé
    d = fiche.get("definition")
    if isinstance(d, str):
        m = re.match(r"^Nature\s*:\s*([^\n]+)\n+(.+)$", d, re.S)
        if m:
            fiche["nature"] = m.group(1).strip()
            fiche["definition"] = m.group(2).strip()
            stats["definitions_nature_separee"] += 1

    fiche["src"] = [brut["numero_source"]]
    fiche["_section"] = brut["section_source"]
    return fiche


def fusionner(a: dict, b: dict, conflits: list):
    """Fusionne b dans a (doublon exact de nom). Ne perd aucune information distincte."""
    for cle, v in b.items():
        if cle in ("terme", "type", "systeme", "categorie", "_section"):
            continue
        if cle == "src":
            a["src"] = a["src"] + [x for x in v if x not in a["src"]]
            continue
        if cle not in a or est_vide(a[cle]):
            a[cle] = v
            continue
        if a[cle] == v:
            continue
        if isinstance(v, list) and isinstance(a[cle], list):
            a[cle] = nettoyer_valeur(a[cle] + v)
            continue
        sa, sb = sans_accents(str(a[cle])).lower(), sans_accents(str(v)).lower()
        if sb in sa:
            continue
        if sa in sb:
            a[cle] = v
            continue
        # contenus réellement différents : on garde la version la plus longue ;
        # l'autre est listée dans le rapport pour relecture
        if len(str(v)) > len(str(a[cle])):
            conflits.append((a["terme"], cle, str(v), str(a[cle])))
            a[cle] = v
        else:
            conflits.append((a["terme"], cle, str(a[cle]), str(v)))


def resume_court(definition: str, limite: int = 170) -> str:
    texte = definition.replace("\n", " ").strip()
    phrase = re.split(r"(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ«“\"])", texte, maxsplit=1)[0]
    phrase = majuscule_initiale(phrase)
    if len(phrase) > limite:
        coupe = phrase[:limite - 1].rsplit(" ", 1)[0].rstrip(",;:")
        phrase = coupe + "…"
    return phrase


# ---------------------------------------------------------------- principal
def main():
    OUT.mkdir(parents=True, exist_ok=True)
    source = json.loads(SRC.read_text(encoding="utf-8"))
    bruts = source["termes"]
    stats = Counter()

    # 1. transformation + regroupement par nom
    groupes: dict[str, dict] = {}
    conflits, fusionnes, sections_diff = [], [], []
    for brut in bruts:
        f = transformer(brut, stats)
        cle = slug(f["terme"])
        if cle in groupes:
            if groupes[cle]["_section"] != f["_section"]:
                sections_diff.append((f["terme"], groupes[cle]["_section"], f["_section"]))
            fusionner(groupes[cle], f, conflits)
            fusionnes.append(f["terme"])
        else:
            groupes[cle] = f

    # 2. identifiants, résumés, tri
    fiches = sorted(groupes.values(), key=lambda f: sans_accents(f["terme"]).lower())
    ids = set()
    for f in fiches:
        base = slug(f["terme"]) or "fiche"
        ident, n = base, 2
        while ident in ids:
            ident, n = f"{base}-{n}", n + 1
        ids.add(ident)
        f.pop("_section", None)
        d = f.get("definition")
        if isinstance(d, str) and d:
            f["resume"] = resume_court(d)
        # ordre des clés : identité d'abord
        tete = ["id", "terme", "latin", "type", "systeme", "categorie", "resume"]
        reste = {k: v for k, v in f.items() if k not in tete}
        nouveau = {"id": ident}
        nouveau.update({k: f[k] for k in tete[1:] if k in f})
        nouveau.update(reste)
        f.clear()
        f.update(nouveau)

    # 3. contrôle : aucune fiche source perdue
    src_total = {b["numero_source"] for b in bruts}
    src_sortie = {n for f in fiches for n in f["src"]}
    assert src_total == src_sortie, "Des fiches source ont disparu !"

    # 4. écriture
    meta = {
        "titre": source.get("titre", "Dictionnaire DicMed"),
        "langue": "fr",
        "genere_le": date.today().isoformat(),
        "source": SRC.name,
        "nombre_fiches": len(fiches),
    }
    chemin_json = OUT / "termes.json"
    with open(chemin_json, "w", encoding="utf-8") as fh:
        fh.write("{\n")
        for k, v in meta.items():
            fh.write(f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},\n")
        fh.write('  "termes": [\n')
        fh.write(",\n".join("    " + json.dumps(f, ensure_ascii=False, separators=(",", ":"))
                            for f in fiches))
        fh.write("\n  ]\n}\n")
    json.loads(chemin_json.read_text(encoding="utf-8"))  # relecture de contrôle

    # 5. rapport
    par_type = Counter(f["type"] for f in fiches)
    par_systeme = Counter(f["systeme"] for f in fiches)
    sans_def = [f for f in fiches if "definition" not in f]
    non_classees = [f for f in fiches if f["systeme"] == "Non classé"]
    avant = SRC.stat().st_size
    apres = chemin_json.stat().st_size

    L = []
    L.append("# Rapport de nettoyage — DicMed\n")
    L.append(f"Source : `{SRC.name}` ({avant/1e6:.2f} Mo, {len(bruts)} fiches) → "
             f"`termes.json` ({apres/1e6:.2f} Mo, {len(fiches)} fiches)\n")
    L.append("## Ce qui a été fait\n")
    L.append(f"- Doublons fusionnés (même nom) : **{len(fusionnes)}**")
    L.append(f"- Champ `contenu_original` retiré (copie brute du texte Word, non affichée par le site)")
    L.append(f"- Étymologies génériques retirées : **{stats['etymologies_generiques_retirees']}**")
    L.append(f"- Noms en MAJUSCULES remis en casse normale : **{stats['noms_casse_corrigee']}**")
    L.append(f"- Noms latins séparés du nom français (`latin`) : **{stats['noms_latin_separe']}**")
    L.append(f"- Synonymes extraits des noms (« muscle … ») : **{stats['noms_synonyme_extrait']}**")
    L.append(f"- Pathologies recollées dans « fonction » séparées proprement : **{stats['pathologies_reparees']}**"
             f" (non découpables, laissées en un bloc : {stats['pathologies_non_decoupees']})")
    L.append(f"- Titres de section parasites retirés (ex. « III. MÉNINGES » en fin de texte) : **{stats['titres_section_parasites_retires']}**")
    L.append(f"- Champs contenant seulement un tiret « — » retirés : **{stats['valeurs_tiret_retirees']}**")
    L.append("- Retours à la ligne au milieu des phrases (issus de Word) recollés")
    L.append(f"- Préfixe « Nature : » séparé de la définition (`nature`) : **{stats['definitions_nature_separee']}**")
    L.append("- Catégories : 102 sections d'origine → `type` + `systeme` + `categorie` (libellé nettoyé)")
    L.append("- `resume` : première phrase de la définition (pour les cartes de la liste)")
    L.append("- Contrôle : chaque numéro de fiche source se retrouve dans la sortie\n")
    L.append("## Répartition\n")
    L.append("Par type : " + ", ".join(f"{k} {v}" for k, v in par_type.most_common()) + "\n")
    L.append("Par système : " + ", ".join(f"{k} {v}" for k, v in par_systeme.most_common()) + "\n")

    L.append(f"## À vérifier : doublons fusionnés avec contenus différents ({len(conflits)})\n")
    if conflits:
        for terme, champ, va, vb in conflits:
            L.append(f"- **{terme}** — `{champ}`\n  - gardé (le plus long) : {va[:200]}\n  - autre version (non gardée) : {vb[:200]}")
    else:
        L.append("Aucun.")
    L.append("")
    if sections_diff:
        L.append(f"## À vérifier : doublons venant de sections différentes ({len(sections_diff)})\n")
        for terme, s1, s2 in sections_diff:
            L.append(f"- {terme} : « {libelle_section(s1)} » / « {libelle_section(s2)} »")
        L.append("")

    noms = {f["terme"].lower() for f in fiches}
    quasi = []
    for f in fiches:
        base = re.sub(r"\s*\([IVX]+\)$", "", f["terme"])
        if base != f["terme"] and base.lower() in noms:
            quasi.append((base, f["terme"]))
    L.append(f"## À vérifier : fiches quasi identiques, non fusionnées ({len(quasi)})\n")
    L.append("Même nerf présent sous deux noms (avec et sans numéro de paire crânienne) : à fusionner ou à distinguer.\n")
    L.append("\n".join(f"- {a} / {b}" for a, b in quasi) or "Aucune.")
    L.append("")
    L.append(f"## À compléter : fiches sans définition ({len(sans_def)})\n")
    par = defaultdict(list)
    for f in sans_def:
        par[f["type"]].append(f["terme"])
    for typ, noms in par.items():
        L.append(f"**{typ}** ({len(noms)}) : " + " ; ".join(noms) + "\n")

    L.append(f"## À classer : fiches sans système ({len(non_classees)})\n")
    L.append(" ; ".join(f"{f['terme']} [{f['categorie']}]" for f in non_classees) or "Aucune.")
    L.append("")
    L.append(f"## Noms dont la casse a été corrigée ({stats['noms_casse_corrigee']})\n")
    L.append(" ; ".join(f"{a} → {b}" for a, b in stats.get("_liste_casse", [])))
    (OUT / "rapport_nettoyage.md").write_text("\n".join(L) + "\n", encoding="utf-8")

    print(f"{len(bruts)} fiches source -> {len(fiches)} fiches | {avant/1e6:.2f} Mo -> {apres/1e6:.2f} Mo")
    print("types   :", dict(par_type))
    print("systèmes:", dict(par_systeme))
    print("doublons fusionnés:", len(fusionnes), "| conflits de contenu:", len(conflits))
    print("sans définition:", len(sans_def), "| non classées:", len(non_classees))


if __name__ == "__main__":
    main()
