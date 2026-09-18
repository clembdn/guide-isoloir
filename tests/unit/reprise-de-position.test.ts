/**
 * Reprise de position : un candidat sans déclaration personnelle.
 *
 * C'est le mécanisme qui permet de présenter un candidat avant qu'il ait un
 * programme, sans rien inventer. Il n'est honnête qu'à trois conditions, et
 * chacune est un test ici :
 *
 *   1. une position personnelle l'emporte toujours sur celle du parti, même
 *      moins bien documentée — un candidat qui contredit son parti dit quelque
 *      chose ;
 *   2. une position reprise porte le nom de l'acteur d'origine, pour que
 *      l'interface ne puisse pas la présenter comme une déclaration ;
 *   3. une position reprise ne compte pas comme preuve solide sur le candidat,
 *      donc elle fait monter son incertitude — sans jamais déplacer son score.
 *
 * La troisième est celle qu'Elyze n'avait pas : ses propositions de 2017
 * s'affichaient en 2022 sans que rien, dans les données, ne dise qu'elles
 * n'étaient pas de la campagne en cours.
 */
import { describe, expect, it } from "vitest";
import { calculer } from "../../src/lib/moteur";
import type { Candidate, PoliticalActor, Stance, StanceValue } from "../../src/lib/modele";
import type { Question } from "../../src/lib/questions";

function question(id: string, theme: string, ordre: number): Question {
  return {
    id,
    theme,
    texte: `Affirmation d'essai numéro ${ordre} pour le thème ${theme}.`,
    direction: ordre % 2 === 0 ? 1 : -1,
    infobulle: "Terme d'essai employé uniquement dans les tests unitaires.",
    infobulleSourceId: "source-essai",
    version: 1,
    ordre,
  };
}

function acteur(id: string, kind: PoliticalActor["kind"], nom: string): PoliticalActor {
  return { id, kind, name: nom, sortName: nom, slug: id, status: "active" };
}

function position(
  actorId: string,
  questionId: string,
  value: StanceValue,
  provenance: Stance["provenance"] = "party-platform",
  confidence: Stance["confidence"] = "high",
): Stance {
  return {
    id: `${actorId}--${questionId}--${provenance}`,
    actorId,
    questionId,
    value,
    provenance,
    confidence,
    sourceIds: ["source-essai"],
    citation: "",
    rationale: "Essai.",
    reviewStatus: "draft",
    updatedAt: "2026-01-01",
  };
}

const QUESTIONS = [question("q1", "T", 1), question("q2", "T", 2)];

const PARTI = acteur("parti-essai", "party", "Parti d'essai");
const CANDIDAT = acteur("candidate-essai", "candidate", "Candidat d'essai");

const CANDIDATURE: Candidate = {
  actorId: "candidate-essai",
  status: "declared",
  baselineActorIds: ["parti-essai"],
  statutDepuis: "2026-09-01",
  statutSourceIds: ["source-essai"],
};

const REPONSES = { q1: 2, q2: 2 } as const;

describe("sans candidature déclarée, rien n'est repris", () => {
  it("laisse le candidat sans position", () => {
    const classement = calculer({
      questions: QUESTIONS,
      acteurs: [CANDIDAT],
      positions: [position("parti-essai", "q1", 2)],
      reponses: REPONSES,
    });

    const candidat = classement.acteurs[0]!;
    expect(candidat.couverture.documentees).toBe(0);
    expect(candidat.parTheme[0]!.positions[0]!.niveauLibelle).toBe("Position inconnue");
  });
});

