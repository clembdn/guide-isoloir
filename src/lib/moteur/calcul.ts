/**
 * Moteur de proximité. Déterministe, sans état, sans aléa.
 *
 * Voir `types.ts` pour les quatre grandeurs que ce fichier maintient séparées.
 *
 * DÉTERMINISME. L'addition des flottants n'est pas associative : additionner
 * les mêmes accords dans un ordre différent peut changer les derniers bits.
 * Toutes les entrées sont donc triées canoniquement avant sommation, ce qui
 * rend le résultat identique quel que soit l'ordre du JSON. L'audit le vérifie.
 */
import {
  trierParNomAlphabetique,
  type Candidate,
  type PoliticalActor,
  type Stance,
  type StanceValue,
} from "../modele";
import { SANS_AVIS, type Reponse } from "../session-test";
import type { Question } from "../questions";
import { SEUIL_PUBLICATION } from "../seuils";
import {
  NIVEAUX_RESOLUTION,
  type Classement,
  type Confiance,
  type Couverture,
  type DetailPosition,
  type NiveauIncertitude,
  type ResultatActeur,
  type ResultatTheme,
} from "./types";

/** Écart maximal de l'échelle : de -2 à +2. */
const AMPLITUDE = 4;

/**
 * Tolérance de comparaison des scores pour le rang.
 *
 * Deux acteurs mathématiquement à égalité peuvent différer d'un bit après une
 * suite d'opérations flottantes différente. Comparer à l'identique produirait
 * un ordre arbitraire là où il doit y avoir un ex æquo. 1e-9 est très au-dessus
 * du bruit flottant et très en dessous de toute différence réelle.
 */
const EPSILON_RANG = 1e-9;

const NIVEAU_PAR_CLE = new Map(NIVEAUX_RESOLUTION.map((niveau) => [niveau.cle, niveau]));

/**
 * Empreinte FNV-1a 32 bits, écrite en clair.
 *
 * Aucune dépendance, aucune cryptographie : on ne protège rien, on veut un
 * nombre stable tiré d'une chaîne. `>>> 0` maintient l'entier non signé, sinon
 * le décalage de JavaScript ramènerait des valeurs négatives et l'ordre
 * dépendrait de la plateforme.
 */
function empreinte(texte: string): number {
  let valeur = 0x811c9dc5;
  for (let i = 0; i < texte.length; i += 1) {
    valeur ^= texte.charCodeAt(i);
    valeur = Math.imul(valeur, 0x01000193) >>> 0;
  }
  return valeur >>> 0;
}

/**
 * Graine d'affichage, dérivée des réponses de l'électeur.
 *
 * POURQUOI PAS L'ORDRE ALPHABÉTIQUE. À score égal, l'alphabétique produit un
 * biais systématique : le même acteur est toujours au-dessus, pour tout le monde,
 * à tous les scrutins. Le Conseil constitutionnel arrête d'ailleurs la liste
 * officielle des candidats par tirage au sort, précisément pour cette raison.
 *
 * POURQUOI PAS UN TIRAGE. Un aléa non reproductible rendrait un résultat
 * incontestable : deux personnes aux mêmes réponses n'obtiendraient pas le même
 * écran, et une carte partageable ne prouverait plus rien.
 *
 * La graine vient donc des réponses elles-mêmes. Mêmes réponses, même ordre,
 * chez n'importe qui, sans serveur et sans aléa stocké. Elle est publiée avec le
 * résultat pour qu'un tiers puisse refaire le calcul.
 */
function grainePourReponses(reponses: Readonly<Record<string, Reponse>>): number {
  const canonique = Object.keys(reponses)
    .sort()
    .map((id) => `${id}=${reponses[id]}`)
    .join(";");
  return empreinte(canonique);
}

/** Accord entre deux positions, dans [0, 1]. Symétrique par construction. */
function accord(reponse: StanceValue, position: StanceValue): number {
  return (AMPLITUDE - Math.abs(reponse - position)) / AMPLITUDE;
}

/**
 * Meilleure position disponible pour un couple acteur/question.
 *
 * La chaîne de résolution est une préférence, pas un filtre : on retient le
 * maillon le plus haut disponible. À maillon égal, la position la plus
 * récemment mise à jour, puis l'identifiant, pour que rien ne dépende de
 * l'ordre du tableau.
 */
