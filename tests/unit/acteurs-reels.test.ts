/**
 * Contrôles sur les ACTEURS, CANDIDATURES, SOURCES et POSITIONS réels.
 *
 * Les pages `.astro` valident déjà ces données au build. Les revalider ici sert
 * à autre chose : `npm run ci` échoue alors sans qu'il faille construire le site,
 * et la faute est nommée. Une position rattachée à une source inexistante est une
 * position inventée, et c'est la seule chose que ce fichier cherche vraiment.
 */
import { describe, expect, it } from "vitest";
import {
  positionsPubliables,
  validerActeurs,
  validerCandidatures,
  validerPositions,
  validerSourcesPositions,
} from "../../src/lib/acteurs";
import { validerQuestions } from "../../src/lib/questions";
import { ACTEURS, CANDIDATURES, DONNEES_FACTICES } from "../../src/data/acteurs";
import { POSITIONS } from "../../src/data/positions";
import { SOURCES_POSITIONS } from "../../src/data/sources-positions";
import { QUESTIONS } from "../../src/data/questions";
import type { Stance } from "../../src/lib/modele";

/*
 * `POSITIONS` est figé par `as const` : chaque entrée a son type littéral, et une
 * entrée sans `sourcePrimaire` n'expose pas la propriété. On élargit une fois au
 * type du modèle pour parcourir la liste, plutôt que de retirer `as const`, qui
 * sert précisément à ce que `satisfies` contrôle chaque champ.
 */
const TOUTES: readonly Stance[] = POSITIONS;

const questions = validerQuestions(QUESTIONS);

describe("acteurs et candidatures", () => {
  it("sont reconnus comme des données réelles", () => {
    expect(DONNEES_FACTICES).toBe(false);
  });

  it("passent le schéma, identifiants et slugs uniques", () => {
    const acteurs = validerActeurs(ACTEURS);
    expect(acteurs.length).toBeGreaterThan(0);
    expect(validerCandidatures(CANDIDATURES, acteurs).length).toBe(
      acteurs.filter((acteur) => acteur.kind === "candidate").length,
    );
  });

  /*
   * Chaque candidat doit avoir une ligne de repli, sinon la reprise de position
   * ne pourra jamais s'appliquer à lui et il restera vide sur toute affirmation
   * qu'il n'a pas commentée personnellement.
   */
  it("donnent à chaque candidature au moins un acteur de repli, existant", () => {
    const connus = new Set(ACTEURS.map((acteur) => acteur.id));
    for (const candidature of CANDIDATURES) {
      expect(candidature.baselineActorIds.length, candidature.actorId).toBeGreaterThan(0);
      for (const repli of candidature.baselineActorIds) {
        expect(connus.has(repli), `${candidature.actorId} reprend ${repli}`).toBe(true);
      }
    }
  });

  it("datent et sourcent chaque statut de candidature", () => {
    const sources = new Set(SOURCES_POSITIONS.map((source) => source.id));
    for (const candidature of CANDIDATURES) {
      expect(candidature.statutSourceIds.length, candidature.actorId).toBeGreaterThan(0);
      for (const id of candidature.statutSourceIds) {
        expect(sources.has(id), `${candidature.actorId} cite ${id}`).toBe(true);
      }
    }
  });
});

describe("sources de positions", () => {
  it("passent le schéma, et aucune consultation ne précède la déclaration", () => {
    expect(validerSourcesPositions(SOURCES_POSITIONS).length).toBe(SOURCES_POSITIONS.length);
  });
});

describe("positions", () => {
  it("passent la validation référentielle complète", () => {
    const acteurs = validerActeurs(ACTEURS);
    const sources = validerSourcesPositions(SOURCES_POSITIONS);
    expect(validerPositions(POSITIONS, { acteurs, questions, sources }).length).toBe(
      POSITIONS.length,
    );
  });

  /*
   * L'invariant qui distingue un relevé d'une rédaction : hors inférence, une
   * position porte le verbatim qui la fonde. Le schéma le vérifie déjà ; ce test
   * le nomme, parce que c'est la règle la plus facile à contourner sans y penser.
   */
  it("portent un verbatim partout sauf pour une inférence", () => {
    for (const position of POSITIONS) {
      if (position.provenance === "inference") {
        expect(position.citation, position.id).toBe("");
        expect(position.rationale.length, position.id).toBeGreaterThanOrEqual(40);
      } else {
        expect(position.citation.trim().length, position.id).toBeGreaterThan(0);
      }
    }
  });

  /*
   * Le plafond, vérifié sur les données réelles et pas seulement sur le schéma :
   * hors adéquation directe, aucune position ne porte la valeur maximale.
   */
  it("réservent la valeur maximale aux adéquations directes", () => {
    for (const position of POSITIONS) {
      if (position.adequation !== "directe") {
        expect(Math.abs(position.value), position.id).toBeLessThanOrEqual(1);
      }
      if (position.provenance === "inference") {
        expect(position.adequation, position.id).toBe("deduite");
      }
    }
  });

  /*
   * Quand la source citée en relaie une autre, le maillon d'origine est écrit.
   * Sans cela, un lecteur qui clique tombe sur un média citant un tiers, et la
   * promesse de vérifiabilité s'arrête un cran trop tôt.
   */
  it("nomment le maillon d'origine quand il y en a un", () => {
    const relais = TOUTES.filter((position) => position.sourcePrimaire !== undefined);
    expect(relais.length).toBeGreaterThan(0);
    for (const position of relais) {
      expect(position.sourcePrimaire!.length, position.id).toBeGreaterThan(10);
    }
  });

  /*
   * Garde-fou éditorial, valable maintenant et plus tard : on ne publie pas une
   * déduction faible. Une inférence à confiance basse peut vivre dans le dépôt,
   * être lue et discutée ; elle ne peut pas entrer dans un classement servi.
   */
  it("ne publient jamais une inférence à confiance basse", () => {
    for (const position of positionsPubliables(TOUTES)) {
      expect(
        position.provenance === "inference" && position.confidence === "low",
        `${position.id} est une inférence faible et pourtant servie`,
      ).toBe(false);
    }
  });
});
