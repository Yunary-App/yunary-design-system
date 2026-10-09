# Charte — Yunary

Le document qu'on lit **avant** de toucher au CSS — et avant de monter une nouvelle app.
Ce design system est le **socle partagé de toutes les surfaces Yunary** : ces arbitrages
valent pour toutes, et c'est ce fichier qui les empêche de diverger.

---

## 1. La marque en cinq lignes ★

**Nom :** Yunary
**Ce que c'est :** le socle de design de Yunary, la suite d'outils méthodiques pour
créateurs de contenu intégrée dans Claude — les écrans MCP (`@yunary/mcp-ui`), la coquille
web (le hub : compte, offre, paiement) et le site vitrine. Toutes ces
surfaces montent la même marque.
**Pour qui :** des créateurs Instagram/TikTok, plusieurs fois par semaine — et, côté code,
chaque personne qui monte un écran Yunary sans avoir lu le CSS.
**Trois adjectifs :** chaud · assuré · rigoureux — contre froid, corporate, mou.
**Ce qu'on refuse :** le froid corporate, l'emoji, la couleur en grands aplats, le blanc pur
en surface.

**La règle qui décide** — une seule phrase :
> « L'accent est rationné : si un deuxième élément chaud apparaît dans la vue, l'un des deux est de trop. »

---

## 2. Support et contexte

**Où ça vit :** la coquille web (le hub), les écrans MCP et le site vitrine. Chaque
surface monte exactement deux imports — `@yunary/ds/core.css` puis
`@yunary/ds/brand-yunary.css` (et `@yunary/ds/theme.css` côté CSS pour une app Tailwind).
Aucune surface ne redéclare un jeton de marque : une divergence locale est un bug. Un écran
MCP prend fond, texte et bordures aux variables de l'hôte ; l'accent, les formes et les
polices restent ceux de Yunary.
**Thème principal :** clair d'abord ; le sombre est complet et à parité de règles.
**Densité :** confortable — cartes à padding 28/32, grilles de cartes gap ≥ 1.5rem.
**Écran de référence :** 1440, desktop ; le mobile est secondaire (cibles 44 px tenues par le socle).

Thème clair en `:root`, sombre en `.dark`, jamais un media query.

---

## 3. Couleur → `src/styles/brand-yunary.css` ★

### Surfaces — le régime « plus aucun blanc pur »

Aligné sur le kit maître Julien Fernandes v0.5.0 : `#ffffff` ne subsiste que comme couleur
de TEXTE sur un aplat de marque.

| Jeton | Clair | Sombre | Rôle |
|---|---|---|---|
| `--background` | `#f6f2ec` | `#1f1e1c` | la crème / l'encre |
| `--card` | `#faf7f2` | `#2b2a28` | se détache de la page (1,044 / 1,162) |
| `--secondary` | `#fbf8f3` | `#2b2a28` | contrôles posés sur la mise en page — navbar, sidebar, champs, filtres. À un cheveu de la carte (1,009 / 1,000, **assumé par écrit**) : deux rôles, UNE hauteur de plan, le filet sépare ; posé DANS une carte, le contrôle repasse sur `--background` (déduction de patterns.css) |
| `--popover` | `#fdfbf8` | `#302e2b` | la surface FLOTTANTE — dropdowns, modales, datepicker — au-dessus de la carte (1,035 / 1,059) |
| `--muted` | `#f1ece4` | `#262523` | le lavis — rayures de table, champ désactivé |
| `--accent` | `#f6ede2` | `#3a2a20` | la plaque de marque, teintée ambre |
| `--surface-alt` | `#f6ede2` | `#32302d` | le cran de survol/rail/shimmer (écart 1,084 / 1,090) |
| `--border` · `--input` | `#e5e1da` | `#3a3936` / `#4a4843` | hairlines douces ; le champ a son contour propre en sombre |

**Pourquoi l'échelle est mesurée** : si card, popover et muted partagent une valeur, tout ce
qui se pose sur une carte disparaît. `check-surfaces.mjs`
mesure ces paires dans les deux thèmes ; les deux collisions voulues (`--secondary`/`--card`)
sont assumées par écrit dans le fichier de marque.

### Texte

