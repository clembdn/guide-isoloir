/**
 * Position retenue pour chaque couple candidat/affirmation documenté.
 *
 * La table que le test compte, calculée par le même résolveur. Un couple
 * absent est une position inconnue : il n'est pas écrit, pour qu'aucune
 * cellule vide ne puisse être lue comme un zéro.
 */
import type { APIRoute } from "astro";
import { positionsRetenues } from "../../lib/fiches";
import { versCsv } from "../../lib/csv";

export const GET: APIRoute = () => {
  const csv = versCsv(
    [
      "candidat_id",
      "candidat",
      "theme",
      "question_id",
      "affirmation",
      "valeur",
      "position",
      "origine",
      "reprise_de_id",
      "reprise_de",
      "adequation",
      "confiance",
      "position_id",
    ],
    positionsRetenues().map((retenue) => [
      retenue.candidatId,
      retenue.candidatNom,
      retenue.theme,
      retenue.questionId,
      retenue.affirmation,
      retenue.valeur,
      retenue.valeurLibelle,
      retenue.origine,
      retenue.repriseDeId,
      retenue.repriseDeNom,
      retenue.adequation,
      retenue.confiance,
      retenue.positionId,
    ]),
  );

  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
};
