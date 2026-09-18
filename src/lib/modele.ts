/**
 * Modèle de données.
 *
 * Aucune donnée politique n'existe encore dans ce dépôt : ce fichier ne décrit
 * que les formes. Il est la référence, `CLAUDE.md` en est le résumé.
 *
 * L'entité primaire est l'acteur politique, pas le candidat : un candidat peut
 * contredire son parti, se retirer avant mars 2027, ou sortir d'une primaire.
 *
 * Pas de champs `validFrom` / `validTo` / `supersedesId` : les données sont du
 * JSON versionné dans git, et git est la table d'historique.
 */

export type ActorKind = "party" | "candidate" | "coalition" | "campaign" | "independent";

export type PoliticalActor = {
  id: string;
  kind: ActorKind;
  /** Nom affiché, tel qu'il s'écrit. */
  name: string;
  /**
   * Clé de tri alphabétique, saisie à la main.
   *
   * L'ordre d'affichage hors classement est alphabétique. Le déduire de `name`
   * est impossible de façon fiable : un nom composé, une particule, un parti
   * désigné par un sigle et une coalition ne se trient pas selon la même règle,
   * et un tri automatique produirait un ordre qui paraîtrait arbitraire — donc
   * suspect — sur un site de comparaison politique.
   *
   * La règle retenue est écrite sur `/charte-editoriale` et la valeur est
   * vérifiable dans les données publiées.
   */
  sortName: string;
  slug: string;
  status: "active" | "inactive" | "withdrawn" | "historical";
};

export type CandidateStatus =
  "potential" | "declared" | "nominated" | "official" | "withdrawn" | "eliminated" | "finalist";

export type Candidate = {
  actorId: string;
  status: CandidateStatus;
  /**
   * Acteurs dont on reprend la position à défaut de position personnelle.
   *
   * Ordre de préférence décroissant : coalition avant parti, par exemple. Le
   * moteur descend cette liste et s'arrête au premier acteur qui documente la
   * question. Une position reprise n'est JAMAIS présentée comme une déclaration
   * du candidat : le résultat porte le nom de l'acteur d'origine.
   */
  baselineActorIds: string[];
  /**
   * Date à laquelle ce statut est devenu vrai, et ses sources.
   *
   * Un statut de candidature est un fait public et datable : une déclaration,
   * une investiture, un retrait. Il s'affiche donc avec sa date, et il se
   * vérifie. Sans source, pas de statut — c'est la même règle que pour une
   * position.
   */
  statutDepuis: string;
  statutSourceIds: string[];
};

export type StanceValue = -2 | -1 | 0 | 1 | 2;

export type StanceProvenance =
  | "official-program"
  | "direct-statement"
  | "parliamentary-vote"
  | "party-platform"
  | "coalition-platform"
  | "inference";

export type Stance = {
  id: string;
  actorId: string;
  questionId: string;
  value: StanceValue;
  provenance: StanceProvenance;
  confidence: "low" | "medium" | "high";
  sourceIds: string[];
  /**
   * Verbatim court qui porte la position, tel qu'il a été prononcé ou écrit.
   *
   * C'est le champ qui distingue une position relevée d'une position rédigée.
   * Obligatoire partout SAUF pour une `inference`, seul maillon où il n'existe
   * aucune phrase à citer — et où `rationale` doit alors porter le raisonnement
   * complet. Ce n'est pas une facilité : sans citation, personne ne peut
   * contester un codage, et un codage incontestable est un codage non vérifié.
   */
  citation: string;
  rationale: string;
  reviewStatus: "draft" | "double-coded" | "reconciled" | "published";
  updatedAt: string;
};

/**
 * Ordre d'affichage hors classement.
 *
 * `Intl.Collator` avec la locale française pour que les accents soient triés
 * comme en français, et `sensitivity: "base"` pour que la casse ne décide de
 * rien. L'égalité parfaite est départagée par `id`, afin que l'ordre soit
 * strictement déterministe : l'audit vérifie que l'ordre du JSON n'a aucun
 * effet sur les résultats.
 */
export function trierParNomAlphabetique<T extends Pick<PoliticalActor, "sortName" | "id">>(
  acteurs: readonly T[],
): T[] {
  const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: false });
  return [...acteurs].sort(
    (a, b) => collator.compare(a.sortName, b.sortName) || a.id.localeCompare(b.id),
  );
}
