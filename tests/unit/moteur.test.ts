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
import { calculer, type Classement } from "../../src/lib/moteur";
import { SANS_AVIS } from "../../src/lib/session-test";
import type { PoliticalActor, Stance, StanceValue } from "../../src/lib/modele";
import type { Question } from "../../src/lib/questions";
import { ACTEURS_FACTICES, POSITIONS_FACTICES } from "../../src/factice/acteurs-factices";
import { QUESTIONS_FACTICES } from "../../src/factice/questions-factices";

/**
 * Tous les acteurs, classés ou non.
 *
 * Pour les tests qui portent sur le CALCUL et pas sur l'ordre : ils doivent voir
 * un acteur même quand sa couverture le tient hors du classement.
 */
function tous(classement: Classement) {
  return [...classement.classes, ...classement.nonClasses];
}

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

/** Question d'essai dont l'`ordre` est dérivé de l'identifiant. */
function q2(id: string, theme: string): Question {
  return question(id, theme, Number(id.replace(/\D/g, "")) || 1);
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
    adequation: "directe",
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
    expect(classement.classes[0]!.couverture.applicables).toBe(1);
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
    expect(avecSansAvis.classes[0]!.score!).not.toBeCloseTo(avecNeutre.classes[0]!.score!, 6);
    expect(avecSansAvis.classes[0]!.score).toBe(1);
    expect(avecNeutre.classes[0]!.score).toBe(0.75);
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
  const solide = classement.classes.find((r) => r.actorId === "solide")!;
  const fragile = classement.classes.find((r) => r.actorId === "fragile")!;

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
    const partiel = classement.classes.find((r) => r.actorId === "partiel")!;
    // Compter q2 comme un désaccord total donnerait 0,5. L'écarter donne 1.
    expect(partiel.score).toBe(1);
    expect(partiel.couverture.documentees).toBe(1);
    expect(partiel.couverture.taux).toBe(0.5);
  });

  it("expose le maillon « position inconnue » dans le détail", () => {
    const partiel = classement.classes.find((r) => r.actorId === "partiel")!;
    const inconnue = partiel.parTheme[0]!.positions.find((p) => p.questionId === "q2")!;
    expect(inconnue.positionActeur).toBeNull();
    expect(inconnue.niveauLibelle).toBe("Position inconnue");
  });
});

/*
 * LE PLANCHER D'ÉLIGIBILITÉ.
 *
 * Le score ne dépend pas du volume, et les tests ci-dessus le vérifient. Mais un
 * classement n'est pas une moyenne, c'est un MAXIMUM : moins un acteur documente
 * de positions, plus son score est volatil, donc plus il occupe souvent le
 * premier rang. Aucun chiffre n'est faux et l'ordre est pourtant trompeur.
 *
 * La réponse n'est pas de pondérer — tirer un score mal documenté vers le centre
 * avantagerait les acteurs les mieux couverts, soit le biais inverse — mais de
 * refuser de ranger ce qu'on ne peut pas ranger. Ces tests fixent ce refus.
 */
