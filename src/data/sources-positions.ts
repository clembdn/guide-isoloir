/**
 * SOURCES DES POSITIONS.
 *
 * Distinctes des sources d'infobulles : une infobulle définit un terme et vient
 * d'une publication de référence ; une position vient d'un programme, d'une
 * déclaration ou d'un vote. Voir `src/data/questions.ts`.
 *
 * `dateDeclaration` est la date de ce qui a été dit ou publié. `consulteLe` est
 * la date de lecture. La confusion des deux est ce qui a coulé Elyze, qui
 * affichait en 2022 des propositions de 2017 sans que la date apparaisse.
 * `validerSourcesPositions` refuse une consultation antérieure à la déclaration.
 *
 * TOUTES LES URL CI-DESSOUS ONT ÉTÉ OUVERTES ET LUES le 18 septembre 2026, et
 * chaque citation attachée à une position a été relevée dans l'article, pas
 * résumée de mémoire.
 *
 * POURQUOI LCP. La chaîne parlementaire est un média public, ses articles sont
 * signés et datés, et elle publie des synthèses par thème qui citent les
 * candidats nommément. Ce n'est pas une source primaire : un programme officiel
 * ou une vidéo de meeting primerait dans la chaîne de résolution. C'est le
 * meilleur matériau disponible à sept mois du scrutin, et chaque position codée
 * depuis ces articles sera remplacée quand les programmes sortiront.
 */
import type { SourcePosition } from "../lib/acteurs";

