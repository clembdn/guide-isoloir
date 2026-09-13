/**
 * Formatage des dates de mise à jour.
 *
 * Les pages affichent une date lisible et exposent la date ISO dans l'attribut
 * `datetime` ainsi que dans le balisage schema.org. Une seule fonction pour les
 * deux usages, afin que le visible et le balisé ne puissent pas diverger.
 */

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Transforme `2026-09-14` en `14 septembre 2026`.
 *
 * Volontairement sans `Intl` : la sortie doit être identique au build et dans le
 * navigateur, quelle que soit la locale de la machine qui compile.
 *
 * @throws si la date n'est pas au format `AAAA-MM-JJ` ou n'existe pas.
 */
export function formatDateFr(isoDate: string): string {
  const match = ISO_DATE.exec(isoDate);
  if (!match) {
    throw new Error(`Date attendue au format AAAA-MM-JJ, reçu : ${isoDate}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const monthName = MONTHS[month - 1];
  if (monthName === undefined) {
    throw new Error(`Mois invalide dans la date : ${isoDate}`);
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) {
    throw new Error(`Jour invalide dans la date : ${isoDate}`);
  }

  // « 1er » et non « 1 ».
  const dayLabel = day === 1 ? "1er" : String(day);
  return `${dayLabel} ${monthName} ${year}`;
}
