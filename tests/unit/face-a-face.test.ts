/**
 * Face-à-face sur les données réelles : la règle des paires est appliquée sans
 * exception ni oubli, et une ligne de comparaison ne peut pas contredire la
 * fiche d'un candidat.
 */
import { describe, expect, it } from "vitest";
import {
  candidatsComparables,
  canonique,
  cheminPaire,
  COMPARABLES_MIN,
  faceAFace,
  LIGNES_SAILLANTES,
  paires,
  partenairesDe,
  sansComparaison,
} from "../../src/lib/face-a-face";
import {
  DONNEES_COMPARAISON,
  estEnLice,
  fiches,
  NOMBRE_AFFIRMATIONS,
  THEMES,
} from "../../src/lib/fiches";
import { creerComparateur, RELATIONS_COMPAREES } from "../../src/lib/paire";

const toutes = fiches();
const rang = new Map(toutes.map((fiche, index) => [fiche.acteur.slug, index]));
const ficheParSlug = new Map(toutes.map((fiche) => [fiche.acteur.slug, fiche]));
const publiees = paires();

describe("les paires publiées", () => {
  it("existent : la règle produit au moins une page", () => {
    expect(publiees.length).toBeGreaterThan(0);
    expect(COMPARABLES_MIN).toBe(9);
  });

  it("sont toutes au-dessus du seuil, dans l'ordre canonique, sans doublon ni inverse", () => {
    const chemins = new Set<string>();
    for (const paire of publiees) {
      expect(paire.comparables).toBeGreaterThanOrEqual(COMPARABLES_MIN);
      expect(rang.get(paire.a.slug)!).toBeLessThan(rang.get(paire.b.slug)!);
      expect(paire.chemin).toBe(`/comparer/${paire.a.slug}/${paire.b.slug}`);
      expect(chemins.has(paire.chemin)).toBe(false);
      expect(chemins.has(`/comparer/${paire.b.slug}/${paire.a.slug}`)).toBe(false);
      chemins.add(paire.chemin);
    }
  });

  it("ne laissent de côté que des paires sous le seuil : rien n'est choisi", () => {
    const comparer = creerComparateur(DONNEES_COMPARAISON);
    const publieesParChemin = new Set(publiees.map((paire) => paire.chemin));
    for (let i = 0; i < toutes.length; i += 1) {
      for (let j = i + 1; j < toutes.length; j += 1) {
        const a = toutes[i]!;
        const b = toutes[j]!;
        const chemin = `/comparer/${a.acteur.slug}/${b.acteur.slug}`;
        const { comparables } = comparer(a.acteur, b.acteur);
        expect(publieesParChemin.has(chemin), chemin).toBe(comparables >= COMPARABLES_MIN);
      }
    }
  });

  it("ne sont indexées que si les deux sont en lice et ont chacun une position en propre", () => {
    for (const paire of publiees) {
      const ff = faceAFace(paire.a.slug, paire.b.slug);
      const attendu =
        estEnLice(ficheParSlug.get(paire.a.slug)!.candidature) &&
        estEnLice(ficheParSlug.get(paire.b.slug)!.candidature) &&
        ff.solidite.a.propres > 0 &&
        ff.solidite.b.propres > 0;
      expect(paire.indexable, paire.chemin).toBe(attendu);
      /* Une page hors index le dit en clair. */
      if (ff.solidite.a.propres === 0 || ff.solidite.b.propres === 0) {
        expect(ff.reserves.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("canonicalisation", () => {
  it("rend le même ordre quel que soit l'ordre donné", () => {
    const paire = publiees[0]!;
    expect(canonique(paire.b.slug, paire.a.slug)).toEqual([paire.a.slug, paire.b.slug]);
    expect(cheminPaire(paire.b.slug, paire.a.slug)).toBe(paire.chemin);
  });

  it("refuse un slug inconnu ou une paire d'un seul candidat", () => {
    const slug = publiees[0]!.a.slug;
    expect(canonique(slug, slug)).toBeNull();
    expect(canonique(slug, "personne-inconnue")).toBeNull();
  });
});

describe("le détail d'une paire", () => {
  for (const paire of publiees) {
    describe(paire.chemin, () => {
      const ff = faceAFace(paire.a.slug, paire.b.slug);
      const lignes = ff.parTheme.flatMap((theme) => theme.lignes);

      it("couvre les 24 affirmations, thème par thème, dans l'ordre du test", () => {
        expect(lignes).toHaveLength(NOMBRE_AFFIRMATIONS);
        expect(ff.parTheme.map((theme) => theme.theme.nom)).toEqual(THEMES.map((t) => t.nom));
        expect(Object.values(ff.compte).reduce((somme, n) => somme + n, 0)).toBe(
          NOMBRE_AFFIRMATIONS,
        );
        expect(ff.compte.identique + ff.compte.proche + ff.compte.eloignee).toBe(ff.comparables);
        expect(ff.daccord).toBe(ff.compte.identique + ff.compte.proche);
      });

      it("montre exactement les positions des fiches", () => {
        for (const quel of ["a", "b"] as const) {
          const fiche = ficheParSlug.get(paire[quel].slug)!;
          const valeurs = new Map(
            fiche.entrees.map((e) => [e.question.id, e.resolue?.position.value ?? null]),
          );
          for (const ligne of lignes) {
            expect(ligne[quel].valeur, `${quel} ${ligne.id}`).toBe(valeurs.get(ligne.id));
            expect(ligne[quel].ancre).toBe(`/candidats/${paire[quel].slug}#${ligne.id}`);
          }
        }
      });

      it("ne compte jamais le même document comme un accord", () => {
        for (const ligne of lignes) {
          if (ligne.relation === "meme-document") expect(ligne.ecart).toBeNull();
          if (RELATIONS_COMPAREES.has(ligne.relation)) expect(ligne.ecart).not.toBeNull();
        }
      });

      it("range les écarts et les rapprochements selon la règle publiée", () => {
        expect(ff.ecarts.length).toBeLessThanOrEqual(LIGNES_SAILLANTES);
        expect(ff.rejoignent.length).toBeLessThanOrEqual(LIGNES_SAILLANTES);
        expect(ff.ecarts.every((l) => l.ecart! >= 2)).toBe(true);
        expect(ff.rejoignent.every((l) => l.ecart! <= 1)).toBe(true);
        const ecarts = ff.ecarts.map((l) => l.ecart!);
        expect(ecarts).toEqual([...ecarts].sort((x, y) => y - x));
      });

      it("écrit une phrase « En bref » complète, avec les deux noms", () => {
        expect(ff.enBref).toContain(paire.a.nom);
        expect(ff.enBref).toContain(paire.b.nom);
        expect(ff.enBref).not.toMatch(/null|undefined|NaN/);
      });

      it("situe l'autre candidat parmi ses voisins, dans l'ordre alphabétique", () => {
        for (const quel of ["a", "b"] as const) {
          const { voisins } = ff.champ[quel];
          expect(voisins.filter((v) => v.estAutre)).toHaveLength(1);
          const rangs = voisins.map((v) => rang.get(v.visage.slug)!);
          expect(rangs).toEqual([...rangs].sort((x, y) => x - y));
        }
      });
    });
  }
});

describe("le sélecteur", () => {
  it("nomme chaque candidat en lice, comparable ou non", () => {
    const enLice = toutes.filter((fiche) => estEnLice(fiche.candidature)).map((f) => f.acteur.slug);
    const nommes = [
      ...candidatsComparables().map((c) => c.visage.slug),
      ...sansComparaison().map((c) => c.visage.slug),
    ];
    expect(nommes.sort()).toEqual([...enLice].sort());
  });

  it("ne propose que des paires publiées", () => {
    const chemins = new Set(publiees.map((paire) => paire.chemin));
    for (const { visage, partenaires } of candidatsComparables()) {
      expect(partenaires).toEqual(
        partenairesDe(visage.slug).filter((partenaire) => partenaire.autre.enLice),
      );
      for (const { paire } of partenaires) expect(chemins.has(paire.chemin)).toBe(true);
    }
  });
});
