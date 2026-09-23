/**
 * Positions codées, une ligne par position publiée.
 *
 * C'est la table brute : un acteur peut y avoir plusieurs positions sur la même
 * affirmation, et les partis y figurent. Pour « ce que le test retient », voir
 * `positions-retenues.csv`.
 */
import type { APIRoute } from "astro";
import { DONNEES_OUVERTES } from "../../lib/fiches";
import { versCsv } from "../../lib/csv";

export const GET: APIRoute = () => {
  const { acteurs, questions, positions, sourcesPositions } = DONNEES_OUVERTES;
  const acteurParId = new Map(acteurs.map((acteur) => [acteur.id, acteur]));
  const questionParId = new Map(questions.map((question) => [question.id, question]));
  const sourceParId = new Map(sourcesPositions.map((source) => [source.id, source]));

  const lignes = positions.map((position) => {
    const sources = position.sourceIds.map((id) => sourceParId.get(id)!);
    const question = questionParId.get(position.questionId)!;
    return [
      position.id,
      position.actorId,
      acteurParId.get(position.actorId)!.name,
      question.theme,
      position.questionId,
      question.texte,
      position.value,
      position.provenance,
      position.confidence,
      position.adequation,
      position.citation,
      position.sourcePrimaire ?? null,
      position.rationale,
      sources.map((source) => source.url).join(" | "),
      sources.map((source) => source.dateDeclaration).join(" | "),
      position.updatedAt,
    ];
  });

  const csv = versCsv(
    [
      "position_id",
      "acteur_id",
      "acteur",
      "theme",
      "question_id",
      "affirmation",
      "valeur",
      "provenance",
      "confiance",
      "adequation",
      "citation",
      "source_primaire",
      "justification",
      "sources_urls",
      "sources_dates",
      "mis_a_jour",
    ],
    lignes,
  );

  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
};
