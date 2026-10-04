/**
 * Couverture des données : combien de couples candidat × affirmation le test
 * documente réellement, et sur quelles preuves.
 *
 * LE CALCUL DU TEST, PAS UNE COPIE. Les chiffres viennent de `calculer`, appelé
 * avec un profil qui répond à toutes les affirmations. Une seconde
 * implémentation finirait par compter autrement que l'écran de résultat, et la
 * méthodologie publierait une couverture que personne ne voit au test.
 *
 * Ce que ce profil ne fausse pas, et le test le vérifie : quand toutes les
 * affirmations reçoivent une réponse, la couverture, l'éligibilité au
 * classement et l'incertitude « forte » ne dépendent pas des valeurs choisies.
 * La distinction entre incertitude « moyenne » et « faible », elle, dépend de la
 * dispersion des accords, donc des réponses : elle n'est pas publiée ici.
 *
 * CE QUE CES CHIFFRES NE DISENT PAS. Une couverture n'est pas une qualité : une
 * position reprise du parti compte comme documentée, et ce n'est pas une
 * déclaration du candidat. D'où trois comptes distincts — documentées,
 * personnelles, solides — et jamais un seul.
 *
 * CE MODULE NE PART JAMAIS AU NAVIGATEUR : il importe zod.
 */
import { z } from "zod";
import { positionsPubliables } from "./acteurs";
import { calculer } from "./moteur";
import { trierParNomAlphabetique } from "./modele";
import type { Candidate, EtatProgramme, PoliticalActor, Stance, StanceValue } from "./modele";
import type { Question } from "./questions";
import { DONNEES_MISES_A_JOUR, DONNEES_OUVERTES, estEnLice, THEMES } from "./fiches";
import { MISES_A_JOUR } from "./mises-a-jour";
import { SEUIL_PUBLICATION, seuilDepuisEnvironnement } from "./seuils";
import HISTORIQUE from "../data/historique-couverture.json";
import CAMPAGNES from "../data/double-codage.json";

const ISO_JOUR = /^\d{4}-\d{2}-\d{2}$/;

export type EntreesCouverture = {
  /** Dans l'ordre du test : l'ordre des thèmes en découle. */
  questions: readonly Pick<Question, "id" | "theme">[];
  acteurs: readonly PoliticalActor[];
  candidatures: readonly Candidate[];
  positions: readonly Stance[];
  etatsProgramme: readonly Pick<EtatProgramme, "actorId" | "etat">[];
  seuilClassement: number;
};

export type CouvertureCandidat = {
  actorId: string;
  nom: string;
  slug: string;
  /** Affirmations où le test retient une position, reprises comprises. */
  documentees: number;
  /** ... dont celles du candidat lui-même. */
  personnelles: number;
  /** ... dont celles dont la source n'est pas jugée faible. */
  solides: number;
  taux: number;
  tauxSolide: number;
  /** Couverture suffisante pour figurer au classement. */
  classable: boolean;
  /** « Résultat incertain » quelles que soient les réponses. */
  incertitudeForte: boolean;
  programme: EtatProgramme["etat"] | null;
};

export type CouvertureTheme = {
  theme: string;
  /** Candidats en lice × affirmations du thème. */
  couples: number;
  documentees: number;
  personnelles: number;
  solides: number;
};

export type MesureCouverture = {
  seuilClassement: number;
  affirmations: number;
  /** Candidats en lice : un retrait sort du compte, pas des données. */
  candidats: number;
  couples: number;
  /** Positions publiées, partis et coalitions compris. */
  positionsPubliees: number;
  documentees: number;
  personnelles: number;
  solides: number;
  classables: number;
  horsIncertitudeForte: number;
  programmesPublies: number;
  parTheme: CouvertureTheme[];
  /** Ordre alphabétique, jamais par couverture : ce n'est pas un palmarès. */
  parCandidat: CouvertureCandidat[];
};

/**
 * Mesure la couverture, positions PUBLIÉES seulement.
 *
 * Le filtre est refait ici même si l'appelant l'a déjà fait : une couverture
 * qui compterait un brouillon annoncerait un test plus fiable qu'il ne l'est.
 *
 * `reponse` n'existe que pour le test d'indépendance : en dehors de lui, la
 * valeur par défaut convient et n'a aucun effet sur ce qui est mesuré.
 */
