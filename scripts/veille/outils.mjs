// @ts-check
/**
 * Fonctions pures de la veille quotidienne.
 *
 * Aucune entrée-sortie ici : ni réseau, ni disque, ni horloge implicite. Tout ce
 * qui décide — ce qu'est un changement, ce qu'autorise un robots.txt, si l'on
 * est en période de gel, si une citation figure dans un document — se teste
 * sans réseau dans `tests/unit/veille.test.ts`.
 *
 * Le module est en JavaScript, pas en TypeScript, parce que Node l'exécute tel
 * quel depuis `scripts/` ; `// @ts-check` et les annotations JSDoc le font
 * vérifier par `tsc` à travers l'import du test.
 */
import { createHash } from "node:crypto";

/* ─── Texte ──────────────────────────────────────────────────────────────── */

/** Entités nommées qu'on rencontre réellement dans les pages relevées. */
const ENTITES = /** @type {Record<string, string>} */ ({
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  laquo: "«",
  raquo: "»",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  agrave: "à",
  acirc: "â",
  ccedil: "ç",
  ocirc: "ô",
  ucirc: "û",
  ugrave: "ù",
  icirc: "î",
  iuml: "ï",
  euml: "ë",
  oelig: "œ",
  Eacute: "É",
  Agrave: "À",
  Ccedil: "Ç",
  euro: "€",
  shy: "\u00ad",
});

/** @param {string} texte */
export function decoderEntites(texte) {
  return texte.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entite, corps) => {
    if (corps[0] === "#") {
      const code =
        corps[1] === "x" || corps[1] === "X"
          ? parseInt(corps.slice(2), 16)
          : Number(corps.slice(1));
      return Number.isFinite(code) ? String.fromCodePoint(code) : entite;
    }
    return ENTITES[corps] ?? entite;
  });
}

/*
 * Éléments retirés AVEC leur contenu. Les menus, pieds de page et encarts
 * changent sans que le programme change : les garder ferait signaler une page
 * modifiée chaque fois qu'un parti ajoute un article à sa barre latérale.
 */
const RETIRES = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "nav",
  "header",
  "footer",
  "aside",
  "form",
  "iframe",
];
const BLOCS =
  /<\/?(?:p|div|li|ul|ol|h[1-6]|br|tr|td|th|section|article|main|blockquote|dd|dt|figcaption|table)\b[^>]*>/gi;

/**
 * Texte lisible d'une page HTML : contenu principal, une ligne par bloc.
 *
 * `<main>` ou `<article>` s'ils existent, le corps sinon.
 *
 * @param {string} html
 * @param {readonly string[]} [retirer] expressions régulières propres à une cible
 */
export function htmlVersTexte(html, retirer = []) {
  let source = html.replace(/<!--[\s\S]*?-->/g, " ");
  for (const balise of RETIRES) {
    source = source.replace(new RegExp(`<${balise}\\b[\\s\\S]*?</${balise}>`, "gi"), " ");
  }
  const principal =
    source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ??
    [...source.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)].map((m) => m[1]).join("\n") ??
    "";
  const corps =
    principal.trim() !== ""
      ? principal
      : (source.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? source);

  let texte = decoderEntites(corps.replace(BLOCS, "\n").replace(/<[^>]+>/g, " ")).normalize("NFC");
  for (const motif of retirer) texte = texte.replace(new RegExp(motif, "g"), " ");
  return texte
    .split("\n")
    .map((ligne) => ligne.replace(/\s+/g, " ").trim())
    .filter((ligne) => ligne !== "")
    .join("\n");
}

/**
 * Phrases d'un texte, pour comparer deux versions sans dépendre de la mise en
 * page. Les fragments de moins de vingt caractères — boutons, dates isolées,
 * compteurs — sont écartés : ils changent sans rien dire.
 *
 * @param {string} texte
 */
