/**
 * Préparation des pages publiques de données — fiches candidat, pages de
 * thème, exports ouverts —, côté serveur.
 *
 * CE MODULE NE PART JAMAIS AU NAVIGATEUR : il valide avec zod et lit les
 * données brutes, `direction` comprise. Il n'est appelé que dans le frontmatter
 * des pages `.astro`, qui ne s'exécute qu'au build. Les fiches sont du HTML
 * statique, sans îlot : leur contenu doit se lire sans JavaScript, y compris par
 * les robots d'IA qui n'en exécutent pas.
 *
 * LA POSITION AFFICHÉE EST CELLE DU MOTEUR. Elle est choisie par
 * `creerResolveur`, le même résolveur que `calculer` : une fiche ne peut donc
 * pas afficher une autre position que celle qui compte dans le résultat du
 * test. `tests/unit/resolution.test.ts` le vérifie sur les données réelles.
 */
import {
  validerQuestions,
  validerSourcesInfobulles,
  type Question,
  type SourceInfobulle,
} from "./questions";
import {
  DOMAINES_PROPOSITION,
  positionsPubliables,
  validerActeurs,
  validerCandidatures,
  validerEtatsProgramme,
  validerPositions,
  validerPropositions,
  validerSourcesPositions,
  type SourcePosition,
} from "./acteurs";
import { positionsServies } from "./previsualisation";
import { creerResolveur, NIVEAUX_RESOLUTION, type PositionResolue } from "./moteur";
import { dateAnterieureALaCampagne, SOURCE_ANTERIEURE_A_LA_CAMPAGNE_AVANT } from "./seuils";
import {
  trierParNomAlphabetique,
  type Candidate,
  type EtatProgramme,
  type PoliticalActor,
  type DomaineProposition,
  type Proposition,
  type StanceAdequation,
  type StanceValue,
} from "./modele";
import {
  ETAPES_CANDIDATURE,
  LIBELLES_DOMAINE,
  LIBELLES_ETAT_PROGRAMME,
  LIBELLES_ETAT_PROGRAMME_COURT,
  LIBELLES_NATURE_PROPOSITION,
  LIBELLES_STATUT_CANDIDATURE,
  ORDRE_NATURE_PROPOSITION,
} from "./libelles";
import { QUESTIONS, SOURCES_INFOBULLES } from "../data/questions";
import { ACTEURS, CANDIDATURES } from "../data/acteurs";
import { POSITIONS } from "../data/positions";
import { SOURCES_POSITIONS } from "../data/sources-positions";
import { ETATS_PROGRAMME, PROPOSITIONS } from "../data/programmes";
import { media } from "../data/medias";
import { THEMES_PROPOSITIONS, THEMES_PUBLIES, type Teinte } from "../data/themes";
import { ECHELLE, LIBELLES_SENS, nuanceDe, sensDe, type Sens } from "./echelle";

/*
 * Validation au build, référentielle : une position rattachée à un acteur, une
 * question ou une source qui n'existe pas arrête la construction. Faite une
 * fois au chargement du module, pas une fois par fiche.
 */
const questions = validerQuestions(QUESTIONS);
const sourcesInfobulles = validerSourcesInfobulles(SOURCES_INFOBULLES, questions);
const acteurs = validerActeurs(ACTEURS);
const sources = validerSourcesPositions(SOURCES_POSITIONS);
const candidatures = validerCandidatures(CANDIDATURES, acteurs, sources);
const toutesPositions = validerPositions(POSITIONS, { acteurs, questions, sources });
const positions = positionsServies(toutesPositions);
const toutesPropositions = validerPropositions(PROPOSITIONS, {
  acteurs,
  sources,
  seuilCampagne: SOURCE_ANTERIEURE_A_LA_CAMPAGNE_AVANT,
});
/*
 * Même règle que les positions : un brouillon n'est servi qu'en
 * prévisualisation. `positionsServies` ne regarde que `reviewStatus`, et vaut
 * donc pour les deux registres.
 */
const propositions = positionsServies(toutesPropositions);
const etatsProgramme = validerEtatsProgramme(ETATS_PROGRAMME, { candidatures, sources });

const resoudre = creerResolveur({ positions, candidatures, annuaire: acteurs });
const acteurParId = new Map(acteurs.map((acteur) => [acteur.id, acteur]));
const sourceParId = new Map(sources.map((source) => [source.id, source]));
const LIBELLE_PAR_CLE = new Map(NIVEAUX_RESOLUTION.map((niveau) => [niveau.cle, niveau.libelle]));

/** Questions dans l'ordre du test. */
const questionsOrdonnees = [...questions].sort((a, b) => a.ordre - b.ordre);

