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
    SEUIL_ACCORD,
    SEUIL_PUBLICATION,
    SOURCE_ANTERIEURE_A_LA_CAMPAGNE_AVANT,
  } from "../lib/seuils";
  import { formatDateFr } from "../lib/date";
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
    }),
  );

  /**
   * Acteurs atteignant le seuil DANS LE CLASSEMENT AFFICHÉ.
   *
   * Évalué sur `classement`, donc sur l'état réel de la bascule, et recalculé
   * quand elle change. Décocher l'héritage peut donc faire disparaître le
   * classement : c'est le comportement correct. Les positions de parti sont
   * alors réellement retirées, et un ordre qui survivrait à leur retrait serait
   * un ordre calculé sur autre chose que ce que le lecteur demande à voir.
   */
  const acteursAuSeuil = $derived(
    classement.acteurs.filter((resultat) => resultat.couverture.taux >= seuilCouverture).length,
  );
  const publiable = $derived(acteursAuSeuil >= seuilActeursMin);

  /**
   * Candidats qui documentent au moins une position PERSONNELLE.
   *
   * Sert au message affiché quand l'héritage est désactivé : dire « 3 acteurs
   * atteignent le seuil » n'explique rien, alors que « 7 candidats sur 20 se
   * sont exprimés personnellement » dit exactement ce que la bascule vient de
   * retirer, et pourquoi.
   */
  const candidatsAvecPositionPropre = $derived(
    classement.acteurs.filter((resultat) => resultat.couverture.personnelles > 0).length,
  );

  const aRepondu = $derived(classement.questionsApplicables > 0);
  /** Rangs 1 à 3. Les ex æquo peuvent donc en faire plus de trois. */
  const tete = $derived(classement.acteurs.filter((resultat) => resultat.rang <= 3));

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

  /**
   * Initiales de repli, quand aucune photo sous licence libre n'existe.
   *
   * PAS DE SILHOUETTE GRISE. Une silhouette générique sur un site de
   * comparaison politique ferait passer l'absence de photo libre pour une
   * caractéristique du candidat : les initiales disent qu'il manque une image,
   * la silhouette dit qu'il manque quelqu'un.
   *
   * Les particules sont écartées — « Le Pen » donne « LP » et non « LP » via
   * « Le » — en ne gardant que les mots d'au moins deux lettres commençant par
   * une majuscule, puis le premier et le dernier.
   */
  function initiales(nom: string): string {
    const mots = nom
      .split(/[\s-]+/)
      .filter((mot) => mot.length > 1 && mot[0] === mot[0]?.toLocaleUpperCase("fr"));
    const retenus = mots.length > 1 ? [mots[0], mots[mots.length - 1]] : mots;
    return retenus.map((mot) => mot?.[0] ?? "").join("");
  }

  /**
   * Confiance accordée à la source, en toutes lettres.
   *
   * Affichée parce qu'elle est le prix à payer pour avoir ouvert le codage à la
   * presse : une position tirée d'un entretien vaut ce que vaut l'entretien, et
   * le lecteur doit pouvoir le lire sans ouvrir le dépôt. Elle n'entre pas dans
   * le calcul — une position mal documentée reste la position qu'elle est.
   */
  /**
   * La source la plus récente d'une position est-elle antérieure à la campagne ?
   *
   * ON REGARDE LA PLUS RÉCENTE, pas la plus ancienne. Une position appuyée sur
   * un programme de 2024 ET sur une déclaration de 2026 n'est pas une position
   * périmée : elle est confirmée. Prendre la plus ancienne ferait apparaître un
   * avertissement sur les codages les MIEUX sourcés, ce qui est le contraire du
   * but.
   *
   * Renvoie la date de cette source, ou `null` s'il n'y a rien à signaler.
   */
  function sourceAnterieureALaCampagne(detail: DetailPosition): string | null {
    const dates = detail.sourceIds
      .map((id) => sourceParId.get(id)?.dateDeclaration)
      .filter((date): date is string => date !== undefined);
    if (dates.length === 0) return null;

    // Format ISO : la comparaison lexicographique est la comparaison chronologique.
    const plusRecente = dates.reduce((a, b) => (a > b ? a : b));
    return plusRecente < SOURCE_ANTERIEURE_A_LA_CAMPAGNE_AVANT ? plusRecente : null;
  }

  const LIBELLES_CONFIANCE: Record<string, string> = {
    high: "Confiance dans la source : élevée.",
    medium: "Confiance dans la source : moyenne.",
    low: "Confiance dans la source : faible.",
  };

  const LIBELLES_ADEQUATION: Record<string, string> = {
    directe: "La citation porte sur la mesure exactement posée.",
    partielle: "La citation recoupe l'affirmation sans la recouvrir.",
    deduite: "Aucune citation ne porte sur la mesure : valeur déduite.",
  };

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
    AVERTISSEMENT D'ANCIENNETÉ, EN PLEINE ENCRE ET AVANT LES LIENS.

    Il est rendu au-dessus des sources, et non en note après elles, parce qu'il
    conditionne la lecture de ce qui précède : savoir qu'une position vient d'un
    autre scrutin change ce qu'on fait du chiffre. Une mention qu'il faut
    chercher n'avertit personne.
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
    LA BASCULE EST EN TÊTE, et elle est rendue DANS LES DEUX ÉTATS — avec
    classement comme sans.

    Décocher l'héritage peut faire passer le classement sous le seuil de
    publication et le faire disparaître. Si la bascule disparaissait avec lui,
    le lecteur serait enfermé dans l'état qu'il vient de choisir, sans aucun
    moyen de revenir en arrière : un réglage dont on ne peut pas sortir n'est
    pas un réglage, c'est une impasse.
  -->
  <section class="reglage">
    <label class="bascule">
      <input type="checkbox" bind:checked={inclureHeritage} />
      <span>
        Inclure les positions héritées du parti
        <span class="explication">
          Quand un candidat ne s'est pas exprimé sur une affirmation, utiliser la position de son
          parti. Chaque position reprise reste identifiée comme telle dans le détail.
        </span>
      </span>
    </label>
  </section>
{/snippet}