| Jeton | Clair · Sombre | Rôle |
|---|---|---|
| `--foreground` | `#1f1e1c` · `#f2efea` | titres et corps |
| `--text-secondary` | `#3d3c3a` · `#d2cfc9` | libellés |
| `--text-muted` | `#6b6966` · `#b0aea9` | méta — 5,12 / 6,47 sur `--card` |
| `--text-inverted` | `#f2efea` · `#1f1e1c` | texte sur surface opposée |

### Marque ★

| Jeton | Valeur | Rôle |
|---|---|---|
| `--primary` | `#e85d2f` | LA couleur d'action, remplissage — et la couleur des icônes de marque (pastilles, texte de l'onglet actif) |
| `--primary-readable` | `#b23a1c` · `#f0916b` | liens, libellés actifs — ≥ 4,5:1 sur les six surfaces, deux thèmes |
| `--destructive` / `--destructive-readable` | `#e84c3d` / `#a32d2d` · `#ec8f8f` | le danger = le corail du dégradé, label blanc (3,80 assumé) |
| `--ring` | `#f08029` clair · `#f5a524` sombre | le focus porte un arrêt du dégradé (2,41 assumé — compensé par bord 1,5px + halo 3px) |
| `--brand-from/via/to` | `#f5a524` / `#f08029` / `#e84c3d` | le dégradé signature, identique dans les deux thèmes |

**Où l'accent a le droit d'apparaître** — liste FERMÉE, valable dans TOUTES les apps :

1. le logo (l'icône Y en squircle, dégradé)
2. un mot par titre (dégradé clippé, un seul)
3. le sur-titre (eyebrow)
4. le CTA primaire — un seul par vue, avec sa lueur
5. le halo (hero et section CTA uniquement)
6. les tuiles/icônes de marque (pastille `--pill-coral-bg` + icône `--primary`)
7. l'élément sélectionné d'une barre posée sur la page (plaque `--accent` + texte `--primary`)

**Où il n'a jamais le droit :** un fond de page, un grand aplat, une bordure de carte,
deux mots d'un même titre, mélangé à une autre couleur d'accent. Une nouvelle app qui a
besoin d'un 8ᵉ site d'accent l'ajoute ICI, par PR — pas dans son code.

**Vérification :** `TOKENS=src/styles/brand-yunary.css node check-contrast.mjs` — 26 écarts
assumés par écrit dans le fichier (signature CTA, ring dégradé, contours doux, élément
sélectionné en corail), le reste conforme.

---

## 4. Typographie → fichier de marque

| Jeton | Valeur | Rôle |
|---|---|---|
| `--font-display` | `'Onest',system-ui,sans-serif` | titres |
| `--font-body` | `'DM Sans',system-ui,sans-serif` | texte et UI |
| `--font-mono` | `'DM Mono',ui-monospace,'Courier New',monospace` | code, méta — même fonderie que DM Sans |
| `--heading-transform` | `none` | Onest = grotesque classique |
| `--heading-weight` | `var(--weight-bold)` | gras, casse d'origine |
| `--heading-xl-weight` | `var(--weight-extrabold)` | le titre de page un cran au-dessus (Onest 800), H2-H4 en 700 |
| `--text-heading-xl` | `2.25rem` | le titre de page à 36 px (socle : 40) ; le palier mobile du socle (28 sous 64 rem) est répété dans la marque, sinon la redéclaration l'écraserait |

**Graisses chargées :** Onest 700/800 · DM Sans 400/500/600/700 · DM Mono 400/500 — rien
d'autre. Chaque app hérite de l'`@import` via le fichier de marque.

---

## 5. Espacement, rayons, rail

**Rayons : l'échelle du socle, gardée telle quelle** (xs 6 · sm 10 · md 12 · lg 20 · xl 24 ·
2xl 28 · pill ; tabs/pagination 14) — la rigueur qui va avec le ton chaud.
**MAIS le rayon des CONTRÔLES est un RATIO du rail : hauteur ÷ 3** (règle patterns.css).
16 px à 48 de haut, 14 à 42, ~12,7 à 38, ~14,7 sous 64rem — l'arrondi Yunary aux grandes
hauteurs, jamais un petit contrôle quasi-pill. Chips, menus, pastilles, cartes restent sur
l'échelle `--radius-*`.
**Cartes :** `--card-pad` 28 / `--card-pad-lg` 32 — la carte respire (kit maître).
**Barre latérale :** largeur FLUIDE `clamp(15rem, 11rem + 5vw, 18rem)` — 240 ≤ 1280 · 256 à
1600 · 272 à 1920 · 288 ≥ 2240 ; bord optique intérieur 24 px (16 de boîte + 8 de contenu).
**Densité :** rail de contrôles du socle inchangé (3rem, 2.75rem sous 64rem).

