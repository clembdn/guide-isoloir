# Système de design — Guide Isoloir

Direction **« Clair »**, arrêtée le 22 septembre 2026 après le rejet de quatre directions
successives rendues sur du contenu réel à 375 px et à 1280 px.

Ce document est la référence. `src/styles/base.css` l'implémente, il ne le définit pas. **Une
valeur qui apparaît dans le CSS sans exister ici est une décision prise en douce.** Pour changer
le système, on change ce fichier d'abord.

Le brief d'origine reste `docs/BRIEF-DESIGN.md`. **Sa section 9 ne survit plus intégralement à ce
document** : voir la section 8, qui dit lesquels de ses refus ont été levés, par qui et pourquoi.

---

## 0. Ce qui a remplacé « Signal », et pourquoi

« Signal » (14 septembre 2026) tenait sur trois règles : un accent unique sous 2 % de couverture,
une hiérarchie portée uniquement par l'échelle et l'espace, et le rayon 0 partout sauf sur
l'actionnable. Aucune ombre, aucun dégradé, aucune surface, aucune image.

Le résultat a été jugé par l'éditeur, sur pièces : « on dirait un site fait par un junior en
2010 », « fond noir, on voit rien », « ça rend mal sur téléphone ». Le grief est fondé et il
était prévisible — le brief lui-même (§2) écrit que « l'utilisateur ne peut pas vérifier
l'algorithme, il juge la fiabilité sur ce qu'il voit ».

Quatre directions ont été rendues avant celle-ci : trois sur la structure seule (aplats, grille,
éditorial), toutes refusées comme trop austères ; une quatrième avec photographie d'accroche et
voile sombre, refusée pour le fond noir et la longueur sur téléphone. « Clair » est la cinquième.

**Ce que la refonte a mesuré, et pas seulement ressenti :**

|                                     | Avant     | Après              |
| ----------------------------------- | --------- | ------------------ |
| Hauteur de l'accueil à 375 px       | 12 131 px | 5 777 px           |
| Bas du bouton principal à 375 × 667 | 682 px    | sous la flottaison |
| Cibles tactiles sous 44 px          | 11        | 0                  |

---

## 1. Les trois règles

Elles priment sur toute considération esthétique. Une proposition qui en contredit une est
refusée sans discussion.

### 1.1 Plusieurs teintes, mais jamais sur du politique

C'est la règle qui a changé de forme sans changer de fond. « Signal » garantissait la neutralité
en n'ayant **qu'une** couleur. « Clair » en a six, et garantit la même chose par une frontière :

**Aucun candidat, aucune position, aucun score ne sera jamais teinté.** Sur `/resultat`, toutes
les barres partagent une seule teinte à opacité constante et ne diffèrent que par le rang et par
la longueur. Jamais par l'intensité, jamais par la couleur.

Les cinq teintes de rubrique ne servent qu'aux contenus **pédagogiques** de `/comprendre`, qui
expliquent comment on vote. Ce sont des repères de navigation, pas un jugement sur un acteur.

**Bleu, rouge, rose, vert et orange restent exclus du site entier.** Ce sont les familles occupées
par un parti français : bleu (RN, LR, Renaissance, UDI), rouge (LFI, PCF, LO), rose (PS), vert
(Les Écologistes), orange (MoDem). Il reste le violet, l'indigo, la sarcelle, le cyan et la prune.

### 1.2 La hiérarchie tient à l'échelle, à l'espace et à la surface

L'ajout est « la surface ». Une carte **groupe ce qui va ensemble** : elle délimite, elle ne
décore pas. Une carte qui ne regroupe rien est une décoration, donc un refus.

Les filets gardent leur règle : **un filet doit signifier quelque chose, sinon il ne s'écrit
pas.** Limite d'en-tête, limite de pied, bordure de carte, barre de réserve, ligne de tableau,
séparation d'une signature. Un filet ajouté « pour aérer » reste refusé.

### 1.3 Le rayon est un système, pas un signal

