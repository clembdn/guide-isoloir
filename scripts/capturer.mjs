/*
 * MESURE DES CONTRASTES SUR LES VALEURS RÉELLEMENT APPLIQUÉES.
 *
 * DESIGN_SYSTEM.md §9 fait des « contrastes recalculés sur les valeurs
 * appliquées, pas estimés » une condition de toute modification du système, et
 * §2 affirme que les tables de couleur sont mesurées par ce script. Le script
 * n'existait pas : l'affirmation était déclarative. Ce fichier la rend
 * exécutable.
 *
 * CE QU'IL FAIT, ET POURQUOI IL LE FAIT AINSI
 *
 * Il n'ouvre pas les jetons CSS, il ouvre les PAGES. Un jeton juste ne garantit
 * rien : ce qui casse un contraste, c'est un texte gris posé sur un aplat, un
 * jeton redéfini dans un composant, ou une couleur héritée d'un parent qu'on
 * n'avait pas en tête. Seul `getComputedStyle` sur l'élément réel le dit.
 *
 * Le fond effectif est cherché en REMONTANT les ancêtres jusqu'au premier fond
 * non transparent, parce qu'un élément n'a presque jamais de fond propre. Les
 * fonds semi-transparents sont composités sur ce qu'ils recouvrent.
 *
 * Les deux schémas sont mesurés via `page.emulateMedia({ colorScheme })` : le
 * mode sombre n'est pas une variante décorative, c'est la moitié des rendus.
 *
 * SEUILS
 *   - Texte : 4,5:1. Abaissé à 3:1 pour le grand texte, au sens WCAG — au
 *     moins 24 px, ou au moins 18,66 px en graisse 700 et plus. Le seuil
 *     retenu pour chaque élément est imprimé, pour qu'aucune indulgence ne
 *     s'applique en silence.
 *   - Filets : 1,5:1. Ce n'est PAS une exigence WCAG — la règle des 3:1 vise
 *     les composants d'interface, pas les séparateurs, dont l'espacement porte
 *     déjà le groupement. C'est un plancher local : en dessous, un filet
 *     disparaît sur un écran d'entrée de gamme en plein jour.
 *
 * USAGE
 *   node scripts/capturer.mjs               mesure, rapporte, code 0
 *   node scripts/capturer.mjs --strict      code 1 si un seuil est franchi
 *   node scripts/capturer.mjs --base URL    mesure un serveur déjà en écoute
 *
 * Sans `--base`, le script construit et sert `dist/` lui-même, comme le fait
 * Playwright : ce qui est mesuré est ce qui serait déployé, jamais le serveur
 * de développement.
 *
 * AUCUNE DÉPENDANCE AJOUTÉE : Playwright est déjà installé pour l'E2E.
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const STRICT = process.argv.includes("--strict");
const baseArg = process.argv.indexOf("--base");
const BASE_EXTERNE = baseArg !== -1 ? process.argv[baseArg + 1] : null;

/* Port distinct de 4321 (astro dev) et de 4331 (Playwright) : trois outils qui
   servent des choses différentes ne doivent jamais se marcher dessus. */
const PORT = 4341;
const RACINE = fileURLToPath(new URL("..", import.meta.url));

/*
 * Les routes mesurées. `/resultat` y figure alors qu'elle est en noindex : ce
 * sont ses barres et ses scores qui portent le plus de couleur du site.
 */
const ROUTES = [
  { chemin: "/", nom: "Accueil" },
  { chemin: "/test", nom: "Test" },
  { chemin: "/resultat", nom: "Résultat" },
  { chemin: "/methodologie", nom: "Méthodologie" },
  { chemin: "/comprendre", nom: "Comprendre" },
  { chemin: "/a-propos", nom: "À propos" },
  { chemin: "/financement", nom: "Financement" },
];

const SEUIL_TEXTE = 4.5;
const SEUIL_GRAND_TEXTE = 3;
const SEUIL_FILET = 1.5;

/* ── Couleur ─────────────────────────────────────────────────────────────── */

