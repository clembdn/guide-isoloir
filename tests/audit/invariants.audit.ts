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
import { calculer, type Classement } from "../../src/lib/moteur";
import type { PoliticalActor, Stance, StanceValue } from "../../src/lib/modele";
import type { Question } from "../../src/lib/questions";
import { QUESTIONS_FACTICES } from "../../src/factice/questions-factices";
import { QUESTIONS } from "../../src/data/questions";
import { SEUIL_PUBLICATION } from "../../src/lib/seuils";
import { ACTEURS_FACTICES, POSITIONS_FACTICES } from "../../src/factice/acteurs-factices";
import { entier, generateur, melanger } from "./aleatoire";

/** Graine écrite en clair : l'audit doit être rejouable à l'identique. */
const GRAINE = 20270418;

/** Nombre de profils d'électeurs tirés pour les invariants statistiques. */
const PROFILS = 2000;

/** Écart toléré sur une moyenne de 2000 tirages. Au-delà, il faut l'expliquer. */
const TOLERANCE_STATISTIQUE = 0.01;

/**
 * Rapport toléré entre les fréquences de premier rang de deux acteurs portant
 * les MÊMES positions, l'un documenté intégralement, l'autre au minimum
 * d'éligibilité.
 *
 * POURQUOI UN RAPPORT ET PAS UN ÉCART. Ce sont des fréquences : passer de 2 % à
 * 6 % est le même triplement que de 20 % à 60 %, et c'est le triplement qui
 * informe, pas les quatre points.
 *
 * POURQUOI PAS 1. Le plancher d'éligibilité ne supprime pas le différentiel de
 * variance, il le borne : à couverture minimale, un acteur reste plus dispersé
 * qu'un acteur complet, et sa fréquence de premier rang reste plus haute. Exiger
 * l'égalité stricte demanderait de pondérer les scores par la couverture, ce que
 * CLAUDE.md interdit — cela tirerait les positions mal documentées vers le
 * centre et avantagerait mécaniquement les acteurs les mieux couverts.
 *
 * La valeur est donc une borne publiée, relevée à chaque exécution, et non un
 * idéal. Au 21 septembre 2026, la mesure donne 2,55 pour un plancher à 0,35 ;
 * la borne est posée à 3 pour laisser respirer le bruit d'échantillonnage sans
 * laisser passer une dérive. Le relevé imprime le chiffre exact à chaque
 * exécution : c'est lui qui est publié, pas la borne. La resserrer est un
 * progrès, la desserrer demande une justification écrite dans la méthodologie.
 */
const TOLERANCE_RANG = 3;

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

/** Acteurs complets mis en concurrence avec l'acteur peu documenté. */
const PELOTON = 9;

/**
 * Fréquence du premier rang, pour un acteur peu documenté jeté dans un peloton
 * d'acteurs complets.
 *
 * POURQUOI UN PELOTON ET PAS UN DUEL. Un duel ne montre rien : avec deux
 * concurrents, l'un est toujours premier, et la mesure tourne autour de 50 %
 * quoi qu'il arrive. Le biais qu'on cherche ne vit pas au centre de la
 * distribution mais dans sa QUEUE — arriver premier parmi dix demande un score
 * aberrant, et seul un acteur à forte variance en produit souvent. C'est
 * exactement la situation de `/resultat`, où une vingtaine de candidats sont
 * comparés d'un coup.
 *
 * Chaque acteur tire ses propres positions, indépendamment des autres : des
 * acteurs aux positions identiques seraient ex æquo en permanence et la mesure
 * ne dirait plus rien. « partiel » documente le même codage qu'un complet, sur
 * un sous-ensemble fixe dimensionné sur `SEUIL_PUBLICATION.couverture` : exactement le
 * minimum qui franchit le plancher d'éligibilité. C'est le pire cas ADMIS, donc
 * celui qu'il faut borner — mesurer un cas plus favorable ne dirait rien de ce
 * que le classement peut réellement afficher.
 *
 * Le sous-ensemble n'est pas tiré au sort : il est fixé une fois pour toutes,
 * sinon sa propre variance s'ajouterait à celle qu'on mesure.
 *
 * Les ex æquo comptent pour tous les acteurs concernés. Les départager ferait
 * dépendre le résultat de la graine d'affichage, qui n'a rien à voir avec la
 * couverture.
 */
