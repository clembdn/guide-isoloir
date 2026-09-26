/**
 * La liste des candidats et leurs fiches : ordre, tag, cartes, programme.
 *
 * CE QUE CE TEST PROTÈGE.
 *
 *   1. L'ORDRE ALPHABÉTIQUE, règle publiée : ni l'étape de candidature, ni le
 *      nombre de propositions, ni la couverture ne doivent le déranger.
 *   2. LE TAG, présent pour chaque candidat, avec son étape lisible par un
 *      lecteur d'écran (« Étape 2 sur 4 »).
 *   3. LES CARTES : un seul lien par candidat, atteignable au clavier ; un
 *      portrait servi par ce site ou des initiales, jamais un cadre vide ; et
 *      le bilan des positions écrit en toutes lettres dans le HTML servi.
 *   4. LA SÉPARATION DES DEUX REGISTRES sur la fiche : le programme et les
 *      positions du test ont chacun leur section, et le programme dit qu'il
 *      n'entre pas dans le calcul.
 */
import { test, expect } from "@playwright/test";

test.describe("/candidats", () => {
  test("liste les candidats par ordre alphabétique de nom de famille, chacun avec son tag", async ({
    page,
  }) => {
    await page.goto("/candidats");
    const noms = await page.locator(".candidat .nom a").allTextContents();
    expect(noms.length).toBeGreaterThan(20);

    const collator = new Intl.Collator("fr", { sensitivity: "base" });
    /*
     * La clé de tri est saisie à la main dans les données ; ici, on vérifie
     * seulement que l'ordre affiché suit le nom de famille, dernier mot du nom
     * sauf particule. Deux cas du jeu réel suffisent à couvrir la règle.
     */
    const cle = (nom: string) =>
      nom.includes("Le Pen") ? "Le Pen" : nom.split(" ").slice(1).join(" ");
    const tries = [...noms].sort((a, b) => collator.compare(cle(a), cle(b)));
    expect(noms).toEqual(tries);

    const tags = page.locator(".candidat .etape");
    await expect(tags).toHaveCount(noms.length);
    await expect(tags.first()).toContainText(/Étape \d sur 4/);
  });

  test("fait de chaque carte un seul lien vers la fiche, au clavier", async ({ page }) => {
    await page.goto("/candidats");
    const carte = page.locator(".trombinoscope > li").first();
    const lien = carte.locator(".nom a");
    await expect(carte.locator("a")).toHaveCount(1);
    const cible = await lien.getAttribute("href");
    await lien.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${cible}$`));
  });
});

test.describe("/candidats sans JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("donne à chaque candidat un portrait ou ses initiales, et son bilan en toutes lettres", async ({
    page,
    request,
  }) => {
    await page.goto("/candidats");
    const cartes = page.locator(".trombinoscope > li");
    const total = await cartes.count();
    expect(total).toBeGreaterThan(20);
    for (let i = 0; i < total; i += 1) {
      const carte = cartes.nth(i);
      const nom = (await carte.locator(".nom").innerText()).trim();
      const photo = carte.locator("img.portrait");
      if ((await photo.count()) === 0) {
        await expect(carte.locator(".portrait-absent"), nom).not.toBeEmpty();
      } else {
        const src = await photo.getAttribute("src");
        expect(src, nom).toMatch(/^\/medias\/portraits\//);
        expect((await request.get(src!)).status(), nom).toBe(200);
      }
      await expect(carte, nom).toContainText(/\d+ pour, \d+ contre.*\d+ sans position connue/);
    }
  });
});

test.describe("fiche candidat", () => {
  test("sépare le programme des positions du test, et le dit", async ({ page }) => {
    await page.goto("/candidats/marine-tondelier");
    await expect(page.locator("h2#programme")).toHaveText("Son programme");
    await expect(page.locator("h2#positions")).toHaveText("Ses positions sur le test");
    await expect(page.locator("section:has(> h2#programme) .rappel").first()).toContainText(
      "n'entrent pas dans le calcul du test",
    );
    await expect(page.locator(".proposition").first()).toBeVisible();
    await expect(page.locator(".etapes [aria-current='step']")).toHaveCount(1);
  });

  test("nomme le parti quand une proposition vient de lui", async ({ page }) => {
    await page.goto("/candidats/marine-le-pen");
    await expect(page.locator(".proposition .origine").first()).toContainText(
      "Rassemblement national",
    );
    await expect(page.locator(".reserve-candidature")).toContainText("cassation");
  });

  test("garde une fiche lisible quand rien n'est documenté", async ({ page }) => {
    await page.goto("/candidats/francis-lalanne");
    await expect(page.locator("h1")).toHaveText("Francis Lalanne");
    await expect(page.locator("section:has(> h2#programme)")).toContainText("Aucune proposition");
    await expect(page.locator("section:has(> h2#positions)")).toContainText("Aucune position");
  });

  test("ouvre la question qu'une page de thème vise par son ancre", async ({ page }) => {
    await page.goto("/candidats/jean-luc-melenchon#retraites-age-legal-60");
    const ligne = page.locator("details#retraites-age-legal-60");
    await expect(ligne).toHaveAttribute("open", "");
    await expect(ligne.locator(".sources a").first()).toBeVisible();
  });

  test("montre la question avant le verdict, et déplie le détail au clavier", async ({ page }) => {
    await page.goto("/candidats/jean-luc-melenchon");
    const ligne = page.locator("details.position").first();
    await expect(ligne).not.toHaveAttribute("open", "");
    await expect(ligne.locator("summary h4")).toBeVisible();
    await expect(ligne.locator(".position-verdict")).toContainText(/Pour|Contre|Ni pour ni contre/);
    await ligne.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(ligne).toHaveAttribute("open", "");
  });
});
