// @ts-check
/**
 * Double codage à l'aveugle : la feuille vierge, puis le taux d'accord.
 *
 * C'EST UN PROTOCOLE HUMAIN (CLAUDE.md), PAS UNE FONCTIONNALITÉ. Deux personnes
 * codent la même feuille sans se voir ; chacune commite son fichier ; ce script
 * confronte les deux et publie le résultat. Aucune interface, aucun état de
 * verrouillage : LE COMMIT EST LE VERROU. Un fichier modifié après son commit
 * est refusé à la confrontation.
 *
 *   node scripts/double-codage.mjs preparer [--echantillon N] [--graine S] [--codeur-a-publie]
 *       Écrit data/double-codage/<date>/feuille-vierge.csv depuis les données
 *       PUBLIÉES (dist/donnees/guide-isoloir-2027.json, lancez build:prod
 *       avant) : une ligne par couple acteur × affirmation, les documents à
 *       lire, et des colonnes vides à remplir. `--codeur-a-publie` écrit en plus
 *       codeur-a.csv à partir du codage publié, pour mesurer celui-ci contre un
 *       relevé indépendant ; la page le dira, par `--codeurs`.
 *
 *   node scripts/double-codage.mjs comparer <a.csv> <b.csv> [reconciliation.csv]
 *                                  [--publier --codeurs "…"] [--essai]
 *       Accord exact, accord à un niveau près, désaccords, désaccords non
 *       résolus, couverture par thème. Écrit rapport.md à côté des fichiers.
 *       `--publier` ajoute la campagne à src/data/double-codage.json, que
 *       /methodologie affiche. `--essai` lève le contrôle du verrou pour un
 *       essai local, et interdit alors `--publier`.
 *
 * Valeurs admises dans la colonne `valeur` : -2, -1, 0, 1, 2, ou `non-couvert`
 * quand les documents ne répondent pas à l'affirmation. Une cellule vide est
 * une erreur : un couple non codé ne se compte ni en accord ni en désaccord.
 */
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const executer = promisify(execFile);
const RACINE = path.resolve(import.meta.dirname, "..");

export const NON_COUVERT = "non-couvert";
export const COLONNES = [
  "acteur_id",
  "acteur",
  "question_id",
  "theme",
  "affirmation",
  "documents",
  "valeur",
  "adequation",
  "citation",
  "remarque",
];

/* ─── CSV ────────────────────────────────────────────────────────────────── */

/**
 * Lit un CSV (RFC 4180). Le séparateur est déduit de l'en-tête : un tableur
 * réglé en français exporte au point-virgule, et le relecteur ne doit pas avoir
 * à le savoir.
 *
 * @param {string} texte
 * @returns {Record<string, string>[]}
 */
export function lireCsv(texte) {
  const source = texte.replace(/^\uFEFF/, "");
  const premiereLigne = source.split(/\r?\n/, 1)[0] ?? "";
  const separateur =
    (premiereLigne.match(/;/g)?.length ?? 0) > (premiereLigne.match(/,/g)?.length ?? 0) ? ";" : ",";

  /** @type {string[][]} */
  const lignes = [];
  /** @type {string[]} */
  let ligne = [];
  let cellule = "";
  let entreGuillemets = false;
  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (entreGuillemets) {
      if (c === '"' && source[i + 1] === '"') {
        cellule += '"';
        i += 1;
      } else if (c === '"') entreGuillemets = false;
      else cellule += c;
    } else if (c === '"') entreGuillemets = true;
    else if (c === separateur) {
      ligne.push(cellule);
      cellule = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && source[i + 1] === "\n") i += 1;
      ligne.push(cellule);
      lignes.push(ligne);
      ligne = [];
      cellule = "";
    } else cellule += c;
  }
  if (cellule !== "" || ligne.length > 0) {
    ligne.push(cellule);
    lignes.push(ligne);
  }

  const [entetes, ...corps] = lignes.filter((l) => l.some((c) => c.trim() !== ""));
  if (entetes === undefined) return [];
  return corps.map((l) =>
    Object.fromEntries(entetes.map((e, i) => [e.trim(), (l[i] ?? "").trim()])),
  );
}

/**
 * Valeur codée, normalisée : un entier de −2 à 2, ou `non-couvert`.
 *
 * @param {string} brut
 * @returns {number | "non-couvert"}
 */
