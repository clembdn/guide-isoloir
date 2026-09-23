/**
 * Libellés affichés à côté d'une position, partagés par l'écran de résultat et
 * les fiches candidat.
 *
 * UN SEUL ENDROIT, parce que ces phrases sont des qualifications, pas du
 * texte d'habillage : « confiance élevée » sur une fiche et « confiance forte »
 * sur le résultat laisseraient croire à deux échelles différentes pour la même
 * position.
 *
 * Ce module part au navigateur avec l'îlot de résultat : aucun import de
 * données, aucun zod.
 */
import type { CandidateStatus, StanceAdequation } from "./modele";

/**
 * Confiance accordée à la source, en toutes lettres.
 *
 * Affichée parce qu'elle est le prix à payer pour avoir ouvert le codage à la
 * presse : une position tirée d'un entretien vaut ce que vaut l'entretien, et
 * le lecteur doit pouvoir le lire sans ouvrir le dépôt. Elle n'entre pas dans
 * le calcul — une position mal documentée reste la position qu'elle est.
 */
export const LIBELLES_CONFIANCE: Record<"low" | "medium" | "high", string> = {
  high: "Confiance dans la source : élevée.",
  medium: "Confiance dans la source : moyenne.",
  low: "Confiance dans la source : faible.",
};

export const LIBELLES_ADEQUATION: Record<StanceAdequation, string> = {
  directe: "La citation porte sur la mesure exactement posée.",
  partielle: "La citation recoupe l'affirmation sans la recouvrir.",
  deduite: "Aucune citation ne porte sur la mesure : valeur déduite.",
};

/**
 * Statut de candidature, en toutes lettres.
 *
 * FORMES NOMINALES, et c'est délibéré : « Désignation par son parti » s'écrit
 * de la même façon pour tous les candidats, quand « désigné » ou « désignée »
 * obligerait à accorder chaque statut à une personne — donc à tenir une donnée
 * de plus, sans rien apporter au lecteur.
 */
export const LIBELLES_STATUT_CANDIDATURE: Record<CandidateStatus, string> = {
  potential: "Candidature à une primaire, dont l'issue n'est pas connue",
  declared: "Candidature déclarée",
  nominated: "Désignation par son parti",
  official: "Candidature validée par le Conseil constitutionnel",
  withdrawn: "Candidature retirée",
  eliminated: "Élimination au premier tour",
  finalist: "Qualification pour le second tour",
};