describe("plancher d'éligibilité au classement", () => {
  const questions = [
    question("e1", "T", 1),
    question("e2", "T", 2),
    question("e3", "T", 3),
    question("e4", "T", 4),
  ];
  const acteurs = [acteur("fourni", "Fourni"), acteur("maigre", "Maigre"), acteur("vide", "Vide")];

  /*
   * « maigre » documente une seule affirmation, et elle tombe en accord parfait.
   * Sans plancher, il obtient 1 et passe devant « fourni », qui documente tout
   * avec un désaccord. C'est exactement le cas mesuré sur les données réelles.
   */
  const positions = [
    position("fourni", "e1", 2),
    position("fourni", "e2", 2),
    position("fourni", "e3", 2),
    position("fourni", "e4", -2),
    position("maigre", "e1", 2),
  ];
  const reponses = { e1: 2, e2: 2, e3: 2, e4: 2 } as const;

  it("écarte du classement l'acteur sous le seuil, sans le faire disparaître", () => {
    const classement = calculer({ questions, acteurs, positions, reponses, seuilClassement: 0.5 });

    expect(classement.classes.map((r) => r.actorId)).toEqual(["fourni"]);
    expect(classement.nonClasses.map((r) => r.actorId)).toEqual(["maigre", "vide"]);
  });

  it("l'écarté garde son score et sa couverture, mais n'a pas de rang", () => {
    const classement = calculer({ questions, acteurs, positions, reponses, seuilClassement: 0.5 });
    const maigre = classement.nonClasses.find((r) => r.actorId === "maigre")!;

    // Le score n'est ni effacé ni amorti : il n'est simplement pas classé.
    expect(maigre.score).toBe(1);
    expect(maigre.couverture.taux).toBe(0.25);
    expect(maigre.rang).toBeNull();
  });

  it("sans plancher, l'acteur à une seule position passe bien devant", () => {
    // La démonstration que le plancher sert à quelque chose : à seuil nul,
    // « maigre » prend le premier rang avec une affirmation sur quatre.
    const classement = calculer({ questions, acteurs, positions, reponses, seuilClassement: 0 });

    expect(classement.classes[0]!.actorId).toBe("maigre");
    expect(classement.classes[0]!.score).toBe(1);
  });

  it("n'attribue pas le score du désaccord total à un acteur inconnu", () => {
    const classement = calculer({ questions, acteurs, positions, reponses, seuilClassement: 0 });
    const vide = tous(classement).find((r) => r.actorId === "vide")!;

    /*
     * `null` et non `0`. Zéro est la note du désaccord total : la donner à un
     * acteur sur lequel on ne sait rien compterait l'ignorance comme une
     * opposition, et le plaçait jusqu'ici au dernier rang d'un classement
     * auquel il n'a rien à faire.
     */
    expect(vide.score).toBeNull();
    expect(vide.rang).toBeNull();
    expect(classement.classes.map((r) => r.actorId)).not.toContain("vide");
  });

  it("laisse les rangs continus sur les seuls classés", () => {
    const classement = calculer({ questions, acteurs, positions, reponses, seuilClassement: 0.2 });

    expect(classement.classes.map((r) => r.rang)).toEqual([1, 2]);
  });

  it("range les écartés par ordre alphabétique, jamais par score", () => {
    const zoulou = acteur("zoulou", "Zoulou");
    const classement = calculer({
      questions,
      acteurs: [...acteurs, zoulou],
      // « zoulou » documente une position en désaccord : par score il serait
      // dernier, par alphabet il est dernier aussi. On le teste par le nom.
      positions: [...positions, position("zoulou", "e1", -2)],
      reponses,
      seuilClassement: 0.5,
    });

    expect(classement.nonClasses.map((r) => r.sortName)).toEqual(["Maigre", "Vide", "Zoulou"]);
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
    expect(classement.classes[0]!.score).toBe(0.5);
  });

  it("écarte un thème entièrement non documenté au lieu de le compter zéro", () => {
    const classement = calculer({
      questions,
      acteurs,
      positions: [position("a", "g1", 2), position("a", "g2", 2), position("a", "g3", 2)],
      reponses: { g1: 2, g2: 2, g3: 2, p1: 2 },
    });

    expect(classement.classes[0]!.score).toBe(1);
    expect(classement.classes[0]!.parTheme.find((t) => t.theme === "Petit")!.score).toBeNull();
  });
});

describe("ex æquo", () => {
  const questions = [question("q1", "T", 1)];
  const acteurs = [acteur("zeta", "Zeta"), acteur("alpha", "Alpha")];
  const positions = [position("zeta", "q1", 1), position("alpha", "q1", 1)];
  const classer = (reponses: Record<string, StanceValue>) =>
    calculer({ questions, acteurs, positions, reponses });

  it("partagent le même rang", () => {
    const classement = classer({ q1: 1 });
    expect(classement.classes.map((r) => r.rang)).toEqual([1, 1]);
    expect(new Set(classement.classes.map((r) => r.rang)).size).toBe(1);
  });

  /*
   * L'ordre de présentation des ex æquo vient de la graine, tirée des réponses.
   * Il est donc stable pour un même électeur, et indifférent à l'ordre du
   * tableau d'entrée.
   */
  it("sont présentés dans un ordre stable, indépendant de l'ordre d'entrée", () => {
    const attendu = classer({ q1: 1 }).classes.map((r) => r.actorId);

    expect(classer({ q1: 1 }).classes.map((r) => r.actorId)).toEqual(attendu);
    expect(
      calculer({
        questions,
        acteurs: [...acteurs].reverse(),
        positions,
        reponses: { q1: 1 },
      }).classes.map((r) => r.actorId),
    ).toEqual(attendu);
  });

  /*
   * L'invariant qui justifie le changement : l'ordre ne suit PAS l'alphabet.
   * Un départage alphabétique placerait « alpha » en tête pour tout le monde et
   * à tous les scrutins. Sur les cinq réponses possibles, les deux ordres
   * apparaissent.
   */
  it("ne place pas systématiquement le même acteur en tête", () => {
    const tetes = new Set(
      ([-2, -1, 0, 1, 2] as StanceValue[]).map(
        (valeur) => classer({ q1: valeur }).classes[0]!.actorId,
      ),
    );

    expect(tetes.size).toBe(2);
  });

  it("publie la graine, identique pour des réponses identiques", () => {
    expect(classer({ q1: 1 }).graineAffichage).toBe(classer({ q1: 1 }).graineAffichage);
    expect(classer({ q1: 1 }).graineAffichage).not.toBe(classer({ q1: 2 }).graineAffichage);
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

    expect(miroir.classes.map((r) => r.score)).toEqual(droit.classes.map((r) => r.score));
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

    expect(resserre.classes.map((r) => r.score)).toEqual([1, 1, 0.96875]);
    expect(resserre.ecartsTenus).toBe(true);
  });
});

