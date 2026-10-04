// @ts-check
/**
 * Redirections de `dist/_redirects`, au format Cloudflare.
 *
 * LA PAIRE INVERSÉE D'UN FACE-À-FACE. `/comparer/a/b` n'existe que dans l'ordre
 * canonique (alphabétique par `sortName`, voir `src/lib/face-a-face.ts`). Un
 * lien écrit dans l'autre ordre doit mener à la même page, en 301 : une page
 * équivalente existe, c'est la règle de `CLAUDE.md`.
 *
 * LA LISTE EST LUE DANS LE SITE CONSTRUIT, pas recalculée. Les pages présentes
 * dans `dist/comparer/` SONT les paires publiées ; en dériver les redirections
 * garantit qu'il n'existe ni règle vers une page absente, ni page sans sa règle,
 * et le script n'a pas à relire les données ni à refaire le calcul.
 *
 * Une paire non publiée n'a pas de règle, et son inverse non plus : les deux
 * tombent sur la page 404, puisque l'adresse n'a jamais existé.
 *
 * Fonctions pures : l'intégration d'`astro.config.mjs` les appelle au build,
 * `scripts/serveur-statique.mjs` relit le fichier pour les tests de bout en
 * bout, et `tests/unit/redirections.test.ts` les éprouve.
 */

/** Statut par défaut d'une règle sans statut, comme chez Cloudflare. */
const STATUT_PAR_DEFAUT = 302;

/**
 * Règles de la paire inversée, une par page de `comparer/a/b.html`.
 *
 * @param {readonly string[]} chemins chemins relatifs à `dist/`, séparés par `/`
 * @returns {string[]} lignes `_redirects`, triées
 */
export function lignesPaires(chemins) {
  /** @type {Set<string>} */
  const paires = new Set();
  for (const chemin of chemins) {
    const morceaux = /^comparer\/([a-z0-9-]+)\/([a-z0-9-]+)\.html$/.exec(chemin);
    if (morceaux === null) continue;
    paires.add(`${morceaux[1]}/${morceaux[2]}`);
  }

  const lignes = [];
  for (const paire of paires) {
    const [a, b] = paire.split("/");
    if (paires.has(`${b}/${a}`)) {
      throw new Error(
        `redirections : /comparer/${a}/${b} et /comparer/${b}/${a} existent tous deux. ` +
          "Une paire n'a qu'un ordre canonique.",
      );
    }
    lignes.push(`/comparer/${b}/${a} /comparer/${a}/${b} 301`);
  }
  // Tri : l'ordre de parcours du disque ne doit pas faire bouger le fichier.
  return lignes.sort();
}

/**
 * Règles exactes d'un fichier `_redirects` : source, cible, statut.
 *
 * Seules les sources littérales sont lues. Le site n'emploie ni `*` ni
 * `:paramètre`, et le serveur de test n'a pas à les simuler.
 *
 * @param {string} texte
 * @returns {Map<string, { cible: string, statut: number }>}
 */
export function lireRedirections(texte) {
  /** @type {Map<string, { cible: string, statut: number }>} */
  const regles = new Map();
  for (const ligneBrute of texte.split("\n")) {
    const ligne = ligneBrute.trim();
    if (ligne === "" || ligne.startsWith("#")) continue;
    const [source, cible, statut] = ligne.split(/\s+/);
    if (source === undefined || cible === undefined) continue;
    regles.set(source, {
      cible,
      statut: statut === undefined ? STATUT_PAR_DEFAUT : Number(statut),
    });
  }
  return regles;
}
