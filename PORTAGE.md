# PORTAGE — la fiche à donner à Claude Design

Ce dépôt est un **squelette de design system React**. Il apporte trois choses, et
seulement trois :

1. **L'inventaire** — 37 composants d'interface, leur nom, leur emplacement, leur API.
2. **La vitrine** — 9 pages qui les montrent tous, prête à ouvrir.
3. **Le comportement** — focus, clavier, ARIA, cibles tactiles. La partie qu'on ne voit
   pas sur une maquette et qu'on re-casse à chaque régénération.

Tout le reste — couleurs, typographie, formes, ombres, traitements — **est à toi**.

---

## Ce qui NE CHANGE PAS

| | Pourquoi |
|---|---|
| La **structure des fichiers** | `src/components/<famille>/<Nom>.tsx`. Le point d'entrée et la vitrine importent par ces chemins. |
| La **liste des 37 composants** | C'est l'inventaire. On n'en retire pas, on n'en ajoute pas au portage. |
| La **structure de la vitrine** | 9 pages — une par famille, plus Fondations. On remplace ce qu'elles montrent, pas leur découpage. |
| Le **comportement et l'accessibilité** | Piège de focus, touche Échap, verrou de défilement, restitution du focus, `focus-visible`, rôles ARIA, cibles tactiles 44 px. Invisible sur une maquette, indispensable dans une app. |

## Ce que TU REMPLIS

Tout le visuel, sans exception : palette claire et sombre, polices, échelle
typographique, arrondis, ombres, dégradés, lueurs, densité, et la façon dont chaque
composant est traité (plein ou contour, ombre ou bordure, uni ou dégradé).

**Le dépôt rend dès l'installation.** `src/styles/brand-yunary.css` est la marque livrée,
celle de Yunary. Elle fait s'afficher la vitrine tout de suite, et toutes ses valeurs vivent
dans ce seul fichier : le socle ne porte aucune couleur. **C'est elle que tu remplaces.**

Deux endroits :

- `src/styles/brand-<projet>.css` — **les valeurs.** Copie `brand-yunary.css` sous ce nom
  et repeins chaque valeur — la copie donne les 55 emplacements dans le bon ordre, et comme
  tout est remplacé, rien n'est hérité. Garde le contrat annoté
  `src/styles/brand.template.css` ouvert à côté : il liste chaque jeton et dit ce qu'il
  tient. Puis repointe l'import de `demo/brand-yunary-entry.css` sur ton fichier.
- `src/styles/patterns.css` — **les règles**, si un traitement demande une autre règle et
  pas seulement une autre valeur. Sur un projet client, ce fichier t'appartient.

---

## L'inventaire — 37 composants

Chemin : `src/components/<famille>/<Nom>.tsx` · classes CSS : `src/styles/patterns.css`

| Famille | Composants |
|---|---|
| `actions` | Button · IconButton |
| `brand` | Avatar · Halo · Logo |
| `data-display` | Badge · Card · Pastille · Separator · Table · Tooltip |
| `feedback` | Banner · EmptyState · Progress · Skeleton · SkeletonCard · Spinner · StateCard · Toast |
| `forms` | Calendar · Checkbox · DatePicker · Dropzone · FormField · Input · Radio · Select · Switch · Textarea |
| `icons` | Icon |
| `navigation` | AppShell · Footer · Navbar · Pagination · Sidebar · Tabs |
| `overlays` | Modal *(+ `useModalSurface`, le hook partagé)* |

**Classes sans composant** — la tuile cochable (`.ds-tile`), l'encart de valeur (`.ds-inset`), le
panneau d'écran (`.ds-panel`), le menu déroulant (`.ds-dropdown`) et les motifs des parcours
(`.ds-steps`, `.ds-veil`, `.ds-price`, `.ds-perks`, `.ds-meter`, `.ds-offer`, `.ds-file`,
`.ds-upload`, `.ds-media`, `.ds-frames`, `.ds-agenda`, `.ds-week`, `.ds-mark`, `.ds-snippet`,
`.ds-cues`, `.ds-dl`, `.ds-diff`) : des classes de `patterns.css`, sans composant React. Voir la fin
de `docs/PROMPTS.md`.

## La vitrine — 11 pages

`demo/src/pages/` · une page par famille — 8 —, plus trois transverses :

