/**
 * Tirage pseudo-aléatoire déterministe pour l'audit.
 *
 * L'audit ne peut pas utiliser `Math.random` : un audit dont le résultat change
 * d'une exécution à l'autre ne prouve rien et ne peut pas être cité. Mulberry32
 * est un générateur de quinze lignes, sans dépendance, dont la graine est
 * écrite en clair dans le fichier d'audit.
 */
export function generateur(graine: number): () => number {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Entier dans [0, borne[. */
export function entier(tirage: () => number, borne: number): number {
  return Math.floor(tirage() * borne);
}

/** Copie mélangée, sans toucher au tableau d'origine. */
export function melanger<T>(valeurs: readonly T[], tirage: () => number): T[] {
  const copie = [...valeurs];
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = entier(tirage, i + 1);
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}