export function lireValeur(brut) {
  const texte = brut.trim().toLowerCase().replace("−", "-").replace(/^\+/, "");
  if (texte === NON_COUVERT || texte === "nc") return NON_COUVERT;
  if (/^-?[0-2]$/.test(texte)) return Number(texte);
  throw new Error(`valeur « ${brut} » : -2, -1, 0, 1, 2 ou « ${NON_COUVERT} » attendu`);
}

/* ─── Confrontation ──────────────────────────────────────────────────────── */

/**
 * @typedef {{ acteur: string, question: string, theme: string, valeur: number | "non-couvert" }} Code
 * @typedef {{ acteur: string, question: string, theme: string, a: number | "non-couvert", b: number | "non-couvert", decision: number | "non-couvert" | null, justification: string }} Desaccord
 */

/**
 * @param {Record<string, string>[]} lignes
 * @param {string} nom
 * @returns {Map<string, Code>}
 */
export function lireCodage(lignes, nom) {
  /** @type {Map<string, Code>} */
  const codes = new Map();
  for (const [rang, ligne] of lignes.entries()) {
    const acteur = ligne["acteur_id"] ?? "";
    const question = ligne["question_id"] ?? "";
    if (acteur === "" || question === "")
      throw new Error(`${nom}, ligne ${rang + 2} : acteur_id ou question_id manquant`);
    const cle = `${acteur}|${question}`;
    if (codes.has(cle))
      throw new Error(`${nom} : le couple ${acteur} × ${question} figure deux fois`);
    if ((ligne["valeur"] ?? "") === "")
      throw new Error(`${nom}, ligne ${rang + 2} : ${acteur} × ${question} n'est pas codé`);
    try {
      codes.set(cle, {
        acteur,
        question,
        theme: ligne["theme"] ?? "",
        valeur: lireValeur(ligne["valeur"] ?? ""),
      });
    } catch (erreur) {
      throw new Error(
        `${nom}, ligne ${rang + 2} : ${erreur instanceof Error ? erreur.message : erreur}`,
        { cause: erreur },
      );
    }
  }
  return codes;
}

/**
 * Confronte deux codages du même jeu de couples.
 *
 * - accord exact : sur TOUS les couples, `non-couvert` compris — juger qu'un
 *   document ne répond pas est une décision de codage comme une autre ;
 * - accord à un niveau près : sur les seuls couples que les deux ont chiffrés,
 *   et ce dénominateur est publié avec le taux ;
 * - un désaccord est résolu quand la réconciliation lui donne une valeur, jamais
 *   par la moyenne des deux : on revient à la source.
 *
 * @param {Map<string, Code>} a
 * @param {Map<string, Code>} b
 * @param {Map<string, { decision: number | "non-couvert" | null, justification: string }>} reconciliation
 */
export function confronter(a, b, reconciliation = new Map()) {
  const seulsA = [...a.keys()].filter((k) => !b.has(k));
  const seulsB = [...b.keys()].filter((k) => !a.has(k));
  if (seulsA.length > 0 || seulsB.length > 0) {
    throw new Error(
      `Les deux relevés ne portent pas sur les mêmes couples : ${seulsA.length} seulement dans A, ` +
        `${seulsB.length} seulement dans B (${[...seulsA, ...seulsB].slice(0, 3).join(", ")}…).`,
    );
  }

  let exacts = 0;
  let numeriques = 0;
  let unNiveau = 0;
  /** @type {Desaccord[]} */
  const desaccords = [];
  /** @type {Map<string, { couples: number, documentes: number }>} */
  const parTheme = new Map();

  for (const [cle, codeA] of a) {
    const codeB = /** @type {Code} */ (b.get(cle));
    const theme = parTheme.get(codeA.theme) ?? { couples: 0, documentes: 0 };
    theme.couples += 1;
    parTheme.set(codeA.theme, theme);

    /** @type {number | "non-couvert" | null} */
    let finale;
    if (codeA.valeur === codeB.valeur) {
      exacts += 1;
      finale = codeA.valeur;
    } else {
      const decision = reconciliation.get(cle) ?? null;
      desaccords.push({
        acteur: codeA.acteur,
        question: codeA.question,
        theme: codeA.theme,
        a: codeA.valeur,
        b: codeB.valeur,
        decision: decision?.decision ?? null,
        justification: decision?.justification ?? "",
      });
      finale = decision?.decision ?? null;
    }
    if (typeof codeA.valeur === "number" && typeof codeB.valeur === "number") {
      numeriques += 1;
      if (Math.abs(codeA.valeur - codeB.valeur) <= 1) unNiveau += 1;
    }
    if (typeof finale === "number") theme.documentes += 1;
  }

  const couples = a.size;
  return {
    couples,
    accordExact: couples === 0 ? 0 : exacts / couples,
    couplesNumeriques: numeriques,
    accordUnNiveau: numeriques === 0 ? 0 : unNiveau / numeriques,
    desaccords: desaccords.length,
    desaccordsNonResolus: desaccords.filter((d) => d.decision === null).length,
    couvertureParTheme: [...parTheme].map(([theme, t]) => ({ theme, ...t })),
    liste: desaccords,
    acteurs: new Set([...a.values()].map((c) => c.acteur)).size,
  };
}

