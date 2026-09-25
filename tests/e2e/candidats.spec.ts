/**
 * La liste des candidats et leurs fiches : ordre, tag, aperçu, programme.
 *
 * CE QUE CE TEST PROTÈGE.
 *
 *   1. L'ORDRE ALPHABÉTIQUE, règle publiée : ni l'étape de candidature, ni le
 *      nombre de propositions, ni la couverture ne doivent le déranger.
 *   2. LE TAG, présent pour chaque candidat, avec son étape lisible par un
 *      lecteur d'écran (« Étape 2 sur 4 »).
 *   3. L'APERÇU, qui doit s'ouvrir au clavier ET sans JavaScript : son contenu
 *      est dans le HTML servi, c'est ce que lisent les robots.
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

  test("ouvre l'aperçu du programme au clavier", async ({ page }) => {
    await page.goto("/candidats");
    const apercu = page.locator("details.apercu").first();
    const resume = apercu.locator("summary");
    await resume.focus();
    await page.keyboard.press("Enter");
    await expect(apercu).toHaveAttribute("open", "");
    await expect(apercu.locator(".vers-fiche a")).toBeVisible();
  });
});

test.describe("/candidats sans JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("sert l'aperçu du programme dans le HTML, et il s'ouvre", async ({ page }) => {
    await page.goto("/candidats");
    const apercu = page.locator("details.apercu").first();
    await apercu.locator("summary").click();
    await expect(apercu.locator(".etat")).toBeVisible();
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

  test("conserve les ancres des affirmations, que les pages de thème ciblent", async ({ page }) => {
    await page.goto("/candidats/jean-luc-melenchon#retraites-age-legal-60");
    await expect(page.locator("article#retraites-age-legal-60")).toBeVisible();
  });
});
