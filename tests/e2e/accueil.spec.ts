/**
 * Les deux mécanismes animés de l'accueil : la scène de l'urne et le carrousel.
 * Puis la vitrine des thèmes et des candidats, qui ne bouge pas.
 *
 * On ne vérifie pas le rendu du mouvement — une capture à un instant donné
 * serait fragile —, mais les DÉCISIONS qui le pilotent : la démo s'arrête-t-elle
 * sur une carte, le carrousel boucle-t-il, s'arrête-t-il quand on le demande, et
 * rien ne bouge-t-il seul quand « réduire les animations » est demandé.
 */
import { test, expect, type Page } from "@playwright/test";
import { QUESTIONS } from "../../src/data/questions";
import { THEMES_PUBLIES } from "../../src/data/themes";

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

/*
 * LA VITRINE : thèmes et candidats, pour comparer sans faire le test. Sans
 * JavaScript, parce que c'est du contenu essentiel, servi en HTML statique.
 *
 * Un visage s'identifie par le nom de son fichier, ou par ses initiales : la
 * mosaïque n'écrit aucun nom, et c'est voulu.
 */
async function clesDesVisages(page: Page, selecteur: string): Promise<string[]> {
  return page.locator(selecteur).evaluateAll((visages) =>
    visages.map((visage) =>
      visage instanceof HTMLImageElement
        ? visage
            .getAttribute("src")!
            .split("/")
            .pop()!
            .replace(/\.\w+$/, "")
        : visage.textContent!.trim(),
    ),
  );
}

test.describe("la vitrine, sans JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("montre chaque candidat en lice, dans l'ordre de /candidats, chacun lié à sa fiche", async ({
    page,
    request,
  }) => {
    await page.goto("/candidats");
    const attendus = await clesDesVisages(page, ".trombinoscope > li .portrait");
    const fiches = await page
      .locator(".trombinoscope > li .nom a")
      .evaluateAll((liens) =>
        liens.map((lien) => ({ href: lien.getAttribute("href")!, nom: lien.textContent!.trim() })),
      );
    expect(attendus.length).toBeGreaterThan(20);

    await page.goto("/");
    expect(await clesDesVisages(page, ".visages .portrait")).toEqual(attendus);

    // Un lien par visage, vers sa fiche, dont le nom accessible commence par le nom du candidat.
    const visages = page.locator(".visages > li");
    await expect(visages).toHaveCount(fiches.length);
    for (const [index, fiche] of fiches.entries()) {
      const lien = visages.nth(index).locator("a");
      await expect(lien).toHaveCount(1);
      await expect(lien).toHaveAttribute("href", fiche.href);
      await expect(lien).toHaveAccessibleName(new RegExp(`^${fiche.nom}( |$)`));
    }

    await expect(page.locator(".vitrine a[href='/candidats']")).toHaveAccessibleName(
      `Voir les ${fiches.length} candidats`,
    );

    for (const src of await page
      .locator(".visages img")
      .evaluateAll((images) => images.map((image) => image.getAttribute("src")!))) {
      expect(src).toMatch(/^\/medias\/vignettes\/[^/]+\.webp$/);
      expect((await request.get(src)).status(), src).toBe(200);
    }
  });

  test("donne une ligne à chaque thème du test, dans l'ordre du test, avec ses questions", async ({
    page,
  }) => {
    await page.goto("/");
    const rangees = page.locator(".rideaux > li");
    await expect(rangees).toHaveCount(THEMES_PUBLIES.length);

    const ordonnees = [...QUESTIONS].sort((a, b) => a.ordre - b.ordre);
    const ordre = [...new Set(ordonnees.map((q) => q.theme))];
    for (const [index, nom] of ordre.entries()) {
      const theme = THEMES_PUBLIES.find((t) => t.nom === nom)!;
      const courts: Record<string, string> = theme.courts;
      const rangee = rangees.nth(index);
      const liens = rangee.locator("a");
      await expect(liens).toHaveCount(1);
      await expect(liens).toHaveText(nom);
      await expect(liens).toHaveAttribute("href", `/themes/${theme.slug}`);
      await expect(rangee.locator(".sujets li")).toHaveText(
        ordonnees.filter((q) => q.theme === nom).map((q) => courts[q.id]!),
      );
    }
  });

  test("sert les petits portraits des pages de thème en vignettes", async ({ page, request }) => {
    await page.goto("/themes/travail-et-retraites");
    const sources = new Set(
      await page
        .locator("img.portrait")
        .evaluateAll((images) => images.map((image) => image.getAttribute("src")!)),
    );
    expect(sources.size).toBeGreaterThan(20);
    for (const src of sources) {
      expect(src).toMatch(/^\/medias\/vignettes\//);
      expect((await request.get(src)).status(), src).toBe(200);
    }
  });
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
