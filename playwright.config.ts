import { defineConfig, devices } from "@playwright/test";

/*
 * PAS 4321 : c'est le port par défaut d'`astro dev`. Avec `reuseExistingServer`,
 * un serveur de développement laissé ouvert était réutilisé à la place du site
 * construit — donc sans `dist/_headers`, donc sans politique de sécurité HTTP,
 * donc sans l'intersection de CSP que ces tests doivent précisément exercer.
 * L'erreur était silencieuse : les tests passaient.
 */
const PORT = 4331;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  // Un seul worker en CI : le serveur de prévisualisation est partagé.
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      // 375 px d'abord : c'est la largeur sur laquelle tout se juge.
      // Chromium plutôt qu'un profil d'appareil WebKit : un seul navigateur à
      // installer en CI, et le moteur majoritaire chez notre public.
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    // Le site testé est le site construit, pas le serveur de développement :
    // c'est ce qui est déployé qui doit être exempt de requêtes tierces.
    command: `npm run build && npm run serve:dist -- ${PORT}`,
    url: BASE_URL,
    /*
     * Jamais de réutilisation, même en local. Un serveur déjà en écoute sert un
     * `dist/` dont rien ne garantit qu'il correspond au code courant, et la
     * commande ci-dessus — donc le build — est alors purement et simplement
     * sautée. Le build prend moins d'une seconde : ça ne vaut pas le risque de
     * tester autre chose que ce qu'on vient d'écrire.
     */
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
