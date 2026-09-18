/**
 * QUESTIONNAIRE RÉEL — élection présidentielle du 18 avril 2027.
 *
 * 24 affirmations, 6 thèmes, 4 affirmations par thème.
 *
 * ÉQUILIBRE `direction` : chaque thème contient exactement deux `+1` et deux
 * `-1`. C'est cet invariant que l'audit vérifie thème par thème. Si tu ajoutes
 * une affirmation, ajoute-la PAR PAIRE (un `+1` et un `-1`), sinon le build
 * d'audit doit échouer.
 *
 * `direction` n'est pas un marqueur idéologique : il indique seulement dans
 * quel sens l'accord pousse sur la dimension du thème. Il sert à neutraliser
 * le biais d'acquiescement (la tendance à répondre « d'accord » par défaut).
 *
 * IDENTIFIANTS : slugs sémantiques, stables même si `ordre` change. Ils sont
 * repris dans les identifiants de position (`${actorId}--${questionId}`), donc
 * NE LES RENOMME PAS une fois des positions saisies.
 *
 * LA VALIDATION ZOD N'EST PAS APPELÉE ICI, pour la même raison que dans le
 * fichier factice : ce module part au navigateur, et embarquer zod coûterait
 * ~86 ko pour une vérification qui n'a de sens qu'au build. La page `.astro` qui
 * sert ce questionnaire appelle `validerQuestions` ET
 * `validerSourcesInfobulles` dans son frontmatter, qui ne s'exécute que côté
 * serveur. Le build échoue là.
 *
 * ÉCHELLE DE RÉPONSE : absente de ce fichier, et elle n'y reviendra pas. Elle
 * est réelle, pas factice, et partagée avec le jeu de démonstration : elle vit
 * dans `src/lib/echelle.ts`.
 *
 * INFOBULLES : elles définissent un terme technique, elles n'argumentent
 * jamais. Une infobulle qui explique pourquoi une mesure serait bonne ou
 * mauvaise est un biais éditorial, pas une aide à la compréhension.
 * Test : l'infobulle doit pouvoir être signée par les deux camps.
 */
import type { Question } from "../lib/questions";

/** Ce fichier contient des données réelles. Le garde-fou de publication l'autorise. */
export const DONNEES_FACTICES = false;

