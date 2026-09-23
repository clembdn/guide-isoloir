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
  positionsPubliables,
  validerActeurs,
  validerCandidatures,
  validerPositions,
  validerSourcesPositions,
  type SourcePosition,
} from "./acteurs";
import { positionsServies } from "./previsualisation";
import { creerResolveur, NIVEAUX_RESOLUTION, type PositionResolue } from "./moteur";
import { dateAnterieureALaCampagne } from "./seuils";
import {
  trierParNomAlphabetique,
  type Candidate,
  type PoliticalActor,
  type StanceAdequation,
} from "./modele";
import { QUESTIONS, SOURCES_INFOBULLES } from "../data/questions";
import { ACTEURS, CANDIDATURES } from "../data/acteurs";
import { POSITIONS } from "../data/positions";
import { SOURCES_POSITIONS } from "../data/sources-positions";
import { media } from "../data/medias";
import { THEMES_PUBLIES } from "../data/themes";
import { ECHELLE } from "./echelle";

/*
 * Validation au build, référentielle : une position rattachée à un acteur, une
 * question ou une source qui n'existe pas arrête la construction. Faite une
 * fois au chargement du module, pas une fois par fiche.
 */
const questions = validerQuestions(QUESTIONS);
const sourcesInfobulles = validerSourcesInfobulles(SOURCES_INFOBULLES, questions);
const acteurs = validerActeurs(ACTEURS);
const candidatures = validerCandidatures(CANDIDATURES, acteurs);
const sources = validerSourcesPositions(SOURCES_POSITIONS);
const toutesPositions = validerPositions(POSITIONS, { acteurs, questions, sources });
const positions = positionsServies(toutesPositions);

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
if (new Set(THEMES_PUBLIES.map((t) => t.slug)).size !== THEMES_PUBLIES.length) {
  throw new Error("Deux thèmes partagent un slug dans src/data/themes.ts.");
}

/** Thèmes dans l'ordre où le test les pose, avec leur adresse. */
export const THEMES: readonly { nom: string; slug: string }[] = [
  ...new Set(questionsOrdonnees.map((q) => q.theme)),
].map((nom) => ({ nom, slug: slugParTheme.get(nom)! }));

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

export type Fiche = {
  acteur: PoliticalActor;
  candidature: Candidate;
  statutSources: SourcePosition[];
  parti: { nom: string; logo: string | null } | null;
  portrait: string | null;
  /** Affirmations documentées, regroupées par thème dans l'ordre du test. */
  parTheme: { theme: { nom: string; slug: string }; entrees: EntreeFiche[] }[];
  /** Affirmations sans aucune position, dans l'ordre du test. */
  inconnues: Pick<Question, "id" | "texte" | "theme">[];
  documentees: number;
  personnelles: number;
  /** Positions reprises, par acteur d'origine, dans l'ordre de la chaîne. */
  reprises: { nom: string; nombre: number }[];
  /** Date de la donnée la plus récente de la fiche. */
  misAJour: string;
};

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
  ];

  return {
    acteur,
    candidature,
    statutSources: candidature.statutSourceIds
      .map((id) => sourceParId.get(id))
      .filter((source): source is SourcePosition => source !== undefined),
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
  /** Acteur d'origine quand la position est reprise, sinon `null`. */
  heriteDe: string | null;
  /**
   * Adéquation de la citation, `null` pour un candidat sans position.
   *
   * Remontée jusqu'à la page de thème, où elle est la seule nuance affichée à
   * côté du nom : « plutôt d'accord » sur une citation partielle ne se lit pas
   * comme « plutôt d'accord » sur la mesure exacte, et un résumé automatique de
   * la page ne verrait pas la différence si elle n'était pas écrite.
   */
  adequation: StanceAdequation | null;
};

export type AffirmationTheme = {
  question: Pick<Question, "id" | "texte" | "infobulle">;
  definitionSource: SourceInfobulle;
  /** Un groupe par cran de l'échelle, dans l'ordre du test ; vides compris. */
  groupes: { libelle: string; candidats: CandidatCite[] }[];
  inconnus: CandidatCite[];
};

export type PageTheme = {
  nom: string;
  slug: string;
  affirmations: AffirmationTheme[];
  /**
   * Date du codage le plus récent du thème. Tant que rien n'y est codé, date
   * de la plus récente candidature listée : c'est la dernière fois que le
   * contenu de la page a changé.
   */
  misAJour: string;
};

/**
 * Pages de thème : pour chaque affirmation, qui en est où.
 *
 * AUCUNE CITATION ICI. Le verbatim, la source et le niveau de confiance vivent
 * sur la fiche du candidat, et la page de thème y renvoie par une ancre. Les
 * répéter produirait deux pages au contenu identique, ce que le cahier des
 * charges interdit et que les moteurs sanctionnent.
 *
 * GROUPES DANS L'ORDRE DE L'ÉCHELLE, du plein accord au plein désaccord, le
 * même que celui du test. À l'intérieur d'un groupe, l'ordre alphabétique : un
 * candidat n'est jamais placé avant un autre pour une autre raison.
 */
export function pagesThemes(): PageTheme[] {
  const enLice = fiches().filter((fiche) => estEnLice(fiche.candidature));
  const sourceParIdInfobulle = new Map(sourcesInfobulles.map((source) => [source.id, source]));

  return THEMES.map((theme) => {
    const dates: string[] = enLice.map((fiche) => fiche.candidature.statutDepuis);

    const affirmations = questionsOrdonnees
      .filter((question) => question.theme === theme.nom)
      .map((question): AffirmationTheme => {
        const cites = enLice.map((fiche) => ({
          cite: {
            nom: fiche.acteur.name,
            slug: fiche.acteur.slug,
            heriteDe: null as string | null,
            adequation: null as StanceAdequation | null,
          },
          resolue: resoudre(fiche.acteur.id, question.id),
        }));

        for (const { resolue } of cites) if (resolue) dates.push(resolue.position.updatedAt);

        return {
          question: { id: question.id, texte: question.texte, infobulle: question.infobulle },
          definitionSource: sourceParIdInfobulle.get(question.infobulleSourceId)!,
          groupes: ECHELLE.map((cran) => ({
            libelle: cran.libelle,
            candidats: cites
              .filter(({ resolue }) => resolue?.position.value === cran.valeur)
              .map(({ cite, resolue }) => ({
                ...cite,
                heriteDe: resolue!.heriteDe,
                adequation: resolue!.position.adequation,
              })),
          })),
          inconnus: cites.filter(({ resolue }) => resolue === null).map(({ cite }) => cite),
        };
      });

    return {
      ...theme,
      affirmations,
      misAJour: dates.reduce((a, b) => (a > b ? a : b)),
    };
  });
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
};

/** Date de la donnée la plus récente de l'export. */
export const DONNEES_MISES_A_JOUR = [
  ...DONNEES_OUVERTES.positions.map((position) => position.updatedAt),
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
