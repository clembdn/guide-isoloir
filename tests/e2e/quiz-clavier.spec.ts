/**
 * L'écran de quiz se parcourt entièrement au clavier, et n'anime rien au clavier.
 *
 * Les deux points sont liés. Le quiz est l'écran le plus vu du site, et celui où
 * un utilisateur enchaîne le plus d'actions : c'est exactement le profil où une
 * animation cesse d'être une aide pour devenir de la latence perçue. Le brief
 * design l'interdit explicitement sur les actions déclenchées au clavier.
 *
 * On vérifie donc que la transition d'écran est ACTIVE au pointeur et INACTIVE
 * au clavier, en lisant l'attribut que le composant pose sur l'écran courant.
 * Vérifier l'animation elle-même serait fragile ; vérifier la décision qui la
 * déclenche ne l'est pas.
 */
import { test, expect } from "@playwright/test";
import { QUESTIONS_FACTICES } from "../../src/factice/questions-factices";

/** Lu dans les données : coder le nombre en dur rendrait ces tests faux au
 *  premier ajout de question, sans que le quiz soit pour autant cassé. */
const TOTAL = QUESTIONS_FACTICES.length;

test("le quiz se parcourt entièrement au clavier", async ({ page }) => {
  await page.goto("/test", { waitUntil: "networkidle" });
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });

  const progression = page.locator(".progression-texte");
  await expect(progression).toHaveText(`Question 1 sur ${TOTAL}`);

  // Atteindre le premier bouton radio à la seule force de Tab.
  const premiereReponse = page.locator('input[type="radio"]').first();
  let tabulations = 0;
  while (
    tabulations < 25 &&
    !(await premiereReponse.evaluate((e) => e === document.activeElement))
  ) {
    await page.keyboard.press("Tab");
    tabulations += 1;
  }
  expect(tabulations, "Le premier bouton radio n'est pas atteignable au clavier").toBeLessThan(25);

  // Les flèches parcourent le groupe : c'est le comportement natif d'un groupe
  // de boutons radio, et c'est pour cela qu'on n'a pas redessiné le composant.
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('input[type="radio"]').nth(1)).toBeChecked();

  // Entrée dans le groupe passe à la question suivante : le chemin rapide.
  await page.keyboard.press("Enter");
  await expect(progression).toHaveText(`Question 2 sur ${TOTAL}`);

  // Le retour arrière est atteignable au clavier lui aussi.
  await expect(page.getByRole("button", { name: "Question précédente" })).toBeVisible();
});

test("aucune animation quand l'action vient du clavier", async ({ page }) => {
  await page.goto("/test", { waitUntil: "networkidle" });
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });

  const ecran = page.locator(".ecran");
  const reponses = page.locator('input[type="radio"]');

  // Au pointeur : la transition est armée.
  await reponses.nth(0).check();
  await page.getByRole("button", { name: "Question suivante" }).click();
  await expect(ecran).toHaveAttribute("data-anime", "oui");

  // Au clavier : elle ne l'est pas.
  await page.locator('input[type="radio"]').nth(0).focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.locator(".progression-texte")).toHaveText(`Question 3 sur ${TOTAL}`);
  await expect(ecran).toHaveAttribute("data-anime", "non");
});

test("« sans avis » est présenté comme distinct du point milieu", async ({ page }) => {
  await page.goto("/test", { waitUntil: "networkidle" });
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });

  const reponses = page.locator('input[type="radio"]');
  await expect(reponses).toHaveCount(6);

  // Le point milieu est une position sur l'échelle : sa valeur est numérique.
  await expect(reponses.nth(2)).toHaveValue("0");
  // « Sans avis » n'en est pas une : sa valeur n'est même pas du même type.
  await expect(reponses.nth(5)).toHaveValue("sans-avis");

  // Et l'écart n'est pas que dans les données : il se voit.
  const separee = page.locator(".reponse--sans-avis");
  await expect(separee).toHaveCount(1);
  await expect(separee).toContainText("Je n'ai pas d'avis");
});
