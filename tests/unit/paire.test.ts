/**
 * Comparaison de deux candidats : relations, exclusion du même document,
 * calcul confié au moteur, symétrie.
 *
 * Jeu d'essai calculable à la main : deux thèmes de deux affirmations, un
 * candidat A qui s'exprime en propre, un candidat B qui reprend un parti P sauf
 * sur une affirmation, et un candidat C qui reprend P partout.
 */
import { describe, expect, it } from "vitest";
import {
  comparablesMinimum,
  cranDe,
  creerComparateur,
  estComparable,
  relationEntre,
  type DonneesPaire,
} from "../../src/lib/paire";
import type { PositionResolue } from "../../src/lib/moteur";
import type { Candidate, PoliticalActor, Stance, StanceValue } from "../../src/lib/modele";

function acteur(id: string, kind: PoliticalActor["kind"] = "candidate"): PoliticalActor {
  return { id, kind, name: id.toUpperCase(), sortName: id, slug: id, status: "active" };
}

function position(actorId: string, questionId: string, value: StanceValue): Stance {
  return {
    id: `${actorId}--${questionId}`,
    actorId,
    questionId,
    value,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["source-essai"],
    citation: "Essai.",
    adequation: "directe",
    rationale: "Essai.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-01",
  };
}

function candidature(actorId: string, baselineActorIds: string[] = []): Candidate {
  return {
    actorId,
    status: "declared",
    baselineActorIds,
    statutDepuis: "2026-09-01",
    statutSourceIds: ["source-essai"],
  };
}

const A = acteur("a");
const B = acteur("b");
const C = acteur("c");
const P = acteur("p", "party");

const DONNEES: DonneesPaire = {
  questions: [
    { id: "q1", theme: "T1" },
    { id: "q2", theme: "T1" },
    { id: "q3", theme: "T2" },
    { id: "q4", theme: "T2" },
  ],
  positions: [
    position("a", "q1", 2),
    position("a", "q2", -1),
    position("a", "q3", 0),
    position("p", "q1", 1),
    position("p", "q2", 1),
    position("p", "q4", -2),
    position("b", "q3", -2),
  ],
  candidatures: [candidature("a"), candidature("b", ["p"]), candidature("c", ["p"])],
  annuaire: [A, B, C, P],
};

const comparer = creerComparateur(DONNEES);

function resolue(stance: Stance, heriteDe: string | null = null): PositionResolue {
  return { position: stance, heriteDe, heriteDeId: heriteDe };
}

describe("crans et relations", () => {
  it("range les valeurs dans l'ordre de l'échelle du test, zéro au milieu", () => {
    expect([2, 1, 0, -1, -2].map((v) => cranDe(v as StanceValue))).toEqual([1, 2, 3, 4, 5]);
  });

  it("nomme les sept relations", () => {
    const pa = resolue(position("a", "q", 2));
    expect(relationEntre(null, null)).toBe("aucune");
    expect(relationEntre(pa, null)).toBe("seul-a");
    expect(relationEntre(null, pa)).toBe("seul-b");
    expect(relationEntre(pa, resolue(position("b", "q", 2)))).toBe("identique");
    expect(relationEntre(pa, resolue(position("b", "q", 1)))).toBe("proche");
    expect(relationEntre(pa, resolue(position("b", "q", 0)))).toBe("eloignee");
    expect(relationEntre(pa, resolue(position("b", "q", -2)))).toBe("eloignee");
  });

  it("reconnaît le même document avant de mesurer un écart", () => {
    const partagee = position("p", "q", 1);
    expect(relationEntre(resolue(partagee, "P"), resolue(partagee, "P"))).toBe("meme-document");
  });
});

describe("seuil de comparaison", () => {
  it("suit le plancher du pourcentage du test : 9 sur 24", () => {
    expect(comparablesMinimum(24)).toBe(9);
    expect(estComparable(9, 24)).toBe(true);
    expect(estComparable(8, 24)).toBe(false);
    expect(estComparable(0, 0)).toBe(false);
  });
});

describe("comparaison confiée au moteur", () => {
  const ab = comparer(A, B);

  it("classe chaque affirmation", () => {
    expect(ab.lignes.map((ligne) => ligne.relation)).toEqual([
      "proche",
      "eloignee",
      "eloignee",
      "seul-b",
    ]);
    expect(ab.lignes.map((ligne) => ligne.ecart)).toEqual([1, 2, 2, null]);
  });

  it("donne le score du test : moyenne des thèmes, pas des affirmations", () => {
    /* T1 : (0,75 + 0,5) / 2 = 0,625 ; T2 : 0,5. Moyenne des thèmes : 0,5625. */
    expect(ab.score).toBe(0.5625);
    expect(ab.parTheme).toEqual([
      { theme: "T1", comparables: 2, daccord: 1, score: 0.625 },
      { theme: "T2", comparables: 1, daccord: 0, score: 0.5 },
    ]);
    expect(ab.comparables).toBe(3);
    expect(ab.daccord).toBe(1);
  });

  it("est symétrique au bit près", () => {
    const ba = comparer(B, A);
    expect(ba.score).toBe(ab.score);
    expect(ba.parTheme).toEqual(ab.parTheme);
    expect(ba.lignes.map((ligne) => ligne.accord)).toEqual(ab.lignes.map((ligne) => ligne.accord));
  });

  it("tient le même document hors du calcul", () => {
    const bc = comparer(B, C);
    expect(bc.lignes.map((ligne) => ligne.relation)).toEqual([
      "meme-document",
      "meme-document",
      "seul-a",
      "meme-document",
    ]);
    expect(bc.comparables).toBe(0);
    expect(bc.daccord).toBe(0);
    expect(bc.score).toBeNull();
    expect(bc.lignes.every((ligne) => ligne.accord === null && ligne.ecart === null)).toBe(true);
  });

  it("ne dépend pas de l'ordre des positions", () => {
    const inverse = creerComparateur({ ...DONNEES, positions: [...DONNEES.positions].reverse() });
    expect(inverse(A, B)).toEqual(ab);
  });
});
