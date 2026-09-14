# Système de design — Guide Isoloir

Direction **« Signal »**, arrêtée le 14 septembre 2026 après comparaison de trois directions
rendues sur du contenu réel à 375 px et à 1280 px.

Ce document est la référence. `src/styles/base.css` l'implémente, il ne le définit pas. **Une
valeur qui apparaît dans le CSS sans exister ici est une décision prise en douce.** Pour changer
le système, on change ce fichier d'abord, dans une PR qui ne fait que ça.

Le brief d'origine reste `docs/BRIEF-DESIGN.md`. Sa section 9 est une liste de refus, et elle
survit à ce document.

---

## 1. Les trois règles

Elles priment sur toute considération esthétique. Une proposition qui en contredit une est
refusée sans discussion.

### 1.1 Un accent unique, à moins de 2 % de couverture

Le bronze ne sert qu'à quatre choses : **les liens, l'action principale, l'anneau de focus, le
repérage dans un article.** Il n'entre jamais en contact avec un contenu politique. Il dit où l'on
peut agir, rien de plus.

Conséquence directe, et c'est la raison d'être de la règle : **aucun candidat, aucune position,
aucun score ne sera jamais teinté.** Sur `/resultat`, toutes les barres partagent une seule teinte
à opacité constante et ne diffèrent que par le rang et par la longueur. Jamais par l'intensité.

### 1.2 La hiérarchie tient à l'échelle et à l'espace

Jamais à un trait, jamais à une couleur. Le rapport titre / corps est le plus fort des trois
directions comparées (48 / 19 px à 1280 px), et c'est lui qui structure la page.

**Un filet doit signifier quelque chose, sinon il ne s'écrit pas.** Les seuls filets autorisés
aujourd'hui : la limite d'entête, la limite de pied, la barre de réserve, la ligne de tableau, la
séparation d'une signature d'auteur. Un filet ajouté « pour aérer » est une décoration, donc un
refus.

### 1.3 Le rayon dit « ceci se clique »

`0` sur les blocs, `4px` sur les seuls éléments actionnables. Pas d'exception. Un bloc de contenu
à coins arrondis est une carte, et les cartes sont refusées.

---

## 2. Couleur

Contrastes **mesurés** par `capturer.mjs` sur les valeurs réellement appliquées par le navigateur,
pas estimés à la main. Tout texte est au-dessus de 4,5:1 dans les deux schémas.

### Clair

| Rôle                  | Valeur    | Contraste sur le fond |
| --------------------- | --------- | --------------------- |
| Fond                  | `#f3f3f1` | —                     |
| Encre                 | `#151618` | 16,3:1                |
| Encre faible          | `#55565a` | 6,6:1                 |
| Trait                 | `#c5c5c1` | 1,6:1                 |
| **Signature, bronze** | `#8a5a10` | 5,3:1                 |
| Aplat d'action        | `#8a5a10` | —                     |
| Texte sur l'aplat     | `#ffffff` | 5,9:1 sur l'aplat     |

### Sombre

| Rôle                  | Valeur    | Contraste sur le fond |
| --------------------- | --------- | --------------------- |
| Fond                  | `#131416` | —                     |
| Encre                 | `#eaeae8` | 15,3:1                |
| Encre faible          | `#9c9d9f` | 6,8:1                 |
| Trait                 | `#34353a` | 1,5:1                 |
| **Signature, bronze** | `#d9a441` | 8,2:1                 |
| Aplat d'action        | `#d9a441` | —                     |
| Texte sur l'aplat     | `#17130a` | 8,2:1 sur l'aplat     |

**L'inversion du texte d'action en mode sombre est voulue, pas un oubli.** Le bronze s'éclaircit
pour rester lisible sur fond noir ; du blanc dessus tomberait à 1,9:1. Seul un texte sombre passe.

### Deux points à connaître

**Le fond clair n'est pas un crème.** `#f3f3f1` est un gris à peine chaud. La combinaison « fond
crème + serif contrasté + accent terracotta » est explicitement refusée par la section 9 du brief,
et la direction s'en tient à distance délibérément.

**Le seuil des filets est un plancher local, pas une exigence WCAG.** La règle des 3:1 vise les
composants d'interface et les objets graphiques indispensables à la compréhension, pas les
séparateurs, dont l'espacement porte déjà le groupement. Nous imposons 1,5:1 : en dessous, un filet
disparaît sur un écran d'entrée de gamme en plein jour.

