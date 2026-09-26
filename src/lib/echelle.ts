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

/**
 * Sens d'une position, pour les pages de thème : pour, contre, ou ni l'un ni
 * l'autre.
 *
 * UNE LECTURE DE L'ÉCHELLE, PAS UNE SECONDE ÉCHELLE. Le test calcule toujours
 * sur les cinq crans ; les pages de thème regroupent « tout à fait » et
 * « plutôt » d'un même côté pour qu'on lise d'un coup d'œil qui est de quel
 * côté, et la nuance « plutôt » reste écrite sous le nom. Aucun cran n'est
 * perdu, seulement rangé.
 */
export type Sens = "pour" | "contre" | "neutre";

export function sensDe(valeur: StanceValue): Sens {
  if (valeur > 0) return "pour";
  if (valeur < 0) return "contre";
  return "neutre";
}

/** « Plutôt » pour ±1, rien pour ±2 et 0 : c'est la seule nuance que le regroupement efface. */
export function nuanceDe(valeur: StanceValue): string | null {
  return Math.abs(valeur) === 1 ? "Plutôt" : null;
}

/**
 * Libellés des quatre colonnes d'une page de thème.
 *
 * « PAS DE POSITION CONNUE », et non « ne s'est pas prononcé » : on ne sait
 * pas si la personne s'est tue, on sait seulement qu'on n'a relevé aucune
 * source. Écrire le contraire affirmerait un fait qu'on n'a pas vérifié.
 */
export const LIBELLES_SENS: Record<Sens | "inconnu", string> = {
  pour: "Pour",
  contre: "Contre",
  neutre: "Ni pour ni contre",
  inconnu: "Pas de position connue",
};
