#!/bin/bash
# Crée le worktree d'un lot du design system, prêt à travailler (CLAUDE.md § Git ; même convention que le back et le
# hub, apps/supabase/scripts/ et apps/hub/scripts/).
#
#   apps/packages/ds/scripts/worktree-nouveau.sh <nom> [--sans-installation]
#
# - branche `lot/<nom>` tirée de origin/main à jour ;
# - worktree dans apps/packages/ds-worktrees/<nom> (le repo du DS entier : on y lance npm, la vitrine, les gardes) ;
# - rien à recopier hors git : le DS n'a pas de fichier d'environnement ;
# - installe les dépendances (`npm ci` du paquet puis de la vitrine, le lock de main) et dit la version du paquet ;
#   `--sans-installation` saute cette étape.
set -euo pipefail

NOM="${1:-}"; OPTION="${2:-}"
if ! [[ "$NOM" =~ ^[a-z0-9][a-z0-9-]{1,40}$ ]]; then
  echo "Usage : worktree-nouveau.sh <nom> [--sans-installation]   (minuscules, chiffres et tirets, ex. admin-retouches)"; exit 1
fi
PRINCIPAL="$(cd "$(dirname "$0")/.." && git rev-parse --show-toplevel)"   # le dossier d'où le script est lancé
COMMUN="$(cd "$PRINCIPAL" && cd "$(git rev-parse --git-common-dir)" && pwd)"
PRINCIPAL="$(dirname "$COMMUN")"                                           # → apps/packages/ds, le dossier principal
PAQUETS="$(dirname "$PRINCIPAL")"
WT="$PAQUETS/ds-worktrees/$NOM"
BRANCHE="lot/$NOM"

if [ -e "$WT" ]; then echo "$WT existe déjà : choisis un autre nom, ou termine l'ancien avec worktree-fin.sh $NOM."; exit 1; fi
if git -C "$PRINCIPAL" show-ref --verify --quiet "refs/heads/$BRANCHE"; then echo "La branche $BRANCHE existe déjà."; exit 1; fi

echo "── Mise à jour de origin/main"
git -C "$PRINCIPAL" fetch --quiet origin main
echo "   origin/main : $(git -C "$PRINCIPAL" log -1 --format='%h %s' origin/main | cut -c1-100)"

echo "── Worktree $WT, branche $BRANCHE"
mkdir -p "$PAQUETS/ds-worktrees"
git -C "$PRINCIPAL" worktree add --quiet -b "$BRANCHE" "$WT" origin/main

if [ "$OPTION" = "--sans-installation" ]; then
  echo "── Dépendances : pas installées (--sans-installation) ; à faire : cd \"$WT\" && npm ci && npm ci --prefix demo"
else
  echo "── Dépendances (npm ci du paquet et de la vitrine, journal dans $WT/npm-ci.log)"
  if (cd "$WT" && npm ci --no-audit --no-fund > npm-ci.log 2>&1 && npm ci --prefix demo --no-audit --no-fund >> npm-ci.log 2>&1); then
    echo "   installées ; @yunary/ds $(cd "$WT" && node -p "require('./package.json').version")"
  else
    echo "   ✗ npm ci a échoué : voir $WT/npm-ci.log"; exit 1
  fi
fi

cat <<FIN
── Prêt.
   Travaille seulement dans : $WT
   Branche                  : $BRANCHE
   Vérifs                   : npm run lint · npm run build · npm run demo:build (depuis le worktree)
   Fusion et tag            : par le chef de chantier, avec le verrou (scripts/verrou.sh), depuis main.
   À la fin, une fois fusionné : apps/packages/ds/scripts/worktree-fin.sh $NOM (depuis le dossier principal)
FIN
