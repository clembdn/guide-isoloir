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

**Instrument Sans**, SIL Open Font License 1.1, auto-hébergée dans `src/polices/`, licence dans
`src/polices/OFL.txt`.

C'est une **police variable** : un seul fichier par plage Unicode couvre toute l'étendue des
graisses, déclaré `font-weight: 400 700`. Sur une page en français, seule la plage `latin` se
charge — les caractères accentués français y sont tous. **Coût réel : 29 ko.**

Deux graisses employées, et pas une de plus : **400** pour le corps, **700** pour les titres,
l'action et les termes en gras. La graisse des titres est montée de 600 à 700 : « Signal » les
voulait discrets, « Clair » les veut affirmés. Pas d'italique pour l'instant.

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

Une courbe, `--sortie: cubic-bezier(0.22, 1, 0.36, 1)`, et une durée, `--duree: 180ms`.

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

### Implémentés dans `src/styles/base.css`

`.page` `.enveloppe` `.enveloppe-large` `.entete` `.marque` `.contenu` `.contenu--libre` `.pied`
`.evitement` `.fil-ariane` `.mise-a-jour` `.chantier` `.question` `.sources` `.signature`
`.reserve` `.prose` `.action` `.action--grand` `.action--secondaire` `.entete-action` `.section`
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

## 10. Ce qui reste à faire

- **Logo** : le rideau d'isoloir, dans ses déclinaisons (brief §4). Rien n'existe.
- **Favicon** : `public/favicon.svg` est encore un carré provisoire.
- **Carte partageable** : 1080 × 1350 et 1080 × 1920, générée côté client.
- **Illustrations de rubrique** : les cartes de `/comprendre` portent aujourd'hui la couleur et la
  typographie seules. Les photographies libres essayées ont été jugées amateur par l'éditeur et
  retirées. Une piste graphique reste à trancher.
- **Préchargement de la police** : `<link rel="preload">` sur le fichier latin réduirait le
  clignotement au premier rendu. À mesurer avant d'ajouter, pas à supposer.
- **Lighthouse** : à relancer sur `/`, `/test`, `/resultat` et un article après cette refonte.
- **Écran de résultat** : il suit la palette par les jetons, mais sa densité n'a pas été
  retravaillée pour la nouvelle direction.
