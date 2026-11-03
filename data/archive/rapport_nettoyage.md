# Rapport de nettoyage — DicMed

Source : `dictionnaire__1_.json` (1.68 Mo, 960 fiches) → `termes.json` (0.90 Mo, 940 fiches)

## Ce qui a été fait

- Doublons fusionnés (même nom) : **20**
- Champ `contenu_original` retiré (copie brute du texte Word, non affichée par le site)
- Étymologies génériques retirées : **95**
- Noms en MAJUSCULES remis en casse normale : **390**
- Noms latins séparés du nom français (`latin`) : **62**
- Synonymes extraits des noms (« muscle … ») : **4**
- Pathologies recollées dans « fonction » séparées proprement : **109** (non découpables, laissées en un bloc : 0)
- Titres de section parasites retirés (ex. « III. MÉNINGES » en fin de texte) : **23**
- Champs contenant seulement un tiret « — » retirés : **6**
- Retours à la ligne au milieu des phrases (issus de Word) recollés
- Préfixe « Nature : » séparé de la définition (`nature`) : **27**
- Catégories : 102 sections d'origine → `type` + `systeme` + `categorie` (libellé nettoyé)
- `resume` : première phrase de la définition (pour les cartes de la liste)
- Contrôle : chaque numéro de fiche source se retrouve dans la sortie

## Répartition

Par type : anatomie 444, muscle 218, tissu 107, hormone 95, maladie 76

Par système : Locomoteur 268, Digestif 116, Tissus et cellules 107, Endocrinien 96, Reproducteur 71, Système nerveux 66, Cardiovasculaire 65, Organes des sens 52, Respiratoire 45, Grossesse et fœtus 20, Sang et immunité 20, Peau et annexes 14

## À vérifier : doublons fusionnés avec contenus différents (50)

- **Glandes sébacées** — `definition`
  - gardé (le plus long) : Les glandes sébacées sont des glandes exocrines généralement associées aux follicules pileux. Elles sont particulièrement nombreuses sur le visage et le cuir chevelu.
  - autre version (non gardée) : Les glandes sébacées sont des glandes exocrines généralement annexées aux follicules pileux et produisant le sébum.
- **Glandes sébacées** — `fonction`
  - gardé (le plus long) : Elles produisent le sébum, une substance lipidique qui contribue à lubrifier et protéger la peau et les poils.
  - autre version (non gardée) : Le sébum lubrifie la peau et les poils et contribue à la fonction barrière de la surface cutanée.
- **Moelle osseuse** — `etymologie`
  - gardé (le plus long) : Moelle : du latin medulla, « partie intérieure » ou « substance molle ». Osseuse : du latin os, « os ».
  - autre version (non gardée) : Du latin medulla, « substance intérieure ».
- **Moelle osseuse** — `definition`
  - gardé (le plus long) : La moelle osseuse est un tissu situé à l'intérieur de certains os. Elle constitue un organe lymphoïde primaire et joue un rôle essentiel dans la production des cellules sanguines et immunitaires.
  - autre version (non gardée) : La moelle osseuse est le principal site de production des cellules sanguines chez l'adulte. Elle est située dans la cavité de certains os.
- **Moelle osseuse** — `fonction`
  - gardé (le plus long) : Elle assure l'hématopoïèse, c'est-à-dire la production des globules rouges, des plaquettes et des cellules sanguines immunitaires. Les lymphocytes B y poursuivent notamment leur maturation.
  - autre version (non gardée) : Elle assure l'hématopoïèse : production des globules rouges, des globules blancs et des plaquettes à partir de cellules souches hématopoïétiques.
- **Thymus** — `etymologie`
  - gardé (le plus long) : Du grec thymos, « thym » ou « énergie/vitalité ».
  - autre version (non gardée) : Du grec thymos.
- **Thymus** — `definition`
  - gardé (le plus long) : Le thymus est un organe lymphoïde primaire situé dans le médiastin antérieur. Il est particulièrement actif pendant l'enfance et diminue progressivement de volume et d'activité après la puberté.
  - autre version (non gardée) : Le thymus est un organe lymphoïde primaire situé dans la partie supérieure du thorax, derrière le sternum.
- **Thymus** — `fonction`
  - gardé (le plus long) : Il constitue le principal lieu de maturation et de sélection des lymphocytes T. Il joue donc un rôle essentiel dans la mise en place de l'immunité adaptative.
  - autre version (non gardée) : Il assure la maturation et la sélection des lymphocytes T, permettant le développement d'une réponse immunitaire adaptée et la tolérance au soi.
- **Rate** — `etymologie`
  - gardé (le plus long) : Le mot rate vient du latin splen, à l'origine de splénique.
  - autre version (non gardée) : Du grec splēn, « rate », à l'origine du terme splénique.
- **Rate** — `definition`
  - gardé (le plus long) : La rate est un organe lymphoïde secondaire situé dans l'hypochondre gauche. Elle joue également un rôle important dans la surveillance et l'épuration du sang.
  - autre version (non gardée) : La rate est un organe lymphoïde secondaire situé dans la partie supérieure gauche de l'abdomen, sous le diaphragme.
- **Rate** — `fonction`
  - gardé (le plus long) : Elle filtre le sang, participe à la destruction des globules rouges vieillissants et contribue aux réponses immunitaires contre les antigènes présents dans le sang. Elle constitue également une réserv
  - autre version (non gardée) : Elle élimine notamment les globules rouges vieillissants, participe aux réponses immunitaires contre les antigènes sanguins et constitue une réserve de certaines cellules sanguines.
- **Ganglions lymphatiques** — `etymologie`
  - gardé (le plus long) : Ganglion vient du grec ganglion, « nœud ». Lymphatique vient du latin lympha, « eau ».
  - autre version (non gardée) : Ganglion : du grec ganglion, « nœud ». Lymphatique : du latin lympha, « eau ».
