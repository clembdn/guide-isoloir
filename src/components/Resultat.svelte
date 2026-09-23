<!--
  Écran de résultat.

  LE CHIFFRE ET SA COUVERTURE. L'interdiction générale du pourcentage a été
  levée, et remplacée par une contrainte de structure : il n'existe aucun moyen
  d'afficher un score sans sa couverture, parce qu'il n'existe qu'un seul
  composant qui sache rendre un score, et qu'il rend toujours les deux. Voir
  `ScoreEtCouverture.svelte`, qui porte le raisonnement complet.

  Pourquoi la levée. L'interdiction supprimait le chiffre, pas le malentendu :
  « Proximité forte » se lit tout aussi bien comme un verdict, et coûtait en
  plus au lecteur la seule information qui lui permettait de jauger la solidité
  du classement. Un chiffre nu ment ; un chiffre accompagné de « documenté sur
  7 des 24 affirmations » se désamorce tout seul.

  CE QUI RESTE INTERDIT ICI, et pourquoi :

    - AUCUNE COULEUR DE DIFFÉRENCIATION. Toutes les barres sont dans la même
      encre, à opacité constante. Seules la longueur et le rang varient. Une
      intensité qui varie ferait passer une proximité pour une adhésion.
    - AUCUN VAINQUEUR UNIQUE. On affiche les acteurs de rang 1 à 3, jamais « le
      vôtre ». Les ex æquo partagent leur rang.
    - AUCUN `style=""`. La géométrie des barres passe par l'attribut `width` de
      `<rect>`, qui est un attribut de présentation SVG, pas du CSS en ligne :
      la CSP hachée le bloquerait.
    - AUCUNE POSITION REPRISE PRÉSENTÉE COMME UNE DÉCLARATION. Une position
      héritée porte toujours le nom de l'acteur d'origine et la mention que le
      candidat ne s'est pas exprimé.

  Le cadre d'interprétation est en tête et au corps du texte, pas en note de bas
  de page. Un avertissement qu'il faut chercher n'avertit personne.
