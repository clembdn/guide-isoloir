/**
 * ACTEURS POLITIQUES RÉELS — élection présidentielle du 18 avril 2027.
 *
 * RÈGLE D'ENTRÉE DANS LE ROSTER, à publier sur `/methodologie` avant toute
 * extension de cette liste :
 *
 *   Un acteur n'entre que sur un acte public, daté et vérifiable de la personne
 *   elle-même, ou sur une désignation formelle par son parti. Ni un sondage, ni
 *   une déclaration de tiers, ni une rumeur de presse ne font entrer quelqu'un.
 *
 * CE QUE CETTE RÈGLE A CORRIGÉ. Le premier jet retenait « les sept candidats
 * conviés par le Medef au débat du 27 août ». C'était daté et vérifiable, mais
 * cela déléguait le choix éditorial à une organisation patronale — et LCP présente
 * lui-même cette liste comme une liste d'invitation. Elle était déjà périmée à la
 * publication : Éric Zemmour a officialisé sa candidature le 17 septembre 2026,
 * et Roussel, Bertrand, Lisnard, Dupont-Aignan, Arthaud et une dizaine d'autres
 * n'y figuraient pas.
 *
 * La liste du Medef reste utile, mais comme ORDRE DE SAISIE : ces sept-là sont les
 * mieux documentés, donc les premiers à coder.
 *
 * `statutDepuis` EST LA DATE À LAQUELLE LE STATUT EST ATTESTÉ par la source
 * citée, pas nécessairement celle de la déclaration. Quand la source donne une
 * date précise, c'est elle ; sinon c'est la date de mise à jour de la source, et
 * un commentaire le signale. Cette imprécision est visible plutôt que masquée.
 *
 * `status` SUIT L'ÉCHELLE DU MODÈLE, et la distinction compte :
 *   - `declared`  : a officialisé sa candidature à l'élection présidentielle ;
 *   - `nominated` : désigné par un processus interne formel — Retailleau par les
 *                   adhérents LR, Roussel par un vote militant à 72 %, Tondelier
 *                   investie par les Écologistes ;
 *   - `potential` : a déclaré une candidature À UNE PRIMAIRE dont l'issue n'est
 *                   pas connue. Raphaël Glucksmann est candidat à la primaire
 *                   socialiste des 9 et 10 octobre, pas encore à la présidentielle.
 *                   Le confondre avec un candidat déclaré serait faux.
 *
 * RÉSERVE SUR LE PÔLE SOCIALISTE : la primaire fermée du PS des 9 et 10 octobre
 * 2026 reclassera probablement plusieurs candidatures rattachées à ce pôle. Karim
 * Bouamrane figure ici en `declared` parce que la source le classe ainsi ; à
 * revérifier après la primaire.
 *
 * `sortName` EST SAISI À LA MAIN, jamais déduit de `name` : « Le Pen, Marine » se
 * trie sous L, « Dupont-Aignan » sous D, « Les Écologistes » sous É. Aucune règle
 * automatique ne sait faire les trois.
 *
 * LES PARTIS SONT DES ACTEURS À PART ENTIÈRE, pour deux raisons : un candidat
 * peut contredire son parti, et un candidat qui ne s'est pas encore exprimé sur
 * une affirmation peut reprendre la ligne du sien — c'est `baselineActorIds`, et
 * le moteur nomme alors le parti dans le résultat. Aucune position de parti n'est
 * encore saisie : la reprise ne produit donc rien aujourd'hui.
 *
 * UN RETRAIT NE SUPPRIME RIEN ICI. `status: "withdrawn"` sur l'acteur et sur la
 * candidature, avec la date et la source. C'est ce que prévoit `CLAUDE.md` :
 * « pour un candidat retiré, conserver la page avec le statut candidature retirée
 * et l'historique ».
 *
 * PAS DE VALIDATION ZOD ICI : ce module peut partir au navigateur. Les pages
 * `.astro` appellent `validerActeurs` et `validerCandidatures` dans leur
 * frontmatter, qui ne s'exécute que côté serveur.
 */
import type { Candidate, PoliticalActor } from "../lib/modele";

/** Ce fichier contient des données réelles. Le garde-fou de publication l'autorise. */
export const DONNEES_FACTICES = false;

