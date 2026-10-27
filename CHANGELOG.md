# Journal des versions — @yunary/ds

La procédure est dans [`GOVERNANCE.md`](GOVERNANCE.md), et `node check-version.mjs` vérifie
que **trois endroits disent le même numéro** : `package.json`, la ligne d'installation du
README, et le tag git. Les trois d'un coup, jamais l'un sans les autres — un tag manquant fait
échouer le `npm i …#v0.1.0` chez celui qui installe, et le README ment sans le savoir.

Ce journal repart de la **0.1.0** de Yunary. Il ne reprend pas celui du gabarit dont ce paquet
est né : l'historique d'un autre design system n'apprend rien sur celui-ci. Le millésime du
gabarit d'origine est noté ci-dessous, une fois, parce qu'une copie n'emporte pas l'historique
git — sans ça, deux portages faits à six mois d'écart seraient indiscernables.

Une ligne par décision, et c'est le **pourquoi** qui compte.

---

## 0.12.1 — la liste du `Select` au-dessus d'une feuille plein écran d'app

Lot L-002, correctif trouvé par la session Écrans le 27/10/2026.

- **La liste s'ouvre dans la fenêtre modale qui contient son champ.** En 0.12.0 elle allait dans le voile
  d'une `Modal` du DS, sinon dans le `<body>`, au rang `--z-popover` (40). Au téléphone, la fenêtre de
  paiement du hub est une feuille plein écran d'app (`role="dialog"`, `aria-modal="true"`, `fixed` au
  rang `--z-modal`, 70), pas une `Modal` : la liste s'ouvrait derrière elle, invisible, et le tap suivant
  la refermait. Le portail vise désormais la fenêtre modale la plus proche du champ : le voile `.ds-scrim`
  d'une `Modal` (comme avant), sinon un élément à `aria-modal="true"` ou un `<dialog>` ouvert, sinon le
  `<body>`. Choisi plutôt qu'un rang plus haut : dans le `<body>`, aucun rang ne passe sûrement devant une
  fenêtre d'app (ni devant un `<dialog>` modal, dans la couche du dessus), et `aria-modal` rend le reste
  de la page inerte pour un lecteur d'écran : la liste doit vivre dans la fenêtre pour rester joignable.
- **Une fenêtre transformée ne décale pas la liste.** Sous un ancêtre en `transform` ou `filter` (un
  panneau qui glisse), le repère de `position:fixed` n'est plus l'écran : l'écart est mesuré à chaque
  placement et rattrapé.
