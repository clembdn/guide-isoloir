/**
 * Export complet, en JSON.
 *
 * Tout ce qu'il faut pour refaire le calcul ailleurs : les affirmations sans
 * `direction`, l'échelle, la chaîne de résolution, les acteurs, les
 * candidatures, les positions publiées avec leurs sources, et la vue « position
 * retenue » calculée par le même résolveur que le test.
 *
 * Aucune date de génération : le fichier ne change que si les données
 * changent, et `misAJour` est la date de la donnée la plus récente. Une date de
 * build ferait croire à une mise à jour à chaque déploiement.
 */
import type { APIRoute } from "astro";
import { DONNEES_MISES_A_JOUR, DONNEES_OUVERTES, positionsRetenues } from "../../lib/fiches";
import { ECHELLE } from "../../lib/echelle";
import { NIVEAUX_RESOLUTION } from "../../lib/moteur";
import { EDITOR_NAME, LICENCE_DONNEES, SITE_NAME, SITE_URL } from "../../lib/site";

export const GET: APIRoute = () => {
  const donnees = {
    titre: `${SITE_NAME} — positions des candidats à l'élection présidentielle de 2027`,
    editeur: EDITOR_NAME,
    site: SITE_URL,
    documentation: new URL("/donnees", SITE_URL).href,
    licence: LICENCE_DONNEES,
    misAJour: DONNEES_MISES_A_JOUR,
    avertissements: [
      "Les citations restent la propriété de leurs auteurs et sont reproduites au titre du droit de courte citation. La licence couvre le codage, pas les verbatims.",
      "reviewStatus « reconciled » signifie « publiable ». Le double codage à l'aveugle n'a pas encore eu lieu : voir la méthodologie.",
      "Une position reprise d'un parti ou d'une coalition (repriseDeId renseigné) n'est pas une déclaration du candidat.",
      "Une affirmation sans position retenue est inconnue, pas neutre : le test l'écarte du calcul.",
    ],
    echelle: ECHELLE,
    chaineDeResolution: NIVEAUX_RESOLUTION,
    ...DONNEES_OUVERTES,
    positionsRetenues: positionsRetenues(),
  };

  return new Response(JSON.stringify(donnees, null, 2) + "\n", {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