/*
 * Chaque thème du questionnaire a une adresse, et chaque adresse un thème. Un
 * thème sans slug n'aurait pas de page ; un slug sans thème serait une page
 * vide, ou pire, l'ancienne adresse d'un thème renommé qui ne mènerait plus
 * nulle part sans que personne ne le voie.
 */
const slugParTheme = new Map<string, string>(THEMES_PUBLIES.map((t) => [t.nom, t.slug]));
for (const question of questions) {
  if (!slugParTheme.has(question.theme)) {
    throw new Error(`Le thème « ${question.theme} » n'a pas d'adresse dans src/data/themes.ts.`);
  }
}
for (const theme of THEMES_PUBLIES) {
  if (!questions.some((question) => question.theme === theme.nom)) {
    throw new Error(`src/data/themes.ts déclare « ${theme.nom} », absent du questionnaire.`);
  }
}
const tousLesSlugs = [...THEMES_PUBLIES, ...THEMES_PROPOSITIONS].map((t) => t.slug);
if (new Set(tousLesSlugs).size !== tousLesSlugs.length) {
  throw new Error("Deux thèmes partagent un slug dans src/data/themes.ts.");
}

/*
 * Chaque affirmation a son intitulé court, et seulement dans son thème. Un
 * intitulé manquant laisserait un titre vide ; un intitulé rangé sous le
 * mauvais thème, un en-tête de tableau qui ne correspond à rien.
 */
const courtParQuestion = new Map<string, string>();
for (const theme of THEMES_PUBLIES) {
  for (const [id, court] of Object.entries(theme.courts)) {
    const question = questions.find((q) => q.id === id);
    if (!question || question.theme !== theme.nom) {
      throw new Error(
        `Intitulé court « ${court} » : ${id} n'est pas une affirmation de « ${theme.nom} ».`,
      );
    }
    courtParQuestion.set(id, court);
  }
}
for (const question of questions) {
  if (!courtParQuestion.has(question.id)) {
    throw new Error(
      `L'affirmation ${question.id} n'a pas d'intitulé court dans src/data/themes.ts.`,
    );
  }
}

/*
 * Chaque domaine de programme appartient à un thème, et à un seul : sinon une
 * proposition apparaîtrait sur deux pages, ou sur aucune.
 */
const domainesRattaches = [...THEMES_PUBLIES, ...THEMES_PROPOSITIONS].map((t) => t.domaine);
for (const domaine of DOMAINES_PROPOSITION) {
  const nombre = domainesRattaches.filter((d) => d === domaine).length;
  if (nombre !== 1) {
    throw new Error(
      `Le domaine « ${domaine} » est rattaché à ${nombre} thèmes dans src/data/themes.ts.`,
    );
  }
}

/** Habillage d'un thème : son pictogramme Phosphor et sa teinte. */
export type HabillageTheme = { nom: string; slug: string; icone: string; teinte: Teinte };

const themeTestParNom = new Map<string, (typeof THEMES_PUBLIES)[number]>(
  THEMES_PUBLIES.map((t) => [t.nom, t]),
);

/** Thèmes dans l'ordre où le test les pose, avec leur adresse et leur habillage. */
export const THEMES: readonly HabillageTheme[] = [
  ...new Set(questionsOrdonnees.map((q) => q.theme)),
].map((nom) => {
  const theme = themeTestParNom.get(nom)!;
  return { nom, slug: theme.slug, icone: theme.icone, teinte: theme.teinte };
});

export const NOMBRE_AFFIRMATIONS = questions.length;

/**
 * Parti d'un candidat : LE PREMIER ACTEUR DE TYPE `party` de sa chaîne de
 * reprise, et non le premier tout court.
 *
 * La nuance est apparue le jour où une coalition est entrée dans la chaîne :
 * `baselineActorIds[0]` valait alors « Nouveau Front populaire », et l'écran
 * affichait cette coalition dissoute à la place du parti sous le nom de quatre
 * candidats. Une coalition n'est pas une appartenance ; elle explique d'où
 * vient une POSITION, pas qui est le candidat.
 */
export function partiDe(
  candidature: Pick<Candidate, "baselineActorIds"> | undefined,
  annuaire: readonly Pick<PoliticalActor, "id" | "kind">[] = acteurs,
): string | null {
  const partis = new Set(annuaire.filter((a) => a.kind === "party").map((a) => a.id));
  return candidature?.baselineActorIds.find((id) => partis.has(id)) ?? null;
}

