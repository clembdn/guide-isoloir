/**
 * Relevé de couverture : une ligne de plus dans `src/data/historique-couverture.json`.
 *
 * Lit `dist/donnees/couverture.json`, que le build calcule avec le moteur du
 * test sur les positions PUBLIÉES. Le script ne recalcule rien : Node ne sait
 * pas importer le moteur hors d'Astro, et une seconde implémentation finirait
 * par compter autrement que l'écran de résultat.
 *
 * TROIS CAS, et un seul écrit vraiment :
 *   - chiffres identiques au dernier relevé : rien n'est écrit. Valider un
 *     brouillon change les chiffres ; relancer le build n'en change aucun ;
 *   - même date de données, chiffres différents : le relevé du jour est remplacé ;
 *   - sinon : un relevé est ajouté.
 *
 * Le relevé est daté par `misAJour`, la date de la donnée la plus récente, et
 * non par le jour où le script tourne : la courbe dit quand les données ont
 * changé, pas quand on les a mesurées.
 *
 *     npm run build:prod && npm run couverture
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as prettier from "prettier";

const RACINE = path.resolve(import.meta.dirname, "..");
const MESURE = path.join(RACINE, "dist/donnees/couverture.json");
const HISTORIQUE = path.join(RACINE, "src/data/historique-couverture.json");

/** Champs d'un relevé, dans l'ordre du fichier. Miroir de `ReleveCouvertureSchema`. */
const CHAMPS = [
  "candidats",
  "couples",
  "positionsPubliees",
  "documentees",
  "personnelles",
  "solides",
  "classables",
  "horsIncertitudeForte",
];

let mesure;
try {
  mesure = JSON.parse(await readFile(MESURE, "utf8"));
} catch {
  console.error("dist/donnees/couverture.json est introuvable. Lancez `npm run build:prod`.");
  process.exit(1);
}

const releve = { date: mesure.misAJour };
for (const champ of CHAMPS) {
  if (!Number.isInteger(mesure[champ])) {
    console.error(`couverture.json : « ${champ} » manque ou n'est pas un entier.`);
    process.exit(1);
  }
  releve[champ] = mesure[champ];
}

const historique = JSON.parse(await readFile(HISTORIQUE, "utf8"));
const dernier = historique.at(-1);
const memesChiffres = dernier !== undefined && CHAMPS.every((c) => dernier[c] === releve[c]);

if (memesChiffres) {
  console.log(`Couverture inchangée depuis le relevé du ${dernier.date} : rien à écrire.`);
  process.exit(0);
}

if (dernier !== undefined && dernier.date > releve.date) {
  console.error(
    `Le dernier relevé (${dernier.date}) est postérieur aux données mesurées (${releve.date}). ` +
      "Le build lit-il un état plus ancien que l'historique ?",
  );
  process.exit(1);
}

if (dernier?.date === releve.date) historique[historique.length - 1] = releve;
else historique.push(releve);

const options = (await prettier.resolveConfig(HISTORIQUE)) ?? {};
await writeFile(
  HISTORIQUE,
  await prettier.format(JSON.stringify(historique), { ...options, filepath: HISTORIQUE }),
);

console.log(
  `Relevé du ${releve.date} : ${releve.documentees} couples documentés sur ${releve.couples}, ` +
    `dont ${releve.personnelles} par le candidat lui-même ; ${releve.classables} candidats classables.`,
);
