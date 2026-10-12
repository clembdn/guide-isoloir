/**
 * Qui est en lice, et qui le test classe.
 *
 * Le moteur ne lit pas les statuts de candidature : le tri se fait avant lui,
 * dans `candidatsClasses`. Sans ce tri, un candidat battu à une primaire, qui
 * porte encore les positions héritées de sa coalition, pouvait arriver en tête
 * d'un résultat alors qu'il n'est plus candidat.
 */
import { describe, expect, it } from "vitest";
import { candidatsClasses, estEnLice, STATUTS_CLOS } from "../../src/lib/fiches";
import { ETAPES_CANDIDATURE, LIBELLES_STATUT_CANDIDATURE } from "../../src/lib/libelles";
import { ACTEURS, CANDIDATURES } from "../../src/data/acteurs";
import type { CandidateStatus } from "../../src/lib/modele";

const TOUS_LES_STATUTS = Object.keys(LIBELLES_STATUT_CANDIDATURE) as CandidateStatus[];

describe("candidature en lice", () => {
  it("se ferme sur un retrait, une élimination ou une primaire perdue, et sur rien d'autre", () => {
    const clos = TOUS_LES_STATUTS.filter((status) => !estEnLice({ status }));
    expect(new Set(clos)).toEqual(new Set(["withdrawn", "eliminated", "primary-defeated"]));
  });

  it("n'affiche aucun cran pour une candidature close", () => {
    for (const status of STATUTS_CLOS) {
      expect(ETAPES_CANDIDATURE[status].rang, status).toBeNull();
    }
  });
});

describe("candidats classés par le test", () => {
  const acteurs = [
    { id: "parti-a", kind: "party" },
    { id: "en-lice", kind: "candidate" },
    { id: "battu", kind: "candidate" },
    { id: "retire", kind: "candidate" },
    { id: "elimine", kind: "candidate" },
  ] as const;
  const candidatures = [
    { actorId: "en-lice", status: "declared" },
    { actorId: "battu", status: "primary-defeated" },
    { actorId: "retire", status: "withdrawn" },
    { actorId: "elimine", status: "eliminated" },
  ] as const;

  it("ne gardent que les candidats en lice, jamais un parti", () => {
    expect(candidatsClasses(acteurs, candidatures).map((a) => a.id)).toEqual(["en-lice"]);
  });

  it("n'incluent aucun candidat dont la candidature est close, sur les données réelles", () => {
    const classes = new Set(candidatsClasses(ACTEURS, CANDIDATURES).map((a) => a.id));
    for (const candidature of CANDIDATURES) {
      expect(classes.has(candidature.actorId), candidature.actorId).toBe(estEnLice(candidature));
    }
  });
});
