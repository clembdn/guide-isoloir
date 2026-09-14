/**
 * Projection des questions vers les îlots.
 *
 * `direction` sert UNIQUEMENT à l'audit d'équilibre. Le révéler amorcerait la
 * réponse : indiquer de quel « côté » place un accord transforme une
 * affirmation en question orientée.
 *
 * Le tenir hors du HTML ne suffit pas — un îlot qui importerait le module de
 * questions embarquerait le champ dans son bundle, lisible par quiconque ouvre
 * les outils de développement pendant qu'il répond. Les pages `.astro`
 * projettent donc les questions dans leur frontmatter, côté serveur, et ne
 * passent aux îlots que ce qui s'affiche.
 *
 * `tests/e2e/direction-jamais-rendue.spec.ts` vérifie les deux : ni dans le
 * HTML servi, ni dans le JavaScript servi.
 */
import type { Question } from "./questions";

/** Ce qu'un îlot a le droit de connaître d'une question. */
export type QuestionAffichee = {
  id: string;
  theme: string;
  texte: string;
  infobulle: string;
};

export function projeter(questions: readonly Question[]): QuestionAffichee[] {
  return questions.map(({ id, theme, texte, infobulle }) => ({ id, theme, texte, infobulle }));
}
