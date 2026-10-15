/*
 * Images du README de GitHub, dans les deux schémas du site.
 *
 *   npm run build && node scripts/generer-readme.mjs
 *
 * GitHub ne charge ni feuille de style ni police dans un README : tout ce qui
 * doit ressembler au site y entre comme image. Ce script compose chaque image
 * en HTML, avec les jetons de `src/styles/base.css` et la police du site lue
 * sur le disque, puis la photographie — en clair, puis en sombre. Le README les
 * sert par un `<picture>` qui suit le schéma du lecteur.
 *
 * Les captures d'écran viennent du site CONSTRUIT (`dist/`), servi le temps du
 * script par `scripts/serveur-statique.mjs` : elles montrent ce qui est déployé.
 * Aucun portrait n'y figure. Un écran qui montrerait quelques visages
 * choisirait des candidats, et chaque portrait exige son crédit.
 *
 * Aucune donnée politique n'est écrite ici : ni nom, ni position, ni chiffre
 * qui vieillirait pendant la campagne. Les captures, elles, vieillissent :
 * refaire ce script les remet à jour.
 *
 * Toutes les sorties sont versionnées dans `.github/readme/`.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIE = ".github/readme";
const PORT = 4398;

/* Jetons recopiés de src/styles/base.css et DESIGN_SYSTEM.md §2, dans les deux schémas. */
const SCHEMAS = {
  clair: {
    fond: "#fbfaff",
    surface: "#ffffff",
    surface2: "#f3f0fd",
    encre: "#171426",
    encreFaible: "#5b5772",
    trait: "#cec8e2",
    signature: "#5321d6",
    surSignature: "#ffffff",
    pastel: "#efe7fe",
    halo: `radial-gradient(48% 52% at 14% 18%, rgb(124 58 237 / 0.2), transparent 70%),
      radial-gradient(42% 48% at 86% 8%, rgb(14 116 144 / 0.16), transparent 70%),
      radial-gradient(40% 50% at 62% 70%, rgb(162 28 175 / 0.12), transparent 72%)`,
    ombre: "0 2px 4px rgb(23 20 38 / 0.05), 0 18px 40px -18px rgb(83 33 214 / 0.34)",
  },
  sombre: {
    fond: "#12101c",
    surface: "#1b1830",
    surface2: "#211d39",
    encre: "#eceaf7",
    encreFaible: "#a7a2bd",
    trait: "#413a64",
    signature: "#b49cf5",
    surSignature: "#17122b",
    pastel: "#271f45",
    halo: `radial-gradient(48% 52% at 14% 18%, rgb(124 58 237 / 0.26), transparent 70%),
      radial-gradient(42% 48% at 86% 8%, rgb(14 116 144 / 0.2), transparent 70%),
      radial-gradient(40% 50% at 62% 70%, rgb(162 28 175 / 0.16), transparent 72%)`,
    ombre: "0 18px 40px -18px rgb(0 0 0 / 0.7)",
  },
};

/** Retire le commentaire de tête du maître : il documente le dessin, il ne se rend pas. */
async function marque(fichier) {
  const brut = await readFile(join(RACINE, "src/marque", fichier), "utf8");
  return brut.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
}

const [bloc, police] = await Promise.all([
  marque("guide-isoloir.svg"),
  readFile(join(RACINE, "src/polices/bricolage-grotesque-latin.woff2")).then((f) =>
    f.toString("base64"),
  ),
]);

/* Pictogrammes au trait, 24 unités, dessinés ici : aucune bibliothèque. */
const PICTOS = {
  livre: `<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>`,
  boussole: `<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>`,
  balance: `<path d="M12 3v18M7 21h10M5 7h14"/><path d="m5 7-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>`,
  urne: `<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M8 10V4h8v6M9 15h6"/>`,
  citation: `<path d="M7 7h4v5c0 3-1.5 4.5-4 5M14 7h4v5c0 3-1.5 4.5-4 5"/>`,
  jauge: `<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 3.5-5"/>`,
  sansPub: `<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>`,
  ouvert: `<path d="m8 8-5 4 5 4M16 8l5 4-5 4M13.5 5l-3 14"/>`,
  ecran: `<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>`,
  serveur: `<rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.01M8 16.5h.01"/>`,
};

