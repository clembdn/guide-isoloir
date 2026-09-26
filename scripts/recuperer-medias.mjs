/**
 * Récupération des portraits de candidats et des logos de partis.
 *
 * POURQUOI UN SCRIPT ET PAS UN TÉLÉCHARGEMENT À LA MAIN. Chaque image libre
 * impose des conditions — citer l'auteur, nommer la licence, lier vers son
 * texte — et ces conditions ne se respectent que si les métadonnées sont
 * relevées EN MÊME TEMPS que le fichier. Un fichier déposé à la main dans
 * `public/` arrive sans son auteur, et la page de crédits devient fausse le
 * jour où personne ne se souvient d'où il venait.
 *
 * Ce script lit donc `imageinfo` sur Wikimedia Commons, télécharge la
 * vignette à la taille servie, et écrit `src/data/medias.ts` — fichier
 * GÉNÉRÉ, jamais modifié à la main — avec la licence de chaque image.
 *
 * AUCUNE REQUÊTE VERS COMMONS AU RUNTIME. Les images sont auto-hébergées :
 * `img-src 'self'` l'impose, et le test Playwright « aucune requête tierce »
 * échouerait si une seule URL distante subsistait dans le HTML servi.
 *
 * CE QUI EST REFUSÉ. Les fichiers marqués « marque déposée » sur
 * fr.wikipedia.org sont là au titre du fair use américain, qui n'existe pas en
 * droit français et ne se transmet à personne. Le script ne va donc chercher
 * que sur Commons, qui n'héberge que du réutilisable, et il s'arrête si une
 * image n'y est pas. Onze partis n'ont pas de logo libre : ils n'en auront
 * pas, et `src/data/medias.ts` ne portera aucune entrée pour eux.
 *
 *     node scripts/recuperer-medias.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
/* `sharp` est celui d'Astro, déjà installé : aucune dépendance ajoutée. */
import sharp from "sharp";
import { genererVignettes } from "./generer-vignettes.mjs";

const RACINE = path.resolve(import.meta.dirname, "..");
const AGENT = "guide-isoloir/0.1 (https://github.com/ ; clemboudon06@gmail.com)";

/**
 * Largeurs de vignette autorisées par Wikimedia, en pixels.
 *
 * ON NE CHOISIT PAS SA TAILLE. `upload.wikimedia.org` ne rend plus une vignette
 * à la largeur demandée : il ne sert qu'une poignée de paliers pré-rendus et
 * répond 400 sur tout le reste — 160 et 200 sont refusés, 120 et 250 passent.
 * L'API, elle, accepte n'importe quel `iiurlwidth` et renvoie un `thumbwidth`
 * conforme à la demande avec une `thumburl` qui pointe vers le palier
 * au-dessus : suivre l'un ou l'autre sans vérifier téléchargeait des portraits
 * de 250 px là où on en voulait 160.
 *
 * Relevé le 20 septembre 2026. Si un téléchargement se met à répondre 400, la
 * liste des paliers a changé : la corriger ici, pas ailleurs.
 */
const PALIERS = [120, 250, 330, 500, 960, 1280];

/*
 * 960 et 1280 : vérifiés le 27 septembre 2026 (200), 2560 répond 400. Ils ne servent qu'aux portraits RECADRÉS, qu'il faut
 * découper dans une image assez grande pour que le carré final reste net.
 */
const LARGEUR_SOURCE_RECADRAGE = 1280;

/**
 * 330 px depuis le 27 septembre 2026 : la liste des candidats affiche désormais
 * les portraits en grand, jusqu'à 165 px de côté, et 120 px devenaient flous sur
 * un écran à deux fois la densité. 330 est le palier Wikimedia au-dessus.
 */
const LARGEUR_PORTRAIT = 330;
/** 250 px pour un logo : la plupart sont des mots, et un mot mal rendu se lit mal. */
const LARGEUR_LOGO = 250;

/**
 * Table de correspondance, tenue à la main.
 *
 * Le nom du fichier Commons est saisi ici et pas déduit d'une recherche : une
 * recherche automatique attribuerait un jour le logo du Parti socialiste
 * portugais au Parti socialiste français, ou la photo de Xavier Bertrand au
 * parti Nous France — ce que l'API a effectivement renvoyé lors du relevé.
 * Chaque ligne a été ouverte et vérifiée le 20 septembre 2026, et les sept
 * portraits ajoutés le 25 septembre 2026 (licence lue sur Commons ce jour-là).
 */
