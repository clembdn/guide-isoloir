/**
 * `direction` ne doit jamais atteindre le navigateur.
 *
 * Ce champ indique de quel côté de l'axe d'un thème se place un accord. Il sert
 * à UN SEUL usage : vérifier, dans l'audit, qu'un thème ne pose pas toutes ses
 * affirmations dans le même sens — ce qui produirait un biais d'acquiescement.
 *
 * Le montrer amorcerait la réponse : indiquer à quelqu'un qu'approuver le place
 * « du côté + » transforme une affirmation en question orientée.
 *
 * ON VÉRIFIE DEUX SURFACES, pas une. Le tenir hors du HTML ne suffit pas : un
 * îlot qui importerait le module de questions embarquerait le champ dans son
 * bundle, lisible par quiconque ouvre les outils de développement pendant qu'il
 * répond. Les pages projettent donc les questions côté serveur.
 */
import { test, expect } from "@playwright/test";

const ROUTES = ["/test", "/resultat"] as const;

/*
 * TESTS EN SKIP : les deux routes ci-dessus sont retirées de `src/pages/` tant
 * qu'elles tournent sur src/factice/ (voir src/routes-desactivees/README.md).
 * Ce fichier reste écrit et à jour ; il se réactive de lui-même en retirant
 * `.skip` une fois les routes remises en place avec de vraies données.
 */

/** Formes sous lesquelles le champ pourrait apparaître une fois sérialisé. */
const EMPREINTES = ["direction", "&quot;direction&quot;", "\\u0022direction\\u0022"] as const;

for (const route of ROUTES) {
  test.skip(`${route} ne rend jamais le champ direction dans son HTML`, async ({ request }) => {
    const reponse = await request.get(route);
    expect(reponse.status()).toBe(200);
    const html = await reponse.text();

    for (const empreinte of EMPREINTES) {
      expect(
        html.includes(empreinte),
        `« ${empreinte} » apparaît dans le HTML de ${route}. Le sens d'une affirmation ne doit ` +
          `jamais être révélé à l'électeur : il amorcerait la réponse.`,
      ).toBe(false);
    }
  });
}

test.skip("le champ direction n'est pas non plus embarqué dans le JavaScript servi", async ({
  page,
  request,
}) => {
  const scripts: string[] = [];
  page.on("response", (reponse) => {
    if (/\.js(\?|$)/.test(reponse.url())) scripts.push(reponse.url());
  });

  await page.goto("/test", { waitUntil: "networkidle" });
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });

  expect(scripts.length, "Aucun script chargé : le test ne vérifierait rien").toBeGreaterThan(0);

  for (const url of scripts) {
    const corps = await (await request.get(url)).text();
    expect(
      corps.includes("direction"),
      `Le bundle ${url} contient le champ direction. Il doit rester côté serveur, ` +
        `projeté hors des propriétés passées à l'îlot.`,
    ).toBe(false);
  }
});
