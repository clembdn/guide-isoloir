/**
 * État du test dans le stockage de session.
 *
 * Ce module porte deux garanties du projet, et elles se vérifient ici plutôt
 * qu'en navigateur parce qu'elles tiennent à la forme des données :
 *
 *   - « sans avis » n'est pas le point milieu. Sa valeur stockée n'est même pas
 *     du même type, pour qu'aucun calcul ne puisse l'additionner par distraction ;
 *   - la clé est versionnée, et un état d'une autre version est effacé, pas
 *     réparé. Relire de travers des réponses politiques serait pire que les
 *     perdre.
 */
import { describe, expect, it } from "vitest";
import {
  CLE_SESSION,
  SANS_AVIS,
  VERSION_ETAT,
  ecrireEtat,
  effacerEtat,
  estComplet,
  etatVide,
  lireEtat,
} from "../../src/lib/session-test";

/** Stockage en mémoire, conforme à l'interface `Storage`. */
function stockageFactice(initial: Record<string, string> = {}): Storage {
  const donnees = new Map(Object.entries(initial));
  return {
    get length() {
      return donnees.size;
    },
    clear: () => donnees.clear(),
    getItem: (cle) => donnees.get(cle) ?? null,
    key: (index) => [...donnees.keys()][index] ?? null,
    removeItem: (cle) => void donnees.delete(cle),
    setItem: (cle, valeur) => void donnees.set(cle, valeur),
  };
}

/** Stockage qui refuse tout, comme en navigation privée verrouillée. */
function stockageIndisponible(): Storage {
  const refuser = () => {
    throw new Error("stockage refusé");
  };
  return {
    length: 0,
    clear: refuser,
    getItem: refuser,
    key: refuser,
    removeItem: refuser,
    setItem: refuser,
  };
}

describe("clé de session", () => {
  it("porte la version dans son nom", () => {
    expect(CLE_SESSION).toBe(`guide-isoloir.test.v${VERSION_ETAT}`);
  });
});

describe("lireEtat", () => {
  it("rend un état vide quand rien n'est stocké", () => {
    expect(lireEtat(stockageFactice())).toEqual(etatVide());
  });

  it("relit un état bien formé", () => {
    const stockage = stockageFactice();
    ecrireEtat({ version: VERSION_ETAT, reponses: { q1: 2, q2: SANS_AVIS } }, stockage);

    expect(lireEtat(stockage).reponses).toEqual({ q1: 2, q2: SANS_AVIS });
  });

  it("efface un état d'une autre version plutôt que de le réparer", () => {
    const stockage = stockageFactice({
      [CLE_SESSION]: JSON.stringify({ version: VERSION_ETAT + 1, reponses: { q1: 2 } }),
    });

    expect(lireEtat(stockage)).toEqual(etatVide());
  });

  it("ignore les valeurs hors échelle", () => {
    const stockage = stockageFactice({
      [CLE_SESSION]: JSON.stringify({
        version: VERSION_ETAT,
        reponses: { valide: 1, horsEchelle: 7, texte: "peut-être", nul: null },
      }),
    });

    expect(lireEtat(stockage).reponses).toEqual({ valide: 1 });
  });

  it("ne se laisse pas casser par du JSON invalide", () => {
    expect(lireEtat(stockageFactice({ [CLE_SESSION]: "{{{" }))).toEqual(etatVide());
  });

  it("fonctionne sans stockage du tout", () => {
    // Le quiz doit rester utilisable en navigation privée verrouillée : il perd
    // la reprise après rechargement, il ne casse pas.
    expect(() => lireEtat(stockageIndisponible())).not.toThrow();
    expect(lireEtat(stockageIndisponible())).toEqual(etatVide());
    expect(() => ecrireEtat(etatVide(), stockageIndisponible())).not.toThrow();
    expect(() => effacerEtat(stockageIndisponible())).not.toThrow();
    expect(lireEtat(null)).toEqual(etatVide());
  });
});

describe("« sans avis » n'est pas le point milieu", () => {
  it("se stocke comme une chaîne, jamais comme un nombre", () => {
    const stockage = stockageFactice();
    ecrireEtat({ version: VERSION_ETAT, reponses: { q1: SANS_AVIS } }, stockage);

    const relu = lireEtat(stockage).reponses["q1"];
    expect(typeof relu).toBe("string");
    expect(relu).not.toBe(0);
  });

  it("ne peut pas être additionné par distraction", () => {
    // Le point milieu vaut 0 et s'additionne. « Sans avis » produit NaN, donc un
    // calcul qui l'oublie échoue bruyamment au lieu de tirer vers le centre.
    expect(Number(0)).toBe(0);
    expect(Number(SANS_AVIS)).toBeNaN();
  });
});

describe("estComplet", () => {
  const ids = ["q1", "q2"];

  it("est faux tant qu'une question n'a pas de réponse", () => {
    expect(estComplet({ version: VERSION_ETAT, reponses: { q1: 1 } }, ids)).toBe(false);
  });

  it("est vrai quand toutes ont une réponse, « sans avis » compris", () => {
    // « Sans avis » EST une réponse : l'électeur a répondu qu'il n'avait pas
    // d'avis. Ne pas le compter obligerait à choisir une position pour avancer.
    expect(estComplet({ version: VERSION_ETAT, reponses: { q1: 1, q2: SANS_AVIS } }, ids)).toBe(
      true,
    );
  });

  it("est faux quand il n'y a aucune question", () => {
    expect(estComplet(etatVide(), [])).toBe(false);
  });
});

describe("effacerEtat", () => {
  it("retire la clé", () => {
    const stockage = stockageFactice();
    ecrireEtat({ version: VERSION_ETAT, reponses: { q1: 2 } }, stockage);
    effacerEtat(stockage);

    expect(stockage.getItem(CLE_SESSION)).toBeNull();
  });
});
