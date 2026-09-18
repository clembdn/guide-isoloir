/**
 * AUDIT DES INVARIANTS MÉCANIQUES.
 *
 * CE QUE CET AUDIT NE FAIT PAS. Il ne certifie pas une absence de biais. Aucun
 * script ne le peut : un biais peut tenir au choix des questions, à leur
 * formulation, au découpage des thèmes, ou à ce qui n'est pas demandé. Ces
 * décisions sont éditoriales et se défendent par écrit, pas par un test.
 *
 * CE QU'IL FAIT. Il vérifie des propriétés mécaniques du calcul, publiées dans
 * la méthodologie, et il échoue si l'une tombe. La formulation autorisée est
 * « écart mécanique non expliqué ». Jamais « aucun biais ».
 *
 * Tout y est déterministe, graine comprise : un audit dont le résultat change
 * d'une exécution à l'autre ne peut être ni cité ni contesté.
 */
import { afterAll, describe, expect, it } from "vitest";
import { calculer } from "../../src/lib/moteur";
import type { PoliticalActor, Stance, StanceValue } from "../../src/lib/modele";
import type { Question } from "../../src/lib/questions";
import { QUESTIONS_FACTICES } from "../../src/factice/questions-factices";
import { QUESTIONS } from "../../src/data/questions";
import { ACTEURS_FACTICES, POSITIONS_FACTICES } from "../../src/factice/acteurs-factices";
import { entier, generateur, melanger } from "./aleatoire";

/** Graine écrite en clair : l'audit doit être rejouable à l'identique. */
const GRAINE = 20270418;

/** Nombre de profils d'électeurs tirés pour les invariants statistiques. */
const PROFILS = 2000;

/** Écart toléré sur une moyenne de 2000 tirages. Au-delà, il faut l'expliquer. */
const TOLERANCE_STATISTIQUE = 0.01;

const ECHELLE: readonly StanceValue[] = [-2, -1, 0, 1, 2];

/**
 * Jeux de questions soumis aux invariants de forme.
 *
 * Les deux y passent, pas seulement celui qui sera servi. Le jeu factice a des
 * thèmes de tailles volontairement différentes : c'est lui qui rend l'invariant
 * de couverture vérifiable, un jeu parfaitement équilibré ne prouverait rien.
 * Le jeu réel doit y passer aussi, sinon l'audit ne dit rien de ce qui sera
 * publié.
 *
 * Les invariants de CALCUL, eux, restent sur le jeu factice : ils ont besoin de
 * positions, et le questionnaire réel n'en a aucune.
 */
const JEUX_DE_QUESTIONS: readonly { nom: string; questions: readonly Question[] }[] = [
  { nom: "factice", questions: QUESTIONS_FACTICES },
  { nom: "réel", questions: QUESTIONS },
];

const releves: string[] = [];
function relever(ligne: string) {
  releves.push(ligne);
}

afterAll(() => {
  console.log(
    ["", "RELEVÉ D'AUDIT", "".padEnd(60, "-"), ...releves, "".padEnd(60, "-"), ""].join("\n"),
  );
});

function profilAleatoire(tirage: () => number, questions: readonly Question[]) {
  return Object.fromEntries(
    questions.map((question) => [question.id, ECHELLE[entier(tirage, ECHELLE.length)]!]),
  );
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
    sourceIds: ["source-audit"],
    citation: "",
    adequation: "directe",
    rationale: "Audit.",
    reviewStatus: "draft",
    updatedAt: "2026-01-01",
  };
}

const BASE = {
  questions: QUESTIONS_FACTICES,
  acteurs: ACTEURS_FACTICES,
  positions: POSITIONS_FACTICES,
};

const scoresPar = (classement: ReturnType<typeof calculer>) =>
  Object.fromEntries(classement.acteurs.map((resultat) => [resultat.actorId, resultat.score]));

describe("invariant : permutation des acteurs", () => {
  it("les scores ne changent pas quand l'ordre des acteurs change", () => {
    const tirage = generateur(GRAINE);
    const reponses = profilAleatoire(tirage, QUESTIONS_FACTICES);
    const reference = scoresPar(calculer({ ...BASE, reponses }));

    for (let essai = 0; essai < 50; essai += 1) {
      const permute = scoresPar(
        calculer({ ...BASE, acteurs: melanger(ACTEURS_FACTICES, tirage), reponses }),
      );
      expect(permute, "écart mécanique non expliqué : permutation des acteurs").toEqual(reference);
    }
    relever("permutation des acteurs ............... 50 permutations, scores identiques");
  });
});

