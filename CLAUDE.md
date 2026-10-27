# CLAUDE.md — @yunary/ds

Complète `../../../CLAUDE.md` (racine), qui s'applique intégralement ici. Ne le contredit jamais. Gouvernance et publication → `GOVERNANCE.md`.

## 🌿 Git

Un lot = une branche `lot/<nom>` et un worktree de ce repo ; la session y commite, sans fusionner dans `main` ni déployer. Branches, worktrees, fusion : `../../../pilotage/CHEF-DE-CHANTIER.md` § Branches et worktrees et `../../../CLAUDE.md` § Git. Tag seulement quand la version est prête à être consommée ; séquence de version → `GOVERNANCE.md`.

Les scripts du lot, dans `scripts/` (même convention que le back et le hub) :
- `scripts/worktree-nouveau.sh <nom> [--sans-installation]` : branche `lot/<nom>` tirée de `origin/main` à jour, worktree `apps/packages/ds-worktrees/<nom>`, puis `npm ci` du paquet et de la vitrine (journal `npm-ci.log`, ignoré par git) ; le DS n'a aucun fichier d'environnement à recopier ;
- `scripts/verrou.sh etat | prendre <nom> [--attendre] | rendre <nom>` : une fusion et un tag à la fois ; le verrou est un fichier du dossier git commun (`apps/packages/ds/.git/yunary-deploiement.verrou`), jamais commité ; un verrou de plus de 45 minutes se signale à Julien, jamais forcé ;
- `scripts/worktree-fin.sh <nom>`, depuis le dossier principal, une fois le lot fusionné et poussé : retire le worktree et la branche (locale et distante) ; refuse s'il reste un changement non commité ou si la branche n'est pas entièrement dans `origin/main` ; un nom inconnu répond « Pas de worktree <nom> ».
