/**
 * Garanties des pages de données : fiches, thèmes, exports.
 *
 * Trois promesses qui ne se voient pas à l'écran, et qu'aucune relecture ne
 * vérifierait d'un coup d'œil :
 *
 *   - `direction` ne sort jamais, même dans un export fait pour être copié ;
 *   - une page de thème nomme chaque candidat en lice exactement une fois, ni
 *     oublié ni compté deux fois ;
 *   - les exports disent la même chose que les fiches.
 */
import { describe, expect, it } from "vitest";
import {
  DONNEES_OUVERTES,
  estEnLice,
  fiches,
  pagesThemes,
  pagesThemesPropositions,
  positionsRetenues,
  SEUIL_INDEXATION,
  tousLesThemes,
  type AffirmationTheme,
  type CandidatCite,
} from "../../src/lib/fiches";
import { DOMAINES_PROPOSITION } from "../../src/lib/acteurs";

describe("données ouvertes", () => {
  it("n'exportent jamais le sens des affirmations", () => {
    for (const question of DONNEES_OUVERTES.questions) {
      expect(Object.keys(question)).not.toContain("direction");
    }
  });

  it("n'exportent que des positions publiables", () => {
    for (const position of DONNEES_OUVERTES.positions) {
      expect(["reconciled", "published"]).toContain(position.reviewStatus);
    }
  });

  it("retiennent autant de positions que les fiches en affichent", () => {
    const affichees = fiches().reduce((somme, fiche) => somme + fiche.documentees, 0);
    expect(positionsRetenues()).toHaveLength(affichees);
  });
});

describe("pages de thème", () => {
  const enLice = fiches()
    .filter((fiche) => estEnLice(fiche.candidature))
    .map((fiche) => fiche.acteur.slug)
    .sort();

  const colonnes = (affirmation: AffirmationTheme) => [
    ...affirmation.pour,
    ...affirmation.contre,
    ...affirmation.neutre,
    ...affirmation.inconnus,
  ];

  it("nomment chaque candidat en lice exactement une fois par affirmation", () => {
    for (const theme of pagesThemes()) {
      for (const affirmation of theme.affirmations) {
        const nommes = colonnes(affirmation)
          .map((cite) => cite.slug)
          .sort();
        expect(nommes, `${theme.slug} / ${affirmation.question.id}`).toEqual(enLice);
      }
    }
  });

  it("rangent chaque candidat dans la colonne de sa position retenue", () => {
    const retenue = new Map(
      positionsRetenues().map((r) => [`${r.candidatId}|${r.questionId}`, r.valeur]),
    );
    const idParSlug = new Map(fiches().map((fiche) => [fiche.acteur.slug, fiche.acteur.id]));

    for (const theme of pagesThemes()) {
      for (const affirmation of theme.affirmations) {
        const cle = (cite: CandidatCite) =>
          `${idParSlug.get(cite.slug)}|${affirmation.question.id}`;
        for (const cite of affirmation.pour)
          expect(retenue.get(cle(cite)), cle(cite)).toBeGreaterThan(0);
        for (const cite of affirmation.contre)
          expect(retenue.get(cle(cite)), cle(cite)).toBeLessThan(0);
        for (const cite of affirmation.neutre) expect(retenue.get(cle(cite)), cle(cite)).toBe(0);
        for (const cite of affirmation.inconnus)
          expect(retenue.has(cle(cite)), cle(cite)).toBe(false);
        for (const cite of colonnes(affirmation)) {
          expect(cite.valeur ?? undefined, cle(cite)).toBe(retenue.get(cle(cite)));
          expect(cite.nuance, cle(cite)).toBe(
            cite.valeur !== null && Math.abs(cite.valeur) === 1 ? "Plutôt" : null,
          );
        }
      }
    }
  });

  it("nomment dans la phrase « En bref » tous les candidats pour, contre ou ni l'un ni l'autre", () => {
    for (const theme of pagesThemes()) {
      for (const affirmation of theme.affirmations) {
        for (const cite of [...affirmation.pour, ...affirmation.contre, ...affirmation.neutre]) {
          expect(affirmation.enBref, `${affirmation.question.id} / ${cite.slug}`).toContain(
            cite.nom,
          );
        }
        for (const cite of affirmation.inconnus) {
          expect(affirmation.enBref, `${affirmation.question.id} / ${cite.slug}`).not.toContain(
            cite.nom,
          );
        }
      }
    }
  });

  it("donnent un intitulé court à chaque affirmation", () => {
    for (const theme of pagesThemes()) {
      for (const affirmation of theme.affirmations) {
        expect(affirmation.court.length, affirmation.question.id).toBeGreaterThan(3);
        expect(affirmation.court.length, affirmation.question.id).toBeLessThanOrEqual(34);
      }
    }
  });
});

describe("pages de thème hors test", () => {
  it("rattachent chaque domaine de programme à un seul thème", () => {
    const domaines = tousLesThemes()
      .map((theme) => theme.domaine)
      .sort();
    expect(domaines).toEqual([...DOMAINES_PROPOSITION].sort());
  });

  it("n'ont pas deux adresses identiques", () => {
    const slugs = tousLesThemes().map((theme) => theme.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("nomment chaque candidat en lice, avec ou sans proposition", () => {
    const enLice = fiches().filter((fiche) => estEnLice(fiche.candidature)).length;
    for (const theme of pagesThemesPropositions()) {
      expect(theme.parCandidat.length + theme.sansProposition.length, theme.slug).toBe(enLice);
      for (const entree of theme.parCandidat) {
        for (const proposition of entree.propositions) {
          expect(proposition.domaine, `${theme.slug} / ${proposition.id}`).toBe(theme.domaine);
        }
      }
    }
  });

  it("ne sont indexées qu'à partir du seuil", () => {
    for (const theme of pagesThemesPropositions()) {
      expect(theme.indexable, theme.slug).toBe(theme.nombrePropositions >= SEUIL_INDEXATION);
    }
  });
});
