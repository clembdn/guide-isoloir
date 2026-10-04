// @ts-check
/**
 * Veille quotidienne des sources : ce que les candidats et les partis ont publié
 * depuis le dernier passage.
 *
 * CE SCRIPT NE CODE RIEN, ET N'APPELLE AUCUNE IA. Il relève les sites, lit les
 * nouveautés et y cherche les mots-clés des 24 affirmations du test
 * (`data/veille/mots-cles.json`). Son rapport dit OÙ LIRE ; c'est l'éditeur qui
 * lit, code et publie. Tout tourne en local, gratuitement : `fetch` de Node,
 * `pdftotext`, et Chromium pour deux sites rendus côté client.
 * Voir `scripts/veille/lancer.sh`.
 *
 * Sous-commandes :
 *
 *   releve [--amorcer] [--depuis AAAA-MM-JJ] [--sans-sources] [--cibles f] [--etat d]
 *       Relève chaque cible de `data/veille/cibles.json` et chaque source déjà
 *       citée, puis ajoute à la file `etat/a-traiter.json` ce qui a changé.
 *       `--amorcer` enregistre l'état sans rien signaler, sauf les entrées de
 *       sitemap ou de flux datées d'après `--depuis`.
 *   analyser [--max N]
 *       Télécharge les nouveautés de la file, y cherche les mots-clés de chaque
 *       affirmation, et écrit le rapport du jour (`etat/rapports/<jour>/rapport.md`).
 *   telecharger <url> [--chromium]
 *       Télécharge un document dans le cache et en extrait le texte, pour le lire
 *       et y relever une citation exacte.
 *   citations [--depuis AAAA-MM-JJ] [id…]
 *       Vérifie que chaque brouillon cite un passage présent dans le texte de ses
 *       sources téléchargées. Sort en 1 si une citation est introuvable.
 *   gel
 *       État du calendrier électoral. Sort en 3 pendant la réserve, en 4 quand la
 *       veille est terminée.
 *
 * Aucune dépendance ajoutée : `fetch` de Node, `pdftotext` et `pdfinfo` du
 * système, Chromium de Playwright (déjà en dépendance) pour les rares sites
 * rendus côté client.
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import {
  autorise,
  classerChangement,
  cleUrl,
  differencePhrases,
  empreinte,
  etatCalendrier,
  extraireLiens,
  htmlVersTexte,
  jourParis,
  lireListe,
  compilerMotsCles,
  correspondances,
  lireRobots,
  trouverCitation,
  validerCibles,
} from "./outils.mjs";

const executer = promisify(execFile);

export const RACINE = path.resolve(import.meta.dirname, "../..");
export const AGENT = "GuideIsoloirVeille/1.0 (+https://guide-isoloir.fr/a-propos)";
const JETON_AGENT = "GuideIsoloirVeille";

/** Documents lus au plus par passage : au-delà, la suite attend le lendemain. */
const MAX_ANALYSES = 40;
/** Un élément de file plus ancien est abandonné, avec mention au rapport. */
const JOURS_EN_FILE = 14;
const DELAI_MEME_HOTE_MS = 5000;
const DELAI_APRES_ROBOTS_MS = 1000;
const HOTES_EN_PARALLELE = 3;
const DELAI_REQUETE_MS = 20000;
const TAILLE_MAX = 60 * 1024 * 1024;

/* ─── Types ──────────────────────────────────────────────────────────────── */

/**
 * @typedef {import("./outils.mjs").Cible} Cible
 * @typedef {Cible | (Omit<Cible, "type"> & { type: "source" })} CibleReleve
 * @typedef {{ statut: number, typeContenu: string, octets: Uint8Array, urlFinale: string, derniereModif: string | null }} Reponse
 * @typedef {(url: string, options?: { rendu?: "http" | "chromium" }) => Promise<Reponse>} Recuperer
 * @typedef {{
 *   statut: "ok" | "inaccessible" | "mort" | "interdit",
 *   code: number | string | null,
 *   echecs: number,
 *   empreinte?: string,
 *   entrees?: Record<string, string | null>,
 *   liens?: string[],
 *   vuLe: string,
 *   changeLe: string,
 *   archive?: string | null,
 * }} Enregistrement
 * @typedef {{ urls: Record<string, Enregistrement> }} Etat
 * @typedef {{
 *   id: string,
 *   jour: string,
 *   cible: string,
 *   acteurs: string[],
 *   nature: "nouveau-document" | "nouvelle-page" | "page-modifiee" | "nouvel-article" | "source-modifiee" | "lien-mort",
 *   url: string,
 *   titre: string | null,
 *   date: string | null,
 *   extraits: string[],
 *   analyse?: boolean,
 *   analyseLe?: string,
 *   texte?: string,
 *   erreur?: string,
 *   correspondances?: { questionId: string, phrases: string[] }[],
 * }} Element
 * @typedef {{ lire: (cle: string) => Promise<string | null>, ecrire: (cle: string, texte: string) => Promise<void> }} Cache
 */

/* ─── Relevé ─────────────────────────────────────────────────────────────── */