### Le risque de teinte, enregistré

Le bronze appartient à la famille jaune-orangé, celle du **MoDem** (`#FF7900`) et des **gilets
jaunes**. À `#8a5a10` la chroma est fortement réduite et la clarté abaissée, ce qui le fait lire
comme du laiton. **C'est en mode sombre (`#d9a441`) que la parenté se voit le plus.**

Ce risque a été présenté et assumé le 14 septembre 2026, après examen des rendus dans les deux
schémas. Il est enregistré ici pour qu'il puisse être rouvert sur une base factuelle plutôt que
redécouvert.

Contexte de la décision : les partis français occupent le bleu (RN, LR, Renaissance, UDI), le rouge
(LFI, PCF, LO), le rose (PS), le vert (Les Écologistes) et l'orange (MoDem). La piste « vert sapin »
suggérée par le brief est elle-même dans une famille politique et a été écartée pour cette raison.

Si le jaune du mode sombre devait poser problème sans remettre en cause le principe, un bronze plus
cuivré existe : `#c9884a`, 6,4:1 sur `#131416`. C'est un réglage, pas une refonte.

---

## 3. Typographie

**Instrument Sans**, SIL Open Font License 1.1, auto-hébergée dans `src/polices/`, licence dans
`src/polices/OFL.txt`.

C'est une **police variable** : un seul fichier par plage Unicode couvre toute l'étendue des
graisses, déclaré `font-weight: 400 600`. Sur une page en français, seule la plage `latin` se
charge — les caractères accentués français y sont tous. **Coût réel : 29 ko.**

Deux graisses employées, et pas une de plus : **400** pour le corps, **600** pour les titres,
l'action et les termes en gras. Pas d'italique pour l'instant ; la question se rouvrira quand un
article en aura besoin.

### Échelle, ratio 1,25

| Rôle        | Valeur                                       | 375 px | 1280 px |
| ----------- | -------------------------------------------- | ------ | ------- |
| `--t-h1`    | `clamp(2rem, 1.55rem + 1.9vw, 3rem)`         | 32 px  | 48 px   |
| `--t-h2`    | `clamp(1.375rem, 1.25rem + 0.5vw, 1.625rem)` | 22 px  | 26 px   |
| `--t-h3`    | `1.1875rem`                                  | 19 px  | 19 px   |
| `--t-corps` | `clamp(1.0625rem, 1rem + 0.27vw, 1.1875rem)` | 17 px  | 19 px   |
| `--t-petit` | `0.9375rem`                                  | 15 px  | 15 px   |

Interlignes : **1,6** pour le corps, **1,15** pour les titres. Chasse resserrée sur les titres
(`-0.022em` en h1, `-0.018em` en h2), nulle sur le corps.

### Mesure

`--mesure` vaut **32 rem**, portée à **36 rem au-delà de 1024 px**. À 32 rem un h1 de 48 px partait
sur trois lignes, ce qui annulait l'effet d'échelle ; 36 rem le tient en deux lignes et laisse le
corps à environ 68 signes.

### Chiffres

`lining-nums` partout par défaut. `tabular-nums` sur les tableaux, et **obligatoire sur toute
colonne de scores** : des chiffres qui ne s'alignent pas se comparent mal d'un coup d'œil.

---

## 4. Espacement

Six pas. Toute valeur d'espacement passe par eux.

| Token     | Valeur |
| --------- | ------ |
| `--pas-1` | 6 px   |
| `--pas-2` | 12 px  |
| `--pas-3` | 20 px  |
| `--pas-4` | 32 px  |
| `--pas-5` | 56 px  |
| `--pas-6` | 88 px  |

`--pas-6` sépare deux sections d'une page : c'est lui qui remplace le filet, conformément à la
règle 1.2. `--gouttiere` vaut 20 px et ne descend jamais en dessous, à aucune largeur.

---

## 5. Mouvement

Une seule courbe, `--sortie: cubic-bezier(0.23, 1, 0.32, 1)`, et une seule durée, `--duree: 140ms`.

Ce qui bouge, et rien d'autre :

- l'action principale se rétracte à la pression, `transform: scale(0.98)` ;
- le souligné d'un lien passe d'un décalage de 2 à 3 px au survol.

Ce qui ne bouge jamais :

