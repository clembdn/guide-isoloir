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
  positionsRetenues,
} from "../../src/lib/fiches";

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

  it("nomment chaque candidat en lice exactement une fois par affirmation", () => {
    for (const theme of pagesThemes()) {
      for (const affirmation of theme.affirmations) {
        const nommes = [
          ...affirmation.groupes.flatMap((groupe) => groupe.candidats),
          ...affirmation.inconnus,
        ]
          .map((cite) => cite.slug)
          .sort();
        expect(nommes, `${theme.slug} / ${affirmation.question.id}`).toEqual(enLice);
      }
    }
  });

  it("classent chaque candidat dans le groupe de sa position retenue", () => {
    const retenue = new Map(
      positionsRetenues().map((r) => [`${r.candidatId}|${r.questionId}`, r.valeurLibelle]),
    );
    const idParSlug = new Map(fiches().map((fiche) => [fiche.acteur.slug, fiche.acteur.id]));

    for (const theme of pagesThemes()) {
      for (const affirmation of theme.affirmations) {
        for (const groupe of affirmation.groupes) {
          for (const cite of groupe.candidats) {
            const cle = `${idParSlug.get(cite.slug)}|${affirmation.question.id}`;
            expect(retenue.get(cle), cle).toBe(groupe.libelle);
          }
        }
      }
    }
  });
});
