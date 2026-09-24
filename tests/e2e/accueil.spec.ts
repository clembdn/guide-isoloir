/**
 * Les deux mécanismes animés de l'accueil : la scène de l'urne et le carrousel.
 *
 * On ne vérifie pas le rendu du mouvement — une capture à un instant donné
 * serait fragile —, mais les DÉCISIONS qui le pilotent : la démo s'arrête-t-elle
 * sur une carte, le carrousel boucle-t-il, s'arrête-t-il quand on le demande, et
 * rien ne bouge-t-il seul quand « réduire les animations » est demandé.
 */
import { test, expect, type Page } from "@playwright/test";

/** Place la piste de la scène à une fraction de sa course d'épinglage. */
async function defilerScene(page: Page, fraction: number) {
  await page.evaluate((f) => {
    const scene = document.querySelector<HTMLElement>("[data-scene]")!;
    const boite = scene.getBoundingClientRect();
    const course = boite.height - window.innerHeight;
    window.scrollTo(0, boite.top + window.scrollY + f * course);
  }, fraction);
}

test("la démo s'arrête sur une carte, qui tombe dans l'urne, puis repart", async ({ page }) => {
  const erreurs: string[] = [];
  page.on("pageerror", (erreur) => erreurs.push(String(erreur)));
  await page.goto("/");

  const racine = page.locator("[data-scene-racine]");
  await expect(racine).toHaveClass(/scene-active/);

  await defilerScene(page, 0.5);
  await expect(page.locator(".demo")).toHaveClass(/demo--figee/);
  await expect(page.locator(".demo-carte.est-devant")).toHaveCount(1);
  await expect(page.locator(".demo-carte.est-suivante")).toHaveCount(1);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator(".demo")).not.toHaveClass(/demo--figee/);
  await expect(page.locator(".demo-carte.est-devant, .demo-carte.est-suivante")).toHaveCount(0);

  expect(erreurs).toEqual([]);
});

test("le carrousel a un point par article, boucle après le dernier, et s'arrête", async ({
  page,
}) => {
  await page.goto("/");
  const articles = await page.locator("[data-carrousel-item]").count();
  const points = page.locator("[data-carrousel-point]");
  await expect(points).toHaveCount(articles);

  // Les copies qui bouclent la rangée ne se rencontrent ni au clavier ni à l'oral.
  // Deux de chaque côté : la carte en cours est centrée, ses voisines se voient.
  const copies = page.locator(".carte-copie");
  await expect(copies).toHaveCount(4);
  for (const copie of await copies.all()) {
    await expect(copie).toHaveAttribute("aria-hidden", "true");
    expect(await copie.evaluate((element) => (element as HTMLElement).inert)).toBe(true);
  }

  await page.locator("[data-carrousel]").scrollIntoViewIfNeeded();
  await points.last().click();
  await expect(points.last()).toHaveAttribute("aria-current", "true");

  // Après le dernier article, c'est le premier qui revient.
  await expect(points.first()).toHaveAttribute("aria-current", "true", { timeout: 8000 });
  // Le temps que la rangée se pose sur l'original, après la copie.
  await page.waitForTimeout(800);

  const pause = page.locator("[data-carrousel-pause]");
  await pause.click();
  await expect(pause).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(6000);
  await expect(points.first()).toHaveAttribute("aria-current", "true");
});

test.describe("avec « réduire les animations »", () => {
  test.use({ reducedMotion: "reduce" });

  test("ni urne, ni épinglage, ni défilement automatique", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-scene-racine]")).not.toHaveClass(/scene-active/);
    await expect(page.locator("[data-carrousel-pause]")).toBeHidden();

    const points = page.locator("[data-carrousel-point]");
    await page.locator("[data-carrousel]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(6000);
    await expect(points.first()).toHaveAttribute("aria-current", "true");
  });
});
