/**
 * Garde-fou de publication.
 *
 * Refuse un build de production dont les pages publiques sont incomplètes. Il
 * ne juge pas le contenu : il vérifie qu'aucun espace réservé n'a été oublié et
 * que les mentions légalement obligatoires sont présentes.
 *
 * Il s'exécute sur `dist/`, donc sur ce qui serait réellement servi, et non sur
 * les sources : une valeur nulle qui traverse un gabarit se voit dans le HTML,
 * pas dans le fichier `.astro`.
 *
 * Usage :
 *   node scripts/verifier-pages-publiques.mjs            rapporte, code 0
 *   node scripts/verifier-pages-publiques.mjs --strict    rapporte, code 1 si faute
 *
 * `npm run build` construit sans vérifier. `npm run build:prod` vérifie en mode
 * strict, et c'est cette commande que le déploiement utilise.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("../dist", import.meta.url));
const STRICT = process.argv.includes("--strict");

/**
 * Routes qui doivent exister et être complètes avant toute publication.
 * `/test` et `/resultat` sont volontairement absentes : elles sont vides par
 * construction en phase 0 et portent un noindex.
 */
const PAGES_FIXES = [
  "index.html",
  "comprendre.html",
  "a-propos.html",
  "methodologie.html",
  "charte-editoriale.html",
  "corrections.html",
  "financement.html",
  "mentions-legales.html",
];

/**
 * Les articles de /comprendre sont générés depuis la collection : leur nombre
 * n'est pas connu d'avance. Ils sont ramassés par ce motif, et soumis aux mêmes
 * contrôles que les pages fixes.
 */
const MOTIF_ARTICLES = /^comprendre\/.+\.html$/;

/** Fichiers servis qui ne sont pas des pages mais ne doivent pas fuiter de domaine. */
const AUTRES_FICHIERS_SERVIS = ["robots.txt", "llms.txt", "sitemap.xml"];

/**
 * Marqueurs d'espace réservé. Un seul suffit à refuser la publication.
 *
 * `portee` dit où chercher :
 *   - "brut"    : dans le fichier servi tel quel, attributs et commentaires
 *                 compris. Un domaine .invalid dans un `canonical` ou un
 *                 `og:url` ne se voit pas à l'écran mais part quand même chez
 *                 Google et dans les partages.
 *   - "visible" : seulement dans le texte lu par un humain. Réservé aux motifs
 *                 courts qui apparaîtraient par hasard dans une empreinte CSP
 *                 ou un nom de fichier haché.
 */
const MARQUEURS = [
  { motif: /\bTODO\b/i, nom: "TODO", portee: "brut" },
  { motif: /\bFIXME\b/i, nom: "FIXME", portee: "brut" },
  { motif: /\bXXX\b/, nom: "XXX", portee: "brut" },
  { motif: /\bHACK\b/i, nom: "HACK", portee: "brut" },
  { motif: /a completer/i, nom: "« à compléter »", portee: "brut" },
  { motif: /a confirmer/i, nom: "« à confirmer »", portee: "brut" },
  { motif: /a renseigner/i, nom: "« à renseigner »", portee: "brut" },
  { motif: /a definir/i, nom: "« à définir »", portee: "brut" },
  { motif: /lorem ipsum/i, nom: "lorem ipsum", portee: "brut" },
  {
    motif: /\[[^\]]*\b(?:ton|votre|mon)\s+nom\b[^\]]*\]/i,
    nom: "gabarit « [ton nom] »",
    portee: "brut",
  },
  // `.invalid` est réservé par la RFC 2606 : sa présence signifie toujours que
  // le domaine réel n'a pas été renseigné.
  { motif: /\b[\w-]+\.invalid\b/i, nom: "domaine réservé .invalid", portee: "brut" },
  { motif: /\bnull\b/, nom: "« null » rendu dans la page", portee: "visible" },
  { motif: /\bundefined\b/, nom: "« undefined » rendu dans la page", portee: "visible" },
];

/**
 * Mentions dont l'absence est un défaut de mentions légales.
 *
 * Elles sont cherchées parmi les intitulés de la page — termes de liste de
 * définitions et titres — et non dans la prose : « l'adresse de contact » cité
 * au fil d'une phrase ne prouve pas qu'une adresse soit publiée.
 */
const MENTIONS_OBLIGATOIRES = [
  { motif: /^editeur$/i, nom: "identification de l'éditeur" },
  { motif: /^directeur de la publication$/i, nom: "directeur de la publication" },
  { motif: /^hebergeur$/i, nom: "hébergeur" },
  { motif: /^adresse de contact$/i, nom: "adresse de contact" },
];

