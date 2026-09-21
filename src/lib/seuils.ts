/**
 * Seuils d'affichage du résultat.
 *
 * Rassemblés ici, et pas semés dans les composants, parce que ce sont des
 * DÉCISIONS ÉDITORIALES et qu'elles doivent être lisibles d'un coup d'œil, par
 * quelqu'un qui ne lit pas le Svelte. Chacune répond à la même question : à
 * partir de quand un chiffre informe-t-il plutôt qu'il ne trompe ?
 */

/**
 * Seuil de publication du classement.
 *
 * Sous ce seuil, `/resultat` affiche l'état d'avancement au lieu d'un
 * classement. Un classement établi sur presque rien ressemble trait pour trait
 * à un classement établi sur beaucoup : rien ne les distingue à l'œil, et c'est
 * précisément pour cela qu'il faut un seuil et non un avertissement.
 *
 * DEUX CONDITIONS, pas une. Un seul acteur bien documenté ne fait pas un
 * comparateur : il faut de la matière ET plusieurs acteurs à comparer, sinon le
 * classement dit surtout qui a été codé en premier.
 */
export const SEUIL_PUBLICATION = {
  /**
   * Part des affirmations applicables qu'un acteur doit documenter pour être
   * CLASSÉ. En dessous, il est nommé à part, avec sa couverture, sans rang.
   */
  couverture: 0.35,
  /** Nombre d'acteurs devant atteindre cette couverture. */
  acteursMin: 3,
} as const;

/*
 * DESSERRÉS LE 20 SEPTEMBRE 2026 : 0,4 et 5 au départ, 0,25 et 3 ensuite.
 *
 * Décision éditoriale assumée. À sept mois du scrutin, un seul candidat a
 * publié un programme, et exiger 40 % de couverture chez cinq acteurs revenait
 * à ne rien afficher avant l'hiver.
 *
 * REMONTÉ À 0,35 LE 21 SEPTEMBRE 2026, ET LE SEUIL A CHANGÉ DE NATURE.
 *
 * Il ne décidait jusque-là que de l'AFFICHAGE du classement : les acteurs sous
 * le seuil étaient comptés à part, puis rangés avec les autres. C'était l'erreur.
 * Le score ne dépend pas du volume — le moteur normalise par thème et écarte les
 * thèmes non documentés, et l'audit vérifie qu'une couverture partielle
 * n'avantage ni ne désavantage EN MOYENNE. Mais un classement n'est pas une
 * moyenne, c'est un MAXIMUM, et le maximum est sensible à la VARIANCE. Moins un
 * acteur documente de positions, plus son score est dispersé, donc plus il
 * occupe souvent le premier rang. Mesuré sur les données du 20 septembre : un
 * candidat documenté sur UNE affirmation sur vingt-quatre arrivait premier dans
 * 30 % des profils, contre 1 % pour un candidat documenté sur dix-huit — avec
 * des scores moyens à cinq centièmes l'un de l'autre. Aucun chiffre n'était
 * faux, et l'ordre était trompeur.
 *
 * POURQUOI UN SEUIL ET PAS UNE PONDÉRATION. Amortir un score mal documenté vers
 * le centre corrigerait le symptôme en installant le biais inverse : les acteurs
 * les mieux couverts remonteraient mécaniquement, ce que CLAUDE.md interdit au
 * même titre. La seule réponse qui ne mélange pas proximité politique et
 * confiance documentaire est de refuser de ranger ce qu'on ne peut pas ranger,
 * et de NOMMER les écartés plutôt que de les faire disparaître.
 *
 * CE QUE LE SEUIL NE FAIT PAS. Il ne supprime pas le différentiel de variance,
 * il le BORNE. À couverture minimale, un acteur reste environ deux fois et demie
 * plus souvent premier qu'un acteur complet. L'audit mesure ce rapport à chaque
 * exécution et échoue s'il dérive ; la méthodologie le publie.
 *
 * POURQUOI 0,35 ET PAS AUTRE CHOSE. La mesure donne un rapport résiduel de 2,7
 * à 0,25, de 2,55 à 0,35, de 1,7 à 0,50. Entre 0,22 et 0,46, les données réelles
 * ne changent pas d'un candidat — huit classés dans les deux cas — si bien que
 * 0,35 ne coûte rien aujourd'hui quand 0,25 laisse du biais sur la table. Monter
 * à 0,50 exclurait David Lisnard, qui documente pourtant onze positions
 * PERSONNELLES, le record du jeu : le seuil punirait le candidat le mieux
 * documenté en propre parce que son parti n'a rien publié. Le gain sur le
 * rapport ne paie pas ce contresens.
 *
 * CE QUI N'A PAS ÉTÉ FAIT, ET POURQUOI. Descendre à 0,1 publierait un classement
 * immédiatement : deux affirmations documentées suffiraient à ranger un candidat
 * devant un autre. Ce chiffre serait juste et l'information fausse. Le verrou
 * n'est pas ici, il est dans le volume de données — et il se lève en codant,
 * pas en abaissant.
 *
 * Les deux valeurs restent surchargeables au build par
 * `GUIDE_ISOLOIR_SEUIL_COUVERTURE` et `GUIDE_ISOLOIR_SEUIL_ACTEURS`, sans
 * recompiler quoi que ce soit.
 */

