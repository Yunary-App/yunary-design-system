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
> « L'accent est rationné par une liste (§ 3) : un site qui n'y est pas n'en porte pas. »

Depuis le 10/10/2026, **la maquette fait foi** : un motif qu'elle dessine et que le ds n'a pas
s'ajoute au ds, ce n'est pas un conflit. Seules deux règles d'accessibilité l'emportent sur
elle : jamais `--primary` en couleur de texte (§ 9.3), et tout reste lisible en sombre.

---

## 2. Support et contexte

**Où ça vit :** la coquille web (le hub), les écrans MCP et le site vitrine. Chaque
surface monte exactement deux imports — `@yunary/ds/core.css` puis
`@yunary/ds/brand-yunary.css` (et `@yunary/ds/theme.css` côté CSS pour une app Tailwind).
Aucune surface ne redéclare un jeton de marque : une divergence locale est un bug.
**Un écran MCP monte les surfaces du ds, forcées** (`Card variant="screen"`, décision du
10/10/2026) : fond `--background`, blocs relevés en `--card`, filets `--border`. Seul le clair ou
le sombre suit l'hôte (la coque applique `.dark` d'après le thème que Claude annonce). Les bulles
de conversation autour de l'écran appartiennent à Claude, jamais au ds. **La coque gagne toujours
dans son périmètre** (0.6.1) : ses règles sont déclarées en tête de `patterns.css`, les règles de
contexte d'une carte s'écrivent `:where()`, et `check-coque.mjs` le mesure à chaque `npm run lint`.
**Thème principal :** clair d'abord ; le sombre est complet et à parité de règles — la vitrine
montre chaque motif en sombre même quand la maquette ne le dessine pas.
**Densité :** confortable — cartes à padding 24 (28 / 32 pour les cartes d'outil et d'offre),
grilles de cartes gap ≥ 1.5rem, pile de cartes d'outil à 16.
**Écran de référence :** 1440, desktop ; le mobile est secondaire (cibles 44 px tenues par le socle,
390 px vérifié dans la vitrine).

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

**Où l'accent a le droit d'apparaître** — liste FERMÉE, valable dans TOUTES les apps,
élargie le 10/10/2026 (la maquette fait foi) :

1. le logo (l'icône Y en squircle, dégradé)
2. un mot par titre (dégradé clippé, un seul)
3. le sur-titre (eyebrow)
4. le CTA primaire, avec sa lueur — **plusieurs par vue quand la vue propose plusieurs
   choix équivalents** (cinq hooks, trois structures, deux créneaux) ; un seul quand
   une action domine
5. le halo (hero et section CTA uniquement)
6. les tuiles/icônes de marque (pastille `--pill-coral-bg` + icône `--primary`)
7. l'élément sélectionné d'une barre posée sur la page (plaque `--accent` + texte `--primary`)
8. le prix d'une offre (`.ds-price--accent`, le montant en dégradé clippé)
9. les numéros de section d'une fiche (`.ds-card__band`, 01 à 06, en dégradé clippé)
10. la colonne du jour de l'agenda semaine (plaque `--accent`, numéro en dégradé ; aujourd'hui
    en plaque dégradée)
11. le filet « Recommandé » d'une tuile (`.is-recommended` : filet `--primary` sans plaque, sans
    être choisie)
12. le badge dégradé (`Badge tone="brand"` : « À connecter », « 12 € / mois »)

Les sites 9 et 10 sont livrés en 0.6.0 (`.ds-card__band`, `.ds-week`).

**Où il n'a jamais le droit :** un fond de page, un grand aplat, la bordure d'une carte qui
n'est ni choisie ni recommandée, deux mots d'un même titre, mélangé à une autre couleur
d'accent. Une nouvelle app qui a besoin d'un 13ᵉ site d'accent l'ajoute ICI, par PR — pas
dans son code.

