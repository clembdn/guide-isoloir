/**
 * Veille quotidienne : ce qui décide, testé sans réseau.
 *
 * La veille tourne seule, chaque jour, et ce qu'elle signale devient du travail
 * de codage. Un faux changement fait lire un document pour rien ; un vrai
 * changement manqué laisse une position périmée en ligne. Les règles qui
 * tranchent sont donc testées une par une, et le relevé lui-même tourne ici sur
 * des pages factices.
 */
import { describe, expect, it } from "vitest";
import {
  autorise,
  basculerStatut,
  classerChangement,
  compilerMotsCles,
  correspondances,
  differencePhrases,
  etatCalendrier,
  extraireLiens,
  htmlVersTexte,
  jourParis,
  lireListe,
  lireRobots,
  retirerObjet,
  trouverCitation,
  validerCibles,
} from "../../scripts/veille/outils.mjs";
import { rapportDuJour, releve } from "../../scripts/veille/veiller.mjs";

describe("texte d'une page", () => {
  it("garde le contenu principal, sans menu, pied de page ni script", () => {
    const html = `<html><body><nav>Accueil Programme</nav><header>Bandeau</header>
      <main><h1>Notre programme</h1><p>Retraite à 60 ans pour tous&nbsp;!</p>
      <script>suivre()</script></main><footer>Mentions</footer></body></html>`;
    expect(htmlVersTexte(html)).toBe("Notre programme\nRetraite à 60 ans pour tous !");
  });

  it("retombe sur le corps quand il n'y a ni main ni article", () => {
    expect(htmlVersTexte("<body><p>Texte d&#39;essai &amp; suite</p></body>")).toBe(
      "Texte d'essai & suite",
    );
  });

  it("applique les motifs à retirer propres à une cible", () => {
    expect(
      htmlVersTexte("<main><p>Lu 1 234 fois. Le texte.</p></main>", ["Lu [\\d ]+ fois\\."]),
    ).toBe("Le texte.");
  });
});

describe("changements", () => {
  const avant =
    "Nous voulons la retraite à 62 ans pour tous.\nUn paragraphe qui ne bouge pas du tout.";

  it("ne voit rien dans un paragraphe déplacé", () => {
    const apres =
      "Un paragraphe qui ne bouge pas du tout.\nNous voulons la retraite à 62 ans pour tous.";
    expect(classerChangement(differencePhrases(avant, apres))).toBe("aucun");
  });

  it("classe en mineur un changement de chiffres seulement", () => {
    const apres = avant.replace("62", "64");
    expect(classerChangement(differencePhrases(avant, apres))).toBe("mineur");
  });

  it("classe en substantiel une phrase nouvelle", () => {
    const apres = `${avant}\nNous abrogerons la réforme de 2023 dès le premier jour du mandat.`;
    const difference = differencePhrases(avant, apres);
    expect(difference.ajoutees).toStrictEqual([
      "Nous abrogerons la réforme de 2023 dès le premier jour du mandat.",
    ]);
    expect(classerChangement(difference)).toBe("substantiel");
  });
});

describe("sitemaps et flux", () => {
  it("lit un sitemap", () => {
    const xml = `<urlset><url><loc>https://a.fr/p/</loc><lastmod>2026-10-01</lastmod></url>
      <url><loc>https://a.fr/q/</loc></url></urlset>`;
    expect(lireListe(xml)).toStrictEqual({
      type: "urlset",
      entrees: [
        { url: "https://a.fr/p/", date: "2026-10-01", titre: null },
        { url: "https://a.fr/q/", date: null, titre: null },
      ],
    });
  });

  it("lit un index de sitemaps", () => {
    const xml = `<sitemapindex><sitemap><loc>https://a.fr/pages.xml</loc></sitemap></sitemapindex>`;
    expect(lireListe(xml).type).toBe("index");
  });

  it("lit un flux RSS, CDATA et entités compris", () => {
    const xml = `<rss><channel><item><title><![CDATA[Primaire : résultats]]></title>
      <link>https://a.fr/x?a=1&amp;b=2</link><pubDate>Fri, 02 Oct 2026 08:00:00 +0200</pubDate></item></channel></rss>`;
    expect(lireListe(xml)).toStrictEqual({
      type: "flux",
      entrees: [
        {
          url: "https://a.fr/x?a=1&b=2",
          date: "2026-10-02T06:00:00.000Z",
          titre: "Primaire : résultats",
        },
      ],
    });
  });

  it("lit un flux Atom", () => {
    const xml = `<feed><entry><title>T</title><link href="https://a.fr/e"/><updated>2026-10-03T10:00:00Z</updated></entry></feed>`;
    expect(lireListe(xml).entrees).toStrictEqual([
      { url: "https://a.fr/e", date: "2026-10-03T10:00:00.000Z", titre: "T" },
    ]);
  });

  it("rend les liens absolus, sans fragment ni doublon", () => {
    const html = `<a href="/doc.pdf#p2">a</a><a href="/doc.pdf">b</a><a href="mailto:x@y.fr">c</a><a href="chapitre1">d</a>`;
    expect(extraireLiens(html, "https://a.fr/livre/")).toStrictEqual([
      "https://a.fr/doc.pdf",
      "https://a.fr/livre/chapitre1",
    ]);
  });
});