export const SOURCES_POSITIONS = [
  {
    id: "lcp-debat-medef-2026",
    titre: "Présidentielle 2027 : ce qu'il faut retenir du premier débat entre les candidats",
    media: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/presidentielle-2027-ce-qu-il-faut-retenir-du-premier-debat-entre-les-candidats-440670",
    dateDeclaration: "2026-08-27",
    consulteLe: "2026-09-19",
    incoherenceRelevee:
      "La signature et la légende photo datent l'article du jeudi 27 août 2026, mais le corps du texte écrit « ce jeudi 26 août ». Le 27 août 2026 est un jeudi, le 26 un mercredi : la date retenue est le 27.",
  },
  {
    id: "lcp-retraites-candidats-2026",
    titre: "Présidentielle : que proposent les candidats à l'Élysée sur les retraites ?",
    media: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/presidentielle-que-proposent-les-candidats-a-l-elysee-sur-les-retraites-441751",
    dateDeclaration: "2026-09-16",
    consulteLe: "2026-09-19",
  },
  {
    id: "lcp-philippe-chomage-2026",
    titre:
      "Chômage : Édouard Philippe veut abaisser la durée d'indemnisation à douze mois maximum pour les moins de 50 ans",
    media: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/chomage-edouard-philippe-veut-abaisser-la-duree-d-indemnisation-a-douze-mois-maximum",
    dateDeclaration: "2026-08-27",
    consulteLe: "2026-09-19",
  },
  {
    id: "lcp-zemmour-candidature-2026",
    titre: "Présidentielle 2027 : Éric Zemmour officialise sa candidature",
    media: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/presidentielle-2027-eric-zemmour-officialise-sa-candidature-441871",
    dateDeclaration: "2026-09-17",
    consulteLe: "2026-09-19",
  },
  {
    id: "lcp-liste-candidats-2026",
    titre: "Présidentielle 2027 : la liste des candidats déjà en lice et des prétendants",
    media: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373",
    dateDeclaration: "2026-09-24",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Article publié le 15 mai 2026 et mis à jour au fil de la campagne. La date retenue est celle de la version relue, mise à jour le 24 septembre 2026 ; la version du 16 septembre, lue le 19, attestait déjà les statuts datés du 16.",
  },
  /*
   * DOCUMENTS DU RASSEMBLEMENT NATIONAL.
   *
   * POURQUOI PAS LE PROGRAMME PRÉSIDENTIEL 2027 : IL N'EXISTE PAS ENCORE.
   * Au 19 septembre 2026, le RN n'a publié aucun projet présidentiel pour 2027
   * et n'a pas désigné son candidat. Les trois documents ci-dessous sont ce que
   * le parti a effectivement publié, et rien d'autre n'a été utilisé : ni
   * synthèse de presse, ni comparateur, ni programme d'un autre scrutin
   * reconstitué de mémoire.
   *
   * Leur date est ancienne au regard du scrutin de 2027, et c'est précisément
   * pourquoi elle s'affiche. Une ligne de parti de juin 2024 reste une ligne de
   * parti ; la présenter sans sa date serait l'erreur d'Elyze.
   */
  {
    id: "rn-programme-legislatives-2024",
    titre:
      "L'Union fait la France — Élections législatives anticipées des 30 juin et 7 juillet 2024",
    media: "Rassemblement national",
    url: "https://rassemblementnational.fr/documents/202406-programme.pdf",
    dateDeclaration: "2024-06-25",
    consulteLe: "2026-09-19",
    incoherenceRelevee:
      "Le document ne porte aucune date de publication imprimée. La date retenue est celle de création du fichier PDF (25 juin 2024), cohérente avec le scrutin des 30 juin et 7 juillet 2024 annoncé en couverture.",
  },
  {
    id: "rn-programme-europeennes-2024",
    titre: "Notre projet pour une Europe des nations — Élections européennes du 9 juin 2024",
    media: "Rassemblement national",
    url: "https://rassemblementnational.fr/documents/202411-programme-europeennes.pdf",
    dateDeclaration: "2024-05-06",
    consulteLe: "2026-09-19",
    incoherenceRelevee:
      "Le nom du fichier commence par « 202411 », ce qui suggère novembre 2024, alors que la couverture vise le scrutin du 9 juin 2024 et que le PDF a été créé le 6 mai 2024. La date retenue est celle du fichier et du contenu, pas celle du nom.",
  },
  {
    id: "rn-contre-budget-2026",
    titre: "Contre-budget 2026 — conférence de presse du 23 octobre 2025",
    media: "Groupe Rassemblement National à l'Assemblée nationale",
    url: "https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf",
    dateDeclaration: "2025-10-23",
    consulteLe: "2026-09-19",
    incoherenceRelevee:
      "Émis par le groupe parlementaire, pas par le parti : c'est la position budgétaire du groupe RN à l'Assemblée. La date de couverture (23 octobre 2025) a été retenue plutôt que la date de création du fichier, postérieure d'un jour.",
  },
  /*
   * PROGRAMME DE JEAN-LUC MÉLENCHON — le seul programme présidentiel publié.
   *
   * « L'Avenir en commun » est le premier document de campagne de cette élection
   * à répondre point par point : c'est un programme de candidat, donc le maillon
   * le plus haut de la chaîne de résolution, et il prime sur tout relevé de
   * presse le concernant.
   *
   * UN CHAPITRE, UNE SOURCE. Le livre est publié chapitre par chapitre, chacun à
   * son URL et à sa date. Citer l'index reviendrait à renvoyer un lecteur vers
   * une table des matières pour qu'il retrouve seul la phrase ; citer le
   * chapitre lui donne la page où elle se trouve.
   */
  {
    id: "aec2027-chapitre-6",
    titre: "L'Avenir en commun — Chapitre 6 : Partage des richesses",
    media: "Jean-Luc Mélenchon, campagne présidentielle 2027",
    url: "https://melenchon2027.fr/chapitre-6-partage-des-richesses/",
    dateDeclaration: "2026-07-17",
    consulteLe: "2026-09-20",
    incoherenceRelevee:
      "Le livre se présente comme « L'Avenir en commun, édition 2025 (en cours de réactualisation) », mais ce chapitre a été publié sur le site de campagne le 17 juillet 2026. La date retenue est celle de la publication comme programme pour 2027, pas celle de l'édition dont il est tiré.",
  },
  {
    id: "aec2027-chapitre-8",
    titre: "L'Avenir en commun — Chapitre 8 : Travailler tous, travailler moins, travailler mieux",
    media: "Jean-Luc Mélenchon, campagne présidentielle 2027",
    url: "https://melenchon2027.fr/chapitre-8-travailler-tous-travailler-moins-travailler-mieux/",
    dateDeclaration: "2026-07-17",
    consulteLe: "2026-09-20",
  },
  {
    id: "aec2027-chapitre-10",
    titre: "L'Avenir en commun — Chapitre 10 : Faire place à la nouvelle France",
    media: "Jean-Luc Mélenchon, campagne présidentielle 2027",
    url: "https://melenchon2027.fr/chapitre-10-faire-place-a-la-nouvelle-france/",
    dateDeclaration: "2026-07-17",
    consulteLe: "2026-09-20",
  },
  {
    id: "aec2027-chapitre-13",
    titre: "L'Avenir en commun — Chapitre 13 : Les grands chantiers de la bifurcation écologique",
    media: "Jean-Luc Mélenchon, campagne présidentielle 2027",
    url: "https://melenchon2027.fr/chapitre-13-les-grands-chantiers-de-la-bifurcation-ecologique/",
    dateDeclaration: "2026-07-17",
    consulteLe: "2026-09-20",
  },
  /*
   * PRESSE, SECOND MÉDIA SUR LE MÊME DÉBAT.
   *
   * France 24 et LCP ont couvert le débat du Medef séparément. Deux comptes
   * rendus indépendants d'une même déclaration valent mieux qu'un : quand ils
   * rapportent le même verbatim, le codage ne dépend plus d'un seul journaliste.
   * Les positions concernées citent donc les deux.
   */
  {
    id: "france24-debat-medef-2026",
    titre: "Premier débat de la présidentielle 2027 : les principales propositions des candidats",
    media: "France 24",
    url: "https://www.france24.com/fr/france/20260827-premier-d%C3%A9bat-de-la-pr%C3%A9sidentielle-2027-les-principales-propositions-des-candidats",
    dateDeclaration: "2026-08-27",
    consulteLe: "2026-09-20",
  },
  {
    id: "lcp-glucksmann-ecologie-2026",
    titre:
      "Présidentielle 2027 : s'il gagne, Raphaël Glucksmann engagera « les 100 jours de la révolution écologique »",
    media: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/presidentielle-2027-s-il-gagne-raphael-glucksmann-engagera-les-100-jours-de-la",
    dateDeclaration: "2026-08-25",
    consulteLe: "2026-09-20",
  },
  /*
   * CONTRAT DE LÉGISLATURE DU NOUVEAU FRONT POPULAIRE.
   *
   * Le document le plus complet dont on dispose pour quatre candidats à la fois
   * — Mélenchon, Bouamrane, Roussel, Tondelier — parce qu'il engage La France
   * insoumise, le Parti socialiste, le Parti communiste et Les Écologistes par
   * un texte unique. C'est ce qui en fait un `coalition-platform` et non quatre
   * lignes de parti.
   *
   * IL DATE DE JUIN 2024, ET C'EST ÉCRIT À L'ÉCRAN. Deux ans et demi avant le
   * scrutin, sous une autre coalition, pour un autre type d'élection, et la
   * coalition s'est depuis défaite. Chaque position qui en découle porte donc
   * l'avertissement d'ancienneté, et s'effacera dès qu'un candidat publiera son
   * programme : le moteur retient toujours le maillon le plus haut.
   *
   * QUATRE PARTIS, PAS SIX. Le Parti socialiste, La France insoumise, Les
   * Écologistes et le Parti communiste sont les signataires établis. Place
   * publique et Génération écologie n'ont pas pu être confirmés sur une source
   * fiable : la coalition n'est donc PAS reprise par Raphaël Glucksmann ni par
   * Delphine Batho. Une reprise attribuée à tort est pire qu'une case vide.
   */
  {
    id: "nfp-contrat-legislature-2024",
    titre: "Nouveau Front Populaire — Contrat de législature",
    media: "Nouveau Front populaire",
    url: "https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf",
    dateDeclaration: "2024-06-27",
    consulteLe: "2026-09-20",
    incoherenceRelevee:
      "Aucune date imprimée. La date retenue est celle de création du PDF, le 27 juin 2024 heure de Paris, cohérente avec le scrutin des 30 juin et 7 juillet annoncé en page 2. Le fichier est servi depuis le site de campagne de Jean-Luc Mélenchon, où il a été redéposé en avril 2026 : réhébergement, celui du Nouveau Front populaire n'étant plus en ligne.",
  },
  /*
   * PROGRAMME EUROPÉEN DES RÉPUBLICAINS — mai 2024.
   *
   * POURQUOI UN PROGRAMME EUROPÉEN. Les Républicains n'ont publié AUCUN
   * programme pour les législatives de 2024 : le parti était sans direction
   * après le ralliement d'Éric Ciotti au Rassemblement national. Ce document de
   * 58 pages est donc le dernier texte programmatique complet adopté par le
   * parti, et il a été lu en entier.
   *
   * CE QU'UN PROGRAMME EUROPÉEN NE DIT PAS. Il ne traite ni de l'âge de la
   * retraite, ni de l'impôt sur la fortune, ni du 49.3, ni de la
   * proportionnelle, ni des ZFE : ces sujets ne relèvent pas du Parlement
   * européen. Neuf cases sur vingt-quatre en sortent, et les quinze autres
   * restent vides — elles ne sont pas remplies par déduction.
   */
  {
    id: "lr-programme-europeennes-2024",
    titre: "Maîtriser notre destin — programme, élections européennes du 9 juin 2024",
    media: "Les Républicains",
    url: "https://www.les-centristes.fr/sites/default/files/lescentristes-lesrepublicains-programme-elections-europeennes-programme.pdf",
    dateDeclaration: "2024-05-14",
    consulteLe: "2026-09-20",
    incoherenceRelevee:
      "Aucune date imprimée ; la date retenue est celle de création du PDF, le 14 mai 2024, cohérente avec la présentation du programme rapportée ce jour-là. Fichier servi depuis le site des Centristes, parti allié de la liste, faute de copie en ligne sur republicains.fr : réhébergement du programme de la liste Bellamy.",
  },
  /*
   * PROJET DE DEBOUT LA FRANCE — une source PAR CHAPITRE, et c'est essentiel.
   *
   * Le projet est publié chapitre par chapitre sur le site du parti, et chaque
   * page porte sa propre date de dernière modification dans ses métadonnées.
   * Ces dates s'étalent de février 2024 à juin 2026 : le chapitre sur les
   * automobilistes a été réécrit après la suppression des ZFE, celui sur les
   * retraites raisonne encore sur la réforme de 2010 et parle de candidats
   * proposant « 63/67 ans », langage de la campagne de 2022.
   *
   * UNE SEULE SOURCE POUR TOUT LE PROJET AURAIT MENTI. Elle aurait donné la
   * même date à un texte de 2024 et à un texte de juin 2026, donc le même âge à
   * l'écran. Six chapitres consultés, six sources, six dates : l'avertissement
   * d'ancienneté se déclenche sur les deux plus anciens et pas sur les quatre
   * autres, ce qui est exactement ce qu'un lecteur doit voir.
   *
   * Le site annonce lui-même que « nos équipes travaillent actuellement à
   * l'actualisation de notre programme pour l'élection présidentielle de
   * 2027 » : ces codages sont donc provisoires par construction.
   */
  {
    id: "dlf-projet-retraites",
    titre: "Notre projet — Retraites",
    media: "Debout la France",
    url: "https://www.debout-la-france.fr/projet/retraites/",
    dateDeclaration: "2024-02-05",
    consulteLe: "2026-09-20",
  },
  {
    id: "dlf-projet-energie",
    titre: "Notre projet — Environnement et Énergie",
    media: "Debout la France",
    url: "https://www.debout-la-france.fr/projet/environnement-energie/",
    dateDeclaration: "2025-10-29",
    consulteLe: "2026-09-20",
  },
  {
    id: "dlf-projet-agriculture",
    titre: "Notre projet — Agriculture",
    media: "Debout la France",
    url: "https://www.debout-la-france.fr/projet/agriculture/",
    dateDeclaration: "2026-02-16",
    consulteLe: "2026-09-20",
  },
  {
    id: "dlf-projet-transport",
    titre: "Notre projet — Automobilistes et motards",
    media: "Debout la France",
    url: "https://www.debout-la-france.fr/projet/transport-automobilistes/",
    dateDeclaration: "2026-02-16",
    consulteLe: "2026-09-20",
  },
  {
    id: "dlf-projet-immigration",
    titre: "Notre projet — Immigration et assimilation",
    media: "Debout la France",
    url: "https://www.debout-la-france.fr/projet/immigration-et-assimilation/",
    dateDeclaration: "2026-03-03",
    consulteLe: "2026-09-20",
  },
  {
    id: "dlf-projet-democratie",
    titre: "Notre projet — Refonder et moraliser notre démocratie",
    media: "Debout la France",
    url: "https://www.debout-la-france.fr/projet/refonder-et-moraliser-notre-democratie/",
    dateDeclaration: "2026-06-09",
    consulteLe: "2026-09-20",
  },
  /*
   * PROJET DES PATRIOTES — septembre 2026, le document le plus récent du lot.
   *
   * Dix-neuf pages publiées trois semaines avant ce relevé : c'est, avec le
   * programme de Mélenchon, le seul texte de ce dossier écrit POUR 2027 et non
   * pour un scrutin antérieur. Aucun avertissement d'ancienneté ne s'y attache.
   *
   * Le PDF est composé en colonnes, et une extraction en mode « mise en page »
   * recollait des phrases appartenant à des colonnes différentes. Les citations
   * ci-dessous ont été relevées sur une extraction en ORDRE DE LECTURE, puis
   * relues dans le PDF : une citation fabriquée par un outil d'extraction reste
   * une citation fabriquée.
   */
  {
    id: "lp-projet-patriote-2026",
    titre:
      "Grandes orientations pour un projet patriote + Le Frexit en 10 questions — édition 2026-2027",
    media: "Les Patriotes",
    url: "https://les-patriotes.fr/wp-content/uploads/2026/09/projet-pour-la-france-2026.pdf",
    dateDeclaration: "2026-09-03",
    consulteLe: "2026-09-20",
    incoherenceRelevee:
      "La couverture porte « édition 2026-2027 » sans date précise. La date retenue est celle de création du PDF, horodatée « Fri Sep 4 03:48 2026 AEST », soit le 3 septembre 2026 à Paris, cohérente avec son dépôt dans le répertoire de septembre 2026 du site.",
  },
  /*
   * PROGRAMME DE DAVID LISNARD — deuxième programme présidentiel publié.
   *
   * Après celui de Mélenchon, c'est le seul autre projet de candidat structuré
   * et complet trouvé au 20 septembre 2026 : quarante-trois mesures réparties
   * en huit thèmes, sur le site de son mouvement.
   *
   * LA DATE VIENT DU SITEMAP, ET IL FAUT LE DIRE. Aucune de ces pages ne porte
   * de date, ni dans son texte ni dans ses métadonnées d'article. Le sitemap du
   * site, lui, horodate chacune au 31 juillet 2026. C'est la meilleure date
   * disponible, elle est vérifiable par quiconque ouvre
   * `unenouvelleenergie.fr/pages-sitemap.xml`, et elle est postérieure au début
   * de la campagne : aucun avertissement d'ancienneté ne s'y attache.
   *
   * Sans elle, il aurait fallu renoncer à coder un programme complet faute de
   * pouvoir le dater — ce qui aurait laissé David Lisnard à zéro affirmation
   * alors qu'il est l'un des candidats les mieux documentés du dossier.
   */
  {
    id: "lisnard-destin",
    titre: "Le programme de David Lisnard — Être maître de notre destin",
    media: "David Lisnard, Nouvelle Énergie",
    url: "https://www.unenouvelleenergie.fr/notre-programme/etre-maitre-de-notre-destin/",
    dateDeclaration: "2026-07-31",
    consulteLe: "2026-09-20",
  },
  {
    id: "lisnard-ambition",
    titre: "Le programme de David Lisnard — Réussir une nouvelle ambition française",
    media: "David Lisnard, Nouvelle Énergie",
    url: "https://www.unenouvelleenergie.fr/notre-programme/reussir-une-nouvelle-ambition-francaise/",
    dateDeclaration: "2026-07-31",
    consulteLe: "2026-09-20",
  },
  {
    id: "lisnard-civique",
    titre: "Le programme de David Lisnard — Générer un renouveau civique",
    media: "David Lisnard, Nouvelle Énergie",
    url: "https://www.unenouvelleenergie.fr/notre-programme/generer-un-renouveau-civique/",
    dateDeclaration: "2026-07-31",
    consulteLe: "2026-09-20",
  },
  {
    id: "lisnard-immigration",
    titre: "Le programme de David Lisnard — Immigration",
    media: "David Lisnard, Nouvelle Énergie",
    url: "https://www.unenouvelleenergie.fr/notre-programme/immigration/",
    dateDeclaration: "2026-07-31",
    consulteLe: "2026-09-20",
  },
  {
    id: "lisnard-agriculture",
    titre: "Le programme de David Lisnard — Agriculture",
    media: "David Lisnard, Nouvelle Énergie",
    url: "https://www.unenouvelleenergie.fr/notre-programme/agriculture/",
    dateDeclaration: "2026-07-31",
    consulteLe: "2026-09-20",
  },
  /*
   * DEUX RELEVÉS DE PRESSE POUR LE BLOC CENTRAL.
   *
   * Gabriel Attal et Édouard Philippe n'ont publié aucun programme, et le
   * projet « Besoin d'Europe » de 2024, qui couvrirait Renaissance et Horizons
   * d'un coup, n'est plus accessible en ligne. La presse est donc le seul
   * matériau, et c'est exactement le cas que la chaîne de résolution prévoit
   * depuis qu'elle nomme ses maillons de presse.
   *
   * Le discours d'Arras date de septembre 2025, avant la campagne : les
   * positions qui en découlent portent l'avertissement d'ancienneté.
   */
  {
    id: "lcp-retraites-qui-propose-quoi-2026",
    titre: "Présidentielle 2027 : qui propose quoi sur les retraites ?",
    media: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/presidentielle-2027-qui-propose-quoi-sur-les-retraites-437864",
    dateDeclaration: "2026-06-19",
    consulteLe: "2026-09-20",
  },
  {
    id: "lcp-attal-arras-2025",
    titre:
      "À Arras, Gabriel Attal prône « une nouvelle République » en vue de l'élection présidentielle de 2027",
    media: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/a-arras-gabriel-attal-prone-une-nouvelle-republique-en-vue-de-l-election-presidentielle",
    dateDeclaration: "2025-09-21",
    consulteLe: "2026-09-20",
  },
  /*
   * SOLUTION DÉMOCRATIQUE — un parti, une mesure, une case.
   *
   * Le parti de Clara Egger a un programme tenant en une proposition : le
   * référendum d'initiative citoyenne constituant. Une seule des vingt-quatre
   * affirmations le concerne, et c'est un renseignement en soi — ne pas
   * remplir les vingt-trois autres par déduction politique est ici la règle,
   * pas une lacune.
   */
  {
    id: "sd-notre-solution",
    titre: "Notre solution — le référendum d'initiative citoyenne constituant",
    media: "Solution démocratique",
    url: "https://solutiondemocratique.fr/notre-solution/",
    dateDeclaration: "2026-06-26",
    consulteLe: "2026-09-20",
    incoherenceRelevee:
      "La page ne porte aucune date. Celle retenue est le lastmod publié pour cette URL dans le sitemap du site, vérifiable sur solutiondemocratique.fr/wp-sitemap-posts-page-1.xml.",
  },
  /*
   * RELEVÉ DU 25 SEPTEMBRE 2026 — statuts de candidature et programmes.
   *
   * Parti d'une recherche préparatoire produite par une IA, qui s'était déjà
   * corrigée une fois. RIEN N'EN A ÉTÉ REPRIS SANS OUVRIR LA SOURCE : chaque
   * page ci-dessous a été téléchargée, convertie en texte, et chaque citation
   * retrouvée mot pour mot. Trois attributions de la recherche se sont révélées
   * fausses à la lecture et ont été corrigées ou écartées : la « liberté de
   * circulation » prêtée à Selma Labib venait d'un autre orateur d'une autre
   * organisation, la proposition de loi de Jérôme Guedj date de 2023 et non de
   * 2024, et le communiqué d'Olivier Faure chiffre bien un SMIC, contrairement
   * à ce que la recherche affirmait.
   */
  {
    id: "lcp-primaire-sociale-democrate-2026",
    titre:
      "Présidentielle 2027 : qui sera sur la ligne de départ de la primaire sociale-démocrate en octobre ?",
    media: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/presidentielle-2027-qui-sera-sur-la-ligne-de-depart-de-la-primaire-sociale-democrate-en",
    dateDeclaration: "2026-09-16",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "L'article date la déclaration d'Olivier Faure du dimanche 31 août ; l'article de LCP recensant les candidats écrit « ce 30 août ». Le statut retenu ne dépend pas de ce jour : il est attesté par l'officialisation des candidatures le 16 septembre.",
  },
  {
    id: "npar-communique-labib-2026",
    titre:
      "Communiqué – Présidentielle 2027 : Selma Labib, une candidature ouvrière et révolutionnaire, soutenue par Gaël Quirante",
    media: "NPA-Révolutionnaires",
    url: "https://npa-revolutionnaires.org/articles/communique-presidentielle-2027-selma-labib-une-candidature-ouvriere-et-revolutionnaire-soutenue-par-gael-quirante",
    dateDeclaration: "2026-06-17",
    consulteLe: "2026-09-25",
  },
  {
    id: "npar-labib-frontieres-2024",
    titre:
      "Pour un monde sans frontières ni barbelés, liberté de circulation, régularisation de tous les sans-papiers !",
    media: "NPA-Révolutionnaires",
    url: "https://npa-revolutionnaires.org/pour-un-monde-sans-frontieres-ni-barbeles-liberte-de-circulation-regularisation-de-tous-les-sans-papiers/",
    dateDeclaration: "2024-04-26",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Intervention de Selma Labib, alors tête de liste aux européennes, prononcée le 26 avril 2024 et publiée le 29. La date retenue est celle où les mots ont été prononcés.",
  },
  {
    id: "rp-kazib-premieres-mesures-2026",
    titre:
      "28h, expropriation des secteurs stratégiques... : RP présente les premières mesures de sa candidature",
    media: "Révolution permanente",
    url: "https://www.revolutionpermanente.fr/28h-expropriation-des-secteurs-strategiques-RP-presente-les-premieres-mesures-de-sa-candidature",
    dateDeclaration: "2026-09-16",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Compte rendu publié le 16 septembre 2026 d'une table ronde tenue le samedi 12 septembre à la Fête de l'Humanité. Les mesures y sont rapportées au style indirect par le mouvement du candidat.",
  },
  {
    id: "pcf-roussel-designe-2026",
    titre: "Élection présidentielle : Fabien Roussel désigné candidat à 72 % par les communistes",
    media: "Parti communiste français",
    url: "https://www.pcf.fr/presidentielle2027_fabien_roussel_designe_candidat",
    dateDeclaration: "2026-09-06",
    consulteLe: "2026-09-25",
  },
  {
    id: "pcf-voeux-roussel-2026",
    titre: "Vœux 2026 | Fabien Roussel",
    media: "Parti communiste français",
    url: "https://www.pcf.fr/voeux_2026_fabien_roussel",
    dateDeclaration: "2026-01-15",
    consulteLe: "2026-09-25",
  },
  {
    id: "ge-investiture-batho-2026",
    titre: "Investiture de Delphine Batho à l'élection présidentielle",
    media: "Génération écologie",
    url: "https://www.generationecologie.fr/publication/investiture-de-delphine-batho-a-lelection-presidentielle/",
    dateDeclaration: "2026-06-06",
    consulteLe: "2026-09-25",
  },
  {
    id: "ge-batho-candidate-2025",
    titre:
      "« Je suis candidate à l'élection présidentielle pour reconstruire une écologie capable de gouverner »",
    media: "Génération écologie, reprenant un entretien au Nouvel Obs",
    url: "https://www.generationecologie.fr/newsletter/je-suis-candidate-a-lelection-presidentielle-pour-reconstruire-une-ecologie-capable-de-gouverner-2/",
    dateDeclaration: "2025-11-27",
    consulteLe: "2026-09-25",
  },
  {
    id: "lo-arthaud-candidature-2026",
    titre:
      "Nathalie Arthaud : une candidature « révolutionnaire » pour 2027 face à la recomposition de la gauche",
    media: "Lutte ouvrière, reprenant un entretien au Lyon Bondy Blog",
    url: "https://lutte-ouvriere.org/portail/revue-de-presse/nathalie-arthaud-candidature-revolutionnaire-2027-face-recomposition-gauche-194900.html",
    dateDeclaration: "2026-06-10",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Entretien réalisé le mercredi 3 juin 2026 et publié le 10 juin. La date retenue est celle de la publication, la seule que le document affiche comme telle.",
  },
  {
    id: "lo-arthaud-manifeste-2026",
    titre: "Nathalie Arthaud, le 24 mai : « le Manifeste communiste, notre programme »",
    media: "Lutte ouvrière",
    url: "https://lutte-ouvriere.org/journal/article/nathalie-arthaud-24nbspmai-le-manifeste-communiste-notreprogramme-194603.html",
    dateDeclaration: "2026-05-24",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Discours prononcé le 24 mai 2026 à la fête de Lutte ouvrière, publié le 27 mai. La date retenue est celle où les mots ont été prononcés.",
  },
  {
    id: "pp13-glucksmann-2026",
    titre: "Candidature de Raphaël Glucksmann à la présidentielle : PP13 en place dès le 24 août",
    media: "Place publique, comité des Bouches-du-Rhône",
    url: "https://action.place-publique.eu/actualite/3dpjnn6dbhGDnKMBuNgtVh/candidature-de-raphael-glucksmann-a-la-presidentielle-pp13-en-place-des-le-24-aout",
    dateDeclaration: "2026-08-24",
    consulteLe: "2026-09-25",
  },
  {
    id: "ps-faure-smic-2025",
    titre:
      "Revalorisation du SMIC au 1er janvier 2026 : un geste minimal, loin des besoins des travailleurs",
    media: "Parti socialiste, communiqué signé par Olivier Faure",
    url: "https://parti-socialiste.fr/communiques-de-presse/revalorisation-du-smic-au-1%E1%B5%89%CA%B3-janvier-2026-un-geste-minimal-loin-des-besoins-des-travailleurs/",
    dateDeclaration: "2025-12-22",
    consulteLe: "2026-09-25",
  },
  {
    id: "an-ppl-1061-grand-age-2023",
    titre:
      "Proposition de loi n° 1061 visant à garantir le droit à vieillir dans la dignité et à préparer la société au vieillissement de sa population",
    media: "Assemblée nationale",
    url: "https://www.assemblee-nationale.fr/dyn/16/textes/l16b1061_proposition-loi.pdf",
    dateDeclaration: "2023-04-04",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Le texte est enregistré à la Présidence de l'Assemblée le 4 avril 2023. Une page du Parti socialiste datée de mars 2024 écrit qu'il a été déposé « le 16 avril ». La date retenue est celle du document parlementaire.",
  },
  {
    id: "lcp-attal-reseaux-sociaux-2026",
    titre:
      "Interdiction des réseaux sociaux aux moins de 15 ans : à l'offensive, Gabriel Attal devance le gouvernement",
    media: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/interdiction-des-reseaux-sociaux-aux-moins-de-15-ans-a-l-offensive-gabriel-attal-devance",
    dateDeclaration: "2026-01-12",
    consulteLe: "2026-09-25",
  },
  {
    id: "franceinfo-retailleau-natalite-2026",
    titre:
      "Présidentielle 2027 : création d'un revenu familial, prolongation du congé de naissance... Bruno Retailleau promet de sortir la France de « l'hiver démographique »",
    media: "franceinfo avec AFP",
    url: "https://www.franceinfo.fr/elections/presidentielle/presidentielle-2027-creation-d-un-revenu-familial-prolongation-du-conge-naissance-bruno-retailleau-promet-de-sortir-la-france-de-l-hiver-demographique_7973942.html",
    dateDeclaration: "2026-04-30",
    consulteLe: "2026-09-25",
  },
  {
    id: "publicsenat-retailleau-constitution-2026",
    titre:
      "Présidentielle 2027 : Bruno Retailleau veut « renverser la table » avec une profonde réforme constitutionnelle",
    media: "Public Sénat",
    url: "https://www.publicsenat.fr/actualites/politique/presidentielle-2027-bruno-retailleau-veut-renverser-la-table-avec-une-profonde-reforme-constitutionnelle",
    dateDeclaration: "2026-09-03",
    consulteLe: "2026-09-25",
  },
  {
    id: "orange-philippe-narcotrafic-2026",
    titre:
      "Présidentielle 2027 : Édouard Philippe propose la création d'un « état d'urgence » pour le narcotrafic",
    media: "Orange Actualités (6Médias avec L'Express)",
    url: "https://actu.orange.fr/politique/presidentielle-2027-edouard-philippe-propose-la-creation-d-un-etat-d-urgence-pour-le-narcotrafic-magic-CNT000002rLQcz.html",
    dateDeclaration: "2026-09-07",
    consulteLe: "2026-09-25",
  },
  {
    id: "touteleurope-le-pen-appel-2026",
    titre:
      "Procès des assistants du RN : Marine Le Pen condamnée en appel, mais éligible à l'élection présidentielle 2027",
    media: "Toute l'Europe",
    url: "https://www.touteleurope.eu/vie-politique-des-etats-membres/proces-des-assistants-du-rn-marine-le-pen-condamnee-en-appel-mais-eligible-a-l-election-presidentielle-2027/",
    dateDeclaration: "2026-07-09",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Article publié le 9 juillet 2026 et mis à jour le 24 août. L'annonce de la Cour de cassation qu'il rapporte est postérieure au 7 juillet ; sa date exacte n'est pas donnée.",
  },
  {
    id: "cnews-becht-candidature-2026",
    titre:
      "Présidentielle 2027 : camarade de promo d'Emmanuel Macron à l'ENA, l'ancien ministre Olivier Becht annonce sa candidature",
    media: "CNews, reprenant un entretien à Paris Match",
    url: "https://www.cnews.fr/france/2026-09-24/presidentielle-2027-camarade-de-promo-demmanuel-macron-lena-lancien-ministre",
    dateDeclaration: "2026-09-24",
    consulteLe: "2026-09-25",
  },
  {
    id: "dlf-nda-candidature-2025",
    titre:
      "Je suis candidat pour rendre le pouvoir aux Français et rendre sa liberté à la France !",
    media: "Debout la France",
    url: "https://www.debout-la-france.fr/actualite/je-suis-candidat-pour/",
    dateDeclaration: "2025-03-08",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Les métadonnées de la page la datent du 25 septembre 2025, mais le texte rapporte un meeting « ce samedi 8 mars » : le 8 mars 2025 était un samedi. La date retenue est celle du meeting.",
  },
  {
    id: "dlf-projet-2027",
    titre: "Notre projet",
    media: "Debout la France",
    url: "https://www.debout-la-france.fr/notre-projet/",
    dateDeclaration: "2026-09-08",
    consulteLe: "2026-09-25",
  },
  {
    id: "sd-programme-2027",
    titre: "Présidentielle 2027 : découvrez le programme de notre candidat",
    media: "Solution démocratique",
    url: "https://solutiondemocratique.fr/notre-solution/calendrier-president/",
    dateDeclaration: "2026-07-03",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Page créée le 25 décembre 2024 et modifiée le 3 juillet 2026, selon ses métadonnées. La date retenue est celle de la dernière modification, la version lue.",
  },
  {
    id: "sd-parrainage-egger-2026",
    titre: "Parrainage 2027 — Avec Clara Egger",
    media: "Solution démocratique",
    url: "https://solutiondemocratique.fr/parrainage2027/",
    dateDeclaration: "2026-09-22",
    consulteLe: "2026-09-25",
  },
  {
    id: "equinoxe-presidentielle-2027",
    titre: "Présidentielle 2027",
    media: "Équinoxe",
    url: "https://parti-equinoxe.fr/presidentielle-2027/",
    dateDeclaration: "2026-07-31",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Page publiée le 31 juillet 2026 et modifiée le 21 septembre, selon ses métadonnées. La date retenue est celle de la publication ; le vote des adhérents n'y est pas daté.",
  },
  {
    id: "lfi-accueil-2026",
    titre: "La France insoumise — page d'accueil",
    media: "La France insoumise",
    url: "https://lafranceinsoumise.fr/",
    dateDeclaration: "2026-09-21",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Page d'accueil, modifiée le 21 septembre 2026 selon ses métadonnées. Les mesures y figurent en vignettes de quelques mots, sans le détail du programme.",
  },
  {
    id: "aec2027-chapitre-16",
    titre: "L'Avenir en commun — Chapitre 16 : Une diplomatie altermondialiste pour la paix",
    media: "Jean-Luc Mélenchon, campagne présidentielle 2027",
    url: "https://melenchon2027.fr/chapitre-16-une-diplomatie-altermondialiste-pour-la-paix-2/",
    dateDeclaration: "2026-07-17",
    consulteLe: "2026-09-25",
  },
  /*
   * PROGRAMME DES ÉCOLOGISTES — 557 mesures, 208 pages.
   *
   * Le site du parti est protégé contre les requêtes automatiques : le PDF a
   * été récupéré par un navigateur, puis converti en texte dans l'ordre de
   * lecture. Comme pour Les Patriotes, la mise en page en colonnes recolle des
   * phrases étrangères en mode « mise en page » : les citations ont été
   * relevées dans l'ordre de lecture.
   */
  {
    id: "eco-programme-2027",
    titre: "Projet 2027 — le programme des Écologistes (557 mesures)",
    media: "Les Écologistes",
    url: "https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf",
    dateDeclaration: "2026-08-25",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Le document ne porte aucune date imprimée. Son PDF est créé le 15 juillet 2026 et modifié pour la dernière fois le 25 août 2026 ; la date retenue est celle de la version lue.",
  },
  {
    id: "tondelier-mensonge-2026",
    titre: "Il faut une loi pour interdire le mensonge en politique",
    media: "Marine Tondelier, site de campagne",
    url: "https://marinetondelier.fr/blog/il-faut-interdire-le-mensonge-en-politique",
    dateDeclaration: "2026-09-04",
    consulteLe: "2026-09-25",
  },
  {
    id: "ruffin-saintes-2024",
    titre: "« Vous êtes des saintes ! »",
    media: "François Ruffin, site personnel",
    url: "https://francoisruffin.fr/vous-etes-des-saintes/",
    dateDeclaration: "2024-12-03",
    consulteLe: "2026-09-25",
  },
  {
    id: "upr-programme",
    titre: "Notre programme",
    media: "Union populaire républicaine",
    url: "https://upr.fr/notre-programme",
    dateDeclaration: "2026-09-25",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "La page ne porte aucune date. Celle retenue est la date de consultation : elle atteste seulement ce que la page affichait ce jour-là.",
  },
  {
    id: "upr-medef-2026",
    titre: "Présidentielle 2027 : censure du FREXIT et de François Asselineau par le MEDEF !",
    media: "Union populaire républicaine",
    url: "https://upr.fr/communiques-de-presse/presidentielle-2027-censure-du-frexit-et-de-francois-asselineau-par-le-medef",
    dateDeclaration: "2026-08-26",
    consulteLe: "2026-09-25",
  },
  {
    id: "reconquete-accueil",
    titre: "Reconquête — Les priorités d'Éric Zemmour pour la France",
    media: "Reconquête",
    url: "https://www.parti-reconquete.fr/",
    dateDeclaration: "2026-09-25",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Page d'accueil sans date. Celle retenue est la date de consultation : elle atteste seulement ce que la page affichait ce jour-là.",
  },
  {
    id: "reconquete-plateforme-programme",
    titre: "Le programme pour la France — plateforme participative",
    media: "Reconquête (plateforme lancée par Sarah Knafo)",
    url: "https://leprogrammepourlafrance.fr/",
    dateDeclaration: "2026-09-25",
    consulteLe: "2026-09-25",
    incoherenceRelevee:
      "Page sans date. Celle retenue est la date de consultation : elle atteste seulement ce que la page affichait ce jour-là.",
  },
] as const satisfies readonly SourcePosition[];
