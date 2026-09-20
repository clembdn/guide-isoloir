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

type SitemapEntry = {
  path: string;
  lastmod: string;
};

/**
 * Pages fixes indexables. Toute page ajoutée ici doit être indexable :
 *   - `/resultat` est exclu pour toujours (noindex, confidentialité) ;
 *   - `/test` est exclu tant qu'il est vide.
 */
const PAGES_FIXES: readonly SitemapEntry[] = [
  { path: "/", lastmod: "2026-09-14" },
  { path: "/comprendre", lastmod: "2026-09-14" },
  { path: "/a-propos", lastmod: "2026-09-14" },
  { path: "/methodologie", lastmod: "2026-09-14" },
  { path: "/charte-editoriale", lastmod: "2026-09-14" },
  { path: "/corrections", lastmod: "2026-09-14" },
  { path: "/financement", lastmod: "2026-09-14" },
  { path: "/mentions-legales", lastmod: "2026-09-14" },
  { path: "/credits-images", lastmod: "2026-09-20" },
];

export const GET: APIRoute = async () => {
  const articles = await articlesPublies();

  const entrees: SitemapEntry[] = [
    ...PAGES_FIXES,
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
