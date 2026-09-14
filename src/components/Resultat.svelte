<!--
  Écran de résultat.

  CE QUI EST INTERDIT ICI, et pourquoi :

    - AUCUN POURCENTAGE. Un « 87 % de proximité » se lit comme une mesure, alors
      que c'est une moyenne d'accords sur un questionnaire que nous avons écrit.
      Trois qualifications suffisent, et elles disent leur propre imprécision.
      Si un chiffre apparaît un jour, il doit être accompagné de sa couverture.
    - AUCUNE COULEUR DE DIFFÉRENCIATION. Toutes les barres sont dans la même
      encre, à opacité constante. Seules la longueur et le rang varient. Une
      intensité qui varie ferait passer une proximité pour une adhésion.
    - AUCUN VAINQUEUR UNIQUE. On affiche les acteurs de rang 1 à 3, jamais « le
      vôtre ». Les ex æquo partagent leur rang.
    - AUCUN `style=""`. La géométrie des barres passe par l'attribut `width` de
      `<rect>`, qui est un attribut de présentation SVG, pas du CSS en ligne :
      la CSP hachée le bloquerait.

  Le cadre d'interprétation est en tête et au corps du texte, pas en note de bas
  de page. Un avertissement qu'il faut chercher n'avertit personne.
-->
<script lang="ts">
  import { calculer, type Classement, type ResultatActeur } from "../lib/moteur";
  import { lireEtat, effacerEtat, type Reponse } from "../lib/session-test";
  import type { PoliticalActor, Stance } from "../lib/modele";
  import type { QuestionAffichee } from "../lib/projection";

  /*
   * Tout arrive en propriété, projeté côté serveur. Le composant n'importe aucun
   * module de données : `direction` ne doit se trouver ni dans le HTML ni dans
   * ce bundle.
   */
  type Proprietes = {
    questions: readonly QuestionAffichee[];
    acteurs: readonly PoliticalActor[];
    positions: readonly Stance[];
    avertissement: string;
  };
  const { questions, acteurs, positions, avertissement }: Proprietes = $props();

  let reponses = $state<Record<string, Reponse>>({});
  let charge = $state(false);

  $effect(() => {
    reponses = lireEtat().reponses;
    charge = true;
  });

  const classement = $derived<Classement>(calculer({ questions, acteurs, positions, reponses }));

  const aRepondu = $derived(classement.questionsApplicables > 0);
  /** Rangs 1 à 3. Les ex æquo peuvent donc en faire plus de trois. */
  const tete = $derived(classement.acteurs.filter((resultat) => resultat.rang <= 3));

  const textesQuestions = new Map(questions.map((q) => [q.id, q.texte]));

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

  /**
   * Trois qualifications, jamais un chiffre.
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

  /** Longueur de barre, dans le repère du viewBox. Jamais affichée en chiffre. */
  function longueur(score: number): number {
    return Math.max(1, Math.round(score * 100));
  }

  function recommencer() {
    effacerEtat();
    window.location.assign("/test");
  }
</script>

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
{:else if charge}
  <p class="avertissement-factice">{avertissement}</p>

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

        <p class="couverture">
          Documenté sur {resultat.couverture.documentees} des {resultat.couverture.applicables} questions
          auxquelles vous avez répondu, dont {resultat.couverture.solides} appuyées sur des sources autres
          qu'une inférence.
        </p>

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
                  <p class="ligne">
                    {#if detail.positionActeur === null}
                      Position inconnue.
                    {:else}
                      Position : {LIBELLES_REPONSE[detail.positionActeur]}.
                    {/if}
                    <span class="origine">Origine : {detail.niveauLibelle}.</span>
                  </p>
                </li>
              {/each}
            </ul>
          {/each}
        </details>
      </li>
    {/each}
  </ol>

  <p class="effacer">
    <button class="lien" type="button" onclick={recommencer}>Effacer mes réponses</button>
  </p>
{/if}

<style>
  /* Les tokens viennent de src/styles/base.css. DESIGN_SYSTEM.md fait foi. */

  .avertissement-factice,
  .reserve {
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
    border-left: 3px solid var(--couleur-signature);
    padding-left: var(--pas-3);
    margin: 0 0 var(--pas-4);
  }

  .cadre-lecture {
    margin-block: var(--pas-5);
  }

  .cadre-lecture h2 {
    margin-top: 0;
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
   * signature est réservée à ce sur quoi on agit : un score n'est pas cliquable,
   * et le teinter reviendrait à faire d'une proximité une adhésion.
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

  .couverture,
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

  .origine {
    display: block;
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
