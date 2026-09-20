/**
 * POSITIONS RÉELLES.
 *
 * TOUTES PORTENT `reviewStatus: "reconciled"` DEPUIS LE 20 SEPTEMBRE 2026, ET
 * CE MOT NE VEUT PAS DIRE CE QU'IL DISAIT. La décision est éditoriale, elle a
 * été prise explicitement, et elle doit être lisible ici plutôt que devinée :
 * `reconciled` signifiait « confronté par deux relecteurs puis réconcilié » ;
 * il signifie maintenant « publiable ». Le double codage à l'aveugle n'a PAS eu
 * lieu sur ces trente positions. `/methodologie` l'écrit noir sur blanc, et le
 * taux d'accord publié y reste vide tant que la campagne de double codage n'a
 * pas eu lieu — un site dont l'argument est la vérifiabilité ne peut pas
 * emprunter la crédibilité d'un protocole qu'il n'a pas appliqué.
 *
 * POURQUOI PUBLIER QUAND MÊME. Un comparateur qui n'affiche rien n'aide
 * personne, et l'électeur qui passe le test aujourd'hui vaut mieux qu'une page
 * vide. Les concurrents remplissent leurs cases avec des articles de 2022 sans
 * que la date apparaisse. Le pari retenu est l'inverse : tout est publié, mais
 * rien n'est publié sans sa source, sa date, son verbatim, son niveau de
 * confiance et son adéquation. Une estimation datée et contestable vaut mieux
 * qu'une absence, et infiniment mieux qu'une certitude fabriquée.
 *
 * CE QUI N'A PAS BOUGÉ D'UN POUCE : rien n'est inventé. Chaque position porte
 * au moins une source ouverte et lue, et son verbatim relevé dans le document,
 * pas résumé de mémoire. Le schéma refuse une position sans source.
 *
 * CONVENTION DE CITATION. `citation` contient une phrase exacte, et de préférence
 * LES MOTS DU CANDIDAT plutôt que la prose du journaliste. Deux raisons : les mots
 * du candidat sont plus courts, plus défendables et plus vérifiables ; et
 * republier vingt-cinq mots de prose par case, sur des centaines de cases,
 * reviendrait à republier des portions substantielles d'articles protégés. Quand
 * la source ne rapporte la position qu'au style indirect, la citation est la phrase
 * du journaliste, la provenance est `press-report`, et `rationale` le dit.
 *
 * QUATRE AXES DISTINCTS, et il a fallu deux relectures pour qu'ils apparaissent
 * tous :
 *   - `provenance`  : d'où vient l'information, de huit maillons possibles ;
 *   - `confidence`  : quelle confiance on accorde à la source ;
 *   - `adequation`  : à quel point la citation répond à l'affirmation POSÉE ;
 *   - `value`       : la position elle-même, seule à entrer dans le score.
 * C'est `adequation` qui plafonne la valeur, et le schéma le vérifie. Sans ce
 * plafond, le codage le moins établi pèserait sur le score autant que le mieux
 * établi.
 *
 * CE QUI N'EST PAS CODÉ COMPTE ENCORE PLUS QUE CE QUI L'EST. Trente positions
 * pour 20 candidats et 24 affirmations, soit 480 couples possibles : la
 * couverture reste très basse, et deux acteurs seulement dépassent le seuil de
 * publication du classement. Les cases où la source ne dit pas ce que demande
 * l'affirmation restent vides — position inconnue — plutôt que remplies par une
 * approximation muette. Le moteur écarte un thème non documenté de la moyenne,
 * il ne le compte pas zéro, et il affiche la couverture à côté du score.
 * `data/cases-non-couvertes.md` tient la liste de ce qui a été lu sans pouvoir
 * être codé.
 *
 * MÉTHODE DE RELEVÉ : un document se passe au crible des VINGT-QUATRE
 * affirmations, pas de celle pour laquelle on l'a ouvert. C'est ainsi qu'a été
 * trouvée, dans l'article consacré au chômage, la déclaration d'Édouard Philippe
 * sur les retraites qui a remplacé une inférence appuyée sur un entretien de 2021.
 *
 * PAS DE VALIDATION ZOD ICI : ce module peut partir au navigateur. Les pages
 * `.astro` appellent `validerPositions` dans leur frontmatter.
 */
import type { Stance } from "../lib/modele";

/** Ce fichier contient des données réelles. Le garde-fou de publication l'autorise. */
export const DONNEES_FACTICES = false;