describe("robots.txt", () => {
  const texte = `User-agent: *
Disallow: /prive/
Allow: /prive/public$

User-agent: GuideIsoloirVeille
Disallow: /admin/*
Allow: /admin/programme`;

  it("suit le groupe qui nomme l'agent plutôt que *", () => {
    const regles = lireRobots(texte, "GuideIsoloirVeille");
    expect(autorise(regles, "/prive/page")).toBe(true);
    expect(autorise(regles, "/admin/x")).toBe(false);
  });

  it("donne la priorité à la règle la plus longue", () => {
    const regles = lireRobots(texte, "GuideIsoloirVeille");
    expect(autorise(regles, "/admin/programme")).toBe(true);
  });

  it("applique * aux agents non nommés, ancre $ comprise", () => {
    const regles = lireRobots(texte, "AutreAgent");
    expect(autorise(regles, "/prive/page")).toBe(false);
    expect(autorise(regles, "/prive/public")).toBe(true);
    expect(autorise(regles, "/prive/publicite")).toBe(false);
  });

  it("autorise tout sans règle", () => {
    expect(autorise([], "/n-importe-quoi")).toBe(true);
  });
});

describe("dates et gel électoral", () => {
  it("date à Paris, pas à Melbourne", () => {
    expect(jourParis(new Date("2026-10-04T21:30:00Z"))).toBe("2026-10-04");
    expect(jourParis(new Date("2026-10-04T22:30:00Z"))).toBe("2026-10-05");
  });

  it("arrête de coder quarante-huit heures avant le gel du premier tour", () => {
    expect(etatCalendrier(new Date("2027-04-14T17:59:00+02:00")).etat).toBe("normal");
    expect(etatCalendrier(new Date("2027-04-14T18:00:00+02:00"))).toStrictEqual({
      etat: "avant-gel",
      codage: false,
      releve: true,
    });
  });

  it("gèle du vendredi 18 h au dimanche 20 h", () => {
    expect(etatCalendrier(new Date("2027-04-16T18:00:00+02:00")).etat).toBe("gel");
    expect(etatCalendrier(new Date("2027-04-18T19:59:00+02:00")).etat).toBe("gel");
    expect(etatCalendrier(new Date("2027-04-18T20:00:00+02:00")).etat).toBe("normal");
  });

  it("gèle avant le second tour, puis s'arrête", () => {
    expect(etatCalendrier(new Date("2027-04-28T18:00:00+02:00")).etat).toBe("avant-gel");
    expect(etatCalendrier(new Date("2027-05-01T12:00:00+02:00")).etat).toBe("gel");
    expect(etatCalendrier(new Date("2027-05-02T20:00:00+02:00"))).toStrictEqual({
      etat: "terminee",
      codage: false,
      releve: false,
    });
  });
});

