/**
 * Carrousel des cartes « Comprendre », sur téléphone.
 *
 * Il avance seul et sans fin : sans cela, le dernier article de la rangée
 * serait, de fait, le moins lu. Sur grand écran, la grille montre tout et ce
 * script ne fait rien de visible.
 *
 * LA BOUCLE SANS FIN tient à des copies : les deux dernières cartes avant la
 * première, les deux premières après la dernière. Quand le défilement s'arrête
 * sur une copie, on saute sans animation sur l'originale, identique au pixel
 * près. DEUX de chaque côté, parce que la carte en cours est centrée : avec
 * une seule, la copie centrée n'avait pas de voisine, un vide apparaissait à
 * droite puis se comblait d'un coup au saut — c'était l'à-coup entre le
 * dernier article et le premier. Les copies sont `inert` et `aria-hidden` : ni
 * le clavier ni un lecteur d'écran ne les rencontrent.
 *
 * LA CARTE EN COURS porte `.est-active`, et ses copies aussi : au saut d'une
 * copie vers l'originale, la mise en avant est déjà là, rien ne se rejoue.
 *
 * LE RYTHME N'EST PAS UNE MINUTERIE JAVASCRIPT. C'est la fin de l'animation
 * CSS du point en cours — celle qui le remplit — qui fait avancer : la barre
 * et le défilement ne peuvent pas se désynchroniser, et mettre l'animation en
 * pause met le carrousel en pause.
 *
 * WCAG 2.2.2 : un contenu qui bouge seul plus de cinq secondes doit pouvoir
 * être arrêté. Le bouton l'arrête ; le survol, le focus clavier, le doigt
 * posé, un onglet caché ou une rangée hors de l'écran le suspendent. Avec
 * « réduire les animations », il n'avance jamais seul.
 */

/** Délai avant de reprendre après un glissement au doigt. */
const REPRISE_APRES_DOIGT = 4_000;
/** Copies de chaque côté de la rangée. */
const COPIES = 2;

