/**
 * État du test, dans le navigateur et nulle part ailleurs.
 *
 * CONTRAINTE ABSOLUE (CLAUDE.md) : les réponses ne quittent jamais le
 * navigateur. Elles transitent entre `/test` et `/resultat` par `sessionStorage`
 * avec une clé versionnée. Jamais l'URL, jamais `localStorage`, jamais le réseau.
 *
 * Pourquoi `sessionStorage` et pas `localStorage` : `sessionStorage` meurt avec
 * l'onglet. Une opinion politique laissée sur un ordinateur partagé, une
 * médiathèque ou un poste familial est une donnée sensible au sens du RGPD. La
 * durée de vie courte n'est pas une limitation, c'est la fonctionnalité.
 *
 * Pourquoi une clé versionnée : le jour où la forme des réponses change, un état
 * ancien ne doit pas être relu de travers. Une version inconnue est effacée, pas
 * réparée.
 */
import type { StanceValue } from "./modele";

/** Incrémenter dès que la forme de `EtatTest` change. */
export const VERSION_ETAT = 1;

export const CLE_SESSION = `guide-isoloir.test.v${VERSION_ETAT}`;

/**
 * « Sans avis » n'est PAS une position sur l'échelle.
 *
 * Confondre l'absence d'avis avec le point milieu tirerait mécaniquement le
 * résultat vers le centre, ce que CLAUDE.md interdit explicitement : la position,
 * la qualité des preuves et l'incertitude sont des grandeurs distinctes. On la
 * stocke donc comme une valeur d'un autre type, impossible à additionner par
 * distraction.
 */
export const SANS_AVIS = "sans-avis";

export type Reponse = StanceValue | typeof SANS_AVIS;

export type EtatTest = {
  version: number;
  /** Identifiant de question vers réponse. Une question sans entrée est non répondue. */
  reponses: Record<string, Reponse>;
};

const VALEURS_VALIDES = new Set<unknown>([-2, -1, 0, 1, 2, SANS_AVIS]);

function estReponse(valeur: unknown): valeur is Reponse {
  return VALEURS_VALIDES.has(valeur);
}

export function etatVide(): EtatTest {
  return { version: VERSION_ETAT, reponses: {} };
}

/**
 * Relit l'état stocké, ou rend un état vide.
 *
 * Ne lève jamais. `sessionStorage` peut être indisponible (navigation privée
 * verrouillée, stockage désactivé, quota) et le quiz doit rester utilisable : il
 * fonctionnera alors en mémoire, sans survivre à un rechargement. C'est
 * dégradé, ce n'est pas cassé.
 */
export function lireEtat(stockage: Storage | null = stockageDeSession()): EtatTest {
  if (stockage === null) return etatVide();

  let brut: string | null;
  try {
    brut = stockage.getItem(CLE_SESSION);
  } catch {
    return etatVide();
  }
  if (brut === null) return etatVide();

  try {
    const analyse: unknown = JSON.parse(brut);
    if (typeof analyse !== "object" || analyse === null) return etatVide();

    const { version, reponses } = analyse as Partial<EtatTest>;
    if (version !== VERSION_ETAT) return etatVide();
    if (typeof reponses !== "object" || reponses === null) return etatVide();

    // On ne recopie que ce qui est reconnu. Une clé inattendue est ignorée, pas
    // conservée : rien d'inconnu ne doit survivre à un rechargement.
    const propres: Record<string, Reponse> = {};
    for (const [id, valeur] of Object.entries(reponses)) {
      if (estReponse(valeur)) propres[id] = valeur;
    }
    return { version: VERSION_ETAT, reponses: propres };
  } catch {
    return etatVide();
  }
}

export function ecrireEtat(etat: EtatTest, stockage: Storage | null = stockageDeSession()): void {
  if (stockage === null) return;
  try {
    stockage.setItem(CLE_SESSION, JSON.stringify(etat));
  } catch {
    // Quota atteint ou stockage refusé : le quiz continue en mémoire.
  }
}

export function effacerEtat(stockage: Storage | null = stockageDeSession()): void {
  if (stockage === null) return;
  try {
    stockage.removeItem(CLE_SESSION);
  } catch {
    // Rien à faire : il n'y a alors rien à effacer.
  }
}

/** Toutes les questions ont-elles reçu une réponse ? */
export function estComplet(etat: EtatTest, idsQuestions: readonly string[]): boolean {
  return idsQuestions.length > 0 && idsQuestions.every((id) => id in etat.reponses);
}

/**
 * Accès au stockage, ou `null` s'il est indisponible.
 *
 * Le simple fait de lire `window.sessionStorage` lève dans certaines
 * configurations de confidentialité. La sonde doit donc être protégée elle-même.
 */
export function stockageDeSession(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}