export const ACTEURS = [
  /*
   * ─── Coalitions ────────────────────────────────────────────────────────
   *
   * UNE COALITION EST UN ACTEUR À PART ENTIÈRE, et pas une étiquette collée sur
   * ses partis. Le contrat de législature du Nouveau Front populaire engage
   * quatre partis à la fois : l'attribuer à chacun d'eux ferait apparaître
   * quatre fois « Ligne du parti » là où il n'y a qu'un seul texte, signé
   * ensemble. Le modèle prévoit ce maillon — `coalition-platform` prime sur
   * `party-platform` — et l'écran nomme l'origine réelle : « Position de
   * Nouveau Front populaire, reprise faute de déclaration personnelle ».
   *
   * `status: "historical"` : la coalition n'est plus active en septembre 2026.
   * Son texte reste une source datée et vérifiable, la plus complète dont on
   * dispose pour quatre candidats, et l'écran affiche sa date de juin 2024 avec
   * l'avertissement d'ancienneté. Le jour où un candidat publie son programme,
   * la reprise s'efface d'elle-même : le moteur retient toujours le maillon le
   * plus haut.
   */
  {
    id: "coalition-nouveau-front-populaire",
    kind: "coalition",
    name: "Nouveau Front populaire",
    sortName: "Nouveau Front populaire",
    slug: "nouveau-front-populaire",
    status: "historical",
  },

  // ─── Partis et mouvements ────────────────────────────────────────────────
  {
    id: "parti-debout-la-france",
    kind: "party",
    name: "Debout la France",
    sortName: "Debout la France",
    slug: "debout-la-france",
    status: "active",
  },
  {
    id: "parti-equinoxe",
    kind: "party",
    name: "Equinoxe",
    sortName: "Equinoxe",
    slug: "equinoxe",
    status: "active",
  },
  {
    id: "parti-france-libre",
    kind: "party",
    name: "France Libre",
    sortName: "France Libre",
    slug: "france-libre",
    status: "active",
  },
  {
    id: "parti-generation-ecologie",
    kind: "party",
    name: "Génération écologie",
    sortName: "Génération écologie",
    slug: "generation-ecologie",
    status: "active",
  },
  {
    id: "parti-horizons",
    kind: "party",
    name: "Horizons",
    sortName: "Horizons",
    slug: "horizons",
    status: "active",
  },
  {
    id: "parti-la-france-insoumise",
    kind: "party",
    name: "La France insoumise",
    sortName: "France insoumise, La",
    slug: "la-france-insoumise",
    status: "active",
  },
  {
    id: "parti-les-ecologistes",
    kind: "party",
    name: "Les Écologistes",
    sortName: "Écologistes, Les",
    slug: "les-ecologistes",
    status: "active",
  },
  {
    id: "parti-les-patriotes",
    kind: "party",
    name: "Les Patriotes",
    sortName: "Patriotes, Les",
    slug: "les-patriotes",
    status: "active",
  },
  {
    id: "parti-les-republicains",
    kind: "party",
    name: "Les Républicains",
    sortName: "Républicains, Les",
    slug: "les-republicains",
    status: "active",
  },
  {
    id: "parti-lutte-ouvriere",
    kind: "party",
    name: "Lutte ouvrière",
    sortName: "Lutte ouvrière",
    slug: "lutte-ouvriere",
    status: "active",
  },
  {
    id: "parti-nous-france",
    kind: "party",
    name: "Nous France",
    sortName: "Nous France",
    slug: "nous-france",
    status: "active",
  },
  {
    id: "parti-nouvelle-energie",
    kind: "party",
    name: "Nouvelle Énergie",
    sortName: "Nouvelle Énergie",
    slug: "nouvelle-energie",
    status: "active",
  },
  {
    id: "parti-parti-communiste-francais",
    kind: "party",
    name: "Parti communiste français",
    sortName: "Parti communiste français",
    slug: "parti-communiste-francais",
    status: "active",
  },
  {
    id: "parti-parti-socialiste",
    kind: "party",
    name: "Parti socialiste",
    sortName: "Parti socialiste",
    slug: "parti-socialiste",
    status: "active",
  },
  {
    id: "parti-place-publique",
    kind: "party",
    name: "Place publique",
    sortName: "Place publique",
    slug: "place-publique",
    status: "active",
  },
  {
    id: "parti-rassemblement-national",
    kind: "party",
    name: "Rassemblement national",
    sortName: "Rassemblement national",
    slug: "rassemblement-national",
    status: "active",
  },
  {
    id: "parti-reconquete",
    kind: "party",
    name: "Reconquête",
    sortName: "Reconquête",
    slug: "reconquete",
    status: "active",
  },
  {
    id: "parti-renaissance",
    kind: "party",
    name: "Renaissance",
    sortName: "Renaissance",
    slug: "renaissance",
    status: "active",
  },
  {
    id: "parti-solution-democratique",
    kind: "party",
    name: "Solution démocratique",
    sortName: "Solution démocratique",
    slug: "solution-democratique",
    status: "active",
  },
  {
    id: "parti-union-populaire-republicaine",
    kind: "party",
    name: "Union populaire républicaine",
    sortName: "Union populaire républicaine",
    slug: "union-populaire-republicaine",
    status: "active",
  },

  // ─── Candidats, par ordre alphabétique de `sortName` ─────────────────────
  {
    id: "nathalie-arthaud",
    kind: "candidate",
    name: "Nathalie Arthaud",
    sortName: "Arthaud, Nathalie",
    slug: "nathalie-arthaud",
    status: "active",
  },
  {
    id: "francois-asselineau",
    kind: "candidate",
    name: "François Asselineau",
    sortName: "Asselineau, François",
    slug: "francois-asselineau",
    status: "active",
  },
  {
    id: "gabriel-attal",
    kind: "candidate",
    name: "Gabriel Attal",
    sortName: "Attal, Gabriel",
    slug: "gabriel-attal",
    status: "active",
  },
  {
    id: "delphine-batho",
    kind: "candidate",
    name: "Delphine Batho",
    sortName: "Batho, Delphine",
    slug: "delphine-batho",
    status: "active",
  },
  {
    id: "xavier-bertrand",
    kind: "candidate",
    name: "Xavier Bertrand",
    sortName: "Bertrand, Xavier",
    slug: "xavier-bertrand",
    status: "active",
  },
  {
    id: "karim-bouamrane",
    kind: "candidate",
    name: "Karim Bouamrane",
    sortName: "Bouamrane, Karim",
    slug: "karim-bouamrane",
    status: "active",
  },
  {
    id: "nicolas-dupont-aignan",
    kind: "candidate",
    name: "Nicolas Dupont-Aignan",
    sortName: "Dupont-Aignan, Nicolas",
    slug: "nicolas-dupont-aignan",
    status: "active",
  },
  {
    id: "clara-egger",
    kind: "candidate",
    name: "Clara Egger",
    sortName: "Egger, Clara",
    slug: "clara-egger",
    status: "active",
  },
  {
    id: "raphael-glucksmann",
    kind: "candidate",
    name: "Raphaël Glucksmann",
    sortName: "Glucksmann, Raphaël",
    slug: "raphael-glucksmann",
    status: "active",
  },
  {
    id: "francis-lalanne",
    kind: "candidate",
    name: "Francis Lalanne",
    sortName: "Lalanne, Francis",
    slug: "francis-lalanne",
    status: "active",
  },
  {
    id: "marine-le-pen",
    kind: "candidate",
    name: "Marine Le Pen",
    sortName: "Le Pen, Marine",
    slug: "marine-le-pen",
    status: "active",
  },
  {
    id: "david-lisnard",
    kind: "candidate",
    name: "David Lisnard",
    sortName: "Lisnard, David",
    slug: "david-lisnard",
    status: "active",
  },
  {
    id: "jean-luc-melenchon",
    kind: "candidate",
    name: "Jean-Luc Mélenchon",
    sortName: "Mélenchon, Jean-Luc",
    slug: "jean-luc-melenchon",
    status: "active",
  },
  {
    id: "antoine-mikolajczak",
    kind: "candidate",
    name: "Antoine Mikolajczak",
    sortName: "Mikolajczak, Antoine",
    slug: "antoine-mikolajczak",
    status: "active",
  },
  {
    id: "edouard-philippe",
    kind: "candidate",
    name: "Édouard Philippe",
    sortName: "Philippe, Édouard",
    slug: "edouard-philippe",
    status: "active",
  },
  {
    id: "florian-philippot",
    kind: "candidate",
    name: "Florian Philippot",
    sortName: "Philippot, Florian",
    slug: "florian-philippot",
    status: "active",
  },
  {
    id: "bruno-retailleau",
    kind: "candidate",
    name: "Bruno Retailleau",
    sortName: "Retailleau, Bruno",
    slug: "bruno-retailleau",
    status: "active",
  },
  {
    id: "fabien-roussel",
    kind: "candidate",
    name: "Fabien Roussel",
    sortName: "Roussel, Fabien",
    slug: "fabien-roussel",
    status: "active",
  },
  {
    id: "marine-tondelier",
    kind: "candidate",
    name: "Marine Tondelier",
    sortName: "Tondelier, Marine",
    slug: "marine-tondelier",
    status: "active",
  },
  {
    id: "eric-zemmour",
    kind: "candidate",
    name: "Éric Zemmour",
    sortName: "Zemmour, Éric",
    slug: "eric-zemmour",
    status: "active",
  },
] as const satisfies readonly PoliticalActor[];