-->
<script lang="ts">
  import {
    calculer,
    type Classement,
    type DetailPosition,
    type ResultatActeur,
  } from "../lib/moteur";
  import { lireEtat, effacerEtat, type Reponse } from "../lib/session-test";
  import type { Candidate, PoliticalActor, Stance } from "../lib/modele";
  import type { QuestionAffichee } from "../lib/projection";
  import type { SourcePosition } from "../lib/acteurs";
  import {
    PLANCHER_POURCENTAGE,
    SEUIL_ACCORD,
    SEUIL_PUBLICATION,
    dateAnterieureALaCampagne,
  } from "../lib/seuils";
  import { SITE_URL } from "../lib/site";
  import { formatDateFr } from "../lib/date";
  import { LIBELLES_ADEQUATION, LIBELLES_CONFIANCE } from "../lib/libelles";
  import { initiales } from "../lib/initiales";
  import ScoreEtCouverture from "./ScoreEtCouverture.svelte";

  /*
   * Tout arrive en propriété, projeté côté serveur. Le composant n'importe aucun
   * module de données : `direction` ne doit se trouver ni dans le HTML ni dans
   * ce bundle.
   */
  /** Visuels d'un candidat, tous facultatifs. */
  type Visuel = {
    actorId: string;
    portrait: string | null;
    logo: string | null;
    /** Nom du parti, affiché à côté du logo — et à sa place quand il manque. */
    parti: string | null;
  };

  type Proprietes = {
    questions: readonly QuestionAffichee[];
    acteurs: readonly PoliticalActor[];
    positions: readonly Stance[];
    /**
     * Annuaire complet, pour nommer l'acteur d'origine d'une position reprise.
     * Les partis n'étant pas classés, ils ne figurent pas dans `acteurs`.
     */
    annuaire?: readonly PoliticalActor[];
    /**
     * Candidatures, pour la reprise de la ligne du parti à défaut de position
     * personnelle. Facultatif : sans elles, chaque acteur n'est comparé que sur
     * ce qu'il documente lui-même.
     */
    candidatures?: readonly Candidate[];
    /** Sources des positions, pour afficher le lien et la date sous un verbatim. */
    sources?: readonly SourcePosition[];
    /**
     * Portraits et logos, résolus côté serveur.
     *
     * Passés en propriété et pas importés : `src/data/medias.ts` porte les
     * licences de trente-cinq fichiers, et rien de tout cela n'a à partir dans
     * le bundle d'une route dont le budget est de 20 ko. Le composant ne reçoit
     * que des chemins.
     *
     * Chaque champ peut manquer : un candidat sans photo libre, un parti sans
     * logo libre. L'interface affiche alors des initiales, elle ne va pas
     * chercher l'image ailleurs.
     */
    visuels?: readonly Visuel[];
    /** Avertissement affiché au-dessus du classement, ou chaîne vide. */
    avertissement: string;
    /**
     * Seuil de publication, résolu côté serveur.
     *
     * Passé en propriété plutôt qu'importé : la valeur peut venir de
     * l'environnement, et `process` n'existe pas dans le navigateur. Les
     * défauts sont ceux de `src/lib/seuils.ts`.
     */
    seuilCouverture?: number;
    seuilActeursMin?: number;
  };
  const {
    questions,
    acteurs,
    positions,
    annuaire = acteurs,
    candidatures = [],
    sources = [],
    visuels = [],
    avertissement,
    seuilCouverture = SEUIL_PUBLICATION.couverture,
    seuilActeursMin = SEUIL_PUBLICATION.acteursMin,
  }: Proprietes = $props();

  let reponses = $state<Record<string, Reponse>>({});
  let charge = $state(false);

  /**
   * Bascule d'héritage, active par défaut.
   *
   * Active par défaut parce que c'est l'état le plus informatif : à sept mois du
   * scrutin, la plupart des candidats n'ont pas de programme, et les masquer
   * faute de déclaration personnelle donnerait un classement composé des seuls
   * candidats les plus couverts par la presse — exactement le biais que
   * `CLAUDE.md` interdit. Désactivable parce que « ce que le parti dit » et « ce
   * que le candidat a dit » sont deux questions différentes, et que le lecteur a
   * le droit de ne poser que la seconde.
   *
   * L'état ne part ni dans l'URL ni dans le stockage : il vit dans la page, et
   * il est reporté dans la carte partageable pour qu'un chiffre capturé reste
   * interprétable.
   */
  let inclureHeritage = $state(true);

  $effect(() => {
    reponses = lireEtat().reponses;
    charge = true;
  });

  const classement = $derived<Classement>(
    calculer({
      questions,
      acteurs,
      positions,
      candidatures: inclureHeritage ? candidatures : [],
      annuaire,
      reponses,
      seuilClassement: seuilCouverture,
    }),
  );

  /**
   * Acteurs atteignant le seuil DANS LE CLASSEMENT AFFICHÉ.
   *
   * Plus de filtre ici : le moteur a reçu le seuil et n'a rangé que les acteurs
   * qui le franchissent. Le compter une seconde fois dans le composant ouvrirait
   * la porte à deux réponses différentes à la même question.
   *
   * Évalué sur `classement`, donc sur l'état réel de la bascule, et recalculé
   * quand elle change. Décocher l'héritage peut donc faire disparaître le
   * classement : c'est le comportement correct. Les positions de parti sont
   * alors réellement retirées, et un ordre qui survivrait à leur retrait serait
   * un ordre calculé sur autre chose que ce que le lecteur demande à voir.
   */
  const acteursAuSeuil = $derived(classement.classes.length);
  const publiable = $derived(acteursAuSeuil >= seuilActeursMin);

  /** Tous les acteurs comparés, classés ou non. Pour les décomptes. */
  const tousLesActeurs = $derived([...classement.classes, ...classement.nonClasses]);

  /**
   * Candidats qui documentent au moins une position PERSONNELLE.
   *
   * Sert au message affiché quand l'héritage est désactivé : dire « 3 acteurs
   * atteignent le seuil » n'explique rien, alors que « 7 candidats sur 20 se
   * sont exprimés personnellement » dit exactement ce que la bascule vient de
   * retirer, et pourquoi.
   */
  const candidatsAvecPositionPropre = $derived(
    tousLesActeurs.filter((resultat) => resultat.couverture.personnelles > 0).length,
  );

  const aRepondu = $derived(classement.questionsApplicables > 0);
  /** Rangs 1 à 3. Les ex æquo peuvent donc en faire plus de trois. */
  const tete = $derived(classement.classes.filter((resultat) => resultat.rang! <= 3));

  const textesQuestions = new Map(questions.map((q) => [q.id, q.texte]));
  const sourceParId = new Map(sources.map((source) => [source.id, source]));

  /** Graine en hexadécimal : plus court à recopier, et manifestement pas un score. */
  const graineLisible = $derived(classement.graineAffichage.toString(16).padStart(8, "0"));

  /**
   * Couverture faible en tête de classement.
   *
   * Un classement établi sur des positions peu documentées se lit comme un
   * classement sur des positions bien documentées : rien ne les distingue à
   * l'œil. Le dire au-dessus du classement, et pas seulement acteur par acteur.
   */
  const couvertureFaible = $derived(
    tete.length > 0 &&
      tete.reduce((somme, resultat) => somme + resultat.couverture.tauxSolide, 0) / tete.length <
        0.6,
  );

  /**
   * Les acteurs en tête sont-ils documentés TRÈS INÉGALEMENT entre eux ?
   *
   * DISTINCT DE `couvertureFaible`, ET C'EST TOUT L'ENJEU DU MOMENT. La
   * couverture faible dit « il y a peu de matière pour tout le monde ».
   * Celle-ci dit « il y en a beaucoup pour l'un et presque rien pour l'autre »,
   * ce qui est un problème d'une autre nature : à septembre 2026, un parti a
   * publié une plateforme complète et le voisin n'a rien publié du tout.
   *
   * POURQUOI ÇA COMPTE POUR L'ORDRE, ET PAS POUR LE SCORE. Le score ne dépend
   * pas du volume : le moteur normalise par thème, écarte les thèmes non
   * documentés, et l'audit vérifie sur deux mille profils qu'une couverture
   * partielle n'avantage ni ne désavantage EN MOYENNE. Mais sur UN profil, un
   * acteur documenté sur trois affirmations qui se trouvent toutes tomber
   * d'accord obtient un score plus haut qu'un acteur documenté sur dix-huit
   * dont seize tombent d'accord. Le chiffre est exact, l'ordre est fragile, et
   * seule la phrase ci-dessous le dit.
   *
   * Le seuil est un écart de trente points de couverture entre le mieux et le
   * moins bien documenté du peloton de tête. En dessous, l'écart relève du
   * bruit ; au-dessus, il change la lecture.
   */
  const couvertureInegale = $derived.by(() => {
    if (tete.length < 2) return false;
    const taux = tete.map((resultat) => resultat.couverture.taux);
    return Math.max(...taux) - Math.min(...taux) > 0.3;
  });

  const LIBELLES_REPONSE: Record<number, string> = {
    2: "Tout à fait d'accord",
    1: "Plutôt d'accord",
    0: "Ni d'accord, ni pas d'accord",
    [-1]: "Plutôt pas d'accord",
    [-2]: "Pas du tout d'accord",
  };

  const visuelParActeur = new Map(visuels.map((visuel) => [visuel.actorId, visuel]));

  /** Date à signaler sous une position dont toutes les sources précèdent la campagne. */
  function sourceAnterieureALaCampagne(detail: DetailPosition): string | null {
    return dateAnterieureALaCampagne(
      detail.sourceIds
        .map((id) => sourceParId.get(id)?.dateDeclaration)
        .filter((date): date is string => date !== undefined),
    );
  }

  /**
   * Trois qualifications, à côté du chiffre et non à sa place.
   *
   * L'incertitude l'emporte sur la proximité : un score élevé calculé sur des
   * positions mal documentées, ou dans un peloton trop serré, ne se présente
   * pas comme une proximité forte.
   */
  function qualifier(resultat: ResultatActeur): string {
    if (classement.profilPeuMarque || classement.ecartsTenus || resultat.incertitude === "forte") {
      return "Résultat incertain";
    }
    return resultat.score >= 0.72 ? "Proximité forte" : "Proximité modérée";
  }

  /**
   * « Combien atteignent le seuil », en français correct aux trois cardinalités.
   *
   * Écrit en fonction et non en ternaires imbriqués dans le gabarit : à zéro,
   * un et plusieurs, ce ne sont pas les mêmes mots ni la même négation, et les
   * empiler dans le HTML rendait la phrase illisible à la relecture — donc
   * fausse sans que personne ne s'en aperçoive.
   */
  function phraseSeuil(atteignant: number, couverture: number, requis: number): string {
    const seuil = `le seuil de ${Math.round(couverture * 100)} %, là où il en faut ${requis}`;
    if (atteignant === 0) return `Aucun d'entre eux n'atteint ${seuil}.`;
    if (atteignant === 1) return `Un seul d'entre eux atteint ${seuil}.`;
    return `${atteignant} d'entre eux atteignent ${seuil}.`;
  }

  /** Longueur de barre, dans le repère du viewBox. */
  function longueur(score: number): number {
    return Math.max(1, Math.round(score * 100));
  }

  /** Affirmations sur lesquelles l'électeur et l'acteur sont d'accord. */
  function affirmationsDAccord(resultat: ResultatActeur): DetailPosition[] {
    return resultat.parTheme
      .flatMap((theme) => theme.positions)
      .filter((detail) => detail.accord !== null && detail.accord >= SEUIL_ACCORD);
  }

  /** Slug de chaque candidat classé, pour le lien vers sa fiche. */
  const slugParActeur = new Map(acteurs.map((acteur) => [acteur.id, acteur.slug]));

  /*
   * CARTE PARTAGEABLE, DESSINÉE À LA DEMANDE.
   *
   * Le module de dessin n'est chargé qu'au clic : il ne pèse rien sur l'arrivée
   * sur la page. Les images sont des URL `blob:` locales, autorisées par la CSP
   * (`img-src blob:`), et révoquées dès qu'elles ne correspondent plus à
   * l'écran — un changement de bascule change les couvertures, donc la carte.
   */
  let cartes = $state<{ post: string; story: string } | null>(null);
  let fichiers: { post: File; story: File } | null = null;
  let carteEnCours = $state(false);
  let carteErreur = $state(false);
  let peutPartager = $state(false);

  function oublierCartes() {
    if (cartes) {
      URL.revokeObjectURL(cartes.post);
      URL.revokeObjectURL(cartes.story);
    }
    cartes = null;
    fichiers = null;
  }

  $effect(() => {
    // Toute modification de la bascule rend la carte périmée.
    void inclureHeritage;
    return oublierCartes;
  });

  async function creerCartes() {
    carteEnCours = true;
    carteErreur = false;
    try {
      const { dessinerCartes } = await import("../lib/carte-partage");
      const blobs = await dessinerCartes({
        lignes: tete.map((resultat) => ({
          rang: resultat.rang ?? 0,
          nom: resultat.nom,
          parti: visuelParActeur.get(resultat.actorId)?.parti ?? null,
          pourcentage:
            resultat.score !== null && resultat.couverture.taux >= PLANCHER_POURCENTAGE
              ? Math.round(resultat.score * 100)
              : null,
          documentees: resultat.couverture.documentees,
          applicables: resultat.couverture.applicables,
          qualification: qualifier(resultat),
        })),
        heritage: inclureHeritage,
        graine: graineLisible,
        questionsApplicables: classement.questionsApplicables,
        questionsPosees: classement.questionsPosees,
        domaine: new URL(SITE_URL).host,
      });
      oublierCartes();
      fichiers = {
        post: new File([blobs.post], "guide-isoloir-publication.png", { type: "image/png" }),
        story: new File([blobs.story], "guide-isoloir-story.png", { type: "image/png" }),
      };
      peutPartager = navigator.canShare?.({ files: [fichiers.post] }) ?? false;
      cartes = { post: URL.createObjectURL(blobs.post), story: URL.createObjectURL(blobs.story) };
    } catch (erreur) {
      console.error("Carte partageable :", erreur);
      carteErreur = true;
    } finally {
      carteEnCours = false;
    }
  }

  /** Partage natif du téléphone : c'est la personne qui choisit où l'image va. */
  async function partager(format: "post" | "story") {
    if (!fichiers) return;
    try {
      await navigator.share({ files: [fichiers[format]], title: "Mon résultat Guide Isoloir" });
    } catch {
      // Partage annulé : rien à faire, l'image reste enregistrable.
    }
  }

  function recommencer() {
    effacerEtat();
    window.location.assign("/test");
  }
