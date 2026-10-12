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
 *                   pas connue. Le confondre avec un candidat déclaré serait faux ;
 *   - `primary-defeated` : battu à cette primaire. Ce n'est ni un retrait, que
 *                   la personne décide, ni une élimination au premier tour.
 *
 * LA PRIMAIRE SOCIALE-DÉMOCRATE EST TRANCHÉE. Organisée par le Parti socialiste
 * et Place publique, votée en ligne du 9 au 11 octobre 2026 : Raphaël Glucksmann
 * l'emporte dès le premier tour avec 66,17 % des suffrages exprimés (LCP et
 * franceinfo, 11 octobre). Olivier Faure, Ségolène Royal, Emmanuel Maurel et
 * Jérôme Guedj passent en `primary-defeated` ; leurs fiches restent, avec leur
 * historique. Karim Bouamrane n'était pas candidat à cette primaire — aucune
 * source lue ne l'y place, et LCP comme franceinfo ne le comptent pas parmi les
 * cinq — : il reste en `declared`.
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
    id: "parti-a-nous-maintenant",
    kind: "party",
    name: "À nous maintenant",
    sortName: "À nous maintenant",
    slug: "a-nous-maintenant",
    status: "active",
  },
  {
    id: "parti-debout-la-france",
    kind: "party",
    name: "Debout la France",
    sortName: "Debout la France",
    slug: "debout-la-france",
    status: "active",
  },
  {
    id: "parti-debout",
    kind: "party",
    name: "Debout",
    sortName: "Debout",
    slug: "debout",
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
    id: "parti-gauche-republicaine-et-socialiste",
    kind: "party",
    name: "Gauche républicaine et socialiste",
    sortName: "Gauche républicaine et socialiste",
    slug: "gauche-republicaine-et-socialiste",
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
    id: "parti-les-ruches",
    kind: "party",
    name: "Les Ruches",
    sortName: "Ruches, Les",
    slug: "les-ruches",
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
    id: "parti-npa-revolutionnaires",
    kind: "party",
    name: "NPA-Révolutionnaires",
    sortName: "NPA-Révolutionnaires",
    slug: "npa-revolutionnaires",
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
    id: "parti-resistons",
    kind: "party",
    name: "Résistons",
    sortName: "Résistons",
    slug: "resistons",
    status: "active",
  },
  {
    id: "parti-revolution-permanente",
    kind: "party",
    name: "Révolution permanente",
    sortName: "Révolution permanente",
    slug: "revolution-permanente",
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
    id: "parti-trajectoire",
    kind: "party",
    name: "Trajectoire",
    sortName: "Trajectoire",
    slug: "trajectoire",
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
    id: "olivier-becht",
    kind: "candidate",
    name: "Olivier Becht",
    sortName: "Becht, Olivier",
    slug: "olivier-becht",
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
    id: "juan-branco",
    kind: "candidate",
    name: "Juan Branco",
    sortName: "Branco, Juan",
    slug: "juan-branco",
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
    id: "sylvain-pierre-durif",
    kind: "candidate",
    name: "Sylvain Pierre Durif",
    sortName: "Durif, Sylvain Pierre",
    slug: "sylvain-pierre-durif",
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
    id: "olivier-faure",
    kind: "candidate",
    name: "Olivier Faure",
    sortName: "Faure, Olivier",
    slug: "olivier-faure",
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
    id: "jerome-guedj",
    kind: "candidate",
    name: "Jérôme Guedj",
    sortName: "Guedj, Jérôme",
    slug: "jerome-guedj",
    status: "active",
  },
  {
    id: "anasse-kazib",
    kind: "candidate",
    name: "Anasse Kazib",
    sortName: "Kazib, Anasse",
    slug: "anasse-kazib",
    status: "active",
  },
  {
    id: "selma-labib",
    kind: "candidate",
    name: "Selma Labib",
    sortName: "Labib, Selma",
    slug: "selma-labib",
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
    id: "jean-lassalle",
    kind: "candidate",
    name: "Jean Lassalle",
    sortName: "Lassalle, Jean",
    slug: "jean-lassalle",
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
    id: "jean-francois-legendre",
    kind: "candidate",
    name: "Jean-François Legendre",
    sortName: "Legendre, Jean-François",
    slug: "jean-francois-legendre",
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
    id: "benoit-mathieu",
    kind: "candidate",
    name: "Benoît Mathieu",
    sortName: "Mathieu, Benoît",
    slug: "benoit-mathieu",
    status: "active",
  },
  {
    id: "emmanuel-maurel",
    kind: "candidate",
    name: "Emmanuel Maurel",
    sortName: "Maurel, Emmanuel",
    slug: "emmanuel-maurel",
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
    id: "manolo-mlekuz",
    kind: "candidate",
    name: "Manolo Mlekuz",
    sortName: "Mlekuz, Manolo",
    slug: "manolo-mlekuz",
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
    id: "gilles-platret",
    kind: "candidate",
    name: "Gilles Platret",
    sortName: "Platret, Gilles",
    slug: "gilles-platret",
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
    id: "segolene-royal",
    kind: "candidate",
    name: "Ségolène Royal",
    sortName: "Royal, Ségolène",
    slug: "segolene-royal",
    status: "active",
  },
  {
    id: "francois-ruffin",
    kind: "candidate",
    name: "François Ruffin",
    sortName: "Ruffin, François",
    slug: "francois-ruffin",
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
 * `baselineActorIds` porte le parti de chacun. La liste est un ORDRE DE
 * PRÉFÉRENCE : le moteur s'arrête au premier acteur qui documente une
 * affirmation.
 *
 * RÈGLE D'ORDRE, écrite le 25 septembre 2026 : un programme de parti publié
 * POUR 2027 passe avant le contrat du Nouveau Front populaire de 2024. Les
 * Écologistes ont publié le leur (557 mesures, été 2026) : Marine Tondelier
 * reprend donc d'abord Les Écologistes, puis le NFP pour ce que leur programme
 * ne couvre pas. Les autres partis signataires du NFP n'ont pas publié de
 * programme 2027 : leur ordre ne change pas, et changera de la même façon le
 * jour où ils le feront.
 *
 * UNE CHAÎNE VIDE EST UN CHOIX, PAS UN OUBLI. Olivier Becht se dit « sans
 * étiquette » et Ségolène Royal n'est rattachée à aucun parti par les sources
 * lues ; Gilles Platret est divers droite depuis 2024, Sylvain Pierre Durif et
 * Benoît Mathieu sont classés « Divers » sans parti nommé (12 octobre 2026) :
 * leur prêter la ligne d'un groupe parlementaire ou d'un parti d'origine
 * serait leur attribuer des positions qu'ils n'ont pas prises.
 *
 * LE NFP N'EST REPRIS QUE PAR LES PARTIS SIGNATAIRES ÉTABLIS (PS, LFI, PCF,
 * Écologistes ; voir `nfp-contrat-legislature-2024`). Olivier Faure et Jérôme
 * Guedj (PS) le reprennent ; Emmanuel Maurel (GRS) et François Ruffin (Debout)
 * non, faute d'avoir pu confirmer la signature de leur mouvement.
 */
