#!/usr/bin/env bash
#
# Veille quotidienne de Guide Isoloir — gratuite, locale, sans IA.
#
# Lancée chaque matin par le minuteur systemd (scripts/veille/systemd/), ou à la
# main : scripts/veille/lancer.sh [--force]
#
#   1. veiller.mjs releve   : ce qui a changé sur les sites des candidats, des
#                             partis et de la presse, et l'état des sources citées ;
#   2. veiller.mjs analyser : lit les nouveautés et y cherche les mots-clés des
#                             24 affirmations du test (data/veille/mots-cles.json) ;
#   3. une notification, et le rapport dans data/veille/etat/rapports/<jour>/.
#
# Il n'écrit rien dans src/data/ et ne commite rien : le rapport dit où lire,
# l'éditeur lit, code et publie. Aucun service payant, aucun jeton : Node,
# pdftotext et le Chromium de Playwright, sur cette machine.

set -euo pipefail

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$RACINE"
export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"

ETAT="$RACINE/data/veille/etat"
mkdir -p "$ETAT/journal"

# Un seul passage à la fois.
exec 9>"$ETAT/verrou"
if ! flock -n 9; then
  echo "Une veille tourne déjà."
  exit 0
fi

# Date de Paris : celle de l'élection.
JOUR="$(TZ=Europe/Paris date +%F)"
exec > >(tee -a "$ETAT/journal/$JOUR.log") 2>&1

notifier() {
  notify-send --app-name="Guide Isoloir" "Veille du $JOUR" "$1" 2>/dev/null || true
}

echo "== Veille du $JOUR, lancée le $(date '+%F %T %Z')"

if [[ "${1:-}" != "--force" && -f "$ETAT/dernier-passage" && "$(cat "$ETAT/dernier-passage")" == "$JOUR" ]]; then
  echo "Passage du $JOUR déjà fait (--force pour relancer)."
  exit 0
fi

# 1. Calendrier : après le second tour, la veille s'arrête.
set +e
node scripts/veille/veiller.mjs gel
GEL=$?
set -e
if [[ $GEL -eq 4 ]]; then
  notifier "Veille terminée : le second tour est passé."
  exit 0
fi

# 2. Réseau. Au réveil d'une mise en veille, la connexion met parfois une minute à
#    revenir. Sans réseau, on sort SANS marquer le jour : le minuteur relancera.
for _ in $(seq 1 30); do
  getent hosts lcp.fr >/dev/null 2>&1 && break
  sleep 10
done
if ! getent hosts lcp.fr >/dev/null 2>&1; then
  echo "Pas de réseau après cinq minutes : passage remis."
  exit 1
fi

# 3. Relevé. Au premier passage, on amorce : l'état est enregistré, et seules les
#    entrées datées d'après les dernières données codées sont signalées.
if [[ -f "$ETAT/empreintes.json" ]]; then
  node scripts/veille/veiller.mjs releve
else
  DEPUIS="$(node --input-type=module -e '
    const { POSITIONS } = await import("./src/data/positions.ts");
    console.log(POSITIONS.map((p) => p.updatedAt).sort().at(-1));
  ')"
  node scripts/veille/veiller.mjs releve --amorcer --depuis "$DEPUIS"
fi

# 4. Lecture des nouveautés et recherche des mots-clés.
SORTIE="$(node scripts/veille/veiller.mjs analyser)"
echo "$SORTIE"
PERTINENTS="$(sed -n 's/^PERTINENTS=//p' <<<"$SORTIE")"

echo "$JOUR" >"$ETAT/dernier-passage"
RAPPORT="data/veille/etat/rapports/$JOUR/rapport.md"
if [[ "${PERTINENTS:-0}" -gt 0 ]]; then
  notifier "$PERTINENTS document(s) touchent une affirmation du test. Rapport : $RAPPORT"
else
  notifier "Rien qui touche une affirmation du test aujourd'hui. Rapport : $RAPPORT"
fi
echo "== Fin du passage du $JOUR"
