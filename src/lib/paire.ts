/**
 * Comparaison de deux candidats, affirmation par affirmation.
 *
 * LE MOTEUR N'EST PAS RECOPIÉ, IL EST APPELÉ. La proximité de deux candidats
 * est celle que le test calculerait pour un électeur qui répondrait exactement
 * comme le premier : ses positions passent à `calculer` comme « réponses », le
 * second comme seul acteur. Même accord par affirmation, même moyenne par
 * thème, même moyenne des thèmes. Aucune formule n'est réécrite ici ; une
 * correction du moteur s'applique d'elle-même aux comparaisons.
 *
 * SYMÉTRIQUE AU BIT PRÈS. L'accord ne dépend que de l'écart absolu, et
 * `calculer` trie questions et thèmes avant de sommer : comparer A à B et B à A
 * additionne les mêmes nombres dans le même ordre. L'audit le vérifie.
 *
 * LE MÊME DOCUMENT NE COMPTE PAS. Quand deux candidats reprennent tous deux la
 * position d'un même parti ou d'une même coalition, faute de déclaration
 * personnelle, c'est la même position (`position.id` identique) des deux côtés.
 * La compter comme un accord ferait dire « d'accord sur tout » à quatre
 * candidats qui ne se sont jamais exprimés : on comparerait un document à
 * lui-même. Elle est montrée, nommée, et tenue hors du calcul.
 *
 * Ce module ne lit aucune donnée et ne valide rien : il part des positions
 * qu'on lui donne, ce qui permet de l'éprouver sur des jeux d'essai.
 */
import { calculer, creerResolveur, type PositionResolue } from "./moteur";
import type { Candidate, PoliticalActor, Stance, StanceValue } from "./modele";
import type { Question } from "./questions";
import { PLANCHER_POURCENTAGE, SEUIL_ACCORD } from "./seuils";

/**
 * Ce que deux positions sur une même affirmation disent l'une de l'autre.
 *
 *   - `identique`     : même cran ;
 *   - `proche`        : un cran d'écart — « d'accord » au sens du test ;
 *   - `eloignee`      : deux crans ou plus ;
 *   - `meme-document` : la même position reprise des deux côtés, hors calcul ;
 *   - `seul-a`, `seul-b` : une seule position connue ;
 *   - `aucune`        : aucune des deux.
 *
 * « Éloignée » et non « opposée » : « tout à fait d'accord » face à « ni l'un
 * ni l'autre » est un écart de deux crans, pas une opposition.
 */
export type Relation =
  "identique" | "proche" | "eloignee" | "meme-document" | "seul-a" | "seul-b" | "aucune";

/** Les relations qui entrent dans le calcul : deux positions connues et distinctes. */
export const RELATIONS_COMPAREES: ReadonlySet<Relation> = new Set<Relation>([
  "identique",
  "proche",
  "eloignee",
]);

/** Colonne de l'échelle, de 1 (« Tout à fait d'accord ») à 5 (« Pas du tout d'accord »). */
export type Cran = 1 | 2 | 3 | 4 | 5;

/**
 * Cran d'une valeur, dans l'ordre où le test pose l'échelle (`ECHELLE`).
 *
 * Zéro est le cran du milieu : « ni d'accord, ni pas d'accord » est une
 * position, pas une absence. L'absence n'a pas de cran.
 */
export function cranDe(valeur: StanceValue): Cran {
  return (3 - valeur) as Cran;
}

export function relationEntre(a: PositionResolue | null, b: PositionResolue | null): Relation {
  if (a === null && b === null) return "aucune";
  if (b === null) return "seul-a";
  if (a === null) return "seul-b";
  /* Avant tout écart : deux fois le même document donnerait « identique ». */
  if (a.position.id === b.position.id) return "meme-document";
  const ecart = Math.abs(a.position.value - b.position.value);
  if (ecart === 0) return "identique";
  return ecart === 1 ? "proche" : "eloignee";
}

/**
 * Une paire est-elle assez documentée pour être comparée ?
 *
 * LE MÊME PLANCHER QUE LE POURCENTAGE DU TEST. `/resultat` n'affiche un
 * pourcentage qu'au-delà de `PLANCHER_POURCENTAGE` des affirmations
 * documentées ; une paire n'a de page qu'au-delà de la même part
 * d'affirmations comparables. Une comparaison existe exactement quand le test
 * afficherait un chiffre.
 */
export function estComparable(nombre: number, total: number): boolean {
  return total > 0 && nombre / total >= PLANCHER_POURCENTAGE;
}

/** Plus petit nombre d'affirmations comparables qui franchit le plancher : 9 sur 24. */
export function comparablesMinimum(total: number): number {
  for (let nombre = 0; nombre <= total; nombre += 1) {
    if (estComparable(nombre, total)) return nombre;
  }
  return total + 1;
}

