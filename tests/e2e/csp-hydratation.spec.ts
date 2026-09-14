/**
 * Un îlot s'hydrate sous la politique de sécurité réellement déployée.
 *
 * POURQUOI CE TEST EXISTE.
 *
 * Deux politiques de sécurité se composent sur ce site, et elles se composent en
 * INTERSECTION, pas en union :
 *
 *   - l'en-tête HTTP de `public/_headers`, servi par Cloudflare Pages ;
 *   - la balise meta qu'Astro insère, qui déclare les empreintes de ses propres
 *     scripts en ligne (`security.csp: true`).
 *
 * Une ressource doit être autorisée par CHACUNE. Un `script-src 'self'` nu dans
 * l'en-tête interdit donc tout script en ligne, y compris ceux qu'Astro vient de
 * hacher : l'îlot ne démarre jamais. Mesuré sur ce dépôt avant correction :
 * deux violations `script-src-elem`, zéro réponse rendue, l'attribut `ssr`
 * toujours présent sur l'îlot.
 *
 * Et surtout, L'ÉCHEC EST SILENCIEUX. La page s'affiche, la mise en page est
 * correcte, le texte est là. Rien ne réagit. Aucun test de rendu ne le voit.
 *
 * CE QUE CE TEST GARDE, dans l'ordre :
 *
 *   1. que l'en-tête CSP est bien présent. Sans cette vérification, tout le
 *      reste passerait sur un site servi sans politique du tout — c'est-à-dire
 *      exactement le piège que ce fichier est censé fermer ;
 *   2. que l'en-tête n'a pas été affaibli pour faire passer la CI ;
 *   3. qu'aucune violation n'est levée ;
 *   4. que l'îlot est hydraté ;
 *   5. qu'une interaction change réellement son état.
 *
 * Il échouera à la prochaine montée de version d'Astro si les empreintes ne sont
 * plus reportées dans l'en-tête. C'est voulu : c'est le seul moment où l'on peut
 * s'en apercevoir avant les utilisateurs.
 */
import { test, expect, type Page } from "@playwright/test";

/** Routes portant un îlot hydraté. À compléter quand il y en aura d'autres. */
const ROUTES_AVEC_ILOT = ["/test"] as const;

type Violation = { directive: string; bloque: string };

declare global {
  interface Window {
    __violationsCsp?: Violation[];
  }
}

/**
 * Recense les violations de CSP côté page.
 *
 * `securitypolicyviolation` est la source fiable : la console peut être filtrée
 * ou formatée différemment d'une version de navigateur à l'autre, l'événement
 * DOM non.
 */
async function suivreViolations(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__violationsCsp = [];
    document.addEventListener("securitypolicyviolation", (evenement) => {
      window.__violationsCsp?.push({
        directive: evenement.violatedDirective,
        bloque: evenement.blockedURI,
      });
    });
  });
}

async function violations(page: Page): Promise<Violation[]> {
  return page.evaluate(() => window.__violationsCsp ?? []);
}

for (const route of ROUTES_AVEC_ILOT) {
  test(`${route} est servie avec une CSP qui autorise les scripts hachés d'Astro`, async ({
    request,
  }) => {
    const reponse = await request.get(route);
    expect(reponse.status()).toBe(200);

    const csp = reponse.headers()["content-security-policy"];

    // Premier garde-fou, et le plus important : sans en-tête, les vérifications
    // suivantes s'exécuteraient dans le vide.
    expect(
      csp,
      "Aucun en-tête Content-Security-Policy sur cette route. Le site est-il servi " +
        "par `npm run serve:dist`, qui applique dist/_headers ?",
    ).toBeDefined();

    const scriptSrc = /script-src([^;]*)/.exec(csp ?? "")?.[1] ?? "";

    expect(scriptSrc, "script-src doit autoriser les ressources du même hôte").toContain("'self'");
    expect(
      /'sha(?:256|384|512)-[^']+'/.test(scriptSrc),
      "script-src ne contient aucune empreinte. L'intégration `csp-en-tetes` d'astro.config.mjs " +
        "a-t-elle bien reporté dans dist/_headers les empreintes émises par Astro ?",
    ).toBe(true);

    // Le raccourci qui ferait passer ce fichier sans rien corriger.
    expect(scriptSrc).not.toContain("unsafe-inline");
    expect(scriptSrc).not.toContain("unsafe-eval");
  });

  test(`${route} n'émet aucune violation de CSP`, async ({ page }) => {
    await suivreViolations(page);
    await page.goto(route, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    const relevees = await violations(page);

    expect(
      relevees,
      `Violation(s) de CSP sur ${route} :\n${relevees
        .map((v) => `  ${v.directive} bloque ${v.bloque}`)
        .join("\n")}`,
    ).toEqual([]);
  });

  test(`${route} hydrate son îlot et réagit à une interaction`, async ({ page }) => {
    await suivreViolations(page);
    await page.goto(route, { waitUntil: "networkidle" });

    // Astro retire l'attribut `ssr` de l'îlot une fois le composant monté.
    // C'est le signal le plus direct : il ne dépend d'aucun détail du quiz.
    await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });

    const reponses = page.locator('input[type="radio"]');
    await expect(reponses.first()).toBeVisible();

    const progression = page.locator(".progression-texte");
    const avant = await progression.innerText();

    await reponses.first().check();
    await expect(reponses.first()).toBeChecked();

    await page.getByRole("button", { name: "Question suivante" }).click();

    // L'état a changé : c'est ce qu'un composant non hydraté ne peut pas faire.
    await expect(progression).not.toHaveText(avant);

    expect(await violations(page), "Une interaction a déclenché une violation de CSP").toEqual([]);
  });
}
