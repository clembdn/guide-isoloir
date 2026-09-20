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

**Mis à jour le 20 septembre 2026.** La section précédente décrivait un état
révolu : les douze positions du codage initial étaient en `reviewStatus: "draft"`
et la page affichait « aucune position n'est encore publiée ».

Depuis :

- **30 positions, toutes en `reconciled`**, donc toutes servies. Le mot a changé
  de sens et `src/data/positions.ts` le dit en tête : il signifie « publiable »,
  pas « doublement codé ». Le double codage à l'aveugle n'a toujours pas eu lieu,
  `/methodologie` l'écrit en clair.
- **La presse est un maillon nommé** de la chaîne de résolution
  (`press-interview`, `press-report`), avec sa confiance affichée sous chaque
  position.
- **Seuil de publication desserré** : 0,25 de couverture chez 3 acteurs, contre
  0,4 chez 5.

**Le classement ne s'affiche toujours pas, et ce n'est pas un réglage à changer.**
Deux acteurs seulement franchissent 25 % de couverture : Marine Le Pen (13 des 24
affirmations, dont 11 reprises de la ligne du RN) et Jean-Luc Mélenchon (6, toutes
tirées de son programme). Viennent ensuite Glucksmann et Retailleau à 3, Philippe
à 2. Il manque **un troisième acteur à 6 affirmations documentées**, pas un seuil
plus bas.

Ce qui le débloquera, par ordre de rendement :

1. **Les plateformes de parti.** Le RN l'a prouvé : 11 cases codées sur le parti
   ont porté Le Pen à 54 % de couverture, par la reprise. Les mêmes documents
   existent pour Les Républicains, Les Écologistes, le Parti socialiste, le PCF,
   Renaissance et Horizons.
2. **Les programmes de candidats, à mesure qu'ils sortent.** Un seul existe au
   20 septembre 2026, celui de Jean-Luc Mélenchon. C'est un fait sur l'état de la
   campagne, pas un défaut d'effort : les autres ne sont pas publiés.
3. **Les relevés thématiques de presse**, qui couvrent plusieurs candidats d'un
   coup mais rarement l'affirmation exactement posée.

`data/cases-non-couvertes.md` tient la trace de ce qui a été lu sans pouvoir être
codé. Pour exercer l'écran de classement sans attendre :

```
GUIDE_ISOLOIR_SEUIL_COUVERTURE=0.05 GUIDE_ISOLOIR_SEUIL_ACTEURS=2 npm run test:e2e
```

Les tests d'apparence du classement se suspendent d'eux-mêmes tant qu'aucun
classement ne s'affiche, et se réarment seuls.