« Signal » faisait du rayon un code : 0 pour le contenu, 4 px pour l'actionnable. Le code était
illisible pour qui ne l'avait pas appris, et il produisait des blocs à angles vifs que l'éditeur
a jugés datés.

Trois valeurs, et une seule règle : **l'actionnable est une pilule pleine.** Un bouton se
reconnaît à sa forme avant de se lire.

---

## 2. Couleur

Contrastes **mesurés** par `scripts/capturer.mjs` sur les valeurs réellement appliquées par le
navigateur, sur sept routes et dans les deux schémas. Le script **échoue** si un texte passe sous
son seuil WCAG ou un filet sous 1,5:1. Ces tables sont sa sortie, pas une estimation.

### Clair

| Rôle                        | Valeur    | Contraste         |
| --------------------------- | --------- | ----------------- |
| Fond                        | `#fbfaff` | —                 |
| Surface (carte)             | `#ffffff` | —                 |
| Surface secondaire          | `#f3f0fd` | —                 |
| Encre                       | `#171426` | 17,4:1            |
| Encre faible                | `#5b5772` | 6,6:1             |
| Trait                       | `#cec8e2` | 1,6:1             |
| **Signature, violet encre** | `#5321d6` | 7,9:1             |
| Aplat d'action              | `#5321d6` | —                 |
| Texte sur l'aplat           | `#ffffff` | 8,2:1 sur l'aplat |

### Sombre

| Rôle                        | Valeur    | Contraste         |
| --------------------------- | --------- | ----------------- |
| Fond                        | `#12101c` | —                 |
| Surface (carte)             | `#1b1830` | —                 |
| Surface secondaire          | `#211d39` | —                 |
| Encre                       | `#eceaf7` | 15,8:1            |
| Encre faible                | `#a7a2bd` | 7,7:1             |
| Trait                       | `#413a64` | 1,8:1             |
| **Signature, violet encre** | `#b49cf5` | 8,1:1             |
| Aplat d'action              | `#b49cf5` | —                 |
| Texte sur l'aplat           | `#17122b` | 7,8:1 sur l'aplat |

**L'inversion du texte d'action en mode sombre est voulue, pas un oubli.** Le violet s'éclaircit
pour rester lisible sur fond sombre ; du blanc dessus ne passerait pas. Seul un texte sombre passe.

### Les cinq teintes de rubrique

Un **vif** pour l'étiquette, un **pastel** pour le fond de carte. Elles ne servent qu'à
`/comprendre`. Contraste du vif sur son pastel, puis de l'encre sur ce même pastel.

| Rubrique | Vif (clair) | Pastel (clair) | Vif / pastel | Encre / pastel |
| -------- | ----------- | -------------- | ------------ | -------------- |
| Violet   | `#7c3aed`   | `#efe7fe`      | 4,8:1        | 15,1:1         |
| Indigo   | `#4338ca`   | `#e5e8fd`      | 6,5:1        | 14,9:1         |
| Sarcelle | `#0d6d64`   | `#d8f2ee`      | 5,3:1        | 15,3:1         |
| Cyan     | `#0e7490`   | `#dcf0f6`      | 4,6:1        | 15,3:1         |
| Prune    | `#a21caf`   | `#fae4f7`      | 5,3:1        | 15,0:1         |

En sombre, les pastels deviennent des fonds profonds (`#271f45`, `#1f2245`, `#10302e`, `#122934`,
`#33163a`) et les vifs s'éclaircissent (`#c4b5fd`, `#a5b4fc`, `#5eead4`, `#7dd3fc`, `#f0abfc`).

### Le risque de teinte, enregistré

**Le violet n'est revendiqué par aucun parti français.** C'était la première piste du brief (§4),
jamais explorée jusqu'ici, et c'est la seule famille encore libre : le bronze de « Signal »
appartenait à la famille jaune-orangé du MoDem, ce que le système précédent avait enregistré comme
un risque assumé.

Le risque résiduel est le glissement vers le mauve en mode sombre (`#b49cf5`), où la teinte
s'éclaircit et se désature. Il est enregistré ici pour pouvoir être rouvert sur pièces plutôt que
redécouvert.

