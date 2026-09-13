/**
 * Sitemap écrit à la main plutôt que généré par une intégration.
 *
 * Raison : `/resultat` et `/test` doivent en être exclus, et une liste explicite
 * rend cette exclusion visible en revue plutôt que cachée dans une option de
 * configuration. Aucune dépendance supplémentaire.
 */
import type { APIRoute } from "astro";
import { SITE_URL } from "../lib/site";

type SitemapEntry = {
  path: string;
  lastmod: string;
};

/**
 * Pages indexables. Toute page ajoutée ici doit être indexable :
 *   - `/resultat` est exclu pour toujours (noindex, confidentialité) ;
 *   - `/test` est exclu tant qu'il est vide.
 */
const ENTRIES: readonly SitemapEntry[] = [
  { path: "/", lastmod: "2026-09-14" },
  { path: "/a-propos", lastmod: "2026-09-14" },
  { path: "/methodologie", lastmod: "2026-09-14" },
  { path: "/charte-editoriale", lastmod: "2026-09-14" },
  { path: "/corrections", lastmod: "2026-09-14" },
  { path: "/financement", lastmod: "2026-09-14" },
  { path: "/mentions-legales", lastmod: "2026-09-14" },
];

export const GET: APIRoute = () => {
  const urls = ENTRIES.map((entry) => {
    const loc = new URL(entry.path, SITE_URL).href;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
