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
  import { SEUIL_ACCORD, SEUIL_PUBLICATION } from "../lib/seuils";
  import { formatDateFr } from "../lib/date";
  import ScoreEtCouverture from "./ScoreEtCouverture.svelte";

  /*
   * Tout arrive en propriété, projeté côté serveur. Le composant n'importe aucun
   * module de données : `direction` ne doit se trouver ni dans le HTML ni dans
   * ce bundle.
   */
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
   * Classement de référence pour la décision de publication, héritage TOUJOURS
   * inclus.
   *
   * Le seuil porte sur l'état des données, pas sur le réglage du lecteur. Le
   * calculer sur le classement affiché permettrait de faire disparaître le
   * classement en décochant une case, ce qui laisserait croire que les données
   * ont changé.
   */
  const classementReference = $derived<Classement>(
    calculer({ questions, acteurs, positions, candidatures, annuaire, reponses }),
  );

  const acteursAuSeuil = $derived(
    classementReference.acteurs.filter((resultat) => resultat.couverture.taux >= seuilCouverture)
      .length,
  );
  const publiable = $derived(acteursAuSeuil >= seuilActeursMin);

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

  const LIBELLES_REPONSE: Record<number, string> = {
    2: "Tout à fait d'accord",
    1: "Plutôt d'accord",
    0: "Ni d'accord, ni pas d'accord",
    [-1]: "Plutôt pas d'accord",
    [-2]: "Pas du tout d'accord",
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
  </p>
  {#if detail.citation}
    <blockquote class="citation">« {detail.citation} »</blockquote>
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
    SOUS LE SEUIL : L'ÉTAT D'AVANCEMENT, PAS UN CLASSEMENT DE ZÉROS.
    Voir `SEUIL_PUBLICATION`. Ce n'est pas une page d'erreur : les données
    existent, elles ne sont simplement pas encore assez nombreuses pour qu'un
    ordre entre acteurs veuille dire quelque chose.
  -->
  <section class="cadre-lecture">
    <h2>Le classement n'est pas encore publiable</h2>
    <p>
      Un classement suppose assez de matière pour que l'ordre entre les acteurs dise quelque chose.
      Le seuil retenu est de {Math.round(seuilCouverture * 100)} % des affirmations documentées pour au
      moins {seuilActeursMin} acteurs. Aujourd'hui,
      {acteursAuSeuil}
      {acteursAuSeuil > 1 ? "acteurs atteignent" : "acteur atteint"} ce seuil sur les {classement.questionsApplicables}
      affirmations auxquelles vous avez répondu.
    </p>
    <p>
      Afficher un ordre dans cet état reviendrait à classer des acteurs sur ce qui a été codé en
      premier, pas sur ce qu'ils défendent. La <a href="/methodologie">méthodologie</a> décrit l'avancement
      du codage et ce qui reste à documenter.
    </p>
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

  <!--
    LA BASCULE EST EN TÊTE, pas dans un réglage. Elle change les chiffres
    affichés : la cacher reviendrait à présenter un résultat dont le lecteur
    ignore le mode de calcul.
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
        <h3 class="nom">{resultat.nom}</h3>
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

  .nom {
    margin: var(--pas-1) 0 var(--pas-1);
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
  .adequation {
    display: block;
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
