/**
 * Contrôles sur les PROPOSITIONS de programme et les ÉTATS DE PROGRAMME réels,
 * et sur la règle qui choisit l'aperçu de la liste des candidats.
 *
 * Les propositions n'entrent dans aucun calcul : ce fichier ne vérifie donc
 * aucun score. Il vérifie ce qui, dans ce registre, peut tromper un lecteur —
 * une proposition sans verbatim, un texte de 2022 présenté comme un programme
 * 2027, un candidat dont la fiche serait muette sur son programme, un aperçu
 * dont le contenu dépendrait de l'ordre du fichier.
 */
import { describe, expect, it } from "vitest";
import {
  positionsPubliables,
  validerActeurs,
  validerEtatsProgramme,
  validerPropositions,
  validerSourcesPositions,
} from "../../src/lib/acteurs";
import { ACTEURS, CANDIDATURES } from "../../src/data/acteurs";
import { SOURCES_POSITIONS } from "../../src/data/sources-positions";
import { DONNEES_FACTICES, ETATS_PROGRAMME, PROPOSITIONS } from "../../src/data/programmes";
import { SOURCE_ANTERIEURE_A_LA_CAMPAGNE_AVANT } from "../../src/lib/seuils";
import {
  fiches,
  ordrePropositions,
  DONNEES_OUVERTES,
  type PropositionFiche,
} from "../../src/lib/fiches";

const acteurs = validerActeurs(ACTEURS);
const sources = validerSourcesPositions(SOURCES_POSITIONS);
const reference = { acteurs, sources, seuilCampagne: SOURCE_ANTERIEURE_A_LA_CAMPAGNE_AVANT };

describe("propositions réelles", () => {
  it("sont reconnues comme des données réelles", () => {
    expect(DONNEES_FACTICES).toBe(false);
  });

  it("passent le schéma et la validation référentielle", () => {
    expect(validerPropositions(PROPOSITIONS, reference).length).toBe(PROPOSITIONS.length);
  });

  it("portent toutes un verbatim non vide", () => {
    for (const proposition of PROPOSITIONS) {
      expect(proposition.citation.trim().length, proposition.id).toBeGreaterThanOrEqual(10);
    }
  });

  /*
   * Une proposition est rattachée à un candidat, ou à un acteur de la chaîne de
   * reprise d'un candidat. Rattachée à un parti que personne ne reprend, elle
   * ne s'afficherait nulle part : c'est une donnée morte, donc une erreur.
   */
  it("s'affichent chacune sur au moins une fiche", () => {
    const visibles = new Set(
      CANDIDATURES.flatMap((c) => [c.actorId, ...c.baselineActorIds] as string[]),
    );
    for (const proposition of PROPOSITIONS) {
      expect(visibles.has(proposition.actorId), proposition.id).toBe(true);
    }
  });
});

describe("règles de date des propositions", () => {
  const base = {
    id: "essai",
    actorId: acteurs[0]!.id,
    domaine: "fiscalite",
    portee: "mesure",
    intitule: "Une mesure d'essai",
    citation: "Une citation d'essai assez longue",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  } as const;
  const sourcesEssai = [
    { id: "avant", dateDeclaration: "2022-03-01" },
    { id: "pendant", dateDeclaration: "2026-06-01" },
  ];
  const ref = {
    acteurs,
    sources: sourcesEssai,
    seuilCampagne: SOURCE_ANTERIEURE_A_LA_CAMPAGNE_AVANT,
  };

  it("refusent un « programme 2027 » appuyé sur un document d'avant la campagne", () => {
    expect(() =>
      validerPropositions([{ ...base, nature: "programme-2027", sourceIds: ["avant"] }], ref),
    ).toThrow(/programme 2027/);
  });

  it("refusent un « programme antérieur » appuyé sur un document de la campagne", () => {
    expect(() =>
      validerPropositions(
        [{ ...base, nature: "programme-anterieur", sourceIds: ["pendant"] }],
        ref,
      ),
    ).toThrow(/programme antérieur/);
  });

  it("refusent une proposition sans verbatim", () => {
    expect(() =>
      validerPropositions(
        [{ ...base, citation: "   ", nature: "declaration-personnelle", sourceIds: ["pendant"] }],
        ref,
      ),
    ).toThrow();
  });
});

describe("états de programme", () => {
  it("existent pour chaque candidat, une fois exactement", () => {
    expect(
      validerEtatsProgramme(ETATS_PROGRAMME, { candidatures: CANDIDATURES, sources }).length,
    ).toBe(CANDIDATURES.length);
  });

  it("refusent un candidat oublié", () => {
    expect(() =>
      validerEtatsProgramme(ETATS_PROGRAMME.slice(1), { candidatures: CANDIDATURES, sources }),
    ).toThrow(/Aucun état de programme/);
  });
});

describe("aperçu de la liste des candidats", () => {
  const toutes = fiches();

  it("ne retient jamais plus de trois propositions", () => {
    for (const fiche of toutes) expect(fiche.apercu.length, fiche.acteur.id).toBeLessThanOrEqual(3);
  });

  /*
   * La règle est mécanique : mesure avant orientation, nature, date, identifiant.
   * Mélanger l'ordre d'entrée ne doit rien changer, sans quoi l'aperçu
   * dépendrait de la place d'une ligne dans un fichier.
   */
  it("ne dépend pas de l'ordre des données", () => {
    for (const fiche of toutes) {
      const propositions: PropositionFiche[] = [
        ...fiche.mesures.flatMap((groupe) => groupe.propositions),
        ...fiche.orientations,
      ];
      const attendu = [...propositions]
        .sort(ordrePropositions)
        .slice(0, 3)
        .map((p) => p.id);
      const melange = [...propositions]
        .reverse()
        .sort(ordrePropositions)
        .slice(0, 3)
        .map((p) => p.id);
      expect(melange, fiche.acteur.id).toEqual(attendu);
      expect(
        fiche.apercu.map((p) => p.id),
        fiche.acteur.id,
      ).toEqual(attendu);
    }
  });

  it("nomme le parti quand une proposition n'est pas celle du candidat", () => {
    for (const fiche of toutes) {
      for (const proposition of fiche.apercu) {
        if (proposition.actorId !== fiche.acteur.id) {
          expect(proposition.auteur, proposition.id).not.toBeNull();
        }
      }
    }
  });
});

describe("export ouvert", () => {
  it("n'exporte aucune proposition en brouillon", () => {
    expect(DONNEES_OUVERTES.propositions).toEqual(positionsPubliables(PROPOSITIONS));
  });
});
