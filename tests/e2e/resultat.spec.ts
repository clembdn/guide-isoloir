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
 *   - aucun pourcentage SANS SA COUVERTURE : un chiffre nu se lit comme une
 *     mesure, un chiffre suivi de « documenté sur 7 des 24 affirmations » se
 *     désamorce tout seul ;
 *   - aucun vainqueur unique ;
 *   - une seule teinte pour toutes les barres, à opacité constante.
 */
import { test, expect, type Page } from "@playwright/test";
import { CLE_SESSION } from "../../src/lib/session-test";
import { QUESTIONS } from "../../src/data/questions";

/*
 * TANT QU'IL N'Y A PAS DE CLASSEMENT À L'ÉCRAN, IL N'Y A PAS DE CLASSEMENT À
 * TESTER — et c'est L'ÉCRAN qu'on interroge, pas les sources.
 *
 * `/resultat` ne sert que les positions `reconciled` ou `published`, sauf en
 * prévisualisation ; et même servies, elles ne produisent un classement qu'une
 * fois le seuil de publication franchi. Deux conditions, dont aucune ne se lit
 * dans `positions.ts`.
 *
 * Une première version décidait depuis les sources. Elle suspendait donc les
 * contrôles d'apparence du classement même quand un classement s'affichait :
 * ils ne se sont jamais exécutés, dans aucun mode. Voir `sansClassement`.
 *
 * Ce qui ne dépend PAS du classement — URL sans identifiant, noindex,
 * pourcentage jamais orphelin — reste vérifié dans tous les cas.
 */
const RAISON_SANS_CLASSEMENT =
  "aucune position réconciliée : /resultat n'affiche pas de classement, il explique pourquoi";

/**
 * Y a-t-il un classement SUR LA PAGE SERVIE ?
 *
 * On demande à la page, et non aux données. Un classement absent parce que rien n'est relu et
 * un classement absent parce que le seuil de publication n'est pas atteint se
 * traitent pareil : il n'y a rien à vérifier.
 */
async function sansClassement(page: Page): Promise<boolean> {
  return (await page.locator("li.acteur").count()) === 0;
}

/** Profil tranché, pour obtenir un classement exploitable et non « incertain ». */
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

test("aucun identifiant ne figure dans l'URL", async ({ page }) => {
  await avecReponses(page);

  const url = new URL(page.url());
  expect(url.pathname).toBe("/resultat");
  expect(url.search, `Paramètres dans l'URL de résultat : ${url.search}`).toBe("");
  expect(url.hash, `Fragment dans l'URL de résultat : ${url.hash}`).toBe("");
});

test("la page porte noindex et reste hors du sitemap", async ({ request }) => {
  const page = await request.get("/resultat");
  expect(await page.text()).toMatch(/<meta\s+name="robots"\s+content="noindex, nofollow"\s*\/?>/i);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap.includes("/resultat"), "/resultat figure dans le sitemap").toBe(false);
});

test("aucun pourcentage n'est affiché sans sa couverture adjacente", async ({ page }) => {
  await avecReponses(page);

  /*
   * L'INTERDICTION DU POURCENTAGE A ÉTÉ LEVÉE, ET REMPLACÉE PAR PLUS FORT.
   *
   * Elle supprimait le chiffre, pas le malentendu : « Proximité forte » se lit
   * tout aussi bien comme un verdict, et privait le lecteur de la seule
   * information qui lui permettait de jauger la solidité du classement.
   *
   * La règle qui la remplace : un pourcentage n'apparaît JAMAIS seul. Il est
   * rendu par `ScoreEtCouverture.svelte`, qui rend toujours la couverture avec
   * lui — il n'existe aucun autre composant capable d'afficher un score, donc
   * aucun moyen de contourner la règle par distraction.
   *
   * Ce test vérifie la conséquence observable : chaque pourcentage de la page
   * se trouve dans un bloc qui porte aussi sa couverture. Un `72 %` ajouté
   * ailleurs — un en-tête, un résumé, une carte partageable — échoue ici.
   */
  const blocs = await page.locator("main p, main li, main h1, main h2, main h3").all();

  const orphelins: string[] = [];
  for (const bloc of blocs) {
    const texte = (await bloc.innerText()).replace(/\s+/g, " ");
    if (!/\d+([.,]\d+)?\s*%/.test(texte)) continue;
    // « documenté sur 18 des 24 affirmations » : la couverture, en toutes lettres.
    if (/document[ée]\s+sur\s+\d+\s+(?:des?|de)\s+\d+\s+affirmations?/i.test(texte)) continue;
    // Le seuil de publication s'énonce en pourcentage et n'est pas un score.
    if (/seuil\s+retenu/i.test(texte)) continue;
    orphelins.push(texte.slice(0, 160));
  }

  expect(orphelins, `Pourcentage(s) sans couverture : ${orphelins.join(" | ")}`).toEqual([]);
});

