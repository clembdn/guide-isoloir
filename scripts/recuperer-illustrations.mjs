/**
 * Récupération des photographies des cartes « Comprendre » de l'accueil.
 *
 * POURQUOI UN SCRIPT, ET POURQUOI À CÔTÉ DE `recuperer-medias.mjs`. Celui-là
 * génère le manifeste des portraits et des logos, indexé par acteur politique.
 * Ces photographies n'appartiennent à aucun acteur : leurs crédits vivent dans
 * `src/data/illustrations.ts`, tenu à la main (voir l'en-tête de ce fichier).
 * Ce script ne l'écrit donc pas. Il fait deux choses qu'une main fait mal :
 *
 *   1. il RELÈVE la licence et l'auteur sur Commons au moment du
 *      téléchargement, et s'arrête si la licence n'est plus celle attendue ;
 *   2. il RECADRE de façon reproductible. Les recadrages ne sont pas
 *      esthétiques seulement : deux d'entre eux sortent du champ un ruban et un
 *      bandeau tricolores, parce que CLAUDE.md interdit toute apparence
 *      officielle. Un recadrage fait à la main dans un logiciel ne laisse
 *      aucune trace de cette décision ; celui-ci est écrit ci-dessous.
 *
 * Deux tailles par image, en 16:10 : 800 × 500 et 480 × 300, en WebP.
 * `sharp` est celui d'Astro, déjà installé : aucune dépendance ajoutée.
 *
 *     node scripts/recuperer-illustrations.mjs
 *     node scripts/recuperer-illustrations.mjs --apercu <dossier>
 *
 * `--apercu` écrit les recadrages dans un dossier jetable au lieu de
 * `public/`, pour les regarder avant de les publier.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RACINE = path.resolve(import.meta.dirname, "..");
const AGENT = "guide-isoloir/0.1 (https://github.com/ ; clemboudon06@gmail.com)";

/** Palier de vignette Commons : assez large pour recadrer, sans l'original entier. */
const LARGEUR_SOURCE = 1920;
const TAILLES = [
  { suffixe: "large", largeur: 800, hauteur: 500 },
  { suffixe: "etroit", largeur: 480, hauteur: 300 },
];

/**
 * Une entrée par article. `recadrage` est exprimé en FRACTIONS de l'image
 * source (gauche, haut, largeur) : la hauteur s'en déduit au format 16:10.
 * Des fractions plutôt que des pixels, pour que le recadrage survive à un
 * changement de palier de vignette.
 */
const IMAGES = [
  {
    id: "pour-qui-voter-en-2027",
    fichier: "Isoloirs J1.jpg",
    licence: "CC BY 4.0",
    recadrage: { gauche: 0, haut: 0.06, largeur: 1 },
  },
  {
    id: "ce-qu-un-president-decide-seul",
    fichier: "Constitution de 1958.jpg",
    licence: "Public domain",
    // Les pages signées seules. Le ruban tricolore et le sceau, sous le
    // livre, restent hors champ : la hauteur s'arrête avant eux.
    recadrage: { gauche: 0.09, haut: 0.05, largeur: 0.56 },
  },
  {
    id: "s-inscrire-sur-les-listes-electorales",
    fichier: "Carte électorale Vote France.JPG",
    licence: "CC BY-SA 4.0",
    // Sous le bandeau « République française » et sa Marianne : on garde
    // « Carte électorale » et les enveloppes.
    recadrage: { gauche: 0.06, haut: 0.5, largeur: 0.52 },
  },
  {
    id: "ou-et-comment-voter",
    fichier: "Villemanoche-FR-89-présidentielles 2022-c07.jpg",
    licence: "CC BY-SA 4.0",
    recadrage: { gauche: 0, haut: 0.08, largeur: 1 },
  },
  {
    id: "qu-est-ce-qu-un-parrainage",
    fichier: "Conseil Constitutionnel Paris.jpg",
    licence: "CC0",
    recadrage: { gauche: 0, haut: 0.4, largeur: 1 },
  },
  {
    id: "donner-procuration",
    fichier: "Election presidentielle 2007 Montauban Urne 197.jpg",
    licence: "CC BY-SA 2.0 fr",
    recadrage: { gauche: 0.08, haut: 0, largeur: 0.92 },
  },
];

function texte(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

async function relever(fichier) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: String(LARGEUR_SOURCE),
    iiextmetadatafilter: "LicenseShortName|Artist",
    titles: `File:${fichier}`,
  }).toString();
  const reponse = await fetch(url, { headers: { "User-Agent": AGENT } });
  if (!reponse.ok) throw new Error(`Commons a répondu ${reponse.status} pour ${fichier}`);
  const donnees = await reponse.json();
  const page = Object.values(donnees.query.pages)[0];
  if (!page?.imageinfo) throw new Error(`« ${fichier} » est introuvable sur Commons.`);
  const info = page.imageinfo[0];
  return {
    source: info.thumburl ?? info.url,
    licence: texte(info.extmetadata?.LicenseShortName?.value),
    auteur: texte(info.extmetadata?.Artist?.value),
  };
}

const indexApercu = process.argv.indexOf("--apercu");
const sortie =
  indexApercu > -1
    ? path.resolve(process.argv[indexApercu + 1] ?? "apercu")
    : path.join(RACINE, "public/medias/scenes");
await mkdir(sortie, { recursive: true });

for (const image of IMAGES) {
  const { source, licence, auteur } = await relever(image.fichier);
  if (licence !== image.licence) {
    throw new Error(
      `« ${image.fichier} » est sous « ${licence} », « ${image.licence} » attendu. ` +
        "Relire la page Commons avant de republier l'image et son crédit.",
    );
  }

  const reponse = await fetch(source, { headers: { "User-Agent": AGENT } });
  if (!reponse.ok) throw new Error(`Téléchargement refusé (${reponse.status}) : ${source}`);
  const tampon = Buffer.from(await reponse.arrayBuffer());
  const { width, height } = await sharp(tampon).metadata();

  const { gauche, haut, largeur } = image.recadrage;
  const zone = {
    left: Math.round(gauche * width),
    top: Math.round(haut * height),
    width: Math.round(largeur * width),
    height: Math.round((largeur * width * 10) / 16),
  };
  if (zone.left + zone.width > width || zone.top + zone.height > height) {
    throw new Error(`Le recadrage de « ${image.id} » sort de l'image (${width} × ${height}).`);
  }

  for (const taille of TAILLES) {
    await sharp(tampon)
      .extract(zone)
      .resize(taille.largeur, taille.hauteur)
      .webp({ quality: 72 })
      .toFile(path.join(sortie, `${image.id}-${taille.suffixe}.webp`));
  }
  console.log(`${image.id} — ${auteur}, ${licence}`);
}
