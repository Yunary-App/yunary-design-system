# Catalogue d'usage des composants

Le second fichier qu'un agent lit, après `PORTAGE.md`, avant d'écrire un écran.
Une section par composant : à quoi il sert, quand ne PAS l'utiliser, un exemple minimal
qui compile, et les états qu'il sait rendre.

Ce document est **gardé par `check-catalogue.mjs`** : chaque composant exporté par
`src/index.ts` doit avoir sa section ici, chaque section doit correspondre à un export
réel, et chaque `<Icon name="…">` cité doit exister dans le type `IconName`. Si vous
ajoutez un composant, ajoutez sa section — le build vous le rappellera.

Les exemples supposent les imports depuis la racine du paquet :

```tsx
import { Button, Card, Icon } from '@yunary/ds';
```

**➜ Les pièges du socle sont rassemblés dans [`PIEGES.md`](PIEGES.md)** — un par section,
avec ce qui casse, pourquoi la panne est muette, la parade, et le garde qui l'attrape quand
il y en a un. Ce qui suit en reprend l'essentiel au fil des composants ; la page en est la
version complète, et c'est elle qu'on lit avant d'écrire un écran.

**⚠️ LA DOCTRINE, avant les cas particuliers : aucune valeur du socle ne doit être hors
de portée de l'appelant.** Trois formes d'un même mal, toutes constatées en usage réel :

1. la valeur est **battue par la cascade** — `.accent`, `.mono` : la couche des
   utilitaires ou des composants gagne toujours, la panne est muette ;
2. la valeur est **hors d'atteinte de la cascade** — un défaut de design écrit en style
   inline, un nœud sans classe : aucun sélecteur ne peut viser la valeur, même en
   théorie ;
3. la valeur est **atteignable mais non prévue pour varier** — les quatre mesures de
   `.ds-logo__dot` : une classe parfaitement ciblable, mais rien ne dit que ces valeurs
   sont censées varier, donc la seule façon d'en changer est de les recopier.

Même issue à chaque fois : le projet recopie ou surcharge, et le socle ne le sait pas.
C'est la doctrine du socle prise à revers — il fournit les VALEURS, l'app écrit les NOMS.
Le premier réflexe de revue, sur tout nouveau composant comme sur tout écran : **cette
valeur, l'appelant peut-il la reprendre ?** Si non, elle est mal placée, quel que soit le
moyen. Et la forme 3 impose la seconde question : **si oui, le sait-il ?** — une valeur
reprise en aveugle est une valeur recopiée.

**La règle du style inline** — elle décide où une valeur a le droit de vivre :

- **Légitime** quand la valeur vient de l'appelant à chaque rendu — `Skeleton`, `Avatar`,
  `Logo`, `Progress` : la prop EST la valeur, il n'y a rien à redéfinir.
- **Illégitime** dès qu'il porte un **défaut**. Un défaut est un arbitrage de design ;
  l'écrire inline le range au seul endroit du langage que la cascade n'atteint pas.
  C'est pourquoi le défaut de `Glyph` et de `Spinner` vit dans le repli de
  `var(--ds-icon-size, 1.25rem)`, côté cascade, où un créneau peut le battre.
- **Sans excuse** quand il n'y a même pas de prop : une décision du socle qu'aucun sélecteur
  ne pourrait viser. D'où `.ds-label__required` (l'astérisque de `FormField`) et
  `.ds-dropdown__hint` (le raccourci d'un item de menu).

**⚠️ Les utilitaires de marque perdent contre les composants.** Les huit de
`tokens/base.css` — `.display`, `.display-xl`, `.eyebrow`, `.chip`, `.accent`, `.mono`,
`.caption`, `.prose` — vivent en `layer(base)` ; les redéclarations de `patterns.css`
vivent en `layer(components)` et gagnent toujours sur le même nœud, quelle que soit la
spécificité. `.mono` posé sur un nœud qu'une règle `.ds-*` typographie ne rend rien, en
silence. **La parade** : l'utilitaire Tailwind équivalent sur le même jeton — `font-mono`
lit `--font-mono` et vit en `layer(utilities)`, il gagne. On ne déplace pas la couche.

**⚠️ Deux classes CSS pièges, avant tout écran : `.accent` et `.eyebrow`.** Elles peignent
le dégradé de marque dans le texte par quatre déclarations solidaires (`background`,
`background-clip: text`, `color: transparent`, `width: fit-content`) en `layer(base)` — un
utilitaire posé sur le même nœud vit en `layer(utilities)` et gagne toujours, sans rien
casser à l'écran. **Dangereux** : couleur, fond, `background-clip`, dimension (`text-*` de
couleur, `bg-*`, `w-*`…) — le dégradé meurt en silence. **Sans risque** : la typographie
(`font-*`, paliers `text-heading`…, `leading-*`). La mise en page va sur un span externe.

---

# actions

## Button

L'action du système. `primary` porte le dégradé de marque et la lueur : c'est LE CTA de la
vue — un seul par écran. Tout le reste est `secondary`, `ghost`, `danger` ou `danger-soft`.

**Ne pas l'utiliser** pour une action icône seule (c'est `IconButton`), ni pour un lien de
navigation dans du texte (un `<a>` suffit).

```tsx
<Button variant="primary" size="lg" iconRight={<Icon name="arrow-right" />}>On build une app</Button>
<Button variant="secondary" icon={<Icon name="play" />}>Voir la démo</Button>
<Button variant="ghost" size="sm">Annuler</Button>
<Button variant="danger" icon={<Icon name="triangle-alert" />}>Supprimer</Button>
<Button variant="danger-soft" size="sm" icon={<Icon name="trash-2" />}>Retirer</Button>
<Button loading>Génération…</Button>
<Button as="a" href="/inscription">S'inscrire</Button>
<Button variant="secondary" surface="card">Dans un conteneur qui n'est pas une Card</Button>
```

- Props : `variant` (`primary·secondary·ghost·danger·danger-soft`) · `size` (`sm·md·lg`) · `surface`
  (`auto·page·card`) · `icon` / `iconRight` · `loading` (spinner + désactivé) · `fullWidth`
  · `as` / `href`.
- **`surface` déclare à la main la surface qui porte le bouton**, jumelle de celle
  d'`Input`. Le squelette ne DÉDUIT rien : `secondary` porte `--secondary` partout, et
  `auto` (défaut) est donc l'état normal. `card` force `--background`, pour un conteneur
  qui n'a que l'apparence d'une carte. `page` force `--secondary` — inerte tant que
  `patterns.css` ne déduit pas la surface, indispensable le jour où il le fait : une
  déduction ne prévoit qu'un bouton posé SUR une carte, jamais sur un panneau imbriqué
  dedans. Sans effet sur `ghost`, `primary`, `danger` et `danger-soft`.
- **`variant="danger-soft"`** : l'action destructrice SECONDAIRE — retirer une photo, se
  déconnecter. La recette de l'`IconButton` du même nom : fond `--pill-danger-bg`, texte
  `--pill-danger-fg` (≥ 4,5:1 sur les deux porteuses), sans bordure ; le survol tire la plaque
  vers le rouge. `danger` reste l'action destructrice UNIQUE et définitive d'une vue
  (supprimer le compte).
- Rayon toujours `--radius-md`. **Jamais un pill** — le pill est réservé aux badges.
- Rail partagé : min-height 3rem (2.75rem sous 64rem). `lg` (3.25rem) = CTA de héros.
- **Les icônes ne se dimensionnent pas au site d'appel** : le créneau du bouton s'en
  charge (sm 1rem · md 1.125rem, via `--ds-icon-size` — voir la section Icon). Le spinner
  de `loading` prend la même taille que l'icône qu'il remplace.
- États rendus : repos, hover (lueur + translateY), pressé, focus-visible, désactivé,
  loading.

## IconButton

Bouton carré à icône seule — copier, fermer, basculer. `label` est **obligatoire** : il
devient `aria-label` et `title`.

**Ne pas l'utiliser** quand un libellé texte est possible : un bouton qui peut dire ce
qu'il fait le dit.

```tsx
<IconButton label="Copier le prompt"><Icon name="copy" /></IconButton>
<IconButton label="Fermer" variant="secondary" size="sm"><Icon name="x" /></IconButton>
<IconButton label="Boutique" variant="accent" as="a" href="/boutique"><Icon name="external-link" /></IconButton>
```

- Props : `variant` (`primary·secondary·ghost·danger·danger-soft·accent`, défaut `ghost`) ·
  `size` (`sm·md·lg`) · `surface` (`auto·page·card`) · `label` (requis) · `as` / `href`.
- `surface` a le même rôle et les mêmes valeurs que sur `Button` — voir sa section.
- **`variant="accent"`** : fond `--accent`, sans bordure, icône `--primary` (le corail) —
  l'état « sélectionné doux » d'un lien-icône ou d'un raccourci. Ne pas le recomposer
  avec `is-active` (une aide de démo) et un style inline : c'est cette fraude que la
  variante remplace.
- **`variant="danger-soft"`** : la corbeille — fond `--pill-danger-bg`, glyphe
  `--pill-danger-fg`, sans bordure. Le `danger` plein reste l'action destructrice UNIQUE d'une
  vue ; à côté de chaque ligne supprimable, c'est le doux.
  `<IconButton label="Supprimer" variant="danger-soft"><Icon name="trash-2" /></IconButton>`
- **`as="a"` + `href`** : un lien-icône reste un LIEN — clic-milieu, « ouvrir
  dans un onglet », annonce correcte au lecteur d'écran. Jumeau du `as` de `Button`.
- L'icône ne se dimensionne pas au site d'appel : le créneau s'en charge (sm 1rem ·
  md 1.125rem) — voir la section Icon.