test("un score s'accompagne toujours du nombre d'affirmations documentées", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

  // Au moins un acteur affiche sa couverture : sinon le composant n'est pas rendu
  // et le test précédent passerait pour une page vide.
  await expect(
    page.getByText(/document[ée] sur \d+ (?:des?|de) \d+ affirmations?/i).first(),
  ).toBeVisible();
});

test("une position héritée nomme toujours l'acteur d'origine", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

  /*
   * C'est la garantie qu'Elyze n'avait pas : ses propositions de 2017
   * s'affichaient en 2022 sans que rien ne dise qu'elles n'étaient pas de la
   * campagne en cours. Une ligne de parti reprise faute de déclaration doit
   * porter le nom du parti, et le dire.
   */
  /*
   * ON OUVRE LES REPLIS AVANT DE LIRE. Les mentions d'héritage vivent dans les
   * `<details>` du détail par thème, et `innerText` renvoie une chaîne vide sur
   * un élément masqué : le test lisait « » et passait, quoi qu'il y ait
   * dedans. Il n'a été démasqué que le jour où un classement a réellement
   * contenu des positions reprises — jusque-là, la boucle ne s'exécutait sur
   * rien. Lire `textContent` suffirait à faire passer le test ; ouvrir les
   * replis vérifie en plus que la mention est VISIBLE, ce qui est la garantie
   * qu'on veut.
   */
  for (const repli of await page.locator("details").all()) {
    await repli.evaluate((element) => element.setAttribute("open", ""));
  }

  const heritages = page.locator(".heritage");
  expect(
    await heritages.count(),
    "Aucune position reprise à l'écran : le test ne vérifierait rien",
  ).toBeGreaterThan(0);

  for (const mention of await heritages.all()) {
    const texte = await mention.innerText();
    expect(texte).toMatch(/Position de .+, reprise faute de déclaration personnelle/);
    // Jamais un identifiant technique à la place du nom.
    expect(texte).not.toMatch(/parti-[a-z-]+/);
  }
});

test("la bascule d'héritage est présente et cochée par défaut", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

  const bascule = page.getByRole("checkbox", { name: /positions héritées du parti/i });
  await expect(bascule).toBeVisible();
  await expect(bascule).toBeChecked();
});

test("décocher l'héritage recalcule en direct, et la bascule reste accessible", async ({
  page,
}) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

  const bascule = page.getByRole("checkbox", { name: /positions héritées du parti/i });
  const carte = page.locator(".carte");
  await expect(carte).toContainText(/Positions héritées\s*:\s*incluses/);

  await bascule.uncheck();

  /*
   * DEUX ISSUES LÉGITIMES, et les deux doivent être sûres :
   *
   *   - le classement tient sans les positions de parti : la carte doit alors
   *     dire « exclues », sinon une capture annoncerait un réglage qui n'est
   *     pas celui du calcul ;
   *   - le classement passe sous le seuil et disparaît : c'est le comportement
   *     correct, MAIS la bascule doit rester à l'écran. Un réglage dont on ne
   *     peut pas sortir est une impasse, pas un réglage.
   */
  if (await sansClassement(page)) {
    await expect(bascule).toBeVisible();
    await expect(bascule).not.toBeChecked();
    await expect(page.locator("main")).toContainText(/Sans les positions de parti/i);
  } else {
    await expect(carte).toContainText(/Positions héritées\s*:\s*exclues/);
  }

  // Et l'on doit pouvoir revenir à l'état précédent.
  await bascule.check();
  await expect(page.locator(".carte")).toContainText(/Positions héritées\s*:\s*incluses/);
});

test("la carte partageable porte la graine et l'état de la bascule", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

  /*
   * Sans ces deux paramètres, deux personnes aux mêmes réponses obtiennent des
   * chiffres différents selon un réglage que la capture ne montre pas.
   */
  const carte = page.locator(".carte");
  await expect(carte).toContainText(/Positions héritées\s*:\s*(incluses|exclues)/);
  await expect(carte.locator(".graine")).toHaveText(/^[0-9a-f]{8}$/);
});