- **aucune animation d'entrée**, ni au chargement, ni au défilement ;
- **aucune animation sur une action déclenchée au clavier** — quelqu'un qui enchaîne les réponses
  au clavier perçoit toute animation comme de la latence ;
- **l'anneau de focus apparaît instantanément**, `transition: none`.

Seules `transform` et `opacity` sont animables. Jamais une propriété de mise en page.

Tout survol est derrière `@media (hover: hover) and (pointer: fine)` : sur un écran tactile, un
appui déclenche le survol et produit un faux positif.

`prefers-reduced-motion: reduce` retire tout déplacement et **conserve les transitions de
couleur**, qui aident à comprendre plutôt que de distraire. Vérifié : la hauteur de page est
identique au pixel près avec et sans.

Un seul moment orchestré est prévu sur tout le site, la révélation du résultat. Il n'est pas encore
conçu, et il reste soumis aux règles ci-dessus.

---

## 6. Focus

`outline: 2px solid var(--couleur-signature)`, `outline-offset: 2px`, sans transition. Visible dans
les deux schémas, sur tous les fonds employés aujourd'hui.

Le lien d'évitement porte une bordure bronze de 2 px et un rayon actionnable : c'est un élément sur
lequel on agit.

---

## 7. Composants

### Implémentés dans `src/styles/base.css`

`.page` `.enveloppe` `.entete` `.contenu` `.pied` `.evitement` `.fil-ariane` `.mise-a-jour`
`.chantier` `.question` `.liste-articles` `.sources` `.signature` `.reserve` `.prose` `.action`,
plus les balises de contenu (titres, listes, listes de définitions, tableaux, `code`, `hr`).

**`.action` est le seul bouton plein du site.** Un écran n'en porte qu'un. Il dit ce qui se passe
(« Voir mes résultats »), jamais « Valider », et ne porte pas de flèche collée au texte.

### Spécifiés, pas encore implémentés

Le CSS ne contient que ce qui est utilisé : dans un projet à budget de performance, une règle morte
est une dette. Les composants ci-dessous sont figés ici et seront écrits quand leur balisage
existera.

**Plan de page d'article.** Une navigation, pas une décoration. Replié dans un `<details>` sur
téléphone, déplié et collant (`position: sticky`, `top: var(--pas-4)`) à partir de 1100 px, dans
une colonne de 13 rem à gauche de la colonne de lecture, séparée par `--pas-5`. Chaque entrée porte
une barre de gauche de 2 px en `--couleur-trait`, qui passe en `--couleur-signature` au survol et
au focus.

C'est une **table des matières, pas un indicateur de position** : sans JavaScript ni animation liée
au défilement, rien ne dit « vous êtes ici ». C'est un manque connu, accepté, à rouvrir si la
lecture des articles longs le demande.

---

## 8. Ce qui est refusé

Reprise de la section 9 du brief, qui reste opposable, plus ce que la direction ajoute.

- Fond crème avec serif contrasté et accent terracotta.
- Fond noir avec un seul accent vert acide.
- Contenu découpé en cartes arrondies identiques avec la même ombre grise douce.
- Étiquettes en capitales espacées au-dessus des titres.
- Flèches « → » collées au texte des boutons.
- Entrées en fondu-glissé sur les sections.
- Dégradés décoratifs.
- **Toute ombre portée.** La direction n'en emploie aucune, et il n'existe pas de token pour ça.
- **Toute couleur en dehors des tokens.** Y compris un vert « succès » ou un rouge « erreur » : un
  message d'erreur s'écrit, il ne se colore pas.
- **Toute seconde famille typographique.**
- **Tout `style=""`.** `astro.config.mjs` active `security.csp: true`, le build émet un `style-src`
  haché, et un attribut de style en ligne serait bloqué par le navigateur. Les valeurs dynamiques
  passent par des classes. Conséquence à prévoir sur `/resultat` : les longueurs de barre ne
  pourront pas passer par une propriété personnalisée en ligne.

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

- **Logo** : le rideau d'isoloir, dans ses déclinaisons (brief, section 4). Rien n'existe.
- **Favicon** : `public/favicon.svg` est encore celui d'Astro.
- **Carte partageable** : 1080 × 1350 et 1080 × 1920, générée côté client.
- **Écran de quiz** et **écran de résultat** : le seul endroit du site où la densité est permise.
- **Préchargement de la police** : `<link rel="preload">` sur le fichier latin réduirait le
  clignotement au premier rendu. À mesurer avant d'ajouter, pas à supposer.
