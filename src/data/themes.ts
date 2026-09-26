/**
 * Thèmes publiés : leur adresse, leur pictogramme, leur teinte.
 *
 * LE SLUG EST SAISI À LA MAIN, jamais déduit du nom. Une URL publiée ne change
 * plus (`docs/CAHIER-DES-CHARGES.md`, §2) : si un thème est renommé dans le
 * questionnaire, son adresse doit survivre, et seul un slug écrit ici le permet.
 *
 * DEUX FAMILLES DE THÈMES (26 septembre 2026).
 *
 *   - `THEMES_PUBLIES` : les thèmes du test. `nom` doit être exactement le
 *     `theme` des questions ; `src/lib/fiches.ts` refuse le build si un thème du
 *     questionnaire n'a pas d'entrée ici, ou l'inverse. Leur page dit qui est
 *     pour et qui est contre chaque affirmation.
 *   - `THEMES_PROPOSITIONS` : les domaines de programme qu'aucune affirmation
 *     ne couvre encore. Leur page montre ce que les candidats PROPOSENT, à
 *     partir des propositions sourcées de `programmes.ts`, et ne dit jamais qui
 *     est pour ou contre : sans affirmation, il n'y a rien à quoi l'être.
 *
 * INTITULÉS COURTS. Un par affirmation, 34 signes au plus. Ils nomment la
 * mesure, ils ne la qualifient pas : « Retraite à 60 ans », pas « Retour de la
 * retraite à 60 ans ». Ils servent aux tuiles, aux titres, aux en-têtes du
 * tableau récapitulatif et à `llms.txt` ; l'affirmation complète reste écrite
 * sur la page, telle que le test la pose.
 *
 * TEINTES ET PICTOGRAMMES. Un repère de navigation, rien de plus. Aucune
 * teinte n'appartient à une famille politique française, et la teinte d'un
 * thème n'entre jamais dans le tableau des positions (voir `base.css`).
 * Pictogrammes Phosphor, rendus au build par `src/components/Icone.astro`.
 */
import type { DomaineProposition } from "../lib/modele";

export type Teinte = "violet" | "indigo" | "sarcelle" | "cyan" | "prune" | "ardoise";

type ThemeTest = {
  nom: string;
  slug: string;
  icone: string;
  teinte: Teinte;
  /** Domaine de programme rattaché : ses propositions s'affichent sous le tableau. */
  domaine: DomaineProposition;
  courts: Record<string, string>;
};

type ThemePropositions = {
  nom: string;
  slug: string;
  icone: string;
  teinte: Teinte;
  domaine: DomaineProposition;
};

export const THEMES_PUBLIES = [
  {
    nom: "Travail et retraites",
    slug: "travail-et-retraites",
    icone: "briefcase",
    teinte: "violet",
    domaine: "travail-retraites",
    courts: {
      "retraites-age-legal-60": "Retraite à 60 ans",
      "retraites-abrogation-reforme-2023": "Abroger la réforme de 2023",
      "retraites-indexation-esperance-vie": "Retraite et espérance de vie",
      "retraites-part-capitalisation": "Retraite par capitalisation",
    },
  },
  {
    nom: "Fiscalité et dépense publique",
    slug: "fiscalite-et-depense-publique",
    icone: "coins",
    teinte: "indigo",
    domaine: "fiscalite",
    courts: {
      "fiscalite-impot-fortune": "Impôt sur la fortune",
      "fiscalite-bareme-unique-capital-travail": "Taxer le capital comme le travail",
      "budget-reduction-dette-par-depenses": "Dette et dépenses de l'État",
      "chomage-reduction-duree-indemnisation": "Durée des allocations chômage",
    },
  },
  {
    nom: "Immigration et nationalité",
    slug: "immigration-et-nationalite",
    icone: "identification-card",
    teinte: "cyan",
    domaine: "immigration",
    courts: {
      "nationalite-suppression-droit-du-sol": "Droit du sol",
      "immigration-plafond-titres-sejour": "Plafond de titres de séjour",
      "immigration-regularisation-par-le-travail": "Régularisation par le travail",
      "vote-etrangers-elections-municipales": "Vote local des étrangers",
    },
  },
  {
    nom: "Écologie et énergie",
    slug: "ecologie-et-energie",
    icone: "leaf",
    teinte: "sarcelle",
    domaine: "ecologie",
    courts: {
      "agriculture-renforcement-normes-environnementales": "Normes écologiques agricoles",
      "energie-nouveaux-parcs-eoliens": "Nouvelles éoliennes",
      "transport-suppression-zfe": "Zones à faibles émissions",
      "energie-nouveaux-reacteurs-nucleaires": "Nouveaux réacteurs nucléaires",
    },
  },
  {
    nom: "Institutions et démocratie",
    slug: "institutions-et-democratie",
    icone: "bank",
    teinte: "prune",
    domaine: "institutions",
    courts: {
      "institutions-proportionnelle-legislatives": "Députés à la proportionnelle",
      "institutions-referendum-initiative-citoyenne": "Référendum d'initiative citoyenne",
      "institutions-maintien-article-49-3": "Article 49.3",
      "institutions-elargissement-champ-referendum": "Référendum sur l'immigration",
    },
  },
  {
    nom: "Europe et international",
    slug: "europe-et-international",
    icone: "globe-hemisphere-east",
    teinte: "ardoise",
    domaine: "europe-international",
    courts: {
      "europe-decisions-majorite-qualifiee": "Vote à la majorité en Europe",
      "international-financement-soutien-ukraine": "Aide militaire à l'Ukraine",
      "europe-controles-frontieres-schengen": "Contrôles aux frontières Schengen",
      "europe-opposition-parlementaire-traite": "Opposition à un traité ratifié",
    },
  },
] as const satisfies readonly ThemeTest[];

export const THEMES_PROPOSITIONS = [
  {
    nom: "Économie et salaires",
    slug: "economie-et-salaires",
    icone: "wallet",
    teinte: "indigo",
    domaine: "economie-salaires",
  },
  {
    nom: "Sécurité et justice",
    slug: "securite-et-justice",
    icone: "scales",
    teinte: "ardoise",
    domaine: "securite-justice",
  },
  {
    nom: "Santé et grand âge",
    slug: "sante-et-grand-age",
    icone: "heartbeat",
    teinte: "violet",
    domaine: "sante-grand-age",
  },
  {
    nom: "Éducation, jeunesse et numérique",
    slug: "education-jeunesse-et-numerique",
    icone: "graduation-cap",
    teinte: "cyan",
    domaine: "education-jeunesse",
  },
  {
    nom: "Famille et société",
    slug: "famille-et-societe",
    icone: "users-three",
    teinte: "prune",
    domaine: "famille-societe",
  },
] as const satisfies readonly ThemePropositions[];