describe("invariant : ordre du JSON", () => {
  it("les résultats ne changent pas quand l'ordre des tableaux change", () => {
    const tirage = generateur(GRAINE + 1);
    const reponses = profilAleatoire(tirage, QUESTIONS_FACTICES);
    const reference = JSON.stringify(calculer({ ...BASE, reponses }));

    for (let essai = 0; essai < 50; essai += 1) {
      const permute = JSON.stringify(
        calculer({
          questions: melanger(QUESTIONS_FACTICES, tirage),
          acteurs: melanger(ACTEURS_FACTICES, tirage),
          positions: melanger(POSITIONS_FACTICES, tirage),
          reponses,
        }),
      );
      expect(permute, "écart mécanique non expliqué : ordre du JSON").toBe(reference);
    }
    relever(
      "ordre du JSON ......................... 50 permutations, résultat identique au bit près",
    );
  });
});

describe("invariant : traitement des données manquantes", () => {
  it("retirer une position produit le même effet quel que soit l'acteur", () => {
    const questions = QUESTIONS_FACTICES;
    const reponses = profilAleatoire(generateur(GRAINE + 2), questions);
    const valeurs = questions.map((_, index) => ECHELLE[index % ECHELLE.length]!);

    // Deux acteurs rigoureusement identiques, distincts par leur seul identifiant.
    const jumeaux = [acteur("jumeau-a", "Jumeau A"), acteur("jumeau-b", "Jumeau B")];
    const positionsCompletes = jumeaux.flatMap((a) =>
      questions.map((question, index) => position(a.id, question.id, valeurs[index]!)),
    );

    for (const question of questions) {
      const sansA = calculer({
        questions,
        acteurs: jumeaux,
        positions: positionsCompletes.filter(
          (p) => !(p.actorId === "jumeau-a" && p.questionId === question.id),
        ),
        reponses,
      });
      const sansB = calculer({
        questions,
        acteurs: jumeaux,
        positions: positionsCompletes.filter(
          (p) => !(p.actorId === "jumeau-b" && p.questionId === question.id),
        ),
        reponses,
      });

      const scoreAmputeA = sansA.acteurs.find((r) => r.actorId === "jumeau-a")!.score;
      const scoreAmputeB = sansB.acteurs.find((r) => r.actorId === "jumeau-b")!.score;

      expect(
        scoreAmputeB,
        `écart mécanique non expliqué : données manquantes traitées différemment selon l'acteur, sur ${question.id}`,
      ).toBe(scoreAmputeA);
    }
    relever(
      `données manquantes .................... ${questions.length} retraits, effet identique quel que soit l'acteur`,
    );
  });
});

for (const { nom, questions: jeu } of JEUX_DE_QUESTIONS) {
  describe(`invariant : couverture comparable des thèmes (jeu ${nom})`, () => {
    it("aucun thème n'est marginalisé par le nombre de questions", () => {
      const parTheme = new Map<string, number>();
      for (const question of jeu) {
        parTheme.set(question.theme, (parTheme.get(question.theme) ?? 0) + 1);
      }

      const comptes = [...parTheme.values()];
      const rapport = Math.min(...comptes) / Math.max(...comptes);

      /*
       * Seuil de 0,25 : un thème peut légitimement compter moins de questions
       * qu'un autre, mais en dessous du quart il n'est plus interrogé, il est
       * évoqué. La normalisation par thème le ferait alors peser autant qu'un
       * thème quatre fois plus fourni, ce qui amplifierait une seule réponse.
       */
      expect(
        rapport,
        `écart mécanique non expliqué : couverture des thèmes déséquilibrée (${[...parTheme]
          .map(([t, n]) => `${t}=${n}`)
          .join(", ")})`,
      ).toBeGreaterThanOrEqual(0.25);

      relever(
        `couverture des thèmes (${nom}) ${[...parTheme].map(([t, n]) => `${t} ${n}`).join(", ")} — rapport ${rapport.toFixed(2)}`,
      );
    });
  });

  describe(`invariant : équilibre des directions par thème (jeu ${nom})`, () => {
    it("aucun thème ne pose toutes ses affirmations dans le même sens", () => {
      const parTheme = new Map<string, { plus: number; moins: number }>();
      for (const question of jeu) {
        const compte = parTheme.get(question.theme) ?? { plus: 0, moins: 0 };
        if (question.direction === 1) compte.plus += 1;
        else compte.moins += 1;
        parTheme.set(question.theme, compte);
      }

      for (const [theme, { plus, moins }] of parTheme) {
        const total = plus + moins;
        const desequilibre = Math.abs(plus - moins) / total;
        /*
         * Un questionnaire dont toutes les affirmations vont dans le même sens
         * produit un biais d'acquiescement : on répond « d'accord » par défaut.
         * On tolère un écart d'un tiers, pas davantage.
         */
        expect(
          desequilibre,
          `écart mécanique non expliqué : directions déséquilibrées dans « ${theme} » (${plus} pour, ${moins} contre)`,
        ).toBeLessThanOrEqual(1 / 3);
      }

      relever(
        `équilibre des directions (${nom}) ${[...parTheme]
          .map(([t, c]) => `${t} ${c.plus}/${c.moins}`)
          .join(", ")}`,
      );
    });
  });
}