const PORTRAITS = {
  "nathalie-arthaud": "Nathalie Arthaud (LO) 19-05-2024.jpg",
  "francois-asselineau": "François ASSELINEAU.jpg",
  "gabriel-attal": "Gabriel Attal 2025 (close crop).jpg",
  "delphine-batho": "Delphine Batho (cropped-2).png",
  "olivier-becht": "Olivier Becht 2023 (cropped).jpg",
  "xavier-bertrand": "Xavier Bertrand - 2025 (cropped).jpg",
  "karim-bouamrane": "Karim Bouamrane en 2026 (cropped).jpg",
  "nicolas-dupont-aignan": "Nicolas Dupont-Aignan, homme politique français.jpg",
  "clara-egger": "Clara Egger.jpg",
  "olivier-faure": "Olivier Faure PSE-CARCA--1194 (cropped).jpg",
  "raphael-glucksmann": "1720448398743_20240708_GLUCKSMANN_Raphael_FR_006.jpg",
  "jerome-guedj": "Jérôme Guedj 2010 (cropped).jpg",
  // Le 27 septembre 2026 : l'ancien recadrage de Commons ne faisait que
  // 302 × 453 px et sortait flou en grand. Même cliché, même auteur, même
  // licence, recadré ici depuis l'original de 691 × 864 px.
  "anasse-kazib": {
    fichier: "Anasse Kazib, décembre 2021.jpg",
    recadrage: { gauche: 0.1, haut: 0.1, largeur: 0.66 },
  },
  // `selma-labib` : aucune photo sous licence libre au 27 septembre 2026.
  // L'interface affiche ses initiales. ÉCARTÉ : « Presidentielles-2027-Selma-
  // LABIB.png » sur Commons est une bannière de 395 × 141 px, d'auteur
  // inconnu, dont la licence CC BY 3.0 est déclarée par le déposant sans
  // preuve — le site du NPA-R, cité comme source, ne publie aucune licence.
  // « Selma LABIB.webp » et « Selma Labib.jpg » ont été supprimés de Commons ;
  // la photo Flickr du musée de l'affiche est « tous droits réservés ».
  "francis-lalanne": "Lalanne 2021 (cropped).jpg",
  "marine-le-pen": "Marine Le Pen 2025 (cropped).jpg",
  "david-lisnard": "David Lisnard - 2013.jpg",
  "emmanuel-maurel": "Emmanuel Maurel en 2016.jpg",
  "jean-luc-melenchon": "Mélenchon 2027 - 55261894422 (cropped).jpg",
  // `antoine-mikolajczak` : aucune photo sous licence libre au 27 septembre
  // 2026, ni sur Commons ni sur Flickr. L'interface affiche ses initiales. Ne
  // pas prendre une photo sur le site d'Équinoxe : ses mentions légales
  // interdisent toute reproduction « sans le consentement explicite
  // d'Équinoxe ». Voie ouverte : le demander à contact@parti-equinoxe.fr.
  "edouard-philippe": "Edouard Philippe 3x4 crop.jpg",
  "florian-philippot": "2022-04-16 16-49-26 MAM-Paris 02.jpg",
  "bruno-retailleau": "Bruno Retailleau - Ministre de l'Intérieur français (cropped).jpg",
  "fabien-roussel": "Roussel Fabien 1.jpg",
  // Le 27 septembre 2026 : l'ancien portrait (2007, 300 × 407 px) sortait flou.
  // Photographie du gouvernement finlandais, 2019, CC BY 2.0, recadrée ici
  // sur Ségolène Royal : Antti Rinne, à droite, sort du cadre.
  "segolene-royal": {
    fichier: "Antti Rinne & Ségolène Royal (49141293827).jpg",
    recadrage: { gauche: 0.12, haut: 0.08, largeur: 0.25 },
  },
  "francois-ruffin": "François Ruffin répondant à un journaliste à Longueau (cropped).jpg",
  "marine-tondelier": "20210819_tondelier.m-cr3.jpg",
  "eric-zemmour": "Portrait d'Éric Zemmour, avril 2022.jpg",
};