- **Ganglions lymphatiques** — `definition`
  - gardé (le plus long) : Les ganglions lymphatiques sont de petits organes lymphoïdes secondaires disposés sur le trajet des vaisseaux lymphatiques.
  - autre version (non gardée) : Les ganglions lymphatiques sont de petits organes lymphoïdes secondaires répartis sur le trajet des vaisseaux lymphatiques.
- **Ganglions lymphatiques** — `fonction`
  - gardé (le plus long) : Ils filtrent la lymphe et permettent la rencontre entre les antigènes et les cellules immunitaires. Ils constituent notamment des sites importants d'activation et de prolifération des lymphocytes.
  - autre version (non gardée) : Ils filtrent la lymphe et constituent des lieux importants de rencontre entre les antigènes et les cellules immunitaires. Ils participent notamment à l'activation des lymphocytes.
- **Nerf oculomoteur (III)** — `etymologie`
  - gardé (le plus long) : Oculo- : du latin oculus, « œil ». Moteur : du latin motor, « celui qui met en mouvement ».
  - autre version (non gardée) : Du latin oculus, « œil », et motor, « moteur ».
- **Nerf oculomoteur (III)** — `definition`
  - gardé (le plus long) : Le nerf oculomoteur, ou IIIe nerf crânien, est principalement un nerf moteur. Il contient également des fibres parasympathiques destinées à l'œil.
  - autre version (non gardée) : Le IIIe nerf crânien est principalement moteur et possède également une composante parasympathique.
- **Nerf oculomoteur (III)** — `fonction`
  - gardé (le plus long) : Ses fibres parasympathiques contrôlent la constriction de la pupille et participent à l'accommodation du cristallin. Sa composante motrice commande plusieurs muscles responsables des mouvements du glo
  - autre version (non gardée) : Il commande plusieurs mouvements de l'œil, l'élévation de la paupière et participe à la constriction pupillaire et à l'accommodation.
- **Nerf facial (VII)** — `definition`
  - gardé (le plus long) : Le nerf facial, ou VIIe nerf crânien, est un nerf mixte. Il possède notamment une composante motrice, sensitive et parasympathique.
  - autre version (non gardée) : Le nerf facial est le VIIe nerf crânien et possède des composantes motrices, sensitives et parasympathiques.
- **Nerf facial (VII)** — `fonction`
  - gardé (le plus long) : Ses fibres parasympathiques stimulent notamment la sécrétion des glandes lacrymales et de certaines glandes salivaires. Le nerf facial commande également les muscles de l'expression du visage et parti
  - autre version (non gardée) : Il commande les muscles de l'expression faciale, participe au goût des deux tiers antérieurs de la langue et stimule certaines glandes lacrymales et salivaires.
- **Nerf glossopharyngien (IX)** — `etymologie`
  - gardé (le plus long) : Glosso- : du grec glôssa, « langue ». Pharyngien : du grec pharynx, « pharynx ».
  - autre version (non gardée) : Glosso- = langue ; pharyngien = pharynx.
- **Nerf glossopharyngien (IX)** — `definition`
  - gardé (le plus long) : Le nerf glossopharyngien, ou IXe nerf crânien, est un nerf mixte comportant notamment une composante parasympathique.
  - autre version (non gardée) : Le IXe nerf crânien est un nerf mixte.
- **Nerf glossopharyngien (IX)** — `fonction`
  - gardé (le plus long) : Ses fibres parasympathiques stimulent principalement la glande parotide et participent donc à la sécrétion salivaire. Le nerf intervient également dans la sensibilité et le goût du tiers postérieur de
  - autre version (non gardée) : Il participe au goût et à la sensibilité du tiers postérieur de la langue, à la déglutition et à la sécrétion de la glande parotide.
- **Nerf vague (X)** — `etymologie`
  - gardé (le plus long) : Vague : du latin vagus, « qui erre », en raison de son long trajet dans le cou et le thorax jusqu'à l'abdomen.
  - autre version (non gardée) : Du latin vagus, « errant ».
- **Nerf vague (X)** — `definition`
  - gardé (le plus long) : Le nerf vague, ou Xe nerf crânien, est le principal nerf parasympathique de l'organisme. Il possède un très long trajet et innerve de nombreux organes thoraciques et abdominaux.
  - autre version (non gardée) : Le nerf vague est le Xe nerf crânien et le principal nerf parasympathique crânien.
- **Nerf vague (X)** — `fonction`
  - gardé (le plus long) : Il participe à la régulation du cœur, des poumons et du tube digestif. Il ralentit notamment la fréquence cardiaque et stimule plusieurs fonctions digestives telles que la motricité et les sécrétions.
  - autre version (non gardée) : Il participe à la régulation du cœur, des poumons et de nombreux organes digestifs. Il intervient également dans la phonation et la déglutition.
- **Mandibule** — `definition`
  - gardé (le plus long) : La mandibule est l'os mobile de la mâchoire inférieure. Elle porte les dents inférieures et s'articule avec les os temporaux au niveau des articulations temporo-mandibulaires.
  - autre version (non gardée) : La mandibule est l'os mobile de la face. Elle porte les dents inférieures et s'articule avec les os temporaux.
- **Mandibule** — `fonction`
  - gardé (le plus long) : Participer à la mastication. Porter les dents inférieures. Participer à la parole. Participer à la déglutition. Permettre les mouvements de la mâchoire.
  - autre version (non gardée) : Permettre la mastication. Supporter les dents inférieures. Participer à la parole. Participer à la déglutition.
- **Sacrum** — `etymologie`
  - gardé (le plus long) : « Sacrum » vient du latin os sacrum, « os sacré ».
  - autre version (non gardée) : Voir n°18 : du latin os sacrum, « os sacré ».