export const QUESTIONS = [
  // ───────────────────────────────────────────────────────────────────────
  // THÈME 1 — Travail et retraites
  // Dimension : accord = départ plus précoce / système plus généreux
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "retraites-age-legal-60",
    theme: "Travail et retraites",
    texte: "L'âge légal de départ à la retraite devrait être abaissé à 60 ans.",
    direction: 1,
    infobulle:
      "L'âge légal de départ est l'âge à partir duquel il est possible de demander sa retraite, indépendamment du nombre de trimestres cotisés.",
    infobulleSourceId: "source-service-public-age-legal",
    version: 1,
    ordre: 10,
  },
  {
    id: "retraites-abrogation-reforme-2023",
    theme: "Travail et retraites",
    texte: "La réforme des retraites de 2023 devrait être abrogée.",
    direction: 1,
    infobulle:
      "La réforme adoptée en 2023 prévoit un relèvement progressif de l'âge légal de 62 à 64 ans. Son application est suspendue jusqu'en 2028.",
    infobulleSourceId: "source-lcp-retraites-2026",
    version: 1,
    ordre: 20,
  },
  {
    id: "retraites-indexation-esperance-vie",
    theme: "Travail et retraites",
    texte: "L'âge de départ à la retraite devrait évoluer automatiquement avec l'espérance de vie.",
    direction: -1,
    infobulle:
      "L'espérance de vie en bonne santé mesure le nombre d'années vécues sans limitation d'activité. Elle est inférieure à l'espérance de vie totale.",
    infobulleSourceId: "source-drees-esperance-vie",
    version: 1,
    ordre: 30,
  },
  {
    id: "retraites-part-capitalisation",
    theme: "Travail et retraites",
    texte:
      "Une part d'épargne par capitalisation devrait être ajoutée au système de retraite par répartition.",
    direction: -1,
    infobulle:
      "Dans un système par répartition, les cotisations des actifs financent les pensions versées la même année. Dans un système par capitalisation, chacun épargne pour sa propre retraite.",
    infobulleSourceId: "source-vie-publique-repartition",
    version: 1,
    ordre: 40,
  },

  // ───────────────────────────────────────────────────────────────────────
  // THÈME 2 — Fiscalité et dépense publique
  // Dimension : accord = plus de prélèvements sur le patrimoine / le capital
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "fiscalite-impot-fortune",
    theme: "Fiscalité et dépense publique",
    texte: "Un impôt sur la fortune devrait être rétabli.",
    direction: 1,
    infobulle:
      "L'impôt de solidarité sur la fortune, supprimé en 2018, portait sur l'ensemble du patrimoine. Il a été remplacé par l'impôt sur la fortune immobilière, limité aux biens immobiliers.",
    infobulleSourceId: "source-service-public-ifi",
    version: 1,
    ordre: 50,
  },
  {
    id: "fiscalite-bareme-unique-capital-travail",
    theme: "Fiscalité et dépense publique",
    texte:
      "Les revenus du capital devraient être imposés selon le même barème que les revenus du travail.",
    direction: 1,
    infobulle:
      "Les revenus du capital sont soumis depuis 2018 à un prélèvement forfaitaire unique de 30 %. Les revenus du travail suivent un barème progressif allant de 0 à 45 %.",
    infobulleSourceId: "source-service-public-pfu",
    version: 1,
    ordre: 60,
  },
  {
    id: "budget-reduction-dette-par-depenses",
    theme: "Fiscalité et dépense publique",
    texte:
      "La réduction de la dette publique devrait passer d'abord par une baisse des dépenses de l'État.",
    direction: -1,
    infobulle:
      "La dette publique regroupe les emprunts de l'État, des collectivités locales et de la Sécurité sociale. Son montant est publié chaque trimestre par l'Insee.",
    infobulleSourceId: "source-insee-dette-publique",
    version: 1,
    ordre: 70,
  },
  {
    id: "chomage-reduction-duree-indemnisation",
    theme: "Fiscalité et dépense publique",
    texte: "La durée maximale d'indemnisation du chômage devrait être réduite.",
    direction: -1,
    infobulle:
      "La durée d'indemnisation est le nombre de mois pendant lesquels l'allocation chômage peut être versée. Elle dépend de l'âge et de la durée travaillée.",
    infobulleSourceId: "source-service-public-are",
    version: 1,
    ordre: 80,
  },

  // ───────────────────────────────────────────────────────────────────────
  // THÈME 3 — Immigration et nationalité
  // Dimension : accord = accès élargi au séjour, à la nationalité, au vote
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "nationalite-suppression-droit-du-sol",
    theme: "Immigration et nationalité",
    texte:
      "Le droit du sol devrait être supprimé : la nationalité française ne s'obtiendrait plus que par filiation ou par naturalisation.",
    direction: -1,
    infobulle:
      "Le droit du sol permet à un enfant né en France de parents étrangers de devenir français sous conditions de résidence. Le droit du sang transmet la nationalité par filiation.",
    infobulleSourceId: "source-service-public-nationalite",
    version: 1,
    ordre: 90,
  },
  {
    id: "immigration-plafond-titres-sejour",
    theme: "Immigration et nationalité",
    texte: "Le nombre de titres de séjour délivrés chaque année devrait être plafonné.",
    direction: -1,
    infobulle:
      "Un titre de séjour autorise un étranger non européen à résider en France. Le nombre de titres délivrés est publié chaque année par le ministère de l'Intérieur.",
    infobulleSourceId: "source-interieur-titres-sejour",
    version: 1,
    ordre: 100,
  },
  {
    id: "immigration-regularisation-par-le-travail",
    theme: "Immigration et nationalité",
    texte:
      "Les travailleurs sans papiers employés en France depuis plusieurs années devraient pouvoir être régularisés.",
    direction: 1,
    infobulle:
      "La régularisation est la délivrance d'un titre de séjour à une personne déjà présente en France sans autorisation. Elle est aujourd'hui décidée au cas par cas par les préfectures.",
    infobulleSourceId: "source-service-public-admission-exceptionnelle",
    version: 1,
    ordre: 110,
  },
  {
    id: "vote-etrangers-elections-municipales",
    theme: "Immigration et nationalité",
    texte:
      "Les étrangers résidant légalement en France devraient pouvoir voter aux élections municipales.",
    direction: 1,
    infobulle:
      "Les ressortissants de l'Union européenne résidant en France votent déjà aux élections municipales et européennes. Les autres étrangers ne votent à aucune élection française.",
    infobulleSourceId: "source-service-public-vote-etrangers",
    version: 1,
    ordre: 120,
  },

  // ───────────────────────────────────────────────────────────────────────
  // THÈME 4 — Écologie et énergie
  // Dimension : accord = plus de contrainte environnementale
  //
  // ATTENTION : l'affirmation sur le nucléaire ne s'aligne PAS sur l'axe
  // gauche-droite, et c'est délibéré. Documente-le sur /methodologie : c'est
  // la preuve que le test mesure des positions, pas une appartenance.
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "agriculture-renforcement-normes-environnementales",
    theme: "Écologie et énergie",
    texte: "Les obligations environnementales imposées à l'agriculture devraient être renforcées.",
    direction: 1,
    infobulle:
      "Les aides agricoles européennes sont conditionnées au respect de règles environnementales, appelées conditionnalité de la politique agricole commune.",
    infobulleSourceId: "source-commission-pac-conditionnalite",
    version: 1,
    ordre: 130,
  },
  {
    id: "energie-nouveaux-parcs-eoliens",
    theme: "Écologie et énergie",
    texte: "La France devrait continuer à installer de nouveaux parcs éoliens sur son territoire.",
    direction: 1,
    infobulle:
      "L'éolien terrestre et maritime fournit une part de l'électricité française. Le bilan annuel de production est publié par RTE, gestionnaire du réseau de transport d'électricité.",
    infobulleSourceId: "source-rte-bilan-electrique",
    version: 1,
    ordre: 140,
  },
  {
    id: "transport-suppression-zfe",
    theme: "Écologie et énergie",
    texte:
      "Les zones à faibles émissions, qui restreignent la circulation des véhicules anciens en ville, devraient être supprimées.",
    direction: -1,
    infobulle:
      "Une zone à faibles émissions interdit la circulation des véhicules les plus polluants dans certaines agglomérations, selon la vignette Crit'Air.",
    infobulleSourceId: "source-service-public-zfe",
    version: 1,
    ordre: 150,
  },
  {
    id: "energie-nouveaux-reacteurs-nucleaires",
    theme: "Écologie et énergie",
    texte: "La France devrait construire de nouveaux réacteurs nucléaires.",
    direction: -1,
    infobulle:
      "Le nucléaire fournit la majeure partie de l'électricité produite en France. L'EPR est le modèle de réacteur retenu pour les nouvelles constructions.",
    infobulleSourceId: "source-rte-bilan-electrique",
    version: 1,
    ordre: 160,
  },

  // ───────────────────────────────────────────────────────────────────────
  // THÈME 5 — Institutions et démocratie
  // Dimension : accord = plus de pouvoir au Parlement et aux citoyens
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "institutions-proportionnelle-legislatives",
    theme: "Institutions et démocratie",
    texte: "Les députés devraient être élus à la proportionnelle.",
    direction: 1,
    infobulle:
      "Les députés sont aujourd'hui élus au scrutin majoritaire à deux tours par circonscription. À la proportionnelle, les sièges sont répartis selon le pourcentage de voix obtenu.",
    infobulleSourceId: "source-vie-publique-modes-scrutin",
    version: 1,
    ordre: 170,
  },
  {
    id: "institutions-referendum-initiative-citoyenne",
    theme: "Institutions et démocratie",
    texte:
      "Les citoyens devraient pouvoir déclencher un référendum par pétition, sans accord du gouvernement ni du Parlement.",
    direction: 1,
    infobulle:
      "Le référendum d'initiative partagée, créé en 2008, exige l'appui d'un cinquième des parlementaires puis le soutien d'un dixième des électeurs inscrits.",
    infobulleSourceId: "source-conseil-constitutionnel-rip",
    version: 1,
    ordre: 180,
  },
  {
    id: "institutions-maintien-article-49-3",
    theme: "Institutions et démocratie",
    texte:
      "Le gouvernement devrait pouvoir continuer à faire adopter un texte sans vote de l'Assemblée nationale.",
    direction: -1,
    infobulle:
      "L'article 49 alinéa 3 de la Constitution permet au gouvernement d'engager sa responsabilité sur un texte : celui-ci est adopté sans vote, sauf si une motion de censure est adoptée.",
    infobulleSourceId: "source-constitution-article-49",
    version: 1,
    ordre: 190,
  },
  {
    id: "institutions-elargissement-champ-referendum",
    theme: "Institutions et démocratie",
    texte:
      "Le champ du référendum devrait être élargi pour permettre de soumettre la politique migratoire au vote des Français.",
    direction: -1,
    infobulle:
      "L'article 11 de la Constitution limite les sujets pouvant être soumis à référendum : organisation des pouvoirs publics, politiques économiques, sociales ou environnementales, et ratification de traités.",
    infobulleSourceId: "source-constitution-article-11",
    version: 1,
    ordre: 200,
  },

  // ───────────────────────────────────────────────────────────────────────
  // THÈME 6 — Europe et international
  // Dimension : accord = plus d'intégration européenne et d'engagement extérieur
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "europe-decisions-majorite-qualifiee",
    theme: "Europe et international",
    texte:
      "Davantage de décisions européennes devraient être prises à la majorité plutôt qu'à l'unanimité.",
    direction: 1,
    infobulle:
      "Au Conseil de l'Union européenne, certains domaines comme la fiscalité et la politique étrangère exigent l'accord de tous les États membres ; d'autres se décident à la majorité qualifiée.",
    infobulleSourceId: "source-conseil-ue-modes-vote",
    version: 1,
    ordre: 210,
  },
  {
    id: "international-financement-soutien-ukraine",
    theme: "Europe et international",
    texte: "La France devrait continuer à financer le soutien militaire à l'Ukraine.",
    direction: 1,
    infobulle:
      "Le soutien militaire recouvre les livraisons d'équipements, la formation de militaires et les financements versés à l'Ukraine. Les montants français sont publiés par le ministère des Armées.",
    infobulleSourceId: "source-armees-soutien-ukraine",
    version: 1,
    ordre: 220,
  },
  {
    id: "europe-controles-frontieres-schengen",
    theme: "Europe et international",
    texte:
      "La France devrait rétablir des contrôles permanents à ses frontières avec les pays de l'espace Schengen.",
    direction: -1,
    infobulle:
      "L'espace Schengen supprime les contrôles aux frontières entre les pays participants. Un État peut les rétablir temporairement, pour une durée encadrée par le droit européen.",
    infobulleSourceId: "source-commission-schengen",
    version: 1,
    ordre: 230,
  },
  {
    id: "europe-opposition-parlementaire-traite",
    theme: "Europe et international",
    texte:
      "Le Parlement français devrait pouvoir s'opposer à l'application d'un traité européen déjà ratifié.",
    direction: -1,
    infobulle:
      "Selon l'article 55 de la Constitution, un traité régulièrement ratifié a une autorité supérieure à celle des lois françaises.",
    infobulleSourceId: "source-constitution-article-55",
    version: 1,
    ordre: 240,
  },
] as const satisfies readonly Question[];

