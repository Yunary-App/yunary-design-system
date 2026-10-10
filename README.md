# @yunary/ds

**Le design system de Yunary.** Deux couches qui ne se mélangent pas : un **socle**
générique — structure, comportements, échelles, rail de contrôles, motion, 38 composants
React + TypeScript, **zéro couleur** — et la **marque Yunary**, qui porte les couleurs, les
polices, les dégradés et la lueur.

C'est le socle commun de Yunary : la coquille web (le hub) installe ce paquet, les écrans MCP (`@yunary/mcp-ui`) en importent les jetons, et le site vitrine en
porte une copie du CSS. Tous montent la même marque, pour que chaque surface se ressemble
sans qu'on redécide à chaque fois.

Jetons CSS · couche Tailwind v4 · tout est en `rem`.

Les deux couches se montent en **deux imports**, toujours. Il n'existe pas d'entrée qui
monte une marque toute seule : celle qu'une app charge est visible dans son code, jamais
implicite.

```ts
import '@yunary/ds/core.css';          // la structure, invariante
import '@yunary/ds/brand-yunary.css';  // la marque Yunary
```

## Par où commencer

| Vous êtes | Allez voir |
|---|---|
| **vous montez une nouvelle app Yunary** | [Mise en route](#mise-en-route), juste en dessous |
| **vous écrivez un écran AVEC ce système** | **[`docs/PIEGES.md`](docs/PIEGES.md)** — ce que le code livré fait et qui ne se devine pas |
| **vous touchez à la marque** | **[`docs/DESIGN.md`](docs/DESIGN.md)** — la charte, et la liste fermée de l'accent |

**La marque Yunary**, `src/styles/brand-yunary.css` : encre et crème, dégradé ambre →
orange → corail, Onest en titrage et DM Sans en texte. Elle porte les 55 jetons du contrat
et déclare ses 26 écarts d'accessibilité assumés, chacun avec sa raison. Le socle, lui, ne porte **aucune couleur** — c'est ce qui permet de la faire évoluer
sans toucher aux composants.

> **Ce paquet est bâti sur un gabarit**, dont [`PORTAGE.md`](PORTAGE.md) et
> [`GETTING-STARTED.md`](GETTING-STARTED.md) décrivent la procédure. Ils parlent de fabriquer
> un design system à partir de celui-ci, pas de s'en servir : pour Yunary, vous n'avez pas à
> les dérouler.

### Les documents

| Pour | Va voir |
|---|---|
| démarrer un design system, de zéro | [`GETTING-STARTED.md`](GETTING-STARTED.md) |
| la charte à remplir avant le CSS | [`docs/DESIGN.md`](docs/DESIGN.md) |
| ce qui entre dans le système, et la procédure de version | [`GOVERNANCE.md`](GOVERNANCE.md) |
| ce qui a changé, version par version | [`CHANGELOG.md`](CHANGELOG.md) |
| les ratios de contraste mesurés et les écarts assumés | [`docs/accessibilite.md`](docs/accessibilite.md) |
| l'usage détaillé, composant par composant | [`docs/PROMPTS.md`](docs/PROMPTS.md) |
| les pièges du socle — la panne muette et sa parade | [`docs/PIEGES.md`](docs/PIEGES.md) |
| la fiche de portage pour un agent | [`PORTAGE.md`](PORTAGE.md) |

---

## Installation

Pas de registry : chaque app épingle une version par un tag git.

```bash
npm i github:Yamiro02/yunary-design-system#v0.6.0
```

Cinq **peer dependencies**, à la charge de l'app :

| Peer | Plage | Note |
|---|---|---|
| `react` · `react-dom` | `>=18` | |
| `tailwindcss` | `>=4` | **v4 uniquement.** Aucun preset pour Tailwind 3 |
| `lucide-react` | `>=0.400` | |
| `tailwind-merge` | `^3` | **3.x obligatoire** |

> **`tailwindcss` est marqué `optional` — voici ce que ça veut dire.** Le paquet a deux régimes.
> Si tu n'utilises que `core.css` + une marque et les classes `.ds-*` — un e-mail, un deck de slides, une page
> sans utilitaires — Tailwind n'est pas nécessaire, et le flag évite à npm de le réclamer.
> **Dès que tu importes `theme.css`, Tailwind >= 4 devient obligatoire** : ce fichier porte les
> `@import "tailwindcss/…"`. Le flag ne rend pas Tailwind facultatif dans ce cas — il dit
> seulement que npm ne bloquera pas l'installation. C'est le build CSS qui échouera.

`lucide-react` et `tailwind-merge` sont des **peers**, jamais des dépendances directes : en direct, une app qui a déjà les siennes en
embarque **deux copies** dans son bundle. `tailwind-merge` est épinglé
en 3.x parce que la 2.x ne connaît pas les groupes de classes de Tailwind v4 : elle résoudrait les
conflits faux, sans rien signaler — et `cn()` est précisément l'endroit où ça coûte une couleur
supprimée du DOM.

---

## Mise en route

Le design system se branche en **deux fichiers**, et ils ne s'importent pas de la même façon.

### 1. Les fondations — import **JS** (recommandé)

Socle plus marque. Deux lignes, pas une : c'est ce qui rend explicite la marque que tu montes.

```ts
// src/main.tsx — une app du projet
import '@yunary/ds/core.css';
import '@yunary/ds/brand-yunary.css';
```

> **Pourquoi deux fichiers et pas un override en cascade.** Importer le système complet puis
> redéclarer par-dessus laisserait un jeton oublié retomber EN SILENCE sur la valeur d'origine.
> Avec deux fichiers, un jeton manquant fait que la variable **n'existe pas** — et ça casse à
> l'écran. Même logique que `--text-*: initial`, qui supprime l'échelle typo native de Tailwind :
> une régression doit casser au lieu de dériver.

**Il n'y a pas d'entrée qui monte la marque toute seule.** Elle serait identique à
`core.css` sous un autre nom — deux noms pour un fichier — et on hériterait d'une marque sans
l'avoir demandée. Deux imports, toujours : celle qu'une app charge est visible dans son code.

Les mêmes fichiers **depuis ton CSS marchent aussi** et produisent le même résultat — couches,
jetons et polices compris. L'import JS reste la voie recommandée : c'est celle que fait tourner la
vitrine, donc celle qui est vérifiée à chaque version.

### 2. La couche Tailwind — import **CSS**

`theme.css` branche les tokens sur Tailwind v4. Il doit être atteint par un `@import` **depuis le
fichier CSS de ton app** — celui que traite `@tailwindcss/vite`. Jamais par un import JS : Tailwind
ne le verrait pas.

```css
/* src/index.css — l'entrée CSS de l'app */
@import '@yunary/ds/theme.css';
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [react(), tailwindcss()] });
```

Plus de `tailwind.config.js`, plus de `postcss.config.js`, plus d'`autoprefixer` : tout vit dans le
CSS.

> **Supprime ton `@import "tailwindcss";`.** `theme.css` porte lui-même les imports de Tailwind —
> `theme.css` et `utilities.css`, chacun dans sa couche. Si ton app garde sa propre ligne,
> Tailwind est chargé **deux fois**, et ce second chargement amène un preflight qui arrive
> **après** le reset du design system : c'est l'ordre qui te coûte tes titres, pas une
> incompatibilité. Le socle porte déjà son preflight — voir juste en dessous.

#### Ce que `theme.css` règle pour toi

- **Le preflight est là, et c'est `core.css` qui le porte.** Il est versé
  dans le dépôt (`src/styles/tokens/preflight.css`, copie conforme de celui de Tailwind) et
  chargé en `layer(base)` **juste avant** le reset du socle, dans le même fichier : le
  preflight normalise, l'identité du socle repasse par-dessus. Tu n'as rien à importer, et
  surtout rien à ajouter dans `theme.css` — son en-tête explique pourquoi le geste y est
  interdit.
- **La couleur de bordure par défaut est celle du système**, pas celle du texte. Tailwind v4
  laisse `border-color: currentColor` : un `border` nu tracerait un filet quasi noir là où on
  attend le gris doux de `--border`. `tokens/base.css` repose le défaut sur
  `var(--border, currentColor)` — écart délibéré, et le cas inverse s'écrit
  `border-current`.
- **Les couches** : `@layer theme, base, components, utilities`. Le reset du DS est en `base`, les
  états `.ds-*` en `components`. C'est ce qui permet à un utilitaire Tailwind passé en `className`
  de **surcharger** un composant — `<Card className="p-space-7">` applique bien `--space-7`.
- **Le thème sombre** est le scope `.dark`, jamais un media query (`@custom-variant dark`).

`theme.css` ne contient **que** des `var(--…)` : il branche les tokens sur Tailwind, il n'invente
aucune valeur.

### 3. Les composants

```tsx
import { Button, Card, Icon } from '@yunary/ds';

<Card variant="feature" size="lg">
  <h2>J'ai construit cette <span className="accent">app</span> en un week-end</h2>
  <Button variant="primary" size="lg" iconRight={<Icon name="arrow-right" />}>
    On build une app
  </Button>
</Card>
```

### 4. L'échelle d'app — opt-in, les apps

Les apps importent en plus un module d'échelle, qui adapte la taille racine par palier de
largeur d'écran pour garder une mise en page effective proche de la maquette 1440 (son
garde-fou de largeur minimale ne s'applique qu'à partir de 64 rem : le mobile reste fluide) :

