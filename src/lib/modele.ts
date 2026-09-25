/**
 * Modèle de données.
 *
 * Aucune donnée politique n'existe encore dans ce dépôt : ce fichier ne décrit
 * que les formes. Il est la référence, `CLAUDE.md` en est le résumé.
 *
 * L'entité primaire est l'acteur politique, pas le candidat : un candidat peut
 * contredire son parti, se retirer avant mars 2027, ou sortir d'une primaire.
 *
 * Pas de champs `validFrom` / `validTo` / `supersedesId` : les données sont du
 * JSON versionné dans git, et git est la table d'historique.
 */

export type ActorKind = "party" | "candidate" | "coalition" | "campaign" | "independent";

export type PoliticalActor = {
  id: string;
  kind: ActorKind;
  /** Nom affiché, tel qu'il s'écrit. */
  name: string;
  /**
   * Clé de tri alphabétique, saisie à la main.
   *
   * L'ordre d'affichage hors classement est alphabétique. Le déduire de `name`
   * est impossible de façon fiable : un nom composé, une particule, un parti
   * désigné par un sigle et une coalition ne se trient pas selon la même règle,
   * et un tri automatique produirait un ordre qui paraîtrait arbitraire — donc
   * suspect — sur un site de comparaison politique.
   *
   * La règle retenue est écrite sur `/charte-editoriale` et la valeur est
   * vérifiable dans les données publiées.
   */
  sortName: string;
  slug: string;
  status: "active" | "inactive" | "withdrawn" | "historical";
};

export type CandidateStatus =
  "potential" | "declared" | "nominated" | "official" | "withdrawn" | "eliminated" | "finalist";

export type Candidate = {
  actorId: string;
  status: CandidateStatus;
  /**
   * Acteurs dont on reprend la position à défaut de position personnelle.
   *
   * Ordre de préférence décroissant : coalition avant parti, par exemple. Le
   * moteur descend cette liste et s'arrête au premier acteur qui documente la
   * question. Une position reprise n'est JAMAIS présentée comme une déclaration
   * du candidat : le résultat porte le nom de l'acteur d'origine.
   */
  baselineActorIds: string[];
  /**
   * Date à laquelle ce statut est devenu vrai, et ses sources.
   *
   * Un statut de candidature est un fait public et datable : une déclaration,
   * une investiture, un retrait. Il s'affiche donc avec sa date, et il se
   * vérifie. Sans source, pas de statut — c'est la même règle que pour une
   * position.
   */
  statutDepuis: string;
  statutSourceIds: string[];
  /**
   * Réserve factuelle sur la candidature, sourcée et datée comme le statut.
   *
   * Un statut dit où en est la candidature ; il ne dit pas ce qui pourrait la
   * faire tomber. Une condamnation frappée de pourvoi, par exemple, laisse le
   * statut intact mais change ce qu'un lecteur doit savoir. La réserve s'écrit
   * en une phrase factuelle, sans pronostic, et ne se publie qu'avec sa source.
   */
  reserve?: { texte: string; sourceIds: string[] } | undefined;
};

/**
 * Nature du document qui porte une proposition de programme.
 *
 * Elle dit CE QUE VAUT la proposition pour 2027, pas seulement d'où elle
 * vient. Un chiffre tiré d'une proposition de loi de 2023 et le même chiffre
 * dans un programme présidentiel publié ne s'engagent pas de la même façon, et
 * l'écran doit le dire avant que le lecteur ne le suppose.
 *
 *   - `programme-2027`          : programme publié pour cette élection ;
 *   - `declaration-personnelle` : le candidat lui-même, en meeting, en entretien,
 *                                 sur son site ;
 *   - `document-parti`          : texte du parti ou de son groupe, pas
 *                                 nécessairement repris mot pour mot par le candidat ;
 *   - `travail-parlementaire`   : proposition de loi, amendement, contre-budget ;
 *   - `programme-anterieur`     : programme d'une élection précédente.
 */
export type NatureProposition =
  | "programme-2027"
  | "declaration-personnelle"
  | "document-parti"
  | "travail-parlementaire"
  | "programme-anterieur";

/**
 * Domaine d'une proposition. ÉNUMÉRATION FERMÉE : un domaine libre finirait en
 * vingt variantes du même mot, et la fiche groupe les mesures par domaine.
 */
export type DomaineProposition =
  | "travail-retraites"
  | "economie-salaires"
  | "fiscalite"
  | "immigration"
  | "ecologie"
  | "institutions"
  | "europe-international"
  | "securite-justice"
  | "sante-grand-age"
  | "education-jeunesse"
  | "famille-societe";

