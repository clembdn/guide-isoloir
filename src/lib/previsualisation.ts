/**
 * Mode prévisualisation : voir les positions non relues, sans jamais les publier.
 *
 * LE PROBLÈME. `positionsPubliables` n'accepte que `reconciled` et `published`.
 * C'est la traduction technique de la règle de `CLAUDE.md` — aucun contenu
 * factuel produit par une IA n'est publié sans vérification humaine — et elle
 * ne bouge pas. Mais un codage qu'on ne peut pas afficher est un codage qu'on
 * ne peut pas relire : le relecteur a besoin de voir ce que la page ferait de
 * ses données avant de faire passer une position en `reconciled`.
 *
 * LA SOLUTION. Un drapeau d'environnement, lu au BUILD, côté Node uniquement.
 * Il n'est pas préfixé `PUBLIC_` : Vite ne l'inline donc jamais dans le bundle
 * du navigateur, et il ne peut pas être activé depuis le client.
 *
 *     GUIDE_ISOLOIR_PREVISUALISATION=1 npm run build
 *
 * `npm run build:prod` ne le définit pas, et le garde-fou de `dist/` refuse un
 * build où une position `draft` apparaîtrait dans ce qui est servi. Deux verrous
 * indépendants : l'oubli d'un seul ne suffit pas à publier un brouillon.
 *
 * `process.env` et non `import.meta.env` : ce module est importé par des
 * frontmatters `.astro`, qui s'exécutent dans Node au build. `import.meta.env`
 * exposerait la valeur aux règles de remplacement de Vite, donc au bundle.
 */
import { positionsPubliables } from "./acteurs";

/** Vrai seulement si le drapeau est explicitement posé au build. */
export const PREVISUALISATION = process.env["GUIDE_ISOLOIR_PREVISUALISATION"] === "1";

/**
 * Bandeau affiché sur toute page servant des positions non relues.
 *
 * Permanent, en tête, au corps du texte. Un avertissement qu'il faut chercher
 * n'avertit personne, et une prévisualisation qu'on prend pour le site est pire
 * que pas de prévisualisation du tout.
 */
export const BANDEAU_PREVISUALISATION =
  // Espace insécable avant le deux-points : typographie française, et sinon le
  // signe passe seul à la ligne suivante à 1280 px.
  "Prévisualisation interne. Les positions affichées ici n'ont pas été relues\u00a0: " +
  "elles sont en brouillon, elles peuvent être fausses, et elles ne sont pas " +
  "publiées. Cette page n'existe pas sur le site en ligne.";

/**
 * Positions à servir, selon le mode.
 *
 * En production, strictement `positionsPubliables`. En prévisualisation, tout,
 * brouillons compris — et c'est alors au bandeau et au `noindex` de faire leur
 * travail.
 */
export function positionsServies<T extends { reviewStatus: string }>(positions: readonly T[]): T[] {
  return PREVISUALISATION ? [...positions] : positionsPubliables(positions);
}
