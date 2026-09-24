/**
 * Le sommaire des pages de lecture marque la section en cours, y compris la
 * dernière.
 *
 * POURQUOI CE TEST EXISTE.
 *
 * Deux défauts ont été mesurés le 24 septembre 2026, défilement réel dans
 * Chromium :
 *
 *   1. le dernier titre (« Sources ») ne remontait jamais jusqu'à la ligne de
 *      lecture, placée au tiers de l'écran : la page s'arrête avant. Il n'était
 *      jamais marqué, alors que la piste de lecture arrivait à 100 % ;
 *   2. un saut — touche Fin, barre glissée, clic dans le sommaire — laissait le
 *      marquage figé : l'IntersectionObserver d'alors ne voyait aucun titre
 *      changer d'état. En bas de /methodologie, la section marquée était la
 *      première.
 *
 * Grand écran seulement : le sommaire collant n'existe qu'à partir de 64 rem.
 */
import { test, expect, type Page } from "@playwright/test";

const ROUTES = ["/methodologie", "/comprendre/ou-et-comment-voter"] as const;

test.use({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, hasTouch: false });

/** Texte du lien marqué, après que le calcul de l'image suivante a eu lieu. */
async function lienMarque(page: Page): Promise<string | null> {
  await page.evaluate(
    () => new Promise((fin) => requestAnimationFrame(() => requestAnimationFrame(fin))),
  );
  return page.locator(".sommaire-large a[aria-current='location']").textContent();
}

for (const route of ROUTES) {
  test.describe(route, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(route);
    });

    test("en haut de page, la première section est marquée", async ({ page }) => {
      const premier = await page.locator(".sommaire-large a").first().textContent();
      expect(await lienMarque(page)).toBe(premier);
    });

    test("en bas de page, la dernière section est marquée", async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const dernier = await page.locator(".sommaire-large a").last().textContent();
      expect(await lienMarque(page)).toBe(dernier);
    });

    test("après un saut vers une section du milieu, c'est elle qui est marquée", async ({
      page,
    }) => {
      const liens = page.locator(".sommaire-large a");
      const milieu = liens.nth(Math.floor((await liens.count()) / 2));
      const texte = await milieu.textContent();
      await milieu.click();
      await expect(page.locator(".sommaire-large a[aria-current='location']")).toHaveText(
        texte ?? "",
      );
    });
  });
}
