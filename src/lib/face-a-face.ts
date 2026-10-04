/**
 * Face-à-face : deux candidats, leurs positions comparées affirmation par
 * affirmation, et ce qu'on peut en dire en chiffres.
 *
 * CE MODULE NE PART JAMAIS AU NAVIGATEUR. Il lit les fiches, validées par zod
 * au build, et ne sert que le frontmatter des pages `/comparer`.
 *
 * QUELLES PAIRES ONT UNE PAGE. Une règle mécanique, publiée sur
 * `/methodologie`, et aucune liste choisie à la main :
 *
 *   - les deux positions sont connues, et tirées de documents distincts, sur
 *     au moins `COMPARABLES_MIN` affirmations — le plancher à partir duquel le
 *     test affiche un pourcentage (`src/lib/paire.ts`) ;
 *   - la page est INDEXÉE si les deux candidats sont en lice et si chacun a au
 *     moins une position EN PROPRE parmi les affirmations comparées. Sinon elle
 *     compare surtout la ligne d'un parti : elle existe, elle le dit, et elle
 *     reste hors des moteurs, comme une page de thème trop mince.
 *
 * Le cahier des charges demandait « les paires les plus recherchées ». Sans
 * analytics, personne ne les connaît ; les choisir à la main exposerait
 * certains candidats plus que d'autres. La règle les remplace.
 *
 * ORDRE CANONIQUE : celui des fiches, alphabétique par `sortName`, la règle
 * publiée sur `/charte-editoriale`. L'adresse suit cet ordre ; la paire
 * inversée y redirige en 301 (`astro.config.mjs`).
 *
 * AUCUNE CITATION ICI. Le verbatim et la source vivent sur la fiche ; chaque
 * position renvoie à `/candidats/{slug}#{affirmation}`. Deux pages au contenu
 * identique se feraient concurrence dans les moteurs.
 */
import { DOMAINES_PROPOSITION } from "./acteurs";
import { ECHELLE, sensDe, verdictDe, type Sens } from "./echelle";
import {
  DONNEES_COMPARAISON,
  enumerer,
  estEnLice,
  fiches,
  INTITULES_COURTS,
  NOMBRE_AFFIRMATIONS,
  THEMES,
  type EntreeFiche,
  type EtapeFiche,
  type Fiche,
  type HabillageTheme,
  type PropositionFiche,
} from "./fiches";
import { LIBELLES_DOMAINE } from "./libelles";
import type { DomaineProposition, StanceAdequation, StanceValue } from "./modele";
import { NIVEAUX_RESOLUTION } from "./moteur";
import {
  comparablesMinimum,
  cranDe,
  creerComparateur,
  estComparable,
  RELATIONS_COMPAREES,
  type ComparaisonPaire,
  type Cran,
  type LignePaire,
  type Relation,
} from "./paire";
import { SEUIL_PUBLICATION } from "./seuils";

/** Nombre d'affirmations comparables à partir duquel une paire a sa page : 9 sur 24. */
export const COMPARABLES_MIN = comparablesMinimum(NOMBRE_AFFIRMATIONS);

/** Nombre maximal d'affirmations dans « où leurs positions s'écartent » et « se rejoignent ». */
export const LIGNES_SAILLANTES = 3;

/** Ce qu'il faut pour afficher un candidat : nom, adresse, visage, parti. */
export type Visage = {
  nom: string;
  slug: string;
  portrait: string | null;
  parti: string | null;
  enLice: boolean;
};

export type ResumePaire = {
  a: Visage;
  b: Visage;
  chemin: string;
  comparables: number;
  daccord: number;
  /** Proximité arrondie comme sur `/resultat`. */
  pourcent: number;
  indexable: boolean;
  /** Date de la donnée la plus récente des deux fiches. */
  misAJour: string;
};

/** Un côté d'une ligne : la position d'un des deux candidats sur une affirmation. */
export type Cote = {
  valeur: StanceValue | null;
  cran: Cran | null;
  /** « Plutôt pour », « Contre »… `null` sans position connue. */
  verdict: string | null;
  /** Cran du test en toutes lettres : « Plutôt d'accord ». */
  libelleEchelle: string | null;
  sens: Sens | "inconnu";
  /** Parti ou coalition d'origine quand la position est reprise. */
  heriteDe: string | null;
  adequation: StanceAdequation | null;
  /** Ligne de la fiche où se lisent la citation et les sources. */
  ancre: string;
};

