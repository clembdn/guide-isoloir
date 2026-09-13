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

export type Candidate = {
  actorId: string;
  status:
    "potential" | "declared" | "nominated" | "official" | "withdrawn" | "eliminated" | "finalist";
  baselineActorIds: string[];
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