export function mesurerCouverture(
  entrees: EntreesCouverture,
  reponse: (questionId: string, rang: number) => StanceValue = () => 1,
): MesureCouverture {
  const publiees = positionsPubliables(entrees.positions);
  const enLice = new Set(entrees.candidatures.filter(estEnLice).map((c) => c.actorId));
  const candidats = trierParNomAlphabetique(
    entrees.acteurs.filter((acteur) => acteur.kind === "candidate" && enLice.has(acteur.id)),
  );

  const classement = calculer({
    questions: entrees.questions,
    acteurs: candidats,
    positions: publiees,
    reponses: Object.fromEntries(entrees.questions.map((q, rang) => [q.id, reponse(q.id, rang)])),
    candidatures: entrees.candidatures,
    annuaire: entrees.acteurs,
    seuilClassement: entrees.seuilClassement,
  });

  const resultatParId = new Map(
    [...classement.classes, ...classement.nonClasses].map((r) => [r.actorId, r]),
  );
  const classables = new Set(classement.classes.map((r) => r.actorId));
  const etatParId = new Map(entrees.etatsProgramme.map((etat) => [etat.actorId, etat.etat]));

  const parCandidat = candidats.map((candidat): CouvertureCandidat => {
    const { couverture, incertitude } = resultatParId.get(candidat.id)!;
    return {
      actorId: candidat.id,
      nom: candidat.name,
      slug: candidat.slug,
      documentees: couverture.documentees,
      personnelles: couverture.personnelles,
      solides: couverture.solides,
      taux: couverture.taux,
      tauxSolide: couverture.tauxSolide,
      classable: classables.has(candidat.id),
      incertitudeForte: incertitude === "forte",
      programme: etatParId.get(candidat.id) ?? null,
    };
  });

  const details = [...resultatParId.values()].flatMap((r) =>
    r.parTheme.flatMap((theme) => theme.positions),
  );
  const parTheme = [...new Set(entrees.questions.map((q) => q.theme))].map(
    (theme): CouvertureTheme => {
      const couples = details.filter((d) => d.theme === theme);
      const documentees = couples.filter((d) => d.positionActeur !== null);
      const personnelles = documentees.filter((d) => d.heriteDeId === null);
      return {
        theme,
        couples: couples.length,
        documentees: documentees.length,
        personnelles: personnelles.length,
        solides: personnelles.filter((d) => d.confiance !== "low").length,
      };
    },
  );

  const somme = (cle: "documentees" | "personnelles" | "solides") =>
    parCandidat.reduce((total, candidat) => total + candidat[cle], 0);

  return {
    seuilClassement: entrees.seuilClassement,
    affirmations: entrees.questions.length,
    candidats: candidats.length,
    couples: candidats.length * entrees.questions.length,
    positionsPubliees: publiees.length,
    documentees: somme("documentees"),
    personnelles: somme("personnelles"),
    solides: somme("solides"),
    classables: classables.size,
    horsIncertitudeForte: parCandidat.filter((c) => !c.incertitudeForte).length,
    programmesPublies: parCandidat.filter((c) => c.programme === "publie").length,
    parTheme,
    parCandidat,
  };
}

/** Couverture des données publiées, au seuil réellement appliqué par `/resultat`. */
export function couverturePubliee(): MesureCouverture {
  return mesurerCouverture({
    questions: DONNEES_OUVERTES.questions,
    acteurs: DONNEES_OUVERTES.acteurs,
    candidatures: DONNEES_OUVERTES.candidatures,
    positions: DONNEES_OUVERTES.positions,
    etatsProgramme: DONNEES_OUVERTES.etatsProgramme,
    seuilClassement: seuilDepuisEnvironnement(
      "GUIDE_ISOLOIR_SEUIL_COUVERTURE",
      SEUIL_PUBLICATION.couverture,
    ),
  });
}

/** Slug de page de chaque thème du test, pour lier un chiffre à ce qu'il compte. */
export const SLUG_PAR_THEME = new Map(THEMES.map((theme) => [theme.nom, theme.slug]));

