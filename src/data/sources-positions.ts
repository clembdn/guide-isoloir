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
] as const satisfies readonly SourcePosition[];
