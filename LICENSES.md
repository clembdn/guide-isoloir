# Licences

Ce dépôt contient deux natures de travaux, sous deux licences différentes.

## Code source — GNU AGPL v3

Fichier : [`LICENSE-AGPL-3.0`](LICENSE-AGPL-3.0)

Relèvent de l'AGPL v3 :

- tout fichier `.ts`, `.js`, `.mjs`, `.astro`, `.svelte`, `.css` ;
- les fichiers de configuration à la racine (`astro.config.mjs`, `tsconfig.json`,
  `eslint.config.js`, `playwright.config.ts`, `vitest.config.ts`,
  `wrangler.toml`, `package.json`) ;
- le contenu de `scripts/`, `src/` et `tests/` ;
- les workflows de `.github/`.

L'AGPL impose de publier les modifications du code à toute personne qui utilise
le service en réseau. C'est délibéré : un comparateur politique dont le moteur
ne serait pas vérifiable n'aurait aucune raison d'être cru.

## Données — CC BY-SA 4.0

Fichier : [`LICENSE-CC-BY-SA-4.0`](LICENSE-CC-BY-SA-4.0)

Relèvent de CC BY-SA 4.0 :

- tout fichier de données destiné à `src/data/` (questions, acteurs politiques,
  positions, sources) — ce répertoire n'existe pas encore ;
- les exports publiés sous `/donnees` (JSON, CSV) ;
- les tableaux de double codage et les taux d'accord publiés.

La réutilisation est libre, à condition de citer la source et de conserver la
même licence.

## Ni l'un ni l'autre

- `CLAUDE.md` et le contenu de `docs/` sont des documents de travail internes.
  Ils ne sont pas publiés sous licence libre.
- Les textes rédactionnels des pages publiques (`/a-propos`, `/methodologie`,
  `/charte-editoriale`, `/financement`, `/mentions-legales`, `/corrections`)
  restent la propriété de leur auteur. Leur citation est libre dans les limites
  du droit de citation. Le balisage `.astro` qui les porte, lui, est sous AGPL.
- Les contenus de tiers cités (programmes, déclarations, documents officiels)
  restent soumis au droit de leurs auteurs.

## En cas de doute

Un fichier non listé ci-dessus et qui s'exécute relève de l'AGPL. Un fichier non
listé et qui décrit une position politique relève de CC BY-SA.
