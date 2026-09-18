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
] as const satisfies readonly SourcePosition[];
