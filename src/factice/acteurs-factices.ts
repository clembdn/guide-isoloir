/**
 * ACTEURS ET POSITIONS FACTICES. AUCUNE DONNÉE POLITIQUE.
 *
 * Aucun de ces acteurs n'existe. Aucune de ces positions n'a été prise par
 * quiconque. Les noms sont volontairement absurdes et rattachés aux questions
 * factices : « Comité du Pain Épais » ne peut être confondu avec rien.
 *
 * Ce jeu est construit pour EXERCER LES INVARIANTS, pas pour ressembler à un
 * paysage politique :
 *
 *   - AUBE et DELTA portent EXACTEMENT les mêmes positions, mais AUBE est
 *     documentée par des programmes à confiance haute et DELTA par des
 *     inférences à confiance basse. Leurs scores doivent être identiques et
 *     leurs couvertures différentes. C'est la démonstration que la qualité des
 *     preuves ne déplace pas le score ;
 *   - CADRAN et ENTENTE portent les mêmes positions : ils sont ex æquo par
 *     construction, ce qui rend le partage de rang vérifiable sans dépendre
 *     d'un profil de réponses particulier ;
 *   - COMITÉ ne documente que le thème Voirie : sa couverture est partielle,
 *     et le thème Cantine doit être écarté de sa moyenne, pas compté zéro.
 *
 * `scripts/verifier-pages-publiques.mjs --strict` refuse un build de production
 * qui sert encore ce fichier.
 */
import type { PoliticalActor, Stance, StanceProvenance, StanceValue } from "../lib/modele";
import { QUESTIONS_FACTICES } from "./questions-factices";

export const DONNEES_FACTICES = true;

export const AVERTISSEMENT_ACTEURS_FACTICES =
  "Ces acteurs n'existent pas et ces positions n'ont été prises par personne. " +
  "Le classement ci-dessous ne signifie rien : il sert à mettre l'écran au point.";

export const ACTEURS_FACTICES: readonly PoliticalActor[] = [
  {
    id: "factice-acteur-aube",
    kind: "party",
    name: "Alliance des Trottoirs Propres",
    sortName: "Alliance des Trottoirs Propres",
    slug: "factice-alliance-trottoirs",
    status: "active",
  },
  {
    id: "factice-acteur-cadran",
    kind: "party",
    name: "Bureau des Horloges Publiques",
    sortName: "Bureau des Horloges Publiques",
    slug: "factice-bureau-horloges",
    status: "active",
  },
  {
    id: "factice-acteur-comite",
    kind: "coalition",
    name: "Comité du Pain Épais",
    sortName: "Comité du Pain Épais",
    slug: "factice-comite-pain",
    status: "active",
  },
  {
    id: "factice-acteur-delta",
    kind: "party",
    name: "Délégation aux Bancs Publics",
    sortName: "Délégation aux Bancs Publics",
    slug: "factice-delegation-bancs",
    status: "active",
  },
  {
    id: "factice-acteur-entente",
    kind: "coalition",
    name: "Entente des Passages Piétons",
    sortName: "Entente des Passages Piétons",
    slug: "factice-entente-passages",
    status: "active",
  },
];

const IDS = QUESTIONS_FACTICES.map((question) => question.id);

type Gabarit = {
  actorId: string;
  /** Une valeur par question, dans l'ordre de QUESTIONS_FACTICES. `null` = non documenté. */
  valeurs: readonly (StanceValue | null)[];
  provenance: StanceProvenance;
  confidence: Stance["confidence"];
};

const GABARITS: readonly Gabarit[] = [
  {
    actorId: "factice-acteur-aube",
    valeurs: [2, -2, 1, -1, 2, -2],
    provenance: "official-program",
    confidence: "high",
  },
  {
    actorId: "factice-acteur-cadran",
    valeurs: [1, -1, 2, -2, 0, 1],
    provenance: "direct-statement",
    confidence: "medium",
  },
  {
    // Couverture partielle : le thème Cantine n'est pas documenté du tout.
    // Positions distinctes d'AUBE, sans quoi les trois premiers seraient ex æquo
    // sur presque tout profil et l'écran ne montrerait jamais qu'une seule
    // qualification.
    actorId: "factice-acteur-comite",
    valeurs: [0, -2, 2, 0, null, null],
    provenance: "party-platform",
    confidence: "medium",
  },
  {
    // Mêmes positions qu'AUBE, preuves les plus faibles de la chaîne.
    actorId: "factice-acteur-delta",
    valeurs: [2, -2, 1, -1, 2, -2],
    provenance: "inference",
    confidence: "low",
  },
  {
    // Mêmes positions que CADRAN : ex æquo par construction.
    actorId: "factice-acteur-entente",
    valeurs: [1, -1, 2, -2, 0, 1],
    provenance: "coalition-platform",
    confidence: "medium",
  },
];

export const POSITIONS_FACTICES: readonly Stance[] = GABARITS.flatMap((gabarit) =>
  gabarit.valeurs.flatMap((valeur, index) => {
    if (valeur === null) return [];
    const questionId = IDS[index]!;
    return [
      {
        id: `${gabarit.actorId}--${questionId}`,
        actorId: gabarit.actorId,
        questionId,
        value: valeur,
        provenance: gabarit.provenance,
        confidence: gabarit.confidence,
        sourceIds: ["source-factice"],
        rationale: "Position d'exemple. Aucune déclaration réelle.",
        reviewStatus: "draft",
        updatedAt: "2026-09-14",
      } satisfies Stance,
    ];
  }),
);
