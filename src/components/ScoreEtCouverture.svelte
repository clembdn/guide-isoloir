<!--
  Score et couverture, indissociables par construction.

  POURQUOI CE COMPOSANT EXISTE. L'écran de résultat a longtemps interdit tout
  pourcentage, au motif qu'un chiffre se lit comme une mesure alors que c'est
  une moyenne d'accords sur un questionnaire que nous avons écrit nous-mêmes.
  L'interdiction protégeait mal : elle supprimait le chiffre, pas le malentendu,
  et « Proximité forte » se lit tout aussi bien comme un verdict.

  L'interdiction est donc remplacée par une contrainte plus forte, et c'est ce
  fichier qui la porte : LE POURCENTAGE N'EXISTE PAS SÉPARÉMENT DE SA COUVERTURE.
  Il n'y a aucun composant, aucune fonction, aucun gabarit qui sache rendre l'un
  sans l'autre — la seule façon d'afficher un score est d'appeler ceci, et ceci
  rend toujours la phrase entière :

      72 % · documenté sur 18 des 24 affirmations · dont 11 héritées

  Un développeur pressé ne peut pas « juste afficher le score » : il n'y a rien
  à appeler pour ça. C'est une garantie de structure, pas une consigne de revue.

  PLANCHER. Sous `PLANCHER_POURCENTAGE` de couverture, aucun pourcentage n'est
  rendu, seulement le nombre d'affirmations documentées. Un « 91 % » calculé sur
  trois cases est un chiffre juste et une information fausse, et l'accompagner de
  sa couverture ne suffit pas à le rattraper : à ce niveau-là, le chiffre ne doit
  pas exister.

  `tests/e2e/resultat.spec.ts` vérifie qu'aucun pourcentage n'apparaît sur la
  page sans sa couverture adjacente.
-->
<script lang="ts">
  import type { ResultatActeur } from "../lib/moteur";
  import { PLANCHER_POURCENTAGE } from "../lib/seuils";

  type Proprietes = {
    /**
     * Le résultat ENTIER, jamais un score isolé.
     *
     * Le type est volontairement l'objet complet plutôt qu'un couple de nombres :
     * on ne peut pas construire l'appel sans avoir la couverture sous la main.
     */
    resultat: ResultatActeur;
  };
  const { resultat }: Proprietes = $props();

  const couverture = $derived(resultat.couverture);
  /** Positions reprises d'un autre acteur. Voir `Couverture.personnelles`. */
  const heritees = $derived(couverture.documentees - couverture.personnelles);
  const assezCouvert = $derived(couverture.taux >= PLANCHER_POURCENTAGE);

  /** Entier : une décimale suggérerait une précision que le calcul n'a pas. */
  const pourcentage = $derived(Math.round(resultat.score * 100));
</script>

<p class="score-et-couverture">
  {#if assezCouvert}
    <strong class="chiffre">{pourcentage}&nbsp;%</strong>
    <span class="separateur" aria-hidden="true">&nbsp;·&nbsp;</span>
  {/if}
  <span class="portee">
    documenté sur {couverture.documentees} des {couverture.applicables} affirmation{couverture.applicables >
    1
      ? "s"
      : ""}
    {#if heritees > 0}
      <span class="separateur" aria-hidden="true">&nbsp;·&nbsp;</span> dont {heritees} héritée{heritees >
      1
        ? "s"
        : ""}
    {/if}
  </span>
  {#if !assezCouvert}
    <span class="trop-peu">
      Trop peu documenté pour qu'un pourcentage veuille dire quelque chose.
    </span>
  {/if}
</p>

<!--
  PAS DE BLOC `<style>` ICI, ET C'EST DÉLIBÉRÉ.

  Astro n'émet la feuille scopée d'un composant enfant que s'il est rendu au
  build. `Resultat.svelte` ne rend rien côté serveur, donc ce composant n'était
  jamais instancié et son style disparaissait de `dist/` sans le moindre
  avertissement. Les règles vivent dans `src/styles/base.css`, sous
  « SCORE ET COUVERTURE », qui explique le détour en entier.
-->
