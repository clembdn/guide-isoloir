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
  import { ECHELLE } from "../lib/echelle";
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
  type Proprietes = {
    questions: readonly QuestionAffichee[];
    /**
     * Avertissement affiché au-dessus de la question, ou `null` quand il n'y a
     * rien à avertir.
     *
     * Passé en propriété et non importé : ce composant ne doit connaître ni
     * `src/factice/` ni `src/data/`. Tant qu'il importait `AVERTISSEMENT_FACTICE`,
     * la chaîne partait dans le bundle servi, et le garde-fou de publication la
     * trouvait — à raison — dans le JavaScript de production.
     */
    avertissement?: string | null;
  };
  const { questions, avertissement = null }: Proprietes = $props();

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

  /**
   * Thèmes dans l'ordre du test, avec les positions de leurs questions.
   *
   * Sert au parcours affiché sur grand écran et à la barre segmentée : on voit
   * où l'on en est DANS LE THÈME, pas seulement sur vingt-quatre. Le découpage
   * se lit dans les questions reçues, il n'est écrit nulle part.
   */
  const themes = $derived.by(() => {
    const liste: { nom: string; indices: number[] }[] = [];
    questions.forEach((q, i) => {
      const theme = liste.find((t) => t.nom === q.theme);
      if (theme) theme.indices.push(i);
      else liste.push({ nom: q.theme, indices: [i] });
    });
    return liste;
  });

  function etatSegment(i: number): "courant" | "fait" | "a-faire" {
    if (i === indice) return "courant";
    const id = questions[i]?.id;
    return id !== undefined && id in reponses ? "fait" : "a-faire";
  }

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

  DEUX COLONNES SUR GRAND ÉCRAN. À gauche, le parcours : les six thèmes et
  leurs quatre questions, cochées au fil des réponses. À droite, la question
  seule. Sur téléphone, le parcours se résume à une barre segmentée par thème.
  Le parcours n'est pas interactif : il ne coûte aucune tabulation.