export function monterCarrousel(racine: HTMLElement): void {
  const piste = racine.querySelector<HTMLElement>("[data-carrousel-piste]");
  const commandes = racine.querySelector<HTMLElement>("[data-carrousel-commandes]");
  const bouton = racine.querySelector<HTMLButtonElement>("[data-carrousel-pause]");
  const points = [...racine.querySelectorAll<HTMLButtonElement>("[data-carrousel-point]")];
  const originaux = [...racine.querySelectorAll<HTMLElement>("[data-carrousel-item]")];
  if (!piste || !commandes || !bouton || originaux.length <= COPIES) return;

  const nombre = originaux.length;
  const etroit = window.matchMedia("(max-width: 45.99rem)");
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");

  const copier = (item: HTMLElement) => {
    const copie = item.cloneNode(true) as HTMLElement;
    copie.removeAttribute("data-carrousel-item");
    copie.classList.add("carte-copie");
    copie.setAttribute("aria-hidden", "true");
    copie.inert = true;
    return copie;
  };
  piste.prepend(...originaux.slice(-COPIES).map(copier));
  piste.append(...originaux.slice(0, COPIES).map(copier));
  commandes.hidden = false;

  /* Rang dans la rangée complète (copies comprises) → rang de l'article. */
  const rangArticle = (rang: number) => (((rang - COPIES) % nombre) + nombre) % nombre;
  const elements = () => [...piste.children] as HTMLElement[];
  /* Position de défilement qui CENTRE la carte dans la rangée. */
  const position = (element: HTMLElement) =>
    element.offsetLeft - (piste.clientWidth - element.offsetWidth) / 2;

  function plusProche() {
    let meilleur = 0;
    let ecart = Infinity;
    elements().forEach((element, rang) => {
      const distance = Math.abs(position(element) - piste!.scrollLeft);
      if (distance < ecart) {
        ecart = distance;
        meilleur = rang;
      }
    });
    return meilleur;
  }

  /*
   * Pendant un défilement lancé par le script, la rangée passe par les cartes
   * intermédiaires — et, au premier instant, est encore sur celle de départ.
   * Les suivre ferait clignoter les points : on attend l'arrêt.
   */
  let enRoute = false;

  function aller(rang: number, doux: boolean) {
    const element = elements()[rang];
    if (!element) return;
    enRoute = doux && !reduit.matches;
    piste!.scrollTo({
      left: position(element),
      behavior: doux && !reduit.matches ? "smooth" : "instant",
    });
  }

  const raisons = new Set<string>();
  const avanceSeul = () => etroit.matches && !reduit.matches;
  let courant = 0;

  function relancerMinuterie() {
    for (const point of points) point.classList.remove("en-cours");
    if (!avanceSeul() || raisons.has("bouton")) return;
    const point = points[courant];
    if (!point) return;
    // Relire la largeur force le navigateur à oublier l'animation retirée.
    void point.offsetWidth;
    point.classList.add("en-cours");
  }

  function marquer(article: number) {
    courant = article;
    points.forEach((point, rang) => {
      if (rang === article) point.setAttribute("aria-current", "true");
      else point.removeAttribute("aria-current");
    });
    elements().forEach((element, rang) => {
      element.classList.toggle("est-active", rangArticle(rang) === article);
    });
    relancerMinuterie();
  }

  function suspendre(raison: string, oui: boolean) {
    if (oui) raisons.add(raison);
    else raisons.delete(raison);
    racine.classList.toggle("carrousel--pause", raisons.size > 0);
  }

  /* ─── Avancer ─────────────────────────────────────────────────────────── */

  for (const point of points) {
    point.addEventListener("animationend", (evenement) => {
      if (evenement.animationName !== "carrousel-minuterie") return;
      if (raisons.size > 0 || !avanceSeul()) return;
      const suivant = plusProche() + 1;
      marquer(rangArticle(suivant));
      aller(suivant, true);
    });
  }

  points.forEach((point, article) => {
    point.addEventListener("click", () => {
      marquer(article);
      aller(article + COPIES, true);
    });
  });

  /* ─── Suivre le défilement, et boucler ────────────────────────────────── */

  let repos = 0;
  piste.addEventListener(
    "scroll",
    () => {
      if (!enRoute) {
        const article = rangArticle(plusProche());
        if (article !== courant) marquer(article);
      }

      window.clearTimeout(repos);
      repos = window.setTimeout(() => {
        enRoute = false;
        const rang = plusProche();
        const article = rangArticle(rang);
        if (article !== courant) marquer(article);
        // Arrêté sur une copie : on saute sur l'originale, sans animation.
        if (rang < COPIES) aller(rang + nombre, false);
        else if (rang >= nombre + COPIES) aller(rang - nombre, false);
      }, 120);
    },
    { passive: true },
  );

  /* ─── Suspendre ───────────────────────────────────────────────────────── */

  bouton.addEventListener("click", () => {
    const arrete = bouton.getAttribute("aria-pressed") !== "true";
    bouton.setAttribute("aria-pressed", String(arrete));
    bouton.setAttribute(
      "aria-label",
      arrete ? "Reprendre le défilement automatique" : "Arrêter le défilement automatique",
    );
    suspendre("bouton", arrete);
    relancerMinuterie();
  });

  piste.addEventListener("mouseenter", () => suspendre("survol", true));
  piste.addEventListener("mouseleave", () => suspendre("survol", false));
  piste.addEventListener("focusin", () => suspendre("focus", true));
  piste.addEventListener("focusout", (evenement) => {
    if (!piste.contains(evenement.relatedTarget as Node | null)) suspendre("focus", false);
  });

  let doigt = 0;
  piste.addEventListener("pointerdown", () => {
    enRoute = false;
    window.clearTimeout(doigt);
    suspendre("doigt", true);
  });
  const leverDoigt = () => {
    window.clearTimeout(doigt);
    doigt = window.setTimeout(() => suspendre("doigt", false), REPRISE_APRES_DOIGT);
  };
  piste.addEventListener("pointerup", leverDoigt);
  piste.addEventListener("pointercancel", leverDoigt);

  document.addEventListener("visibilitychange", () => suspendre("cache", document.hidden));
  new IntersectionObserver(([entree]) => suspendre("hors-champ", !entree?.isIntersecting), {
    threshold: 0.6,
  }).observe(racine);

  /* ─── Démarrer, et suivre les changements de contexte ─────────────────── */

  function installer() {
    bouton!.hidden = reduit.matches;
    if (etroit.matches) aller(courant + COPIES, false);
    marquer(courant);
  }

  etroit.addEventListener("change", installer);
  reduit.addEventListener("change", installer);
  installer();
}
