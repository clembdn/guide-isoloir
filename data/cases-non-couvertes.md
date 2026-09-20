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

## Ce qui manque encore, par ordre de rendement

État au 20 septembre 2026 : **78 positions, 23 sources, 11 candidats sur 20 documentés**, dont
sept au-dessus du seuil de publication. Chacune des 24 affirmations est documentée pour au moins
un candidat.

1. **Éric Zemmour (Reconquête).** Aucun programme 2027 n'existe : `parti-reconquete.fr` ne renvoie
   que vers `leprogrammepourlafrance.fr`, plateforme de contributions citoyennes sans texte
   arrêté. Le programme de 2022 n'est plus hébergé par le parti. À reprendre dès publication.
2. **Renaissance et Horizons** (Attal 1 case, Philippe 2). Le projet « Besoin d'Europe » de 2024
   couvre les deux à la fois, mais son texte intégral n'est plus accessible : `besoindeurope.fr/projet`
   n'en sert qu'un résumé en trois axes, et le raccourcisseur `bdeuro.pe` vers le PDF ne résout plus.
   Obstacle technique, pas éditorial.
3. **Lutte ouvrière, UPR, Nous France, Nouvelle Énergie, Génération écologie, Equinoxe, France
   Libre, Solution démocratique.** Leurs candidats sont à zéro. Sites sans programme structuré
   accessible au relevé, ou entièrement rendus côté client.
4. **Place publique** (Glucksmann, 3 cases). Sa qualité de signataire du Nouveau Front populaire
   n'a pas pu être confirmée sur une source fiable : la reprise de la coalition ne lui est donc
   **pas** appliquée, ni à Génération écologie. Une reprise attribuée à tort est pire qu'une case
   vide.
