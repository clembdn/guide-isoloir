/**
 * Schéma des questions, validé au build.
 *
 * Un questionnaire mal formé ne doit pas pouvoir atteindre la production : sur
 * un sujet YMYL, une question sans thème fausse la normalisation, et une
 * infobulle sans source est une affirmation non sourcée présentée comme une
 * explication neutre.
 *
 * Zod vient d'Astro, qui en dépend déjà — aucune dépendance ajoutée. On importe
 * `zod` directement plutôt que `astro:content` parce que ce schéma doit servir à
 * trois endroits : le build Astro, Vitest, et `scripts/audit.mjs`, dont deux ne
 * connaissent pas le module virtuel d'Astro. Si Astro cessait un jour de fournir
 * zod, le correctif serait de l'ajouter aux devDependencies, pas de dupliquer le
 * schéma.
 */
import { z } from "zod";

/**
 * Sens de l'affirmation sur l'axe du thème.
 *
 * SERT UNIQUEMENT À L'AUDIT D'ÉQUILIBRE, et ne doit JAMAIS être rendu.
 * Un questionnaire dont toutes les affirmations vont dans le même sens souffre
 * d'un biais d'acquiescement : on répond « d'accord » par défaut. L'audit
 * vérifie donc que chaque thème mélange les deux sens.
 *
 * L'afficher amorcerait la réponse en indiquant à l'électeur de quel « côté »
 * il se place en approuvant. `tests/e2e/direction-jamais-rendue.spec.ts` échoue
 * si la valeur apparaît dans le HTML servi.
 */
export const DirectionSchema = z.union([z.literal(-1), z.literal(1)]);

export const QuestionSchema = z
  .object({
    id: z.string().min(3),
    theme: z.string().min(2),
    /** L'affirmation soumise à l'électeur. Aucun terme connoté. */
    texte: z.string().min(10).max(240),
    direction: DirectionSchema,
    /** Explication d'un terme, affichée à la demande. Jamais un argument. */
    infobulle: z.string().min(10).max(400),
    /** Source de l'infobulle. Une explication non sourcée n'est pas neutre. */
    infobulleSourceId: z.string().min(3),
    /** Incrémentée dès que le texte change : un score ancien ne se compare pas. */
    version: z.number().int().min(1),
    ordre: z.number().int().min(0),
  })
  .strict();

export type Question = z.infer<typeof QuestionSchema>;

/**
 * Valide un jeu de questions, ou lève.
 *
 * Lève plutôt que de rendre un résultat : appelée au build, elle doit
 * interrompre. Les identifiants doivent être uniques, sinon deux questions se
 * masqueraient dans le stockage de session et dans le calcul.
 */
export function validerQuestions(brut: unknown): Question[] {
  const questions = z.array(QuestionSchema).min(1).parse(brut);

  const vus = new Set<string>();
  for (const question of questions) {
    if (vus.has(question.id)) {
      throw new Error(`Question en double : ${question.id}`);
    }
    vus.add(question.id);
  }

  return questions;
}

/**
 * Source d'une infobulle.
 *
 * Séparée des sources de POSITIONS, et pas par commodité : une infobulle définit
 * un terme et doit venir d'une publication de référence — administration,
 * institution, statistique publique. Les positions des candidats, elles,
 * viendront de la presse et des programmes. Mélanger les deux reviendrait à
 * sourcer une définition par un article d'opinion.
 *
 * `url` est obligatoire et doit être une URL. Une infobulle sans source
 * consultable est une affirmation présentée comme une explication neutre.
 */
export const SourceInfobulleSchema = z
  .object({
    id: z.string().min(3),
    /** Intitulé exact de la page, pour la retrouver si le lien meurt. */
    titre: z.string().min(3),
    /** Éditeur : « Service Public (DILA) », « Insee », « RTE ». */
    editeur: z.string().min(2),
    url: z.string().url(),
  })
  .strict();

export type SourceInfobulle = z.infer<typeof SourceInfobulleSchema>;

/** Même forme, `url` non contrainte : sert à faire l'inventaire de ce qui manque. */
const SourceInfobulleBrouillonSchema = SourceInfobulleSchema.extend({ url: z.string() });

/**
 * Identifiants des sources dont l'`url` n'est pas encore une URL consultable.
 *
 * Renvoie une liste plutôt que de lever : c'est un inventaire, pas un contrôle.
 * Le contrôle est `validerSourcesInfobulles`, qui refuse la publication.
 */
export function sourcesInfobullesIncompletes(brut: unknown): string[] {
  const sources = z.array(SourceInfobulleBrouillonSchema).parse(brut);
  return sources
    .filter((source) => !z.string().url().safeParse(source.url).success)
    .map((source) => source.id);
}

/**
 * Valide les sources d'infobulles contre un questionnaire, ou lève.
 *
 * Lève plutôt que de rendre un résultat : appelée dans le frontmatter de la page
 * qui sert le questionnaire, elle doit interrompre le build. Trois fautes sont
 * distinguées, parce qu'elles ne se corrigent pas de la même façon :
 *
 *   - une infobulle pointe vers un identifiant inconnu : faute de frappe ou
 *     source renommée ;
 *   - une source n'est utilisée par aucune infobulle : reste d'un remaniement,
 *     ou signe qu'un `infobulleSourceId` a été changé sans mettre à jour la
 *     liste ;
 *   - une `url` manque : la source existe sur le papier, pas en ligne.
 *
 * L'ordre des contrôles est délibéré. Les liens cassés sont signalés avant les
 * URL manquantes : vingt-et-une URL vides masqueraient un identifiant erroné, et
 * c'est l'identifiant erroné qui fait servir la mauvaise définition.
 */
export function validerSourcesInfobulles(
  brut: unknown,
  questions: readonly Question[],
): SourceInfobulle[] {
  const sources = z.array(SourceInfobulleBrouillonSchema).min(1).parse(brut);

  const vus = new Set<string>();
  for (const source of sources) {
    if (vus.has(source.id)) {
      throw new Error(`Source d'infobulle en double : ${source.id}`);
    }
    vus.add(source.id);
  }

  const utilises = new Set(questions.map((question) => question.infobulleSourceId));

  const inconnus = [...utilises].filter((id) => !vus.has(id)).sort();
  if (inconnus.length > 0) {
    throw new Error(`Infobulle sans source correspondante : ${inconnus.join(", ")}`);
  }

  const orphelines = [...vus].filter((id) => !utilises.has(id)).sort();
  if (orphelines.length > 0) {
    throw new Error(`Source d'infobulle utilisée par aucune question : ${orphelines.join(", ")}`);
  }

  const sansUrl = sourcesInfobullesIncompletes(sources);
  if (sansUrl.length > 0) {
    throw new Error(
      `${sansUrl.length} source(s) d'infobulle sans URL consultable : ${sansUrl.join(", ")}`,
    );
  }

  return z.array(SourceInfobulleSchema).parse(sources);
}
