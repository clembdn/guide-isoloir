/**
 * robots.txt, généré plutôt que statique.
 *
 * Le domaine ne doit exister qu'à un seul endroit : `src/lib/site.ts`. Un
 * `Sitemap:` codé en dur dans `public/` pointerait tôt ou tard vers un domaine
 * périmé, sans que rien ne le signale.
 *
 * Politique : la recherche est autorisée, l'entraînement de modèles ne l'est
 * pas. Un parcours pédagogique n'a d'utilité que s'il est trouvable, y compris
 * depuis un assistant conversationnel. Il n'a en revanche aucune raison
 * d'alimenter gratuitement un jeu d'entraînement.
 *
 * `/resultat` n'est volontairement PAS bloqué : la page porte une directive
 * noindex dans son HTML, et un robot doit pouvoir explorer la page pour la lire.
 * Un Disallow empêcherait la lecture de la directive et laisserait l'URL
 * indexable sans extrait. Un test Playwright le vérifie.
 */
import type { APIRoute } from "astro";
import { SITE_URL } from "../lib/site";

/** Robots de recherche, classiques puis assistés par IA. */
const RECHERCHE = [
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Qwantify",
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
  // Google-Extended ne télécharge rien par lui-même : ce jeton autorise ou
  // refuse l'usage des pages déjà explorées par Googlebot dans les réponses
  // génératives. Autorisé, pour la même raison que la recherche assistée.
  "Google-Extended",
];

/** Robots de collecte pour entraînement. */
const ENTRAINEMENT = [
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "Applebot-Extended",
];

export const GET: APIRoute = () => {
  const lignes = [
    "# Guide Isoloir — politique d'exploration",
    "# Recherche autorisée, entraînement refusé. Détail : /llms.txt",
    "",
    "# --- Recherche : autorisée ---",
    "",
    ...RECHERCHE.flatMap((agent) => [`User-agent: ${agent}`, "Allow: /", ""]),
    "# --- Collecte pour entraînement : refusée ---",
    "",
    ...ENTRAINEMENT.flatMap((agent) => [`User-agent: ${agent}`, "Disallow: /", ""]),
    "# --- Par défaut ---",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${new URL("/sitemap.xml", SITE_URL).href}`,
    "",
  ];

  return new Response(lignes.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