- Carré sur son propre rail (`--icon-control-*`), rayon `--radius-md`, jamais un pill.
- États rendus : repos, hover, pressé (`aria-pressed` = actif), focus-visible, désactivé.

---

# brand

## Avatar

Portrait **détouré** (PNG transparent) avec halo de marque derrière les épaules. Sans
`src`, il retombe sur un monogramme en sourdine — jamais une image cassée.

**Ne pas l'utiliser** pour une vignette de contenu ou une image pleine : c'est un
portrait, posé bas, jamais centré derrière un titre.

```tsx
<Avatar src="/portrait-cutout.png" size="4rem" />
<Avatar size="3rem" halo={false} />
```

- Props : `src` · `alt` · `initials` (monogramme de repli) · `size` (longueur CSS, rem) ·
  `halo` (défaut `true`).
- Les défauts (`alt`, `initials`) viennent de `src/brand.ts`.

## Halo

L'atmosphère radiale de la marque. À poser dans une section `position:relative`, derrière
le contenu. Ancré en bas par défaut — jamais plein écran, jamais un grand aplat dégradé.

**Ne pas l'utiliser** comme fond d'une section entière ni derrière un titre centré : c'est
une atmosphère posée en bas, pas un décor.

```tsx
<section style={{ position: 'relative', overflow: 'hidden' }}>
  <Halo placement="bottom" />
  <div style={{ position: 'relative' }}>…</div>
</section>
```

- Props : `placement` (`bottom·top·center`) · `intensity` (0–1, multiplicateur d'opacité).
- Les dégradés viennent des utilitaires `.halo*` de `tokens/base.css` — aucune valeur ici.

## Logo

La marque, rendue **en CSS** : capitales de `--font-display` + pastille carrée arrondie en
dégradé avec lueur. La pastille garde le dégradé sur tous les fonds ; seules les lettres
s'inversent avec le thème. Les défauts (mot-marque, monogramme) viennent de `src/brand.ts`.

**Ne pas** fausse-grasser, contourer ni interlettrer le mot-marque : sa casse et sa
graisse suivent `--heading-transform` / `--heading-weight`, comme tout le titrage.

```tsx
<Logo variant="wordmark" height="1.75rem" />
<Logo variant="wordmark" letters="light" height="1.75rem" />
<Logo variant="monogram" height="2.5rem" />
<Logo wordmark="Acme" dot={false} />
```

- Props : `variant` (`wordmark·stacked·monogram`) · `letters` (`dark·light` — force la
  couleur des lettres ; omise, elles suivent `--foreground`) · `height` · `wordmark` ·
  `monogram` · `dot` (`false` = sans pastille ; un nœud la remplace) · `label`.
- Lockup : en `wordmark` / `stacked`, l'icône fait 44/30 du corps du mot et se
  centre sur lui ; `height` calibre le mot. En `monogram`, l'icône seule.
- En HTML nu, le même mark existe en `.ds-logo` / `.ds-logo__dot` (tokens/base.css).

---

# data-display

## Badge

Pill de statut ou de catégorie. Les tons sémantiques portent toujours **couleur + icône +
texte**, jamais la couleur seule.

**Ne pas l'utiliser** comme bouton ni comme métrique : un badge ne se clique pas.

```tsx
<Badge tone="success" icon={<Icon name="circle-check" size="0.875rem" strokeWidth={2.5} />}>En ligne</Badge>
<Badge tone="danger" icon={<Icon name="circle-alert" size="0.875rem" strokeWidth={2.5} />}>Échec</Badge>
<Badge tone="outline">Brouillon</Badge>
<Badge tone="neutral" pad="dense">v0.1.0</Badge>
```

- Props : `tone` (`coral·amber·danger·warning·success·neutral·accent·outline`, défaut
  `neutral`) · `pad` (`md·dense`) · `icon` · `corner`.
- **`corner`** : la languette de coin — le badge se colle au coin haut droit de son conteneur
  (« Recommandé » sur une carte de choix), rayon épousant le coin. Le conteneur porte
  `position: relative`.
  `<Badge tone="accent" pad="dense" corner>Recommandé</Badge>`
- Le rayon pill est légal ici — jamais sur un bouton, un champ ou une barre d'onglets.

## Card

LA surface du système — tout ce qui n'est pas une section de page se pose sur une Card.
Fond `--card`, bordure 1px, ombre teintée. Jamais du blanc pur. L'en-tête à slots
(`eyebrow` / `icon` / `title` / `subtitle` / `action`) ne rend AUCUN nœud si aucun slot
n'est passé.

**Ne pas** imbriquer une Card dans une Card, ni poser une grille de cartes avec un gap
sous 1.5rem.

```tsx
<Card>Contenu</Card>
<Card variant="interactive" onClick={() => ouvrir()}>Card cliquable</Card>
<Card variant="feature" size="lg">Mise en avant — lavis --grad-soft + bordure de marque</Card>
<Card icon={<Pastille size="carte"><Icon name="rocket" /></Pastille>}
  title="Déployer" subtitle="En un clic" action={<IconButton label="Options"><Icon name="ellipsis" /></IconButton>}>
  Contenu sous l'en-tête
</Card>
<Card flush><img src="/cover.png" alt="" style={{ width: '100%' }} /></Card>
<Card gap={4} title="Une pile">
  <p>Premier bloc</p>
  <Separator bleed />
  <p>Second bloc — le filet va de bord à bord</p>
</Card>
```

- Props : `variant` (`default·interactive·feature`) · `size` (`md·lg`) · `flush` (sans
  padding, media plein bord) · `gap` (`3·4·5·6`) · slots d'en-tête `eyebrow` / `icon` /
  `title` / `subtitle` / `action` · `titleSize` (`sm·lg`) · `headerGap` (`normal·airy`) · `as`.
- **`gap` — la pile, opt-in.** `.ds-card` est `display:block` : un `gap-space-*` posé en
  `className` ne rend RIEN (0 px, en silence). `gap={4}` passe
  la carte en colonne flex avec `--space-4` entre ses enfants ; l'en-tête cède sa marge basse
  au gap. Sans `gap`, rien ne change. Quatre paliers, pas de 20 px : l'espacement interne
  d'une carte reste sur l'échelle, et le padding reste à 24.
- **Le filet de bord à bord** : `<Separator bleed />` en enfant DIRECT — voir Separator.
- **L'alignement de l'en-tête est décidé par le socle, jamais par une prop** :
  titre simple → rangée **centrée** — icône, titre et action partagent un axe, la langue du design ; titre **et** sous-titre → `flex-start` —
  l'action s'aligne sur la ligne du haut au lieu de flotter entre les deux. `baseline`
  est écarté : il exigeait une retouche par instance. Ne recomposez pas l'en-tête à la
  main pour choisir un alignement — c'est le composant qui le sait.
- États rendus : repos ; `interactive` ajoute hover (levée + `--shadow-md`), pressé,
  focus-visible.

## Pastille

La tuile d'icône du système — l'unique porteur carré-ou-rond teinté. Ses tailles sont
nommées par **contexte**, jamais par mesure : un site d'appel n'écrit jamais un rem.

**Ne pas l'utiliser** comme bouton (elle ne se clique pas) ni réinventer une tuile d'icône
en div : c'est exactement ce que ce composant remplace.

```tsx
<Pastille size="carte"><Icon name="terminal" /></Pastille>
<Pastille size="dialogue" tone="danger"><Icon name="triangle-alert" /></Pastille>
<Pastille size="panneau" tone="brand" outlined><Icon name="folder" /></Pastille>
<Pastille size="heros" shape="round" tone="inverse"><Icon name="rocket" size="1.5rem" /></Pastille>
<Pastille size="dialogue" tone="brand-solid"><Icon name="plus" /></Pastille>
```

- Props : `size` (`puce` 1.75 · `carte` 2.25 · `dialogue` 2.625 · `panneau` 3.25 · `heros` 4 ·
  `ecran` 5rem — le rayon suit la taille) · `shape` (`square·round`) · `tone` (`brand` ·
  `brand-solid` + les 6 paires sémantiques + `inverse`) · `outlined` (contour 1px
  currentColor à 22 %).
- **`size="puce"`** : le plus petit contexte — un numéro d'étape (`shape="round"`, le chiffre en
  body-sm gras), la coche d'un avantage, l'état d'une ligne. Jamais un rem au site d'appel pour
  réduire `carte`.
  `<Pastille size="puce" shape="round" tone="coral">2</Pastille>`
- L'icône ne se dimensionne pas au site d'appel : le créneau s'en charge — `puce` rend
  0.9375rem, `dialogue` et `panneau` rendent 1.5rem, `carte` le repli 1.25rem. Seules `heros` et `ecran` attendent
  encore une taille explicite.
- **`tone="brand-solid"` porte le dégradé PLEIN**, avec son glyphe en
  `--primary-foreground` : la tuile de marque affirmée, là où `brand` est la tuile douce.
  `size="dialogue"` en fait le jumeau exact d'un `IconButton` `md` — même 2,625 rem, même
  `--radius-md` — mais en `<span>`, donc **posable dans un `<label>` ou une zone cliquable,
  là où un vrai `<button>` imbriqué est du contenu interactif invalide dont le navigateur
  ne transmet pas l'activation.**
- ⚠️ `brand-solid` ne porte **aucune lueur**, et c'est délibéré : dans ce système la lueur
  marque ce qui se **presse**, et seuls `.ds-btn--primary` et `.ds-icon-btn--primary` la
  portent. Une `Pastille` ne se clique jamais. Un appelant qui veut le halo l'ajoute
  lui-même, en le sachant.