export type LigneFaceAFace = {
  id: string;
  /** Nom du thème, tel que le questionnaire l'écrit. */
  theme: string;
  texte: string;
  court: string;
  relation: Relation;
  ecart: number | null;
  /** « Même position », « 2 crans d'écart »… : ce qu'on lit sous la ligne. */
  ecartTexte: string;
  a: Cote;
  b: Cote;
};

export type ThemeFaceAFace = {
  theme: HabillageTheme;
  lignes: LigneFaceAFace[];
  comparables: number;
  daccord: number;
  /** Proximité du thème arrondie, `null` sans affirmation comparable. */
  pourcent: number | null;
};

/** Sur quoi repose la comparaison, d'un côté. */
export type Solidite = {
  /** Affirmations comparées : les mêmes des deux côtés. */
  comparees: number;
  /** Parmi elles, positions du candidat lui-même. */
  propres: number;
  reprises: { nom: string; nombre: number }[];
  /** Origine des positions comparées, dans l'ordre de la chaîne de résolution. */
  origines: { libelle: string; nombre: number }[];
  /** Positions dont toutes les sources précèdent la campagne. */
  anciennes: number;
  /** Date de la source la plus récente parmi les positions comparées. */
  sourceRecente: string | null;
  etape: EtapeFiche;
  reserve: boolean;
  programme: Fiche["programme"];
};

export type Voisin = {
  visage: Visage;
  pourcent: number;
  comparables: number;
  chemin: string;
  /** Vrai pour l'autre candidat de la page. */
  estAutre: boolean;
};

/** Où se situe l'autre candidat parmi tous ceux qu'on peut comparer à celui-ci. */
export type Champ = {
  partenaires: number;
  /** Rang de l'autre par proximité décroissante ; `null` sous `SEUIL_PUBLICATION.acteursMin`. */
  rang: number | null;
  exAequo: boolean;
  /** Ordre alphabétique : un ordre par proximité ferait un palmarès. */
  voisins: Voisin[];
};

export type DomainePapillon = {
  domaine: DomaineProposition;
  libelle: string;
  a: { propres: number; parti: number };
  b: { propres: number; parti: number };
  /** Propositions d'un même document de parti, comptées des deux côtés. */
  communes: number;
};

export type FaceAFace = ResumePaire & {
  compte: Record<Relation, number>;
  parTheme: ThemeFaceAFace[];
  ecarts: LigneFaceAFace[];
  rejoignent: LigneFaceAFace[];
  solidite: { a: Solidite; b: Solidite };
  champ: { a: Champ; b: Champ };
  papillon: DomainePapillon[] | null;
  maximumPapillon: number;
  enBref: string;
  titre: string;
  description: string;
  /** Ce qu'il faut savoir avant de lire la page : reprises, candidature close. */
  reserves: string[];
};

type Calcul = { a: Fiche; b: Fiche; comparaison: ComparaisonPaire; resume: ResumePaire };

type Etat = {
  rang: Map<string, number>;
  parSlug: Map<string, Fiche>;
  enLice: Fiche[];
  paires: Calcul[];
  parChemin: Map<string, Calcul>;
};

function visage(fiche: Fiche): Visage {
  return {
    nom: fiche.acteur.name,
    slug: fiche.acteur.slug,
    portrait: fiche.portrait,
    parti: fiche.parti?.nom ?? null,
    enLice: estEnLice(fiche.candidature),
  };
}

function lignesComparees(comparaison: ComparaisonPaire): LignePaire[] {
  return comparaison.lignes.filter((ligne) => RELATIONS_COMPAREES.has(ligne.relation));
}

function propres(comparaison: ComparaisonPaire, cote: "a" | "b"): number {
  return lignesComparees(comparaison).filter((ligne) => ligne[cote]!.heriteDe === null).length;
}

function resumer(a: Fiche, b: Fiche, comparaison: ComparaisonPaire): ResumePaire {
  return {
    a: visage(a),
    b: visage(b),
    chemin: `/comparer/${a.acteur.slug}/${b.acteur.slug}`,
    comparables: comparaison.comparables,
    daccord: comparaison.daccord,
    pourcent: Math.round(comparaison.score! * 100),
    indexable:
      estEnLice(a.candidature) &&
      estEnLice(b.candidature) &&
      propres(comparaison, "a") > 0 &&
      propres(comparaison, "b") > 0,
    misAJour: a.misAJour > b.misAJour ? a.misAJour : b.misAJour,
  };
}