/**
 * @param {Record<string, string>[]} lignes
 * @returns {Map<string, { decision: number | "non-couvert" | null, justification: string }>}
 */
export function lireReconciliation(lignes) {
  return new Map(
    lignes.map((ligne) => {
      const brut = (ligne["decision"] ?? "").trim();
      const decision = brut === "" || brut.toLowerCase() === "non-resolu" ? null : lireValeur(brut);
      return [
        `${ligne["acteur_id"]}|${ligne["question_id"]}`,
        { decision, justification: ligne["justification"] ?? "" },
      ];
    }),
  );
}

/* ─── Préparation ────────────────────────────────────────────────────────── */

/** Générateur pseudo-aléatoire à graine (mulberry32) : un échantillon se refait. */
/** @param {number} graine */
function aleatoire(graine) {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lignes de la feuille vierge et, si demandé, du relevé A tiré du codage publié.
 *
 * Les acteurs retenus sont ceux qui ont au moins une position PROPRE publiée :
 * ce sont leurs documents qu'on relit. Les reprises de parti ne sont pas
 * recodées sur le candidat — elles le sont sur le parti.
 *
 * @param {any} donnees export JSON publié
 * @param {{ echantillon?: number | null, graine?: number }} options
 */
export function preparerFeuille(donnees, { echantillon = null, graine = 20270418 } = {}) {
  const rangParCle = new Map(
    donnees.chaineDeResolution.map((/** @type {any} */ n) => [n.cle, n.rang]),
  );
  const sourceParId = new Map(donnees.sourcesPositions.map((/** @type {any} */ s) => [s.id, s]));
  const nomParId = new Map(donnees.acteurs.map((/** @type {any} */ a) => [a.id, a.name]));

  /** @type {Map<string, any[]>} */
  const positionsParActeur = new Map();
  for (const position of donnees.positions) {
    positionsParActeur.set(position.actorId, [
      ...(positionsParActeur.get(position.actorId) ?? []),
      position,
    ]);
  }
  let acteurs = [...positionsParActeur.keys()].sort();
  if (echantillon !== null && echantillon < acteurs.length) {
    const tirage = aleatoire(graine);
    acteurs = acteurs
      .map((id) => ({ id, cle: tirage() }))
      .sort((x, y) => x.cle - y.cle)
      .slice(0, echantillon)
      .map((x) => x.id)
      .sort();
  }

  const vierge = [];
  const codeurA = [];
  for (const acteur of acteurs) {
    const positions = positionsParActeur.get(acteur) ?? [];
    const documents = [...new Set(positions.flatMap((p) => p.sourceIds))]
      .map((id) => sourceParId.get(id))
      .filter(Boolean)
      .sort((x, y) => x.dateDeclaration.localeCompare(y.dateDeclaration))
      .map((s) => `${s.titre} (${s.dateDeclaration}) ${s.url}`)
      .join(" | ");
    for (const question of donnees.questions) {
      const base = [
        acteur,
        nomParId.get(acteur) ?? acteur,
        question.id,
        question.theme,
        question.texte,
        documents,
      ];
      vierge.push([...base, "", "", "", ""]);
      const retenue = positions
        .filter((p) => p.questionId === question.id)
        .sort(
          (x, y) =>
            (rangParCle.get(x.provenance) ?? 99) - (rangParCle.get(y.provenance) ?? 99) ||
            y.updatedAt.localeCompare(x.updatedAt),
        )[0];
      codeurA.push(
        retenue
          ? [...base, String(retenue.value), retenue.adequation, retenue.citation, "codage publié"]
          : [...base, NON_COUVERT, "", "", "codage publié"],
      );
    }
  }
  return { acteurs, vierge, codeurA };
}

/* ─── Entrées-sorties ────────────────────────────────────────────────────── */

/** @param {string} chemin */
async function empreinteFichier(chemin) {
  return createHash("sha256")
    .update(await readFile(chemin))
    .digest("hex");
}

/** @param {string} fichier */
async function verrouille(fichier) {
  const relatif = path.relative(RACINE, path.resolve(fichier));
  try {
    await executer("git", ["ls-files", "--error-unmatch", relatif], { cwd: RACINE });
    await executer("git", ["diff", "--quiet", "HEAD", "--", relatif], { cwd: RACINE });
    return true;
  } catch {
    return false;
  }
}

function jourParis() {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(new Date());
}

/** @param {string[]} args @param {string} nom */
function option(args, nom) {
  const i = args.indexOf(nom);
  return i >= 0 ? (args[i + 1] ?? null) : null;
}

/** @param {string[]} args */
async function commandePreparer(args) {
  const { versCsv } = await import(pathToFileURL(path.join(RACINE, "src/lib/csv.ts")).href);
  let donnees;
  try {
    donnees = JSON.parse(
      await readFile(path.join(RACINE, "dist/donnees/guide-isoloir-2027.json"), "utf8"),
    );
  } catch {
    console.error(
      "dist/donnees/guide-isoloir-2027.json est introuvable. Lancez `npm run build:prod`.",
    );
    return 1;
  }
  const echantillon = option(args, "--echantillon");
  const graine = option(args, "--graine");
  const { acteurs, vierge, codeurA } = preparerFeuille(donnees, {
    echantillon: echantillon === null ? null : Number(echantillon),
    graine: graine === null ? 20270418 : Number(graine),
  });

  const campagne = jourParis();
  const dossier = path.join(RACINE, "data/double-codage", campagne);
  await mkdir(dossier, { recursive: true });
  await writeFile(path.join(dossier, "feuille-vierge.csv"), versCsv(COLONNES, vierge));
  if (args.includes("--codeur-a-publie"))
    await writeFile(path.join(dossier, "codeur-a.csv"), versCsv(COLONNES, codeurA));
  const { stdout: commit } = await executer("git", ["rev-parse", "--short", "HEAD"], {
    cwd: RACINE,
  });

  console.log(
    [
      `Campagne ${campagne} : ${acteurs.length} acteurs, ${vierge.length} couples, données du ${donnees.misAJour}, commit ${commit.trim()}.`,
      "",
      `1. Chaque codeur copie feuille-vierge.csv en codeur-a.csv ou codeur-b.csv dans ${path.relative(RACINE, dossier)}/,`,
      "   lit les documents de chaque ligne et remplit valeur (-2 à 2, ou non-couvert), adequation, citation.",
      "   Les deux ne se parlent pas et ne regardent pas le site pendant le codage.",
      "2. Chacun commite son fichier SEUL, avant de voir l'autre : le commit est le verrou.",
      "3. node scripts/double-codage.mjs comparer <a> <b> écrit le rapport et la liste des désaccords.",
      "4. Les désaccords se tranchent en revenant à la source, dans reconciliation.csv",
      "   (acteur_id, question_id, decision, justification), commité lui aussi.",
      '5. comparer … reconciliation.csv --publier --codeurs "…" publie la campagne sur /methodologie.',
    ].join("\n"),
  );
  return 0;
}

/** @param {string[]} args */
async function commandeComparer(args) {
  const fichiers = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--codeurs");
  const [fichierA, fichierB, fichierReconciliation] = fichiers;
  if (!fichierA || !fichierB) {
    console.error(
      'Usage : comparer <a.csv> <b.csv> [reconciliation.csv] [--publier --codeurs "…"] [--essai]',
    );
    return 2;
  }
  const essai = args.includes("--essai");
  const publier = args.includes("--publier");
  if (essai && publier) {
    console.error("--essai lève le verrou : une campagne non verrouillée ne se publie pas.");
    return 2;
  }
  if (!essai) {
    for (const fichier of [fichierA, fichierB, fichierReconciliation].filter(Boolean)) {
      if (!(await verrouille(/** @type {string} */ (fichier)))) {
        console.error(
          `${fichier} n'est pas commité, ou a changé depuis son commit. Le commit est le verrou : commitez-le d'abord.`,
        );
        return 1;
      }
    }
  }

  const a = lireCodage(lireCsv(await readFile(fichierA, "utf8")), path.basename(fichierA));
  const b = lireCodage(lireCsv(await readFile(fichierB, "utf8")), path.basename(fichierB));
  const reconciliation = fichierReconciliation
    ? lireReconciliation(lireCsv(await readFile(fichierReconciliation, "utf8")))
    : new Map();
  const resultat = confronter(a, b, reconciliation);

  const pourcent = (/** @type {number} */ t) =>
    `${(100 * t).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
  const dossier = path.dirname(path.resolve(fichierA));
  const lignes = [
    `# Double codage — campagne ${path.basename(dossier)}`,
    "",
    essai ? "**ESSAI : fichiers non verrouillés, résultat non publiable.**\n" : "",
    `- Acteurs : ${resultat.acteurs} · couples : ${resultat.couples}`,
    `- Accord exact : ${pourcent(resultat.accordExact)} (${resultat.couples} couples)`,
    `- Accord à un niveau près : ${pourcent(resultat.accordUnNiveau)} (${resultat.couplesNumeriques} couples chiffrés par les deux)`,
    `- Désaccords : ${resultat.desaccords}, dont ${resultat.desaccordsNonResolus} non résolus`,
    `- Relevé A : ${path.basename(fichierA)} — sha256 ${await empreinteFichier(fichierA)}`,
    `- Relevé B : ${path.basename(fichierB)} — sha256 ${await empreinteFichier(fichierB)}`,
    "",
    "## Couverture par thème après réconciliation",
    "",
    "| Thème | Couples documentés |",
    "| --- | --- |",
    ...resultat.couvertureParTheme.map((t) => `| ${t.theme} | ${t.documentes} sur ${t.couples} |`),
    "",
    "## Désaccords",
    "",
    "| Acteur | Affirmation | A | B | Décision | Justification |",
    "| --- | --- | --- | --- | --- | --- |",
    ...resultat.liste.map(
      (d) =>
        `| ${d.acteur} | ${d.question} | ${d.a} | ${d.b} | ${d.decision ?? "non résolu"} | ${d.justification.replaceAll("|", "/")} |`,
    ),
    "",
  ];
  const rapport = path.join(dossier, "rapport.md");
  await writeFile(rapport, lignes.filter((l, i) => l !== "" || lignes[i - 1] !== "").join("\n"));
  console.log(lignes.slice(2, 8).join("\n"));
  console.log(`\nRapport : ${path.relative(RACINE, rapport)}`);

  if (publier) {
    const codeurs = option(args, "--codeurs");
    if (codeurs === null || codeurs.length < 20) {
      console.error(
        '--publier exige --codeurs "…" : qui a codé quoi, en une ou deux phrases, tel que la page l\'affichera.',
      );
      return 2;
    }
    const { stdout: commit } = await executer("git", ["rev-parse", "HEAD"], { cwd: RACINE });
    const chemin = path.join(RACINE, "src/data/double-codage.json");
    const campagnes = JSON.parse(await readFile(chemin, "utf8"));
    campagnes.push({
      campagne: path.basename(dossier),
      date: jourParis(),
      codeurs,
      acteurs: resultat.acteurs,
      couples: resultat.couples,
      accordExact: Number(resultat.accordExact.toFixed(4)),
      couplesNumeriques: resultat.couplesNumeriques,
      accordUnNiveau: Number(resultat.accordUnNiveau.toFixed(4)),
      desaccords: resultat.desaccords,
      desaccordsNonResolus: resultat.desaccordsNonResolus,
      couvertureParTheme: resultat.couvertureParTheme,
      empreintes: { a: await empreinteFichier(fichierA), b: await empreinteFichier(fichierB) },
      commit: commit.trim(),
      rapport: path.relative(RACINE, rapport),
    });
    const prettier = await import("prettier");
    const options = (await prettier.resolveConfig(chemin)) ?? {};
    await writeFile(
      chemin,
      await prettier.format(JSON.stringify(campagnes), { ...options, filepath: chemin }),
    );
    console.log(
      `Campagne publiée dans src/data/double-codage.json. Lancez npm run build:prod, puis commitez.`,
    );
  }
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [nom, ...args] = process.argv.slice(2);
  const commandes = /** @type {Record<string, (a: string[]) => Promise<number>>} */ ({
    preparer: commandePreparer,
    comparer: commandeComparer,
  });
  const commande = nom === undefined ? undefined : commandes[nom];
  if (commande === undefined) {
    console.error("Sous-commandes : preparer, comparer");
    process.exit(2);
  }
  try {
    process.exit(await commande(args));
  } catch (erreur) {
    console.error(erreur instanceof Error ? erreur.message : erreur);
    process.exit(1);
  }
}
