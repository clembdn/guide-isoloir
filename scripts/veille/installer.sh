#!/usr/bin/env bash
#
# Installe (ou retire) le minuteur systemd de la veille quotidienne.
#
#   scripts/veille/installer.sh              installe et active
#   scripts/veille/installer.sh --retirer    désactive et supprime
#
# À lancer par l'éditeur, une fois, après un passage à blanc réussi
# (scripts/veille/lancer.sh --force). Vérifiez d'abord que l'horloge est
# synchronisée : `timedatectl` doit dire « System clock synchronized: yes »
# (sinon : sudo timedatectl set-ntp true).

set -euo pipefail

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CIBLE="$HOME/.config/systemd/user"
NOMS=(guide-isoloir-veille.service guide-isoloir-veille.timer)

if [[ "${1:-}" == "--retirer" ]]; then
  systemctl --user disable --now guide-isoloir-veille.timer 2>/dev/null || true
  for nom in "${NOMS[@]}"; do rm -f "$CIBLE/$nom"; done
  systemctl --user daemon-reload
  echo "Minuteur de la veille retiré."
  exit 0
fi

if ! timedatectl show -p NTPSynchronized --value 2>/dev/null | grep -q yes; then
  echo "Attention : l'horloge n'est pas synchronisée. La veille date chaque source :"
  echo "lancez « sudo timedatectl set-ntp true » avant de compter sur elle."
fi

mkdir -p "$CIBLE"
for nom in "${NOMS[@]}"; do
  sed "s|@RACINE@|$RACINE|g" "$RACINE/scripts/veille/systemd/$nom" >"$CIBLE/$nom"
done
systemctl --user daemon-reload
systemctl --user enable --now guide-isoloir-veille.timer
systemctl --user list-timers guide-isoloir-veille.timer --no-pager
echo
echo "Installé. Journal : journalctl --user -u guide-isoloir-veille ; rapports : data/veille/etat/rapports/"
