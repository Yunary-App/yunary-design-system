# Accessibilité — le contraste du système Yunary, mesuré

> **Ce document ne s'écrit pas à la main.** Les deux tableaux sortent de
> `TOKENS=src/styles/brand-yunary.css node check-contrast.mjs --table`, qui lit les valeurs
> réelles du fichier de marque. Le même contrôle tourne à chaque `npm run lint` et **fait
> tomber le build** si une paire passe sous son seuil sans être déclarée.
>
> Cible : **WCAG 2.2 niveau AA**. 4,5:1 pour le texte courant (1.4.3) · 3:1 pour le gros
> texte, les icônes porteuses de sens et les contours de contrôle (1.4.11). Les fonds
> translucides — pilules, plaques de marque — sont **composités sur leur surface porteuse**
> avant mesure : c'est la couleur que l'œil reçoit, pas celle qui est écrite.
>
> **92 paires × 2 thèmes. 60 conformes, 32 écarts assumés.** Un écart assumé n'est pas un
> oubli : c'est une décision écrite, déclarée dans `src/styles/brand-yunary.css` par un bloc
> `@a11y-assume:` avec sa raison. Le build tombe si une **trente-troisième** apparaît.

---

## 1. La règle qui est sortie de la mesure

**`--primary` et `--destructive` sont des couleurs de REMPLISSAGE. Elles ne sont presque
jamais une `color:`.**

Le corail Yunary est conçu pour tenir un aplat de bouton. Posé comme texte sur la crème, il
n'atteint pas 4,5:1. Le contrat porte donc deux **jumeaux lisibles** — la même marque, rendue
lisible :

| jeton | clair | sombre | ce que la mesure donne |
|---|---|---|---|
| `--primary-readable` | `#b23a1c` | `#f0916b` | **5,16 à 5,64** en clair, **5,62 à 7,11** en sombre, sur les six surfaces |
| `--destructive-readable` | `#a32d2d` | `#ec8f8f` | **6,62 à 6,84** en clair, **5,73 à 6,07** en sombre |

Ce sont eux que prennent les liens, les icônes porteuses de sens, le badge accent, le bandeau
info et les messages d'erreur — lignes `a{}`, `.ds-badge--accent`, `.ds-banner--info`,
`.ds-error` du tableau § 2.

**L'exception, décidée : l'élément sélectionné est en corail.** La convention d'état actif du
socle pose `--primary` en texte sur la plaque `--accent` — entrée de Sidebar, onglet, page
courante, item de menu coché, lien de barre. 3,00 sur `--accent`, le seuil des graphiques, pas
celui du texte : sept paires assumées, § 3.6. `--primary-readable` (5,16) tiendrait le seuil ;
Julien a tranché le 11/09/2026 pour le corail.

Le survol de lien ne demande pas de troisième jeton : il se **dérive** en tirant le jumeau
vers `--foreground` (`color-mix(in srgb, var(--primary-readable) 80%, var(--foreground))`),
ce qui ne peut qu'**augmenter** le ratio — 6,76 en clair, 8,21 en sombre.

**Deux exceptions, assumées et documentées** au § 3.4 : la plaque de pastille de marque et le
jour du jour du calendrier posent `--primary` directement. Ce sont des marqueurs graphiques,
jamais seuls porteurs du sens.

La règle se vérifie d'un grep, et c'est ce qui la rend tenable :

```bash
grep -rE '(^|[^-[:alnum:]])color:var\(--(primary|destructive)\)' src/styles/
```

