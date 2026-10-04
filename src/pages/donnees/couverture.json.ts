/**
 * Couverture des données, en JSON.
 *
 * Combien de couples candidat × affirmation le test documente, par candidat et
 * par thème, calculé par le moteur du test sur les positions publiées. C'est
 * aussi ce que lit `npm run couverture` pour tenir l'historique.
 *
 * Aucune date de génération, comme l'export complet : `misAJour` est la date
 * de la donnée la plus récente.
 */
import type { APIRoute } from "astro";
import { DONNEES_MISES_A_JOUR } from "../../lib/fiches";
import { couverturePubliee } from "../../lib/couverture";
import { LICENCE_DONNEES, SITE_NAME, SITE_URL } from "../../lib/site";

export const GET: APIRoute = () => {
  const donnees = {
    titre: `${SITE_NAME} — couverture des positions par candidat et par thème`,
    site: SITE_URL,
    documentation: new URL("/methodologie#etat-de-la-couverture", SITE_URL).href,
    licence: LICENCE_DONNEES,
    misAJour: DONNEES_MISES_A_JOUR,
    avertissements: [
      "Une couverture n'est pas une qualité. « documentees » compte les positions reprises d'un parti ou d'une coalition, qui ne sont pas des déclarations du candidat.",
      "« personnelles » compte les positions du candidat lui-même ; « solides », celles d'entre elles dont la source n'est pas jugée faible.",
      "Calculé comme si toutes les affirmations avaient reçu une réponse. Au test, la couverture se rapporte aux seules affirmations auxquelles vous avez répondu.",
      "« incertitudeForte » vaut vrai quand le test qualifierait le résultat d'incertain quelles que soient les réponses.",
    ],
    ...couverturePubliee(),
  };

  return new Response(JSON.stringify(donnees, null, 2) + "\n", {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
