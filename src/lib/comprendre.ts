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
