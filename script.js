
// ========================================
// DICTIONNAIRE MÉDICAL
// ========================================

// Stockage des termes médicaux
let dictionnaire = [];
let categorieActive = "TOUT";

// Récupération des éléments HTML
const recherche = document.getElementById("search");
const resultats = document.getElementById("results");
const conteneurCategories = document.getElementById("categories");

// ========================================
// CHARGEMENT DES DONNÉES JSON
// ========================================

async function chargerDictionnaire() {
    try {
        const reponse = await fetch(
            "data/gemini.json/dictionnaire%20(1).json"
        );

        if (!reponse.ok) {
            throw new Error(
                `Impossible d'accéder au fichier JSON. Erreur HTTP : ${reponse.status}`
            );
        }

        const donnees = await reponse.json();

        // Accepter une liste directe ou un objet contenant une liste
        if (Array.isArray(donnees)) {
            dictionnaire = donnees;
        } else if (Array.isArray(donnees.termes)) {
            dictionnaire = donnees.termes;
        } else {
            throw new Error(
                "Le fichier JSON ne contient pas de liste de termes reconnue."
            );
        }

        // Adapter les fiches du nouveau dictionnaire
dictionnaire = dictionnaire
    .filter(element =>
        element &&
        (
            (typeof element.terme === "string" && element.terme.trim() !== "") ||
            (typeof element.nom === "string" && element.nom.trim() !== "")
        )
    )
    .map(element => ({
        ...element,
        terme: element.terme || element.nom,
        categorie: element.categorie || element.section_source || "",
        systemes: element.systemes || (
            element.section_source ? [element.section_source] : []
        )
    }));

        // Créer les boutons de catégories après le chargement
        creerBoutonsCategories();

        console.log(
            "Nombre de termes chargés :",
            dictionnaire.length
        );

        if (dictionnaire.length === 0) {
            resultats.textContent =
                "Le fichier est chargé, mais aucun terme médical valide n'a été trouvé.";
            return;
        }

        resultats.textContent =
            `Dictionnaire prêt : ${dictionnaire.length} termes chargés.`;

    } catch (erreur) {
        console.error(
            "Erreur lors du chargement du dictionnaire :",
            erreur
        );

        resultats.textContent =
            "Impossible de charger les termes médicaux. Vérifie le chemin du fichier JSON et sa structure.";
    }
}

// ========================================
// CRÉATION DES BOUTONS DE CATÉGORIES
// ========================================

function creerBoutonsCategories() {
    // Conserver le bouton « Tous les termes »
    const boutonTout = conteneurCategories.querySelector(
        '[data-category="TOUT"]'
    );

    // Supprimer les anciens boutons dynamiques
    conteneurCategories
        .querySelectorAll(".category-button:not([data-category='TOUT'])")
        .forEach(bouton => bouton.remove());

    // Récupérer les catégories présentes dans le dictionnaire
    const categories = [
        ...new Set(
            dictionnaire
                .map(element => element.categorie)
                .filter(
                    categorie =>
                        typeof categorie === "string" &&
                        categorie.trim() !== ""
                )
        )
    ].sort((a, b) => a.localeCompare(b, "fr"));

    // Ajouter un bouton pour chaque catégorie
    categories.forEach(categorie => {
        const bouton = document.createElement("button");

        bouton.type = "button";
        bouton.className = "category-button";
        bouton.dataset.category = categorie;
        bouton.textContent = categorie;

        bouton.addEventListener("click", () => {
            categorieActive = categorie;
            actualiserBoutonsCategories();
            afficherResultats();
        });

        conteneurCategories.appendChild(bouton);
    });

    // Gérer le bouton « Tous les termes »
    if (boutonTout) {
        boutonTout.addEventListener("click", () => {
            categorieActive = "TOUT";
            actualiserBoutonsCategories();
            afficherResultats();
        });
    }
}

// ========================================
// ACTUALISATION DES BOUTONS
// ========================================

function actualiserBoutonsCategories() {
    conteneurCategories
        .querySelectorAll(".category-button")
        .forEach(bouton => {
            bouton.classList.toggle(
                "active",
                bouton.dataset.category === categorieActive
            );
        });
}

// ========================================
// AFFICHAGE D'UN TERME
// ========================================


