/**
 * Le domaine n'existe qu'à une seule adresse.
 *
 * Il est écrit deux fois : `site` dans astro.config.mjs, d'où sortent les URL
 * canoniques et les métadonnées de partage, et `SITE_URL` dans src/lib/site.ts,
 * d'où sortent le sitemap, robots.txt et llms.txt.
 *
 * Une divergence entre les deux ne casse rien : le site se construit, les pages
 * s'affichent, et Google reçoit deux versions du même site dont l'une n'existe
 * pas. Aucun autre test ne peut la voir, parce que chacun des deux fichiers est
 * cohérent avec lui-même. D'où ce test.
 *
 * La forme est vérifiée en même temps : `https`, pas de barre oblique finale,
 * pas de `www` — l'apex est la forme canonique, `www` est redirigé en 301 par
 * une Redirect Rule Cloudflare.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SITE_URL } from "../../src/lib/site";

const config = readFileSync(
  fileURLToPath(new URL("../../astro.config.mjs", import.meta.url)),
  "utf8",
);

const siteDeLaConfig = /^const SITE = "([^"]+)";$/m.exec(config)?.[1];

describe("domaine", () => {
  it("est déclaré dans astro.config.mjs", () => {
    expect(siteDeLaConfig).toBeDefined();
  });

  it("est identique dans astro.config.mjs et src/lib/site.ts", () => {
    expect(siteDeLaConfig).toBe(SITE_URL);
  });

  it("est en https", () => {
    expect(SITE_URL.startsWith("https://")).toBe(true);
  });

  it("ne porte pas de barre oblique finale", () => {
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  it("est l'apex, pas www", () => {
    expect(new URL(SITE_URL).host.startsWith("www.")).toBe(false);
  });

  it("n'est pas un domaine réservé", () => {
    expect(new URL(SITE_URL).host).not.toMatch(/\.(invalid|example|test|localhost)$/);
  });
});
