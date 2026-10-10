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