/*
 * HISTORIQUE DE LA COUVERTURE.
 *
 * Un relevé par date de données, écrit par `npm run couverture` après un
 * `build:prod`. Ce n'est pas un second historique des positions — git l'est
 * déjà — mais la seule façon de tracer une courbe au build : Cloudflare
 * construit sur un clone superficiel, sans l'historique des commits.
 *
 * L'historique commence au premier relevé. Il n'est pas reconstitué : les
 * positions modifiées depuis ont perdu leur date d'origine, et une courbe
 * recalculée après coup dessinerait un passé qui n'a pas existé.
 */
export const ReleveCouvertureSchema = z
  .object({
    /** Date des données mesurées (`misAJour`), pas date du relevé. */
    date: z.string().regex(ISO_JOUR),
    candidats: z.number().int().nonnegative(),
    couples: z.number().int().nonnegative(),
    positionsPubliees: z.number().int().nonnegative(),
    documentees: z.number().int().nonnegative(),
    personnelles: z.number().int().nonnegative(),
    solides: z.number().int().nonnegative(),
    classables: z.number().int().nonnegative(),
    horsIncertitudeForte: z.number().int().nonnegative(),
  })
  .strict();

export type ReleveCouverture = z.infer<typeof ReleveCouvertureSchema>;

/** Lève si une date est mal formée, en double ou hors de l'ordre chronologique. */
export function validerHistorique(brut: unknown): ReleveCouverture[] {
  const releves = z.array(ReleveCouvertureSchema).parse(brut);
  for (let i = 1; i < releves.length; i += 1) {
    if (releves[i]!.date <= releves[i - 1]!.date) {
      throw new Error(
        `Historique de couverture : ${releves[i]!.date} ne suit pas ${releves[i - 1]!.date}.`,
      );
    }
  }
  return releves;
}

export const HISTORIQUE_COUVERTURE = validerHistorique(HISTORIQUE);

/** Relevé à écrire pour une mesure : les champs qui font une courbe, rien d'autre. */
export function releveDe(mesure: MesureCouverture, date: string): ReleveCouverture {
  return {
    date,
    candidats: mesure.candidats,
    couples: mesure.couples,
    positionsPubliees: mesure.positionsPubliees,
    documentees: mesure.documentees,
    personnelles: mesure.personnelles,
    solides: mesure.solides,
    classables: mesure.classables,
    horsIncertitudeForte: mesure.horsIncertitudeForte,
  };
}

/*
 * JOURNAL DES DONNÉES.
 *
 * Ce qui a été codé, jour par jour, tel que les données le disent. La date est
 * `updatedAt`, la date de CODAGE : une position mise à jour quitte son jour
 * d'origine pour celui de sa mise à jour. Le journal le dit en titre, plutôt que
 * de laisser croire à un registre d'ajouts.
 */
export type JourJournal = {
  date: string;
  positions: number;
  propositions: number;
  /** Acteurs concernés, par ordre alphabétique de `sortName`. */
  acteurs: string[];
};

export function journalDesDonnees(
  donnees: {
    acteurs: readonly Pick<PoliticalActor, "id" | "name" | "sortName">[];
    positions: readonly Pick<Stance, "actorId" | "updatedAt" | "reviewStatus">[];
    propositions: readonly { actorId: string; updatedAt: string; reviewStatus: string }[];
  },
  jours: number,
): JourJournal[] {
  const positions = positionsPubliables(donnees.positions);
  const propositions = positionsPubliables(donnees.propositions);
  const acteurParId = new Map(donnees.acteurs.map((acteur) => [acteur.id, acteur]));
  const dates = [...new Set([...positions, ...propositions].map((d) => d.updatedAt))]
    .sort()
    .reverse()
    .slice(0, jours);

  return dates.map((date) => {
    const duJour = [...positions, ...propositions].filter((d) => d.updatedAt === date);
    const acteurs = [...new Set(duJour.map((d) => d.actorId))]
      .map((id) => acteurParId.get(id))
      .filter((acteur) => acteur !== undefined);
    return {
      date,
      positions: positions.filter((p) => p.updatedAt === date).length,
      propositions: propositions.filter((p) => p.updatedAt === date).length,
      acteurs: trierParNomAlphabetique(acteurs).map((acteur) => acteur.name),
    };
  });
}

