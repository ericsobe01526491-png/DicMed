
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

    const titre = document.createElement("h2");
    titre.textContent = element.terme;
    article.appendChild(titre);

    if (
        typeof element.definition !== "string" ||
        !element.definition.trim()
    ) {
        const statut = document.createElement("p");
        statut.textContent = "⚠️ Fiche à compléter";
        statut.className = "fiche-incomplete";
        article.appendChild(statut);
    }

    const grille = document.createElement("div");
    grille.className = "fiche-grille";

    function creerRubrique(titreRubrique, champs) {
        const bloc = document.createElement("section");
        bloc.className = "fiche-bloc";

        const titreBloc = document.createElement("h3");
        titreBloc.textContent = titreRubrique;
        bloc.appendChild(titreBloc);

        champs.forEach(([nom, valeur]) => {
            ajouterChamp(bloc, nom, valeur);
        });

        if (bloc.querySelector("p")) {
            grille.appendChild(bloc);
        }
    }

    creerRubrique("Profil du terme", [
        ["Genre", element.genre],
        ["Nombre", element.nombre],
        ["Catégorie", element.categorie],
        [
            "Systèmes",
            Array.isArray(element.systemes)
                ? element.systemes.join(", ")
                : element.systemes
        ]
    ]);

    creerRubrique("Description", [
        ["Étymologie", element.etymologie],
        ["Définition", element.definition],
        [
            "Synonymes",
            Array.isArray(element.synonymes)
                ? element.synonymes.join(", ")
                : element.synonymes
        ]
    ]);

    creerRubrique("Anatomie et fonctions", [
        ["Fonction", element.fonction],
        ["Localisation", element.localisation],
        ["Trajet", element.trajet]
    ]);

    creerRubrique("Pathologies", [
        [
            "Pathologies",
            Array.isArray(element.pathologies)
                ? element.pathologies.join(", ")
                : element.pathologies
        ]
    ]);

    article.appendChild(grille);


    return article;
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

function ajouterChamp(parent, nom, valeur) {
    // Ne pas afficher les champs vides
    if (
        valeur === undefined ||
        valeur === null ||
        valeur === ""
    ) {
        return;
    }

    if (Array.isArray(valeur) && valeur.length === 0) {
        return;
    }

    const paragraphe = document.createElement("p");
    const etiquette = document.createElement("strong");

    etiquette.textContent = `${nom} : `;
    paragraphe.appendChild(etiquette);

    paragraphe.appendChild(
        document.createTextNode(
            Array.isArray(valeur)
                ? valeur.join(", ")
                : String(valeur)
        )
    );

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

chargerDictionnaire();