/** Une affirmation et, si elle existe, la position retenue pour le candidat. */
export type EntreeFiche = {
  /** Question projetée : jamais `direction`. */
  question: Pick<Question, "id" | "texte" | "theme">;
  resolue: PositionResolue | null;
  /** Libellé du maillon de la chaîne de résolution employé. */
  origine: string | null;
  sources: SourcePosition[];
  /** Date à signaler si toutes les sources précèdent la campagne. */
  dateAncienne: string | null;
};

/** Une proposition prête à afficher : ses sources résolues, ses libellés, sa date. */
export type PropositionFiche = Proposition & {
  sources: SourcePosition[];
  /** Nom du parti quand la proposition vient d'un document du parti, sinon `null`. */
  auteur: string | null;
  natureLibelle: string;
  domaineLibelle: string;
  /** Date de la source la plus récente : celle qu'on affiche. */
  date: string;
  /** Date à signaler si toutes les sources précèdent la campagne. */
  dateAncienne: string | null;
};

/** Où en est la candidature : le tag de la liste et de la fiche. */
export type EtapeFiche = {
  /** 1 à 4, ou `null` pour une candidature close. */
  rang: 1 | 2 | 3 | 4 | null;
  court: string;
  /** Libellé complet du statut, celui de `LIBELLES_STATUT_CANDIDATURE`. */
  long: string;
};

export type Fiche = {
  acteur: PoliticalActor;
  candidature: Candidate;
  statutSources: SourcePosition[];
  etape: EtapeFiche;
  reserve: { texte: string; sources: SourcePosition[] } | null;
  programme: {
    etat: EtatProgramme["etat"];
    libelle: string;
    court: string;
    texte: string;
    sources: SourcePosition[];
  };
  /** Mesures précises, groupées par domaine dans l'ordre de l'énumération. */
  mesures: { domaine: string; libelle: string; propositions: PropositionFiche[] }[];
  orientations: PropositionFiche[];
  /** Nombre total de propositions affichées, mesures et orientations. */
  nombrePropositions: number;
  /** Trois propositions au plus pour l'aperçu de la liste. Règle : `ordrePropositions`. */
  apercu: PropositionFiche[];
  parti: { nom: string; logo: string | null } | null;
  portrait: string | null;
  /** Affirmations documentées, regroupées par thème dans l'ordre du test. */
  parTheme: { theme: HabillageTheme; entrees: EntreeFiche[] }[];
  /** Affirmations sans aucune position, dans l'ordre du test. */
  inconnues: Pick<Question, "id" | "texte" | "theme">[];
  documentees: number;
  personnelles: number;
  /**
   * De quel côté tombent ses positions : pour, contre, ni l'un ni l'autre, et
   * combien d'affirmations sans position connue. Même lecture que les pages de
   * thème (`sensDe`), calculée une fois pour la liste et la fiche.
   */
  bilan: Record<Sens | "inconnu", number>;
  /** Positions reprises, par acteur d'origine, dans l'ordre de la chaîne. */
  reprises: { nom: string; nombre: number }[];
  /** Date de la donnée la plus récente de la fiche. */
  misAJour: string;
};

const RANG_NATURE = new Map(ORDRE_NATURE_PROPOSITION.map((nature, rang) => [nature, rang]));
const etatParActeur = new Map(etatsProgramme.map((etat) => [etat.actorId, etat]));

function resoudreSources(ids: readonly string[]): SourcePosition[] {
  return ids
    .map((id) => sourceParId.get(id))
    .filter((source): source is SourcePosition => source !== undefined);
}

function propositionFiche(proposition: Proposition, candidatId: string): PropositionFiche {
  const sourcesProposition = resoudreSources(proposition.sourceIds);
  const dates = sourcesProposition.map((source) => source.dateDeclaration);
  return {
    ...proposition,
    sources: sourcesProposition,
    auteur:
      proposition.actorId === candidatId
        ? null
        : (acteurParId.get(proposition.actorId)?.name ?? proposition.actorId),
    natureLibelle: LIBELLES_NATURE_PROPOSITION[proposition.nature],
    domaineLibelle: LIBELLES_DOMAINE[proposition.domaine],
    date: dates.reduce((a, b) => (a > b ? a : b)),
    dateAncienne: dateAnterieureALaCampagne(dates),
  };
}

/**
 * ORDRE DES PROPOSITIONS, et donc de l'aperçu : une règle mécanique, publiée
 * sur `/methodologie`, jamais un choix de « mesures phares ».
 *
 *   1. une mesure avant une orientation ;
 *   2. la nature la plus engageante pour 2027 d'abord (`ORDRE_NATURE_PROPOSITION`) ;
 *   3. la plus récente d'abord ;
 *   4. l'identifiant, pour que l'ordre ne dépende jamais de celui du fichier.
 */