- **Sacrum** — `definition`
  - gardé (le plus long) : Le sacrum est un os triangulaire situé à la base de la colonne vertébrale. Il résulte de la fusion de cinq vertèbres sacrées.
  - autre version (non gardée) : Le sacrum forme la partie postérieure du bassin et relie la colonne vertébrale aux deux os coxaux.
- **Sacrum** — `fonction`
  - gardé (le plus long) : Relier la colonne vertébrale au bassin. Transmettre le poids du corps vers les os iliaques. Participer à la formation du bassin.
  - autre version (non gardée) : Transmettre le poids du corps vers le bassin. Stabiliser le bassin. Participer à la protection des structures nerveuses sacrées.
- **Coccyx** — `etymologie`
  - gardé (le plus long) : « Coccyx » vient du grec kokkyx, « coucou », en raison de sa ressemblance supposée avec le bec de l'oiseau.
  - autre version (non gardée) : Du grec kokkyx, « coucou ».
- **Coccyx** — `definition`
  - gardé (le plus long) : Le coccyx est la partie terminale de la colonne vertébrale. Il résulte généralement de la fusion de plusieurs petites vertèbres coccygiennes.
  - autre version (non gardée) : Le coccyx est l'extrémité inférieure de la colonne vertébrale et constitue la partie terminale du bassin osseux.
- **Coccyx** — `fonction`
  - gardé (le plus long) : Servir de point d'insertion à certains muscles et ligaments. Participer au soutien lors de la position assise.
  - autre version (non gardée) : Servir d'insertion à plusieurs muscles et ligaments. Participer à la stabilité en position assise.
- **Gencives** — `definition`
  - gardé (le plus long) : La gencive est une partie de la muqueuse buccale qui entoure et protège les dents ainsi que les tissus qui les soutiennent.
  - autre version (non gardée) : Les gencives sont des tissus muqueux qui entourent et soutiennent les dents au niveau des arcades dentaires.
- **Gencives** — `fonction`
  - gardé (le plus long) : Protéger les tissus autour des dents. Participer à l'étanchéité autour des dents. Participer à la protection contre les agressions mécaniques et microbiennes.
  - autre version (non gardée) : Protéger les tissus entourant les dents. Participer au maintien des dents. Former une barrière contre les agressions microbiennes.
- **Langue** — `definition`
  - gardé (le plus long) : La langue est un organe musculaire mobile situé dans la cavité buccale. Elle possède des papilles et des bourgeons gustatifs impliqués dans la perception du goût.
  - autre version (non gardée) : La langue est un organe musculaire situé dans la cavité buccale. Elle possède une partie mobile et une partie fixée à la région postérieure de la bouche.
- **Langue** — `fonction`
  - gardé (le plus long) : Participer à la mastication. Déplacer les aliments dans la bouche. Participer à la déglutition. Participer à la parole. Participer à la perception du goût. Participer au nettoyage de la cavité buccale
  - autre version (non gardée) : Participer à la mastication. Mélanger les aliments avec la salive. Former et déplacer le bol alimentaire. Participer à la déglutition. Participer à la perception du goût. Participer à la parole.
- **Amygdales palatines** — `etymologie`
  - gardé (le plus long) : Amygdale vient du grec amygdalē, « amande », en raison de sa forme. Palatine vient du latin palatum, « palais ».
  - autre version (non gardée) : « Amygdale » vient du grec amygdalē, « amande », en raison de leur forme.
- **Amygdales palatines** — `definition`
  - gardé (le plus long) : Les amygdales palatines sont deux organes lymphoïdes situés de chaque côté de l'oropharynx, entre les arcs palatoglosse et palatopharyngien.
  - autre version (non gardée) : Les amygdales palatines sont deux masses de tissu lymphoïde situées de chaque côté de l'oropharynx, entre les arcs palatins.
- **Amygdales palatines** — `fonction`
  - gardé (le plus long) : Participer à la défense immunitaire. Reconnaître certains agents infectieux pénétrant par la bouche ou le nez. Participer à la réponse immunitaire locale.
  - autre version (non gardée) : Elles participent à la surveillance immunitaire des agents infectieux pénétrant par la bouche et le pharynx.
- **Glandes salivaires** — `definition`
  - gardé (le plus long) : Les glandes salivaires sont des glandes qui produisent la salive. Les principales sont les glandes parotides, submandibulaires et sublinguales, auxquelles s'ajoutent de nombreuses petites glandes sali
  - autre version (non gardée) : Les glandes salivaires sont des glandes exocrines qui produisent la salive et la déversent dans la cavité buccale. Les principales sont les glandes parotides, submandibulaires et sublinguales.
- **Glandes salivaires** — `fonction`
  - gardé (le plus long) : Produire la salive. Humidifier les aliments. Faciliter la mastication et la déglutition. Commencer la digestion de certains nutriments, notamment grâce à l'amylase salivaire. Participer à la protectio
  - autre version (non gardée) : Produire la salive. Humidifier les aliments. Faciliter la mastication et la déglutition. Commencer la digestion des glucides grâce notamment à l'amylase salivaire. Participer à la protection de la bou
- **Appendice** — `etymologie`
  - gardé (le plus long) : « Appendice » vient du latin appendere, « être suspendu à ».
  - autre version (non gardée) : Du latin appendix, « ce qui est attaché » ou « ajouté ».
- **Appendice** — `definition`
  - gardé (le plus long) : L'appendice vermiforme est un prolongement tubulaire du cæcum contenant une quantité importante de tissu lymphoïde, particulièrement durant certaines périodes de la vie.
  - autre version (non gardée) : L'appendice vermiforme est un prolongement tubulaire étroit du cæcum. Il contient une importante quantité de tissu lymphoïde.