function frequencesDePremierRang(
  tirage: () => number,
  {
    seuilClassement,
    documenteesPartiel,
  }: { seuilClassement?: number; documenteesPartiel?: number } = {},
) {
  const questions = [...QUESTIONS].sort((a, b) => a.id.localeCompare(b.id));

  /*
   * Le sous-ensemble est dimensionné SUR LA CONSTANTE, pas sur un chiffre écrit
   * à la main : déplacer le plancher doit déplacer la mesure, sinon l'audit
   * continuerait de mesurer un réglage qui n'existe plus. Il est étalé en
   * tourniquet sur les thèmes, parce qu'un acteur documenté sur un seul thème
   * n'est pas le cas qu'on veut borner — c'est un autre défaut, et l'invariant
   * de couverture des thèmes s'en occupe.
   */
  const combien = documenteesPartiel ?? Math.ceil(SEUIL_PUBLICATION.couverture * questions.length);
  const parTheme = new Map<string, Question[]>();
  for (const question of questions) {
    parTheme.set(question.theme, [...(parTheme.get(question.theme) ?? []), question]);
  }
  const rangees = [...parTheme.values()];
  const retenues: Question[] = [];
  for (let colonne = 0; retenues.length < combien; colonne += 1) {
    for (const rangee of rangees) {
      const question = rangee[colonne];
      if (question !== undefined && retenues.length < combien) retenues.push(question);
    }
  }
  const idsPartiel = new Set(retenues.map((question) => question.id));

  const complets = Array.from({ length: PELOTON }, (_, i) => `complet-${i}`);
  const acteurs = [...complets.map((id) => acteur(id, id)), acteur("partiel", "Partiel")];

  let premierComplet = 0;
  let premierPartiel = 0;

  for (let essai = 0; essai < PROFILS; essai += 1) {
    const positions: Stance[] = [];

    for (const id of complets) {
      for (const question of questions) {
        positions.push(position(id, question.id, ECHELLE[entier(tirage, ECHELLE.length)]!));
      }
    }
    for (const question of questions) {
      const valeur = ECHELLE[entier(tirage, ECHELLE.length)]!;
      if (idsPartiel.has(question.id)) positions.push(position("partiel", question.id, valeur));
    }

    const classement = calculer({
      questions,
      acteurs,
      positions,
      reponses: profilAleatoire(tirage, questions),
      ...(seuilClassement === undefined ? {} : { seuilClassement }),
    });

    for (const resultat of classement.classes) {
      if (resultat.rang !== 1) continue;
      if (resultat.actorId === "partiel") premierPartiel += 1;
      else premierComplet += 1;
    }
  }

  return {
    /* Moyenne par acteur complet : c'est à UN complet que « partiel » se compare. */
    rang1Complet: premierComplet / PROFILS / PELOTON,
    rang1Partiel: premierPartiel / PROFILS,
  };
}

const BASE = {
  questions: QUESTIONS_FACTICES,
  acteurs: ACTEURS_FACTICES,
  positions: POSITIONS_FACTICES,
};

/**
 * Tous les acteurs, classés ou non.
 *
 * Les invariants ci-dessous portent sur le CALCUL — permutation, ordre du JSON,
 * données manquantes, symétrie — et pas sur l'ordre d'affichage. Ils doivent
 * donc voir aussi les acteurs que leur couverture tient hors du classement,
 * sinon un acteur pourrait sortir de la liste et l'invariant passerait au vert
 * parce qu'il ne le regarde plus.
 */
function tous(classement: Classement) {
  return [...classement.classes, ...classement.nonClasses];
}

