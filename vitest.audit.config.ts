import { defineConfig } from "vitest/config";

/**
 * Configuration de `npm run audit`.
 *
 * Séparée de la configuration des tests unitaires pour deux raisons : l'audit
 * ne teste pas du code, il vérifie des invariants mécaniques publiés dans la
 * méthodologie ; et il doit pouvoir être lancé seul, cité, et son résultat
 * rapporté tel quel.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/audit/**/*.audit.ts"],
    // Un rapport d'audit se lit en entier, même quand tout passe.
    reporters: ["verbose"],
  },
});