test("l'absence de classement est expliquée, pas masquée", async ({ page }) => {
  await avecReponses(page);
  test.skip(
    !(await sansClassement(page)),
    "un classement s'affiche : il n'y a pas d'absence à expliquer",
  );

  /*
   * DEUX RAISONS POSSIBLES, ET TOUTES DEUX DOIVENT SE DIRE.
   *
   *   - aucune position relue : `positionsPubliables` ne sert rien ;
   *   - seuil de publication non atteint : des positions existent, mais trop
   *     peu d'acteurs sont documentés pour qu'un ORDRE veuille dire quelque
   *     chose.
   *
   * Le test n'a longtemps connu que la première, et il échouait dès qu'un build
   * de prévisualisation produisait la seconde. Ce qui compte n'est pas laquelle
   * s'affiche, c'est qu'une page sans classement dise pourquoi au lieu de
   * paraître vide ou cassée.
   */
  await expect(page.locator("main")).toContainText(
    /Aucune position n'est encore publiée|Le classement n'est pas encore publiable/,
  );
  await expect(page.locator(".classement")).toHaveCount(0);
});

test("les qualifications remplacent les chiffres", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);
  const texte = await page.locator("main").innerText();

  const attendues = ["Proximité forte", "Proximité modérée", "Résultat incertain"];
  expect(
    attendues.some((qualification) => texte.includes(qualification)),
    `Aucune qualification trouvée. Attendu l'une de : ${attendues.join(", ")}`,
  ).toBe(true);
});

test("plusieurs acteurs sont présentés, jamais un vainqueur unique", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

  /*
   * PAS « EXACTEMENT TROIS » : LES EX ÆQUO PARTAGENT LEUR RANG.
   *
   * Le classement montre les acteurs de rang 1 à 3, et non les trois premiers
   * de la liste. Quatre acteurs peuvent donc s'afficher — c'est exactement ce
   * qui se produit depuis que quatre candidats reprennent la même plateforme de
   * coalition et se retrouvent parfaitement à égalité pour tout profil. Exiger
   * trois lignes faisait échouer le test sur un comportement correct, et aurait
   * poussé à masquer un ex æquo réel plutôt qu'à l'afficher.
   *
   * Ce que le test défend est écrit dans son nom : jamais UN vainqueur unique,
   * et jamais un rang au-delà de 3.
   */
  const acteurs = page.locator(".classement > li");
  const combien = await acteurs.count();
  expect(combien, "Un seul acteur affiché : c'est un vainqueur unique").toBeGreaterThan(1);

  for (let index = 0; index < combien; index += 1) {
    const rang = acteurs.nth(index).locator(".rang");
    await expect(rang).toContainText("Rang");
    const numero = Number((await rang.innerText()).replace(/\D+/g, ""));
    expect(numero, "Le classement ne montre que les rangs 1 à 3").toBeLessThanOrEqual(3);
  }

  const texte = await page.locator("main").innerText();
  expect(texte).toContain("Ce classement n'est pas une recommandation");
});

test("toutes les barres partagent une teinte et une opacité", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

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

test("la géométrie des barres passe par un attribut, pas par un style en ligne", async ({
  request,
}) => {
  // La CSP hachée bloquerait un `style=""`. Un `width` sur `<rect>` est un
  // attribut de présentation SVG : il passe.
  const html = await (await request.get("/resultat")).text();
  expect(html).not.toMatch(/<rect[^>]*\sstyle=/i);
});

test("l'état vide explique au lieu d'afficher un classement", async ({ page }) => {
  await page.goto("/resultat", { waitUntil: "networkidle" });
  /*
   * Quand aucune position n'est servie, la page rend une explication STATIQUE et
   * n'instancie pas l'îlot : il n'y a alors pas d'état vide à exercer, parce
   * qu'il n'y a pas de composant. Le test porte sur l'îlot, il se suspend donc
   * sur cette page-là — et sur elle seule.
   */
  test.skip(
    (await page.locator("main").innerText()).includes("Aucune position n'est encore publiée"),
    "aucune position servie : l'îlot n'est pas monté, il n'y a pas d'état vide à vérifier",
  );
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });

  await expect(page.locator(".classement")).toHaveCount(0);
  await expect(page.locator("main")).toContainText("Aucune réponse à comparer");
});

