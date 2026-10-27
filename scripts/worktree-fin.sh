#!/bin/bash
# Termine le worktree d'un lot du design system, une fois le lot fusionné dans main (CLAUDE.md § Git ; même convention
# que le back et le hub).
#
#   apps/packages/ds/scripts/worktree-fin.sh <nom>
#
# Refuse (rien n'est supprimé) si le worktree a des changements non commités, ou si la branche lot/<nom> n'est pas
# entièrement dans origin/main. Sinon : retire le worktree (et ce qu'il garde hors git : node_modules, dist), la
# branche locale (et la distante si elle a été poussée), puis apps/packages/ds-worktrees s'il est vide. Le tag de
# version n'est jamais touché.
set -euo pipefail

NOM="${1:-}"
if ! [[ "$NOM" =~ ^[a-z0-9][a-z0-9-]{1,40}$ ]]; then echo "Usage : worktree-fin.sh <nom>"; exit 1; fi
PRINCIPAL="$(cd "$(dirname "$0")/.." && git rev-parse --show-toplevel)"
COMMUN="$(cd "$PRINCIPAL" && cd "$(git rev-parse --git-common-dir)" && pwd)"
PRINCIPAL="$(dirname "$COMMUN")"
PAQUETS="$(dirname "$PRINCIPAL")"
WT="$PAQUETS/ds-worktrees/$NOM"
BRANCHE="lot/$NOM"

if [ ! -d "$WT" ]; then echo "Pas de worktree $NOM ($WT)."; exit 1; fi
case "$(pwd -P)/" in "$(cd "$WT" && pwd -P)/"*) echo "Lance ce script depuis le dossier principal (apps/packages/ds), pas depuis le worktree."; exit 1 ;; esac
if [ -n "$(git -C "$WT" status --porcelain)" ]; then
  echo "Le worktree a des changements non commités : rien n'est supprimé."; git -C "$WT" status --short | head -20; exit 1
fi
git -C "$PRINCIPAL" fetch --quiet origin main
if ! git -C "$PRINCIPAL" merge-base --is-ancestor "$BRANCHE" origin/main; then
  echo "La branche $BRANCHE n'est pas entièrement dans origin/main : fusionne et pousse d'abord. Rien n'est supprimé."
  git -C "$PRINCIPAL" log --oneline origin/main.."$BRANCHE" | head -10; exit 1
fi

git -C "$PRINCIPAL" worktree remove "$WT"
git -C "$PRINCIPAL" branch -d "$BRANCHE"
if git -C "$PRINCIPAL" ls-remote --exit-code --heads origin "$BRANCHE" >/dev/null 2>&1; then
  git -C "$PRINCIPAL" push --quiet origin --delete "$BRANCHE" && echo "Branche distante $BRANCHE supprimée."
fi
rmdir "$PAQUETS/ds-worktrees" 2>/dev/null || true
git -C "$PRINCIPAL" worktree prune
echo "Worktree $NOM terminé : dossier, branche $BRANCHE retirés."
