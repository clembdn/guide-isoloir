/**
 * ILLUSTRATIONS ÉDITORIALES — photographies de scène, tenues à la main.
 *
 * POURQUOI CE FICHIER EXISTE À CÔTÉ DE `medias.ts`. Le manifeste des portraits
 * et des logos est GÉNÉRÉ par `scripts/recuperer-medias.mjs` et indexé par
 * `actorId` : chaque entrée appartient à un acteur politique. Une photographie
 * de bureau de vote n'appartient à personne. La faire entrer de force dans ce
 * manifeste aurait imposé un `actorId` fictif, que le script écraserait au
 * prochain passage.
 *
 * LES MÊMES RÈGLES S'APPLIQUENT, ET ELLES NE SE NÉGOCIENT PAS :
 *
 *   - Wikimedia Commons exclusivement. Jamais un fichier pris sur
 *     fr.wikipedia.org seul — il y est au titre du fair use américain, qui
 *     n'existe pas en droit français et ne se transmet à personne.
 *   - Licence libre vérifiée, auteur relevé, page source conservée.
 *   - Auto-hébergement sous `public/medias/`. Aucune requête ne part vers
 *     Commons au runtime : `img-src 'self'` l'interdit et le test « aucune
 *     requête tierce » le vérifie.
 *   - Crédit publié sur `/credits-images`. CC BY et CC BY-SA imposent de citer
 *     l'auteur et de nommer la licence ; une image libre dont on tait l'auteur
 *     est une image utilisée sans droit.
 *
 * CE QUI A ÉTÉ ÉCARTÉ, ET POURQUOI. Une photographie de la médiathèque de
 * Remiremont montrait les panneaux d'affichage électoral avec les affiches de
 * campagne de candidats nommés : neutralité impossible, écartée. Le palais de
 * l'Élysée a été écarté de l'accroche pour la raison inverse — il est le siège
 * de la présidence, et `CLAUDE.md` interdit toute apparence officielle, « un
 * risque juridique autant qu'esthétique ».
 */

export type Illustration = {
  id: string;
  /** Chemins servis, sous `public/`. Deux recadrages, un par orientation. */
  cheminLarge: string;
  cheminEtroit: string;
  largeurLarge: number;
  hauteurLarge: number;
  largeurEtroit: number;
  hauteurEtroit: number;
  /** Texte alternatif. Décrit la scène, il ne la commente pas. */
  alt: string;
  fichierCommons: string;
  pageCommons: string;
  auteur: string;
  licence: string;
  licenceUrl: string;
  /** Retouches appliquées. Les taire rendrait le crédit incomplet. */
  retouches: string;
  /** Date du relevé de la licence. Un relevé vieillit : le republier le dit. */
  releveeLe: string;
};

/*
 * LES CARTES « COMPRENDRE » DE L'ACCUEIL. Une photographie par article, sous
 * l'identifiant de l'article. Elles sont téléchargées et recadrées par
 * `scripts/recuperer-illustrations.mjs`, qui vérifie la licence au passage et
 * porte les recadrages par écrit — deux d'entre eux sortent du champ un ruban
 * et un bandeau tricolores. Un article sans entrée ici a une carte sans image.
 */
const RETOUCHES_CARTE = "recadrée au format 16:10, redimensionnée, convertie en WebP";