function afficherTerme(element) {
    const article = document.createElement("article");
    article.classList.add("fiche-medicale");
const entete = document.createElement("div");
entete.className = "entete-fiche";

const titre = document.createElement("h2");
titre.textContent = element.terme || element.nom;

const actions = document.createElement("div");
actions.className = "actions-fiche";

// Favoris
const boutonFavori = document.createElement("button");
boutonFavori.type = "button";
boutonFavori.className = "action-terme favori";

const nomTerme = element.terme || element.nom;
const CLE_FAVORIS = "dicmed_favoris";

function actualiserFavori() {
    let favoris = JSON.parse(localStorage.getItem(CLE_FAVORIS) || "[]");
    const actif = favoris.includes(nomTerme);

    boutonFavori.textContent = actif ? "♥" : "♡";
    boutonFavori.classList.toggle("actif", actif);
    boutonFavori.title = actif
        ? "Retirer des favoris"
        : "Ajouter aux favoris";
}

actualiserFavori();

boutonFavori.addEventListener("click", () => {
    let favoris = JSON.parse(localStorage.getItem(CLE_FAVORIS) || "[]");

    favoris = favoris.includes(nomTerme)
        ? favoris.filter(nom => nom !== nomTerme)
        : [...favoris, nomTerme];

    localStorage.setItem(CLE_FAVORIS, JSON.stringify(favoris));
    actualiserFavori();
});

// Partage de la fiche entière
const boutonPartager = document.createElement("button");
boutonPartager.type = "button";
boutonPartager.className = "action-terme partager";
boutonPartager.textContent = "↗";
boutonPartager.title = "Partager la fiche complète";

boutonPartager.addEventListener("click", async () => {
    const contenu = article.innerText;

    try {
        if (navigator.share) {
            await navigator.share({
                title: `DICMED - ${nomTerme}`,
                text: contenu
            });
        } else {
            await navigator.clipboard.writeText(contenu);
            alert("La fiche médicale complète a été copiée !");
        }
    } catch (erreur) {
        if (erreur.name !== "AbortError") {
            alert("Impossible de partager la fiche.");
        }
    }
});

actions.append(boutonFavori, boutonPartager);
entete.append(titre, actions);
article.appendChild(entete);

    const grille = document.createElement("div");
    grille.className = "fiche-grille";

    function creerRubrique(titreRubrique, champs) {
        const bloc = document.createElement("section");
        bloc.className = "fiche-bloc";

        const titreBloc = document.createElement("h3");
        titreBloc.textContent = titreRubrique;
        bloc.appendChild(titreBloc);

        champs.forEach(([nom, valeur]) => {
            ajouterChamp(bloc, nom, valeur, element);
        });

        if (bloc.querySelector("p")) {
            grille.appendChild(bloc);
        }
    }

    // Informations générales : conservées
    creerRubrique("Profil du terme", [
        ["Genre", element.genre],
        ["Nombre", element.nombre],
        ["Catégorie", element.categorie || element.section_source],
        ["Systèmes", element.systemes]
    ]);

    // Description habituelle
    creerRubrique("Description", [
        ["Étymologie", element.etymologie],
        ["Définition", element.definition],
        ["Synonymes", element.synonymes]
    ]);

    // Informations anatomiques habituelles
    creerRubrique("Anatomie et fonctions", [
        ["Fonction", element.fonction],
        ["Localisation", element.localisation],
        ["Trajet", element.trajet]
    ]);

    // Pathologies habituelles
    creerRubrique("Pathologies", [
        ["Pathologies", element.pathologies]
    ]);

    // Informations spécifiques aux hormones
    creerRubrique("Fiche hormonale", [
        ["Abréviation", element.abreviation],
        ["Nature chimique", element.nature_chimique],
        [
            "Glande ou organe producteur",
            element.glande_ou_organe_producteur || element.organe_producteur
        ],
        ["Cellules productrices", element.cellules_productrices],
        ["Anomalies associées", element.anomalies_associees]
    ]);

    article.appendChild(grille);

    // Afficher les relations anatomiques
    ajouterRelationsAnatomiques(article, element);

    // Conserver les termes associés automatiques
    ajouterTermesAssocies(article, element);

    return article;
}


// ========================================
// RELATIONS ANATOMIQUES
// ========================================

