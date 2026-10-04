/**
 * Redirections de la paire inversée d'un face-à-face (`scripts/redirections.mjs`).
 *
 * Le fichier réel se vérifie contre le site construit et servi, dans
 * `tests/e2e/comparer.spec.ts`. Ici : la règle de construction et la lecture.
 */
import { describe, expect, it } from "vitest";
import { lignesPaires, lireRedirections } from "../../scripts/redirections.mjs";

describe("lignesPaires", () => {
  it("écrit une 301 de la paire inversée vers l'ordre canonique, triée", () => {
    expect(
      lignesPaires([
        "comparer/marine-le-pen/jean-luc-melenchon.html",
        "comparer/david-lisnard/bruno-retailleau.html",
        "comparer.html",
        "candidats/marine-le-pen.html",
      ]),
    ).toEqual([
      "/comparer/bruno-retailleau/david-lisnard /comparer/david-lisnard/bruno-retailleau 301",
      "/comparer/jean-luc-melenchon/marine-le-pen /comparer/marine-le-pen/jean-luc-melenchon 301",
    ]);
  });

  it("refuse une paire construite dans les deux ordres", () => {
    expect(() => lignesPaires(["comparer/a/b.html", "comparer/b/a.html"])).toThrow(
      /existent tous deux/,
    );
  });

  it("ne produit rien sans face-à-face", () => {
    expect(lignesPaires([])).toEqual([]);
  });
});

describe("lireRedirections", () => {
  it("lit source, cible et statut, et ignore les commentaires", () => {
    const regles = lireRedirections(
      ["# commentaire", "", "/comparer/b/a /comparer/a/b 301", "/ancienne /nouvelle"].join("\n"),
    );
    expect(regles.get("/comparer/b/a")).toEqual({ cible: "/comparer/a/b", statut: 301 });
    expect(regles.get("/ancienne")).toEqual({ cible: "/nouvelle", statut: 302 });
    expect(regles.size).toBe(2);
  });

  it("relit exactement ce que lignesPaires écrit", () => {
    const lignes = lignesPaires(["comparer/x/y.html"]);
    expect([...lireRedirections(lignes.join("\n"))]).toEqual([
      ["/comparer/y/x", { cible: "/comparer/x/y", statut: 301 }],
    ]);
  });
});
