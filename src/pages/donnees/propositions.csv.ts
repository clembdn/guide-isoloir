/**
 * Propositions de programme, une ligne par proposition publiée.
 *
 * HORS SCORE. Ces lignes décrivent ce que chaque candidat, ou son parti,
 * propose ; aucune n'entre dans le calcul du test. Elles sont exportées à part
 * des positions pour qu'un réutilisateur ne puisse pas les confondre.
 */
import type { APIRoute } from "astro";
import { DONNEES_OUVERTES } from "../../lib/fiches";
import { versCsv } from "../../lib/csv";

export const GET: APIRoute = () => {
  const { acteurs, propositions, sourcesPositions } = DONNEES_OUVERTES;
  const acteurParId = new Map(acteurs.map((acteur) => [acteur.id, acteur]));
  const sourceParId = new Map(sourcesPositions.map((source) => [source.id, source]));

  const lignes = propositions.map((proposition) => {
    const sources = proposition.sourceIds.map((id) => sourceParId.get(id)!);
    return [
      proposition.id,
      proposition.actorId,
      acteurParId.get(proposition.actorId)!.name,
      proposition.domaine,
      proposition.portee,
      proposition.intitule,
      proposition.citation,
      proposition.nature,
      proposition.precisions ?? null,
      sources.map((source) => source.url).join(" | "),
      sources.map((source) => source.dateDeclaration).join(" | "),
      proposition.updatedAt,
    ];
  });

  const csv = versCsv(
    [
      "proposition_id",
      "acteur_id",
      "acteur",
      "domaine",
      "portee",
      "intitule",
      "citation",
      "nature",
      "precisions",
      "sources_urls",
      "sources_dates",
      "mis_a_jour",
    ],
    lignes,
  );

  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
};
