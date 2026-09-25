/**
 * Schémas de la couche acteurs, validés au build.
 *
 * Miroir de `src/lib/questions.ts`, pour les quatre entités qui décrivent QUI
 * est comparé et SUR QUOI : les acteurs politiques, les candidatures, les
 * positions, et les sources de ces positions.
 *
 * CE MODULE NE PART JAMAIS AU NAVIGATEUR. Il importe zod, mesuré à 86 ko : un
 * îlot qui l'importerait ferait à lui seul dépasser le budget de 40 ko sur
 * `/test`. Les types vivent dans `src/lib/modele.ts`, qui reste sans code
 * exécutable ; les schémas vivent ici et ne sont appelés que dans le frontmatter
 * des pages `.astro`, dans les tests et dans l'audit.
 *
 * SOURCES DE POSITIONS ET SOURCES D'INFOBULLES SONT DEUX REGISTRES DISTINCTS.
 * Une infobulle définit un terme et vient d'une publication de référence ; une
 * position vient d'un programme, d'une déclaration, d'un vote. Les mélanger
 * amènerait à sourcer une définition par un meeting, ou une position par une
 * fiche administrative.
 */
import { z } from "zod";
import type { Question } from "./questions";

const ISO_JOUR = /^\d{4}-\d{2}-\d{2}$/;

/** Identifiant technique : ce qui entre dans une URL ou une clé de session. */
const IdentifiantSchema = z
  .string()
  .min(3)
  .regex(/^[a-z0-9-]+$/, "minuscules, chiffres et tirets uniquement");

/**
 * Source d'une position.
 *
 * `dateDeclaration` n'est PAS `consulteLe`, et c'est la distinction qui a coulé
 * Elyze : l'application présentait en 2022 des propositions de 2017 sans que la
 * date apparaisse nulle part. Une position doit porter la date de ce qui a été
 * dit, pas celle où on l'a lu.
 */
export const SourcePositionSchema = z
  .object({
    id: IdentifiantSchema,
    /** Intitulé exact du document ou de l'article, pour le retrouver si le lien meurt. */
    titre: z.string().min(3),
    /** D'où ça vient : « LCP », « Programme officiel », « Journal officiel ». */
    media: z.string().min(2),
    /** URL directe vers le document, jamais une page d'accueil. */
    url: z.string().url(),
    /** Date de la déclaration ou du document. */
    dateDeclaration: z.string().regex(ISO_JOUR, "Date attendue au format AAAA-MM-JJ"),
    /** Date de consultation, pour qu'un lien mort reste vérifiable. */
    consulteLe: z.string().regex(ISO_JOUR, "Date attendue au format AAAA-MM-JJ"),
    /**
     * Incohérence relevée DANS la source, documentée avant qu'un contradicteur
     * ne la trouve.
     *
     * Une source publique se contredit parfois : une date d'article qui ne
     * correspond pas à celle du corps du texte, un chiffre corrigé sans mention.
     * Retenir la bonne valeur sans dire qu'on a tranché, c'est laisser croire que
     * la source était claire. Champ facultatif, rempli seulement quand il y a
     * quelque chose à signaler.
     */
    incoherenceRelevee: z.string().min(10).max(400).optional(),
  })
  .strict()
  .refine((source) => source.consulteLe >= source.dateDeclaration, {
    message: "consulteLe ne peut pas précéder dateDeclaration",
    path: ["consulteLe"],
  });

export type SourcePosition = z.infer<typeof SourcePositionSchema>;

export const PoliticalActorSchema = z
  .object({
    id: IdentifiantSchema,
    kind: z.enum(["party", "candidate", "coalition", "campaign", "independent"]),
    name: z.string().min(2),
    /** Clé de tri, saisie à la main : jamais déduite de `name`. */
    sortName: z.string().min(2),
    slug: IdentifiantSchema,
    status: z.enum(["active", "inactive", "withdrawn", "historical"]),
  })
  .strict();

export const CandidateSchema = z
  .object({
    actorId: IdentifiantSchema,
    status: z.enum([
      "potential",
      "declared",
      "nominated",
      "official",
      "withdrawn",
      "eliminated",
      "finalist",
    ]),
    baselineActorIds: z.array(IdentifiantSchema),
    statutDepuis: z.string().regex(ISO_JOUR, "Date attendue au format AAAA-MM-JJ"),
    /** Un statut sans source n'est pas un fait, c'est une rumeur. */
    statutSourceIds: z.array(IdentifiantSchema).min(1),
    /** Même règle pour la réserve : une phrase, et au moins une source. */
    reserve: z
      .object({
        texte: z.string().min(20).max(300),
        sourceIds: z.array(IdentifiantSchema).min(1),
      })
      .strict()
      .optional(),
  })
  .strict();

