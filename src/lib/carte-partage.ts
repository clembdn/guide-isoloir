/**
 * Carte partageable du résultat, dessinée dans le navigateur.
 *
 * CHARGÉE À LA DEMANDE. Ce module n'est importé qu'au clic sur « Créer mon
 * image » (`import()` dynamique dans Resultat.svelte) : il ne pèse rien sur le
 * chargement de /resultat, dont le budget JavaScript est déjà serré.
 *
 * RIEN NE SORT DU NAVIGATEUR. Le dessin se fait sur un `<canvas>`, l'image est
 * un `Blob` local, et c'est la personne qui décide de la partager ou de
 * l'enregistrer. Aucune requête n'est émise, aucune URL ne porte les réponses.
 *
 * CE QUE LA CARTE REPREND, ET POURQUOI :
 *
 *   - les acteurs de rang 1 à 3, ex æquo compris, jamais un vainqueur seul ;
 *   - chaque score AVEC sa couverture, comme à l'écran : un « 51 % » qui
 *     circule sans « documenté sur 14 des 24 » ment par omission ;
 *   - la qualification (« Résultat incertain »…) ;
 *   - la mention « Ce n'est pas une recommandation de vote » ;
 *   - l'état de la bascule d'héritage et la graine, qui permettent de refaire
 *     exactement le même écran.
 *
 * CE QU'ELLE NE REPREND PAS : les portraits. Ils sont sous licence libre avec
 * obligation de créditer l'auteur ; une image destinée à circuler sans sa page
 * de crédits ne respecterait pas cette licence. La carte est typographique.
 *
 * COULEURS EN DUR, et c'est la seule exception du dossier `lib` : une image
 * n'hérite d'aucune variable CSS, et la carte doit être identique quel que soit
 * le thème de l'appareil qui la produit. Ce sont les valeurs claires de
 * DESIGN_SYSTEM.md §2, comme pour `scripts/generer-marque.mjs`.
 */

export type LigneCarte = {
  rang: number;
  nom: string;
  parti: string | null;
  /** Pourcentage entier, ou `null` sous le plancher de couverture. */
  pourcentage: number | null;
  documentees: number;
  applicables: number;
  qualification: string;
};

export type DonneesCarte = {
  lignes: readonly LigneCarte[];
  heritage: boolean;
  graine: string;
  questionsApplicables: number;
  questionsPosees: number;
  /** Nom de domaine affiché en pied de carte. */
  domaine: string;
};

export type Cartes = { post: Blob; story: Blob };

const VIOLET = "#5321d6";
const BLANC = "#ffffff";
const BLANC_DOUX = "rgba(255, 255, 255, 0.78)";
const PISTE = "rgba(255, 255, 255, 0.22)";
const POLICE = '"Bricolage Grotesque", "Bricolage repli", Arial, sans-serif';

function police(taille: number, graisse: 400 | 700): string {
  return `${graisse} ${taille}px ${POLICE}`;
}

/** Découpe un texte en lignes qui tiennent dans `largeur`. */
function couper(ctx: CanvasRenderingContext2D, texte: string, largeur: number): string[] {
  const lignes: string[] = [];
  let courante = "";
  for (const mot of texte.split(" ")) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeur && courante) {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = essai;
    }
  }
  if (courante) lignes.push(courante);
  return lignes;
}

/** Écrit un paragraphe, renvoie l'ordonnée sous sa dernière ligne. */
function paragraphe(
  ctx: CanvasRenderingContext2D,
  texte: string,
  x: number,
  y: number,
  largeur: number,
  interligne: number,
): number {
  for (const ligne of couper(ctx, texte, largeur)) {
    ctx.fillText(ligne, x, y);
    y += interligne;
  }
  return y;
}

function rectangleArrondi(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  l: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, l, h, r);
  ctx.fill();
}

/**
 * Le logo, en blanc. Le fichier servi porte sa teinte violette en dur : on le
 * dessine, puis on le recolore en blanc par composition, sans le modifier.
 */
async function logoBlanc(hauteur: number): Promise<HTMLCanvasElement | null> {
  const image = new Image();
  image.src = "/medias/marque/guide-isoloir.svg";
  try {
    await image.decode();
  } catch {
    return null;
  }
  const largeur = Math.round((image.naturalWidth / image.naturalHeight) * hauteur);
  const toile = document.createElement("canvas");
  toile.width = largeur;
  toile.height = hauteur;
  const ctx = toile.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, largeur, hauteur);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = BLANC;
  ctx.fillRect(0, 0, largeur, hauteur);
  return toile;
}

function versBlob(toile: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resoudre, rejeter) =>
    toile.toBlob((blob) => (blob ? resoudre(blob) : rejeter(new Error("toBlob"))), "image/png"),
  );
}

