/**
 * FICHIER GÉNÉRÉ PAR `node scripts/recuperer-medias.mjs`. NE PAS MODIFIER À LA MAIN.
 *
 * Portraits de candidats et logos de partis, tous téléchargés depuis Wikimedia
 * Commons et auto-hébergés sous `public/medias/`. Aucune requête ne part vers
 * Commons au runtime : `img-src 'self'` l'interdit, et le test « aucune requête
 * tierce » le vérifie.
 *
 * CHAQUE ENTRÉE PORTE SA LICENCE, et `/credits-images` les publie toutes. Ce
 * n'est pas une politesse : CC BY et CC BY-SA imposent de citer l'auteur et de
 * nommer la licence, et une image libre dont on tait l'auteur est une image
 * utilisée sans droit.
 *
 * Absents de ce fichier, faute de média sous licence libre au 2026-09-20 :
 * Antoine Mikolajczak, et les logos de France Libre, Génération écologie,
 * Les Patriotes et Place publique. L'interface affiche alors des initiales.
 * Ne pas compléter depuis un site de parti : un logo pris là n'est pas libre.
 */

export type Media = {
  actorId: string;
  genre: "portrait" | "logo";
  /** Chemin servi, sous `public/`. */
  chemin: string;
  fichierCommons: string;
  pageCommons: string;
  auteur: string;
  licence: string;
  /** Vide quand Commons ne publie pas d'URL pour cette licence (domaine public). */
  licenceUrl: string;
  /** Réserve relevée sur la page Commons du fichier, s'il y en a une. */
  reserve?: string;
};

/** Date du relevé des licences. Un relevé vieillit : le republier le dit. */
export const MEDIAS_RELEVES_LE = "2026-09-20";