function ajouterRelationsAnatomiques(article, element) {
    const relations = element.relations_anatomiques;

    if (!Array.isArray(relations) || relations.length === 0) {
        return;
    }

    const section = document.createElement("section");
    section.className = "relations-anatomiques";

    const titre = document.createElement("h3");
    titre.textContent = "🧠 Relations anatomiques";
    section.appendChild(titre);

    const liste = document.createElement("div");
    liste.className = "liste-relations-anatomiques";

    relations.forEach(relation => {
        if (!relation || !relation.terme) {
            return;
        }

        const ligne = document.createElement("p");

        const type = document.createElement("strong");
        type.textContent = `${relation.type || "Relation"} : `;
        ligne.appendChild(type);

        const nomRecherche = relation.terme
            .trim()
            .toLocaleLowerCase("fr");

        const ficheLiee = dictionnaire.find(fiche =>
            (fiche.terme || fiche.nom || "")
                .trim()
                .toLocaleLowerCase("fr") === nomRecherche
        );

        if (ficheLiee) {
            const lien = document.createElement("a");
            lien.href = "#";
            lien.className = "lien-terme-medical";
            lien.textContent = ficheLiee.terme || ficheLiee.nom;

            lien.addEventListener("click", evenement => {
                evenement.preventDefault();
                afficherFicheComplete(ficheLiee);
            });

            ligne.appendChild(lien);
        } else {
            ligne.appendChild(
                document.createTextNode(relation.terme)
            );
        }

        liste.appendChild(ligne);
    });

    if (liste.children.length === 0) {
        return;
    }

    section.appendChild(liste);
    article.appendChild(section);
}


// ========================================
// TERMES ASSOCIÉS AUTOMATIQUES
// ========================================

function ajouterTermesAssocies(article, element) {
    const nomActuel = (element.terme || element.nom || "")
        .trim()
        .toLocaleLowerCase("fr");

    const champs = [
        element.definition,
        element.fonction,
        element.localisation,
        element.trajet,
        element.pathologies,
        element.synonymes
    ];

    const texteFiche = champs
        .flatMap(valeur => Array.isArray(valeur) ? valeur : [valeur])
        .filter(valeur => typeof valeur === "string")
        .join(" ");

    if (!texteFiche.trim()) {
        return;
    }

    const noms = [
        ...new Set(
            dictionnaire
                .map(fiche => fiche.terme || fiche.nom)
                .filter(nom =>
                    typeof nom === "string" &&
                    nom.trim() !== "" &&
                    nom.trim().toLocaleLowerCase("fr") !== nomActuel
                )
        )
    ].sort((a, b) => b.length - a.length);

    const associes = [];

    for (const nom of noms) {
        const motif = nom
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\s+/g, "\\s+");

        const regex = new RegExp(
            `(?<![\\p{L}\\p{N}])${motif}(?![\\p{L}\\p{N}])`,
            "iu"
        );

        if (regex.test(texteFiche)) {
            const fiche = dictionnaire.find(item =>
                (item.terme || item.nom || "")
                    .toLocaleLowerCase("fr") ===
                nom.toLocaleLowerCase("fr")
            );

            if (fiche) {
                associes.push({ nom, fiche });
            }
        }

        if (associes.length >= 8) {
            break;
        }
    }

    if (associes.length === 0) {
        return;
    }

    const section = document.createElement("section");
    section.className = "termes-associes";

    const titre = document.createElement("h3");
    titre.textContent = "🔗 Termes associés";
    section.appendChild(titre);

    const liste = document.createElement("p");

    associes.forEach((associe, index) => {
        if (index > 0) {
            liste.appendChild(
                document.createTextNode(" • ")
            );
        }

        const lien = document.createElement("a");
        lien.href = "#";
        lien.className = "lien-terme-medical";
        lien.textContent = associe.nom;

        lien.addEventListener("click", evenement => {
            evenement.preventDefault();
            afficherFicheComplete(associe.fiche);
        });

        liste.appendChild(lien);
    });

    section.appendChild(liste);
    article.appendChild(section);
}

function afficherNomTerme(element) {
const bouton = document.createElement("button");
bouton.type = "button";
bouton.className = "terme-resultat";
bouton.textContent = element.terme;


bouton.addEventListener("click", () => {
    afficherFicheComplete(element);
});

return bouton;


}

function afficherFicheComplete(element) {
resultats.replaceChildren();


const boutonRetour = document.createElement("button");
boutonRetour.type = "button";
boutonRetour.textContent = "← Retour aux résultats";
boutonRetour.className = "bouton-retour";

boutonRetour.addEventListener("click", () => {
    afficherResultats();
});

resultats.appendChild(boutonRetour);
resultats.appendChild(afficherTerme(element));


}

// ========================================
// AJOUT D'UN CHAMP À LA FICHE
// ========================================


