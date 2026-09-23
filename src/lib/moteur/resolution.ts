/**
 * Résolution d'une position : quelle position retenir pour un couple
 * acteur/question, et d'où elle vient.
 *
 * SORTIE DE `calcul.ts` POUR UNE SEULE RAISON : que les fiches candidat et le
 * résultat du test ne puissent pas se contredire. Une fiche qui choisirait sa
 * position par un autre chemin que le moteur finirait, un jour d'égalité de
 * maillon ou de reprise à deux niveaux, par afficher une position différente de
 * celle qui a compté dans le score. Il n'existe donc qu'un seul résolveur, et
 * `tests/unit/resolution.test.ts` vérifie qu'il rend, sur les données réelles,
 * exactement le détail que `calculer` expose.
 *
 * Rien ici ne calcule un accord ni un score : ce module choisit, il ne compare
 * pas.
 */
import type { Candidate, PoliticalActor, Stance } from "../modele";
import { NIVEAUX_RESOLUTION } from "./types";

const RANG_PAR_CLE = new Map(NIVEAUX_RESOLUTION.map((niveau) => [niveau.cle, niveau.rang]));

/**
 * Meilleure position disponible pour un couple acteur/question.
 *
 * La chaîne de résolution est une préférence, pas un filtre : on retient le
 * maillon le plus haut disponible. À maillon égal, la position la plus
 * récemment mise à jour, puis l'identifiant, pour que rien ne dépende de
 * l'ordre du tableau.
 */
export function meilleurePosition(candidates: readonly Stance[]): Stance | null {
  if (candidates.length === 0) return null;

  return [...candidates].sort((a, b) => {
    const rangA = RANG_PAR_CLE.get(a.provenance) ?? Number.MAX_SAFE_INTEGER;
    const rangB = RANG_PAR_CLE.get(b.provenance) ?? Number.MAX_SAFE_INTEGER;
    return rangA - rangB || b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id);
  })[0]!;
}

export type PositionResolue = {
  position: Stance;
  /** Nom de l'acteur d'origine quand la position est reprise, sinon `null`. */
  heriteDe: string | null;
  /** Identifiant de l'acteur d'origine quand la position est reprise, sinon `null`. */
  heriteDeId: string | null;
};

export type Resolveur = (acteurId: string, questionId: string) => PositionResolue | null;

/**
 * Construit le résolveur une fois pour un jeu de données.
 *
 * `annuaire` sert à NOMMER l'acteur d'origine d'une reprise ; à défaut de nom,
 * c'est l'identifiant qui sort, et l'écran le montrerait — `calculer` reçoit
 * donc toujours l'annuaire complet.
 */
export function creerResolveur({
  positions,
  candidatures = [],
  annuaire = [],
}: {
  positions: readonly Stance[];
  candidatures?: readonly Candidate[];
  annuaire?: readonly Pick<PoliticalActor, "id" | "name">[];
}): Resolveur {
  /** Positions indexées par acteur puis par question. Aucune clé composée. */
  const parActeur = new Map<string, Map<string, Stance[]>>();
  for (const position of positions) {
    const parQuestion = parActeur.get(position.actorId) ?? new Map<string, Stance[]>();
    parQuestion.set(position.questionId, [
      ...(parQuestion.get(position.questionId) ?? []),
      position,
    ]);
    parActeur.set(position.actorId, parQuestion);
  }

  /**
   * Chaîne de reprise par acteur.
   *
   * L'ordre de `baselineActorIds` est une préférence éditoriale déclarée dans les
   * données — coalition avant parti, par exemple — pas l'ordre incident d'un
   * tableau. Il est donc respecté tel quel, et c'est la seule place du moteur où
   * un ordre d'entrée compte.
   */
  const reprises = new Map(
    candidatures.map((candidature) => [candidature.actorId, candidature.baselineActorIds]),
  );
  const nomParId = new Map(annuaire.map((acteur) => [acteur.id, acteur.name]));

  /*
   * La position personnelle l'emporte toujours, même mal documentée : un
   * candidat qui contredit son parti dit quelque chose, et l'écraser par la
   * ligne du parti serait une falsification. À défaut seulement, on descend la
   * chaîne de reprise.
   */
  return (acteurId, questionId) => {
    const propre = meilleurePosition(parActeur.get(acteurId)?.get(questionId) ?? []);
    if (propre !== null) return { position: propre, heriteDe: null, heriteDeId: null };

    for (const repris of reprises.get(acteurId) ?? []) {
      const position = meilleurePosition(parActeur.get(repris)?.get(questionId) ?? []);
      if (position !== null) {
        return { position, heriteDe: nomParId.get(repris) ?? repris, heriteDeId: repris };
      }
    }

    return null;
  };
}