/** Journal des données publiées. */
export function journalPublie(jours = 10): JourJournal[] {
  return journalDesDonnees(DONNEES_OUVERTES, jours);
}

/*
 * DOUBLE CODAGE À L'AVEUGLE — résultats publiés.
 *
 * Le protocole est humain (CLAUDE.md) : deux fichiers CSV, un par codeur,
 * commités avant confrontation, et `scripts/double-codage.mjs comparer` qui
 * calcule l'accord. Ce schéma ne décrit pas le protocole, seulement ce qu'il
 * produit et que /methodologie doit publier : accord exact, accord à un niveau
 * près, désaccords non résolus, couverture par thème, date.
 */
const Taux = z.number().min(0).max(1);
const Entier = z.number().int().nonnegative();

export const CampagneDoubleCodageSchema = z
  .object({
    /** Identifiant de la campagne : la date de préparation de la feuille vierge. */
    campagne: z.string().regex(ISO_JOUR),
    /** Date de la confrontation publiée. */
    date: z.string().regex(ISO_JOUR),
    /** Qui a codé quoi, en une ou deux phrases : la page l'affiche tel quel. */
    codeurs: z.string().min(20).max(400),
    acteurs: Entier,
    couples: Entier,
    accordExact: Taux,
    /** Couples que les deux codeurs ont chiffrés : dénominateur de l'accord à un niveau. */
    couplesNumeriques: Entier,
    accordUnNiveau: Taux,
    desaccords: Entier,
    desaccordsNonResolus: Entier,
    couvertureParTheme: z.array(
      z.object({ theme: z.string().min(2), couples: Entier, documentes: Entier }).strict(),
    ),
    /** SHA-256 des deux fichiers comparés, tels que commités. */
    empreintes: z
      .object({ a: z.string().regex(/^[0-9a-f]{64}$/), b: z.string().regex(/^[0-9a-f]{64}$/) })
      .strict(),
    commit: z.string().regex(/^[0-9a-f]{7,40}$/),
    /** Chemin du rapport de confrontation dans le dépôt. */
    rapport: z.string().regex(/^data\/double-codage\/[\w/.-]+\.md$/),
  })
  .strict()
  .refine((c) => c.desaccordsNonResolus <= c.desaccords, {
    message: "Plus de désaccords non résolus que de désaccords.",
    path: ["desaccordsNonResolus"],
  })
  .refine((c) => c.couplesNumeriques <= c.couples && c.desaccords <= c.couples, {
    message: "Un sous-total dépasse le nombre de couples.",
    path: ["couples"],
  });

export type CampagneDoubleCodage = z.infer<typeof CampagneDoubleCodageSchema>;

/** Lève si une campagne est mal formée ou hors de l'ordre chronologique. */
export function validerCampagnes(brut: unknown): CampagneDoubleCodage[] {
  const campagnes = z.array(CampagneDoubleCodageSchema).parse(brut);
  for (let i = 1; i < campagnes.length; i += 1) {
    if (campagnes[i]!.date < campagnes[i - 1]!.date) {
      throw new Error(
        `Double codage : la campagne ${campagnes[i]!.campagne} précède la précédente.`,
      );
    }
  }
  return campagnes;
}

export const CAMPAGNES_DOUBLE_CODAGE = validerCampagnes(CAMPAGNES);

export function derniereCampagne(): CampagneDoubleCodage | null {
  return CAMPAGNES_DOUBLE_CODAGE.at(-1) ?? null;
}

/**
 * Date de dernière mise à jour de /methodologie.
 *
 * La page affiche désormais des chiffres calculés : son texte peut ne pas
 * bouger quand ses chiffres bougent. Sa date — affichée et publiée dans le
 * sitemap — est donc la plus récente des trois : texte, données, campagne.
 */
export function dateMethodologie(): string {
  return [MISES_A_JOUR["/methodologie"], DONNEES_MISES_A_JOUR, derniereCampagne()?.date ?? ""]
    .filter((date) => date !== "")
    .reduce((a, b) => (a > b ? a : b));
}