describe("avec candidature, la ligne du parti comble les trous", () => {
  const entrees = {
    questions: QUESTIONS,
    acteurs: [PARTI, CANDIDAT],
    positions: [position("parti-essai", "q1", 2), position("parti-essai", "q2", -2)],
    reponses: REPONSES,
    candidatures: [CANDIDATURE],
  };

  it("donne au candidat le même score qu'à son parti", () => {
    const classement = calculer(entrees);
    const parti = classement.acteurs.find((a) => a.actorId === "parti-essai")!;
    const candidat = classement.acteurs.find((a) => a.actorId === "candidate-essai")!;

    expect(candidat.score).toBe(parti.score);
    expect(candidat.rang).toBe(parti.rang);
  });

  it("nomme l'acteur d'origine sur chaque position reprise", () => {
    const candidat = calculer(entrees).acteurs.find((a) => a.actorId === "candidate-essai")!;

    for (const detail of candidat.parTheme[0]!.positions) {
      expect(detail.heriteDe).toBe("Parti d'essai");
    }
  });

  it("ne marque aucune position reprise comme personnelle ni comme solide", () => {
    const classement = calculer(entrees);
    const parti = classement.acteurs.find((a) => a.actorId === "parti-essai")!;
    const candidat = classement.acteurs.find((a) => a.actorId === "candidate-essai")!;

    expect(candidat.couverture.documentees).toBe(2);
    expect(candidat.couverture.personnelles).toBe(0);
    expect(candidat.couverture.solides).toBe(0);

    expect(parti.couverture.personnelles).toBe(2);
    expect(parti.couverture.solides).toBe(2);
  });

  /*
   * Le score est la même grandeur pour les deux ; l'incertitude ne l'est pas.
   * C'est exactement la séparation que CLAUDE.md impose entre proximité
   * politique et confiance documentaire.
   */
  it("laisse le candidat plus incertain que son parti, à score égal", () => {
    const classement = calculer(entrees);
    const parti = classement.acteurs.find((a) => a.actorId === "parti-essai")!;
    const candidat = classement.acteurs.find((a) => a.actorId === "candidate-essai")!;

    expect(candidat.score).toBe(parti.score);
    expect(parti.incertitude).toBe("faible");
    expect(candidat.incertitude).toBe("forte");
  });
});

describe("une position personnelle l'emporte sur celle du parti", () => {
  it("retient la déclaration du candidat même moins bien documentée", () => {
    const classement = calculer({
      questions: QUESTIONS,
      acteurs: [PARTI, CANDIDAT],
      positions: [
        position("parti-essai", "q1", -2, "party-platform", "high"),
        position("candidate-essai", "q1", 2, "direct-statement", "low"),
        position("parti-essai", "q2", 2),
      ],
      reponses: REPONSES,
      candidatures: [CANDIDATURE],
    });

    const candidat = classement.acteurs.find((a) => a.actorId === "candidate-essai")!;
    const q1 = candidat.parTheme[0]!.positions.find((d) => d.questionId === "q1")!;

    expect(q1.positionActeur).toBe(2);
    expect(q1.heriteDe).toBeNull();
    expect(q1.niveauLibelle).toBe("Déclaration directe");
    expect(candidat.couverture.personnelles).toBe(1);
  });
});

describe("la chaîne de reprise est parcourue dans l'ordre déclaré", () => {
  it("préfère la coalition au parti quand elle vient d'abord", () => {
    const coalition = acteur("coalition-essai", "coalition", "Coalition d'essai");
    const classement = calculer({
      questions: QUESTIONS,
      acteurs: [PARTI, coalition, CANDIDAT],
      positions: [
        position("parti-essai", "q1", -2),
        position("coalition-essai", "q1", 2, "coalition-platform"),
        position("parti-essai", "q2", 1),
      ],
      reponses: REPONSES,
      candidatures: [{ ...CANDIDATURE, baselineActorIds: ["coalition-essai", "parti-essai"] }],
    });

    const candidat = classement.acteurs.find((a) => a.actorId === "candidate-essai")!;
    const positions = candidat.parTheme[0]!.positions;

    expect(positions.find((d) => d.questionId === "q1")!.heriteDe).toBe("Coalition d'essai");
    expect(positions.find((d) => d.questionId === "q1")!.positionActeur).toBe(2);
    // q2 n'existe que chez le parti : on descend d'un maillon.
    expect(positions.find((d) => d.questionId === "q2")!.heriteDe).toBe("Parti d'essai");
  });
});