describe("invariant : aucun avantage aux acteurs les mieux documentés", () => {
  it("la confiance dans les preuves n'a aucun effet sur le score", () => {
    const tirage = generateur(GRAINE + 3);
    const questions = QUESTIONS_FACTICES;
    let ecartMaximal = 0;

    for (let essai = 0; essai < PROFILS; essai += 1) {
      const valeurs = questions.map(() => ECHELLE[entier(tirage, ECHELLE.length)]!);
      const acteurs = [acteur("solide", "Solide"), acteur("fragile", "Fragile")];
      const positions = [
        ...questions.map((q, i) => position("solide", q.id, valeurs[i]!, "high")),
        ...questions.map((q, i) => position("fragile", q.id, valeurs[i]!, "low")),
      ];

      const classement = calculer({
        questions,
        acteurs,
        positions,
        reponses: profilAleatoire(tirage, questions),
      });
      const solide = classement.acteurs.find((r) => r.actorId === "solide")!.score;
      const fragile = classement.acteurs.find((r) => r.actorId === "fragile")!.score;
      ecartMaximal = Math.max(ecartMaximal, Math.abs(solide - fragile));
    }

    expect(
      ecartMaximal,
      "écart mécanique non expliqué : la qualité des preuves déplace le score",
    ).toBe(0);
    relever(`confiance et score .................... ${PROFILS} profils, écart maximal 0`);
  });

  it("une couverture partielle n'avantage ni ne désavantage en moyenne", () => {
    const tirage = generateur(GRAINE + 4);
    const questions = QUESTIONS_FACTICES;
    let sommeComplet = 0;
    let sommePartiel = 0;

    for (let essai = 0; essai < PROFILS; essai += 1) {
      const valeurs = questions.map(() => ECHELLE[entier(tirage, ECHELLE.length)]!);
      const acteurs = [acteur("complet", "Complet"), acteur("partiel", "Partiel")];

      /*
       * « partiel » porte EXACTEMENT les mêmes positions que « complet », mais
       * n'en documente qu'une sur deux. Si le moteur ne biaise pas, la moyenne
       * de ses scores sur un grand nombre de profils doit rejoindre celle de
       * « complet » : un sous-échantillon non choisi est sans biais.
       */
      const positions = [
        ...questions.map((q, i) => position("complet", q.id, valeurs[i]!)),
        ...questions.flatMap((q, i) =>
          i % 2 === 0 ? [position("partiel", q.id, valeurs[i]!)] : [],
        ),
      ];

      const classement = calculer({
        questions,
        acteurs,
        positions,
        reponses: profilAleatoire(tirage, questions),
      });
      sommeComplet += classement.acteurs.find((r) => r.actorId === "complet")!.score;
      sommePartiel += classement.acteurs.find((r) => r.actorId === "partiel")!.score;
    }

    const ecart = Math.abs(sommeComplet - sommePartiel) / PROFILS;
    expect(
      ecart,
      `écart mécanique non expliqué : la couverture déplace le score en moyenne (${ecart.toFixed(5)})`,
    ).toBeLessThanOrEqual(TOLERANCE_STATISTIQUE);

    relever(
      `couverture et score ................... ${PROFILS} profils, écart moyen ${ecart.toFixed(5)} (seuil ${TOLERANCE_STATISTIQUE})`,
    );
  });
});

describe("invariant : symétrie de l'échelle de réponse", () => {
  it("inverser le signe de toutes les positions et de toutes les réponses ne change rien", () => {
    const tirage = generateur(GRAINE + 5);
    const inverser = (valeur: StanceValue) => -valeur as StanceValue;

    for (let essai = 0; essai < 200; essai += 1) {
      const reponses = profilAleatoire(tirage, QUESTIONS_FACTICES);
      const droit = calculer({ ...BASE, reponses });
      const miroir = calculer({
        ...BASE,
        positions: POSITIONS_FACTICES.map((p) => ({ ...p, value: inverser(p.value) })),
        reponses: Object.fromEntries(
          Object.entries(reponses).map(([id, valeur]) => [id, inverser(valeur as StanceValue)]),
        ),
      });

      expect(
        scoresPar(miroir),
        "écart mécanique non expliqué : l'échelle de réponse n'est pas symétrique",
      ).toEqual(scoresPar(droit));
    }
    relever("symétrie de l'échelle ................. 200 profils, scores identiques au miroir");
  });
});

describe("invariant : stabilité", () => {
  it("deux exécutions sur les mêmes données donnent le même résultat", () => {
    const tirage = generateur(GRAINE + 6);
    for (let essai = 0; essai < 100; essai += 1) {
      const reponses = profilAleatoire(tirage, QUESTIONS_FACTICES);
      expect(
        JSON.stringify(calculer({ ...BASE, reponses })),
        "écart mécanique non expliqué : le résultat n'est pas stable",
      ).toBe(JSON.stringify(calculer({ ...BASE, reponses })));
    }
    relever("stabilité ............................. 100 profils, deux exécutions identiques");
  });
});