/*
 * DÉTERMINISME DE L'ORDRE À SCORE ÉGAL.
 *
 * L'invariant de stabilité de l'audit vérifie que deux exécutions rendent le
 * même résultat. Il ne dit rien du cas qui compte ici : DEUX ACTEURS EX ÆQUO.
 * Leur ordre relatif n'est pas une information sur leur proximité, mais il doit
 * être le même chez tout le monde — sinon une carte partageable ne prouve rien,
 * et deux personnes aux mêmes réponses se croient en désaccord.
 *
 * L'ordre vient de la graine, elle-même tirée des réponses. Pas d'aléa, pas
 * d'horloge, pas d'alphabet : l'alphabet placerait systématiquement le même
 * acteur au-dessus, pour tout le monde, à tous les scrutins.
 */
describe("l'ordre des ex æquo est déterminé par les réponses", () => {
  const questions = [
    question("d1", "Alpha", 1),
    question("d2", "Alpha", 2),
    question("d3", "Beta", 3),
    question("d4", "Beta", 4),
  ];

  /** Quatre acteurs strictement identiques : tout ex æquo, rien pour départager. */
  const acteurs = ["un", "deux", "trois", "quatre"].map((id) => acteur(id, `Acteur ${id}`));

  const positions = acteurs.flatMap((a) => questions.map((q) => position(a.id, q.id, 2)));

  const reponses = { d1: 2, d2: 1, d3: -1, d4: 2 } as const;

  it("rend exactement le même ordre à deux exécutions", () => {
    const premier = calculer({ questions, acteurs, positions, reponses });
    const second = calculer({ questions, acteurs, positions, reponses });

    expect(premier.classes.map((a) => a.actorId)).toEqual(second.classes.map((a) => a.actorId));
    expect(premier.graineAffichage).toBe(second.graineAffichage);
  });

  it("place bien tous les acteurs au même rang", () => {
    const classement = calculer({ questions, acteurs, positions, reponses });

    expect(new Set(classement.classes.map((a) => a.rang))).toEqual(new Set([1]));
  });

  /*
   * Le cœur du test : l'ordre ne doit dépendre QUE des réponses. Permuter le
   * tableau d'entrée ne doit rien changer ; changer une réponse doit pouvoir
   * changer l'ordre, sinon la graine ne sert à rien.
   */
  it("ne dépend pas de l'ordre du tableau d'acteurs", () => {
    const direct = calculer({ questions, acteurs, positions, reponses });
    const inverse = calculer({ questions, acteurs: [...acteurs].reverse(), positions, reponses });

    expect(inverse.classes.map((a) => a.actorId)).toEqual(direct.classes.map((a) => a.actorId));
  });

  it("n'est pas l'ordre alphabétique, qui avantagerait toujours les mêmes", () => {
    const classement = calculer({ questions, acteurs, positions, reponses });
    const alphabetique = [...acteurs].map((a) => a.id).sort();

    expect(classement.classes.map((a) => a.actorId)).not.toEqual(alphabetique);
  });

  it("change avec les réponses", () => {
    const a = calculer({ questions, acteurs, positions, reponses });
    const b = calculer({
      questions,
      acteurs,
      positions,
      reponses: { d1: -2, d2: -1, d3: 1, d4: -2 },
    });

    expect(b.graineAffichage).not.toBe(a.graineAffichage);
  });
});

/*
 * REJOUER UNE CARTE PARTAGÉE.
 *
 * La carte affichée sur `/resultat` porte trois choses : le vecteur de réponses
 * (chez celui qui l'a produite), l'état de la bascule d'héritage, et la graine
 * d'affichage. La promesse est qu'elles suffisent à refaire EXACTEMENT le même
 * écran — mêmes scores, même ordre, même ordre à score égal — sans serveur et
 * sans aléa stocké.
 *
 * Ce test rejoue une carte : il reconstruit un classement depuis ses seuls
 * paramètres et exige l'égalité stricte avec l'original. Sans lui, la carte
 * serait une capture d'écran qui ne prouve rien, et deux personnes aux mêmes
 * réponses pourraient se croire en désaccord sur un réglage que l'image ne
 * montre pas.
 */