export const StanceSchema = z
  .object({
    id: z.string().min(3),
    actorId: IdentifiantSchema,
    questionId: IdentifiantSchema,
    value: z.union([z.literal(-2), z.literal(-1), z.literal(0), z.literal(1), z.literal(2)]),
    provenance: z.enum([
      "official-program",
      "direct-statement",
      "press-interview",
      "parliamentary-vote",
      "press-report",
      "party-platform",
      "coalition-platform",
      "inference",
    ]),
    confidence: z.enum(["low", "medium", "high"]),
    /** Au moins une source. Une position sans source ne se publie pas. */
    sourceIds: z.array(IdentifiantSchema).min(1),
    citation: z.string().max(240),
    adequation: z.enum(["directe", "partielle", "deduite"]),
    /** Maillon d'origine quand la source citée en relaie un autre. */
    sourcePrimaire: z.string().min(5).max(200).optional(),
    rationale: z.string().min(10),
    reviewStatus: z.enum(["draft", "double-coded", "reconciled", "published"]),
    updatedAt: z.string().regex(ISO_JOUR, "Date attendue au format AAAA-MM-JJ"),
  })
  .strict()
  .refine((stance) => stance.provenance === "inference" || stance.citation.trim().length > 0, {
    message:
      "Une position autre qu'une inférence doit porter le verbatim qui la fonde. " +
      "Sans citation, le codage n'est pas contestable, donc pas vérifiable.",
    path: ["citation"],
  })
  .refine((stance) => stance.provenance !== "inference" || stance.rationale.length >= 40, {
    message:
      "Une inférence n'a pas de verbatim : son raisonnement doit être écrit en entier " +
      "dans `rationale`, faute de quoi elle n'est pas vérifiable.",
    path: ["rationale"],
  })
  /*
   * PLAFOND DE VALEUR. Hors adéquation directe, la position ne peut pas porter la
   * valeur maximale. C'est la contrainte la plus utile du fichier : sans elle, le
   * codage le moins établi pèse sur le score autant que le mieux établi, et rien
   * dans l'écran ne les distingue. Deux lignes qui rendent toute une classe
   * d'erreurs impossible.
   */
  .refine((stance) => stance.adequation === "directe" || Math.abs(stance.value) <= 1, {
    message:
      "Une position dont l'adéquation n'est pas directe ne peut pas porter ±2 : " +
      "la valeur maximale est réservée à une citation qui répond exactement à l'affirmation.",
    path: ["value"],
  })
  /*
   * Une inférence n'a par construction aucune citation qui porte sur la mesure :
   * son adéquation est donc `deduite`, et le plafond ci-dessus s'y applique.
   */
  .refine((stance) => stance.provenance !== "inference" || stance.adequation === "deduite", {
    message: "Une inférence a nécessairement une adéquation `deduite`.",
    path: ["adequation"],
  });

/** Lève sur identifiant en double, ou sur slug en double. */
export function validerActeurs(brut: unknown) {
  const acteurs = z.array(PoliticalActorSchema).min(1).parse(brut);

  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const acteur of acteurs) {
    if (ids.has(acteur.id)) throw new Error(`Acteur en double : ${acteur.id}`);
    ids.add(acteur.id);
    if (slugs.has(acteur.slug)) {
      throw new Error(`Deux acteurs partagent le slug « ${acteur.slug} » : une URL serait écrasée`);
    }
    slugs.add(acteur.slug);
  }

  return acteurs;
}

/**
 * Valide les candidatures contre les acteurs, ou lève.
 *
 * Trois contrôles qui n'ont rien de formel :
 *
 *   - une candidature porte sur un acteur de type `candidate`. Un parti ne se
 *     présente pas à l'élection présidentielle ; une personne le fait ;
 *   - un `baselineActorId` existe, et ce n'est pas le candidat lui-même. Se
 *     référencer soi-même produirait une chaîne de résolution circulaire ;
 *   - un acteur n'a qu'une candidature. Deux statuts pour la même personne
 *     rendraient l'affichage dépendant de l'ordre du tableau.
 */
