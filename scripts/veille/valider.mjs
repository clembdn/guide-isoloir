// @ts-check
/**
 * Validation d'un brouillon par l'éditeur : `draft` devient `reconciled`.
 *
 * Pour qui code en deux temps : écrire une position en `draft`, la relire en
 * prévisualisation (`npm run dev:previsualisation`), puis la publier ici, un
 * identifiant à la fois, après avoir vu en clair ce qui va l'être.
 *
 *     npm run veille:valider -- <id> [<id>…]
 *     npm run veille:valider -- <id> --remplace <ancien-id>
 *     npm run veille:valider -- <id> --verifie-a-la-main
 *
 * Ce que le script vérifie avant de basculer :
 *   - l'identifiant existe, et il est en `draft` ;
 *   - la citation figure dans le texte de l'une de ses sources, téléchargé par
 *     la veille (`--verifie-a-la-main` quand la source n'a pas pu l'être, et que
 *     vous l'avez lue vous-même) ;
 *   - avec `--remplace`, l'ancienne position porte sur le même couple
 *     candidat × affirmation.
 *
 * `updatedAt` n'est pas touché : c'est la date du codage, pas celle de la
 * relecture.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { basculerStatut, cleUrl, retirerObjet, trouverCitation } from "./outils.mjs";
import { chargerDonnees, RACINE } from "./veiller.mjs";

const FICHIER_POSITIONS = "src/data/positions.ts";
const FICHIER_PROGRAMMES = "src/data/programmes.ts";
const ETAT = path.join(RACINE, "data/veille/etat");

const args = process.argv.slice(2);
const remplace = (() => {
  const i = args.indexOf("--remplace");
  return i >= 0 ? (args[i + 1] ?? null) : null;
})();
const aLaMain = args.includes("--verifie-a-la-main");
const ids = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--remplace");

if (ids.length === 0) {
  console.error(
    "Usage : npm run veille:valider -- <id> [<id>…] [--remplace <ancien-id>] [--verifie-a-la-main]",
  );
  process.exit(2);
}
if (remplace !== null && ids.length !== 1) {
  console.error("--remplace ne s'emploie qu'avec un seul identifiant.");
  process.exit(2);
}

const donnees = await chargerDonnees();
const sourceParId = new Map(donnees.sources.map((s) => [s.id, s]));
const nomParActeur = new Map(donnees.acteurs.map((a) => [a.id, a.name]));
const { QUESTIONS } = await import(new URL("../../src/data/questions.ts", import.meta.url).href);
const texteParQuestion = new Map(/** @type {any[]} */ (QUESTIONS).map((q) => [q.id, q.texte]));

/** @type {Record<string, string>} */
const fichiers = {
  [FICHIER_POSITIONS]: await readFile(path.join(RACINE, FICHIER_POSITIONS), "utf8"),
  [FICHIER_PROGRAMMES]: await readFile(path.join(RACINE, FICHIER_PROGRAMMES), "utf8"),
};
const sourcesCitees = new Set();
const corrections = [];
let refus = 0;