const scoresPar = (classement: Classement) =>
  Object.fromEntries(tous(classement).map((resultat) => [resultat.actorId, resultat.score]));

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

      const scoreAmputeA = tous(sansA).find((r) => r.actorId === "jumeau-a")!.score;
      const scoreAmputeB = tous(sansB).find((r) => r.actorId === "jumeau-b")!.score;

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
      const solide = tous(classement).find((r) => r.actorId === "solide")!.score!;
      const fragile = tous(classement).find((r) => r.actorId === "fragile")!.score!;
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
      sommeComplet += tous(classement).find((r) => r.actorId === "complet")!.score!;
      sommePartiel += tous(classement).find((r) => r.actorId === "partiel")!.score!;
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

  /*
   * CE QUE LA MOYENNE NE VOIT PAS.
   *
   * Le test ci-dessus est juste et insuffisant. Il compare des ESPÉRANCES, et
   * l'espérance est effectivement neutre : un sous-échantillon non choisi ne
   * déplace pas la moyenne. Mais un classement n'est pas une moyenne, c'est un
   * MAXIMUM, et le maximum est sensible à la VARIANCE. Moins un acteur documente
   * de positions, plus son score est dispersé, donc plus il occupe souvent le
   * premier rang — sans qu'aucun chiffre soit faux.
   *
   * Mesuré sur les données de septembre 2026, avant correction : un candidat
   * documenté sur une affirmation sur vingt-quatre arrivait premier dans 30,7 %
   * des profils, contre 1,1 % pour un candidat documenté sur dix-huit. Les deux
   * moyennes étaient à cinq centièmes l'une de l'autre, et l'audit était vert.
   *
   * L'invariant porte donc sur la fréquence du premier rang, pas sur la moyenne
   * des scores, et il se lit avec le plancher d'éligibilité : celui-ci ne
   * supprime pas le différentiel de variance, il le borne, et c'est cette borne
   * que le chiffre ci-dessous publie.
   */
  it("une couverture partielle n'avantage pas non plus la fréquence du premier rang", () => {
    const tirage = generateur(GRAINE + 6);
    const { rang1Complet, rang1Partiel } = frequencesDePremierRang(tirage);

    const rapport = Math.max(rang1Complet, rang1Partiel) / Math.min(rang1Complet, rang1Partiel);

    expect(
      rapport,
      `écart mécanique non expliqué : la couverture déplace la fréquence du premier rang ` +
        `(complet ${(rang1Complet * 100).toFixed(1)} %, partiel ${(rang1Partiel * 100).toFixed(1)} %, rapport ${rapport.toFixed(2)})`,
    ).toBeLessThanOrEqual(TOLERANCE_RANG);

    relever(
      `couverture et premier rang ............ ${PROFILS} profils, complet ${(rang1Complet * 100).toFixed(1)} %, partiel ${(rang1Partiel * 100).toFixed(1)} %, rapport ${rapport.toFixed(2)} (seuil ${TOLERANCE_RANG})`,
    );
  });

  /*
   * L'INVARIANT CI-DESSUS N'EST PAS DÉCORATIF, ET CE TEST LE PROUVE.
   *
   * Un invariant qu'on n'a jamais vu rouge ne garantit rien : il peut passer
   * parce que la propriété tient, ou parce que le protocole ne la teste pas.
   * Celui-ci rejoue donc la même mesure avec le plancher désarmé et un acteur
   * documenté sur une seule affirmation, et exige que le rapport EXPLOSE. Si ce
   * test venait à passer au vert, c'est le protocole de mesure qui serait cassé,
   * pas le moteur qui serait devenu neutre.
   */
  it("et sans le plancher, ce même rapport part très au-delà de la tolérance", () => {
    const tirage = generateur(GRAINE + 7);
    const { rang1Complet, rang1Partiel } = frequencesDePremierRang(tirage, {
      seuilClassement: 0,
      documenteesPartiel: 1,
    });

    const rapport = Math.max(rang1Complet, rang1Partiel) / Math.min(rang1Complet, rang1Partiel);

    expect(
      rapport,
      "le protocole de mesure ne détecte plus l'avantage qu'il existe pour détecter",
    ).toBeGreaterThan(TOLERANCE_RANG);

    relever(
      `témoin sans plancher .................. ${PROFILS} profils, complet ${(rang1Complet * 100).toFixed(1)} %, partiel ${(rang1Partiel * 100).toFixed(1)} %, rapport ${rapport.toFixed(2)}`,
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
