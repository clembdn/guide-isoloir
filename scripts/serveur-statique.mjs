/**
 * Serveur statique pour les tests de bout en bout.
 *
 * `astro preview` se détache en arrière-plan dès que sa sortie n'est pas un
 * terminal, ce que Playwright interprète comme un démarrage raté. Ce serveur
 * reste au premier plan, et n'ajoute aucune dépendance.
 *
 * Il reproduit le routage de Cloudflare Pages pour une sortie `build.format:
 * "file"` : `/test` sert `dist/test.html`, `/` sert `dist/index.html`.
 *
 * Il ne sert QUE le contenu de `dist/`. Aucune réécriture, aucun script injecté :
 * ce que le test observe est ce qui sera déployé.
 *
 * Il applique aussi `dist/_headers`, comme le fera Cloudflare Pages. Sans cela,
 * les tests s'exécuteraient sans politique de sécurité HTTP, donc sans
 * l'intersection avec la balise meta d'Astro — c'est-à-dire précisément sans la
 * situation où un îlot cesse de s'hydrater. Un test qui ne voit pas la CSP réelle
 * ne prouve rien sur le site déployé.
 *
 * Usage : node scripts/serveur-statique.mjs [port]
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("../dist", import.meta.url));
const PORT = Number(process.argv[2] ?? 4321);

const TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".ico", "image/x-icon"],
]);

/**
 * Règles de `dist/_headers`, dans l'ordre du fichier.
 *
 * Format Cloudflare Pages : une ligne de motif non indentée, puis les en-têtes
 * indentés. Toutes les règles dont le motif correspond s'appliquent, les
 * dernières écrasant les précédentes à nom d'en-tête égal.
 */
async function lireRegles() {
  let texte;
  try {
    texte = await readFile(join(RACINE, "_headers"), "utf8");
  } catch {
    console.warn(
      "AVERTISSEMENT : dist/_headers est absent. Le site est servi sans politique\n" +
        "de sécurité HTTP, ce qui ne reflète pas la production. Lancez `npm run build`.",
    );
    return [];
  }

  const regles = [];
  let courante = null;
  for (const ligneBrute of texte.split("\n")) {
    if (ligneBrute.trim() === "" || ligneBrute.trimStart().startsWith("#")) continue;

    if (!/^\s/.test(ligneBrute)) {
      courante = { motif: ligneBrute.trim(), entetes: [] };
      regles.push(courante);
      continue;
    }

    const separateur = ligneBrute.indexOf(":");
    if (courante === null || separateur === -1) continue;
    courante.entetes.push([
      ligneBrute.slice(0, separateur).trim(),
      ligneBrute.slice(separateur + 1).trim(),
    ]);
  }
  return regles;
}

/** Le motif Cloudflare `/dossier/*` correspond-il à ce chemin ? */
function motifCorrespond(motif, chemin) {
  const echappe = motif.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${echappe}$`).test(chemin);
}

function entetesPour(regles, chemin) {
  const resultat = new Map();
  for (const regle of regles) {
    if (!motifCorrespond(regle.motif, chemin)) continue;
    for (const [nom, valeur] of regle.entetes) resultat.set(nom, valeur);
  }
  return resultat;
}

/** Chemins candidats pour une URL, dans l'ordre où Cloudflare Pages les essaie. */
function candidats(chemin) {
  const propre = normalize(decodeURIComponent(chemin)).replace(/^(\.\.[/\\])+/, "");
  if (propre === "/" || propre === "\\") return ["index.html"];

  const sansBarre = propre.replace(/^[/\\]+/, "").replace(/[/\\]+$/, "");
  if (extname(sansBarre) !== "") return [sansBarre];
  return [`${sansBarre}.html`, join(sansBarre, "index.html")];
}

async function trouver(chemin) {
  for (const candidat of candidats(chemin)) {
    const complet = join(RACINE, candidat);
    if (!complet.startsWith(RACINE)) continue;
    try {
      const infos = await stat(complet);
      if (infos.isFile()) return complet;
    } catch {
      // Candidat suivant.
    }
  }
  return null;
}

const regles = await lireRegles();

const serveur = createServer((requete, reponse) => {
  const url = new URL(requete.url ?? "/", `http://127.0.0.1:${PORT}`);

  void trouver(url.pathname).then((fichier) => {
    const entetes = Object.fromEntries(entetesPour(regles, url.pathname));

    if (fichier === null) {
      reponse.writeHead(404, { ...entetes, "Content-Type": "text/plain; charset=utf-8" });
      reponse.end("404");
      return;
    }

    reponse.writeHead(200, {
      ...entetes,
      "Content-Type": TYPES.get(extname(fichier)) ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(fichier).pipe(reponse);
  });
});

serveur.listen(PORT, "127.0.0.1", () => {
  console.log(`dist/ servi sur http://127.0.0.1:${PORT}`);
  console.log(
    regles.length > 0
      ? `_headers appliqué : ${regles.length} règle(s).`
      : "_headers absent : aucune politique de sécurité HTTP.",
  );
});
