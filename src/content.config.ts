/**
 * Collections de contenu, validées par Zod au build.
 *
 * Un build casse si un article est mal formé. C'est le point : sur un sujet
 * YMYL, un article sans auteur, sans date de vérification ou sans source ne
 * doit pas pouvoir atteindre la production par distraction.
 *
 * Zod est fourni par Astro (`astro:content`) : aucune dépendance ajoutée.
 */
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const source = z.object({
  /** Intitulé lisible : « Code électoral, article L. 52-1 ». */
  titre: z.string().min(3),
  /** URL consultable. Une source non consultable n'est pas une source. */
  url: z.string().url(),
  /** Éditeur de la source : « Légifrance », « service-public.fr ». */
  editeur: z.string().min(2),
  /** Date de consultation, pour qu'un lien mort reste vérifiable. */
  consulteLe: z.string().regex(ISO_DATE, "Date attendue au format AAAA-MM-JJ"),
});

const comprendre = defineCollection({
  loader: glob({ base: "./src/content/comprendre", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      /** Titre H1 et balise <title>. Une page = une intention de recherche. */
      titre: z.string().min(10).max(80),
      /** Méta-description, rédigée à la main. */
      description: z.string().min(50).max(180),
      /** Question à laquelle l'article répond, en une phrase. */
      question: z.string().min(10),
      publieLe: z.string().regex(ISO_DATE, "Date attendue au format AAAA-MM-JJ"),
      misAJourLe: z.string().regex(ISO_DATE, "Date attendue au format AAAA-MM-JJ"),

      /**
       * État de relecture. SEUL `verifie` est construit et mis en ligne.
       *
       * `brouillon` permet de rédiger dans le dépôt, en revue, sans rien
       * publier. C'est la traduction technique de la règle de CLAUDE.md :
       * aucun contenu factuel généré par IA n'est publié sans vérification
       * humaine. Le brouillon existe, il est versionné, il n'est pas servi.
       */
      relecture: z.enum(["brouillon", "verifie"]),

      /**
       * Qui a vérifié les faits, et quand. Obligatoire dès que l'article est
       * marqué `verifie` : c'est le raffinement plus bas qui l'impose.
       */
      verifiePar: z.string().min(2).optional(),
      verifieLe: z.string().regex(ISO_DATE, "Date attendue au format AAAA-MM-JJ").optional(),

      /** Au moins une source par article. Sans source, pas de publication. */
      sources: z.array(source).min(1),

      /** Articles liés, par identifiant de fichier. */
      voirAussi: z.array(z.string()).default([]),

      /** Ordre d'affichage dans l'index, du plus élémentaire au plus précis. */
      ordre: z.number().int().min(0),
    })
    .refine((article) => article.misAJourLe >= article.publieLe, {
      message: "misAJourLe ne peut pas précéder publieLe",
      path: ["misAJourLe"],
    })
    .refine(
      (article) =>
        article.relecture === "brouillon" ||
        (article.verifiePar !== undefined && article.verifieLe !== undefined),
      {
        message:
          "Un article marqué `verifie` doit nommer qui a vérifié les faits (verifiePar) et quand (verifieLe).",
        path: ["verifiePar"],
      },
    ),
});

export const collections = { comprendre };