-->
{#if question}
  <div class="quiz">
    <aside class="parcours" aria-hidden="true">
      <p class="parcours-titre">Votre parcours</p>
      <ol>
        {#each themes as theme (theme.nom)}
          <li class="parcours-theme" class:parcours-theme--courant={theme.indices.includes(indice)}>
            <span class="parcours-nom">{theme.nom}</span>
            <span class="parcours-points">
              {#each theme.indices as i (i)}
                <span class="point point--{etatSegment(i)}"></span>
              {/each}
            </span>
          </li>
        {/each}
      </ol>
    </aside>

    <div class="principal">
      {#if avertissement}
        <p class="avertissement-factice">{avertissement}</p>
      {/if}

      <div class="progression">
        <p class="progression-texte" aria-live="polite">
          Question {indice + 1} sur {questions.length}
        </p>
        <!--
          Le `<progress>` natif porte l'information pour les technologies
          d'assistance ; la barre segmentée, décorative, la montre : un segment
          par question, un écart entre deux thèmes.
        -->
        <progress class="progression-native" value={indice + 1} max={questions.length}></progress>
        <div class="segments" aria-hidden="true">
          {#each themes as theme (theme.nom)}
            <span class="segments-theme">
              {#each theme.indices as i (i)}
                <span class="segment segment--{etatSegment(i)}"></span>
              {/each}
            </span>
          {/each}
        </div>
      </div>

      {#key indice}
        <div class="ecran" data-anime={anime ? "oui" : "non"}>
          <p class="theme-courant">{question.theme}</p>

          <fieldset class="groupe">
            <legend class="affirmation">{question.texte}</legend>

            <!--
              La définition est fermée par défaut : une chose par écran. Elle
              définit un terme, elle n'argumente jamais — voir src/data/questions.ts.
            -->
            <details class="definition">
              <summary>Besoin d'une définition ?</summary>
              <p>{question.infobulle}</p>
            </details>

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
                séparée et tiretée, et son libellé dit autre chose qu'une
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
              <button class="action action--secondaire retour" type="button" onclick={reculer}>
                Question précédente
              </button>
            {/if}
          </div>
        </div>
      {/key}

      <div class="pied-quiz">
        <p class="promesse">
          Vos réponses et vos résultats ne sont jamais envoyés, enregistrés ou associés à un
          identifiant. Le calcul s'effectue exclusivement dans votre navigateur.
        </p>
        <p class="effacer">
          <button class="lien" type="button" onclick={toutEffacer}>Effacer mes réponses</button>
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  /*
   * Les tokens viennent de src/styles/base.css. Aucune valeur de couleur, de
   * corps ou d'espacement n'est écrite en dur ici. `.action` et
   * `.action--secondaire` viennent aussi de base.css : une seule définition des
   * boutons pour tout le site.
   */

  .quiz {
    margin-block: var(--pas-3) var(--pas-5);
  }

  .principal {
    min-width: 0;
  }

  .avertissement-factice {
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
    border-left: 3px solid var(--couleur-signature);
    padding-left: var(--pas-3);
    margin: 0 0 var(--pas-4);
  }

  /* ─── Parcours, grand écran seulement ─────────────────────────────────── */

  .parcours {
    display: none;
  }

  @media (min-width: 64rem) {
    .quiz {
      display: grid;
      grid-template-columns: 15rem minmax(0, 40rem);
      justify-content: center;
      gap: var(--pas-6);
      margin-top: var(--pas-5);
    }

    .parcours {
      display: block;
      position: sticky;
      top: 6.5rem;
      align-self: start;
      padding: var(--pas-3);
      border-radius: var(--rayon-carte);
      background: var(--couleur-surface);
      border: 1px solid var(--couleur-trait);
      box-shadow: var(--ombre-1);
    }
  }

  .parcours-titre {
    margin: 0 0 var(--pas-2);
    font-size: var(--t-petit);
    font-weight: 700;
  }

  .parcours ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .parcours-theme {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: var(--pas-2) 0;
    font-size: var(--t-petit);
    color: var(--couleur-encre-faible);
  }

  .parcours-theme + .parcours-theme {
    border-top: 1px solid var(--couleur-trait);
  }

  .parcours-theme--courant {
    color: var(--couleur-encre);
    font-weight: 600;
  }

  .parcours-points {
    display: flex;
    gap: 5px;
  }

  /* Un point par question : son état est une information, pas un ornement. */
  .point {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--couleur-trait);
  }

  .point--fait {
    background: var(--couleur-signature);
    border-color: var(--couleur-signature);
  }

  .point--courant {
    border-color: var(--couleur-signature);
  }

  /* ─── Progression ─────────────────────────────────────────────────────── */

  .progression {
    margin-bottom: var(--pas-4);
  }

  .progression-texte {
    color: var(--couleur-encre-faible);
    font-size: var(--t-petit);
    font-variant-numeric: tabular-nums;
    margin: 0 0 var(--pas-1);
  }

  .progression-native {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  /* Vingt-quatre segments, groupés par thème : un écart plus large entre deux thèmes. */
  .segments {
    display: flex;
    gap: 6px;
  }

  .segments-theme {
    display: flex;
    flex: 1;
    gap: 2px;
  }

  .segment {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: var(--couleur-trait);
  }

  .segment--fait {
    background: var(--couleur-signature);
  }

  .segment--courant {
    background: var(--couleur-encre);
  }

  /*
   * Entrée d'écran : `transform` et `opacity` uniquement. `data-anime="non"`
   * quand l'action vient du clavier. La préférence « réduire les animations »
   * est déjà neutralisée globalement par base.css.
   */
  .ecran[data-anime="oui"] {
    animation: entree var(--duree) var(--sortie) both;
  }

  @keyframes entree {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }

  /* ─── Question ────────────────────────────────────────────────────────── */

  .theme-courant {
    display: inline-block;
    margin: 0 0 var(--pas-2);
    padding: 4px 12px;
    border-radius: var(--rayon-actionnable);
    background: var(--couleur-surface-2);
    color: var(--couleur-signature);
    font-size: var(--t-petit);
    font-weight: 600;
  }

  .groupe {
    border: 0;
    padding: 0;
    margin: 0 0 var(--pas-4);
    min-inline-size: 0;
  }

  .affirmation {
    font-size: var(--t-h2);
    font-weight: 700;
    line-height: var(--interligne-titre);
    letter-spacing: -0.025em;
    text-wrap: balance;
    padding: 0;
    margin-bottom: var(--pas-2);
  }

  .definition {
    margin-bottom: var(--pas-3);
    font-size: var(--t-petit);
    color: var(--couleur-encre-faible);
  }

  .definition summary {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--couleur-signature);
    font-weight: 600;
    cursor: pointer;
  }

  .definition p {
    margin: 0;
    padding: var(--pas-2) var(--pas-3);
    border-radius: var(--rayon-carte);
    background: var(--couleur-surface-2);
    color: var(--couleur-encre);
  }

  /* ─── Réponses ────────────────────────────────────────────────────────── */

  .choix {
    display: flex;
    flex-direction: column;
    gap: var(--pas-1);
  }

  .reponse {
    display: flex;
    align-items: center;
    gap: var(--pas-2);
    min-height: 54px;
    padding: 0 var(--pas-3);
    border: 1px solid var(--couleur-trait);
    border-radius: var(--rayon-actionnable);
    background: var(--couleur-surface);
    cursor: pointer;
    transition:
      background-color var(--duree) var(--sortie),
      border-color var(--duree) var(--sortie),
      transform var(--duree) var(--sortie);
  }

  .reponse:active {
    transform: scale(0.99);
  }

  /* Le tiret et l'écart disent que cette réponse n'est pas sur l'échelle. */
  .reponse--sans-avis {
    margin-top: var(--pas-2);
    border-style: dashed;
    background: transparent;
  }

  /*
   * LE BOUTON RADIO RESTE NATIF. Seul son dessin change : un anneau, et un
   * point qui apparaît quand il est coché. Il garde tout ce que le navigateur
   * lui donne — le groupe, les flèches, l'annonce par les lecteurs d'écran.
   */
  .reponse input {
    appearance: none;
    flex: none;
    display: grid;
    place-content: center;
    width: 22px;
    height: 22px;
    margin: 0;
    border: 2px solid var(--couleur-encre-faible);
    border-radius: 50%;
    background: var(--couleur-surface);
    cursor: pointer;
  }

  .reponse input::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--couleur-aplat);
    transform: scale(0);
    transition: transform var(--duree) var(--sortie);
  }

  /* Coché : la réponse entière prend l'aplat, comme un bouton enfoncé. */
  .reponse:has(input:checked) {
    background: var(--couleur-aplat);
    border-color: var(--couleur-aplat);
    color: var(--couleur-sur-aplat);
  }

  .reponse input:checked {
    border-color: var(--couleur-sur-aplat);
    background: var(--couleur-sur-aplat);
  }

  .reponse input:checked::before {
    transform: scale(1);
  }

  .reponse input:focus-visible {
    outline: none;
  }

  .reponse:has(input:focus-visible) {
    outline: 2px solid var(--couleur-signature);
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    .reponse:hover:not(:has(input:checked)) {
      border-color: var(--couleur-signature);
      background: var(--couleur-surface-2);
    }
  }

  .reponse-libelle {
    line-height: 1.3;
    font-weight: 500;
  }

  /* ─── Commandes ───────────────────────────────────────────────────────── */

  .commandes {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--pas-2);
  }

  .action:disabled,
  .action--inactive {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
    box-shadow: none;
  }

  /* ─── Pied ────────────────────────────────────────────────────────────── */

  .pied-quiz {
    margin-top: var(--pas-5);
    padding-top: var(--pas-3);
    border-top: 1px solid var(--couleur-trait);
    font-size: var(--t-petit);
    color: var(--couleur-encre-faible);
  }

  .promesse {
    margin: 0 0 var(--pas-1);
  }

  .effacer {
    margin: 0;
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
