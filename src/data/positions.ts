/**
 * POSITIONS RÉELLES — codage initial, EN ATTENTE DE RELECTURE HUMAINE.
 *
 * Toutes portent `reviewStatus: "draft"`. `positionsPubliables` les écarte donc de
 * ce qui est servi : `/resultat` ne les affichera qu'une fois passées en
 * `reconciled`. C'est la traduction technique de la règle de `CLAUDE.md` — aucun
 * contenu factuel produit par une IA n'est publié sans vérification humaine.
 *
 * CONVENTION DE CITATION. `citation` contient une phrase exacte, et de préférence
 * LES MOTS DU CANDIDAT plutôt que la prose du journaliste. Deux raisons : les mots
 * du candidat sont plus courts, plus défendables et plus vérifiables ; et
 * republier vingt-cinq mots de prose par case, sur des centaines de cases,
 * reviendrait à republier des portions substantielles d'articles protégés. Quand
 * la source ne rapporte la position qu'au style indirect, la citation est la phrase
 * du journaliste et `rationale` le dit.
 *
 * TROIS AXES DISTINCTS, et il a fallu une relecture pour que le troisième
 * apparaisse :
 *   - `provenance`  : d'où vient l'information ;
 *   - `confidence`  : quelle confiance on accorde à la source ;
 *   - `adequation`  : à quel point la citation répond à l'affirmation POSÉE.
 * Le premier jet confondait les deux derniers : Le Pen sur la dette et Retailleau
 * sur l'espérance de vie étaient tous deux `direct-statement` / `high`, alors que
 * l'un cite un plan d'économies et l'autre énonce littéralement l'affirmation.
 * C'est `adequation` qui plafonne la valeur, et le schéma le vérifie.
 *
 * CE QUI N'EST PAS CODÉ COMPTE PLUS QUE CE QUI L'EST. Douze positions pour
 * 20 candidats et 24 affirmations, soit 480 couples possibles : 2,5 % de
 * couverture, et 7 candidats sur 20 seulement ont une position. Toutes les cases
 * où la source ne dit pas exactement ce que demande l'affirmation restent vides —
 * position inconnue — plutôt que remplies par une approximation. Le moteur écarte
 * un thème non documenté de la moyenne, il ne le compte pas zéro, et il affiche la
 * couverture à côté du score.
 *
 * DEUX INFÉRENCES SUR DOUZE, ET ELLES SONT PLAFONNÉES. Une inférence n'a pas de
 * verbatim : son raisonnement est écrit en entier dans `rationale`, le schéma
 * l'impose, sa valeur ne peut pas dépasser 1, et l'interface doit la présenter
 * comme une déduction, jamais comme une déclaration du candidat.
 *
 * MÉTHODE DE RELEVÉ, corrigée après relecture : un article se passe au crible des
 * VINGT-QUATRE affirmations, pas de celle pour laquelle on l'a ouvert. C'est ainsi
 * qu'a été trouvée, dans l'article consacré au chômage, la déclaration d'Édouard
 * Philippe sur les retraites qui a remplacé une inférence appuyée sur un entretien
 * de 2021.
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
    provenance: "direct-statement",
    confidence: "high",
    sourceIds: ["lcp-retraites-candidats-2026"],
    citation:
      "le retour « le plus vite possible » au droit à la retraite à 60 ans pour 40 années de cotisation",
    adequation: "directe",
    sourcePrimaire: "Premier meeting de campagne à Saint-Denis, juin 2026, rapporté par LCP",
    rationale:
      "Retour à 60 ans demandé sans condition de métier ni de date de début de carrière : la citation porte sur la mesure exactement posée par l'affirmation.",
    reviewStatus: "draft",
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
    reviewStatus: "draft",
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
    reviewStatus: "draft",
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
    reviewStatus: "draft",
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
    reviewStatus: "draft",
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
    reviewStatus: "draft",
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
    reviewStatus: "draft",
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
    reviewStatus: "draft",
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
    sourceIds: ["lcp-debat-medef-2026", "lcp-retraites-candidats-2026"],
    citation:
      "de lier par une équation proportionnelle, l'âge de la retraite et l'espérance de vie",
    adequation: "directe",
    sourcePrimaire: "Débat du Medef, 27 août 2026, diffusé sur LCI",
    rationale:
      "Ses propres mots, et la citation énonce l'affirmation : aucun écart d'interprétation. Précisée ensuite en espérance de vie « en bonne santé ».",
    reviewStatus: "draft",
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
    reviewStatus: "draft",
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
    sourceIds: ["lcp-philippe-chomage-2026"],
    citation:
      "abaisser à « douze mois maximum pour les moins de 50 ans » la durée d'indemnisation du chômage",
    adequation: "directe",
    sourcePrimaire: "Déclarations à l'AFP, 27 août 2026",
    rationale:
      "Réduction chiffrée et explicite. Le régime de référence est de 18 mois pour les moins de 55 ans depuis la réforme de 2023, et cette durée passe à 15 mois en cas de rupture conventionnelle depuis le 1er septembre 2026 : le premier codage écrivait à tort « 18 mois pour les moins de 50 ans ».",
    reviewStatus: "draft",
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
    reviewStatus: "draft",
    updatedAt: "2026-09-19",
  },
] as const satisfies readonly Stance[];
