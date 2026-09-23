/**
 * Moteur de proximité — point d'entrée.
 *
 * `boussole-engine` n'existe ni dans le dépôt, ni dans package.json, ni dans le
 * lockfile, ni dans node_modules, ni dans l'historique git de toutes les
 * branches. Ce module le remplace : minimal, déterministe, testé par
 * `tests/unit/moteur.test.ts` et audité par `scripts/audit.mjs`.
 */
export { calculer, type EntreesMoteur } from "./calcul";
export {
  creerResolveur,
  meilleurePosition,
  type PositionResolue,
  type Resolveur,
} from "./resolution";
export { type CleNiveau, type Confiance } from "./types";
export {
  NIVEAUX_RESOLUTION,
  type Classement,
  type Couverture,
  type DetailPosition,
  type NiveauIncertitude,
  type ResultatActeur,
  type ResultatTheme,
} from "./types";
