/**
 * Double codage : le taux d'accord publié sur /methodologie.
 *
 * C'est un chiffre de crédibilité, et un chiffre de crédibilité faux est pire
 * que pas de chiffre. Chaque règle de calcul est donc fixée ici sur des cas
 * faits à la main : ce qui compte comme accord, sur quel dénominateur, ce
 * qu'est un désaccord résolu.
 */
import { describe, expect, it } from "vitest";
import {
  COLONNES,
  confronter,
  lireCodage,
  lireCsv,
  lireReconciliation,
  lireValeur,
  NON_COUVERT,
  preparerFeuille,
} from "../../scripts/double-codage.mjs";
import { versCsv } from "../../src/lib/csv";
import { validerCampagnes } from "../../src/lib/couverture";

describe("lecture des fichiers des codeurs", () => {
  it("relit ce que versCsv écrit, guillemets, virgules et retours à la ligne compris", () => {
    const citation = '« une retraite à 60 ans », dit-il "clairement"\net ensuite';
    const lignes = lireCsv(versCsv(["acteur_id", "citation"], [["a", citation]]));
    expect(lignes).toStrictEqual([{ acteur_id: "a", citation }]);
  });

  it("accepte le point-virgule d'un tableur réglé en français, et un BOM", () => {
    expect(lireCsv("\uFEFFacteur_id;valeur\r\na;-1\r\nb;non-couvert\r\n")).toStrictEqual([
      { acteur_id: "a", valeur: "-1" },
      { acteur_id: "b", valeur: "non-couvert" },
    ]);
  });

  it("normalise les valeurs et refuse le reste", () => {
    expect(lireValeur("+2")).toBe(2);
    expect(lireValeur("−1")).toBe(-1);
    expect(lireValeur("NC")).toBe(NON_COUVERT);
    expect(() => lireValeur("3")).toThrow();
    expect(() => lireValeur("plutôt pour")).toThrow();
  });

  it("refuse un couple non codé ou en double", () => {
    const ligne = { acteur_id: "a", question_id: "q1", theme: "T", valeur: "" };
    expect(() => lireCodage([ligne], "b.csv")).toThrow(/n'est pas codé/);
    const code = { ...ligne, valeur: "1" };
    expect(() => lireCodage([code, code], "b.csv")).toThrow(/deux fois/);
  });
});

describe("confrontation", () => {
  const codage = (valeurs: Record<string, string>) =>
    lireCodage(
      Object.entries(valeurs).map(([cle, valeur]) => {
        const [acteur, question, theme] = cle.split(":");
        return { acteur_id: acteur!, question_id: question!, theme: theme!, valeur };
      }),
      "essai",
    );

  const a = codage({
    "x:q1:T1": "2",
    "x:q2:T1": "1",
    "x:q3:T2": "non-couvert",
    "y:q1:T1": "-1",
    "y:q2:T1": "non-couvert",
  });
  const b = codage({
    "x:q1:T1": "2",
    "x:q2:T1": "-1",
    "x:q3:T2": "non-couvert",
    "y:q1:T1": "-2",
    "y:q2:T1": "0",
  });

  it("compte l'accord exact sur tous les couples, non-couvert compris", () => {
    const r = confronter(a, b);
    expect(r.couples).toBe(5);
    expect(r.accordExact).toBeCloseTo(2 / 5);
    expect(r.acteurs).toBe(2);
  });

  it("compte l'accord à un niveau près sur les seuls couples chiffrés par les deux", () => {
    const r = confronter(a, b);
    expect(r.couplesNumeriques).toBe(3);
    // 2/2 : accord ; 1/−1 : deux niveaux ; −1/−2 : un niveau.
    expect(r.accordUnNiveau).toBeCloseTo(2 / 3);
  });

  it("ne résout un désaccord que par une décision écrite", () => {
    const sans = confronter(a, b);
    expect(sans.desaccords).toBe(3);
    expect(sans.desaccordsNonResolus).toBe(3);

    const reconciliation = lireReconciliation([
      {
        acteur_id: "x",
        question_id: "q2",
        decision: "1",
        justification: "Le programme dit 60 ans sans condition.",
      },
      { acteur_id: "y", question_id: "q1", decision: "non-resolu", justification: "" },
    ]);
    const avec = confronter(a, b, reconciliation);
    expect(avec.desaccordsNonResolus).toBe(2);
    expect(avec.liste.find((d) => d.question === "q2" && d.acteur === "x")?.decision).toBe(1);
  });

  it("calcule la couverture par thème après réconciliation", () => {
    const reconciliation = lireReconciliation([
      { acteur_id: "y", question_id: "q2", decision: "non-couvert", justification: "Muet." },
    ]);
    expect(confronter(a, b, reconciliation).couvertureParTheme).toStrictEqual([
      // T1 : x×q1 accord (2), x×q2 non résolu, y×q1 non résolu, y×q2 décidé non couvert.
      { theme: "T1", couples: 4, documentes: 1 },
      { theme: "T2", couples: 1, documentes: 0 },
    ]);
  });

  it("refuse deux relevés qui ne portent pas sur les mêmes couples", () => {
    const court = codage({ "x:q1:T1": "2" });
    expect(() => confronter(a, court)).toThrow(/mêmes couples/);
  });
});

describe("feuille vierge", () => {
  const donnees = {
    chaineDeResolution: [
      { rang: 1, cle: "official-program" },
      { rang: 7, cle: "party-platform" },
    ],
    acteurs: [
      { id: "candidat-a", name: "Candidat A" },
      { id: "parti-b", name: "Parti B" },
      { id: "candidat-c", name: "Candidat C" },
    ],
    questions: [
      { id: "q1", theme: "T", texte: "Affirmation un." },
      { id: "q2", theme: "T", texte: "Affirmation deux." },
    ],
    sourcesPositions: [
      { id: "s1", titre: "Programme", dateDeclaration: "2026-09-01", url: "https://a.fr/p" },
    ],
    positions: [
      {
        actorId: "candidat-a",
        questionId: "q1",
        value: 2,
        provenance: "official-program",
        adequation: "directe",
        citation: "Oui.",
        sourceIds: ["s1"],
        updatedAt: "2026-09-20",
      },
      {
        actorId: "parti-b",
        questionId: "q2",
        value: -1,
        provenance: "party-platform",
        adequation: "partielle",
        citation: "Plutôt non.",
        sourceIds: ["s1"],
        updatedAt: "2026-09-20",
      },
    ],
  };

  it("ne retient que les acteurs qui ont une position propre, et toutes les affirmations", () => {
    const { acteurs, vierge } = preparerFeuille(donnees);
    expect(acteurs).toStrictEqual(["candidat-a", "parti-b"]);
    expect(vierge).toHaveLength(4);
    expect(vierge.every((ligne) => ligne.length === COLONNES.length)).toBe(true);
  });

  it("laisse vides les colonnes à remplir : la feuille ne souffle rien", () => {
    const { vierge } = preparerFeuille(donnees);
    for (const ligne of vierge) expect(ligne.slice(6)).toStrictEqual(["", "", "", ""]);
  });

  it("tire du codage publié un relevé A complet, non-couvert compris", () => {
    const { codeurA } = preparerFeuille(donnees);
    expect(codeurA.map((l) => l[6])).toStrictEqual(["2", NON_COUVERT, NON_COUVERT, "-1"]);
  });

  it("refait le même échantillon avec la même graine", () => {
    const options = { echantillon: 1, graine: 7 };
    expect(preparerFeuille(donnees, options).acteurs).toStrictEqual(
      preparerFeuille(donnees, options).acteurs,
    );
    expect(preparerFeuille(donnees, options).acteurs).toHaveLength(1);
  });
});

describe("campagnes publiées", () => {
  const campagne = {
    campagne: "2026-11-02",
    date: "2026-11-20",
    codeurs: "Relevé A : codage publié. Relevé B : relectrice indépendante.",
    acteurs: 2,
    couples: 48,
    accordExact: 0.75,
    couplesNumeriques: 20,
    accordUnNiveau: 0.9,
    desaccords: 12,
    desaccordsNonResolus: 2,
    couvertureParTheme: [{ theme: "Travail et retraites", couples: 48, documentes: 22 }],
    empreintes: { a: "a".repeat(64), b: "b".repeat(64) },
    commit: "e882896",
    rapport: "data/double-codage/2026-11-02/rapport.md",
  };

  it("accepte une campagne bien formée", () => {
    expect(validerCampagnes([campagne])).toHaveLength(1);
  });

  it("refuse plus de désaccords non résolus que de désaccords, ou un taux hors de [0, 1]", () => {
    expect(() => validerCampagnes([{ ...campagne, desaccordsNonResolus: 13 }])).toThrow();
    expect(() => validerCampagnes([{ ...campagne, accordExact: 1.2 }])).toThrow();
  });

  it("refuse des campagnes hors de l'ordre chronologique", () => {
    expect(() => validerCampagnes([campagne, { ...campagne, date: "2026-11-01" }])).toThrow(
      /précède/,
    );
  });
});
