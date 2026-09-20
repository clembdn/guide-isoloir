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
    dateDeclaration: "2026-09-16",
    consulteLe: "2026-09-19",
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
] as const satisfies readonly SourcePosition[];