/*
 * Toutes les comparaisons, calculées une fois par build. `fiches()` refait tout
 * à chaque appel, et chaque page de paire lit aussi les voisins de ses deux
 * candidats : sans mémoire, le build calculerait des milliers de comparaisons.
 */
let memoire: Etat | null = null;

function etat(): Etat {
  if (memoire) return memoire;
  const toutes = fiches();
  const comparer = creerComparateur(DONNEES_COMPARAISON);
  const paires: Calcul[] = [];
  for (let i = 0; i < toutes.length; i += 1) {
    for (let j = i + 1; j < toutes.length; j += 1) {
      const a = toutes[i]!;
      const b = toutes[j]!;
      const comparaison = comparer(a.acteur, b.acteur);
      if (!estComparable(comparaison.comparables, NOMBRE_AFFIRMATIONS)) continue;
      paires.push({ a, b, comparaison, resume: resumer(a, b, comparaison) });
    }
  }
  memoire = {
    rang: new Map(toutes.map((fiche, index) => [fiche.acteur.slug, index])),
    parSlug: new Map(toutes.map((fiche) => [fiche.acteur.slug, fiche])),
    enLice: toutes.filter((fiche) => estEnLice(fiche.candidature)),
    paires,
    parChemin: new Map(paires.map((calcul) => [calcul.resume.chemin, calcul])),
  };
  return memoire;
}

/** Toutes les paires qui ont une page, dans l'ordre canonique. */
export function paires(): readonly ResumePaire[] {
  return etat().paires.map((calcul) => calcul.resume);
}

/** Les deux slugs dans l'ordre canonique, ou `null` si l'un est inconnu ou s'ils sont égaux. */
export function canonique(x: string, y: string): readonly [string, string] | null {
  const { rang } = etat();
  const rx = rang.get(x);
  const ry = rang.get(y);
  if (rx === undefined || ry === undefined || x === y) return null;
  return rx < ry ? [x, y] : [y, x];
}

/** Adresse canonique d'une paire, quel que soit l'ordre des slugs donnés. */
export function cheminPaire(x: string, y: string): string {
  const paire = canonique(x, y);
  if (paire === null) throw new Error(`Paire impossible : ${x} / ${y}.`);
  return `/comparer/${paire[0]}/${paire[1]}`;
}

/** Les paires d'un candidat, dans l'ordre alphabétique de l'autre — jamais par proximité. */
export function partenairesDe(slug: string): { autre: Visage; paire: ResumePaire }[] {
  return paires()
    .filter((paire) => paire.a.slug === slug || paire.b.slug === slug)
    .map((paire) => ({ autre: paire.a.slug === slug ? paire.b : paire.a, paire }))
    .sort((x, y) => etat().rang.get(x.autre.slug)! - etat().rang.get(y.autre.slug)!);
}

/**
 * Les candidats en lice qu'on peut comparer à au moins un autre candidat en
 * lice, avec ces partenaires. C'est ce que propose le sélecteur de `/comparer`.
 */
export function candidatsComparables(): {
  visage: Visage;
  partenaires: { autre: Visage; paire: ResumePaire }[];
}[] {
  return etat()
    .enLice.map((fiche) => ({
      visage: visage(fiche),
      partenaires: partenairesDe(fiche.acteur.slug).filter((p) => p.autre.enLice),
    }))
    .filter((entree) => entree.partenaires.length > 0);
}

/**
 * Les candidats en lice qu'on ne peut encore comparer à personne, et pourquoi.
 * Nommés, pas omis : les taire laisserait croire qu'ils ne sont pas en lice.
 */
export function sansComparaison(): {
  visage: Visage;
  documentees: number;
  raison: "trop-peu" | "sans-recoupement";
}[] {
  const comparables = new Set(candidatsComparables().map((entree) => entree.visage.slug));
  return etat()
    .enLice.filter((fiche) => !comparables.has(fiche.acteur.slug))
    .map((fiche) => ({
      visage: visage(fiche),
      documentees: fiche.documentees,
      raison: fiche.documentees < COMPARABLES_MIN ? "trop-peu" : "sans-recoupement",
    }));
}

