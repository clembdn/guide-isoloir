# Routes désactivées — historique

**Ce dossier ne contient plus de route.** `/test` et `/resultat` sont revenues dans
`src/pages/` le 18 septembre 2026 : elles tournent sur les données réelles de
`src/data/`, et `npm run build:prod` sort en 0.

Le dossier et ce fichier restent pour que la raison du détour ne se perde pas.

## Pourquoi elles avaient été retirées

`/test` et `/resultat` tournaient sur des données factices — trois questions
d'exemple, des acteurs inventés, aucune source. Le garde-fou
(`scripts/verifier-pages-publiques.mjs`) refuse un build de production tant qu'une
donnée factice est servie, à raison : publier un comparateur qui ne compare rien
serait pire que ne pas le publier. La correction n'était pas d'affaiblir le
garde-fou, c'était de ne pas construire ce qui n'était pas prêt.

## Ce qui a permis leur retour

1. **Le questionnaire réel** (`src/data/questions.ts`) : 24 affirmations,
   6 thèmes de 4, 22 sources d'infobulles toutes ouvertes et vérifiées.
2. **Les acteurs réels** (`src/data/acteurs.ts`) : 20 candidats et 20 partis, avec
   la date et la source de chaque statut de candidature. Le critère d'entrée est un
   acte public daté de la personne, ou une désignation formelle par son parti — pas
   une liste d'invitation à un débat, ce qu'était le premier jet.
3. **Les premières positions** (`src/data/positions.ts`), chacune avec sa source
   datée et le verbatim qui la fonde.
4. **La reprise de la ligne du parti** dans le moteur, pour qu'un candidat qui ne
   s'est pas encore exprimé apparaisse sans qu'une position lui soit attribuée à
   tort (`EntreesMoteur.candidatures`, `DetailPosition.heriteDe`).

## Ce qui reste de `src/factice/`

`src/factice/questions-factices.ts` et `src/factice/acteurs-factices.ts` **ne sont
plus servis par aucune route.** Ils restent parce que l'audit et les tests
unitaires en ont besoin : le jeu factice a des thèmes de tailles différentes et
des acteurs construits exprès pour exercer les invariants — deux acteurs aux mêmes
positions mais documentées inégalement, deux acteurs ex æquo par construction, un
acteur à couverture partielle. Un jeu réel ne garantit aucune de ces
configurations.

Le garde-fou continue de chercher leurs identifiants dans le JavaScript servi. Si
l'un réapparaît dans `dist/`, le build de production s'arrête. C'est pour cela que
`Quiz.svelte` reçoit désormais son avertissement en propriété au lieu de l'importer :
tant qu'il l'importait, la chaîne partait dans le bundle de production.

## Ce qui reste à faire sur `/resultat`

Les douze positions du codage initial sont en `reviewStatus: "draft"` — 2,5 % des
480 couples possibles, et 7 candidats sur 20 seulement en ont une :
`positionsPubliables` les écarte de ce qui est servi, et la page explique qu'aucune
position n'est encore publiée plutôt que d'afficher un classement de zéros. Quatre
tests de bout en bout portant sur l'apparence du classement se suspendent
d'eux-mêmes dans cet état et se réarment dès qu'une position passe en
`reconciled`.

C'est la traduction technique de la règle de `CLAUDE.md` : aucun contenu factuel
produit par une IA n'est publié sans vérification humaine.