```ts
import '@yunary/ds/core.css';
import '@yunary/ds/brand-yunary.css';
import '@yunary/ds/app-scale.css';   // les apps web (le hub, les outils internes) — jamais le site public
```

Les paliers sont en **%** : ils multiplient la préférence de taille de texte du navigateur au lieu
de l'écraser — l'interdit « jamais de `font-size` px sur `html` » reste respecté. **Le site public,
les e-mails et les slides ne l'importent jamais** : le socle et la marque, rien de plus.

### 5. Le thème sombre

```tsx
document.documentElement.classList.toggle('dark', isDark);
```

Une section ink au milieu d'une page crème adopte le scope, elle ne peint pas un fond à la main :

```tsx
<section className="dark bg-background text-foreground">…</section>
```

---

## Ce que `theme.css` expose

| Famille | Utilitaires |
|---|---|
| Couleurs | `bg-background` `text-foreground` `bg-card` `text-card-foreground` `bg-popover` `bg-primary` `bg-secondary` `bg-muted` `text-muted-foreground` `bg-accent` `bg-destructive` `border-border` `ring-ring` `bg-tone-dark` `bg-tone-dark-soft` `bg-tone-light` `bg-tone-light-alt` `text-text-secondary` `text-text-muted` `text-text-inverted` `bg-brand-from/via/to` `bg-pill-*-bg` `text-pill-*-fg` |
| Dégradés | `bg-brand-gradient` `bg-brand-gradient-diagonal` `bg-grad-soft` `bg-halo` — pas de namespace v4 pour `background-image` : ce sont des `@utility`, donc variantables (`hover:`, `dark:`) |
| Rayons | `rounded-xs` `rounded-sm` `rounded-md` `rounded-lg` `rounded-xl` `rounded-2xl` `rounded-pill` — le pill est réservé aux **badges, compteurs et pastilles de choix** (`.ds-tile--chip`) : jamais un bouton, un input ni une barre d'onglets. **`rounded` nu n'est pas au barème**, voir plus bas |
| Ombres | `shadow-sm` `shadow-md` `shadow-lg` `shadow-glow` `shadow-glow-lg` |
| Typo | `font-display` `font-body` `font-mono` · `text-display-xl` `text-display` `text-heading-xl` `text-heading` `text-subheading` `text-heading-sm` `text-body-lg` `text-body` `text-body-sm` `text-control` `text-caption` `text-eyebrow` `text-chip` |
| Espacement | `gap-space-1` … `gap-space-8` · `h-control-sm/md/lg` · `w-icon-control-sm/md/lg` · `p-card-pad` `p-card-pad-lg` — **rail unique** : tous les contrôles s'alignent sur `--control-md`, qui descend à 2.75rem sous 64rem |
| Largeurs | `max-w-shell` `max-w-wide` `max-w-read` `max-w-narrow` `max-w-dialog` `max-w-page` · `w-aside` (la colonne latérale, 20 rem) |
| Ratios | `aspect-video` et `aspect-square` natifs |
| Grilles | `grid-cards-dialog` `grid-cards-narrow`… — `grid-cards-<rôle>` pose des colonnes en `auto-fill` dont aucune ne descend sous la largeur du rôle `--container-<rôle>` (`minmax(min(…, 100%), 1fr)`). À composer avec `grid` et un gap, comme `grid-cols-*` ; un `@utility` paramétré, donc variantable |
| Motion | `ease-standard` |