/* ---------------------------------------------------------------------- */
/* Le détail d'une paire                                                   */
/* ---------------------------------------------------------------------- */

const LIBELLE_ECHELLE = new Map(ECHELLE.map((cran) => [cran.valeur, cran.libelle]));
const RANG_ORIGINE = new Map<string, number>(
  NIVEAUX_RESOLUTION.map((niveau) => [niveau.libelle, niveau.rang]),
);

/** « 1 affirmation », « 2 affirmations ». Zéro prend le singulier. */
function accorder(nombre: number, singulier: string, pluriel: string): string {
  return `${nombre} ${nombre > 1 ? pluriel : singulier}`;
}

function cote(fiche: Fiche, ligne: LignePaire, quel: "a" | "b"): Cote {
  const resolue = ligne[quel];
  const ancre = `/candidats/${fiche.acteur.slug}#${ligne.questionId}`;
  if (resolue === null) {
    return {
      valeur: null,
      cran: null,
      verdict: null,
      libelleEchelle: null,
      sens: "inconnu",
      heriteDe: null,
      adequation: null,
      ancre,
    };
  }
  const { value } = resolue.position;
  return {
    valeur: value,
    cran: cranDe(value),
    verdict: verdictDe(value),
    libelleEchelle: LIBELLE_ECHELLE.get(value) ?? null,
    sens: sensDe(value),
    heriteDe: resolue.heriteDe,
    adequation: resolue.position.adequation,
    ancre,
  };
}

function texteEcart(ligne: LignePaire, nomA: string, nomB: string): string {
  switch (ligne.relation) {
    case "identique":
      return "Même position";
    case "proche":
      return "1 cran d'écart";
    case "eloignee":
      return `${ligne.ecart} crans d'écart`;
    case "meme-document":
      return `Même document repris des deux côtés (${ligne.a!.heriteDe ?? "position partagée"}), hors calcul`;
    case "seul-a":
      return `Position connue pour ${nomA} seulement`;
    case "seul-b":
      return `Position connue pour ${nomB} seulement`;
    case "aucune":
      return "Aucune position connue";
  }
}

function solidite(fiche: Fiche, comparaison: ComparaisonPaire, quel: "a" | "b"): Solidite {
  const entreeParQuestion = new Map<string, EntreeFiche>(
    fiche.entrees.map((entree) => [entree.question.id, entree]),
  );
  const comparees = lignesComparees(comparaison);
  const entrees = comparees.map((ligne) => entreeParQuestion.get(ligne.questionId)!);

  const reprises = new Map<string, number>();
  const origines = new Map<string, number>();
  for (const ligne of comparees) {
    const origine = ligne[quel]!.heriteDe;
    if (origine !== null) reprises.set(origine, (reprises.get(origine) ?? 0) + 1);
  }
  for (const entree of entrees) {
    const libelle = entree.origine ?? "Origine inconnue";
    origines.set(libelle, (origines.get(libelle) ?? 0) + 1);
  }
  const dates = entrees.flatMap((entree) => entree.sources.map((s) => s.dateDeclaration));

  return {
    comparees: comparees.length,
    propres: propres(comparaison, quel),
    reprises: [...reprises].map(([nom, nombre]) => ({ nom, nombre })),
    origines: [...origines]
      .map(([libelle, nombre]) => ({ libelle, nombre }))
      .sort((x, y) => (RANG_ORIGINE.get(x.libelle) ?? 99) - (RANG_ORIGINE.get(y.libelle) ?? 99)),
    anciennes: entrees.filter((entree) => entree.dateAncienne !== null).length,
    sourceRecente: dates.length === 0 ? null : dates.reduce((x, y) => (x > y ? x : y)),
    etape: fiche.etape,
    reserve: fiche.reserve !== null,
    programme: fiche.programme,
  };
}

function champ(slug: string, autre: string): Champ {
  const voisins = partenairesDe(slug).map(({ autre: v, paire }): Voisin => ({
    visage: v,
    pourcent: paire.pourcent,
    comparables: paire.comparables,
    chemin: paire.chemin,
    estAutre: v.slug === autre,
  }));
  const cible = voisins.find((voisin) => voisin.estAutre)!;
  const rang = 1 + voisins.filter((voisin) => voisin.pourcent > cible.pourcent).length;
  return {
    partenaires: voisins.length,
    rang: voisins.length >= SEUIL_PUBLICATION.acteursMin ? rang : null,
    exAequo: voisins.filter((voisin) => voisin.pourcent === cible.pourcent).length > 1,
    voisins,
  };
}