/**
 * SOURCES DES INFOBULLES.
 *
 * Volontairement séparées des sources de POSITIONS : une infobulle définit un
 * terme et doit venir d'une source de référence (administration, institution,
 * statistique publique), jamais de la presse. Les positions des candidats,
 * elles, viendront de la presse et des programmes.
 *
 * ⚠️ VINGT-ET-UNE URL RESTENT VIDES. Elles n'ont pas été inventées : sur un
 * site dont la promesse est la vérifiabilité, une URL fabriquée qui renvoie une
 * 404 fait plus de dégâts qu'une case vide. Chaque entrée porte l'éditeur et
 * l'intitulé exact à chercher.
 *
 * LE GARDE-FOU EST `validerSourcesInfobulles` : elle refuse une `url` vide, une
 * source orpheline et une infobulle qui pointe vers un identifiant inconnu. La
 * page qui servira ce questionnaire l'appelle dans son frontmatter, donc le
 * build échouera tant que ces vingt-et-une entrées ne sont pas remplies. C'est
 * voulu : ce questionnaire n'est pas publiable en l'état.
 */
export const SOURCES_INFOBULLES = [
  {
    id: "source-service-public-age-legal",
    titre: "Retraite : âge légal de départ",
    editeur: "Service Public (DILA)",
    url: "",
  },
  {
    id: "source-lcp-retraites-2026",
    titre: "Présidentielle : que proposent les candidats à l'Élysée sur les retraites ?",
    editeur: "LCP – Assemblée nationale",
    url: "https://lcp.fr/actualites/presidentielle-que-proposent-les-candidats-a-l-elysee-sur-les-retraites-441751",
  },
  {
    id: "source-drees-esperance-vie",
    titre: "Espérance de vie en bonne santé",
    editeur: "DREES",
    url: "",
  },
  {
    id: "source-vie-publique-repartition",
    titre: "Répartition et capitalisation : quelles différences ?",
    editeur: "Vie-publique.fr",
    url: "",
  },
  {
    id: "source-service-public-ifi",
    titre: "Impôt sur la fortune immobilière (IFI)",
    editeur: "Service Public (DILA)",
    url: "",
  },
  {
    id: "source-service-public-pfu",
    titre: "Prélèvement forfaitaire unique sur les revenus du capital",
    editeur: "Service Public (DILA)",
    url: "",
  },
  {
    id: "source-insee-dette-publique",
    titre: "Dette publique trimestrielle au sens de Maastricht",
    editeur: "Insee",
    url: "",
  },
  {
    id: "source-service-public-are",
    titre: "Allocation d'aide au retour à l'emploi : durée d'indemnisation",
    editeur: "Service Public (DILA)",
    url: "",
  },
  {
    id: "source-service-public-nationalite",
    titre: "Acquisition de la nationalité française par naissance et résidence en France",
    editeur: "Service Public (DILA)",
    url: "",
  },
  {
    id: "source-interieur-titres-sejour",
    titre: "Les chiffres de l'immigration : titres de séjour délivrés",
    editeur: "Ministère de l'Intérieur",
    url: "",
  },
  {
    id: "source-service-public-admission-exceptionnelle",
    titre: "Admission exceptionnelle au séjour",
    editeur: "Service Public (DILA)",
    url: "",
  },
  {
    id: "source-service-public-vote-etrangers",
    titre: "Un étranger peut-il voter en France ?",
    editeur: "Service Public (DILA)",
    url: "",
  },
  {
    id: "source-commission-pac-conditionnalite",
    titre: "Conditionnalité de la politique agricole commune",
    editeur: "Commission européenne",
    url: "",
  },
  {
    id: "source-rte-bilan-electrique",
    titre: "Bilan électrique annuel",
    editeur: "RTE",
    url: "",
  },
  {
    id: "source-service-public-zfe",
    titre: "Zone à faibles émissions mobilité (ZFE-m)",
    editeur: "Service Public (DILA)",
    url: "",
  },
  {
    id: "source-vie-publique-modes-scrutin",
    titre: "Quels sont les différents modes de scrutin ?",
    editeur: "Vie-publique.fr",
    url: "",
  },
  {
    id: "source-conseil-constitutionnel-rip",
    titre: "Le référendum d'initiative partagée",
    editeur: "Conseil constitutionnel",
    url: "",
  },
  {
    id: "source-constitution-article-49",
    titre: "Constitution du 4 octobre 1958, article 49",
    editeur: "Conseil constitutionnel",
    url: "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
  },
  {
    id: "source-constitution-article-11",
    titre: "Constitution du 4 octobre 1958, article 11",
    editeur: "Conseil constitutionnel",
    url: "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
  },
  {
    id: "source-constitution-article-55",
    titre: "Constitution du 4 octobre 1958, article 55",
    editeur: "Conseil constitutionnel",
    url: "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
  },
  {
    id: "source-conseil-ue-modes-vote",
    titre: "Modes de vote au Conseil de l'Union européenne",
    editeur: "Conseil de l'Union européenne",
    url: "",
  },
  {
    id: "source-armees-soutien-ukraine",
    titre: "Soutien de la France à l'Ukraine",
    editeur: "Ministère des Armées",
    url: "",
  },
  {
    id: "source-commission-schengen",
    titre: "Espace Schengen : réintroduction temporaire des contrôles aux frontières intérieures",
    editeur: "Commission européenne",
    url: "",
  },
] as const;