export function validerCandidatures(
  brut: unknown,
  acteurs: readonly { id: string; kind: string }[],
  sourcesConnues?: readonly { id: string }[],
) {
  const candidatures = z.array(CandidateSchema).parse(brut);
  const sources = sourcesConnues && new Set(sourcesConnues.map((source) => source.id));

  const parId = new Map(acteurs.map((acteur) => [acteur.id, acteur]));
  const vus = new Set<string>();

  for (const candidature of candidatures) {
    if (vus.has(candidature.actorId)) {
      throw new Error(`Deux candidatures pour le même acteur : ${candidature.actorId}`);
    }
    vus.add(candidature.actorId);

    const acteur = parId.get(candidature.actorId);
    if (acteur === undefined) {
      throw new Error(`Candidature rattachée à un acteur inconnu : ${candidature.actorId}`);
    }
    if (acteur.kind !== "candidate") {
      throw new Error(
        `Candidature rattachée à un acteur de type « ${acteur.kind} » : ${candidature.actorId}`,
      );
    }

    for (const sourceId of candidature.reserve?.sourceIds ?? []) {
      if (sources !== undefined && !sources.has(sourceId)) {
        throw new Error(
          `La réserve de ${candidature.actorId} cite une source inconnue : ${sourceId}`,
        );
      }
    }

    for (const baseline of candidature.baselineActorIds) {
      if (baseline === candidature.actorId) {
        throw new Error(`Chaîne de résolution circulaire : ${candidature.actorId} se référence`);
      }
      if (!parId.has(baseline)) {
        throw new Error(
          `${candidature.actorId} reprend la position d'un acteur inconnu : ${baseline}`,
        );
      }
    }
  }

  return candidatures;
}

/** Lève sur identifiant de source en double, ou sur URL invalide. */
export function validerSourcesPositions(brut: unknown) {
  const sources = z.array(SourcePositionSchema).parse(brut);

  const vus = new Set<string>();
  for (const source of sources) {
    if (vus.has(source.id)) throw new Error(`Source de position en double : ${source.id}`);
    vus.add(source.id);
  }

  return sources;
}

/**
 * Valide les positions contre les acteurs, les questions et les sources, ou lève.
 *
 * L'intégrité référentielle est le cœur du dispositif : une position dont la
 * source n'existe pas est une position inventée, et c'est exactement ce que
 * `CLAUDE.md` interdit. Rien ici ne juge la valeur codée — ce jugement est
 * humain, et c'est le double codage à l'aveugle qui le contrôle.
 */
export function validerPositions(
  brut: unknown,
  reference: {
    acteurs: readonly { id: string }[];
    questions: readonly Question[];
    sources: readonly { id: string }[];
  },
) {
  const positions = z.array(StanceSchema).parse(brut);

  const acteursConnus = new Set(reference.acteurs.map((acteur) => acteur.id));
  const questionsConnues = new Set(reference.questions.map((question) => question.id));
  const sourcesConnues = new Set(reference.sources.map((source) => source.id));

  const vus = new Set<string>();
  for (const position of positions) {
    if (vus.has(position.id)) throw new Error(`Position en double : ${position.id}`);
    vus.add(position.id);

    if (!acteursConnus.has(position.actorId)) {
      throw new Error(`Position rattachée à un acteur inconnu : ${position.id}`);
    }
    if (!questionsConnues.has(position.questionId)) {
      throw new Error(`Position rattachée à une question inconnue : ${position.id}`);
    }
    for (const sourceId of position.sourceIds) {
      if (!sourcesConnues.has(sourceId)) {
        throw new Error(`Position ${position.id} cite une source inconnue : ${sourceId}`);
      }
    }
  }

  return positions;
}

/**
 * Positions prêtes à être publiées.
 *
 * `draft` et `double-coded` restent dans le dépôt sans être servies : un codage
 * en cours de réconciliation n'a pas à figurer dans un classement public. C'est
 * la même logique que `relecture: brouillon` pour les articles.
 */
export function positionsPubliables<T extends { reviewStatus: string }>(
  positions: readonly T[],
): T[] {
  return positions.filter(
    (position) => position.reviewStatus === "reconciled" || position.reviewStatus === "published",
  );
}

export const NATURES_PROPOSITION = [
  "programme-2027",
  "declaration-personnelle",
  "document-parti",
  "travail-parlementaire",
  "programme-anterieur",
] as const;

export const DOMAINES_PROPOSITION = [
  "travail-retraites",
  "economie-salaires",
  "fiscalite",
  "immigration",
  "ecologie",
  "institutions",
  "europe-international",
  "securite-justice",
  "sante-grand-age",
  "education-jeunesse",
  "famille-societe",
] as const;

/**
 * Proposition de programme. Mêmes exigences qu'une position — source, verbatim,
 * date — sans valeur ni adéquation : elle n'entre dans aucun calcul.
 */