export function ordrePropositions(a: PropositionFiche, b: PropositionFiche): number {
  return (
    Number(a.portee === "orientation") - Number(b.portee === "orientation") ||
    (RANG_NATURE.get(a.nature) ?? 99) - (RANG_NATURE.get(b.nature) ?? 99) ||
    b.date.localeCompare(a.date) ||
    a.id.localeCompare(b.id)
  );
}

/**
 * Propositions d'un candidat : les siennes, puis celles des acteurs de sa
 * chaîne de reprise, qui restent nommées comme telles. Un contre-budget de
 * groupe parlementaire n'est pas un engagement personnel, mais c'est la
 * matière la plus proche d'un programme dont on dispose pour certains
 * candidats ; le taire serait aussi trompeur que le leur attribuer.
 */
function propositionsDe(candidature: Candidate): PropositionFiche[] {
  const auteurs = new Set([candidature.actorId, ...candidature.baselineActorIds]);
  return propositions
    .filter((proposition) => auteurs.has(proposition.actorId))
    .map((proposition) => propositionFiche(proposition, candidature.actorId))
    .sort(ordrePropositions);
}

function fiche(candidature: Candidate): Fiche {
  const acteur = acteurParId.get(candidature.actorId)!;
  const partiId = partiDe(candidature);

  const entrees: EntreeFiche[] = questionsOrdonnees.map((question) => {
    const resolue = resoudre(acteur.id, question.id);
    const sourcesPosition = (resolue?.position.sourceIds ?? [])
      .map((id) => sourceParId.get(id))
      .filter((source): source is SourcePosition => source !== undefined);
    return {
      question: { id: question.id, texte: question.texte, theme: question.theme },
      resolue,
      origine: resolue ? (LIBELLE_PAR_CLE.get(resolue.position.provenance) ?? null) : null,
      sources: sourcesPosition,
      dateAncienne: dateAnterieureALaCampagne(sourcesPosition.map((s) => s.dateDeclaration)),
    };
  });

  const documentees = entrees.filter((entree) => entree.resolue !== null);

  const reprises = candidature.baselineActorIds
    .map((id) => ({
      nom: acteurParId.get(id)?.name ?? id,
      nombre: documentees.filter((entree) => entree.resolue?.heriteDeId === id).length,
    }))
    .filter((reprise) => reprise.nombre > 0);

  const dates = [
    candidature.statutDepuis,
    ...documentees.map((entree) => entree.resolue!.position.updatedAt),
    ...propositionsDe(candidature).map((proposition) => proposition.updatedAt),
  ];

  const etatProgramme = etatParActeur.get(acteur.id)!;
  const toutes = propositionsDe(candidature);
  const mesures = toutes.filter((proposition) => proposition.portee === "mesure");

  return {
    acteur,
    candidature,
    statutSources: resoudreSources(candidature.statutSourceIds),
    etape: {
      ...ETAPES_CANDIDATURE[candidature.status],
      long: LIBELLES_STATUT_CANDIDATURE[candidature.status],
    },
    reserve: candidature.reserve
      ? {
          texte: candidature.reserve.texte,
          sources: resoudreSources(candidature.reserve.sourceIds),
        }
      : null,
    programme: {
      etat: etatProgramme.etat,
      libelle: LIBELLES_ETAT_PROGRAMME[etatProgramme.etat],
      court: LIBELLES_ETAT_PROGRAMME_COURT[etatProgramme.etat],
      texte: etatProgramme.texte,
      sources: resoudreSources(etatProgramme.sourceIds),
    },
    mesures: DOMAINES_PROPOSITION.map((domaine) => ({
      domaine,
      libelle: LIBELLES_DOMAINE[domaine],
      propositions: mesures.filter((proposition) => proposition.domaine === domaine),
    })).filter((groupe) => groupe.propositions.length > 0),
    orientations: toutes.filter((proposition) => proposition.portee === "orientation"),
    nombrePropositions: toutes.length,
    apercu: toutes.slice(0, 3),
    parti:
      partiId === null
        ? null
        : {
            nom: acteurParId.get(partiId)?.name ?? partiId,
            logo: media("logo", partiId)?.chemin ?? null,
          },
    portrait: media("portrait", acteur.id)?.chemin ?? null,
    parTheme: THEMES.map((theme) => ({
      theme,
      entrees: documentees.filter((entree) => entree.question.theme === theme.nom),
    })).filter((groupe) => groupe.entrees.length > 0),
    inconnues: entrees.filter((entree) => entree.resolue === null).map((entree) => entree.question),
    documentees: documentees.length,
    bilan: {
      pour: documentees.filter((e) => sensDe(e.resolue!.position.value) === "pour").length,
      contre: documentees.filter((e) => sensDe(e.resolue!.position.value) === "contre").length,
      neutre: documentees.filter((e) => sensDe(e.resolue!.position.value) === "neutre").length,
      inconnu: entrees.length - documentees.length,
    },
    personnelles: documentees.filter((entree) => entree.resolue!.heriteDeId === null).length,
    reprises,
    misAJour: dates.reduce((a, b) => (a > b ? a : b)),
  };
}

