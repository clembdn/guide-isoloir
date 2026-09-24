/**
 * Sitemap écrit à la main plutôt que généré par une intégration.
 *
 * Raison : `/resultat` et `/test` doivent en être exclus, et une liste explicite
 * rend cette exclusion visible en revue plutôt que cachée dans une option de
 * configuration. Aucune dépendance supplémentaire.
 *
 * Les articles de /comprendre, eux, sont lus dans la collection : seuls les
 * articles relus y figurent, et un brouillon ne peut pas s'y glisser.
 */
import type { APIRoute } from "astro";
import { SITE_URL } from "../lib/site";
import { articlesPublies } from "../lib/comprendre";
import { DONNEES_MISES_A_JOUR, fiches, pagesThemes } from "../lib/fiches";
import { MEDIAS_RELEVES_LE } from "../data/medias";
import { MISES_A_JOUR } from "../lib/mises-a-jour";

type SitemapEntry = {
  path: string;
  lastmod: string;
};

/**
 * Pages fixes indexables. Leur date vient de `MISES_A_JOUR`, la constante que
 * chaque page affiche elle-même : elle ne peut plus différer de la page.
 *
 *   - `/resultat` est exclu pour toujours (noindex, confidentialité) ;
 *   - `/test` est exclu : il porte un noindex, c'est un outil et non une page à
 *     lire. L'intention « quel candidat me correspond » est portée par
 *     l'accueil, qui y mène.
 *
 * Les pages GÉNÉRÉES (fiches, thèmes, données) ne figurent pas ici : leur liste
 * et leur date se lisent dans les données, plus bas. Écrites à la main, elles
 * seraient fausses le jour où une position est ajoutée.
 */
const PAGES_FIXES: readonly SitemapEntry[] = [
  ...Object.entries(MISES_A_JOUR).map(([path, lastmod]) => ({ path, lastmod })),
  { path: "/credits-images", lastmod: MEDIAS_RELEVES_LE },
];

export const GET: APIRoute = async () => {
  const articles = await articlesPublies();

  const toutesFiches = fiches();
  const themes = pagesThemes();
  const plusRecente = (dates: readonly string[]) => dates.reduce((a, b) => (a > b ? a : b));

  const entrees: SitemapEntry[] = [
    ...PAGES_FIXES,
    { path: "/candidats", lastmod: plusRecente(toutesFiches.map((fiche) => fiche.misAJour)) },
    ...toutesFiches.map((fiche) => ({
      path: `/candidats/${fiche.acteur.slug}`,
      lastmod: fiche.misAJour,
    })),
    { path: "/themes", lastmod: plusRecente(themes.map((theme) => theme.misAJour)) },
    ...themes.map((theme) => ({ path: `/themes/${theme.slug}`, lastmod: theme.misAJour })),
    { path: "/donnees", lastmod: DONNEES_MISES_A_JOUR },
    ...articles.map((article) => ({
      path: `/comprendre/${article.id}`,
      lastmod: article.data.misAJourLe,
    })),
  ];

  const urls = entrees
    .map((entree) => {
      const loc = new URL(entree.path, SITE_URL).href;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${entree.lastmod}</lastmod>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
