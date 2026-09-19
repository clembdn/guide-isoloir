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
 * DEUX GRANDEURS DIFFÉRENTES, ET IL FAUT S'EN MÉFIER : ce plancher et
 * `SEUIL_PUBLICATION.couverture` ont longtemps valu 0,4 tous les deux, ce qui
 * les faisait passer pour un seul réglage. Ils ne le sont pas, et les régler
 * ensemble par distraction produirait deux écrans faux :
 *
 *   - `SEUIL_PUBLICATION` répond « y a-t-il assez de matière pour qu'un ORDRE
 *     entre acteurs veuille dire quelque chose ? ». Il porte sur le classement
 *     entier et décide s'il s'affiche.
 *   - `PLANCHER_POURCENTAGE` répond « ce CHIFFRE-CI informe-t-il ? ». Il porte
 *     sur un acteur et décide de son seul pourcentage.
 *
 * Un classement peut être parfaitement publiable et contenir un acteur
 * documenté sur trois affirmations : « 91 % » y serait un chiffre juste et une
 * information fausse. Le plancher est donc plus exigeant que le seuil de
 * publication, et il n'y a aucune raison qu'ils coïncident.
 *
 * Sous le plancher, l'acteur affiche le nombre d'affirmations documentées, et
 * rien qui ressemble à une mesure.
 */
export const PLANCHER_POURCENTAGE = 0.5;

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
