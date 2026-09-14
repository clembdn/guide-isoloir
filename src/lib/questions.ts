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