- Vitrine : Overlays › Modal, « Un Select dans une feuille plein écran d'app (aria-modal) ». Garde :
  `tests/select.test.mjs` (9 tests : la couche dans cinq cas ; dans une feuille à `aria-modal`, le choix,
  puis Échap qui ferme la liste sans atteindre l'écouteur de la feuille, puis la feuille).

Recette dans un vrai navigateur : la 0.12.0 reproduit le défaut (liste dans le `<body>`, couverte par la
feuille) ; la 0.12.1 passe 20 vérifications (390 au toucher et 1440, clair et sombre : liste dans la
feuille et touchable, tap d'une option, tap dehors, Échap, feuille transformée) et les 35 du `Select`
(page, carte, liste longue, `Modal`, Échap, clic dehors) sans changement.

**⚠ Ruptures** : aucune.

**Montée** : le hub passe à `#v0.12.1` (vider `node_modules/.vite`). Rien à changer : `FullScreenSheet`
porte déjà `role="dialog"` et `aria-modal="true"`. Une fenêtre d'app sans `aria-modal`, au-dessus de
`--z-popover`, cacherait encore la liste : elle doit le porter.

## 0.12.0 — l'état vide, la liste déroulante, la courbe arrondie, le texte en dégradé

Lot L-002 (retouches après L-001), décisions D-009, D-010, D-011 et D-013 de Julien, le 27/10/2026.

- **`EmptyState` : l'icône dans la pastille des maquettes** (D-009). La pastille par défaut passe de
  `panneau · round · neutral` (un rond gris, depuis la 0.6.0) à `panneau · carrée · brand · outlined` :
  c'est ce que rend le bundle qui dessine les maquettes du hub (`resources/screens/_ds/…/_ds_bundle.js`),
  vérifié propriété par propriété en clair et en sombre (pastille, cadre pointillé, fond, rayon,
  espacements, titre, texte : aucun écart). Le cadre ne bougeait pas. Un état vide qui passe sa propre
  tuile (`tile`) ne change pas. Le commentaire du composant (« la maquette fait foi : round · neutral »)
  est corrigé.
- **`Select` : la liste Yunary au lieu de celle du navigateur** (D-010). Le champ fermé est rendu au pixel
  près comme avant (28 captures sur 28, quatre états, deux surfaces, 390 et 1440, clair et sombre), mais
  c'est désormais un `<button role="combobox">` qui ouvre une liste dessinée avec les classes du menu :
  `.ds-dropdown--liste` (nouvelle), `__item`, `__check`, l'option choisie cochée sur `--accent`, l'option
  active (clavier ou survol) sur `--surface-alt` et cerclée de l'anneau de focus du système (`outline`
  2 px `--ring`, à l'intérieur ; seulement dans une liste `role="listbox"`, les menus ne changent pas),
  sur `--popover` quelle que soit la surface. Clavier du combobox select-only
  du W3C APG (↓ ↑ Entrée Espace, Début Fin Page ↑ ↓, Alt + ↑, Tab, Échap, premières lettres sans accents).
  La liste passe par un portail (le `<body>`, ou le voile d'une `Modal` pour rester devant elle) : une
  carte ou un tableau en `overflow:hidden` ne la coupe plus ; elle s'ouvre au-dessus quand la place manque
  en bas, défile au-delà de `--dropdown-list-h` (nouveau jeton, 20 rem, au § FACULTATIF), ne sort jamais
  de l'écran, suit le champ, se ferme au clic dehors ; dans une `Modal`, Échap ferme la liste et pas la
  fenêtre. **Un `<select>` natif caché** et synchronisé reste dans le champ : c'est lui qui émet
  `onChange` (le même `ChangeEvent<HTMLSelectElement>`, `e.target.value`), lui que vise la ref, lui qui
  porte `name`, `required`, `form` et l'autoremplissage (`autoComplete="country"` : vérifié avec un vrai
  autoremplissage de Chrome, le pays rempli fait suivre le champ). Il est transparent, sans
  `display:none` (qu'un navigateur n'autoremplit pas), hors tabulation, masqué aux lecteurs d'écran.
  Le piège de focus de `Modal` (`useModalSurface`) ne compte plus un élément en `tabindex="-1"` comme un
  bord. La règle `.ds-select option:checked` part avec la liste du navigateur ; la paire de contraste
  devient `.ds-dropdown--liste .ds-dropdown__item.is-checked` (même plaque, même écart assumé).
  Garde : `tests/select.test.mjs` (7 tests, mode strict).
- **`Chart` : la courbe arrondie monotone en option** (D-011). `curve="monotone"` : une interpolation
  cubique monotone (pentes de Steffen, celles de `curveMonotoneX` de d3) qui passe par chaque point, ne
  fait jamais de bosse au-dessus ou au-dessous d'un palier et ne descend jamais sous zéro ; un palier
  reste un trait droit, fusionné. `curve="step"`, l'escalier, reste le défaut : aucun usage ne change.
  Aire, point final et graduations ne changent pas. `chartGeometry` prend la même option ; le type
  `ChartCurve` est exporté. Garde : 10 tests de plus dans `tests/chart-geometry.test.mjs` (chaque point,
  aucune bosse sur chaque segment échantillonné, jamais sous zéro, défaut inchangé).
- **Une seule règle de texte en dégradé : `.accent`** (D-013). Les déclarations du dégradé clippé
  (`background`, `background-clip:text`, `color:transparent`, `width:fit-content`) étaient recopiées six
  fois : `.accent`, `.eyebrow`, le prix `--accent`, le numéro du jour de la semaine, le numéro d'une bande
  de fiche, le montant de l'étape en cours d'une frise. Elles vivent dans une seule liste de sélecteurs
  (`patterns.css`, § LE TEXTE EN DÉGRADÉ), en `layer(components)` : `.accent` et le dégradé de
  `.eyebrow` quittent `tokens/base.css` (la typographie d'`.eyebrow` y reste). Rendu identique au pixel :
  872 captures avant / après de chaque nœud touché, 11 pages de la vitrine, 390 et 1440, clair et sombre.
  `check-fragile-classes.mjs` refuse désormais une seconde règle clippée et l'effet réécrit dans le code
  (`bg-clip-text`, `backgroundClip` en ligne). Un texte en dégradé s'écrit `.accent`, seul sur son nœud,
  la typographie sur un span externe.
- **Les scripts git du DS** : `scripts/worktree-nouveau.sh`, `scripts/worktree-fin.sh` et
  `scripts/verrou.sh`, ceux du hub généralisés (worktrees `apps/packages/ds-worktrees/<nom>`, branche
  `lot/<nom>`, verrou dans le dossier git commun). Documentés dans `CLAUDE.md`.

**⚠ Ruptures** — aucune pour les appels du hub (même API du `Select`, même événement), mais trois choses
changent sous elles :

- Le champ du `Select` est un `<button>` : `id`, `aria-*`, `className`, `style` et les gestionnaires
  `onFocus`, `onBlur`, `onClick`, `onKeyDown`, `onKeyUp`, `onMouseDown` vont au bouton (avec son
  événement). `onChange`, `onInput`, `onInvalid`, `name`, `autoComplete`, `required`, `form`, `value`,
  `defaultValue` et la ref vont au `<select>` caché. `multiple` et `size` ne sont plus pris.
- `.accent` et `.eyebrow` (son dégradé) passent de `layer(base)` à `layer(components)` : un utilitaire
  Tailwind gagne toujours sur eux, comme avant ; une règle `.ds-*` plus spécifique posée sur le même
  nœud aussi.
- `EmptyState` sans `tile` change d'aspect partout où il est employé (c'est la décision).

**Montée** : le hub passe à `#v0.12.0` (vider `node_modules/.vite`). Aucun appel du `Select` ne change.
`Chiffre` (Admin) devient un span externe pour la typographie et un `<span className="accent">` à
l'intérieur (ou `accent` seul sur un nœud sans autre classe). Les deux graphiques de l'onglet Évolution
prennent `curve="monotone"`. L'état vide de Mes règles, qui passait la même pastille par `tile`, peut
revenir à `icon`. mcp-ui (classes seules, son propre `EmptyState`, aucune liste déroulante) et le site
(copie figée des styles) : rien à faire.

## 0.11.1 — deux corrections de la passe design du hub

Relevées par la passe design du hub le 26/10/2026 ; la maquette fait foi.

- **Le « Fermer » du résultat de `Modal` prend la surface carte** (`surface="card"`). Il était écrit en
  dur sans surface, donc en `--secondary`, la couleur de la fenêtre qui le porte. Règle de Julien : un
  bouton ne prend jamais la couleur de sa surface ; dans une fenêtre, un bouton secondaire prend la
  variante carte, comme les autres boutons d'une fenêtre. Un `footer` passé par l'appelant n'est pas
  touché.
- **L'icône du bouton-icône enfoncé passe au jumeau lisible** (`.ds-icon-btn--secondary[aria-pressed="true"]`
  et `.ds-icon-btn.is-active`) : `--primary-readable` (#b23a1c en clair, #f0916b en sombre) au lieu du
  corail `--primary`. C'est le choix liste / calendrier de Mes contenus, et c'est ce que pose la maquette
  (Yunary Programmation Web, Contenus-Calendrier). La plaque `--accent` et le filet `--primary` ne bougent
  pas. Contraste de l'icône : 5,16 / 5,85 au lieu de 3,00 / 3,94 (`check-contrast.mjs`,
  `docs/accessibilite.md`). Le bouton-icône `accent` et le reste de la convention de sélection restent en
  corail.

Aucune rupture : ni API, ni classe, ni jeton ne change. Docs : `PROMPTS.md` (Button, IconButton, Modal),
`DESIGN.md`, `accessibilite.md`. Vitrine : le choix de vue liste / calendrier dans Actions, la règle du
« Fermer » dans Overlays.

**Montée** : le hub passe à `#v0.11.1` sans code à changer (vider `node_modules/.vite`). mcp-ui et le
site n'emploient ni le résultat de `Modal` ni le bouton-icône enfoncé : rien à faire.

## 0.11.0 — le ménage de l'offre unique

Retraits décidés par Julien le 20/10/2026, après l'audit de ménage. Depuis le 19/10, Yunary n'a qu'une
offre (19 € par mois, 7 jours d'essai avec carte) : plus d'audit de compte, de pack, d'achat d'outil à
l'unité, d'offre de lancement ni de « Bientôt ». Chaque retrait est prouvé, juste avant, par une
recherche vide dans le hub, mcp-ui et le site (0 / 0 / 0), et inscrit dans `RETIRES`
(`check-catalogue.mjs`, point 6 : composants, fichiers, entrées de `package.json`, classes, jetons et,
nouveau, glyphes) et dans `RETIREES` (`check-classes.mjs`) : un portage qui les réintroduirait fait
tomber la garde. La règle est celle de la 0.2.0 : le paquet ne porte que ce que les couches emploient.

**⚠ Ruptures** — aucune pour les consommateurs actuels, qui n'importent ni n'écrivent rien de ce qui part :

- **Les motifs de l'ancienne offre** (classes et règles) : le prix barré de l'offre de lancement
  (`.ds-price__old`, `--inline`, `.ds-price__sr`), la plaque « Offert avec un outil payant »
  (`.ds-price--row`, `__aside`), le prix d'écran `.ds-price--sm`, la carte d'outil à colonne prix
  (`.ds-offers`, `.ds-offer`, `__main`, `__aside`, `--wide`), la carte « Bientôt » (`.ds-card.is-upcoming`),
  le panneau « À activer » (`.ds-panel.is-locked`), l'interrupteur « Toujours actif »
  (`.ds-switch.is-locked`, `.ds-switch__lock`), la paire de jauges « analyses + audits » (`.ds-meters`,
  `.ds-meter__note`) et la jauge centrée de l'audit (`.ds-meter--center`), l'enveloppe de la barre
  segmentée (`.ds-steps--bar` : `__track`, `__seg` et `__counter` restent, le hub les pose lui-même), la
  grille des tuiles de l'ancien onboarding (`.ds-tiles`, `.ds-tile--span`).
- **Deux props** : `Card upcoming` et `Switch locked`. `Switch labelPosition` reste.
- **Sept composants React sans consommateur** : `Toast`, `Tooltip`, `StateCard`, `SkeletonCard`, `Radio`,
  `Navbar`, `Footer`, avec leurs types. 34 composants au lieu de 41. Leurs classes partent avec eux
  (`.ds-toast*`, `.ds-tooltip*`, `.ds-state-card*`), **sauf** celles qu'une couche écrit :
  `.ds-navbar*`, `.ds-navlink` et `.ds-footer*` (le site) et le rond `.ds-choice__box--radio` (le hub),
  documentés dans « Classes sans composant » et montrés en balisage nu dans la vitrine.
- **Trois exports** : le sous-chemin `@yunary/ds/chart-geometry` (fait pour mcp-ui, jamais adopté ;
  `chartGeometry`, `niceStep` et `CHART_PADDING` restent exportés par l'index), `makeCn` et `PALIERS_TYPO`
  (la liste reste interne à `cn`). Les constantes `BRAND_*` restent.
- **Quatorze glyphes sans usage** : `eye`, `terminal`, `loader-circle`, `github`, `folder`, `quote`,
  `rocket`, `sliders-horizontal`, `house`, `dumbbell`, `log-out`, `heart`, `share`, `bookmark`. 48 au lieu
  de 62 ; un tracé hors catalogue passe par `glyph`. `brand-glyphs.ts` (le tracé de GitHub) et
  `compat-glyphs.ts` (celui de la maison) partent avec eux.
- **Trois jetons** : `--tiles-col-min`, `--toast-w-min`, `--toast-w-max` (socle et gabarit : 33 jetons de
  forme au lieu de 35).
- **L'outillage de gabarit** : `rebrand.mjs`, `npm run rebrand` et `GETTING-STARTED.md`. `PORTAGE.md`
  décrit le renommage à la main ; `brand.template.css` et `check-contract.mjs` restent.

**Hygiène** — le paquet ne dépend plus de lui-même : `dependencies` portait `@yunary/ds#v0.6.0` depuis
la 0.6.1 (une copie de la 0.6.0 dans `node_modules`, une ligne héritée par les lockfiles du hub et de
mcp-ui) ; `package-lock.json` régénéré (il annonçait encore 0.8.0). `.gitignore` perd `_v3-ancien/`,
un dossier qui n'a jamais existé. `demo/package.json` déclare `lucide-react` et `tailwind-merge`, que la
vitrine trouvait par chance dans le `node_modules` parent.

**Contrôles** — la paire de contraste du tooltip part : 108 paires × 2 thèmes, 74 conformes, 34 écarts
assumés. `docs/accessibilite.md` est régénéré (il était resté à 92 paires et 32 écarts). Le contrat :
63 jetons obligatoires (36 en `.dark`), 33 facultatifs.

**Docs** — README (comptes, la phrase fantôme sur `.ds-metric*`, retirées en 0.2.0, le paragraphe
`makeCn`, la ligne d'installation), PORTAGE (34 composants, 12 pages, les quinze gardes, le renommage),
GOVERNANCE (treize gardes au premier passage, `check-classes` le quinzième, pas de CI, les consommateurs
hub, mcp-ui et site), PROMPTS (sept sections retirées ; le rond, la barre de navigation et le pied en
classes ; exemples sur l'offre unique), DESIGN, PIEGES (deux flottants au lieu de trois), BACKLOG (la ligne
des keyframes, sans objet : l'écran de retour de paiement du hub n'existe plus). Commentaires des
composants et de `patterns.css` sans « Bientôt » ni « À activer ».

**Vitrine** — réécrite autour de l'offre unique : les cartes d'outil sans prix et une seule jauge,
l'offre en plaque à 19 €, la barre segmentée du parcours en trois étapes, le voile d'un contenu
réservé ; plus de prix barré, de panneau verrouillé ni d'interrupteur « Toujours actif ». Les spécimens
hérités du gabarit (build, déploiement, outil interne, sport) passent au vocabulaire de Yunary.

**Montée** :
- **hub** : aucun code à changer (aucun import, aucune prop, aucun glyphe ni aucune classe retirés n'y
  sont écrits). `npm i github:Yunary-App/yunary-design-system#v0.11.0`, vider `node_modules/.vite`,
  typecheck, recette ; le lockfile perd la ligne `@yunary/ds#v0.6.0` héritée. Reste à lui la ligne
  « Rôle de colonne à 560 px » du BACKLOG (`column="form"` d'`OnboardShell`, sans appel).
- **mcp-ui** (depuis 0.9.0) : aucun code à changer, aucune classe retirée n'y est écrite ; la montée
  apporte aussi la frise de la 0.10.0. Rebuild, `sync-screens.sh`, redéploiement de `mcp`, au prochain lot.
- **site** : rien d'obligatoire. Sa copie de `src/styles/ds/` (21/09) garde des règles désormais
  retirées, sans effet ; s'il la recopie, `.ds-navbar`, `.ds-navlink`, `.ds-footer`, `.ds-dropdown`,
  `.ds-switch` et `.ds-tile*` y sont toujours.

---

## 0.10.0 — la frise à jalons

La nouvelle offre Yunary : les maquettes Onboarding Web (« Comment se passe ton essai », verticale) et
Facturation Web (la frise de l'essai dans la carte d'abonnement, horizontale) dessinent le même motif,
que le DS n'avait pas (`.ds-steps--bar` est une barre segmentée, `.ds-steps--vertical` une liste à
repères, `.ds-etapes` des tuiles). Un composant nouveau (41).

- **Les classes `.ds-frise*`, puis `Frise` par-dessus** (mcp-ui ne consomme que le CSS). Une liste
  ordonnée de jalons (`__step`) : un rail (`__rail` : la pastille `__mark`, qui prend un ton de
  `Pastille`, et le trait `__line` vers le jalon suivant) et un corps (`__body` : `__date`, `__title`,
  `__amount` et `__text` facultatifs, `__sr` lu par un lecteur d'écran).
- **Trois états** : `.is-done` (fait : pastille, date et trait en succès), `.is-current` (en cours :
  pastille en dégradé plein et lueur, date en `--primary-readable`, montant en dégradé, trait du primaire
  vers la bordure, `aria-current="step"`), à venir par défaut (pastille du ton choisi par l'app, date en
  sourdine, trait en bordure). Le trait est coloré jusqu'au jalon fait.
- **Deux orientations** : verticale (défaut) et `--horizontal` (colonnes égales, trait couché), qui
  **redevient verticale sous 64 rem** — la maquette Facturation à 390 : rien ne défile.
- **Deux tailles** : la frise d'un parcours (pastille 48, glyphe 22, trait 3, date en capitales, titre
  en face display, montant sur sa ligne) et **`--sm`**, la frise compacte d'une carte (pastille 36,
  glyphe 16, trait 2, titre en body-sm 600, montant dans le titre). **`--plaque`** : la plaque
  `--background` encadrée (`--card` dans la coque d'écran).
- **Aucune valeur en dur** : les mesures sont des jetons — `--frise-mark(-sm)`, `--frise-icon(-sm)`,
  `--frise-line(-sm)`, `--frise-line-min(-sm)`, `--frise-pad`, `--frise-plaque-pad-y`, `--frise-gap(-sm)`,
  `--frise-col-gap-sm` (`tokens/scales.css`), `--tracking-frise-date`, `--leading-frise-amount`,
  `--leading-frise-title-sm`, `--leading-frise-text` (`tokens/typography.css`).
- **Deux écarts à la maquette, pour l'accessibilité** : la date du jalon en cours est en
  `--primary-readable` (la maquette l'écrit en `--brand-via` : 2,51 en clair, sous 4,5) ; la pastille et le
  montant en dégradé du jalon en cours sont des écarts ASSUMÉS dans `brand-yunary.css` (glyphe blanc sur
  l'arrêt jaune 2,04, montant clippé, les mêmes que `.ds-pastille--brand-solid` et `.ds-price--accent`).
  La lueur, réservée au CTA, est étendue à cette pastille (la maquette ; `DESIGN.md` § 6).
- **Ambre et succès vérifiés** dans les deux thèmes (`check-contrast.mjs`, 17 paires nouvelles) : dates
  faites 5,57 à 8,91, dates à venir 4,91 à 7,51, glyphes ambre, corail, succès et neutre 4,69 à 8,78 sur la
  carte et sur la plaque, badges ambre 4,82 à 8,30 et succès 4,75 à 7,14.
- **Tests** : `tests/frise.test.mjs` (dans `npm test`) monte `Frise` en mode strict de développement :
  balisage, états, montant dans le titre en `sm`, libellés surchargés, aucune erreur, un rendu par
  changement. La vitrine construite en développement strict : aucune erreur.
- **Vitrine.** « Parcours », section « Frise à jalons » : les deux cartes des maquettes, les trois états
  en horizontale et en verticale compacte, les badges ambre (essai, résilié) et succès ; clair et sombre,
  1440 et 390.
- **Migration.** **Hub** : la carte « Comment se passe ton essai » de l'onboarding et la frise de la carte
  d'abonnement de Facturation posent `Frise` au lieu de la composer. **mcp-ui** : les classes, exemple dans
  `docs/PROMPTS.md`, section `Frise`.

---

## 0.9.0 — une largeur de colonne pour les apps

Le hub plafonnait ses pages en `max-w-shell` (`--container-shell`, 70 rem), une largeur faite pour le
site. Sous l'échelle d'app, qui grossit la racine par paliers, le contenu s'arrêtait avant le bord droit
dès environ 1470 px de fenêtre, et le vide grandissait avec l'écran (131 px à 1920, 685 à 2560).

- **Jeton `--container-app` : 100 rem**, et sa classe **`max-w-app`** (`theme.css`), à côté des autres
  largeurs. La colonne de contenu d'une app, posée dans `.ds-appshell__main`, alignée à gauche.
- **Mesures**, sous l'échelle d'app, dans `.ds-appshell__main` avec la barre latérale et les gouttières
  du hub (1,25 rem) :

  | Fenêtre | Racine | Largeur disponible | `max-w-app` | `max-w-shell` |
  |---|---|---|---|---|
  | 1440 | 16,48 | 1137 | 1137, remplit | 1137 |
  | 1920 | 20,16 | 1542 | 1542, remplit | 1411 (131 de vide) |
  | 2400 | 20,8 | 1989 | 1989, remplit | 1456 (533 de vide) |
  | 2560 | 20,8 | 2141 | 2080, s'arrête à 100 rem (61 de vide) | 1456 (685 de vide) |

  `max-w-app` remplit jusqu'à 2495 px de fenêtre, puis s'arrête à 100 rem, alignée à gauche. Aucun
  débordement horizontal.
- **La doc des largeurs** (README « Les largeurs de colonne », `DESIGN.md` § 5, `tokens/scales.css`) :
  `shell` pour le site, `app` pour la colonne de contenu d'une app, `wide` pour les pages étroites
  (Paramètres, Profil), `read` pour la lecture. Le README ne cite plus `max-w-page`, qui n'existait pas.
- **Rien ne bouge ailleurs** : `--container-shell` (le site l'utilise) et la coque d'écran sont intacts.
- **Vitrine.** « Fondations » : `--container-app` dans les largeurs par rôle, et `max-w-app` à côté de
  `max-w-shell`.
- **Contient le correctif 0.8.1** du graphique (`Chart` stable en mode strict, voir ci-dessous).
- **Migration.** **Hub** : la colonne de contenu des pages passe de `max-w-shell` à `max-w-app`
  (`AdminVue`, `SubscribedTools`, `OutilsPage`, `ContenuPage`, `ReglesPage`…) ; les pages étroites
  (Paramètres, Profil) en `max-w-wide`. **mcp-ui** et **site** : rien.

---

## 0.8.1 — Chart stable en mode strict

Correctif remonté par le hub en intégrant la 0.8.0 : en développement, avec le mode strict de React,
`Chart` bouclait dès le montage (« Maximum update depth exceeded »), même minimal, aux props fixes. Le
rendu ne change pas.

- **La cause, reproduite dans la vitrine** (un build `--mode development`, mode strict) : le second
  `useLayoutEffect`, sans tableau de dépendances, appelait son setter à CHAQUE passage. La comparaison
  « la mesure a-t-elle changé ? » se faisait dans la fonction de mise à jour, donc APRÈS que l'appel
  eut programmé un rendu ; ce rendu relançait l'effet, qui rappelait le setter. Mesuré au montage de la
  page « Data display » : 644 rendus de `Chart` et 15 920 écritures, toutes à valeur identique sauf
  les deux premières de chaque graphique. Hors mode strict, React abandonnait ce rendu inutile sans
  rejouer l'effet ; en mode strict de développement, non. La vitrine tournait déjà en mode strict, mais
  la recette de la 0.8.0 s'était faite sur le build de production, où le mode strict ne joue pas.
- **Le correctif, à la racine** :
  - chaque état (la taille du conteneur, les mesures d'étiquettes) passe par un setter qui compare
    AVANT d'appeler React, à la dernière valeur posée : même largeur, mêmes marges, pas d'appel, pas de
    rendu ;
  - des dépendances explicites : la taille au montage (`ResizeObserver`), les étiquettes quand ce qui
    est affiché change (taille, libellés) ;
  - pour une même taille et une même série, les mesures d'étiquettes ne font que croître : la boucle
    mesure → marges → libellés → mesure s'arrête forcément ;
  - le `ResizeObserver` est débranché au démontage, et un drapeau coupe tout rappel tardif (rappel
    d'observateur, chargement des polices) : aucune écriture après démontage ;
  - une seconde mesure suit le chargement des polices.
  Pas de contournement : le mode strict reste actif, aucun compteur de passages.
- **Le garde-fou** : `tests/chart-strict.test.mjs`, enchaîné dans `npm test` et `npm run lint`. React
  de développement, `StrictMode`, DOM `happy-dom` (dépendance de développement nouvelle), mise en page
  et `ResizeObserver` simulés, un `Profiler` qui compte les rendus validés. Il exige : aucune erreur,
  au plus 6 rendus au montage (mesuré : 3), au plus 5 après un changement de largeur (2), aucun quand
  la largeur annoncée ne change pas, au plus 3 après un nouveau rendu du parent aux formateurs recréés
  (1), le repos ensuite, l'observateur débranché au démontage, et rien d'écrit par un rappel tardif.
  **Son jumeau de falsification** : `tests/fixtures/Chart-0.8.0.tsx`, la version fautive telle quelle,
  doit boucler dans ce banc, sinon le banc ne prouve rien.
- **Le rendu ne bouge pas** : toutes les mesures de la vitrine (hauteurs, traits, points, graduations,
  marges, squelettes, accessibilité, redessin au redimensionnement) sont identiques à la 0.8.0, en
  clair et en sombre, à 1440 et à 390, en build de production comme en développement strict.
- **Les autres composants** : aucun n'a le motif. Les trois autres effets qui écrivent un état ont des
  dépendances explicites et n'écrivent qu'en réponse à un changement réel (`Calendar` : la date choisie ;
  `DatePicker` : clic extérieur et Échap ; `Navbar` : le défilement, un booléen).
- **README** : la vitrine tourne en mode strict, et un composant à effets se recette en développement.
- **Migration.** Hub et mcp-ui : rien à changer, monter la version.

---

## 0.8.0 — le graphique d'évolution, fait maison

La page Admin, lot 2 : l'onglet Évolution de `resources/screens/Yunary Admin Web.dc.html`, sans
librairie. Il servira aussi à l'écran Métriques de mcp-ui. Un composant nouveau (40), aucun glyphe.

- **Trois couches.**
  - **`chartGeometry(input)`**, la géométrie pure (`src/chart/geometry.ts`) : ni React, ni DOM, ni
    format. Elle reçoit les points (`{ at, value }[]`, espacés régulièrement), la largeur et la hauteur
    du cadre en pixels CSS, `formatValue` et `formatAt` ; elle rend `viewBox`, `grid`, `area`, `line`,
    `end`, `yTicks`, `xTicks`, `plot`, `domain`. Exportée par l'index ET seule par
    **`@yunary/ds/chart-geometry`** (entrée tsup à part, aucun import de React) pour mcp-ui. Options :
    `integer`, `padding` (défaut 40 / 8 / 8 / 26 de la maquette, `CHART_PADDING`), `yTickGap` (36),
    `xLabelWidth` (50), `maxXTicks` (5). `niceStep` exporté aussi.
  - **Les classes `.ds-chart*`** : `__svg`, `__grid` (filets `--border`), `__area` (la couleur de la
    courbe à 12 %), `__line`, `__dot` (détouré à la couleur de la surface ; `--background` dans la
    coque d'écran), `__ytick`, `__xtick`, `__summary` (masqué à l'œil), `__skel` ; `--sm`, `--ink`.
  - **`Chart`**, le composant : `points` · `formatValue` · `formatAt` · `label` · `summary` · `tone`
    (`primary` · `ink`) · `area` · `size` (`md` · `sm`) · `integer` · `maxXTicks` · `loading`.
- **Ce qu'il dessine** (la maquette) : une grille, une aire, une ligne en ESCALIER, un point final,
  les graduations en valeurs à gauche et en dates en bas. La courbe de marque : `--primary`, aire à
  12 %, trait 2,5, point 4,5 ; la courbe à l'encre : `--foreground`, sans aire, trait 2, point 4.
- **La largeur** est celle du conteneur (ResizeObserver), redessinée quand elle change ; rien en
  pixels fixes. **La hauteur** : jetons `--chart-h-md` 260 et `--chart-h-sm` 150, redéclarés à 180
  et 120 sous 64 rem. Les traits et le point : `--chart-stroke`, `--chart-stroke-ink`, `--chart-dot`,
  `--chart-dot-ink`, `--chart-ring`. **Les graduations** passent par un jeton nouveau,
  **`--text-axis`** (0,75 rem, 12), au lieu des 12 px écrits de la maquette : le seul autre 12 de
  l'échelle est en capitales (eyebrow, chip).
- **Les graduations se calculent et s'adaptent.** Les valeurs : le zéro toujours dans le domaine,
  un pas « joli » (1, 2, 2,5, 4, 5 × 10ⁿ ; pas de 2,5 en `integer`), au plus une tous les 36 px de
  haut — d'où 0 → 80 € par 20 et 0 · 4 · 8, les graduations de la maquette, sans les écrire. Les
  dates : au plus 5, deux étiquettes jamais plus près que deux largeurs d'étiquette, la première et la
  dernière ramenées dans le cadre — 5 à 984 de large, 3 à 318. Le composant mesure ses étiquettes :
  la colonne des valeurs fait au moins 40 et s'élargit pour une étiquette longue, la bande des dates
  suit leur hauteur.
- **Cas limites** : un seul point (la valeur s'étale sur le tracé, le point final à droite, une date),
  une série toute à zéro (graduations 0 et 1, la ligne sur le zéro), des valeurs constantes (une
  marche plate), une année jour par jour (les marches nulles ne sont pas écrites), aucun point ou un
  cadre nul (rien à tracer), des valeurs négatives (le zéro reste une graduation).
- **Accessibilité** : `role="img"`, `aria-label` (`label`), `aria-describedby` vers la phrase de
  résumé (`summary`) fournie par l'app ; le SVG et les graduations sont masqués aux lecteurs d'écran.
  Pas d'infobulle ni de survol. **Chargement** : un squelette aux dimensions finales, `aria-busy`.
- **Le DS ne formate rien** : valeurs et dates viennent de l'app, comme le libellé de période.
- **Tests.** `npm test` (`node --test tests/chart-geometry.test.mjs`), enchaîné dans `npm run lint` :
  13 tests, dont les quatre graphiques de la maquette REJOUÉS (son algorithme sur ses données,
  1440 et 390) et comparés — graduations, ligne, point final, dates —, et chacun des cas limites.
- **Vitrine.** « Data display », section « Graphique d'évolution » : la carte Évolution de la maquette
  assemblée comme le fera le hub (trois périodes), les cas limites, le chargement ; clair et sombre,
  1440 et 390.
- **Migration.** Rien à changer dans l'existant. **Hub** : la carte Évolution pose deux `Chart` (MRR
  `primary`, clients payants `ink size="sm" integer`) ; les titres, la période et le filet restent à
  lui. **mcp-ui** : l'écran Métriques importe `@yunary/ds/chart-geometry` et écrit les classes
  `.ds-chart*` (exemple dans `docs/PROMPTS.md`, section `Chart`).

---

## 0.7.0 — les briques génériques de la page Admin

La maquette `resources/screens/Yunary Admin Web.dc.html`, lot 1 : ce qui manquait au DS et servira
ailleurs (l'écran Métriques de mcp-ui affichera aussi des chiffres et leur évolution). Chaque brique
existe d'abord en classes `.ds-*`, puis en composant React par-dessus. Le graphique (lot 2) et ce qui
est propre au hub n'y sont pas. Un composant nouveau (39), deux glyphes (62).

- **`StatCard`, la carte de chiffre** — `.ds-card.ds-card--stat.ds-stat-card` (`__label`, `__value`,
  `__foot`, `__skel-value`, `__skel-foot`). Un libellé (body-sm 600, caption sous 64 rem), une grande
  valeur en face display 800 (`--text-heading-xl`, `--text-heading` sous 64 rem, interligne 1), puis
  un pied en caption sourdine : le badge de variation dense et une phrase, tous deux facultatifs. La
  variation reçoit un texte et un sens : `up` → `success`, `flat` → `neutral`, `down` → `danger` ; le
  calcul et le choix d'un pourcentage restent à l'app. Chargement : deux squelettes aux places de la
  valeur et du pied (112 × 40 et 160 × 20, puis 72 × 28 et 70 % × 14 sous 64 rem), le libellé reste,
  `aria-busy`. Props : `label` · `value` · `delta: { text, trend }` · `note` · `loading` ; type
  `StatTrend`.
- **Une taille de carte nommée, `.ds-card--stat`**, et ses jetons `--card-pad-stat-y` /
  `--card-pad-stat-x` : 24 / 28, redéclarés à 16 / 18 sous 64 rem dans `tokens/scales.css`. Aucune
  taille de `Card` n'avait ces mesures.
- **L'en-tête triable, `Th sort` + `onSort`** — `.ds-table__sort`. Avec `sort` (`asc` · `desc` ·
  `none`, type `ThSort`), le contenu du `<th>` passe dans un `<button>` suivi du glyphe de l'état à
  14 px ; le `<th>` porte `aria-sort` (`descending`, `ascending`, absent si non trié), qui passe la
  colonne active en `--foreground`. Contrôlé : il reçoit l'état et prévient au clic, il ne trie rien.
  Survol en `--foreground`, anneau de focus clavier. Sans `sort`, `Th` rend un `<th>` comme avant.
- **Deux glyphes, `arrow-up` et `arrow-up-down`** (lucide, même dessin qu'`arrow-down`).
- **`.ds-stat--lg` et `.ds-stats--bare`**, les trois chiffres d'une carte produit : la valeur en face
  display 800 à `--text-heading` (`--text-subheading` sous 64 rem), interligne 1, le libellé au-dessus
  (`order`, le balisage reste valeur puis libellé), gap 6 (4) ; la rangée en colonnes égales, sans filet
  ni retrait, gap 16 (10). **`.ds-stat` et `.ds-stats` sans modificateur ne changent pas** (mesuré dans
  la vitrine : valeur 18 px en 700, libellé dessous, filet haut).
- **Vitrine.** « Data display » : les trois sens de variation, sans variation, chargement ; les trois
  états de tri et un tableau qui trie ; une carte produit avec `.ds-stat--lg` à côté d'un `.ds-stats`
  inchangé. Vérifié en clair et en sombre, à 1440 et à 390.
- **Migration.** Rien à changer dans l'existant. **Hub** : la page Admin prend `StatCard`,
  `Th sort`/`onSort` et `.ds-stat--lg` dans `.ds-stats--bare` au lieu de les composer. **mcp-ui** :
  l'écran Métriques écrit la carte de chiffre en classes (exemple dans `docs/PROMPTS.md`, section
  `StatCard`).

---

## 0.6.4 — retrait du garde-fou de largeur minimale

Décision de Julien du 15/10/2026 : le hub s'adapte entre 390 et 1440 px sans barre de défilement
horizontale.

- **Retrait du `min-width:1133px` du `body` (`app-scale.css`) ; les apps gèrent elles-mêmes les
  largeurs entre 64 rem et la mise en page desktop.** La règle `@media (min-width:64rem){body{min-width:1133px}}`
  et son commentaire « Garde-fou desktop » sont retirés. Entre 1024 et 1133 px, elle forçait une barre
  horizontale sur toutes les pages des apps qui importent `app-scale.css` (le hub seul aujourd'hui).
  Les quatre bandes de zoom (103 %, 112 %, 126 %, 130 %) ne changent pas, ni aucun jeton, aucune
  règle, aucun composant.
- **README** : la section « L'échelle d'app » ne parle plus de garde-fou ; elle dit que le module ne
  fixe aucune largeur minimale.
- **La pastille de choix revient à la ligne au lieu de déborder.** `.ds-tile--chip .ds-tile__main`
  passe de `flex:none` à `flex:0 1 auto;min-width:0` : le libellé garde sa largeur naturelle mais peut
  rétrécir. Sur /profil à 390, une pastille au texte long débordait de 45 px ; elle passe maintenant
  sur deux lignes dans sa pilule. Les pastilles courtes rendent à l'identique (mesuré dans la vitrine :
  les douze pastilles de « Formulaires », mêmes largeurs et hauteurs à 390 et à 1440). La vitrine
  montre une pastille au libellé long.
- **Migration.** **Hub** : à la montée, chaque page doit tenir entre 64 rem et 1133 px sans débordement
  horizontal (grilles, colonnes fixes, tableaux) ; c'était masqué par la barre de défilement.
  La pastille longue de /profil se corrige seule à la montée, rien à écrire.
  **mcp-ui** et **site** : rien, ils n'importent pas `app-scale.css`.

---

## 0.6.3 — le prix barré

L'offre de lancement (Analyse 6 € au lieu de 9 €, Programmation 8 € au lieu de 12 €, Script « 9 € »
barré puis « Gratuit / à vie ») entre au ds, d'après les cartes d'offre de la maquette du site
d'ouverture (`resources/screens website/site/OuverturePage.dc.html`). Le hub la composait lui-même
(`PrixBarre`). Aucun composant React nouveau : `.ds-price` reste un motif en classes.

- **`.ds-price__old`** : l'ancien prix, dans un `<s>`, à la taille et dans la face du montant
  (heading-xl, extra-gras ; heading en `--sm`), **à l'encre même quand le montant est en `--accent`**,
  barré d'un trait de 0,08 em (3 px à 36, comme la maquette). Sa place suit le balisage : dans
  `__line`, à côté du montant, et au-dessus quand la ligne passe à la ligne ; en enfant de `--row`,
  devant le montant à la gouttière de la maquette ; posé directement dans `.ds-price`, sur une ligne
  à lui au-dessus.
- **Lu comme un ancien prix.** On l'écrit APRÈS le montant, avec le texte masqué **`.ds-price__sr`**
  « au lieu de » ; `order:-1` le replace devant à l'œil. Un lecteur d'écran lit « 6 €, au lieu de 9 €,
  / mois à vie ». Un `<s>` seul n'est annoncé par aucun lecteur, et l'`aria-label` que posait
  `PrixBarre` sur son `<s>` n'est pas lu (rôle générique).
- **`.ds-price__old--inline`** : dans un badge ou une ligne de méta, la taille et la couleur du texte
  qui l'entoure, trait de 0,1 em. L'ordre demande un parent flex qui ne contient que le prix (`Badge`
  l'est, sinon un `__line`).
- **`.ds-offer--wide`** : la colonne prix de 20 rem de la carte d'offre du site d'ouverture (15 rem
  par défaut), où ancien prix, montant et « / mois à vie » tiennent sur une ligne à 1440.
- **Vitrine.** « Parcours », section « Prix barré : l'offre de lancement » : les trois cartes (Script,
  Analyse, Programmation), `--row`, `--sm`, au-dessus, `--inline` dans un badge et une ligne de méta,
  vérifiés en clair, en sombre et à 390. La note de « Prix et avantages » ne dit plus « deux colonnes
  fixes » (périmée depuis 0.6.1).
- **Migration.**
  **Hub** : `PrixBarre` disparaît. Dans `PrixOffre`, l'ancien prix passe APRÈS le montant :
  `<span class="ds-price__amount">{prix}</span>{ancienPrix ? <s class="ds-price__old"><span class="ds-price__sr"> au lieu de </span>{ancienPrix}</s> : null}`
  (les classes utilitaires de `PrixBarre`, `font-display text-heading-xl decoration-[3px] mr-space-1`,
  tombent). Les usages `sm` (`ToolCard` méta, `Fenetres`, `Fiche` dans un `Badge`, `PaymentView`)
  prennent `.ds-price__old--inline`, écrit après le nouveau prix, dans le `Badge` ou dans un
  `.ds-price__line` qui ne contient que le prix ; `PaymentView` garde son `text-text-muted` sur la
  ligne. Le libellé `fr.lancement.ancienPrix` (« Prix normal … ») devient le texte masqué « au lieu
  de ». Les cartes d'outil qui portent l'offre de lancement peuvent prendre `.ds-offer--wide`.
  **mcp-ui** : rien à retirer ; un écran qui affiche un prix de lancement prend la même écriture
  (`.ds-price--sm` + `.ds-price__old`, ou `--inline` dans un badge).

---

## 0.6.2 — `Avatar referrerPolicy`, pied d'écran à trois boutons

Deux ajouts demandés par les consommateurs, le 11/10/2026. Une classe nouvelle, `.ds-card__foot-actions`.

- **`Avatar referrerPolicy`** : passé tel quel à l'`<img>`. Le hub affiche des photos de CDN qui exigent
  `no-referrer` et posait l'image lui-même dans la coque `.ds-avatar` pour contourner : il écrit
  désormais `<Avatar src={…} referrerPolicy="no-referrer" />`.
- **Le pied d'un écran de Claude serre ses boutons.** Dans la coque, les boutons **md** de
  `.ds-card__foot` prennent un rembourrage horizontal de 16 au lieu de 22 : trois actions tiennent sur
  une ligne à 680, la maquette des écrans. Une règle de coque,
  `.ds-card--screen .ds-card__foot .ds-btn:where(:not(.ds-btn--sm,.ds-btn--xs,.ds-btn--lg))`, rien à écrire
  au site d'appel ; sm, xs et lg gardent leur cran, les boutons hors de la coque ne bougent pas. Plusieurs
  boutons vont dans **`.ds-card__foot-actions`** (classe nouvelle) : le groupe poussé à droite, la
  gouttière entre eux, aligné à droite quand il passe dessous — avant, chaque bouton nu poussait et ils
  s'écartaient.
- **Vitrine.** « Outils et écrans » : un écran au pied à trois boutons, en clair et en sombre ; « Fiches et
  rangées » : un avatar photo avec `referrerPolicy`.
- **Migration.** **Hub** : `AccountPhoto` disparaît au profit de `<Avatar src referrerPolicy="no-referrer" />`.
  **mcp-ui** : retirer `.y-foot__actions > .ds-btn:not(.ds-btn--sm) { padding-inline: 1rem }` de
  `components.css` ; `.y-foot__actions` devient `.ds-card__foot-actions` quand les actions vont à droite
  (`--start` et `--col` restent à mcp-ui).

---

## 0.6.1 — la coque gagne dans son périmètre, les grilles cèdent une colonne

Deux corrections remontées par mcp-ui et le hub, le 11/10/2026. Aucun nom nouveau pour les
consommateurs, aucun composant ni glyphe ajouté.

- **La coque d'écran gagne toujours dans son périmètre.** `.ds-card--screen` est elle-même une
  `.ds-card` : trois règles de contexte déclarées après elle à la même spécificité
  (`.ds-card .ds-inset`, `:is(.ds-card,.ds-modal) .ds-dropzone`, `:is(.ds-card,.ds-modal)
  .ds-upload`) repeignaient l'encart, le dépôt et l'envoi en `--background`, et le repos de la tuile
  panneau (0,4,1) battait `.ds-card--screen .ds-tile` (0,2,0). Corrigé à la source, en trois gestes :
  le bloc de la coque passe **en tête de `patterns.css`** (il ne gagne sur un défaut qu'à la
  spécificité, et un état déclaré après lui — survol, coché, invalide, désactivé — le bat à égalité,
  donc survit sans être recopié) ; **toute règle de contexte qui peint un descendant s'écrit
  `:where(.ds-card,.ds-modal) .ds-x`** (champ, encart, encart de bandeau, barre d'onglets et son onglet
  choisi, voile, dépôt, envoi, colonne de semaine, barre d'agenda) ; et la coque **redit** ce qui doit
  la battre dans son périmètre (le repos de la tuile panneau, « La suite » en étapes compactes sur le
  fond, le rail d'un panneau relevé en `--surface-alt`). La règle de la carte elle-même s'écrit
  `.ds-card.ds-card--screen`. La règle redondante `.ds-card--screen .ds-btn--secondary` disparaît
  (le bouton secondaire porte `--secondary` partout), de même que `.ds-card--screen .ds-tile.is-recommended`
  (la règle du motif suffit, et le focus repasse devant l'ombre).
  **Garde nouveau, `check-coque.mjs`** (quatorze dans `npm run lint`) : il calcule la spécificité de
  chaque règle, vérifie l'ordre, que chaque défaut recouvert est battu, qu'aucun état n'est avalé, et
  qu'un état redit par la coque bat le même état écrit par un contexte ; jumeau de falsification à
  chaque appel. Piège 7 de `docs/PIEGES.md`.
- **`.ds-perks` et `.ds-tiles` : deux colonnes tant que chacune a la place, une en dessous.** Les deux
  colonnes fixes coupaient des mots dans les cartes d'outil compactes et « Instagram » lettre par
  lettre à 390 dans la colonne du formulaire d'onboarding. Désormais
  `repeat(auto-fit, minmax(max(<min>, 50 % − gouttière / 2), 1fr))` : jamais plus de deux colonnes,
  une seule dès qu'une colonne passerait sous `--perks-col-min` (9 rem, 144) ou `--tiles-col-min`
  (11,5 rem, 184), deux jetons nouveaux de `tokens/scales.css`. Un mot ne se coupe jamais :
  l'`overflow-wrap:anywhere` du titre de la tuile de choix est retiré, et la colonne est au moins aussi
  large que le plus long libellé. La gouttière des avantages devient `--perks-col-gap` (24 ; 20 en
  `--compact` et dans la coque).
- **Vitrine.** La coque de « Outils et écrans » montre maintenant un encart, un dépôt compact, un envoi
  cadré et un état vide compact, relevés en `--card` en clair et en sombre.
- **Migration.** Rien à renommer. **mcp-ui** : retirer le contournement de `components.css`
  (`.ds-card.ds-card--screen :is(.ds-inset,.ds-dropzone,.ds-upload)` et
  `.ds-card--screen .ds-tile--panel:not(…)`) à la montée, le ds le porte. **Hub** : rien à écrire ;
  `OutilChoixCarte`, `ToolCard` (avantages compacts) et `PlatformTile` (tuiles de choix à 390) changent
  de rendu seuls ; un site qui veut forcer une colonne plus étroite redéclare `--perks-col-min` ou
  `--tiles-col-min` sur la grille.

---

## 0.6.0 — la maquette fait foi, seconde moitié : dépôt, média, agenda, rangées, fiches, avatars, réseaux

Les points 12 à 20 de l'arbitrage du 10/10/2026, les sept compléments de la liste du hub
(`apps/hub/docs/ecarts-maquettes-2026-10-10.md`, « Composants manquants ») et trois précisions de
Julien (le ton doux des encarts, les cadres de miniature en sombre, « La suite » et `StepCard` en une
seule brique). Un composant nouveau, `Reseau` (38 composants) ; quatre glyphes (60).

- **Rendus qui bougent chez les consommateurs** (à relire à la montée de version) :
  - `Avatar` est réécrit : `size` nommé (défaut `heros`), `halo` à `false` par défaut, classes
    `.ds-avatar*` à la place des styles inline. Hub : `AccountCard`, `InfosTab`, `ComptesConnectes`,
    `AccountFoundCard` / `AccountPhoto` ; mcp-ui : `CreatorAvatar`.
  - `EmptyState` : la pastille par défaut devient ronde et neutre (était `panneau brand outlined`).
  - `.ds-week__date` passe sur `--accent` et son numéro en dégradé (était `--muted`, encre).
  - `.ds-agenda__cell.is-outside` n'est plus grisé.
  - `.ds-media__play` devient un disque clair (était un glyphe nu).
  - `.ds-tabs` défile quand elle est trop étroite ; `--sm` passe à 36 px.
  - `Modal` : `lg` passe de 520 à 480 ; gap interne 20 (était 24) ; le pied passe à la ligne.
  - `.ds-btn--danger-soft` et `.ds-icon-btn--danger-soft` portent un filet.
  - `.ds-input.is-error` porte un anneau ; `.ds-error` passe en graisse normale, gap 5, icône 0,875.
  - `--card-pad` : rien de plus (réglé en 0.5.0).
- **12 · Dépôt** : `Dropzone variant="compact"` + `linkLabel` (`.ds-dropzone--compact`,
  `.ds-dropzone__link`), `.ds-upload--bare`, rayon md dans un écran ; un fichier refusé remplace la
  zone (doc), pas de « Pause ». Hub : la zone de dépôt de la fiche (`VideoSection`), la modale
  « J'ai déjà ma vidéo » ; mcp-ui : le dépôt et l'envoi de Programmation.
- **13 · Média** : `.ds-media__play` en disque (`--sm`), `.ds-media--brand`, `.ds-media--wide` +
  `__title` + `__note`, cadres `.ds-frame` détourés en sombre. Hub : `VideoSection`,
  `MiniatureSection`, `Calendrier`, `ListeContenus` ; mcp-ui : les vignettes d'Analyse, de Métriques
  et de Programmation (un seul dessin).
- **14 · Agenda** : `.ds-week__date` sur `--accent`, `__num` en dégradé, aujourd'hui en plaque 36,
  `.ds-week__note` (+ `--danger`), `.ds-agenda__bar` (+ `__nav`, `__title`, `__legend`),
  `.ds-agenda--tiles` (+ `__day-label`, `__marks`), hors mois non grisé. Hub : `Calendrier` ; mcp-ui :
  la semaine et le mois de Programmation, la bande du récapitulatif.
- **15 · Rangées** : `.ds-rows` / `.ds-row` (+ `--lg`, `--plate`, `--danger`, `.is-editing`, `__lead`,
  `__main`, `__title`, `__meta`, `__value`, `__end`, `__actions`, `__chevron`), `.ds-settings` /
  `.ds-setting` (+ `--end`, `__label`, `__title`, `__help`, `__control`), `tr.is-danger`. Hub :
  `ComptesConnectes`, `SettingRow` (Paramètres), `RuleRow` (Mes règles), `ListeContenus` (la ligne en
  échec), `SubscriptionResultView`, `DocumentsCard` ; mcp-ui : les lignes de compte, de contenu et de
  confirmation, « La suite », la meilleure vidéo de Métriques.
- **16 · États vides** : `EmptyState` à pastille ronde neutre, `compact` (`.ds-empty--compact`),
  cadre plein sur `--card` dans un écran. Hub : l'état vide de Mes contenus, « Textes pas encore
  écrits » ; mcp-ui : les panneaux d'erreur d'Analyse, « Aucun compte connecté » de Métriques.
- **17 · Têtes de section et barre** : `.ds-card__band` (+ `.ds-card__num`, `__band-meta`, `--muted`,
  `--bleed`), `.ds-topbar` (+ `__main`, `__row`, `__title`, `__meta`, `__end`, `__end--mobile`, jeton
  `--topbar-h`), `.eyebrow--muted`, `.ds-etapes` / `.ds-etape` (+ `--compact`, `__lead`, `__title`,
  `__text`). Hub : `SectionFiche`, `TextesSection` (la bande réseau), `FicheHeader` / `PageHeader`,
  `SuiteDansClaudeCard`, les cartes 1 · 2 · 3 de Hub-05 ; mcp-ui : « La suite » de Script, le sur-titre
  de Confirmation.
- **18 · Onglets, modales, danger** : `.ds-tabs` défile, `--sm` à 36 (`--tabs-h-sm`) ; `Modal size`
  `lg·xl·2xl` (480 / 560 / 600, jetons `--modal-w-lg/-xl/-2xl`), `subtitle`
  (`.ds-modal__head-main`, `__subtitle`), gap 20, pied en `flex-wrap` ; danger doux à filet,
  `IconButton variant="ghost-danger"`. Hub : `ParametresLayout` (ses onglets), `NouveauContenuModal`,
  `PaymentModal`, `SubscriptionModals`, `Fenetres`, l'en-tête de fiche (corbeille) ; mcp-ui : rien.
- **19 · Avatars, chiffres, champs** : `Avatar` (`size` nommé, `tone` muted / neutral / brand, `ring`,
  `badge`, `surface`, `halo` opt-in), `.ds-stats` / `.ds-stat`, `Pastille tone="accent"`, `Input
  prefix` (`.ds-input-unit__prefix`), anneau du champ invalide, `.ds-error` à la maquette + `.ds-note`,
  `.ds-meter--center`, `.ds-sidebar__account`, `.ds-appbar` (slot `appbar` d'`AppShell`). Hub :
  `AccountCard`, `HubSidebar`, `HubLayout` (la barre haute), `ToiPage` (le « @ »), `AccountFoundCard`,
  `ToiVerif`, la jauge « non évaluable » ; mcp-ui : `CreatorAvatar`, les tuiles de métrique.
- **20 · Réseaux et glyphes** : `Reseau` (Instagram, TikTok, YouTube, Claude ; `xs·sm·md·lg·xl` ;
  jetons `--reseau-*` dans la marque ET le gabarit, jumeaux sombres de TikTok et de Claude),
  `.ds-reseaux` ; glyphes `users`, `heart`, `share`, `bookmark`. Hub : `ReseauMark`, `PlatformGlyphs`,
  `ClaudeMark`, `YunaryClaudeLockup` (les couleurs de tiers sortent du hub) ; mcp-ui : `ReseauTile`.
- **Précisions** : `Banner tone="soft"` (crème rosée, texte à l'encre) ; `.dark .ds-frame` détouré ;
  `.ds-etapes` sert les deux maquettes.
- **Contraste** : 9 paires de plus, 92 au total ; quatre écarts assumés de plus (32) : le numéro du
  jour en dégradé et aujourd'hui sur sa plaque, la vignette dégradée, le glyphe de lecture sur son
  disque.
- **Vitrine** : une page « Fiches et rangées » montre chaque motif en clair, en sombre et à 390 px.
- **Backlog** : le mode photo d'`Avatar`, le préfixe d'`Input` et le pied de `Modal` en sortent.

## 0.5.0 — la maquette fait foi, première moitié : offre, compteurs, badges, étapes, coque d'écran

L'audit du ds 0.4.0 face aux maquettes retouchées le 10/10/2026 (Outils, Onboarding, Script et
Programmation Web, HubParametres, Script, Programmation, Compte, Analyse et Métriques MCP), et les
arbitrages de Julien : **la maquette fait foi**. Un motif qu'elle dessine et que le ds n'a pas
s'ajoute au ds ; seules deux règles d'accessibilité l'emportent sur elle (jamais `--primary` en
texte, tout lisible en sombre). Ce lot couvre les points 1 à 11 de l'arbitrage ; les points 12 à
20 (dépôt, média, agenda, rangées, états vides, têtes de section, onglets et modales, danger doux,
avatars et champs, brique réseau) viennent en 0.6.0. `docs/DESIGN.md` est réécrit en conséquence
(liste de l'accent élargie, icône de badge facultative, cran `xs`, `--card-pad` réglé).

- **Rupture, une seule : `Badge corner` est retiré** (`.ds-badge--corner`, 0.4.0). « Recommandé »
  est revenu en fin de rangée sur la maquette ; `check-catalogue` empêche son retour.
- **Rendus qui bougent chez les consommateurs** (à relire à la montée de version) :
  - `--card-pad` revient aux valeurs du socle, 24 / 28 (la marque ne le redéclare plus : toutes les
    cartes du hub passent de 28 à 24) ; les cartes d'outil et d'offre prennent `Card size="xl"`
    (28 / 32).
  - `.ds-perks` / `.ds-perk` : plus de plaque, body-sm à l'encre, deux colonnes fixes (même à 390),
    `Pastille size="coche"` (24 px) à la place de `puce`. Hub : `CheckLine` (qui réduisait `carte` à
    1,5 rem), `ToolCard`, l'offre de la fiche ; mcp-ui : `OfferCard`.
  - `.ds-banner--inset .ds-banner__title` passe en body gras.
  - `.ds-veil__panel` : padding 64 / 32 (était 48 / 32).
- **1 · Bénéfices** : `.ds-perk` nu, `Pastille size="coche"` (jeton `--pastille-coche`, coche
  0,875 rem trait 3), `.ds-perks--compact` (et dans un écran de Claude). Hub : `CheckLine`,
  `ToolCard`, `Offre.tsx`, `OutilChoixCarte` ; mcp-ui : `OfferCard`.
- **2 · Cartes d'outil** : `Card size="xl"`, `badge` (collé au titre, `.ds-card__title-row`),
  `upcoming` (`.is-upcoming`), `.ds-offers` (pile à 16), `.ds-offer` (+ `__main`, `__aside`,
  empilée sous 64 rem), `.ds-panel` (+ `__actions`, `.is-locked` : un seul estompage). Hub :
  `ToolCard`, `PackLine`, `OutilChoixCarte`, la page Mes outils ; mcp-ui : les cartes d'outil de
  Compte (« Ce que Yunary sait faire »), le bloc profil.
- **3 · Compteurs** : `.ds-meter` (+ `__head`, `__label`, `__value`, `__of`, `__note`) et
  `.ds-meters` ; le rail de `Progress` passe en `--card` dans un écran de Claude, `--surface-alt`
  dans un `.ds-panel`. Hub : `ToolCard` (ses deux jauges et son `bg-background`), la carte Analyse
  de l'onboarding ; mcp-ui : `mon_compte`, le refus de quota d'Analyse.
- **4 · Interrupteur verrouillé** : `Switch locked` (`.is-locked`, `aria-readonly`, cadenas
  `.ds-switch__lock`) et `labelPosition="start"` (`.ds-switch--label-start`). Hub :
  `OutilChoixCarte` (« Toujours actif »).
- **5 · Badges** : icône facultative (doc), créneau d'icône hors `dense` (0,875 rem),
  `tone="brand"` (`.ds-badge--brand`), `lead` (`.ds-badge--lead`), `onRemove` /
  `removeLabel` (`.ds-badge__remove`), `corner` retiré. Hub : `StatutBadge`, `SubscribedTools`,
  `ComptesConnectes` (« À connecter » en dégradé), le chip « Demandé depuis Claude » de
  `?ajouter=`, l'en-tête de fiche ; mcp-ui : `Badge` (ton `brand`), les chips de filtre de la liste
  d'Analyse, les cartes de hook (« Recommandé » sans languette).
- **6 · Étapes** : `.ds-steps--bar` (+ `__track`, `__seg`, `__counter`, `__counter-sub`, jetons
  `--steps-seg-h(-compact)`), `.ds-steps--vertical` (+ `.ds-step__meta`). Hub : `OnboardShell`
  (sa barre de progression), `StepMark`, `VerifyProgressCard`, `AuditChecklist`, `ToiVerif` ;
  mcp-ui : `Steps` (sa liste verticale et sa frise).
- **7 · Offre et prix** : `.ds-price--accent`, `.ds-price--row` (+ `__aside`), `Card
  variant="plaque"` (`.ds-card--plaque`, `.ds-card__body`) et `foot` (`.ds-card__foot`, lavis sur
  une feature). Hub : `Offre.tsx` (le voile et sa carte), `ComptesConnectes` (la plaque
  verrouillée), l'encart « Depuis Claude » de l'état vide, le bandeau total de l'onboarding ;
  mcp-ui : `OfferCard`, la plaque « Offert » de Métriques, le refus d'Analyse.
- **8 · Coque des écrans de Claude** : `Card variant="screen"` (`.ds-card--screen` : padding
  18 / 20 / 20, `--background`, sans ombre, pile, en-tête à gap 10, tout ce qui s'y pose relevé en
  `--card`, tuile choisie redescendue), `.ds-card__foot`. Décision écrite : surfaces du ds forcées
  dans Claude, seul le thème suit l'hôte ; les bulles sont à Claude. mcp-ui : `Card`,
  `CardHeader`, `components.css` (la coque `y-card` et ses variables `--hs/--ht/--hm/--hb/--hbg`),
  `FullScreen`.
- **9 · Encarts** : `Banner` — titre d'encart en body gras, une `Pastille` à la place de
  l'icône, `align="start"` (`.ds-banner--start`). Hub : `VideosAnalyseesLine`, les tuiles
  d'information de la carte Analyse, le bandeau « Compte privé » de `ToiVerif` ; mcp-ui :
  `Notice`, les erreurs de dépôt de Programmation.
- **10 · Copier** : `Button size="xs"` (`.ds-btn--xs`, jeton `--control-xs` 28 px). Hub :
  `CopyButton`, les en-têtes de champ des fiches (`TextesSection`, `TranscriptionSection`,
  `ScriptSection`) ; mcp-ui : `CopyButton`, les en-têtes de champ de Textes.
- **11 · Tuiles de choix** : `.ds-tile--choice` (+ `.ds-tiles`, `.ds-tile--span`,
  `<button aria-pressed>` accepté), `.ds-tile--lift`, `.is-recommended`, et dans un écran les
  surfaces inversées (portées par `.ds-card--screen`). Hub : `PlatformTile`, la tuile « Je n'ai
  pas de compte », `NouveauContenuModal` (ses deux tuiles) ; mcp-ui : `HookCard`,
  `ScriptVersion` (recommandée), les créneaux et les panneaux de miniature de Programmation.
- **Contraste** : 5 paires de plus, 83 au total ; deux écarts assumés de plus (28) : le badge et
  le montant en dégradé, la même décision que le label du CTA.
- **Vitrine** : une page « Outils et écrans » montre chaque motif en clair, en sombre (la coque
  d'écran y est rendue sombre même quand la vitrine est claire) et à 390 px.

## 0.4.0 — les parcours : étapes, voile, offre, dépôt, média, agenda

Les manques des maquettes Yunary Script et Yunary Programmation (dans Claude et dans le hub), de
Paramètres, Compte, Mes outils et de l'onboarding (09/10/2026), pour que le hub et les écrans de
Claude n'aient plus qu'à assembler. Règle suivie : réutiliser, sinon une variante, créer en
dernier. Un seul composant React nouveau ; tout le reste est en classes, utilisables en Preact.
Aucune rupture : tout est additif, les rendus existants ne bougent pas.

- **Variantes de l'existant.**
  - `Pastille size="puce"` (1,75 rem, jeton `--pastille-puce`) : un numéro d'étape, la coche d'un
    avantage. Les maquettes réduisaient `carte` au site d'appel.
  - `Badge corner` (`.ds-badge--corner`) : la languette « Recommandé » collée au coin d'une carte.
  - `Banner` : tons `amber` et `neutral`, `inset` (`.ds-banner--inset`, l'encart d'information
    dans une carte, sans filet sur les tons colorés), `icon` pour remplacer le glyphe du ton.
  - `FormField action` (`.ds-field__head`) : « Copier » à droite du libellé.
  - `Tabs size="sm"` (`.ds-tabs--sm`) : le filtre compact dans une carte, qui défile à 390 px.
  - `EmptyState plain` (`.ds-empty--plain`) : l'état vide sans cadre, dans une section bordée.
  - `.ds-tile--panel` (+ `.ds-tile__row`, `.ds-tile__end`) : un choix riche en colonne
    (miniature, créneau, façon de commencer). Choisi : `--card` + filet `--primary`, sans plaque.
  - `.ds-inset--stack` (+ `.ds-inset__head`) : l'encart en plusieurs blocs, en-tête et « Copier ».
  - Sept glyphes : `upload`, `download`, `pause`, `video-off`, `list`, `pencil`, `log-out`
    (56 glyphes).
- **Création : `Dropzone`** (+ `.ds-dropzone*`) : la zone de dépôt d'un fichier (repos, survol,
  fichier tenu au-dessus, focus, invalide, désactivée). Aucun composant ne couvrait le
  glisser-déposer. Le composant ne valide rien : l'app contrôle et dit pourquoi.
- **Créations en classes : les motifs des parcours.**
  - `.ds-steps` : la barre d'étapes (faite, en cours, à venir).
  - `.ds-veil` / `--below` : le voile d'un outil non activé (recouvre ou empile).
  - `.ds-price` et `.ds-perks` : le prix et les avantages d'une offre.
  - `.ds-file` et `.ds-upload` : le fichier et son envoi (en cours, en pause, interrompu).
  - `.ds-media` (9:16, `--unavailable`) et `.ds-frames` : le média vertical et le choix d'un moment.
  - `.ds-agenda` (le mois, `--compact`) et `.ds-week` (la semaine, `--compact`) : le `Calendar`
    choisit une date, il n'affiche pas d'événements.
  - `.ds-mark`, `.ds-snippet`, `.ds-cues`, `.ds-dl`, `.ds-diff` : les marques de texte.
- **Jetons** (`scales.css`) : `--pastille-puce`, `--step-mark`, `--dropzone-h`, `--veil-h`,
  `--agenda-cell-h(-compact)`, `--week-day-w(-compact)`.
- **Contraste** : 8 paires de plus, 78 au total. Deux écarts assumés de plus (26) : le chiffre
  blanc sur le dégradé de l'étape en cours et du jour d'aujourd'hui, la même décision que le
  label du CTA.
- **Vitrine** : une page « Parcours » montre chaque motif et ses états, clair, sombre et 390 px.

## 0.3.0 — listes de choix, choix d'une valeur, champ verrouillé, encart de valeur

Les manques des pages Profil créateur, Paramètres et de la carte d'outil du hub (maquettes
HubProfil, HubParametres, Hub-Outils-CarteAnalyse). Règle suivie : étendre l'existant, ne créer
qu'en dernier recours. Aucune rupture : tout est additif, les rendus existants ne bougent pas.

- **`.ds-tile--compact` et `.ds-tile--chip`** — la tuile cochable étendue pour une LISTE de
  choix, sur une ligne. `--compact` garde la case (choix simple : une niche) ; `--compact` +
  `--chip` est une pastille en pilule pour un choix multiple (passions, vécus, humour) : case
  masquée visuellement, `<input>` toujours focusable et annoncé, coche `.ds-tile__check` en tête
  une fois cochée. Glyphe de tête `.ds-tile__lead` (Icon, ou emoji quand l'emoji est la donnée).
  Lecture seule : `.is-readonly` ou `aria-readonly="true"`. Classes seules, documentées dans
  « Classes sans composant ». La limite `max` reste à l'app.
- **`Tabs` : `mode="choice"`, `fullWidth`, `disabled`, `readOnly`, `items[i].disabled`** — le
  même rendu pour choisir une valeur parmi trois ou quatre : `radiogroup` / `radio` +
  `aria-checked`, un seul arrêt de tabulation, flèches, Début / Fin. `.ds-tab[aria-checked]`
  porte la convention de l'élément sélectionné ; `.ds-tabs--block`, `.ds-tab:disabled`,
  `.ds-tabs[aria-readonly]`. Le mode `tabs` (défaut) est inchangé.
- **`Button variant="danger-soft"`** — la recette de l'`IconButton` du même nom
  (`.ds-btn--danger-soft`) : l'action destructrice secondaire (retirer, se déconnecter).
- **`Input iconEnd`** — un glyphe dans le champ, à droite (`.ds-input-unit--icon`,
  `.ds-input-unit__icon`), compatible avec `unit`. `.ds-input[readonly]` : texte en sourdine,
  curseur neutre, focus conservé. Nouveau glyphe `lock` au catalogue (49 glyphes). Ferme
  l'entrée « Slot d'icône sur `Input` » du BACKLOG.
- **`.ds-inset`** (+ `--dashed`, `--bare`, `__value`, `__action`) — l'encart de valeur posé
  dans une carte. Créé parce que rien ne le couvrait : `Card` est la surface racine (on ne
  l'imbrique pas), `EmptyState` une colonne centrée à pastille, `StateCard` un héros, et le
  socle n'avait aucune surface creusée. Classe seule ; surface déduite comme celle d'un champ.
- **Contrôles** — `check-catalogue.mjs` vérifie (point 7) que chaque classe citée dans
  « Classes sans composant » existe dans `patterns.css`. `check-contrast.mjs` mesure six
  paires de plus, toutes conformes (70 paires, 24 écarts assumés, inchangés).
- **Charte** — le pill est permis pour une pastille de choix ; un emoji qui EST la donnée est
  permis en tête de tuile, jamais comme icône d'interface (`docs/DESIGN.md` § 9).

---

## 0.2.0 — le paquet ne porte que ce que Yunary emploie

Retraits décidés par Julien le 29/09/2026 (audit « zéro legacy », Q11). Chaque retrait est
prouvé par un `grep` vide dans les quatre consommateurs (shell, hub, mcp-ui, site), et inscrit
dans `check-catalogue.mjs` (point 6) et `check-classes.mjs` pour qu'aucun portage ne le
réintroduise.

**⚠ Ruptures** — aucune pour les consommateurs actuels, qui n'importent rien de ce qui part :

- **Sous-chemin `@yunary/ds/brand-content` et `brand-content.css` retirés** — `HaloHot`,
  `ContentIcon`, l'utilitaire `bg-thumbnail`, `.accent-hot`, `--color-tone-deep`. Les trois
  jetons métier (`--tone-deep`, `--gradient-thumbnail`, `--shadow-accent-hot`) quittent la
  marque et le gabarit : le contrat compte 55 jetons, marque et gabarit à égalité. Les glyphes
  `Youtube` et `Instagram` de `brand-glyphs.ts` partent avec eux ; `github` reste dans `Icon`.
- **Composants React sans consommateur retirés** — `ChoiceTile` / `CheckTile` / `RadioTile`,
  `Dropdown`, `ActionSheet`. 36 composants au lieu de 39. **Les classes `.ds-tile*`,
  `.ds-choice*` et `.ds-dropdown*` restent** : le site vitrine les emploie. Elles sont
  documentées en fin de `docs/PROMPTS.md` (« Classes sans composant ») et montrées en balisage
  nu dans la vitrine. Les classes `.ds-actionsheet*`, `.ds-scrim--sheet` et le jeton
  `--actionsheet-w-panneau`, sans autre usage, partent avec leur composant.
- **Jetons de grille vidéo retirés** — `--container-tile` (donc `grid-cards-tile`,
  `max-w-tile`) et `--aspect-video-portrait` (`aspect-video-portrait`). L'utilitaire
  `grid-cards-<rôle>` reste, sur les rôles de largeur existants (`grid-cards-dialog`…).

**Contrôles** — `check-contract`, `check-contrast`, `check-surfaces`,
`check-dark-substitution` et `check-literals` ne connaissent plus l'extension ; les tableaux de
`docs/accessibilite.md` sont régénérés (64 paires, 24 écarts assumés). `check-portage.sh`,
hors de tout script npm et en échec, est retiré.

**Docs** — commentaires, vitrine et documents au présent, sans référence aux versions
antérieures de Yunary ; exemples de la vitrine sur un contenu neutre. `brand-example.css`,
cité par `rebrand.mjs`, `GETTING-STARTED.md`, `PORTAGE.md`, `brand.template.css` et
`check-contrast.mjs` sans exister, est remplacé partout par la marque livrée,
`brand-yunary.css`. BACKLOG ramené aux manques encore ouverts. Aucune valeur de rendu ne bouge.

**Montée** : shell (tag suivant) → hub (vider `node_modules/.vite`, redéployer) → mcp-ui
(rebuild, `sync-screens.sh`, redéploiement de `mcp`), au prochain lot de chaque couche. Le site
garde sa copie de `src/styles/` : elle peut encore porter les règles retirées, sans effet.

---

## 0.1.9 — le rythme de la modale, l'alignement du contrôle d'une tuile

Deux corrections.

- **`Modal` : gap interne `--space-5` (24 px) au lieu de 0,875 rem (14).** Entre l'en-tête, le
  texte, le champ, la ligne de coût et le pied — la maquette 02 dit 22, Julien tranche pour 24,
  le palier du DS. Le padding ne bouge pas (déjà `--space-5`). Le pied perd sa marge propre de
  0,25 rem : elle rattrapait le 14 à 18 avant les boutons, avec 24 partout elle aurait fait un 28
  hors échelle. Mesuré dans la démo : 24 px entre tous les blocs, md (380) et lg (520), avec et
  sans pastille, champ + aide + ligne de coût + pied.
- **`ChoiceTile` / `CheckTile` / `RadioTile` : `align="center" | "start"`.** Les trois artboards
  ne disent pas la même chose — **S2** (sorties : titre + description + coût) et **08** (niches :
  une ligne) CENTRENT le rond ; **S3c** (propositions de hooks : un texte de deux à quatre lignes
  sans titre distinct) pose la case sur la PREMIÈRE LIGNE (`align-items:start`, 3 px pour la
  centrer sur la ligne). Une règle unique aurait trahi l'un des trois : c'est donc une prop.
  `center` reste le défaut — deux artboards sur trois, et le rendu de la 0.1.4, rien ne bouge
  sans la prop ; `start` pour S3c. Sans effet sur la tuile à média (0.1.8), centrée par
  construction : sa vignette impose la hauteur. Mesuré : `start` pose le centre de la case à
  3 px sous le centre de la première ligne (la maquette), `center` au milieu du contenu.

---

## 0.1.8 — la tuile à média collée aux bords

Une seule chose : `.ds-tile--media`, la variante de `CheckTile` / `RadioTile` avec `media`.

- **La vignette touche les bords haut, bas et gauche** (maquettes S3a / S3b). La tuile perd son
  padding vertical — `0 / 1,25 / 0 / 0` rem — et la zone de contenu le reprend (`1 rem` haut et
  bas) ; la vignette (6 rem de large) s'étire à la hauteur de la rangée, au moins 6,5 rem, et le
  rognage de la tuile (`overflow:hidden`) lui donne le rayon. En 0.1.4 la tuile gardait son
  1,125 rem vertical et la vignette flottait à 18 px des bords. Mesuré : vignette à 1 px des
  trois bords (la bordure), 104 px de haut sur une tuile courte, la hauteur du contenu sur une
  tuile longue.
- **Le titre tient sur une ligne, en ellipse**, sur cette variante seulement (la maquette) : la
  vignette impose sa hauteur, un titre qui se replie la ferait grandir.
- **Une `<img>` remplit la vignette en `cover`, hors flux** : en flux, sa hauteur intrinsèque (une
  vignette 9/16 à 96 px de large fait 171 px) dictait la hauteur de la rangée — mesuré. Absolue,
  elle remplit la boîte que le contenu et le plancher de 6,5 rem décident.
- Filet, état coché (plaque `--accent`, filet `--primary`) et désactivé inchangés ; la tuile sans
  média garde son padding `1,125 / 1,25`. Démo : vignette dégradé, vignette image, titre long,
  tuile désactivée.

---

## 0.1.7 — la tuile calculée pour quatre colonnes à 1440

Une seule chose. Rien d'autre ne bouge — aucun jeton d'espacement, pas de pilule retouchée.

- **`--container-tile` : 17,75 → 15,75 rem (252 px), CALCULÉ.** À 17,75 rem, `grid-cards-tile`
  rendait trois colonnes à 1440 et des cartes trop grosses ; la référence est la maquette 01
  Vidéos, **quatre colonnes à 1440 × 900**. Avec l'échelle d'app restaurée (103 % → racine
  16,48 px), la barre latérale à sa largeur réelle (`--sidebar-w` = clamp(15rem, 11rem + 5vw,
  18rem) → 253,3 px), les gouttières et le gap de grille à `--space-5` : zone utile 1137 px,
  quatre colonnes exigent une tuile ≤ 16,13 rem — **≤ 15,91 rem avec une barre de défilement
  classique de 15 px**. 16 rem retombe à trois colonnes dès qu'une barre s'affiche ; 15,75 rem
  tient les deux cas. Colonnes obtenues : **3 à 1280 · 4 à 1440 · 4 à 1512 · 4 à 1920** (échelle
  126 %) **· 6 à 2560** (130 %).
- **Les pilules tiennent** parce que Creator passe ses chiffres à trois caractères. Mesuré à
  103 % : « 658 k vues » + « Engagement 12 % » = 262,2 px de carte (padding 16 × 2 et bordure
  compris) pour 265,8 px de carte à 1440 (262,2 avec barre de 15 px : au pixel). Le pire cas
  « 999 k vues » + « Engagement 99 % » fait 267,1 px et **déborde de 1,3 px** — rogné par le
  `flush` de la carte, invisible ; la largeur de carte à quatre colonnes ne dépend pas de la
  tuile, seul le padding des pilules pourrait y changer quelque chose, et il ne bouge pas.

---

## 0.1.6 — l'échelle d'app restaurée, la tuile mesurée

- **⚠ `app-scale.css` reprend les quatre bandes de la 0.1.2** : 103 % sous 1600 px, 112 % à
  1600, 126 % à 1920, 130 % à 2400 ; garde-fou `min-width: 1133px` (1100 × 1,03) sous
  `@media (min-width: 64rem)`. Le passage à « 100 / 115 % » de la 0.1.3 était une **erreur de
  cadrage** prise en amont, pas une demande de Julien : tout rendait trop petit. Rien d'autre ne
  revient en arrière — le titre de page reste à 36 px, l'état sélectionné en corail, `Card gap`,
  les gouttières et tous les jetons restent ceux de la 0.1.5. Règle écrite en tête du fichier :
  on ne touche plus à l'échelle d'app ni aux tailles sans demande explicite de Julien.
- **`--container-tile` : 18,75 → 17,75 rem (284 px), MESURÉ.** La plus petite largeur qui garde
  les deux pilules de la carte vidéo sur une ligne, padding compris — « 999,9 k vues » (97,9 px)
  + « Engagement 99,9 % » (141,0 px) en `.ds-badge` (DM Sans 600 à 12,5 px, padding 4/11), gap 8,
  padding de carte 16 × 2, bordure 1 × 2 = **281,0 px = 17,56 rem**, arrondi au quart de rem
  supérieur. Ce sont les valeurs les plus longues que les formateurs émettent sous le million
  (« 658,2 k vues » est un cas réel, mesuré le 11/09 dans Creator) ; les valeurs de la consigne,
  « 12,4 k vues » + « Engagement 12,4 % », ne font que 264,7 px = 16,54 rem → 16,75 rem, et
  laisseraient repasser à la ligne toute vidéo à trois chiffres de k. Ni la pilule ni son
  padding ne bougent. `grid-cards-tile` rend une colonne de plus qu'en 0.1.5 dès que la largeur
  le permet.

---

## 0.1.5 — l'élément sélectionné en corail, comme la v1

Une décision de Julien (11/09/2026), qui renverse la couleur posée par la 0.1.4 sans en toucher
la mécanique. Aucune rupture d'API.

- **⚠ L'état actif / sélectionné est en CORAIL : texte `--primary` (`#e85d2f`) sur la plaque
  `--accent`**, même graisse que les voisins, icône et coche en `currentColor` — à la lettre de
  la v1 (`Sidebar.tsx` : `bg-accent text-primary`). Toute la convention suit : `.ds-sidenav`,
  `.ds-tab` (y compris sur une carte, où la plaque reste `--card`), `.ds-page`, `.ds-navlink`,
  les items cochés de `Dropdown` et d'`ActionSheet`, `option:checked`, `.ds-icon-btn--accent` et
  le bouton-icône enfoncé (`aria-pressed`). La 0.1.4 avait posé `--primary-readable` (le brique,
  5,16) pour tenir le seuil du texte ; Julien préfère la fidélité à la v1 et **assume l'écart de
  contraste** : 3,00 sur `--accent` en clair (3,94 en sombre), 3,25 sur `--card`, 3,28 sur
  `--secondary` — le seuil des graphiques, pas celui du texte (4,5).
- **L'écart est ÉCRIT, pas masqué.** `check-contrast.mjs` mesure les huit paires de la convention
  telles que le CSS les pose (`--primary`, une par composant parce que la taille du texte
  diffère — `.ds-actionsheet__item[aria-checked]` et `.ds-select option:checked` s'ajoutent) et
  les refuse tant qu'un bloc manque ; `brand-yunary.css` porte **huit blocs `@a11y-assume`**, un
  par paire, sous un en-tête qui dit la raison — décision de marque du 11/09/2026, fidélité à la
  v1 — et ce qui l'atténue : l'état n'est jamais porté par la couleur seule (plaque, ombre,
  coche, `aria-current` / `aria-selected` / `aria-checked`), libellés courts en 15-16 px et
  500-600, icônes de la convention à 3:1 (3,00, conformes). 66 paires, 41 conformes, 25 écarts
  assumés (17 + 8). `docs/accessibilite.md` régénéré, § 3.6 ajouté.
- **`--primary-readable` ne bouge pas** : liens, badge accent, bandeau info, erreurs, la ligne
  d'origine d'un modèle. Il reste le jeton de tout texte de marque qui n'est pas un état actif ;
  seule la convention d'état actif fait exception, et elle le dit.
- Pour une app : rien à changer par rapport à la 0.1.4 sur le plan du code — la même montée, les
  mêmes recompositions à retirer ; seule la teinte de l'actif diffère à l'écran.

---

## 0.1.4 — l'élément sélectionné, la carte qui s'empile, la carte d'état, la tuile cochable

Les corrections remontées par les audits Hub et Creator du 11/09/2026, sur les maquettes mises à
jour le même jour. Deux décisions de Julien en tête : l'espacement interne des cartes RESTE à
24 px (pas de palier 20), et **l'élément sélectionné n'est jamais en noir gras**.

### ⚠ Ce qui change à l'écran pour une app qui monte

- **⚠ L'état actif / sélectionné change de couleur PARTOUT.** Une convention unique, celle de la
  v1 (`Sidebar.tsx` : `bg-accent text-primary`) : plaque `--accent`, texte `--primary-readable`,
  **même graisse** que les éléments non actifs, icône en `currentColor`. Concrètement :
  `.ds-sidenav.is-active` (rendait surface-alt + encre + 600 + icône `--brand-via`),
  `.ds-tab[aria-selected]` et `.ds-page[aria-current]` (rendaient `--primary`), l'onglet actif
  d'une barre posée sur une carte (rendait `--foreground`), `.ds-navlink.is-active` (rendait
  encre + 600 — texte nu, il ne prend que la couleur), `.ds-icon-btn--accent` (rendait
  `--primary`), et le nouvel item coché de `Dropdown` / `ActionSheet`. **Pourquoi
  `--primary-readable` et non `--primary`** : la consigne prévoyait le jumeau lisible « si le
  contraste l'exige » — `--primary` mesure 3,00 sur `--accent` en clair, le seuil des
  graphiques, pas celui du texte (4,5) ; `check-contrast.mjs` le refuse pour un libellé. Les
  Tabs, qui posaient `--primary` avec un écart assumé, passent au jumeau avec tout le reste : une
  convention à deux couleurs n'en est pas une. Six paires mesurées (5,16 en clair, 5,85 en
  sombre), plus aucun écart assumé sur un état sélectionné. Une app qui recomposait un actif
  (`border-primary bg-accent text-foreground` sur une tuile radio, `font-semibold` sur une
  entrée) retire sa recomposition à la montée.
- **⚠ `--container-tile` : 15 rem → 18,75 rem (300 px)**, la largeur de carte de la v1. À 15 rem,
  les deux pilules « vues » + « engagement » d'une carte vidéo passaient à la ligne ; à 18,75 rem
  elles tiennent sur une ligne de 1280 à 2560 px. `grid-cards-tile` rend donc, à largeur
  égale, **autant ou moins de colonnes** qu'avant — jamais plus.
- **⚠ `Dropdown` flottant s'ancre désormais sous son déclencheur** (`top: calc(100% + 6px)`,
  `left: 0` ; `align="end"` → `right: 0`). Une app qui posait `top`/`right` en style inline pour
  compenser retire son style ; **le parent doit être en `position: relative`**. Le rail d'item
  passe de 38 à 44 px (`--dropdown-item-h`) et son texte de body-sm à `--text-control` : un menu
  est plus haut de 6 px par ligne.

### Card

- **`gap={3|4|5|6}` — la pile, opt-in.** `.ds-card` est `display:block` : un `gap-space-*` posé
  en `className` ne rend RIEN, et 23 cartes de Creator en portaient un pour 0 px d'écart. La prop
  passe la carte en colonne flex avec l'écart du palier ; l'en-tête cède sa marge basse au gap.
  Sans `gap`, DOM et rendu identiques à la 0.1.3. Quatre paliers, pas de 20 : l'espacement
  interne d'une carte reste sur l'échelle — et le padding reste à 24 (décision Julien).
- **`<Separator bleed />` — le filet de bord à bord.** Enfant DIRECT d'une carte, il annule le
  `--card-pad` (ou `--card-pad-lg`, lu par la taille de la carte) en marge négative et s'étire
  (`width:auto` — `100 %` + marges négatives laisserait un pad à droite). Il reste dans la boîte
  de bordure : rien ne déborde, aucun `overflow` à poser ; une carte `flush` n'a rien à annuler.

### Modal

- **Sans icône, le titre partage la ligne de la croix**, centré verticalement. La croix seule
  occupait une rangée de 32 px et le titre tombait 46-56 px sous le bord (audit Creator,
  maquette 02). Avec une pastille, la rangée pastille + croix reste et le titre passe dessous.
- **`size="lg"` : 32,5 rem** (`--modal-w-lg`, 520 px), la modale à formulaire — « Analyser une
  vidéo ». `md` (23,75 rem) reste la confirmation et le résultat. Sans effet sous 64 rem. Jeton
  proposé au § 4.3 du gabarit.

### Dropdown, ActionSheet

- **`align="start" | "end"`** et l'ancrage sous le déclencheur — voir ⚠ ci-dessus.
- **`checked` sur un item** : un menu de CHOIX (tri, filtre « Tous les réseaux »).
  `role="menuitemradio"` + `aria-checked`, la convention de l'élément sélectionné, coche en fin
  de ligne. `undefined` = un item d'action, sans coche ; les deux se mélangent dans un même menu.
  `ActionSheet` reçoit le même `checked` — même geste, deux tailles d'écran.
- Rail d'item à 44 px (`--dropdown-item-h`, § 4.3 du gabarit), texte `--text-control` (maquette 01).

### IconButton

- **`variant="danger-soft"`** — la corbeille : fond `--pill-danger-bg`, glyphe
  `--pill-danger-fg`, sans bordure (5,47 / 6,59 mesurés). Le `danger` plein reste l'action
  destructrice UNIQUE d'une vue ; à côté de chaque ligne supprimable, c'est le doux.

### StateCard — nouveau, sorti du BACKLOG à la troisième demande

- La carte d'état HÉROS : l'attente, l'indisponible, l'erreur, le cas limite. `Card lg` centrée,
  **pastille héros outlined et carrée** (la v1 la faisait ronde ; les maquettes du 11/09 la
  posent carrée, comme partout), titre subheading, corps muted sur la colonne `narrow`, un
  appoint libre (`children`), une action. Tons `brand` (`role="status"`) et `danger`
  (`role="alert"`). Ce n'est pas `EmptyState` (un emplacement vide en pointillés). La coque
  (`AuditStateCard`) et Creator remplacent leur composition à la montée.

### ChoiceTile — nouveau : `CheckTile`, `RadioTile`

- **Une seule anatomie pour tous les choix en tuile** — la niche de la coque, les sorties et les
  modèles de Creator en composaient cinq. Fond `--background`, radius md, filet 1,5 px ;
  cochée : filet `--primary` + plaque `--accent`, le titre reste en encre à sa graisse. **La
  tuile EST le `<label>`** : toute sa surface coche, clavier et formulaire sont ceux de l'`<input>`
  natif (`name`, `value`, `required`, la ref de react-hook-form), le contrôle du socle rend
  dedans (`.ds-choice`, dans un `<span>` — un label imbriqué est du HTML invalide). Colonnes :
  [`media` optionnel] contrôle · `title` / `description` / `children` · `meta`. `:has()` lit
  l'état de l'input ; l'anneau de focus est porté par la tuile. Quatre paires mesurées (titre,
  description, filet sur carte et sur page).

### Jetons

- **`--container-aside` : 20 rem** (320 px) — la colonne latérale d'une fiche, v1. `w-aside`.
- **`--aspect-video-portrait` : 9 / 16** — `aspect-video-portrait`, le format d'une vignette
  verticale (sept `aspect-[9/16]` dans Creator). L'échelle native n'est pas supprimée.
- `--modal-w-lg` (32,5 rem) et `--dropdown-item-h` (2,75 rem), voir ci-dessus. Le § FACULTATIF
  du gabarit passe à 36 réglages.
- **`.ds-select option:checked`** suit la convention — là où le navigateur peint les options
  (Firefox, Chrome Windows/Linux) ; macOS et iOS rendent leur liste système.

### BACKLOG, docs

- Fermées : **carte d'état héros** et **tuile cochable** (+ la **tuile radio** de la coque, même
  objet) — entrées au socle ; **en-tête accentué sur `Table`** — la maquette est revenue au
  `framed` standard, sans objet. La ligne « mesures de mise en page sans jeton » ne garde que les
  gabarits de grille sans mesure. Note en tête : **la pastille de marque est outlined** sur toutes
  les maquettes du 11/09 (`docs/DESIGN.md` § 6).
- `check-contrast.mjs` : 63 paires (+10 : la convention par composant, le danger doux, la
  tuile). 46 conformes, les 17 écarts assumés inchangés. `docs/accessibilite.md` régénéré.
- Démo : un spécimen par ajout — pile + filet (Data display), modale lg et titre en ligne, menu
  ancré `align="end"` et items cochés (Overlays), corbeille (Actions), trois StateCard
  (Feedback), RadioTile / CheckTile avec média et états (Formulaires), jetons (Fondations).

---

## 0.1.3 — proportions v1 : échelle d'app 100 / 115 %, titre de page 36 px

Un constat de Julien (11/09/2026), l'app refondue posée à côté de la v1 sur le même écran : **trop
grosse et trop aérée**. Deux causes, deux retours à la valeur de la v1. Aucune rupture d'API ; le
rendu de toute app qui importe `app-scale.css` change, c'est le but.

- **`app-scale.css` : les proportions de la v1.** Racine à **100 %**, et **115 % à partir de
  2240 px** — le seul palier, celui de `legacy-v1/app/src/index.css`. Les quatre bandes
  (103 / 112 / 126 / 130 %) visaient une largeur effective proche de la maquette 1440 sur tout
  écran ; à l'usage elles grossissaient tout ce que la v1 montrait à l'échelle 1. La maquette
  reste la référence de dessin, elle ne dicte plus un zoom. Le garde-fou desktop suit :
  `min-width: 1100px` (1100 × 1,00), toujours sous `@media (min-width: 64rem)`. Sur un écran
  courant, une app rend désormais **exactement** ce que rend le site : la différence ne se voit
  plus qu'au-delà de 2240 px.
- **Le titre de page revient à 36 px** (`--text-heading-xl: 2.25rem`, la valeur de la v1 ; le
  socle dit 40). Réglé **dans la marque**, pas dans le socle : le 40 est le défaut du gabarit, le
  36 est un choix de Yunary — même mécanisme que `--card-pad` ou `--sidebar-w` (redéclaration en
  `:root` après `core.css`). Le piège, et il est écrit à côté de la ligne : le palier mobile
  (28 px sous 64 rem) vit dans une media query du socle, qu'une redéclaration nue aurait écrasée —
  la media query est **répétée dans `brand-yunary.css`**, le mobile ne bouge pas. Le gabarit
  `brand.template.css` gagne un § 4.4 qui propose ce seul palier, avec le piège ; les autres
  paliers ne sont pas proposés, exprès.
- **`grid-cards-<rôle>` : la grille de cartes en auto-fill, sortie du `BACKLOG.md`.** Creator
  (vidéos, `grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]`) et le Hub (outils,
  `repeat(auto-fill, minmax(min(var(--container-dialog), 100%), 1fr))` en style inline) écrivaient
  la même formule chacun de leur côté. Le choix retenu, entre « un jeton par usage » et « un
  utilitaire paramétrable » : **l'utilitaire paramétré par un rôle de largeur**. `@utility
  grid-cards-*` lit `--value(--container-*)` et pose
  `grid-template-columns: repeat(auto-fill, minmax(min(<rôle>, 100%), 1fr))` — `grid-cards-tile`
  pour Creator, `grid-cards-dialog` pour le Hub, dont le jeton existait déjà. Un jeton par usage
  aurait fixé une largeur par nom (`grid-cols-cards` = 15 rem, et un second pour 27,5) alors que
  la largeur est déjà nommée par son rôle : un seul mécanisme, aucune valeur en double, et un
  futur usage choisit un rôle au lieu d'inventer une mesure. Il ne pose pas `display: grid`,
  comme `grid-cols-*` : `grid grid-cards-tile gap-space-5`. Le `min(…, 100%)` empêche une carte
  de déborder d'un conteneur plus étroit qu'elle.
- **`--container-tile` : 15 rem (240 px), la largeur MINIMALE d'une tuile de grille** — le
  sixième rôle de `--container-*`, et le premier qui soit un minimum plutôt qu'un maximum de
  colonne. Le `BACKLOG.md` proposait `--container-card` : renommé, parce que « card » aurait
  désigné la largeur du composant `Card`, qui n'en a pas. Génère `max-w-tile` par construction,
  sans emploi prévu.
- **`BACKLOG.md`** : les huit demandes remontées par les lots Creator et Hub sont versées
  (carte d'état héros au seuil de promotion, hôte de toasts, tuile cochable, barre d'étapes
  segmentée, en-tête accentué de `Table`, icône de tête sur `Input`, `as` de `Card`, mesures de
  mise en page sans jeton) ; la famille (b) de cette dernière — la grille auto-fill — en sort.
- Démo : la page Fondations rend `--container-tile` et un spécimen des deux grilles, classes
  écrites en clair pour que `check-classes.mjs` prouve que l'utilitaire paramétré émet sa règle.
  `docs/PIEGES.md` § 4 et l'en-tête de `check-font-px.mjs` parlent du nouveau palier.

---

## 0.1.2 — la carte de dialogue, la graisse qui suit le palier, la Sidebar alignée

- **`--container-dialog` : 27,5 rem (440 px), la carte centrée d'auth ou de dialogue.** Les
  maquettes A1-A3 posent une carte à 440 px ; le rôle le plus étroit du socle était `narrow`
  (30 rem, message centré, état vide), jugé trop large à l'écran par Julien sur les quatre
  écrans d'auth (08/09/2026). Un rôle de plus plutôt qu'un `narrow` resserré, qui aurait bougé
  les blocs de l'onboarding et du bilan d'audit qui l'emploient. Utilitaire `max-w-dialog`.
- **Le titre de page reprend son 800.** Nouveau jeton de marque `--heading-xl-weight` (défaut du
  gabarit : `var(--heading-weight)` ; Yunary : `var(--weight-extrabold)`, 800 ajouté à l'échelle
  des graisses avec l'utilitaire `font-extrabold`). Lu par `h1`, `.display`, `.display-xl` et par
  les paliers `text-heading-xl` / `text-display*` ; les paliers `text-heading`, `text-subheading`
  et `text-heading-sm` portent désormais `--heading-weight` — **la graisse suit le palier, plus la
  balise**. Constat de Julien sur l'onboarding (08/09/2026) : la v1 titrait ses pages en Onest 800,
  le DS avait tout ramené à 700.
- **`.eyebrow` passe de 600 à 700**, dégradé conservé — la v1 le posait en gras, et le dégradé
  clippé allège déjà un 12 px.
- **`Sidebar` : une entrée peut être `disabled` et porter un `badge`** (« Yunary Metrics ·
  Bientôt » de la coque) — grisée, inerte, l'appoint poussé à droite et masqué en replié. Le
  bloc `ds-sidebar__footnav` est encadré de deux filets et respire de `--space-3`, comme le
  maître HubSidebar ; le pied qui le suit ne redouble pas le filet. Le libellé d'une entrée cède
  (ellipse) avant son appoint ; en tiroir, la bascule de repli est masquée.
- **`Sidebar` : l'en-tête et le pied n'ont plus de gouttière propre.** `.ds-sidebar__head` et
  `.ds-sidebar__foot` portaient un `padding-inline` de `--space-2` que la nav n'avait pas : le logo
  et les cartes du pied (crédits, compte) rendaient plus étroits que les entrées, et le logo se
  décalait à droite de leurs icônes — constat de Julien sur le Hub (08/09/2026). Le maître
  `HubSidebar` aligne tout sur les mêmes bords ; c'est le **contenu** du slot qui porte son retrait,
  comme une entrée porte le sien. Un `footer` « avatar + nom » nu perd donc 8 px de retrait.

---

## 0.1.1 — le lockup du logo et l'échelle d'app ouverte aux apps

Deux manques remontés par le lot de refonte visuelle des écrans (08/09/2026), sortis du
`BACKLOG.md`. Aucune rupture d'API.

- **`Logo` : l'icône est plus grande que le mot.** En `wordmark` et `stacked`, l'icône fait
  désormais 44/30 du corps des lettres et se centre sur elles — le lockup des maquettes d'auth
  (icône 44 px, mot 1,875 rem). Le composant rendait les deux à la même taille, et le mot
  sortait trop gros. `height` garde sa valeur pour le mot : seul le mark grandit chez les
  appelants existants. `monogram` ne bouge pas (les maquettes C1 le posent tel quel).
- **`app-scale.css` : le garde-fou `min-width` passe sous `@media (min-width: 64rem)`.** Posé
  hors media query, il forçait un défilement horizontal sur téléphone, ce qui interdisait le
  module à toute app publique avec du mobile — le Hub restait donc sans échelle et rendait
  « petit » sur grand écran à côté des autres apps. Les quatre bandes de zoom ne changent pas.
  Le module n'est plus « outils internes desktop uniquement » : ce sont les apps qui
  l'importent, jamais le site public, les e-mails ni les slides.
- **Le lien texte se souligne au survol.** `a:where(:hover){text-decoration:underline}` dans
  `tokens/base.css`, à spécificité de type : les composants rendus en `<a>` qui posent
  `text-decoration:none` dans leur classe (`.ds-btn`, `.ds-navlink`, `.ds-sidenav`) ne bougent
  pas. Décision de Julien sur l'écran de connexion, valable pour tout lien texte de l'écosystème.
  Corollaire pour les apps : ne pas poser `no-underline` sur un lien texte, il neutraliserait le
  survol.

---

## 0.1.0 — le design system Yunary

Premier lot. Le socle du gabarit (millésime **v0.6.0**) est repris **sans modification**, et la
marque Yunary est écrite en face.

### La marque

- **`src/styles/brand-yunary.css`** — les 54 jetons du contrat en `:root`, 32 redéclarés en
  `.dark`, plus les 3 jetons métier. Encre et crème, dégradé ambre `#f5a524` → orange `#f08029`
  → corail `#e84c3d`.
- **L'échelle des surfaces a été refaite, pas transposée.** Le design system Yunary précédent
  empilait plusieurs surfaces sur la même valeur — `card`, `popover` et `muted` sur `#faf7f2` en
  clair, cinq surfaces sur `#2b2a28` en sombre. Tout ce qui se pose SUR une carte y disparaissait
  en thème sombre. Six crans distincts dans les deux thèmes, mesurés par `check-surfaces.mjs`,
  avec **2 écarts assumés** (`--secondary` / `--card`, le régime de contrôles posés à même la
  page).
- **Les jumeaux lisibles ont été créés** : `--primary-readable` et `--destructive-readable`
  n'existaient pas. Le corail de remplissage ne tient pas 4,5:1 en texte sur la crème ; liens,
  libellés actifs et messages d'erreur passent par les jumeaux, mesurés de 5,16 à 7,11.
- **Le contraste est mesuré, et les renoncements sont écrits.** 53 paires × 2 thèmes : 36
  conformes, **17 écarts assumés**, chacun déclaré dans le fichier de marque avec sa raison. Le
  détail est dans [`docs/accessibilite.md`](docs/accessibilite.md).
- **Les polices sont auto-hébergées.** Onest 700/800, DM Sans 400/500/600/700, DM Mono 400/500 —
  16 `.woff2` dans `src/styles/assets/fonts/`, deux sous-ensembles par graisse avec leur
  `unicode-range`. Pas de Google Fonts : une police qui ne charge pas ne dégrade pas « un peu »,
  elle change toute la mise en page. Le rendu est le même hors ligne.

### Les deux écarts au socle

Le socle ne s'ouvre pas — sauf aux deux endroits que le contrat de portage prévoit.

- **`patterns.css`** — 9 traitements Yunary changent une **règle**, pas seulement une valeur :
  rayon des contrôles dérivé de la hauteur (`hauteur ÷ 3`), onglet et page actifs sur la plaque
  `--accent`, pastille de marque sur `--pill-coral-bg`, toast et bandeau centrés, retraits de
  sidebar au bord optique de 24 px. Aucune classe renommée, aucune structure de DOM touchée : la
  vitrine et les composants lisent ces noms-là.
- **`Logo.tsx`** — mark **vectoriel** (le Y en squircle, dégradé de marque) en SVG inline, à la
  place de la pastille CSS du socle. API `variant` / `letters` / `height` / `wordmark` /
  `monogram` / `dot` / `label` conservée. Le monogramme *textuel* n'est plus rendu — l'icône le
  remplace — donc `BRAND_MONOGRAM` n'est plus lu par le composant, et le libellé accessible de
  la variante `monogram` retombe sur le mot-marque complet.

### Deux gardes recalés

`check-contrast.mjs` mesurait des jetons que `patterns.css` ne pose plus. Quand une règle change
de jeton, le garde doit suivre — sinon il valide une couleur qui n'est plus à l'écran.

- `.ds-cal__day.is-today` mesure `--primary`, et non le jumeau lisible.
- `.ds-pastille--brand — icône` mesure `--primary` sur `--pill-coral-bg` composité, et non
  l'ancien `--grad-soft`.

Les deux écarts que la correction met au jour (2,85 et 3,25) sont assumés par écrit : ce sont des
marqueurs graphiques, jamais seuls porteurs du sens.

### L'extension métier est montée

`brand-content.css` est importé par la vitrine et les 3 jetons `--tone-deep`,
`--gradient-thumbnail`, `--shadow-accent-hot` sont déclarés — la page Marque rend `HaloHot`. Ce
sont des surfaces d'**export** — miniatures, cartes motion — jamais un fond d'interface. Une app
Yunary qui n'en fait pas ne les importe pas et ne perd rien.

### Ce qui reste à faire avant de publier

`git init`, puis le tag `v0.1.0`, puis renseigner le compte et le dépôt dans la ligne
d'installation du README — `check-version.mjs` avertit tant que le dépôt n'est pas lisible.
