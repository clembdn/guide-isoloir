/**
 * Préparation des fiches candidat, côté serveur.
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
import { validerQuestions, validerSourcesInfobulles, type Question } from "./questions";
import {
  validerActeurs,
  validerCandidatures,
  validerPositions,
  validerSourcesPositions,
  type SourcePosition,
} from "./acteurs";
import { positionsServies } from "./previsualisation";
import { creerResolveur, NIVEAUX_RESOLUTION, type PositionResolue } from "./moteur";
import { dateAnterieureALaCampagne } from "./seuils";
import { trierParNomAlphabetique, type Candidate, type PoliticalActor } from "./modele";
import { QUESTIONS, SOURCES_INFOBULLES } from "../data/questions";
import { ACTEURS, CANDIDATURES } from "../data/acteurs";
import { POSITIONS } from "../data/positions";
import { SOURCES_POSITIONS } from "../data/sources-positions";
import { media } from "../data/medias";

/*
 * Validation au build, référentielle : une position rattachée à un acteur, une
 * question ou une source qui n'existe pas arrête la construction. Faite une
 * fois au chargement du module, pas une fois par fiche.
 */
const questions = validerQuestions(QUESTIONS);
validerSourcesInfobulles(SOURCES_INFOBULLES, questions);
const acteurs = validerActeurs(ACTEURS);
const candidatures = validerCandidatures(CANDIDATURES, acteurs);
const sources = validerSourcesPositions(SOURCES_POSITIONS);
const positions = positionsServies(validerPositions(POSITIONS, { acteurs, questions, sources }));

const resoudre = creerResolveur({ positions, candidatures, annuaire: acteurs });
const acteurParId = new Map(acteurs.map((acteur) => [acteur.id, acteur]));
const sourceParId = new Map(sources.map((source) => [source.id, source]));
const LIBELLE_PAR_CLE = new Map(NIVEAUX_RESOLUTION.map((niveau) => [niveau.cle, niveau.libelle]));

/** Questions dans l'ordre du test. */
const questionsOrdonnees = [...questions].sort((a, b) => a.ordre - b.ordre);

/** Thèmes dans l'ordre où le test les pose. */
export const THEMES: readonly string[] = [...new Set(questionsOrdonnees.map((q) => q.theme))];

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
  parTheme: { theme: string; entrees: EntreeFiche[] }[];
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
      entrees: documentees.filter((entree) => entree.question.theme === theme),
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