export const ILLUSTRATIONS: readonly Illustration[] = [
  {
    id: "bureau-de-vote",
    cheminLarge: "/medias/scenes/bureau-de-vote-large.webp",
    cheminEtroit: "/medias/scenes/bureau-de-vote-etroit.webp",
    largeurLarge: 1600,
    hauteurLarge: 1000,
    largeurEtroit: 900,
    hauteurEtroit: 620,
    alt: "Deux isoloirs aux rideaux tirés dans un bureau de vote, et l'urne au premier plan.",
    fichierCommons: "Strasbourg élections municipales 23 mars 2014-6.jpg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:Strasbourg_%C3%A9lections_municipales_23_mars_2014-6.jpg",
    auteur: "Claude Truong-Ngoc",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0/deed.fr",
    retouches: "recadrée, luminosité et saturation relevées, convertie en WebP",
    releveeLe: "2026-09-22",
  },
  {
    id: "pour-qui-voter-en-2027",
    cheminLarge: "/medias/scenes/pour-qui-voter-en-2027-large.webp",
    cheminEtroit: "/medias/scenes/pour-qui-voter-en-2027-etroit.webp",
    largeurLarge: 800,
    hauteurLarge: 500,
    largeurEtroit: 480,
    hauteurEtroit: 300,
    alt: "Une rangée d'isoloirs aux rideaux bleus ouverts, dans une salle de bureau de vote.",
    fichierCommons: "Isoloirs J1.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Isoloirs_J1.jpg",
    auteur: "Jamain",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/deed.fr",
    retouches: RETOUCHES_CARTE,
    releveeLe: "2026-09-24",
  },
  {
    id: "ce-qu-un-president-decide-seul",
    cheminLarge: "/medias/scenes/ce-qu-un-president-decide-seul-large.webp",
    cheminEtroit: "/medias/scenes/ce-qu-un-president-decide-seul-etroit.webp",
    largeurLarge: 800,
    hauteurLarge: 500,
    largeurEtroit: 480,
    hauteurEtroit: 300,
    alt: "Le texte original de la Constitution de 1958, ouvert sur les pages des signatures.",
    fichierCommons: "Constitution de 1958.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Constitution_de_1958.jpg",
    auteur: "Tangopaso",
    licence: "domaine public",
    licenceUrl: "",
    retouches: `${RETOUCHES_CARTE} ; le ruban tricolore et le sceau sont laissés hors champ`,
    releveeLe: "2026-09-24",
  },
  {
    id: "s-inscrire-sur-les-listes-electorales",
    cheminLarge: "/medias/scenes/s-inscrire-sur-les-listes-electorales-large.webp",
    cheminEtroit: "/medias/scenes/s-inscrire-sur-les-listes-electorales-etroit.webp",
    largeurLarge: 800,
    hauteurLarge: 500,
    largeurEtroit: 480,
    hauteurEtroit: 300,
    alt: "Une carte électorale posée sur des enveloppes de vote.",
    fichierCommons: "Carte électorale Vote France.JPG",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Carte_%C3%A9lectorale_Vote_France.JPG",
    auteur: "Ksiamon",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr",
    retouches: `${RETOUCHES_CARTE} ; le bandeau tricolore de la carte est laissé hors champ`,
    releveeLe: "2026-09-24",
  },
  {
    id: "ou-et-comment-voter",
    cheminLarge: "/medias/scenes/ou-et-comment-voter-large.webp",
    cheminEtroit: "/medias/scenes/ou-et-comment-voter-etroit.webp",
    largeurLarge: 800,
    hauteurLarge: 500,
    largeurEtroit: 480,
    hauteurEtroit: 300,
    alt: "Une urne transparente sur une table de bureau de vote, avant l'arrivée des électeurs.",
    fichierCommons: "Villemanoche-FR-89-présidentielles 2022-c07.jpg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:Villemanoche-FR-89-pr%C3%A9sidentielles_2022-c07.jpg",
    auteur: "François Goglins",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr",
    retouches: RETOUCHES_CARTE,
    releveeLe: "2026-09-24",
  },
  {
    id: "qu-est-ce-qu-un-parrainage",
    cheminLarge: "/medias/scenes/qu-est-ce-qu-un-parrainage-large.webp",
    cheminEtroit: "/medias/scenes/qu-est-ce-qu-un-parrainage-etroit.webp",
    largeurLarge: 800,
    hauteurLarge: 500,
    largeurEtroit: 480,
    hauteurEtroit: 300,
    alt: "La porte du Conseil constitutionnel, surmontée de son nom, entre deux colonnes.",
    fichierCommons: "Conseil Constitutionnel Paris.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Conseil_Constitutionnel_Paris.jpg",
    auteur: "Jebulon",
    licence: "CC0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.fr",
    retouches: RETOUCHES_CARTE,
    releveeLe: "2026-09-24",
  },
  {
    id: "donner-procuration",
    cheminLarge: "/medias/scenes/donner-procuration-large.webp",
    cheminEtroit: "/medias/scenes/donner-procuration-etroit.webp",
    largeurLarge: 800,
    hauteurLarge: 500,
    largeurEtroit: 480,
    hauteurEtroit: 300,
    alt: "Une urne remplie d'enveloppes, tenue par les assesseurs d'un bureau de vote.",
    fichierCommons: "Election presidentielle 2007 Montauban Urne 197.jpg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:Election_presidentielle_2007_Montauban_Urne_197.jpg",
    auteur: "Ceridwen",
    licence: "CC BY-SA 2.0 FR",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0/fr/deed.fr",
    retouches: RETOUCHES_CARTE,
    releveeLe: "2026-09-24",
  },
];

export function illustration(id: string): Illustration | undefined {
  return ILLUSTRATIONS.find((item) => item.id === id);
}
