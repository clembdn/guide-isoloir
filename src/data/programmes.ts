/**
 * PROGRAMMES DES CANDIDATS — propositions et état d'avancement.
 *
 * DEUXIÈME REGISTRE, HORS SCORE. Les positions de `positions.ts` répondent aux
 * vingt-quatre affirmations du test et entrent dans le calcul. Les
 * propositions ci-dessous décrivent ce que chacun propose, qu'une affirmation
 * s'y rapporte ou non, et n'entrent dans AUCUN calcul. Elles existent parce que
 * la plupart des mesures d'une campagne — un couvre-feu numérique, un fonds
 * d'investissement, un état d'urgence contre le narcotrafic — ne correspondent
 * à aucune affirmation, et qu'une fiche qui ne montrerait que les
 * affirmations ne dirait rien du programme.
 *
 * MÊMES EXIGENCES QUE POUR UNE POSITION. Chaque proposition porte le verbatim
 * relevé dans sa source, sa source, et la nature du document. Relevé du
 * 25 septembre 2026 : chaque source a été téléchargée et convertie en texte,
 * et chaque citation y a été retrouvée mot pour mot, apostrophes et
 * guillemets typographiques mis à part.
 *
 * UNE PROPOSITION DE PARTI RESTE CELLE DU PARTI. Quand elle vient d'un document
 * du parti ou de son groupe — contre-budget du RN, programme des Écologistes —
 * son `actorId` est le parti, et la fiche du candidat la montre en nommant le
 * parti. Elle n'est jamais présentée comme un engagement personnel.
 *
 * PAS DE « MESURES PHARES ». Le nombre de propositions relevées dépend de ce
 * que chaque campagne a publié et de ce qui a été lu ; il ne mesure pas la
 * qualité d'un programme. L'aperçu de la liste des candidats en retient trois
 * par une règle mécanique publiée (nature, puis date, puis identifiant), et
 * jamais par un choix de l'éditeur.
 *
 * PAS DE VALIDATION ZOD ICI : `src/lib/fiches.ts` valide au build.
 */
import type { EtatProgramme, Proposition } from "../lib/modele";

/** Ce fichier contient des données réelles. Le garde-fou de publication l'autorise. */
export const DONNEES_FACTICES = false;