function picto(nom, taille = 24) {
  return `<svg class="picto" width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PICTOS[nom]}</svg>`;
}

function feuille(s) {
  return `
  @font-face {
    font-family: "Bricolage Grotesque";
    font-weight: 400 700;
    font-style: normal;
    src: url(data:font/woff2;base64,${police}) format("woff2");
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Bricolage Grotesque", sans-serif;
    background: ${s.fond}; color: ${s.encre};
    -webkit-font-smoothing: antialiased;
  }
  .cadre { width: 1000px; padding: 56px 64px; }
  .surtitre { color: ${s.signature}; font-weight: 700; font-size: 17px; }
  h1, h2 { font-weight: 700; letter-spacing: -0.035em; line-height: 1.02; }
  h2 { font-size: 40px; margin-top: 8px; }
  .chapo { color: ${s.encreFaible}; font-size: 19px; line-height: 1.5; margin-top: 12px; max-width: 640px; }
  .carte {
    background: ${s.surface}; border: 1px solid ${s.trait};
    border-radius: 18px; box-shadow: ${s.ombre};
  }
  .pastille {
    display: inline-flex; align-items: center; justify-content: center;
    width: 48px; height: 48px; border-radius: 14px;
    background: ${s.pastel}; color: ${s.signature};
  }
  .adresse { color: ${s.signature}; font-weight: 700; font-size: 15px; }
  .signe { fill: ${s.signature}; }
`;
}

/* ---------- 1. Accroche : la promesse, deux écrans réels ---------- */

function pageAccroche(s, ecrans) {
  return `<!doctype html><meta charset="utf-8"><style>${feuille(s)}
  body { background: ${s.halo}, ${s.fond}; }
  .cadre { display: grid; grid-template-columns: 1fr 400px; gap: 24px; align-items: center; padding-block: 52px 0; }
  .texte { padding-bottom: 52px; }
  .marque svg { width: 210px; height: auto; display: block; }
  .marque svg path { fill: ${s.signature}; }
  .surtitre { margin-top: 40px; }
  h1 { font-size: 62px; margin-top: 10px; }
  .chapo { max-width: 440px; }
  .action {
    display: inline-block; margin-top: 28px; padding: 15px 30px; border-radius: 999px;
    background: ${s.signature}; color: ${s.surSignature}; font-weight: 700; font-size: 19px;
    box-shadow: ${s.ombre};
  }
  .dates { margin-top: 20px; color: ${s.encreFaible}; font-size: 15px; }
  sup { font-size: 0.62em; line-height: 0; vertical-align: 0.5em; }
  .telephones { position: relative; height: 470px; align-self: end; overflow: hidden; }
  .telephone {
    position: absolute; width: 214px; border-radius: 30px; overflow: hidden;
    border: 6px solid ${s.surface}; outline: 1px solid ${s.trait}; box-shadow: ${s.ombre};
    background: ${s.fond};
  }
  .telephone img { display: block; width: 100%; }
  .t1 { left: 0; top: 24px; }
  .t2 { left: 176px; top: 84px; }
</style>
<div class="cadre">
  <div class="texte">
    <div class="marque">${bloc}</div>
    <p class="surtitre">Présidentielle 2027</p>
    <h1>Le parcours d’entrée dans l’élection.</h1>
    <p class="chapo">Pour qui voter, comment voter, et ce qu’un président peut vraiment décider. Gratuit, sans publicité, sans inscription.</p>
    <span class="action">guide-isoloir.fr</span>
    <p class="dates">1<sup>er</sup> tour le 18 avril 2027 · 2<sup>nd</sup> tour le 2 mai 2027</p>
  </div>
  <div class="telephones">
    <div class="telephone t1"><img src="${ecrans[0]}" alt=""></div>
    <div class="telephone t2"><img src="${ecrans[1]}" alt=""></div>
  </div>
</div>`;
}

