# Cases non couvertes

Une ligne par couple (acteur, affirmation) que les documents consultés **n'abordent
pas**, ou qu'ils abordent sans répondre à l'affirmation posée.

Ce fichier n'est pas un pense-bête : c'est le plan de travail de l'ingestion des
scrutins. Chaque ligne dit quel document a été lu, à quelle date, et pourquoi la case
est restée vide. Une case vide documentée vaut mieux qu'une case remplie par
approximation — et elle indique exactement où chercher ensuite.

**Convention.** « Muet » : le document n'aborde pas le sujet. « Aborde sans répondre » :
le document parle du sujet mais ne répond pas à la mesure posée par l'affirmation, et
coder quand même supposerait une inférence.

---

## Rassemblement national (`parti-rassemblement-national`)

Documents consultés le **19 septembre 2026**, lus intégralement :

| Clé  | Document                                                                                                                                             | Date            |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| L24  | [L'Union fait la France — législatives des 30 juin et 7 juillet 2024](https://rassemblementnational.fr/documents/202406-programme.pdf)               | 25 juin 2024    |
| E24  | [Notre projet pour une Europe des nations — européennes du 9 juin 2024](https://rassemblementnational.fr/documents/202411-programme-europeennes.pdf) | 6 mai 2024      |
| CB26 | [Contre-budget 2026, groupe RN à l'Assemblée](https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf)                                 | 23 octobre 2025 |

Aucun projet présidentiel 2027 n'existe : le RN n'en a pas publié et n'a pas désigné
son candidat. 11 cases codées sur 24 ; les 13 ci-dessous sont vides.

| questionId                                          | Documents      | Constat                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retraites-age-legal-60`                            | L24, E24, CB26 | Muet. L24 annonce « un système de retraites progressif » sans aucun âge. Aucun document ne cite 60 ans.                                                                                                                                                                                                                                                                       |
| `retraites-indexation-esperance-vie`                | L24, E24, CB26 | Muet. CB26 porte une ligne « Indexation des retraites » qui vise le montant des pensions sur l'inflation, pas l'âge sur l'espérance de vie. Ne pas confondre.                                                                                                                                                                                                                 |
| `retraites-part-capitalisation`                     | L24, E24, CB26 | Muet. Le mot « capitalisation » n'apparaît dans aucun des trois documents.                                                                                                                                                                                                                                                                                                    |
| `fiscalite-bareme-unique-capital-travail`           | L24, CB26      | Aborde sans répondre. CB26 crée des taxes ciblées (superdividendes, rachats d'actions, transactions intra-journalières) mais ne dit rien du barème applicable aux revenus du capital.                                                                                                                                                                                         |
| `budget-reduction-dette-par-depenses`               | L24, CB26      | **Aborde sans répondre, et c'est délibéré.** CB26 fait les deux à la fois : 57 Mds€ de baisses de dépenses ET 31 Mds€ de recettes nouvelles. Aucun document n'énonce de priorité de la dépense sur la recette. Coder un accord reviendrait à lire un principe dans une arithmétique — exactement l'erreur que `CLAUDE.md` signale à propos des « 125 milliards d'économies ». |
| `chomage-reduction-duree-indemnisation`             | L24            | **Aborde sans répondre — candidat n° 1 pour le lot suivant.** L24 porte « Annulation de la réforme de l'assurance chômage de juillet 2024 ». Coder exige d'établir le contenu de cette réforme, qui ne figure dans aucun document consulté : ce serait une inférence. À reprendre avec le texte de la réforme ou un scrutin.                                                  |
| `immigration-plafond-titres-sejour`                 | L24, E24       | Muet. Les deux chapitres migratoires ont été lus en entier : expulsions, regroupement familial, asile en ambassade, Frontex, Schengen, AME. Aucun plafond annuel de titres de séjour.                                                                                                                                                                                         |
| `vote-etrangers-elections-municipales`              | L24, E24       | Muet. Aucune occurrence du droit de vote des étrangers.                                                                                                                                                                                                                                                                                                                       |
| `agriculture-renforcement-normes-environnementales` | L24, E24       | Aborde sans répondre. L24 refuse « toute écologie punitive » en visant « les ménages et les entreprises », et son chapitre agricole ne traite que d'importations, de prix rémunérateurs, d'étiquetage et de cantines. Rien sur les obligations environnementales pesant sur les agriculteurs français.                                                                        |
| `institutions-proportionnelle-legislatives`         | L24, E24       | Muet. Le mot « proportionnelle » n'apparaît nulle part.                                                                                                                                                                                                                                                                                                                       |
| `institutions-maintien-article-49-3`                | L24, E24       | Muet. Aucune occurrence de l'article 49.3. L24 évoque « tous les leviers politiques et institutionnels que la Constitution donne au gouvernement » sans nommer aucun article.                                                                                                                                                                                                 |
| `international-financement-soutien-ukraine`         | L24, E24       | Aborde sans répondre. E24 décrit l'invasion russe et constate que les nations européennes ont été « empêchées […] dans leur volonté politique de soutenir matériellement l'Ukraine ». C'est un constat, pas un engagement de financement. E24 refuse par ailleurs l'élargissement de l'UE à l'Ukraine, ce qui est une autre question.                                         |
| `europe-opposition-parlementaire-traite`            | E24            | Aborde sans répondre. E24 propose un référendum sur « la primauté de la Constitution française sur les décisions des juges européens en matière d'immigration » : il s'agit des décisions de juges, pas de l'application d'un traité, et du peuple par référendum, pas du Parlement. Deux écarts, pas un.                                                                     |

---

## Mise à jour du 20 septembre 2026

**Une case rouverte.** `chomage-reduction-duree-indemnisation` pour le RN était classée
« aborde sans répondre » : l'annulation d'une réforme ne disait rien de la durée tant que
le contenu de cette réforme n'était pas établi. Il l'est désormais — la réforme abaissait
la durée — et la case est codée à −1, adéquation partielle. Le Nouveau Front populaire
porte le même engagement et reçoit le même codage : coder l'un sans l'autre aurait déplacé
la couverture, donc la présence au classement, sans qu'aucune différence politique ne le
justifie.

## Nouveau Front populaire (`coalition-nouveau-front-populaire`)

Document consulté le **20 septembre 2026** : [Contrat de législature](https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf),
27 juin 2024, 26 pages, lu intégralement. 18 cases codées sur 24.

| questionId                                    | Constat                                                                                                                                                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `retraites-indexation-esperance-vie`          | Muet. Le chapitre retraites indexe le MONTANT des pensions sur les salaires, jamais l'âge sur l'espérance de vie. Ne pas confondre.                                                                                                                                      |
| `retraites-part-capitalisation`               | Muet. Le mot « capitalisation » n'apparaît nulle part.                                                                                                                                                                                                                   |
| `energie-nouveaux-reacteurs-nucleaires`       | **Muet, et le silence est délibéré.** Le texte ne parle du nucléaire que pour la sûreté (fusion ASN/IRSN) et pour l'Ukraine (casques bleus sur les centrales). Les signataires ne s'accordent pas : le combler par déduction fabriquerait un consensus qui n'existe pas. |
| `transport-suppression-zfe`                   | Muet. Aucune occurrence des zones à faibles émissions.                                                                                                                                                                                                                   |
| `institutions-elargissement-champ-referendum` | Aborde sans répondre. Le texte abaisse le seuil de signatures du référendum d'initiative partagée, ce qui touche au déclenchement et non au CHAMP de l'article 11, et ne mentionne pas la politique migratoire.                                                          |
| `europe-controles-frontieres-schengen`        | Aborde sans répondre. « Instaurer un protectionnisme écologique et social aux frontières de l'Europe » vise les frontières extérieures et les échanges commerciaux, pas les contrôles intérieurs de Schengen.                                                            |

## Les Républicains (`parti-les-republicains`)

Document consulté le **20 septembre 2026** : [Maîtriser notre destin](https://www.les-centristes.fr/sites/default/files/lescentristes-lesrepublicains-programme-elections-europeennes-programme.pdf),
programme des européennes du 9 juin 2024, 58 pages, lu intégralement. 10 cases codées sur 24.

Le parti n'a publié **aucun** programme pour les législatives de 2024, faute de direction après
le ralliement d'Éric Ciotti au RN. Ce programme européen est son dernier texte complet.

Les quatorze cases vides le sont **structurellement** : un programme européen ne traite ni de
l'âge de la retraite, ni de l'abrogation de la réforme de 2023, ni de la capitalisation, ni de
l'ISF, ni du barème du capital, ni de la dette, ni de l'assurance chômage, ni des ZFE, ni de la
proportionnelle, ni du RIC, ni du 49.3, ni du vote des étrangers — ces sujets ne relèvent pas du
Parlement européen. Sur `europe-decisions-majorite-qualifiee`, le texte est muet : il défend la
subsidiarité et les coopérations renforcées sans jamais discuter unanimité contre majorité
qualifiée.

## Debout la France (`parti-debout-la-france`)

Six chapitres du projet consultés le **20 septembre 2026**, lus intégralement. 14 cases codées
sur 24. Chaque chapitre porte sa propre date de dernière modification, et chaque position cite
le chapitre dont elle vient :

| Chapitre                               | Dernière modification |
| -------------------------------------- | --------------------- |
| Retraites                              | 5 février 2024        |
| Environnement et Énergie               | 29 octobre 2025       |
| Agriculture                            | 16 février 2026       |
| Automobilistes et motards              | 16 février 2026       |
| Immigration et assimilation            | 3 mars 2026           |
| Refonder et moraliser notre démocratie | 9 juin 2026           |

Le site annonce lui-même travailler à « l'actualisation de notre programme pour l'élection
présidentielle de 2027 » : ces codages sont provisoires par construction. Le chapitre retraites
raisonne encore sur la réforme de 2010 et cite des candidats proposant « 63/67 ans », langage de
la campagne de 2022 — d'où l'avertissement d'ancienneté sur les deux positions qui en découlent.

Dix cases vides : ni impôt sur la fortune, ni barème du capital, ni durée d'indemnisation du
chômage dans le chapitre économique ; ni proportionnelle, ni 49.3 dans le chapitre démocratique ;
aucun chapitre ne traite de la capitalisation, de l'abrogation de la réforme de 2023, ni du vote
à la majorité qualifiée au Conseil.

## Les Patriotes (`parti-les-patriotes`)

Document consulté le **20 septembre 2026** : [Grandes orientations pour un projet patriote](https://les-patriotes.fr/wp-content/uploads/2026/09/projet-pour-la-france-2026.pdf),
édition 2026-2027, 19 pages, publié le 3 septembre 2026. 5 cases codées sur 24.

Le document le plus récent du dossier, et le plus tranché — mais il est **organisé autour du
Frexit** : presque tout y est traité par le prisme de la sortie de l'Union. D'où dix-neuf cases
vides, et non par défaut de lecture. Le projet ne dit rien de l'ISF, du barème du capital, de la
durée d'indemnisation du chômage, du droit du sol, de la régularisation, du vote des étrangers,
des ZFE, de la proportionnelle, du 49.3 ni du référendum d'initiative citoyenne.

**Piège d'extraction évité, à retenir.** Le PDF est composé en colonnes. Une extraction
`pdftotext -layout` recollait des bouts de phrases appartenant à des colonnes différentes et
produisait des citations qui n'existent pas dans le document. Les citations ont été relevées sur
une extraction en ordre de lecture, puis relues dans le PDF. Toujours vérifier une citation issue
d'un PDF multicolonne.

## David Lisnard (`david-lisnard`)

Cinq chapitres du programme consultés le **20 septembre 2026** sur
`unenouvelleenergie.fr/notre-programme/`. **11 cases codées sur 24, toutes en
`official-program` et toutes en propre** : c'est le deuxième programme présidentiel
structuré trouvé, après celui de Mélenchon, et le candidat le mieux documenté en son nom.

**La date vient du sitemap, et il faut le dire.** Aucune de ces pages ne porte de date, ni
dans son texte ni dans ses métadonnées d'article. Le sitemap les horodate toutes au
31 juillet 2026. Sans lui, il aurait fallu renoncer à coder un programme complet faute de
pouvoir le dater.

Treize cases vides : le programme ne traite ni de l'abrogation de la réforme de 2023, ni de
l'indexation sur l'espérance de vie, ni de l'ISF, ni du barème du capital, ni de la durée
d'indemnisation du chômage, ni du vote des étrangers, ni des ZFE, ni de la proportionnelle, ni
du RIC, ni du 49.3, ni de la majorité qualifiée, ni de l'Ukraine. Sur Schengen, « le meilleur
contrôle effectif des frontières » y figure, mais sans nommer Schengen ni le caractère permanent
des contrôles : **aborde sans répondre**.

## Solution démocratique (`parti-solution-democratique`)

Une case sur 24, et c'est le total honnête. Le parti de Clara Egger a un programme tenant en une
proposition — le référendum d'initiative citoyenne constituant — et ne se prononce sur rien
d'autre. Les vingt-trois cases vides le sont parce que le parti est muet, pas parce que la
recherche a manqué.

## Bloc central : Attal et Philippe (`gabriel-attal`, `edouard-philippe`)

**Trois cases à eux deux, et c'est le constat le plus net du dossier.** Les deux candidats les
mieux placés du bloc central n'ont publié aucun texte programmatique. Ce qui est codable d'eux
tient dans deux articles de LCP.

Gabriel Attal ne répond pas à la question des retraites, il en conteste la pertinence : il veut
supprimer l'âge légal. Le codage retenu est −1 en adéquation partielle, avec le raisonnement
écrit — un âge abaissé à 60 ans est incompatible avec la suppression de l'âge légal, mais la
mesure posée n'est pas discutée.

## Candidats sans aucune position documentée

Huit sur vingt, au 20 septembre 2026, et pour des raisons différentes :

| Candidat                | Ce qui a été cherché, et ce qui a été trouvé                                                                                                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Éric Zemmour**        | `parti-reconquete.fr` ne renvoie que vers `leprogrammepourlafrance.fr`, plateforme de contributions citoyennes sans texte arrêté. L'article de LCP sur sa candidature du 17 septembre 2026 ne contient **aucune** proposition de fond, vérifié. |
| **Xavier Bertrand**     | `nousfrance.fr` a des pages `/programme/<thème>/`, mais elles font 35 à 113 mots, sont des coquilles sans mesures, et le sitemap les date de **2021**. `xavierbertrand.fr` n'a aucune page de programme.                                        |
| **Delphine Batho**      | Le « projet » de Génération écologie est un texte doctrinal sur la décroissance et l'écologie intégrale. Aucune mesure ne répond à l'une des 24 affirmations. Muet, pas absent.                                                                 |
| **Nathalie Arthaud**    | `lutte-ouvriere.org` ne sert aucun lien exploitable au relevé — page rendue côté client.                                                                                                                                                        |
| **François Asselineau** | `upr.fr/notre-programme` renvoie 60 mots : contenu entièrement rendu côté client.                                                                                                                                                               |
| **Antoine Mikolajczak** | `equinoxe.fr` est un homonyme — un cabinet de conseil, pas le parti. Le site du mouvement n'a pas été identifié avec certitude, et il n'a donc pas été utilisé.                                                                                 |
| **Francis Lalanne**     | Aucun site de France Libre identifié.                                                                                                                                                                                                           |
| **Clara Egger**         | Une case codée depuis Solution démocratique (voir ci-dessus) : elle n'est donc plus à zéro.                                                                                                                                                     |

## Un conflit de chaîne à trancher, non résolu

LCP du 19 juin 2026 rapporte que le **Parti socialiste** veut « ramener l'âge légal à 62 ans ».
Cette position n'a **pas** été codée, et c'est délibéré : le contrat du Nouveau Front populaire,
de juin 2024, porte « l'objectif commun du droit à la retraite à 60 ans » pour le même candidat
(Karim Bouamrane). Or `coalition-platform` prime sur `party-platform` dans la chaîne de
résolution, et `updatedAt` est la date de CODAGE, pas celle de la déclaration : coder les deux
ferait afficher la position de 2024 alors qu'une position de 2026 existe.

Le corriger suppose une décision éditoriale — inverser l'ordre des deux maillons, ou faire
départager par la date de déclaration — qui dépasse une mise à jour de données. À trancher avant
la prochaine campagne de codage.

## Relevé du 25 septembre 2026

### Les Écologistes (`parti-les-ecologistes`)

Document lu : [Projet 2027, 557 mesures](https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf),
PDF modifié le 25 août 2026, passé au crible des 24 affirmations. 17 cases codées ; les 7
ci-dessous sont vides.

| questionId                                    | Constat                                                                                                                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retraites-indexation-esperance-vie`          | Muet. « Espérance de vie » n'apparaît que dans des constats, jamais à propos de l'âge de départ.                                                                                              |
| `fiscalite-bareme-unique-capital-travail`     | Aborde sans répondre. « Taxer plus fortement le capital que le travail », mais en augmentant la flat tax de 3 points : le prélèvement forfaitaire est gardé, pas remplacé par le barème.      |
| `chomage-reduction-duree-indemnisation`       | Aborde sans répondre. Le programme abroge « les réformes régressives » et nomme celle du calcul de l'allocation, qui porte sur le montant, pas sur la durée. Coder supposerait une inférence. |
| `immigration-plafond-titres-sejour`           | Muet sur un plafond. Le programme traite du renouvellement des titres et du regroupement familial, pas d'un nombre annuel.                                                                    |
| `institutions-elargissement-champ-referendum` | Muet. Le RIC propositionnel ou abrogatif est codé sur l'affirmation voisine ; rien sur l'article 11 ni sur la politique migratoire.                                                           |
| `europe-controles-frontieres-schengen`        | Muet. Aucune occurrence de Schengen.                                                                                                                                                          |
| `europe-opposition-parlementaire-traite`      | Muet. Le programme veut réformer les traités, pas permettre au Parlement de s'opposer à leur application.                                                                                     |

### Le conflit de chaîne, tranché pour un seul cas

La section précédente laissait ouvert le conflit entre un contrat de coalition de 2024 et une
ligne de parti récente. Il est tranché **pour Marine Tondelier seulement**, par une règle écrite
dans `src/data/acteurs.ts` : un programme de parti publié POUR 2027 passe avant le contrat du NFP.
Les Écologistes sont le seul parti signataire à en avoir publié un ; leur candidate reprend donc
d'abord Les Écologistes, puis le NFP pour ce que leur programme ne couvre pas. La position du PS
sur les 62 ans, rapportée par la presse et non tirée d'un programme, reste non codée : la règle ne
la débloque pas.

### Candidats ajoutés, et positions tirées des sources de statut

- **Nathalie Arthaud** : le discours du 24 mai 2026 publié par Lutte ouvrière est lisible ; deux
  cases codées (régularisation, plafond des titres de séjour).
- **Selma Labib** : trois cases codées, depuis une intervention d'avril 2024 antérieure à sa
  candidature, signalée comme telle. La recherche préparatoire lui attribuait une intervention de
  septembre 2026 sur la liberté de circulation : la phrase venait en réalité d'un orateur de
  Révolution permanente. Non reprise.
- **Anasse Kazib** : deux cases (retraite à 60 ans, régularisation), depuis le compte rendu de son
  mouvement. Le SMIC à 2 000 € n'est pas une affirmation du test ; il figure dans ses propositions,
  sans préciser brut ou net, parce que la source ne le précise pas.
- **Clara Egger** : la case du RIC passe de la reprise de son parti à son propre programme.
- **Olivier Becht, Olivier Faure, Jérôme Guedj, Emmanuel Maurel, Ségolène Royal, François
  Ruffin** : aucune source lue ne répond à l'une des 24 affirmations. Faure et Guedj reprennent le
  contrat du NFP comme les autres candidats du PS.

## Ce qui manque encore, par ordre de rendement

État au 20 septembre 2026 : **93 positions, 31 sources, 12 candidats sur 20 documentés**, dont
huit au-dessus du seuil de publication.

1. **Renaissance et Horizons.** Le projet « Besoin d'Europe » de 2024 couvre Attal et Philippe à
   la fois, mais son texte intégral n'est plus accessible : `besoindeurope.fr/projet` n'en sert
   qu'un résumé, et le raccourcisseur `bdeuro.pe` vers le PDF ne résout plus. Chercher une copie
   archivée.
2. **Les sites rendus côté client** — Lutte ouvrière, UPR, Reconquête. Leur contenu existe mais
   n'est pas lisible par une simple requête HTTP.
3. **Le conflit de chaîne ci-dessus**, qui débloquerait le codage des lignes de parti récentes
   pour les quatre candidats que couvre encore le Nouveau Front populaire.
4. **Place publique** (Glucksmann, 4 cases). Sa qualité de signataire du Nouveau Front populaire
   n'a pas pu être confirmée sur une source fiable : la reprise de la coalition ne lui est donc
   pas appliquée, ni à Génération écologie. Une reprise attribuée à tort est pire qu'une case vide.

## Relevé du 12 octobre 2026

Après la primaire sociale-démocrate et la veille du 12 octobre. Tous les codages ci-dessous sont
des **brouillons** (`draft`) ; voici ce qui a été lu sans pouvoir être codé.

**Raphaël Glucksmann** (`raphael-glucksmann`). Documents lus : les comptes rendus LCP des trois
débats de la primaire (23 septembre, 1er et 4 octobre), la synthèse LCP du 9 octobre, l'article
LCP du 26 mai sur son livre, et franceinfo du 11 octobre. Codé : régularisation, Ukraine, veto
européen, et une nouvelle formulation pour les 60 ans.

| questionId                              | Constat                                                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retraites-indexation-esperance-vie`    | Aborde sans répondre. Le livre veut intégrer « un critère d'espérance de vie en bonne santé » pour faire partir plus tôt les carrières pénibles et plus tard les cadres : une modulation, pas une indexation automatique. |
| `retraites-part-capitalisation`         | Aborde sans répondre. Le compte rendu du 4 octobre écrit « ils y sont opposés » juste après une phrase sur Guedj et Faure : le sujet du verbe est ambigu, et rien ne nomme Glucksmann.                                    |
| `fiscalite-impot-fortune`               | Aborde sans répondre. Il veut taxer les « méga héritages » et réformer le pacte Dutreil, ce qui est une autre mesure qu'un impôt sur la fortune. En propositions, hors score.                                             |
| `budget-reduction-dette-par-depenses`   | Aborde sans répondre. L'État doit « montrer l'exemple », mais la dette « vient avant tout de la désindustrialisation » : aucune priorité de la dépense sur la recette.                                                    |
| `energie-nouveaux-reacteurs-nucleaires` | Déjà codé (+1, partielle). « La France a besoin des deux », le 4 octobre, confirme sans parler de nouveaux réacteurs.                                                                                                     |

**Édouard Philippe** (`edouard-philippe`). Euronews du 9 octobre (_L'Heure de vérité_, France 2,
le 8) et CNews du 3 octobre. `international-financement-soutien-ukraine` : il « a réaffirmé son
soutien à l'Ukraine », sans parler de financement ni de soutien militaire. Aborde sans répondre.

**Rassemblement national** (`parti-rassemblement-national`). Le contre-budget 2027, présenté le
6 octobre, n'a pas été trouvé en ligne au 12 octobre. L'article de CNews lu est paru le matin
même : il en donne les annonces, pas le contenu. Rien n'a été codé, à reprendre quand le document
sera publié. La « règle d'or » de Marine Le Pen plafonne un déficit, sans dire si la dette doit
baisser d'abord par la dépense. `budget-reduction-dette-par-depenses` : aborde sans répondre.
Elle figure en proposition.

**Debout la France** (`parti-debout-la-france`). Page « Économie » du projet, modifiée le
10 octobre. `budget-reduction-dette-par-depenses` : aborde sans répondre, car le déficit y est
« le produit d'un excès de dépenses et d'une faiblesse de nos recettes ». Les deux leviers sont
proposés, sans priorité énoncée.

**Juan Branco** (`juan-branco`). Programme « La Voie », 845 mesures, lu en entier par mots-clés
des 24 affirmations. Sept cases codées.

| questionId                                  | Constat                                                                                                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chomage-reduction-duree-indemnisation`     | Aborde sans répondre. « Dégressivité des allocations chômage à partir de la première année » : la dégressivité n'est pas la durée.                  |
| `retraites-indexation-esperance-vie`        | Aborde sans répondre. Les taux de retour seraient fixés « selon l'espérance de vie par catégorie sociale et professionnelle » : le taux, pas l'âge. |
| `immigration-regularisation-par-le-travail` | Aborde sans répondre. Des critères d'intégration « dans le cadre des régularisations », sans dire qui serait régularisé.                            |
| `institutions-proportionnelle-legislatives` | Aborde sans répondre. La proportionnelle vise l'élection d'une assemblée constituante, pas celle des députés.                                       |
| `energie-nouveaux-parcs-eoliens`            | Muet. Seul le photovoltaïque est traité.                                                                                                            |

**Fabien Roussel**. CNews, le 3 octobre : il « n'a pas encore présenté de projet détaillé sur
les retraites pour 2027 ». Sa position de 2022 n'est pas une source pour 2027 : rien n'est codé.

**Bruno Retailleau**. La case `retraites-abrogation-reforme-2023` reste une inférence publiée le
19 septembre. CNews ne parle pas de la réforme de 2023 à son sujet.

## Relevé du 13 octobre 2026

### Jean-Luc Mélenchon (`jean-luc-melenchon`)

Document lu intégralement :
[L'Avenir en commun, édition 2025](https://melenchon2027.fr/wp-content/uploads/2025/02/A5-PROGRAMME-SITE.pdf),
69 pages A5 (136 pages de livre), PDF créé le 18 février 2025, sans date imprimée, SHA-256
`da9f73405a5e0f6efc4da9fd4f907de5a0822eeade54e993f8c6e9e60d0c78c8`. Il a été passé au crible des
24 affirmations.

**Ce texte est antérieur aux chapitres déjà cités.** Les sources `aec2027-chapitre-6`, `-8`,
`-10`, `-13` et `-16` sont une réactualisation mise en ligne en juillet 2026, dont le texte
diffère : sur les neuf citations qui en sont tirées, seules celles du chapitre 16 se retrouvent
dans le PDF. **Au 13 octobre, ces cinq URL renvoient une erreur 404.** La page
`programme2025/livre/` annonce une nouvelle version. Les huit positions concernées ne changent
pas : le titre et la date de consultation de chaque source permettent encore de la vérifier.

Dix cases sont codées à partir du PDF. Elles portent l'avertissement d'ancienneté :
abrogation de la réforme de 2023, chômage, dette, proportionnelle, 49.3, RIC, nucléaire, éolien,
ZFE et application des traités. Celle du nucléaire était vide : le contrat du NFP se taisait sur
ce sujet. Celle des ZFE est codée 0, parce que le moratoire suspend les ZFE « dans leur
conception actuelle » tout en leur reprochant de tolérer les SUV.

| questionId                                    | Constat                                                                                                                                                                                                                                             |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retraites-indexation-esperance-vie`          | Muet. « Indexer le montant des retraites sur les salaires » porte sur le montant, jamais sur l'âge.                                                                                                                                                 |
| `retraites-part-capitalisation`               | Muet. Le mot « capitalisation » n'apparaît nulle part.                                                                                                                                                                                              |
| `institutions-elargissement-champ-referendum` | Aborde sans répondre. Le RIC permettrait de « proposer ou abroger une loi », et le référendum deviendrait obligatoire pour un nouveau traité européen. Rien sur l'article 11 ni sur la politique migratoire. Même lecture que pour Les Écologistes. |
| `europe-decisions-majorite-qualifiee`         | Muet. Le chapitre 17 veut « utiliser le droit de veto de la France », ce qui n'est pas une réponse sur l'extension de la majorité qualifiée. **La case reste tenue par le contrat du NFP (+2).**                                                    |
| `international-financement-soutien-ukraine`   | Aborde sans répondre. « Agir pour créer un cadre diplomatique permettant d'obtenir un cessez-le-feu » ; ni armes ni financement. **La case reste tenue par le contrat du NFP (+2, « livraison d'armes ») : à relire.**                              |
| `europe-controles-frontieres-schengen`        | Aborde sans répondre. « Sortir de l'impasse de la politique de Schengen et Frontex » ne dit pas si des contrôles intérieurs seraient rétablis.                                                                                                      |

**83 propositions** (registre hors score) : toutes les « mesures clés » que le livre encadre
lui-même, soit 87 sur ses 831 mesures, moins quatre. Trois sont déjà couvertes par une
proposition plus récente : la retraite à 60 ans, le blocage des prix et la règle verte. La
quatrième est le SMIC à 1 600 € net, que la page de La France insoumise porte désormais à 1 700 €.
Le chapitre 17 (Europe) n'encadre aucune mesure. Les quelque 750 autres mesures du livre ne sont
pas relevées : à ce volume, la fiche candidat devra d'abord être repensée.

### Les Écologistes (`parti-les-ecologistes`), relevé intégral

Même document que le 25 septembre :
[Pour une prospérité écologique](https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf),
208 pages, modifié le 25 août 2026 (même date de modification qu'à la première lecture), SHA-256
`2fafd160291ff6677207c57ce1504ae6e62608cd19d8310e01a522b95beb50fc`. Il avait déjà été passé au
crible des 24 affirmations, et **aucune position ne change**.

**547 propositions ajoutées** au registre hors score. Le programme annonce 557 mesures mais en
numérote 551 : la mesure 6 du chapitre 4 n'existe pas, et le chapitre 57 porte deux mesures 4.
Les quatre mesures déjà relevées le 25 septembre gardent leur entrée (nucléaire, pesticides,
proportionnelle, Ukraine). Deux anciennes entrées citent un passage situé à l'intérieur d'une
mesure : l'ISF dans la mesure 17-1, le vote à 16 ans dans la mesure 49-4. Ces deux mesures ont
désormais aussi leur entrée complète, puisqu'elles contiennent autre chose (taxe Zucman,
inscription automatique).

Le relevé est mécanique, et sa règle est écrite en tête du bloc dans `src/data/programmes.ts`.
L'intitulé est le titre que le parti donne à la mesure (texte en vert du PDF). La citation est le
début de la mesure, mot pour mot, coupé à une fin de phrase sous 320 signes. Le domaine suit le
chapitre, et la portée suit une liste de verbes publiée. 539 citations ont été retrouvées mot pour
mot dans le texte extrait par pdftotext. Les 12 autres viennent de la couche texte du PDF, où les
colonnes s'enchaînent dans un ordre différent. Deux césures de fin de ligne y ont été recollées
(« environne-mentaux », « souverai-neté »).

### Place publique (`parti-place-publique`), pour Raphaël Glucksmann

Document lu intégralement :
[Acte un, notre vision pour la France](https://place-publique.eu/document/3Ari5O0s5O1L4iK1uyUhI0/pp-acte-un.pdf),
88 pages, sans date imprimée. Le nom interne du fichier date le bon à tirer du 23 juin 2025 ; le
PDF a été réenregistré le 25 mars 2026. SHA-256
`271584d5d20716c879b0fec1bc54794df5973d42b646ca0f1526162d49e43c08`. Raphaël Glucksmann en est
co-directeur de la publication, mais le texte reste celui du parti : les positions sont des
`party-platform` et portent l'avertissement d'ancienneté.

**Quatorze cases codées pour le parti.** Sept d'entre elles comblent des cases vides chez
Raphaël Glucksmann, qui passe de 7 à 14 affirmations documentées : chômage, plafond des titres
de séjour, vote des étrangers, agriculture, proportionnelle, RIC et 49.3. Les sept autres
doublent une position plus récente du candidat lui-même, qui reste celle affichée.

| questionId                                    | Constat                                                                                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retraites-indexation-esperance-vie`          | Aborde sans répondre. Le parti veut fonder les retraites « sur les inégalités de conditions et d'espérance de vie » : une modulation, pas une indexation automatique. |
| `retraites-part-capitalisation`               | Muet.                                                                                                                                                                 |
| `fiscalite-impot-fortune`                     | Aborde sans répondre. « Effort fiscal nouveau, ciblé sur les très hauts patrimoines » : pas d'impôt sur la fortune nommé.                                             |
| `fiscalite-bareme-unique-capital-travail`     | Aborde sans répondre. Un « rééquilibrage de la fiscalité entre le travail, le capital et l'héritage », sans barème commun.                                            |
| `budget-reduction-dette-par-depenses`         | Aborde sans répondre. Un « mix responsable d'économies ciblées et de recettes nouvelles », sans priorité de l'un sur l'autre.                                         |
| `nationalite-suppression-droit-du-sol`        | Muet.                                                                                                                                                                 |
| `transport-suppression-zfe`                   | Muet.                                                                                                                                                                 |
| `institutions-elargissement-champ-referendum` | Muet sur l'article 11 et sur la politique migratoire.                                                                                                                 |
| `europe-controles-frontieres-schengen`        | Muet.                                                                                                                                                                 |
| `europe-opposition-parlementaire-traite`      | Muet. Le projet est fédéraliste, mais il ne dit rien du Parlement face à un traité ratifié : rien n'est déduit.                                                       |

**255 propositions** (registre hors score) : toutes les mesures des 42 chantiers et du chantier
cadre. Le document ne titre pas ses mesures, donc l'intitulé reprend le début de la mesure. 254
citations ont été retrouvées mot pour mot dans le texte extrait. La 255e (« Lancer une Coalition
Internationale pour la démocratie et les droits. ») est éclatée par la mise en page et vient de la
couche texte du PDF. Neuf mesures sans puce visible, sur les pages 34, 64, 78 et 82, ont été
ajoutées à la main après vérification sur la page.

**Correction sur Les Écologistes (mesure 62-7).** Le contrôle de publication a refusé la parenthèse
du programme qui propose de qualifier la « Coalition des volontaires » d'opération extérieure : il
la prenait pour un espace réservé oublié. La citation s'arrête désormais avant la parenthèse, et
`precisions` dit ce qui suit.

### Les Républicains (`parti-les-republicains`), pour Bruno Retailleau

Documents lus : les huit livrets « Nos propositions pour la France » de
[republicains.fr/nos-propositions](https://republicains.fr/nos-propositions/) :

- Le travail gagnant, décembre 2025 ;
- Produire plus, février 2026 ;
- Agriculture, février 2026 ;
- Électricité, mai 2026 ;
- Famille, avril 2026 ;
- Logement, mai 2026 ;
- IA, juillet 2026 ;
- École, septembre 2026.

Les quatre premiers ont été lus intégralement. Les quatre autres ont été passés au crible des 24
affirmations par mots-clés, et ne répondent à aucune.

**Position remplacée, avec une entrée au registre des corrections.** Le programme européen de
2024 tenait la case des nouveaux réacteurs nucléaires à +1 ; le livret Électricité la porte à +2
(six EPR2, puis huit de plus).

**Deux positions changent de source sans changer de valeur** : agriculture à −2 (réautorisation
de néonicotinoïdes) et éolien à −1 (fin des appels d'offres publics, mais pas de moratoire). Elles
ont aussi leur entrée au registre.

**Deux cases nouvelles.** La durée d'indemnisation du chômage est à +2 : le parti reprend la
réduction de 18 à 15 mois. La part de capitalisation est à +2 : un étage d'épargne retraite
s'ajoute à la répartition. Sur la seconde, la position personnelle de Bruno Retailleau, plus
récente, reste celle qui s'affiche.

Restent tenues par le programme européen de 2024, faute de réponse dans les livrets : droit du
sol, plafond des titres de séjour, régularisation, champ du référendum, Schengen, Ukraine et
traités. Le livret Logement renvoie à un « projet immigration » qui n'était pas en ligne au
13 octobre.

**76 propositions** (registre hors score), une par fiche. Leur citation est le titre que le
livret donne à la fiche, mot pour mot. J'ai essayé de citer plutôt la première phrase
d'engagement (« Nous … ») de chaque fiche, et j'y ai renoncé : elle tombait trop souvent sur un
constat ou une transition, par exemple « Nous mettrons fin à cette spirale. ».
