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

export const CORRECTIONS = [
  {
    date: "2026-10-13",
    portee: "Les Républicains (repris par Bruno Retailleau) — nouveaux réacteurs nucléaires",
    description:
      "La position reposait sur le programme européen de mai 2024 (« développement de la filière nucléaire », +1, adéquation partielle). Elle repose désormais sur le livret Électricité de mai 2026, qui prévoit six EPR2 puis huit de plus : +2, adéquation directe.",
    origine: "Relecture interne : publication par le parti de livrets plus récents.",
  },
  {
    date: "2026-10-13",
    portee: "Les Républicains (repris par Bruno Retailleau) — agriculture et éolien",
    description:
      "Deux positions changent de source sans changer de valeur. Agriculture : le livret de février 2026 (réautorisation de néonicotinoïdes) remplace le programme européen de 2024 (moratoire sur les normes), -2. Éolien : le livret Électricité de mai 2026 (fin des appels d'offres publics) remplace le programme européen de 2024, -1.",
    origine: "Relecture interne : publication par le parti de livrets plus récents.",
  },
] as const satisfies readonly Correction[];