export const CANDIDATURES = [
  {
    actorId: "nathalie-arthaud",
    status: "declared",
    baselineActorIds: ["parti-lutte-ouvriere"],
    statutDepuis: "2026-06-10",
    statutSourceIds: ["lo-arthaud-candidature-2026", "lcp-liste-candidats-2026"],
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
  // investie par la convention nationale de Génération écologie
  {
    actorId: "delphine-batho",
    status: "nominated",
    baselineActorIds: ["parti-generation-ecologie"],
    statutDepuis: "2026-06-06",
    statutSourceIds: ["ge-investiture-batho-2026", "lcp-liste-candidats-2026"],
  },
  // « Mon parti politique, c'est la France » : aucune chaîne de reprise
  {
    actorId: "olivier-becht",
    status: "declared",
    baselineActorIds: [],
    statutDepuis: "2026-09-24",
    statutSourceIds: ["cnews-becht-candidature-2026", "lcp-liste-candidats-2026"],
  },
  // date donnée par la source
  {
    actorId: "xavier-bertrand",
    status: "declared",
    baselineActorIds: ["parti-nous-france"],
    statutDepuis: "2026-08-26",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // hors de la primaire sociale-démocrate : ni LCP ni franceinfo ne le comptent parmi les cinq
  {
    actorId: "karim-bouamrane",
    status: "declared",
    baselineActorIds: ["coalition-nouveau-front-populaire", "parti-parti-socialiste"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // « C'est officiel » : invité de Sud Radio le vendredi 19 décembre 2025
  {
    actorId: "juan-branco",
    status: "declared",
    baselineActorIds: ["parti-les-ruches"],
    statutDepuis: "2025-12-19",
    statutSourceIds: ["sudradio-branco-candidature-2025", "franceinfo-candidats-declares-2026"],
  },
  // annoncée en meeting le samedi 8 mars 2025
  {
    actorId: "nicolas-dupont-aignan",
    status: "declared",
    baselineActorIds: ["parti-debout-la-france"],
    statutDepuis: "2025-03-08",
    statutSourceIds: ["dlf-nda-candidature-2025", "lcp-liste-candidats-2026"],
  },
  /*
   * « annonce fin août sa candidature » selon la source, sans le jour : la date
   * retenue est celle de la mise à jour de la liste. Classé « Divers », aucun
   * parti nommé : aucune chaîne de reprise.
   */
  {
    actorId: "sylvain-pierre-durif",
    status: "declared",
    baselineActorIds: [],
    statutDepuis: "2026-10-08",
    statutSourceIds: ["franceinfo-candidats-declares-2026"],
  },
  {
    actorId: "clara-egger",
    status: "declared",
    baselineActorIds: ["parti-solution-democratique"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026", "sd-parrainage-egger-2026"],
  },
  // battu à la primaire du 11 octobre (14,46 %) ; reste premier secrétaire du PS
  {
    actorId: "olivier-faure",
    status: "primary-defeated",
    baselineActorIds: ["coalition-nouveau-front-populaire", "parti-parti-socialiste"],
    statutDepuis: "2026-10-11",
    statutSourceIds: ["lcp-primaire-resultats-2026", "franceinfo-primaire-resultats-2026"],
  },
  /*
   * Désigné par la primaire du Parti socialiste et de Place publique, dès le
   * premier tour (66,17 %). LCP le dit « soutenu par le Parti socialiste et Place
   * publique » : le PS entre dans sa chaîne, après son propre parti. Il n'a aucune
   * position saisie, la reprise ne produit donc rien aujourd'hui. Pas de Nouveau
   * Front populaire : il exclut tout accord avec LFI.
   */
  {
    actorId: "raphael-glucksmann",
    status: "nominated",
    baselineActorIds: ["parti-place-publique", "parti-parti-socialiste"],
    statutDepuis: "2026-10-11",
    statutSourceIds: ["lcp-primaire-resultats-2026", "franceinfo-primaire-resultats-2026"],
  },
  // battu à la primaire du 11 octobre (5,83 %) ; soutient Raphaël Glucksmann
  {
    actorId: "jerome-guedj",
    status: "primary-defeated",
    baselineActorIds: ["coalition-nouveau-front-populaire", "parti-parti-socialiste"],
    statutDepuis: "2026-10-11",
    statutSourceIds: ["lcp-primaire-resultats-2026", "franceinfo-primaire-resultats-2026"],
  },
  // lancement officiel à la Fête de l'Humanité, le samedi 12 septembre 2026
  {
    actorId: "anasse-kazib",
    status: "declared",
    baselineActorIds: ["parti-revolution-permanente"],
    statutDepuis: "2026-09-12",
    statutSourceIds: ["rp-kazib-premieres-mesures-2026"],
  },
  // décision du comité politique national du NPA-R des 6 et 7 juin 2026
  {
    actorId: "selma-labib",
    status: "nominated",
    baselineActorIds: ["parti-npa-revolutionnaires"],
    statutDepuis: "2026-06-17",
    statutSourceIds: ["npar-communique-labib-2026"],
  },
  {
    actorId: "francis-lalanne",
    status: "declared",
    baselineActorIds: ["parti-france-libre"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // la liste ne date pas sa déclaration : date de mise à jour de la liste
  {
    actorId: "jean-lassalle",
    status: "declared",
    baselineActorIds: ["parti-resistons"],
    statutDepuis: "2026-10-08",
    statutSourceIds: ["franceinfo-candidats-declares-2026"],
  },
  // date donnée par la source
  {
    actorId: "marine-le-pen",
    status: "declared",
    baselineActorIds: ["parti-rassemblement-national"],
    statutDepuis: "2026-07-07",
    statutSourceIds: ["lcp-liste-candidats-2026", "touteleurope-le-pen-appel-2026"],
    reserve: {
      texte:
        "Condamnée en appel le 7 juillet 2026 et éligible, elle s'est pourvue en cassation. La Cour de cassation a annoncé statuer avant le premier tour.",
      sourceIds: ["touteleurope-le-pen-appel-2026"],
    },
  },
  // la liste ne date pas sa déclaration : date de mise à jour de la liste
  {
    actorId: "jean-francois-legendre",
    status: "declared",
    baselineActorIds: ["parti-a-nous-maintenant"],
    statutDepuis: "2026-10-08",
    statutSourceIds: ["franceinfo-candidats-declares-2026"],
  },
  {
    actorId: "david-lisnard",
    status: "declared",
    baselineActorIds: ["parti-nouvelle-energie"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  /*
   * « sillonne la France à vélo depuis mars 2026 pour récolter les 500 promesses
   * de parrainages » selon la source, sans date de déclaration : date de mise à
   * jour de la liste. Classé « Divers », aucun parti nommé.
   */
  {
    actorId: "benoit-mathieu",
    status: "declared",
    baselineActorIds: [],
    statutDepuis: "2026-10-08",
    statutSourceIds: ["franceinfo-candidats-declares-2026"],
  },
  // battu à la primaire du 11 octobre (5,92 %)
  {
    actorId: "emmanuel-maurel",
    status: "primary-defeated",
    baselineActorIds: ["parti-gauche-republicaine-et-socialiste"],
    statutDepuis: "2026-10-11",
    statutSourceIds: ["lcp-primaire-resultats-2026", "franceinfo-primaire-resultats-2026"],
  },
  {
    actorId: "jean-luc-melenchon",
    status: "declared",
    baselineActorIds: ["coalition-nouveau-front-populaire", "parti-la-france-insoumise"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // élu par les adhérents d'Équinoxe au jugement majoritaire
  {
    actorId: "antoine-mikolajczak",
    status: "nominated",
    baselineActorIds: ["parti-equinoxe"],
    statutDepuis: "2026-07-31",
    statutSourceIds: ["equinoxe-presidentielle-2027", "lcp-liste-candidats-2026"],
  },
  // la liste ne date pas sa déclaration : date de mise à jour de la liste
  {
    actorId: "manolo-mlekuz",
    status: "declared",
    baselineActorIds: ["parti-trajectoire"],
    statutDepuis: "2026-10-08",
    statutSourceIds: ["franceinfo-candidats-declares-2026"],
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
  /*
   * Officialisée en réunion publique le jeudi 8 octobre 2026. Maire divers droite,
   * ancien des Républicains : aucun parti à ce jour, aucune chaîne de reprise.
   */
  {
    actorId: "gilles-platret",
    status: "declared",
    baselineActorIds: [],
    statutDepuis: "2026-10-08",
    statutSourceIds: ["lyoncapitale-platret-candidature-2026"],
  },
  // désigné par les adhérents LR
  {
    actorId: "bruno-retailleau",
    status: "nominated",
    baselineActorIds: ["parti-les-republicains"],
    statutDepuis: "2026-09-16",
    statutSourceIds: ["lcp-liste-candidats-2026"],
  },
  // validé à 72 % par les militants, résultat publié par le PCF le 6 septembre
  {
    actorId: "fabien-roussel",
    status: "nominated",
    baselineActorIds: ["coalition-nouveau-front-populaire", "parti-parti-communiste-francais"],
    statutDepuis: "2026-09-06",
    statutSourceIds: ["pcf-roussel-designe-2026", "lcp-liste-candidats-2026"],
  },
  // battue à la primaire du 11 octobre (7,62 %) ; aucun parti rattaché par les sources lues
  {
    actorId: "segolene-royal",
    status: "primary-defeated",
    baselineActorIds: [],
    statutDepuis: "2026-10-11",
    statutSourceIds: ["lcp-primaire-resultats-2026", "franceinfo-primaire-resultats-2026"],
  },
  /*
   * Candidature annoncée sous condition — « S'il n'y a pas de primaire, moi j'y
   * vais » — et la primaire unitaire n'a pas eu lieu. `declared` avec une
   * réserve qui le dit, plutôt qu'un statut qui ferait croire à une annonce
   * sans condition, ou à une absence d'annonce.
   */
  {
    actorId: "francois-ruffin",
    status: "declared",
    baselineActorIds: ["parti-debout"],
    statutDepuis: "2026-09-24",
    statutSourceIds: ["lcp-liste-candidats-2026"],
    reserve: {
      texte:
        "Candidature annoncée sous condition : « S'il n'y a pas de primaire, moi j'y vais ». La primaire unitaire de la gauche n'a pas eu lieu.",
      sourceIds: ["lcp-liste-candidats-2026"],
    },
  },
  // investie par son parti ; programme des Écologistes avant le contrat du NFP
  {
    actorId: "marine-tondelier",
    status: "nominated",
    baselineActorIds: ["parti-les-ecologistes", "coalition-nouveau-front-populaire"],
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
