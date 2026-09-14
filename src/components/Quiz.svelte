<!--
  Écran de quiz. Une question par écran.

  Trois choses que ce composant ne fait jamais, et qui sont la raison d'être du
  projet plutôt que des détails d'implémentation :

    - il n'émet aucune requête. Aucun `fetch`, aucun formulaire, aucune image
      construite dynamiquement. Les réponses vont dans `sessionStorage` et nulle
      part ailleurs. `tests/e2e/aucune-fuite-de-reponse.spec.ts` le vérifie avec
      des sentinelles ;
    - il n'écrit aucun attribut `style`. La CSP appliquée hache les styles : un
      `style=""` serait purement et simplement bloqué. Toute valeur variable
      passe donc par une classe ou par un élément natif — d'où `<progress>`
      plutôt qu'une barre à largeur calculée ;
    - il n'anime rien quand l'action vient du clavier. Quelqu'un qui enchaîne les
      réponses au clavier perçoit toute animation comme de la latence.
-->
<script lang="ts">
  import { ECHELLE, AVERTISSEMENT_FACTICE } from "../factice/questions-factices";
  import type { QuestionAffichee } from "../lib/projection";
  import {
    SANS_AVIS,
    effacerEtat,
    ecrireEtat,
    estComplet,
    etatVide,
    lireEtat,
    type Reponse,
  } from "../lib/session-test";

  /*
   * Les questions arrivent en propriété, projetées côté serveur. Le composant
   * n'importe pas le module de données : `direction` ne doit se trouver ni dans
   * le HTML ni dans ce bundle.
   */
  type Proprietes = { questions: readonly QuestionAffichee[] };
  const { questions }: Proprietes = $props();

  let indice = $state(0);
  let reponses = $state<Record<string, Reponse>>({});

  /*
   * Modalité de la dernière interaction. Sert uniquement à décider s'il faut
   * animer : au clavier, jamais.
   */
  let modalite: "clavier" | "pointeur" = "pointeur";
  let anime = $state(false);

  const question = $derived(questions[indice]);
  const reponseCourante = $derived(question ? reponses[question.id] : undefined);
  const aRepondu = $derived(reponseCourante !== undefined);
  const dernier = $derived(indice === questions.length - 1);
  const ids = $derived(questions.map((question) => question.id));
  const complet = $derived(estComplet({ version: 0, reponses }, ids));

  /*
   * Reprise. Un état partiel se reprend là où il s'est arrêté : recharger la
   * page ne doit pas coûter le travail déjà fait.
   *
   * Un état COMPLET, en revanche, est effacé : revenir sur /test après avoir vu
   * ses résultats, c'est vouloir recommencer, pas relire la dernière question.
   * C'est la lecture littérale de « état vidé au démarrage d'un nouveau test ».
   */
  $effect(() => {
    const etat = lireEtat();
    if (estComplet(etat, ids)) {
      effacerEtat();
      reponses = {};
      indice = 0;
    } else {
      reponses = etat.reponses;
      const premierSansReponse = ids.findIndex((id) => !(id in etat.reponses));
      indice = premierSansReponse === -1 ? 0 : premierSansReponse;
    }
  });

  function enregistrer(id: string, valeur: Reponse) {
    reponses = { ...reponses, [id]: valeur };
    ecrireEtat({ ...etatVide(), reponses });
  }

  function avancer() {
    if (!aRepondu || dernier) return;
    anime = modalite === "pointeur";
    indice += 1;
  }

  function reculer() {
    if (indice === 0) return;
    anime = modalite === "pointeur";
    indice -= 1;
  }

  function toutEffacer() {
    effacerEtat();
    reponses = {};
    anime = false;
    indice = 0;
  }

  /** Entrée dans le groupe de réponses : passe à la question suivante. */
  function raccourciEntree(evenement: KeyboardEvent) {
    if (evenement.key !== "Enter" || !aRepondu || dernier) return;
    evenement.preventDefault();
    modalite = "clavier";
    avancer();
  }
</script>

<svelte:window
  onkeydown={() => (modalite = "clavier")}
  onpointerdown={() => (modalite = "pointeur")}
/>

<!--
  La première question est rendue par le serveur, donc lisible avant même que
  l'îlot s'hydrate et présente dans le HTML statique.
  
  On ne l'attend PAS derrière `pret`. Le faire évitait un bref saut de la
  question 1 vers la question reprise, mais au prix d'un écran vide sans
  JavaScript — ce que CLAUDE.md interdit. Le saut ne concerne que la reprise
  d'un test interrompu, et il dure le temps d'une hydratation ; le vide, lui,
  concernait tout le monde.
