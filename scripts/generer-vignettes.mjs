/**
 * Vignettes des portraits : 192 px de côté, en WebP.
 *
 * POURQUOI. Les portraits sont servis à 330 px pour les grandes cartes de
 * `/candidats`. Une page de thème et la mosaïque de l'accueil montrent les
 * mêmes visages à 32, 40, 64 ou 74 px : elles chargeaient vingt-six fichiers de
 * 330 px, environ 1 Mo, pour des carrés qu'un fichier de 192 px remplit net
 * jusqu'à trois fois la densité d'écran.
 *
 * DÉRIVÉES, JAMAIS TÉLÉCHARGÉES. Ce script lit `public/medias/portraits/`, sans
 * réseau : une vignette est le portrait déjà relevé, réduit, et son crédit est
 * celui du portrait sur `/credits-images`. Le cadrage est celui du CSS de
 * `Portrait.astro` (`object-fit: cover`, `object-position: top center`) : un
 * visage ne change pas de cadre d'une page à l'autre.
 *
 * `scripts/recuperer-medias.mjs` l'appelle après chaque relevé, pour qu'un
 * portrait remplacé ne laisse jamais une vignette périmée. Une vignette dont le
 * portrait a disparu est supprimée.
 *
 *     node scripts/generer-vignettes.mjs
 */
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
/* `sharp` est celui d'Astro, déjà installé : aucune dépendance ajoutée. */
import sharp from "sharp";

const RACINE = path.resolve(import.meta.dirname, "..");
const PORTRAITS = path.join(RACINE, "public", "medias", "portraits");
const VIGNETTES = path.join(RACINE, "public", "medias", "vignettes");

/** Côté de la vignette : 64 px, la plus grande taille qui l'emploie, à densité 3. */
export const COTE_VIGNETTE = 192;

export async function genererVignettes() {
  await mkdir(VIGNETTES, { recursive: true });
  const portraits = (await readdir(PORTRAITS)).filter((nom) => /\.(jpe?g|png|webp)$/i.test(nom));
  const attendues = new Set();

  for (const nom of portraits) {
    const vignette = `${path.parse(nom).name}.webp`;
    attendues.add(vignette);
    await sharp(path.join(PORTRAITS, nom))
      .resize(COTE_VIGNETTE, COTE_VIGNETTE, { fit: "cover", position: "top" })
      .webp({ quality: 80 })
      .toFile(path.join(VIGNETTES, vignette));
  }

  const orphelines = (await readdir(VIGNETTES)).filter((nom) => !attendues.has(nom));
  for (const nom of orphelines) await rm(path.join(VIGNETTES, nom));

  process.stdout.write(
    `${attendues.size} vignettes écrites dans ${VIGNETTES}` +
      (orphelines.length > 0 ? `, ${orphelines.length} orphelines supprimées` : "") +
      "\n",
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await genererVignettes();
}
