# Licences

Ce dépôt contient deux natures de travaux, sous deux licences différentes.

## Code source — GNU AGPL v3

Fichier : [`LICENSE-AGPL-3.0`](LICENSE-AGPL-3.0)

Relèvent de l'AGPL v3 :

- tout fichier `.ts`, `.js`, `.mjs`, `.astro`, `.svelte`, `.css` ;
- les fichiers de configuration à la racine (`astro.config.mjs`, `tsconfig.json`,
  `eslint.config.js`, `playwright.config.ts`, `vitest.config.ts`,
  `wrangler.jsonc`, `package.json`) ;
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

## Police de caractères — SIL Open Font License 1.1

Fichier : [`src/polices/OFL.txt`](src/polices/OFL.txt)

Relèvent de l'OFL 1.1 :

- `src/polices/bricolage-grotesque-latin.woff2` ;
- `src/polices/bricolage-grotesque-latin-ext.woff2`.

**Bricolage Grotesque**, par Mathieu Triay (`github.com/ateliertriay/bricolage`),
copyright 2022 The Bricolage Grotesque Project Authors. L'OFL autorise l'usage
commercial, la modification et l'auto-hébergement sans redevance, et impose de
conserver le texte de licence, ce que fait `src/polices/OFL.txt`. Elle interdit
de vendre la police seule et d'employer les noms réservés pour une version
modifiée.

**Les deux fichiers sont des versions modifiées** : l'axe de taille optique y est
figé à 28 et l'axe de graisse borné à 400-700, par instanciation avec fontTools.
L'OFL l'autorise explicitement. Le nom « Bricolage Grotesque » n'est pas un nom
réservé au sens de la licence — la police n'en déclare aucun — donc le conserver
est licite ; la modification est signalée ici et dans `src/styles/base.css` pour
qu'elle ne soit pas prise pour l'original.

Instrument Sans, employée jusqu'au 22 septembre 2026, a été retirée du dépôt avec
sa licence. L'historique git la conserve.

La police est auto-hébergée, pas appelée à distance : `font-src 'self'` l'impose,
et un test Playwright vérifie qu'aucune requête ne sort vers un domaine tiers.

## Portraits et logos — licences libres, une par fichier

Répertoire : [`public/medias/`](public/medias/) — manifeste :
[`src/data/medias.ts`](src/data/medias.ts) — page publique :
[`/credits-images`](src/pages/credits-images.astro).

Ces fichiers **ne sont pas couverts par les deux licences ci-dessus** : ils ne
sont ni du code de ce dépôt, ni des données produites par ce dépôt. Chacun porte
la sienne, relevée sur Wikimedia Commons en même temps que le téléchargement par
`scripts/recuperer-medias.mjs`, et republiée telle quelle sur `/credits-images`.

Licences rencontrées au 20 septembre 2026 : CC0, domaine public (logos composés
de texte, sous le seuil d'originalité), CC BY 3.0, CC BY 4.0, CC BY-SA 3.0,
CC BY-SA 4.0, et la licence de réutilisation du Parlement européen. CC BY et
CC BY-SA imposent de citer l'auteur et de nommer la licence : c'est la raison
d'être de `/credits-images`, et c'est pourquoi cette page est générée à partir
du manifeste et non tenue à la main.

**Trois règles qui ne se négocient pas.**

1. **Commons uniquement.** Un fichier présent sur `fr.wikipedia.org` mais absent
   de Commons y est au titre du _fair use_ américain, qui n'existe pas en droit
   français et ne se transmet à personne. Le script s'arrête si un fichier de sa
   table n'est pas sur Commons.
2. **Jamais depuis un site de parti ou de campagne.** Une image y est protégée
   par défaut, et l'absence de mention n'est pas une autorisation.
3. **Une case vide plutôt qu'une image non libre.** Quatre partis — France
   Libre, Génération écologie, Les Patriotes, Place publique — et un candidat —
   Antoine Mikolajczak — n'ont aucun média réutilisable. Ils n'en ont donc pas :
   l'interface affiche des initiales, et `/credits-images` dit pourquoi.

**Droit d'auteur et droit des marques sont deux choses distinctes.** La plupart
de ces logos sont libres de droit d'auteur — trop simples pour constituer une
œuvre — tout en restant des marques déposées. Ils servent ici à **désigner** un
parti, exactement comme son nom écrit le ferait ; cet usage référentiel ne vaut
ni cession, ni partenariat, ni approbation, et `/credits-images` l'écrit.

Une demande de retrait émanant d'un auteur ou d'un titulaire est honorée, et
consignée sur `/corrections`.

## Marque — tous droits réservés

La marque est une œuvre de l'éditeur, et **elle n'est couverte par aucune des deux
licences ci-dessus.** L'AGPL couvre le code qui l'affiche, pas le dessin.

Relèvent de ce régime :

- `src/marque/guide-isoloir.svg` et `src/marque/isoloir.svg`, les fichiers maîtres ;
- `src/marque/guide-isoloir-source.png`, le dessin d'origine ;
- `public/favicon.svg`, `public/apple-touch-icon.png` et
  `public/medias/marque/partage.png`, qui en dérivent.

Réutiliser le code de ce dépôt est libre ; s'en servir pour publier un site sous
le nom ou le signe **Guide Isoloir** ne l'est pas. C'est la contrepartie directe
du positionnement : un site dont l'argument est un éditeur identifié ne peut pas
laisser sa marque se porter par n'importe qui.

Le script qui produit les déclinaisons, `scripts/generer-marque.mjs`, est du
code : il relève de l'AGPL comme le reste de `scripts/`.

## Ni l'un ni l'autre

- `CLAUDE.md`, `DESIGN_SYSTEM.md` et le contenu de `docs/` sont des documents de
  travail internes. Ils ne sont pas publiés sous licence libre.
- Les textes rédactionnels des pages publiques (`/a-propos`, `/methodologie`,
  `/charte-editoriale`, `/financement`, `/mentions-legales`, `/corrections`)
  restent la propriété de leur auteur. Leur citation est libre dans les limites
  du droit de citation. Le balisage `.astro` qui les porte, lui, est sous AGPL.
- Les contenus de tiers cités (programmes, déclarations, documents officiels)
  restent soumis au droit de leurs auteurs.

## En cas de doute

Un fichier non listé ci-dessus et qui s'exécute relève de l'AGPL. Un fichier non
listé et qui décrit une position politique relève de CC BY-SA. Un fichier tiers
apporté dans le dépôt — police, icône, jeu de données — n'est jamais couvert par
défaut : il porte sa propre licence, à ajouter ici avant d'être commité.
