/**
 * Les thèmes : l'index et les pages « qui est pour, qui est contre ? ».
 *
 * CE QUE CE TEST PROTÈGE.
 *
 *   1. LA COMPLÉTUDE, SANS JAVASCRIPT. Chaque candidat en lice apparaît une
 *      fois, et une seule, par affirmation — dans une colonne ou parmi les
 *      visages sans position connue — dans le HTML servi. C'est ce que lit un
 *      robot d'IA, et c'est la règle de neutralité : ni oublié, ni compté deux
 *      fois.
 *   2. LA COULEUR N'EST JAMAIS SEULE. Chaque pastille est accompagnée d'un mot
 *      lisible par un lecteur d'écran.
 *   3. LE TABLEAU RÉCAPITULATIF a une ligne par candidat, et chaque cellule dit
 *      son sens en toutes lettres.
 *   4. AUCUN DÉFILEMENT HORIZONTAL à 375 px, la largeur de référence.
 *   5. UNE PAGE HORS TEST SOUS LE SEUIL reste hors de l'index.
 */
import { test, expect } from "@playwright/test";

test.describe("/themes sans JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("présente les thèmes du test en tuiles, puis les thèmes hors test", async ({ page }) => {
    await page.goto("/themes");
    await expect(page.locator(".bento > li")).toHaveCount(6);
    await expect(page.locator(".rangees > li")).toHaveCount(5);
    const liens = await page
      .locator(".tuile .nom a")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(new Set(liens).size).toBe(11);
  });

  test("nomme chaque candidat en lice une fois par affirmation", async ({ page }) => {
    await page.goto("/themes/travail-et-retraites");
    const plateaux = page.locator("section.plateau");
    await expect(plateaux).toHaveCount(4);

    const lignes = await page.locator(".recap tbody tr").count();
    expect(lignes).toBeGreaterThan(20);

    for (let i = 0; i < 4; i += 1) {
      const plateau = plateaux.nth(i);
      const id = await plateau.getAttribute("id");
      const cibles = await plateau
        .locator(".candidat a, .visages a")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      expect(cibles, id!).toHaveLength(lignes);
      expect(new Set(cibles).size, id!).toBe(lignes);
      for (const cible of cibles) expect(cible).toMatch(new RegExp(`^/candidats/[a-z-]+#${id}$`));
    }
  });

  test("écrit le sens de chaque position à côté de sa pastille", async ({ page }) => {
    await page.goto("/themes/travail-et-retraites");
    const plateau = page.locator("section.plateau").first();
    await expect(plateau.locator(".en-bref")).toContainText(/Pour/);
    await expect(plateau.locator(".colonne--pour .colonne-libelle")).toHaveText("Pour");
    await expect(plateau.locator(".colonne--contre .colonne-libelle")).toHaveText("Contre");

    const cellules = page.locator(".recap tbody td");
    const textes = await cellules.allTextContents();
    for (const texte of textes) {
      expect(texte.trim()).toMatch(
        /^(Pour|Contre|Plutôt pour|Plutôt contre|Ni pour ni contre|Pas de position connue)$/,
      );
    }
  });

  test("garde hors de l'index une page hors test sous le seuil", async ({ page }) => {
    await page.goto("/themes/famille-et-societe");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator(".plateau")).toHaveCount(0);
    await expect(page.locator(".encadre")).toContainText("Aucune question du test");
  });
});

test.describe("/themes à 375 px", () => {
  for (const chemin of [
    "/themes",
    "/themes/travail-et-retraites",
    "/themes/economie-et-salaires",
  ]) {
    test(`ne défile pas horizontalement : ${chemin}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(chemin);
      const largeur = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(largeur).toBeLessThanOrEqual(375);
    });
  }
});
