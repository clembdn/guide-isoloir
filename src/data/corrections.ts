/**
 * REGISTRE DES CORRECTIONS, publié sur `/corrections`.
 *
 * Une entrée par correction significative d'une donnée DÉJÀ PUBLIÉE : position
 * modifiée ou retirée, source corrigée ou remplacée, question reformulée, calcul
 * qui change un classement. Ordre chronologique, la plus ancienne d'abord.
 *
 * Les ajouts n'y figurent pas : une position nouvelle n'est pas une correction,
 * et le journal des données de `/donnees` les liste déjà. Quand une position
 * relue remplace une position publiée et que la valeur change,
 * `npm run veille:valider -- <id> --remplace <ancien>` imprime l'entrée à coller.
 *
 * PAS DE VALIDATION ZOD ICI : la page appelle `validerCorrections`.
 */
import type { Correction } from "../lib/modele";

export const CORRECTIONS = [] as const satisfies readonly Correction[];
