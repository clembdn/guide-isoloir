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
] as const satisfies readonly Stance[];