**Le fond clair n'est pas un crème.** `#fbfaff` est un blanc très légèrement violacé. La
combinaison « fond crème + serif contrasté + accent terracotta », refusée par le brief §9, reste
refusée.

**Le seuil des filets est un plancher local, pas une exigence WCAG.** La règle des 3:1 vise les
composants d'interface, pas les séparateurs, dont l'espacement porte déjà le groupement. Nous
imposons 1,5:1 : en dessous, un filet disparaît sur un écran d'entrée de gamme en plein jour. Le
premier jeu de traits de cette direction était à 1,2:1 ; `capturer.mjs` l'a refusé, et c'est
exactement ce pour quoi il existe.

---

## 3. Typographie

**Bricolage Grotesque**, de Mathieu Triay, SIL Open Font License 1.1, auto-hébergée dans
`src/polices/`, licence dans `src/polices/OFL.txt`.

**Elle a remplacé Instrument Sans le 22 septembre 2026.** Quatre familles ont été rendues sur le
contenu réel — le titre d'accueil, la première affirmation du questionnaire, un extrait de
classement mesuré, les glyphes français — aux deux largeurs, toutes autres valeurs égales. Le
spécimen est conservé dans `docs/maquettes/polices.html`.

Le motif du changement n'est pas un défaut d'Instrument Sans : c'était une grotesque d'interface
irréprochable, et c'est précisément le problème. On la reconnaît sur n'importe quel produit
logiciel, et le site a besoin d'une voix. Les deux autres candidates ont été écartées pour une
raison chacune : **Archivo** est solide mais très employée depuis 2023 ; **Schibsted Grotesk** est
dessinée pour la presse, donc excellente, mais plus consensuelle. Bricolage vient de l'édition
indépendante : ni administrative, ni logicielle. C'est l'écart cherché.

C'est une **police variable** : un seul fichier par plage Unicode couvre toute l'étendue des
graisses, déclaré `font-weight: 400 700`. Sur une page en français, seule la plage `latin` se
charge — les caractères accentués français y sont tous. **Coût réel : 38 ko**, contre 29 pour
Instrument Sans.

Deux graisses employées, et pas une de plus : **400** pour le corps, **700** pour les titres,
l'action et les termes en gras. Pas d'italique pour l'instant.

### Chargement : une seule peinture (23 septembre 2026)

La police est **préchargée** dans le `<head>` et déclarée en **`font-display: optional`**, avec
une police de secours « Bricolage repli » (Arial local) ajustée à ses proportions — `size-adjust`
103 % en 400 et 100,5 % en 700, mesurés avec fontTools. Avec `swap`, chaque page était peinte deux
fois, et le contenu descendait jusqu'à 74 px à l'arrivée de la police : la « secousse » au
changement de page. Mesuré après correction : **aucun décalage de mise en page**, cache vide,
cache chaud et 3G lent simulé.

### L'axe de taille optique est figé à 28

Bricolage porte un axe `opsz`, qui laisse le navigateur choisir seul une coupe serrée pour les
titres et une coupe aérée pour le corps. **Il a été mesuré, puis figé.**

| Rendu        | Poids `latin` | Ce qu'on voit                                                      |
| ------------ | ------------- | ------------------------------------------------------------------ |
| Axe conservé | 71 ko         | Titre au maximum de son caractère, corps au maximum de son confort |
| Figé à 28    | 38 ko         | Titre presque aussi serré, corps confortable                       |
| Figé à 14    | 38 ko         | Titre nettement plus lâche                                         |
| Figé à 96    | 38 ko         | Corps visiblement à l'étroit                                       |

Les quatre ont été comparés côte à côte sur le titre d'accueil à 60 px et le corps à 17 px.
**33 ko pour le reste du chemin n'ont pas été jugés dus** sur un site dont la promesse inclut la
vitesse. Restaurer l'axe est un changement d'une ligne dans la commande d'instanciation.

Les fichiers sont produits depuis la version servie par Google Fonts, dont le sous-ensemble latin
est déjà découpé, puis instanciés avec fontTools :