/**
 * Proposition de programme : ce qu'un candidat propose, HORS DES AFFIRMATIONS
 * DU TEST.
 *
 * DEUXIÈME REGISTRE, À NE PAS CONFONDRE AVEC `Stance`. Une position répond à
 * une affirmation posée à tous et entre dans le score ; une proposition décrit
 * un programme et n'entre dans aucun calcul. La plupart des mesures d'une
 * campagne — un couvre-feu numérique, un fonds d'investissement, un état
 * d'urgence contre le narcotrafic — ne correspondent à aucune affirmation :
 * sans ce registre, la fiche d'un candidat ne dirait rien de son programme.
 *
 * `portee` distingue une mesure précise d'une orientation. « Décider
 * collectivement » est un axe revendiqué, pas une mesure : le présenter comme
 * tel serait lui prêter une précision que la source n'a pas.
 */
export type Proposition = {
  id: string;
  /** Candidat, ou parti quand la proposition vient d'un document du parti. */
  actorId: string;
  domaine: DomaineProposition;
  portee: "mesure" | "orientation";
  /** Reformulation neutre et courte, écrite par l'éditeur. Jamais un slogan. */
  intitule: string;
  /** Verbatim relevé dans la source. Obligatoire : il est ce qui se vérifie. */
  citation: string;
  nature: NatureProposition;
  /** Conditions, exceptions, zones d'ombre de la source : « brut ou net non précisé ». */
  precisions?: string | undefined;
  sourceIds: string[];
  reviewStatus: "draft" | "double-coded" | "reconciled" | "published";
  updatedAt: string;
};

/**
 * Où en est le programme présidentiel d'un candidat.
 *
 * UNE ENTRÉE PAR CANDIDAT, zéro proposition compris : « aucun programme
 * publié » est une information datée, pas une case vide.
 */
export type EtatProgramme = {
  actorId: string;
  etat: "publie" | "en-construction" | "non-publie";
  /** Une ou deux phrases factuelles, sans jugement sur le contenu. */
  texte: string;
  sourceIds: string[];
};

export type StanceValue = -2 | -1 | 0 | 1 | 2;

/**
 * D'où vient l'information, du maillon le plus fort au plus faible.
 *
 * LA PRESSE EST UN MAILLON NOMMÉ, et c'est un choix assumé pris le 20 septembre
 * 2026. Tant qu'aucun programme présidentiel n'est publié — aucun ne l'est à
 * sept mois du scrutin — un comparateur qui n'accepte que les programmes ne
 * compare rien. Le concurrent le plus visible remplit ses cases avec des
 * articles de 2022 : la date y disparaît, et une position abandonnée depuis
 * quatre ans y pèse autant qu'une déclaration de la semaine. L'erreur n'est pas
 * d'utiliser la presse, c'est de ne pas dire que c'en est, et de quand elle
 * date.
 *
 * Deux maillons de presse, pas un, parce que les deux ne se vérifient pas de la
 * même façon :
 *
 *   - `press-interview` : le candidat parle, un média publie ses mots. Le
 *     verbatim est le sien. C'est aussi solide qu'une déclaration de meeting,
 *     et ça se situe donc juste après.
 *   - `press-report` : un journaliste rapporte la position au style indirect,
 *     sans verbatim disponible. La citation retenue est alors la phrase du
 *     journaliste, `rationale` doit le dire, et le maillon passe derrière le
 *     vote au Parlement — un acte se constate, une paraphrase s'interprète.
 *
 * Ni l'un ni l'autre n'autorise à inventer : une position sans source ne se
 * publie pas, et le schéma l'impose.
 */
export type StanceProvenance =
  | "official-program"
  | "direct-statement"
  | "press-interview"
  | "parliamentary-vote"
  | "press-report"
  | "party-platform"
  | "coalition-platform"
  | "inference";

