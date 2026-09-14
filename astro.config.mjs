// @ts-check
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

/**
 * Reporte dans `dist/_headers` les empreintes que la CSP d'Astro vient d'émettre.
 *
 * L'en-tête HTTP et la balise meta se composent en INTERSECTION : une ressource
 * doit être autorisée par les deux. Un `script-src 'self'` nu dans l'en-tête
 * interdit donc les scripts en ligne qu'Astro hache, et aucun îlot ne s'hydrate.
 * L'échec est silencieux : la page s'affiche, elle ne réagit pas.
 *
 * Écrire les empreintes à la main dans `public/_headers` marcherait jusqu'à la
 * prochaine montée de version d'Astro, qui les changerait sans prévenir. On les
 * relève donc dans le HTML construit, à chaque build.
 */
function cspEnTetes() {
  return {
    name: "csp-en-tetes",
    hooks: {
      /** @param {{ dir: URL, logger: { info: (message: string) => void } }} contexte */
      "astro:build:done": async ({ dir, logger }) => {
        const racine = fileURLToPath(dir);
        const pages = (await readdir(racine, { recursive: true, withFileTypes: true }))
          .filter((entree) => entree.isFile() && entree.name.endsWith(".html"))
          .map((entree) => join(entree.parentPath, entree.name));

        /** @type {{ script: Set<string>, style: Set<string> }} */
        const empreintes = { script: new Set(), style: new Set() };
        for (const page of pages) {
          const html = await readFile(page, "utf8");
          const csp = /<meta\s+http-equiv="content-security-policy"\s+content="([^"]*)"/i.exec(
            html,
          );
          const politique = csp?.[1];
          if (politique === undefined) continue;

          /** @type {["script" | "style", string][]} */
          const directives = [
            ["script", "script-src"],
            ["style", "style-src"],
          ];
          for (const [cle, directive] of directives) {
            const valeurs = new RegExp(`${directive}([^;]*)`).exec(politique)?.[1] ?? "";
            for (const empreinte of valeurs.match(/'sha(?:256|384|512)-[^']+'/g) ?? []) {
              empreintes[cle].add(empreinte);
            }
          }
        }

        if (empreintes.script.size === 0) {
          throw new Error(
            "csp-en-tetes : aucune empreinte de script relevée dans dist/*.html. " +
              "`security.csp` est-il toujours actif dans astro.config.mjs ?",
          );
        }

        const chemin = join(racine, "_headers");
        let contenu = await readFile(chemin, "utf8");
        /** @type {["script" | "style", string][]} */
        const jetons = [
          ["script", "__EMPREINTES_SCRIPT__"],
          ["style", "__EMPREINTES_STYLE__"],
        ];
        for (const [cle, jeton] of jetons) {
          // Tri : l'ordre de parcours des fichiers ne doit pas faire bouger le
          // diff d'un build à l'autre.
          const liste = [...empreintes[cle]].sort().join(" ");
          contenu = contenu.replaceAll(jeton, liste);
        }

        if (contenu.includes("__EMPREINTES_")) {
          throw new Error("csp-en-tetes : un jeton d'empreintes n'a pas été remplacé.");
        }

        await writeFile(chemin, contenu);
        logger.info(
          `_headers : ${empreintes.script.size} empreinte(s) de script, ` +
            `${empreintes.style.size} de style.`,
        );
      },
    },
  };
}

/*
 * Le domaine n'est pas encore acheté. `example.invalid` est réservé par la
 * RFC 2606 : aucune requête ne peut aboutir vers un site réel par erreur, et le
 * garde-fou de publication refuse tout build de production qui le contient.
 *
 * À corriger ici ET dans src/lib/site.ts — les deux valeurs doivent coïncider.
 */
const SITE = "https://example.invalid";

export default defineConfig({
  site: SITE,
  output: "static",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  security: {
    /*
     * CSP : deux politiques se composent, et elles se composent de façon
     * RESTRICTIVE.
     *
     * 1. L'en-tête HTTP de `public/_headers` est la référence. C'est lui qui
     *    porte `frame-ancestors`, qu'une balise meta ne peut pas exprimer.
     * 2. Astro ajoute ici une balise meta qui déclare les empreintes de ses
     *    propres scripts et styles.
     *
     * Le navigateur applique l'INTERSECTION des deux : une ressource doit être
     * autorisée par les deux pour être chargée. Élargir la meta n'élargit donc
     * rien, et resserrer l'en-tête resserre tout.
     *
     * À REVOIR AVANT LE PREMIER ÎLOT HYDRATÉ. Astro hydrate ses îlots avec un
     * script en ligne. `script-src 'self'` dans l'en-tête HTTP ne l'autorise
     * pas, et l'intersection avec les empreintes de la meta ne le sauvera pas :
     * l'en-tête doit lui aussi accepter ces empreintes, ou la page devra être
     * servie autrement. Ce point se tranche quand il y aura un îlot à tester,
     * pas avant : aucune restructuration de la CSP n'est faite ici.
     */
    csp: true,
  },
  markdown: {
    /*
     * Coloration syntaxique désactivée. Shiki produit des styles en ligne que
     * `style-src` haché rejette, et Astro avertit à chaque build. Un parcours
     * pédagogique sur le vote n'affiche pas de code : la fonctionnalité coûte
     * un conflit de sécurité pour un besoin qui n'existe pas.
     */
    syntaxHighlight: false,
  },
  integrations: [svelte(), cspEnTetes()],
  devToolbar: {
    enabled: false,
  },
  prefetch: false,
  vite: {
    build: {
      // Aucune dépendance distante : tout doit être servi depuis 'self' (CSP).
      assetsInlineLimit: 0,
    },
  },
});