function propositionsDe(fiche: Fiche): PropositionFiche[] {
  return [...fiche.mesures.flatMap((groupe) => groupe.propositions), ...fiche.orientations];
}

function papillon(a: Fiche, b: Fiche): DomainePapillon[] | null {
  const deA = propositionsDe(a);
  const deB = propositionsDe(b);
  if (deA.length === 0 && deB.length === 0) return null;
  const compter = (liste: PropositionFiche[], domaine: string) => ({
    propres: liste.filter((p) => p.domaine === domaine && p.auteur === null).length,
    parti: liste.filter((p) => p.domaine === domaine && p.auteur !== null).length,
  });
  const idsB = new Set(deB.map((p) => p.id));
  return DOMAINES_PROPOSITION.map((domaine) => ({
    domaine,
    libelle: LIBELLES_DOMAINE[domaine],
    a: compter(deA, domaine),
    b: compter(deB, domaine),
    communes: deA.filter((p) => p.domaine === domaine && idsB.has(p.id)).length,
  })).filter((ligne) => ligne.a.propres + ligne.a.parti + ligne.b.propres + ligne.b.parti > 0);
}

function phraseEnBref(
  resume: ResumePaire,
  compte: Record<Relation, number>,
  ecarts: LigneFaceAFace[],
  lignes: LignePaire[],
  solidites: { a: Solidite; b: Solidite },
): string {
  const { a, b } = resume;
  const morceaux = [
    compte.identique > 0 ? `identiques sur ${compte.identique}` : null,
    compte.proche > 0 ? `à un cran d'écart sur ${compte.proche}` : null,
    compte.eloignee > 0 ? `à deux crans ou plus sur ${compte.eloignee}` : null,
  ].filter((morceau) => morceau !== null);

  const origines = [
    ...new Set(
      lignes.filter((l) => l.relation === "meme-document").map((l) => l.a!.heriteDe ?? ""),
    ),
  ].filter((nom) => nom !== "");

  const reprises = (["a", "b"] as const)
    .filter((quel) => solidites[quel].reprises.length > 0)
    .map((quel) => {
      const total = solidites[quel].reprises.reduce((somme, r) => somme + r.nombre, 0);
      const noms = enumerer(solidites[quel].reprises.map((r) => r.nom));
      return `${total} pour ${resume[quel].nom} (${noms})`;
    });

  return [
    `Les positions de ${a.nom} et de ${b.nom} sont toutes deux connues, et tirées de documents distincts, sur ${resume.comparables} des ${NOMBRE_AFFIRMATIONS} affirmations du test.`,
    `Elles sont ${enumerer(morceaux)}.`,
    `Proximité calculée comme au test : ${resume.pourcent} %.`,
    compte["meme-document"] > 0
      ? `Sur ${accorder(compte["meme-document"], "autre affirmation", "autres affirmations")}, les deux reprennent le même document (${enumerer(origines)}) : ${compte["meme-document"] > 1 ? "elles sont tenues" : "elle est tenue"} hors du calcul.`
      : null,
    reprises.length > 0
      ? `Positions comparées reprises d'un parti ou d'une coalition : ${enumerer(reprises)}.`
      : null,
    ecarts.length > 0
      ? `${ecarts.length > 1 ? "Plus grands écarts" : "Plus grand écart"} : ${enumerer(ecarts.map((l) => `« ${l.court} »`))}.`
      : null,
  ]
    .filter((phrase) => phrase !== null)
    .join(" ");
}

function reservesDe(resume: ResumePaire, solidites: { a: Solidite; b: Solidite }): string[] {
  const reserves: string[] = [];
  const sansPropre = (["a", "b"] as const).filter((quel) => solidites[quel].propres === 0);
  if (sansPropre.length === 2) {
    reserves.push(
      `Aucune des positions comparées ici n'est une déclaration personnelle de ${resume.a.nom} ni de ${resume.b.nom} : toutes sont reprises d'un parti ou d'une coalition. Cette page compare des lignes de partis.`,
    );
  } else if (sansPropre.length === 1) {
    const quel = sansPropre[0]!;
    const noms = enumerer(solidites[quel].reprises.map((r) => r.nom));
    reserves.push(
      `Aucune des positions de ${resume[quel].nom} comparées ici n'est une déclaration personnelle : toutes sont reprises (${noms}), faute de déclaration publique relevée. Cette page compare surtout une ligne de parti.`,
    );
  }
  for (const quel of ["a", "b"] as const) {
    if (!resume[quel].enLice) {
      reserves.push(`${resume[quel].nom} : ${solidites[quel].etape.long.toLowerCase()}.`);
    }
  }
  return reserves;
}