/* ---------- 2. Parcours : quatre étapes ---------- */

const ETAPES = [
  {
    picto: "livre",
    titre: "Comprendre",
    texte: "Ce qu’un président décide seul, le parrainage, l’inscription.",
    adresse: "/comprendre",
  },
  {
    picto: "boussole",
    titre: "Se situer",
    texte: "24 affirmations, une par écran. Le calcul reste dans votre navigateur.",
    adresse: "/test",
  },
  {
    picto: "balance",
    titre: "Comparer",
    texte: "Fiches candidats, pages de thème, face-à-face.",
    adresse: "/candidats",
  },
  {
    picto: "urne",
    titre: "Voter",
    texte: "Où, quand, avec quels papiers. La procuration si vous êtes absent.",
    adresse: "/comprendre/ou-et-comment-voter",
  },
];

function pageParcours(s) {
  const fleche = `<svg class="fleche" width="28" height="16" viewBox="0 0 28 16" fill="none" stroke="${s.trait}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8h22M18 2l6 6-6 6"/></svg>`;
  const cartes = ETAPES.map(
    (e, i) => `<li class="carte">
      <div class="haut"><span class="pastille">${picto(e.picto)}</span><span class="rang">${i + 1}</span></div>
      <h3>${e.titre}</h3>
      <p>${e.texte}</p>
      <span class="adresse">${e.adresse.replaceAll("/", "/<wbr>")}</span>
    </li>`,
  ).join(fleche);
  return `<!doctype html><meta charset="utf-8"><style>${feuille(s)}
  ol { list-style: none; display: flex; align-items: stretch; gap: 10px; margin-top: 36px; }
  .fleche { align-self: center; flex: none; }
  li { flex: 1; padding: 22px 20px 20px; display: flex; flex-direction: column; }
  .haut { display: flex; justify-content: space-between; align-items: flex-start; }
  .rang { font-size: 40px; font-weight: 700; color: ${s.trait}; line-height: 1; letter-spacing: -0.04em; }
  h3 { font-size: 22px; margin-top: 18px; letter-spacing: -0.02em; }
  li p { color: ${s.encreFaible}; font-size: 15.5px; line-height: 1.45; margin-top: 6px; flex: 1; }
  .adresse { margin-top: 16px; font-size: 13.5px; }
</style>
<div class="cadre">
  <p class="surtitre">Le parcours</p>
  <h2>Quatre étapes, dans l’ordre que vous voulez.</h2>
  <ol>${cartes}</ol>
</div>`;
}

/* ---------- 3. Chaîne de résolution des sources ---------- */

const CHAINE = [
  "Programme du candidat",
  "Déclaration directe récente",
  "Entretien publié par un média",
  "Vote au Parlement",
  "Propos rapportés par la presse",
  "Plateforme de campagne ou de coalition",
  "Ligne du parti",
  "Inférence documentée",
];

function pageSources(s) {
  const marches = CHAINE.map(
    (maillon, i) =>
      `<li class="carte marche m${i}"><span class="rang">${i + 1}</span>${maillon}</li>`,
  ).join("");
  return `<!doctype html><meta charset="utf-8"><style>${feuille(s)}
  .grille { display: grid; grid-template-columns: 280px 1fr; gap: 36px; align-items: start; }
  ol { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .marche {
    display: flex; align-items: center; gap: 14px; padding: 12px 18px;
    font-size: 16.5px; font-weight: 700; border-radius: 14px; box-shadow: none; white-space: nowrap;
  }
  ${CHAINE.map((_, i) => `.m${i} { margin-left: ${i * 20}px; }`).join("\n  ")}
  .m0 { background: ${s.signature}; color: ${s.surSignature}; border-color: ${s.signature}; }
  .m0 .rang { color: ${s.surSignature}; background: transparent; border: 1.5px solid currentColor; }
  .rang {
    flex: none; width: 28px; height: 28px; border-radius: 999px; display: grid; place-items: center;
    font-size: 14px; background: ${s.pastel}; color: ${s.signature};
  }
  .inconnue {
    margin-left: ${CHAINE.length * 20}px; padding: 12px 18px; border-radius: 14px;
    border: 1.5px dashed ${s.trait}; color: ${s.encreFaible}; font-size: 16.5px; list-style: none;
  }
  .regles { margin-top: 28px; display: flex; flex-direction: column; gap: 14px; }
  .regles p { font-size: 15.5px; line-height: 1.45; color: ${s.encreFaible}; }
  .regles strong { color: ${s.encre}; display: block; font-size: 16.5px; }
</style>
<div class="cadre grille">
  <div>
    <p class="surtitre">Méthode</p>
    <h2>D’où vient une position.</h2>
    <p class="chapo">On retient la source la plus directe disponible, et elle s’affiche à l’écran.</p>
    <div class="regles">
      <p><strong>Une citation, une date.</strong>Le verbatim est recopié du document, avec la date de ce qui a été dit.</p>
      <p><strong>Une reprise est dite.</strong>Une position tirée du parti n’est jamais présentée comme celle du candidat.</p>
    </div>
  </div>
  <ol>${marches}<li class="inconnue">Sinon : position inconnue, dite telle</li></ol>
</div>`;
}