- **Appendice** — `fonction`
  - gardé (le plus long) : Participer à la fonction immunitaire intestinale. Participer au maintien du microbiote intestinal, selon les données actuelles.
  - autre version (non gardée) : Il participe à l'immunité intestinale et contient du tissu lymphoïde associé à la muqueuse digestive.
- **Veines hépatiques** — `definition`
  - gardé (le plus long) : Les veines hépatiques sont les veines qui drainent le sang du foie vers la veine cave inférieure. On distingue principalement : Veine hépatique droite Veine hépatique moyenne Veine hépatique gauche
  - autre version (non gardée) : Les veines hépatiques drainent le sang provenant du foie vers la veine cave inférieure.
- **Veines hépatiques** — `fonction`
  - gardé (le plus long) : Assurer le drainage veineux du foie. Ramener le sang du foie vers la veine cave inférieure. Participer au retour du sang hépatique vers le cœur.
  - autre version (non gardée) : Assurer le drainage veineux du foie. Participer au retour du sang vers le cœur.
- **Muscle platysma** — `fonction`
  - gardé (le plus long) : tend la peau du cou, abaisse la mandibule et peut attirer vers le bas la lèvre inférieure et la commissure labiale.
  - autre version (non gardée) : tend la peau du cou, abaisse la mandibule et peut tirer vers le bas la lèvre inférieure et la commissure labiale.
- **Diaphragme** — `etymologie`
  - gardé (le plus long) : du grec diaphragma, signifiant « séparation ».
  - autre version (non gardée) : Du grec diaphragma, « séparation, cloison ».
- **Diaphragme** — `fonction`
  - gardé (le plus long) : principal muscle inspiratoire ; sa contraction abaisse les coupoles et augmente le volume thoracique. Il participe également à la pression abdominale.
  - autre version (non gardée) : Lorsqu'il se contracte, il s'abaisse et augmente le volume de la cage thoracique, permettant l'entrée de l'air dans les poumons.

## À vérifier : doublons venant de sections différentes (19)

- Glandes sébacées : « Peau » / « Annexes cutanées »
- Moelle osseuse : « Organes hématopoïétiques » / « Organes de l’immunité »
- Thymus : « Organes hématopoïétiques » / « Organes de l’immunité »
- Rate : « Organes hématopoïétiques » / « Organes de l’immunité »
- Ganglions lymphatiques : « Organes hématopoïétiques » / « Organes de l’immunité »
- Nerf oculomoteur (III) : « Système nerveux périphérique » / « Système parasympathique »
- Nerf facial (VII) : « Système nerveux périphérique » / « Système parasympathique »
- Nerf glossopharyngien (IX) : « Système nerveux périphérique » / « Système parasympathique »
- Nerf vague (X) : « Système nerveux périphérique » / « Système parasympathique »
- Mandibule : « Mandibule » / « Os de la face »
- Sacrum : « Colonne vertébrale » / « Bassin »
- Coccyx : « Colonne vertébrale » / « Bassin »
- Gencives : « Gencives » / « Bouche »
- Langue : « Langue » / « Bouche »
- Amygdales palatines : « Organes de l’immunité » / « Bouche »
- Glandes salivaires : « Glandes » / « Bouche »
- Appendice : « Organes de l’immunité » / « Gros intestin »
- Veines hépatiques : « Gros intestin » / « Veines du système cardiovasculaire »
- Diaphragme : « Appareil respiratoire » / « Anatomie et histologie »

## À vérifier : fiches quasi identiques, non fusionnées (6)

Même nerf présent sous deux noms (avec et sans numéro de paire crânienne) : à fusionner ou à distinguer.

- Nerf facial / Nerf facial (VII)
- Nerf glossopharyngien / Nerf glossopharyngien (IX)
- Nerf olfactif / Nerf olfactif (I)
- Nerf optique / Nerf optique (II)
- Nerf vague / Nerf vague (X)
- Nerf vestibulocochléaire / Nerf vestibulocochléaire (VIII)

## À compléter : fiches sans définition (108)

**muscle** (105) : Deuxième muscle interosseux dorsal du pied ; Deuxième muscle interosseux plantaire du pied ; Deuxième muscle lombrical du pied ; Muscle abducteur de l’hallux ; Muscle abducteur du petit orteil ; Muscle adducteur de l’hallux ; Muscle anconé ; Muscle articulaire du genou ; Muscle biceps brachial ; Muscle biceps fémoral ; Muscle brachial ; Muscle bulbo-spongieux ; Muscle carré des lombes ; Muscle coccygien ou ischio-coccygien ; Muscle coraco-brachial ; Muscle court adducteur ; Muscle court extenseur de l’hallux ; Muscle court extenseur des orteils ; Muscle court fibulaire ; Muscle court fléchisseur de l’hallux ; Muscle court fléchisseur du petit orteil ; Muscle crémaster ; Muscle dartos ; Muscle deltoïde ; Muscle dentelé antérieur ; Muscle dentelé postérieur inférieur ; Muscle dentelé postérieur supérieur ; Muscle droit de l'abdomen ; Muscle élévateur de l'anus ; Muscle épineux ; Muscle gastrocnémien ; Muscle gracile ; Muscle grand adducteur ; Muscle grand dorsal ; Muscle grand pectoral ; Muscle grand rond ; Muscle iliaque ; Muscle ilio-coccygien ; Muscle ilio-costal ; Muscle infra-épineux ; Muscle intercostal externe ; Muscle intercostal interne ; Muscle intercostal intime ; Muscle ischio-caverneux ; Muscle long adducteur ; Muscle long extenseur de l’hallux ; Muscle long extenseur des orteils ; Muscle long fibulaire ; Muscle long fléchisseur de l’hallux ; Muscle long fléchisseur des orteils ; Muscle longissimus ; Muscle multifide ; Muscle oblique externe de l'abdomen ; Muscle oblique inférieur de la tête ; Muscle oblique interne de l'abdomen ; Muscle opposant du petit orteil ; Muscle pectiné ; Muscle petit pectoral ; Muscle petit rond ; Muscle plantaire ; Muscle poplité ; Muscle psoas majeur ; Muscle psoas mineur ; Muscle pubo-coccygien ; Muscle pubo-rectal ; Muscle pyramidal ; Muscle semi-épineux de la tête ; Muscle semi-épineux du cou ; Muscle semi-épineux du thorax ; Muscle semi-membraneux ; Muscle semi-tendineux ; Muscle soléaire ; Muscle sphincter externe de l'anus ; Muscle sphincter externe de l'urètre ; Muscle splénius de la tête ; Muscle splénius du cou ; Muscle subclavier ; Muscle subcostal ; Muscle subscapulaire ; Muscle supra-épineux ; Muscle tibial antérieur ; Muscle tibial postérieur ; Muscle transverse de l'abdomen ; Muscle transverse du thorax ; Muscle transverse profond du périnée ; Muscle transverse superficiel du périnée ; Muscle trapèze ; Muscle triceps brachial ; Muscle troisième fibulaire ; Muscle vaste intermédiaire ; Muscle vaste latéral ; Muscle vaste médial ; Muscles élévateurs des côtes ; Muscles interépineux ; Muscles intertransversaires ; Muscles rotateurs courts ; Muscles rotateurs longs ; Premier muscle interosseux dorsal du pied ; Premier muscle interosseux plantaire du pied ; Premier muscle lombrical du pied ; Quatrième muscle interosseux dorsal du pied ; Quatrième muscle lombrical du pied ; Troisième muscle interosseux dorsal du pied ; Troisième muscle interosseux plantaire du pied ; Troisième muscle lombrical du pied

