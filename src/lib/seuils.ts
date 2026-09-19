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
  /** Part des affirmations applicables qu'un acteur doit documenter pour compter. */
  couverture: 0.4,
  /** Nombre d'acteurs devant atteindre cette couverture. */
  acteursMin: 5,
} as const;

/**
 * Couverture en dessous de laquelle un acteur n'affiche PAS de pourcentage.
 *
 * Le plancher par acteur est distinct du seuil de publication : le classement
 * peut être publiable dans son ensemble et contenir un acteur documenté sur
 * trois affirmations. Un « 91 % » calculé sur trois cases est un chiffre juste
 * et une information fausse. Sous le plancher, l'acteur affiche le nombre
 * d'affirmations documentées, et rien qui ressemble à une mesure.
 */
export const PLANCHER_POURCENTAGE = 0.4;

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
