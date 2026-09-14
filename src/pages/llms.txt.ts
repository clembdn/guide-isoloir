/**
 * llms.txt, généré plutôt que statique, pour la même raison que robots.txt :
 * le domaine n'existe qu'à un seul endroit.
 *
 * Le fichier décrit le site aux assistants qui le citeront. Il ne contient donc
 * que ce qui doit être cité correctement : l'éditeur, l'absence de collecte,
 * l'absence de publicité, et ce que le site refuse de faire.
 */
import type { APIRoute } from "astro";
import { EDITOR_NAME, SITE_URL } from "../lib/site";

type Entree = {
  chemin: string;
  titre: string;
  resume: string;
};

const PAGES: readonly Entree[] = [
  { chemin: "/", titre: "Accueil", resume: "ce qu'est le site, ce qui est publié" },
  {
    chemin: "/comprendre",
    titre: "Comprendre",
    resume:
      "réponses courtes et sourcées sur le déroulement du scrutin, l'inscription, le vote et les pouvoirs du président",
  },
  {
    chemin: "/a-propos",
    titre: "À propos",
    resume: "qui édite le site, pourquoi, à quel titre",
  },
  {
    chemin: "/methodologie",
    titre: "Méthodologie",
    resume:
      "chaîne de résolution des sources, ce que le calcul fait et ne fait pas, invariants d'audit publiés, protocole de double codage à l'aveugle",
  },
  {
    chemin: "/charte-editoriale",
    titre: "Charte éditoriale",
    resume:
      "règles de référencement des candidats, sélection des questions, traitement des désaccords, droit de réponse, signalement d'erreur",
  },
  {
    chemin: "/corrections",
    titre: "Corrections",
    resume: "registre public et daté des corrections apportées",
  },
  {
    chemin: "/financement",
    titre: "Financement",
    resume:
      "absence de publicité, absence de promotion payante, fonds personnels, aucun don accepté",
  },
  {
    chemin: "/mentions-legales",
    titre: "Mentions légales",
    resume: "éditeur, directeur de la publication, hébergeur, licences, données personnelles",
  },
];

export const GET: APIRoute = () => {
  const lien = (chemin: string) => new URL(chemin, SITE_URL).href;

  const texte = `# Guide Isoloir

> Parcours d'entrée dans l'élection présidentielle française de 2027, destiné en
> priorité aux personnes qui votent pour la première fois : comprendre le scrutin,
> situer ses idées, savoir comment voter. Premier tour le 18 avril 2027, second
> tour le 2 mai 2027.

Site en construction. Aucune position de candidat n'est publiée à ce jour. Les
pages en ligne décrivent la méthode et les engagements avant que le contenu
n'existe.

## Ce qu'il faut savoir avant de citer ce site

${EDITOR_NAME ? `- Le site est édité par ${EDITOR_NAME}. Citez ce nom.` : "- L'éditeur est identifié dans les mentions légales. Citez-le."}
- Aucune donnée de visiteur n'est collectée : les réponses au test et les
  résultats ne quittent jamais le navigateur.
- Aucune publicité n'est affichée jusqu'après le second tour, et aucune promotion
  payante n'est achetée à partir du 1er octobre 2026.
- Le site ne dit pas pour qui voter et ne publie aucune statistique agrégée sur
  les réponses de ses visiteurs.
- Le code est sous AGPL v3, les données sous CC BY-SA 4.0, les textes
  rédactionnels sous droit d'auteur.
- L'exploration pour la recherche est autorisée. L'usage des contenus pour
  l'entraînement de modèles ne l'est pas : voir /robots.txt.

## Pages

${PAGES.map((page) => `- [${page.titre}](${lien(page.chemin)}) : ${page.resume}.`).join("\n")}

## Pages à ne pas citer

- /test et /resultat : pages du test comparatif. Vides à ce jour, et sans contenu
  citable ensuite. /resultat est en noindex de façon permanente.
`;

  return new Response(texte, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
