/**
 * Constantes du site.
 *
 * Règle absolue : aucune valeur de ce fichier n'est déduite d'une source que
 * l'éditeur n'a pas écrite lui-même. La configuration git n'est pas une source.
 * Tant qu'une information n'a pas été fournie explicitement, elle vaut `null`,
 * et les pages se construisent sans elle plutôt que d'afficher un espace réservé.
 *
 * Le garde-fou `scripts/verifier-pages-publiques.mjs` refuse la publication tant
 * que les valeurs obligatoires ci-dessous sont nulles ou pointent vers
 * `example.invalid`.
 */

/**
 * Domaine du site.
 *
 * `example.invalid` est réservé par la RFC 2606 et ne peut être enregistré par
 * personne : aucune requête ne peut aboutir vers un site réel par erreur. La
 * valeur doit être remplacée par le domaine réellement acheté, ici et dans
 * `astro.config.mjs`.
 */
export const SITE_URL = "https://example.invalid";

export const SITE_NAME = "Guide Isoloir";

export const SITE_TAGLINE =
  "Comprendre l'élection présidentielle de 2027, se situer, et savoir comment voter.";

/**
 * Nom de l'éditeur, tel qu'il figurera dans les mentions légales et sur chaque
 * signature d'article. `null` tant qu'il n'a pas été fourni.
 */
export const EDITOR_NAME: string | null = null;

/**
 * Adresse de contact publique. `null` tant qu'elle n'existe pas.
 */
export const CONTACT_EMAIL: string | null = null;

/**
 * Adresse du dépôt public. `null` tant qu'il n'est pas publié.
 */
export const REPOSITORY_URL: string | null = null;

/** Dates du scrutin (métropole). */
export const ELECTION = {
  round1: "2027-04-18",
  round2: "2027-05-02",
  /** Territoires ultramarins concernés : la veille. */
  round1Overseas: "2027-04-17",
  round2Overseas: "2027-05-01",
} as const;

type NavEntry = {
  href: string;
  label: string;
};

/** Pages publiques, dans l'ordre du pied de page. */
export const FOOTER_NAV: readonly NavEntry[] = [
  { href: "/a-propos", label: "À propos" },
  { href: "/methodologie", label: "Méthodologie" },
  { href: "/charte-editoriale", label: "Charte éditoriale" },
  { href: "/corrections", label: "Corrections" },
  { href: "/financement", label: "Financement" },
  { href: "/mentions-legales", label: "Mentions légales" },
];

/**
 * Le site est-il prêt à être publié ?
 *
 * Sert aux pages à choisir entre la formulation définitive et une formulation
 * qui ne promet rien de ce qui n'existe pas encore. Ne dispense pas du
 * garde-fou de build : ceci décide de la rédaction, celui-là interdit la
 * publication.
 */
export const IS_PUBLISHABLE = EDITOR_NAME !== null && !SITE_URL.endsWith(".invalid");