---

## 6. Motifs signature

**Le halo :** radial chaud (`.30/.12`), ancré en bas (hero) ou haut/centre (CTA) — jamais plein écran.
**Le dégradé :** CTA primaire + un mot de titre. 90°/135° du socle.
**La lueur :** `--shadow-glow*` chaude, réservée au CTA primaire. Identique dans les deux thèmes.
**L'ombre :** trois niveaux teintés de `--tone-dark`, jamais du noir pur en clair.
**La sélection — UNE convention, partout, en CORAIL :** plaque `--accent` + texte
`--primary` (`#e85d2f`), **même graisse** que les voisins, icône et coche en `currentColor` —
l'entrée de Sidebar, l'onglet actif (sur une carte : surface `--card`, même texte), la page
courante, l'item de menu coché, l'option de select, le lien de barre, le bouton-icône accent
ou enfoncé. Jamais « noir gras ». Décision Julien, 11/09/2026 : `bg-accent text-primary`, et
**l'écart de contraste est assumé** — 3,00 sur `--accent`, le seuil des graphiques, pas celui
du texte — sept blocs `@a11y-assume` dans
`brand-yunary.css`, § 3.6 de `docs/accessibilite.md`. `--primary-readable` reste le jeton des
liens, du badge accent, du bandeau info, des erreurs. La tuile cochée garde son titre en encre.
Les contrôles cochés (case, switch, jour choisi) ne suivent pas : ils portent le dégradé plein.
Les toasts et bandeaux centrent leur icône verticalement.
**La pastille de marque est outlined**, carrée, sur toutes les maquettes —
`Pastille tone="brand" outlined` : état vide, carte d'état héros, en-tête de carte. Pleine ou
ronde, c'est un écart aux maquettes.
**L'espacement interne d'une carte** reste à 24 px (`--card-pad`), et sa pile sur l'échelle
`--space-*` (`Card gap={3|4|5|6}`) — pas de palier 20 (décision Julien, 11/09/2026).

**Un motif qu'on refuse :** le glassmorphism, les fonds photographiques, les textures.

---

## 7. Logo → `src/brand.ts` + `Logo.tsx`

**Mark VECTORIEL** : l'icône Yunary (Y en squircle, dégradé de marque) remplace la pastille
CSS — `Logo.tsx` est livré (icône inline, zéro requête), API `variant`/`letters`/`height`
conservée. L'icône précède le mot-marque (l'ordre du lockup) ; `variant="monogram"` rend
l'icône seule. La pastille du socle est neutralisée dans le fichier de marque.
**Casse du mot-marque :** « Yunary » suit `--heading-transform:none` — rien à surcharger.

---

## 8. Périmètre du design system

**Ce qui entre :** structure, comportements, états, composants sans métier.
**Ce qui n'entre pas :** analyses, audits, quotas, règles, profil créateur — le vocabulaire
d'UN outil reste dans sa couche. En cas de doute, ça reste dans la couche.
**Le fichier de marque est un export du paquet** : `@yunary/ds/brand-yunary.css` — le
sous-chemin stable du second import de chaque surface. Il ne se copie jamais dans une app
(le site vitrine, déployé à part, en porte une copie dans `site/src/styles/ds/`).
**Pas de visuels d'export dans le paquet :** miniatures, cartes motion et icônes de
plateformes sociales vivent dans le projet qui les fabrique.

---

## 9. Interdits — la liste courte ★

1. Aucune valeur littérale hors des fichiers de jetons et de marque.
2. Toute dimension en `rem`, sauf les exceptions de `scales.css`.
3. `--primary` et `--destructive` jamais en `color:` de TEXTE COURANT — les jumeaux
   lisibles. (Exceptions écrites : icônes de marque, texte de l'onglet actif — décisions
   § 6, portées par la plaque + la forme, jamais par la couleur seule.)
