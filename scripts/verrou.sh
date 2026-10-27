#!/bin/bash
# Le verrou de fusion et de tag du design system : une fusion et une version à la fois (CLAUDE.md § Git ; même
# convention que le back et le hub, apps/supabase/scripts/verrou.sh, apps/hub/scripts/verrou.sh).
#
#   apps/packages/ds/scripts/verrou.sh etat
#   apps/packages/ds/scripts/verrou.sh prendre <nom> [--attendre]   # --attendre : revérifie toutes les minutes
#   apps/packages/ds/scripts/verrou.sh rendre <nom>
#
# Le verrou est un fichier dans le dossier git commun à tous les worktrees du DS (apps/packages/ds/.git), jamais
# commité : qui fusionne ou tague (nom du lot, branche, dossier) et depuis quand. Prise atomique (noclobber). Un verrou
# de plus de 45 minutes est signalé (à dire à Julien), jamais forcé ni supprimé par ce script. Sortie : 0 pris ou
# rendu, 2 pris par une autre session, 1 erreur.
set -uo pipefail

ACTION="${1:-}"; NOM="${2:-}"; OPTION="${3:-}"
COMMUN="$(cd "$(dirname "$0")/.." && cd "$(git rev-parse --git-common-dir)" && pwd)"
VERROU="$COMMUN/yunary-deploiement.verrou"
VIEUX_S=$((45 * 60))

age_s() { echo $(( $(date +%s) - $(stat -f %m "$VERROU" 2>/dev/null || date +%s) )); }
decrire() {
  local a; a="$(age_s)"
  echo "Verrou pris : $(tr '\n' ' ' < "$VERROU")(depuis $((a / 60)) min)"
  if [ "$a" -gt "$VIEUX_S" ]; then echo "⚠ Verrou vieux de plus de 45 minutes : à signaler à Julien. Ne jamais le forcer ni le supprimer."; fi
}
prendre_une_fois() {
  if ( set -o noclobber; printf 'session=%s\nbranche=%s\ndossier=%s\ndepuis=%s\n' "$NOM" \
        "$(git -C "$(pwd)" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')" "$(pwd)" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$VERROU" ) 2>/dev/null; then
    echo "Verrou pris par $NOM."; return 0
  fi
  return 2
}

case "$ACTION" in
  etat)
    if [ -f "$VERROU" ]; then decrire; else echo "Verrou libre."; fi ;;
  prendre)
    [[ "$NOM" =~ ^[a-z0-9][a-z0-9-]{1,40}$ ]] || { echo "Usage : verrou.sh prendre <nom> [--attendre]"; exit 1; }
    if prendre_une_fois; then exit 0; fi
    if [ "$(sed -n 's/^session=//p' "$VERROU")" = "$NOM" ]; then echo "Verrou déjà à $NOM."; exit 0; fi
    decrire
    if [ "$OPTION" != "--attendre" ]; then exit 2; fi
    signale=0
    while true; do
      sleep 60
      if prendre_une_fois; then exit 0; fi
      if [ "$signale" = 0 ] && [ "$(age_s)" -gt "$VIEUX_S" ]; then decrire; signale=1; fi
    done ;;
  rendre)
    [[ "$NOM" =~ ^[a-z0-9][a-z0-9-]{1,40}$ ]] || { echo "Usage : verrou.sh rendre <nom>"; exit 1; }
    if [ ! -f "$VERROU" ]; then echo "Verrou déjà libre."; exit 0; fi
    if [ "$(sed -n 's/^session=//p' "$VERROU")" != "$NOM" ]; then decrire; echo "Ce n'est pas le verrou de $NOM : il n'est pas rendu."; exit 2; fi
    rm -f "$VERROU" && echo "Verrou rendu par $NOM." ;;
  *)
    echo "Usage : verrou.sh etat | prendre <nom> [--attendre] | rendre <nom>"; exit 1 ;;
esac
