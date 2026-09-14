/**
 * Aucune réponse de quiz ne quitte le navigateur.
 *
 * CE QUE CE TEST COUVRE, ET QUE `aucune-requete-tierce` NE COUVRE PAS.
 *
 * L'autre test vérifie qu'aucune requête ne part vers un domaine tiers. Celui-ci
 * vérifie qu'aucune réponse ne part NULLE PART — y compris vers notre propre
 * domaine. Les deux sont nécessaires :
 *
 *   - un analytics tiers exfiltre vers un tiers : c'est l'autre test ;
 *   - un `fetch("/api/mesure")`, un pixel servi par nous, un `?r=2,1,-2` ajouté
 *     à l'URL de résultat, un cookie qui repart à chaque requête : tout cela
 *     reste chez nous, et reste une collecte d'opinions politiques.
 *
 * La promesse publiée est « vos réponses ne sont jamais envoyées, enregistrées
 * ou associées à un identifiant ». Elle ne dit pas « pas à des tiers ».
 *
 * MÉTHODE : des sentinelles.
 *
 * Les identifiants des questions factices sont reconnaissables
 * (`factice-sentinelle-*`). On répond, on revient en arrière, on modifie une
 * réponse, on affiche le résultat, et on inspecte TOUT ce que le navigateur a
 * émis : URL, corps de requête, en-têtes, cookies, et l'URL finale elle-même.
 * Une sentinelle qui apparaît quelque part est une fuite.
 *
 * On n'inspecte jamais les CORPS DE RÉPONSE : le bundle JavaScript contient
 * légitimement les identifiants des questions, puisque c'est lui qui les
 * affiche. Ce n'est pas une fuite, c'est le programme.
 */
import { test, expect, type Page, type Request } from "@playwright/test";
import { QUESTIONS_FACTICES } from "../../src/factice/questions-factices";
import { CLE_SESSION } from "../../src/lib/session-test";

/*
 * TESTS EN SKIP : /test est retirée de `src/pages/` tant qu'elle tourne sur
 * src/factice/ (voir src/routes-desactivees/README.md). Ce fichier reste écrit
 * et à jour ; il se réactive de lui-même en retirant `.skip` une fois la route
 * remise en place avec de vraies questions.
 */

/** Lu dans les données plutôt que codé en dur. */
const TOTAL = QUESTIONS_FACTICES.length;

/** Fragments dont l'apparition dans une requête prouverait une fuite. */
const SENTINELLES = [
  ...QUESTIONS_FACTICES.map((question) => question.id),
  // Le préfixe seul : il attrape aussi une sérialisation partielle ou tronquée.
  "factice-sentinelle",
  CLE_SESSION,
] as const;

type Emission = { ou: string; contenu: string };

function fuites(emissions: Emission[]): string[] {
  const trouvees: string[] = [];
  for (const emission of emissions) {
    for (const sentinelle of SENTINELLES) {
      if (emission.contenu.includes(sentinelle)) {
        trouvees.push(`${sentinelle} dans ${emission.ou} : ${emission.contenu.slice(0, 200)}`);
      }
    }
  }
  return trouvees;
}

declare global {
  interface Window {
    __signalerViolation?: (message: string) => void;
  }
}

/**
 * Une TENTATIVE de sortie est déjà un défaut, même quand la CSP la bloque.
 *
 * `connect-src 'none'` empêche un `fetch` d'atteindre le réseau, et Chromium le
 * refuse si tôt qu'aucun objet de requête n'est créé : ni `page.on("request")`
 * ni `page.on("requestfailed")` ne voient quoi que ce soit. Mesuré sur ce
 * dépôt : un `fetch("/mesure", …)` injecté dans le composant ne produisait
 * aucune émission observable. Seul l'événement `securitypolicyviolation` le
 * signale.
 *
 * Sans ce relevé, la seule chose qui empêcherait la fuite serait la CSP, et le
 * test ne le dirait pas. Du code d'exfiltration doit être signalé le jour où il
 * est écrit, pas le jour où quelqu'un élargit `connect-src`.
 *
 * Les violations remontent côté Node plutôt que dans `window` : une navigation
 * remet `window` à zéro, et celles relevées sur /test seraient perdues en
 * arrivant sur /resultat.
 */