/**
 * `rgb()`, `rgba()` ou `color(srgb …)` → [r, g, b, a], canaux sur 0-255.
 *
 * LE CAS `color(srgb …)` N'EST PAS THÉORIQUE. L'en-tête collant emploie
 * `color-mix(in srgb, …)`, que Chromium sérialise en
 * `color(srgb 0.07 0.06 0.11 / 0.84)` — des flottants de 0 à 1, pas des
 * entiers de 0 à 255. La première version ne lisait que `rgb()`, renvoyait
 * `null`, et la mesure retombait alors sur un fond blanc par défaut : elle
 * annonçait 1,2:1 sur des couples parfaitement lisibles. Une mesure fausse est
 * pire qu'une mesure absente, puisqu'on la croit.
 */
function lireRgb(valeur) {
  const texte = String(valeur);

  const srgb = texte.match(/color\(\s*srgb\s+([^)]+)\)/i);
  if (srgb) {
    const parts = srgb[1]
      .split(/[\s/]+/)
      .filter(Boolean)
      .map(Number);
    const [r, g, b] = parts;
    const a = parts.length > 3 ? parts[3] : 1;
    if ([r, g, b].some((v) => !Number.isFinite(v))) return null;
    return [r * 255, g * 255, b * 255, Number.isFinite(a) ? a : 1];
  }

  const m = texte.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(Number);
  const [r, g, b] = parts;
  const a = parts.length > 3 ? parts[3] : 1;
  if ([r, g, b].some((v) => !Number.isFinite(v))) return null;
  return [r, g, b, Number.isFinite(a) ? a : 1];
}

/** Composite une couleur semi-transparente sur un fond opaque. */
function composer([r, g, b, a], [fr, fg, fb]) {
  return [r * a + fr * (1 - a), g * a + fg * (1 - a), b * a + fb * (1 - a), 1];
}

