# Routes désactivées

Astro construit uniquement ce qui se trouve dans `src/pages/`. Les fichiers de
ce dossier n'y sont pas : ils ne produisent aucune page, aucune entrée de
sitemap, aucune URL.

## Pourquoi

`/test` et `/resultat` tournaient sur des données factices
(`src/factice/questions-factices.ts`, `src/factice/acteurs-factices.ts`) : trois
questions d'exemple, des acteurs inventés, aucune source. Le garde-fou de
publication (`scripts/verifier-pages-publiques.mjs`) refuse un build de
production tant qu'une donnée factice est servie — à raison : publier un
comparateur qui ne compare rien serait pire que ne pas le publier.

Avec le domaine branché et `IS_PUBLISHABLE` passé à `true`
(`src/lib/site.ts`), `npm run build:prod` échouait uniquement à cause de ces
deux routes. La correction n'est pas d'affaiblir le garde-fou : c'est de ne
pas construire ce qui n'est pas prêt.

## Ce qui n'a pas bougé

- `src/components/Quiz.svelte`, `src/components/Resultat.svelte` : le rendu.
- `src/lib/moteur/`, `src/lib/questions.ts`, `src/lib/projection.ts`,
  `src/lib/session-test.ts` : le moteur et son transfert de session.
- `src/lib/echelle.ts` : l'échelle de réponse, réelle et partagée par les deux
  jeux de données.
- `tests/unit/moteur.test.ts`, `tests/audit/invariants.audit.ts` : intacts,
  toujours exécutés par `npm test` et `npm run audit`.

Rien de tout cela n'a été touché. Seule la route publique a disparu.

## Où en est la condition n° 1

**Les questions réelles existent** : `src/data/questions.ts`, 24 affirmations,
6 thèmes de 4, `DONNEES_FACTICES = false`. Elles passent le schéma, et l'audit
vérifie leur couverture et leur équilibre de `direction` thème par thème, au même
titre que le jeu factice.

**Il manque deux choses, et elles bloquent toutes les deux :**

1. **Vingt-et-une URL de sources d'infobulles sont vides.**
   `validerSourcesInfobulles` refuse ce jeu tant qu'elles le sont. Rien à
   contourner : l'appeler dans le frontmatter est précisément ce qui empêche de
   servir une définition non sourcée.
2. **Aucune position (`Stance`) réelle n'existe.** `/resultat` compare des
   acteurs à des positions ; sans elles, il n'y a rien à comparer. Les positions
   des candidats ne seront documentables qu'entre janvier et mars 2027, quand les
   programmes sortiront.

Autrement dit `/test` pourrait techniquement tourner sur les questions réelles,
mais l'activer seul mènerait à un `/resultat` factice. Les deux routes se
réactivent ensemble.

## Réactivation

1. Compléter les vingt-et-une URL de `SOURCES_INFOBULLES`, et saisir de vraies
   positions à la place de `src/factice/acteurs-factices.ts`.
2. `git mv src/routes-desactivees/test src/pages/test` et
   `git mv src/routes-desactivees/resultat.astro src/pages/resultat.astro`.
3. Les deux fichiers importent encore `QUESTIONS_FACTICES` et
   `ACTEURS_FACTICES` : remplacer ces imports par `QUESTIONS` de
   `src/data/questions.ts` et par les acteurs réels. Retirer aussi
   `AVERTISSEMENT_FACTICE` de `Quiz.svelte`, qui n'a plus d'objet.
4. Appeler dans le frontmatter, côté serveur uniquement :

   ```ts
   const questions = validerQuestions(QUESTIONS);
   validerSourcesInfobulles(SOURCES_INFOBULLES, questions);
   ```

   C'est le garde-fou des sources. Sans cet appel, une URL vide passerait.

5. Retirer les `test.skip` / `describe.skip` posés dans `tests/e2e/` pour ces
   deux routes (chaque skip renvoie ici).
6. `npm run build:prod` doit sortir en 0 : c'est lui qui vérifie qu'aucune
   trace de `src/factice/` ne subsiste dans `dist/`.

Jusque-là, ce dossier reste hors de `src/pages`, et Cloudflare continue de
construire avec `npm run build`.
