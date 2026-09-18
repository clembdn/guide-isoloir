/**
 * Invariants du moteur de proximité.
 *
 * `boussole-engine` n'existe pas dans ce dépôt : ces tests portent sur le moteur
 * écrit dans `src/lib/moteur/`.
 *
 * Chaque test correspond à une règle de calcul non négociable de CLAUDE.md. Ils
 * ne vérifient pas que le moteur « marche » : ils vérifient qu'il ne peut pas
 * avantager quelqu'un mécaniquement.
 */
import { describe, expect, it } from "vitest";
import { calculer } from "../../src/lib/moteur";
import { SANS_AVIS } from "../../src/lib/session-test";
import type { PoliticalActor, Stance, StanceValue } from "../../src/lib/modele";
import type { Question } from "../../src/lib/questions";
import { ACTEURS_FACTICES, POSITIONS_FACTICES } from "../../src/factice/acteurs-factices";
import { QUESTIONS_FACTICES } from "../../src/factice/questions-factices";

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

function acteur(id: string, sortName: string): PoliticalActor {
  return { id, kind: "party", name: sortName, sortName, slug: id, status: "active" };
}

function position(
  actorId: string,
  questionId: string,
  value: StanceValue,
  confidence: Stance["confidence"] = "high",
): Stance {
  return {
    id: `${actorId}--${questionId}`,
    actorId,
    questionId,
    value,
    provenance: confidence === "low" ? "inference" : "official-program",
    confidence,
    sourceIds: ["source-essai"],
    citation: "",
    rationale: "Essai.",
    reviewStatus: "draft",
    updatedAt: "2026-01-01",
  };
}

describe("« sans avis » est exclu, jamais traité comme neutre", () => {
  const questions = [question("q1", "T", 1), question("q2", "T", 2)];
  const acteurs = [acteur("a", "A")];

  it("ne compte pas une question sans avis dans les applicables", () => {
    const classement = calculer({
      questions,
      acteurs,
      positions: [position("a", "q1", 2), position("a", "q2", 2)],
      reponses: { q1: 2, q2: SANS_AVIS },
    });

    expect(classement.questionsApplicables).toBe(1);
    expect(classement.acteurs[0]!.couverture.applicables).toBe(1);
  });

  it("ne donne pas le même résultat que si l'électeur avait répondu 0", () => {
    const commun = {
      questions,
      acteurs,
      positions: [position("a", "q1", 2), position("a", "q2", 2)],
    };

    const avecSansAvis = calculer({ ...commun, reponses: { q1: 2, q2: SANS_AVIS } });
    const avecNeutre = calculer({ ...commun, reponses: { q1: 2, q2: 0 } });

    // Traiter « sans avis » comme 0 rapprocherait l'électeur des positions
    // modérées et l'éloignerait des positions tranchées. Ce n'est pas la même
    // chose, et le moteur ne doit pas les confondre.
    expect(avecSansAvis.acteurs[0]!.score).not.toBeCloseTo(avecNeutre.acteurs[0]!.score, 6);
    expect(avecSansAvis.acteurs[0]!.score).toBe(1);
    expect(avecNeutre.acteurs[0]!.score).toBe(0.75);
  });
});

describe("la qualité des preuves ne déplace jamais le score", () => {
  const questions = [question("q1", "T", 1), question("q2", "T", 2)];
  const acteurs = [acteur("solide", "Solide"), acteur("fragile", "Fragile")];

  // Positions rigoureusement identiques, preuves opposées.
  const positions = [
    position("solide", "q1", 2, "high"),
    position("solide", "q2", -2, "high"),
    position("fragile", "q1", 2, "low"),
    position("fragile", "q2", -2, "low"),
  ];

  const classement = calculer({ questions, acteurs, positions, reponses: { q1: 2, q2: -1 } });
  const solide = classement.acteurs.find((r) => r.actorId === "solide")!;
  const fragile = classement.acteurs.find((r) => r.actorId === "fragile")!;

  it("donne exactement le même score", () => {
    expect(fragile.score).toBe(solide.score);
  });

  it("les met au même rang", () => {
    expect(fragile.rang).toBe(solide.rang);
  });

  it("ne tire pas la position mal documentée vers le centre", () => {
    // Un moteur qui amortirait les positions peu sûres rapprocherait « fragile »
    // du point milieu, donc modifierait son accord avec un électeur tranché.
    const detail = fragile.parTheme[0]!.positions.find((p) => p.questionId === "q1")!;
    expect(detail.positionActeur).toBe(2);
  });

  it("mais fait payer la faiblesse des preuves sur la couverture", () => {
    expect(solide.couverture.tauxSolide).toBe(1);
    expect(fragile.couverture.tauxSolide).toBe(0);
    // La couverture brute, elle, est la même : les positions existent bien.
    expect(fragile.couverture.taux).toBe(solide.couverture.taux);
  });

  it("et se voit dans l'incertitude, pas dans la proximité", () => {
    expect(solide.incertitude).toBe("faible");
    expect(fragile.incertitude).toBe("forte");
  });
});