- C'est elle qui rend la tuile du `Modal` et celle de l'`EmptyState`.

## Separator

Filet 1px `--border` entre deux blocs. Avec `label`, la légende est centrée sur la ligne.

**Ne pas l'utiliser** pour structurer une liste dense (l'espacement suffit) ni dans un
menu déroulant (`.ds-dropdown` a son filet, `.ds-dropdown__sep`).

```tsx
<Separator />
<Separator label="Ou" />
<Separator orientation="vertical" />
<Card gap={4}>…<Separator bleed />…</Card>
```

- Props : `orientation` (`horizontal·vertical`) · `label` (horizontal uniquement) · `bleed`.
- **`bleed`** : enfant DIRECT d'une `Card`, le filet annule le `--card-pad` (ou
  `--card-pad-lg`) en marge négative et va du bord gauche au bord droit, sans déborder — aucun
  `overflow` à poser. Hors d'une carte ou dans un bloc imbriqué, la prop est sans effet.

## Table

Table de données composable pour les UIs d'outil : `Table > THead/TBody > Tr > Th/Td`.
`framed` lui donne son propre cadre (1px `--border`, radius-lg, fond `--card`, en-tête sur
`--background`) — pas de Card autour. `columns`, `striped`, `hoverable` se composent.

**Ne pas** rendre une table vide : c'est `EmptyState` À LA PLACE de la table, jamais un
état vide dans la table.

```tsx
<Table framed columns hoverable>
  <THead><Tr><Th>Build</Th><Th>Statut</Th></Tr></THead>
  <TBody><Tr><Td>App de lecture</Td><Td><Badge tone="success">En ligne</Badge></Td></Tr></TBody>
</Table>
```

- Props de `Table` : `striped` · `hoverable` · `framed` · `columns`. `THead`, `TBody`,
  `Tr`, `Th`, `Td` acceptent leurs attributs HTML natifs.
- États rendus : lignes au repos, alternées (`striped`), survolées (`hoverable`).

## Tooltip

Bulle d'encre au survol et au focus (bulle claire en thème sombre). Un libellé court —
jamais du contenu riche.

**Ne pas l'utiliser** pour de l'information indispensable : ce qui doit être lu vit dans
la page, pas dans une bulle.

```tsx
<Tooltip content="Copier le prompt">
  <IconButton label="Copier le prompt"><Icon name="copy" /></IconButton>
</Tooltip>
```

- Props : `content` · `placement` (`top·bottom`) · `open` (force la bulle ouverte — cartes
  spécimens et captures).
- États rendus : fermé, ouvert au survol, ouvert au focus clavier, forcé (`open`).

---

# feedback

## Banner

Message persistant, dans une page ou une Card. Toujours couleur + icône + texte.