const LOGOS = {
  "parti-debout-la-france": "Debout la France logo (2022).png",
  "parti-horizons": "Logo Parti Politique Horizons - 2021.svg",
  "parti-la-france-insoumise": "LOGO-LFI-2026.png",
  "parti-les-ecologistes": "Logo Les Écologistes (France).png",
  "parti-les-republicains": "Les Républicains - logo (France, 2023).svg",
  "parti-lutte-ouvriere": "Logo Lutte Ouvrière.svg",
  "parti-nous-france": "Logo parti Nous France.png",
  "parti-nouvelle-energie": "Logo-blanc-bleu.png",
  "parti-parti-communiste-francais": "Logo – Parti communiste français (2018).svg",
  "parti-parti-socialiste": "Le Parti socialiste wordmark.svg",
  "parti-rassemblement-national": "Logo Rassemblement National.svg",
  "parti-reconquete": "Logo du parti Reconquête.svg",
  "parti-renaissance": "Renaissance-logotype-officiel.svg",
  "parti-solution-democratique": "Logo du parti politique français Solution Démocratique.png",
  "parti-union-populaire-republicaine": "Logo Union Populaire Républicaine.svg",
  "parti-equinoxe": "Équinoxe Logo.png",
  // Sans logo libre au 20 septembre 2026, et donc sans logo :
  // `parti-france-libre`, `parti-generation-ecologie`, `parti-les-patriotes`,
  // `parti-place-publique`. Leurs fichiers fr.wikipedia.org portent tous
  // « marque déposée », mention de fair use qui ne se réutilise pas.
};

/**
 * Réserves relevées sur la page Commons du fichier, recopiées telles quelles.
 *
 * Commons héberge du réutilisable, mais tous ses fichiers ne sont pas également
 * sûrs : certains portent une contestation ouverte, d'autres une marque
 * déposée. Le droit d'auteur et le droit des marques sont deux choses
 * distinctes, et un logo peut être libre de droit d'auteur — trop simple pour
 * être une œuvre — tout en restant une marque. C'est d'ailleurs le cas de la
 * plupart des logos ci-dessus, et c'est ce qui rend leur usage légitime ici :
 * ils servent à DÉSIGNER le parti, pas à se prévaloir de lui.
 */
const RESERVES = {
  "parti-debout-la-france":
    "Commons range ce fichier dans « Items with disputed copyright information » : " +
    "la licence CC BY-SA 4.0 déclarée par le déposant y est contestée. À remplacer " +
    "si la contestation aboutit.",
  "parti-les-ecologistes":
    "Fichier auto-publié par un contributeur, sans déclaration de licence structurée " +
    "sur Commons. Le bandeau retenu est « PD-textlogo » : logo composé de texte, " +
    "sous le seuil d'originalité.",
};

async function api(hote, parametres) {
  const url = new URL(`https://${hote}/w/api.php`);
  url.search = new URLSearchParams({ format: "json", ...parametres }).toString();
  const reponse = await fetch(url, { headers: { "User-Agent": AGENT } });
  if (!reponse.ok) throw new Error(`${url} → HTTP ${reponse.status}`);
  return reponse.json();
}

/**
 * URL de vignette à la largeur EXACTEMENT demandée.
 *
 * `iiurlwidth=160` renvoie un `thumbwidth` de 160 et une `thumburl` en
 * « 250px- » : Commons annonce la taille demandée mais sert le palier
 * pré-rendu au-dessus. Suivre `thumburl` telle quelle téléchargeait donc des
 * portraits de 250 px là où 160 suffisent — à vingt portraits, l'écart n'est
 * plus un détail sur un budget Lighthouse de 95.
 *
 * La requête `?utm_source=…` que Commons accroche à ses URL est retirée au
 * passage : elle ne sert qu'à sa propre mesure d'audience.
 */
function vignetteExacte(url, largeur) {
  if (!PALIERS.includes(largeur)) {
    throw new Error(
      `Largeur ${largeur} px hors paliers Wikimedia (${PALIERS.join(", ")}) : ` +
        `le téléchargement répondrait 400.`,
    );
  }
  const propre = new URL(url);
  propre.search = "";
  /*
   * `thumb.wikimedia.org` ne sert que les paliers déjà rendus et répond 400 sur
   * toute autre largeur ; `upload.wikimedia.org` rend la vignette à la demande.
   */
  propre.hostname = "upload.wikimedia.org";
  propre.pathname = propre.pathname.replace(/\/\d+px-/, `/${largeur}px-`);
  return propre.toString();
}