describe("une carte partagée se rejoue à l'identique", () => {
  const questions = [q2("c1", "Alpha"), q2("c2", "Alpha"), q2("c3", "Beta"), q2("c4", "Beta")];

  const parti = acteur("parti-c", "Parti C");
  const candidats = ["ana", "bo", "cy", "dee", "eli"].map((id) => ({
    ...acteur(id, `Candidat ${id}`),
    kind: "candidate" as const,
  }));

  const candidatures = candidats.map((c) => ({
    actorId: c.id,
    status: "declared" as const,
    baselineActorIds: ["parti-c"],
    statutDepuis: "2026-09-01",
    statutSourceIds: ["source-essai"],
  }));

  /*
   * Le parti documente tout ; deux candidats seulement se sont exprimés, et
   * l'un contredit sa ligne. De quoi produire des ex æquo avec héritage et des
   * scores différents sans lui.
   */
  const positions = [
    ...questions.map((question) => position("parti-c", question.id, 2)),
    position("ana", "c1", -2),
    position("bo", "c1", 2),
  ];

  /** Le vecteur de réponses, tel qu'il serait relu depuis le stockage de session. */
  const reponses = { c1: 2, c2: 1, c3: -2, c4: 2 } as const;

  /** Ce que la carte imprime, et rien de plus. */
  type Carte = { graine: number; heritageInclus: boolean };

  function jouer(heritageInclus: boolean) {
    return calculer({
      questions,
      acteurs: candidats,
      annuaire: [parti, ...candidats],
      positions,
      candidatures: heritageInclus ? candidatures : [],
      reponses,
    });
  }

  for (const heritageInclus of [true, false]) {
    const etat = heritageInclus ? "héritage inclus" : "héritage exclu";

    it(`rend le même classement et le même ordre — ${etat}`, () => {
      const original = jouer(heritageInclus);
      const carte: Carte = {
        graine: original.graineAffichage,
        heritageInclus,
      };

      // Un tiers repart de la carte et de son propre vecteur de réponses.
      const rejoue = jouer(carte.heritageInclus);

      expect(rejoue.graineAffichage).toBe(carte.graine);
      expect(rejoue.classes.map((a) => a.actorId)).toEqual(original.classes.map((a) => a.actorId));
      expect(rejoue.classes.map((a) => a.score)).toEqual(original.classes.map((a) => a.score));
      expect(rejoue.classes.map((a) => a.rang)).toEqual(original.classes.map((a) => a.rang));
    });
  }

  /*
   * LE POINT QUI JUSTIFIE QUE LA CARTE PORTE LA BASCULE.
   *
   * La graine ne dépend que des réponses : elle est donc IDENTIQUE dans les
   * deux états. Si la carte ne portait qu'elle, deux personnes aux mêmes
   * réponses mais aux bascules différentes verraient deux écrans différents
   * assortis du même numéro, sans rien pour expliquer l'écart.
   */
  it("porte la même graine dans les deux états, et des couvertures différentes", () => {
    const avec = jouer(true);
    const sans = jouer(false);

    expect(sans.graineAffichage).toBe(avec.graineAffichage);

    /*
     * `tous` et non `classes` : sans héritage, trois des cinq candidats ne
     * documentent plus rien et quittent le classement. Comparer les seuls
     * classés comparerait deux listes de longueurs différentes, ce qui passerait
     * le test sans rien prouver sur les couvertures.
     */
    const couvertureAvec = tous(avec).map((a) => a.couverture.documentees);
    const couvertureSans = tous(sans).map((a) => a.couverture.documentees);
    expect(couvertureSans).not.toEqual(couvertureAvec);
  });

  /*
   * L'ordre des ex æquo doit tenir même quand le tableau d'entrée est permuté :
   * c'est ce qui garantit que deux installations, deux navigateurs ou deux
   * versions du JSON rendent le même écran.
   */
  it("tient quand l'ordre des acteurs et des positions change", () => {
    const original = jouer(true);
    const permute = calculer({
      questions: [...questions].reverse(),
      acteurs: [...candidats].reverse(),
      annuaire: [...candidats, parti],
      positions: [...positions].reverse(),
      candidatures: [...candidatures].reverse(),
      reponses,
    });

    expect(permute.classes.map((a) => a.actorId)).toEqual(original.classes.map((a) => a.actorId));
    expect(permute.classes.map((a) => a.score)).toEqual(original.classes.map((a) => a.score));
  });
});
