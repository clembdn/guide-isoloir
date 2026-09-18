/**
 * Types du moteur de proximité.
 *
 * `boussole-engine` a été cherché dans le dépôt, dans package.json, dans le
 * lockfile, dans node_modules et dans l'historique git de toutes les branches :
 * il n'existe pas. Ce moteur est donc écrit ici, minimal et déterministe.
 *
 * QUATRE GRANDEURS DISTINCTES, et le typage sert à les empêcher de se mélanger :
 *
 *   1. LA POSITION      — la valeur -2..2. Elle seule entre dans le score.
 *   2. LA QUALITÉ DES PREUVES — provenance et confiance. Elles ne touchent
 *      JAMAIS au score. Une position mal documentée reste la position qu'elle
 *      est ; elle ne glisse pas vers le centre.
 *   3. LA COUVERTURE    — combien de questions l'acteur documente réellement.
 *      C'est là qu'une faible confiance se paie.
 *   4. L'INCERTITUDE    — dérivée des trois précédentes, jamais confondue avec
 *      la proximité.
 *
 * Mélanger 1 et 2 avantagerait structurellement les acteurs les mieux couverts,
 * ce que CLAUDE.md interdit explicitement.
 */
import type { StanceValue } from "../modele";

/**
 * Maillon de la chaîne de résolution effectivement employé.
 *
 * Ordre de préférence décroissant, tel que défini dans CLAUDE.md. Le rang sert
 * à choisir la meilleure position disponible et à l'afficher : « position
 * provisoire dérivée du programme du parti » n'est pas « déclaration du
 * candidat », et l'interface doit le dire.
 */
export const NIVEAUX_RESOLUTION = [
  { rang: 1, cle: "official-program", libelle: "Programme du candidat" },
  { rang: 2, cle: "direct-statement", libelle: "Déclaration directe" },
  { rang: 3, cle: "parliamentary-vote", libelle: "Vote au Parlement" },
  { rang: 4, cle: "coalition-platform", libelle: "Plateforme de coalition" },
  { rang: 5, cle: "party-platform", libelle: "Ligne du parti" },
  { rang: 6, cle: "inference", libelle: "Inférence documentée" },
] as const;

export type CleNiveau = (typeof NIVEAUX_RESOLUTION)[number]["cle"];

export type Confiance = "low" | "medium" | "high";

/** Détail d'une comparaison, question par question. */
export type DetailPosition = {
  questionId: string;
  theme: string;
  reponseElecteur: StanceValue;
  /** `null` quand aucune position n'est documentée : position inconnue. */
  positionActeur: StanceValue | null;
  /** Accord dans [0, 1], ou `null` si la position est inconnue. */
  accord: number | null;
  niveauLibelle: string;
  confiance: Confiance | null;
  /**
   * Nom de l'acteur d'origine quand la position est reprise, `null` quand elle
   * est celle de l'acteur comparé.
   *
   * C'est le champ qui interdit de faire passer une ligne de parti pour une
   * déclaration de candidat. L'interface doit le rendre : « Ligne du parti —
   * position de X, aucune déclaration personnelle trouvée ». Elyze affichait des
   * propositions de 2017 comme des positions de 2022 précisément parce que rien
   * dans ses données ne portait cette distinction.
   */
  heriteDe: string | null;
};

export type ResultatTheme = {
  theme: string;
  /** Moyenne d'accord du thème, ou `null` si rien n'y est documenté. */
  score: number | null;
  /** Questions du thème où l'électeur a exprimé une position. */
  applicables: number;
  /** ... et où l'acteur en documente une. */
  documentees: number;
  positions: DetailPosition[];
};

export type Couverture = {
  applicables: number;
  documentees: number;
  /**
   * Positions documentées PAR L'ACTEUR LUI-MÊME, reprises exclues.
   *
   * Un candidat dont toutes les positions viennent de son parti a une couverture
   * complète et aucune position personnelle. Les deux chiffres doivent être
   * lisibles séparément, sinon l'écran laisse croire qu'il s'est exprimé.
   */
  personnelles: number;
  /**
   * Positions documentées par l'acteur lui-même dont la confiance est `medium`
   * ou `high`.
   *
   * Une position reprise du parti n'est pas une preuve solide SUR LE CANDIDAT,
   * quelle que soit la qualité de la source côté parti : elle est solide sur le
   * parti. Elle ne compte donc pas ici, et c'est ce qui fait monter
   * l'incertitude d'un candidat qui ne s'est pas encore exprimé. Le score, lui,
   * ne bouge pas d'un iota — voir les quatre grandeurs ci-dessus.
   */
  solides: number;
  /** `documentees / applicables`, ou 0 si aucune question applicable. */
  taux: number;
  /** `solides / applicables`. C'est ici, et nulle part ailleurs, que la
   *  faiblesse des preuves se paie. */
  tauxSolide: number;
};

export type NiveauIncertitude = "faible" | "moyenne" | "forte";

export type ResultatActeur = {
  actorId: string;
  nom: string;
  sortName: string;
  /** Proximité dans [0, 1]. Normalisée par thème. */
  score: number;
  /** 1 pour le plus proche. Les ex æquo partagent le même rang. */
  rang: number;
  couverture: Couverture;
  incertitude: NiveauIncertitude;
  parTheme: ResultatTheme[];
};

export type Classement = {
  acteurs: ResultatActeur[];
  /** Questions où l'électeur a exprimé une position. « Sans avis » exclu. */
  questionsApplicables: number;
  /** Questions posées, toutes réponses confondues. */
  questionsPosees: number;
  /**
   * Le profil est-il trop peu marqué pour être exploitable ?
   *
   * Un électeur qui répond « ni d'accord, ni pas d'accord » partout obtient un
   * classement mathématiquement valable et humainement vide. Le dire est plus
   * honnête que de le classer quand même.
   */
  profilPeuMarque: boolean;
  /** Les meilleurs scores sont-ils trop resserrés pour être départagés ? */
  ecartsTenus: boolean;
};
