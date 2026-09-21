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
 * Doit coïncider EXACTEMENT avec `site` dans `astro.config.mjs` : même
 * protocole, même hôte, aucune barre oblique finale. Une divergence ferait
 * diverger les URL canoniques et le sitemap sans qu'aucun test ne le voie.
 *
 * L'apex seul. `www.guide-isoloir.fr` est redirigé en 301 vers l'apex par une
 * Redirect Rule Cloudflare : le site n'existe qu'à une adresse.
 */
export const SITE_URL = "https://guide-isoloir.fr";

export const SITE_NAME = "Guide Isoloir";

export const SITE_TAGLINE =
  "Comprendre l'élection présidentielle de 2027, se situer, et savoir comment voter.";

/**
 * Nom de l'éditeur, tel qu'il figure dans les mentions légales et sur chaque
 * signature d'article.
 */
export const EDITOR_NAME: string | null = "Clément Boudon";

/**
 * Adresse de contact publique. Redirection Cloudflare Email Routing vers
 * l'adresse personnelle de l'éditeur : aucune boîte n'est hébergée ici.
 *
 * Ne jamais publier ici une adresse qui ne reçoit pas. Un site dont l'argument
 * est le sérieux ne peut pas afficher une adresse morte.
 */
export const CONTACT_EMAIL: string | null = "contact@guide-isoloir.fr";

/**
 * Adresse du dépôt public. L'AGPL impose que le code soit accessible : ce lien
 * est publié dans les mentions légales et dans la charte éditoriale.
 */
export const REPOSITORY_URL: string | null = "https://github.com/clembdn/guide-isoloir";

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

/** Sections atteignables depuis le pied de page, dans l'ordre. */
export const FOOTER_NAV: readonly NavEntry[] = [
  { href: "/test", label: "Le test" },
  { href: "/comprendre", label: "Comprendre" },
  { href: "/a-propos", label: "À propos" },
  { href: "/methodologie", label: "Méthodologie" },
  { href: "/charte-editoriale", label: "Charte éditoriale" },
  { href: "/corrections", label: "Corrections" },
  { href: "/financement", label: "Financement" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/credits-images", label: "Crédits des images" },
];

/**
 * Le site est-il prêt à être publié ?
 *
 * Sert aux pages à choisir entre la formulation définitive et une formulation
 * qui ne promet rien de ce qui n'existe pas encore. Ne dispense pas du
 * garde-fou de build : ceci décide de la rédaction, celui-là interdit la
 * publication.
 *
 * Vaut `true` depuis le branchement du domaine. Le `noindex` global est donc
 * levé : toutes les pages sauf `/test` et `/resultat` sont indexables.
 */
export const IS_PUBLISHABLE = EDITOR_NAME !== null && !SITE_URL.endsWith(".invalid");