L'échelle d'espacement est **nommée** (`space-5`, pas `5`) : elle n'écrase pas l'échelle numérique
de Tailwind, sur laquelle reposent les composants shadcn de ton app.

> **L'échelle typo, elle, remplace la native.** `text-xs`, `text-sm`, `text-base`, `text-lg`… ne
> sont plus générables : seuls les paliers sémantiques du DS existent. Une régression casse
> visiblement au lieu de dériver en silence.
>
> Si ton app ajoute ses propres paliers, ne reconstruis pas la configuration `tailwind-merge` à
> côté : appelle `makeCn`. Les paliers du DS y sont déjà, tu ne donnes que les tiens — sans le
> préfixe `text-`. Sans ça, `text-control` repasse **couleur** et disparaît du DOM au premier
> conflit avec `text-foreground`.
> ```ts
> import { makeCn } from '@yunary/ds';
> export const cn = makeCn(['tab', 'hero']);   // + text-tab, text-hero
> ```
> `cn` reste le raccourci quand il n'y a aucun palier à ajouter, et `PALIERS_TYPO` reste exporté
> pour les cas où tu veux la liste brute.

> **`rounded` nu n'est pas au barème.** En Tailwind v4 c'est un utilitaire **statique**, câblé sur
> `0.25rem`, qu'aucun token ne peut reprendre : un `@utility rounded` fusionnerait avec lui au lieu
> de le remplacer, et le natif gagnerait. Écris **`rounded-lg`**. Un `rounded` écrit par réflexe ne
> lève aucune erreur : il rend 4 px, hors barème.

