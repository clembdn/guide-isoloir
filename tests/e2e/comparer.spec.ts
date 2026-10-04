/**
 * Comparer deux candidats : l'index `/comparer` et les face-à-face.
 *
 * CE QUE CE TEST PROTÈGE.
 *
 *   1. LA COMPLÉTUDE, SANS JAVASCRIPT. L'index nomme chaque candidat en lice,
 *      comparable ou non ; une paire montre ses 24 affirmations, chacune
 *      reliée à sa case et à la ligne de la fiche qui porte la citation.
 *   2. L'ADRESSE CANONIQUE. L'ordre est celui de `/candidats` ; la paire
 *      inversée redirige en 301 ; une paire sans page répond 404.
 *   3. L'INDEX ET LE SITEMAP DISENT LA MÊME CHOSE : une page en `noindex` n'est
 *      pas proposée aux moteurs, et une page proposée n'est pas en `noindex`.
 *   4. LA COULEUR DE SENS RESTE À CÔTÉ DES MOTS : aucune pastille dans la
 *      grille du coup d'œil ni sur le rail des visages.
 *   5. LE SÉLECTEUR MARCHE AU CLAVIER, et rien ne déborde à 375 px ni dans la
 *      barre de navigation à 1024 px.
 *
 * Aucune paire n'est écrite en dur : elles sont lues sur `/comparer`. Une paire
 * qui passerait sous le seuil ne casserait pas le test, elle en sortirait.
 */
import { test, expect, type Page } from "@playwright/test";

const SITE = "https://guide-isoloir.fr";

/** Les comparaisons proposées par l'index, dans son ordre. */
async function cheminsProposes(page: Page): Promise<string[]> {
  await page.goto("/comparer");
  return page
    .locator(".toutes a")
    .evaluateAll((liens) => liens.map((lien) => lien.getAttribute("href")!));
}

/** Les slugs des candidats, dans l'ordre de `/candidats`. */
async function ordreDesFiches(page: Page): Promise<string[]> {
  await page.goto("/candidats");
  const liens = await page
    .locator(".trombinoscope > li a")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")!));
  return liens.map((lien) => lien.replace("/candidats/", ""));
}