export function decouperPhrases(texte) {
  return texte
    .split(/\n|(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ«"“])/u)
    .map((phrase) => phrase.trim())
    .filter((phrase) => phrase.length >= 20);
}

/** @param {string | Uint8Array} contenu */
export function empreinte(contenu) {
  return createHash("sha256").update(contenu).digest("hex");
}

/** Nom de fichier de cache d'une URL : stable, sans caractère interdit. */
/** @param {string} url */
export function cleUrl(url) {
  return createHash("sha1").update(url).digest("hex");
}

/**
 * Phrases ajoutées et retirées entre deux versions, dans l'ordre où elles
 * apparaissent. Comparaison d'ensembles : un paragraphe déplacé n'est pas un
 * changement.
 *
 * @param {string} avant
 * @param {string} apres
 */
export function differencePhrases(avant, apres) {
  const anciennes = new Set(decouperPhrases(avant));
  const nouvelles = new Set(decouperPhrases(apres));
  return {
    ajoutees: [...nouvelles].filter((phrase) => !anciennes.has(phrase)),
    retirees: [...anciennes].filter((phrase) => !nouvelles.has(phrase)),
  };
}

/**
 * « mineur » quand seuls des chiffres ou des dates ont bougé — un compteur, un
 * « publié il y a 3 jours ». Tout autre changement est substantiel, même court :
 * « Retraite à 60 ans pour tous » tient en vingt-sept caractères. Le bruit se
 * combat en amont, par le contenu principal et le seuil de vingt caractères de
 * `decouperPhrases`, pas en ignorant les phrases brèves.
 *
 * @param {{ ajoutees: string[], retirees: string[] }} difference
 * @returns {"aucun" | "mineur" | "substantiel"}
 */
export function classerChangement({ ajoutees, retirees }) {
  if (ajoutees.length === 0 && retirees.length === 0) return "aucun";
  const sansChiffres = (/** @type {string[]} */ phrases) =>
    new Set(phrases.map((p) => p.replace(/\d+/g, "#")));
  const a = sansChiffres(ajoutees);
  const r = sansChiffres(retirees);
  return a.size === r.size && [...a].every((p) => r.has(p)) ? "mineur" : "substantiel";
}

/* ─── Sitemaps, flux, liens ──────────────────────────────────────────────── */

/**
 * @typedef {{ url: string, date: string | null, titre: string | null }} EntreeListe
 * @typedef {{ type: "urlset" | "index" | "flux" | "inconnu", entrees: EntreeListe[] }} Liste
 */

/** @param {string} bloc @param {string} balise */
function valeur(bloc, balise) {
  const brut = bloc.match(new RegExp(`<${balise}\\b[^>]*>([\\s\\S]*?)</${balise}>`, "i"))?.[1];
  if (brut === undefined) return null;
  return decoderEntites(brut.replace(/^<!\[CDATA\[|\]\]>$/g, "").trim());
}

/**
 * Sitemap, index de sitemaps, flux RSS ou Atom.
 *
 * @param {string} xml
 * @returns {Liste}
 */
export function lireListe(xml) {
  if (/<sitemapindex\b/i.test(xml)) {
    return {
      type: "index",
      entrees: [...xml.matchAll(/<sitemap\b[\s\S]*?<\/sitemap>/gi)].map(([bloc]) => ({
        url: valeur(bloc, "loc") ?? "",
        date: valeur(bloc, "lastmod"),
        titre: null,
      })),
    };
  }
  if (/<urlset\b/i.test(xml)) {
    return {
      type: "urlset",
      entrees: [...xml.matchAll(/<url\b[\s\S]*?<\/url>/gi)].map(([bloc]) => ({
        url: valeur(bloc, "loc") ?? "",
        date: valeur(bloc, "lastmod"),
        titre: null,
      })),
    };
  }
  if (/<rss\b|<channel\b/i.test(xml)) {
    return {
      type: "flux",
      entrees: [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(([bloc]) => ({
        url: valeur(bloc, "link") ?? valeur(bloc, "guid") ?? "",
        date: datePublication(valeur(bloc, "pubDate") ?? valeur(bloc, "dc:date")),
        titre: valeur(bloc, "title"),
      })),
    };
  }
  if (/<feed\b/i.test(xml)) {
    return {
      type: "flux",
      entrees: [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map(([bloc]) => ({
        url: bloc.match(/<link\b[^>]*href="([^"]+)"/i)?.[1] ?? "",
        date: datePublication(valeur(bloc, "updated") ?? valeur(bloc, "published")),
        titre: valeur(bloc, "title"),
      })),
    };
  }
  return { type: "inconnu", entrees: [] };
}

/**
 * Date ISO d'une date de flux (RFC 822 ou ISO 8601), ou `null`.
 *
 * @param {string | null} brut
 */
export function datePublication(brut) {
  if (brut === null) return null;
  const date = new Date(brut);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Liens d'une page, absolus, sans fragment ni doublon, dans l'ordre d'apparition.
 *
 * @param {string} html
 * @param {string} base
 */
export function extraireLiens(html, base) {
  const liens = new Set();
  for (const [, href] of html.matchAll(/href\s*=\s*"([^"]+)"/gi)) {
    try {
      const url = new URL(decoderEntites(href ?? ""), base);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      url.hash = "";
      liens.add(url.href);
    } catch {
      /* href mal formé : ignoré, comme le ferait un navigateur. */
    }
  }
  return [...liens];
}

/* ─── robots.txt ─────────────────────────────────────────────────────────── */

/**
 * @typedef {{ autorise: boolean, motif: string }} RegleRobots
 */

/**
 * Règles qui s'appliquent à notre agent : celles du groupe qui le nomme, à
 * défaut celles du groupe `*`. Un groupe nommé remplace `*`, il ne s'y ajoute
 * pas (RFC 9309, § 2.2.1).
 *
 * @param {string} texte
 * @param {string} agent jeton de l'agent, sans version : « GuideIsoloirVeille »
 * @returns {RegleRobots[]}
 */
export function lireRobots(texte, agent) {
  /** @typedef {{ agents: string[], regles: RegleRobots[] }} GroupeRobots */
  /** @type {GroupeRobots[]} */
  const groupes = [];
  /** @type {GroupeRobots | null} */
  let courant = null;
  let dansAgents = false;
  for (const brute of texte.split(/\r?\n/)) {
    const ligne = brute.replace(/#.*$/, "").trim();
    const separateur = ligne.indexOf(":");
    if (separateur < 0) continue;
    const cle = ligne.slice(0, separateur).trim().toLowerCase();
    const val = ligne.slice(separateur + 1).trim();
    if (cle === "user-agent") {
      if (!dansAgents || courant === null) {
        courant = { agents: [], regles: [] };
        groupes.push(courant);
      }
      courant.agents.push(val.toLowerCase());
      dansAgents = true;
    } else if ((cle === "allow" || cle === "disallow") && courant !== null) {
      dansAgents = false;
      if (val !== "") courant.regles.push({ autorise: cle === "allow", motif: val });
    } else {
      dansAgents = false;
    }
  }
  const jeton = agent.toLowerCase();
  const nommes = groupes.filter((g) => g.agents.some((a) => a !== "*" && jeton.includes(a)));
  const choisis = nommes.length > 0 ? nommes : groupes.filter((g) => g.agents.includes("*"));
  return choisis.flatMap((g) => g.regles);
}

/**
 * Le chemin est-il autorisé ? La règle la plus longue gagne ; à longueur égale,
 * `Allow` l'emporte. `*` et `$` sont pris en charge.
 *
 * @param {readonly RegleRobots[]} regles
 * @param {string} chemin chemin et requête, commençant par « / »
 */
export function autorise(regles, chemin) {
  let meilleure = null;
  for (const regle of regles) {
    const motif = new RegExp(
      "^" +
        regle.motif
          .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
          .replace(/\*/g, ".*")
          .replace(/\\\$$|\$$/, "$"),
    );
    if (!motif.test(chemin)) continue;
    if (
      meilleure === null ||
      regle.motif.length > meilleure.motif.length ||
      (regle.motif.length === meilleure.motif.length && regle.autorise)
    ) {
      meilleure = regle;
    }
  }
  return meilleure === null || meilleure.autorise;
}

/* ─── Dates et gel électoral ─────────────────────────────────────────────── */

/**
 * Jour calendaire à Paris, AAAA-MM-JJ.
 *
 * L'élection se tient à l'heure de Paris, et la machine qui fait tourner la
 * veille est à Melbourne : un `consulteLe` daté du lendemain de la déclaration
 * qu'il atteste serait vrai à Melbourne et faux sur le site.
 *
 * @param {Date} date
 */
export function jourParis(date) {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/*
 * GEL ÉLECTORAL, tel que CLAUDE.md le fixe : à partir du vendredi soir qui
 * précède le premier vote ultramarin, jusqu'à la fermeture des derniers bureaux
 * en métropole. Aucune modification de candidat, de question, de score ou de
 * comparaison pendant la réserve.
 *
 * La veille s'arrête de CODER quarante-huit heures avant chaque gel : un
 * brouillon écrit la veille du gel ne pourrait pas être relu à temps, et un
 * brouillon qu'on ne relit pas ne sert à rien. Elle continue de RELEVER, ce qui
 * ne touche pas au site. Après le second tour, elle s'arrête tout à fait.
 */
const GELS = [
  { debut: Date.parse("2027-04-16T18:00:00+02:00"), fin: Date.parse("2027-04-18T20:00:00+02:00") },
  { debut: Date.parse("2027-04-30T18:00:00+02:00"), fin: Date.parse("2027-05-02T20:00:00+02:00") },
];
const MARGE_AVANT_GEL = 48 * 3600 * 1000;
const FIN_DE_VEILLE = Date.parse("2027-05-02T20:00:00+02:00");

/**
 * @param {Date} date
 * @returns {{ etat: "normal" | "avant-gel" | "gel" | "terminee", codage: boolean, releve: boolean }}
 */
export function etatCalendrier(date) {
  const t = date.getTime();
  if (t >= FIN_DE_VEILLE) return { etat: "terminee", codage: false, releve: false };
  for (const gel of GELS) {
    if (t >= gel.debut && t < gel.fin) return { etat: "gel", codage: false, releve: true };
    if (t >= gel.debut - MARGE_AVANT_GEL && t < gel.debut) {
      return { etat: "avant-gel", codage: false, releve: true };
    }
  }
  return { etat: "normal", codage: true, releve: true };
}

/* ─── Citations ──────────────────────────────────────────────────────────── */

/**
 * Forme comparable d'un texte : ligatures défaites (NFKC), apostrophes et
 * guillemets unifiés, coupures de mot en fin de ligne recollées, espaces
 * insécables ramenées à des espaces, casse ignorée.
 *
 * Une extraction PDF écrit « œ » en deux lettres, « ﬁ » en une, coupe « pro-
 * gramme » en fin de ligne : sans cette normalisation, une citation exacte
 * passerait pour inventée.
 *
 * @param {string} texte
 */
export function normaliserCitation(texte) {
  return texte
    .normalize("NFKC")
    .replace(/\u00ad/g, "")
    .replace(/(\p{L})-\s*\n\s*(\p{Ll})/gu, "$1$2")
    .replace(/[’‘ʼ`´]/g, "'")
    .replace(/[«»“”„"]/g, " ")
    .replace(/[\u00a0\u202f\u2009]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * La citation figure-t-elle dans le texte ? Les coupes signalées par « […] »
 * séparent des segments qui doivent tous apparaître, dans l'ordre.
 *
 * @param {string} citation
 * @param {string} texte
 * @returns {{ trouvee: boolean, manquant: string | null }}
 */
export function trouverCitation(citation, texte) {
  const cible = normaliserCitation(texte);
  const segments = citation
    .split(/\[\s*(?:…|\.\.\.)\s*\]|\(\s*(?:…|\.\.\.)\s*\)/)
    .map((segment) => normaliserCitation(segment).replace(/^[\s.,;:]+|[\s.,;:]+$/g, ""))
    .filter((segment) => segment !== "");
  if (segments.length === 0) return { trouvee: false, manquant: citation };
  let depuis = 0;
  for (const segment of segments) {
    const position = cible.indexOf(segment, depuis);
    if (position < 0) return { trouvee: false, manquant: segment };
    depuis = position + segment.length;
  }
  return { trouvee: true, manquant: null };
}

/* ─── Édition des fichiers de données ────────────────────────────────────── */

/*
 * Les fichiers de `src/data/` sont formatés par Prettier : chaque objet d'un
 * tableau s'ouvre sur `  {` seul, son identifiant est sur `    id: "…",`, et il
 * se ferme sur `  },`. C'est cette mise en page, stable, qui permet de modifier
 * un objet par son identifiant sans analyser le TypeScript.
 */

/**
 * @param {string} source
 * @param {string} id
 * @returns {{ debut: number, fin: number }} indices de lignes, `fin` incluse
 */
function bornesObjet(source, id) {
  const lignes = source.split("\n");
  const ligneId = lignes.findIndex((l) => l === `    id: ${JSON.stringify(id)},`);
  if (ligneId < 0) throw new Error(`Aucun objet d'identifiant « ${id} ».`);
  let debut = ligneId;
  while (debut >= 0 && lignes[debut] !== "  {") debut -= 1;
  let fin = ligneId;
  while (fin < lignes.length && lignes[fin] !== "  },") fin += 1;
  if (debut < 0 || fin >= lignes.length) {
    throw new Error(`L'objet « ${id} » n'a pas la mise en page Prettier attendue.`);
  }
  return { debut, fin };
}

/**
 * Change le `reviewStatus` d'un objet, et rien d'autre.
 *
 * @param {string} source
 * @param {string} id
 * @param {string} de statut attendu ; tout autre statut lève
 * @param {string} vers
 */
export function basculerStatut(source, id, de, vers) {
  const lignes = source.split("\n");
  const { debut, fin } = bornesObjet(source, id);
  const attendue = `    reviewStatus: ${JSON.stringify(de)},`;
  const index = lignes.slice(debut, fin + 1).findIndex((l) => l.startsWith("    reviewStatus: "));
  if (index < 0) throw new Error(`L'objet « ${id} » n'a pas de reviewStatus.`);
  if (lignes[debut + index] !== attendue) {
    throw new Error(`« ${id} » n'est pas en « ${de} » : ${lignes[debut + index]?.trim()}`);
  }
  lignes[debut + index] = `    reviewStatus: ${JSON.stringify(vers)},`;
  return lignes.join("\n");
}

/**
 * Retire un objet du tableau, accolades comprises.
 *
 * @param {string} source
 * @param {string} id
 */
export function retirerObjet(source, id) {
  const lignes = source.split("\n");
  const { debut, fin } = bornesObjet(source, id);
  lignes.splice(debut, fin - debut + 1);
  return lignes.join("\n");
}

/* ─── Cibles ─────────────────────────────────────────────────────────────── */

/**
 * @typedef {{
 *   id: string,
 *   acteurs: string[],
 *   type: "page" | "sitemap" | "flux" | "liste-documents",
 *   url: string,
 *   motifUrl?: string,
 *   motifLiens?: string,
 *   motifTitre?: string,
 *   retirer?: string[],
 *   rendu?: "http" | "chromium",
 *   note: string,
 * }} Cible
 */

const TYPES = ["page", "sitemap", "flux", "liste-documents"];

/**
 * Valide la liste des cibles, ou lève. Une cible mal décrite serait relevée
 * tous les jours pour rien, ou pire, jamais.
 *
 * @param {unknown} brut
 * @param {ReadonlySet<string>} acteursConnus
 * @returns {Cible[]}
 */
export function validerCibles(brut, acteursConnus) {
  if (
    typeof brut !== "object" ||
    brut === null ||
    !Array.isArray(/** @type {any} */ (brut).cibles)
  ) {
    throw new Error("cibles.json : un objet { cibles: [...] } est attendu.");
  }
  const cibles = /** @type {any[]} */ (/** @type {any} */ (brut).cibles);
  const vus = new Set();
  for (const cible of cibles) {
    const nom = cible?.id ?? "(sans id)";
    if (typeof cible.id !== "string" || !/^[a-z0-9-]{3,}$/.test(cible.id)) {
      throw new Error(`Cible ${nom} : identifiant invalide.`);
    }
    if (vus.has(cible.id)) throw new Error(`Cible en double : ${cible.id}`);
    vus.add(cible.id);
    if (!TYPES.includes(cible.type))
      throw new Error(`Cible ${nom} : type inconnu « ${cible.type} ».`);
    try {
      const url = new URL(cible.url);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    } catch {
      throw new Error(`Cible ${nom} : URL invalide.`);
    }
    if (!Array.isArray(cible.acteurs))
      throw new Error(`Cible ${nom} : « acteurs » doit être une liste.`);
    for (const acteur of cible.acteurs) {
      if (!acteursConnus.has(acteur))
        throw new Error(`Cible ${nom} : acteur inconnu « ${acteur} ».`);
    }
    if (typeof cible.note !== "string" || cible.note.length < 10) {
      throw new Error(
        `Cible ${nom} : une note d'au moins dix caractères dit pourquoi on la surveille.`,
      );
    }
    for (const cle of ["motifUrl", "motifLiens", "motifTitre"]) {
      if (cible[cle] !== undefined) new RegExp(cible[cle]);
    }
    if (cible.rendu !== undefined && cible.rendu !== "http" && cible.rendu !== "chromium") {
      throw new Error(`Cible ${nom} : rendu « ${cible.rendu} » inconnu.`);
    }
  }
  return cibles;
}

/* ─── Mots-clés ──────────────────────────────────────────────────────────── */

/**
 * Forme de comparaison des mots-clés : minuscules, sans accents, apostrophes
 * unifiées. « Éolien » et « eoliennes » doivent se trouver l'un l'autre.
 *
 * @param {string} texte
 */
export function sansAccents(texte) {
  return texte.normalize("NFD").replace(/\p{M}/gu, "").replace(/[’‘ʼ]/g, "'").toLowerCase();
}

/** @param {string} terme */
function motifTerme(terme) {
  const echappe = sansAccents(terme).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Un terme court est un mot entier : sinon « ric » trouverait « riche ».
  return terme.length <= 3
    ? `(?<![\\p{L}\\d])${echappe}(?![\\p{L}\\d])`
    : `(?<![\\p{L}\\d])${echappe}`;
}

/**
 * @typedef {Map<string, RegExp[]>} ReglesMotsCles
 */

/**
 * Compile `data/veille/mots-cles.json`, ou lève. Chaque affirmation du test doit
 * avoir son jeu : une affirmation oubliée serait une affirmation jamais signalée.
 *
 * @param {unknown} brut
 * @param {readonly string[]} questionIds
 * @returns {ReglesMotsCles}
 */
export function compilerMotsCles(brut, questionIds) {
  const affirmations = /** @type {any} */ (brut)?.affirmations;
  if (typeof affirmations !== "object" || affirmations === null) {
    throw new Error("mots-cles.json : un objet { affirmations: { … } } est attendu.");
  }
  /** @type {ReglesMotsCles} */
  const regles = new Map();
  for (const id of questionIds) {
    const groupes = affirmations[id];
    if (!Array.isArray(groupes) || groupes.length === 0) {
      throw new Error(`mots-cles.json : aucun mot-clé pour l'affirmation « ${id} ».`);
    }
    regles.set(
      id,
      groupes.map((groupe) => {
        if (
          !Array.isArray(groupe) ||
          groupe.length === 0 ||
          groupe.some((t) => typeof t !== "string" || t === "")
        ) {
          throw new Error(`mots-cles.json : groupe vide ou mal formé pour « ${id} ».`);
        }
        return new RegExp(groupe.map(motifTerme).join("|"), "u");
      }),
    );
  }
  for (const id of Object.keys(affirmations)) {
    if (!questionIds.includes(id))
      throw new Error(`mots-cles.json : affirmation inconnue « ${id} ».`);
  }
  return regles;
}

/**
 * Phrases d'un texte qui touchent chaque affirmation : une phrase correspond si
 * elle contient un terme de CHAQUE groupe. Trois phrases au plus par
 * affirmation, coupées à 250 caractères : c'est un signal pour savoir où lire,
 * pas une citation — la citation se relève dans le document.
 *
 * @param {string} texte
 * @param {ReglesMotsCles} regles
 * @returns {{ questionId: string, phrases: string[] }[]}
 */
export function correspondances(texte, regles) {
  const phrases = decouperPhrases(texte).map((phrase) => ({ phrase, forme: sansAccents(phrase) }));
  const resultat = [];
  for (const [questionId, groupes] of regles) {
    const trouvees = phrases.filter(({ forme }) => groupes.every((motif) => motif.test(forme)));
    if (trouvees.length > 0) {
      resultat.push({
        questionId,
        phrases: trouvees
          .slice(0, 3)
          .map(({ phrase }) => (phrase.length > 250 ? `${phrase.slice(0, 249)}…` : phrase)),
      });
    }
  }
  return resultat;
}
