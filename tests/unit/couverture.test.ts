/**
 * Couverture publiée sur /methodologie et dans /donnees/couverture.json.
 *
 * Ces chiffres disent au lecteur à quel point le test est documenté. Ils ne
 * valent quelque chose qu'à quatre conditions, et chacune est un test ici :
 *
 *   1. ils ne dépendent pas du profil de réponses employé pour les calculer ;
 *   2. ils disent la même chose que les fiches candidat ;
 *   3. ils s'additionnent : les thèmes font le total ;
 *   4. un brouillon n'y compte jamais.
 */
import { describe, expect, it } from "vitest";
import {
  couverturePubliee,
  journalDesDonnees,
  mesurerCouverture,
  validerHistorique,
  type EntreesCouverture,
} from "../../src/lib/couverture";
import { DONNEES_OUVERTES, fiches } from "../../src/lib/fiches";
import { SEUIL_PUBLICATION } from "../../src/lib/seuils";
import type { Candidate, PoliticalActor, Stance, StanceValue } from "../../src/lib/modele";

const REELLES: EntreesCouverture = {
  questions: DONNEES_OUVERTES.questions,
  acteurs: DONNEES_OUVERTES.acteurs,
  candidatures: DONNEES_OUVERTES.candidatures,
  positions: DONNEES_OUVERTES.positions,
  etatsProgramme: DONNEES_OUVERTES.etatsProgramme,
  seuilClassement: SEUIL_PUBLICATION.couverture,
};

describe("couverture des données réelles", () => {
  it("ne dépend pas des réponses du profil employé pour la calculer", () => {
    const parDefaut = mesurerCouverture(REELLES);
    const profils: ((id: string, rang: number) => StanceValue)[] = [
      () => -2,
      () => 2,
      (_, rang) => (rang % 2 === 0 ? -2 : 2),
      (_, rang) => ((rang % 5) - 2) as StanceValue,
    ];
    for (const profil of profils) {
      expect(mesurerCouverture(REELLES, profil)).toStrictEqual(parDefaut);
    }
  });

  it("dit la même chose que les fiches candidat", () => {
    const parSlug = new Map(fiches().map((fiche) => [fiche.acteur.slug, fiche]));
    for (const candidat of couverturePubliee().parCandidat) {
      const fiche = parSlug.get(candidat.slug)!;
      expect(candidat.documentees, candidat.nom).toBe(fiche.documentees);
      expect(candidat.personnelles, candidat.nom).toBe(fiche.personnelles);
    }
  });

  it("additionne les thèmes pour faire le total", () => {
    const mesure = couverturePubliee();
    const somme = (cle: "couples" | "documentees" | "personnelles" | "solides") =>
      mesure.parTheme.reduce((total, theme) => total + theme[cle], 0);

    expect(somme("couples")).toBe(mesure.couples);
    expect(somme("documentees")).toBe(mesure.documentees);
    expect(somme("personnelles")).toBe(mesure.personnelles);
    expect(somme("solides")).toBe(mesure.solides);
  });

  it("range les candidats par ordre alphabétique, jamais par couverture", () => {
    const noms = couverturePubliee().parCandidat.map((c) => c.actorId);
    const attendus = DONNEES_OUVERTES.acteurs
      .filter((a) => noms.includes(a.id))
      .sort((a, b) =>
        new Intl.Collator("fr", { sensitivity: "base" }).compare(a.sortName, b.sortName),
      )
      .map((a) => a.id);
    expect(noms).toStrictEqual(attendus);
  });
});