**anatomie** (2) : t ; ⁸

**tissu** (1) : Tissu musculaire

## À classer : fiches sans système (0)

Aucune.

## Noms dont la casse a été corrigée (390)

DENTS INCISIVES → Dents incisives ; CANINES → Canines ; PRÉMOLAIRES → Prémolaires ; MOLAIRES → Molaires ; DENTS DE SAGESSE → Dents de sagesse ; GENCIVES → Gencives ; LANGUE → Langue ; MAXILLAIRE → Maxillaire ; MANDIBULE → Mandibule ; ARTICULATION TEMPORO-MANDIBULAIRE → Articulation temporo-mandibulaire ; MUSCLES MASTICATEURS → Muscles masticateurs ; GLANDES SALIVAIRES → Glandes salivaires ; FRONTAL → Frontal ; PARIÉTAUX → Pariétaux ; TEMPORAUX → Temporaux ; OCCIPITAL → Occipital ; SPHÉNOÏDE → Sphénoïde ; ETHMOÏDE → Ethmoïde ; MAXILLAIRES → Maxillaires ; MANDIBULE → Mandibule ; ZYGOMATIQUES → Zygomatiques ; NASAUX → Nasaux ; LACRYMAUX → Lacrymaux ; PALATINS → Palatins ; VOMER → Vomer ; COLONNE VERTÉBRALE → Colonne vertébrale ; 7 VERTÈBRES CERVICALES → 7 vertèbres cervicales ; 12 VERTÈBRES THORACIQUES → 12 vertèbres thoraciques ; 5 VERTÈBRES LOMBAIRES → 5 vertèbres lombaires ; SACRUM → Sacrum ; COCCYX → Coccyx ; STERNUM → Sternum ; 12 PAIRES DE CÔTES → 12 paires de côtes ; CARTILAGES COSTAUX → Cartilages costaux ; CLAVICULE → Clavicule ; SCAPULA → Scapula ; HUMÉRUS → Humérus ; RADIUS → Radius ; ULNA → Ulna ; OS DU CARPE → Os du carpe ; MÉTACARPIENS → Métacarpiens ; PHALANGES DE LA MAIN → Phalanges de la main ; ILION → Ilion ; ISCHION → Ischion ; PUBIS → Pubis ; SACRUM → Sacrum ; COCCYX → Coccyx ; FÉMUR → Fémur ; PATELLA → Patella ; TIBIA → Tibia ; FIBULA → Fibula ; OS DU TARSE → Os du tarse ; MÉTATARSIENS → Métatarsiens ; PHALANGES DU PIED → Phalanges du pied ; ÉPAULE → Épaule ; COUDE → Coude ; POIGNET → Poignet ; HANCHE → Hanche ; GENOU → Genou ; CHEVILLE → Cheville ; ARTICULATIONS INTERVERTÉBRALES → Articulations intervertébrales ; DELTOÏDE → Deltoïde ; GRAND PECTORAL → Grand pectoral ; GRAND DORSAL → Grand dorsal ; TRAPÈZE → Trapèze ; BICEPS BRACHIAL → Biceps brachial ; TRICEPS BRACHIAL → Triceps brachial ; MUSCLES DE L'AVANT-BRAS → Muscles de l'avant-bras ; MUSCLES ABDOMINAUX → Muscles abdominaux ; GRAND FESSIER → Grand fessier ; QUADRICEPS → Quadriceps ; ISCHIO-JAMBIERS → Ischio-jambiers ; TRICEPS SURAL → Triceps sural ; MUSCLES INTRINSÈQUES DU PIED → Muscles intrinsèques du pied ; TENDONS → Tendons ; LIGAMENTS → Ligaments ; CARTILAGES → Cartilages ; FASCIAS → Fascias ; BOURSES SÉREUSES → Bourses séreuses ; PLACENTA → Placenta ; PLAQUE CHORIALE → Plaque choriale ; PLAQUE BASALE → Plaque basale ; VILLOSITÉS CHORIALES → Villosités choriales ; ESPACES INTERVILLEUX → Espaces intervilleux ; CORDON OMBILICAL → Cordon ombilical ; DEUX ARTÈRES OMBILICALES → Deux artères ombilicales ; UNE VEINE OMBILICALE → Une veine ombilicale ; GELÉE DE WHARTON → Gelée de wharton ; AMNIOS → Amnios ; CHORION → Chorion ; FŒTUS → Fœtus ; TÊTE → Tête ; THORAX → Thorax ; ABDOMEN → Abdomen ; BASSIN → Bassin ; MEMBRES SUPÉRIEURS → Membres supérieurs ; MEMBRES INFÉRIEURS → Membres inférieurs ; ORGANES INTERNES → Organes internes ; PAPILLES FILIFORMES → Papilles filiformes ; PAPILLES FONGIFORMES → Papilles fongiformes ; PAPILLES CIRCUMVALLÉES → Papilles circumvallées ; PAPILLES FOLIÉES → Papilles foliées ; BOURGEONS GUSTATIFS → Bourgeons gustatifs ; NERF FACIAL → Nerf facial ; NERF GLOSSOPHARYNGIEN → Nerf glossopharyngien ; NERF VAGUE → Nerf vague ; OREILLE EXTERNE → Oreille externe ; PAVILLON → Pavillon ; CONDUIT AUDITIF EXTERNE → Conduit auditif externe ; TYMPAN → Tympan ; OREILLE MOYENNE → Oreille moyenne ; MARTEAU → Marteau ; ENCLUME → Enclume ; ÉTRIER → Étrier ; TROMPE D'EUSTACHE → Trompe d'eustache ; CAVITÉ TYMPANIQUE → Cavité tympanique ; OREILLE INTERNE → Oreille interne ; COCHLÉE → Cochlée ; VESTIBULE → Vestibule ; CANAUX SEMI-CIRCULAIRES → Canaux semi-circulaires ; NERF VESTIBULOCOCHLÉAIRE → Nerf vestibulocochléaire ; ORGANE DE CORTI → Organe de corti ; FOSSES NASALES → Fosses nasales ; MUQUEUSE OLFACTIVE → Muqueuse olfactive ; RÉCEPTEURS OLFACTIFS → Récepteurs olfactifs ; BULBE OLFACTIF → Bulbe olfactif ; NERF OLFACTIF → Nerf olfactif ; TRACTUS OLFACTIF → Tractus olfactif ; CORNÉE → Cornée ; SCLÈRE → Sclère ; CHOROÏDE → Choroïde ; IRIS → Iris ; PUPILLE → Pupille ; CORPS CILIAIRE → Corps ciliaire ; CRISTALLIN → Cristallin ; RÉTINE → Rétine ; MACULA → Macula ; FOVÉA → Fovéa ; NERF OPTIQUE → Nerf optique ; HUMEUR AQUEUSE → Humeur aqueuse ; HUMEUR VITRÉE → Humeur vitrée ; PAUPIÈRES → Paupières ; CILS → Cils ; CONJONCTIVE → Conjonctive ; GLANDE LACRYMALE → Glande lacrymale ; CANAL LACRYMAL → Canal lacrymal ; SAC LACRYMAL → Sac lacrymal ; MUSCLES OCULOMOTEURS → Muscles oculomoteurs ; BOUCHE → Bouche ; LÈVRES → Lèvres ; JOUES → Joues ; PALAIS DUR → Palais dur ; PALAIS MOU → Palais mou ; L'LUETTE (UVULE) → Luette (uvule) ; GENCIVES → Gencives ; DENTS → Dents ; LANGUE → Langue ; AMYGDALES PALATINES → Amygdales palatines ; GLANDES SALIVAIRES → Glandes salivaires ; GLANDE PAROTIDE → Glande parotide ; GLANDE SUBMANDIBULAIRE → Glande submandibulaire ; GLANDE SUBLINGUALE → Glande sublinguale ; PHARYNX → Pharynx ; NASOPHARYNX → Nasopharynx ; OROPHARYNX → Oropharynx ; LARYNGOPHARYNX → Laryngopharynx ; ŒSOPHAGE → Œsophage ; SPHINCTER ŒSOPHAGIEN SUPÉRIEUR → Sphincter œsophagien supérieur ; ŒSOPHAGE CERVICAL → Œsophage cervical ; ŒSOPHAGE THORACIQUE → Œsophage thoracique ; ŒSOPHAGE ABDOMINAL → Œsophage abdominal ; SPHINCTER ŒSOPHAGIEN INFÉRIEUR → Sphincter œsophagien inférieur ; ESTOMAC → Estomac ; CARDIA → Cardia ; FUNDUS GASTRIQUE → Fundus gastrique ; CORPS GASTRIQUE → Corps gastrique ; ANTRE PYLORIQUE → Antre pylorique ; PYLORE → Pylore ; PETITE COURBURE → Petite courbure ; GRANDE COURBURE → Grande courbure ; MUQUEUSE GASTRIQUE → Muqueuse gastrique ; INTESTIN GRÊLE → Intestin grêle ; DUODÉNUM → Duodénum ; BULBE DUODÉNAL → Bulbe duodénal ; D2 — DEUXIÈME PORTION DU DUODÉNUM → D2 — deuxième portion du duodénum ; D3 — TROISIÈME PORTION DU DUODÉNUM → D3 — troisième portion du duodénum ; D4 — QUATRIÈME PORTION DU DUODÉNUM → D4 — quatrième portion du duodénum ; JÉJUNUM → Jéjunum ; ILÉON → Iléon ; VALVULE ILÉO-CÆCALE → Valvule iléo-cæcale ; GROS INTESTIN → Gros intestin ; CÆCUM → Cæcum ; APPENDICE → Appendice ; CÔLON ASCENDANT → Côlon ascendant ; ANGLE COLIQUE DROIT → Angle colique droit ; CÔLON TRANSVERSE → Côlon transverse ; ANGLE COLIQUE GAUCHE → Angle colique gauche ; CÔLON DESCENDANT → Côlon descendant ; CÔLON SIGMOÏDE → Côlon sigmoïde ; RECTUM → Rectum ; CANAL ANAL → Canal anal ; ANUS → Anus ; FOIE → Foie ; LOBE DROIT → Lobe droit ; LOBE GAUCHE → Lobe gauche ; LOBE CAUDÉ → Lobe caudé ; LOBE CARRÉ → Lobe carré ; SEGMENTS HÉPATIQUES → Segments hépatiques ; CAPSULE DE GLISSON → Capsule de glisson ; VEINE PORTE → Veine porte ; ARTÈRE HÉPATIQUE → Artère hépatique ; VEINES HÉPATIQUES → Veines hépatiques ; CANAUX BILIAIRES → Canaux biliaires ; VÉSICULE BILIAIRE → Vésicule biliaire ; FUNDUS DE LA VÉSICULE BILIAIRE → Fundus de la vésicule biliaire ; CORPS DE LA VÉSICULE BILIAIRE → Corps de la vésicule biliaire ; COL DE LA VÉSICULE BILIAIRE → Col de la vésicule biliaire ; CANAL CYSTIQUE → Canal cystique ; CANAUX HÉPATIQUES DROIT ET GAUCHE → Canaux hépatiques droit et gauche ; CANAL HÉPATIQUE COMMUN → Canal hépatique commun ; CANAL CHOLÉDOQUE → Canal cholédoque ; AMPOULE DE VATER → Ampoule de vater ; PANCRÉAS → Pancréas ; TÊTE DU PANCRÉAS → Tête du pancréas ; COL DU PANCRÉAS → Col du pancréas ; CORPS DU PANCRÉAS → Corps du pancréas ; QUEUE DU PANCRÉAS → Queue du pancréas ; CANAL PANCRÉATIQUE PRINCIPAL → Canal pancréatique principal ; CANAL PANCRÉATIQUE ACCESSOIRE → Canal pancréatique accessoire ; PÉNIS → Pénis ; GLAND → Gland ; PRÉPUCE → Prépuce ; SCROTUM → Scrotum ; TESTICULE DROIT → Testicule droit ; TESTICULE GAUCHE → Testicule gauche ; ALBUGINÉE → Albuginée ; TUBES SÉMINIFÈRES → Tubes séminifères ; RETE TESTIS → Rete testis ; ÉPIDIDYME → Épididyme ; TÊTE DE L'ÉPIDIDYME → Tête de l'épididyme ; CORPS DE L'ÉPIDIDYME → Corps de l'épididyme ; QUEUE DE L'ÉPIDIDYME → Queue de l'épididyme ; CANAL DÉFÉRENT → Canal déférent ; CANAL ÉJACULATEUR → Canal éjaculateur ; URÈTRE MASCULIN → Urètre masculin ; VÉSICULES SÉMINALES → Vésicules séminales ; PROSTATE → Prostate ; GLANDES BULBO-URÉTRALES → Glandes bulbo-urétrales ; VAGIN → Vagin ; ORIFICE VAGINAL → Orifice vaginal ; PAROI VAGINALE → Paroi vaginale ; FORNIX VAGINAL → Fornix vaginal ; UTÉRUS → Utérus ; FOND UTÉRIN → Fond utérin ; CORPS UTÉRIN → Corps utérin ; ISTHME UTÉRIN → Isthme utérin ; COL UTÉRIN → Col utérin ; CANAL CERVICAL → Canal cervical ; ENDOMÈTRE → Endomètre ; MYOMÈTRE → Myomètre ; PÉRIMÈTRE → Périmètre ; TROMPES UTÉRINES → Trompes utérines ; INFUNDIBULUM → Infundibulum ; FIMBRIAE → Fimbriae ; AMPOULE TUBAIRE → Ampoule tubaire ; ISTHME DE LA TROMPE → Isthme de la trompe ; PARTIE UTÉRINE DE LA TROMPE → Partie utérine de la trompe ; OVAIRES → Ovaires ; OVAIRE DROIT → Ovaire droit ; FOLLICULES OVARIENS → Follicules ovariens ; OVAIRE GAUCHE → Ovaire gauche ; CORTEX OVARIEN → Cortex ovarien ; MÉDULLA OVARIENNE → Médulla ovarienne ; CORPS JAUNE → Corps jaune ; MONT DU PUBIS → Mont du pubis ; GRANDES LÈVRES → Grandes lèvres ; PETITES LÈVRES → Petites lèvres ; CLITORIS → Clitoris ; VESTIBULE VULVAIRE → Vestibule vulvaire ; GLANDES DE BARTHOLIN → Glandes de bartholin ; GLANDES PARA-URÉTRALES → Glandes para-urétrales ; ARTÈRES CAROTIDES → Artères carotides ; ARTÈRES SOUS-CLAVIÈRES → Artères sous-clavières ; ARTÈRES AXILLAIRES → Artères axillaires ; ARTÈRES BRACHIALES → Artères brachiales ; ARTÈRES RADIALES → Artères radiales ; ARTÈRES ULNAIRES → Artères ulnaires ; ARTÈRES RÉNALES → Artères rénales ; ARTÈRES HÉPATIQUES → Artères hépatiques ; ARTÈRES SPLÉNIQUES → Artères spléniques ; ARTÈRES MÉSENTÉRIQUES → Artères mésentériques ; ARTÈRES ILIAQUES → Artères iliaques ; ARTÈRES FÉMORALES → Artères fémorales ; ARTÈRES POPLITÉES → Artères poplitées ; ARTÈRES TIBIALES → Artères tibiales ; ARTÈRES FIBULAIRES → Artères fibulaires ; ARTÈRES DORSALES DU PIED → Artères dorsales du pied ; VEINES JUGULAIRES → Veines jugulaires ; VEINES SOUS-CLAVIÈRES → Veines sous-clavières ; VEINES BRACHIOCÉPHALIQUES → Veines brachiocéphaliques ; VEINES AXILLAIRES → Veines axillaires ; VEINES BRACHIALES → Veines brachiales ; VEINES RADIALES → Veines radiales ; VEINES ULNAIRES → Veines ulnaires ; VEINES RÉNALES → Veines rénales ; VEINE PORTE HÉPATIQUE → Veine porte hépatique ; VEINES HÉPATIQUES → Veines hépatiques ; VEINES ILIAQUES → Veines iliaques ; VEINES FÉMORALES → Veines fémorales ; VEINE POPLITÉE → Veine poplitée ; VEINES SAPHÈNES → Veines saphènes ; CŒUR → Cœur ; OREILLETTE DROITE → Oreillette droite ; OREILLETTE GAUCHE → Oreillette gauche ; VENTRICULE DROIT → Ventricule droit ; VENTRICULE GAUCHE → Ventricule gauche ; SEPTUM INTERAURICULAIRE → Septum interauriculaire ; VALVULE TRICUSPIDE → Valvule tricuspide ; VALVULE AORTIQUE → Valvule aortique ; VALVULE PULMONAIRE → Valvule pulmonaire ; ENDOCARDE → Endocarde ; MYOCARDE → Myocarde ; PÉRICARDE → Péricarde ; NŒUD SINUSAL → Nœud sinusal ; NŒUD AURICULO-VENTRICULAIRE → Nœud auriculo-ventriculaire ; FAISCEAU DE HIS → Faisceau de his ; ARTÈRES CORONAIRES → Artères coronaires ; AORTE → Aorte ; ARTÈRE PULMONAIRE → Artère pulmonaire ; ARTÈRES → Artères ; VEINES → Veines ; VEINE CAVE SUPÉRIEURE → Veine cave supérieure ; VEINE CAVE INFÉRIEURE → Veine cave inférieure ; VEINES PULMONAIRES → Veines pulmonaires ; CAPILLAIRES SANGUINS → Capillaires sanguins ; SYSTÈME VASCULAIRE → Système vasculaire ; SYSTÈME DE CONDUCTION CARDIAQUE → Système de conduction cardiaque ; CIRCULATION SANGUINE → Circulation sanguine ; CIRCULATION PULMONAIRE → Circulation pulmonaire ; CIRCULATION SYSTÉMIQUE → Circulation systémique ; REFLUX GASTRO-ŒSOPHAGIEN (RGO) → Reflux gastro-œsophagien (RGO) ; ŒSOPHAGITE → Œsophagite ; CANCER DE L’ŒSOPHAGE → Cancer de l’œsophage ; GASTRITE → Gastrite ; ULCÈRE GASTRO-DUODÉNAL → Ulcère gastro-duodénal ; GASTRO-ENTÉRITE INFECTIEUSE → Gastro-entérite infectieuse ; MALADIE CŒLIAQUE → Maladie cœliaque ; MALADIE DE CROHN → Maladie de crohn ; RECTOCOLITE HÉMORRAGIQUE → Rectocolite hémorragique ; APPENDICITE AIGUË → Appendicite aiguë ; OCCLUSION INTESTINALE → Occlusion intestinale ; DIVERTICULITE → Diverticulite ; HÉPATITE VIRALE → Hépatite virale ; CIRRHOSE HÉPATIQUE → Cirrhose hépatique ; LITHIASE BILIAIRE → Lithiase biliaire ; CHOLÉCYSTITE AIGUË → Cholécystite aiguë ; PANCRÉATITE AIGUË → Pancréatite aiguë ; PANCRÉATITE CHRONIQUE → Pancréatite chronique ; HÉPATITE ALCOOLIQUE → Hépatite alcoolique ; STÉATOSE HÉPATIQUE MÉTABOLIQUE → Stéatose hépatique métabolique ; ABCÈS HÉPATIQUE → Abcès hépatique ; CHOLANGITE AIGUË → Cholangite aiguë ; CANCER DU PANCRÉAS → Cancer du pancréas ; CANCER COLORECTAL → Cancer colorectal ; CANCER DE L’ESTOMAC → Cancer de l’estomac ; CANCER DU FOIE → Cancer du foie ; HÉMORROÏDES → Hémorroïdes ; FISSURE ANALE → Fissure anale ; FISTULE ANALE → Fistule anale ; CANCER DE L’ANUS → Cancer de l’anus ; RHINITE ALLERGIQUE → Rhinite allergique ; SINUSITE → Sinusite ; PHARYNGITE → Pharyngite ; LARYNGITE → Laryngite ; BRONCHITE AIGUË → Bronchite aiguë ; BRONCHOPNEUMOPATHIE CHRONIQUE OBSTRUCTIVE (BPCO) → Bronchopneumopathie chronique obstructive (BPCO) ; ASTHME → Asthme ; PNEUMONIE → Pneumonie ; TUBERCULOSE PULMONAIRE → Tuberculose pulmonaire ; PLEURÉSIE → Pleurésie ; PNEUMOTHORAX → Pneumothorax ; EMBOLIE PULMONAIRE → Embolie pulmonaire ; ŒDÈME PULMONAIRE → Œdème pulmonaire ; CANCER DU POUMON → Cancer du poumon ; APNÉE OBSTRUCTIVE DU SOMMEIL → Apnée obstructive du sommeil ; BRONCHIOLITE AIGUË → Bronchiolite aiguë ; COQUELUCHE → Coqueluche ; DIPHTÉRIE RESPIRATOIRE → Diphtérie respiratoire ; INSUFFISANCE RESPIRATOIRE AIGUË → Insuffisance respiratoire aiguë ; TISSU MUSCULAIRE → Tissu musculaire
