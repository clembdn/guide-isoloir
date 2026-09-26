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

Le 24 septembre 2026, avant la refonte de l'accueil, la hauteur était remontée à 6 358 px. Elle
est redescendue à ~5 300 px, avec six cartes illustrées au lieu de cinq.

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

**Exception bornée, décidée le 26 septembre 2026 : Pour et Contre.** Sur les pages de thème, une
position est marquée d'une coche sur disque vert (`--pour`) ou d'une croix sur disque rouge
(`--contre`), parce que c'est le code qu'un primo-votant lit sans lire. Le cadre ne se négocie pas :
la couleur dit un **sens**, jamais un candidat (même pastille pour tous dans une même colonne) ; elle
n'est **jamais seule** (la forme ✓ / ✗ et le mot l'accompagnent toujours, la colonne aussi) ; le
**texte reste à l'encre** ; et elle ne sort pas des pages de thème — `/resultat` garde sa teinte
unique. La paire est validée au script de la skill `dataviz` pour la deutéranopie (voir §2).

Les teintes de rubrique ne servent qu'aux contenus **pédagogiques** de `/comprendre`, qui
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

### Les six teintes de rubrique

Un **vif** pour l'étiquette, un **pastel** pour le fond de carte. Elles ne servent qu'à
`/comprendre`. Contraste du vif sur son pastel, puis de l'encre sur ce même pastel.

| Rubrique | Vif (clair) | Pastel (clair) | Vif / pastel | Encre / pastel |
| -------- | ----------- | -------------- | ------------ | -------------- |
| Violet   | `#7c3aed`   | `#efe7fe`      | 4,8:1        | 15,1:1         |
| Indigo   | `#4338ca`   | `#e5e8fd`      | 6,5:1        | 14,9:1         |
| Sarcelle | `#0d6d64`   | `#d8f2ee`      | 5,3:1        | 15,3:1         |
| Cyan     | `#0e7490`   | `#dcf0f6`      | 4,6:1        | 15,3:1         |
| Prune    | `#a21caf`   | `#fae4f7`      | 5,3:1        | 15,0:1         |
| Ardoise  | `#475569`   | `#e9ecf2`      | 6,4:1        | 15,2:1         |

En sombre, les pastels deviennent des fonds profonds (`#271f45`, `#1f2245`, `#10302e`, `#122934`,
`#33163a`) et les vifs s'éclaircissent (`#c4b5fd`, `#a5b4fc`, `#5eead4`, `#7dd3fc`, `#f0abfc`). L'ardoise, ajoutée le 26 septembre 2026 pour que les six thèmes du test aient chacun
leur teinte, passe à `#cbd5e1` sur `#1e2430`.