/** Métadonnées d'un fichier Commons, ou `null` s'il n'y est pas. */
async function fiche(fichier, largeur) {
  const donnees = await api("commons.wikimedia.org", {
    action: "query",
    titles: `File:${fichier}`,
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: String(largeur),
  });
  const page = Object.values(donnees.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined || !page.imageinfo) return null;

  const info = page.imageinfo[0];
  const meta = info.extmetadata ?? {};
  const texte = (cle) =>
    meta[cle]
      ? String(meta[cle].value)
          .replace(/<[^>]*>/g, " ")
          .replace(/&#\d+;/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      : "";

  return {
    urlOriginal: info.url,
    largeurOriginal: info.width,
    pageDescription: info.descriptionurl,
    urlVignette: vignetteExacte(info.thumburl ?? info.url, largeur),
    mime: info.thumbmime ?? info.mime,
    licence: texte("LicenseShortName"),
    licenceUrl: texte("LicenseUrl"),
    auteur: texte("Artist"),
    credit: texte("Credit"),
  };
}

/**
 * Extension servie, déduite de la VIGNETTE et jamais du fichier source.
 *
 * Un logo SVG revient en PNG : `iiurlwidth` demande à Commons de le rastériser,
 * et c'est délibéré. Le SVG d'un tiers est un document XML qu'un navigateur
 * parcourt, avec ses `<style>`, ses polices référencées et ses `<image>` ; le
 * PNG est une image et rien d'autre. Sur deux routes où aucune requête ne doit
 * sortir, la question ne se pose même pas.
 */
function extension(urlVignette) {
  const chemin = new URL(urlVignette).pathname.toLowerCase();
  if (chemin.endsWith(".jpg") || chemin.endsWith(".jpeg")) return "jpg";
  if (chemin.endsWith(".png")) return "png";
  throw new Error(`Vignette d'un format inattendu : ${urlVignette}`);
}

async function telecharger(url, destination) {
  const reponse = await fetch(url, { headers: { "User-Agent": AGENT } });
  if (!reponse.ok) throw new Error(`${url} → HTTP ${reponse.status}`);
  await writeFile(destination, Buffer.from(await reponse.arrayBuffer()));
}

/**
 * RECADRAGE REPRODUCTIBLE, comme celui des illustrations : exprimé en fractions
 * de l'image dans la table, jamais fait à la main dans un logiciel. Le carré
 * est découpé dans la vignette de 1280 px, ou dans l'original s'il est plus
 * petit (une vignette plus large que l'original n'existe pas), puis ramené à
 * la largeur servie. Le recadrage est une modification au sens des licences
 * CC : il est donc écrit dans le manifeste, et publié sur `/credits-images`.
 */
async function recadrer(actorId, donnees, recadrage, largeur, sortie) {
  const source =
    donnees.largeurOriginal <= LARGEUR_SOURCE_RECADRAGE
      ? donnees.urlOriginal
      : vignetteExacte(donnees.urlVignette, LARGEUR_SOURCE_RECADRAGE);
  const reponse = await fetch(source, { headers: { "User-Agent": AGENT } });
  if (!reponse.ok) throw new Error(`${source} → HTTP ${reponse.status}`);
  const tampon = Buffer.from(await reponse.arrayBuffer());
  const { width, height } = await sharp(tampon).metadata();
  const cote = Math.round(recadrage.largeur * width);
  const gauche = Math.round(recadrage.gauche * width);
  const haut = Math.round(recadrage.haut * height);
  if (gauche + cote > width || haut + cote > height) {
    throw new Error(`Le recadrage de « ${actorId} » sort de l'image (${width} × ${height}).`);
  }
  const nom = `${actorId}.jpg`;
  await sharp(tampon)
    .extract({ left: gauche, top: haut, width: cote, height: cote })
    .resize(largeur, largeur)
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(sortie, nom));
  return nom;
}

async function lot(table, genre, largeur, dossier) {
  const sortie = path.join(RACINE, "public", "medias", dossier);
  await mkdir(sortie, { recursive: true });

  const entrees = [];
  for (const [actorId, entree] of Object.entries(table)) {
    const { fichier, recadrage } = typeof entree === "string" ? { fichier: entree } : entree;
    const donnees = await fiche(fichier, largeur);
    if (donnees === null) {
      throw new Error(
        `${actorId} : « ${fichier} » est introuvable sur Commons. ` +
          `Un fichier présent seulement sur fr.wikipedia.org y est au titre du fair use : ` +
          `il ne se réutilise pas, et il ne doit pas entrer dans cette table.`,
      );
    }

    let nom;
    let retouches;
    if (recadrage) {
      nom = await recadrer(actorId, donnees, recadrage, largeur, sortie);
      retouches = "recadrée au carré et redimensionnée";
    } else {
      const ext = extension(donnees.urlVignette);
      nom = `${actorId}.${ext}`;
      await telecharger(donnees.urlVignette, path.join(sortie, nom));
    }

    entrees.push({
      actorId,
      genre,
      chemin: `/medias/${dossier}/${nom}`,
      fichierCommons: fichier,
      pageCommons: donnees.pageDescription,
      auteur: donnees.auteur || "Auteur non précisé sur Commons",
      licence: donnees.licence || "Licence non précisée sur Commons",
      licenceUrl: donnees.licenceUrl,
      reserve: RESERVES[actorId],
      retouches,
    });
    process.stdout.write(`  ${actorId} → ${nom} (${donnees.licence})\n`);
  }
  return entrees;
}