/* ---------- 4. Confidentialité : le trajet des réponses ---------- */

function pageConfidentialite(s) {
  return `<!doctype html><meta charset="utf-8"><style>${feuille(s)}
  .schema { margin-top: 36px; display: grid; grid-template-columns: 1fr 120px 1fr; align-items: center; }
  .navigateur { padding: 26px 26px 22px; border: 2px solid ${s.signature}; }
  .navigateur .titre { display: flex; align-items: center; gap: 14px; font-size: 21px; font-weight: 700; }
  .etapes { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
  .etape {
    background: ${s.surface2}; border-radius: 12px; padding: 12px 16px;
    font-size: 16px; display: flex; justify-content: space-between; gap: 12px;
  }
  .etape span:last-child { color: ${s.encreFaible}; }
  .coupure { display: flex; flex-direction: column; align-items: center; gap: 8px; color: ${s.encreFaible}; font-size: 13.5px; text-align: center; }
  .serveur { padding: 26px; color: ${s.encreFaible}; border-style: dashed; box-shadow: none; background: transparent; }
  .serveur .titre { display: flex; align-items: center; gap: 14px; font-size: 21px; font-weight: 700; }
  .serveur .pastille { background: ${s.surface2}; color: ${s.encreFaible}; }
  .serveur p { margin-top: 14px; font-size: 16px; line-height: 1.45; }
  .promesse {
    margin-top: 30px; font-size: 17px; line-height: 1.5; color: ${s.encre};
    border-left: 3px solid ${s.signature}; padding-left: 18px; max-width: 780px;
  }
</style>
<div class="cadre">
  <p class="surtitre">Confidentialité</p>
  <h2>Vos réponses restent chez vous.</h2>
  <div class="schema">
    <div class="carte navigateur">
      <div class="titre"><span class="pastille">${picto("ecran")}</span>Votre navigateur</div>
      <div class="etapes">
        <div class="etape"><span>Vos 24 réponses</span><span>mémoire de l’onglet</span></div>
        <div class="etape"><span>Le calcul</span><span>sur votre appareil</span></div>
        <div class="etape"><span>Votre résultat</span><span>effaçable d’un clic</span></div>
      </div>
    </div>
    <div class="coupure">
      <svg width="96" height="40" viewBox="0 0 96 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 20h84" stroke-dasharray="4 7"/><circle cx="48" cy="20" r="15" fill="${s.fond}"/><path d="m42 14 12 12M54 14 42 26" stroke="${s.signature}" stroke-width="2.6"/></svg>
      jamais envoyé
    </div>
    <div class="carte serveur">
      <div class="titre"><span class="pastille">${picto("serveur")}</span>Un serveur</div>
      <p>Il ne sert que les pages. Il ne reçoit ni vos réponses ni votre résultat.</p>
    </div>
  </div>
  <p class="promesse">Vos réponses et vos résultats ne sont jamais envoyés, enregistrés ou associés à un identifiant. Le calcul s’effectue exclusivement dans votre navigateur.</p>
</div>`;
}