/**
 * Toutes les fiches, candidats retirés compris.
 *
 * UN RETRAIT NE SUPPRIME PAS LA PAGE : `CLAUDE.md` demande de la conserver avec
 * le statut « candidature retirée » et son historique. Une URL qui disparaît
 * casse les liens entrants et laisse croire qu'on efface ce qui dérange.
 *
 * Ordre alphabétique par `sortName`, la règle publiée sur `/charte-editoriale`.
 */
export function fiches(): Fiche[] {
  const candidatureParActeur = new Map(candidatures.map((c) => [c.actorId, c]));
  return trierParNomAlphabetique(acteurs.filter((a) => candidatureParActeur.has(a.id))).map(
    (acteur) => fiche(candidatureParActeur.get(acteur.id)!),
  );
}

/**
 * Candidature toujours en cours.
 *
 * Un candidat retiré ou éliminé garde sa fiche, mais ne figure plus dans les
 * pages qui comparent les candidats en lice : l'y laisser ferait croire qu'il
 * l'est encore.
 */
export function estEnLice(candidature: Pick<Candidate, "status">): boolean {
  return candidature.status !== "withdrawn" && candidature.status !== "eliminated";
}

/** Un candidat nommé dans une page de thème, et ce qu'il faut savoir de sa position. */
export type CandidatCite = {
  nom: string;
  slug: string;
  /** Chemin du portrait libre, ou `null` : le composant affiche alors les initiales. */
  portrait: string | null;
  /** Valeur retenue par le moteur, `null` pour un candidat sans position. */
  valeur: StanceValue | null;
  /** « Plutôt » pour ±1 : la seule nuance que le regroupement pour/contre efface. */
  nuance: string | null;
  /** Acteur d'origine quand la position est reprise, sinon `null`. */
  heriteDe: string | null;
  /**
   * Adéquation de la citation, `null` pour un candidat sans position.
   *
   * Remontée jusqu'à la page de thème, où elle est affichée sous le nom :
   * « plutôt pour » sur une citation partielle ne se lit pas comme « plutôt
   * pour » sur la mesure exacte, et un résumé automatique de la page ne verrait
   * pas la différence si elle n'était pas écrite.
   */
  adequation: StanceAdequation | null;
};

export type AffirmationTheme = {
  question: Pick<Question, "id" | "texte" | "infobulle">;
  /** Intitulé court, saisi dans `src/data/themes.ts`. */
  court: string;
  definitionSource: SourceInfobulle;
  pour: CandidatCite[];
  contre: CandidatCite[];
  neutre: CandidatCite[];
  inconnus: CandidatCite[];
  /**
   * La réponse en une phrase, en texte visible : c'est elle qu'un moteur ou un
   * assistant extrait. Générée depuis les mêmes groupes que le tableau, elle ne
   * peut pas le contredire.
   */
  enBref: string;
};

/** Propositions d'un candidat sur un domaine, pour la section « Ce qu'ils proposent ». */
export type PropositionsCandidat = {
  nom: string;
  slug: string;
  portrait: string | null;
  propositions: PropositionFiche[];
};

type BaseTheme = HabillageTheme & {
  domaine: DomaineProposition;
  /** Nombre de candidats en lice : le dénominateur de chaque compte de la page. */
  enLice: number;
  /** Candidats en lice, dans l'ordre alphabétique des fiches (`sortName`). */
  candidats: { nom: string; slug: string; portrait: string | null }[];
  /** Propositions du domaine, groupées par candidat dans l'ordre alphabétique. */
  parCandidat: PropositionsCandidat[];
  nombrePropositions: number;
  /**
   * Date de la donnée la plus récente du thème. Tant que rien n'y est codé,
   * date de la plus récente candidature listée : c'est la dernière fois que
   * le contenu de la page a changé.
   */
  misAJour: string;
};

export type PageTheme = BaseTheme & {
  type: "test";
  affirmations: AffirmationTheme[];
};