async function suivreTentativesDeSortie(page: Page): Promise<string[]> {
  const relevees: string[] = [];

  await page.exposeFunction("__signalerViolation", (message: string) => {
    relevees.push(message);
  });

  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (evenement) => {
      if (!/connect-src|form-action|img-src|default-src/.test(evenement.violatedDirective)) return;
      window.__signalerViolation?.(
        `${evenement.violatedDirective} a bloqué une sortie vers ${evenement.blockedURI}`,
      );
    });
  });

  return relevees;
}

/**
 * Enregistre tout ce que le navigateur émet.
 *
 * `page.on("request")` capte aussi les requêtes qu'une politique de sécurité
 * finirait par bloquer : le test ne doit pas dépendre de la CSP, sinon
 * l'affaiblir suffirait à le faire passer.
 */
function surveiller(page: Page): Emission[] {
  const emissions: Emission[] = [];

  page.on("request", (requete: Request) => {
    emissions.push({ ou: `l'URL d'une requête ${requete.method()}`, contenu: requete.url() });

    const corps = requete.postData();
    if (corps !== null) {
      emissions.push({ ou: `le corps d'une requête vers ${requete.url()}`, contenu: corps });
    }

    for (const [nom, valeur] of Object.entries(requete.headers())) {
      emissions.push({
        ou: `l'en-tête ${nom} d'une requête vers ${requete.url()}`,
        contenu: valeur,
      });
    }
  });

  // Une navigation est aussi une émission : l'URL part dans la barre d'adresse,
  // dans l'historique, et dans le `Referer` de la requête suivante.
  page.on("framenavigated", (frame) => {
    emissions.push({ ou: "une URL de navigation", contenu: frame.url() });
  });

  return emissions;
}