> **Le paquet n'est pas scanné par Tailwind.** v4 ne lit pas `node_modules`. Sans effet
> aujourd'hui : les 38 composants s'habillent en classes `.ds-*` et n'écrivent aucun utilitaire
> Tailwind. C'est une précaution pour l'avenir — le jour où un composant du DS écrira une classe
> Tailwind, l'app devra pointer le paquet :
> ```css
> @source "../node_modules/@yunary/ds/src";
> ```

`tokens/base.css` fournit aussi des classes prêtes à l'emploi : `.display` `.display-xl` `.eyebrow`
`.chip` `.accent` `.mono` `.caption` `.prose` `.halo` `.page` `.ds-logo`.

---

## Composants

| Famille | Composants |
|---|---|
| `icons` | `Icon` — 60 glyphes Lucide ; la taille vient du **créneau** (`--ds-icon-size`, repli `1.25rem`), `size` reste la surcharge au site d'appel |
| `actions` | `Button` · `IconButton` — 5 variantes, `danger-soft` compris (6 pour `IconButton`, `accent` compris), 4 tailles pour `Button` (`xs` = « Copier »), jamais un pill |
| `forms` | `Input` (unité, icône de fin, lecture seule) · `Textarea` · `Select` · `Checkbox` · `Radio` · `Switch` (verrouillé, libellé avant la piste) · `FormField` (action à droite du libellé) · `Calendar` · `DatePicker` · `Dropzone` (dépôt d'un fichier) |
| `data-display` | `Card` (+ en-tête à slots, badge collé au titre, pied, palier `xl`, plaque, coque d'écran de Claude) · `Pastille` (de la coche à l'écran) · `Badge` (2 rembourrages, ton dégradé, tête, croix de retrait) · `Tooltip` · `Separator` · `Table` (+ `THead` `TBody` `Tr` `Th` `Td`) — `framed` · `columns` · `striped` · `hoverable`, composables |
| `feedback` | `Toast` · `Banner` (+ encart dans une carte, pastille à la place de l'icône) · `EmptyState` · `StateCard` · `Skeleton` · `SkeletonCard` · `Spinner` · `Progress` |
| `overlays` | `Modal` (3 phases + feuille basse sous 64 rem, sous-titre, 480 / 560 / 600) |
| `navigation` | `Navbar` · `Footer` · `Tabs` (onglets ou choix d'une valeur, barre compacte, qui défile) · `Pagination` · `AppShell` (+ barre haute mobile) · `Sidebar` |
| `brand` | `Logo` · `Halo` · `Avatar` (tailles des pastilles, tons, anneau, pastille de réseau) · `Reseau` (Instagram, TikTok, YouTube, Claude) |

Tous sont exportés en nommé depuis la racine, avec leurs types :

```ts
import { Button, type ButtonProps } from '@yunary/ds';
```

Les règles d'usage composant par composant sont dans [`docs/PROMPTS.md`](docs/PROMPTS.md).

> **Classes sans composant.** La tuile cochable (`.ds-tile`, avec ses formes compacte, pastille,
> panneau et choix), l'encart de valeur (`.ds-inset`, simple ou en pile), le panneau d'écran
> (`.ds-panel`), le menu déroulant (`.ds-dropdown`) et les motifs des parcours — la barre d'étapes
> (`.ds-steps`, segmentée ou verticale), le voile d'un outil non activé (`.ds-veil`), le prix, les
> avantages et le compteur à jauge (`.ds-price`, `.ds-perks`, `.ds-meter`), la carte d'outil
> (`.ds-offer`), le fichier et l'envoi (`.ds-file`, `.ds-upload`), le média 9:16 et la bande
> d'images (`.ds-media`, `.ds-frames`), l'agenda (`.ds-agenda`, `.ds-week`), les marques de texte
> (`.ds-mark`, `.ds-snippet`, `.ds-cues`, `.ds-dl`, `.ds-diff`) — n'ont pas de composant React :
> leurs classes sont stables, l'app écrit le balisage (React, Preact ou HTML). Voir la fin de
> [`docs/PROMPTS.md`](docs/PROMPTS.md).

> **Hors périmètre** — les composants métier (blocs de code, cartes d'étape, pills de
> métrique…) vivent dans l'app qui en a besoin. Les classes `.ds-metric*` sont dans
> `patterns.css` : une app peut composer sa propre pill de métrique sans réinventer une
> valeur.

---

## Polices

**Auto-hébergées, et c'est délibéré.** Les 16 `.woff2` vivent dans
`src/styles/assets/fonts/` et partent avec le paquet (`files: ["dist","src","docs"]`) :
aucune requête tierce, aucun point de panne réseau, le même rendu hors ligne ou derrière un
proxy. Une police qui ne charge pas ne dégrade pas « un peu », elle change toute la mise en
page — d'où ce choix.

| Face | Jeton | Graisses | Poids |
|---|---|---|--:|
| Onest | `--font-display` | 700 · 800 | 122 Ko |
| DM Sans | `--font-body` | 400 · 500 · 600 · 700 | 216 Ko |
| DM Mono | `--font-mono` | 400 · 500 | 28 Ko |

Deux sous-ensembles par graisse — `latin` et `latin-ext` — avec leur `unicode-range` : le
navigateur ne télécharge que ce que la page emploie. Les `@font-face` sont en tête de
`src/styles/brand-yunary.css`, et les replis **système** restent en queue des trois
`--font-*` : ils tiennent la mise en page pendant le chargement, ils ne remplacent pas la
face.

Pour le logo, utilise le composant `Logo` : il rend le mark Yunary en SVG inline — aucune
requête, aucun asset à résoudre par le bundler.

---

## Développement

```bash
npm install          # dépendances du paquet
npm run build        # tsup → dist/ (ESM + CJS + .d.ts)
npm run typecheck    # tsc --noEmit
npm run lint         # typecheck + les treize gardes
```

`npm run lint` enchaîne le typecheck et **treize gardes** ; un quatorzième, `check-classes.mjs`,
vit dans `npm run build`. Le premier de la chaîne est
[`check-token-refs.mjs`](check-token-refs.mjs) — c'est le moins cher, et un jeton manquant rend le
diagnostic des autres trompeur : il refuse tout `var(--x)` lu par le CSS du système ou par un style
inline de composant sans qu'un `--x:` soit déclaré. Un `var()` non résolu n'est pas ignoré, il rend
la déclaration **invalide at computed-value time** — pour un `font-size`, ça veut dire `inherit`, et
un `Button size="sm"` rend alors plus GROS qu'un `md`. C'est le garde qui compte le plus **sur un
projet client**, parce que `patterns.css` est justement le fichier que le portage réécrit.

Vient ensuite, entre autres, [`check-utility-collisions.mjs`](check-utility-collisions.mjs), qui
refuse tout `@utility` de `theme.css` portant le nom d'une classe qu'un jeton de thème génère
déjà : en Tailwind v4 les deux déclarations **fusionnent** dans la même règle et la dernière gagne,
sans erreur ni avertissement.

**Trois gardes lisent le CODE, pas le CSS** — [`check-dead-utilities.mjs`](check-dead-utilities.mjs),
[`check-font-px.mjs`](check-font-px.mjs) et [`check-fragile-classes.mjs`](check-fragile-classes.mjs).
Ils ferment les pièges de [`docs/PIEGES.md`](docs/PIEGES.md) : une classe que `theme.css` a
supprimée et qui ne rend rien, une taille de police en pixels qui ne suit pas `app-scale.css`, un
utilitaire posé sur `.accent` ou `.eyebrow` qui tue le dégradé. **Ils prennent un dossier en
argument** — un design system né de ce gabarit les emporte, et chaque app les pointe sur son propre
`src/` :

```bash
node check-dead-utilities.mjs src
node check-font-px.mjs src
node check-fragile-classes.mjs src
```

Chacun **dérive** ce qu'il surveille au lieu de le recopier (les classes mortes se déduisent des
`initial` de `theme.css`, les classes fragiles du CSS qui les déclare) et **rejoue son jumeau de
falsification à chaque appel** : un motif qui ne reconnaît plus rien rend un garde toujours vert,
donc décoratif — et ce mode de panne est aussi silencieux que les défauts qu'il surveille.

### La vitrine de recette

Une app Vite dans `demo/`, non publiée dans le paquet. Une page par famille, chaque composant dans
toutes ses variantes, tailles et états, plus le rendu des fondations. Trois modes : clair, sombre,
et **côte à côte** (les deux thèmes en vis-à-vis).

```bash
npm run demo:install    # une seule fois
npm run demo            # http://localhost:5273
```

La démo consomme le design system depuis ses **sources** : ce que tu vois est exactement ce qui est
publié. Elle n'utilise aucun style custom hors tokens.

---

## Périmètre et versions

**Ici : uniquement le générique.** Les composants métiers d'une app restent dans l'app.
Les gabarits de production (landing, visuels, slides, e-mails) vivent dans les projets
consommateurs.

Semver + tags git. Une évolution = PR sur ce repo, bump, tag, puis mise à jour de la dépendance
dans chaque app. Le projet Claude Design reste l'atelier de conception ; tout changement validé y
est reporté, puis porté ici.

---

## Interdits

Pas de valeur inventée : chaque couleur, taille, rayon ou ombre vient d'un jeton. Pas
d'emoji d'interface — seul le point médian `·` (un emoji qui EST la donnée, en tête de tuile, est
permis : voir `docs/DESIGN.md` § 9). Jamais un pill sur un bouton ou un input. La face
`--font-display` est réservée aux titres, jamais sous `1.125rem`, jamais faux-grassée — sa
casse et sa graisse viennent de `--heading-transform` / `--heading-weight`, que la marque
règle. Jamais `rounded` nu — toujours
`rounded-lg` : en Tailwind v4, `rounded` est un littéral de 4 px hors barème, et il dérive
sans rien signaler. Pas de `sparkles` : l'étoile-éclair est bannie du set, elle signe
« fait par une IA ». Les actions destructives prennent `trash-2`.

Les interdits de **couleur** de Yunary — et la liste **fermée** des endroits où l'accent a
le droit d'apparaître — sont dans [`docs/DESIGN.md`](docs/DESIGN.md). C'est cette liste qui
empêche le système de devenir bruyant quand plusieurs surfaces l'utilisent en même temps.