/** Retire le balisage et les blocs non visibles, puis normalise pour comparaison. */
function texteVisible(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sans accents ni casse : « à compléter » et « A COMPLETER » sont la même faute. */
function normaliser(texte) {
  return texte.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

async function listerFichiers(repertoire) {
  const entrees = await readdir(repertoire, { withFileTypes: true });
  const fichiers = [];
  for (const entree of entrees) {
    const complet = join(repertoire, entree.name);
    if (entree.isDirectory()) {
      fichiers.push(...(await listerFichiers(complet)));
    } else {
      fichiers.push(complet);
    }
  }
  return fichiers;
}

const fautes = [];

function signaler(fichier, message) {
  fautes.push(`${fichier} : ${message}`);
}

// 1. Toutes les pages publiques attendues existent.
let presents;
try {
  presents = new Set(
    (await listerFichiers(RACINE)).map((chemin) => chemin.slice(RACINE.length + 1)),
  );
} catch {
  console.error("dist/ est introuvable. Lancez `npm run build` avant la vérification.");
  process.exit(1);
}

for (const page of PAGES_FIXES) {
  if (!presents.has(page)) {
    signaler(page, "page publique attendue, absente de dist/");
  }
}

/** Pages fixes présentes, plus tous les articles publiés. */
const PAGES_PUBLIQUES = [
  ...PAGES_FIXES.filter((page) => presents.has(page)),
  ...[...presents].filter((fichier) => MOTIF_ARTICLES.test(fichier)).sort(),
];

// 2. Aucun espace réservé dans le texte servi.
const aExaminer = [...PAGES_PUBLIQUES, ...AUTRES_FICHIERS_SERVIS.filter((f) => presents.has(f))];

for (const fichier of aExaminer) {
  const contenu = await readFile(join(RACINE, fichier), "utf8");
  const estHtml = extname(fichier) === ".html";

  const corpus = {
    brut: normaliser(contenu),
    visible: normaliser(estHtml ? texteVisible(contenu) : contenu),
  };

  for (const { motif, nom, portee } of MARQUEURS) {
    const texte = corpus[portee];
    const trouve = motif.exec(texte);
    if (trouve) {
      const extrait = texte
        .slice(Math.max(0, trouve.index - 40), trouve.index + 60)
        .replace(/\s+/g, " ")
        .trim();
      signaler(fichier, `${nom} — « …${extrait}… »`);
    }
  }
}

// 3. Le nom de l'éditeur apparaît sur chaque page publique.
//    Il est lu dans les mentions légales plutôt que dans la configuration :
//    ce qui compte est ce qui est servi au lecteur.
const mentionsHtml = presents.has("mentions-legales.html")
  ? await readFile(join(RACINE, "mentions-legales.html"), "utf8")
  : "";
const editeur = /<dt>\s*Éditeur\s*<\/dt>\s*<dd>\s*([^,<]+)/i.exec(mentionsHtml)?.[1]?.trim();

if (!editeur) {
  signaler("mentions-legales.html", "le nom de l'éditeur est absent");
} else {
  for (const page of PAGES_PUBLIQUES) {
    const texte = texteVisible(await readFile(join(RACINE, page), "utf8"));
    if (!texte.includes(editeur)) {
      signaler(page, `le nom de l'éditeur (« ${editeur} ») n'apparaît pas`);
    }
  }
}

// 4. Les mentions légalement obligatoires sont présentes, comme intitulés.
if (presents.has("mentions-legales.html")) {
  const intitules = [...mentionsHtml.matchAll(/<(?:dt|h2|h3)\b[^>]*>([\s\S]*?)<\/(?:dt|h2|h3)>/gi)]
    .map((balise) => normaliser(texteVisible(balise[1] ?? "")))
    .filter((intitule) => intitule !== "");

  for (const { motif, nom } of MENTIONS_OBLIGATOIRES) {
    if (!intitules.some((intitule) => motif.test(intitule))) {
      signaler("mentions-legales.html", `mention obligatoire absente : ${nom}`);
    }
  }
}

/*
 * 5. Aucune donnée factice ne subsiste dans ce qui est servi.
 *
 * L'écran de quiz tourne aujourd'hui sur trois questions d'exemple, dans
 * `src/factice/`. Elles sont inoffensives tant qu'elles restent un outil de
 * mise au point ; publiées, elles feraient passer un comparateur politique pour
 * un site qui n'a rien à comparer.
 *
 * On cherche les identifiants dans le JavaScript servi, pas seulement dans le
 * HTML : le quiz est un îlot, ses questions vivent dans un bundle.
 */
const MOTIF_FACTICE = /factice-sentinelle|QUESTIONS_FACTICES|AVERTISSEMENT_FACTICE/;

/*
 * 6. Aucun mot collé à une balise en ligne.
 *
 * Astro supprime le nœud de texte quand un saut de ligne sépare un mot d'une
 * balise en ligne, et rend « et lacharte éditoriale ». Prettier replie les
 * lignes tout seul : le défaut réapparaît sans que personne l'ait écrit, et il
 * ne se voit qu'à la lecture de la page rendue.
 *
 * Deux occurrences trouvées dans ce dépôt le jour où ce contrôle a été ajouté,
 * dont une antérieure au quiz. Un site qui se présente comme sérieux ne peut
 * pas publier des mots collés.
 */
const MOTIF_MOT_COLLE = /[a-zàâçéèêëîïôûùüÿœ]{2,}<(?:a|strong|em|code|time)\b/gi;

for (const fichier of [...presents].filter((f) => f.endsWith(".html") || f.endsWith(".js"))) {
  const contenu = await readFile(join(RACINE, fichier), "utf8");
  if (MOTIF_FACTICE.test(contenu)) {
    signaler(fichier, "données factices servies : le quiz tourne encore sur src/factice/");
  }
}

for (const fichier of PAGES_PUBLIQUES) {
  const contenu = await readFile(join(RACINE, fichier), "utf8");
  for (const collision of contenu.match(MOTIF_MOT_COLLE) ?? []) {
    signaler(fichier, `mot collé à une balise : « ${collision} »`);
  }
}

// Rapport.
if (fautes.length === 0) {
  console.log("Pages publiques : complètes, aucune mention manquante.");
  process.exit(0);
}

const entete = STRICT
  ? `Publication refusée — ${fautes.length} point(s) bloquant(s) :`
  : `Publication impossible en l'état — ${fautes.length} point(s) à traiter :`;

console.error(entete);
for (const faute of fautes) {
  console.error(`  - ${faute}`);
}

if (STRICT) {
  console.error(
    "\nCorrigez ces points, ou construisez avec `npm run build` pour un build non publiable.",
  );
  process.exit(1);
}

console.error("\n(mode non strict : le build n'est pas interrompu)");
process.exit(0);
