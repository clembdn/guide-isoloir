/**
 * Schémas de la couche acteurs.
 *
 * Ces tests ne vérifient pas que zod fonctionne : ils vérifient que les règles
 * de `CLAUDE.md` sont mécaniquement impossibles à enfreindre. « Ne jamais
 * inventer un candidat, une position ou une source » n'est une garantie que si le
 * build échoue quand on essaie.
 */
import { describe, expect, it } from "vitest";
import {
  positionsPubliables,
  validerActeurs,
  validerCandidatures,
  validerPositions,
  validerSourcesPositions,
} from "../../src/lib/acteurs";
import type { Question } from "../../src/lib/questions";

const QUESTION: Question = {
  id: "essai-question",
  theme: "Essai",
  texte: "Affirmation d'essai employée uniquement par les tests.",
  direction: 1,
  infobulle: "Terme d'essai employé uniquement dans les tests unitaires.",
  infobulleSourceId: "source-infobulle-essai",
  version: 1,
  ordre: 10,
};

const ACTEUR = {
  id: "parti-essai",
  kind: "party",
  name: "Parti d'essai",
  sortName: "Parti d'essai",
  slug: "parti-essai",
  status: "active",
};

const SOURCE = {
  id: "source-essai",
  titre: "Document d'essai",
  media: "Essai",
  url: "https://exemple.org/document",
  dateDeclaration: "2026-09-01",
  consulteLe: "2026-09-18",
};

const POSITION = {
  id: "parti-essai--essai-question",
  actorId: "parti-essai",
  questionId: "essai-question",
  value: 2,
  provenance: "party-platform",
  confidence: "high",
  sourceIds: ["source-essai"],
  citation: "Nous demandons l'abrogation de ce texte.",
  rationale: "Formulation reprise du programme adopté en congrès.",
  reviewStatus: "published",
  updatedAt: "2026-09-18",
};

const REFERENCE = { acteurs: [ACTEUR], questions: [QUESTION], sources: [SOURCE] };

describe("acteurs", () => {
  it("accepte un jeu bien formé", () => {
    expect(validerActeurs([ACTEUR])).toHaveLength(1);
  });

  it("refuse deux acteurs au même identifiant", () => {
    expect(() => validerActeurs([ACTEUR, ACTEUR])).toThrow(/Acteur en double/);
  });

  it("refuse deux acteurs au même slug, qui écraseraient une URL", () => {
    const jumeau = { ...ACTEUR, id: "autre-parti" };
    expect(() => validerActeurs([ACTEUR, jumeau])).toThrow(/partagent le slug/);
  });

  it("refuse un slug qui ne tiendrait pas dans une URL", () => {
    expect(() => validerActeurs([{ ...ACTEUR, slug: "Parti Essai" }])).toThrow();
  });
});

describe("candidatures", () => {
  const candidat = { ...ACTEUR, id: "candidate-essai", kind: "candidate", slug: "candidate-essai" };
  const candidature = {
    actorId: "candidate-essai",
    status: "declared",
    baselineActorIds: ["parti-essai"],
    statutDepuis: "2026-09-01",
    statutSourceIds: ["source-essai"],
  };

  it("accepte une candidature rattachée à un acteur de type candidate", () => {
    expect(validerCandidatures([candidature], [ACTEUR, candidat])).toHaveLength(1);
  });

  it("refuse une candidature sans source de statut", () => {
    expect(() =>
      validerCandidatures([{ ...candidature, statutSourceIds: [] }], [ACTEUR, candidat]),
    ).toThrow();
  });

  it("refuse une candidature portée par un parti", () => {
    expect(() =>
      validerCandidatures([{ ...candidature, actorId: "parti-essai" }], [ACTEUR, candidat]),
    ).toThrow(/type « party »/);
  });

  it("refuse une chaîne de reprise circulaire", () => {
    expect(() =>
      validerCandidatures(
        [{ ...candidature, baselineActorIds: ["candidate-essai"] }],
        [ACTEUR, candidat],
      ),
    ).toThrow(/circulaire/);
  });

  it("refuse la reprise d'un acteur inconnu", () => {
    expect(() =>
      validerCandidatures(
        [{ ...candidature, baselineActorIds: ["parti-fantome"] }],
        [ACTEUR, candidat],
      ),
    ).toThrow(/acteur inconnu/);
  });

  it("refuse deux candidatures pour le même acteur", () => {
    expect(() => validerCandidatures([candidature, candidature], [ACTEUR, candidat])).toThrow(
      /Deux candidatures/,
    );
  });
});

