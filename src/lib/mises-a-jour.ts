/**
 * Date de dernière mise à jour des pages fixes, en un seul endroit.
 *
 * Chaque page l'affiche (« Mis à jour le… ») et le sitemap la publie en
 * `lastmod`. Tant que les deux étaient écrites à la main, chacune de son côté,
 * elles ont dérivé : le 24 septembre 2026, `/a-propos` affichait le 23 et le
 * sitemap annonçait le 14. Un moteur qui lit une date fausse ne revient pas
 * explorer une page qui a changé.
 *
 * Les pages générées (fiches, thèmes, données, articles) ne figurent pas ici :
 * leur date se lit dans les données.
 *
 * Changer le contenu d'une de ces pages, c'est changer sa date ICI.
 */
export const MISES_A_JOUR = {
  "/": "2026-09-24",
  "/comprendre": "2026-09-14",
  "/a-propos": "2026-09-23",
  "/methodologie": "2026-09-21",
  "/charte-editoriale": "2026-09-14",
  "/corrections": "2026-09-14",
  "/financement": "2026-09-14",
  "/mentions-legales": "2026-09-14",
} as const satisfies Record<string, string>;