describe("une position inconnue ne vaut pas un désaccord", () => {
  const questions = [question("q1", "T", 1), question("q2", "T", 2)];
  const acteurs = [acteur("complet", "Complet"), acteur("partiel", "Partiel")];

  const classement = calculer({
    questions,
    acteurs,
    // « partiel » ne documente que q1, avec la même valeur que « complet ».
    positions: [
      position("complet", "q1", 2),
      position("complet", "q2", 2),
      position("partiel", "q1", 2),
    ],
    reponses: { q1: 2, q2: 2 },
  });

  it("écarte la question de la moyenne au lieu de la compter zéro", () => {
    const partiel = classement.acteurs.find((r) => r.actorId === "partiel")!;
    // Compter q2 comme un désaccord total donnerait 0,5. L'écarter donne 1.
    expect(partiel.score).toBe(1);
    expect(partiel.couverture.documentees).toBe(1);
    expect(partiel.couverture.taux).toBe(0.5);
  });

  it("expose le maillon « position inconnue » dans le détail", () => {
    const partiel = classement.acteurs.find((r) => r.actorId === "partiel")!;
    const inconnue = partiel.parTheme[0]!.positions.find((p) => p.questionId === "q2")!;
    expect(inconnue.positionActeur).toBeNull();
    expect(inconnue.niveauLibelle).toBe("Position inconnue");
  });
});

describe("normalisation par thème", () => {
  // Trois questions dans « Gros », une seule dans « Petit ».
  const questions = [
    question("g1", "Gros", 1),
    question("g2", "Gros", 2),
    question("g3", "Gros", 3),
    question("p1", "Petit", 4),
  ];
  const acteurs = [acteur("a", "A")];

  it("ne fait pas peser un thème plus fourni davantage qu'un autre", () => {
    const classement = calculer({
      questions,
      acteurs,
      positions: [
        // Accord parfait sur les trois questions du gros thème.
        position("a", "g1", 2),
        position("a", "g2", 2),
        position("a", "g3", 2),
        // Désaccord total sur l'unique question du petit thème.
        position("a", "p1", -2),
      ],
      reponses: { g1: 2, g2: 2, g3: 2, p1: 2 },
    });

    // Sans normalisation : (1 + 1 + 1 + 0) / 4 = 0,75.
    // Avec normalisation : (1 + 0) / 2 = 0,5. Chaque thème pèse pareil.
    expect(classement.acteurs[0]!.score).toBe(0.5);
  });

  it("écarte un thème entièrement non documenté au lieu de le compter zéro", () => {
    const classement = calculer({
      questions,
      acteurs,
      positions: [position("a", "g1", 2), position("a", "g2", 2), position("a", "g3", 2)],
      reponses: { g1: 2, g2: 2, g3: 2, p1: 2 },
    });

    expect(classement.acteurs[0]!.score).toBe(1);
    expect(classement.acteurs[0]!.parTheme.find((t) => t.theme === "Petit")!.score).toBeNull();
  });
});

describe("ex æquo", () => {
  const questions = [question("q1", "T", 1)];
  const acteurs = [acteur("zeta", "Zeta"), acteur("alpha", "Alpha")];
  const classement = calculer({
    questions,
    acteurs,
    positions: [position("zeta", "q1", 1), position("alpha", "q1", 1)],
    reponses: { q1: 1 },
  });

  it("partagent le même rang", () => {
    expect(classement.acteurs.map((r) => r.rang)).toEqual([1, 1]);
  });

  it("sont présentés par ordre alphabétique, sans que cela hiérarchise", () => {
    // Le départage alphabétique est une décision de PRÉSENTATION. Il ne doit
    // jamais se traduire par un rang différent.
    expect(classement.acteurs.map((r) => r.actorId)).toEqual(["alpha", "zeta"]);
    expect(new Set(classement.acteurs.map((r) => r.rang)).size).toBe(1);
  });
});