4. Jamais un rayon pill sur un bouton, un champ ou une barre d'onglets. Il est réservé aux badges, aux compteurs et aux pastilles de choix (`.ds-tile--chip`).
5. Jamais la couleur seule pour porter un sens — couleur + icône + texte.
6. Jamais deux éléments chauds dans la même vue (la règle qui décide, § 1).
7. Jamais un utilitaire de couleur, fond, `background-clip` ou dimension sur `.accent` / `.eyebrow`.
8. Jamais un défaut de design en style inline.
9. Jamais d'emoji d'interface — les icônes sont Lucide. Seule exception : un emoji qui EST la donnée affichée (l'emoji d'une passion, fourni par l'app), dans le glyphe de tête d'une tuile (`.ds-tile__lead`).
10. Jamais un jeton de marque redéclaré dans une app — une divergence locale se corrige ici, par PR.
11. Jamais de blanc pur en surface — `#ffffff` est une couleur de texte sur aplat de marque.

---

## 10. Journal des décisions

| Date | Décision | Pourquoi |
|---|---|---|
| 2026-08-31 | Label du CTA : blanc sur le dégradé, assumé sous 4,5:1 | signature Yunary ; un seul CTA/vue, 15/600 + lueur |
| 2026-08-31 | Échelle de surfaces alignée sur le kit maître (« plus aucun blanc pur », secondary ≈ carte assumé) | le blanc tranchait à côté des cartes ; deux rôles, une hauteur de plan, la déduction sépare |
| 2026-08-31 | `--destructive` = `#e84c3d` partout, label blanc (3,80 assumé) | aligné kit maître ; le rouge foncé sortait de la palette chaude |
| 2026-08-31 | `--ring` = `--brand-via` (2,41 assumé, halo 3px en compensation) | aligné kit maître |
| 2026-08-31 | Rayons : échelle du socle + **rayon des contrôles = hauteur ÷ 3** | l'arrondi Yunary à 48px sans petits contrôles quasi-pill |
| 2026-08-31 | `--card-pad` 28/32 · `--sidebar-w` en clamp 240→288 · bord optique barre 24px | kit maître v0.12–v0.14 |
| 2026-08-31 | Sélection = plaque `--accent` + texte `--primary` (sur page) ; `--card`+`--foreground` dans une carte | un actif à ~1,05 de sa barre est invisible |
| 2026-08-31 | Pastilles de marque : fond `--pill-coral-bg`, icône `--primary` ; jour du jour du calendrier en `--primary` | « les icônes de marque prennent --primary » |
| 2026-08-31 | Logo : icône vectorielle (squircle dégradé) à la place de la pastille CSS | décision de marque ; Logo.tsx livré, API conservée |
| 2026-08-31 | Toast/Banner : icône centrée verticalement ; croix du toast à 1.125rem | revue vitrine |
| 2026-08-31 | Tabs : rayon 14 (socle), jamais un pill | interdit n° 4 ; le contrat prime |
| 2026-08-31 | --font-mono = DM Mono | même fonderie que DM Sans |
| 2026-08-31 | Dégradé et lueur identiques en sombre ; jetons dérivés non recopiés | calculés par le socle (derives.css) |
| 2026-08-31 | Marque exportée sous `./brand-yunary.css` dans package.json | sous-chemin stable de chaque surface |
| 2026-09-11 | Élément sélectionné en corail (`--primary` sur `--accent`), écart de contraste assumé | décision de marque Julien |
| 2026-09-11 | Titre de page à 36 px, `Card gap` sur l'échelle `--space-*` sans palier 20 | décisions Julien |
| 2026-10-09 | 0.4.0 : motifs des parcours en classes, `Dropzone` seul composant nouveau ; la colonne du jour de la semaine sur `--muted`, l'`--accent` gardé au jour d'aujourd'hui | maquettes Script et Programmation ; la liste fermée des sites de l'accent (§ 3) |
| 2026-09-29 | 0.3.0 : pastille de choix en pilule, emoji de contenu autorisé en tête de tuile | les listes de choix du profil créateur (maquette HubProfil) |
| 2026-09-29 | 0.2.0 : retrait de l'extension de visuels d'export et des composants React sans consommateur | le paquet ne porte que ce que les surfaces emploient |
