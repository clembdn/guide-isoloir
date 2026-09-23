/*
 * Déclinaisons de la marque, toutes dérivées des deux SVG maîtres de
 * `src/marque/`. Ce script ne dessine rien : il transpose et il photographie.
 *
 *   public/medias/marque/guide-isoloir.svg  le bloc servi aux pages
 *   public/favicon.svg                      le signe dans une boîte de 32, vectoriel
 *   public/favicon-32.png                   32 × 32, fond plein — onglet Chrome/Edge
 *   public/favicon-48.png                   48 × 48, fond plein — Windows haute densité
 *   public/apple-touch-icon.png             180 × 180, fond plein, iOS n'accepte que du PNG
 *   public/medias/marque/partage.png        1200 × 630, aperçu de lien
 *
 *   node scripts/generer-marque.mjs
 *
 * POURQUOI DEUX FAVICONS DIFFÉRENTS. Le SVG détaille un cadre et deux pans de
 * rideau séparés par un filet blanc : à 16-32 px, ce filet se perd dans
 * l'anticrénelage et le dessin devient un bloc violet flou — c'est le « carré
 * moche » observé dans l'onglet. L'icône Apple, elle, pose le signe sur un fond
 * plein à une échelle pensée pour rester grande, et reste lisible en petit.
 * Les PNG de petite taille reprennent ce même traitement plutôt que de
 * redimensionner le SVG détaillé.
 *
 * POURQUOI LES DEUX SVG SERVIS SONT GÉNÉRÉS ET NON ÉCRITS À LA MAIN. Les
 * maîtres emploient `currentColor` : ils n'écrivent aucune valeur, donc aucun
 * violet ne peut diverger du système. Mais un SVG chargé COMME IMAGE — un
 * favicon, un `<img>` — vit hors du document : il n'hérite d'aucune variable
 * CSS et doit porter ses deux teintes lui-même. Ces deux fichiers sont donc les
 * seuls du projet à recopier une couleur, et ils la recopient d'ici, une fois.
 *
 * POURQUOI UN `<img>` PLUTÔT QUE DU SVG EN LIGNE DANS L'EN-TÊTE. Mesuré : le
 * bloc inséré dans le HTML coûtait 3,2 ko gzip PAR PAGE, sur une page qui en
 * pèse 3,7. Un fichier externe est téléchargé une fois pour les dix-sept pages.
 *
 * LA POLICE DE LA CARTE EST LUE SUR LE DISQUE ET INSÉRÉE EN BASE64. Rien n'est
 * téléchargé, ni pendant la génération ni après : la carte est un pixel figé.
 * Le jour où la police du site change, elle est périmée — d'où ce script, pour
 * que la refaire coûte une commande.
 *
 * Toutes les sorties sont versionnées : le build ne les régénère pas, et un
 * déploiement ne dépend pas de la présence d'un navigateur.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const RACINE = fileURLToPath(new URL("..", import.meta.url));

/*
 * Les deux valeurs de `couleur-signature`, recopiées de src/styles/base.css.
 * C'est le seul endroit du projet où elles sont dupliquées, et la duplication
 * est contrainte : voir l'en-tête. Une modification là-bas se répercute ici,
 * puis par une exécution de ce script.
 */
const VIOLET = "#5321d6";
const VIOLET_SOMBRE = "#b49cf5";
/** Valeur employée pour le texte et le dessin posés sur le violet. */
const SUR_VIOLET = "#ffffff";

const TAGLINE = "Comprendre l’élection, se situer, et savoir comment voter.";
const DOMAINE = "guide-isoloir.fr";

/** Retire le commentaire de tête : il documente le dessin, il ne se rend pas. */
async function marque(fichier) {
  const brut = await readFile(join(RACINE, "src/marque", fichier), "utf8");
  return brut.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
}

async function policeBase64() {
  const woff2 = await readFile(join(RACINE, "src/polices/bricolage-grotesque-latin.woff2"));
  return woff2.toString("base64");
}

const [signe, bloc, police] = await Promise.all([
  marque("isoloir.svg"),
  marque("guide-isoloir.svg"),
  policeBase64(),
]);

/*
 * Les deux SVG servis. `fill="currentColor"` du maître devient une classe, et
 * la classe porte les deux teintes : c'est la seule façon qu'a un SVG chargé
 * comme image de suivre le schéma du système.
 */
const FEUILLE_SCHEMAS = `<style>
    .signe {
      fill: ${VIOLET};
    }
    @media (prefers-color-scheme: dark) {
      .signe {
        fill: ${VIOLET_SOMBRE};
      }
    }
  </style>`;

function enTete(titre, lignes) {
  return `<!--\n  ${titre}\n\n${lignes.map((l) => `  ${l}`).join("\n")}\n-->\n`;
}

/** `--` est interdit dans un commentaire XML : un nom de variable CSS y casse le fichier. */
const AVERTISSEMENT = [
  "FICHIER GÉNÉRÉ — ne pas modifier à la main.",
  "Produit par scripts/generer-marque.mjs à partir de src/marque/.",
  "Les deux teintes recopient la variable « couleur-signature » de",
  "src/styles/base.css, dans ses deux schémas.",
];