**Vérification :** `TOKENS=src/styles/brand-yunary.css node check-contrast.mjs` — 28 écarts
assumés par écrit dans le fichier (signature CTA, badge et prix en dégradé, ring dégradé,
contours doux, élément sélectionné en corail), le reste conforme.

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
**Cartes :** `--card-pad` 24 / `--card-pad-lg` 28 — les valeurs du socle, la marque ne les
redéclare plus (10/10/2026 : la contradiction entre la charte et le jeton est réglée) ; le palier
`xl` 28 / 32 (`Card size="xl"`, jetons `--card-pad-xl-y/-x`) pour les cartes d'outil et d'offre.
**Largeurs de colonne, par rôle :** `app` 100 rem, la colonne de contenu du hub dans
`.ds-appshell__main` (remplit la largeur jusqu'à environ 2500 px de fenêtre, alignée à gauche) ·
`shell` 70 rem, le site · `wide` 56,25 rem, les pages étroites d'une app (Paramètres, Profil) ·
`read` 45 rem, la lecture. Une page d'app ne se plafonne jamais en `shell`.
**Barre latérale :** largeur FLUIDE `clamp(15rem, 11rem + 5vw, 18rem)` — 240 ≤ 1280 · 256 à
1600 · 272 à 1920 · 288 ≥ 2240 ; bord optique intérieur 24 px (16 de boîte + 8 de contenu).
**Densité :** rail de contrôles du socle inchangé (3rem, 2.75rem sous 64rem), plus **un cran
`xs` à 28 px** (`--control-xs`, `Button size="xs"`) pour « Copier » et les actions de méta — au-dessus
du minimum d'accessibilité de 24 px, jamais un CTA ni un bouton de pied.

---

## 6. Motifs signature

**Le halo :** radial chaud (`.30/.12`), ancré en bas (hero) ou haut/centre (CTA) — jamais plein écran.
**Le dégradé :** CTA primaire + un mot de titre. 90°/135° du socle.
**La lueur :** `--shadow-glow*` chaude, réservée au CTA primaire — et, depuis 0.10.0, à la pastille du jalon en
cours d'une frise (`.ds-frise`, maquette Onboarding Web). Identique dans les deux thèmes.
**L'ombre :** trois niveaux teintés de `--tone-dark`, jamais du noir pur en clair.
**La sélection — UNE convention, partout, en CORAIL :** plaque `--accent` + texte
`--primary` (`#e85d2f`), **même graisse** que les voisins, icône et coche en `currentColor` —
l'entrée de Sidebar, l'onglet actif (sur une carte : surface `--card`, même texte), la page
courante, l'item de menu coché, l'option de select, le lien de barre, le bouton-icône accent.
Le bouton-icône enfoncé (`aria-pressed`, le choix liste / calendrier) garde la plaque et le filet
`--primary`, mais son icône prend `--primary-readable`, plus lisible : la maquette, 26/10/2026. Jamais « noir gras ». Décision Julien, 11/09/2026 : `bg-accent text-primary`, et
**l'écart de contraste est assumé** — 3,00 sur `--accent`, le seuil des graphiques, pas celui
du texte — sept blocs `@a11y-assume` dans
`brand-yunary.css`, § 3.6 de `docs/accessibilite.md`. `--primary-readable` reste le jeton des
liens, du badge accent, du bandeau info, des erreurs, et de la coche d'une tuile de choix. La tuile
cochée garde son titre en encre. **Recommandée sans être choisie** (`.is-recommended`) : le filet
`--primary` et l'ombre douce, pas de plaque. Dans un écran de Claude, la tuile choisie redescend sur
`--background` avec son filet, les autres restent relevées sur `--card`.
Les contrôles cochés (case, switch, jour choisi) ne suivent pas : ils portent le dégradé plein.
Les bandeaux centrent leur icône verticalement (`Banner align="start"` l'aligne en
haut quand le texte fait plusieurs lignes).
**Le danger doux porte un filet** de 1,5 px à 30 % de `--destructive` (10/10/2026, livré en
0.6.0) ; la corbeille nue (`IconButton ghost-danger`) est sa forme de 390.
**Le champ invalide porte un anneau** rouge doux en plus de sa bordure (0.6.0) ; le focus reste
une bordure seule.
**La pastille de marque est outlined**, carrée — `Pastille tone="brand" outlined` : en-tête de
carte, étape numérotée d'une feature, tuile de choix. **L'état vide, lui, porte une
pastille RONDE et NEUTRE** (`EmptyState`, 10/10/2026 : la maquette fait foi), et le panneau
d'état compact une pastille pleine danger ou neutre.
**L'espacement interne d'une carte** reste à 24 px (`--card-pad`), et sa pile sur l'échelle
`--space-*` (`Card gap={3|4|5|6}`) — pas de palier 20 (décision Julien, 11/09/2026). Les cartes
d'outil et d'offre sont au palier `xl` (28 / 32) et s'empilent à 16.
**Les avantages d'une offre** sont une liste nue à deux colonnes (`.ds-perks`, même à 390), chaque
ligne une `Pastille size="coche"` (24 px) et un libellé en body-sm à l'encre.

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
**Pas de visuels d'export dans le paquet :** miniatures et cartes motion vivent dans le projet
qui les fabrique. **Les marques tierces, elles, sont une brique du ds** depuis 0.6.0 (`Reseau` :
Instagram, TikTok, YouTube, Claude) : leurs couleurs vivent dans le fichier de marque, section
« marques tierces », avec leurs jumeaux sombres — jamais dans une app.

---

## 9. Interdits — la liste courte ★

1. Aucune valeur littérale hors des fichiers de jetons et de marque.
2. Toute dimension en `rem`, sauf les exceptions de `scales.css`.
3. `--primary` et `--destructive` jamais en `color:` de TEXTE COURANT — les jumeaux
   lisibles. (Exceptions écrites : icônes de marque, texte de l'onglet actif — décisions
   § 6, portées par la plaque + la forme, jamais par la couleur seule.)
4. Jamais un rayon pill sur un bouton, un champ ou une barre d'onglets. Il est réservé aux badges, aux compteurs et aux pastilles de choix (`.ds-tile--chip`).
5. Jamais la couleur seule pour porter un sens : le TEXTE le porte. L'icône d'un badge est
   facultative (10/10/2026) — la maquette dessine ses statuts sans icône, le libellé suffit.
6. Jamais un site d'accent hors de la liste du § 3 (la règle qui décide, § 1).
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
| 2026-10-26 | 0.11.1 : le « Fermer » du résultat de `Modal` sur la surface carte ; l'icône du bouton-icône enfoncé en `--primary-readable` | passe design du hub : un bouton ne prend jamais la couleur de sa surface, et la maquette du choix liste / calendrier pose le jumeau lisible |
| 2026-10-20 | 0.11.0 : le ménage de l'offre unique — retrait des motifs de l'ancienne offre (prix barré, plaque « Offert », carte « Bientôt », panneau « À activer », interrupteur « Toujours actif », paire de jauges, jauge centrée, barre segmentée enveloppée, grille de tuiles, carte d'outil à colonne prix, prix d'écran), de sept composants React sans consommateur (les classes de la barre de navigation et du pied restent au site), du sous-chemin `chart-geometry`, de `makeCn`, de quatorze glyphes et de l'outillage `rebrand` | une offre unique depuis le 19/10 : le paquet ne porte que ce que les couches emploient (la règle de la 0.2.0) |
| 2026-10-19 | 0.10.0 : la frise à jalons `.ds-frise` / `Frise` (une pastille, une date, un titre, un montant et un texte facultatifs, un trait ; fait · en cours · à venir ; verticale, horizontale qui redevient verticale sous 64 rem, compacte, sur plaque) ; la pastille du jalon en cours porte le dégradé et la lueur ; sa date est en `--primary-readable` (la maquette l'écrit en `--brand-via` : 2,51 en clair) | maquettes Onboarding Web et Facturation Web de la nouvelle offre |
| 2026-10-17 | 0.9.0 : jeton `--container-app` (100 rem) et `max-w-app`, la colonne de contenu d'une app ; `shell` reste au site, `wide` aux pages étroites, `read` à la lecture | le hub plafonnait ses pages en `max-w-shell` : le contenu s'arrêtait dès environ 1470 px de fenêtre |
| 2026-10-16 | 0.8.0 : le graphique d'évolution `Chart`, fait maison, sans librairie — trois couches (géométrie pure `chartGeometry`, aussi `@yunary/ds/chart-geometry` sans React ; classes `.ds-chart*` ; composant), une courbe par graphique, ligne en escalier, graduations calculées et adaptées à la largeur, jeton `--text-axis` (12) ; le DS ne formate rien | maquette Admin Web, onglet Évolution ; l'écran Métriques de mcp-ui |
| 2026-10-16 | 0.7.0 : briques de la page Admin, génériques — la carte de chiffre `StatCard` (taille de carte `--stat` 24 / 28 puis 16 / 18, variation hausse `success` · stable `neutral` · baisse `danger`, calcul à l'app), l'en-tête triable `Th sort` contrôlé (`aria-sort`, glyphes `arrow-down` · `arrow-up` · `arrow-up-down`), `.ds-stat--lg` et `.ds-stats--bare` | maquette Admin Web ; l'écran Métriques de mcp-ui en a besoin |
| 2026-10-12 | 0.6.3 : l'ancien prix barré `.ds-price__old` (offre de lancement), à l'encre même en `--accent`, lu « au lieu de » par un lecteur d'écran (écrit après le montant, replacé devant par `order`) ; `--inline` pour un badge ou une méta ; colonne prix large `.ds-offer--wide` (20 rem) | maquette OuverturePage du site ; `PrixBarre` du hub versé au ds |
| 2026-10-11 | 0.6.2 : `Avatar referrerPolicy` (photo d'un CDN) ; dans la coque, les boutons md du pied de carte à 16 de côté (trois actions sur une ligne à 680) ; plusieurs boutons de pied dans `.ds-card__foot-actions` | demandes du hub (`AccountPhoto`) et de mcp-ui (pied à trois boutons) |
| 2026-10-11 | 0.6.1 : la coque d'écran gagne toujours dans son périmètre (bloc de tête de `patterns.css`, contextes en `:where()`, garde `check-coque.mjs`) ; `.ds-perks` et `.ds-tiles` gardent deux colonnes tant que chacune a sa largeur minimale (`--perks-col-min` 144, `--tiles-col-min` 184) et passent à une en dessous, un mot ne se coupe jamais | remontées de mcp-ui (contournement dans `components.css`) et du hub (cartes d'outil compactes, « Instagram » à 390) |
| 2026-10-10 | **La maquette fait foi.** Les quatre règles du 09/10 tombent : badges de statut sans icône, plusieurs CTA primaires par vue, prix et numéros de section en dégradé, danger doux avec un filet. Deux règles d'accessibilité restent au-dessus : jamais `--primary` en texte, tout lisible en sombre | audit du ds 0.4.0 face aux maquettes retouchées le 10/10 ; décision Julien |
| 2026-10-10 | 0.6.0 : la seconde moitié — dépôt compact et envoi à nu, un seul dessin de média, agenda sur `--accent` + barre + tuiles, rangées et réglages, états vides ronds neutres + compact, bande de section et barre de fiche, étapes en tuiles (une brique pour « 1 · 2 · 3 » et « La suite »), onglets qui défilent, modales 480 / 560 / 600, danger doux à filet, `Avatar` réécrit, `Reseau`, ton doux `Banner soft`, cadres de miniature détourés en sombre | même audit + compléments de la liste du hub et trois précisions de Julien |
| 2026-10-10 | 0.5.0 : liste de l'accent élargie (§ 3, 12 sites), cran `xs` du rail, `--card-pad` revenu à 24 / 28 + palier `xl` 28 / 32, surfaces du ds forcées dans un écran de Claude (`Card variant="screen"`), `Badge corner` retiré (plus dessiné) | même audit ; la colonne du jour de la semaine repassera sur `--accent` avec les motifs de la version suivante |
| 2026-10-09 | 0.4.0 : motifs des parcours en classes, `Dropzone` seul composant nouveau ; la colonne du jour de la semaine sur `--muted`, l'`--accent` gardé au jour d'aujourd'hui | maquettes Script et Programmation ; la liste fermée des sites de l'accent (§ 3) — **renversé le 10/10** |
| 2026-09-29 | 0.3.0 : pastille de choix en pilule, emoji de contenu autorisé en tête de tuile | les listes de choix du profil créateur (maquette HubProfil) |
| 2026-09-29 | 0.2.0 : retrait de l'extension de visuels d'export et des composants React sans consommateur | le paquet ne porte que ce que les surfaces emploient |