export type PageThemePropositions = BaseTheme & {
  type: "propositions";
  /** Candidats en lice sans aucune proposition relevée sur ce domaine : nommés, pas omis. */
  sansProposition: { nom: string; slug: string; portrait: string | null }[];
  /**
   * `false` sous `SEUIL_INDEXATION` propositions. La page existe et se lit,
   * mais une page de deux lignes n'a rien à faire dans un moteur ; elle entre
   * seule dans le sitemap quand les relevés s'étoffent.
   */
  indexable: boolean;
};

export type ThemeQuelconque = PageTheme | PageThemePropositions;

/** En dessous, une page de propositions reste hors de l'index. */
export const SEUIL_INDEXATION = 3;

/** « A », « A et B », « A, B et C ». */
function enumerer(noms: readonly string[]): string {
  if (noms.length <= 1) return noms.join("");
  return `${noms.slice(0, -1).join(", ")} et ${noms.at(-1)}`;
}

function nomAvecNuance(cite: CandidatCite): string {
  return cite.nuance ? `${cite.nom} (${cite.nuance.toLowerCase()})` : cite.nom;
}

/**
 * Une colonne en une phrase : d'abord les positions personnelles, puis les
 * positions reprises, regroupées par parti ou coalition d'origine. Regroupées,
 * parce que « position reprise : Nouveau Front populaire » répété six fois
 * noyait la réponse ; nommées, parce qu'une ligne de parti n'est pas une
 * déclaration du candidat et qu'un résumé automatique doit pouvoir le dire.
 */
function phraseColonne(libelle: string, cites: readonly CandidatCite[]): string {
  if (cites.length === 0) return `${libelle} : aucun.`;
  const personnelles = cites.filter((cite) => cite.heriteDe === null).map(nomAvecNuance);
  const origines = [...new Set(cites.map((cite) => cite.heriteDe).filter((o) => o !== null))];
  const reprises = origines.map(
    (origine) =>
      `${enumerer(cites.filter((cite) => cite.heriteDe === origine).map(nomAvecNuance))} [${origine}]`,
  );
  if (reprises.length === 0) return `${libelle} : ${enumerer(personnelles)}.`;
  /* Point-virgule entre deux origines : « A et B [NFP] et C [LR] » ne dirait plus qui reprend quoi. */
  const partReprise = `par la position reprise d'un parti ou d'une coalition, ${reprises.join(" ; ")}`;
  return personnelles.length === 0
    ? `${libelle}, ${partReprise}.`
    : `${libelle} : ${enumerer(personnelles)}, ainsi que, ${partReprise}.`;
}

/**
 * Phrase « En bref » d'une affirmation. Pour et contre sont toujours dits, même
 * vides (« aucun ») : les taire laisserait croire qu'on a oublié de chercher.
 * « Ni pour ni contre » n'est dit que s'il compte quelqu'un, comme la colonne
 * du tableau : c'est le cran le plus rare, et « aucun » répété sous chaque
 * affirmation noierait la réponse.
 */
export function phraseEnBref(
  groupes: Pick<AffirmationTheme, "pour" | "contre" | "neutre" | "inconnus">,
): string {
  const connus = groupes.pour.length + groupes.contre.length + groupes.neutre.length;
  const total = connus + groupes.inconnus.length;
  if (connus === 0) {
    return `Aucune position connue parmi les ${total} candidats en lice.`;
  }
  const inconnus =
    groupes.inconnus.length === 0
      ? ""
      : ` ${groupes.inconnus.length} ${groupes.inconnus.length === 1 ? "candidat" : "candidats"} sans position connue.`;
  return [
    phraseColonne(LIBELLES_SENS.pour, groupes.pour),
    phraseColonne(LIBELLES_SENS.contre, groupes.contre),
    groupes.neutre.length > 0 ? phraseColonne(LIBELLES_SENS.neutre, groupes.neutre) : null,
  ]
    .filter((phrase) => phrase !== null)
    .join(" ")
    .concat(inconnus);
}

/*
 * Dans une colonne, la position nette avant la nuancée : « tout à fait » avant
 * « plutôt », de part et d'autre, comme l'échelle du test lue depuis ses
 * extrémités. C'est l'ordre des crans, pas un classement des personnes : le tri
 * est stable, et à cran égal l'ordre alphabétique des fiches est conservé.
 */
function parNettete(a: CandidatCite, b: CandidatCite): number {
  return Math.abs(b.valeur ?? 0) - Math.abs(a.valeur ?? 0);
}

function identite(fiche: Fiche): { nom: string; slug: string; portrait: string | null } {
  return { nom: fiche.acteur.name, slug: fiche.acteur.slug, portrait: fiche.portrait };
}

function candidatsEnLice(): Fiche[] {
  return fiches().filter((fiche) => estEnLice(fiche.candidature));
}