describe("déterminisme", () => {
  const reponses = { [QUESTIONS_FACTICES[0]!.id]: 2, [QUESTIONS_FACTICES[3]!.id]: -1 } as const;

  const entrees = {
    questions: QUESTIONS_FACTICES,
    acteurs: ACTEURS_FACTICES,
    positions: POSITIONS_FACTICES,
    reponses,
  };

  it("rend le même résultat à deux exécutions", () => {
    expect(JSON.stringify(calculer(entrees))).toBe(JSON.stringify(calculer(entrees)));
  });

  it("ne dépend pas de l'ordre des tableaux d'entrée", () => {
    const inverse = calculer({
      questions: [...QUESTIONS_FACTICES].reverse(),
      acteurs: [...ACTEURS_FACTICES].reverse(),
      positions: [...POSITIONS_FACTICES].reverse(),
      reponses,
    });

    expect(JSON.stringify(inverse)).toBe(JSON.stringify(calculer(entrees)));
  });
});

describe("symétrie de l'échelle", () => {
  it("inverser le signe de tout ne change aucun score", () => {
    const questions = [question("q1", "T", 1), question("q2", "T", 2)];
    const acteurs = [acteur("a", "A"), acteur("b", "B")];

    const droit = calculer({
      questions,
      acteurs,
      positions: [position("a", "q1", 2), position("a", "q2", -1), position("b", "q1", -2)],
      reponses: { q1: 1, q2: -2 },
    });

    const miroir = calculer({
      questions,
      acteurs,
      positions: [position("a", "q1", -2), position("a", "q2", 1), position("b", "q1", 2)],
      reponses: { q1: -1, q2: 2 },
    });

    expect(miroir.acteurs.map((r) => r.score)).toEqual(droit.acteurs.map((r) => r.score));
  });
});

describe("garde-fous d'interprétation", () => {
  it("signale un profil peu marqué quand l'électeur reste au point milieu", () => {
    const questions = [question("q1", "T", 1), question("q2", "T", 2), question("q3", "T", 3)];
    const classement = calculer({
      questions,
      acteurs: [acteur("a", "A")],
      positions: [position("a", "q1", 2)],
      reponses: { q1: 0, q2: 0, q3: 0 },
    });

    expect(classement.profilPeuMarque).toBe(true);
  });

  it("signale des écarts trop tenus pour départager", () => {
    /*
     * La granularité compte. Avec n questions dans un thème, le plus petit
     * écart de score possible vaut 0,25 / n. À quatre questions il vaut 0,0625,
     * soit plus que le seuil de cinq centièmes : le garde-fou ne peut pas se
     * déclencher. Il en faut huit pour descendre à 0,03125.
     */
    const questions = Array.from({ length: 8 }, (_, i) => question(`q${i}`, "T", i));
    const acteurs = [acteur("a", "A"), acteur("b", "B"), acteur("c", "C")];
    const reponses = Object.fromEntries(questions.map((q) => [q.id, 2 as StanceValue]));

    const accordParfait = (id: string) =>
      questions.map((q) => position(id, q.id, 2 as StanceValue));

    const separe = calculer({
      questions,
      acteurs,
      positions: [
        ...accordParfait("a"),
        ...accordParfait("b").map((p, i) => (i < 2 ? { ...p, value: -2 as StanceValue } : p)),
        ...accordParfait("c").map((p, i) => (i < 4 ? { ...p, value: -2 as StanceValue } : p)),
      ],
      reponses,
    });
    expect(separe.ecartsTenus).toBe(false);

    const resserre = calculer({
      questions,
      acteurs,
      positions: [
        ...accordParfait("a"),
        ...accordParfait("b"),
        // Un seul cran d'écart sur une seule question : 0,03125.
        ...accordParfait("c").map((p, i) => (i === 0 ? { ...p, value: 1 as StanceValue } : p)),
      ],
      reponses,
    });

    expect(resserre.acteurs.map((r) => r.score)).toEqual([1, 1, 0.96875]);
    expect(resserre.ecartsTenus).toBe(true);
  });
});