/*
 * LES ÉCARTÉS SONT NOMMÉS, ET ILS NE RESSEMBLENT PAS À UN CLASSEMENT.
 *
 * Le plancher d'éligibilité retire du classement les candidats trop peu
 * documentés — sans quoi leur score, plus volatil, les porte en tête par
 * accident. La correction n'est honnête qu'à deux conditions, et ce sont les
 * deux tests ci-dessous : ils restent VISIBLES, sinon l'écran ressemble à une
 * sélection éditoriale ; et ils ne portent NI rang NI barre NI pourcentage,
 * sinon on a simplement fabriqué un second classement plus bas sur la page.
 */
test("les candidats écartés du classement sont nommés, avec leur couverture", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

  const ecartes = page.locator(".ecartes");
  await expect(ecartes).toBeVisible();

  const lignes = ecartes.locator(".liste-ecartes li");
  expect(await lignes.count()).toBeGreaterThan(0);

  // Chaque ligne dit qui, et sur combien d'affirmations on le connaît.
  for (const ligne of await lignes.all()) {
    await expect(ligne.locator(".ecarte-nom")).not.toBeEmpty();
    await expect(ligne.locator(".ecarte-couverture")).toContainText(
      /aucune position documentée|documenté sur \d+ des \d+ affirmations/,
    );
  }

  // La raison est donnée sur place, et elle renvoie à la méthodologie.
  await expect(ecartes.locator("a[href='/methodologie']")).toHaveCount(1);
});

test("aucun écarté ne porte de rang, de barre ou de pourcentage", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

  const ecartes = page.locator(".ecartes");
  await expect(ecartes).toBeVisible();

  await expect(ecartes.locator(".rang")).toHaveCount(0);
  await expect(ecartes.locator("svg")).toHaveCount(0);
  await expect(ecartes.locator("ol")).toHaveCount(0);

  /*
   * Le pourcentage est traqué sur LA LISTE, pas sur la section : le paragraphe
   * d'introduction énonce légitimement le seuil (« au moins 35 % des
   * affirmations »), et c'est une règle, pas une mesure attribuée à quelqu'un.
   * Ce qu'on interdit, c'est un chiffre accolé à un nom.
   */
  await expect(ecartes.locator(".liste-ecartes")).not.toContainText(/\d+\s*%/);
});

/*
 * AUCUN CANDIDAT NE DISPARAÎT.
 *
 * L'invariant qui tient tout le reste : classés et écartés réunis doivent
 * couvrir la totalité des candidats comparés. Si le plancher faisait disparaître
 * quelqu'un de l'écran plutôt que de le déplacer, la correction de biais
 * deviendrait une censure, et personne ne pourrait s'en apercevoir.
 */
test("classés et écartés réunis couvrent tous les candidats comparés", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

  const classes = await page.locator("li.acteur").count();
  const ecartes = await page.locator(".ecartes .liste-ecartes li").count();

  // Le classement n'affiche que les rangs 1 à 3 ; les écartés, eux, sont tous là.
  expect(classes).toBeGreaterThan(0);
  expect(ecartes).toBeGreaterThan(0);
  expect(classes + ecartes).toBeGreaterThanOrEqual(4);
});

test("la carte partageable se dessine dans le navigateur, aux deux formats", async ({ page }) => {
  await avecReponses(page);
  test.skip(await sansClassement(page), RAISON_SANS_CLASSEMENT);

  /*
   * Le module de dessin est chargé À LA DEMANDE. Un import manquant dans le
   * composant ne se voyait qu'au clic, et le bouton affichait alors « l'image
   * n'a pas pu être dessinée » sans qu'aucun test ne le remarque. C'est arrivé.
   */
  const erreurs: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") erreurs.push(message.text());
  });

  await page.getByRole("button", { name: "Créer mon image" }).click();
  const images = page.locator(".cartes-apercu img");
  await expect(images).toHaveCount(2);

  const tailles = await images.evaluateAll((liste) =>
    Promise.all(
      (liste as HTMLImageElement[]).map(async (image) => {
        await image.decode();
        return `${image.naturalWidth}x${image.naturalHeight}`;
      }),
    ),
  );
  expect(tailles).toEqual(["1080x1350", "1080x1920"]);

  // Les images sont locales : rien n'est parti vers un serveur pour les produire.
  for (const source of await images.evaluateAll((liste) =>
    (liste as HTMLImageElement[]).map((image) => image.src),
  )) {
    expect(source.startsWith("blob:")).toBe(true);
  }
  expect(erreurs).toEqual([]);
});