{#if charge && !aRepondu}
  <div class="vide">
    <h2>Aucune réponse à comparer</h2>
    <p>
      Vos réponses restent dans l'onglet où vous avez passé le test. Si vous avez fermé cet onglet,
      rechargé la page depuis un autre, ou effacé vos réponses, il n'y a plus rien à afficher. C'est
      voulu : rien n'est conservé ailleurs.
    </p>
    <p><a class="action" href="/test">Passer le test</a></p>
  </div>
{:else if charge && !publiable}
  <!--
    SOUS LE SEUIL : PAS DE CLASSEMENT DE ZÉROS.

    Deux causes possibles, et elles ne se disent pas de la même façon :

      - le lecteur a DÉCOCHÉ l'héritage. Le message nomme alors ce que ce
        réglage vient de retirer — les candidats qui ne se sont pas exprimés
        personnellement n'ont plus rien de documenté — plutôt que de servir un
        état d'avancement générique qui n'expliquerait pas la disparition ;
      - le codage n'est pas assez avancé, héritage compris. C'est l'état du
        projet, et c'est ce qu'on dit.
  -->
  {@render reglageHeritage()}

  <section class="cadre-lecture">
    {#if !inclureHeritage}
      <h2>Sans les positions de parti, il n'y a pas assez de matière</h2>
      <p>
        Vous avez exclu les positions héritées du parti. Il ne reste alors que ce que les candidats
        ont dit ou écrit EUX-MÊMES, et
        {candidatsAvecPositionPropre === 0
          ? "aucun des candidats"
          : `${candidatsAvecPositionPropre} candidat${candidatsAvecPositionPropre > 1 ? "s" : ""} sur ${classement.acteurs.length}`}
        {candidatsAvecPositionPropre === 0 ? "ne documente" : "documentent"} une position personnelle
        sur les {classement.questionsApplicables} affirmations auxquelles vous avez répondu.
        {phraseSeuil(acteursAuSeuil, seuilCouverture, seuilActeursMin)}
      </p>
      <p>
        C'est une information en soi : à sept mois du scrutin, la plupart des candidats ne se sont
        pas encore exprimés affirmation par affirmation. Recochez la case ci-dessus pour utiliser la
        ligne de leur parti — chaque position reprise reste signalée comme telle.
      </p>
    {:else}
      <h2>Le classement n'est pas encore publiable</h2>
      <p>
        Un classement suppose assez de matière pour que l'ordre entre les acteurs dise quelque
        chose. Le seuil retenu est de {Math.round(seuilCouverture * 100)} % des affirmations documentées
        pour au moins {seuilActeursMin} acteurs. Aujourd'hui,
        {acteursAuSeuil}
        {acteursAuSeuil > 1 ? "acteurs atteignent" : "acteur atteint"} ce seuil sur les {classement.questionsApplicables}
        affirmations auxquelles vous avez répondu.
      </p>
      <p>
        Afficher un ordre dans cet état reviendrait à classer des acteurs sur ce qui a été codé en
        premier, pas sur ce qu'ils défendent. La <a href="/methodologie">méthodologie</a> décrit l'avancement
        du codage et ce qui reste à documenter.
      </p>
    {/if}
  </section>
{:else if charge}
  {#if avertissement}
    <p class="avertissement-previsualisation">{avertissement}</p>
  {/if}

  <!--
    Le cadre de lecture vient AVANT le classement, au corps du texte. Le mettre
    après, ou en petit, reviendrait à publier un verdict assorti d'une clause de
    style.
  -->
  <section class="cadre-lecture">
    <h2>Ce classement n'est pas une recommandation</h2>
    <p>
      Il indique de quels acteurs vos réponses sont les plus proches <em
        >sur les questions posées</em
      >, et rien d'autre. Il ne tient compte ni de ce qui n'a pas été demandé, ni de la crédibilité
      d'un engagement, ni de ce qu'un élu peut réellement décider.
    </p>
    <p>
      Servez-vous-en comme d'un point de départ pour aller lire les positions elles-mêmes, pas comme
      d'une réponse.
    </p>
  </section>

  {@render reglageHeritage()}

  {#if classement.profilPeuMarque}
    <p class="reserve">
      Vos réponses sont peu tranchées, ou trop peu nombreuses. Le classement ci-dessous est
      mathématiquement valable et ne veut pas dire grand-chose : avec des positions proches du
      milieu, presque tout le monde paraît proche de vous.
    </p>
  {/if}

  {#if couvertureFaible}
    <p class="reserve">
      Les acteurs en tête sont peu documentés sur les questions auxquelles vous avez répondu, ou le
      sont par des inférences plutôt que par des déclarations. Le classement porte alors sur peu de
      matière : lisez le détail par thème avant d'en tirer quoi que ce soit.
    </p>
  {/if}

  {#if couvertureInegale}
    <p class="reserve">
      Les acteurs en tête ne sont pas documentés dans les mêmes proportions. Certains partis ont
      publié une plateforme complète, d'autres n'ont encore rien publié pour 2027 : le nombre
      d'affirmations documentées, affiché sous chaque acteur, varie donc fortement de l'un à
      l'autre. Un acteur documenté sur trois affirmations qui tombent d'accord avec vous passe
      devant un acteur documenté sur dix-huit dont seize tombent d'accord. Le calcul ne récompense
      pas le volume, mais l'ordre entre deux acteurs inégalement documentés reste fragile.
    </p>
  {/if}

  {#if classement.ecartsTenus}
    <p class="reserve">
      Les premiers écarts sont trop faibles pour départager qui que ce soit. Lisez ces acteurs comme
      un groupe, pas comme un ordre.
    </p>
  {/if}

  <h2>Les plus proches de vos réponses</h2>

  <ol class="classement">
    {#each tete as resultat (resultat.actorId)}
      {@const accords = affirmationsDAccord(resultat)}
      <li class="acteur">
        <p class="rang">Rang {resultat.rang}</p>

        <!--
          IDENTITÉ : PORTRAIT, NOM, PARTI.

          `alt=""` sur les deux images, et c'est délibéré : le nom du candidat
          et celui de son parti sont écrits juste à côté, en texte. Un `alt`
          qui les répéterait ferait entendre deux fois la même chose à un
          lecteur d'écran.

          `width` et `height` sont posés en attributs pour que la place soit
          réservée avant le chargement : sans eux, chaque photo pousse le
          classement vers le bas en arrivant.
        -->
        <div class="identite">
          {#if visuelParActeur.get(resultat.actorId)?.portrait}
            <img
              class="portrait"
              src={visuelParActeur.get(resultat.actorId)?.portrait}
              alt=""
              width="56"
              height="56"
              loading="lazy"
              decoding="async"
            />
          {:else}
            <p class="portrait portrait-absent" aria-hidden="true">{initiales(resultat.nom)}</p>
          {/if}
          <div class="identite-texte">
            <h3 class="nom">{resultat.nom}</h3>
            {#if visuelParActeur.get(resultat.actorId)?.parti}
              <p class="parti">
                {#if visuelParActeur.get(resultat.actorId)?.logo}
                  <img
                    class="logo"
                    src={visuelParActeur.get(resultat.actorId)?.logo}
                    alt=""
                    height="18"
                    loading="lazy"
                    decoding="async"
                  />
                {/if}
                <span>{visuelParActeur.get(resultat.actorId)?.parti}</span>
              </p>
            {/if}
          </div>
        </div>

        <p class="qualification">{qualifier(resultat)}</p>

        <!--
          Barre en SVG. `width` est un attribut de présentation, pas un style en
          ligne. Une seule encre, une seule opacité : seule la longueur varie.
        -->
        <svg
          class="barre"
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${qualifier(resultat)} avec ${resultat.nom}`}
        >
          <rect class="barre-fond" x="0" y="0" width="100" height="4"></rect>
          <rect class="barre-valeur" x="0" y="0" width={longueur(resultat.score)} height="4"></rect>
        </svg>

        <ScoreEtCouverture {resultat} />

        <!--
          LE SCORE EST CLIQUABLE. Un chiffre qu'on ne peut pas ouvrir est un
          chiffre qu'il faut croire. Celui-ci se déplie sur les affirmations qui
          l'ont produit, chacune avec son verbatim, sa source et sa date.
        -->
        <details class="detail">
          <summary>
            Ce sur quoi vous êtes d'accord ({accords.length})
          </summary>
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
                  <p class="ligne">
                    Vous : {LIBELLES_REPONSE[detail.reponseElecteur]}
                  </p>
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
      </li>
    {/each}
  </ol>

  <!--
    CARTE PARTAGEABLE.

    Une capture d'écran de ces chiffres circule sans rien qui dise comment ils
    ont été obtenus. Deux personnes aux mêmes réponses obtiendraient des ordres
    différents à score égal, et des couvertures différentes selon la bascule,
    sans qu'aucune capture ne montre le réglage. Les deux paramètres sont donc
    IMPRIMÉS DANS LA CARTE, pas déduits : la graine fixe l'ordre des ex æquo,
    l'état de la bascule fixe les couvertures.
  -->
  <section class="carte">
    <h2>Partager ce résultat</h2>
    <p class="parametres">
      Positions héritées : <strong>{inclureHeritage ? "incluses" : "exclues"}</strong>. Graine
      d'affichage : <strong class="graine">{graineLisible}</strong>. Calculé sur {classement.questionsApplicables}
      affirmations sur {classement.questionsPosees}.
    </p>
    <p class="reserve">
      Ces deux paramètres suffisent à refaire exactement le même écran : mêmes réponses, même
      réglage, même ordre à score égal. Sans eux, une capture ne prouve rien. Ils ne contiennent pas
      vos réponses — la graine en est une empreinte, et elle ne quitte pas votre navigateur.
    </p>
  </section>

  <p class="effacer">
    <button class="lien" type="button" onclick={recommencer}>Effacer mes réponses</button>
  </p>
{/if}

<style>
  /* Les tokens viennent de src/styles/base.css. DESIGN_SYSTEM.md fait foi. */

  .avertissement-previsualisation,
  .reserve {
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
    border-left: 3px solid var(--couleur-signature);
    padding-left: var(--pas-3);
    margin: 0 0 var(--pas-4);
  }

  .avertissement-previsualisation {
    font-weight: 600;
    color: var(--couleur-encre);
  }

  .cadre-lecture {
    margin-block: var(--pas-5);
  }

  .cadre-lecture h2 {
    margin-top: 0;
  }

  /* Réglage : encadré discret, mais au-dessus du classement qu'il modifie. */
  .reglage {
    border-top: 1px solid var(--couleur-trait);
    border-bottom: 1px solid var(--couleur-trait);
    padding-block: var(--pas-3);
    margin-bottom: var(--pas-4);
  }

  .bascule {
    display: flex;
    gap: var(--pas-2);
    align-items: flex-start;
    cursor: pointer;
  }

  /* 24 px : cible tactile décente à 375 px, sans agrandir la case elle-même. */
  .bascule input {
    inline-size: 1.5rem;
    block-size: 1.5rem;
    margin: 0;
    flex: none;
    accent-color: var(--couleur-aplat);
  }

  .explication {
    display: block;
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
    margin-top: var(--pas-1);
  }

  .classement {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .acteur {
    margin-bottom: var(--pas-6);
  }

  .rang {
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
    font-variant-numeric: tabular-nums;
    margin: 0;
  }

  .identite {
    display: flex;
    align-items: center;
    gap: var(--pas-2);
    margin: var(--pas-1) 0 var(--pas-2);
  }

  .identite-texte {
    min-width: 0;
  }

  .nom {
    margin: 0;
  }

  /*
   * Portrait carré, sans arrondi et sans ombre.
   *
   * La pastille ronde à ombre douce est le réflexe par défaut, et la section 9
   * du brief le refuse nommément. Le carré tient aussi mieux la promesse de
   * neutralité : un cadre identique pour tous, une seule bordure, aucune
   * différence de traitement d'un candidat à l'autre.
   */
  .portrait {
    flex: none;
    width: 56px;
    height: 56px;
    object-fit: cover;
    /* Les photos libres sont cadrées de vingt façons ; le haut est le plus sûr. */
    object-position: top center;
    border: 1px solid var(--couleur-trait);
    background: var(--couleur-trait);
  }

  .portrait-absent {
    display: grid;
    place-items: center;
    margin: 0;
    font-size: var(--t-petit);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--couleur-encre-faible);
  }

  .parti {
    display: flex;
    align-items: center;
    gap: var(--pas-1);
    margin: var(--pas-1) 0 0;
    font-size: var(--t-petit);
    color: var(--couleur-encre-faible);
  }

  /*
   * Logo sur plaque claire, dans les deux thèmes.
   *
   * La plupart de ces logos sont du texte sombre sur fond transparent : posés
   * directement sur le fond sombre du thème nuit, ils disparaissent. La plaque
   * n'est pas une carte décorative, c'est ce qui les rend lisibles — et elle
   * est la même pour tous, ce que la neutralité exige.
   */
  .logo {
    flex: none;
    height: 18px;
    width: auto;
    max-width: 72px;
    object-fit: contain;
    background: #ffffff;
    padding: 2px 3px;
    border: 1px solid var(--couleur-trait);
  }

  .qualification {
    font-weight: 600;
    margin: 0 0 var(--pas-2);
  }

  /*
   * Une seule encre, une seule opacité, pour tous les rangs. La couleur
   * signature est réservée à ce sur quoi on agit : un score n'est pas une
   * action, et le teinter reviendrait à faire d'une proximité une adhésion.
   */
  .barre {
    display: block;
    width: 100%;
    height: 4px;
    margin-bottom: var(--pas-2);
  }

  .barre-fond {
    fill: var(--couleur-trait);
  }

  .barre-valeur {
    fill: var(--couleur-encre);
  }

  .inconnu {
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
    margin: 0 0 var(--pas-2);
  }

  .detail summary {
    cursor: pointer;
    font-size: var(--t-petit);
    color: var(--couleur-signature);
    padding-block: var(--pas-1);
  }

  .theme {
    font-size: var(--t-petit);
    text-transform: none;
    margin: var(--pas-3) 0 var(--pas-2);
  }

  .positions {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: var(--t-petit);
  }

  .positions > li {
    border-top: 1px solid var(--couleur-trait);
    padding-block: var(--pas-2);
    margin: 0;
  }

  .affirmation-detail {
    margin: 0 0 var(--pas-1);
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

  /*
   * En pleine encre et bordé, comme la mention d'héritage : ce n'est pas une
   * réserve de bas de page, c'est ce qui empêche de prendre un programme de
   * 2024 pour une position de 2027.
   */
  .ancienne {
    margin: var(--pas-1) 0;
    padding-left: var(--pas-2);
    border-left: 2px solid var(--couleur-encre-faible);
    color: var(--couleur-encre);
  }

  /*
   * L'héritage est en pleine encre, pas en gris : c'est l'information qui
   * empêche de prendre une ligne de parti pour une déclaration de candidat.
   */
  .heritage {
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

  .carte {
    border-top: 1px solid var(--couleur-trait);
    padding-top: var(--pas-3);
    margin-top: var(--pas-5);
  }

  .parametres {
    font-size: var(--t-petit);
  }

  .graine {
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.05em;
  }

  .action {
    display: inline-block;
    background: var(--couleur-aplat);
    color: var(--couleur-sur-aplat);
    text-decoration: none;
    font-weight: 600;
    padding: var(--pas-2) var(--pas-4);
    border-radius: var(--rayon-actionnable);
    transition: transform var(--duree) var(--sortie);
  }

  .action:active {
    transform: scale(0.98);
  }

  .lien {
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    color: var(--couleur-signature);
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }

  .effacer {
    margin-top: var(--pas-5);
    font-size: var(--t-petit);
  }
</style>
