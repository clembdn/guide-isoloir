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