</script>

{#snippet provenance(detail: DetailPosition)}
  <p class="ligne">
    <span class="origine">Origine : {detail.niveauLibelle}.</span>
    {#if detail.heriteDe !== null}
      <!--
        LA MENTION QUI INTERDIT LA CONFUSION. Sans elle, une ligne de parti
        s'affiche exactement comme une déclaration de candidat.
      -->
      <span class="heritage">
        Position de {detail.heriteDe}, reprise faute de déclaration personnelle du candidat.
      </span>
    {/if}
    {#if detail.adequation !== null}
      <span class="adequation">{LIBELLES_ADEQUATION[detail.adequation]}</span>
    {/if}
    {#if detail.confiance !== null}
      <span class="confiance">{LIBELLES_CONFIANCE[detail.confiance]}</span>
    {/if}
  </p>
  {#if detail.citation}
    <blockquote class="citation">« {detail.citation} »</blockquote>
  {/if}
  <!--
    AVERTISSEMENT D'ANCIENNETÉ, EN PLEINE ENCRE ET AVANT LES LIENS : il
    conditionne la lecture de ce qui précède.
  -->
  {@const dateAncienne = sourceAnterieureALaCampagne(detail)}
  {#if dateAncienne !== null}
    <p class="ancienne">
      Position tirée d'un document du {formatDateFr(dateAncienne)}, antérieur à la campagne de 2027.
      Elle peut avoir changé depuis. Ce codage est provisoire : il sera remplacé dès la publication
      du programme présidentiel de cet acteur.
    </p>
  {/if}
  {#each detail.sourceIds as sourceId (sourceId)}
    {@const source = sourceParId.get(sourceId)}
    {#if source}
      <p class="source">
        <a href={source.url} rel="noreferrer">{source.titre}</a>
        — {source.media},
        <time datetime={source.dateDeclaration}>{formatDateFr(source.dateDeclaration)}</time>
      </p>
    {/if}
  {/each}
{/snippet}

{#snippet reglageHeritage()}
  <!--
    LA BASCULE EST RENDUE DANS LES DEUX ÉTATS — avec classement comme sans.
    Décocher l'héritage peut faire disparaître le classement ; si la bascule
    disparaissait avec lui, le lecteur serait enfermé dans l'état qu'il vient de
    choisir. Case à cocher NATIVE, dessinée en interrupteur : elle garde son rôle,
    son nom et son comportement au clavier.
  -->
  <section class="reglage">
    <label class="bascule">
      <input type="checkbox" bind:checked={inclureHeritage} />
      <span class="bascule-texte">
        Inclure les positions héritées du parti
        <span class="explication">
          Quand un candidat ne s'est pas exprimé, utiliser la position de son parti, toujours
          signalée comme telle.
        </span>
      </span>
    </label>
  </section>
{/snippet}

<div class="resultat">
  {#if charge && !aRepondu}
    <div class="panneau vide">
      <h2>Aucune réponse à comparer</h2>
      <p>
        Vos réponses restent dans l'onglet où vous avez passé le test. Si vous l'avez fermé ou
        effacé vos réponses, il n'y a plus rien à afficher. C'est voulu : rien n'est conservé
        ailleurs.
      </p>
      <p><a class="action" href="/test">Passer le test</a></p>
    </div>
  {:else if charge && !publiable}
    <!--
      SOUS LE SEUIL : PAS DE CLASSEMENT DE ZÉROS. Deux causes, qui ne se disent
      pas de la même façon : la bascule décochée, ou le codage pas assez avancé.
    -->
    {@render reglageHeritage()}

    <section class="panneau cadre-lecture">
      {#if !inclureHeritage}
        <h2>Sans les positions de parti, il n'y a pas assez de matière</h2>
        <p>
          Il ne reste que ce que les candidats ont dit ou écrit eux-mêmes, et
          {candidatsAvecPositionPropre === 0
            ? "aucun des candidats"
            : `${candidatsAvecPositionPropre} candidat${candidatsAvecPositionPropre > 1 ? "s" : ""} sur ${tousLesActeurs.length}`}
          {candidatsAvecPositionPropre === 0 ? "ne documente" : "documentent"} une position personnelle
          sur les {classement.questionsApplicables} affirmations auxquelles vous avez répondu.
          {phraseSeuil(acteursAuSeuil, seuilCouverture, seuilActeursMin)}
        </p>
        <p>
          Recochez la case ci-dessus pour utiliser la ligne de leur parti : chaque position reprise
          reste signalée comme telle.
        </p>
      {:else}
        <h2>Le classement n'est pas encore publiable</h2>
        <p>
          Le seuil retenu est de {Math.round(seuilCouverture * 100)} % des affirmations documentées pour
          au moins {seuilActeursMin} acteurs. Aujourd'hui,
          {acteursAuSeuil}
          {acteursAuSeuil > 1 ? "acteurs atteignent" : "acteur atteint"} ce seuil sur les {classement.questionsApplicables}
          affirmations auxquelles vous avez répondu.
        </p>
        <p>
          Afficher un ordre dans cet état reviendrait à classer des acteurs sur ce qui a été codé en
          premier. La <a href="/methodologie">méthodologie</a> décrit l'avancement du codage.
        </p>
      {/if}
    </section>
  {:else if charge}
    {#if avertissement}
      <p class="avertissement-previsualisation">{avertissement}</p>
    {/if}

    <!--
      Le cadre de lecture vient AVANT le classement, au corps du texte, mais en
      une phrase : un avertissement de trois paragraphes n'est plus lu.
    -->
    <div class="preambule">
      <section class="cadre-lecture">
        <h2>Ce classement n'est pas une recommandation</h2>
        <p>
          Il dit de qui vos réponses sont les plus proches <em>sur les questions posées</em>, rien
          d'autre. Servez-vous-en pour aller lire les positions, pas comme d'une réponse.
        </p>
      </section>

      {@render reglageHeritage()}

      <!--
      LES RÉSERVES, EN UNE LIGNE CHACUNE. Elles restent affichées, jamais
      masquées ; l'explication longue se déplie pour qui la cherche.
    -->
      {#if classement.profilPeuMarque || couvertureFaible || couvertureInegale || classement.ecartsTenus}
        <section class="reserves" aria-labelledby="titre-reserves">
          <h2 id="titre-reserves" class="reserves-titre">À savoir avant de lire</h2>
          <ul>
            {#if classement.profilPeuMarque}
              <li>
                Vos réponses sont peu tranchées : presque tout le monde paraît proche de vous.
              </li>
            {/if}
            {#if couvertureFaible}
              <li>
                Les acteurs en tête sont peu documentés : le classement porte sur peu de matière.
              </li>
            {/if}
            {#if couvertureInegale}
              <li>
                Ils ne sont pas documentés dans les mêmes proportions : l'ordre entre eux reste
                fragile.
              </li>
            {/if}
            {#if classement.ecartsTenus}
              <li>Les écarts sont trop faibles pour départager : lisez-les comme un groupe.</li>
            {/if}
          </ul>
          {#if couvertureInegale}
            <details class="pourquoi">
              <summary>Pourquoi l'ordre est fragile</summary>
              <p>
                Certains partis ont publié une plateforme complète, d'autres rien encore pour 2027.
                Un acteur documenté sur trois affirmations qui tombent d'accord avec vous passe
                devant un acteur documenté sur dix-huit dont seize tombent d'accord. Le calcul ne
                récompense pas le volume, mais l'ordre entre deux acteurs inégalement documentés
                reste fragile.
              </p>
            </details>
          {/if}
        </section>
      {/if}
    </div>

    <h2 class="titre-classement">Les plus proches de vos réponses</h2>

    <ol class="classement">
      {#each tete as resultat (resultat.actorId)}
        {@const accords = affirmationsDAccord(resultat)}
        {@const visuel = visuelParActeur.get(resultat.actorId)}
        <li class="acteur">
          <div class="acteur-tete">
            <p class="rang">
              <span class="rang-mot">Rang</span>
              <span class="rang-numero">{resultat.rang}</span>
            </p>

            <!--
              IDENTITÉ. `alt=""` : le nom et le parti sont écrits juste à côté.
              `width` et `height` en attributs : la place est réservée avant le
              chargement, rien ne saute.
            -->
            <div class="identite">
              {#if visuel?.portrait}
                <img
                  class="portrait"
                  src={visuel.portrait}
                  alt=""
                  width="64"
                  height="64"
                  loading="lazy"
                  decoding="async"
                />
              {:else}
                <p class="portrait portrait-absent" aria-hidden="true">{initiales(resultat.nom)}</p>
              {/if}
              <div class="identite-texte">
                <h3 class="nom">{resultat.nom}</h3>
                {#if visuel?.parti}
                  <p class="parti">
                    {#if visuel.logo}
                      <img
                        class="logo"
                        src={visuel.logo}
                        alt=""
                        height="18"
                        loading="lazy"
                        decoding="async"
                      />
                    {/if}
                    <span>{visuel.parti}</span>
                  </p>
                {/if}
              </div>
            </div>
          </div>

          <p class="qualification">{qualifier(resultat)}</p>

          <!--
            Barre en SVG. `width` est un attribut de présentation, pas un style
            en ligne. Une seule encre, une seule opacité : seule la longueur varie.
          -->
          <svg
            class="barre"
            viewBox="0 0 100 4"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${qualifier(resultat)} avec ${resultat.nom}`}
          >
            <rect class="barre-fond" x="0" y="0" width="100" height="4"></rect>
            <rect class="barre-valeur" x="0" y="0" width={longueur(resultat.score)} height="4"
            ></rect>
          </svg>

          <ScoreEtCouverture {resultat} />

          <!--
            PROFIL PAR THÈME, EN UN COUP D'ŒIL. Une barre d'accord par thème, même
            encre que la barre principale, et à côté le nombre d'affirmations
            documentées : un thème non documenté est dit tel, il n'est pas dessiné
            à zéro. Aucun pourcentage ici — la règle « jamais un chiffre sans sa
            couverture » vaut aussi pour le détail.
          -->
          <ul class="profil" aria-label={`Accord avec ${resultat.nom}, thème par thème`}>
            {#each resultat.parTheme as theme (theme.theme)}
              <li class="profil-theme">
                <span class="profil-nom">{theme.theme}</span>
                {#if theme.score === null}
                  <span class="profil-inconnu">non documenté</span>
                {:else}
                  <svg
                    class="profil-barre"
                    viewBox="0 0 100 4"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <rect class="profil-fond" x="0" y="0" width="100" height="4"></rect>
                    <rect class="profil-valeur" x="0" y="0" width={longueur(theme.score)} height="4"
                    ></rect>
                  </svg>
                  <span class="profil-couverture">{theme.documentees} sur {theme.applicables}</span>
                {/if}
              </li>
            {/each}
          </ul>

          <!--
            LE SCORE SE DÉPLIE sur les affirmations qui l'ont produit, chacune
            avec son verbatim, sa source et sa date.
          -->
          <details class="detail">
            <summary>Ce sur quoi vous êtes d'accord ({accords.length})</summary>
            {#if accords.length === 0}
              <p class="inconnu">
                Aucune affirmation documentée ne vous rapproche de cet acteur. Son score vient
                d'accords partiels, pas d'accords francs.
              </p>
            {/if}
            <ul class="positions">
              {#each accords as detail (detail.questionId)}
                <li>
                  <p class="affirmation-detail">{textesQuestions.get(detail.questionId)}</p>
                  <p class="ligne">
                    Vous : {LIBELLES_REPONSE[detail.reponseElecteur]} — Position : {LIBELLES_REPONSE[
                      detail.positionActeur ?? 0
                    ]}.
                  </p>
                  {@render provenance(detail)}
                </li>
              {/each}
            </ul>
          </details>

          <details class="detail">
            <summary>Détail par thème</summary>
            {#each resultat.parTheme as theme (theme.theme)}
              <h4 class="theme">{theme.theme}</h4>
              {#if theme.score === null}
                <p class="inconnu">
                  Aucune position documentée sur ce thème. Il est écarté du calcul, pas compté comme
                  un désaccord.
                </p>
              {/if}
              <ul class="positions">
                {#each theme.positions as detail (detail.questionId)}
                  <li>
                    <p class="affirmation-detail">{textesQuestions.get(detail.questionId)}</p>
                    <p class="ligne">Vous : {LIBELLES_REPONSE[detail.reponseElecteur]}</p>
                    {#if detail.positionActeur === null}
                      <p class="ligne">Position inconnue.</p>
                    {:else}
                      <p class="ligne">Position : {LIBELLES_REPONSE[detail.positionActeur]}.</p>
                      {@render provenance(detail)}
                    {/if}
                  </li>
                {/each}
              </ul>
            {/each}
          </details>

          {#if slugParActeur.get(resultat.actorId)}
            <p class="vers-fiche">
              <a href={`/candidats/${slugParActeur.get(resultat.actorId)}`}>
                Toutes les positions de {resultat.nom}
              </a>
            </p>
          {/if}
        </li>
      {/each}
    </ol>

    <!--
      LES ÉCARTÉS, NOMMÉS : aucun rang, aucune barre, aucun pourcentage, ordre
      alphabétique. La couverture est écrite en toutes lettres, parce que c'est
      la seule information qu'on possède réellement sur eux.
    -->
    {#if classement.nonClasses.length > 0}
      <section class="ecartes">
        <h2>Pas encore assez documentés pour être classés</h2>
        <p>
          Ces {classement.nonClasses.length} candidats sont comparés sur trop peu d'affirmations pour
          qu'un rang veuille dire quelque chose : moins un candidat documente de positions, plus il arrive
          en tête par accident. Le seuil retenu est de {Math.round(seuilCouverture * 100)} % des affirmations
          renseignées. La <a href="/methodologie">méthodologie</a> explique la mesure.
        </p>
        <ul class="liste-ecartes">
          {#each classement.nonClasses as resultat (resultat.actorId)}
            <li>
              <span class="ecarte-nom">{resultat.nom}</span>
              <span class="ecarte-couverture">
                {resultat.couverture.documentees === 0
                  ? "aucune position documentée"
                  : `documenté sur ${resultat.couverture.documentees} des ${resultat.couverture.applicables} affirmations`}
              </span>
            </li>
          {/each}
        </ul>
        {#if !inclureHeritage}
          <p class="reserve">
            Vous avez exclu les positions héritées du parti. Recocher la case ci-dessus ferait
            revenir au classement les candidats dont le parti a publié une ligne.
          </p>
        {/if}
      </section>
    {/if}

    <!--
      CARTE PARTAGEABLE. La graine et l'état de la bascule sont IMPRIMÉS dans la
      carte, pas déduits : ce sont les deux paramètres qui permettent de refaire
      exactement le même écran. L'image est dessinée dans le navigateur, au
      clic, par un module chargé à ce moment-là seulement.
    -->
    <section class="carte">
      <h2>Partager ce résultat</h2>
      <p class="parametres">
        Positions héritées : <strong>{inclureHeritage ? "incluses" : "exclues"}</strong>. Graine
        d'affichage : <strong class="graine">{graineLisible}</strong>. Calculé sur {classement.questionsApplicables}
        affirmations sur {classement.questionsPosees}.
      </p>

      {#if cartes === null}
        <p class="carte-invitation">
          Une image au format publication et story, avec vos rangs, leurs couvertures et ces
          paramètres. Elle est dessinée ici, dans votre navigateur : rien n'est envoyé.
        </p>
        <button
          class="action action--secondaire"
          type="button"
          onclick={creerCartes}
          disabled={carteEnCours}
        >
          {carteEnCours ? "Création de l'image…" : "Créer mon image"}
        </button>
        {#if carteErreur}
          <p class="reserve">
            L'image n'a pas pu être dessinée dans ce navigateur. Une capture d'écran de cette page
            fera l'affaire : elle porte les mêmes paramètres.
          </p>
        {/if}
      {:else}
        <div class="cartes-apercu">
          <figure>
            <img
              src={cartes.post}
              alt="Aperçu de l'image au format publication"
              width="1080"
              height="1350"
            />
            <figcaption>Publication · 1080 × 1350</figcaption>
          </figure>
          <figure>
            <img
              src={cartes.story}
              alt="Aperçu de l'image au format story"
              width="1080"
              height="1920"
            />
            <figcaption>Story · 1080 × 1920</figcaption>
          </figure>
        </div>
        <div class="cartes-actions">
          {#if peutPartager}
            <button class="action" type="button" onclick={() => partager("post")}
              >Partager l'image</button
            >
          {/if}
          <a
            class="action action--secondaire"
            href={cartes.post}
            download="guide-isoloir-publication.png"
          >
            Enregistrer la publication
          </a>
          <a
            class="action action--secondaire"
            href={cartes.story}
            download="guide-isoloir-story.png"
          >
            Enregistrer la story
          </a>
        </div>
      {/if}
    </section>

    <p class="effacer">
      <button class="lien" type="button" onclick={recommencer}>Effacer mes réponses</button>
    </p>
  {/if}
</div>

<style>
  /* Les tokens viennent de src/styles/base.css. DESIGN_SYSTEM.md fait foi. */

  .resultat {
    display: flex;
    flex-direction: column;
    gap: var(--pas-4);
  }

  .resultat > :global(*) {
    margin-block: 0;
  }

  /* Un panneau groupe ce qui va ensemble : une carte qui délimite, pas qui décore. */
  .panneau,
  .cadre-lecture {
    padding: var(--pas-3);
    border-radius: var(--rayon-carte);
    background: var(--couleur-surface-2);
  }

  .panneau h2,
  .cadre-lecture h2 {
    font-size: var(--t-h3);
    margin: 0 0 var(--pas-1);
  }

  .panneau p,
  .cadre-lecture p {
    margin: 0 0 var(--pas-2);
  }

  .panneau p:last-child,
  .cadre-lecture p:last-child {
    margin-bottom: 0;
  }

  .avertissement-previsualisation,
  .reserve {
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
    border-left: 3px solid var(--couleur-signature);
    padding-left: var(--pas-3);
    margin: 0;
  }

  .avertissement-previsualisation {
    font-weight: 600;
    color: var(--couleur-encre);
  }

  /* ─── Bascule : une case native dessinée en interrupteur ──────────────── */

  .bascule {
    display: flex;
    align-items: flex-start;
    gap: var(--pas-2);
    cursor: pointer;
  }

  .bascule input {
    appearance: none;
    flex: none;
    position: relative;
    width: 46px;
    height: 28px;
    margin: 0;
    border-radius: var(--rayon-actionnable);
    background: var(--couleur-encre-faible);
    cursor: pointer;
    transition: background-color var(--duree) var(--sortie);
  }

  .bascule input::before {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--couleur-surface);
    box-shadow: var(--ombre-1);
    transition: transform var(--duree) var(--sortie);
  }

  .bascule input:checked {
    background: var(--couleur-aplat);
  }

  .bascule input:checked::before {
    transform: translateX(18px);
  }

  .bascule-texte {
    font-weight: 600;
    line-height: 1.35;
  }

  .explication {
    display: block;
    margin-top: 2px;
    font-weight: 400;
    font-size: var(--t-petit);
    color: var(--couleur-encre-faible);
  }

  /* ─── Réserves ────────────────────────────────────────────────────────── */

  .reserves {
    padding: var(--pas-3);
    border-radius: var(--rayon-carte);
    border: 1px solid var(--couleur-trait);
    background: var(--couleur-surface);
  }

  .reserves-titre {
    font-size: var(--t-petit);
    margin: 0 0 var(--pas-1);
  }

  .reserves ul {
    margin: 0;
    padding-left: 1.1rem;
    font-size: var(--t-petit);
  }

  .reserves li + li {
    margin-top: 4px;
  }

  .pourquoi {
    margin-top: var(--pas-2);
    font-size: var(--t-petit);
  }

  .pourquoi summary,
  .detail summary {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--couleur-signature);
    font-weight: 600;
    cursor: pointer;
  }

  .pourquoi p {
    margin: 0;
    color: var(--couleur-encre-faible);
  }

  /*
   * PRÉAMBULE. Sur ordinateur, le cadre de lecture et les réserves se lisent
   * côte à côte, la bascule en dessous : tout tient dans l'écran d'arrivée.
   */
  .preambule {
    display: grid;
    gap: var(--pas-3);
  }

  @media (min-width: 64rem) {
    .preambule {
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }

    .preambule > .reglage {
      grid-column: 1 / -1;
      grid-row: 2;
    }

    /* Sans réserve à afficher, le cadre de lecture prend toute la largeur. */
    .preambule:not(:has(.reserves)) > .cadre-lecture {
      grid-column: 1 / -1;
    }

    .classement {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
    }

    .cartes-apercu {
      max-width: 40rem;
    }
  }

  /* ─── Classement ──────────────────────────────────────────────────────── */

  .titre-classement {
    margin-top: var(--pas-3);
  }

  .classement {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--pas-3);
  }

  .acteur {
    margin: 0;
    padding: var(--pas-3);
    border-radius: var(--rayon-carte-l);
    background: var(--couleur-surface);
    border: 1px solid var(--couleur-trait);
    box-shadow: var(--ombre-1);
  }

  .acteur-tete {
    display: flex;
    align-items: center;
    gap: var(--pas-3);
    margin-bottom: var(--pas-2);
  }

  /* Le rang en grand chiffre : c'est l'information que la carte ordonne. */
  .rang {
    flex: none;
    display: grid;
    justify-items: center;
    margin: 0;
    line-height: 1;
    color: var(--couleur-signature);
  }

  .rang-mot {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--couleur-encre-faible);
  }

  .rang-numero {
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .identite {
    display: flex;
    align-items: center;
    gap: var(--pas-2);
    min-width: 0;
  }

  .identite-texte {
    min-width: 0;
  }

  .nom {
    margin: 0;
    font-size: 1.25rem;
    letter-spacing: -0.02em;
  }

  /*
   * PORTRAIT CARRÉ, identique pour tous : un cadre, une bordure, une taille.
   * Aucune différence de traitement d'un candidat à l'autre.
   */
  .portrait {
    flex: none;
    width: 64px;
    height: 64px;
    margin: 0;
    object-fit: cover;
    /* Les photos libres sont cadrées de vingt façons ; le haut est le plus sûr. */
    object-position: top center;
    border-radius: 14px;
    border: 1px solid var(--couleur-trait);
    background: var(--couleur-trait);
  }

  .portrait-absent {
    display: grid;
    place-items: center;
    font-size: var(--t-petit);
    font-weight: 600;
    letter-spacing: 0.04em;
    /*
     * Fond de surface, pas la teinte des filets : sur `--couleur-trait`, les
     * initiales en encre faible tombaient à 4,2:1, mesuré par capturer.mjs.
     */
    background: var(--couleur-surface-2);
    color: var(--couleur-encre-faible);
  }

  .parti {
    display: flex;
    align-items: center;
    gap: var(--pas-1);
    margin: 2px 0 0;
    font-size: var(--t-petit);
    color: var(--couleur-encre-faible);
  }

  /*
   * Logo sur plaque claire, dans les deux thèmes : la plupart sont du texte
   * sombre sur fond transparent et disparaîtraient sur le fond sombre. La
   * plaque est la même pour tous, ce que la neutralité exige.
   */
  .logo {
    flex: none;
    height: 18px;
    width: auto;
    max-width: 72px;
    object-fit: contain;
    background: #ffffff;
    padding: 2px 3px;
    border-radius: 4px;
    border: 1px solid var(--couleur-trait);
  }

  .qualification {
    display: inline-block;
    margin: 0 0 var(--pas-2);
    padding: 3px 10px;
    border-radius: var(--rayon-actionnable);
    background: var(--couleur-surface-2);
    font-size: var(--t-petit);
    font-weight: 600;
  }

  .barre {
    display: block;
    width: 100%;
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
  }

  /* Une seule encre pour toutes les barres, principales et par thème. */
  .barre-fond,
  .profil-fond {
    fill: var(--couleur-trait);
  }

  .barre-valeur,
  .profil-valeur {
    fill: var(--couleur-signature);
  }

  /* ─── Profil par thème ────────────────────────────────────────────────── */

  .profil {
    list-style: none;
    margin: var(--pas-3) 0 var(--pas-1);
    padding: var(--pas-2) 0 0;
    border-top: 1px solid var(--couleur-trait);
    display: grid;
    gap: 6px;
  }

  .profil-theme {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 4.5rem auto;
    align-items: center;
    gap: var(--pas-2);
    margin: 0;
    font-size: 0.8125rem;
  }

  .profil-nom {
    color: var(--couleur-encre-faible);
    line-height: 1.25;
  }

  .profil-barre {
    display: block;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
  }

  .profil-couverture {
    color: var(--couleur-encre-faible);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .profil-inconnu {
    grid-column: 2 / 4;
    color: var(--couleur-encre-faible);
    font-style: italic;
  }

  /* ─── Détails dépliables ──────────────────────────────────────────────── */

  .detail {
    border-top: 1px solid var(--couleur-trait);
  }

  .detail:last-of-type {
    border-bottom: 1px solid var(--couleur-trait);
  }

  .theme {
    font-size: var(--t-petit);
    margin: var(--pas-3) 0 var(--pas-1);
  }

  .positions {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--pas-2);
  }

  .positions li {
    margin: 0 0 var(--pas-3);
    font-size: var(--t-petit);
  }

  .affirmation-detail {
    font-weight: 600;
    margin: 0 0 4px;
  }

  .ligne {
    color: var(--couleur-encre-faible);
    margin: 0;
  }

  .origine,
  .heritage,
  .adequation,
  .confiance {
    display: block;
  }

  /* L'héritage et l'ancienneté en pleine encre : ce sont eux qui évitent la confusion. */
  .heritage {
    color: var(--couleur-encre);
  }

  .ancienne {
    margin: var(--pas-1) 0;
    padding-left: var(--pas-2);
    border-left: 2px solid var(--couleur-encre-faible);
    color: var(--couleur-encre);
  }

  .citation {
    margin: var(--pas-1) 0;
    padding-left: var(--pas-3);
    border-left: 2px solid var(--couleur-trait);
    color: var(--couleur-encre);
  }

  .source {
    margin: 0;
    color: var(--couleur-encre-faible);
  }

  .inconnu {
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
  }

  .vers-fiche {
    margin: var(--pas-2) 0 0;
    font-size: var(--t-petit);
    font-weight: 600;
  }

  .vers-fiche a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
  }

  /* ─── Écartés : des étiquettes, pas une liste ordonnée ────────────────── */

  .ecartes {
    margin-top: var(--pas-3);
  }

  .ecartes h2 {
    font-size: var(--t-h3);
  }

  .ecartes > p {
    font-size: var(--t-petit);
    color: var(--couleur-encre-faible);
  }

  .liste-ecartes {
    list-style: none;
    padding: 0;
    margin: var(--pas-2) 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--pas-1);
  }

  .liste-ecartes li {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 8px 14px;
    border-radius: 14px;
    border: 1px solid var(--couleur-trait);
    background: var(--couleur-surface);
  }

  .ecarte-nom {
    font-weight: 600;
    font-size: var(--t-petit);
  }

  .ecarte-couverture {
    font-size: 0.8125rem;
    color: var(--couleur-encre-faible);
  }

  /* ─── Carte partageable ───────────────────────────────────────────────── */

  .carte {
    padding: var(--pas-3);
    border-radius: var(--rayon-carte-l);
    background: var(--couleur-surface-2);
  }

  .carte h2 {
    font-size: var(--t-h3);
    margin: 0 0 var(--pas-1);
  }

  .parametres,
  .carte-invitation {
    font-size: var(--t-petit);
    color: var(--couleur-encre-faible);
    margin: 0 0 var(--pas-2);
  }

  .cartes-apercu {
    display: grid;
    grid-template-columns: 1fr 0.8fr;
    align-items: end;
    gap: var(--pas-2);
    margin-bottom: var(--pas-3);
  }

  .cartes-apercu figure {
    margin: 0;
  }

  .cartes-apercu img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: var(--ombre-2);
  }

  .cartes-apercu figcaption {
    margin-top: var(--pas-1);
    font-size: 0.8125rem;
    color: var(--couleur-encre-faible);
  }

  .cartes-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--pas-1);
  }

  .action:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  .effacer {
    font-size: var(--t-petit);
  }

  .lien {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    color: var(--couleur-signature);
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }
</style>