export const PropositionSchema = z
  .object({
    id: IdentifiantSchema,
    actorId: IdentifiantSchema,
    domaine: z.enum(DOMAINES_PROPOSITION),
    portee: z.enum(["mesure", "orientation"]),
    intitule: z.string().min(10).max(120),
    /** Le verbatim, jamais vide : c'est lui qui se vérifie, pas l'intitulé. */
    citation: z.string().trim().min(10).max(320),
    nature: z.enum(NATURES_PROPOSITION),
    precisions: z.string().min(10).max(300).optional(),
    sourceIds: z.array(IdentifiantSchema).min(1),
    reviewStatus: z.enum(["draft", "double-coded", "reconciled", "published"]),
    updatedAt: z.string().regex(ISO_JOUR, "Date attendue au format AAAA-MM-JJ"),
  })
  .strict();

export const EtatProgrammeSchema = z
  .object({
    actorId: IdentifiantSchema,
    etat: z.enum(["publie", "en-construction", "non-publie"]),
    texte: z.string().min(20).max(300),
    sourceIds: z.array(IdentifiantSchema).min(1),
  })
  .strict();

/**
 * Valide les propositions contre les acteurs et les sources, ou lève.
 *
 * DEUX RÈGLES DE DATE, parce que la nature d'une proposition est une
 * affirmation sur le temps :
 *
 *   - « programme 2027 » ne peut s'appuyer que sur des documents datés de la
 *     campagne. Un programme de 2022 toujours en ligne n'en devient pas un ;
 *   - « programme antérieur » exige l'inverse : une source d'avant la campagne.
 *     Étiqueter ainsi un texte de 2026 le ferait passer pour périmé.
 *
 * Le seuil est celui qui déclenche l'avertissement d'ancienneté des positions :
 * une seule frontière entre « avant » et « pendant » la campagne sur tout le site.
 */
export function validerPropositions(
  brut: unknown,
  reference: {
    acteurs: readonly { id: string }[];
    sources: readonly { id: string; dateDeclaration: string }[];
    seuilCampagne: string;
  },
) {
  const propositions = z.array(PropositionSchema).parse(brut);

  const acteursConnus = new Set(reference.acteurs.map((acteur) => acteur.id));
  const dateParSource = new Map(reference.sources.map((s) => [s.id, s.dateDeclaration]));

  const vus = new Set<string>();
  for (const proposition of propositions) {
    if (vus.has(proposition.id)) throw new Error(`Proposition en double : ${proposition.id}`);
    vus.add(proposition.id);

    if (!acteursConnus.has(proposition.actorId)) {
      throw new Error(`Proposition rattachée à un acteur inconnu : ${proposition.id}`);
    }
    const dates = proposition.sourceIds.map((id) => {
      const date = dateParSource.get(id);
      if (date === undefined) {
        throw new Error(`Proposition ${proposition.id} cite une source inconnue : ${id}`);
      }
      return date;
    });

    const plusRecente = dates.reduce((a, b) => (a > b ? a : b));
    if (proposition.nature === "programme-2027" && dates.some((d) => d < reference.seuilCampagne)) {
      throw new Error(
        `${proposition.id} est présentée comme « programme 2027 » mais cite une source d'avant la campagne.`,
      );
    }
    if (proposition.nature === "programme-anterieur" && plusRecente >= reference.seuilCampagne) {
      throw new Error(
        `${proposition.id} est présentée comme « programme antérieur » mais sa source date de la campagne.`,
      );
    }
  }

  return propositions;
}

/**
 * Valide les états de programme, ou lève.
 *
 * UN ÉTAT PAR CANDIDAT, NI PLUS NI MOINS. Un candidat sans état aurait une
 * fiche muette sur son programme ; deux états rendraient l'affichage dépendant
 * de l'ordre du tableau.
 */
export function validerEtatsProgramme(
  brut: unknown,
  reference: {
    candidatures: readonly { actorId: string }[];
    sources: readonly { id: string }[];
  },
) {
  const etats = z.array(EtatProgrammeSchema).parse(brut);
  const sourcesConnues = new Set(reference.sources.map((source) => source.id));
  const attendus = new Set(reference.candidatures.map((c) => c.actorId));

  const vus = new Set<string>();
  for (const etat of etats) {
    if (vus.has(etat.actorId)) throw new Error(`Deux états de programme pour ${etat.actorId}`);
    vus.add(etat.actorId);
    if (!attendus.has(etat.actorId)) {
      throw new Error(`État de programme pour un acteur sans candidature : ${etat.actorId}`);
    }
    for (const id of etat.sourceIds) {
      if (!sourcesConnues.has(id)) {
        throw new Error(`L'état de programme de ${etat.actorId} cite une source inconnue : ${id}`);
      }
    }
  }
  for (const id of attendus) {
    if (!vus.has(id)) throw new Error(`Aucun état de programme pour le candidat ${id}`);
  }

  return etats;
}