**Ne pas l'utiliser** pour du feedback transitoire (c'est `Toast`) ni pour une erreur de
champ (c'est `FormField error`).

```tsx
<Banner tone="warning" title="Ce tuto date de mars">La CLI a changé depuis — la méthode reste bonne.</Banner>
<Banner tone="info" title="Nouvelle série en ligne" action={<Button variant="secondary" size="sm">Voir</Button>} />
<Banner inset tone="amber">TikTok n'accepte qu'un moment de la vidéo comme miniature.</Banner>
<Banner inset tone="neutral" icon={<Icon name="user" />}>Les sous-titres suivent la transcription.</Banner>
```

- Props : `tone` (`danger·warning·success·info·amber·neutral`, défaut `info`) · `title` ·
  `children` (corps) · `action` (contrôle à droite) · `inset` · `icon`.
- **`inset`** : l'encart d'information posé DANS une carte, entre deux blocs — rayon md, plus
  serré, texte en body-sm ; les tons colorés quittent leur filet, le `neutral` se creuse comme
  un champ (`--secondary` sur la page, `--background` dans une carte ou une modale).
- **`amber`** : une contrainte à connaître, sans danger (« TikTok n'accepte qu'un moment »).
  `warning` reste ce qui risque d'échouer. **`neutral`** : une précision.
- **`icon`** remplace le glyphe du ton quand un autre dit mieux le sujet. Le bandeau garde
  TOUJOURS une icône : couleur + icône + texte.

## EmptyState

Emplacement vide en pointillés : tuile `Pastille panneau brand outlined`, titre H4 en face
display, une description courte, et **le prochain geste**. Toujours donner au lecteur la
suite.

**Ne pas l'utiliser** pour une erreur (c'est `Banner` ou `Modal` result), pour un
chargement (c'est `Skeleton`), ni pour EXPLIQUER un état — l'attente, l'indisponible, le cas
limite : c'est `StateCard`, une carte pleine, pas un emplacement vide.

```tsx
<EmptyState icon={<Icon name="folder" />} title="Aucun build ici"
  description="Choisis une série pour voir les vidéos correspondantes."
  action={<Button variant="secondary">Voir tout</Button>} />
<EmptyState tile={<Pastille size="dialogue" tone="neutral"><Icon name="search" /></Pastille>}
  title="Aucun résultat" description="Essaie un autre mot-clé." />
```

- Props : `icon` (glyphe nu — la Pastille par défaut l'enveloppe) · `tile` (la tuile
  complète, quand `panneau brand outlined` ne convient pas ; `icon` est alors
  ignoré) · `title` (requis) · `description` · `action` · `plain`.
- **`plain`** : sans cadre pointillé ni fond — l'état vide remplit déjà une section bordée
  (« Textes pas encore écrits » dans une carte).

## StateCard

La carte d'état HÉROS : l'attente, l'indisponible, l'erreur, le cas limite — « encore
un peu de matière », « l'audit n'est pas disponible », « la génération a échoué ». Une `Card lg`
centrée : pastille héros **outlined et carrée**, titre en subheading, corps muted sur la colonne
`narrow`, un appoint libre, une action. Deux tons : `brand` (« attends, c'est normal ») annonce
en `role="status"`, `danger` (« c'est nous, pas toi ») en `role="alert"`.

**Ne pas l'utiliser** pour un emplacement vide qui invite à remplir (c'est `EmptyState`, en
pointillés) ni pour un message passager (c'est `Banner`).

```tsx
<StateCard icon={<Icon name="clock" />} title="Encore un peu de matière, et on te dit tout"
  description="Ton compte a 2 publications récentes, il en faut au moins 3.">
  <Progress value={2} max={3} />
</StateCard>
<StateCard tone="danger" icon={<Icon name="circle-x" />} title="La génération a échoué"
  description="Rien ne t'a été débité. Réessaie dans un instant."
  action={<Button variant="primary">Réessayer</Button>} />
```

- Props : `tone` (`brand·danger`) · `icon` (glyphe nu — la `Pastille heros outlined`
  l'enveloppe) · `title` (requis) · `description` · `action` · `children` (l'appoint entre le
  corps et l'action : progression, badge, ligne de rassurance).
- États rendus : brand, danger, avec appoint, avec action.

## Progress

Barre fine : rail `--surface-alt`, remplissage `--brand-gradient` — la barre remplie porte
le dégradé de marque, jamais l'aplat (la piste, elle, reste un creux).
Déterminée (0–max) ou indéterminée (barre glissante).

**Ne pas l'utiliser** pour une attente sans notion d'avancement dans un contrôle — c'est
`Spinner` (ou `Button loading`).

```tsx
<Progress value={64} label="Progression du build" />
<Progress indeterminate label="Chargement" />
```

- Props : `value` · `max` (défaut 100) · `indeterminate` · `label` (nom accessible).
- ARIA : `role="progressbar"` + `aria-valuenow` (omis en indéterminé).

## Skeleton

Silhouette de chargement sur `--muted`, shimmer discret. Dimensions en chaînes CSS (rem
ou %) — c'est le style inline **légitime** au sens de la règle générale en tête de ce
fichier : la valeur vient de l'appelant à chaque rendu, il n'y a aucun défaut de design à
reprendre. (La même règle rend illégitime un défaut écrit inline : celui de `Glyph` et de
`Spinner` vit donc dans la cascade.)

**Ne pas l'utiliser** après le premier rendu : un skeleton qui persiste est un bug
d'affichage, pas un état.

```tsx
<Skeleton width="12rem" height="1.25rem" />
<Skeleton height="9rem" radius="var(--radius-lg)" />
```

- Props : `width` (défaut 100 %) · `height` (défaut 0.75rem) · `radius` (défaut
  `--radius-sm`).

## SkeletonCard

Un skeleton en forme de carte média (16/9 + lignes) — un par emplacement de grille pendant
qu'une grille de cartes charge.

```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-5)' }}>
  {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
</div>
```

- Props : `media` (le bloc 16/9, défaut `true`) · `lines` (défaut 2).

## Spinner

Anneau de chargement en `currentColor`, tailles alignées sur Icon (1 / 1.25 / 1.5rem).

**Ne pas le poser** dans un `Button` : la prop `loading` du bouton le fait, et désactive
le bouton avec.

```tsx
<Spinner size="sm" />
<Spinner size="1.5rem" />
```

- Props : `size` (`sm·md·lg` ou longueur CSS — omise, le créneau décide, comme pour
  Icon : même propriété `--ds-icon-size`, même repli 1.25rem).
- ARIA : `role="status"`, `aria-label="Chargement"`.

## Toast

Notification transitoire, en bas à droite du viewport, sur `--card` avec `--shadow-lg`.
Toujours couleur + icône + texte. Le texte d'erreur est concret, jamais dramatisé.

**Ne pas l'utiliser** pour un message qui doit rester lisible (c'est `Banner`) ni pour une
confirmation bloquante (c'est `Modal`).

```tsx
<Toast tone="success" title="Prompt copié" description="Colle-le dans Claude Code." onClose={() => fermer()} />
<Toast tone="danger" title="Ça a planté, on réessaie ?" description="Le build n'a pas pu démarrer." />
```

- Props : `tone` (`success·danger·warning·info`, défaut `info`) · `title` (requis) ·
  `description` · `onClose` (rend la croix).
- Tuile d'icône 1.5rem radius-sm, glyphes à stroke-width 2.5 (check / x / triangle-alert /
  info).

---

# forms

## Calendar

Vue mois, lundi d'abord, locale `fr-FR` par défaut. `Date` natif + `Intl` uniquement —
aucune dépendance. Date unique, pas de plage.

**Ne pas l'utiliser** posé nu dans un formulaire : c'est `DatePicker` qui l'y emmène, en
popover.

```tsx
<Calendar value={date} onChange={setDate} min={new Date()} />
<Calendar />
```

- Props : `value` · `onChange(Date)` · `min` / `max` · `disabledDates` · `locale` · `bare`
  (sans le cadre — l'usage interne du DatePicker).
- États rendus : jour au repos, survolé, sélectionné (aplat `--primary`), aujourd'hui
  (`--primary-readable` gras), désactivé, focus-visible.
- **Pas de plage.** En attendant un mode plage (périmètre envisagé : deux mois,
  surlignage des jours intermédiaires, présélections externes),
  un calendrier fait main peut émettre lui-même les classes du socle et hériter de ses
  espacements, de sa typo et de ses états au lieu de les réinventer : `.ds-cal` (cadre,
  ou `.ds-cal--bare`), `.ds-cal__head` / `.ds-cal__label` / `.ds-cal__nav`,
  `.ds-cal__grid` / `.ds-cal__wd` / `.ds-cal__day` et ses états `.is-today` /
  `.is-selected` / `:disabled`. Ces classes sont un contrat de rendu — le socle les
  garde stables tant que la parade est nécessaire.

## Checkbox

Case à cocher avec libellé. `forwardRef` : la ref atteint l'`<input>` natif —
`register()` de react-hook-form se branche directement.

**Ne pas l'utiliser** pour un choix exclusif (c'est `Radio`) ni pour un réglage à effet
immédiat (c'est `Switch`).

```tsx
<Checkbox label="Je veux recevoir le prompt du build" defaultChecked />
<Checkbox label="Sélection partielle" indeterminate />
<Checkbox label="Option indisponible" disabled />
```

- Props : `label` · `indeterminate` (case d'en-tête de sélection multiple : propriété DOM
  posée par ref, trait `minus` à la place de la coche, `aria-checked="mixed"`) + les
  attributs natifs (`checked`, `defaultChecked`, `onChange`, `disabled`…).
- États rendus : décochée, cochée, indéterminée, hover, focus-visible, désactivée.

## DatePicker

Déclencheur façon Input (même règle de `surface`) + `Calendar` en popover. Clic extérieur
ou Échap pour fermer — Échap et la sélection rendent le focus au déclencheur. Avec `name`,
un `<input type="hidden">` porte la date en ISO (`YYYY-MM-DD`) pour la soumission de
`<form>`. Avec react-hook-form : passer par `<Controller>` (composant contrôlé).

**Ne pas l'utiliser** pour une plage de dates — le système n'en a pas.

```tsx
<DatePicker value={date} onChange={setDate} placeholder="Choisir une date" />
<DatePicker surface="card" name="echeance" value={date} onChange={setDate} />
<DatePicker invalid value={date} onChange={setDate} />
<DatePicker value={date} onChange={setDate}
  trigger={({ value, triggerProps }) => (
    <button type="button" className="ds-btn ds-btn--secondary" {...triggerProps}>
      {value ? value.toLocaleDateString('fr-FR') : 'Choisir une date'}
      <Icon name="calendar" />
    </button>
  )} />
```

- Props : `value` · `onChange(Date)` · `placeholder` · `locale` · `min` / `max` ·
  `disabledDates` · `surface` (`page·card`) · `invalid` · `disabled` · `name` ·
  `trigger`.
- **`trigger` — le déclencheur composable**. Un render-prop qui reçoit
  `{ open, value, triggerProps }` et rend l'élément de son choix en **étalant
  `triggerProps`** dessus — ref, clic, clavier, ARIA. C'est l'étalement qui est le
  contrat : par lui le socle garde la ref (retour de focus sur Échap et sur sélection)
  et pose l'ARIA lui-même (`aria-haspopup` / `aria-expanded` / `aria-controls`), qui
  cesse d'être la charge de l'app. L'élément doit être **focusable et recevoir `ref`** —
  un `<button type="button">` nu, pas un composant sans `forwardRef` (le `Button` du
  socle n'en a pas : la ref s'y perdrait, et le retour de focus avec).
  **L'étalement est nu : aucun cast.** `triggerProps.ref` est une ref de RAPPEL
  (`(node: HTMLElement | null) => void`), donc assignable au `ref` de n'importe quelle
  balise. Un objet de ref sur `HTMLElement` ne l'aurait pas été — l'appelant aurait dû
  écrire `ref={triggerProps.ref as Ref<HTMLButtonElement>}`, et l'exemple ci-dessus
  n'aurait pas compilé. `disabled` reste
  la charge de l'appelant sur son élément. Sans `trigger`, rien ne change : le bouton
  façon Input d'hier, qui étale les mêmes `triggerProps` — les deux chemins ne peuvent
  pas diverger.
- États rendus : vide, rempli, ouvert, invalide, désactivé, focus-visible.

## Dropzone

La zone de dépôt d'un fichier : un cadre pointillé, une tuile, un titre, une aide, des contraintes
(`children`) et un bouton qui ouvre le sélecteur. Un fichier glissé au-dessus éclaire la zone
(filet `--primary` + plaque `--accent`) et peut changer le titre (`dragTitle`).

**Ne pas l'utiliser** pour un champ de formulaire ordinaire ni pour afficher un envoi en cours :
l'envoi, c'est `.ds-upload` (voir « Classes sans composant »), qui REMPLACE la zone.

```tsx
<Dropzone
  title="Dépose ta vidéo ici" dragTitle="Lâche pour envoyer" hint="Depuis ton ordinateur ou ton téléphone."
  tile={<Pastille size="dialogue" shape="round" tone="coral"><Icon name="upload" /></Pastille>}
  actionLabel="Choisir ma vidéo" accept="video/mp4,video/quicktime" onFiles={files => envoyer(files[0])}>
  <div className="flex flex-wrap justify-center gap-space-2">
    <Badge tone="amber" pad="dense">MP4 ou MOV</Badge><Badge tone="amber" pad="dense">3 min maximum</Badge>
  </div>
</Dropzone>
<Dropzone invalid title="Dépose ta vidéo ici" actionLabel="Choisir une autre vidéo" onFiles={…} />
```

- Props : `title` (requis) · `dragTitle` · `hint` · `tile` · `actionLabel` (requis) · `accept` ·
  `multiple` · `disabled` · `invalid` · `onFiles(File[])` (requis) · `children` (les contraintes).
- **Le composant ne valide rien** : il rend les fichiers tels quels. Format, durée, poids : l'app
  contrôle, pose `invalid` et dit POURQUOI à côté (`Banner tone="danger"`), en gardant la
  contrainte fautive visible (`Badge tone="danger"`).
- L'`<input type="file">` natif reste dans le flux d'accessibilité ; le bouton l'ouvre. Focus
  clavier sur le bouton, l'anneau suit le bouton.
- La surface se déduit comme un champ : `--secondary` sur la page, `--background` dans une
  carte ou une modale.
- États rendus : repos, survol, fichier tenu au-dessus, focus-visible, invalide, désactivé.

## FormField

Enveloppe libellé + contrôle + aide/erreur. Une erreur **remplace** le texte d'aide et
porte toujours couleur + icône + texte.

**Ne pas** poser un libellé à la main au-dessus d'un champ : c'est ce composant qui tient
l'anatomie.

```tsx
<FormField label="Ton email" htmlFor="mail" help="Un build décortiqué par semaine. Zéro spam.">
  <Input id="mail" placeholder="ton@email.com" />
</FormField>
<FormField label="Ton email" htmlFor="mail2" error="Ça a planté, on réessaie ?">
  <Input id="mail2" invalid defaultValue="pas-un-email" />
</FormField>
```

- Props : `label` · `htmlFor` · `help` · `error` · `required` (astérisque `--primary`) · `action`.
- **`action`** : un contrôle à droite du libellé, sur la même rangée (`.ds-field__head`) —
  « Copier », un lien. `<FormField label="Description" htmlFor="d" action={<Button variant="ghost" size="sm" icon={<Icon name="copy" />}>Copier</Button>}>…</FormField>`

## Input

Champ texte sur le rail de contrôle partagé, bordure 1.5px. Focus = la bordure passe en
`--ring` — UNE bordure, jamais un anneau en plus. Jamais un pill. `forwardRef` sur
l'`<input>` natif.

**Ne pas l'utiliser** pour du texte multi-lignes (c'est `Textarea`).

```tsx
<Input placeholder="ton@email.com" />
<Input surface="card" placeholder="Dans une Card" />
<Input invalid defaultValue="pas-un-email" />
<Input size="lg" placeholder="CTA de héros" />
<Input unit="kg" inputMode="decimal" placeholder="72" />
<FormField label="E-mail" htmlFor="mail3" help="Sert d'identifiant, ne se change pas.">
  <Input id="mail3" readOnly defaultValue="toi@exemple.com" iconEnd={<Icon name="lock" />} />
</FormField>
```

- Props : `size` (`sm·md·lg`) · `invalid` · `surface` (`page` = fond `--secondary`, posé
  à même le layout · `card` = fond `--background`, dans une Card) · `unit` · `iconEnd` +
  attributs natifs (`readOnly` compris).
- **`iconEnd`** : un glyphe DANS le champ, à droite, en sourdine, à 1rem (le créneau le
  dimensionne). Décoratif (`aria-hidden`) : le sens — « ne se change pas » — se dit dans le
  libellé ou l'aide du `FormField`. Avec `unit`, l'unité passe à gauche de l'icône.
- **`readOnly`** : la valeur se lit, se sélectionne, se copie et reste dans l'ordre de
  tabulation — au contraire de `disabled`, qui la sort du formulaire. Texte en
  `--text-muted`, curseur neutre. Un champ verrouillé s'écrit `readOnly` + `iconEnd={<Icon
  name="lock" />}` + une aide, jamais `disabled`.
- **`unit`** : l'unité — « kg », « € », « min » — posée DANS le champ, à
  droite, en sourdine. **Trois caractères au plus** ; plus long, c'est un suffixe de
  libellé, pas une unité. Elle est `aria-hidden` : le libellé du `FormField` la nomme.
- États rendus : repos, focus, invalide, désactivé, lecture seule — sur les deux surfaces ;
  avec unité, avec icône de fin.

## Radio

Bouton radio — le seul contrôle circulaire du système. Toujours dans un groupe `name`.
`forwardRef` sur l'`<input>` natif.

**Ne pas l'utiliser** pour plus de ~5 options (c'est `Select`) ni pour un choix multiple
(c'est `Checkbox`).

```tsx
<Radio name="niveau" value="debutant" label="Je débute" defaultChecked />
<Radio name="niveau" value="avance" label="Je code déjà" />
```

- Props : `label` + attributs natifs (`name`, `value`, `checked`, `onChange`,
  `disabled`…).
- États rendus : au repos, sélectionné, hover, focus-visible, désactivé.

## Select

Select **natif** sur le rail 3rem, avec un chevron Lucide. Même silhouette qu'Input et
Button md. `forwardRef` sur le `<select>` natif.

**Ne pas** le remplacer par un menu custom : le natif gagne au clavier et au tactile.

```tsx
<Select options={[{ value: 'build', label: 'Build' }, { value: 'tuto', label: 'Tuto' }]} defaultValue="build" />
<Select options={[{ value: 'a', label: 'A' }]} invalid />
```

- Props : `options` (`{value, label}[]`) · `invalid` · `surface` (`page·card`) + attributs
  natifs.
- États rendus : repos, focus, invalide, désactivé — sur les deux surfaces.

## Switch

Bascule binaire à effet **immédiat** — jamais suivie d'un bouton Enregistrer. `forwardRef`
sur l'`<input>` natif.

**Ne pas l'utiliser** dans un formulaire soumis d'un bloc (c'est `Checkbox`).

```tsx
<Switch label="Thème sombre" defaultChecked />
<Switch label="Notifications" disabled />
```

- Props : `label` + attributs natifs (`checked`, `onChange`, `disabled`…). Rendu
  `role="switch"`.
- États rendus : off, on, hover (piste teintée vers `--primary`), focus-visible,
  désactivé.

## Textarea

Champ multi-lignes. Hauteur automatique — jamais de min-height. Redimensionnement
vertical uniquement. Même règle de `surface` que l'Input. `forwardRef` sur le
`<textarea>` natif.

```tsx
<Textarea rows={5} placeholder="Décris ton idée d'app en deux phrases." />
<Textarea rows={3} invalid defaultValue="Trop court" />
```

- Props : `invalid` · `rows` (défaut 4) · `surface` (`page·card`) + attributs natifs.
- États rendus : repos, focus, invalide, désactivé.

---

# icons

## Icon

LE système d'icônes : Lucide, exclusivement. Jamais un emoji, jamais un SVG dessiné à la
main. 56 glyphes typés (`IconName`) — un nom hors du type est une erreur TypeScript, et
c'est voulu.

**Ne pas** chercher d'icône de plateforme sociale ici (YouTube, Instagram…) : ce sont des
logos, pas des icônes d'interface — le set n'en a pas. Et jamais `sparkles` : l'étoile-éclair
est bannie du set.

**La taille vient du CRÉNEAU, pas du site d'appel.** Une icône sans `size` lit
`var(--ds-icon-size, 1.25rem)` ; les créneaux du socle posent la propriété par une règle
CSS (bouton sm 1rem · bouton et IconButton md 1.125rem · badge dense 0.75rem · pastille
dialogue et panneau 1.5rem · déclencheurs de champ 1rem — les défauts du socle, dans
patterns.css). **Ne passez `size` que pour une correction optique** — une croix ouverte
lit plus petit qu'un aplat, on la remonte d'un cran — ou hors de tout créneau : passée,
elle gagne sur la règle. Un projet pose son propre créneau en ciblant le `svg` lui-même
(`.ma-tuile svg { --ds-icon-size: 1.5rem }`) — jamais le conteneur : la propriété est
enregistrée `inherits: false`, une règle de conteneur est inerte, et c'est voulu.

```tsx
<Icon name="circle-check" strokeWidth={2} />
<Icon name="arrow-right" size="1rem" style={{ color: 'var(--primary-readable)' }} />
```

**Ce que le catalogue ne couvre pas se passe en `glyph`.** Lucide compte ~1500 tracés ;
le catalogue en cure 56 glyphes. Pour le reste, l'app importe le tracé et le socle lui applique
ses propres règles — même grille, même épaisseur. Plus besoin de publier une version du
design system pour une icône.

```tsx
import { ShoppingBag } from 'lucide-react';

<Icon glyph={ShoppingBag} />
```

- Props : `name` (`IconName`) **ou** `glyph` (tracé lucide), jamais les deux — ils sont
  mutuellement exclusifs, et le TYPE l'impose : passer les deux, ou aucun, est une erreur
  de compilation. · `size` (longueur CSS, toujours rem — omise, le créneau décide) ·
  `strokeWidth` (2 standard · 2.5 dans les pills et les toasts · 3 pour la coche).
- **`name` reste la voie normale** : le catalogue est relu, documenté, et garantit qu'un
  nom existe. `glyph` est la porte de sortie, pas le chemin par défaut — un besoin qui
  revient dans DEUX apps mérite d'entrer au catalogue.
- `glyph` n'autorise PAS un SVG maison : le rendu reste celui du socle. Ce qui s'ouvre,
  c'est le choix du tracé dans lucide, pas la liberté graphique.
- La couleur suit `currentColor`. Les actions destructives prennent `trash-2`.

---

# navigation

## AppShell

Le squelette d'app-outil : grille `[Sidebar | contenu]`. Sous 64rem, la sidebar devient un
tiroir piloté par `open`/`onClose` de `Sidebar`.

**Ne pas l'utiliser** pour un site de contenu (c'est `Navbar` + `Footer`).

```tsx
<AppShell sidebar={<Sidebar sections={sections} open={menuOpen} onClose={() => setMenuOpen(false)} />}>
  {contenu}
</AppShell>
```

- Props : `sidebar` (un `<Sidebar>`) · `responsive` (défaut `true` ; `false` fige la
  double colonne desktop).

## Footer

Pied de site : marque, ligne de signature optionnelle, colonnes de liens, rangée sociale.

```tsx
<Footer
  note="Busan · Corée du Sud"
  columns={[{ title: 'Séries', links: [{ label: 'Build' }, { label: 'Tuto' }] }]}
  social={<IconButton label="GitHub"><Icon name="github" /></IconButton>}
/>
```

- Props : `columns` (`{title, links:[{label, href?}]}[]`) · `social` · `brand` (défaut :
  le `Logo` du paquet) · `letters` · `note` (ligne de lieu/signature — AUCUN défaut :
  omise, la ligne n'est pas rendue ; le point médian `·` sert de séparateur).

## Navbar

Barre de site sticky : logo à gauche, liens au centre, CTA à droite. Toujours sur
`--secondary` avec filet bas — un contrôle détaché du layout, jamais transparent. Au
scroll : teinte + blur + ombre. C'est le SEUL endroit du système qui emploie
`backdrop-filter` — pas de glassmorphism ailleurs.

```tsx
<Navbar
  links={[{ label: 'Vidéos', active: true }, { label: 'Séries' }, { label: 'À propos' }]}
  cta={<Button size="sm">La newsletter</Button>}
/>
```

- Props : `links` (`{label, href?, active?}[]`) · `cta` · `brand` (défaut : le `Logo`) ·
  `homeHref` / `homeLabel` · `letters` · `scrolled` (force l'état scrollé — spécimens) ·
  `children` (rendu dans l'emplacement de DROITE, juste **avant** `cta` : une action de plus
  — bascule de thème, sélecteur de langue — sans remplacer le CTA).
- États rendus : repos, scrollée, lien au repos / survolé / actif.

## Pagination

Pagination contrôlée sur une barre `--secondary` (même traitement que Tabs). Ellipse
au-delà de 7 pages ; la page courante reçoit le traitement de l'onglet actif.

```tsx
<Pagination page={page} pageCount={12} onPageChange={setPage} />
```

- Props : `page` (1-based) · `pageCount` · `onPageChange`.
- États rendus : page au repos, survolée, courante (`aria-current="page"`), flèches
  désactivées aux bornes, focus-visible.

## Sidebar

Navigation d'app sur `--secondary` : marque en tête, sections titrées, item actif, pied
(Avatar + nom). Repliable en icônes seules, persisté en localStorage. Sous 64rem : tiroir
`open`/`onClose`, voile compris.

```tsx
<Sidebar
  sections={[{ title: 'Outils', items: [
    { label: 'Accueil', icon: <Icon name="house" />, active: true },
    { label: 'Contenu', icon: <Icon name="video" /> },
  ] }]}
  footer={<Avatar size="2rem" />}
/>
```

- Props : `sections` (`{title?, items:[{label, icon?, href?, active?, onClick?}]}[]`) ·
  `footer` · `footerItems` · `brand` / `brandCollapsed` · `collapsible` (défaut `true`) ·
  `defaultCollapsed` · `storageKey` · `open` / `onClose` (tiroir mobile) · `staticLayout`
  · `linkAs`.
- Chaque section est un **groupe** : les groupes se séparent par le gap de la nav (16px),
  avec ou sans titre — deux sections sans titre ne se collent pas.
- **L'entrée active** suit la convention de l'élément sélectionné, partout dans le socle :
  plaque `--accent`, libellé `--primary` (le corail — écart de contraste assumé dans la
  marque), MÊME graisse que ses voisines, icône en `currentColor`. Jamais « noir gras ».
- États rendus : dépliée, repliée, item au repos / survolé / actif, tiroir ouvert.

## Tabs

Groupe d'onglets segmenté sur le rail de contrôle. La barre contraste TOUJOURS avec sa
surface porteuse : `--secondary` sur la page, `onCard` bascule sur `--background`.
Rectangle (barre 0.875rem · onglet `--radius-sm`) — jamais un pill, jamais fondu dans le
fond.

**Ne pas l'utiliser** pour de la navigation entre pages (c'est `Navbar` ou `Sidebar`) :
Tabs filtre un contenu en place — ou, en `mode="choice"`, choisit une valeur.

```tsx
<Tabs value={tab} onChange={setTab}
  items={[{ value: 'all', label: 'Tout' }, { value: 'build', label: 'Build' }]} />
<Tabs onCard value={tab} onChange={setTab} items={[{ value: 'all', label: 'Tout' }]} />
<Tabs mode="choice" fullWidth aria-label="Niveau de langue" value={niveau} onChange={setNiveau}
  items={[{ value: 'soutenu', label: 'Soutenu' }, { value: 'naturel', label: 'Naturel' }, { value: 'familier', label: 'Familier' }]} />
```

- Props : `items` (`{value, label, disabled?}[]`) · `value` / `onChange` (contrôlé) · `onCard` ·
  `mode` (`tabs·choice`) · `fullWidth` · `disabled` · `readOnly` (mode `choice`) · `size`
  (`md·sm`).
- **`size="sm"`** : la barre compacte, sur le rail sm, texte en body-sm — le filtre posé dans
  une carte d'écran (« Tous · Brouillon · Programmé · Publié »).
- **`mode="choice"`** — choisir UNE valeur parmi trois ou quatre (un niveau, un degré), avec
  le rendu de la barre d'onglets. Sémantique d'un groupe de radios : `radiogroup` / `radio` +
  `aria-checked`, un seul arrêt de tabulation (la valeur choisie), `←` `→` `↑` `↓` déplacent
  le choix, `Début` / `Fin` vont aux extrémités. Le groupe se NOMME : `aria-label` ou
  `aria-labelledby`. Au-delà de quatre valeurs ou pour des libellés longs : des tuiles
  compactes (`.ds-tile--compact`, voir « Classes sans composant »).
- **`fullWidth`** : la barre prend la largeur, les onglets se la partagent à parts égales
  (padding latéral réduit à `--space-1` pour tenir dans une colonne étroite).
- **`readOnly`** : la valeur reste lisible et focusable (`aria-readonly`), ni le clic ni le
  clavier ne la changent. **`disabled`** : tout le groupe inerte ; un item seul par
  `items[i].disabled` (sauté par les flèches).
- États rendus : onglet au repos, survolé, sélectionné (`aria-selected` / `aria-checked`),
  focus-visible, désactivé, lecture seule.

---

# overlays

## Modal

Dialogue de confirmation ou de tâche focalisée, sur `--popover`, au-dessus d'un voile
encre flouté. **Trois phases dans UN dialogue** : `confirm` → `loading` (rien ne ferme :
Échap, voile et croix inertes) → `result` (succès ou erreur, avec « Réessayer »). Sous
64rem, la MÊME modale devient une feuille basse — CSS seul. Focus piégé, Échap ferme,
focus rendu au déclencheur.

**Ne pas l'utiliser** pour du feedback passif (c'est `Toast` ou `Banner`) ni pour un menu
d'actions (c'est `.ds-dropdown`, voir « Classes sans composant »).

```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  icon={<Icon name="triangle-alert" />}
  title="Supprimer ce build ?"
  description="Cette action est définitive."
  footer={<>
    <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
    <Button variant="danger">Supprimer</Button>
  </>}
/>
<Modal inline phase="result" onClose={() => setOpen(false)}
  result={{ status: 'success', title: 'Build supprimé', message: 'Les fichiers ont été retirés.' }} />
```

- Props : `open` · `icon` + `iconVariant` (`danger·brand·neutral·warning·success` — la
  tuile est une `Pastille dialogue`) · `title` / `description` / `children` · `footer` ·
  `onClose` · `closeButton` · `dismissable` · `phase` (`confirm·loading·result`) ·
  `result` (`{status, title?, message?, onRetry?}`) · `size` (`md·lg`) · `inline` (spécimen
  sans voile).
- **Sans icône, le titre partage la ligne de la croix**, centré verticalement — seule sur sa
  rangée, la croix ferait tomber le titre 46-56 px sous le bord. Avec une pastille, la rangée pastille +
  croix reste et le titre passe dessous.
- **`size="lg"`** : 32,5 rem (`--modal-w-lg`), la modale à FORMULAIRE ou à contenu riche (un
  paiement, une résiliation). `md` (23,75 rem) reste la confirmation et le résultat. Sans effet
  sous 64 rem.
- **Rythme interne `--space-5`** : 24 px entre l'en-tête, le texte, les enfants et le pied ; le
  pied n'a pas de marge propre. Une ligne d'appoint, un champ : des enfants, le gap fait le
  reste.
- **La croix et les gestes de fuite sont découplés** : `closeButton={false}`
  retire la croix en gardant Échap et le clic-voile ; `dismissable={false}` fait
  l'inverse — la croix devient le seul geste de fermeture, pour une modale à saisie
  qu'un clic à côté ne doit pas jeter. Les deux à `true` par défaut.
- Un champ dans une modale : voir le spécimen « Avec un champ contrôlé » de la vitrine —
  le piège de focus tient la frappe.
- États rendus : les trois phases, avec et sans icône, succès et erreur, feuille basse
  sous 64rem.

---

# Classes sans composant

Plusieurs motifs du socle n'ont **pas** de composant React — la tuile cochable (et ses formes
compacte et panneau), l'encart de valeur, le menu déroulant, et les motifs des parcours (v0.4.0 :
la barre d'étapes, le voile, le prix et les avantages, le fichier et l'envoi, le média vertical et
la bande d'images, l'agenda, les marques de texte). Leurs classes sont stables et documentées
ici ; une app écrit le balisage elle-même, en React comme en Preact (écrans MCP) ou en HTML
(site vitrine). `check-catalogue.mjs` n'exige pas de section `##` pour eux, puisqu'ils ne sont
pas exportés, mais il vérifie que chaque classe `.ds-*` citée dans cette partie existe dans
`patterns.css`.

**La tuile cochable — `.ds-tile`.** UNE anatomie pour tous les choix en tuile. Fond
`--background`, radius md, filet 1,5 px ; cochée : filet `--primary` + plaque `--accent`, le
titre reste en encre à sa graisse. La tuile EST le `<label>` : toute sa surface coche, le
clavier et le formulaire sont ceux de l'`<input>` natif, et le contrôle `.ds-choice` (case ou
rond) rend dedans, dans un `<span>` — jamais un `<label>` dans un `<label>`, jamais un
`<button role="checkbox">`.

```html
<label class="ds-tile">
  <span class="ds-choice">
    <input type="radio" name="formule" value="solo" />
    <span class="ds-choice__box ds-choice__box--radio" aria-hidden="true"><span class="ds-choice__dot"></span></span>
  </span>
  <span class="ds-tile__main">
    <span class="ds-tile__title">Solo</span>
    <span class="ds-tile__desc">Un espace, un projet.</span>
  </span>
  <span class="ds-tile__meta">1 projet</span>
</label>
```

- Classes : `.ds-tile` · `.ds-tile__main` / `__title` / `__desc` / `__meta` · `.ds-tile--media`
  + `.ds-tile__media` (vignette 6 rem collée aux bords haut, bas et gauche, `<img>` en cover ;
  le titre passe en ellipse) · `.ds-tile--start` (la case sur la PREMIÈRE ligne d'un texte de
  plusieurs lignes ; sans effet avec un média) · `.is-disabled`. Une case à cocher prend
  `.ds-choice__box` avec une coche `<Icon name="check">` dedans.
- États : repos, survol, cochée (lue par `:has(input:checked)`), focus-visible (anneau sur la
  tuile), désactivée. Les aides `.is-hover` / `.is-checked` / `.is-focus` servent la vitrine.

**La tuile compacte et la pastille de choix — `.ds-tile--compact`, `.ds-tile--chip`.** La même
tuile pour une LISTE de choix, sur une ligne. `--compact` garde la case : un choix simple parmi
une dizaine (une niche). `--compact` + `--chip` en fait une pastille en pilule pour un choix
multiple court et nombreux (des passions, des vécus, un humour) : la case est masquée
visuellement mais l'`<input>` reste focusable, annoncé et coché par Espace ; une fois cochée, la
pastille prend un filet `--primary` et affiche `.ds-tile__check` en tête. Un glyphe de tête
optionnel, `.ds-tile__lead` (`aria-hidden`), porte une `<Icon>` — ou un emoji quand l'emoji EST
la donnée affichée (l'emoji d'une passion), jamais une icône d'interface. **La limite `max` d'un
choix multiple reste à l'app** (désactiver les pastilles restantes, dire pourquoi).

```html
<div role="radiogroup" aria-label="Ta niche" class="grid gap-space-3">
  <label class="ds-tile ds-tile--compact">
    <span class="ds-choice">
      <input type="radio" name="niche" value="tech" />
      <span class="ds-choice__box ds-choice__box--radio" aria-hidden="true"><span class="ds-choice__dot"></span></span>
    </span>
    <span class="ds-tile__main"><span class="ds-tile__title">Tech & IA</span></span>
  </label>
</div>

<fieldset>
  <legend class="ds-label">Passions</legend>
  <label class="ds-tile ds-tile--compact ds-tile--chip">
    <span class="ds-tile__check" aria-hidden="true"><!-- <Icon name="check" strokeWidth={3} /> --></span>
    <span class="ds-tile__lead" aria-hidden="true">✈️</span>
    <span class="ds-choice">
      <input type="checkbox" name="passions" value="voyage" />
      <span class="ds-choice__box" aria-hidden="true"></span>
    </span>
    <span class="ds-tile__main"><span class="ds-tile__title">Voyage</span></span>
  </label>
</fieldset>
```

- Classes : `.ds-tile--compact` · `.ds-tile--chip` (avec `--compact`) · `.ds-tile__lead` ·
  `.ds-tile__check` (rendu seulement cochée) · `.is-readonly` sur la tuile ou
  `aria-readonly="true"` sur l'input (lecture seule : focusable, le survol ne l'invite plus ;
  EMPÊCHER le changement reste à l'app).
- États : repos, survol, coché, focus-visible (anneau sur la tuile), désactivé, lecture seule.

**La tuile panneau — `.ds-tile--panel`.** Un choix RICHE, en colonne : une option de miniature (avec
sa bande d'images), un créneau proposé parmi trois, une façon de commencer. La case est masquée
visuellement, l'`<input>` reste focusable et annoncé ; la tuile choisie remonte au niveau de la
carte — fond `--card`, filet `--primary`, ombre douce — sans plaque `--accent` (le contenu y serait
illisible). Le titre passe en face display. `.ds-tile__row` aligne une rangée (titre, badges), et y
pousse à droite `.ds-tile__check` (glyphe de fin, rendu seulement coché) ou `.ds-tile__end`.

```html
<div role="radiogroup" aria-label="La miniature" class="grid gap-space-3">
  <label class="ds-tile ds-tile--panel">
    <span class="ds-choice"><input type="radio" name="miniature" value="moment" checked />
      <span class="ds-choice__box ds-choice__box--radio" aria-hidden="true"><span class="ds-choice__dot"></span></span></span>
    <span class="ds-tile__row"><span class="ds-tile__title">Un moment de la vidéo</span><span class="ds-tile__end">…</span></span>
    <span class="ds-tile__desc">Le seul choix accepté par TikTok.</span>
  </label>
</div>
```

**Un panneau qui contient ses propres contrôles** (une bande d'images `.ds-frames`, un bouton) n'est
plus un `<label>` — un label dans un label est du HTML invalide : c'est un `<div class="ds-tile
ds-tile--panel">`, et la case vit dans un `<label class="ds-tile__row">` avec le titre. L'état du
panneau ne lit alors que SA case (`.ds-choice`) : une image cochée dans la bande ne le fait pas
passer pour choisi. Choisir une image choisit aussi le panneau : c'est à l'app de le faire.

- Classes : `.ds-tile--panel` · `.ds-tile__row` · `.ds-tile__end` (+ celles de la tuile).
- États : repos, survol, choisie, focus-visible (anneau sur la tuile), désactivée, lecture seule.

**L'encart de valeur — `.ds-inset`.** Une valeur posée DANS une carte : une bio, une réponse, une
citation relevée. Une ligne de texte sur une surface creusée, rayon md, action facultative à
droite. Ce n'est pas une `Card` (on n'imbrique pas une carte dans une carte), ni un `EmptyState`
(colonne centrée à pastille) : c'est l'équivalent en lecture d'un champ, et sa surface se
DÉDUIT comme la sienne — `--secondary` sur la page, `--background` dans une carte, une modale ou
un menu.

```html
<p class="ds-inset"><span class="ds-inset__value">Développeuse indépendante, outils internes.</span></p>
<div class="ds-inset ds-inset--dashed">
  <span class="ds-inset__value">Comment tu en es arrivé là, en deux ou trois phrases.</span>
  <a class="ds-inset__action" href="/profil#histoire">Compléter</a>
</div>
<p class="ds-inset ds-inset--bare"><span class="ds-inset__value">« Je vais être direct. »</span></p>
```

- Classes : `.ds-inset` (bordé : une valeur remplie) · `--dashed` (un champ VIDE, « à
  compléter » : filet pointillé, texte en sourdine) · `--bare` (sans filet : une matière en
  lecture seule) · `__value` · `__action` (un lien ou un `Button` `sm`, qui porte ses propres
  états : survol, focus-visible, désactivé).
- L'encart ne se clique pas en entier : l'action est l'élément interactif. Un titre ou une
  provenance au-dessus (« Détecté par… », « À compléter ») est une composition de l'app.
- **`.ds-inset--stack`** (v0.4.0) : un texte en plusieurs blocs — un hook, un script en blocs
  nommés, une transcription, un message à copier. `.ds-inset__head` porte les badges et pousse
  `.ds-inset__action` à droite (« Copier »), puis vient la matière.

```html
<div class="ds-inset ds-inset--stack">
  <div class="ds-inset__head"><span class="ds-badge ds-badge--dense ds-badge--coral">Hook</span>
    <button class="ds-btn ds-btn--ghost ds-btn--sm ds-inset__action">Copier</button></div>
  <p class="ds-inset__value">Tes vidéos ne sont pas trop longues. Elles sont trop lentes à démarrer.</p>
</div>
```

**Le menu déroulant — `.ds-dropdown`.** Panneau sur `--popover`, rayon lg, `--shadow-lg`,
items éclairés sur `--surface-alt`, rail d'item à 44 px. `role="menu"` sur le panneau,
`role="menuitem"` sur un item d'action, `role="menuitemradio"` + `aria-checked` sur un item de
CHOIX (tri, filtre) : plaque `--accent`, texte `--primary` à la MÊME graisse, coche en fin de
ligne. Les deux se mélangent dans un même menu.

```html
<span class="relative inline-flex">
  <button class="ds-btn ds-btn--secondary" aria-haspopup="menu" aria-expanded="true">Plus récents</button>
  <div role="menu" class="ds-dropdown ds-dropdown--floating ds-dropdown--end">
    <button role="menuitemradio" aria-checked="true" class="ds-dropdown__item"><span class="ds-dropdown__label">Plus récents</span><span class="ds-dropdown__check" aria-hidden="true">…</span></button>
    <button role="menuitemradio" aria-checked="false" class="ds-dropdown__item"><span class="ds-dropdown__label">Par nom</span></button>
    <hr class="ds-dropdown__sep" />
    <button role="menuitem" class="ds-dropdown__item ds-dropdown__item--danger"><span class="ds-dropdown__label">Supprimer</span></button>
  </div>
</span>
```

- Classes : `.ds-dropdown` · `--floating` (ancré JUSTE SOUS son déclencheur, dans un parent en
  `position: relative` que l'app pose) · `--end` (bords droits alignés : le menu d'un bouton en
  bout de ligne) · `__item` / `__item--danger` · `__label` · `__hint` (raccourci, méta) ·
  `__check` · `__sep`.
- Sans `--floating`, le panneau est rendu dans le flux (spécimen).
- Le comportement (ouverture, fermeture au clic extérieur et à Échap, navigation au clavier)
  est à la charge de l'app.

---

**Les parcours (v0.4.0).** Ce que partagent les outils à plusieurs étapes, dans le hub comme dans un
écran de Claude. AUCUN vocabulaire d'outil : libellés, statuts et leurs tons, réseaux et leurs logos
vivent dans la couche qui les affiche.

**La barre d'étapes — `.ds-steps`.** Une `<ol>` ; chaque `.ds-step` porte un repère `.ds-step__mark`
(un numéro, ou une coche quand l'étape est faite) et son libellé, reliés par un trait. Faite :
`.is-done` (repère success + coche) ; en cours : `aria-current="step"` (repère en dégradé plein,
libellé en gras) ; à venir : par défaut (repère corail doux, libellé en sourdine). La rangée passe à
la ligne d'elle-même à 390 px. Estompée sous un voile : la poser dans `.ds-veil__content`.

```html
<ol class="ds-steps" aria-label="Les étapes">
  <li class="ds-step is-done"><span class="ds-step__mark"><!-- <Icon name="check" strokeWidth={3} /> --></span>Vidéo</li>
  <li class="ds-step" aria-current="step"><span class="ds-step__mark">2</span>Transcription</li>
  <li class="ds-step"><span class="ds-step__mark">3</span>Textes</li>
</ol>
```

- Classes : `.ds-steps` · `.ds-step` · `.ds-step__mark` · `.is-done` · `.is-current` (ou `aria-current="step"`).

**Le voile d'un outil non activé — `.ds-veil`.** Le contenu RESTE VISIBLE, estompé et inerte, et un
panneau (la carte d'offre) se pose dessus. `.ds-veil` RECOUVRE — une page du hub : un fondu vers la
surface, le panneau centré en haut, le contenu montré sur `--veil-h`. `.ds-veil--below` EMPILE — un
écran de Claude, à hauteur automatique : le contenu estompé, le panneau dessous. L'app pose `inert`
et `aria-hidden="true"` sur `.ds-veil__content` : rien dedans ne se focalise ni ne s'annonce.

```html
<div class="ds-veil">
  <div class="ds-veil__content" inert aria-hidden="true">…les sections de la fiche…</div>
  <div class="ds-veil__panel"><div class="ds-card">…la carte d'offre…</div></div>
</div>
```

- Classes : `.ds-veil` · `.ds-veil--below` · `.ds-veil__content` · `.ds-veil__panel`.

**Le prix et les avantages — `.ds-price`, `.ds-perks`.** `.ds-price` : le montant en face display
800 (`__amount`), la période à côté (`__period`) sur `__line`, une note dessous (`__note`, « Sans
engagement »). Le montant ne porte aucune couleur : `.accent` sur un `<span>` dedans quand la
maquette le veut. `--sm` dans un écran de Claude, `--end` aligné à droite. **Le montant vient
toujours du serveur.** `.ds-perks` : une liste d'avantages en plaques (`.ds-perk`), chacun une
`Pastille size="puce"` (coche success, ou icône d'un ton choisi) puis le libellé ; deux colonnes dans
une carte de 680, une seule à 390. Rien ne se coche : ce n'est pas une tuile.

```html
<div class="ds-price ds-price--end">
  <span class="ds-price__line"><span class="ds-price__amount"><span class="accent">12 €</span></span><span class="ds-price__period">/ mois</span></span>
  <span class="ds-price__note">Sans engagement</span>
</div>
<ul class="ds-perks">
  <li class="ds-perk"><span class="ds-pastille ds-pastille--puce ds-pastille--success"><!-- check --></span>Transcription et sous-titres</li>
</ul>
```

- Classes : `.ds-price` · `--sm` · `--end` · `__line` · `__amount` · `__period` · `__note` ·
  `.ds-perks` · `.ds-perk`.

**La zone de dépôt en balisage — `.ds-dropzone`.** Le composant `Dropzone` en React ; dans un écran
de Claude, le même balisage : `.ds-dropzone` (+ `.is-dragover`, `.is-invalid`, `.is-disabled`),
`__main`, `__title`, `__hint`, et l'`<input type="file">` en `.ds-dropzone__input` (masqué à l'œil,
présent pour le clavier et le lecteur d'écran). Le glisser-déposer est à la charge de l'app.

- Classes : `.ds-dropzone` · `__main` · `__title` · `__hint` · `__input` · `.is-dragover` ·
  `.is-invalid` · `.is-disabled`.

**Le fichier et l'envoi — `.ds-file`, `.ds-upload`.** `.ds-file` : une rangée — une tuile
(`Pastille`), le nom en ellipse et sa méta (`__main`, `__name`, `__meta`), les actions à droite
(`__actions`, qui passent dessous quand la place manque) : un fichier joint, une vidéo déposée, des
sous-titres. `.ds-upload` : un envoi — le fichier, une `Progress`, un pied (`__foot` : une rassurance,
une action). En pause (`.is-paused`) ou interrompu (`.is-interrupted`), la barre s'estompe ;
interrompu, le cadre prend le filet d'avertissement et l'action devient « Reprendre ».

```html
<div class="ds-upload is-interrupted">
  <div class="ds-file"><span class="ds-pastille ds-pastille--dialogue ds-pastille--warning">…</span>
    <span class="ds-file__main"><span class="ds-file__name">Envoi interrompu à 64 %</span><span class="ds-file__meta">La connexion a coupé. Rien n'est perdu.</span></span></div>
  <div class="ds-progress" role="progressbar" aria-valuenow="64" aria-valuemin="0" aria-valuemax="100"><div class="ds-progress__bar" style="width:64%"></div></div>
  <div class="ds-upload__foot"><span>312 Mo sur 486 Mo</span><button class="ds-btn ds-btn--secondary ds-btn--sm">Reprendre l'envoi</button></div>
</div>
```

- Classes : `.ds-file` · `__main` · `__name` · `__meta` · `__actions` · `.ds-upload` · `__foot` ·
  `.is-paused` · `.is-interrupted`.

**Le média vertical et la bande d'images — `.ds-media`, `.ds-frames`.** `.ds-media` : un cadre 9:16
(une vidéo courte, sa vignette) — sa LARGEUR est celle du parent, posée par l'appelant ; fond
`--tone-dark`, l'`<img>` ou la `<video>` en cover, le glyphe de lecture au centre (`__play`), la
durée en bas à gauche (`__badge`). `.ds-media--unavailable` : le média n'existe plus (cadre pointillé
sur `--muted`, une tuile, un texte court). `.ds-frames` : choisir UN moment parmi quelques images —
chaque `.ds-frame` est un `<label>` qui porte un radio natif ; choisi : contour `--primary` décalé.

```html
<div style="width:7.5rem"><div class="ds-media"><img src="…" alt="" /><span class="ds-media__play">…</span><span class="ds-media__badge">00:45</span></div></div>
<div class="ds-frames" role="radiogroup" aria-label="Le moment de la miniature">
  <label class="ds-frame"><input type="radio" name="moment" value="2" checked aria-label="00:02" /><img src="…" alt="" /></label>
</div>
```

- Classes : `.ds-media` · `__play` · `__badge` · `--unavailable` · `.ds-frames` · `.ds-frame`.

**L'agenda — `.ds-agenda` (le mois), `.ds-week` (la semaine).** `.ds-agenda` : sept colonnes, en-têtes
`__wd`, cases `__cell` (un `<button>` ou un `<a>` se survole et prend le focus) avec leur numéro
`__num` et leurs marques `__event` (icône + heure + `__event-label` en ellipse), dans les tons des
pastilles : `--amber`, `--success`, `--danger`, neutre par défaut. Hors du mois : `.is-outside` ;
aujourd'hui : `.is-today` (numéro sur le dégradé) ; jour retenu : `.is-selected`. `--compact` dans un
écran de Claude ; une seule rangée de sept cases fait une bande de semaine. `.ds-week` : un jour par
rangée (`__day`), la colonne du jour (`__date` : `__num`, `__wd`, `__meta`), puis ses éléments
(`__items`, deux par ligne tant que la place le permet) ou `__empty`. Un élément (`__item`) est une
plaque cliquable dont l'app écrit le contenu. Aujourd'hui : `.is-today`. `--compact` dans Claude.
**Le calcul des dates reste à l'app** : le `Calendar` du socle choisit une date, il n'affiche pas
d'événements.

```html
<div class="ds-agenda ds-agenda--compact">
  <div class="ds-agenda__head"><span class="ds-agenda__wd">Lun</span>…</div>
  <div class="ds-agenda__grid">
    <button class="ds-agenda__cell is-today"><span class="ds-agenda__num">9</span>
      <span class="ds-agenda__event ds-agenda__event--amber">…<span class="ds-agenda__event-label">18:00</span></span></button>
  </div>
</div>
<ol class="ds-week">
  <li class="ds-week__day is-today"><div class="ds-week__date"><span class="ds-week__num">9</span><span class="ds-week__wd">Ven</span></div>
    <div class="ds-week__items"><a class="ds-week__item" href="…">…</a></div></li>
</ol>
```

- Classes : `.ds-agenda` · `--compact` · `__head` · `__wd` · `__grid` · `__cell` · `__num` ·
  `__event` · `__event--amber` · `__event--success` · `__event--danger` · `__event-label` ·
  `.is-outside` · `.is-today` · `.is-selected` · `.ds-week` · `--compact` · `__day` · `__date` ·
  `__num` · `__wd` · `__meta` · `__items` · `__item` · `__empty`.

**Les marques de texte — `.ds-mark`, `.ds-snippet`, `.ds-cues`, `.ds-dl`, `.ds-diff`.**
`<mark class="ds-mark">` surligne un mot à reprendre (un repère à compléter, un mot douteux d'une
transcription) ; `--success` : le mot corrigé. `.ds-snippet` cite un texte tel qu'il sera affiché
(le texte à l'écran en `--mono`, une phrase d'appel à l'action). `.ds-cues` : un texte horodaté,
une `.ds-cue` par réplique (`__time` en chasse fixe, `__text`). `<dl class="ds-dl">` : des paires
libellé · valeur dont les libellés s'alignent (« À l'écran », « Contraste »). `.ds-diff` : l'avant
et l'après d'une modification, deux badges reliés par `.ds-diff__arrow`.

```html
<p>En janvier je faisais <mark class="ds-mark">[à compléter]</mark> vues.</p>
<span class="ds-snippet ds-snippet--mono">« Pas trop longues »</span>
<ol class="ds-cues"><li class="ds-cue"><span class="ds-cue__time">00:04</span><span class="ds-cue__text">… sur <mark class="ds-mark ds-mark--success">Yunary</mark>.</span></li></ol>
<dl class="ds-dl"><div><dt>À l'écran</dt><dd>…</dd></div></dl>
<span class="ds-diff"><span class="ds-badge ds-badge--dense ds-badge--neutral">18:00</span><span class="ds-diff__arrow">…</span><span class="ds-badge ds-badge--dense ds-badge--accent">20:00</span></span>
```

- Classes : `.ds-mark` · `--success` · `.ds-snippet` · `--mono` · `.ds-cues` · `.ds-cue` · `__time`
  · `__text` · `.ds-dl` · `.ds-diff` · `__arrow`.