/**
 * Relève toutes les cibles. Fonction sans entrée-sortie propre : le réseau, le
 * cache et l'attente sont injectés, pour que les tests la fassent tourner sur
 * des pages factices.
 *
 * @param {{
 *   cibles: CibleReleve[],
 *   etat: Etat,
 *   recuperer: Recuperer,
 *   cache: Cache,
 *   pdfVersTexte: (octets: Uint8Array) => Promise<string>,
 *   maintenant: Date,
 *   attendre?: (ms: number) => Promise<void>,
 *   amorcer?: boolean,
 *   depuis?: string | null,
 * }} parametres
 * @returns {Promise<{ etat: Etat, elements: Element[], bilan: { cible: string, url: string, statut: string, detail: string }[] }>}
 */
export async function releve({
  cibles,
  etat,
  recuperer,
  cache,
  pdfVersTexte,
  maintenant,
  attendre = (ms) => new Promise((resoudre) => setTimeout(resoudre, ms)),
  amorcer = false,
  depuis = null,
}) {
  const jour = jourParis(maintenant);
  /** @type {Element[]} */
  const elements = [];
  /** @type {{ cible: string, url: string, statut: string, detail: string }[]} */
  const bilan = [];
  /** @type {Map<string, import("./outils.mjs").RegleRobots[]>} */
  const robotsParHote = new Map();

  /** @param {Omit<Element, "id" | "jour">} element */
  const signaler = (element) => {
    elements.push({
      id: cleUrl(`${element.nature} ${element.url} ${element.date ?? ""}`).slice(0, 16),
      jour,
      ...element,
    });
  };

  /** @param {string} url */
  const autoriseParRobots = async (url) => {
    const { origin, pathname, search } = new URL(url);
    if (!robotsParHote.has(origin)) {
      try {
        const reponse = await recuperer(`${origin}/robots.txt`, { rendu: "http" });
        robotsParHote.set(
          origin,
          reponse.statut >= 200 && reponse.statut < 300
            ? lireRobots(new TextDecoder().decode(reponse.octets), JETON_AGENT)
            : [],
        );
      } catch {
        // robots.txt injoignable : les règles d'usage le traitent comme absent.
        robotsParHote.set(origin, []);
      }
      await attendre(DELAI_APRES_ROBOTS_MS);
    }
    return autorise(robotsParHote.get(origin) ?? [], pathname + search);
  };

  /** @param {CibleReleve} cible */
  const relever = async (cible) => {
    const precedent = etat.urls[cible.url];
    const premiereFois = precedent === undefined;
    const silencieux = amorcer || premiereFois;
    /** @type {Enregistrement} */
    const courant = precedent ?? {
      statut: "ok",
      code: null,
      echecs: 0,
      vuLe: jour,
      changeLe: jour,
    };

    if (!(await autoriseParRobots(cible.url))) {
      etat.urls[cible.url] = { ...courant, statut: "interdit", code: "robots.txt" };
      bilan.push({ cible: cible.id, url: cible.url, statut: "interdit", detail: "robots.txt" });
      return;
    }

    /** @type {Reponse} */
    let reponse;
    try {
      reponse = await recuperer(cible.url, { rendu: cible.rendu ?? "http" });
    } catch (erreur) {
      const code =
        /** @type {any} */ (erreur)?.cause?.code ?? /** @type {any} */ (erreur)?.code ?? "erreur";
      const definitif = code === "ENOTFOUND";
      enregistrerEchec(cible, courant, code, definitif);
      return;
    }

    if (reponse.statut < 200 || reponse.statut >= 300) {
      enregistrerEchec(
        cible,
        courant,
        reponse.statut,
        reponse.statut === 404 || reponse.statut === 410,
      );
      return;
    }

    courant.statut = "ok";
    courant.code = reponse.statut;
    courant.echecs = 0;
    delete courant.archive;

    const estPdf = reponse.typeContenu.includes("pdf") || /\.pdf($|\?)/i.test(cible.url);
    const brut = new TextDecoder().decode(reponse.octets);

    if (cible.type === "page" || cible.type === "source") {
      const signature = estPdf
        ? empreinte(reponse.octets)
        : empreinte(htmlVersTexte(brut, cible.retirer));
      if (courant.empreinte === signature) {
        bilan.push({ cible: cible.id, url: cible.url, statut: "inchangé", detail: "" });
      } else {
        const texte = estPdf
          ? await pdfVersTexte(reponse.octets)
          : htmlVersTexte(brut, cible.retirer);
        const ancien = await cache.lire(cleUrl(cible.url));
        await cache.ecrire(cleUrl(cible.url), texte);
        const difference = differencePhrases(ancien ?? "", texte);
        const classe = ancien === null ? "substantiel" : classerChangement(difference);
        courant.empreinte = signature;
        if (!silencieux && classe === "substantiel") {
          courant.changeLe = jour;
          signaler({
            cible: cible.id,
            acteurs: cible.acteurs,
            nature: cible.type === "source" ? "source-modifiee" : "page-modifiee",
            url: cible.url,
            titre: null,
            date: reponse.derniereModif,
            extraits: difference.ajoutees.slice(0, 5).map((p) => p.slice(0, 200)),
          });
        }
        bilan.push({
          cible: cible.id,
          url: cible.url,
          statut: silencieux ? "enregistré" : classe,
          detail: `${difference.ajoutees.length} phrase(s) ajoutée(s)`,
        });
      }
    } else if (cible.type === "sitemap" || cible.type === "flux") {
      const liste = lireListe(brut);
      const motifUrl = cible.motifUrl ? new RegExp(cible.motifUrl) : null;
      const motifTitre = cible.motifTitre ? new RegExp(cible.motifTitre, "i") : null;
      const retenues = liste.entrees.filter(
        (e) =>
          e.url !== "" &&
          (motifUrl === null || motifUrl.test(e.url)) &&
          (motifTitre === null || motifTitre.test(e.titre ?? "")),
      );
      const avant = courant.entrees ?? {};
      /** @type {Record<string, string | null>} */
      const apres = {};
      let nouveautes = 0;
      for (const entree of retenues) {
        apres[entree.url] = entree.date;
        const connue = Object.hasOwn(avant, entree.url);
        const recente =
          depuis !== null && entree.date !== null && entree.date.slice(0, 10) >= depuis;
        const aSignaler =
          amorcer || premiereFois ? recente : !connue || avant[entree.url] !== entree.date;
        if (!aSignaler) continue;
        nouveautes += 1;
        signaler({
          cible: cible.id,
          acteurs: cible.acteurs,
          nature:
            cible.type === "flux" ? "nouvel-article" : connue ? "page-modifiee" : "nouvelle-page",
          url: entree.url,
          titre: entree.titre,
          date: entree.date,
          extraits: [],
        });
      }
      if (liste.type === "inconnu") {
        bilan.push({
          cible: cible.id,
          url: cible.url,
          statut: "illisible",
          detail: "ni sitemap ni flux",
        });
        etat.urls[cible.url] = courant;
        return;
      }
      courant.entrees = apres;
      if (nouveautes > 0) courant.changeLe = jour;
      bilan.push({
        cible: cible.id,
        url: cible.url,
        statut: nouveautes > 0 ? "nouveautés" : "inchangé",
        detail: `${retenues.length} entrée(s), ${nouveautes} signalée(s)`,
      });
    } else {
      const motif = cible.motifLiens ? new RegExp(cible.motifLiens, "i") : null;
      const liens = extraireLiens(brut, reponse.urlFinale).filter(
        (l) => motif === null || motif.test(l),
      );
      const connus = new Set(courant.liens ?? []);
      const nouveaux = premiereFois || amorcer ? [] : liens.filter((l) => !connus.has(l));
      for (const lien of nouveaux) {
        signaler({
          cible: cible.id,
          acteurs: cible.acteurs,
          nature: /\.pdf($|\?)/i.test(lien) ? "nouveau-document" : "nouvelle-page",
          url: lien,
          titre: null,
          date: null,
          extraits: [],
        });
      }
      courant.liens = [...new Set([...(courant.liens ?? []), ...liens])];
      if (nouveaux.length > 0) courant.changeLe = jour;
      bilan.push({
        cible: cible.id,
        url: cible.url,
        statut: nouveaux.length > 0 ? "nouveautés" : "inchangé",
        detail: `${liens.length} lien(s), ${nouveaux.length} nouveau(x)`,
      });
    }

    etat.urls[cible.url] = courant;
  };

  /**
   * 404, 410 ou nom de domaine inconnu DEUX JOURS DE SUITE : le lien est mort.
   * Une seule fois, c'est peut-être une maintenance. 403, 429 et 5xx ne tuent
   * jamais un lien : le serveur répond, il refuse ou il souffre.
   *
   * @param {CibleReleve} cible @param {Enregistrement} courant
   * @param {number | string} code @param {boolean} definitif
   */
  function enregistrerEchec(cible, courant, code, definitif) {
    const echecs = definitif ? courant.echecs + 1 : courant.echecs;
    const mort = definitif && echecs >= 2;
    if (mort && courant.statut !== "mort" && !amorcer) {
      signaler({
        cible: cible.id,
        acteurs: cible.acteurs,
        nature: "lien-mort",
        url: cible.url,
        titre: null,
        date: null,
        extraits: [],
      });
    }
    etat.urls[cible.url] = { ...courant, statut: mort ? "mort" : "inaccessible", code, echecs };
    bilan.push({
      cible: cible.id,
      url: cible.url,
      statut: mort ? "mort" : "inaccessible",
      detail: String(code),
    });
  }

  /*
   * POLITESSE. Les cibles d'un même hôte passent l'une après l'autre, à cinq
   * secondes d'écart ; trois hôtes au plus en parallèle. Un site de parti n'a
   * pas à encaisser une rafale parce qu'un comparateur fait sa veille.
   */
  /** @type {Map<string, CibleReleve[]>} */
  const parHote = new Map();
  for (const cible of cibles) {
    const hote = new URL(cible.url).host;
    parHote.set(hote, [...(parHote.get(hote) ?? []), cible]);
  }
  const files = [...parHote.values()];
  const travailleurs = Array.from(
    { length: Math.min(HOTES_EN_PARALLELE, files.length) },
    async () => {
      for (let file = files.shift(); file !== undefined; file = files.shift()) {
        for (const [rang, cible] of file.entries()) {
          if (rang > 0) await attendre(DELAI_MEME_HOTE_MS);
          await relever(cible);
        }
      }
    },
  );
  await Promise.all(travailleurs);

  return { etat, elements, bilan };
}