const echappe = (valeur) => JSON.stringify(valeur);

function rendre(entrees, releveLe) {
  const lignes = entrees.map((entree) => {
    const champs = [
      `    actorId: ${echappe(entree.actorId)},`,
      `    genre: ${echappe(entree.genre)},`,
      `    chemin: ${echappe(entree.chemin)},`,
      `    fichierCommons: ${echappe(entree.fichierCommons)},`,
      `    pageCommons: ${echappe(entree.pageCommons)},`,
      `    auteur: ${echappe(entree.auteur)},`,
      `    licence: ${echappe(entree.licence)},`,
      `    licenceUrl: ${echappe(entree.licenceUrl)},`,
    ];
    if (entree.reserve) champs.push(`    reserve: ${echappe(entree.reserve)},`);
    if (entree.retouches) champs.push(`    retouches: ${echappe(entree.retouches)},`);
    return `  {\n${champs.join("\n")}\n  },`;
  });

  return `/**
 * FICHIER GÉNÉRÉ PAR \`node scripts/recuperer-medias.mjs\`. NE PAS MODIFIER À LA MAIN.
 *
 * Portraits de candidats et logos de partis, tous téléchargés depuis Wikimedia
 * Commons et auto-hébergés sous \`public/medias/\`. Aucune requête ne part vers
 * Commons au runtime : \`img-src 'self'\` l'interdit, et le test « aucune requête
 * tierce » le vérifie.
 *
 * CHAQUE ENTRÉE PORTE SA LICENCE, et \`/credits-images\` les publie toutes. Ce
 * n'est pas une politesse : CC BY et CC BY-SA imposent de citer l'auteur et de
 * nommer la licence, et une image libre dont on tait l'auteur est une image
 * utilisée sans droit.
 *
 * Absents de ce fichier, faute de média sous licence libre au ${releveLe} :
 * Antoine Mikolajczak, et les logos de France Libre, Génération écologie,
 * Les Patriotes et Place publique. L'interface affiche alors des initiales.
 * Ne pas compléter depuis un site de parti : un logo pris là n'est pas libre.
 */

export type Media = {
  actorId: string;
  genre: "portrait" | "logo";
  /** Chemin servi, sous \`public/\`. */
  chemin: string;
  fichierCommons: string;
  pageCommons: string;
  auteur: string;
  licence: string;
  /** Vide quand Commons ne publie pas d'URL pour cette licence (domaine public). */
  licenceUrl: string;
  /** Réserve relevée sur la page Commons du fichier, s'il y en a une. */
  reserve?: string;
  /** Modifications apportées à l'image. Les taire rendrait le crédit incomplet. */
  retouches?: string;
};

/** Date du relevé des licences. Un relevé vieillit : le republier le dit. */
export const MEDIAS_RELEVES_LE = ${echappe(releveLe)};

export const MEDIAS: readonly Media[] = [
${lignes.join("\n")}
];

const PAR_ACTEUR = new Map(MEDIAS.map((media) => [\`\${media.genre}:\${media.actorId}\`, media]));

/** Média d'un acteur, ou \`undefined\` : l'appelant doit prévoir le cas. */
export function media(genre: Media["genre"], actorId: string): Media | undefined {
  return PAR_ACTEUR.get(\`\${genre}:\${actorId}\`);
}
`;
}

const releveLe = new Date().toISOString().slice(0, 10);
process.stdout.write("Portraits :\n");
const portraits = await lot(PORTRAITS, "portrait", LARGEUR_PORTRAIT, "portraits");
process.stdout.write("Logos :\n");
const logos = await lot(LOGOS, "logo", LARGEUR_LOGO, "logos");

const destination = path.join(RACINE, "src", "data", "medias.ts");
await writeFile(destination, rendre([...portraits, ...logos], releveLe), "utf8");
process.stdout.write(
  `\n${portraits.length + logos.length} médias, manifeste écrit dans ${destination}\n`,
);

/* Les vignettes suivent les portraits : un portrait remplacé ne garde pas l'ancienne. */
await genererVignettes();