/** Propositions du domaine pour les candidats en lice, et la date la plus récente. */
function propositionsDuDomaine(
  enLice: readonly Fiche[],
  domaine: DomaineProposition,
): { parCandidat: PropositionsCandidat[]; nombre: number; dates: string[] } {
  const parCandidat = enLice
    .map((fiche) => ({
      nom: fiche.acteur.name,
      slug: fiche.acteur.slug,
      portrait: fiche.portrait,
      propositions: propositionsDe(fiche.candidature).filter((p) => p.domaine === domaine),
    }))
    .filter((entree) => entree.propositions.length > 0);
  const toutes = parCandidat.flatMap((entree) => entree.propositions);
  return {
    parCandidat,
    /* Une proposition de parti reprise par deux candidats se compte une fois. */
    nombre: new Set(toutes.map((p) => p.id)).size,
    dates: toutes.map((p) => p.updatedAt),
  };
}

/**
 * Pages de thème du test : pour chaque affirmation, qui est pour, qui est
 * contre, qui n'est ni l'un ni l'autre, et pour qui on ne sait pas.
 *
 * AUCUNE CITATION ICI. Le verbatim, la source et le niveau de confiance vivent
 * sur la fiche du candidat, et la page de thème y renvoie par une ancre. Les
 * répéter produirait deux pages au contenu identique, ce que le cahier des
 * charges interdit et que les moteurs sanctionnent.
 *
 * ORDRE. Dans chaque colonne, le cran de l'échelle (« tout à fait » puis
 * « plutôt »), puis l'ordre alphabétique : un candidat n'est jamais placé
 * avant un autre pour une autre raison.
 */
export function pagesThemes(): PageTheme[] {
  const enLice = candidatsEnLice();
  const sourceParIdInfobulle = new Map(sourcesInfobulles.map((source) => [source.id, source]));

  return THEMES.map((theme): PageTheme => {
    const dates: string[] = enLice.map((fiche) => fiche.candidature.statutDepuis);
    const domaine = themeTestParNom.get(theme.nom)!.domaine;

    const affirmations = questionsOrdonnees
      .filter((question) => question.theme === theme.nom)
      .map((question): AffirmationTheme => {
        const cites: CandidatCite[] = enLice.map((fiche) => {
          const resolue = resoudre(fiche.acteur.id, question.id);
          if (resolue) dates.push(resolue.position.updatedAt);
          return {
            nom: fiche.acteur.name,
            slug: fiche.acteur.slug,
            portrait: fiche.portrait,
            valeur: resolue?.position.value ?? null,
            nuance: resolue ? nuanceDe(resolue.position.value) : null,
            heriteDe: resolue?.heriteDe ?? null,
            adequation: resolue?.position.adequation ?? null,
          };
        });

        const dansLeSens = (sens: Sens) =>
          cites.filter((c) => c.valeur !== null && sensDe(c.valeur) === sens).sort(parNettete);
        const groupes = {
          pour: dansLeSens("pour"),
          contre: dansLeSens("contre"),
          neutre: dansLeSens("neutre"),
          inconnus: cites.filter((c) => c.valeur === null),
        };

        return {
          question: { id: question.id, texte: question.texte, infobulle: question.infobulle },
          court: courtParQuestion.get(question.id)!,
          definitionSource: sourceParIdInfobulle.get(question.infobulleSourceId)!,
          ...groupes,
          enBref: phraseEnBref(groupes),
        };
      });

    const propositionsTheme = propositionsDuDomaine(enLice, domaine);
    dates.push(...propositionsTheme.dates);

    return {
      type: "test",
      ...theme,
      domaine,
      enLice: enLice.length,
      candidats: enLice.map(identite),
      affirmations,
      parCandidat: propositionsTheme.parCandidat,
      nombrePropositions: propositionsTheme.nombre,
      misAJour: dates.reduce((a, b) => (a > b ? a : b)),
    };
  });
}

/**
 * Pages des thèmes hors test : ce que les candidats proposent sur un domaine
 * qu'aucune affirmation ne couvre encore.
 *
 * NI POUR NI CONTRE ICI. Sans affirmation, il n'y a rien à quoi être pour ou
 * contre ; la page liste des propositions sourcées, attribuées, datées, et
 * nomme les candidats pour qui rien n'a été relevé.
 */