/** Ce qu'il faut pour comparer : les mêmes données que le test, rien d'autre. */
export type DonneesPaire = {
  /** Questions DANS L'ORDRE DU TEST : c'est l'ordre des lignes et des thèmes. */
  questions: readonly Pick<Question, "id" | "theme">[];
  positions: readonly Stance[];
  candidatures: readonly Candidate[];
  annuaire: readonly PoliticalActor[];
};

export type LignePaire = {
  questionId: string;
  theme: string;
  a: PositionResolue | null;
  b: PositionResolue | null;
  relation: Relation;
  /** Écart en crans, seulement pour une affirmation comparée. */
  ecart: number | null;
  /** Accord du moteur dans [0, 1], seulement pour une affirmation comparée. */
  accord: number | null;
};

export type ThemePaire = {
  theme: string;
  comparables: number;
  daccord: number;
  /** Moyenne d'accord du thème, `null` sans affirmation comparable. */
  score: number | null;
};

export type ComparaisonPaire = {
  lignes: LignePaire[];
  comparables: number;
  /** Affirmations où l'accord atteint `SEUIL_ACCORD` : un cran d'écart au plus. */
  daccord: number;
  /** Proximité du moteur, `null` sans affirmation comparable. */
  score: number | null;
  /** Thèmes dans l'ordre du test. */
  parTheme: ThemePaire[];
};

/**
 * Construit le comparateur une fois pour un jeu de données.
 *
 * Un seul résolveur, celui du test et des fiches : une ligne de comparaison ne
 * peut pas montrer une autre position que la fiche du candidat.
 */
export function creerComparateur(
  donnees: DonneesPaire,
): (a: Pick<PoliticalActor, "id">, b: PoliticalActor) => ComparaisonPaire {
  const resoudre = creerResolveur({
    positions: donnees.positions,
    candidatures: donnees.candidatures,
    annuaire: donnees.annuaire,
  });
  const themes = [...new Set(donnees.questions.map((question) => question.theme))];

  return (a, b) => {
    const brutes = donnees.questions.map((question) => {
      const positionA = resoudre(a.id, question.id);
      const positionB = resoudre(b.id, question.id);
      return { question, positionA, positionB, relation: relationEntre(positionA, positionB) };
    });
    const comparees = brutes.filter((ligne) => RELATIONS_COMPAREES.has(ligne.relation));

    const accords = new Map<string, number>();
    const scoreParTheme = new Map<string, number | null>();
    let score: number | null = null;

    if (comparees.length > 0) {
      const classement = calculer({
        questions: donnees.questions,
        acteurs: [b],
        positions: donnees.positions,
        candidatures: donnees.candidatures,
        annuaire: donnees.annuaire,
        reponses: Object.fromEntries(
          comparees.map((ligne) => [ligne.question.id, ligne.positionA!.position.value]),
        ),
        seuilClassement: 0,
      });
      const resultat = [...classement.classes, ...classement.nonClasses][0]!;
      score = resultat.score;
      for (const theme of resultat.parTheme) {
        scoreParTheme.set(theme.theme, theme.score);
        for (const detail of theme.positions) {
          if (detail.accord !== null) accords.set(detail.questionId, detail.accord);
        }
      }
    }

    const lignes = brutes.map(({ question, positionA, positionB, relation }): LignePaire => {
      const comparee = RELATIONS_COMPAREES.has(relation);
      const accord = comparee ? accords.get(question.id) : undefined;
      /*
       * Garde-fou : le moteur résout B avec le même résolveur ; une affirmation
       * comparée sans accord voudrait dire que les deux résolutions divergent.
       */
      if (comparee && accord === undefined) {
        throw new Error(`Comparaison incohérente sur ${question.id} : le moteur n'a rien rendu.`);
      }
      return {
        questionId: question.id,
        theme: question.theme,
        a: positionA,
        b: positionB,
        relation,
        ecart: comparee ? Math.abs(positionA!.position.value - positionB!.position.value) : null,
        accord: accord ?? null,
      };
    });

    const estDaccord = (ligne: LignePaire) => ligne.accord !== null && ligne.accord >= SEUIL_ACCORD;

    return {
      lignes,
      comparables: comparees.length,
      daccord: lignes.filter(estDaccord).length,
      score,
      parTheme: themes.map((theme) => {
        const duTheme = lignes.filter((ligne) => ligne.theme === theme);
        return {
          theme,
          comparables: duTheme.filter((ligne) => ligne.accord !== null).length,
          daccord: duTheme.filter(estDaccord).length,
          score: scoreParTheme.get(theme) ?? null,
        };
      }),
    };
  };
}
