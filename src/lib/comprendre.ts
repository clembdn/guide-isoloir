/**
 * Accès à la collection `/comprendre`.
 *
 * Un seul endroit décide de ce qui est publié. Les pages appellent
 * `articlesPublies()` et rien d'autre : impossible de servir un brouillon par
 * distraction depuis une page nouvelle.
 */
import { getCollection, type CollectionEntry } from "astro:content";

export type Article = CollectionEntry<"comprendre">;

/**
 * Articles réellement mis en ligne, dans l'ordre de lecture.
 *
 * Les brouillons sont exclus ici, et donc absents du site, du sitemap et de la
 * navigation. Ils restent dans le dépôt, versionnés et relisibles en revue.
 */
export async function articlesPublies(): Promise<Article[]> {
  const articles = await getCollection("comprendre", ({ data }) => data.relecture === "verifie");
  return articles.sort((a, b) => a.data.ordre - b.data.ordre || a.id.localeCompare(b.id));
}

/** Brouillons, pour les compter dans l'état du chantier. Jamais servis. */
export async function articlesEnBrouillon(): Promise<Article[]> {
  const articles = await getCollection("comprendre", ({ data }) => data.relecture === "brouillon");
  return articles.sort((a, b) => a.data.ordre - b.data.ordre || a.id.localeCompare(b.id));
}

/** Durée de lecture, arrondie à la minute, minimum une. */
export function minutesDeLecture(corps: string): number {
  const mots = corps.trim().split(/\s+/).length;
  // 200 mots par minute : lecture attentive sur téléphone, pas survol.
  return Math.max(1, Math.round(mots / 200));
}

/**
 * Les cinq teintes de rubrique, dans l'ordre de lecture des articles.
 *
 * Un article garde la même teinte partout : sur sa carte d'accueil et dans sa
 * page, où elle marque les titres et le sommaire. Elles ne touchent jamais un
 * contenu politique — voir DESIGN_SYSTEM.md §1.1.
 */
export const TEINTES_RUBRIQUE = [
  "t-violet",
  "t-indigo",
  "t-sarcelle",
  "t-cyan",
  "t-prune",
] as const;

export type TeinteRubrique = (typeof TEINTES_RUBRIQUE)[number];

/** Teinte d'un article, d'après sa place dans l'ordre de lecture. */
export function teinteArticle(index: number): TeinteRubrique {
  return TEINTES_RUBRIQUE[index % TEINTES_RUBRIQUE.length]!;
}
