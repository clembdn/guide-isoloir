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
 * Usage : node scripts/serveur-statique.mjs [port]
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
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

const serveur = createServer((requete, reponse) => {
  const url = new URL(requete.url ?? "/", `http://127.0.0.1:${PORT}`);

  void trouver(url.pathname).then((fichier) => {
    if (fichier === null) {
      reponse.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      reponse.end("404");
      return;
    }

    reponse.writeHead(200, {
      "Content-Type": TYPES.get(extname(fichier)) ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(fichier).pipe(reponse);
  });
});

serveur.listen(PORT, "127.0.0.1", () => {
  console.log(`dist/ servi sur http://127.0.0.1:${PORT}`);
});