/**
 * Adéquation entre la citation retenue et l'affirmation posée.
 *
 * TROISIÈME AXE, distinct de `provenance` et de `confidence`, et c'est celui qui
 * manquait. Deux positions peuvent venir d'une déclaration directe à confiance
 * haute et n'avoir rien de comparable : « lier l'âge de la retraite et
 * l'espérance de vie » EST l'affirmation posée ; « 125 milliards d'euros
 * d'économies » n'établit pas que la dette doive baisser par la dépense plutôt
 * que par la recette. La qualité de la source ne dit rien de cet écart.
 *
 *   - `directe`   : la citation porte sur la mesure exactement posée par
 *                   l'affirmation, dans un sens ou dans l'autre ;
 *   - `partielle` : elle porte sur la mesure, mais sous condition, pour une
 *                   partie seulement des personnes, ou avec un paramètre autre ;
 *   - `deduite`   : aucune citation ne porte sur la mesure ; la valeur est tirée
 *                   d'une autre position.
 *
 * C'est `adequation`, et non `provenance`, qui plafonne la valeur : hors
 * `directe`, `|value|` ne peut pas dépasser 1. Sans ce plafond, le codage le
 * moins établi pèse autant sur le score que le mieux établi — et c'est
 * exactement ce qui s'était produit dans le premier jet de `src/data/positions.ts`,
 * où les trois inférences portaient toutes la valeur maximale.
 */
export type StanceAdequation = "directe" | "partielle" | "deduite";

export type Stance = {
  id: string;
  actorId: string;
  questionId: string;
  value: StanceValue;
  provenance: StanceProvenance;
  /**
   * Confiance accordée à la SOURCE, et affichée telle quelle au lecteur.
   *
   * QUATRIÈME GRANDEUR, à ne confondre ni avec la proximité politique, ni avec
   * l'adéquation. Elle répond à « peut-on se fier à ce document ? », pas à
   * « le candidat est-il pour ou contre ? » ni à « la citation répond-elle à
   * l'affirmation ? ».
   *
   *   - `high`   : le candidat parle en son nom, le média publie ses mots, la
   *                déclaration est datée et le média est identifiable.
   *   - `medium` : position rapportée au style indirect, ou relayée par un
   *                média qui en cite un autre sans que l'original soit lisible.
   *   - `low`    : source unique, ancienne, ou dont la fiabilité est discutable.
   *
   * Elle ne pondère PAS le score : une position mal documentée ne doit pas
   * tirer mécaniquement vers le centre, cela avantagerait structurellement les
   * candidats les mieux couverts. Elle se lit, elle ne se calcule pas.
   */
  confidence: "low" | "medium" | "high";
  sourceIds: string[];
  /**
   * Verbatim court qui porte la position, tel qu'il a été prononcé ou écrit.
   *
   * C'est le champ qui distingue une position relevée d'une position rédigée.
   * Pour un `press-report`, c'est la phrase du journaliste, faute de verbatim
   * disponible, et `rationale` doit le signaler.
   *
   * Obligatoire partout SAUF pour une `inference`, seul maillon où il n'existe
   * aucune phrase à citer — et où `rationale` doit alors porter le raisonnement
   * complet. Ce n'est pas une facilité : sans citation, personne ne peut
   * contester un codage, et un codage incontestable est un codage non vérifié.
   */
  citation: string;
  adequation: StanceAdequation;
  /**
   * Maillon d'origine quand la source citée en relaie un autre.
   *
   * Un lecteur qui clique sur `sourceIds` doit savoir s'il arrive sur la parole
   * du candidat ou sur un média qui en cite un troisième. « LCP rapportant des
   * déclarations faites à l'AFP » et « LCP rapportant un entretien sur France 2 »
   * ne se vérifient pas de la même façon, et la promesse de vérifiabilité
   * s'arrête un cran trop tôt si on ne l'écrit pas.
   *
   * Texte libre et daté, pas un identifiant : le média d'origine n'est pas
   * toujours lisible ni citable, et l'inventer serait pire que de le décrire.
   */
  /*
   * `| undefined` explicite : `exactOptionalPropertyTypes` est actif, et le type
   * inféré par zod pour un champ optionnel porte `undefined`. Sans lui, la donnée
   * validée ne serait pas assignable au modèle qu'elle est censée respecter.
   */
  sourcePrimaire?: string | undefined;
  rationale: string;
  reviewStatus: "draft" | "double-coded" | "reconciled" | "published";
  updatedAt: string;
};

/**
 * Ordre d'affichage hors classement.
 *
 * `Intl.Collator` avec la locale française pour que les accents soient triés
 * comme en français, et `sensitivity: "base"` pour que la casse ne décide de
 * rien. L'égalité parfaite est départagée par `id`, afin que l'ordre soit
 * strictement déterministe : l'audit vérifie que l'ordre du JSON n'a aucun
 * effet sur les résultats.
 */
export function trierParNomAlphabetique<T extends Pick<PoliticalActor, "sortName" | "id">>(
  acteurs: readonly T[],
): T[] {
  const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: false });
  return [...acteurs].sort(
    (a, b) => collator.compare(a.sortName, b.sortName) || a.id.localeCompare(b.id),
  );
}