```python
instantiateVariableFont(f, {"opsz": 28, "wght": (400, 400, 700)})
```

### Échelle

| Rôle        | Valeur                                      | 375 px | 1280 px |
| ----------- | ------------------------------------------- | ------ | ------- |
| `--t-h1`    | `clamp(2.25rem, 1.5rem + 3.4vw, 4.25rem)`   | 36 px  | 68 px   |
| `--t-h2`    | `clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)`    | 24 px  | 36 px   |
| `--t-h3`    | `1.125rem`                                  | 18 px  | 18 px   |
| `--t-corps` | `clamp(1.0625rem, 1rem + 0.27vw, 1.125rem)` | 17 px  | 18 px   |
| `--t-petit` | `0.875rem`                                  | 14 px  | 14 px   |

Le rapport titre / corps passe de 2,5 à **3,8 à 1280 px**. C'est le geste qui porte la page :
« Signal » comptait sur l'espace seul, « Clair » compte sur l'échelle.

Interlignes : **1,6** pour le corps, **1,1** pour les titres. Chasse resserrée sur les titres
(`-0.03em`, jusqu'à `-0.038em` sur le h1 d'accroche), nulle sur le corps.

### Mesure

`--mesure` vaut **34 rem**, portée à **38 rem au-delà de 1024 px**. `--large` vaut **74 rem** et
sert au gabarit libre. Les deux coexistent : une section large remet `.enveloppe` autour de son
texte long, parce qu'un paragraphe à 74 rem ne se lit pas.

### Chiffres

`lining-nums` partout par défaut. `tabular-nums` sur les tableaux, sur les chiffres clés, et
**obligatoire sur toute colonne de scores** : des chiffres qui ne s'alignent pas se comparent mal.

---

## 4. Espacement

Six pas. Toute valeur d'espacement passe par eux.

| Jeton     | Valeur |
| --------- | ------ |
| `--pas-1` | 6 px   |
| `--pas-2` | 12 px  |
| `--pas-3` | 20 px  |
| `--pas-4` | 32 px  |
| `--pas-5` | 48 px  |
| `--pas-6` | 72 px  |

`--pas-6` sépare deux sections d'une page. Il est descendu de 88 à 72 px : avec des surfaces qui
délimitent, l'espace n'a plus à porter seul le découpage, et 88 px sur téléphone allongeait la
page sans rien ajouter. `--gouttiere` vaut 20 px et ne descend jamais en dessous.

---

## 5. Mouvement

Deux courbes et une durée : `--sortie: cubic-bezier(0.22, 1, 0.36, 1)` pour ce qui entre ou sort,
`--va-et-vient: cubic-bezier(0.77, 0, 0.175, 1)` pour ce qui traverse l'écran (le rideau), et
`--duree: 180ms` pour l'interface.

### L'accueil, seul endroit où le mouvement explique (23 septembre 2026)

Page vue rarement, donc seul budget de mouvement « explicatif » du site, hors révélation du
résultat :

- **Le rideau s'ouvre sur la photo du bureau de vote**, une fois, à l'arrivée : deux pans
  `--couleur-aplat` s'écartent en 1 s, `--va-et-vient`, après 250 ms. L'image est peinte dessous
  dès le départ : **mesuré, le LCP reste la photo à 60 ms, CLS 0**. Par défaut les pans sont hors
  champ ; seule l'animation les amène d'abord au centre.
- **La démo du test**, section « Comment ça marche » : une pile de cartes où six vraies
  affirmations, une par thème, défilent au-dessus d'une échelle fixe (cycle de 21 s, fenêtres de
  3,5 s, entrée par le bas en 0,5 s), avec une minuterie linéaire sous le thème en cours. **Aucune
  réponse n'est cochée** : un site neutre qui répondrait dans sa propre vitrine prendrait position.
  Pause au survol. Tout le texte est dans le HTML.