describe("citations", () => {
  it("retrouve une citation malgré ligatures, coupures et typographie", () => {
    const pdf =
      "Nous voulons instaurer la retraite à 60 ans, ﬁnancée par une contri-\nbution sur les super\u00a0profits. L’État s’y engage.";
    expect(
      trouverCitation(
        "instaurer la retraite à 60 ans, financée par une contribution sur les super profits",
        pdf,
      ).trouvee,
    ).toBe(true);
    expect(trouverCitation("L'État s'y engage", pdf).trouvee).toBe(true);
  });

  it("exige chaque segment d'une coupe […], dans l'ordre", () => {
    const texte = "Premier point important. Deuxième point. Troisième point décisif.";
    expect(trouverCitation("Premier point […] Troisième point décisif", texte).trouvee).toBe(true);
    expect(trouverCitation("Troisième point […] Premier point", texte).trouvee).toBe(false);
  });

  it("dit quel segment manque", () => {
    expect(trouverCitation("Une phrase inventée de toutes pièces", "Autre chose.")).toStrictEqual({
      trouvee: false,
      manquant: "une phrase inventée de toutes pièces",
    });
  });
});

describe("édition des fichiers de données", () => {
  const fichier = `export const POSITIONS = [
  {
    id: "a--q1",
    value: 1,
    reviewStatus: "draft",
    updatedAt: "2026-10-04",
  },
  {
    id: "b--q1",
    value: -1,
    reviewStatus: "reconciled",
    updatedAt: "2026-09-20",
  },
] as const;
`;

  it("bascule le statut d'un seul objet", () => {
    const apres = basculerStatut(fichier, "a--q1", "draft", "reconciled");
    expect(apres).toBe(fichier.replace('"draft"', '"reconciled"'));
  });

  it("refuse de basculer un objet qui n'est pas dans le statut attendu", () => {
    expect(() => basculerStatut(fichier, "b--q1", "draft", "reconciled")).toThrow(/n'est pas en/);
  });

  it("refuse un identifiant inconnu", () => {
    expect(() => basculerStatut(fichier, "c--q1", "draft", "reconciled")).toThrow(/Aucun objet/);
  });

  it("retire un objet entier, accolades comprises", () => {
    const apres = retirerObjet(fichier, "b--q1");
    expect(apres).not.toContain("b--q1");
    expect(apres).toContain('id: "a--q1"');
    expect(apres.match(/^ {2}\{$/gm)).toHaveLength(1);
  });
});

describe("cibles", () => {
  const acteurs = new Set(["candidat-a"]);
  const cible = {
    id: "cible-a",
    acteurs: ["candidat-a"],
    type: "sitemap",
    url: "https://a.fr/sitemap.xml",
    note: "Note d'essai suffisante.",
  };

  it("accepte une cible bien décrite", () => {
    expect(validerCibles({ cibles: [cible] }, acteurs)).toHaveLength(1);
  });

  it("refuse un acteur inconnu, un type inconnu, un doublon", () => {
    expect(() => validerCibles({ cibles: [{ ...cible, acteurs: ["x"] }] }, acteurs)).toThrow(
      /acteur inconnu/,
    );
    expect(() => validerCibles({ cibles: [{ ...cible, type: "autre" }] }, acteurs)).toThrow(
      /type inconnu/,
    );
    expect(() => validerCibles({ cibles: [cible, cible] }, acteurs)).toThrow(/en double/);
  });

  it("valide la liste réelle", async () => {
    const { readFile } = await import("node:fs/promises");
    const { ACTEURS } = await import("../../src/data/acteurs");
    const brut = JSON.parse(await readFile("data/veille/cibles.json", "utf8"));
    expect(validerCibles(brut, new Set(ACTEURS.map((a) => a.id))).length).toBeGreaterThan(10);
  });
});

/*
 * Le relevé, de bout en bout, sur un faux web : une table d'URL et de réponses,
 * modifiée entre deux passages.
 */
describe("relevé", () => {
  type Page = { statut?: number; typeContenu?: string; corps: string };

  function fauxWeb(pages: Record<string, Page | "ENOTFOUND">) {
    const demandees: string[] = [];
    const recuperer = async (url: string) => {
      demandees.push(url);
      const page = pages[url];
      if (page === "ENOTFOUND") throw Object.assign(new Error("dns"), { code: "ENOTFOUND" });
      if (page === undefined) {
        return {
          statut: 404,
          typeContenu: "text/html",
          octets: new Uint8Array(),
          urlFinale: url,
          derniereModif: null,
        };
      }
      return {
        statut: page.statut ?? 200,
        typeContenu: page.typeContenu ?? "text/html",
        octets: new TextEncoder().encode(page.corps),
        urlFinale: url,
        derniereModif: null,
      };
    };
    return { recuperer, demandees };
  }

  function memoire() {
    const textes = new Map<string, string>();
    return {
      lire: async (cle: string) => textes.get(cle) ?? null,
      ecrire: async (cle: string, texte: string) => {
        textes.set(cle, texte);
      },
    };
  }

  const commun = {
    pdfVersTexte: async (octets: Uint8Array) => new TextDecoder().decode(octets),
    attendre: async () => {},
  };

  const page = (texte: string) => `<main><p>${texte}</p></main>`;
  const cible = (type: string, url: string, extra = {}) => ({
    id: `cible-${type}`,
    acteurs: ["candidat-a"],
    type,
    url,
    note: "Cible d'essai.",
    ...extra,
  });

  it("enregistre en silence au premier passage, signale une page modifiée au suivant", async () => {
    const pages = {
      "https://a.fr/programme": { corps: page("Nous voulons la retraite à 62 ans pour tous.") },
    };
    const web = fauxWeb(pages);
    const cache = memoire();
    const cibles = [cible("page", "https://a.fr/programme")] as never[];

    const premier = await releve({
      ...commun,
      cibles,
      etat: { urls: {} },
      recuperer: web.recuperer,
      cache,
      maintenant: new Date("2026-10-04T08:00:00Z"),
    });
    expect(premier.elements).toHaveLength(0);

    pages["https://a.fr/programme"].corps = page(
      "Nous voulons la retraite à 62 ans pour tous. Nous abrogerons la réforme de 2023 dès le premier jour.",
    );
    const second = await releve({
      ...commun,
      cibles,
      etat: premier.etat,
      recuperer: web.recuperer,
      cache,
      maintenant: new Date("2026-10-05T08:00:00Z"),
    });
    expect(second.elements).toHaveLength(1);
    expect(second.elements[0]).toMatchObject({
      nature: "page-modifiee",
      jour: "2026-10-05",
      extraits: ["Nous abrogerons la réforme de 2023 dès le premier jour."],
    });
  });

  it("signale une page nouvelle et une page redatée dans un sitemap filtré", async () => {
    const sitemap = (entrees: string) => ({
      typeContenu: "application/xml",
      corps: `<urlset>${entrees}</urlset>`,
    });
    const pages = {
      "https://a.fr/sitemap.xml": sitemap(
        `<url><loc>https://a.fr/programme/retraites</loc><lastmod>2026-09-01</lastmod></url>
         <url><loc>https://a.fr/contact</loc><lastmod>2026-09-01</lastmod></url>`,
      ),
    };
    const web = fauxWeb(pages);
    const cibles = [
      cible("sitemap", "https://a.fr/sitemap.xml", { motifUrl: "/programme/" }),
    ] as never[];
    const premier = await releve({
      ...commun,
      cibles,
      etat: { urls: {} },
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-04T08:00:00Z"),
    });
    expect(premier.elements).toHaveLength(0);

    pages["https://a.fr/sitemap.xml"] = sitemap(
      `<url><loc>https://a.fr/programme/retraites</loc><lastmod>2026-10-04</lastmod></url>
       <url><loc>https://a.fr/programme/europe</loc><lastmod>2026-10-04</lastmod></url>
       <url><loc>https://a.fr/contact</loc><lastmod>2026-10-04</lastmod></url>`,
    );
    const second = await releve({
      ...commun,
      cibles,
      etat: premier.etat,
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-05T08:00:00Z"),
    });
    expect(second.elements.map((e) => [e.nature, e.url])).toStrictEqual([
      ["page-modifiee", "https://a.fr/programme/retraites"],
      ["nouvelle-page", "https://a.fr/programme/europe"],
    ]);
  });

  it("à l'amorçage, signale seulement ce qui est daté d'après --depuis", async () => {
    const web = fauxWeb({
      "https://a.fr/feed": {
        typeContenu: "application/rss+xml",
        corps: `<rss><channel>
          <item><title>Ancien</title><link>https://a.fr/1</link><pubDate>2026-09-20T10:00:00Z</pubDate></item>
          <item><title>Récent</title><link>https://a.fr/2</link><pubDate>2026-09-28T10:00:00Z</pubDate></item>
        </channel></rss>`,
      },
    });
    const { elements } = await releve({
      ...commun,
      cibles: [cible("flux", "https://a.fr/feed")] as never[],
      etat: { urls: {} },
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-04T08:00:00Z"),
      amorcer: true,
      depuis: "2026-09-25",
    });
    expect(elements.map((e) => e.titre)).toStrictEqual(["Récent"]);
  });

  it("filtre un flux sur le titre", async () => {
    const flux = (titres: string[]) => ({
      typeContenu: "application/rss+xml",
      corps: `<rss><channel>${titres.map((t, i) => `<item><title>${t}</title><link>https://a.fr/${t}-${i}</link></item>`).join("")}</channel></rss>`,
    });
    const pages = { "https://a.fr/feed": flux(["Budget"]) };
    const web = fauxWeb(pages);
    const cibles = [
      cible("flux", "https://a.fr/feed", { motifTitre: "présidentielle" }),
    ] as never[];
    const premier = await releve({
      ...commun,
      cibles,
      etat: { urls: {} },
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-04T08:00:00Z"),
    });
    pages["https://a.fr/feed"] = flux(["Budget", "Météo", "Présidentielle : le débat"]);
    const second = await releve({
      ...commun,
      cibles,
      etat: premier.etat,
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-05T08:00:00Z"),
    });
    expect(second.elements.map((e) => e.titre)).toStrictEqual(["Présidentielle : le débat"]);
  });

  it("signale un nouveau PDF sur une page de documents", async () => {
    const pages = {
      "https://a.fr/docs": { corps: `<a href="/2024.pdf">2024</a><a href="/contact">c</a>` },
    };
    const web = fauxWeb(pages);
    const cibles = [
      cible("liste-documents", "https://a.fr/docs", { motifLiens: "\\.pdf$" }),
    ] as never[];
    const premier = await releve({
      ...commun,
      cibles,
      etat: { urls: {} },
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-04T08:00:00Z"),
    });
    pages["https://a.fr/docs"] = {
      corps: `<a href="/2027.pdf">2027</a><a href="/2024.pdf">2024</a>`,
    };
    const second = await releve({
      ...commun,
      cibles,
      etat: premier.etat,
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-05T08:00:00Z"),
    });
    expect(second.elements.map((e) => [e.nature, e.url])).toStrictEqual([
      ["nouveau-document", "https://a.fr/2027.pdf"],
    ]);
  });

  it("ne déclare un lien mort qu'au second 404, et jamais sur un 503", async () => {
    const pages: Record<string, Page> = {
      "https://a.fr/source": { corps: page("Une source citée par une position.") },
    };
    const web = fauxWeb(pages);
    const cibles = [cible("source", "https://a.fr/source")] as never[];
    let etat = (
      await releve({
        ...commun,
        cibles,
        etat: { urls: {} },
        recuperer: web.recuperer,
        cache: memoire(),
        maintenant: new Date("2026-10-04T08:00:00Z"),
      })
    ).etat;

    pages["https://a.fr/source"] = { statut: 503, corps: "" };
    const indisponible = await releve({
      ...commun,
      cibles,
      etat,
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-05T08:00:00Z"),
    });
    expect(indisponible.elements).toHaveLength(0);
    expect(indisponible.etat.urls["https://a.fr/source"]?.echecs).toBe(0);

    delete pages["https://a.fr/source"];
    const premier404 = await releve({
      ...commun,
      cibles,
      etat: indisponible.etat,
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-06T08:00:00Z"),
    });
    expect(premier404.elements).toHaveLength(0);
    etat = premier404.etat;

    const second404 = await releve({
      ...commun,
      cibles,
      etat,
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-07T08:00:00Z"),
    });
    expect(second404.elements.map((e) => e.nature)).toStrictEqual(["lien-mort"]);
    expect(second404.etat.urls["https://a.fr/source"]?.statut).toBe("mort");
  });

  it("ne relève pas ce que robots.txt interdit", async () => {
    const web = fauxWeb({
      "https://a.fr/robots.txt": {
        typeContenu: "text/plain",
        corps: "User-agent: *\nDisallow: /prive/",
      },
      "https://a.fr/prive/programme": { corps: page("Ne doit pas être lu.") },
    });
    const { bilan } = await releve({
      ...commun,
      cibles: [cible("page", "https://a.fr/prive/programme")] as never[],
      etat: { urls: {} },
      recuperer: web.recuperer,
      cache: memoire(),
      maintenant: new Date("2026-10-04T08:00:00Z"),
    });
    expect(bilan[0]?.statut).toBe("interdit");
    expect(web.demandees).toStrictEqual(["https://a.fr/robots.txt"]);
  });
});

describe("mots-clés", () => {
  const regles = compilerMotsCles(
    {
      affirmations: {
        "retraites-age-legal-60": [["retraite"], ["60 ans", "âge légal"]],
        "institutions-referendum-initiative-citoyenne": [["RIC"]],
      },
    },
    ["retraites-age-legal-60", "institutions-referendum-initiative-citoyenne"],
  );

  it("exige un terme de chaque groupe, dans la même phrase", () => {
    const texte =
      "Nous rétablirons la retraite à 60 ans pour toutes et tous. La retraite est un droit acquis par le travail.";
    expect(correspondances(texte, regles)).toStrictEqual([
      {
        questionId: "retraites-age-legal-60",
        phrases: ["Nous rétablirons la retraite à 60 ans pour toutes et tous."],
      },
    ]);
  });

  it("ignore casse et accents, et trouve les débuts de mots", () => {
    expect(
      correspondances("Les RETRAITES : l'AGE LEGAL ne bougera pas d'un jour.", regles),
    ).toHaveLength(1);
  });

  it("ne prend un terme court que comme mot entier : RIC n'est pas riche", () => {
    expect(
      correspondances("Il faut taxer les plus riches de ce pays enfin.", regles),
    ).toStrictEqual([]);
    expect(
      correspondances("Nous instaurerons le RIC dès la première année.", regles)[0]?.questionId,
    ).toBe("institutions-referendum-initiative-citoyenne");
  });

  it("refuse une affirmation sans mots-clés, ou inconnue", () => {
    expect(() => compilerMotsCles({ affirmations: {} }, ["q1"])).toThrow(/aucun mot-clé/);
    expect(() => compilerMotsCles({ affirmations: { q1: [["a"]], q2: [["b"]] } }, ["q1"])).toThrow(
      /inconnue/,
    );
  });

  it("couvre exactement les 24 affirmations réelles", async () => {
    const { readFile } = await import("node:fs/promises");
    const { QUESTIONS } = await import("../../src/data/questions");
    const brut = JSON.parse(await readFile("data/veille/mots-cles.json", "utf8"));
    expect(
      compilerMotsCles(
        brut,
        QUESTIONS.map((q) => q.id),
      ).size,
    ).toBe(QUESTIONS.length);
  });

  it("met en tête du rapport les documents qui touchent une affirmation", () => {
    const element = {
      id: "x",
      jour: "2026-10-05",
      cible: "c",
      acteurs: ["candidat-a"],
      nature: "nouvelle-page" as const,
      url: "https://a.fr/programme",
      titre: "Programme",
      date: null,
      extraits: [],
      analyse: true,
      correspondances: [{ questionId: "q1", phrases: ["La retraite à 60 ans."] }],
    };
    const rapport = rapportDuJour({
      jour: "2026-10-05",
      lus: [element, { ...element, id: "y", url: "https://a.fr/agenda", correspondances: [] }],
      liensMorts: [],
      restants: 0,
      nomParActeur: new Map([["candidat-a", "Candidat A"]]),
      texteParQuestion: new Map([["q1", "L'âge légal devrait être abaissé à 60 ans."]]),
    });
    expect(rapport.indexOf("https://a.fr/programme")).toBeLessThan(
      rapport.indexOf("https://a.fr/agenda"),
    );
    expect(rapport).toContain("> La retraite à 60 ans.");
    expect(rapport).toContain("Rien n'est codé automatiquement");
  });
});
