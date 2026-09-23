/**
 * Initiales de repli, quand aucune photo sous licence libre n'existe.
 *
 * Partagées par l'écran de résultat et les fiches candidat : un candidat sans
 * photo libre doit porter les mêmes initiales partout.
 *
 * PAS DE SILHOUETTE GRISE. Une silhouette générique sur un site de
 * comparaison politique ferait passer l'absence de photo libre pour une
 * caractéristique du candidat : les initiales disent qu'il manque une image,
 * la silhouette dit qu'il manque quelqu'un.
 *
 * Les particules sont écartées — « Le Pen » donne « LP » et non « LP » via
 * « Le » — en ne gardant que les mots d'au moins deux lettres commençant par
 * une majuscule, puis le premier et le dernier.
 */
export function initiales(nom: string): string {
  const mots = nom
    .split(/[\s-]+/)
    .filter((mot) => mot.length > 1 && mot[0] === mot[0]?.toLocaleUpperCase("fr"));
  const retenus = mots.length > 1 ? [mots[0], mots[mots.length - 1]] : mots;
  return retenus.map((mot) => mot?.[0] ?? "").join("");
}