for (const id of ids) {
  const position = donnees.positions.find((p) => p.id === id);
  const proposition = donnees.propositions.find((p) => p.id === id);
  const donnee = position ?? proposition;
  const fichier = position ? FICHIER_POSITIONS : FICHIER_PROGRAMMES;

  if (donnee === undefined) {
    console.error(`REFUS  ${id} : identifiant inconnu.`);
    refus += 1;
    continue;
  }
  if (donnee.reviewStatus !== "draft") {
    console.error(`REFUS  ${id} : en « ${donnee.reviewStatus} », pas en brouillon.`);
    refus += 1;
    continue;
  }

  const sources = donnee.sourceIds.map((/** @type {string} */ s) => sourceParId.get(s));
  if (!aLaMain) {
    const textes = [];
    for (const source of sources) {
      try {
        textes.push(await readFile(path.join(ETAT, "cache", `${cleUrl(source.url)}.txt`), "utf8"));
      } catch {
        /* source non téléchargée : on cherche dans les autres. */
      }
    }
    const resultat = textes.length > 0 ? trouverCitation(donnee.citation, textes.join("\n")) : null;
    if (resultat === null || !resultat.trouvee) {
      console.error(
        `REFUS  ${id} : ${resultat === null ? "aucune source dans le cache" : `citation introuvable (« ${resultat.manquant} »)`}. ` +
          "Lisez la source vous-même, puis relancez avec --verifie-a-la-main.",
      );
      refus += 1;
      continue;
    }
  }

  // Ce que vous publiez, en clair, avant de le publier.
  console.log(`\n${"─".repeat(72)}\n${id}`);
  console.log(`Acteur       : ${nomParActeur.get(donnee.actorId) ?? donnee.actorId}`);
  if (position) {
    console.log(
      `Affirmation  : ${texteParQuestion.get(position.questionId) ?? position.questionId}`,
    );
    console.log(
      `Valeur       : ${position.value > 0 ? "+" : ""}${position.value} · ${position.provenance} · confiance ${position.confidence} · adéquation ${position.adequation}`,
    );
  } else {
    console.log(
      `Proposition  : ${proposition.intitule} (${proposition.nature}, ${proposition.portee})`,
    );
  }
  console.log(`Citation     : « ${donnee.citation} »`);
  if (position) console.log(`Raisonnement : ${position.rationale}`);
  for (const source of sources) {
    sourcesCitees.add(source.id);
    console.log(
      `Source       : ${source.titre} — ${source.media}, ${source.dateDeclaration} (consultée le ${source.consulteLe})`,
    );
    console.log(`               ${source.url}`);
  }

  if (remplace !== null) {
    const ancienne = donnees.positions.find((p) => p.id === remplace);
    if (
      !position ||
      ancienne === undefined ||
      ancienne.actorId !== position.actorId ||
      ancienne.questionId !== position.questionId
    ) {
      console.error(
        `REFUS  ${id} : « ${remplace} » n'est pas une position sur le même couple candidat × affirmation.`,
      );
      refus += 1;
      continue;
    }
    fichiers[FICHIER_POSITIONS] = retirerObjet(
      /** @type {string} */ (fichiers[FICHIER_POSITIONS]),
      remplace,
    );
    console.log(
      `Remplace     : ${remplace} (valeur ${ancienne.value}, ${ancienne.provenance}), retirée.`,
    );
    if (ancienne.value !== position.value) {
      corrections.push({
        date: "<date de mise en ligne>",
        portee: `${nomParActeur.get(position.actorId)} — « ${texteParQuestion.get(position.questionId)} »`,
        description: `Position codée ${ancienne.value} d'après ${ancienne.provenance}, désormais ${position.value} d'après ${position.provenance} : ${sources.map((/** @type {any} */ s) => s.titre).join(" ; ")}.`,
        origine: "Relecture interne (veille quotidienne)",
      });
    }
  }

  fichiers[fichier] = basculerStatut(
    /** @type {string} */ (fichiers[fichier]),
    id,
    "draft",
    "reconciled",
  );
  console.log(`VALIDÉ ${id}`);
}

for (const [fichier, contenu] of Object.entries(fichiers)) {
  await writeFile(path.join(RACINE, fichier), contenu);
}

if (corrections.length > 0) {
  console.log("\nLa valeur publiée change : à inscrire dans src/data/corrections.ts.\n");
  for (const correction of corrections) console.log(JSON.stringify(correction, null, 2) + ",");
}

console.log(`\n${ids.length - refus} validé(s), ${refus} refusé(s).`);
if (sourcesCitees.size > 0) {
  console.log(
    `\nSources désormais publiées (vérifiez titre, média et dates) : ${[...sourcesCitees].join(", ")}`,
  );
}
console.log(
  "\nEnsuite :\n" +
    "  npm run build:prod && npm run couverture\n" +
    "  git add src/data/positions.ts src/data/programmes.ts src/data/sources-positions.ts data/cases-non-couvertes.md src/data/historique-couverture.json\n" +
    '  git commit -m "Positions relues : …"',
);
process.exit(refus > 0 ? 1 : 0);