describe("couverture d'un jeu factice", () => {
  const acteur = (id: string, kind: PoliticalActor["kind"]): PoliticalActor => ({
    id,
    kind,
    name: id,
    sortName: id,
    slug: id,
    status: "active",
  });
  const position = (id: string, questionId: string, reviewStatus: Stance["reviewStatus"]) =>
    ({
      id,
      actorId: "candidat-essai",
      questionId,
      value: 1,
      provenance: "direct-statement",
      confidence: "high",
      sourceIds: ["source-essai"],
      citation: "Verbatim d'essai.",
      adequation: "directe",
      rationale: "Essai uniquement.",
      reviewStatus,
      updatedAt: "2026-10-01",
    }) satisfies Stance;
  const candidature: Candidate = {
    actorId: "candidat-essai",
    status: "declared",
    baselineActorIds: [],
    statutDepuis: "2026-09-01",
    statutSourceIds: ["source-essai"],
  };
  const entrees = (positions: Stance[]): EntreesCouverture => ({
    questions: [
      { id: "q1", theme: "Un" },
      { id: "q2", theme: "Un" },
      { id: "q3", theme: "Deux" },
    ],
    acteurs: [acteur("candidat-essai", "candidate")],
    candidatures: [candidature],
    positions,
    etatsProgramme: [{ actorId: "candidat-essai", etat: "non-publie" }],
    seuilClassement: 0.5,
  });

  it("ne compte jamais un brouillon", () => {
    const publiee = position("p1", "q1", "reconciled");
    const avec = mesurerCouverture(entrees([publiee, position("p2", "q2", "draft")]));
    const sans = mesurerCouverture(entrees([publiee]));

    expect(avec).toStrictEqual(sans);
    expect(avec.documentees).toBe(1);
    expect(avec.positionsPubliees).toBe(1);
    expect(avec.classables).toBe(0);
  });

  it("sort un candidat retiré du compte", () => {
    const mesure = mesurerCouverture({
      ...entrees([]),
      candidatures: [{ ...candidature, status: "withdrawn" }],
    });
    expect(mesure.candidats).toBe(0);
    expect(mesure.couples).toBe(0);
  });
});

describe("historique de couverture", () => {
  const releve = (date: string) => ({
    date,
    candidats: 1,
    couples: 24,
    positionsPubliees: 1,
    documentees: 1,
    personnelles: 1,
    solides: 1,
    classables: 0,
    horsIncertitudeForte: 0,
  });

  it("accepte des dates croissantes", () => {
    expect(validerHistorique([releve("2026-10-01"), releve("2026-10-02")])).toHaveLength(2);
  });

  it("refuse une date en double ou hors d'ordre", () => {
    expect(() => validerHistorique([releve("2026-10-02"), releve("2026-10-02")])).toThrow();
    expect(() => validerHistorique([releve("2026-10-02"), releve("2026-10-01")])).toThrow();
  });

  it("refuse un champ inconnu", () => {
    expect(() => validerHistorique([{ ...releve("2026-10-01"), score: 3 }])).toThrow();
  });
});

describe("journal des données", () => {
  const acteurs = [
    { id: "b", name: "Bêta", sortName: "Bêta" },
    { id: "a", name: "Alpha", sortName: "Alpha" },
  ];

  it("va du plus récent au plus ancien, sans brouillon, acteurs par ordre alphabétique", () => {
    const journal = journalDesDonnees(
      {
        acteurs,
        positions: [
          { actorId: "b", updatedAt: "2026-09-20", reviewStatus: "reconciled" },
          { actorId: "a", updatedAt: "2026-09-20", reviewStatus: "reconciled" },
          { actorId: "a", updatedAt: "2026-09-25", reviewStatus: "reconciled" },
          { actorId: "b", updatedAt: "2026-09-30", reviewStatus: "draft" },
        ],
        propositions: [{ actorId: "b", updatedAt: "2026-09-25", reviewStatus: "reconciled" }],
      },
      10,
    );

    expect(journal).toStrictEqual([
      { date: "2026-09-25", positions: 1, propositions: 1, acteurs: ["Alpha", "Bêta"] },
      { date: "2026-09-20", positions: 2, propositions: 0, acteurs: ["Alpha", "Bêta"] },
    ]);
  });

  it("s'arrête au nombre de jours demandé", () => {
    const positions = ["2026-09-01", "2026-09-02", "2026-09-03"].map((updatedAt) => ({
      actorId: "a",
      updatedAt,
      reviewStatus: "reconciled" as const,
    }));
    expect(
      journalDesDonnees({ acteurs, positions, propositions: [] }, 2).map((j) => j.date),
    ).toStrictEqual(["2026-09-03", "2026-09-02"]);
  });
});
