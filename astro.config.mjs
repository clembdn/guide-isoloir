// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

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
  integrations: [svelte()],
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