async function dessiner(
  donnees: DonneesCarte,
  largeur: number,
  hauteur: number,
  logo: HTMLCanvasElement | null,
): Promise<Blob> {
  const toile = document.createElement("canvas");
  toile.width = largeur;
  toile.height = hauteur;
  const ctx = toile.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponible");

  const marge = 88;
  const utile = largeur - marge * 2;
  const story = hauteur > largeur * 1.5;

  ctx.fillStyle = VIOLET;
  ctx.fillRect(0, 0, largeur, hauteur);
  ctx.textBaseline = "alphabetic";

  // En-tête : le logo, en blanc.
  let y = story ? 200 : marge;
  if (logo) ctx.drawImage(logo, marge, y, logo.width, logo.height);
  y += (logo?.height ?? 0) + (story ? 150 : 96);

  // Titre.
  ctx.fillStyle = BLANC;
  ctx.font = police(story ? 76 : 64, 700);
  y = paragraphe(ctx, "Mes réponses sont les plus proches de", marge, y, utile, story ? 86 : 72);
  y += story ? 60 : 36;

  // Lignes du classement, rangs 1 à 3, ex æquo compris.
  const lignes = donnees.lignes.slice(0, 5);

  /*
   * HAUTEUR DES LIGNES CALCULÉE, PAS FIXÉE. Quatre ex æquo au rang 2 sont un
   * cas réel (une plateforme de coalition partagée) : avec un pas fixe, la ligne
   * de score d'un acteur touchait la pastille du suivant. Le pas se déduit de la
   * place laissée par le titre et le pied, et tout se resserre d'un même
   * facteur quand elle manque.
   */
  const basPied = hauteur - (story ? 340 : 262);
  const pasIdeal = story ? 250 : 212;
  const pasMinimal = 176;
  const place = basPied - y - 40;
  const pas = Math.min(pasIdeal, place / lignes.length);
  const k = Math.min(1, pas / pasMinimal);

  y += 30 * k;
  for (const ligne of lignes) {
    // Pastille de rang.
    const rayon = 28 * k;
    ctx.fillStyle = BLANC;
    ctx.beginPath();
    ctx.arc(marge + rayon, y - 16 * k, rayon, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = VIOLET;
    ctx.font = police(Math.round(32 * k), 700);
    ctx.textAlign = "center";
    ctx.fillText(String(ligne.rang), marge + rayon, y - 5 * k);
    ctx.textAlign = "left";

    const xNom = marge + rayon * 2 + 22;
    ctx.fillStyle = BLANC;
    ctx.font = police(Math.round((story ? 56 : 48) * k), 700);
    ctx.fillText(ligne.nom, xNom, y);

    if (ligne.parti) {
      ctx.fillStyle = BLANC_DOUX;
      ctx.font = police(Math.round(27 * k), 400);
      ctx.fillText(ligne.parti, xNom, y + 38 * k);
    }

    // Barre : une seule encre pour tous, seule la longueur varie.
    const yBarre = y + 62 * k;
    const epaisseur = 14 * k;
    ctx.fillStyle = PISTE;
    rectangleArrondi(ctx, marge, yBarre, utile, epaisseur, epaisseur / 2);
    if (ligne.pourcentage !== null) {
      ctx.fillStyle = BLANC;
      const longueur = Math.max(epaisseur, (utile * ligne.pourcentage) / 100);
      rectangleArrondi(ctx, marge, yBarre, longueur, epaisseur, epaisseur / 2);
    }

    ctx.fillStyle = BLANC;
    ctx.font = police(Math.round(27 * k), 400);
    const couverture = `documenté sur ${ligne.documentees} des ${ligne.applicables} affirmations`;
    const detail =
      ligne.pourcentage === null
        ? `${ligne.qualification} · ${couverture}`
        : `${ligne.pourcentage} % · ${couverture} · ${ligne.qualification}`;
    ctx.fillText(detail, marge, yBarre + epaisseur + 38 * k);

    y += pas;
  }

  // Pied : l'avertissement, les paramètres, l'adresse.
  let yPied = basPied + 40;
  ctx.fillStyle = BLANC;
  ctx.font = police(34, 700);
  yPied = paragraphe(ctx, "Ce n'est pas une recommandation de vote.", marge, yPied, utile, 44);

  ctx.fillStyle = BLANC_DOUX;
  ctx.font = police(24, 400);
  const parametres =
    `Positions héritées ${donnees.heritage ? "incluses" : "exclues"} · graine ${donnees.graine} · ` +
    `${donnees.questionsApplicables} affirmations sur ${donnees.questionsPosees}`;
  paragraphe(ctx, parametres, marge, yPied + 6, utile, 34);

  ctx.fillStyle = BLANC;
  ctx.font = police(40, 700);
  ctx.fillText(`${donnees.domaine} · Faites le test`, marge, hauteur - (story ? 180 : marge));

  return versBlob(toile);
}

/**
 * Dessine les deux formats : publication (1080 × 1350) et story (1080 × 1920).
 *
 * La police est attendue avant le dessin : un canvas n'attend rien, et une carte
 * dessinée pendant le chargement sortirait en police de secours.
 */
export async function dessinerCartes(donnees: DonneesCarte): Promise<Cartes> {
  await Promise.all([
    document.fonts.load(police(64, 700)),
    document.fonts.load(police(28, 400)),
  ]).catch(() => undefined);
  const logo = await logoBlanc(72);
  const [post, story] = await Promise.all([
    dessiner(donnees, 1080, 1350, logo),
    dessiner(donnees, 1080, 1920, logo),
  ]);
  return { post, story };
}