Refusés, et pourquoi : les compteurs qui défilent (un chiffre en `content:` est invisible aux
moteurs et aux assistants, et un compteur n'explique rien) ; le fondu d'entrée du titre (il
retarderait le LCP).

Ce qui bouge :

- l'action principale se soulève de 2 px au survol et se rétracte à la pression ;
- une carte de rubrique se soulève de 4 px au survol et prend l'ombre haute ;
- les sections montent de 20 px et passent de 0,3 à 1 d'opacité à l'entrée dans la fenêtre.

**Tout survol est derrière `@media (hover: hover) and (pointer: fine)`.** Sur un écran tactile, un
appui déclenche le survol et laisse l'élément soulevé après le relâchement.

### La révélation au défilement

Elle est en **CSS pur** — `animation-timeline: view()` — donc **zéro octet de JavaScript**, aucun
`IntersectionObserver`, aucun écouteur de défilement, rien à nettoyer. Seules `opacity` et
`transform` bougent : la hauteur du document est identique avec et sans.

**Le plancher d'opacité à 0,3 n'est pas un réglage esthétique.** À zéro, tout le contenu sous la
ligne de flottaison reste invisible tant que personne n'a défilé : mesuré, et une capture de la
page entière sortait blanche. Sur un sujet YMYL dont `CLAUDE.md` exige que le contenu essentiel
soit lisible en HTML statique, rendre le corps de la page invisible à un moteur qui ne défile pas
est un risque réel. Le plancher garde le mouvement sans jamais rendre un mot illisible.

Trois filets la bornent : `prefers-reduced-motion: no-preference`, un `@supports` (un navigateur
sans la propriété affiche le contenu, il ne le cache pas), et un état par défaut **visible**.

Ce qui ne bouge jamais :

- **aucune animation sur une action déclenchée au clavier** — quelqu'un qui enchaîne les réponses
  au clavier perçoit toute animation comme de la latence, et un test Playwright le vérifie ;
- **l'anneau de focus apparaît instantanément**, `transition: none`.

`prefers-reduced-motion: reduce` retire tout déplacement et conserve les transitions de couleur.
**Vérifié : la hauteur de page est identique au pixel près avec et sans.**

---

## 6. Focus

`outline: 2px solid var(--couleur-signature)`, `outline-offset: 2px`, sans transition. Visible dans
les deux schémas, sur tous les fonds employés aujourd'hui.

Le lien d'évitement porte une bordure bronze de 2 px et un rayon actionnable : c'est un élément sur
lequel on agit.

---

## 7. Composants

### Gabarit

`BaseLayout` expose `gabarit: "colonne" | "libre"`, défaut `"colonne"`.

- **`"colonne"`** enferme le contenu dans `--mesure`, la colonne de lecture. C'est le cas de toutes
  les pages de texte.
- **`"libre"`** rend le slot sans enveloppe : la page compose ses propres sections, chacune
  choisissant sa largeur et remettant `.enveloppe` autour de son texte long.

**L'en-tête et le pied sont identiques dans les deux.** Le garde-fou de build qui vérifie la
présence du nom de l'éditeur sur chaque page publique en dépend.

`actionEntete` ajoute un raccourci vers le test dans l'en-tête. Il est **désactivé sur `/test` et
`/resultat`** : il y serait redondant, et chaque lien d'en-tête coûte une tabulation au parcours
clavier, dont le budget jusqu'au premier radio du quiz est plafonné à 25.

### Navigation (23 septembre 2026)

`src/components/Navigation.astro` porte l'en-tête entier, styles compris. Son motif est celui du
logo : **un rideau d'isoloir qui se ferme**.

- **Grand écran (≥ 64 rem)** : logo, cinq liens au centre (Candidats, Thèmes, Comprendre, Méthode,
  À propos, tirés de `NAV_PRINCIPALE` dans `src/lib/site.ts`), « Commencer le test » à droite.
  Survoler un lien tire deux demi-rideaux `--couleur-surface-2` depuis ses bords jusqu'au centre ;
  la page en cours (`aria-current="page"`, rubrique et pages filles) garde le rideau fermé et
  prend l'encre de signature.
- **Téléphone** : logo, « Commencer » (nom accessible « Commencer le test »), bouton « Menu ». Le
  menu est un `popover` natif plein écran : deux panneaux `--couleur-aplat` se rejoignent au
  centre en 240 ms, puis les liens arrivent, chacun avec une ligne de description.
- **Au défilement**, la barre posée à plat devient une surface dépolie — une pilule flottante sur
  grand écran — par une animation liée au défilement (`animation-timeline: scroll()`).

**Zéro JavaScript.** Ouverture, Échap, appui à côté et retour du focus viennent du navigateur ;
l'entrée se joue par `@starting-style`. Sans `popover`, le bouton et le panneau sont retirés et le
pied de page porte la navigation. Sans animation liée au défilement, la surface est simplement
visible. **Les propriétés d'animation s'écrivent détaillées**, jamais en raccourci : le minifieur
fondait `animation` et `animation-timeline` en un raccourci que Chrome rejette en bloc.

Budget clavier mesuré jusqu'au premier radio de `/test` : **4 tabulations à 375 px, 8 à 1280 px**,
pour un plafond de 25.

Contrastes du menu ouvert, sur l'aplat : libellés 8,2:1 (clair) et 7,8:1 (sombre), descriptions
6,2:1 et 5,9:1, bordure du bouton « Fermer » 4,0:1 et 3,6:1.

### Implémentés dans `src/styles/base.css`

`.page` `.enveloppe` `.enveloppe-large` `.contenu` `.contenu--libre` `.pied`
`.evitement` `.fil-ariane` `.mise-a-jour` `.chantier` `.question` `.sources` `.signature`
`.reserve` `.prose` `.action` `.action--grand` `.action--secondaire` `.section`
`.section-tete` `.section-chapo` `.revele` `.hero` `.hero-grille` `.hero-media` `.hero-credit`
`.chiffres` `.apercu` `.etiquette` `.echelle` `.cartes` `.carte` `.preuves` `.preuve-puce`
`.promesse` `.final`, les cinq teintes `.t-*`, plus les balises de contenu.

### Boutons

**`.action` est le seul bouton plein du site, et un écran n'en porte qu'un** — hors le rappel de
l'en-tête et l'appel final de l'accueil, qui sont le même appel répété, pas deux appels
concurrents. Il dit ce qui se passe (« Commencer le test »), jamais « Valider », et ne porte pas
de flèche collée au texte.

`.action--grand` passe pleine largeur sous 30 rem : sur téléphone, la cible doit être évidente.
`.action--secondaire` est **bordée, jamais un second aplat**.

### Cibles tactiles

**44 px de haut au minimum, partout.** La hauteur est portée par du `padding` compensé par une
marge négative : la cible grandit, la mise en page ne bouge pas. Onze liens étaient sous le seuil
avant cette règle ; ils sont mesurés à chaque passage.

---

## 8. Ce qui est refusé, et ce qui ne l'est plus

### Refus levés le 22 septembre 2026

Le brief `docs/BRIEF-DESIGN.md` §9 refusait ces traits, et `CLAUDE.md` en faisait la loi. **Ils
sont levés sur décision explicite et réitérée de l'éditeur**, après que quatre directions
respectant ces refus ont été jugées trop austères. La décision lui appartient ; elle est
enregistrée ici pour qu'elle reste traçable.

| Refus levé                     | Ce qui l'encadre désormais                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| Cartes arrondies à ombre douce | Trois rayons, une ombre à deux niveaux, **teintée de violet**. Une carte doit grouper. |
| Dégradés décoratifs            | **Un seul** dégradé sur le site : le halo de l'accroche. Aucun autre.                  |
| Entrées en fondu-glissé        | Autorisées, en **CSS pur**, avec plancher d'opacité à 0,3. Voir §5.                    |
| Accent unique sous 2 %         | Six teintes, avec la frontière de la règle 1.1 : **jamais sur du politique**.          |

### Refus maintenus

- **Aucune couleur de parti, nulle part.** Bleu, rouge, rose, vert, orange restent exclus.
- **Aucune teinte sur un candidat, une position ou un score.** Les barres de `/resultat` gardent
  une seule couleur et une seule opacité, portée par un attribut `width`, jamais par un style.
- **Aucune apparence officielle.** Pas de bleu-blanc-rouge, pas de Marianne. Le palais de l'Élysée
  a été écarté de l'accroche pour cette raison ; l'accroche montre un isoloir.
- Fond crème avec serif contrasté et accent terracotta.
- Fond noir avec un seul accent vert acide.
- Étiquettes en capitales espacées au-dessus des titres.
- Flèches « → » collées au texte des boutons.
- **Toute seconde famille typographique.**
- **Toute ombre noire.** Les ombres sont teintées ; une ombre neutre sur un fond coloré le grise.
- **Tout `style=""`.** `astro.config.mjs` active `security.csp: true`, le build émet un `style-src`
  haché, et un attribut de style en ligne serait bloqué par le navigateur.
- **Toute image dont la licence n'est pas vérifiée.** Wikimedia Commons exclusivement,
  auto-hébergée, créditée sur `/credits-images`. Voir `src/data/illustrations.ts`.

---

## 9. Vérification

La définition de « terminé » de `CLAUDE.md` s'applique. S'y ajoute, pour toute modification de ce
système :

- contrastes recalculés sur les valeurs appliquées, dans les deux schémas, pas estimés ;
- rendu vérifié à 375 px sur un appareil réel, pas dans une fenêtre rétrécie ;
- parcours complet au clavier, anneau de focus visible partout ;
- `prefers-reduced-motion` actif : aucune mise en page ne bouge ;
- aucune requête vers un domaine tiers.

## 10. Marque

Le logo est dessiné par l'éditeur. Il tient en deux formes, un signe et un mot, et se décline en
cinq fichiers — pas un de plus.

### Le signe

Un isoloir vu de face : un cadre ouvert par le bas, et deux rideaux écartés. Il dit à la fois le
nom du site et son sujet, sans emprunter à l'État. **Aucune Marianne, aucun bleu-blanc-rouge**,
conformément au brief §3 : le risque est juridique autant qu'esthétique.

Le mot porte une boussole dans le « o » d'Isoloir. C'est la seule licence prise avec la lisibilité,
et elle tient jusqu'à 120 px de large, mesuré.

### Les fichiers

| Fichier                               | Rôle                                              |
| ------------------------------------- | ------------------------------------------------- |
| `src/marque/guide-isoloir.svg`        | Bloc complet, signe + mot. Maître.                |
| `src/marque/isoloir.svg`              | Signe seul. Maître.                               |
| `src/marque/guide-isoloir-source.png` | Le dessin d'origine, conservé pour la provenance. |
| `public/favicon.svg`                  | Le signe détaillé, sur fond transparent.          |
| `public/favicon-32.png`               | 32 × 32, fond plein. Onglet Chrome et Edge.       |
| `public/favicon-48.png`               | 48 × 48, fond plein. Windows haute densité.       |
| `public/apple-touch-icon.png`         | 180 × 180, fond plein. iOS n'accepte que du PNG.  |
| `public/medias/marque/partage.png`    | 1200 × 630, aperçu de lien.                       |

Les quatre PNG se régénèrent par `node scripts/generer-marque.mjs`, qui compose les SVG maîtres et
les photographie avec le Chromium de Playwright. **Aucune dépendance ajoutée.** Le jour où la
police change, la carte de partage est périmée : la refaire coûte une commande.

**Pourquoi le favicon d'onglet n'est pas le SVG.** Le SVG détaille un cadre et deux pans de rideau
séparés par un filet blanc. Redimensionné à la taille d'un onglet, 16 à 32 px, ce filet se perd
dans l'anticrénelage et le dessin devient un bloc violet flou — c'est le défaut observé, décrit
comme « un carré moche ». Les PNG de petite taille reprennent le traitement de l'icône Apple —
fond plein, signe seul, échelle pensée pour rester lisible en petit — plutôt que de redimensionner
le dessin détaillé. Le SVG reste déclaré en premier dans l'en-tête pour les agents qui savent en
tirer parti ; les PNG qui suivent sont ce que Chrome et Edge choisissent pour l'onglet.

### Une seule couleur, et elle vient du dehors

Les SVG maîtres n'écrivent aucune valeur : ils emploient `currentColor`. L'en-tête leur donne la
teinte de signature, la carte de partage leur donne du blanc sur aplat violet. **Aucun violet du
logo ne peut donc diverger de celui du système** — c'est la raison du choix, pas une élégance.

Le dessin d'origine est en `#42279d`, un violet plus sombre que la signature `#5321d6`. Le logo a
été **aligné sur le jeton**, pas l'inverse : la signature porte des contrastes mesurés dans les
deux schémas, une seconde teinte proche les rendrait faux sans que rien ne le signale. Si l'éditeur
préfère `#42279d`, c'est le jeton qui change, et les contrastes se remesurent.

Deux exceptions inévitables, toutes deux documentées dans les fichiers : le favicon, chargé comme
image hors du document, n'hérite d'aucune variable CSS et recopie donc les deux valeurs à la main ;
les PNG sont des pixels figés.

### Ce que le logo ne fait pas

- **Il ne porte pas de couleur de parti**, ni n'approche un contenu politique.
- **Il ne remplace pas le nom de l'éditeur.** Celui-ci reste dans le texte visible du pied de
  chaque page publique, et un garde-fou de build le vérifie.
- **Il n'est pas un texte.** Le lien de l'en-tête porte donc `aria-label`, et le SVG
  `aria-hidden` : un lecteur d'écran annonce « Guide Isoloir, retour à l'accueil ».

---

## 11. Test et résultat (23 septembre 2026)

**`/test`** — une chose par écran. Le paragraphe de confidentialité est passé sous le quiz, en
petit, dans la formulation publique autorisée. Au-dessus de la question : une barre de
vingt-quatre segments groupés par thème, et l'étiquette du thème en cours. Sous la question, la
définition du terme, repliée. Les réponses sont des pilules pleine largeur : le bouton radio reste
**natif** (groupe, flèches, annonce), seul son dessin change, et la réponse cochée prend l'aplat.
Sur grand écran, une colonne « Votre parcours » montre les six thèmes et leurs quatre points,
remplis au fil des réponses ; elle n'est pas interactive et ne coûte aucune tabulation.

**`/resultat`** — gabarit libre, largeur utile (66 rem). Une phrase de promesse, le cadre de
lecture en une phrase, les réserves en une ligne chacune (l'explication longue se déplie), la
bascule dessinée en interrupteur sur une case **native**. Chaque candidat est une carte : grand
numéro de rang, portrait carré arrondi identique pour tous, qualification, barre, score et
couverture, puis un **profil par thème** — une barre par thème dans la même encre, avec
« 3 sur 4 » à côté et « non documenté » plutôt qu'une barre à zéro, sans aucun pourcentage. Deux
colonnes sur grand écran. Les écartés deviennent des étiquettes, sans rang ni barre.

**Carte partageable** — `src/lib/carte-partage.ts`, chargé au clic seulement. Deux PNG dessinés
sur `<canvas>` (1080 × 1350 et 1080 × 1920), fond violet, logo recoloré en blanc, rangs 1 à 3 ex
æquo compris, chaque score avec sa couverture et sa qualification, « Ce n'est pas une
recommandation de vote », l'état de la bascule et la graine. **Aucun portrait** : leur licence
exige de créditer l'auteur, ce qu'une image qui circule seule ne fait pas. Partage natif du
téléphone quand il existe, sinon enregistrement. Images en `blob:` : rien ne sort du navigateur.

## 12. Ce qui reste à faire

- **Illustrations de rubrique** : les cartes de `/comprendre` portent aujourd'hui la couleur et la
  typographie seules. Les photographies libres essayées ont été jugées amateur par l'éditeur et
  retirées. Une piste graphique reste à trancher.
- **Lighthouse** : à relancer sur `/`, `/test`, `/resultat` et un article après cette refonte.
- **Budget JavaScript de `/resultat`** : environ 25 ko gzip au chargement (moteur Svelte compris),
  pour un budget de 20 ko. Le dépassement précède cette refonte.