/** Les `<path>` d'un maître, seuls, réindentés. */
function chemins(maitre, indentation) {
  return (maitre.match(/<path[\s\S]*?\/>/g) ?? [])
    .map((p) => `${indentation}${p.replace(/\s+/g, " ")}`)
    .join("\n");
}

const blocServi =
  enTete("Bloc-marque servi aux pages, par un `img`.", [
    ...AVERTISSEMENT,
    "",
    "Un SVG chargé comme image n'hérite d'aucune variable CSS de la page :",
    "il porte donc ses couleurs, là où le maître emploie `currentColor`.",
  ]) +
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 205.32 40">
  ${FEUILLE_SCHEMAS}
  <g class="signe">
${chemins(bloc, "    ")}
  </g>
</svg>\n`;

/*
 * Favicon. Le signe mesure 35,09 × 40 ; dans une boîte de 32, une hauteur de 30
 * laisse un point de marge en haut et en bas, et 2,84 de chaque côté centrent
 * le dessin. Vérifié à 16 px : les deux fentes du rideau restent lisibles.
 */
const faviconServi =
  enTete("Favicon — le signe de la marque, sans le mot.", AVERTISSEMENT) +
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  ${FEUILLE_SCHEMAS}
  <g class="signe" transform="translate(2.84 1) scale(.75)">
${chemins(signe, "    ")}
  </g>
</svg>\n`;

async function ecrire(destination, contenu) {
  const chemin = join(RACINE, destination);
  await mkdir(dirname(chemin), { recursive: true });
  await writeFile(chemin, contenu);
  console.log(`${destination} — ${(Buffer.byteLength(contenu) / 1024).toFixed(1)} ko`);
}

await ecrire("public/medias/marque/guide-isoloir.svg", blocServi);
await ecrire("public/favicon.svg", faviconServi);

const style = `
  @font-face {
    font-family: "Bricolage Grotesque";
    font-weight: 400 700;
    font-style: normal;
    src: url(data:font/woff2;base64,${police}) format("woff2");
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Bricolage Grotesque", sans-serif; }
`;

/*
 * Icône à fond plein, à n'importe quelle taille carrée. Le signe occupe 58 %
 * du côté — la même proportion que l'icône Apple, pour que toutes les tailles
 * appartiennent visiblement à la même famille.
 *
 * Fond plein et non transparent : iOS compose l'icône sur le fond d'écran de
 * la personne, et une marque transparente y devient illisible une fois sur
 * deux. Un onglet de navigateur n'a pas ce problème, mais le même fond évite
 * qu'un favicon à bordure fine se perde en petit — c'est le défaut du SVG
 * détaillé, qu'on évite ici en n'employant que le signe plein sur un aplat.
 */
function pageIcone(taille) {
  const signeTaille = Math.round(taille * (104 / 180));
  return `<!doctype html><meta charset="utf-8"><style>${style}
  body {
    width: ${taille}px; height: ${taille}px; background: ${VIOLET};
    display: flex; align-items: center; justify-content: center;
    color: ${SUR_VIOLET};
  }
  svg { height: ${signeTaille}px; width: auto; display: block; }
</style>${signe}`;
}

/*
 * Carte de partage. Aucun visage, aucun candidat, aucun chiffre : une carte
 * qui vieillit mal est une carte qu'il faut refaire en pleine campagne. Elle ne
 * porte que ce qui ne bougera pas d'ici mai 2027.
 */
const PAGE_PARTAGE = `<!doctype html><meta charset="utf-8"><style>${style}
  body {
    width: 1200px; height: 630px; background: ${VIOLET}; color: ${SUR_VIOLET};
    padding: 92px 96px; display: flex; flex-direction: column;
    justify-content: space-between;
  }
  svg { width: 560px; height: auto; display: block; }
  .promesse {
    font-size: 46px; line-height: 1.28; font-weight: 400;
    letter-spacing: -0.02em; max-width: 880px;
  }
  .pied {
    display: flex; justify-content: space-between; align-items: baseline;
    font-size: 26px; letter-spacing: -0.01em;
  }
  .pied span:last-child { opacity: 0.72; }
</style>
<div>${bloc}</div>
<p class="promesse">${TAGLINE}</p>
<p class="pied"><span>${DOMAINE}</span><span>Présidentielle des 18 avril et 2 mai 2027</span></p>`;

const navigateur = await chromium.launch();

async function photographier(html, largeur, hauteur, destination) {
  const page = await navigateur.newPage({
    viewport: { width: largeur, height: hauteur },
    deviceScaleFactor: 1,
  });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await page.close();
  await ecrire(destination, png);
}

await photographier(pageIcone(32), 32, 32, "public/favicon-32.png");
await photographier(pageIcone(48), 48, 48, "public/favicon-48.png");
await photographier(pageIcone(180), 180, 180, "public/apple-touch-icon.png");
await photographier(PAGE_PARTAGE, 1200, 630, "public/medias/marque/partage.png");

await navigateur.close();
