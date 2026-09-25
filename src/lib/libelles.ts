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
import type {
  CandidateStatus,
  DomaineProposition,
  EtatProgramme,
  NatureProposition,
  StanceAdequation,
} from "./modele";

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

/** Nombre de crans de l'échelle d'avancement d'une candidature. */
export const CRANS_CANDIDATURE = 4;

/**
 * Avancement d'une candidature : le tag affiché à côté de chaque nom.
 *
 * TIRÉ MÉCANIQUEMENT DU STATUT, JAMAIS D'UN JUGEMENT. Un « niveau de
 * confiance » fixé à la main pour chaque candidat serait une appréciation
 * politique déguisée ; une étape franchie est un fait daté et sourcé, le même
 * pour tous. Le rang dit combien d'étapes publiques sont franchies, pas les
 * chances d'être élu, ni même d'être sur le bulletin : aucune candidature
 * n'est certaine avant la liste du Conseil constitutionnel.
 *
 * `rang: null` pour une candidature close : elle n'avance plus, et une barre à
 * moitié remplie laisserait croire le contraire. Formes nominales, comme les
 * statuts : « investiture », pas « investie ».
 */
export const ETAPES_CANDIDATURE: Record<
  CandidateStatus,
  { rang: 1 | 2 | 3 | 4 | null; court: string }
> = {
  potential: { rang: 1, court: "Primaire en cours" },
  declared: { rang: 2, court: "Candidature déclarée" },
  nominated: { rang: 3, court: "Investiture par un parti" },
  official: { rang: 4, court: "Validation par le Conseil constitutionnel" },
  finalist: { rang: 4, court: "Qualification pour le second tour" },
  withdrawn: { rang: null, court: "Candidature retirée" },
  eliminated: { rang: null, court: "Élimination au premier tour" },
};

/** Les quatre étapes, dans l'ordre, pour la légende du tag. */
export const LEGENDE_ETAPES: readonly { rang: number; court: string; detail: string }[] = [
  {
    rang: 1,
    court: "Primaire en cours",
    detail: "Candidature à une primaire de parti, dont l'issue n'est pas connue.",
  },
  {
    rang: 2,
    court: "Candidature déclarée",
    detail: "La personne a annoncé publiquement qu'elle se présente.",
  },
  {
    rang: 3,
    court: "Investiture par un parti",
    detail: "Un parti a désigné la personne par un vote ou une décision de ses instances.",
  },
  {
    rang: 4,
    court: "Validation par le Conseil constitutionnel",
    detail: "La personne a réuni les 500 présentations d'élus et figure sur la liste officielle.",
  },
];

/**
 * Nature d'une proposition, en toutes lettres. Affichée à côté de CHAQUE
 * proposition, pas une fois en tête de fiche : c'est elle qui empêche de lire
 * une proposition de loi de 2023 comme une promesse de 2027.
 */
export const LIBELLES_NATURE_PROPOSITION: Record<NatureProposition, string> = {
  "programme-2027": "Programme 2027",
  "declaration-personnelle": "Déclaration personnelle",
  "document-parti": "Document du parti",
  "travail-parlementaire": "Travail parlementaire",
  "programme-anterieur": "Programme d'une élection précédente",
};

/**
 * Ordre des natures, du plus engageant pour 2027 au moins engageant. Sert à
 * l'aperçu de la liste des candidats : une règle mécanique et publiée, pas un
 * choix de « mesures phares ».
 */
export const ORDRE_NATURE_PROPOSITION: readonly NatureProposition[] = [
  "programme-2027",
  "declaration-personnelle",
  "document-parti",
  "travail-parlementaire",
  "programme-anterieur",
];

export const LIBELLES_DOMAINE: Record<DomaineProposition, string> = {
  "travail-retraites": "Travail et retraites",
  "economie-salaires": "Économie et salaires",
  fiscalite: "Fiscalité et dépense publique",
  immigration: "Immigration et nationalité",
  ecologie: "Écologie et énergie",
  institutions: "Institutions et démocratie",
  "europe-international": "Europe et international",
  "securite-justice": "Sécurité et justice",
  "sante-grand-age": "Santé et grand âge",
  "education-jeunesse": "Éducation, jeunesse et numérique",
  "famille-societe": "Famille et société",
};

/** Forme courte, pour les repères chiffrés de la liste et de la fiche. */
export const LIBELLES_ETAT_PROGRAMME_COURT: Record<EtatProgramme["etat"], string> = {
  publie: "Publié",
  "en-construction": "En construction",
  "non-publie": "Non publié",
};

export const LIBELLES_ETAT_PROGRAMME: Record<EtatProgramme["etat"], string> = {
  publie: "Programme publié",
  "en-construction": "Programme en construction",
  "non-publie": "Aucun programme publié",
};
