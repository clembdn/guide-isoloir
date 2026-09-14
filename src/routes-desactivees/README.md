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
- `tests/unit/moteur.test.ts`, `tests/audit/invariants.audit.ts` : intacts,
  toujours exécutés par `npm test` et `npm run audit`.

Rien de tout cela n'a été touché. Seule la route publique a disparu.

## Réactivation

1. De vraies questions et positions existent, sourcées, à la place de
   `src/factice/`.
2. `git mv src/routes-desactivees/test src/pages/test` et
   `git mv src/routes-desactivees/resultat.astro src/pages/resultat.astro`.
3. Les deux fichiers importent encore `QUESTIONS_FACTICES` et
   `ACTEURS_FACTICES` : remplacer ces imports par les données réelles.
4. Retirer les `test.skip` / `describe.skip` posés dans `tests/e2e/` pour ces
   deux routes (chaque skip renvoie ici).
5. `npm run build:prod` doit sortir en 0 : c'est lui qui vérifie qu'aucune
   trace de `src/factice/` ne subsiste dans `dist/`.

Jusque-là, ce dossier reste hors de `src/pages`, et Cloudflare continue de
construire avec `npm run build`.