function meilleurePosition(candidates: readonly Stance[]): Stance | null {
  if (candidates.length === 0) return null;

  return [...candidates].sort((a, b) => {
    const rangA = NIVEAU_PAR_CLE.get(a.provenance)?.rang ?? Number.MAX_SAFE_INTEGER;
    const rangB = NIVEAU_PAR_CLE.get(b.provenance)?.rang ?? Number.MAX_SAFE_INTEGER;
    return rangA - rangB || b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id);
  })[0]!;
}

/** Moyenne d'une liste. `null` si la liste est vide. */
function moyenne(valeurs: readonly number[]): number | null {
  if (valeurs.length === 0) return null;
  let somme = 0;
  for (const valeur of valeurs) somme += valeur;
  return somme / valeurs.length;
}

function niveauIncertitude(couverture: Couverture, dispersion: number): NiveauIncertitude {
  if (couverture.tauxSolide < 0.5 || couverture.taux < 0.6) return "forte";
  if (couverture.tauxSolide < 0.8 || dispersion > 0.25) return "moyenne";
  return "faible";
}

export type EntreesMoteur = {
  questions: readonly Question[];
  acteurs: readonly PoliticalActor[];
  positions: readonly Stance[];
  reponses: Readonly<Record<string, Reponse>>;
  /**
   * Candidatures, pour la reprise de position à défaut de position personnelle.
   *
   * Facultatif : sans candidature, chaque acteur n'est comparé que sur ce qu'il
   * documente lui-même. C'est ce paramètre qui permet de présenter un candidat
   * dès maintenant, avant qu'il ait un programme, sans rien inventer : il
   * apparaît avec la ligne de son parti, et l'écran dit que c'est celle du
   * parti.
   *
   * Les acteurs repris doivent figurer dans `acteurs` pour être nommés ;
   * `validerCandidatures` le garantit côté données.
   */
  candidatures?: readonly Candidate[];
  /**
   * Annuaire des acteurs, pour NOMMER l'origine d'une position reprise.
   *
   * Distinct de `acteurs`, qui est la liste de ceux qu'on CLASSE. Les deux ne
   * coïncident pas : `/resultat` classe les candidats, mais les positions
   * reprises viennent des partis, qui ne sont pas classés. Sans annuaire
   * distinct, `heriteDe` retomberait sur l'identifiant brut et l'écran
   * afficherait « parti-rassemblement-national » à la place du nom.
   *
   * Par défaut, `acteurs` : sans reprise, il n'y a rien d'autre à nommer.
   */
  annuaire?: readonly PoliticalActor[];
  /**
   * Couverture minimale pour FIGURER au classement.
   *
   * Par défaut `SEUIL_PUBLICATION.couverture`, qui porte l'argument et le chiffre. Le
   * paramètre existe pour que les tests puissent exercer le calcul sur des jeux
   * factices de deux ou trois questions, où toute couverture réaliste est hors
   * d'atteinte, et pour que l'audit mesure ce que vaut le moteur SANS plancher.
   */
  seuilClassement?: number;
};

/**
 * Calcule le classement.
 *
 * Rien n'est aléatoire, rien ne dépend de l'horloge, rien ne dépend de l'ordre
 * des tableaux d'entrée. Deux exécutions sur les mêmes données rendent le même
 * résultat.
 */
