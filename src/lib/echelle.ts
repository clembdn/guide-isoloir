/**
 * Échelle de réponse.
 *
 * Cinq positions symétriques autour de zéro, plus une sortie qui n'est PAS une
 * position : « je n'ai pas d'avis ». La distinction est structurelle, pas
 * seulement rédactionnelle — voir `src/lib/session-test.ts`.
 *
 * L'ordre va de l'accord au désaccord, et il est identique pour toutes les
 * questions : alterner le sens introduirait un effet d'ordre que l'audit doit
 * pouvoir exclure.
 *
 * POURQUOI ICI ET PAS DANS LES DONNÉES. L'échelle est réelle, pas factice, et
 * elle est partagée par le jeu de démonstration et le questionnaire réel. La
 * laisser dans `src/factice/` donnerait deux sources de vérité qui finiraient
 * par diverger : la symétrie de l'échelle est un invariant publié dans la
 * méthodologie, elle ne peut pas dépendre du jeu de données servi.
 *
 * Ce module part au navigateur : pas de zod ici. La symétrie est vérifiée par
 * `tests/audit/invariants.audit.ts`.
 */
import type { StanceValue } from "./modele";

export const ECHELLE: readonly { valeur: StanceValue; libelle: string }[] = [
  { valeur: 2, libelle: "Tout à fait d'accord" },
  { valeur: 1, libelle: "Plutôt d'accord" },
  { valeur: 0, libelle: "Ni d'accord, ni pas d'accord" },
  { valeur: -1, libelle: "Plutôt pas d'accord" },
  { valeur: -2, libelle: "Pas du tout d'accord" },
];