test.describe("/comparer sans JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("nomme chaque candidat en lice, comparable ou non", async ({ page }) => {
    const enLice = (await ordreDesFiches(page)).length;
    await page.goto("/comparer");
    const comparables = await page.locator(".visage-choix").count();
    const absents = await page.locator(".absents .noms li").count();
    expect(comparables).toBeGreaterThan(1);
    expect(comparables + absents).toBe(enLice);
  });

  test("propose chaque paire dans l'ordre des fiches", async ({ page }) => {
    const ordre = await ordreDesFiches(page);
    const chemins = await cheminsProposes(page);
    expect(chemins.length).toBeGreaterThan(0);
    expect(new Set(chemins).size).toBe(chemins.length);
    for (const chemin of chemins) {
      const [, , a, b] = chemin.split("/");
      expect(ordre.indexOf(a!), chemin).toBeGreaterThanOrEqual(0);
      expect(ordre.indexOf(a!), chemin).toBeLessThan(ordre.indexOf(b!));
    }
  });

  test("une paire montre ses 24 affirmations, reliées à leur case et à la fiche", async ({
    page,
    request,
  }) => {
    const [chemin] = await cheminsProposes(page);
    await page.goto(chemin!);

    const lignes = page.locator("li.ligne");
    await expect(lignes).toHaveCount(24);
    const ids = await lignes.evaluateAll((els) => els.map((el) => el.id));
    const cases = await page
      .locator(".coup-d-oeil .case")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(cases).toEqual(ids.map((id) => `#${id}`));

    /* Chaque verdict mène à une ligne qui existe sur la fiche, où se lit la citation. */
    const ancres = await page
      .locator(".verdicts a")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")!));
    expect(ancres.length).toBeGreaterThan(0);
    const fiches = new Map<string, string>();
    for (const ancre of ancres) {
      const [fiche, id] = ancre.split("#");
      if (!fiches.has(fiche!)) fiches.set(fiche!, await (await request.get(fiche!)).text());
      expect(fiches.get(fiche!), ancre).toContain(`id="${id}"`);
    }
  });

  test("dit le chiffre avec sa couverture, et la phrase « En bref » avec les deux noms", async ({
    page,
  }) => {
    const [chemin] = await cheminsProposes(page);
    await page.goto(chemin!);
    await expect(page.locator(".accord-total")).toContainText(/des \d+ affirmations comparables/);
    const noms = await page.locator(".cote .nom").allTextContents();
    expect(noms).toHaveLength(2);
    for (const nom of noms) await expect(page.locator(".en-bref .phrase")).toContainText(nom);
  });

  test("ne pose aucune pastille de sens dans la grille ni sur le rail", async ({ page }) => {
    const [chemin] = await cheminsProposes(page);
    await page.goto(chemin!);
    await expect(page.locator(".coup-d-oeil .marque")).toHaveCount(0);
    await expect(page.locator(".rail-paire .marque")).toHaveCount(0);
  });

  test("porte l'adresse canonique", async ({ page }) => {
    const [chemin] = await cheminsProposes(page);
    await page.goto(chemin!);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE}${chemin}`);
  });
});

test.describe("adresses des face-à-face", () => {
  test("la paire inversée redirige en 301 vers l'adresse canonique", async ({ page, request }) => {
    for (const chemin of await cheminsProposes(page)) {
      const [, , a, b] = chemin.split("/");
      const reponse = await request.get(`/comparer/${b}/${a}`, { maxRedirects: 0 });
      expect(reponse.status(), chemin).toBe(301);
      expect(reponse.headers()["location"], chemin).toBe(chemin);
    }
  });

  test("une paire sans page répond 404, dans les deux ordres", async ({ page, request }) => {
    await page.goto("/comparer");
    const absent = await page.locator(".absents .noms a").first().getAttribute("href");
    const comparable = await page.locator(".choix").first().getAttribute("value");
    const slug = absent!.replace("/candidats/", "");
    for (const chemin of [`/comparer/${slug}/${comparable}`, `/comparer/${comparable}/${slug}`]) {
      expect((await request.get(chemin, { maxRedirects: 0 })).status(), chemin).toBe(404);
    }
    expect((await request.get("/comparer/personne/inconnue")).status()).toBe(404);
  });

  test("une page est en noindex si et seulement si elle est absente du sitemap", async ({
    page,
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    let indexees = 0;
    for (const chemin of await cheminsProposes(page)) {
      const html = await (await request.get(chemin)).text();
      const horsIndex = /<meta name="robots" content="noindex/.test(html);
      const dansSitemap = sitemap.includes(`<loc>${SITE}${chemin}</loc>`);
      expect(dansSitemap, chemin).toBe(!horsIndex);
      if (dansSitemap) indexees += 1;
    }
    expect(indexees).toBeGreaterThan(0);
    expect(sitemap).toContain(`<loc>${SITE}/comparer</loc>`);
  });
});

test.describe("/comparer à 375 px", () => {
  test("aucun défilement horizontal", async ({ page }) => {
    const [chemin] = await cheminsProposes(page);
    for (const adresse of ["/comparer", chemin!]) {
      await page.goto(adresse);
      const debord = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(debord, adresse).toBe(0);
    }
  });

  test("le sélecteur s'ouvre au clavier, et Tab mène à la rangée ouverte", async ({ page }) => {
    await page.goto("/comparer");
    await expect(page.locator(".rangee:visible")).toHaveCount(0);

    await page.locator(".choix").first().focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".rangee:visible")).toHaveCount(1);

    const coche = await page.locator(".choix:checked").getAttribute("value");
    await page.keyboard.press("Tab");
    const cible = await page.evaluate(() => document.activeElement?.getAttribute("href") ?? "");
    expect(cible).toMatch(/^\/comparer\/[a-z-]+\/[a-z-]+$/);
    expect(cible.split("/")).toContain(coche);
  });
});

test.describe("navigation à 1024 px", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("la barre tient ses liens sans déborder ni chevaucher l'action", async ({ page }) => {
    await page.goto("/comparer");
    const debord = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(debord).toBe(0);

    await expect(page.locator(".nav-large .nav-lien", { hasText: "Comparer" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const boites = await page
      .locator(".nav-large .nav-lien")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().right));
    const action = await page.locator(".entete-action").boundingBox();
    expect(Math.max(...boites)).toBeLessThan(action!.x);
  });
});