export const PROPOSITIONS = [
  {
    id: "jean-luc-melenchon--retraite-60",
    actorId: "jean-luc-melenchon",
    domaine: "travail-retraites",
    portee: "mesure",
    intitule: "Instaurer la retraite à 60 ans",
    citation: "Instaurer la retraite à 60 ans, mesure phare de l'Avenir en commun depuis 2017",
    nature: "programme-2027",
    sourceIds: ["aec2027-chapitre-8"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "jean-luc-melenchon--isf",
    actorId: "jean-luc-melenchon",
    domaine: "fiscalite",
    portee: "mesure",
    intitule: "Rétablir l'impôt sur la fortune, avec un volet climatique",
    citation: "Rétablir et renforcer l'impôt sur la fortune avec un volet climatique",
    nature: "programme-2027",
    sourceIds: ["aec2027-chapitre-6"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "jean-luc-melenchon--regularisation",
    actorId: "jean-luc-melenchon",
    domaine: "immigration",
    portee: "mesure",
    intitule: "Régulariser les travailleurs, les étudiants et les parents d'enfants scolarisés",
    citation:
      "Faciliter l'accès aux visas, régulariser les travailleurs, étudiants, parents d'enfants scolarisés et instituer la carte de séjour de dix ans comme titre de séjour de référence",
    nature: "programme-2027",
    sourceIds: ["aec2027-chapitre-16"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "jean-luc-melenchon--smic-1700",
    actorId: "jean-luc-melenchon",
    domaine: "economie-salaires",
    portee: "mesure",
    intitule: "Porter le SMIC à 1 700 euros nets",
    citation: "Le SMIC à 1700€ net",
    nature: "document-parti",
    precisions:
      "Vignette de la page d'accueil de La France insoumise : ni l'échéance ni le financement ne sont précisés à cet endroit.",
    sourceIds: ["lfi-accueil-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "jean-luc-melenchon--blocage-prix",
    actorId: "jean-luc-melenchon",
    domaine: "economie-salaires",
    portee: "mesure",
    intitule: "Bloquer les prix",
    citation: "Bloquer les prix",
    nature: "document-parti",
    precisions:
      "Vignette de la page d'accueil de La France insoumise : les produits concernés ne sont pas précisés à cet endroit.",
    sourceIds: ["lfi-accueil-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "jean-luc-melenchon--regle-verte",
    actorId: "jean-luc-melenchon",
    domaine: "ecologie",
    portee: "orientation",
    intitule: "Instaurer la « règle verte »",
    citation: "Instaurer la Règle verte",
    nature: "document-parti",
    precisions:
      "Vignette de la page d'accueil de La France insoumise, sans définition de la règle à cet endroit.",
    sourceIds: ["lfi-accueil-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "anasse-kazib--28h-retraite",
    actorId: "anasse-kazib",
    domaine: "travail-retraites",
    portee: "mesure",
    intitule: "Semaine de 28 heures et retraite à 60 ans, 55 ans pour les métiers pénibles",
    citation:
      "le candidat a posé comme revendications centrales la semaine de 28 heures et la retraite à 60 ans, 55 ans pour les métiers pénibles, sans condition d'annuités",
    nature: "declaration-personnelle",
    precisions: "Rapporté au style indirect par Révolution permanente, le mouvement du candidat.",
    sourceIds: ["rp-kazib-premieres-mesures-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "anasse-kazib--smic-2000",
    actorId: "anasse-kazib",
    domaine: "economie-salaires",
    portee: "mesure",
    intitule: "SMIC à 2 000 euros et indexation des salaires sur les prix",
    citation:
      "il entend exiger l'augmentation du SMIC à 2000 euros et de l'ensemble des salaires, indexés sur les prix",
    nature: "declaration-personnelle",
    precisions: "La source ne précise pas si les 2 000 euros sont bruts ou nets.",
    sourceIds: ["rp-kazib-premieres-mesures-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "anasse-kazib--expropriation",
    actorId: "anasse-kazib",
    domaine: "economie-salaires",
    portee: "mesure",
    intitule: "Exproprier sans indemnité les secteurs stratégiques, sous contrôle des travailleurs",
    citation:
      "exproprier sans indemnité ni rachat, sous contrôle des travailleurs, les entreprises qui refuseraient ces mesures comme les secteurs stratégiques, de l'énergie à la santé",
    nature: "declaration-personnelle",
    sourceIds: ["rp-kazib-premieres-mesures-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "anasse-kazib--regularisation",
    actorId: "anasse-kazib",
    domaine: "immigration",
    portee: "mesure",
    intitule: "Régulariser tous les sans-papiers",
    citation:
      "sur celui du racisme, avec la régularisation de tous les sans-papiers et la liberté de circulation et d'installation",
    nature: "declaration-personnelle",
    precisions:
      "Rapporté au style indirect par Révolution permanente, comme un axe de la campagne.",
    sourceIds: ["rp-kazib-premieres-mesures-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "selma-labib--programme-de-luttes",
    actorId: "selma-labib",
    domaine: "economie-salaires",
    portee: "orientation",
    intitule: "Un programme de luttes et des perspectives communistes et internationalistes",
    citation:
      "ils défendent un programme de luttes et des perspectives communistes et internationalistes",
    nature: "document-parti",
    sourceIds: ["npar-communique-labib-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "selma-labib--regularisation",
    actorId: "selma-labib",
    domaine: "immigration",
    portee: "mesure",
    intitule: "Régulariser tous les sans-papiers et accorder le droit de vote aux étrangers",
    citation:
      "à commencer par la régularisation de tous les sans-papiers, et le droit de vote pour les étrangers",
    nature: "declaration-personnelle",
    precisions:
      "Intervention d'avril 2024, quand elle conduisait la liste du NPA-R aux européennes : antérieure à sa candidature.",
    sourceIds: ["npar-labib-frontieres-2024"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "nathalie-arthaud--expropriation",
    actorId: "nathalie-arthaud",
    domaine: "economie-salaires",
    portee: "mesure",
    intitule: "Exproprier la grande bourgeoisie, sans indemnité ni rachat",
    citation:
      "l'expropriation de la grande bourgeoisie, la confiscation sans indemnité ni rachat de ses capitaux, la propriété commune des moyens de production",
    nature: "declaration-personnelle",
    precisions:
      "Présenté comme le cœur du programme de Lutte ouvrière, repris du Manifeste du parti communiste de 1848.",
    sourceIds: ["lo-arthaud-manifeste-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "nathalie-arthaud--regularisation",
    actorId: "nathalie-arthaud",
    domaine: "immigration",
    portee: "mesure",
    intitule: "Régulariser tous les sans-papiers, liberté de circulation et d'installation",
    citation:
      "régularisation de tous les sans-papiers, liberté de circulation et d'installation pour chaque être humain de cette planète !",
    nature: "declaration-personnelle",
    sourceIds: ["lo-arthaud-manifeste-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "fabien-roussel--fonds-100-milliards",
    actorId: "fabien-roussel",
    domaine: "economie-salaires",
    portee: "mesure",
    intitule: "Un fonds d'investissement de 100 milliards d'euros pour la production nationale",
    citation:
      "créer un fonds d'investissement de 100 milliards d'euros dédié à ce grand combat pour la production nationale",
    nature: "declaration-personnelle",
    precisions:
      "Proposé dans ses vœux de janvier 2026, avant sa désignation comme candidat le 6 septembre.",
    sourceIds: ["pcf-voeux-roussel-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "delphine-batho--decroissance",
    actorId: "delphine-batho",
    domaine: "ecologie",
    portee: "orientation",
    intitule: "Une décroissance conçue comme défense de l'économie de proximité",
    citation:
      "La décroissance que je soutiens, c'est une politique de défense de l'économie de proximité contre les 600 avions gros-porteurs qui décollent chaque nuit de Chine",
    nature: "declaration-personnelle",
    precisions:
      "Entretien de novembre 2025 au Nouvel Obs. Aucune mesure chiffrée ne l'accompagne ; son parti annonce un programme de gouvernement à construire.",
    sourceIds: ["ge-batho-candidate-2025"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "marine-tondelier--mensonge-politique",
    actorId: "marine-tondelier",
    domaine: "institutions",
    portee: "mesure",
    intitule: "Interdire le mensonge en politique par la loi, sous peine d'inéligibilité",
    citation:
      "Une loi pour interdire le mensonge en politique. Sous peine d'inéligibilité. Vite. Pour un débat public de qualité.",
    nature: "declaration-personnelle",
    sourceIds: ["tondelier-mensonge-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-les-ecologistes--sortie-nucleaire",
    actorId: "parti-les-ecologistes",
    domaine: "ecologie",
    portee: "mesure",
    intitule: "Planifier la sortie du nucléaire et arrêter les nouveaux réacteurs",
    citation:
      "Planifier la sortie du nucléaire. Mettre fin aux nouveaux programmes EPR-2 et SMR extrêmement dispendieux.",
    nature: "programme-2027",
    sourceIds: ["eco-programme-2027"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-les-ecologistes--isf-climatique",
    actorId: "parti-les-ecologistes",
    domaine: "fiscalite",
    portee: "mesure",
    intitule: "Rétablir l'ISF avec une composante climatique",
    citation:
      "Rétablir l'Impôt sur la Fortune (ISF) en lui ajoutant une composante climatique pour orienter le patrimoine vers des actifs verts",
    nature: "programme-2027",
    sourceIds: ["eco-programme-2027"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-les-ecologistes--proportionnelle",
    actorId: "parti-les-ecologistes",
    domaine: "institutions",
    portee: "mesure",
    intitule: "Élire les députés à la proportionnelle intégrale",
    citation:
      "Instaurer la proportionnelle intégrale sans prime majoritaire aux élections législatives",
    nature: "programme-2027",
    sourceIds: ["eco-programme-2027"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-les-ecologistes--vote-16-ans",
    actorId: "parti-les-ecologistes",
    domaine: "institutions",
    portee: "mesure",
    intitule: "Ouvrir le droit de vote à 16 ans",
    citation: "Ouvrir le droit de vote à 16 ans avec une formation civique",
    nature: "programme-2027",
    sourceIds: ["eco-programme-2027"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-les-ecologistes--pesticides",
    actorId: "parti-les-ecologistes",
    domaine: "ecologie",
    portee: "mesure",
    intitule: "Sortir des pesticides de synthèse d'ici 2050",
    citation:
      "Planifier une sortie progressive des pesticides de synthèse et des engrais azotés à l'horizon 2050",
    nature: "programme-2027",
    sourceIds: ["eco-programme-2027"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-les-ecologistes--ukraine",
    actorId: "parti-les-ecologistes",
    domaine: "europe-international",
    portee: "mesure",
    intitule: "Soutenir militairement l'Ukraine",
    citation:
      "Soutenir militairement l'Ukraine. Fournir du matériel militaire, y compris de capacités de frappe à longue portée et des moyens de défense antiaérienne pour protéger le ciel ukrainien.",
    nature: "programme-2027",
    sourceIds: ["eco-programme-2027"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-place-publique--orientations-campagne",
    actorId: "parti-place-publique",
    domaine: "economie-salaires",
    portee: "orientation",
    intitule: "Transition écologique, rémunération du travail et réussite éducative",
    citation:
      "Réveiller la France, réussir la transition écologique, permettre à chacun de vivre mieux de son travail, refaire de la réussite éducative une promesse collective.",
    nature: "document-parti",
    precisions:
      "Formulé par le comité de Place publique des Bouches-du-Rhône au lancement de la campagne.",
    sourceIds: ["pp13-glucksmann-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "olivier-faure--smic-1600",
    actorId: "olivier-faure",
    domaine: "economie-salaires",
    portee: "mesure",
    intitule: "Porter le SMIC à 1 600 euros",
    citation:
      "Une revalorisation, au-delà des strictes obligations légales, qui permette de porter le SMIC à 1 600 euros",
    nature: "declaration-personnelle",
    precisions:
      "Communiqué du Parti socialiste signé par Olivier Faure, de décembre 2025, antérieur à sa candidature. Le texte ne précise pas si le montant est brut ou net.",
    sourceIds: ["ps-faure-smic-2025"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "jerome-guedj--loi-grand-age",
    actorId: "jerome-guedj",
    domaine: "sante-grand-age",
    portee: "mesure",
    intitule: "Une loi pour le droit à vieillir dans la dignité",
    citation:
      "visant à garantir le droit à vieillir dans la dignité et à préparer la société au vieillissement de sa population",
    nature: "travail-parlementaire",
    precisions:
      "Proposition de loi n° 1061 d'avril 2023, dont il est le premier signataire, cosignée par d'autres députés socialistes dont Olivier Faure. Elle n'a pas été reprise telle quelle dans un programme 2027.",
    sourceIds: ["an-ppl-1061-grand-age-2023"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "segolene-royal--priorites",
    actorId: "segolene-royal",
    domaine: "institutions",
    portee: "orientation",
    intitule: "Un « ordre juste » et l'urgence climatique et énergétique",
    citation:
      'ses priorités, parmi lesquelles "un ordre juste", l\'urgence climatique et énergétique',
    nature: "declaration-personnelle",
    precisions:
      "Priorités énoncées à l'annonce de sa candidature à la primaire, rapportées par LCP.",
    sourceIds: ["lcp-primaire-sociale-democrate-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "emmanuel-maurel--priorites",
    actorId: "emmanuel-maurel",
    domaine: "economie-salaires",
    portee: "orientation",
    intitule: "Enrayer le déclin français et défendre les travailleurs",
    citation:
      'affirmant avoir pour priorités d\'"enrayer le déclin français" et de "défendre les travailleurs"',
    nature: "declaration-personnelle",
    precisions: "Priorités énoncées sur franceinfo le 4 septembre 2026, rapportées par LCP.",
    sourceIds: ["lcp-primaire-sociale-democrate-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "francois-ruffin--auxiliaires-de-vie",
    actorId: "francois-ruffin",
    domaine: "sante-grand-age",
    portee: "mesure",
    intitule: "Consacrer 10 milliards d'euros aux auxiliaires de vie",
    citation:
      "Les saintes vivent de l'amour de Dieu et d'eau fraîche, inutile de les payer. Alors qu'il leur faudrait, justement, 10 milliards.",
    nature: "declaration-personnelle",
    precisions:
      "Texte de décembre 2024, antérieur à la campagne. Ni la période couverte ni le calcul du montant ne sont précisés.",
    sourceIds: ["ruffin-saintes-2024"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "gabriel-attal--reseaux-sociaux-15-ans",
    actorId: "gabriel-attal",
    domaine: "education-jeunesse",
    portee: "mesure",
    intitule: "Interdire les réseaux sociaux avant 15 ans",
    citation:
      "vise à interdire l'accès aux réseaux sociaux pour les moins de 15 ans et la suspension des comptes déjà existants, sous peine de sanctions financières",
    nature: "travail-parlementaire",
    precisions:
      "Proposition de loi portée par Laure Miller, dont Gabriel Attal est le deuxième signataire, examinée en janvier 2026.",
    sourceIds: ["lcp-attal-reseaux-sociaux-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "gabriel-attal--couvre-feu-numerique",
    actorId: "gabriel-attal",
    domaine: "education-jeunesse",
    portee: "mesure",
    intitule: "Couper l'accès des 15-18 ans aux réseaux sociaux de 22 heures à 8 heures",
    citation:
      "désactiver de manière automatique l'accès aux comptes des mineurs de 15 à 18 ans entre 22 heures et 8 heures",
    nature: "travail-parlementaire",
    precisions:
      "Même proposition de loi. Renaissance présente aussi ce « couvre-feu numérique » comme une proposition de Gabriel Attal, sur une page non datée.",
    sourceIds: ["lcp-attal-reseaux-sociaux-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "edouard-philippe--etat-urgence-narcotrafic",
    actorId: "edouard-philippe",
    domaine: "securite-justice",
    portee: "mesure",
    intitule: "Un « état d'urgence » contre le narcotrafic",
    citation:
      "il a déclaré être favorable à l'instauration d'un \"état d'urgence\" relatif au narcotrafic, sur le même modèle que celui créé pour lutter contre le terrorisme",
    nature: "declaration-personnelle",
    precisions: "Proposé lors d'un déplacement à Alès le 7 septembre 2026, rapporté par la presse.",
    sourceIds: ["orange-philippe-narcotrafic-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "edouard-philippe--fiche-s-financiere",
    actorId: "edouard-philippe",
    domaine: "securite-justice",
    portee: "mesure",
    intitule: "Des « fichiers S » financiers pour les personnes liées au narcotrafic",
    citation:
      'Édouard Philippe souhaite la création de "fichiers S" visant à ce que "la chaîne financière, bancaire et administrative" sache qui sont ceux "soupçonnés ou compromis dans un narcotrafic pour surveiller leurs actifs financiers"',
    nature: "declaration-personnelle",
    sourceIds: ["orange-philippe-narcotrafic-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "bruno-retailleau--revenu-familial",
    actorId: "bruno-retailleau",
    domaine: "famille-societe",
    portee: "mesure",
    intitule: "Un revenu familial de 240 euros par mois dès le premier enfant",
    citation:
      "l'instauration d'un \"revenu familial\" de 240 euros par mois dès le premier enfant et qui frôlerait les 1 000 euros dès le troisième",
    nature: "declaration-personnelle",
    precisions:
      "Pour les familles étrangères, il exige « au moins cinq ans de résidence et de travail ». Entretien à l'AFP.",
    sourceIds: ["franceinfo-retailleau-natalite-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "bruno-retailleau--referendum-domaine-loi",
    actorId: "bruno-retailleau",
    domaine: "institutions",
    portee: "mesure",
    intitule: "Ouvrir le référendum à tout le domaine de la loi, immigration comprise",
    citation:
      "Il souhaite notamment que le référendum législatif puisse porter sur l'ensemble du domaine de la loi.",
    nature: "declaration-personnelle",
    precisions:
      "Entretien au Figaro, rapporté par Public Sénat. La réforme passerait par une révision de la Constitution en début de mandat.",
    sourceIds: ["publicsenat-retailleau-constitution-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-rassemblement-national--tva-energies",
    actorId: "parti-rassemblement-national",
    domaine: "fiscalite",
    portee: "mesure",
    intitule: "Baisser la TVA sur les énergies",
    citation: "Baisse de la TVA sur les énergies (gaz, électricité, carburants, bois, fioul).",
    nature: "travail-parlementaire",
    precisions: "Contre-budget 2026 du groupe RN à l'Assemblée, pas un programme présidentiel.",
    sourceIds: ["rn-contre-budget-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-rassemblement-national--prestations-5-ans",
    actorId: "parti-rassemblement-national",
    domaine: "immigration",
    portee: "mesure",
    intitule: "Réserver les prestations de solidarité aux étrangers ayant travaillé cinq ans",
    citation:
      "Réserver le bénéfice des prestations de solidarités aux étrangers ayant au moins 5 ans ETP travaillés en France",
    nature: "travail-parlementaire",
    precisions:
      "Contre-budget 2026 du groupe RN à l'Assemblée, pas un programme présidentiel. ETP : équivalent temps plein.",
    sourceIds: ["rn-contre-budget-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "david-lisnard--contrat-unique",
    actorId: "david-lisnard",
    domaine: "economie-salaires",
    portee: "mesure",
    intitule: "Un contrat de travail unique qui fusionne CDI et CDD",
    citation:
      "l'instauration d'un contrat de travail unique pour les nouveaux emplois, fusionnant CDI et CDD avec des indemnités de licenciement qui seraient progressives",
    nature: "programme-2027",
    sourceIds: ["lisnard-ambition"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "david-lisnard--impots-production",
    actorId: "david-lisnard",
    domaine: "fiscalite",
    portee: "mesure",
    intitule: "Intensifier la baisse des impôts de production",
    citation: "La baisse de la fiscalité de production doit être intensifiée.",
    nature: "programme-2027",
    sourceIds: ["lisnard-ambition"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "nicolas-dupont-aignan--ric",
    actorId: "nicolas-dupont-aignan",
    domaine: "institutions",
    portee: "mesure",
    intitule: "Instaurer le référendum d'initiative citoyenne",
    citation: "Instauration du RIC (Référendum d'Initiative Citoyenne).",
    nature: "declaration-personnelle",
    precisions: "Annoncé le jour de sa déclaration de candidature, en mars 2025.",
    sourceIds: ["dlf-nda-candidature-2025"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "nicolas-dupont-aignan--marche-electricite",
    actorId: "nicolas-dupont-aignan",
    domaine: "ecologie",
    portee: "mesure",
    intitule: "Sortir du marché européen de l'électricité",
    citation:
      "Sortie du marché européen de l'électricité pour réduire les factures des ménages et des entreprises.",
    nature: "declaration-personnelle",
    sourceIds: ["dlf-nda-candidature-2025"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "nicolas-dupont-aignan--otan",
    actorId: "nicolas-dupont-aignan",
    domaine: "europe-international",
    portee: "mesure",
    intitule: "Sortir du commandement intégré de l'OTAN",
    citation:
      "Sortie du commandement intégré de l'OTAN pour assurer une défense autonome de la France.",
    nature: "declaration-personnelle",
    sourceIds: ["dlf-nda-candidature-2025"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "nicolas-dupont-aignan--armee-frontieres",
    actorId: "nicolas-dupont-aignan",
    domaine: "immigration",
    portee: "mesure",
    intitule: "Déployer l'armée aux frontières contre l'immigration illégale",
    citation: "Déploiement de l'armée à nos frontières pour bloquer l'immigration illégale.",
    nature: "declaration-personnelle",
    sourceIds: ["dlf-nda-candidature-2025"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "clara-egger--ric-constituant",
    actorId: "clara-egger",
    domaine: "institutions",
    portee: "mesure",
    intitule: "Référendum obligatoire pour réviser la Constitution, et initiative citoyenne",
    citation:
      "en rendant obligatoire le référendum pour toute révision constitutionnelle et en introduisant le droit d'initiative citoyenne",
    nature: "programme-2027",
    sourceIds: ["sd-parrainage-egger-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "clara-egger--code-electoral-communal",
    actorId: "clara-egger",
    domaine: "institutions",
    portee: "mesure",
    intitule: "Permettre aux communes de fixer leurs propres règles électorales",
    citation: "chaque commune pourra prendre en main la constitution de son propre code électoral",
    nature: "programme-2027",
    precisions:
      "Seulement pour les communes qui le demandent, et si les citoyens ont approuvé la réforme par référendum. Une commune pourrait alors introduire la démocratie directe.",
    sourceIds: ["sd-programme-2027"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-les-patriotes--frexit",
    actorId: "parti-les-patriotes",
    domaine: "europe-international",
    portee: "mesure",
    intitule: "Quitter l'UE, l'euro, Schengen, la CEDH, l'OTAN et l'OMS",
    citation:
      "La France doit retrouver sa souveraineté nationale en quittant toutes les instances supranationales : UE, Euro, Schengen, CEDH, OTAN, OMS.",
    nature: "document-parti",
    sourceIds: ["lp-projet-patriote-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-union-populaire-republicaine--frexit",
    actorId: "parti-union-populaire-republicaine",
    domaine: "europe-international",
    portee: "orientation",
    intitule: "Faire du Frexit l'enjeu de la campagne",
    citation:
      "L'UPR réaffirme sa détermination absolue à porter le débat de la souveraineté nationale, du Frexit et du redressement économique devant l'ensemble des entrepreneurs et du peuple français",
    nature: "document-parti",
    sourceIds: ["upr-medef-2026"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-equinoxe--relocaliser",
    actorId: "parti-equinoxe",
    domaine: "economie-salaires",
    portee: "orientation",
    intitule: "Relocaliser les productions agricoles et industrielles",
    citation:
      "Relocaliser les productions agricoles et industrielles pour reprendre la main, dans le respect des limites planétaires.",
    nature: "document-parti",
    sourceIds: ["equinoxe-presidentielle-2027"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-equinoxe--alimentation-soins",
    actorId: "parti-equinoxe",
    domaine: "sante-grand-age",
    portee: "orientation",
    intitule: "Garantir l'accès à une alimentation de qualité et aux soins partout",
    citation:
      "Garantir l'accès à une alimentation de qualité et aux soins sur l'ensemble du territoire.",
    nature: "document-parti",
    sourceIds: ["equinoxe-presidentielle-2027"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-equinoxe--decider-collectivement",
    actorId: "parti-equinoxe",
    domaine: "institutions",
    portee: "orientation",
    intitule: "Donner plus de pouvoirs et de moyens aux territoires",
    citation:
      "Cela passe par davantage de pouvoirs et de moyens pour les territoires, un droit plus simple et de nouveaux espaces de participation citoyenne.",
    nature: "document-parti",
    sourceIds: ["equinoxe-presidentielle-2027"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
  {
    id: "parti-reconquete--priorites",
    actorId: "parti-reconquete",
    domaine: "immigration",
    portee: "orientation",
    intitule: "Huit priorités affichées, de l'identité à l'indépendance",
    citation:
      "Identité, Immigration, Islam, Insécurité, Instruction, Impôts, Industrie et Indépendance",
    nature: "document-parti",
    precisions: "Liste de priorités, sans mesure détaillée à cet endroit.",
    sourceIds: ["reconquete-accueil"],
    reviewStatus: "reconciled",
    updatedAt: "2026-09-25",
  },
] as const satisfies readonly Proposition[];

/**
 * ÉTAT DU PROGRAMME, UN PAR CANDIDAT.
 *
 * « Aucun programme publié n'a été trouvé » dit ce qui a été cherché et quand,
 * pas qu'il n'existe rien : une absence ne se prouve pas, elle se date.
 */
export const ETATS_PROGRAMME = [
  {
    actorId: "nathalie-arthaud",
    etat: "non-publie",
    texte:
      "Lutte ouvrière présente le Manifeste du parti communiste comme « notre programme ». Aucun programme présidentiel détaillé n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lo-arthaud-manifeste-2026"],
  },
  {
    actorId: "francois-asselineau",
    etat: "en-construction",
    texte:
      "L'UPR indique que son programme présidentiel 2027 « sera publié prochainement ». Ses programmes de 2012, 2017 et 2022 restent en ligne, chacun daté.",
    sourceIds: ["upr-programme"],
  },
  {
    actorId: "gabriel-attal",
    etat: "non-publie",
    texte: "Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "delphine-batho",
    etat: "en-construction",
    texte:
      "Génération écologie a investi sa candidate le 6 juin 2026 et appelle à construire le programme de gouvernement qu'elle portera.",
    sourceIds: ["ge-investiture-batho-2026"],
  },
  {
    actorId: "olivier-becht",
    etat: "en-construction",
    texte:
      "Il présente depuis un an un « Projet France » lors de déplacements, et annonce la publication prochaine d'un livre.",
    sourceIds: ["cnews-becht-candidature-2026"],
  },
  {
    actorId: "xavier-bertrand",
    etat: "non-publie",
    texte: "Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "karim-bouamrane",
    etat: "non-publie",
    texte: "Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "nicolas-dupont-aignan",
    etat: "en-construction",
    texte:
      "Debout la France actualise son programme pour 2027 : seules les pages marquées « Projet 2027 » sont à jour.",
    sourceIds: ["dlf-projet-2027"],
  },
  {
    actorId: "clara-egger",
    etat: "publie",
    texte:
      "Programme volontairement limité à deux réformes institutionnelles, avec le calendrier de leur mise en œuvre.",
    sourceIds: ["sd-programme-2027"],
  },
  {
    actorId: "olivier-faure",
    etat: "non-publie",
    texte:
      "Candidat à la primaire sociale-démocrate des 9-10 et 16-17 octobre. Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-primaire-sociale-democrate-2026"],
  },
  {
    actorId: "raphael-glucksmann",
    etat: "non-publie",
    texte:
      "Candidat à la primaire sociale-démocrate. Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-primaire-sociale-democrate-2026"],
  },
  {
    actorId: "jerome-guedj",
    etat: "non-publie",
    texte:
      "Candidat à la primaire sociale-démocrate. Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-primaire-sociale-democrate-2026"],
  },
  {
    actorId: "anasse-kazib",
    etat: "en-construction",
    texte:
      "Révolution permanente a présenté le 12 septembre 2026 les « premières mesures programmatiques » de la campagne.",
    sourceIds: ["rp-kazib-premieres-mesures-2026"],
  },
  {
    actorId: "selma-labib",
    etat: "non-publie",
    texte:
      "Le NPA-Révolutionnaires présente une candidature « ouvrière et révolutionnaire ». Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["npar-communique-labib-2026"],
  },
  {
    actorId: "francis-lalanne",
    etat: "non-publie",
    texte: "Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "marine-le-pen",
    etat: "non-publie",
    texte:
      "Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026. Les mesures affichées ici viennent du contre-budget 2026 du groupe RN.",
    sourceIds: ["lcp-liste-candidats-2026", "rn-contre-budget-2026"],
  },
  {
    actorId: "david-lisnard",
    etat: "publie",
    texte:
      "Programme publié sur le site de son mouvement, Nouvelle Énergie, organisé en grands chapitres thématiques.",
    sourceIds: ["lisnard-ambition"],
  },
  {
    actorId: "emmanuel-maurel",
    etat: "non-publie",
    texte:
      "Candidat à la primaire sociale-démocrate. Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-primaire-sociale-democrate-2026"],
  },
  {
    actorId: "jean-luc-melenchon",
    etat: "publie",
    texte:
      "L'Avenir en commun, édition 2025, publié chapitre par chapitre sur son site de campagne à partir du 17 juillet 2026 et ouvert aux contributions.",
    sourceIds: ["aec2027-chapitre-8"],
  },
  {
    actorId: "antoine-mikolajczak",
    etat: "en-construction",
    texte:
      "Équinoxe annonce que « le programme officiel pour l'élection présidentielle de 2027 arrive très prochainement » et affiche trois priorités.",
    sourceIds: ["equinoxe-presidentielle-2027"],
  },
  {
    actorId: "edouard-philippe",
    etat: "non-publie",
    texte: "Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "florian-philippot",
    etat: "publie",
    texte:
      "Les Patriotes ont publié en septembre 2026 des « Grandes orientations pour un projet patriote », édition 2026-2027.",
    sourceIds: ["lp-projet-patriote-2026"],
  },
  {
    actorId: "bruno-retailleau",
    etat: "non-publie",
    texte: "Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "fabien-roussel",
    etat: "en-construction",
    texte:
      "Le PCF annonce un projet à construire « avec les travailleuses et travailleurs » après la désignation du 6 septembre 2026.",
    sourceIds: ["pcf-roussel-designe-2026"],
  },
  {
    actorId: "segolene-royal",
    etat: "non-publie",
    texte:
      "Candidate à la primaire sociale-démocrate. Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-primaire-sociale-democrate-2026"],
  },
  {
    actorId: "francois-ruffin",
    etat: "non-publie",
    texte: "Aucun programme présidentiel publié n'a été trouvé au 25 septembre 2026.",
    sourceIds: ["lcp-liste-candidats-2026"],
  },
  {
    actorId: "marine-tondelier",
    etat: "publie",
    texte:
      "Les Écologistes, dont elle est la candidate, ont publié à l'été 2026 un programme de 557 mesures.",
    sourceIds: ["eco-programme-2027"],
  },
  {
    actorId: "eric-zemmour",
    etat: "en-construction",
    texte:
      "Reconquête construit son programme par une plateforme participative ouverte aux contributions.",
    sourceIds: ["reconquete-plateforme-programme"],
  },
] as const satisfies readonly EtatProgramme[];