function ajouterTexteAvecLiens(parent, texte, termeActuel) {
    const noms = [
        ...new Set(
            dictionnaire
                .map(fiche => fiche.terme || fiche.nom)
                .filter(nom => typeof nom === "string" && nom.trim())
        )
    ]
        .filter(nom => nom.toLocaleLowerCase("fr") !==
            (termeActuel.terme || termeActuel.nom).toLocaleLowerCase("fr"))
        .sort((a, b) => b.length - a.length);

    if (noms.length === 0) {
        parent.appendChild(document.createTextNode(texte));
        return;
    }

    const echapper = mot =>
        mot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
           .replace(/\s+/g, "\\s+");

    const motif = noms.map(echapper).join("|");
    const regex = new RegExp(
        `(?<![\\p{L}\\p{N}])(${motif})(?![\\p{L}\\p{N}])`,
        "giu"
    );

    let position = 0;
    let match;

    while ((match = regex.exec(texte)) !== null) {
        parent.appendChild(
            document.createTextNode(texte.slice(position, match.index))
        );

        const nomTrouve = match[1];
        const fiche = dictionnaire.find(element =>
            (element.terme || element.nom).toLocaleLowerCase("fr") ===
            nomTrouve.toLocaleLowerCase("fr")
        );

        if (fiche) {
            const lien = document.createElement("a");
            lien.href = "#";
            lien.className = "lien-terme-medical";
            lien.textContent = nomTrouve;

            lien.addEventListener("click", evenement => {
                evenement.preventDefault();
                afficherFicheComplete(fiche);
            });

            parent.appendChild(lien);
        } else {
            parent.appendChild(document.createTextNode(nomTrouve));
        }

        position = regex.lastIndex;
    }

    parent.appendChild(
        document.createTextNode(texte.slice(position))
    );
}

function ajouterChamp(parent, nom, valeur, termeActuel) {
    if (valeur === undefined || valeur === null || valeur === "") {
        return;
    }

    if (Array.isArray(valeur) && valeur.length === 0) {
        return;
    }

    const paragraphe = document.createElement("p");
    const etiquette = document.createElement("strong");

    etiquette.textContent = `${nom} : `;
    paragraphe.appendChild(etiquette);

    const texte = Array.isArray(valeur)
        ? valeur.join(", ")
        : String(valeur);

    ajouterTexteAvecLiens(paragraphe, texte, termeActuel);

    parent.appendChild(paragraphe);
}

// ========================================
// RECHERCHE ET FILTRAGE
// ========================================

function afficherResultats() {
    const mot = recherche.value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    resultats.replaceChildren();

    // Afficher le message initial si aucune recherche
    // et si toutes les catégories sont sélectionnées
    if (mot === "" && categorieActive === "TOUT") {
        resultats.textContent =
            `Dictionnaire prêt : ${dictionnaire.length} termes chargés.`;
        return;
    }

    const resultatsFiltres = dictionnaire.filter(element => {
        // Filtrer par catégorie
        if (
            categorieActive !== "TOUT" &&
            element.categorie !== categorieActive
        ) {
            return false;
        }

        const terme = element.terme
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        const synonymes = Array.isArray(element.synonymes)
            ? element.synonymes.join(" ")
            : "";

        const categorie = element.categorie || "";

        const texteRecherche = `${terme} ${synonymes} ${categorie}`
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        return texteRecherche.includes(mot);
    });

    if (resultatsFiltres.length === 0) {
        resultats.textContent = "Aucun terme trouvé.";
        return;
    }

   resultatsFiltres.forEach(element => {
    resultats.appendChild(afficherNomTerme(element));
});
}

// Réagir à chaque modification de la recherche
recherche.addEventListener("input", afficherResultats);

// ========================================
// DÉMARRAGE
// ========================================
// ========================================
// OUVERTURE DU MENU CATÉGORIES MÉDICALES
// ========================================

const boutonCategories = document.getElementById("categories-toggle");
const menuCategories = document.getElementById("categories");

if (boutonCategories && menuCategories) {
    boutonCategories.addEventListener("click", () => {
        const estOuvert =
            boutonCategories.getAttribute("aria-expanded") === "true";

        boutonCategories.setAttribute(
            "aria-expanded",
            String(!estOuvert)
        );

        menuCategories.hidden = estOuvert;

        boutonCategories.parentElement.classList.toggle(
            "open",
            !estOuvert
        );
    });
}
chargerDictionnaire();