export const MEDIAS: readonly Media[] = [
  {
    actorId: "nathalie-arthaud",
    genre: "portrait",
    chemin: "/medias/portraits/nathalie-arthaud.jpg",
    fichierCommons: "Nathalie Arthaud (LO) 19-05-2024.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Nathalie_Arthaud_(LO)_19-05-2024.jpg",
    auteur: "Kokluts",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    actorId: "francois-asselineau",
    genre: "portrait",
    chemin: "/medias/portraits/francois-asselineau.jpg",
    fichierCommons: "François ASSELINEAU.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Fran%C3%A7ois_ASSELINEAU.jpg",
    auteur: "Union Populaire Républicaine",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    actorId: "gabriel-attal",
    genre: "portrait",
    chemin: "/medias/portraits/gabriel-attal.jpg",
    fichierCommons: "Gabriel Attal 2025 (close crop).jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Gabriel_Attal_2025_(close_crop).jpg",
    auteur: "Ismail Aissoub",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    actorId: "delphine-batho",
    genre: "portrait",
    chemin: "/medias/portraits/delphine-batho.png",
    fichierCommons: "Delphine Batho (cropped-2).png",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Delphine_Batho_(cropped-2).png",
    auteur: "DeuxSevres79",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    actorId: "xavier-bertrand",
    genre: "portrait",
    chemin: "/medias/portraits/xavier-bertrand.jpg",
    fichierCommons: "Xavier Bertrand - 2025 (cropped).jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Xavier_Bertrand_-_2025_(cropped).jpg",
    auteur: "Claudio Centonze / European Union, 2025 / EC - Audiovisual Service",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    actorId: "karim-bouamrane",
    genre: "portrait",
    chemin: "/medias/portraits/karim-bouamrane.jpg",
    fichierCommons: "Karim Bouamrane en 2026 (cropped).jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Karim_Bouamrane_en_2026_(cropped).jpg",
    auteur: "Oumma",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    actorId: "nicolas-dupont-aignan",
    genre: "portrait",
    chemin: "/medias/portraits/nicolas-dupont-aignan.jpg",
    fichierCommons: "Nicolas Dupont-Aignan, homme politique français.jpg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:Nicolas_Dupont-Aignan,_homme_politique_fran%C3%A7ais.jpg",
    auteur: "Debout la France",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    actorId: "clara-egger",
    genre: "portrait",
    chemin: "/medias/portraits/clara-egger.jpg",
    fichierCommons: "Clara Egger.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Clara_Egger.jpg",
    auteur: "Thomas Binet",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    actorId: "raphael-glucksmann",
    genre: "portrait",
    chemin: "/medias/portraits/raphael-glucksmann.jpg",
    fichierCommons: "1720448398743_20240708_GLUCKSMANN_Raphael_FR_006.jpg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:1720448398743_20240708_GLUCKSMANN_Raphael_FR_006.jpg",
    auteur: "European Union 2024 - Source : EP",
    licence: "European Parliament",
    licenceUrl: "https://www.europarl.europa.eu/legal-notice/",
  },
  {
    actorId: "francis-lalanne",
    genre: "portrait",
    chemin: "/medias/portraits/francis-lalanne.jpg",
    fichierCommons: "Lalanne 2021 (cropped).jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Lalanne_2021_(cropped).jpg",
    auteur: "Thomas Bresson",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    actorId: "marine-le-pen",
    genre: "portrait",
    chemin: "/medias/portraits/marine-le-pen.jpg",
    fichierCommons: "Marine Le Pen 2025 (cropped).jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Marine_Le_Pen_2025_(cropped).jpg",
    auteur: "Vox España",
    licence: "CC0",
    licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    actorId: "david-lisnard",
    genre: "portrait",
    chemin: "/medias/portraits/david-lisnard.jpg",
    fichierCommons: "David Lisnard - 2013.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:David_Lisnard_-_2013.jpg",
    auteur: "Frantogian",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  {
    actorId: "jean-luc-melenchon",
    genre: "portrait",
    chemin: "/medias/portraits/jean-luc-melenchon.jpg",
    fichierCommons: "Mélenchon 2027 - 55261894422 (cropped).jpg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:M%C3%A9lenchon_2027_-_55261894422_(cropped).jpg",
    auteur: "jlm2017.fr",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    actorId: "edouard-philippe",
    genre: "portrait",
    chemin: "/medias/portraits/edouard-philippe.jpg",
    fichierCommons: "Edouard Philippe 3x4 crop.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Edouard_Philippe_3x4_crop.jpg",
    auteur: "Wasasaq8",
    licence: "CC0",
    licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    actorId: "florian-philippot",
    genre: "portrait",
    chemin: "/medias/portraits/florian-philippot.jpg",
    fichierCommons: "2022-04-16 16-49-26 MAM-Paris 02.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:2022-04-16_16-49-26_MAM-Paris_02.jpg",
    auteur: "Thomas Bresson",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    actorId: "bruno-retailleau",
    genre: "portrait",
    chemin: "/medias/portraits/bruno-retailleau.jpg",
    fichierCommons: "Bruno Retailleau - Ministre de l'Intérieur français (cropped).jpg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:Bruno_Retailleau_-_Ministre_de_l%27Int%C3%A9rieur_fran%C3%A7ais_(cropped).jpg",
    auteur: "Anthonymontardyfr",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    actorId: "fabien-roussel",
    genre: "portrait",
    chemin: "/medias/portraits/fabien-roussel.jpg",
    fichierCommons: "Roussel Fabien 1.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Roussel_Fabien_1.jpg",
    auteur: "Zouhair NAKARA",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    actorId: "marine-tondelier",
    genre: "portrait",
    chemin: "/medias/portraits/marine-tondelier.jpg",
    fichierCommons: "20210819_tondelier.m-cr3.jpg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:20210819_tondelier.m-cr3.jpg",
    auteur: "Greenbox",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    actorId: "eric-zemmour",
    genre: "portrait",
    chemin: "/medias/portraits/eric-zemmour.jpg",
    fichierCommons: "Portrait d'Éric Zemmour, avril 2022.jpg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:Portrait_d%27%C3%89ric_Zemmour,_avril_2022.jpg",
    auteur: "Anh De France",
    licence: "CC0",
    licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    actorId: "parti-debout-la-france",
    genre: "logo",
    chemin: "/medias/logos/parti-debout-la-france.png",
    fichierCommons: "Debout la France logo (2022).png",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Debout_la_France_logo_(2022).png",
    auteur: "Site Officiel Debout la France",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    reserve:
      "Commons range ce fichier dans « Items with disputed copyright information » : la licence CC BY-SA 4.0 déclarée par le déposant y est contestée. À remplacer si la contestation aboutit.",
  },
  {
    actorId: "parti-horizons",
    genre: "logo",
    chemin: "/medias/logos/parti-horizons.png",
    fichierCommons: "Logo Parti Politique Horizons - 2021.svg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Logo_Parti_Politique_Horizons_-_2021.svg",
    auteur: "Horizons",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-la-france-insoumise",
    genre: "logo",
    chemin: "/medias/logos/parti-la-france-insoumise.png",
    fichierCommons: "LOGO-LFI-2026.png",
    pageCommons: "https://commons.wikimedia.org/wiki/File:LOGO-LFI-2026.png",
    auteur: "Unknown author Unknown author",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-les-ecologistes",
    genre: "logo",
    chemin: "/medias/logos/parti-les-ecologistes.png",
    fichierCommons: "Logo Les Écologistes (France).png",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Logo_Les_%C3%89cologistes_(France).png",
    auteur: "AliFatehi",
    licence: "Public domain",
    licenceUrl: "",
    reserve:
      "Fichier auto-publié par un contributeur, sans déclaration de licence structurée sur Commons. Le bandeau retenu est « PD-textlogo » : logo composé de texte, sous le seuil d'originalité.",
  },
  {
    actorId: "parti-les-republicains",
    genre: "logo",
    chemin: "/medias/logos/parti-les-republicains.png",
    fichierCommons: "Les Républicains - logo (France, 2023).svg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:Les_R%C3%A9publicains_-_logo_(France,_2023).svg",
    auteur: "Les Républicains",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-lutte-ouvriere",
    genre: "logo",
    chemin: "/medias/logos/parti-lutte-ouvriere.png",
    fichierCommons: "Logo Lutte Ouvrière.svg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Logo_Lutte_Ouvri%C3%A8re.svg",
    auteur: "Probably Édouard Taubé (Mody)",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-nous-france",
    genre: "logo",
    chemin: "/medias/logos/parti-nous-france.png",
    fichierCommons: "Logo parti Nous France.png",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Logo_parti_Nous_France.png",
    auteur: "Unknown author Unknown author",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-nouvelle-energie",
    genre: "logo",
    chemin: "/medias/logos/parti-nouvelle-energie.png",
    fichierCommons: "Logo-blanc-bleu.png",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Logo-blanc-bleu.png",
    auteur: "Nouvelle Énergie",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-parti-communiste-francais",
    genre: "logo",
    chemin: "/medias/logos/parti-parti-communiste-francais.png",
    fichierCommons: "Logo – Parti communiste français (2018).svg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:Logo_%E2%80%93_Parti_communiste_fran%C3%A7ais_(2018).svg",
    auteur: "Parti communiste français",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-parti-socialiste",
    genre: "logo",
    chemin: "/medias/logos/parti-parti-socialiste.png",
    fichierCommons: "Le Parti socialiste wordmark.svg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Le_Parti_socialiste_wordmark.svg",
    auteur: "Le Parti socialiste",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-rassemblement-national",
    genre: "logo",
    chemin: "/medias/logos/parti-rassemblement-national.png",
    fichierCommons: "Logo Rassemblement National.svg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Logo_Rassemblement_National.svg",
    auteur: "Rassemblement national",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-reconquete",
    genre: "logo",
    chemin: "/medias/logos/parti-reconquete.png",
    fichierCommons: "Logo du parti Reconquête.svg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Logo_du_parti_Reconqu%C3%AAte.svg",
    auteur: "Reconquête",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-renaissance",
    genre: "logo",
    chemin: "/medias/logos/parti-renaissance.png",
    fichierCommons: "Renaissance-logotype-officiel.svg",
    pageCommons: "https://commons.wikimedia.org/wiki/File:Renaissance-logotype-officiel.svg",
    auteur: "Original: Stéphane Séjourné Vector: Valo139",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    actorId: "parti-solution-democratique",
    genre: "logo",
    chemin: "/medias/logos/parti-solution-democratique.png",
    fichierCommons: "Logo du parti politique français Solution Démocratique.png",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:Logo_du_parti_politique_fran%C3%A7ais_Solution_D%C3%A9mocratique.png",
    auteur: "NDrbs",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    actorId: "parti-union-populaire-republicaine",
    genre: "logo",
    chemin: "/medias/logos/parti-union-populaire-republicaine.png",
    fichierCommons: "Logo Union Populaire Républicaine.svg",
    pageCommons:
      "https://commons.wikimedia.org/wiki/File:Logo_Union_Populaire_R%C3%A9publicaine.svg",
    auteur: "Union populaire républicaine",
    licence: "Public domain",
    licenceUrl: "",
  },
  {
    actorId: "parti-equinoxe",
    genre: "logo",
    chemin: "/medias/logos/parti-equinoxe.png",
    fichierCommons: "Équinoxe Logo.png",
    pageCommons: "https://commons.wikimedia.org/wiki/File:%C3%89quinoxe_Logo.png",
    auteur: "NS24FR",
    licence: "CC0",
    licenceUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
];

const PAR_ACTEUR = new Map(MEDIAS.map((media) => [`${media.genre}:${media.actorId}`, media]));

/** Média d'un acteur, ou `undefined` : l'appelant doit prévoir le cas. */
export function media(genre: Media["genre"], actorId: string): Media | undefined {
  return PAR_ACTEUR.get(`${genre}:${actorId}`);
}
