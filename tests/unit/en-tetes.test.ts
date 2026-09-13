/**
 * Contenu de public/_headers.
 *
 * Cloudflare Pages n'applique ce fichier qu'en production : ni `astro dev` ni
 * `astro preview` ne le lisent, donc aucun test de navigateur ne peut vérifier
 * ces en-têtes avant déploiement. Ce test relit le fichier tel qu'il sera servi.
 *
 * Il échoue si une directive de sécurité est retirée ou affaiblie.
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
      "style-src": "'self' 'unsafe-inline'",
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

    it("n'autorise aucun hôte distant", () => {
      expect(csp).not.toMatch(/https?:\/\//);
      expect(csp).not.toContain("*");
    });
  });

  it("interdit le reniflage de type", () => {
    expect(directive("X-Content-Type-Options")).toBe("nosniff");
  });
});