test.skip("aucune réponse ne sort du navigateur, même vers notre propre domaine", async ({
  page,
}) => {
  const emissions = surveiller(page);
  const tentatives = await suivreTentativesDeSortie(page);

  await page.goto("/test", { waitUntil: "networkidle" });
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });

  const reponses = page.locator('input[type="radio"]');
  const suivante = page.getByRole("button", { name: "Question suivante" });
  const precedente = page.getByRole("button", { name: "Question précédente" });

  /*
   * On répond à TOUTES les questions, en variant les positions pour que la
   * signature stockée soit reconnaissable. Le parcours est générique : coder le
   * nombre de questions en dur casserait ce test au premier ajout, sans qu'une
   * fuite soit pour autant apparue.
   */
  for (let index = 0; index < TOTAL; index += 1) {
    await expect(page.locator(".progression-texte")).toHaveText(
      `Question ${index + 1} sur ${TOTAL}`,
    );
    // 0 = « tout à fait d'accord », 4 = « pas du tout d'accord », 5 = « sans avis ».
    await reponses.nth(index === TOTAL - 1 ? 5 : index % 5).check();
    if (index < TOTAL - 1) await suivante.click();
  }

  // Retour arrière, puis modification d'une réponse déjà donnée.
  await precedente.click();
  await expect(page.locator(".progression-texte")).toHaveText(`Question ${TOTAL - 1} sur ${TOTAL}`);
  await reponses.nth(1).check();
  await suivante.click();

  // Affichage du résultat.
  await page.getByRole("link", { name: "Voir mes résultats" }).click();
  /*
   * Motif volontairement tolérant. Attendre `**\/resultat` exactement ferait
   * expirer l'attente si une régression ajoutait des paramètres — le test
   * échouerait, mais pour une expiration, pas pour la fuite. On veut atteindre
   * les assertions ci-dessous et nommer le vrai problème.
   */
  await page.waitForURL(/\/resultat/);

  /*
   * Le transfert doit avoir fonctionné, sinon le test serait creux : on
   * vérifierait l'absence de fuite d'une donnée qui n'a jamais existé.
   */
  const stocke = await page.evaluate((cle) => sessionStorage.getItem(cle), CLE_SESSION);
  expect(stocke, "Les réponses n'ont pas survécu à la navigation vers /resultat").not.toBeNull();

  const etat = JSON.parse(stocke ?? "{}") as { reponses: Record<string, unknown> };
  expect(Object.keys(etat.reponses)).toHaveLength(TOTAL);
  expect(etat.reponses[QUESTIONS_FACTICES[0]!.id]).toBe(2);
  // La dernière question a reçu « sans avis », qui n'est pas un nombre.
  expect(etat.reponses[QUESTIONS_FACTICES[TOTAL - 1]!.id]).toBe("sans-avis");
  // La modification a remplacé la réponse de l'avant-dernière, pas ajouté une seconde.
  expect(etat.reponses[QUESTIONS_FACTICES[TOTAL - 2]!.id]).toBe(1);

  // L'URL de résultat ne porte ni paramètre ni fragment.
  const url = new URL(page.url());
  expect(url.search, `L'URL de résultat porte des paramètres : ${url.search}`).toBe("");
  expect(url.hash, `L'URL de résultat porte un fragment : ${url.hash}`).toBe("");

  // Un cookie repartirait à chaque requête, donc vers nos propres journaux.
  expect(
    await page.context().cookies(),
    "Un cookie a été posé : il repartirait à chaque requête.",
  ).toEqual([]);

  const trouvees = fuites(emissions);
  expect(trouvees, `Réponse(s) de quiz sorties du navigateur :\n${trouvees.join("\n")}`).toEqual(
    [],
  );

  expect(
    tentatives,
    `Tentative(s) de sortie bloquées par la CSP. Le site n'a pas fui, mais du code\n` +
      `essaie d'émettre depuis une route qui porte des opinions politiques :\n${tentatives.join("\n")}`,
  ).toEqual([]);
});

test.skip("le bouton « Effacer mes réponses » vide réellement le stockage", async ({ page }) => {
  await page.goto("/test", { waitUntil: "networkidle" });
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });

  await page.locator('input[type="radio"]').nth(0).check();
  expect(await page.evaluate((cle) => sessionStorage.getItem(cle), CLE_SESSION)).not.toBeNull();

  await page.getByRole("button", { name: "Effacer mes réponses" }).click();

  expect(
    await page.evaluate((cle) => sessionStorage.getItem(cle), CLE_SESSION),
    "La clé de session subsiste après effacement",
  ).toBeNull();
  await expect(page.locator(".progression-texte")).toHaveText(`Question 1 sur ${TOTAL}`);
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
});

test.skip("un test déjà terminé repart de zéro", async ({ page }) => {
  // « État vidé au démarrage d'un nouveau test » : revenir sur /test après avoir
  // vu ses résultats, c'est vouloir recommencer, pas relire la dernière question.
  await page.goto("/test", { waitUntil: "networkidle" });
  await page.evaluate(
    ([cle, ids]) =>
      sessionStorage.setItem(
        cle,
        JSON.stringify({ version: 1, reponses: Object.fromEntries(ids.map((id) => [id, 2])) }),
      ),
    [CLE_SESSION, QUESTIONS_FACTICES.map((q) => q.id)] as const,
  );

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0, { timeout: 5000 });

  await expect(page.locator(".progression-texte")).toHaveText(`Question 1 sur ${TOTAL}`);
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  expect(await page.evaluate((cle) => sessionStorage.getItem(cle), CLE_SESSION)).toBeNull();
});
