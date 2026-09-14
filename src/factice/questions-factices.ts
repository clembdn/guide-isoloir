/**
 * QUESTIONS FACTICES. AUCUNE DONNÉE POLITIQUE.
 *
 * Ce fichier existe pour que l'écran de quiz puisse être construit, rendu et
 * testé avant qu'une seule question réelle soit rédigée. Il ne contient aucune
 * affirmation politique, aucun candidat, aucune position, aucune source.
 *
 * Les trois affirmations ci-dessous sont délibérément triviales. Ce n'est pas
 * de l'humour : une affirmation politique plausible finirait par être prise
 * pour une vraie, copiée dans une capture d'écran, ou oubliée en production.
 * Une affirmation sur le balayage des trottoirs ne peut être confondue avec
 * rien.
 *
 * POURQUOI ICI ET PAS DANS src/data/ :
 * `src/data/` est réservé aux données réelles, sous licence CC BY-SA, versionnées
 * comme la table d'historique du projet. Y déposer du factice reviendrait à le
 * mélanger aux données qu'on publie. `src/factice/` n'a pas vocation à survivre
 * à la première campagne de rédaction, et le garde-fou de publication refuse un
 * build de production qui en dépend encore.
 *
 * Les identifiants sont volontairement reconnaissables : le test de fuite s'en
 * sert de sentinelles. Voir tests/e2e/aucune-fuite-de-reponse.spec.ts.
 */
import type { StanceValue } from "../lib/modele";

export type QuestionFactice = {
  id: string;
  /** L'affirmation soumise à l'électeur, à la première personne du pluriel. */
  affirmation: string;
  /** Thème, tel qu'il apparaîtra plus tard sur l'écran de résultat. */
  theme: string;
};

/** Marqueur lisible par un humain comme par un garde-fou de build. */
export const DONNEES_FACTICES = true;

export const AVERTISSEMENT_FACTICE =
  "Ces trois questions sont des exemples destinés à la mise au point de l'écran. " +
  "Elles ne portent sur aucun sujet politique et vos réponses ne signifient rien.";

export const QUESTIONS_FACTICES: readonly QuestionFactice[] = [
  {
    id: "factice-sentinelle-alpha",
    affirmation: "Les trottoirs devraient être balayés le mardi plutôt que le jeudi.",
    theme: "Exemple",
  },
  {
    id: "factice-sentinelle-beta",
    affirmation: "Les horloges des gares devraient afficher les secondes.",
    theme: "Exemple",
  },
  {
    id: "factice-sentinelle-gamma",
    affirmation: "Le pain de la cantine devrait être coupé en tranches plus épaisses.",
    theme: "Exemple",
  },
];

/**
 * Échelle de réponse.
 *
 * Cinq positions symétriques autour de zéro, plus une sortie qui n'est PAS une
 * position : « je n'ai pas d'avis ». La distinction est structurelle, pas
 * seulement rédactionnelle — voir `src/lib/session-test.ts`.
 *
 * L'ordre va de l'accord au désaccord. Il est identique pour toutes les
 * questions : alterner le sens introduirait un effet d'ordre que l'audit
 * d'invariants doit pouvoir exclure.
 */
export const ECHELLE: readonly { valeur: StanceValue; libelle: string }[] = [
  { valeur: 2, libelle: "Tout à fait d'accord" },
  { valeur: 1, libelle: "Plutôt d'accord" },
  { valeur: 0, libelle: "Ni d'accord, ni pas d'accord" },
  { valeur: -1, libelle: "Plutôt pas d'accord" },
  { valeur: -2, libelle: "Pas du tout d'accord" },
];