/*
 * Ce seuil s'évalue sur LE CLASSEMENT AFFICHÉ, pas sur un calcul de référence.
 *
 * Premier jet : il était calculé héritage toujours inclus, pour qu'on ne puisse
 * pas faire disparaître le classement en décochant une case. C'était l'erreur.
 * Décocher l'héritage RETIRE réellement des positions : les candidats qui ne se
 * sont pas exprimés personnellement n'ont alors plus rien de documenté. Si le
 * classement n'est plus publiable dans cet état, il ne doit pas s'afficher —
 * le faire tenir sur une couverture que le lecteur vient justement d'exclure
 * reviendrait à lui montrer un ordre calculé sur autre chose que ce qu'il a
 * demandé.
 */

/**
 * Couverture en dessous de laquelle un acteur n'affiche PAS de pourcentage.
 *
 * DEUX QUESTIONS DISTINCTES, ET IL FAUT S'EN MÉFIER : ces seuils ont longtemps
 * valu 0,4 tous les deux, ce qui les faisait passer pour un seul réglage. Ils
 * répondent à des questions différentes :
 *
 *   - `SEUIL_PUBLICATION.couverture` répond « CET acteur-ci peut-il être
 *     rangé ? », et `acteursMin` « y en a-t-il assez pour qu'un ORDRE veuille
 *     dire quelque chose ? ».
 *  - `PLANCHER_POURCENTAGE` répond « ce CHIFFRE-CI informe-t-il ? ». Il porte
 *     sur un acteur et décide de son seul pourcentage.
 *
 * Sous le plancher, l'acteur affiche le nombre d'affirmations documentées, et
 * rien qui ressemble à une mesure.
 */
export const PLANCHER_POURCENTAGE = 0.35;

/**
 * Date avant laquelle une source est signalée comme antérieure à la campagne.
 *
 * POURQUOI CE SEUIL EXISTE. Tant qu'aucun programme présidentiel n'est publié,
 * la seule matière disponible pour la plupart des acteurs est un document
 * d'un autre scrutin : plateforme des législatives de 2024, programme de la
 * présidentielle de 2022. Les utiliser est un choix assumé — une estimation
 * grossière vaut mieux qu'une page vide — mais les servir sans dire qu'ils
 * sont vieux, c'est exactement l'erreur d'Elyze, qui affichait en 2022 des
 * propositions de 2017 sans que l'année apparaisse.
 *
 * POURQUOI LE 1er JANVIER 2026. La campagne de 2027 s'ouvre en 2026 : Mélenchon
 * se déclare en mai, Le Pen en juillet, le premier débat a lieu en août. Une
 * source de 2025 ou avant appartient donc à un autre cycle politique, quelle
 * que soit sa qualité.
 *
 * CE QUE LE SEUIL NE FAIT PAS. Il ne touche NI au score, NI au classement. Une
 * position ancienne reste la position qu'elle est : la dévaluer mécaniquement
 * avantagerait les candidats dont les documents sont les plus récents, c'est-
 * à-dire les mieux installés. Le seuil ne pilote qu'une phrase à l'écran.
 */
export const SOURCE_ANTERIEURE_A_LA_CAMPAGNE_AVANT = "2026-01-01";

/**
 * Accord à partir duquel une affirmation est comptée comme « d'accord ».
 *
 * 0.75 correspond à un écart d'un cran au plus sur l'échelle de cinq
 * positions : « tout à fait d'accord » face à « plutôt d'accord » est un
 * accord, « plutôt d'accord » face à « ni l'un ni l'autre » n'en est pas un.
 * Le seuil est un choix, il est donc écrit ici plutôt qu'enfoui dans un `if`.
 */
export const SEUIL_ACCORD = 0.75;

/**
 * Lecture d'un seuil depuis l'environnement, CÔTÉ NODE UNIQUEMENT.
 *
 * Les constantes ci-dessus sont de simples nombres : elles partent sans risque
 * dans le bundle du navigateur, où `process` n'existe pas. Cette fonction, elle,
 * ne doit être appelée que depuis un frontmatter `.astro`, qui s'exécute dans
 * Node au build. Les valeurs relues sont ensuite passées en PROPRIÉTÉS aux
 * îlots, jamais importées par eux.
 *
 * Pourquoi rendre le seuil configurable : `CLAUDE.md` en fait une décision
 * éditoriale, et une décision éditoriale se règle sans recompiler un composant.
 * En pratique, c'est aussi ce qui permet aux tests de bout en bout d'exercer
 * l'écran de classement avant que les données ne franchissent le seuil réel.
 *
 * Une valeur illisible est IGNORÉE, pas devinée : un seuil mal orthographié qui
 * tomberait silencieusement à zéro publierait un classement que personne n'a
 * validé.
 */
export function seuilDepuisEnvironnement(nom: string, defaut: number): number {
  const brut = process.env[nom];
  if (brut === undefined || brut.trim() === "") return defaut;

  const valeur = Number(brut);
  if (!Number.isFinite(valeur) || valeur < 0) {
    throw new Error(`${nom} : nombre positif attendu, reçu « ${brut} ».`);
  }
  return valeur;
}
