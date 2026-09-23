/**
 * Adresses des pages de thème.
 *
 * LE SLUG EST SAISI À LA MAIN, jamais déduit du nom. Une URL publiée ne change
 * plus (`docs/CAHIER-DES-CHARGES.md`, §2) : si un thème est renommé dans le
 * questionnaire, son adresse doit survivre, et seul un slug écrit ici le permet.
 *
 * `nom` doit être exactement le `theme` des questions. `src/lib/fiches.ts`
 * refuse le build si un thème du questionnaire n'a pas d'entrée ici, ou si une
 * entrée ne correspond à aucun thème.
 *
 * Aucune description : un texte qui présenterait l'enjeu d'un thème serait un
 * texte éditorial, à rédiger, sourcer et relire comme un article. Les
 * affirmations et leurs définitions sourcées suffisent à dire de quoi il s'agit.
 */
export const THEMES_PUBLIES = [
  { nom: "Travail et retraites", slug: "travail-et-retraites" },
  { nom: "Fiscalité et dépense publique", slug: "fiscalite-et-depense-publique" },
  { nom: "Immigration et nationalité", slug: "immigration-et-nationalite" },
  { nom: "Écologie et énergie", slug: "ecologie-et-energie" },
  { nom: "Institutions et démocratie", slug: "institutions-et-democratie" },
  { nom: "Europe et international", slug: "europe-et-international" },
] as const satisfies readonly { nom: string; slug: string }[];
