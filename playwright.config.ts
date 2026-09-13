import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
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
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
