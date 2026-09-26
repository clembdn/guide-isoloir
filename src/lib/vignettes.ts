/**
 * Vignette d'un portrait : le même visage en 192 px, pour les petites tailles.
 *
 * Les vignettes sont dérivées des portraits par `scripts/generer-vignettes.mjs`
 * et vivent sous `public/medias/vignettes/`, un fichier WebP par portrait, du
 * même nom. Le chemin se déduit donc du portrait ; le fichier, lui, se vérifie :
 * une vignette absente casserait une image sur l'accueil et sur chaque page de
 * thème, et le build s'arrête plutôt que de la servir.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const MOTIF = /^\/medias\/portraits\/([^/]+)\.\w+$/;

export function vignetteDe(portrait: string): string {
  const correspondance = MOTIF.exec(portrait);
  if (!correspondance) {
    throw new Error(`« ${portrait} » n'est pas un portrait de /medias/portraits/.`);
  }
  const chemin = `/medias/vignettes/${correspondance[1]}.webp`;
  /* Depuis la racine du projet, où le build est lancé : voir `Icone.astro`. */
  if (!existsSync(join(process.cwd(), "public", chemin))) {
    throw new Error(`La vignette ${chemin} manque. Lancer \`node scripts/generer-vignettes.mjs\`.`);
  }
  return chemin;
}