-->
{#if question}
  <div class="quiz">
    <p class="avertissement-factice">{AVERTISSEMENT_FACTICE}</p>

    <div class="progression">
      <p class="progression-texte" aria-live="polite">
        Question {indice + 1} sur {questions.length}
      </p>
      <progress class="progression-barre" value={indice + 1} max={questions.length}></progress>
    </div>

    {#key indice}
      <div class="ecran" data-anime={anime ? "oui" : "non"}>
        <fieldset class="groupe">
          <legend class="affirmation">{question.texte}</legend>

          <div class="choix" onkeydown={raccourciEntree} role="none">
            {#each ECHELLE as position (position.valeur)}
              <label class="reponse">
                <input
                  type="radio"
                  name={`reponse-${question.id}`}
                  value={position.valeur}
                  checked={reponseCourante === position.valeur}
                  onchange={() => enregistrer(question.id, position.valeur)}
                />
                <span class="reponse-libelle">{position.libelle}</span>
              </label>
            {/each}

            <!--
              « Sans avis » est la sixième réponse du même groupe, mais elle est
              séparée par un filet et son libellé dit autre chose qu'une
              position. Ce n'est pas cosmétique : sa valeur stockée n'est pas un
              nombre, donc aucun calcul ne pourra l'additionner par distraction
              avec le point milieu. Voir src/lib/session-test.ts.
            -->
            <label class="reponse reponse--sans-avis">
              <input
                type="radio"
                name={`reponse-${question.id}`}
                value={SANS_AVIS}
                checked={reponseCourante === SANS_AVIS}
                onchange={() => enregistrer(question.id, SANS_AVIS)}
              />
              <span class="reponse-libelle">Je n'ai pas d'avis sur cette question</span>
            </label>
          </div>
        </fieldset>

        <div class="commandes">
          {#if dernier}
            <a
              class="action"
              class:action--inactive={!complet}
              href="/resultat"
              aria-disabled={!complet}
            >
              Voir mes résultats
            </a>
          {:else}
            <button class="action" type="button" disabled={!aRepondu} onclick={avancer}>
              Question suivante
            </button>
          {/if}

          {#if indice > 0}
            <button class="retour" type="button" onclick={reculer}>Question précédente</button>
          {/if}
        </div>
      </div>
    {/key}

    <p class="effacer">
      <button class="lien" type="button" onclick={toutEffacer}>Effacer mes réponses</button>
    </p>
  </div>
{/if}

<style>
  /*
   * Les tokens viennent de src/styles/base.css. Aucune valeur de couleur, de
   * corps ou d'espacement n'est écrite en dur ici : DESIGN_SYSTEM.md fait foi.
   */

  .quiz {
    margin-block: var(--pas-4);
  }

  .avertissement-factice {
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
    border-left: 3px solid var(--couleur-signature);
    padding-left: var(--pas-3);
    margin: 0 0 var(--pas-5);
  }

  /* Progression discrète : une ligne de texte et un filet de 3 px. */

  .progression {
    margin-bottom: var(--pas-5);
  }

  .progression-texte {
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
    font-variant-numeric: tabular-nums;
    margin: 0 0 var(--pas-1);
  }

  .progression-barre {
    display: block;
    width: 100%;
    height: 3px;
    border: 0;
    appearance: none;
    background: var(--couleur-trait);
    color: var(--couleur-signature);
  }

  .progression-barre::-webkit-progress-bar {
    background: var(--couleur-trait);
  }

  .progression-barre::-webkit-progress-value {
    background: var(--couleur-signature);
  }

  .progression-barre::-moz-progress-bar {
    background: var(--couleur-signature);
  }

  /*
   * Entrée d'écran : 140 ms, `transform` et `opacity` uniquement.
   * `data-anime="non"` quand l'action vient du clavier. La préférence
   * « réduire les animations » est déjà neutralisée globalement par base.css.
   */

  .ecran[data-anime="oui"] {
    animation: entree var(--duree) var(--sortie) both;
  }

  @keyframes entree {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }

  /* Groupe de réponses. Pas de carte, pas d'ombre, pas de rayon sur un bloc. */

  .groupe {
    border: 0;
    padding: 0;
    margin: 0 0 var(--pas-5);
    min-inline-size: 0;
  }

  .affirmation {
    font-size: var(--t-h2);
    font-weight: 600;
    line-height: var(--interligne-titre);
    letter-spacing: -0.018em;
    text-wrap: balance;
    padding: 0;
    margin-bottom: var(--pas-4);
  }

  .choix {
    display: flex;
    flex-direction: column;
    gap: var(--pas-2);
  }

  .reponse {
    display: flex;
    align-items: baseline;
    gap: var(--pas-2);
    padding: var(--pas-2) var(--pas-3);
    border: 1px solid var(--couleur-trait);
    border-radius: var(--rayon-actionnable);
    cursor: pointer;
    transition: border-color var(--duree) var(--sortie);
  }

  /* Le filet et l'écart disent que cette réponse n'est pas sur l'échelle. */
  .reponse--sans-avis {
    margin-top: var(--pas-3);
    border-style: dashed;
  }

  .reponse input {
    /* Accent natif : pas de case redessinée, donc rien à maintenir. */
    accent-color: var(--couleur-signature);
    margin: 0;
    flex: none;
    translate: 0 0.15em;
  }

  .reponse:has(input:checked) {
    border-color: var(--couleur-signature);
    border-width: 2px;
    /* La bordure passe de 1 à 2 px : on compense pour ne pas décaler le texte. */
    padding: calc(var(--pas-2) - 1px) calc(var(--pas-3) - 1px);
  }

  .reponse:has(input:focus-visible) {
    outline: 2px solid var(--couleur-signature);
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    .reponse:hover {
      border-color: var(--couleur-encre-faible);
    }
  }

  .reponse-libelle {
    line-height: 1.35;
  }

  /* Commandes. Une seule action pleine par écran. */

  .commandes {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--pas-3);
  }

  .action {
    display: inline-block;
    background: var(--couleur-aplat);
    color: var(--couleur-sur-aplat);
    font: inherit;
    font-weight: 600;
    text-decoration: none;
    border: 0;
    padding: var(--pas-2) var(--pas-4);
    border-radius: var(--rayon-actionnable);
    cursor: pointer;
    transition: transform var(--duree) var(--sortie);
  }

  .action:active {
    transform: scale(0.98);
  }

  .action:disabled,
  .action--inactive {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }

  .retour,
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
    margin: var(--pas-5) 0 0;
    font-size: var(--t-petit);
  }
</style>