export const POSITIONS = [
  // ─── L'âge légal de départ devrait être abaissé à 60 ans ──────────────────
  {
    id: "jean-luc-melenchon--retraites-age-legal-60",
    actorId: "jean-luc-melenchon",
    questionId: "retraites-age-legal-60",
    value: 2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["aec2027-chapitre-8", "lcp-retraites-candidats-2026"],
    citation: "Instaurer la retraite à 60 ans, mesure phare de l'Avenir en commun depuis 2017",
    adequation: "directe",
    rationale:
      "Le codage reposait sur un compte rendu de meeting ; il repose désormais sur le programme du candidat, maillon le plus haut de la chaîne. Les deux disent la même chose, et la source de presse est conservée en corroboration. Retour à 60 ans sans condition de métier ni de date de début de carrière : la mesure posée par l'affirmation, exactement.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "marine-tondelier--retraites-age-legal-60",
    actorId: "marine-tondelier",
    questionId: "retraites-age-legal-60",
    value: 1,
    provenance: "direct-statement",
    confidence: "high",
    sourceIds: ["lcp-retraites-candidats-2026"],
    citation:
      "une retraite à 60 ans pour les salariés ayant commencé à travailler avant vingt ans ou ayant exercé des métiers pénibles, mais à 62 ans pour les autres",
    adequation: "partielle",
    rationale:
      "L'abaissement à 60 ans est réservé à deux catégories, l'âge de droit commun visé étant 62 ans. Adéquation partielle, donc valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "marine-le-pen--retraites-age-legal-60",
    actorId: "marine-le-pen",
    questionId: "retraites-age-legal-60",
    value: 1,
    provenance: "direct-statement",
    confidence: "high",
    sourceIds: ["lcp-debat-medef-2026", "lcp-retraites-candidats-2026"],
    citation: "puis progressivement on arrivera à 42 ans de cotisations et un âge légal de 62 ans",
    adequation: "partielle",
    sourcePrimaire: "Débat du Medef, 27 août 2026, diffusé sur LCI",
    rationale:
      "Ses propres mots, retenus à la place de la prose du journaliste. L'âge légal visé est 62 ans ; les 60 ans ne concernent, dans la même déclaration, que les carrières commencées avant 20 ans. Adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "bruno-retailleau--retraites-age-legal-60",
    actorId: "bruno-retailleau",
    questionId: "retraites-age-legal-60",
    value: -2,
    provenance: "direct-statement",
    confidence: "high",
    sourceIds: ["lcp-retraites-candidats-2026"],
    citation:
      "le décalage de l'âge légal de départ à la retraite « après 64 ans », une mesure « fondamentale »",
    adequation: "directe",
    sourcePrimaire: "Entretien sur France 2, fin août 2026, rapporté par LCP",
    rationale:
      "Non seulement aucun abaissement, mais un décalage au-delà de 64 ans : la citation porte sur la mesure posée, en sens inverse.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "edouard-philippe--retraites-age-legal-60",
    actorId: "edouard-philippe",
    questionId: "retraites-age-legal-60",
    value: -2,
    provenance: "direct-statement",
    confidence: "high",
    sourceIds: ["lcp-philippe-chomage-2026"],
    citation: "qui accepte l'idée que tout le monde doit travailler un peu plus longtemps",
    adequation: "directe",
    sourcePrimaire: "Déclarations à l'AFP, 27 août 2026",
    rationale:
      "Déclaration de 2026, qui remplace une inférence appuyée sur un entretien de 2021. « Hostile à l'abandon de l'âge légal », relevé ailleurs, portait sur la suppression de la notion — la position d'Attal — et non sur le niveau auquel la fixer : cela ne pouvait pas fonder ce codage.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },

  // ─── La réforme des retraites de 2023 devrait être abrogée ────────────────
  {
    id: "raphael-glucksmann--retraites-abrogation-reforme-2023",
    actorId: "raphael-glucksmann",
    questionId: "retraites-abrogation-reforme-2023",
    value: 2,
    provenance: "direct-statement",
    confidence: "high",
    sourceIds: ["lcp-debat-medef-2026", "lcp-retraites-candidats-2026"],
    citation: "il a indiqué souhaiter l'« abroger », « parce qu'elle est injuste »",
    adequation: "directe",
    sourcePrimaire: "Débat du Medef, 27 août 2026, diffusé sur LCI",
    rationale:
      "Engagement explicite d'abrogation, pris devant le Medef le 27 août 2026 et rapporté de nouveau le 16 septembre. Deux sources concordantes.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "marine-le-pen--retraites-abrogation-reforme-2023",
    actorId: "marine-le-pen",
    questionId: "retraites-abrogation-reforme-2023",
    value: 1,
    provenance: "inference",
    confidence: "medium",
    sourceIds: ["lcp-retraites-candidats-2026"],
    citation: "",
    adequation: "deduite",
    rationale:
      "Aucune déclaration relevée employant le mot « abrogation ». Le retour à un âge légal de 62 ans défait le paramètre central de la réforme de 2023, mais celle-ci a aussi accéléré l'allongement de la durée de cotisation, et la position annoncée retient 40 à 42 années — ce qui n'est pas le droit antérieur. Abroger et revenir à 62 ans ne se recouvrent donc pas.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "bruno-retailleau--retraites-abrogation-reforme-2023",
    actorId: "bruno-retailleau",
    questionId: "retraites-abrogation-reforme-2023",
    value: -1,
    provenance: "inference",
    confidence: "medium",
    sourceIds: ["lcp-retraites-candidats-2026"],
    citation: "",
    adequation: "deduite",
    rationale:
      "Aucune déclaration relevée sur l'abrogation. Défendre un décalage de l'âge légal au-delà de 64 ans est incompatible avec l'abrogation de la réforme qui l'a porté à 64 ans. Déduction documentée, valeur plafonnée, à remplacer dès la publication de son projet de réforme.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },

  // ─── L'âge de départ devrait suivre l'espérance de vie ────────────────────
  {
    id: "bruno-retailleau--retraites-indexation-esperance-vie",
    actorId: "bruno-retailleau",
    questionId: "retraites-indexation-esperance-vie",
    value: 2,
    provenance: "direct-statement",
    confidence: "high",
    sourceIds: [
      "lcp-debat-medef-2026",
      "lcp-retraites-candidats-2026",
      "france24-debat-medef-2026",
    ],
    citation:
      "de lier par une équation proportionnelle, l'âge de la retraite et l'espérance de vie",
    adequation: "directe",
    sourcePrimaire: "Débat du Medef, 27 août 2026, diffusé sur LCI",
    rationale:
      "Ses propres mots, et la citation énonce l'affirmation : aucun écart d'interprétation. Précisée ensuite en espérance de vie « en bonne santé ».",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },

  // ─── Une part de capitalisation devrait être ajoutée ──────────────────────
  {
    id: "gabriel-attal--retraites-part-capitalisation",
    actorId: "gabriel-attal",
    questionId: "retraites-part-capitalisation",
    value: 2,
    provenance: "direct-statement",
    confidence: "high",
    sourceIds: ["lcp-retraites-candidats-2026"],
    citation:
      "une dose de capitalisation, une solution qu'il juge « bonne pour le système, et bonne pour les pensions »",
    adequation: "directe",
    rationale:
      "Ajout d'une part de capitalisation au système par répartition existant : c'est exactement l'objet de l'affirmation.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },

  // ─── La durée d'indemnisation du chômage devrait être réduite ─────────────
  {
    id: "edouard-philippe--chomage-reduction-duree-indemnisation",
    actorId: "edouard-philippe",
    questionId: "chomage-reduction-duree-indemnisation",
    value: 2,
    provenance: "direct-statement",
    confidence: "high",
    sourceIds: ["lcp-philippe-chomage-2026", "france24-debat-medef-2026"],
    citation:
      "Sur l'assurance chômage, ma direction c'est de faire comme l'Allemagne. Douze mois d'indemnisation maximum pour les moins de 50 ans",
    adequation: "directe",
    sourcePrimaire: "Débat du Medef, 27 août 2026, diffusé sur LCI",
    rationale:
      "Citation remplacée par les mots du candidat, que France 24 rapporte au style direct là où LCP les résumait. Réduction chiffrée et explicite. Le régime de référence est de 18 mois pour les moins de 55 ans depuis la réforme de 2023, et cette durée passe à 15 mois en cas de rupture conventionnelle depuis le 1er septembre 2026 : le premier codage écrivait à tort « 18 mois pour les moins de 50 ans ».",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },

  // ─── La dette devrait d'abord baisser par la dépense ─────────────────────
  {
    id: "marine-le-pen--budget-reduction-dette-par-depenses",
    actorId: "marine-le-pen",
    questionId: "budget-reduction-dette-par-depenses",
    value: 1,
    provenance: "direct-statement",
    confidence: "high",
    sourceIds: ["lcp-debat-medef-2026"],
    citation:
      "Nous présenterons notre trajectoire de rétablissement des finances publiques avec 125 milliards d'euros d'économies",
    adequation: "partielle",
    sourcePrimaire: "Débat du Medef, 27 août 2026, diffusé sur LCI",
    rationale:
      "Un plan d'économies de 125 milliards n'établit pas que la dette doive baisser par la dépense PLUTÔT QUE par la recette : les deux sont compatibles. Le premier codage écrivait « donc par la dépense et non par la recette », déduction que la source ne fait pas. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // RASSEMBLEMENT NATIONAL — positions de PARTI, lot du 19 septembre 2026.
  //
  // Trois documents publiés par le parti, ouverts et lus intégralement dans la
  // session : le programme des législatives de juin 2024, le programme des
  // européennes de mai 2024, le contre-budget 2026 du groupe à l'Assemblée.
  // Chacun a été passé au crible des VINGT-QUATRE affirmations, pas de celles
  // qu'on s'attendait à y trouver.
  //
  // AUCUN PROJET PRÉSIDENTIEL 2027 N'EXISTE. Le RN n'en a pas publié et n'a pas
  // désigné son candidat. Ces positions sont donc la ligne du parti telle qu'il
  // l'a écrite pour d'autres scrutins, avec la date qui va avec. Elles seront
  // remplacées dès que le projet 2027 sortira.
  //
  // 11 cases codées sur 24. Les 13 autres sont vides et listées dans
  // `data/cases-non-couvertes.md`, avec le document consulté et la raison.
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "parti-rassemblement-national--retraites-abrogation-reforme-2023",
    actorId: "parti-rassemblement-national",
    questionId: "retraites-abrogation-reforme-2023",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-programme-legislatives-2024"],
    citation:
      "Abroger la réforme des retraites de Macron et mettre en place un système de retraites progressif",
    adequation: "directe",
    rationale:
      "L'abrogation est la mesure exactement posée par l'affirmation. Le document écrit « la réforme des retraites de Macron » sans la dater ; en juin 2024, une seule réforme des retraites de ce quinquennat a été promulguée, celle de 2023 — la précédente, en 2020, avait été abandonnée. Aucune ambiguïté sur l'objet, d'où l'adéquation directe.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "parti-rassemblement-national--fiscalite-impot-fortune",
    actorId: "parti-rassemblement-national",
    questionId: "fiscalite-impot-fortune",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-contre-budget-2026", "rn-programme-legislatives-2024"],
    citation: "IFF à la place de la taxe sur les holdings et de l'IFI",
    adequation: "partielle",
    rationale:
      "Le parti propose un impôt sur la fortune financière en remplacement de l'IFI, pas le rétablissement de l'ISF supprimé en 2018 : l'assiette change de l'immobilier vers le mobilier, et le total d'imposition sur la fortune n'augmente pas nécessairement. La citation porte donc sur un impôt sur la fortune — ce que l'affirmation pose — mais avec un paramètre autre, d'où l'adéquation partielle et le plafond à 1. Le programme des législatives 2024 énonce le même remplacement en toutes lettres.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "parti-rassemblement-national--nationalite-suppression-droit-du-sol",
    actorId: "parti-rassemblement-national",
    questionId: "nationalite-suppression-droit-du-sol",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-programme-legislatives-2024"],
    citation: "Suppression du droit du sol",
    adequation: "directe",
    rationale:
      "La mesure figure telle quelle parmi les textes d'urgence sur l'immigration : c'est mot pour mot l'affirmation posée, sans condition ni restriction de périmètre.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "parti-rassemblement-national--immigration-regularisation-par-le-travail",
    actorId: "parti-rassemblement-national",
    questionId: "immigration-regularisation-par-le-travail",
    value: -1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-programme-legislatives-2024"],
    citation: "Suspension de toutes les régularisations de clandestins par les préfets",
    adequation: "partielle",
    rationale:
      "La mesure ferme la voie préfectorale par laquelle passe la régularisation par le travail, et contredit donc l'affirmation. Mais elle est une SUSPENSION, prise par circulaire, là où l'affirmation pose un principe durable : l'écart entre un gel administratif et la suppression de la possibilité justifie l'adéquation partielle et le plafond à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "parti-rassemblement-national--transport-suppression-zfe",
    actorId: "parti-rassemblement-national",
    questionId: "transport-suppression-zfe",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-programme-legislatives-2024"],
    citation: "Supprimer les Zones à Faibles Emissions",
    adequation: "directe",
    rationale:
      "La mesure est l'affirmation, mot pour mot, sans restriction de périmètre ni de calendrier.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "parti-rassemblement-national--energie-nouveaux-reacteurs-nucleaires",
    actorId: "parti-rassemblement-national",
    questionId: "energie-nouveaux-reacteurs-nucleaires",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-programme-legislatives-2024"],
    citation:
      "Lancer le plan Marie Curie de relance du nucléaire (EPR, SMR, réacteurs à neutrons rapides)",
    adequation: "directe",
    rationale:
      "Les trois technologies citées entre parenthèses sont des réacteurs à construire, pas des prolongations de parc existant : la citation porte sur la construction de nouveaux réacteurs, c'est-à-dire sur la mesure exactement posée.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "parti-rassemblement-national--energie-nouveaux-parcs-eoliens",
    actorId: "parti-rassemblement-national",
    questionId: "energie-nouveaux-parcs-eoliens",
    value: -1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-programme-europeennes-2024"],
    citation:
      "nous nous opposons notamment à la libéralisation des concessions de nos barrages hydroélectriques et au développement des énergies intermittentes (éoliennes) imposés par l'UE",
    adequation: "partielle",
    rationale:
      "L'opposition au développement éolien est écrite, et le document nomme l'éolien entre parenthèses. Mais elle est qualifiée par « imposés par l'UE » : le document s'oppose à un développement imposé de l'extérieur, et ne dit pas ce qu'il adviendrait d'un développement décidé nationalement. Ce paramètre autre justifie l'adéquation partielle et le plafond à 1. Le programme des législatives 2024, dont le chapitre énergie ne cite que nucléaire, hydroélectricité, biomasse, hydrogène et géothermie, ne mentionne l'éolien nulle part.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "parti-rassemblement-national--institutions-referendum-initiative-citoyenne",
    actorId: "parti-rassemblement-national",
    questionId: "institutions-referendum-initiative-citoyenne",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-programme-legislatives-2024"],
    citation: "Instaurer dans la Constitution un RIC législatif",
    adequation: "partielle",
    rationale:
      "Un référendum d'initiative citoyenne en matière législative recoupe l'affirmation. Mais celle-ci porte sa charge sur une clause précise — « sans accord du gouvernement ni du Parlement » — que le document n'énonce pas : aucun seuil de signatures, aucune procédure de déclenchement n'y figurent. L'adéquation reste partielle tant que le mécanisme n'est pas décrit.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "parti-rassemblement-national--institutions-elargissement-champ-referendum",
    actorId: "parti-rassemblement-national",
    questionId: "institutions-elargissement-champ-referendum",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-programme-europeennes-2024"],
    citation:
      "Organiser un référendum en France pour réaffirmer la primauté de la Constitution française sur les décisions des juges européens en matière d'immigration",
    adequation: "partielle",
    rationale:
      "Le parti propose bien de soumettre une question migratoire au vote des Français, ce que l'affirmation pose. Mais il annonce l'organisation d'UN référendum sur la primauté constitutionnelle, non l'élargissement du CHAMP du référendum de l'article 11 à la politique migratoire en général. La mesure recoupe l'affirmation sans la recouvrir, d'où le plafond à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "parti-rassemblement-national--europe-decisions-majorite-qualifiee",
    actorId: "parti-rassemblement-national",
    questionId: "europe-decisions-majorite-qualifiee",
    value: -2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-programme-europeennes-2024"],
    citation:
      "Garantir le droit de veto des États (règle de l'unanimité) et l'élargir à la compétence du commerce",
    adequation: "directe",
    rationale:
      "L'affirmation oppose majorité et unanimité ; la citation nomme la règle de l'unanimité, demande de la garantir et d'en ÉTENDRE le domaine. C'est la mesure exactement posée, prise en sens inverse, sans condition — d'où l'adéquation directe et la valeur pleine.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },
  {
    id: "parti-rassemblement-national--europe-controles-frontieres-schengen",
    actorId: "parti-rassemblement-national",
    questionId: "europe-controles-frontieres-schengen",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["rn-programme-europeennes-2024", "rn-programme-legislatives-2024"],
    citation:
      "Instaurer une double frontière, française et européenne : contrôler les frontières nationales et mettre en place une frontière aux portes de l'Europe",
    adequation: "partielle",
    rationale:
      "Le contrôle des frontières nationales est demandé, mais le document ne dit ni que ces contrôles seraient PERMANENTS, ni qu'ils viseraient spécifiquement les frontières intérieures de l'espace Schengen. La mesure voisine du même document — « Restreindre la libre-circulation de l'Espace Schengen aux seuls ressortissants des pays membres » — vise une partie seulement des personnes. Deux paramètres autres, donc adéquation partielle et plafond à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-19",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROGRAMME DE JEAN-LUC MÉLENCHON — relevé du 20 septembre 2026.
  //
  // Premier programme présidentiel publié de cette élection, donc premier
  // maillon de la chaîne employé jusqu'ici. Chaque mesure ci-dessous est
  // recopiée du chapitre cité, pas résumée : c'est le texte du candidat.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "jean-luc-melenchon--fiscalite-impot-fortune",
    actorId: "jean-luc-melenchon",
    questionId: "fiscalite-impot-fortune",
    value: 2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["aec2027-chapitre-6"],
    citation: "Rétablir et renforcer l'impôt sur la fortune avec un volet climatique",
    adequation: "directe",
    rationale:
      "L'affirmation demande le rétablissement d'un impôt sur la fortune ; le programme emploie le verbe « rétablir » et le nom de l'impôt. Le volet climatique en modifie l'assiette, pas l'existence.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "jean-luc-melenchon--fiscalite-bareme-unique-capital-travail",
    actorId: "jean-luc-melenchon",
    questionId: "fiscalite-bareme-unique-capital-travail",
    value: 2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["aec2027-chapitre-6"],
    citation: "Supprimer la flat tax et les niches fiscales injustes",
    adequation: "directe",
    rationale:
      "Un pas de raisonnement, et il est explicité pour qu'on puisse le contester : la flat tax EST le prélèvement forfaitaire unique, c'est-à-dire la dérogation qui soustrait les revenus du capital au barème progressif. La supprimer les y ramène, ce qui est la mesure posée par l'affirmation. L'infobulle de la question établit cette équivalence, et c'est pourquoi l'adéquation est retenue comme directe plutôt que partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "jean-luc-melenchon--nationalite-suppression-droit-du-sol",
    actorId: "jean-luc-melenchon",
    questionId: "nationalite-suppression-droit-du-sol",
    value: -2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["aec2027-chapitre-10"],
    citation: "Rétablir le droit du sol pour les enfants nés en France",
    adequation: "directe",
    rationale:
      "L'affirmation propose la suppression du droit du sol ; le programme demande son rétablissement. Même mesure, sens inverse, sans condition.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "jean-luc-melenchon--vote-etrangers-elections-municipales",
    actorId: "jean-luc-melenchon",
    questionId: "vote-etrangers-elections-municipales",
    value: 2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["aec2027-chapitre-10"],
    citation: "Accorder le droit de vote des étrangers aux élections locales",
    adequation: "directe",
    rationale:
      "Le programme écrit « élections locales », l'affirmation « élections municipales ». Les municipales sont des élections locales : l'engagement couvre la mesure posée, et l'excède plutôt qu'il ne la restreint. Adéquation directe.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "jean-luc-melenchon--agriculture-renforcement-normes-environnementales",
    actorId: "jean-luc-melenchon",
    questionId: "agriculture-renforcement-normes-environnementales",
    value: 1,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["aec2027-chapitre-13"],
    citation:
      "Planifier la réduction des doses d'engrais et pesticides et les importations de produits qui en contiennent",
    adequation: "partielle",
    rationale:
      "La réduction planifiée des intrants va dans le sens d'obligations environnementales renforcées, mais le programme ne dit pas sous quelle forme — norme contraignante, aide conditionnée, objectif indicatif. Le chapitre ajoute « Refonder la politique agricole commune (PAC) et orienter les aides vers l'agroécologie », qui est un levier d'aide et non une obligation. Le sens est établi, le moyen non : adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RAPHAËL GLUCKSMANN — presse, au style indirect.
  //
  // Les deux codages ci-dessous sont des `press-report` : le journaliste
  // rapporte la position, aucun verbatim du candidat n'est disponible sur ces
  // mesures. C'est le maillon le plus faible qui reste vérifiable, et
  // l'interface l'annonce comme tel.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "raphael-glucksmann--energie-nouveaux-reacteurs-nucleaires",
    actorId: "raphael-glucksmann",
    questionId: "energie-nouveaux-reacteurs-nucleaires",
    value: 1,
    provenance: "press-report",
    confidence: "medium",
    sourceIds: ["lcp-glucksmann-ecologie-2026"],
    citation: "soutient le développement de « nouveaux EPR »",
    adequation: "partielle",
    rationale:
      "Phrase du journaliste, faute de verbatim : la source rapporte la position sans citer le candidat sur ce point. Le soutien aux nouveaux EPR répond à l'affirmation, mais le même article indique que Glucksmann et Yannick Jadot s'engagent à « trouver un accord sur le besoin ou pas de nouveaux réacteurs nucléaires d'ici la mi-temps du siècle » : l'engagement est posé sous réserve d'une discussion à venir. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "raphael-glucksmann--energie-nouveaux-parcs-eoliens",
    actorId: "raphael-glucksmann",
    questionId: "energie-nouveaux-parcs-eoliens",
    value: 1,
    provenance: "press-report",
    confidence: "low",
    sourceIds: ["lcp-glucksmann-ecologie-2026"],
    citation: "la sortie du gaz et du pétrole et le développement des renouvelables",
    adequation: "partielle",
    rationale:
      "Phrase du journaliste, et l'éolien n'y est pas nommé : « renouvelables » l'englobe, mais le seul moyen cité nommément dans l'article est le photovoltaïque produit en France. Le sens général est établi, la mesure posée ne l'est pas. Confiance faible, adéquation partielle, valeur plafonnée à 1 : c'est le codage le plus fragile du fichier, et il est étiqueté comme tel plutôt que laissé vide.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },

  /*
   * RN ET L'ASSURANCE CHÔMAGE — case rouverte le 20 septembre 2026.
   *
   * `data/cases-non-couvertes.md` la classait « aborde sans répondre » :
   * l'annulation d'une réforme ne dit rien de la durée tant que le contenu de
   * cette réforme n'est pas établi. Le contenu l'est désormais — la réforme de
   * 2024 abaissait la durée d'indemnisation — et le Nouveau Front populaire
   * porte exactement le même engagement, codé de la même façon ci-dessous.
   *
   * LES DEUX ENSEMBLE, OU AUCUN DES DEUX. Coder l'un et laisser l'autre vide
   * serait le pire des deux mondes : une case manquante d'un seul côté déplace
   * la couverture, donc la présence au classement, sans qu'aucune différence
   * politique ne le justifie.
   */
  {
    id: "parti-rassemblement-national--chomage-reduction-duree-indemnisation",
    actorId: "parti-rassemblement-national",
    questionId: "chomage-reduction-duree-indemnisation",
    value: -1,
    provenance: "party-platform",
    confidence: "medium",
    sourceIds: ["rn-programme-legislatives-2024"],
    citation: "Annulation de la réforme de l'assurance chômage de juillet 2024",
    adequation: "partielle",
    rationale:
      "Un pas de raisonnement, explicité : la réforme visée abaissait la durée d'indemnisation, et l'annuler revient donc à s'opposer à la réduction. Le document ne nomme aucune durée et ne pose aucun principe sur le sujet : adéquation partielle, valeur plafonnée à 1. Le même codage est appliqué au Nouveau Front populaire, qui porte le même engagement.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONTRAT DE LÉGISLATURE DU NOUVEAU FRONT POPULAIRE — juin 2024.
  //
  // Dix-huit cases sur vingt-quatre, reprises par quatre candidats : Mélenchon,
  // Bouamrane, Roussel, Tondelier. C'est le document le plus rentable du
  // dossier, et le plus daté : chacune de ces positions porte à l'écran
  // l'avertissement d'ancienneté, et s'efface dès qu'un candidat publie son
  // programme — le moteur retient toujours le maillon le plus haut, et c'est
  // déjà ce qui se passe pour Mélenchon sur six affirmations.
  //
  // SIX CASES RESTENT VIDES, ET C'EST UN RENSEIGNEMENT. Le texte est muet sur
  // l'indexation de l'âge sur l'espérance de vie, sur la capitalisation, sur
  // les ZFE et sur les contrôles aux frontières Schengen. Il l'est aussi sur
  // les NOUVEAUX RÉACTEURS NUCLÉAIRES, et ce silence-là est délibéré : les
  // signataires ne s'accordent pas sur le sujet. Le combler par déduction
  // fabriquerait un consensus qui n'existe pas. Sur l'élargissement du champ du
  // référendum, le texte abaisse le seuil du référendum d'initiative partagée,
  // ce qui n'est pas élargir le champ de l'article 11 à la politique migratoire :
  // il aborde sans répondre.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "coalition-nouveau-front-populaire--retraites-age-legal-60",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "retraites-age-legal-60",
    value: 2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation: "Réaffirmer l'objectif commun du droit à la retraite à 60 ans",
    adequation: "directe",
    rationale:
      "Intitulé de la section consacrée aux retraites. L'objectif est posé comme commun aux signataires et porte sur l'âge exactement visé par l'affirmation.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--retraites-abrogation-reforme-2023",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "retraites-abrogation-reforme-2023",
    value: 2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation:
      "Abroger immédiatement les décrets d'application de la réforme d'Emmanuel Macron passant l'âge de départ à la retraite à 64 ans",
    adequation: "directe",
    rationale:
      "L'abrogation est nommée, datée par son objet — la réforme portant l'âge à 64 ans — et qualifiée d'immédiate. C'est la mesure posée, sans condition.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--fiscalite-impot-fortune",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "fiscalite-impot-fortune",
    value: 2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation: "Rétablir un impôt de solidarité sur la fortune (ISF) renforcé",
    adequation: "directe",
    rationale:
      "Le verbe « rétablir » et le nom de l'impôt : la mesure posée par l'affirmation, mot pour mot.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--fiscalite-bareme-unique-capital-travail",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "fiscalite-bareme-unique-capital-travail",
    value: 2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation: "Supprimer la flat tax et rétablir l'exit tax",
    adequation: "directe",
    rationale:
      "La flat tax est le prélèvement forfaitaire unique, c'est-à-dire la dérogation qui soustrait les revenus du capital au barème progressif ; la supprimer les y ramène. Le même chapitre porte « Accroître la progressivité de l'impôt sur le revenu à 14 tranches », qui va dans le même sens. Le pas de raisonnement est explicité ici pour pouvoir être contesté.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--budget-reduction-dette-par-depenses",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "budget-reduction-dette-par-depenses",
    value: -1,
    provenance: "coalition-platform",
    confidence: "medium",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation: "Refuser le pacte de stabilité budgétaire",
    adequation: "partielle",
    rationale:
      "Le document ne discute jamais la dette comme telle. Il refuse la règle budgétaire européenne qui contraint la dépense, et finance l'intégralité de ses mesures par des recettes nouvelles — ISF, suppression de la flat tax, taxation des superprofits — sans nommer une seule baisse de dépense. Le sens est établi, le principe posé par l'affirmation ne l'est pas : adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--chomage-reduction-duree-indemnisation",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "chomage-reduction-duree-indemnisation",
    value: -1,
    provenance: "coalition-platform",
    confidence: "medium",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation:
      "Abroger immédiatement les décrets d'application de la réforme d'Emmanuel Macron passant l'âge de départ à la retraite à 64 ans, ainsi que les réformes de l'assurance-chômage",
    adequation: "partielle",
    rationale:
      "Un pas de raisonnement, explicité : les réformes visées sont celles qui ont abaissé la durée d'indemnisation, ce que le dossier établit par ailleurs — le régime est passé à 18 mois pour les moins de 55 ans depuis 2023. Les abroger revient à s'opposer à la réduction. Le document ne nomme cependant aucune durée : adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--nationalite-suppression-droit-du-sol",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "nationalite-suppression-droit-du-sol",
    value: -2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation:
      "Garantir le droit du sol intégral pour les enfants nés en France et faciliter l'obtention de la nationalité française",
    adequation: "directe",
    rationale:
      "L'affirmation propose la suppression du droit du sol ; le texte demande de le garantir « intégral ». Même mesure, sens inverse, sans condition.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--immigration-plafond-titres-sejour",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "immigration-plafond-titres-sejour",
    value: -1,
    provenance: "coalition-platform",
    confidence: "medium",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation: "instituer la carte de séjour de dix ans comme titre de séjour de référence",
    adequation: "partielle",
    rationale:
      "Aucun plafond annuel n'est mentionné, ni pour l'instaurer ni pour le refuser. Le chapitre migratoire va systématiquement dans l'autre sens — faciliter l'accès aux visas, créer des voies légales et sécurisées d'immigration, allonger le titre de référence à dix ans. Le sens est clair, la mesure posée n'est pas traitée : adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--immigration-regularisation-par-le-travail",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "immigration-regularisation-par-le-travail",
    value: 2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation:
      "Faciliter l'accès aux visas, régulariser les travailleurs, étudiants, parents d'enfants scolarisés",
    adequation: "directe",
    rationale:
      "La régularisation des travailleurs est nommée en premier et sans condition : c'est la mesure exactement posée.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--vote-etrangers-elections-municipales",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "vote-etrangers-elections-municipales",
    value: 2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation: "Instituer le droit de vote des résidents étrangers aux élections locales",
    adequation: "directe",
    rationale:
      "Le texte écrit « élections locales », l'affirmation « élections municipales ». Les municipales sont des élections locales : l'engagement couvre la mesure posée, et l'excède plutôt qu'il ne la restreint.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--agriculture-renforcement-normes-environnementales",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "agriculture-renforcement-normes-environnementales",
    value: 1,
    provenance: "coalition-platform",
    confidence: "medium",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation:
      "Interdire l'importation de toute production agricole ne respectant pas nos normes sociales et environnementales",
    adequation: "partielle",
    rationale:
      "La citation porte sur les IMPORTATIONS, pas sur les obligations pesant sur les agriculteurs français : elle protège la norme existante plutôt qu'elle ne la renforce. Le chapitre agricole ajoute le soutien au bio et à l'agroécologie et une réforme de la PAC, qui sont des leviers d'aide et non des obligations. Le sens est établi, le moyen posé par l'affirmation non : adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--energie-nouveaux-parcs-eoliens",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "energie-nouveaux-parcs-eoliens",
    value: 1,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation: "Faire de la France le leader européen des énergies marines avec l'éolien en mer",
    adequation: "partielle",
    rationale:
      "L'éolien est nommé et son développement demandé, mais seulement en mer : le texte ne dit rien de l'éolien terrestre, que l'affirmation englobe. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--institutions-proportionnelle-legislatives",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "institutions-proportionnelle-legislatives",
    value: 2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation: "Instaurer la proportionnelle",
    adequation: "directe",
    rationale:
      "Mesure nommée, sans condition, dans le chapitre institutionnel consacré aux pouvoirs du Parlement.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--institutions-referendum-initiative-citoyenne",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "institutions-referendum-initiative-citoyenne",
    value: 2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation:
      "Instaurer le référendum d'initiative citoyenne (RIC) et renforcer le référendum d'initiative partagée en abaissant notamment le seuil de signatures citoyennes",
    adequation: "directe",
    rationale: "Le RIC est nommé et son instauration demandée : la mesure exactement posée.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--institutions-maintien-article-49-3",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "institutions-maintien-article-49-3",
    value: -2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation: "Abroger le 49.3",
    adequation: "directe",
    rationale:
      "L'affirmation propose le maintien de l'article 49.3 ; le texte demande son abrogation. Même objet, sens inverse, trois mots sans réserve.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--europe-decisions-majorite-qualifiee",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "europe-decisions-majorite-qualifiee",
    value: 2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation: "Passer au vote à la majorité qualifiée au conseil pour les questions fiscales",
    adequation: "directe",
    rationale:
      "L'affirmation demande si DAVANTAGE de décisions devraient se prendre à la majorité : étendre la majorité qualifiée à la fiscalité, domaine aujourd'hui soumis à l'unanimité, y répond directement. Le fait que l'extension vise un domaine et non tous ne restreint pas la mesure posée, qui est comparative.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--international-financement-soutien-ukraine",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "international-financement-soutien-ukraine",
    value: 2,
    provenance: "coalition-platform",
    confidence: "high",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation:
      "défendre indéfectiblement la souveraineté et la liberté du peuple ukrainien ainsi que l'intégrité de ses frontières, par la livraison d'armes nécessaires",
    adequation: "directe",
    rationale:
      "La livraison d'armes est le soutien militaire, et elle est engagée sans réserve ni condition de durée. Le document y ajoute la saisie d'avoirs russes et l'annulation de la dette extérieure ukrainienne.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "coalition-nouveau-front-populaire--europe-opposition-parlementaire-traite",
    actorId: "coalition-nouveau-front-populaire",
    questionId: "europe-opposition-parlementaire-traite",
    value: 1,
    provenance: "coalition-platform",
    confidence: "medium",
    sourceIds: ["nfp-contrat-legislature-2024"],
    citation:
      "nous refuserons, pour l'application de notre contrat de législature, le pacte budgétaire, le droit de la concurrence lorsqu'il remet en cause les services publics",
    adequation: "partielle",
    rationale:
      "Le refus d'appliquer des règles européennes en vigueur est explicite, mais il est porté par une majorité de gouvernement, pas par le Parlement comme organe, et il vise un pacte et un corpus de droit plutôt qu'un traité ratifié nommé. Deux paramètres autres : adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROGRAMME EUROPÉEN DES RÉPUBLICAINS — mai 2024.
  //
  // Dix cases, reprises par Bruno Retailleau à défaut de déclaration
  // personnelle. Le parti n'a rien publié pour les législatives de 2024, faute
  // de direction : ce programme européen est son dernier texte complet.
  //
  // QUATORZE CASES RESTENT VIDES, ET C'EST STRUCTUREL. Un programme européen ne
  // traite ni de l'âge de la retraite, ni de l'ISF, ni du 49.3, ni de la
  // proportionnelle, ni des ZFE : ces sujets ne relèvent pas du Parlement
  // européen. Les combler par déduction reviendrait à prêter à un parti des
  // positions qu'il n'a pas écrites, sur les thèmes précisément où un électeur
  // attend de la précision.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "parti-les-republicains--agriculture-renforcement-normes-environnementales",
    actorId: "parti-les-republicains",
    questionId: "agriculture-renforcement-normes-environnementales",
    value: -2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["lr-programme-europeennes-2024"],
    citation:
      "Nous proposons un moratoire sur toute nouvelle norme pour la prochaine mandature, notamment pour le secteur agricole",
    adequation: "directe",
    rationale:
      "Un moratoire sur toute nouvelle norme agricole est le refus exact de la mesure posée. Le même chapitre demande « l'abrogation des dispositions du Pacte vert européen qui favorisent la décroissance agricole » et reproche au Green Deal d'avoir imposé aux agriculteurs des objectifs de conservation des terres, de réduction des engrais et d'agriculture biologique. Aucune ambiguïté, aucune condition.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-republicains--energie-nouveaux-parcs-eoliens",
    actorId: "parti-les-republicains",
    questionId: "energie-nouveaux-parcs-eoliens",
    value: -1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["lr-programme-europeennes-2024"],
    citation: "Nous refusons de dénaturer nos paysages avec l'implantation déraisonnée d'éoliennes",
    adequation: "partielle",
    rationale:
      "L'opposition est nette mais qualifiée : c'est l'implantation « déraisonnée » qui est refusée, et le texte renvoie le développement des renouvelables « à l'appréciation des États membres ». Ce n'est donc pas l'arrêt de tout nouveau parc que l'affirmation met en jeu. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-republicains--energie-nouveaux-reacteurs-nucleaires",
    actorId: "parti-les-republicains",
    questionId: "energie-nouveaux-reacteurs-nucleaires",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["lr-programme-europeennes-2024"],
    citation:
      "que le plan de relance européen soutienne prioritairement le développement de la filière nucléaire dans toute l'Europe",
    adequation: "partielle",
    rationale:
      "Le soutien à la filière est explicite et prioritaire, et le texte l'oppose nommément au financement des éoliennes. Mais « développement de la filière » n'est pas « construction de nouveaux réacteurs » : un programme européen ne décide pas du parc français. Adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-republicains--nationalite-suppression-droit-du-sol",
    actorId: "parti-les-republicains",
    questionId: "nationalite-suppression-droit-du-sol",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["lr-programme-europeennes-2024"],
    citation:
      "durcissement des conditions du bénéfice du droit du sol pour l'accès à la nationalité française sur l'ensemble du territoire français",
    adequation: "partielle",
    rationale:
      "Le texte demande un durcissement et la fin de l'automaticité — retour au régime de la loi Pasqua de 1993 — et non la suppression du droit du sol que pose l'affirmation. Même direction, degré moindre : adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-republicains--immigration-plafond-titres-sejour",
    actorId: "parti-les-republicains",
    questionId: "immigration-plafond-titres-sejour",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["lr-programme-europeennes-2024"],
    citation:
      "une réforme constitutionnelle pour mettre en place des quotas migratoires annuels votés par le Parlement",
    adequation: "directe",
    rationale:
      "Un quota migratoire annuel voté par le Parlement est un plafond annuel : c'est la mesure exactement posée, et elle est portée par une révision constitutionnelle, donc sans réserve de principe.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-republicains--immigration-regularisation-par-le-travail",
    actorId: "parti-les-republicains",
    questionId: "immigration-regularisation-par-le-travail",
    value: -1,
    provenance: "party-platform",
    confidence: "medium",
    sourceIds: ["lr-programme-europeennes-2024"],
    citation: "rétablissement du délit de séjour irrégulier sur notre territoire",
    adequation: "partielle",
    rationale:
      "Le programme va dans le sens inverse de la régularisation — expulsion systématique, traitement des demandes d'asile en centres fermés, rétablissement du délit de séjour irrégulier — mais il ne traite jamais le cas posé par l'affirmation, celui du travailleur employé en France depuis plusieurs années. Adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-republicains--institutions-elargissement-champ-referendum",
    actorId: "parti-les-republicains",
    questionId: "institutions-elargissement-champ-referendum",
    value: 1,
    provenance: "party-platform",
    confidence: "medium",
    sourceIds: ["lr-programme-europeennes-2024"],
    citation:
      "un Référendum d'Initiative Partagée (RIP) concernant les conséquences sociales de l'immigration",
    adequation: "partielle",
    rationale:
      "Soumettre l'immigration au vote est bien l'intention, mais le texte le fait DANS le champ existant de l'article 11 — les politiques sociales — et ne demande pas de l'élargir. L'affirmation porte sur l'élargissement du champ : adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-republicains--europe-controles-frontieres-schengen",
    actorId: "parti-les-republicains",
    questionId: "europe-controles-frontieres-schengen",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["lr-programme-europeennes-2024"],
    citation:
      "les États membres puissent rétablir les contrôles à leurs frontières intérieures en cas de besoin sans l'accord préalable de la Commission européenne",
    adequation: "partielle",
    rationale:
      "Le rétablissement des contrôles est demandé, mais « en cas de besoin » et « en cas d'urgence » : le texte réclame la liberté de les rétablir, pas leur caractère PERMANENT que pose l'affirmation. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-republicains--international-financement-soutien-ukraine",
    actorId: "parti-les-republicains",
    questionId: "international-financement-soutien-ukraine",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["lr-programme-europeennes-2024"],
    citation:
      "Nous devons donc maintenir ce soutien et le rendre plus effectif au niveau diplomatique, civil et militaire",
    adequation: "directe",
    rationale:
      "Le maintien du soutien militaire est énoncé sans condition ni terme, et le texte y ajoute l'exigence que l'industrie d'armement européenne tienne ses promesses de livraisons. C'est la mesure posée.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-republicains--europe-opposition-parlementaire-traite",
    actorId: "parti-les-republicains",
    questionId: "europe-opposition-parlementaire-traite",
    value: 1,
    provenance: "party-platform",
    confidence: "medium",
    sourceIds: ["lr-programme-europeennes-2024"],
    citation:
      "permettre aux juridictions suprêmes françaises d'écarter un acte de l'Union européenne ou une jurisprudence de la Cour de justice qui ne respecte pas les limites de compétence attribuées à l'Union par les traités",
    adequation: "partielle",
    rationale:
      "Deux écarts avec l'affirmation, et ils vont dans le même sens sans la recouvrir : l'organe est le juge et non le Parlement, et l'objet est un acte de l'Union ou une jurisprudence, non un traité ratifié. Le texte invoque d'ailleurs les traités pour justifier l'écart, au lieu de s'y opposer. Adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROJET DE DEBOUT LA FRANCE — six chapitres, six dates.
  //
  // Quatorze cases, reprises par Nicolas Dupont-Aignan, qui passe de zéro
  // affirmation documentée à quatorze. Chaque position cite LE CHAPITRE d'où
  // elle vient, avec la date de dernière modification de cette page : février
  // 2024 pour les retraites, juin 2026 pour la démocratie. Les deux plus
  // anciennes déclenchent l'avertissement d'ancienneté, les autres non.
  //
  // DIX CASES RESTENT VIDES. Le chapitre économique ne mentionne ni impôt sur
  // la fortune, ni barème du capital, ni durée d'indemnisation du chômage ; le
  // chapitre démocratique ne dit rien de la proportionnelle ni du 49.3 ; aucun
  // chapitre ne parle de capitalisation, d'abrogation de la réforme de 2023, ni
  // du vote à la majorité qualifiée au Conseil.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "parti-debout-la-france--retraites-age-legal-60",
    actorId: "parti-debout-la-france",
    questionId: "retraites-age-legal-60",
    value: -1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-retraites"],
    citation:
      "Maintenir l'âge minimum de départ à la retraite et la durée de cotisations aux niveaux actuels",
    adequation: "partielle",
    rationale:
      "Le maintien exclut l'abaissement que pose l'affirmation, mais il exclut tout autant le recul : le chapitre refuse explicitement les deux. Ce n'est donc pas une opposition de principe à un départ plus précoce, c'est un refus de toucher au paramètre. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--retraites-indexation-esperance-vie",
    actorId: "parti-debout-la-france",
    questionId: "retraites-indexation-esperance-vie",
    value: -1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-retraites"],
    citation:
      "nous ne reculerons pas l'âge de la retraite et n'allongerons pas la durée de cotisation",
    adequation: "partielle",
    rationale:
      "Un âge indexé sur l'espérance de vie reculerait mécaniquement, puisque l'espérance de vie augmente : le refus de tout recul exclut l'indexation. Mais le chapitre ne discute jamais le mécanisme lui-même, et fonde son refus sur l'emploi et la démographie, pas sur le principe. Adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--nationalite-suppression-droit-du-sol",
    actorId: "parti-debout-la-france",
    questionId: "nationalite-suppression-droit-du-sol",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-immigration"],
    citation: "Supprimer le droit du sol via un référendum",
    adequation: "directe",
    rationale:
      "La mesure posée par l'affirmation, énoncée dans les mêmes termes et sans condition. Le chapitre la reprend deux fois, dont une fois en tête : « nous proposons, par conséquent, la suppression du droit du sol ».",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--immigration-regularisation-par-le-travail",
    actorId: "parti-debout-la-france",
    questionId: "immigration-regularisation-par-le-travail",
    value: -2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-immigration"],
    citation: "supprimer la régularisation pour les étrangers en situation irrégulière",
    adequation: "directe",
    rationale:
      "La suppression est générale et ne ménage aucun cas : le chapitre ajoute « en interdisant toute régularisation ou naturalisation au titre de la vie privée et familiale » et « aucune régularisation ne sera accordée aux demandeurs d'asile déboutés ». Le travailleur employé depuis plusieurs années, que vise l'affirmation, entre dans cette suppression.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--vote-etrangers-elections-municipales",
    actorId: "parti-debout-la-france",
    questionId: "vote-etrangers-elections-municipales",
    value: -2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-immigration"],
    citation: "Limiter le droit de vote aux seules personnes ayant la nationalité française",
    adequation: "directe",
    rationale:
      "L'affirmation propose d'ouvrir le vote municipal aux étrangers résidents ; le chapitre le réserve aux nationaux, au motif que « la nationalité et le vote sont indissociables ». Même objet, sens inverse, sans réserve.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--immigration-plafond-titres-sejour",
    actorId: "parti-debout-la-france",
    questionId: "immigration-plafond-titres-sejour",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-immigration"],
    citation: "Votant chaque année au Parlement un plafond de naturalisations",
    adequation: "partielle",
    rationale:
      "Un plafond annuel voté par le Parlement est bien la forme que pose l'affirmation, mais il porte ici sur les NATURALISATIONS et non sur les titres de séjour : ce sont deux actes distincts, l'un donnant la nationalité, l'autre le droit de séjourner. Le seul quota de séjour du chapitre vise les étudiants étrangers, par filière et par pays. Adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--europe-controles-frontieres-schengen",
    actorId: "parti-debout-la-france",
    questionId: "europe-controles-frontieres-schengen",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-immigration"],
    citation: "notre pays doit rétablir ses frontières",
    adequation: "partielle",
    rationale:
      "Le chapitre nomme Schengen comme la cause du problème — « la France s'est imprudemment liée au système de Schengen de disparition des frontières nationales » — et demande le rétablissement des frontières. Il ne dit cependant pas que les contrôles seraient PERMANENTS, ni comment ils s'articuleraient au droit de l'Union. Même codage que le Rassemblement national sur une formulation équivalente : adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--institutions-elargissement-champ-referendum",
    actorId: "parti-debout-la-france",
    questionId: "institutions-elargissement-champ-referendum",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-immigration"],
    citation: "Supprimer le droit du sol via un référendum",
    adequation: "directe",
    rationale:
      "L'affirmation porte sur la possibilité de soumettre la politique migratoire au vote des Français. Le chapitre ne se contente pas de l'envisager : il fait du référendum le véhicule d'une mesure migratoire précise. C'est la mesure posée, mise en oeuvre.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--institutions-referendum-initiative-citoyenne",
    actorId: "parti-debout-la-france",
    questionId: "institutions-referendum-initiative-citoyenne",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-democratie"],
    citation:
      "Instaurer le référendum d'initiative citoyenne constituant (RIC) pour rendre les citoyens acteurs de l'élaboration des lois",
    adequation: "directe",
    rationale:
      "Le RIC est nommé, son seuil chiffré — un million d'inscrits — et sa procédure décrite. La mesure posée par l'affirmation, sans condition.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--europe-opposition-parlementaire-traite",
    actorId: "parti-debout-la-france",
    questionId: "europe-opposition-parlementaire-traite",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-democratie"],
    citation:
      "rétablira la supériorité du droit national sur le droit européen et n'appliquera plus le droit communautaire",
    adequation: "partielle",
    rationale:
      "Le refus d'appliquer le droit européen en vigueur est explicite et total. Mais il est porté par l'État pendant une négociation de sortie, pas par le Parlement comme organe, et il vise le droit communautaire dans son ensemble plutôt qu'un traité ratifié nommé. Deux paramètres autres : adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--transport-suppression-zfe",
    actorId: "parti-debout-la-france",
    questionId: "transport-suppression-zfe",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-transport"],
    citation: "Acter la suppression définitive des Zones à Faibles Émissions",
    adequation: "directe",
    rationale:
      "Une phrase, la mesure posée, et le mot « définitive » qui exclut toute réserve. Le chapitre la justifie en qualifiant les ZFE de « zones d'exclusion des automobilistes ».",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--agriculture-renforcement-normes-environnementales",
    actorId: "parti-debout-la-france",
    questionId: "agriculture-renforcement-normes-environnementales",
    value: -2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-agriculture"],
    citation: "Nous voulons soutenir les exploitations en simplifiant les normes",
    adequation: "directe",
    rationale:
      "Le chapitre demande ailleurs la « fin du pacte vert européen, des quotas de jachères » et la sortie de la politique agricole commune, dont il conteste nommément les neuf bonnes conditions agricoles et environnementales — rotation des cultures, 4 % de jachères, ratio de prairies permanentes. C'est le refus explicite de la mesure posée, et non un simple allègement administratif.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--energie-nouveaux-reacteurs-nucleaires",
    actorId: "parti-debout-la-france",
    questionId: "energie-nouveaux-reacteurs-nucleaires",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-energie"],
    citation: "Conforter le développement des réacteurs GENERATION IV relancer le nucléaire",
    adequation: "partielle",
    rationale:
      "La relance est explicite, et le chapitre fixe un plancher de 70 % de nucléaire dans la production électrique, qu'on ne tient pas sans renouveler le parc. Mais aucune phrase n'engage la construction de réacteurs, ni leur nombre : le texte parle de filière, de recherche et d'un plan Thorium à l'horizon 2050. Même codage que Les Républicains sur une formulation équivalente : adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-debout-la-france--energie-nouveaux-parcs-eoliens",
    actorId: "parti-debout-la-france",
    questionId: "energie-nouveaux-parcs-eoliens",
    value: -1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["dlf-projet-energie"],
    citation:
      "redéployer les 4 milliards gâchés dans le solaire et l'éolien sur des filières d'avenir",
    adequation: "partielle",
    rationale:
      "L'hostilité est nette — « une politique tournée vers l'éolien et le photovoltaïque ne pourra jamais tenir ses promesses » — mais la mesure porte sur le FINANCEMENT, pas sur l'installation : le chapitre ne demande ni moratoire, ni arrêt des parcs, ni démantèlement. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROJET DES PATRIOTES — 3 septembre 2026.
  //
  // Cinq cases, reprises par Florian Philippot. Le document est récent et
  // tranché, mais il est ORGANISÉ AUTOUR DU FREXIT : presque tout y est traité
  // par le prisme de la sortie de l'Union. D'où dix-neuf cases vides, et non
  // par manque de lecture — le projet ne dit rien de l'ISF, du barème du
  // capital, de la durée d'indemnisation du chômage, du droit du sol, de la
  // régularisation, du vote des étrangers, des ZFE, de la proportionnelle, du
  // 49.3 ni du référendum d'initiative citoyenne.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "parti-les-patriotes--energie-nouveaux-parcs-eoliens",
    actorId: "parti-les-patriotes",
    questionId: "energie-nouveaux-parcs-eoliens",
    value: -2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["lp-projet-patriote-2026"],
    citation:
      "il n'y a aucune raison de poursuivre le développement des éoliennes en France. Il faut donc un moratoire total et définitif",
    adequation: "directe",
    rationale:
      "Un moratoire « total et définitif » sur l'éolien est le refus exact de la mesure posée, et le projet y ajoute « un plan de démantèlement des éoliennes installées ». Aucune condition, aucune exception.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-patriotes--energie-nouveaux-reacteurs-nucleaires",
    actorId: "parti-les-patriotes",
    questionId: "energie-nouveaux-reacteurs-nucleaires",
    value: 1,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["lp-projet-patriote-2026"],
    citation: "un plan d'investissement massif dans le nucléaire de nouvelle génération",
    adequation: "partielle",
    rationale:
      "Le soutien au nucléaire est massif et explicite, et le projet demande de « renforcer » le parc existant. Mais investir dans une génération de réacteurs n'est pas s'engager à en construire : aucun nombre, aucun calendrier. Même codage que Les Républicains et Debout la France sur des formulations équivalentes : adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-patriotes--retraites-age-legal-60",
    actorId: "parti-les-patriotes",
    questionId: "retraites-age-legal-60",
    value: 1,
    provenance: "party-platform",
    confidence: "medium",
    sourceIds: ["lp-projet-patriote-2026"],
    citation: "Baisser l'âge de départ à la retraite",
    adequation: "partielle",
    rationale:
      "L'intitulé de la mesure va dans le sens de l'affirmation, mais le corps du texte la conditionne deux fois : la France pourra baisser l'âge « si les Français le désirent », et seulement une fois « délivrée de la menace bruxelloise ». Aucun âge n'est chiffré, et 60 ans n'apparaît nulle part. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-patriotes--europe-controles-frontieres-schengen",
    actorId: "parti-les-patriotes",
    questionId: "europe-controles-frontieres-schengen",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["lp-projet-patriote-2026"],
    citation: "Retrouver des frontières nationales en quittant l'espace Schengen et l'UE",
    adequation: "directe",
    rationale:
      "Le projet emploie lui-même les mots de l'affirmation : il reproche à Schengen et à l'Union d'« interdire les contrôles permanents aux frontières ». La sortie de l'espace Schengen est le moyen, le rétablissement de contrôles permanents est la fin visée, et les deux sont écrits.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "parti-les-patriotes--europe-opposition-parlementaire-traite",
    actorId: "parti-les-patriotes",
    questionId: "europe-opposition-parlementaire-traite",
    value: 1,
    provenance: "party-platform",
    confidence: "medium",
    sourceIds: ["lp-projet-patriote-2026"],
    citation: "Seule la sortie de l'UE, prévue par les Traités, le peut",
    adequation: "partielle",
    rationale:
      "Le projet écarte explicitement la voie que pose l'affirmation : selon lui, aucune opposition interne ne suffit à récupérer les compétences transférées, et seule la sortie de l'Union le permet. C'est un refus du droit européen plus radical que la mesure posée, mais pas cette mesure : ni le Parlement, ni un traité ratifié en particulier. Adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROGRAMME DE DAVID LISNARD — 31 juillet 2026.
  //
  // Onze cases, et elles sont en `official-program` : c'est le programme du
  // candidat lui-même, deuxième du dossier après celui de Mélenchon. Rien n'est
  // repris d'un parti, rien n'est hérité — David Lisnard passe de zéro à onze
  // affirmations documentées EN PROPRE.
  //
  // TREIZE CASES VIDES. Le programme ne dit rien de l'abrogation de la réforme
  // de 2023, de l'indexation de l'âge sur l'espérance de vie, de l'impôt sur la
  // fortune, du barème du capital, de la durée d'indemnisation du chômage, du
  // vote des étrangers, des ZFE, de la proportionnelle, du référendum
  // d'initiative citoyenne, du 49.3, du vote à la majorité qualifiée, de
  // l'Ukraine ni des contrôles aux frontières Schengen — « le meilleur contrôle
  // effectif des frontières » y figure, mais sans nommer Schengen ni le
  // caractère permanent des contrôles.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "david-lisnard--retraites-age-legal-60",
    actorId: "david-lisnard",
    questionId: "retraites-age-legal-60",
    value: -2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["lisnard-ambition"],
    citation: "la norme de l'âge légal de 65 ans est un impératif national urgent",
    adequation: "directe",
    rationale:
      "Non seulement aucun abaissement, mais un âge légal porté à 65 ans, qualifié d'impératif urgent et présenté comme un préalable à toute autre réforme. La citation porte sur la mesure posée, en sens inverse et sans réserve.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "david-lisnard--retraites-part-capitalisation",
    actorId: "david-lisnard",
    questionId: "retraites-part-capitalisation",
    value: 2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["lisnard-ambition"],
    citation: "une combinaison de la répartition avec la capitalisation",
    adequation: "directe",
    rationale:
      "Le programme fait de la combinaison répartition-capitalisation sa « réforme d'ensemble », après le relèvement de l'âge. C'est exactement l'ajout d'une part de capitalisation au système par répartition que pose l'affirmation.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "david-lisnard--budget-reduction-dette-par-depenses",
    actorId: "david-lisnard",
    questionId: "budget-reduction-dette-par-depenses",
    value: 2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["lisnard-destin"],
    citation:
      "il est possible de les réduire de 8 points de PIB en 10 ans et de les maintenir en-deçà de 50%",
    adequation: "directe",
    rationale:
      "La citation porte sur les dépenses publiques, dans un chapitre intitulé « l'impératif absolu de la maîtrise des déficits publics et de la dette ». Le programme y écrit que « l'action directe sur les différentes dépenses par fonctions et par natures sera tout aussi déterminante » et écarte explicitement l'annulation de la dette. La dépense est bien le levier premier.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "david-lisnard--immigration-plafond-titres-sejour",
    actorId: "david-lisnard",
    questionId: "immigration-plafond-titres-sejour",
    value: 2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["lisnard-immigration"],
    citation: "Diviser par huit la délivrance de titres de séjour",
    adequation: "directe",
    rationale:
      "Un facteur chiffré appliqué au nombre de titres de séjour délivrés : c'est un plafond, et c'est la mesure exactement posée par l'affirmation. Le programme y ajoute des quotas de main-d'oeuvre qualifiée.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "david-lisnard--nationalite-suppression-droit-du-sol",
    actorId: "david-lisnard",
    questionId: "nationalite-suppression-droit-du-sol",
    value: 1,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["lisnard-immigration"],
    citation: "Mettre fin à l'automaticité du droit du sol",
    adequation: "partielle",
    rationale:
      "Mettre fin à l'automaticité n'est pas supprimer le droit du sol : l'acquisition resterait possible, sur manifestation de volonté. Même direction, degré moindre — comme Les Républicains sur une formulation voisine. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "david-lisnard--immigration-regularisation-par-le-travail",
    actorId: "david-lisnard",
    questionId: "immigration-regularisation-par-le-travail",
    value: -2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["lisnard-ambition"],
    citation:
      "supprimer toute possibilité d'être régularisé après être entré clandestinement sur le territoire",
    adequation: "directe",
    rationale:
      "Le mot « toute » exclut le cas posé par l'affirmation, celui du travailleur employé depuis plusieurs années. Le chapitre migratoire du programme rétablit par ailleurs le délit de séjour irrégulier.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "david-lisnard--energie-nouveaux-reacteurs-nucleaires",
    actorId: "david-lisnard",
    questionId: "energie-nouveaux-reacteurs-nucleaires",
    value: 2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["lisnard-civique"],
    citation: "construction d'EPR de nouvelle génération, déploiement de mini-réacteurs nucléaires",
    adequation: "directe",
    rationale:
      "Le seul codage nucléaire du dossier à mériter l'adéquation directe : le programme n'écrit pas « soutenir la filière » mais « construction », et nomme deux types de réacteurs. Les Républicains, Debout la France et Les Patriotes restent à 1 faute d'un engagement de construction aussi explicite.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "david-lisnard--energie-nouveaux-parcs-eoliens",
    actorId: "david-lisnard",
    questionId: "energie-nouveaux-parcs-eoliens",
    value: -1,
    provenance: "official-program",
    confidence: "medium",
    sourceIds: ["lisnard-civique"],
    citation:
      "Il faut mettre un terme à cette gabegie en faisant rentrer ces projets dans le droit commun",
    adequation: "partielle",
    rationale:
      "La citation vise les projets d'énergies renouvelables « dérogatoires aux prix du marché et aux règles d'urbanisme », et propose de réinvestir les économies dans le nucléaire. L'éolien n'est pas nommé, et la mesure porte sur le régime dérogatoire, pas sur l'installation de nouveaux parcs. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "david-lisnard--agriculture-renforcement-normes-environnementales",
    actorId: "david-lisnard",
    questionId: "agriculture-renforcement-normes-environnementales",
    value: -2,
    provenance: "official-program",
    confidence: "high",
    sourceIds: ["lisnard-agriculture"],
    citation: "La PAC doit cesser d'être une politique environnementale hors-sol",
    adequation: "directe",
    rationale:
      "Le refus porte sur la nature même de la contrainte environnementale en agriculture, pas sur sa lourdeur administrative. Le chapitre demande aussi d'« en finir avec les surtranspositions françaises » et refuse « toute logique malthusienne qui affaiblit la compétitivité sans bénéfice environnemental démontré ». C'est le refus explicite de la mesure posée.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "david-lisnard--europe-opposition-parlementaire-traite",
    actorId: "david-lisnard",
    questionId: "europe-opposition-parlementaire-traite",
    value: 1,
    provenance: "official-program",
    confidence: "medium",
    sourceIds: ["lisnard-immigration"],
    citation: "Inscrire la primauté du droit national en matière migratoire dans la Constitution",
    adequation: "partielle",
    rationale:
      "L'objectif est bien d'écarter l'application de règles européennes, et le programme précise « afin de rendre inapplicables les décisions de la CJUE et de la CEDH contraires à l'intérêt national ». Mais le véhicule est une révision constitutionnelle et l'objet des décisions de juges, non une opposition du Parlement à un traité ratifié. Deux paramètres autres : adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "david-lisnard--institutions-elargissement-champ-referendum",
    actorId: "david-lisnard",
    questionId: "institutions-elargissement-champ-referendum",
    value: 1,
    provenance: "official-program",
    confidence: "medium",
    sourceIds: ["lisnard-ambition"],
    citation:
      "Cela peut passer par une révision constitutionnelle, par des renégociations de traités internationaux, voire par d'autres dispositifs juridiques à imaginer. Un référendum sera nécessaire",
    adequation: "partielle",
    rationale:
      "La phrase clôt le chapitre consacré aux frontières et à l'immigration : le référendum y est bien envisagé sur la politique migratoire. Mais le programme ne demande pas d'élargir le champ de l'article 11 ; il énumère plusieurs véhicules juridiques dont le référendum est le dernier. Adéquation partielle.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOC CENTRAL — presse, faute de programme.
  //
  // Trois cases seulement, et c'est le constat le plus net du dossier : les
  // deux candidats donnés en tête des sondages du bloc central n'ont publié
  // aucun texte programmatique. Ce qu'on peut coder d'eux tient dans deux
  // articles.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "gabriel-attal--retraites-age-legal-60",
    actorId: "gabriel-attal",
    questionId: "retraites-age-legal-60",
    value: -1,
    provenance: "direct-statement",
    confidence: "medium",
    sourceIds: ["lcp-retraites-qui-propose-quoi-2026"],
    citation: "Le sujet n'est plus de savoir si c'est 62, 63, 64 ans",
    adequation: "partielle",
    sourcePrimaire: "Déclarations rapportées par LCP dans sa synthèse du 19 juin 2026",
    rationale:
      "Gabriel Attal ne répond pas à l'affirmation, il en conteste la pertinence : il propose de supprimer l'âge légal et de tout faire reposer sur la durée de cotisation, avec « de vraies décotes et de vraies surcotes ». Un âge légal abaissé à 60 ans est incompatible avec la suppression de l'âge légal, d'où le signe ; mais la mesure posée n'est pas discutée, d'où l'adéquation partielle et le plafond à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "gabriel-attal--fiscalite-impot-fortune",
    actorId: "gabriel-attal",
    questionId: "fiscalite-impot-fortune",
    value: -1,
    provenance: "press-report",
    confidence: "medium",
    sourceIds: ["lcp-attal-arras-2025"],
    citation: "refus de la taxe Zucman sur les ultrariches",
    adequation: "partielle",
    rationale:
      "Phrase du journaliste, faute de verbatim. La taxe Zucman est un impôt plancher sur les très hauts patrimoines, donc une forme d'imposition de la fortune : la refuser va contre l'affirmation. Mais ce n'est pas le rétablissement d'un impôt sur la fortune au sens de l'ISF supprimé en 2018 que le candidat écarte, c'est un dispositif particulier. Adéquation partielle, valeur plafonnée à 1.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
  {
    id: "raphael-glucksmann--retraites-age-legal-60",
    actorId: "raphael-glucksmann",
    questionId: "retraites-age-legal-60",
    value: -1,
    provenance: "direct-statement",
    confidence: "medium",
    sourceIds: ["lcp-retraites-qui-propose-quoi-2026"],
    citation: "le totem absolu",
    adequation: "partielle",
    sourcePrimaire: "Déclarations rapportées par LCP dans sa synthèse du 19 juin 2026",
    rationale:
      "Raphaël Glucksmann refuse de faire de l'âge légal « le totem absolu » et déplace la discussion vers « la durée de cotisation et la pénibilité du travail ». Il ne demande donc pas l'abaissement à 60 ans que pose l'affirmation, sans pour autant défendre un relèvement. Adéquation partielle, valeur plafonnée à 1. À noter que le même candidat s'est engagé à abroger la réforme de 2023, ce qui est codé séparément : les deux ne sont pas contradictoires.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },

  {
    id: "parti-solution-democratique--institutions-referendum-initiative-citoyenne",
    actorId: "parti-solution-democratique",
    questionId: "institutions-referendum-initiative-citoyenne",
    value: 2,
    provenance: "party-platform",
    confidence: "high",
    sourceIds: ["sd-notre-solution"],
    citation:
      "instaurant deux outils simples mais puissants : l'initiative citoyenne constituante ; le référendum obligatoire pour modifier la Constitution",
    adequation: "directe",
    rationale:
      "Le parti nomme la réunion de ces deux outils « référendum d'initiative citoyenne constituant (RICC) » et en fait l'intégralité de son programme présidentiel. C'est la mesure exactement posée par l'affirmation, portée sans condition ni réserve. Une seule case, et c'est tout ce que ce parti documente : les vingt-trois autres restent vides parce qu'il ne se prononce pas dessus, pas parce qu'on ne l'a pas cherché.",
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
] as const satisfies readonly Stance[];
