/**
 * Aucune requête vers un domaine tiers depuis /test et /resultat.
 *
 * C'est la contrainte la plus importante du projet : un script tiers peut lire
 * la page où il s'exécute. Sur ces deux routes, cela exposerait des opinions
 * politiques, données sensibles au sens du RGPD.
 *
 * Ce test doit échouer si quelqu'un ajoute un analytics, une police distante,
 * un pixel, un outil de suivi d'erreurs ou une régie publicitaire. Il ne doit
 * jamais être neutralisé pour faire passer la CI.
 *
 * Il s'exécute contre le site construit et servi par `astro preview`, et non
 * contre le serveur de développement : c'est ce qui est déployé qui compte.
 */
import { test, expect } from "@playwright/test";

/** Routes soumises à l'interdiction absolue. */
const ROUTES_PROTEGEES = ["/test", "/resultat"] as const;

/** Hôtes considérés comme « nous ». Rien d'autre n'est toléré. */
const HOTES_AUTORISES = new Set(["127.0.0.1", "localhost", "::1"]);

/** Schémas qui ne sortent pas de la page et ne peuvent donc rien exfiltrer. */
const SCHEMAS_LOCAUX = new Set(["data:", "blob:", "about:", "javascript:", "mailto:", "tel:"]);

function estTiers(url: string): boolean {
  const valeur = url.trim();
  if (valeur === "" || valeur.startsWith("#")) return false;

  let parsed: URL;
  try {
    parsed = new URL(valeur);
  } catch {
    // Une URL relative est forcément servie par le même hôte.
    return false;
  }

  if (SCHEMAS_LOCAUX.has(parsed.protocol)) return false;

  return !HOTES_AUTORISES.has(parsed.hostname.replace(/^\[|\]$/g, ""));
}

/**
 * Attributs qui déclenchent réellement un chargement.
 *
 * `<a href>` est volontairement exclu : un lien vers une source officielle
 * n'émet aucune requête tant que personne ne clique, et la page de résultat
 * devra citer ses sources.
 */
function ressourcesDistantes(html: string): string[] {
  const trouvees: string[] = [];

  // Seuls les `rel` qui déclenchent un chargement comptent. `canonical` et
  // `alternate` sont des métadonnées : elles désignent le site de production,
  // c'est leur rôle, et elles ne chargent rien.
  const relsChargeants =
    /^(?:stylesheet|preload|modulepreload|prefetch|preconnect|dns-prefetch|icon|apple-touch-icon|mask-icon|manifest)$/i;

  const balisesLink = html.matchAll(/<link\b[^>]*>/gi);
  for (const balise of balisesLink) {
    const source = balise[0];
    const rel = /\brel\s*=\s*["']([^"']*)["']/i.exec(source)?.[1] ?? "";
    if (!rel.split(/\s+/).some((valeur) => relsChargeants.test(valeur))) continue;

    trouvees.push(/\bhref\s*=\s*["']([^"']*)["']/i.exec(source)?.[1] ?? "");
  }

  const attributsDeChargement = html.matchAll(
    /\b(?:src|data-src|srcset|imagesrcset|action|poster|formaction)\s*=\s*["']([^"']*)["']/gi,
  );
  for (const attribut of attributsDeChargement) {
    // `srcset` contient plusieurs URL séparées par des virgules.
    for (const candidat of (attribut[1] ?? "").split(",")) {
      trouvees.push(candidat.trim().split(/\s+/)[0] ?? "");
    }
  }

  const imports = html.matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)/gi);
  for (const imp of imports) {
    trouvees.push(imp[1] ?? "");
  }

  const urlsCss = html.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi);
  for (const urlCss of urlsCss) {
    trouvees.push(urlCss[1] ?? "");
  }

  return trouvees.filter(estTiers);
}

