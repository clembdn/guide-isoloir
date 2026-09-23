/**
 * Sérialisation CSV, au sens de la RFC 4180.
 *
 * Écrite ici plutôt qu'importée : vingt lignes ne justifient pas une
 * dépendance, et les verbatims politiques sont exactement le texte qui casse un
 * CSV naïf — guillemets, virgules, retours à la ligne dans une citation.
 *
 * Séparateur virgule, fins de ligne CRLF, UTF-8 sans BOM : le format que
 * data.gouv.fr et les bibliothèques de lecture attendent par défaut.
 */
export type Cellule = string | number | null;

function cellule(valeur: Cellule): string {
  if (valeur === null) return "";
  const texte = String(valeur);
  return /[",\r\n]/.test(texte) ? `"${texte.replaceAll('"', '""')}"` : texte;
}

export function versCsv(
  entetes: readonly string[],
  lignes: readonly (readonly Cellule[])[],
): string {
  for (const [index, ligne] of lignes.entries()) {
    if (ligne.length !== entetes.length) {
      throw new Error(
        `Ligne CSV ${index + 1} : ${ligne.length} cellules pour ${entetes.length} colonnes.`,
      );
    }
  }
  return [entetes, ...lignes].map((ligne) => ligne.map(cellule).join(",")).join("\r\n") + "\r\n";
}
