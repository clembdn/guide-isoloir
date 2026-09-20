/**
 * Portraits de candidats et logos de partis.
 *
 * Trois choses se vérifient ici, et aucune n'est cosmétique.
 *
 *   - LE FICHIER EST SERVI PAR CE SITE. Une image chargée depuis Wikimedia
 *     ferait sortir une requête vers un tiers depuis la route la plus sensible
 *     du site, et révélerait au passage que quelqu'un consulte un résultat.
 *     `aucune-requete-tierce.spec.ts` couvre le domaine ; ici on vérifie que le
 *     chemin répond 200, c'est-à-dire que le fichier existe vraiment.
 *   - L'ABSENCE EST TRAITÉE. Un candidat sans photo libre, un parti sans logo
 *     libre : la ligne doit rester complète, avec des initiales, et non un
 *     cadre vide ou une image cassée.
 *   - LE CRÉDIT EXISTE. CC BY et CC BY-SA imposent de nommer l'auteur. Toute
 *     image servie doit donc être créditée sur `/credits-images`, faute de quoi
 *     elle est utilisée sans droit.
 *
 * Comme les autres contrôles d'apparence du classement, ces tests se suspendent
 * d'eux-mêmes tant qu'aucun classement ne s'affiche — et se réarment seuls.
 */
import { test, expect, type Page } from "@playwright/test";
import { CLE_SESSION } from "../../src/lib/session-test";
import { QUESTIONS } from "../../src/data/questions";

const RAISON_SANS_CLASSEMENT = "aucun classement affiché : il n'y a ni portrait ni logo à vérifier";

const PROFIL = Object.fromEntries(
  QUESTIONS.map((question, index) => [question.id, index % 2 === 0 ? 2 : -2]),
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

test("chaque acteur classé porte un portrait servi par ce site, ou ses initiales", async ({
  page,
  request,
}) => {
  await avecReponses(page);
  const acteurs = page.locator("li.acteur");
  const total = await acteurs.count();
  test.skip(total === 0, RAISON_SANS_CLASSEMENT);

  for (let i = 0; i < total; i += 1) {
    const acteur = acteurs.nth(i);
    const nom = (await acteur.locator("h3.nom").innerText()).trim();
    const portrait = acteur.locator("img.portrait");

    if ((await portrait.count()) === 0) {
      const repli = acteur.locator(".portrait-absent");
      await expect(repli, `${nom} n'a ni portrait ni initiales`).toHaveCount(1);
      expect(
        (await repli.innerText()).trim().length,
        `Les initiales de ${nom} sont vides : la ligne afficherait un cadre nu`,
      ).toBeGreaterThan(0);
      continue;
    }

    const src = await portrait.getAttribute("src");
    expect(src, `${nom} : portrait sans src`).toBeTruthy();
    expect(src, `${nom} : le portrait doit être servi sous /medias/`).toMatch(
      /^\/medias\/portraits\//,
    );
    expect(
      (await request.get(src!)).status(),
      `${nom} : le fichier ${src} est référencé mais absent de dist/`,
    ).toBe(200);

    /*
     * `alt=""` est le comportement ATTENDU, pas un oubli : le nom du candidat
     * est écrit juste à côté, et un `alt` qui le répéterait le ferait entendre
     * deux fois à un lecteur d'écran.
     */
    expect(await portrait.getAttribute("alt"), `${nom} : le portrait doit être décoratif`).toBe("");

    /* Sans dimensions, chaque photo pousse le classement vers le bas en arrivant. */
    expect(await portrait.getAttribute("width"), `${nom} : portrait sans width`).toBeTruthy();
    expect(await portrait.getAttribute("height"), `${nom} : portrait sans height`).toBeTruthy();
  }
});

test("les logos de parti sont servis par ce site, et jamais seuls", async ({ page, request }) => {
  await avecReponses(page);
  const acteurs = page.locator("li.acteur");
  const total = await acteurs.count();
  test.skip(total === 0, RAISON_SANS_CLASSEMENT);

  for (let i = 0; i < total; i += 1) {
    const acteur = acteurs.nth(i);
    const nom = (await acteur.locator("h3.nom").innerText()).trim();
    const logo = acteur.locator("img.logo");
    if ((await logo.count()) === 0) continue;

    const src = await logo.getAttribute("src");
    expect(src, `${nom} : le logo doit être servi sous /medias/`).toMatch(/^\/medias\/logos\//);
    expect(
      (await request.get(src!)).status(),
      `${nom} : le fichier ${src} est référencé mais absent de dist/`,
    ).toBe(200);
    expect(await logo.getAttribute("alt"), `${nom} : le logo doit être décoratif`).toBe("");

    /*
     * UN LOGO NE REMPLACE JAMAIS LE NOM DU PARTI. Un sigle seul n'est pas
     * lisible par tout le monde, et il ne l'est pas du tout par un lecteur
     * d'écran quand l'image est décorative.
     */
    const texteParti = (await acteur.locator("p.parti").innerText()).trim();
    expect(texteParti.length, `${nom} : le logo s'affiche sans le nom du parti`).toBeGreaterThan(0);
  }
});

test("toute image servie dans le classement est créditée sur /credits-images", async ({
  page,
  request,
}) => {
  await avecReponses(page);
  const acteurs = page.locator("li.acteur");
  const total = await acteurs.count();
  test.skip(total === 0, RAISON_SANS_CLASSEMENT);

  const credits = await (await request.get("/credits-images")).text();

  let verifiees = 0;
  for (let i = 0; i < total; i += 1) {
    const acteur = acteurs.nth(i);
    const nom = (await acteur.locator("h3.nom").innerText()).trim();

    if ((await acteur.locator("img.portrait").count()) > 0) {
      /*
       * On cherche le NOM, parce que c'est ce qu'un lecteur cherchera. Le
       * chemin servi ne figure pas sur la page de crédits, et c'est normal :
       * ce qui doit y être, c'est l'auteur, la licence et le fichier d'origine.
       */
      expect(
        credits.includes(nom),
        `Le portrait de ${nom} est servi mais son crédit est absent de /credits-images. ` +
          `CC BY et CC BY-SA imposent de nommer l'auteur : sans ce crédit, l'image est ` +
          `utilisée sans droit.`,
      ).toBe(true);
      verifiees += 1;
    }

    if ((await acteur.locator("img.logo").count()) > 0) {
      const parti = (await acteur.locator("p.parti").innerText()).trim();
      expect(
        credits.includes(parti),
        `Le logo de « ${parti} » est servi mais son crédit est absent de /credits-images.`,
      ).toBe(true);
      verifiees += 1;
    }
  }

  expect(
    verifiees,
    "Aucune image dans le classement : le test ne vérifierait rien",
  ).toBeGreaterThan(0);
});
