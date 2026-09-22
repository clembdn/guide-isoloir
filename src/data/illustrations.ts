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
};

/** Date du relevé des licences. Un relevé vieillit : le republier le dit. */
export const ILLUSTRATIONS_RELEVEES_LE = "2026-09-22";

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
  },
];

export function illustration(id: string): Illustration | undefined {
  return ILLUSTRATIONS.find((item) => item.id === id);
}