export function calculer({
  questions,
  acteurs,
  positions,
  reponses,
  candidatures = [],
  annuaire = acteurs,
  seuilClassement = SEUIL_PUBLICATION.couverture,
}: EntreesMoteur): Classement {
  // Tri canonique : c'est ce qui rend le résultat indépendant de l'ordre du JSON.
  const questionsTriees = [...questions].sort((a, b) => a.id.localeCompare(b.id));

  /*
   * « Sans avis » est EXCLU, jamais traité comme neutre. Un électeur sans avis
   * n'a pas une opinion centriste : il n'en a pas. Le compter comme 0
   * rapprocherait mécaniquement les acteurs dont la position est modérée.
   */
  const applicables = questionsTriees.filter((question) => {
    const reponse = reponses[question.id];
    return reponse !== undefined && reponse !== SANS_AVIS;
  });

  const themes = [...new Set(applicables.map((question) => question.theme))].sort((a, b) =>
    a.localeCompare(b),
  );

  /** Positions indexées par acteur puis par question. Aucune clé composée. */
  const parActeur = new Map<string, Map<string, Stance[]>>();
  for (const position of positions) {
    const parQuestion = parActeur.get(position.actorId) ?? new Map<string, Stance[]>();
    parQuestion.set(position.questionId, [
      ...(parQuestion.get(position.questionId) ?? []),
      position,
    ]);
    parActeur.set(position.actorId, parQuestion);
  }

  /**
   * Chaîne de reprise par acteur.
   *
   * L'ordre de `baselineActorIds` est une préférence éditoriale déclarée dans les
   * données — coalition avant parti, par exemple — pas l'ordre incident d'un
   * tableau. Il est donc respecté tel quel, et c'est la seule place du moteur où
   * un ordre d'entrée compte.
   */
  const reprises = new Map(
    candidatures.map((candidature) => [candidature.actorId, candidature.baselineActorIds]),
  );
  const nomParId = new Map(annuaire.map((acteur) => [acteur.id, acteur.name]));

  /**
   * Position retenue pour un couple acteur/question, et son origine.
   *
   * La position personnelle l'emporte toujours, même mal documentée : un candidat
   * qui contredit son parti dit quelque chose, et l'écraser par la ligne du parti
   * serait une falsification. À défaut seulement, on descend la chaîne de
   * reprise.
   */
  function resoudre(
    acteurId: string,
    questionId: string,
  ): { position: Stance; heriteDe: string | null; heriteDeId: string | null } | null {
    const propre = meilleurePosition(parActeur.get(acteurId)?.get(questionId) ?? []);
    if (propre !== null) return { position: propre, heriteDe: null, heriteDeId: null };

    for (const repris of reprises.get(acteurId) ?? []) {
      const position = meilleurePosition(parActeur.get(repris)?.get(questionId) ?? []);
      if (position !== null) {
        return { position, heriteDe: nomParId.get(repris) ?? repris, heriteDeId: repris };
      }
    }

    return null;
  }

  /*
   * Type de retour annoté, et non `satisfies` : sans lui, `rang: null` est
   * inféré comme le type littéral `null` et l'attribution du rang plus bas
   * devient une erreur. L'annotation élargit au type déclaré.
   */
  const bruts = trierParNomAlphabetique(acteurs).map((acteur): ResultatActeur => {
    const resultatsThemes: ResultatTheme[] = [];
    let documentees = 0;
    let personnelles = 0;
    let solides = 0;

    for (const theme of themes) {
      const questionsTheme = applicables.filter((question) => question.theme === theme);
      const details: DetailPosition[] = [];
      const accords: number[] = [];

      for (const question of questionsTheme) {
        const reponse = reponses[question.id] as StanceValue;
        const resolue = resoudre(acteur.id, question.id);

        if (resolue === null) {
          details.push({
            questionId: question.id,
            theme,
            reponseElecteur: reponse,
            positionActeur: null,
            accord: null,
            niveauLibelle: "Position inconnue",
            confiance: null,
            heriteDe: null,
            heriteDeId: null,
            citation: null,
            sourceIds: [],
            adequation: null,
            updatedAt: null,
          });
          continue;
        }

        const { position, heriteDe, heriteDeId } = resolue;
        const valeur = accord(reponse, position.value);
        accords.push(valeur);
        documentees += 1;
        if (heriteDe === null) {
          personnelles += 1;
          if (position.confidence !== "low") solides += 1;
        }

        details.push({
          questionId: question.id,
          theme,
          reponseElecteur: reponse,
          positionActeur: position.value,
          accord: valeur,
          niveauLibelle: NIVEAU_PAR_CLE.get(position.provenance)?.libelle ?? "Origine inconnue",
          confiance: position.confidence as Confiance,
          heriteDe,
          heriteDeId,
          citation: position.citation,
          sourceIds: position.sourceIds,
          adequation: position.adequation,
          updatedAt: position.updatedAt,
        });
      }

      resultatsThemes.push({
        theme,
        // La confiance n'entre pas ici. Elle n'a aucun effet sur le score.
        score: moyenne(accords),
        applicables: questionsTheme.length,
        documentees: accords.length,
        positions: details,
      });
    }

    /*
     * NORMALISATION PAR THÈME. On moyenne les moyennes de thèmes, pas les
     * accords bruts : sans cela, un thème de quatre questions pèserait deux
     * fois un thème de deux, et le poids d'un sujet dépendrait du nombre de
     * questions rédigées plutôt que d'une décision éditoriale.
     *
     * Un thème sans aucune position documentée est écarté, pas compté zéro :
     * l'ignorance n'est pas un désaccord.
     */
    const scoresThemes = resultatsThemes
      .map((resultat) => resultat.score)
      .filter((score): score is number => score !== null);

    /*
     * `null` et non `0` quand aucun thème n'est documenté. Zéro est la note du
     * désaccord total : l'attribuer à un acteur sur lequel on ne sait rien
     * reviendrait à compter l'ignorance comme une opposition, ce que les deux
     * normalisations ci-dessus refusent précisément de faire à l'échelle de la
     * question et du thème. Il n'y a aucune raison de le faire à l'échelle de
     * l'acteur.
     */
    const score = moyenne(scoresThemes);
    const dispersion =
      scoresThemes.length > 1 ? Math.max(...scoresThemes) - Math.min(...scoresThemes) : 0;

    const couverture: Couverture = {
      applicables: applicables.length,
      documentees,
      personnelles,
      solides,
      taux: applicables.length === 0 ? 0 : documentees / applicables.length,
      tauxSolide: applicables.length === 0 ? 0 : solides / applicables.length,
    };

    return {
      actorId: acteur.id,
      nom: acteur.name,
      sortName: acteur.sortName,
      score,
      rang: null,
      couverture,
      incertitude: niveauIncertitude(couverture, dispersion),
      parTheme: resultatsThemes,
    } satisfies ResultatActeur;
  });

  /*
   * ÉLIGIBILITÉ. Deux conditions, et la seconde n'est pas redondante : avec un
   * seuil à zéro — ce que font les tests sur des jeux factices — un acteur sans
   * aucune position documentée franchirait le seuil tout en n'ayant pas de score
   * à comparer. On exige donc explicitement un score.
   */
  const estClassable = (resultat: ResultatActeur): boolean =>
    resultat.score !== null && resultat.couverture.taux >= seuilClassement;

  /*
   * RANG. Tri par score décroissant, ex æquo au même rang. Le départage
   * n'intervient QUE dans l'ordre de présentation : deux acteurs au même score
   * portent le même rang, et leur ordre relatif n'est pas une information sur
   * leur proximité.
   *
   * L'ordre de présentation des ex æquo est tiré de la graine, elle-même tirée
   * des réponses. L'identifiant départage les empreintes identiques, pour que le
   * tri reste total et déterministe.
   */
  const graine = grainePourReponses(reponses);
  const clesAffichage = new Map(
    bruts.map((resultat) => [resultat.actorId, empreinte(`${graine}:${resultat.actorId}`)]),
  );

  const classes = bruts.filter(estClassable).sort(
    (a, b) =>
      // `estClassable` a garanti les deux scores non nuls.
      b.score! - a.score! ||
      clesAffichage.get(a.actorId)! - clesAffichage.get(b.actorId)! ||
      a.actorId.localeCompare(b.actorId),
  );

  /*
   * Les écartés restent dans l'ordre alphabétique où `bruts` les a laissés.
   * Aucun tri par score : un ordre, même discret, se lit comme un classement,
   * et c'est précisément ce qu'on vient de refuser de faire pour eux.
   */
  const nonClasses = bruts.filter((resultat) => !estClassable(resultat));

  let rangCourant = 0;
  /*
   * `null` et non `NaN` comme sentinelle : toute comparaison avec `NaN` est
   * fausse, y compris `Math.abs(x - NaN) > ε`. Avec `NaN`, la première
   * itération n'attribuait aucun rang et tout le classement restait à zéro.
   */
  let scorePrecedent: number | null = null;
  classes.forEach((resultat, index) => {
    if (scorePrecedent === null || Math.abs(resultat.score! - scorePrecedent) > EPSILON_RANG) {
      rangCourant = index + 1;
      scorePrecedent = resultat.score;
    }
    resultat.rang = rangCourant;
  });

  const meilleurs = classes.slice(0, 3).map((resultat) => resultat.score!);
  const ecartsTenus =
    meilleurs.length > 1 && meilleurs[0]! - meilleurs[meilleurs.length - 1]! < 0.05;

  /*
   * Profil peu marqué : l'électeur n'a presque rien tranché. Soit il a répondu
   * « sans avis » partout, soit il est resté au point milieu. Dans les deux cas
   * le classement est mathématiquement valable et humainement vide, et le dire
   * vaut mieux que de le présenter comme un résultat.
   */
  const valeursExprimees = applicables.map((question) => reponses[question.id] as StanceValue);
  const intensiteMoyenne = moyenne(valeursExprimees.map((valeur) => Math.abs(valeur))) ?? 0;
  const profilPeuMarque = applicables.length < 3 || intensiteMoyenne < 0.75;

  return {
    classes,
    nonClasses,
    questionsApplicables: applicables.length,
    questionsPosees: questions.length,
    graineAffichage: graine,
    profilPeuMarque,
    ecartsTenus,
  };
}