describe("sources de positions", () => {
  it("accepte une source datée et consultable", () => {
    expect(validerSourcesPositions([SOURCE])).toHaveLength(1);
  });

  it("refuse une URL qui n'est pas une URL", () => {
    expect(() => validerSourcesPositions([{ ...SOURCE, url: "service-public" }])).toThrow();
  });

  /*
   * L'inversion des deux dates est la faute d'Elyze : présenter en 2022 un
   * document de 2017 devient possible dès que la date de la déclaration cesse
   * d'être distinguée de la date de lecture.
   */
  it("refuse une consultation antérieure à la déclaration", () => {
    expect(() => validerSourcesPositions([{ ...SOURCE, consulteLe: "2026-01-01" }])).toThrow();
  });

  it("refuse deux sources au même identifiant", () => {
    expect(() => validerSourcesPositions([SOURCE, SOURCE])).toThrow(/en double/);
  });
});

describe("positions", () => {
  it("accepte une position sourcée et citée", () => {
    expect(validerPositions([POSITION], REFERENCE)).toHaveLength(1);
  });

  it("refuse une position sans source", () => {
    expect(() => validerPositions([{ ...POSITION, sourceIds: [] }], REFERENCE)).toThrow();
  });

  it("refuse une position qui cite une source inexistante", () => {
    expect(() =>
      validerPositions([{ ...POSITION, sourceIds: ["source-fantome"] }], REFERENCE),
    ).toThrow(/source inconnue/);
  });

  it("refuse une position rattachée à une question inexistante", () => {
    expect(() =>
      validerPositions([{ ...POSITION, questionId: "question-fantome" }], REFERENCE),
    ).toThrow(/question inconnue/);
  });

  it("refuse une position rattachée à un acteur inexistant", () => {
    expect(() => validerPositions([{ ...POSITION, actorId: "parti-fantome" }], REFERENCE)).toThrow(
      /acteur inconnu/,
    );
  });

  it("refuse une position sans verbatim quand ce n'est pas une inférence", () => {
    expect(() => validerPositions([{ ...POSITION, citation: "   " }], REFERENCE)).toThrow();
  });

  it("accepte une inférence sans verbatim, mais exige son raisonnement en entier", () => {
    const inference = {
      ...POSITION,
      provenance: "inference",
      citation: "",
      confidence: "low",
    };

    expect(() => validerPositions([{ ...inference, rationale: "Déduit." }], REFERENCE)).toThrow();
    expect(
      validerPositions(
        [
          {
            ...inference,
            rationale:
              "Aucune déclaration personnelle trouvée ; position déduite du vote du groupe " +
              "parlementaire sur le texte du 3 mars, cité en source.",
          },
        ],
        REFERENCE,
      ),
    ).toHaveLength(1);
  });

  it("refuse deux positions au même identifiant", () => {
    expect(() => validerPositions([POSITION, POSITION], REFERENCE)).toThrow(/Position en double/);
  });
});

describe("positions publiables", () => {
  it("écarte les codages qui ne sont pas réconciliés", () => {
    const codages = [
      { reviewStatus: "draft" },
      { reviewStatus: "double-coded" },
      { reviewStatus: "reconciled" },
      { reviewStatus: "published" },
    ];

    expect(positionsPubliables(codages)).toStrictEqual([
      { reviewStatus: "reconciled" },
      { reviewStatus: "published" },
    ]);
  });
});
