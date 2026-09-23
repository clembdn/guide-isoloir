/**
 * Le résolveur et le moteur rendent la même position.
 *
 * Les fiches candidat affichent, affirmation par affirmation, la position
 * retenue pour chaque candidat. Le résultat du test la compare aux réponses de
 * l'électeur. Si les deux divergeaient, une fiche publique contredirait le
 * classement qu'elle est censée expliquer — et personne ne le verrait, parce
 * que les deux écrans ne sont jamais côte à côte.
 *
 * Le test est fait SUR LES DONNÉES RÉELLES, pas sur un jeu construit : c'est là
 * que se trouvent les reprises à deux niveaux (coalition puis parti) et les
 * positions multiples d'un même acteur sur une même affirmation.
 */
import { describe, expect, it } from "vitest";
import { calculer, creerResolveur, NIVEAUX_RESOLUTION } from "../../src/lib/moteur";
import { positionsPubliables } from "../../src/lib/acteurs";
import { ACTEURS, CANDIDATURES } from "../../src/data/acteurs";
import { POSITIONS } from "../../src/data/positions";
import { QUESTIONS } from "../../src/data/questions";
import type { Candidate, PoliticalActor, Stance } from "../../src/lib/modele";
import type { Question } from "../../src/lib/questions";

const acteurs: readonly PoliticalActor[] = ACTEURS;
const candidatures: readonly Candidate[] = CANDIDATURES;
const positions: readonly Stance[] = positionsPubliables(POSITIONS as readonly Stance[]);
const questions: readonly Question[] = QUESTIONS;

const candidats = acteurs.filter((acteur) => acteur.kind === "candidate");
const LIBELLE_PAR_CLE = new Map(NIVEAUX_RESOLUTION.map((niveau) => [niveau.cle, niveau.libelle]));

describe("creerResolveur", () => {
  it("rend, pour chaque candidat et chaque affirmation, le détail exposé par calculer", () => {
    // Toutes les affirmations reçoivent une réponse : aucune n'est écartée du détail.
    const reponses = Object.fromEntries(questions.map((question) => [question.id, 1 as const]));
    const classement = calculer({
      questions,
      acteurs: candidats,
      positions,
      reponses,
      candidatures,
      annuaire: acteurs,
    });
    const resoudre = creerResolveur({ positions, candidatures, annuaire: acteurs });

    let comparees = 0;
    for (const resultat of [...classement.classes, ...classement.nonClasses]) {
      for (const detail of resultat.parTheme.flatMap((theme) => theme.positions)) {
        const resolue = resoudre(resultat.actorId, detail.questionId);
        comparees += 1;

        if (resolue === null) {
          expect(detail.positionActeur, `${resultat.actorId} / ${detail.questionId}`).toBeNull();
          continue;
        }

        expect(
          {
            valeur: resolue.position.value,
            libelle: LIBELLE_PAR_CLE.get(resolue.position.provenance),
            citation: resolue.position.citation,
            sources: resolue.position.sourceIds,
            heriteDe: resolue.heriteDe,
            heriteDeId: resolue.heriteDeId,
          },
          `${resultat.actorId} / ${detail.questionId}`,
        ).toEqual({
          valeur: detail.positionActeur,
          libelle: detail.niveauLibelle,
          citation: detail.citation,
          sources: detail.sourceIds,
          heriteDe: detail.heriteDe,
          heriteDeId: detail.heriteDeId,
        });
      }
    }

    // Garde contre un test qui passerait sans rien comparer.
    expect(comparees).toBe(candidats.length * questions.length);
  });

  it("préfère la position personnelle à la ligne du parti", () => {
    const resoudre = creerResolveur({
      positions: [
        {
          id: "parti--q",
          actorId: "parti-x",
          questionId: "q",
          value: -2,
          provenance: "party-platform",
          confidence: "high",
          sourceIds: ["s"],
          citation: "Ligne du parti",
          adequation: "directe",
          rationale: "Plateforme du parti, citation directe.",
          reviewStatus: "reconciled",
          updatedAt: "2026-09-01",
        },
        {
          id: "candidat--q",
          actorId: "candidat-x",
          questionId: "q",
          value: 1,
          provenance: "press-report",
          confidence: "low",
          sourceIds: ["s"],
          citation: "Propos rapportés",
          adequation: "partielle",
          rationale: "Rapporté au style indirect par la presse.",
          reviewStatus: "reconciled",
          updatedAt: "2026-09-01",
        },
      ],
      candidatures: [
        {
          actorId: "candidat-x",
          status: "declared",
          baselineActorIds: ["parti-x"],
          statutDepuis: "2026-09-01",
          statutSourceIds: ["s"],
        },
      ],
      annuaire: [{ id: "parti-x", name: "Parti X" }],
    });

    const resolue = resoudre("candidat-x", "q");
    expect(resolue?.position.id).toBe("candidat--q");
    expect(resolue?.heriteDe).toBeNull();
    expect(resoudre("candidat-x", "autre")).toBeNull();
  });
});