/* ---------- 5. Preuves ---------- */

const PREUVES = [
  {
    picto: "citation",
    titre: "Chaque position citée",
    texte: "Le verbatim, sa source, et la date de ce qui a été dit.",
  },
  {
    picto: "jauge",
    titre: "L’incertitude affichée",
    texte: "Une position reprise du parti est dite comme telle.",
  },
  {
    picto: "sansPub",
    titre: "Aucune publicité",
    texte: "Jusqu’après le 2 mai 2027. Aucun script de mesure d’audience.",
  },
  {
    picto: "ouvert",
    titre: "Code et données ouverts",
    texte: "AGPL pour le code, CC BY-SA pour les données.",
  },
];

function pagePreuves(s) {
  const tuiles = PREUVES.map(
    (p) => `<li class="carte">
      <span class="pastille">${picto(p.picto)}</span>
      <h3>${p.titre}</h3>
      <p>${p.texte}</p>
    </li>`,
  ).join("");
  return `<!doctype html><meta charset="utf-8"><style>${feuille(s)}
  ul { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 32px; }
  li { padding: 22px 20px; }
  h3 { font-size: 19px; margin-top: 16px; letter-spacing: -0.02em; line-height: 1.15; }
  li p { color: ${s.encreFaible}; font-size: 15.5px; line-height: 1.45; margin-top: 8px; }
</style>
<div class="cadre">
  <p class="surtitre">Ce qui se vérifie</p>
  <h2>Pas de promesse sans preuve.</h2>
  <ul>${tuiles}</ul>
</div>`;
}

/* ---------- Photographie ---------- */

async function ecrire(destination, contenu) {
  const chemin = join(RACINE, destination);
  await writeFile(chemin, contenu);
  console.log(`${destination} — ${(contenu.length / 1024).toFixed(0)} ko`);
}

const serveur = spawn(process.execPath, [join(RACINE, "scripts/serveur-statique.mjs"), `${PORT}`], {
  stdio: "ignore",
});
const BASE = `http://localhost:${PORT}`;
for (let essai = 0; ; essai += 1) {
  try {
    await fetch(BASE);
    break;
  } catch {
    if (essai > 50)
      throw new Error("Le serveur statique ne répond pas. `npm run build` a-t-il tourné ?");
    await new Promise((r) => setTimeout(r, 100));
  }
}

const navigateur = await chromium.launch();
await mkdir(join(RACINE, SORTIE), { recursive: true });

try {
  for (const [nom, s] of Object.entries(SCHEMAS)) {
    const suffixe = nom === "clair" ? "" : "-sombre";

    /* Écrans réels, à 375 px, dans le schéma de l'image. */
    /** @type {string[]} */
    const ecrans = [];
    for (const adresse of ["/test", "/comprendre/ce-qu-un-president-decide-seul"]) {
      const page = await navigateur.newPage({
        viewport: { width: 375, height: 760 },
        deviceScaleFactor: 2,
        colorScheme: nom === "clair" ? "light" : "dark",
        reducedMotion: "reduce",
      });
      await page.goto(BASE + adresse, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const png = await page.screenshot({ type: "png" });
      ecrans.push(`data:image/png;base64,${png.toString("base64")}`);
      await page.close();
    }

    const images = {
      accroche: pageAccroche(s, ecrans),
      parcours: pageParcours(s),
      sources: pageSources(s),
      confidentialite: pageConfidentialite(s),
      preuves: pagePreuves(s),
    };
    for (const [image, html] of Object.entries(images)) {
      const page = await navigateur.newPage({
        viewport: { width: 1000, height: 400 },
        deviceScaleFactor: 2,
      });
      await page.setContent(html);
      await page.evaluate(() => document.fonts.ready);
      const png = await page.locator(".cadre").screenshot({ type: "png" });
      await page.close();
      await ecrire(`${SORTIE}/${image}${suffixe}.png`, png);
    }
  }
} finally {
  await navigateur.close();
  serveur.kill();
}
