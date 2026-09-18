/**
 * Contrôles sur le QUESTIONNAIRE RÉEL.
 *
 * Ce fichier ne juge pas les affirmations : le choix des sujets, leur
 * formulation et le découpage des thèmes sont éditoriaux et se défendent par
 * écrit, pas par un test. Il vérifie que les données sont bien formées et que
 * rien ne pourra être servi sans source.
 *
 * Les invariants de forme du questionnaire — couverture des thèmes, équilibre
 * des `direction` — sont dans `tests/audit/invariants.audit.ts`, avec le reste
 * de ce qui est publié dans la méthodologie.
 */
import { describe, expect, it } from "vitest";
import {
  sourcesInfobullesIncompletes,
  validerQuestions,
  validerSourcesInfobulles,
} from "../../src/lib/questions";
import { DONNEES_FACTICES, QUESTIONS, SOURCES_INFOBULLES } from "../../src/data/questions";

describe("questionnaire réel", () => {
  it("est reconnu comme des données réelles", () => {
    expect(DONNEES_FACTICES).toBe(false);
  });

  it("passe le schéma, et ses identifiants sont uniques", () => {
    const questions = validerQuestions(QUESTIONS);
    expect(questions).toHaveLength(24);
  });

  /*
   * Les identifiants entrent dans les identifiants de position
   * (`${actorId}--${questionId}`) et dans le stockage de session. Un identifiant
   * à casse mixte ou à espace y survivrait mal, et il ne se renomme plus une
   * fois des positions saisies.
   */
  it("n'emploie que des identifiants en minuscules, chiffres et tirets", () => {
    for (const question of QUESTIONS) {
      expect(question.id, `identifiant non conforme : ${question.id}`).toMatch(/^[a-z0-9-]+$/);
    }
  });

  /*
   * `ordre` décide de l'affichage. Deux questions au même rang rendraient
   * l'ordre dépendant de celui du tableau, donc de l'ordre du JSON — ce que
   * l'audit interdit par ailleurs.
   */
  it("attribue un rang d'affichage strictement croissant", () => {
    const rangs = QUESTIONS.map((question) => question.ordre);
    expect(rangs).toStrictEqual([...rangs].sort((a, b) => a - b));
    expect(new Set(rangs).size).toBe(rangs.length);
  });

  it("répartit ses affirmations en six thèmes de quatre", () => {
    const parTheme = new Map<string, number>();
    for (const question of QUESTIONS) {
      parTheme.set(question.theme, (parTheme.get(question.theme) ?? 0) + 1);
    }
    expect(parTheme.size).toBe(6);
    expect([...parTheme.values()]).toStrictEqual([4, 4, 4, 4, 4, 4]);
  });
});

describe("sources des infobulles", () => {
  it("couvre chaque infobulle, sans source orpheline", () => {
    const declarees = new Set(SOURCES_INFOBULLES.map((source) => source.id));
    const utilisees = new Set(QUESTIONS.map((question) => question.infobulleSourceId));

    expect([...utilisees].filter((id) => !declarees.has(id))).toStrictEqual([]);
    expect([...declarees].filter((id) => !utilisees.has(id))).toStrictEqual([]);
  });

  /*
   * Le questionnaire n'est pas publiable tant qu'une URL manque, et ce test
   * l'énonce dans les deux sens : tant qu'il reste des cases vides, la
   * validation stricte doit refuser ; le jour où elles sont toutes remplies,
   * elle doit passer. Aucun nombre n'est écrit en dur — l'inventaire est lu dans
   * les données, pour que ce test n'ait pas à être modifié à chaque URL ajoutée.
   */
  it("refuse la publication tant qu'une URL manque, et l'accepte quand elles sont toutes là", () => {
    const incompletes = sourcesInfobullesIncompletes(SOURCES_INFOBULLES);

    if (incompletes.length === 0) {
      expect(validerSourcesInfobulles(SOURCES_INFOBULLES, QUESTIONS)).toHaveLength(
        SOURCES_INFOBULLES.length,
      );
      return;
    }

    expect(() => validerSourcesInfobulles(SOURCES_INFOBULLES, QUESTIONS)).toThrow(
      `${incompletes.length} source(s) d'infobulle sans URL consultable`,
    );
  });

  it("signale une infobulle qui pointe vers un identifiant inconnu", () => {
    const [premiere, ...reste] = QUESTIONS;
    expect(premiere).toBeDefined();
    const faussee = [{ ...premiere!, infobulleSourceId: "source-inexistante" }, ...reste];

    expect(() => validerSourcesInfobulles(SOURCES_INFOBULLES, faussee)).toThrow(
      /Infobulle sans source correspondante : source-inexistante/,
    );
  });
});