/**
 * CANDIDATURES.
 *
 * `baselineActorIds` porte le parti de chacun. La liste est un ordre de
 * préférence : une coalition viendrait avant un parti.
 */
export const CANDIDATURES = [
  {
    actorId: "nathalie-arthaud",
    status: "declared",
    baselineActorIds: ["parti-lutte-ouvriere"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "francois-asselineau",
    status: "declared",
    baselineActorIds: ["parti-union-populaire-republicaine"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // date donnée par la source
  {
    actorId: "gabriel-attal",
    status: "declared",
    baselineActorIds: ["parti-renaissance"],
    statutDepuis: "2026-05-22",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "delphine-batho",
    status: "declared",
    baselineActorIds: ["parti-generation-ecologie"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // date donnée par la source
  {
    actorId: "xavier-bertrand",
    status: "declared",
    baselineActorIds: ["parti-nous-france"],
    statutDepuis: "2026-08-26",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "karim-bouamrane",
    status: "declared",
    baselineActorIds: ["coalition-nouveau-front-populaire", "parti-parti-socialiste"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "nicolas-dupont-aignan",
    status: "declared",
    baselineActorIds: ["parti-debout-la-france"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "clara-egger",
    status: "declared",
    baselineActorIds: ["parti-solution-democratique"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // candidat à la primaire socialiste, pas encore à la présidentielle
  {
    actorId: "raphael-glucksmann",
    status: "potential",
    baselineActorIds: ["parti-place-publique"],
    statutDepuis: "2026-08-23",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "francis-lalanne",
    status: "declared",
    baselineActorIds: ["parti-france-libre"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // date donnée par la source
  {
    actorId: "marine-le-pen",
    status: "declared",
    baselineActorIds: ["parti-rassemblement-national"],
    statutDepuis: "2026-07-07",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "david-lisnard",
    status: "declared",
    baselineActorIds: ["parti-nouvelle-energie"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "jean-luc-melenchon",
    status: "declared",
    baselineActorIds: ["coalition-nouveau-front-populaire", "parti-la-france-insoumise"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "antoine-mikolajczak",
    status: "declared",
    baselineActorIds: ["parti-equinoxe"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "edouard-philippe",
    status: "declared",
    baselineActorIds: ["parti-horizons"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "florian-philippot",
    status: "declared",
    baselineActorIds: ["parti-les-patriotes"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // désigné par les adhérents LR
  {
    actorId: "bruno-retailleau",
    status: "nominated",
    baselineActorIds: ["parti-les-republicains"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // validé à 72 % par les militants
  {
    actorId: "fabien-roussel",
    status: "nominated",
    baselineActorIds: ["coalition-nouveau-front-populaire", "parti-parti-communiste-francais"],
    statutDepuis: "2026-09-06",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // investie par son parti
  {
    actorId: "marine-tondelier",
    status: "nominated",
    baselineActorIds: ["coalition-nouveau-front-populaire", "parti-les-ecologistes"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // date donnée par la source
  {
    actorId: "eric-zemmour",
    status: "declared",
    baselineActorIds: ["parti-reconquete"],
    statutDepuis: "2026-09-17",
    statutSourceIds: ["lcp-zemmour-candidature-2026"],
  },
] as const satisfies readonly Candidate[];