/* ─── Entrées-sorties réelles ────────────────────────────────────────────── */

/** @type {import("@playwright/test").Browser | null} */
let navigateur = null;

/** @type {Recuperer} */
export async function recupererHttp(url, options = {}) {
  if (options.rendu === "chromium") {
    const { chromium } = await import("@playwright/test");
    navigateur ??= await chromium.launch();
    const page = await navigateur.newPage({
      userAgent: `Mozilla/5.0 (X11; Linux x86_64) ${AGENT}`,
    });
    try {
      const reponse = await page.goto(url, { waitUntil: "load", timeout: 30000 });
      // Les sites rendus côté client remplissent la page après `load`.
      await page.waitForTimeout(3000);
      return {
        statut: reponse?.status() ?? 0,
        typeContenu: "text/html",
        octets: new TextEncoder().encode(await page.content()),
        urlFinale: page.url(),
        derniereModif: null,
      };
    } finally {
      await page.close();
    }
  }

  const reponse = await fetch(url, {
    headers: {
      "user-agent": AGENT,
      accept: "text/html,application/xhtml+xml,application/xml,application/pdf;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(DELAI_REQUETE_MS),
  });
  const longueur = Number(reponse.headers.get("content-length") ?? "0");
  if (longueur > TAILLE_MAX)
    throw Object.assign(new Error("trop volumineux"), { code: "TROP_GROS" });
  const octets = new Uint8Array(await reponse.arrayBuffer());
  if (octets.byteLength > TAILLE_MAX)
    throw Object.assign(new Error("trop volumineux"), { code: "TROP_GROS" });
  return {
    statut: reponse.status,
    typeContenu: reponse.headers.get("content-type") ?? "",
    octets,
    urlFinale: reponse.url,
    derniereModif: reponse.headers.get("last-modified"),
  };
}

export async function fermerNavigateur() {
  await navigateur?.close();
  navigateur = null;
}

/**
 * Texte d'un PDF, en ORDRE DE LECTURE : `pdftotext` sans `-layout`.
 *
 * `-layout` recolle des morceaux de colonnes voisines et fabrique des phrases
 * qui n'existent pas dans le document — piège relevé le 20 septembre 2026 sur
 * le projet des Patriotes, voir `data/cases-non-couvertes.md`.
 *
 * @param {Uint8Array} octets
 * @param {string} dossier
 */
export async function pdfVersTexte(octets, dossier) {
  const fichier = path.join(dossier, `extraction-${process.pid}.pdf`);
  await writeFile(fichier, octets);
  const { stdout } = await executer("pdftotext", ["-enc", "UTF-8", fichier, "-"], {
    maxBuffer: 64 * 1024 * 1024,
  });
  return stdout;
}

/** @param {string} fichier */
async function infosPdf(fichier) {
  try {
    const { stdout } = await executer("pdfinfo", ["-isodates", fichier]);
    const champ = (/** @type {string} */ nom) =>
      stdout.match(new RegExp(`^${nom}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? null;
    return {
      creation: champ("CreationDate"),
      modification: champ("ModDate"),
      pages: champ("Pages"),
    };
  } catch {
    return null;
  }
}

/** @param {string} dossier @returns {Cache} */
function cacheDisque(dossier) {
  return {
    async lire(cle) {
      try {
        return await readFile(path.join(dossier, `${cle}.txt`), "utf8");
      } catch {
        return null;
      }
    },
    async ecrire(cle, texte) {
      await mkdir(dossier, { recursive: true });
      await writeFile(path.join(dossier, `${cle}.txt`), texte);
    },
  };
}

/** @param {string} chemin @param {unknown} defaut */
async function lireJson(chemin, defaut) {
  try {
    return JSON.parse(await readFile(chemin, "utf8"));
  } catch {
    return defaut;
  }
}

/** @param {string} chemin @param {unknown} valeur */
async function ecrireJson(chemin, valeur) {
  await mkdir(path.dirname(chemin), { recursive: true });
  await writeFile(chemin, JSON.stringify(valeur, null, 2) + "\n");
}

/** Données réelles, importées telles quelles : Node retire les types. */
export async function chargerDonnees() {
  const importer = (/** @type {string} */ fichier) =>
    import(pathToFileURL(path.join(RACINE, "src/data", fichier)).href);
  const [
    { POSITIONS },
    { PROPOSITIONS },
    { SOURCES_POSITIONS },
    { ACTEURS, CANDIDATURES },
    { SOURCES_INFOBULLES },
  ] = await Promise.all([
    importer("positions.ts"),
    importer("programmes.ts"),
    importer("sources-positions.ts"),
    importer("acteurs.ts"),
    importer("questions.ts"),
  ]);
  return {
    positions: /** @type {any[]} */ (POSITIONS),
    propositions: /** @type {any[]} */ (PROPOSITIONS),
    sources: /** @type {any[]} */ (SOURCES_POSITIONS),
    acteurs: /** @type {any[]} */ (ACTEURS),
    candidatures: /** @type {any[]} */ (CANDIDATURES),
    sourcesInfobulles: /** @type {any[]} */ (SOURCES_INFOBULLES),
  };
}

/**
 * Sources déjà citées, relevées pour savoir si elles vivent encore. Elles ne
 * figurent pas dans `cibles.json` : elles en découlent.
 *
 * @param {Awaited<ReturnType<typeof chargerDonnees>>} donnees
 * @returns {CibleReleve[]}
 */
function ciblesDesSources(donnees) {
  /** @type {Map<string, Set<string>>} */
  const acteursParSource = new Map();
  const noter = (/** @type {string} */ sourceId, /** @type {string} */ acteurId) => {
    acteursParSource.set(sourceId, (acteursParSource.get(sourceId) ?? new Set()).add(acteurId));
  };
  for (const d of [...donnees.positions, ...donnees.propositions])
    for (const s of d.sourceIds) noter(s, d.actorId);
  for (const c of donnees.candidatures) for (const s of c.statutSourceIds) noter(s, c.actorId);

  const vues = new Set();
  /** @type {CibleReleve[]} */
  const cibles = [];
  for (const source of [...donnees.sources, ...donnees.sourcesInfobulles]) {
    if (vues.has(source.url)) continue;
    vues.add(source.url);
    cibles.push({
      id: `source-${source.id}`,
      acteurs: [...(acteursParSource.get(source.id) ?? [])],
      type: "source",
      url: source.url,
      note: `Source citée : ${source.titre}`,
    });
  }
  return cibles;
}

/** @param {string[]} args @param {string} nom */
function option(args, nom) {
  const i = args.indexOf(nom);
  return i >= 0 ? (args[i + 1] ?? null) : null;
}

/** @param {string[]} args */
function chemins(args) {
  const etat = path.resolve(RACINE, option(args, "--etat") ?? "data/veille/etat");
  return {
    etat,
    cibles: path.resolve(RACINE, option(args, "--cibles") ?? "data/veille/cibles.json"),
    empreintes: path.join(etat, "empreintes.json"),
    file: path.join(etat, "a-traiter.json"),
    cache: path.join(etat, "cache"),
    rapports: path.join(etat, "rapports"),
    motsCles: path.resolve(RACINE, option(args, "--mots-cles") ?? "data/veille/mots-cles.json"),
  };
}

/* ─── Sous-commandes ─────────────────────────────────────────────────────── */

/** @param {string[]} args */
async function commandeReleve(args) {
  const c = chemins(args);
  const maintenant = new Date();
  const jour = jourParis(maintenant);
  const calendrier = etatCalendrier(maintenant);
  if (!calendrier.releve) {
    console.log("Veille terminée : le second tour est passé.");
    return 4;
  }

  const donnees = await chargerDonnees();
  const cibles = validerCibles(
    await lireJson(c.cibles, null),
    new Set(donnees.acteurs.map((a) => a.id)),
  );
  const toutes = args.includes("--sans-sources")
    ? cibles
    : [...cibles, ...ciblesDesSources(donnees)];

  await mkdir(c.cache, { recursive: true });
  const { etat, elements, bilan } = await releve({
    cibles: toutes,
    etat: await lireJson(c.empreintes, { urls: {} }),
    recuperer: recupererHttp,
    cache: cacheDisque(c.cache),
    pdfVersTexte: (octets) => pdfVersTexte(octets, c.cache),
    maintenant,
    amorcer: args.includes("--amorcer"),
    depuis: option(args, "--depuis"),
  });
  await fermerNavigateur();

  // Liens morts : la copie archivée la plus proche, quand elle existe.
  for (const element of elements.filter((e) => e.nature === "lien-mort")) {
    try {
      const reponse = await recupererHttp(
        `https://archive.org/wayback/available?url=${encodeURIComponent(element.url)}`,
      );
      const archive =
        JSON.parse(new TextDecoder().decode(reponse.octets))?.archived_snapshots?.closest?.url ??
        null;
      element.extraits = [
        archive ? `Copie archivée : ${archive}` : "Aucune copie archivée trouvée.",
      ];
      const enregistrement = etat.urls[element.url];
      if (enregistrement) enregistrement.archive = archive;
    } catch {
      element.extraits = ["Archive.org injoignable : copie archivée non cherchée."];
    }
  }

  await ecrireJson(c.empreintes, etat);

  // File : on ajoute, on ne remplace pas. Un élément signalé un jour où la veille
  // était en rapport seul reste à traiter le lendemain.
  /** @type {{ elements: Element[], abandonnes: Element[] }} */
  const file = await lireJson(c.file, { elements: [], abandonnes: [] });
  const ids = new Set(file.elements.map((e) => e.id));
  for (const element of elements) if (!ids.has(element.id)) file.elements.push(element);
  const limite = jourParis(new Date(maintenant.getTime() - JOURS_EN_FILE * 86400000));
  file.abandonnes = file.elements.filter((e) => e.jour < limite);
  file.elements = file.elements.filter((e) => e.jour >= limite);
  await ecrireJson(c.file, file);

  const dossier = path.join(c.rapports, jour);
  await ecrireJson(path.join(dossier, "releve.json"), { jour, calendrier, elements, bilan });
  await writeFile(path.join(dossier, "releve.md"), resumeReleve(jour, elements, bilan, file));

  console.log(
    `Relevé du ${jour} : ${toutes.length} adresses, ${elements.length} élément(s) nouveau(x), ` +
      `${file.elements.length} en file.`,
  );
  return 0;
}

/**
 * @param {string} jour @param {Element[]} elements
 * @param {{ cible: string, url: string, statut: string, detail: string }[]} bilan
 * @param {{ elements: Element[], abandonnes: Element[] }} file
 */
function resumeReleve(jour, elements, bilan, file) {
  const lignes = [`# Relevé du ${jour}`, ""];
  lignes.push(
    `${bilan.length} adresses relevées, ${elements.length} élément(s) nouveau(x), ${file.elements.length} en file.`,
    "",
  );
  for (const nature of [
    "nouveau-document",
    "nouvelle-page",
    "page-modifiee",
    "nouvel-article",
    "lien-mort",
    "source-modifiee",
  ]) {
    const duType = elements.filter((e) => e.nature === nature);
    if (duType.length === 0) continue;
    lignes.push(`## ${nature} (${duType.length})`, "");
    for (const e of duType) {
      lignes.push(
        `- ${e.titre ? `« ${e.titre} » — ` : ""}${e.url}${e.date ? ` (${e.date.slice(0, 10)})` : ""} · ${e.acteurs.join(", ") || "presse"}`,
      );
      for (const extrait of e.extraits) lignes.push(`  - ${extrait}`);
    }
    lignes.push("");
  }
  const problemes = bilan.filter((b) =>
    ["inaccessible", "mort", "interdit", "illisible"].includes(b.statut),
  );
  if (problemes.length > 0) {
    lignes.push(`## Adresses en échec (${problemes.length})`, "");
    for (const b of problemes) lignes.push(`- ${b.statut} (${b.detail}) : ${b.url}`);
    lignes.push("");
  }
  if (file.abandonnes.length > 0) {
    lignes.push(
      `## Abandonnés après ${JOURS_EN_FILE} jours en file (${file.abandonnes.length})`,
      "",
    );
    for (const e of file.abandonnes) lignes.push(`- ${e.nature} : ${e.url}`);
    lignes.push("");
  }
  return lignes.join("\n");
}

/** @param {string[]} args */
async function commandeTelecharger(args) {
  const url = args.find((a) => /^https?:\/\//.test(a));
  if (!url) {
    console.error("Usage : telecharger <url> [--chromium]");
    return 2;
  }
  const c = chemins(args);
  await mkdir(c.cache, { recursive: true });

  const { origin, pathname, search } = new URL(url);
  try {
    const robots = await recupererHttp(`${origin}/robots.txt`);
    if (
      robots.statut === 200 &&
      !autorise(lireRobots(new TextDecoder().decode(robots.octets), JETON_AGENT), pathname + search)
    ) {
      console.error(`Refusé par ${origin}/robots.txt : ce document ne sera pas lu.`);
      return 1;
    }
  } catch {
    /* robots.txt injoignable : traité comme absent. */
  }

  const reponse = await recupererHttp(url, {
    rendu: args.includes("--chromium") ? "chromium" : "http",
  });
  await fermerNavigateur();
  const cle = cleUrl(url);
  const estPdf = reponse.typeContenu.includes("pdf") || /\.pdf($|\?)/i.test(url);
  const brut = path.join(c.cache, `${cle}.${estPdf ? "pdf" : "html"}`);
  await writeFile(brut, reponse.octets);

  const lignes = [`URL : ${url}`];
  if (reponse.urlFinale !== url) lignes.push(`Redirigée vers : ${reponse.urlFinale}`);
  lignes.push(
    `Statut : ${reponse.statut} · ${reponse.typeContenu || "type inconnu"} · ${Math.round(reponse.octets.byteLength / 1024)} ko`,
  );
  if (reponse.derniereModif) lignes.push(`Last-Modified (en-tête HTTP) : ${reponse.derniereModif}`);
  if (reponse.statut < 200 || reponse.statut >= 300) {
    console.log(lignes.join("\n"));
    console.error("Document non téléchargé : le serveur n'a pas répondu 2xx.");
    return 1;
  }

  let texte;
  if (estPdf) {
    texte = await pdfVersTexte(reponse.octets, c.cache);
    const infos = await infosPdf(brut);
    if (infos)
      lignes.push(
        `PDF : ${infos.pages ?? "?"} pages · créé ${infos.creation ?? "?"} · modifié ${infos.modification ?? "?"}`,
      );
  } else {
    const html = new TextDecoder().decode(reponse.octets);
    texte = htmlVersTexte(html);
    const meta = (/** @type {string} */ nom) =>
      html.match(
        new RegExp(`<meta[^>]+(?:property|name)="${nom}"[^>]+content="([^"]+)"`, "i"),
      )?.[1] ?? null;
    const dates = {
      "article:published_time": meta("article:published_time"),
      "article:modified_time": meta("article:modified_time"),
      "<time datetime>": html.match(/<time[^>]+datetime="([^"]+)"/i)?.[1] ?? null,
    };
    for (const [nom, date] of Object.entries(dates))
      if (date) lignes.push(`Date (${nom}) : ${date}`);
    const titre = html.match(/<title>([^<]*)<\/title>/i)?.[1];
    if (titre) lignes.push(`Titre : ${titre.trim()}`);
  }
  await writeFile(path.join(c.cache, `${cle}.txt`), texte);
  const mots = texte.split(/\s+/).filter(Boolean).length;
  lignes.push(`Texte : ${path.relative(RACINE, path.join(c.cache, `${cle}.txt`))} (${mots} mots)`);
  if (mots < 80)
    lignes.push("ATTENTION : presque aucun texte. Page rendue côté client ? Essayer --chromium.");
  console.log(lignes.join("\n"));
  return 0;
}

/** @param {string[]} args */
async function commandeCitations(args) {
  const c = chemins(args);
  const depuis = option(args, "--depuis");
  const ids = args.filter(
    (a, i) => !a.startsWith("--") && args[i - 1] !== "--depuis" && args[i - 1] !== "--etat",
  );
  const donnees = await chargerDonnees();
  const urlParSource = new Map(donnees.sources.map((s) => [s.id, s.url]));
  const cache = cacheDisque(c.cache);

  const aVerifier = [...donnees.positions, ...donnees.propositions].filter((d) =>
    ids.length > 0
      ? ids.includes(d.id)
      : d.reviewStatus === "draft" && (depuis === null || d.updatedAt >= depuis),
  );
  let echecs = 0;
  for (const donnee of aVerifier) {
    if (donnee.provenance === "inference") {
      console.log(
        `INFÉRENCE  ${donnee.id} : aucune citation à vérifier — la veille n'en écrit jamais.`,
      );
      echecs += 1;
      continue;
    }
    const textes = [];
    for (const sourceId of donnee.sourceIds) {
      const url = urlParSource.get(sourceId);
      const texte = url ? await cache.lire(cleUrl(url)) : null;
      if (texte !== null) textes.push(texte);
    }
    if (textes.length === 0) {
      console.log(
        `NON LUE    ${donnee.id} : aucune de ses sources n'est dans le cache (telecharger <url>).`,
      );
      echecs += 1;
      continue;
    }
    const resultat = trouverCitation(donnee.citation, textes.join("\n"));
    if (resultat.trouvee) console.log(`OK         ${donnee.id}`);
    else {
      console.log(`INTROUVÉE  ${donnee.id} : « ${resultat.manquant} »`);
      echecs += 1;
    }
  }
  console.log(`${aVerifier.length} citation(s) vérifiée(s), ${echecs} en échec.`);
  return echecs > 0 ? 1 : 0;
}

function commandeGel() {
  const etat = etatCalendrier(new Date());
  console.log(JSON.stringify(etat));
  return etat.etat === "terminee" ? 4 : etat.codage ? 0 : 3;
}

/** @param {string[]} args */
async function commandeAnalyser(args) {
  const c = chemins(args);
  const maintenant = new Date();
  const jour = jourParis(maintenant);
  const max = Number(option(args, "--max") ?? MAX_ANALYSES);

  const donnees = await chargerDonnees();
  const { QUESTIONS } = await import(
    pathToFileURL(path.join(RACINE, "src/data/questions.ts")).href
  );
  const questions = /** @type {{ id: string, texte: string }[]} */ (QUESTIONS);
  const regles = compilerMotsCles(
    await lireJson(c.motsCles, null),
    questions.map((q) => q.id),
  );
  const cibles = validerCibles(
    await lireJson(c.cibles, null),
    new Set(donnees.acteurs.map((a) => a.id)),
  );
  const renduParCible = new Map(cibles.map((cible) => [cible.id, cible.rendu ?? "http"]));
  const nomParActeur = new Map(donnees.acteurs.map((a) => [a.id, a.name]));
  const texteParQuestion = new Map(questions.map((q) => [q.id, q.texte]));

  /** @type {{ elements: Element[], abandonnes: Element[] }} */
  const file = await lireJson(c.file, { elements: [], abandonnes: [] });
  const enAttente = file.elements.filter((e) => !e.analyse && e.nature !== "lien-mort");
  const aLire = enAttente.slice(0, max);
  await mkdir(c.cache, { recursive: true });

  /** @type {Map<string, import("./outils.mjs").RegleRobots[]>} */
  const robots = new Map();
  /** @type {Map<string, number>} */
  const derniereRequete = new Map();
  for (const element of aLire) {
    const { origin, host, pathname, search } = new URL(element.url);
    // Politesse : cinq secondes entre deux requêtes au même hôte.
    const ecart = Date.now() - (derniereRequete.get(host) ?? 0);
    if (ecart < DELAI_MEME_HOTE_MS)
      await new Promise((r) => setTimeout(r, DELAI_MEME_HOTE_MS - ecart));
    try {
      if (!robots.has(origin)) {
        try {
          const reponse = await recupererHttp(`${origin}/robots.txt`);
          robots.set(
            origin,
            reponse.statut === 200
              ? lireRobots(new TextDecoder().decode(reponse.octets), JETON_AGENT)
              : [],
          );
        } catch {
          robots.set(origin, []);
        }
      }
      if (!autorise(robots.get(origin) ?? [], pathname + search))
        throw new Error("refusé par robots.txt");
      const reponse = await recupererHttp(element.url, {
        rendu: renduParCible.get(element.cible) ?? "http",
      });
      derniereRequete.set(host, Date.now());
      if (reponse.statut < 200 || reponse.statut >= 300) throw new Error(`HTTP ${reponse.statut}`);
      const estPdf = reponse.typeContenu.includes("pdf") || /\.pdf($|\?)/i.test(element.url);
      const texte = estPdf
        ? await pdfVersTexte(reponse.octets, c.cache)
        : htmlVersTexte(new TextDecoder().decode(reponse.octets));
      const fichier = path.join(c.cache, `${cleUrl(element.url)}.txt`);
      await writeFile(fichier, texte);
      element.texte = path.relative(RACINE, fichier);
      element.correspondances = correspondances(texte, regles);
    } catch (erreur) {
      derniereRequete.set(host, Date.now());
      element.erreur = erreur instanceof Error ? erreur.message : String(erreur);
    }
    element.analyse = true;
    element.analyseLe = jour;
  }
  await fermerNavigateur();
  await ecrireJson(c.file, file);

  const rapport = rapportDuJour({
    jour,
    lus: aLire,
    liensMorts: file.elements.filter((e) => e.nature === "lien-mort" && e.jour === jour),
    restants: enAttente.length - aLire.length,
    nomParActeur,
    texteParQuestion,
  });
  const dossier = path.join(c.rapports, jour);
  await mkdir(dossier, { recursive: true });
  await writeFile(path.join(dossier, "rapport.md"), rapport);

  const pertinents = aLire.filter((e) => (e.correspondances ?? []).length > 0).length;
  console.log(
    `Analyse du ${jour} : ${aLire.length} document(s) lu(s), ${pertinents} touchant une affirmation du test, ` +
      `${enAttente.length - aLire.length} reporté(s).`,
  );
  console.log(`PERTINENTS=${pertinents}`);
  return 0;
}

/**
 * Rapport du jour, pour l'éditeur. Les documents qui touchent une affirmation
 * d'abord, avec les phrases qui l'ont fait signaler ; puis le reste, en une
 * ligne chacun. Une correspondance n'est pas une position : elle dit où lire.
 *
 * @param {{
 *   jour: string, lus: Element[], liensMorts: Element[], restants: number,
 *   nomParActeur: Map<string, string>, texteParQuestion: Map<string, string>,
 * }} p
 */
export function rapportDuJour({ jour, lus, liensMorts, restants, nomParActeur, texteParQuestion }) {
  const qui = (/** @type {Element} */ e) =>
    e.acteurs.length === 0
      ? "Presse"
      : e.acteurs.map((id) => nomParActeur.get(id) ?? id).join(", ");
  const quoi = (/** @type {Element} */ e) =>
    `${e.titre ? `« ${e.titre} »` : e.url}${e.date ? ` (${e.date.slice(0, 10)})` : ""}`;
  const pertinents = lus.filter((e) => (e.correspondances ?? []).length > 0);
  const muets = lus.filter((e) => !e.erreur && (e.correspondances ?? []).length === 0);
  const echecs = lus.filter((e) => e.erreur);

  const lignes = [
    `# Veille du ${jour}`,
    "",
    `${lus.length} document(s) lu(s), ${pertinents.length} touchant une affirmation du test.` +
      (restants > 0 ? ` ${restants} reporté(s) au prochain passage.` : ""),
    "",
    "Rien n'est codé automatiquement. Chaque phrase ci-dessous dit où lire ; la position se code à",
    "la main, d'après le document entier, avec sa citation exacte et sa date.",
    "",
  ];
  if (pertinents.length > 0) {
    lignes.push("## À lire : documents qui touchent une affirmation du test", "");
    for (const e of pertinents) {
      lignes.push(`### ${qui(e)} — ${quoi(e)}`, "", `${e.url}`, "");
      if (e.texte) lignes.push(`Texte téléchargé : \`${e.texte}\``, "");
      for (const { questionId, phrases } of e.correspondances ?? []) {
        lignes.push(`- **${texteParQuestion.get(questionId) ?? questionId}** (\`${questionId}\`)`);
        for (const phrase of phrases) lignes.push(`  > ${phrase}`);
      }
      lignes.push("");
    }
  }
  if (muets.length > 0) {
    lignes.push("## Lus, sans mot-clé du test", "");
    for (const e of muets) lignes.push(`- ${qui(e)} — ${quoi(e)} — ${e.url}`);
    lignes.push("");
  }
  if (liensMorts.length > 0) {
    lignes.push("## Liens morts parmi les sources citées", "");
    for (const e of liensMorts) lignes.push(`- ${e.url} (${qui(e)}) — ${e.extraits.join(" ")}`);
    lignes.push("");
  }
  if (echecs.length > 0) {
    lignes.push("## Non lus", "");
    for (const e of echecs) lignes.push(`- ${e.url} — ${e.erreur}`);
    lignes.push("");
  }
  lignes.push(
    "## Pour coder",
    "",
    "1. Lire le document entier (le texte téléchargé est indiqué), au crible des 24 affirmations.",
    "2. Écrire la source et la position dans `src/data/`, citation recopiée du texte.",
    "3. `node scripts/veille/veiller.mjs citations <id>` vérifie que la citation figure dans le texte.",
    "4. Noter dans `data/cases-non-couvertes.md` ce qui a été lu sans pouvoir être codé.",
    "",
    "Le détail du relevé (adresses en échec, éléments abandonnés) est dans `releve.md`.",
    "",
  );
  return lignes.join("\n");
}

/* ─── Point d'entrée ─────────────────────────────────────────────────────── */

const COMMANDES = /** @type {Record<string, (args: string[]) => Promise<number> | number>} */ ({
  releve: commandeReleve,
  telecharger: commandeTelecharger,
  citations: commandeCitations,
  analyser: commandeAnalyser,
  gel: commandeGel,
});

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [nom, ...args] = process.argv.slice(2);
  const commande = nom === undefined ? undefined : COMMANDES[nom];
  if (commande === undefined) {
    console.error(`Sous-commandes : ${Object.keys(COMMANDES).join(", ")}`);
    process.exit(2);
  }
  try {
    process.exit(await commande(args));
  } catch (erreur) {
    await fermerNavigateur();
    console.error(erreur instanceof Error ? erreur.message : erreur);
    process.exit(1);
  }
}
