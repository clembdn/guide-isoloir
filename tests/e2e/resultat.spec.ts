/**
 * Écran de résultat : ce qu'il ne doit jamais faire.
 *
 * C'est la page la plus sensible du site. Elle affiche des opinions politiques
 * déduites des réponses de quelqu'un. Les contraintes vérifiées ici ne sont pas
 * des préférences de présentation :
 *
 *   - aucun identifiant dans l'URL, jamais. Une adresse de résultat se retrouve
 *     dans un historique, dans un presse-papier, dans un `Referer` ;
 *   - `noindex` dans le HTML statique, et absence du sitemap ;
 *   - aucun pourcentage : un chiffre se lit comme une mesure ;
 *   - aucun vainqueur unique ;
 *   - une seule teinte pour toutes les barres, à opacité constante.
 */
import { test, expect, type Page } from "@playwright/test";
import { CLE_SESSION } from "../../src/lib/session-test";
import { QUESTIONS_FACTICES } from "../../src/factice/questions-factices";

/*
 * TESTS EN SKIP : /resultat est retirée de `src/pages/` tant qu'elle tourne
 * sur src/factice/ (voir src/routes-desactivees/README.md). Ce fichier reste
 * écrit et à jour ; il se réactive de lui-même en retirant `.skip` une fois la
 * route remise en place avec de vraies données.
 */

/** Profil tranché, pour obtenir un classement exploitable et non « incertain ». */
const PROFIL = Object.fromEntries(
  QUESTIONS_FACTICES.map((question, index) => [question.id, index % 2 === 0 ? 2 : -2]),
);

async function avecReponses(page: Page) {
  await page.goto("/resultat");
  await page.evaluate(
    ([cle, profil]) =>
      sessionStorage.setItem(cle, JSON.stringify({ version: 1, reponses: profil })),
    [CLE_SESSION, PROFIL] as const,
  );
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });
}

test.skip("aucun identifiant ne figure dans l'URL", async ({ page }) => {
  await avecReponses(page);

  const url = new URL(page.url());
  expect(url.pathname).toBe("/resultat");
  expect(url.search, `Paramètres dans l'URL de résultat : ${url.search}`).toBe("");
  expect(url.hash, `Fragment dans l'URL de résultat : ${url.hash}`).toBe("");
});

test.skip("la page porte noindex et reste hors du sitemap", async ({ request }) => {
  const page = await request.get("/resultat");
  expect(await page.text()).toMatch(/<meta\s+name="robots"\s+content="noindex, nofollow"\s*\/?>/i);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap.includes("/resultat"), "/resultat figure dans le sitemap").toBe(false);
});

test.skip("aucun pourcentage n'est affiché", async ({ page }) => {
  await avecReponses(page);
  const texte = await page.locator("main").innerText();

  // Un score en pourcentage se lirait comme une mesure, alors que c'est une
  // moyenne d'accords sur un questionnaire que nous avons écrit nous-mêmes.
  const pourcentages = texte.match(/\d+([.,]\d+)?\s*%/g) ?? [];
  expect(pourcentages, `Pourcentage(s) affiché(s) : ${pourcentages.join(", ")}`).toEqual([]);
});

test.skip("les qualifications remplacent les chiffres", async ({ page }) => {
  await avecReponses(page);
  const texte = await page.locator("main").innerText();

  const attendues = ["Proximité forte", "Proximité modérée", "Résultat incertain"];
  expect(
    attendues.some((qualification) => texte.includes(qualification)),
    `Aucune qualification trouvée. Attendu l'une de : ${attendues.join(", ")}`,
  ).toBe(true);
});

test.skip("plusieurs acteurs sont présentés, jamais un vainqueur unique", async ({ page }) => {
  await avecReponses(page);

  const acteurs = page.locator(".classement > li");
  await expect(acteurs).toHaveCount(3, { timeout: 5000 });

  // Chacun porte un rang explicite : c'est ce qui rend les ex æquo lisibles.
  for (let index = 0; index < 3; index += 1) {
    await expect(acteurs.nth(index).locator(".rang")).toContainText("Rang");
  }

  const texte = await page.locator("main").innerText();
  expect(texte).toContain("Ce classement n'est pas une recommandation");
});

test.skip("toutes les barres partagent une teinte et une opacité", async ({ page }) => {
  await avecReponses(page);

  const remplissages = await page.locator(".barre-valeur").evaluateAll((barres) =>
    barres.map((barre) => {
      const style = getComputedStyle(barre);
      return `${style.fill}|${style.opacity}|${style.fillOpacity}`;
    }),
  );

  expect(remplissages.length).toBeGreaterThan(1);
  expect(
    new Set(remplissages).size,
    `Les barres ne partagent pas la même teinte ou opacité : ${[...new Set(remplissages)].join(" / ")}`,
  ).toBe(1);

  // Et leurs longueurs diffèrent : c'est la seule variable admise.
  const largeurs = await page
    .locator(".barre-valeur")
    .evaluateAll((barres) => barres.map((barre) => barre.getAttribute("width")));
  expect(new Set(largeurs).size, "Toutes les barres ont la même longueur").toBeGreaterThan(1);
});

test.skip("la géométrie des barres passe par un attribut, pas par un style en ligne", async ({
  request,
}) => {
  // La CSP hachée bloquerait un `style=""`. Un `width` sur `<rect>` est un
  // attribut de présentation SVG : il passe.
  const html = await (await request.get("/resultat")).text();
  expect(html).not.toMatch(/<rect[^>]*\sstyle=/i);
});

test.skip("l'état vide explique au lieu d'afficher un classement", async ({ page }) => {
  await page.goto("/resultat", { waitUntil: "networkidle" });
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });

  await expect(page.locator(".classement")).toHaveCount(0);
  await expect(page.locator("main")).toContainText("Aucune réponse à comparer");
});
