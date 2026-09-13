import { describe, expect, it } from "vitest";
import { formatDateFr } from "../../src/lib/date";

describe("formatDateFr", () => {
  it("écrit la date en français", () => {
    expect(formatDateFr("2026-09-14")).toBe("14 septembre 2026");
  });

  it("écrit « 1er » le premier du mois", () => {
    expect(formatDateFr("2026-10-01")).toBe("1er octobre 2026");
  });

  it("garde les dates du scrutin exactes", () => {
    expect(formatDateFr("2027-04-18")).toBe("18 avril 2027");
    expect(formatDateFr("2027-05-02")).toBe("2 mai 2027");
  });

  it("ne dépend pas de la locale de la machine", () => {
    // Sortie identique au build et dans le navigateur : la fonction n'utilise
    // pas `Intl`, dont le résultat varie selon l'environnement.
    expect(formatDateFr("2027-01-01")).toBe("1er janvier 2027");
    expect(formatDateFr("2027-08-31")).toBe("31 août 2027");
  });

  it("refuse un format qui n'est pas AAAA-MM-JJ", () => {
    expect(() => formatDateFr("14/09/2026")).toThrow();
    expect(() => formatDateFr("2026-9-14")).toThrow();
    expect(() => formatDateFr("")).toThrow();
  });

  it("refuse une date qui n'existe pas", () => {
    expect(() => formatDateFr("2026-13-01")).toThrow();
    expect(() => formatDateFr("2026-02-30")).toThrow();
    expect(() => formatDateFr("2026-04-31")).toThrow();
  });

  it("accepte le 29 février d'une année bissextile", () => {
    expect(formatDateFr("2028-02-29")).toBe("29 février 2028");
    expect(() => formatDateFr("2027-02-29")).toThrow();
  });
});