Depuis le 26 septembre 2026, ces teintes habillent aussi les **thèmes** (tuiles de `/themes`,
bandeau d'en-tête de chaque page de thème). Un thème n'est pas un acteur : la teinte repère un
sujet. Elle s'arrête au bord du tableau des positions, pour qu'un fond sarcelle ne se lise jamais
comme le vert de « Pour ».

### Pour et Contre

| Rôle   | Clair     | Sombre    | Glyphe sur le disque |
| ------ | --------- | --------- | -------------------- |
| Pour   | `#16a34a` | `#199a52` | `--sur-position`     |
| Contre | `#991b1b` | `#ef4f63` | `--sur-position`     |

Validées par `scripts/validate_palette.js` de la skill `dataviz` (simulation Machado 2009) : en
clair, deutéranopie ΔE 17,2, vision normale ΔE 34,3 ; en sombre, deutéranopie ΔE 6,3 — dans la bande
plancher, légale **uniquement** avec un second codage, que la forme et le mot fournissent. Le vert est
plus clair et le rouge plus sombre en mode clair (l'inverse en sombre) : c'est l'écart de
luminosité qui les sépare pour un daltonien, pas la teinte. La première paire essayée
(`#15803d` / `#b91c1c`) tombait à ΔE 4,2 en deutéranopie et a été refusée par le script.

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
- **La démo du test**, section « Comment ça marche » (refaite le 24 septembre 2026) : une pile de
  six cartes complètes — thème, affirmation, échelle réduite —, une par thème. **C'est la carte
  entière qui glisse** : celle de devant part vers la gauche (`translateX(-30%) rotate(-5deg)`,
  fondu) et la suivante monte de la pile. Cycle de 21 s, fenêtres de 3,5 s, délais **négatifs**
  pour que chaque carte soit à sa place dès le chargement. L'échelle est réduite à cinq pastilles
  et deux bornes écrites (démo passée de 681 à ~380 px à 375 px). **Aucune réponse n'est
  cochée** : un site neutre qui répondrait dans sa propre vitrine prendrait position. Pause au
  survol. Tout le texte est dans le HTML. Ni liste des thèmes ni légende visibles sous la carte
  (retirées le 25 septembre 2026) : le thème en cours est déjà écrit sur la carte, et la légende
  reste pour les lecteurs d'écran.

  **Les cartes qui portent du texte ne changent jamais d'échelle en boucle.** Une carte qui
  grandissait de 0,9 à 1 dans une animation sans fin sortait floue : Safari, et Chrome sur
  certains processeurs graphiques, la dessinent à sa taille de départ puis l'étirent. La
  profondeur de la pile est portée par deux cartes VIDES en pseudo-éléments, qui n'ont rien à
  rendre net. Réduire, en revanche, est sans risque : c'est ce que fait la chute dans l'urne.

- **La scène de l'urne** (`src/lib/demo-urne.ts`, 24 septembre 2026) : quand la section arrive à
  l'écran, la scène s'épingle (`sticky`, piste de 110 svh), la démo s'arrête sur la carte qu'on
  lisait, et **c'est le défilement qui la fait tomber** dans une urne transparente dessinée en
  SVG aux jetons du site : élan, réduction à la largeur de la fente en pivotant, redressement,
  enfoncement ; la question suivante monte pendant ce temps, l'urne tressaille, une légende
  apparaît (« Dans le vrai test, c'est vous qui répondez »). La chute est une animation CSS liée
  à une chronologie nommée (`--scene`) ; le script (2 ko compressé avec le carrousel) ne fait
  que ce que le CSS ne sait pas : décider si la scène a lieu, figer la boucle en sachant quelle
  carte est devant, et mesurer la distance jusqu'à la fente. **Pas de scène** sans JavaScript,
  sans `view-timeline`, avec « réduire les animations », ou si la scène ne tient pas dans la
  hauteur de l'écran : la démo tourne seule. Quand on remonte, la boucle repart, resynchronisée.
- **Le décompte jusqu'au premier tour** (`src/components/CompteARebours.astro`, 24 septembre
  2026), à la place des quatre chiffres clés jugés inutiles. Jours, heures, minutes, secondes
  jusqu'à l'ouverture des bureaux en métropole, 8 h. Le HTML statique dit la date ; les chiffres
  sont servis `hidden` et le script (moins de 1 ko) les révèle : sans JavaScript, jamais un
  « J-206 » figé au jour du build. Aucune animation sur les chiffres, pas d'`aria-live`.

Refusés, et pourquoi : les compteurs qui défilent (un chiffre en `content:` est invisible aux
moteurs et aux assistants, et un compteur n'explique rien) — le décompte n'en est pas un : ses
chiffres sont du texte, et la date qu'il suit est écrite en clair ; le fondu d'entrée du titre (il
retarderait le LCP).

### Les effets liés au défilement de l'accueil (24 septembre 2026)

Demandés par l'éditeur « façon Apple ». Tous en CSS (`animation-timeline`), styles scopés de
`src/pages/index.astro`, mêmes trois filets que la révélation ci-dessous, propriétés détaillées
jamais le raccourci `animation` :

- **la photo d'accroche** occupe toute la largeur de l'écran ; un `clip-path` n'en montre d'abord
  que la largeur de la page, arrondie, et le défilement ouvre ce cadre jusqu'aux bords. L'image
  glisse de −4 % à +4 % dans son cadre (parallaxe). Titre à gauche et appel à droite au-dessus,
  sur grand écran. Sans animation liée au défilement, elle reste à la largeur de la page ;
- le texte de l'accroche monte en sortant par le haut ;
- la phrase manifeste, raccourcie à « Personne ne peut vous dire pour qui voter. » (la suite
  passe en taille courante : d'un bloc, elle prenait un écran), s'allume mot à mot DANS L'ORDRE
  DE LECTURE, du gris (`--couleur-encre-faible`) au noir : tous les mots suivent la chronologie
  du paragraphe, chacun sur sa tranche, rang donné par `nth-child` — un `style="--rang"` serait
  bloqué par la CSP ;
- les quatre blocs du décompte montent en décalé ;
- sur téléphone, dans le carrousel « Comprendre », les photos des cartes voisines s'estompent
  (`view(inline)`), jamais leur texte ;
- sur grand écran, cartes et preuves montent en cascade par colonne.

**Deux règles apprises à la mesure (24 septembre 2026) :**

- **Aucun texte ne perd de contraste au défilement.** Lighthouse et axe lisent la page sans la
  faire défiler : des mots à 25 % d'opacité y comptaient comme illisibles, et l'accessibilité
  était tombée de 100 à 96. Le texte bouge par `transform` ou change de couleur entre deux
  teintes qui passent AA ; l'opacité ne touche que les images et les formes.
- **`overflow: clip`, jamais `hidden`, sur un ancêtre d'élément animé au défilement.**
  `hidden` en fait un conteneur de défilement, `view()` s'y accroche, et l'animation reste figée
  à son début sans la moindre erreur. La parallaxe de la photo n'avait jamais fonctionné pour
  cette raison.

Mesure faite sur l'accueil derrière un serveur qui compresse, comme Cloudflare (le serveur de
`scripts/serveur-statique.mjs` ne compresse pas, et Lighthouse y compte les octets bruts) :
100 / 100 / 100 / 100 sur mobile et sur ordinateur, avant comme après la refonte ; seul le LCP
mobile passe de 1,5 à 1,9 s, la photo étant plus grande.

Ce qui bouge :

- l'action principale se soulève de 2 px au survol et se rétracte à la pression ;
- une carte de rubrique se soulève de 4 px au survol et prend l'ombre haute, et sa photo avance à
  `scale(1.06)` en 250 ms (même état au focus clavier, mais instantané) ;
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

### Articles de /comprendre : sommaire et schémas (23 septembre 2026)

**Gabarit.** `src/layouts/PageLecture.astro` porte le sommaire et la colonne de lecture ; il sert
aux articles (via `ArticleLayout`), à `/methodologie` et à `/a-propos`. Une page qui l'emploie
donne un `id` à chacun de ses titres de niveau 2 et passe la liste au sommaire. `ListeIcones`
remplace les puces des listes « fait / ne fait pas ».

**Mise en page.** Sur grand écran, deux colonnes, comme les pages de produit d'Apple : un
**sommaire collant** à gauche (titres de niveau 2 et « Sources »), qui surligne la section en
cours et montre la progression de lecture sur une piste verticale ; l'article à droite, où titres,
texte et schémas partent **du même bord gauche** — le texte garde la mesure de lecture, les schémas
prennent la colonne entière (52 rem). Sur téléphone, le sommaire se replie en tête d'article.
Chaque titre de section porte un trait dans la **teinte de rubrique de l'article**, la même que
sa carte d'accueil (`teinteArticle`, `src/lib/comprendre.ts`).

La piste est liée au défilement en CSS ; la section en cours est marquée par un court script
(écouteur de défilement passif, un calcul par image, aucune requête). La ligne de lecture est au
tiers de l'écran, puis **glisse jusqu'au bas de la fenêtre en fin de page** : sans cela, le dernier
titre (« Sources ») n'était jamais marqué, alors que la piste arrivait à 100 %. L'IntersectionObserver
d'origine a été retiré le 24 septembre 2026 : il ne voyait pas les sauts (touche Fin, clic dans le
sommaire). `tests/e2e/sommaire.spec.ts` garde les deux cas. **Sans script, le
sommaire reste une liste de liens d'ancre** : contenu, ordre, titres, ancres et balisages
`Article`/`BreadcrumbList` sont inchangés pour les moteurs et les assistants.

**Schémas.** Un article peut être en **MDX** et insérer des composants de
`src/components/schemas/` à l'endroit exact du texte qu'ils remplacent. Premier exemple :
`ou-et-comment-voter.mdx`.

- **Le trait, pas la boîte** (24 septembre 2026, direction choisie par l'éditeur). Aucun cadre
  coloré : ni fond pastel sous le contenu, ni bord gauche épais, ni bordure de couleur autour
  d'un bloc, ni pilule décorative. La teinte va sur les **marques** — points, numéros, traits,
  barres, icônes, titres courts. La structure est une **ligne** : le rail (`.rail`,
  `.rail-noeud`, `.rail-texte` dans `base.css`), le tronc à coudes des chemins de procuration,
  des filets de 1 px pour séparer. Un cercle pour un nœud, aucun arrondi ailleurs.
- **375 px d'abord** : une colonne, pas d'indentation progressive, environ un écran et demi au
  plus par schéma. Le grand écran peut déplier en horizontal, jamais l'inverse.
- **Chaque schéma a la forme de son objet**. Au 24 septembre 2026 :
  - _bureau de vote_ : rail à six nœuds de même taille, l'isoloir dans la couleur signature (agrandi
    jusqu'au 25 septembre 2026 : il cassait l'alignement du rail) ;
    pièces d'identité en trois groupes sous filets, tampon « Refusée » ; horaires en blocs sur un
    axe ; enveloppe et bulletin déchiré dessinés en CSS, côte à côte ;
  - _inscription_ : aiguillage « déjà inscrit ? » en tronc à coudes ; trois voies sous filets
    (trois colonnes sur grand écran) ; anniversaires en frise verticale sur téléphone, horizontale
    et à l'échelle sur grand écran ;
  - _procuration_ : trois chemins en embranchement (tronc, coudes, sans cartes) ; durées en
    barres à l'échelle ;
  - _parrainage_ : trois conditions en grands chiffres typographiques, « et » posés sur les
    filets ; fenêtre de recueil sur une frise à l'échelle ;
  - _président_ : trois cercles concentriques en traits, centre plein, en récapitulatif ;
  - _pour qui voter_ : quatre étapes sur le rail, chacune avec son lien ;
  - _/methodologie_ : chaîne de résolution sur un rail à neuf nœuds (pleins, puis contour, puis
    tireté ; libellés lus dans `NIVEAUX_RESOLUTION`) ; quatre grandeurs sous filets ; fréquence
    du premier rang en barres sur un filet de base ; double codage en Y dessiné en traits à
    toutes les tailles, avec la mention « pas encore appliqué » ;
  - _/a-propos_ : trois questions, trois réponses, en lignes typographiques.
- **Essayés et écartés par l'éditeur**, pour ne pas les refaire : trois colonnes pastel
  identiques pour les chemins de procuration (« trop IA » ; le skill taste refuse les rangées de
  cartes égales) ; un cadran de vingt-quatre heures
  pour les horaires (moins lisible qu'une frise : une journée se lit de gauche à droite) ; une ligne
  droite de stations pour le bureau de vote (texte à l'air libre, pas assez de structure) ; une
  pastille devant la section en cours du sommaire (elle suivait la section, la piste suit la page).
  Le 24 septembre 2026 (« trop IA », « illisible sur téléphone ») : l'escalier indenté de la
  chaîne de résolution ; les cartes pastel à bord gauche épais ; les six cases bordées en zigzag
  du bureau de vote (1 300 px de haut à 375 px) ; les arches des voies d'inscription ; les doubles
  cercles des conditions de parrainage (800 px pour trois nombres) ; le casier à cloisons des
  quatre grandeurs ; les disques pastel des cercles du président.
- **Plusieurs teintes par schéma** : les cinq teintes de rubrique, autorisées ici parce que le
  contenu est pédagogique (§1.1). Jamais sur un candidat, une position ou un score.
- **Un schéma remplace un passage, il ne le double pas**, et il ne porte **aucun fait nouveau**.
  Un fait perdu en route se remet dans le texte.
- **Aucun vert « oui », aucun rouge « non »** : un statut se dit par le titre, la forme et le mot
  (tampon), l'icône double le texte.
- **Icônes Phosphor** (MIT, notice dans `src/icones/`) insérées au build par
  `src/components/Icone.astro`, toujours décoratives ; l'isoloir est le signe du site.
- **Zéro JavaScript** dans les schémas, zéro `style=""`, tout le texte dans le HTML.

### Implémentés dans `src/styles/base.css`

`.page` `.enveloppe` `.enveloppe-large` `.contenu` `.contenu--libre` `.pied`
`.evitement` `.fil-ariane` `.mise-a-jour` `.chantier` `.question` `.sources` `.signature`
`.reserve` `.prose` `.action` `.action--grand` `.action--secondaire` `.section`
`.section-tete` `.section-chapo` `.revele`, les cinq teintes `.t-*`, plus les balises de contenu.

Ce qui n'appartient qu'à l'accueil — accroche, décompte, manifeste, démo, cartes, preuves,
promesse, appel final — vit dans le style scopé de `src/pages/index.astro` depuis le
24 septembre 2026. La pastille de crédit posée sur la photo d'accroche a été retirée : le crédit
figure sur `/credits-images`, lié depuis le pied de chaque page.

### Cartes « Comprendre » de l'accueil (24 septembre 2026)

Six cartes, une par article publié, chacune avec une photographie 16:10 (Commons, recadrée par
`scripts/recuperer-illustrations.mjs`, qui vérifie la licence et écrit les recadrages : deux
sortent du champ un ruban et un bandeau tricolores). Plus d'étiquette « Comprendre » : le titre
de section le dit déjà. Résumé coupé à deux lignes. Sur téléphone, un **carrousel automatique
et sans fin** (`src/lib/carrousel.ts`) : défilement horizontal aimanté, cartes à 78 % de la
largeur, **la carte en cours centrée**, ses deux voisines dépassent. Elle monte de 6 px, prend
l'ombre haute, et sa photo avance lentement pendant le délai. Il avance seul toutes les 3 s —
sans quoi le dernier article serait de fait le moins lu — et boucle grâce à DEUX copies `inert`
de chaque côté : avec une seule, la copie centrée n'avait pas de voisine à droite, et le vide se
comblait d'un coup au saut vers l'original (l'à-coup entre le dernier et le premier article).
La mise en avant est portée par la carte ET ses copies : au saut, rien ne se rejoue. Des points disent où
l'on en est ; celui en cours s'allonge et se remplit, et **c'est la fin de son animation qui fait
avancer**, donc barre et défilement ne se désynchronisent jamais. WCAG 2.2.2 : un bouton arrête
le défilement ; survol, focus, doigt posé, onglet caché ou rangée hors écran le suspendent ;
« réduire les animations » l'empêche d'avancer seul. Sans JavaScript : rangée à glisser, sans
points. Grille 2 puis 3 colonnes au-delà de 46 et 66 rem, immobile. L'image est décorative
(`alt=""`), le titre du lien porte le sens.

Les preuves de confiance passent de quatre à trois (l'éditeur n'est plus mis en avant) et
suivent la règle « le trait, pas la boîte » : un filet au-dessus, une icône Phosphor à la place
du numéro.

La promesse d'anonymat n'a plus d'icône (posée au-dessus du titre, elle coûtait une ligne pour
un pictogramme) ; sur grand écran, titre et texte côte à côte.

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
| Vert et rouge (26/09/2026)     | Pour et Contre seulement, sur les pages de thème, forme et mot obligatoires (§1.1).    |

### Refus maintenus

- **Aucune couleur de parti, nulle part.** Bleu, rouge, rose, vert, orange restent exclus de
  l'interface, à la seule exception de la pastille Pour / Contre des pages de thème (§1.1).
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

## 11 bis. Candidats : liste, tag et fiche (25 septembre 2026)

**`/candidats`** — gabarit libre, largeur `--large`. Titre, date, une phrase ; puis la légende des
étapes en **rail** (vertical à 375 px, couché à partir de 48 rem) ; puis une **grille sans boîte**
de une, deux ou trois colonnes (375 px, 48 rem, 72 rem), un filet au-dessus de chaque candidat.
L'ordre reste alphabétique : ni l'étape ni le nombre de propositions ne trient. Chaque entrée :
portrait carré de 64 px, nom, parti, **tag**, trois repères (programme, propositions, positions du
test), et un `<details>` natif « Aperçu du programme » — trois propositions au plus, choisies par
`ordrePropositions` (mesure avant orientation, nature, date, identifiant).

**Le tag** (`src/components/candidats/EtapeCandidature.astro`) — quatre crans courts dans
`--couleur-signature`, remplis jusqu'au rang tiré du statut (`ETAPES_CANDIDATURE`), puis le
libellé. **Même encre pour tous** : seule la longueur du remplissage change (§1.1). Angles droits,
parce qu'il ne se clique pas (§1.3). Le lecteur d'écran entend « Étape 2 sur 4 : … ». Une réserve
sourcée ajoute « sous réserve » en texte, jamais en couleur.

**La fiche** — `PageLecture`, teinte violette identique pour tous les candidats, sommaire en trois
parties. En tête : portrait 120 px, rail des étapes où **seule l'étape actuelle** est pleine (une
candidature se déclare sans passer par une primaire : remplir les nœuds précédents mentirait),
statut attesté et sources, réserve en pleine encre bordée, trois repères entre deux filets. Puis
« Son programme » (propositions groupées par domaine, puis orientations ; nature en pleine encre
quand ce n'est ni un programme 2027 ni une déclaration personnelle) et « Ses positions sur le
test », où la valeur s'affiche aussi sur les cinq crans de l'échelle du test, cran retenu plein.

**Portrait** — `src/components/candidats/Portrait.astro` est désormais le seul balisage de
portrait des pages candidats : une taille par classe (64, 120), puisque la CSP refuse `style=""`.

## 11 ter. Thèmes (26 septembre 2026)

**`/themes`** — gabarit libre. Titre, une phrase, la légende des quatre pastilles. Puis **deux
formes pour deux familles** : les six thèmes du test en grandes tuiles à leur teinte (pictogramme
Phosphor `fill`, nom, intitulés courts des affirmations en pastilles), sur une grille asymétrique
7 + 5 / 5 + 7 qui alterne **par position**, jamais par thème ; les cinq thèmes hors test en rangées
compactes, parce qu'ils ne proposent pas de tableau pour/contre et ne doivent pas en avoir l'air.
Chaque tuile est un seul lien, étendu à toute la carte par un `::after`.

**Page d'un thème du test** — bandeau à la teinte du thème, pictogramme en grand et en filigrane
(l'illustration, sans photographie), sommaire en pastilles numérotées. Puis un **plateau** par
affirmation : titre « {intitulé court} : qui est pour, qui est contre ? », l'affirmation entière,
la définition sourcée dans un `<details>`, puis **Pour et Contre côte à côte dès 375 px** —
visages de 56 px (64 à partir de 30 rem), pastille mordant le coin du portrait, nom, et une ligne
de mentions (« Plutôt », « Reprise », « Partielle », « Déduite ») développées dans le nom
accessible. « Ni pour ni contre » n'apparaît que s'il compte quelqu'un. Les candidats **sans
position connue** sont des visages de 40 px sans légende : l'absence reste visible sans occuper
plus de place que ce qu'on sait, et leurs noms sont dans le nom accessible et dans le tableau.
Chaque plateau finit par la phrase **« En bref »**, générée, qui nomme tout le monde et regroupe
les positions reprises par parti : c'est elle que lisent les moteurs et les assistants.

Sous les plateaux : un **tableau récapitulatif** (`<table>`, une ligne par candidat dans l'ordre
des fiches, une pastille par affirmation, le sens en toutes lettres masqué à l'œil), puis « Ce
qu'ils proposent » (second registre, dit hors score), l'appel au test et les autres thèmes.

**Page d'un thème hors test** — même bandeau, un encadré qui dit qu'aucune question n'y porte,
les propositions groupées par candidat, et les candidats sans proposition nommés en pastilles.
Sous trois propositions, la page est servie en `noindex` et reste hors du sitemap.

**Composants** — `src/components/themes/` : `MarquePosition`, `LegendePositions`,
`CandidatPosition`, `PlateauAffirmation`, `RecapitulatifTheme`, `PropositionsDuTheme`,
`TuileTheme`, `EnTeteTheme`, `AutresThemes`. `Portrait` gagne les tailles 32 et 40.

**Mesures** — `scripts/capturer.mjs` mesure `/themes`, un thème du test et un thème hors test :
aucun couple sous son seuil. Le filet des portraits est tiré de l'encre dans les colonnes, où le
trait tombait à 1,4:1 sur le fond vert. Les fonds de colonne sont mélangés `in srgb`, que le
script sait lire ; `in oklab` lui faisait mesurer un fond blanc. Lighthouse mobile : 100 dans les
quatre catégories sur l'index, un thème du test et un thème hors test.

## 12. Ce qui reste à faire

- **Illustrations de rubrique** : les cartes de `/comprendre` portent aujourd'hui la couleur et la
  typographie seules. Les photographies libres essayées ont été jugées amateur par l'éditeur et
  retirées. Une piste graphique reste à trancher.
- **Lighthouse** : à relancer sur `/`, `/test`, `/resultat` et un article après cette refonte.
- **Budget JavaScript de `/resultat`** : environ 25 ko gzip au chargement (moteur Svelte compris),
  pour un budget de 20 ko. Le dépassement précède cette refonte.