Treize sorties : les deux marqueurs du § 3.4, l'astérisque « requis » d'un libellé
(`.ds-label__required`, un signe de ponctuation à côté d'un mot en encre), et les dix règles de
la convention d'état actif (§ 3.6) — toutes décidées, aucune par accident.

---

## 2. Les paires conformes

| Paire | contenu | seuil | clair | sombre |
|---|---|--:|--:|--:|
| `texte courant sur --background` | 16 / 400 | 4,5 | 14,94 | 14,52 |
| `texte courant sur --card` | 16 / 400 | 4,5 | 15,59 | 12,50 |
| `--text-secondary sur --card` | 16 / 400 | 4,5 | 10,31 | 9,22 |
| `.caption — --text-muted sur --card` | 13 / 500 | 4,5 | 5,12 | 6,47 |
| `.ds-input::placeholder` | 15 / 400 | 4,5 | 5,17 | 6,47 |
| `.ds-tooltip__bubble` | 13 / 600 | 4,5 | 14,52 | 15,59 |
| `a{} au repos sur --background` | 16 / 400 | 4,5 | 5,36 | 7,11 |
| `a{} au repos sur --card` | 16 / 400 | 4,5 | 5,59 | 6,12 |
| `a:hover — dérivé vers --foreground` | 16 / 400 | 4,5 | 6,76 | 8,21 |
| `.ds-icon-btn--accent — icône` | icône | 3 | 3,00 | 3,94 |
| `.ds-badge--accent` | 12 / 700 | 4,5 | 5,16 | 5,85 |
| `.ds-banner--info` | 15 / 400 | 4,5 | 5,16 | 5,85 |
| `.ds-pastille--brand-solid — glyphe sur --brand-to` | icône | 3 | 3,80 | 3,80 |
| `.ds-icon-btn[aria-pressed] — icône` | icône | 3 | 3,00 | 3,94 |
| `.ds-error` | 13 / 500 | 4,5 | 6,62 | 6,07 |
| `.ds-dropdown__item--danger` | 15 / 400 | 4,5 | 6,84 | 5,73 |
| `.ds-icon-btn--danger-soft sur --card — glyphe` | icône | 3 | 5,47 | 6,59 |
| `.ds-icon-btn--danger-soft sur --background — glyphe` | icône | 3 | 5,28 | 7,59 |
| `.ds-tile cochée — titre sur --accent` | 16 / 600 | 4,5 | 14,38 | 11,95 |
| `.ds-tile cochée — description sur --accent` | 14 / 400 | 4,5 | 9,51 | 8,82 |
| `.ds-tile--compact — libellé au repos` | 15 / 500 | 4,5 | 9,88 | 10,72 |
| `.ds-btn--danger-soft sur --card — label` | 14 / 600 | 4,5 | 5,47 | 6,59 |
| `.ds-btn--danger-soft sur --background — label` | 14 / 600 | 4,5 | 5,28 | 7,59 |
| `.ds-input[readonly] — texte sur --background` | 15 / 400 | 4,5 | 4,91 | 7,51 |
| `.ds-input[readonly] — texte sur --secondary` | 15 / 400 | 4,5 | 5,17 | 6,47 |
| `.ds-inset--dashed — texte sur --background` | 14 / 400 | 4,5 | 4,91 | 7,51 |
| `.ds-banner--amber — texte sur --card` | 14 / 400 | 4,5 | 4,99 | 7,13 |
| `.ds-week__wd — jour sur --accent` | 12 / 700 | 4,5 | 9,51 | 8,82 |
| `.ds-banner--soft — texte sur --accent` | 14 / 400 | 4,5 | 14,38 | 11,95 |
| `.ds-note — texte sur --card` | 13 / 400 | 4,5 | 5,12 | 6,47 |
| `.ds-icon-btn--ghost-danger — glyphe sur --card` | icône | 3 | 6,62 | 6,07 |
| `.ds-avatar--ring — initiales sur --card` | 14 / 700 | 4,5 | 5,59 | 6,12 |
| `.ds-pastille--accent — glyphe sur --accent` | icône | 3 | 5,16 | 5,85 |
| `.ds-week__day.is-today — jour et numéro` | 12 / 700 | 4,5 | 4,54 | 5,04 |
| `.ds-agenda__cell.is-outside — numéro sur --muted` | 13 / 600 | 4,5 | 4,65 | 6,91 |
| `.ds-media__badge — durée sur la vidéo` | 11 / 600 | 4,5 | 14,94 | 14,94 |
| `.ds-perk — libellé sur --card` | 14 / 400 | 4,5 | 15,59 | 12,50 |
| `.ds-meter__of — texte sur --background` | 14 / 400 | 4,5 | 4,91 | 7,51 |
| `.ds-steps__counter-sub — texte sur --background` | 18 / 400 | 4,5 | 4,91 | 7,51 |
| `.ds-tile--choice — coche --primary-readable sur --accent` | icône | 3 | 5,16 | 5,85 |
| `.ds-badge--coral sur --card` | 12 / 700 | 4,5 | 4,90 | 5,73 |
| `.ds-badge--coral sur --background` | 12 / 700 | 4,5 | 4,69 | 6,62 |
| `.ds-badge--amber sur --card` | 12 / 700 | 4,5 | 4,99 | 7,13 |
| `.ds-badge--amber sur --background` | 12 / 700 | 4,5 | 4,82 | 8,30 |
| `.ds-badge--danger sur --card` | 12 / 700 | 4,5 | 5,47 | 6,59 |
| `.ds-badge--danger sur --background` | 12 / 700 | 4,5 | 5,28 | 7,59 |
| `.ds-badge--warning sur --card` | 12 / 700 | 4,5 | 4,79 | 7,40 |
| `.ds-badge--warning sur --background` | 12 / 700 | 4,5 | 4,59 | 8,47 |
| `.ds-badge--success sur --card` | 12 / 700 | 4,5 | 4,94 | 6,17 |
| `.ds-badge--success sur --background` | 12 / 700 | 4,5 | 4,75 | 7,14 |
| `.ds-badge--neutral sur --card` | 12 / 700 | 4,5 | 5,20 | 7,46 |
| `.ds-badge--neutral sur --background` | 12 / 700 | 4,5 | 5,00 | 8,78 |
| `.ds-badge--outline` | 12 / 700 | 4,5 | 10,31 | 9,22 |
| `survol — --foreground sur --surface-alt` | 15 / 600 | 4,5 | 14,38 | 11,47 |
| `.ds-choice coché — aplat --primary` | contrôle | 3 | 3,12 | 4,79 |
| `.ds-switch actif — piste --primary` | contrôle | 3 | 3,12 | 4,79 |
| `.ds-progress__bar sur son rail` | graphique | 3 | 3,00 | 3,78 |
| `.ds-input.is-error — bordure --destructive` | contour 1.5px | 3 | 3,58 | 3,78 |
| `.ds-tile cochée — filet --primary vs --card` | contour 1.5px | 3 | 3,25 | 4,12 |
| `.ds-tile cochée — filet --primary vs --background` | contour 1.5px | 3 | 3,12 | 4,79 |

---

## 3. Les écarts assumés

32 paires, en six familles. Chacune est déclarée dans `src/styles/brand-yunary.css` par un
bloc `@a11y-assume:`. Le script porte la mécanique, **la marque porte ses renoncements** : une
autre marque née de ce socle repart d'une liste vide et n'hérite d'aucune dérogation.

| Paire | contenu | seuil | clair | sombre |
|---|---|--:|--:|--:|
| `.ds-navlink.is-active` | 16 / 500 | 4,5 | 3,28 ✗ | 4,12 ✗ |
| `.ds-sidenav.is-active` | 15 / 500 | 4,5 | 3,00 ✗ | 3,94 ✗ |
| `.ds-tab[aria-selected]` | 15 / 600 | 4,5 | 3,00 ✗ | 3,94 ✗ |
| `.ds-tabs--on-card .ds-tab[aria-selected]` | 15 / 600 | 4,5 | 3,25 ✗ | 4,12 ✗ |
| `.ds-page[aria-current]` | 15 / 600 | 4,5 | 3,00 ✗ | 3,94 ✗ |
| `.ds-dropdown__item[aria-checked]` | 15 / 400 | 4,5 | 3,00 ✗ | 3,94 ✗ |
| `.ds-select option:checked` | 15 / 400 | 4,5 | 3,00 ✗ | 3,94 ✗ |
| `.ds-cal__day.is-today` | 14 / 700 | 4,5 | 3,25 ✗ | 4,12 ✗ |
| `.ds-pastille--brand — icône` | icône | 3 | 2,85 ✗ | 3,58 |
| `.ds-pastille--brand-solid — glyphe sur --brand-from` | icône | 3 | 2,04 ✗ | 2,04 ✗ |
| `.ds-pastille--brand-solid — glyphe sur --brand-via` | icône | 3 | 2,68 ✗ | 2,68 ✗ |
| `.ds-step en cours — chiffre sur --brand-from (pire arrêt)` | 13 / 700 | 4,5 | 2,04 ✗ | 2,04 ✗ |
| `.ds-agenda__cell.is-today — numéro sur --brand-from (pire arrêt)` | 13 / 600 | 4,5 | 2,04 ✗ | 2,04 ✗ |
| `.ds-week__num — numéro en dégradé sur --accent` | 29 / 800 | 3 | 1,76 ✗ | 6,72 |
| `.ds-week__day.is-today — numéro sur --brand-from (pire arrêt)` | 22 / 800 | 4,5 | 2,04 ✗ | 2,04 ✗ |
| `.ds-media--brand — glyphe sur --brand-from (pire arrêt)` | icône | 3 | 2,04 ✗ | 2,04 ✗ |
| `.ds-media__play — glyphe sur le disque` | icône | 3 | 2,79 ✗ | 2,79 ✗ |
| `.ds-badge--brand — texte sur --brand-from (pire arrêt)` | 12 / 700 | 4,5 | 2,04 ✗ | 2,04 ✗ |
| `.ds-price--accent — montant sur --brand-from (pire arrêt)` | 36 / 800 | 3 | 1,91 ✗ | 7,03 |
| `.ds-btn--primary — label sur --primary à plat` | 15 / 600 | 4,5 | 3,48 ✗ | 3,48 ✗ |
| `.ds-btn--primary — label sur --brand-from (pire arrêt)` | 15 / 600 | 4,5 | 2,04 ✗ | 2,04 ✗ |
| `.ds-btn--primary — label sur --brand-via` | 15 / 600 | 4,5 | 2,68 ✗ | 2,68 ✗ |
| `.ds-btn--primary — label sur --brand-to` | 15 / 600 | 4,5 | 3,80 ✗ | 3,80 ✗ |
| `.ds-btn--danger — label sur --destructive` | 15 / 600 | 4,5 | 3,80 ✗ | 3,80 ✗ |
| `.ds-cal__day.is-selected` | 14 / 600 | 4,5 | 3,48 ✗ | 3,48 ✗ |
| `.eyebrow / .accent — dégradé clippé en texte` | 12 / 600 | 4,5 | 1,83 ✗ | 8,16 |
| `anneau de focus --ring sur --background` | contour 2px | 3 | 2,41 ✗ | 8,16 |
| `.ds-input — bordure --input vs page` | contour 1.5px | 3 | 1,30 ✗ | 1,82 ✗ |
| `.ds-input — bordure --input vs remplissage` | contour 1.5px | 3 | 1,36 ✗ | 1,57 ✗ |
| `.ds-input — remplissage vs page` | aplat | 3 | 1,05 ✗ | 1,16 ✗ |
| `.ds-card — bordure --border vs page` | contour 1px | 3 | 1,17 ✗ | 1,44 ✗ |
| `.ds-sep — filet --border sur --card` | filet 1px | 3 | 1,22 ✗ | 1,24 ✗ |

### 3.1 · La signature CTA — le label blanc sur le dégradé chaud · 15 paires

**L'écart.** Le CTA primaire porte `--brand-gradient`, ambre → orange → corail. Le label blanc
mesure **2,04** sur l'arrêt jaune, **2,68** sur l'orange, **3,80** sur le corail, **3,48** sur
l'aplat `--primary`. La pastille pleine, le jour sélectionné du calendrier, le repère de l'étape en cours et le
numéro du jour d'aujourd'hui dans l'agenda (v0.4.0), le badge de marque (« À connecter ») et le
montant d'une offre en dégradé clippé (v0.5.0), le numéro du jour de l'agenda semaine et sa plaque
d'aujourd'hui, la vignette d'un contenu sans vidéo (v0.6.0, la maquette fait foi) portent le même
dégradé, le bouton danger le même corail. Le chiffre d'une étape ou d'un jour est redondant : la place, le libellé en
gras et `aria-current` disent l'état.

**Pourquoi il est assumé.** C'est la signature de la marque, et l'alternative a été mesurée :
un label encre tombait à **4,36 sur `--brand-to`** — le problème se déplaçait, il ne
disparaissait pas. Le bouton reste identifiable sans lecture fine : un CTA par action qui domine,
libellé 15/600, forme pleine, lueur `--shadow-glow`, et 3:1 tenu sur `--primary` et
`--brand-to`. L'arrêt jaune n'occupe que le bord gauche du bouton, jamais la zone du label
seul. Le texte de danger courant, lui, passe toujours par `--destructive-readable`.

### 3.2 · Le dégradé clippé en texte — `1,83` en clair · 1 paire

**L'écart.** `.accent` et `.eyebrow` clippent le dégradé dans les lettres. Il pique
nécessairement à son arrêt le plus clair.

**Pourquoi il est assumé.** C'est une propriété de la **technique**, pas de la palette :
n'importe quel dégradé clippé pique au même endroit. La parade est d'usage — **un seul mot par
titre**, jamais porteur seul du sens, et le reste du titre en `--foreground` à 14,94. En sombre
la même règle mesure 8,16.

### 3.3 · L'anneau de focus — `2,41` en clair · 1 paire

**L'écart.** `--ring` porte l'arrêt médian du dégradé (`#f08029`) et non le plein orange :
décision de marque, l'anneau est plus reconnaissable ainsi.

**Pourquoi il est assumé.** Le focus n'est **jamais** porté par le seul contour : bord 1,5 px
plus halo de 3 px sur les champs, `outline` 2 px avec offset ailleurs. En sombre `--ring` prend
`--brand-from` et tient **8,16**. Le repli existe si l'écart déplaît un jour : `--brand-to`
`#e84c3d`, qui mesure 3,40.

### 3.4 · Les trois marqueurs en `--primary` — `2,85` et `3,25` · 3 paires

**L'écart.** `.ds-pastille--brand` pose le glyphe en `--primary` sur `--pill-coral-bg`
(**2,85** en clair pour un seuil de 3 · 3,58 en sombre, tenu), et `.ds-cal__day.is-today` pose
le jour du jour en `--primary` (**3,25** en clair, 4,12 en sombre, pour du 14/700).

**Pourquoi il est assumé.** Les deux sont des **marqueurs**, pas du texte à lire. Le glyphe de
pastille est décoratif et toujours accompagné de son libellé en texte courant ; le jour du jour
est aussi porté par la **graisse**, et le jour *sélectionné*, lui, porte l'aplat plein. Ce sont
deux paires que `check-contrast.mjs` mesure sur `--primary`, la couleur que `patterns.css` pose
réellement à ces deux endroits.

### 3.5 · Les contours doux crème — `1,05` à `1,36` · 5 paires

**L'écart.** Les hairlines Yunary sont volontairement discrètes : bordure de champ contre la
page (1,30), contre son remplissage (1,36), remplissage blanc sur page crème (1,05), bordure de
carte (1,17), filet de séparateur (1,22).

**Pourquoi il est assumé.** C'est le caractère du système — encre et crème, contours doux,
aucun trait dur. Et aucun de ces cinq traits ne porte seul une information : le champ est
délimité par son remplissage **et** son anneau de focus à 3:1 ; la carte porte **aussi** une
ombre teintée d'encre (`--shadow-sm`) qui fait le détachement ; le séparateur est un filet de
rythme, non porteur de sens.

### 3.6 · L'élément sélectionné en corail — `3,00` à `3,28` en clair · 7 paires

**L'écart.** La convention d'état actif pose `--primary` (`#e85d2f`) en couleur de **texte** sur
la plaque `--accent` : **3,00** en clair, 3,94 en sombre — entrée de Sidebar, onglet, page
courante, item de menu coché, option de select ; 3,25 sur `--card`
pour l'onglet d'une barre posée sur une carte ; 3,28 sur `--secondary` pour le lien actif d'une
barre de navigation. Le seuil des graphiques, pas celui du texte.

**Pourquoi il est assumé.** Décision de marque de Julien, 11/09/2026 : `bg-accent
text-primary`, le corail et non le brique du jumeau lisible. L'état n'est jamais porté par la couleur seule : la plaque `--accent` (ou
`--card`), l'ombre `--shadow-sm` de l'onglet et de la page courante, la coche d'un item de menu,
et l'attribut ARIA (`aria-current`, `aria-selected`, `aria-checked`) — un lecteur d'écran n'a
pas besoin de la couleur. Les libellés sont courts, en 15-16 px et 500-600 ; les **icônes** de la
convention (bouton-icône accent, bouton-icône enfoncé) tiennent leur 3:1 à 3,00 et restent
conformes. `--primary-readable` reste le jeton de tout texte de marque qui n'est pas un état
actif. Le repli, si la décision est revue : `--primary-readable`, 5,16 / 5,85.

---

## 4. Ce que ce document ne couvre pas

Le contraste des couleurs, et lui seul. Trois points relèvent de l'accessibilité mais pas de la
mesure faite ici :

- **1.4.1 Utilisation de la couleur.** `a{}` ne pose **pas** de soulignement : dans un
  paragraphe, un lien ne se distingue que par sa couleur. Le corriger change le rendu de toute
  la prose du système — décision de conception, à trancher à part.
- **1.4.11 sur les états.** Les états `:hover` reposent sur un écart de surface de ~1,08, très
  en dessous de 3:1. Usage courant, non couvert stricto sensu (l'état reste identifiable par le
  curseur et le focus), mais il mérite d'être connu.
- **2.4.7, 1.4.12, 1.4.10.** Focus, espacement du texte, redimensionnement : hors mesure.

Ce que le socle **garantit** par ailleurs — piège de focus, touche Échap, verrou de défilement,
restitution du focus, rôles ARIA, cibles tactiles de 44 px sous 64 rem — ne se mesure pas en
ratios et ne se voit pas sur une maquette. C'est la part du design system qu'on ne regarde
jamais et qu'on casse à chaque régénération.

---

## 5. Refaire la mesure

```bash
TOKENS=src/styles/brand-yunary.css node check-contrast.mjs           # le contrôle
TOKENS=src/styles/brand-yunary.css node check-contrast.mjs --table   # les deux tableaux
node check-surfaces.mjs                                              # l'échelle des surfaces
```

Le premier sort non-zéro sur tout écart non déclaré. **Après toute retouche de la palette ou
d'une règle de `patterns.css`, régénérez les tableaux de ce document** — un ratio écrit ici qui
ne correspond plus à la mesure est pire que pas de document du tout.