for (const route of ROUTES_PROTEGEES) {
  test(`${route} n'émet aucune requête vers un domaine tiers`, async ({ page }) => {
    const requetesTierces: string[] = [];

    // `request` capte tout ce que le navigateur tente de charger : scripts,
    // feuilles de style, polices, images, fetch, XHR, balises de suivi,
    // y compris les requêtes que la politique de sécurité finirait par bloquer.
    page.on("request", (request) => {
      if (estTiers(request.url())) {
        requetesTierces.push(`${request.resourceType()} ${request.url()}`);
      }
    });

    await page.goto(route, { waitUntil: "networkidle" });

    // Laisse une chance aux scripts différés de se déclencher.
    await page.waitForTimeout(1000);

    expect(
      requetesTierces,
      `Requête(s) vers un domaine tiers depuis ${route} :\n${requetesTierces.join("\n")}`,
    ).toEqual([]);
  });

  test(`${route} ne référence aucune ressource distante dans son HTML`, async ({ request }) => {
    // Deuxième filet : une ressource peut être déclarée sans être chargée
    // pendant le test (preconnect, dns-prefetch, preload conditionnel, iframe
    // différée). On inspecte donc aussi le HTML servi.
    const response = await request.get(route);
    expect(response.status()).toBe(200);

    const distantes = ressourcesDistantes(await response.text());

    expect(
      distantes,
      `Ressource(s) distante(s) déclarée(s) dans ${route} :\n${distantes.join("\n")}`,
    ).toEqual([]);
  });

  test(`${route} porte la directive noindex`, async ({ request }) => {
    // Corollaire direct : ces deux pages ne doivent pas apparaître dans un
    // moteur de recherche. La directive est dans le HTML statique, pas dans
    // robots.txt, pour qu'un robot puisse effectivement la lire.
    const response = await request.get(route);
    const html = await response.text();

    expect(html).toMatch(/<meta\s+name="robots"\s+content="noindex, nofollow"\s*\/?>/i);
  });
}

test("robots.txt laisse les moteurs de recherche explorer /resultat", async ({ request }) => {
  // Bloquer /resultat empêcherait les robots de lire son noindex : l'URL
  // resterait indexable, sans extrait. Voir CLAUDE.md, section SEO.
  //
  // Les robots de collecte pour entraînement, eux, ont bien un Disallow global :
  // le contrôle ne porte donc que sur les agents de recherche.
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);

  const groupes = analyserRobots(await response.text());

  for (const agent of ["*", "Googlebot", "Bingbot", "OAI-SearchBot", "Claude-SearchBot"]) {
    const bloquants = (groupes.get(agent.toLowerCase()) ?? []).filter((chemin) =>
      "/resultat".startsWith(chemin),
    );
    expect(
      bloquants,
      `robots.txt bloque /resultat pour ${agent} via ${bloquants.join(", ")}`,
    ).toEqual([]);
  }
});

/** Associe chaque user-agent à ses chemins interdits. */
function analyserRobots(texte: string): Map<string, string[]> {
  const groupes = new Map<string, string[]>();
  let agentsCourants: string[] = [];
  let attendDirectives = false;

  for (const ligneBrute of texte.split("\n")) {
    const ligne = ligneBrute.replace(/#.*$/, "").trim();
    if (ligne === "") continue;

    const agent = /^user-agent\s*:\s*(.+)$/i.exec(ligne);
    if (agent) {
      if (attendDirectives) {
        agentsCourants = [];
        attendDirectives = false;
      }
      agentsCourants.push((agent[1] ?? "").trim().toLowerCase());
      continue;
    }

    const disallow = /^disallow\s*:\s*(.*)$/i.exec(ligne);
    if (disallow) {
      attendDirectives = true;
      const chemin = (disallow[1] ?? "").trim();
      if (chemin === "") continue;
      for (const agentCourant of agentsCourants) {
        groupes.set(agentCourant, [...(groupes.get(agentCourant) ?? []), chemin]);
      }
      continue;
    }

    if (/^allow\s*:/i.test(ligne)) {
      attendDirectives = true;
    }
  }

  return groupes;
}
