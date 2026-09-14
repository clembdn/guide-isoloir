/**
 * Contenu de public/_headers.
 *
 * CE FICHIER EST UN GABARIT. Les empreintes de la CSP y sont représentées par
 * deux jetons, remplacés au build par celles qu'Astro a réellement émises — voir
 * l'intégration `csp-en-tetes` dans astro.config.mjs. Ce test garde donc la
 * FORME de la politique, pas ses empreintes.
 *
 * La politique EFFECTIVE, elle, se vérifie en navigateur contre le site
 * construit et servi : `tests/e2e/csp-hydratation.spec.ts`. C'est le seul
 * endroit où l'intersection entre l'en-tête HTTP et la balise meta d'Astro
 * s'observe vraiment.
 *
 * Ici : il échoue si une directive est retirée ou affaiblie.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const fichier = readFileSync(
  fileURLToPath(new URL("../../public/_headers", import.meta.url)),
  "utf8",
);

function directive(nom: string): string {
  const trouve = fichier
    .split("\n")
    .map((ligne) => ligne.trim())
    .find((ligne) => ligne.toLowerCase().startsWith(`${nom.toLowerCase()}:`));

  if (trouve === undefined) {
    throw new Error(`En-tête absent de public/_headers : ${nom}`);
  }
  return trouve.slice(nom.length + 1).trim();
}

describe("public/_headers", () => {
  it("s'applique à toutes les routes", () => {
    expect(fichier).toMatch(/^\/\*$/m);
  });

  it("n'envoie aucun référent", () => {
    expect(directive("Referrer-Policy")).toBe("no-referrer");
  });

  describe("Content-Security-Policy", () => {
    const csp = directive("Content-Security-Policy");

    const attendues: Record<string, string> = {
      "default-src": "'self'",
      // Interdit tout analytics, tout pixel, toute régie publicitaire.
      "script-src": "'self'",
      "style-src": "'self'",
      // Interdit les polices distantes : elles sont auto-hébergées.
      "font-src": "'self'",
      "img-src": "'self' data: blob:",
      // Interdit toute requête sortante après le chargement de la page.
      "connect-src": "'none'",
    };

    for (const [nom, valeur] of Object.entries(attendues)) {
      it(`fixe ${nom} à ${valeur}`, () => {
        expect(csp).toContain(`${nom} ${valeur}`);
      });
    }

    it("verrouille aussi la base, les formulaires, l'inclusion et les objets", () => {
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
    });

    it("n'autorise ni 'unsafe-inline' ni 'unsafe-eval' pour les scripts", () => {
      const scriptSrc = /script-src([^;]*)/.exec(csp)?.[1] ?? "";
      expect(scriptSrc).not.toContain("unsafe-inline");
      expect(scriptSrc).not.toContain("unsafe-eval");
    });

    it("n'autorise plus 'unsafe-inline' pour les styles", () => {
      // Le gabarit annonçait une politique plus permissive que celle réellement
      // appliquée : Astro hache ses styles, l'en-tête ouvrait tous les styles en
      // ligne. Un gabarit qui ment sur la politique est pire qu'un gabarit
      // strict, parce qu'on le lit pour savoir ce qui est autorisé.
      const styleSrc = /style-src([^;]*)/.exec(csp)?.[1] ?? "";
      expect(styleSrc).not.toContain("unsafe-inline");
    });

    it("réserve la place des empreintes émises au build", () => {
      // Sans ces jetons, l'intégration n'aurait rien à remplacer, et l'en-tête
      // interdirait les scripts en ligne qu'Astro vient de hacher : plus aucun
      // îlot ne s'hydraterait, en silence.
      expect(csp).toContain("__EMPREINTES_SCRIPT__");
      expect(csp).toContain("__EMPREINTES_STYLE__");
    });

    it("n'autorise aucun hôte distant", () => {
      expect(csp).not.toMatch(/https?:\/\//);
      expect(csp).not.toContain("*");
    });

    it("interdit toute requête sortante, y compris vers nous-mêmes", () => {
      // `connect-src 'none'` est ce qui empêche un `fetch` d'emporter des
      // réponses de quiz, même vers notre propre domaine. Mesuré : Chromium
      // refuse la requête si tôt qu'aucun objet de requête n'est créé.
      expect(csp).toContain("connect-src 'none'");
    });
  });

  it("interdit le reniflage de type", () => {
    expect(directive("X-Content-Type-Options")).toBe("nosniff");
  });
});