function luminance([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contraste(avant, arriere) {
  const la = luminance(avant);
  const lb = luminance(arriere);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function enHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

const format = (n) => n.toFixed(1).replace(".", ",") + ":1";

/* ── Relevé dans la page ─────────────────────────────────────────────────── */

/*
 * Exécuté DANS le navigateur. Il ne calcule aucun contraste : il ne fait que
 * relever des couleurs appliquées. Le calcul reste côté Node, où il est
 * testable et où une erreur se voit.
 */
function releverDansLaPage() {
  /* `rgba(… , 0)` et `color(srgb … / 0)` : les deux écritures du transparent. */
  const TRANSPARENT = /rgba?\([^)]*,\s*0\s*\)|color\([^)]*\/\s*0\s*\)/;

  /** Premier fond non transparent en remontant les ancêtres, composités inclus. */
  function fondEffectif(element) {
    const couches = [];
    let noeud = element;
    while (noeud && noeud.nodeType === 1) {
      const fond = getComputedStyle(noeud).backgroundColor;
      if (fond && fond !== "transparent" && !TRANSPARENT.test(fond)) {
        couches.push(fond);
        const aUneAlpha = /rgba\(/.test(fond) || /color\([^)]*\//.test(fond);
        const opaque = !aUneAlpha || /rgba\([^)]*,\s*1\s*\)|color\([^)]*\/\s*1\s*\)/.test(fond);
        if (opaque) break;
      }
      noeud = noeud.parentElement;
    }
    if (couches.length === 0) couches.push(getComputedStyle(document.body).backgroundColor);
    return couches;
  }

  /** Un élément porte-t-il du texte à lui, et est-il visible ? */
  function texteVisible(element) {
    const style = getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none") return false;
    if (Number(style.opacity) === 0) return false;
    const boite = element.getBoundingClientRect();
    if (boite.width < 1 || boite.height < 1) return false;
    /* Lien d'évitement : hors écran tant qu'il n'a pas le focus. */
    if (boite.right < 0 || boite.bottom < 0) return false;
    return [...element.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
  }

  const textes = [];
  const filets = [];
  const vus = new Set();

  for (const element of document.querySelectorAll("body *")) {
    const style = getComputedStyle(element);

    if (texteVisible(element)) {
      const taille = parseFloat(style.fontSize);
      const graisse = Number(style.fontWeight) || 400;
      const cle = [style.color, fondEffectif(element).join("|"), Math.round(taille), graisse].join(
        "~",
      );
      if (!vus.has(cle)) {
        vus.add(cle);
        textes.push({
          selecteur:
            element.tagName.toLowerCase() +
            (element.className && typeof element.className === "string"
              ? "." + element.className.trim().split(/\s+/).join(".")
              : ""),
          couleur: style.color,
          couches: fondEffectif(element),
          taille,
          graisse,
          extrait: element.textContent.trim().slice(0, 48),
        });
      }
    }

    /* Filets : une bordure visible, ou le fond d'un élément de 1 à 4 px de haut. */
    for (const cote of ["Top", "Right", "Bottom", "Left"]) {
      const largeur = parseFloat(style[`border${cote}Width`]);
      const type = style[`border${cote}Style`];
      if (largeur > 0 && type !== "none" && type !== "hidden") {
        const couleur = style[`border${cote}Color`];
        if (TRANSPARENT.test(couleur)) continue;
        const cle = "f~" + couleur + "~" + fondEffectif(element.parentElement ?? element).join("|");
        if (vus.has(cle)) continue;
        vus.add(cle);
        filets.push({
          selecteur:
            element.tagName.toLowerCase() +
            (element.className && typeof element.className === "string"
              ? "." + element.className.trim().split(/\s+/).join(".")
              : "") +
            ` (border-${cote.toLowerCase()})`,
          couleur,
          couches: fondEffectif(element.parentElement ?? element),
        });
      }
    }
  }

  /*
   * Les barres de score sont des <rect> SVG : leur couleur est dans `fill`, pas
   * dans `color`. Elles ne sont pas du texte, mais elles PORTENT DU SENS — la
   * longueur d'une barre est l'information. Elles sont relevées à part.
   */
  const objets = [];
  for (const rect of document.querySelectorAll("svg rect, svg path, svg circle")) {
    const style = getComputedStyle(rect);
    const remplissage = style.fill;
    if (!remplissage || TRANSPARENT.test(remplissage) || remplissage === "none") continue;
    const cle = "o~" + remplissage + "~" + fondEffectif(rect.parentElement).join("|");
    if (vus.has(cle)) continue;
    vus.add(cle);
    objets.push({
      selecteur: (rect.getAttribute("class") || rect.tagName).toString(),
      couleur: remplissage,
      couches: fondEffectif(rect.parentElement),
    });
  }

  return { textes, filets, objets };
}

/* ── Calcul et rapport ───────────────────────────────────────────────────── */

/** Aplatit les couches de fond relevées en une seule couleur opaque. */
function fondOpaque(couches) {
  let resultat = null;
  for (let i = couches.length - 1; i >= 0; i--) {
    const c = lireRgb(couches[i]);
    if (!c) continue;
    resultat = resultat === null ? [c[0], c[1], c[2], 1] : composer(c, resultat);
  }
  return resultat ?? [255, 255, 255, 1];
}

/** Seuil WCAG applicable : 3:1 si le texte est « grand », 4,5:1 sinon. */
function seuilPour(taille, graisse) {
  const grand = taille >= 24 || (taille >= 18.66 && graisse >= 700);
  return grand ? SEUIL_GRAND_TEXTE : SEUIL_TEXTE;
}

const fautes = [];
const mesures = [];

async function mesurer(page, route, schema) {
  const { textes, filets, objets } = await page.evaluate(releverDansLaPage);

  for (const t of textes) {
    const avant = lireRgb(t.couleur);
    if (!avant) continue;
    const arriere = fondOpaque(t.couches);
    const avantCompose = avant[3] < 1 ? composer(avant, arriere) : avant;
    const ratio = contraste(avantCompose, arriere);
    const seuil = seuilPour(t.taille, t.graisse);
    const mesure = {
      route: route.nom,
      schema,
      genre: "texte",
      selecteur: t.selecteur,
      avant: enHex(avantCompose),
      arriere: enHex(arriere),
      ratio,
      seuil,
      extrait: t.extrait,
    };
    mesures.push(mesure);
    if (ratio < seuil) fautes.push(mesure);
  }

  for (const f of filets) {
    const avant = lireRgb(f.couleur);
    if (!avant) continue;
    const arriere = fondOpaque(f.couches);
    const avantCompose = avant[3] < 1 ? composer(avant, arriere) : avant;
    const ratio = contraste(avantCompose, arriere);
    const mesure = {
      route: route.nom,
      schema,
      genre: "filet",
      selecteur: f.selecteur,
      avant: enHex(avantCompose),
      arriere: enHex(arriere),
      ratio,
      seuil: SEUIL_FILET,
      extrait: "",
    };
    mesures.push(mesure);
    if (ratio < SEUIL_FILET) fautes.push(mesure);
  }

  for (const o of objets) {
    const avant = lireRgb(o.couleur);
    if (!avant) continue;
    const arriere = fondOpaque(o.couches);
    const avantCompose = avant[3] < 1 ? composer(avant, arriere) : avant;
    const ratio = contraste(avantCompose, arriere);
    /* Un objet graphique porteur de sens : même plancher qu'un filet. La barre
       de score est lue par sa LONGUEUR, pas par sa couleur — c'est pour cela
       qu'on ne lui impose pas 3:1. */
    const mesure = {
      route: route.nom,
      schema,
      genre: "objet",
      selecteur: o.selecteur,
      avant: enHex(avantCompose),
      arriere: enHex(arriere),
      ratio,
      seuil: SEUIL_FILET,
      extrait: "",
    };
    mesures.push(mesure);
    if (ratio < SEUIL_FILET) fautes.push(mesure);
  }
}

/* ── Serveur ─────────────────────────────────────────────────────────────── */

async function attendre(url, delaiMs = 120_000) {
  const fin = Date.now() + delaiMs;
  while (Date.now() < fin) {
    try {
      const r = await fetch(url, { method: "HEAD" });
      if (r.ok || r.status === 404) return true;
    } catch {
      /* pas encore en écoute */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

let serveur = null;
let BASE = BASE_EXTERNE;

if (!BASE) {
  BASE = `http://127.0.0.1:${PORT}`;
  console.log("Construction et service de dist/ …");
  await new Promise((resolve, reject) => {
    const build = spawn("npm", ["run", "build"], { cwd: RACINE, stdio: "inherit" });
    build.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("build échoué"))));
  });
  serveur = spawn("node", ["scripts/serveur-statique.mjs", String(PORT)], {
    cwd: RACINE,
    stdio: "ignore",
  });
  if (!(await attendre(BASE))) {
    serveur.kill();
    throw new Error(`le serveur statique n'a pas démarré sur ${BASE}`);
  }
}

/* ── Passage ─────────────────────────────────────────────────────────────── */

const navigateur = await chromium.launch();
try {
  for (const schema of ["light", "dark"]) {
    for (const route of ROUTES) {
      const page = await navigateur.newPage({ viewport: { width: 375, height: 667 } });
      await page.emulateMedia({ colorScheme: schema });
      const reponse = await page.goto(BASE + route.chemin, { waitUntil: "networkidle" });
      if (!reponse || !reponse.ok()) {
        console.warn(`  route absente, ignorée : ${route.chemin}`);
        await page.close();
        continue;
      }
      await mesurer(page, route, schema);
      await page.close();
    }
  }
} finally {
  await navigateur.close();
  if (serveur) serveur.kill();
}

/* ── Rapport ─────────────────────────────────────────────────────────────── */

/* Table prête à coller dans DESIGN_SYSTEM.md : une ligne par couple distinct. */
function tableMarkdown(schema) {
  const vus = new Map();
  for (const m of mesures.filter((x) => x.schema === schema && x.genre !== "objet")) {
    const cle = `${m.avant}~${m.arriere}~${m.genre}`;
    if (!vus.has(cle) || vus.get(cle).ratio > m.ratio) vus.set(cle, m);
  }
  const lignes = [...vus.values()].sort((a, b) => a.ratio - b.ratio);
  return [
    "| Avant-plan | Fond | Genre | Contraste mesuré | Seuil |",
    "| ---------- | ---- | ----- | ---------------- | ----- |",
    ...lignes.map(
      (m) =>
        `| \`${m.avant}\` | \`${m.arriere}\` | ${m.genre} | ${format(m.ratio)} | ${format(m.seuil)} |`,
    ),
  ].join("\n");
}

console.log(`\n${mesures.length} couples mesurés sur ${ROUTES.length} routes, deux schémas.\n`);
console.log("### Clair\n");
console.log(tableMarkdown("light"));
console.log("\n### Sombre\n");
console.log(tableMarkdown("dark"));

if (fautes.length === 0) {
  console.log("\nAucun couple sous son seuil.");
  process.exit(0);
}

console.error(`\n${fautes.length} couple(s) sous le seuil :\n`);
for (const f of fautes) {
  console.error(
    `  [${f.schema}] ${f.route} — ${f.genre} ${f.selecteur}\n` +
      `      ${f.avant} sur ${f.arriere} = ${format(f.ratio)}, seuil ${format(f.seuil)}` +
      (f.extrait ? `\n      « ${f.extrait} »` : ""),
  );
}
process.exit(STRICT ? 1 : 0);