`Foundations` (couleurs, typo, espacements, rayons, dimensions) · `Brand` (logo, avatar,
halo) · `Actions` · `Forms` · `DataDisplay` · `Feedback` · `Navigation` · `Overlays` ·
`Icons` · `Parcours` (les motifs des parcours, v0.4.0) · `Outils` (les cartes d'outil, les
compteurs, les étapes, la coque d'un écran de Claude, v0.5.0)

```bash
npm install && npm --prefix demo install
npm run demo          # http://localhost:5273
```

C'est la page de recette. Si elle est juste, le design system est juste.

---

## La procédure de portage

**1 · Lis le contrat.** `src/styles/brand.template.css` — chaque jeton, ce qu'il tient, et
les règles de structure d'une palette. C'est le seul fichier à lire avant d'écrire.

**2 · Écris `src/styles/brand-<client>.css`** — en copiant `brand-yunary.css` puis en
repeignant chaque valeur. Les `@font-face` du client en haut, puis les jetons. Un jeton
d'identité oublié fait que la variable n'existe pas : ça casse à l'écran, c'est voulu. Les
jetons de forme, eux, retombent sur la valeur du socle si tu les omets.

**3 · Dépose les polices** dans `src/styles/assets/fonts/` et nomme les trois familles
(`--font-display`, `--font-body`, `--font-mono`) avec un repli système à la fin.

**4 · Renomme le paquet et l'identité textuelle :**

```bash
npm run rebrand -- "@client/ds" "Nom du Client"
```

Il réécrit `package.json`, `src/brand.ts` (nom, monogramme, mot-marque) et les imports.

**5 · Change les traitements, si besoin.** Un badge en contour plutôt que plein, une carte
bordée plutôt qu'ombrée : c'est `src/styles/patterns.css`. Change les règles, **pas** les
noms de classes ni la structure du DOM — la vitrine et les composants les lisent.

**6 · Vérifie.** Trois commandes, trente secondes :

```bash
npm run lint          # types + les treize gardes (jetons, version, contrat, utilitaires,
                      # classes mortes, tailles en px, classes fragiles, substitution,
                      # contraste, surfaces, catalogue, preflight, littéraux)
node check-contract.mjs   # aucun jeton du contrat oublié
npm run check:classes     # le quatorzième, hors de `lint` : aucune classe écrite qui ne rend rien
npm run demo          # et on regarde
```

Les pièges que ces gardes ferment — et les trois qu'aucun garde n'attrape — sont dans
[`docs/PIEGES.md`](docs/PIEGES.md), qui voyage avec le paquet et part avec le projet qu'on
tire de ce gabarit.

Le contrôle de contraste refuse toute paire sous seuil qui n'est pas assumée par écrit.
C'est la seule chose qu'un générateur rate systématiquement : un lien à 3:1 se voit très
bien sur une maquette et pas du tout à l'usage.

---

## Les règles qui font gagner du temps

**On ne renomme aucun jeton.** Les composants et `patterns.css` lisent ces noms-là. On ne
change que ce qui est à droite du `:`.

**Le thème clair est `:root`, le sombre est le scope `.dark`.** Jamais un media query : on
veut pouvoir poser une section sombre dans une page claire.

**Chaque fond a son `--x-foreground`.** Un fond ne se pose jamais sans la couleur de texte
qui garantit son contraste.

**L'accent est rationné** — logo, un mot de titre, le sur-titre, le CTA, le halo. Jamais un
grand aplat, jamais un fond de page. Et sur le nœud qui porte `.accent` ou `.eyebrow`, jamais
un utilitaire de couleur, de fond ou de dimension : ces classes clippent le dégradé en quatre
déclarations solidaires (`layer(base)`), tout utilitaire (`layer(utilities)`) qui en écrase
une gagne toujours et l'effet meurt en silence. La typographie (`font-*`, paliers,
`leading-*`) est sans risque ; la mise en page va sur un span externe.

**Les surfaces se distinguent par de petits écarts — et c'est MESURÉ.** Si `--card` vaut
`--background`, les cartes disparaissent ; si `--muted`, `--secondary`, `--popover` ou
`--accent` valent `--card`, c'est tout ce qui se pose SUR une carte qui disparaît — rayures
de table, champ désactivé, barre d'onglets, dropdown, plaque de badge. `check-surfaces.mjs`
mesure ces paires dans les deux thèmes et refuse tout écart sous seuil non assumé par écrit
(`@surface-assume`). En sombre, vise l'échelle : page → muted → card → popover →
surface-alt → secondary.

**Les classes utilitaires suivent la marque.** Les jetons sont exposés à Tailwind en
`@theme inline` : `rounded-lg` lit `var(--radius-lg)`, donc changer le jeton change toutes
les classes, y compris celles écrites à la main dans le code de l'app.

**L'échelle typographique native de Tailwind n'existe pas ici.** `text-sm`, `text-base`,
`text-lg` ne génèrent rien — seuls les paliers du système existent : `text-display-xl`,
`text-display`, `text-heading-xl`, `text-heading`, `text-subheading`, `text-heading-sm`, `text-body-lg`,
`text-body`, `text-body-sm`, `text-control`, `text-caption`, `text-eyebrow`, `text-chip`.
C'est volontaire : une régression casse visiblement au lieu de dériver en silence.

---

## Ce que le dépôt contient d'autre

`GETTING-STARTED.md` — la même chose en checklist minutée, pour un humain.
`docs/DESIGN.md` — la charte à remplir avant de toucher au CSS.
`docs/accessibilite.md` — ce qui est garanti, et ce qui ne l'est pas.
`README.md` — l'API des 37 composants.
