/**
 * QUESTIONS FACTICES. AUCUNE DONNÉE POLITIQUE.
 *
 * Ce fichier existe pour que le quiz, le moteur et l'audit puissent être
 * construits, rendus et testés avant qu'une seule question réelle soit rédigée.
 * Il ne contient aucune affirmation politique, aucun candidat, aucune position
 * réelle, aucune source réelle.
 *
 * Les affirmations sont délibérément triviales. Ce n'est pas de l'humour : une
 * affirmation politique plausible finirait par être prise pour une vraie,
 * copiée dans une capture d'écran, ou oubliée en production. Une affirmation
 * sur le balayage des trottoirs ne peut être confondue avec rien.
 *
 * POURQUOI ICI ET PAS DANS src/data/ : `src/data/` est réservé aux données
 * réelles, sous licence CC BY-SA. Y déposer du factice reviendrait à le mélanger
 * à ce qu'on publie. `scripts/verifier-pages-publiques.mjs --strict` refuse un
 * build de production qui sert encore ce fichier.
 *
 * DEUX THÈMES DE TAILLES DIFFÉRENTES, volontairement : c'est ce qui permet à
 * l'audit de vérifier qu'un thème plus fourni ne pèse pas plus lourd. Un jeu
 * d'un seul thème rendrait cet invariant invérifiable.
 *
 * Les identifiants sont reconnaissables : le test de fuite s'en sert de
 * sentinelles. Voir tests/e2e/aucune-fuite-de-reponse.spec.ts.
 *
 * LA VALIDATION ZOD N'EST PAS APPELÉE ICI, ET C'EST DÉLIBÉRÉ. Ce module est
 * importé par un îlot, donc envoyé au navigateur : y appeler le schéma
 * embarquait zod dans le bundle, mesuré à 86 ko pour une vérification qui n'a
 * de sens qu'au build. Les pages `.astro` appellent `validerQuestions` dans leur
 * frontmatter, qui ne s'exécute que côté serveur, et le build échoue là. Le type
 * `satisfies` ci-dessous garde la forme à la compilation.
 */
import type { StanceValue } from "../lib/modele";
import type { Question } from "../lib/questions";

/** Marqueur lisible par un humain comme par le garde-fou de publication. */
export const DONNEES_FACTICES = true;

export const AVERTISSEMENT_FACTICE =
  "Ces questions sont des exemples destinés à la mise au point de l'écran. " +
  "Elles ne portent sur aucun sujet politique et vos réponses ne signifient rien.";

/*
 * `direction` équilibre chaque thème : autant de +1 que de -1. Un questionnaire
 * dont toutes les affirmations vont dans le même sens produit un biais
 * d'acquiescement. L'audit le vérifie thème par thème.
 */
export const QUESTIONS_FACTICES = [
  {
    id: "factice-sentinelle-alpha",
    theme: "Voirie",
    texte: "Les trottoirs devraient être balayés le mardi plutôt que le jeudi.",
    direction: 1,
    infobulle: "Le balayage mécanisé désigne le nettoyage effectué par une machine, non à la main.",
    infobulleSourceId: "source-factice-voirie",
    version: 1,
    ordre: 10,
  },
  {
    id: "factice-sentinelle-beta",
    theme: "Voirie",
    texte: "Les lampadaires devraient rester allumés toute la nuit.",
    direction: -1,
    infobulle:
      "L'extinction nocturne désigne la coupure de l'éclairage public entre deux heures fixées.",
    infobulleSourceId: "source-factice-eclairage",
    version: 1,
    ordre: 20,
  },
  {
    id: "factice-sentinelle-gamma",
    theme: "Voirie",
    texte: "Il faudrait davantage de bancs publics le long des avenues.",
    direction: 1,
    infobulle: "Le mobilier urbain regroupe les bancs, abris, corbeilles et bornes d'une commune.",
    infobulleSourceId: "source-factice-mobilier",
    version: 1,
    ordre: 30,
  },
  {
    id: "factice-sentinelle-delta",
    theme: "Voirie",
    texte: "Les passages piétons devraient être repeints tous les deux ans.",
    direction: -1,
    infobulle: "Le marquage au sol désigne les bandes peintes qui organisent la circulation.",
    infobulleSourceId: "source-factice-marquage",
    version: 1,
    ordre: 40,
  },
  {
    id: "factice-sentinelle-epsilon",
    theme: "Cantine",
    texte: "Le pain de la cantine devrait être coupé en tranches plus épaisses.",
    direction: 1,
    infobulle: "Le grammage désigne le poids d'une portion servie, exprimé en grammes.",
    infobulleSourceId: "source-factice-grammage",
    version: 1,
    ordre: 50,
  },
  {
    id: "factice-sentinelle-zeta",
    theme: "Cantine",
    texte: "Le dessert devrait être servi avant le plat principal.",
    direction: -1,
    infobulle: "Le service à l'assiette désigne un plat dressé en cuisine plutôt qu'en salle.",
    infobulleSourceId: "source-factice-service",
    version: 1,
    ordre: 60,
  },
] as const satisfies readonly Question[];

/**
 * Échelle de réponse.
 *
 * Cinq positions symétriques autour de zéro, plus une sortie qui n'est PAS une
 * position : « je n'ai pas d'avis ». La distinction est structurelle, pas
 * seulement rédactionnelle — voir `src/lib/session-test.ts`.
 *
 * L'ordre va de l'accord au désaccord, et il est identique pour toutes les
 * questions : alterner le sens introduirait un effet d'ordre que l'audit doit
 * pouvoir exclure.
 */
export const ECHELLE: readonly { valeur: StanceValue; libelle: string }[] = [
  { valeur: 2, libelle: "Tout à fait d'accord" },
  { valeur: 1, libelle: "Plutôt d'accord" },
  { valeur: 0, libelle: "Ni d'accord, ni pas d'accord" },
  { valeur: -1, libelle: "Plutôt pas d'accord" },
  { valeur: -2, libelle: "Pas du tout d'accord" },
];