/** Tout ce que la page d'une paire affiche. Lève une erreur hors des paires publiées. */
export function faceAFace(x: string, y: string): FaceAFace {
  const calcul = etat().parChemin.get(cheminPaire(x, y));
  if (!calcul) throw new Error(`La paire ${x} / ${y} n'a pas de page : sous le seuil.`);
  const { a, b, comparaison, resume } = calcul;
  const themeParNom = new Map(THEMES.map((theme) => [theme.nom, theme]));
  const texteParQuestion = new Map(a.entrees.map((e) => [e.question.id, e.question.texte]));

  const lignes = comparaison.lignes.map((ligne): LigneFaceAFace => ({
    id: ligne.questionId,
    theme: ligne.theme,
    texte: texteParQuestion.get(ligne.questionId)!,
    court: INTITULES_COURTS.get(ligne.questionId)!,
    relation: ligne.relation,
    ecart: ligne.ecart,
    ecartTexte: texteEcart(ligne, resume.a.nom, resume.b.nom),
    a: cote(a, ligne, "a"),
    b: cote(b, ligne, "b"),
  }));

  const compte = Object.fromEntries(
    (
      ["identique", "proche", "eloignee", "meme-document", "seul-a", "seul-b", "aucune"] as const
    ).map((relation) => [relation, lignes.filter((ligne) => ligne.relation === relation).length]),
  ) as Record<Relation, number>;

  const parTheme = comparaison.parTheme.map((theme): ThemeFaceAFace => ({
    theme: themeParNom.get(theme.theme)!,
    lignes: lignes.filter((ligne) => ligne.theme === theme.theme),
    comparables: theme.comparables,
    daccord: theme.daccord,
    pourcent: theme.score === null ? null : Math.round(theme.score * 100),
  }));

  /*
   * RÈGLE MÉCANIQUE, publiée : les écarts les plus grands, puis l'ordre du
   * test ; pour les rapprochements, les écarts les plus petits. Jamais un choix
   * de « sujet phare ».
   */
  const ordre = new Map(lignes.map((ligne, index) => [ligne.id, index]));
  const comparees = lignes.filter((ligne) => ligne.ecart !== null);
  const ecarts = comparees
    .filter((ligne) => ligne.ecart! >= 2)
    .sort((x, y) => y.ecart! - x.ecart! || ordre.get(x.id)! - ordre.get(y.id)!)
    .slice(0, LIGNES_SAILLANTES);
  const rejoignent = comparees
    .filter((ligne) => ligne.ecart! <= 1)
    .sort((x, y) => x.ecart! - y.ecart! || ordre.get(x.id)! - ordre.get(y.id)!)
    .slice(0, LIGNES_SAILLANTES);

  const solidites = { a: solidite(a, comparaison, "a"), b: solidite(b, comparaison, "b") };
  const domaines = papillon(a, b);

  return {
    ...resume,
    compte,
    parTheme,
    ecarts,
    rejoignent,
    solidite: solidites,
    champ: { a: champ(a.acteur.slug, b.acteur.slug), b: champ(b.acteur.slug, a.acteur.slug) },
    papillon: domaines,
    maximumPapillon: Math.max(
      0,
      ...(domaines ?? []).flatMap((d) => [d.a.propres + d.a.parti, d.b.propres + d.b.parti]),
    ),
    enBref: phraseEnBref(resume, compte, ecarts, comparaison.lignes, solidites),
    titre: `${resume.a.nom} et ${resume.b.nom} : leurs positions comparées pour 2027`,
    description: `Les positions de ${resume.a.nom} et de ${resume.b.nom} comparées sur ${resume.comparables} des ${NOMBRE_AFFIRMATIONS} affirmations du test de la présidentielle 2027 : d'accord sur ${resume.daccord}, à un cran d'écart au plus. Chaque position renvoie à sa citation, sourcée et datée.`,
    reserves: reservesDe(resume, solidites),
  };
}
