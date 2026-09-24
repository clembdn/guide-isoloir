/**
 * La scène de l'urne, sur l'accueil.
 *
 * La démo du test tourne seule, en CSS. Quand la scène arrive à l'écran, elle
 * s'épingle, la démo s'arrête sur la carte qu'on lisait, et c'est le
 * défilement qui fait tomber cette carte dans l'urne.
 *
 * CE QUE FAIT CE SCRIPT, ET RIEN DE PLUS. La chute elle-même est une animation
 * CSS liée au défilement (`animation-timeline: --scene`) : fluide, et sans
 * calcul à chaque image. Le script ne fait que ce que le CSS ne sait pas faire :
 *
 *   1. décider si la scène a lieu — le navigateur doit savoir lier une
 *      animation au défilement, « réduire les animations » ne doit pas être
 *      demandé, et la scène doit tenir dans la hauteur de l'écran ;
 *   2. arrêter la boucle et savoir QUELLE carte est devant à cet instant ;
 *   3. mesurer la distance entre la carte et la fente de l'urne.
 *
 * Sans ce script, il n'y a ni urne ni épinglage : la démo tourne, et c'est
 * tout. Aucune donnée ne sort, aucune requête n'est faite.
 */

/** Cycle de la boucle CSS `demo-pile`, et durée de chaque fenêtre. */
const FENETRE = 3_500;
/** Au-delà, la carte de devant est déjà en train de sortir : on s'arrête sur la suivante. */
const DEBUT_SORTIE = 2_900;
/** Arrêt dans la fenêtre, loin de ses bords : la carte est immobile, pleine. */
const ARRET = 400;

/** Géométrie de l'urne, dans le repère de son `viewBox` (200 × 150). */
const URNE_LARGEUR = 200;
const FENTE_CENTRE_Y = 20;
const FENTE_LARGEUR = 100;

/** Progression de la piste où la boucle s'arrête, et où elle reprend. */
const SEUIL_ARRET = 0.03;
const SEUIL_REPRISE = 0.01;

export function monterSceneUrne(racine: HTMLElement): void {
  const scene = racine.querySelector<HTMLElement>("[data-scene]");
  const collante = scene?.querySelector<HTMLElement>(".scene-collante");
  const demo = racine.querySelector<HTMLElement>(".demo");
  const pile = racine.querySelector<HTMLElement>(".demo-pile");
  const urne = racine.querySelector<HTMLElement>("[data-urne]");
  if (!scene || !collante || !demo || !pile || !urne) return;

  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduit.matches || !CSS.supports("view-timeline-name", "--scene")) return;

  const cartes = [...pile.querySelectorAll<HTMLElement>(".demo-carte")];
  let active = false;
  let figee = false;

  const animationsBoucle = () =>
    demo
      .getAnimations({ subtree: true })
      .filter(
        (animation): animation is CSSAnimation =>
          animation instanceof CSSAnimation && animation.animationName === "demo-pile",
      );

  function figer() {
    const animations = animationsBoucle();
    const reference = animations.find((animation) => animation.animationName === "demo-pile");
    const temps = Number(reference?.currentTime ?? 0);
    let fenetre = Math.floor(temps / FENETRE);
    if (temps % FENETRE > DEBUT_SORTIE) fenetre += 1;

    // Toutes les animations de la boucle partagent la même origine : les
    // replacer au même instant les garde synchrones.
    for (const animation of animations) animation.currentTime = fenetre * FENETRE + ARRET;
    demo!.classList.add("demo--figee");
    cartes[fenetre % cartes.length]?.classList.add("est-devant");
    // La suivante sort de la boucle : elle montera, liée au défilement.
    cartes[(fenetre + 1) % cartes.length]?.classList.add("est-suivante");
    figee = true;
  }

  function relancer() {
    const suivante = cartes.find((carte) => carte.classList.contains("est-suivante"));
    const reference = animationsBoucle().find(
      (animation) => animation.animationName === "demo-pile",
    );
    const temps = reference?.currentTime ?? null;

    for (const carte of cartes) carte.classList.remove("est-devant", "est-suivante");
    demo!.classList.remove("demo--figee");
    figee = false;

    // Rendue à la boucle, la carte y rentre avec une animation neuve, partie
    // de zéro : on la recale sur les autres.
    if (suivante && temps !== null) {
      for (const animation of suivante.getAnimations()) {
        if (animation instanceof CSSAnimation && animation.animationName === "demo-pile") {
          animation.currentTime = temps;
        }
      }
    }
  }

  /*
   * Les distances de la chute. Mesurées sur la pile et sur le cadre de l'urne,
   * qui ne sont jamais transformés eux-mêmes : seuls la carte et le dessin de
   * l'urne bougent, et on ne mesure ni l'un ni l'autre.
   */
  function mesurer() {
    const carte = pile!.getBoundingClientRect();
    const cadre = urne!.getBoundingClientRect();
    const ratio = cadre.width / URNE_LARGEUR;
    const fenteY = cadre.top + FENTE_CENTRE_Y * ratio;
    const echelle = Math.min(1, (FENTE_LARGEUR * ratio * 0.92) / carte.width);
    const demiHauteur = (carte.height * echelle) / 2;
    const centre = carte.top + carte.height / 2;

    // En haut : le bas de la carte réduite effleure la fente. En bas : elle est passée dessous.
    scene!.style.setProperty("--chute-haut", `${fenteY - demiHauteur - 4 - centre}px`);
    scene!.style.setProperty("--chute-bas", `${fenteY + demiHauteur + 8 - centre}px`);
    scene!.style.setProperty("--chute-echelle", String(echelle));
  }

  /** Avancement dans la plage où la scène est épinglée, de 0 à 1. */
  function progression() {
    const boite = scene!.getBoundingClientRect();
    const course = boite.height - window.innerHeight;
    return course > 0 ? -boite.top / course : 0;
  }

  function suivre() {
    if (!active) return;
    const avancement = progression();
    if (!figee && avancement > SEUIL_ARRET) figer();
    else if (figee && avancement < SEUIL_REPRISE) relancer();
  }

  /* La scène ne s'installe que si elle tient à l'écran ; sinon, la démo seule. */
  function evaluer() {
    racine.classList.add("scene-active");
    const tient = collante!.scrollHeight <= collante!.clientHeight + 1;
    active = tient;
    if (!tient) {
      racine.classList.remove("scene-active");
      relancer();
      return;
    }
    mesurer();
    suivre();
  }

  let image = 0;
  window.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(image);
      image = requestAnimationFrame(suivre);
    },
    { passive: true },
  );

  let redimension = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(redimension);
    redimension = window.setTimeout(evaluer, 150);
  });

  reduit.addEventListener("change", () => {
    if (!reduit.matches) return;
    active = false;
    racine.classList.remove("scene-active");
    relancer();
  });

  evaluer();
}
