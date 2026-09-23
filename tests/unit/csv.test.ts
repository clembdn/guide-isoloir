/**
 * Les exports CSV de /donnees survivent aux verbatims.
 *
 * Une citation contient des guillemets, des virgules, parfois un retour à la
 * ligne. Un CSV mal échappé décale les colonnes à la première d'entre elles,
 * et la valeur codée se retrouve lue comme une source — sans erreur visible.
 */
import { describe, expect, it } from "vitest";
import { versCsv } from "../../src/lib/csv";

describe("versCsv", () => {
  it("laisse nus les champs simples et vide les absents", () => {
    expect(versCsv(["a", "b", "c"], [["x", 2, null]])).toBe("a,b,c\r\nx,2,\r\n");
  });

  it("entoure et double les guillemets, protège virgules et retours à la ligne", () => {
    const csv = versCsv(
      ["citation"],
      [['« une retraite à 60 ans », dit-il "clairement"'], ["ligne 1\nligne 2"]],
    );
    expect(csv).toBe(
      'citation\r\n"« une retraite à 60 ans », dit-il ""clairement"""\r\n"ligne 1\nligne 2"\r\n',
    );
  });

  it("refuse une ligne qui n'a pas le nombre de colonnes annoncé", () => {
    expect(() => versCsv(["a", "b"], [["seule"]])).toThrow(/1 cellules pour 2 colonnes/);
  });
});