export function pagesThemesPropositions(): PageThemePropositions[] {
  const enLice = candidatsEnLice();
  return THEMES_PROPOSITIONS.map((theme): PageThemePropositions => {
    const { parCandidat, nombre, dates } = propositionsDuDomaine(enLice, theme.domaine);
    const avecProposition = new Set(parCandidat.map((entree) => entree.slug));
    return {
      type: "propositions",
      nom: theme.nom,
      slug: theme.slug,
      icone: theme.icone,
      teinte: theme.teinte,
      domaine: theme.domaine,
      enLice: enLice.length,
      candidats: enLice.map(identite),
      parCandidat,
      nombrePropositions: nombre,
      sansProposition: enLice
        .filter((fiche) => !avecProposition.has(fiche.acteur.slug))
        .map(identite),
      indexable: nombre >= SEUIL_INDEXATION,
      misAJour: [...enLice.map((fiche) => fiche.candidature.statutDepuis), ...dates].reduce(
        (a, b) => (a > b ? a : b),
      ),
    };
  });
}

/** Tous les thèmes : ceux du test dans l'ordre du test, puis les autres. */
export function tousLesThemes(): ThemeQuelconque[] {
  return [...pagesThemes(), ...pagesThemesPropositions()];
}

/**
 * Données ouvertes, telles qu'elles sont exportées sous `/donnees`.
 *
 * `positionsPubliables`, et non `positionsServies` : le mode prévisualisation
 * sert les brouillons aux pages pour qu'on puisse les relire, mais un export
 * est fait pour être copié ailleurs, et un brouillon copié ailleurs ne se
 * retire plus. En production, les deux listes sont identiques.
 *
 * `direction` EST RETIRÉ DES QUESTIONS. Il ne sert qu'à l'audit d'équilibre et
 * ne doit jamais être montré : l'exporter, c'est le publier.
 */
export const DONNEES_OUVERTES = {
  questions: questionsOrdonnees.map(
    ({ id, theme, texte, infobulle, infobulleSourceId, version, ordre }) => ({
      id,
      theme,
      themeSlug: slugParTheme.get(theme)!,
      texte,
      infobulle,
      infobulleSourceId,
      version,
      ordre,
    }),
  ),
  sourcesInfobulles,
  acteurs,
  candidatures,
  sourcesPositions: sources,
  positions: positionsPubliables(toutesPositions),
  /** Hors score : elles ne servent à aucun calcul, et l'export le dit par son nom. */
  propositions: positionsPubliables(toutesPropositions),
  etatsProgramme,
};

/** Date de la donnée la plus récente de l'export. */
export const DONNEES_MISES_A_JOUR = [
  ...DONNEES_OUVERTES.positions.map((position) => position.updatedAt),
  ...DONNEES_OUVERTES.propositions.map((proposition) => proposition.updatedAt),
  ...DONNEES_OUVERTES.candidatures.map((candidature) => candidature.statutDepuis),
].reduce((a, b) => (a > b ? a : b));

/** Position retenue pour un couple candidat/affirmation, telle que le test la compte. */
export type PositionRetenue = {
  candidatId: string;
  candidatNom: string;
  questionId: string;
  affirmation: string;
  theme: string;
  valeur: number;
  valeurLibelle: string;
  origine: string;
  /** Acteur dont la position est reprise, ou `null` si elle est personnelle. */
  repriseDeId: string | null;
  repriseDeNom: string | null;
  adequation: StanceAdequation;
  confiance: string;
  positionId: string;
};

/**
 * Vue « position retenue », une ligne par couple candidat/affirmation documenté.
 *
 * C'est la table qu'un journaliste ou un assistant veut lire, et c'est aussi la
 * plus facile à reconstruire de travers : il faut descendre la chaîne de
 * résolution et la chaîne de reprise dans le bon ordre. Elle est donc publiée
 * toute faite, calculée par le même résolveur que le test, plutôt que laissée
 * à chaque réutilisateur.
 */
export function positionsRetenues(): PositionRetenue[] {
  const resoudrePublie = creerResolveur({
    positions: DONNEES_OUVERTES.positions,
    candidatures,
    annuaire: acteurs,
  });
  const libelleValeur = new Map(ECHELLE.map((cran) => [cran.valeur, cran.libelle]));

  return fiches().flatMap((fiche) =>
    questionsOrdonnees.flatMap((question) => {
      const resolue = resoudrePublie(fiche.acteur.id, question.id);
      if (resolue === null) return [];
      const { position } = resolue;
      return [
        {
          candidatId: fiche.acteur.id,
          candidatNom: fiche.acteur.name,
          questionId: question.id,
          affirmation: question.texte,
          theme: question.theme,
          valeur: position.value,
          valeurLibelle: libelleValeur.get(position.value)!,
          origine: LIBELLE_PAR_CLE.get(position.provenance) ?? position.provenance,
          repriseDeId: resolue.heriteDeId,
          repriseDeNom: resolue.heriteDe,
          adequation: position.adequation,
          confiance: position.confidence,
          positionId: position.id,
        },
      ];
    }),
  );
}
