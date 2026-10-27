# Les pièges du socle

Ce que le code livré fait et qui ne se devine pas — chaque cas ci-dessous a coûté au moins
une panne réelle dans une app consommatrice.

Ce fichier voyage avec le paquet (`files: ["dist", "src", "docs"]`). C'est délibéré : une
règle qui doit protéger les apps doit être lisible **depuis l'app**, pas seulement dans le
dépôt du socle. `docs/DESIGN.md` s'adresse à qui écrit une marque ; cette page-ci s'adresse
à qui écrit un écran.

**Un design system né de ce gabarit l'emporte avec lui.** Les pièges décrits ici viennent
du SOCLE — de `theme.css`, de `tokens/base.css`, de `patterns.css`, d'`app-scale.css` —
donc ils survivent au remplacement de la marque, et ils sont vrais dans chaque projet tiré
d'ici. Ce qui change au portage, c'est la palette ; pas la cascade.

---

## Le critère d'admission — à lire avant d'ajouter quoi que ce soit

> **Un piège entre ici si sa CAUSE est dans le code livré.**
>
> Si la cause est dans une **marque**, dans un **environnement de travail** ou dans une
> **décision d'app**, il n'entre pas — même s'il a coûté cher, même s'il est instructif.

Ce n'est pas de la coquetterie. Une page de pièges sans critère devient un fourre-tout en
trois mois : on y verse l'incident de la semaine, puis la ligne de commande qu'on oublie,
puis la préférence d'un projet. Elle cesse alors d'être lue — et le jour où elle cesse
d'être lue, les vrais pièges repartent dans le savoir oral, qui est exactement ce qu'elle
existe pour remplacer.

Le critère se teste en une question : **si je supprime ce paragraphe du code source du
socle, le piège disparaît-il ?** Si oui, il est à sa place. Sinon, il appartient ailleurs.

**Ce qui est explicitement dehors**, et où ça vit :

| Non admis | Pourquoi | Où ça vit |
|---|---|---|
| l'historique des incidents | c'est un journal, pas une règle | [`CHANGELOG.md`](../CHANGELOG.md) |
| le lock npm qui ressert un ancien SHA sur un tag à jour | la cause est dans npm, pas dans le code livré | [`GOVERNANCE.md`](../GOVERNANCE.md) |
| la numérotation des manques remontés par une app | c'est la file d'une app, pas une propriété du socle | le dépôt de l'app |
| « ce projet préfère telle densité » | décision d'app | le `PROJECT-CONTEXT.md` de l'app |

---

## 1 · Des classes Tailwind qui n'existent pas, et qui ne le disent pas

**Ce qui casse.** `theme.css` vide trois échelles natives avant d'écrire celles du
système : `--text-*: initial`, `--tracking-*: initial`, `--radius-*: initial`. **64 classes
natives cessent alors d'exister** — tous les paliers de taille (`text-sm`, `text-base`,
`text-lg`, `text-xs`, `text-xl` … `text-9xl`), tout l'interlettrage natif (`tracking-tight`,
`tracking-normal`, `tracking-wide`, `tracking-wider`, `tracking-widest`, `tracking-tighter`),
`rounded` nu, `rounded-3xl`, `rounded-4xl` et leurs déclinaisons par coin.

C'est **voulu** : seuls les paliers sémantiques du système existent, pour qu'une régression
casse au lieu de dériver.

**Pourquoi la panne est muette.** Une classe supprimée n'est pas une erreur, elle est
**inerte** : Tailwind n'émet aucune règle, le nœud hérite simplement de son parent. Ni
`tsc`, ni le lint, ni le build, ni la console du navigateur ne disent quoi que ce soit. Le
texte s'affiche — à la mauvaise taille.

Deux cas attestés, dans deux apps :

- `tracking-widest` écrit pour traduire `var(--tracking-display)`. Ce ne sont pas deux
  valeurs voisines, **c'est le signe inverse** : le socle pose `-0.02em` (une display est
  serrée), le plus large de l'échelle native vaut `+0.1em`. Il n'existe aucune valeur
  « proche » à choisir — quelle que soit la police que la marque installe ;
- `tracking-normal` écrit pour « remettre à zéro ». L'échelle native est supprimée
  **entière**, `normal` compris : la classe ne remet rien à zéro, elle laisse hériter.

**⚠️ Ce qui survit, et qu'on croit mort à tort.** L'inverse coûte aussi cher — on réécrit
du code correct :

- **`text-primary`, `text-muted`** — l'utilitaire `text-` lit **deux** espaces de noms, les
  tailles (`--text-*`) et les couleurs (`--color-*`). Seule l'échelle de tailles est morte ;
- **`text-shadow-lg`** — `--text-shadow-*` est un espace de noms **à part**, que
  `--text-*: initial` ne touche pas : Tailwind résout le plus long ;
- **`rounded-full`, `rounded-none`** — ce sont des **valeurs statiques** de l'utilitaire,
  pas des entrées de `--radius-*`. Elles ne peuvent pas mourir avec lui.

**La parade.** Prendre le palier du système (`text-body`, `text-heading`, `text-caption`,
`tracking-display`, `rounded-lg`…). Quand aucun palier ne dit ce qu'on veut, écrire la
valeur en littéral : `tracking-[0em]` est la seule façon d'obtenir `letter-spacing: 0`.

**Le garde.** `node check-dead-utilities.mjs [dossier…]` — il **dérive** la liste à chaque
appel (entrées natives moins entrées redéclarées), il ne la recopie pas. Une app le pointe
sur son propre `src/`.

---

## 2 · Les utilitaires de marque perdent contre les composants

**Ce qui casse.** Les utilitaires de `tokens/base.css` — `.display`, `.display-xl`,
`.eyebrow` (sa typographie), `.chip`, `.mono`, `.caption`, `.prose` — vivent en `layer(base)`.
(`.accent` et le dégradé de `.eyebrow` n'en sont plus depuis la v0.12.0 : voir le piège 3.)
**Toutes** les règles de `patterns.css` vivent en `layer(components)`. Sur un même nœud, la
couche des composants gagne **toujours**, quelle que soit la spécificité. (Pas de décompte
ici volontairement : le fichier grossit, un nombre écrit une fois deviendrait faux sans que
rien ne le signale — c'est le défaut que cette page combat.)

`.mono` posé sur un nœud qu'une règle `.ds-*` typographie déjà ne rend rien.

**Pourquoi la panne est muette.** La classe est bien dans le DOM, la règle est bien dans la
feuille : elle est simplement perdante. L'inspecteur la montre barrée, ce que personne ne
va vérifier sur un nœud qui « a l'air bien ».

**La parade.** L'utilitaire Tailwind équivalent sur le même jeton — `font-mono` lit
`--font-mono` et vit en `layer(utilities)`, il gagne. **On ne déplace pas la couche** :
`layer(base)` est ce qui permet à un composant de typographier son propre contenu sans
qu'une classe d'app le contredise par accident.

**Le garde.** Aucun. La combinaison dépend du nœud, et une heuristique crierait sur du code
correct. C'est le piège de cette page qui repose entièrement sur sa lecture.

---

## 3 · `.accent` et `.eyebrow` sont un pochoir à quatre déclarations

**Ce qui casse.** Ces deux classes peignent le dégradé de marque **dans le texte** par
quatre déclarations solidaires :

```css
background: var(--brand-gradient);
background-clip: text;
color: transparent;
width: fit-content;
```

Retirez-en une et l'effet tombe. Elles sont écrites **une seule fois** dans le système : la
règle de `patterns.css` § LE TEXTE EN DÉGRADÉ (v0.12.0), une liste de sélecteurs qui porte
`.accent`, `.eyebrow` et les motifs en dégradé (prix `--accent`, numéro du jour, numéro de
bande, montant de l'étape en cours). Elle vit en `layer(components)` : **tout** utilitaire
Tailwind posé sur le même nœud vit en `layer(utilities)` et gagne.

**Pourquoi la panne est muette — deux façons, aucune ne lève d'erreur :**

| L'utilitaire posé | Ce qu'il écrase | Ce qu'on voit |
|---|---|---|
| une couleur (`text-*` de couleur, `bg-*`) | `color: transparent` | le dégradé disparaît, le mot reste **lisible en gris** |
| une dimension (`w-*`, `max-w-*`) | `width: fit-content` | le dégradé s'étale sur la **gouttière** au lieu des glyphes |

Le second cas s'est produit sur le numéro des cartes de projet d'une app. C'est l'artboard
ré-exporté qui l'a rattrapé, pas un contrôle.

**Sans risque, en revanche** : la typographie pure — `font-*`, les paliers `text-heading`…,
`leading-*`. Elle ne touche à aucune des quatre déclarations.

**La parade — structurelle, deux spans.** L'externe porte la mise en page et la typo, que
l'enfant **hérite** ; l'interne ne porte que la classe et le texte.

```tsx
<span className="mb-2 font-display"><span className="accent">un mot</span></span>
```

**Le garde.** `node check-fragile-classes.mjs [dossier…]` — il **dérive** l'ensemble des
classes fragiles du CSS (toute classe seule de la liste d'une règle qui clippe un fond dans
son texte **et** pose `color: transparent`), il ne le recopie pas. Le jour où une troisième
classe clippée entre au socle, elle est couverte avant son premier usage. Depuis la v0.12.0,
il refuse aussi une **seconde** règle clippée dans les feuilles, et l'effet réécrit dans le
code (`bg-clip-text`, `backgroundClip` en ligne) : un texte en dégradé s'écrit `.accent`.

---

## 4 · Une taille de police en pixels ne suit pas l'échelle d'app

**Ce qui casse.** `app-scale.css` change la taille de la **racine** par bande de largeur
d'écran — 103 %, 112 %, 126 %, 130 %. Toute l'interface suit, *parce qu'elle est en rem*.
Une classe arbitraire en pixels (`text-[15px]`) ne suit pas : elle reste à sa valeur
pendant que ses voisines grandissent, et elle rétrécit visuellement à chaque bande.

**Pourquoi la panne est muette.** Elle est pire que muette, elle est **locale** : sur
l'écran où on l'a écrite, la valeur est exactement celle de la maquette. Le défaut ne se
voit que chez quelqu'un d'autre, sur une autre largeur — et à ce moment-là personne ne fait
le lien avec une classe posée trois mois plus tôt.

**La parade.** Convertir en rem (÷ 16) : `15px` devient `text-[0.9375rem]`. Mieux : prendre
le palier nommé du socle quand il existe, il porte déjà son interligne et son interlettrage.

**Le garde.** `node check-font-px.mjs [dossier…]`.

> *Admission :* la cause est `app-scale.css`, qui est **dans le paquet**. Sans lui, une
> taille en px serait une préférence de style ; avec lui, c'est un défaut de rendu. Le
> critère passe.

---

## 5 · Un flottant vit dans le flux — sauf la liste du `Select`

**Ce qui casse.** Un seul composant du système monte dans un portail : `Select`, depuis la
v0.12.0 (sa liste, `.ds-dropdown--liste`, en `position: fixed` dans le `<body>` ou le voile
d'une `Modal`) — elle n'est donc jamais rognée. Les deux autres flottants — le menu déroulant
(`.ds-dropdown--floating`) et le popover de `DatePicker` (`.ds-datepicker__pop`) — sont en
`position: absolute` **dans le flux du parent**.

Or `.ds-card--flush` pose `overflow: hidden` (c'est ce qui fait tenir un tableau à ras dans
le rayon de la carte). Un menu déroulant ouvert dans une `Card flush` est donc **coupé au
bord de la carte**.

**Pourquoi la panne est muette.** Rien n'échoue : le panneau est monté, il est dans le DOM,
il a ses dimensions. Il est simplement rogné — et souvent de manière partielle, ce qui se
lit comme un défaut de position plutôt que comme un clipping.

Le même mécanisme joue avec tout ancêtre qui crée un contexte de rognage ou d'empilement :
`overflow` autre que `visible`, `transform`, `filter`, `contain`.

**La parade.** Sortir le flottant du conteneur rognant — l'ancrer sur un parent qui ne
rogne pas — ou renoncer à `flush` sur cette carte. Le `z-index` n'y peut rien : un contexte
d'empilement local ne se franchit pas par une valeur plus grande. Les modales, elles, ne
sont pas concernées : `.ds-scrim` est en `position: fixed` sur `inset: 0`.

**Le garde.** Aucun : la relation est structurelle, entre deux nœuds que rien ne rapproche
dans le source.

---

## 6 · `Select` ouvre la liste Yunary, mais garde un `<select>` natif

**Ce qui casse.** Depuis la v0.12.0 (décision D-010), le composant n'ouvre plus la liste du
navigateur : il ouvre une liste dessinée (`.ds-dropdown--liste`, portail, clavier du combobox
select-only). Mais un `<select>` natif, caché et synchronisé, reste dans le champ, et c'est lui
qui fait le contrat. Trois conséquences qui surprennent à l'écriture :

- **les options passent par la prop `options`, pas par les enfants.** `SelectProps` fait
  `Omit<…, 'children'>` : `<Select><option/></Select>` est une erreur de compilation ;
- **`onChange` rend un événement natif du `<select>` caché**, pas une valeur : `e.target.value`.
  La ref est ce `<select>` (la valeur, `focus()` qui passe au champ) ;
- **le champ visible est un `<button role="combobox">`** : `id`, `aria-*`, `className`, `onFocus`,
  `onBlur`, `onClick`, `onKeyDown` vont à lui, avec l'événement du bouton. Un `<label htmlFor>`
  le nomme parce qu'un bouton est labellisable.

**Pourquoi un `<select>` caché.** Le formulaire (`name`, `required`) et l'autoremplissage du
navigateur (`autoComplete="country"` de la page de paiement) passent par lui, sans une ligne de
plus chez l'appelant. Il est transparent mais pas en `display:none` : un navigateur n'autoremplit
pas un champ qu'il ne voit pas. Ne pas le « nettoyer ».

**La parade.** Quand la liste doit vraiment être composée — icône par item, description,
séparateurs, options désactivées —, ce n'est plus un `Select` : c'est un menu `.ds-dropdown`
déclenché par un bouton, et l'app en porte le balisage, l'état et l'ARIA. Voir alors le piège 5 :
ce menu-là est un flottant.

**Le garde.** Le type pour les enfants ; `tests/select.test.mjs` pour l'événement, la ref, le
clavier et le `<select>` caché.

---

## 7 · La coque d'un écran de Claude perd contre une règle de contexte

**Ce qui casse.** `Card variant="screen"` rend `.ds-card.ds-card--screen` : la coque EST une carte.
Les règles de contexte du socle — « dans une carte, l'encart se creuse en `--background` »
(`.ds-card .ds-inset`, `:is(.ds-card,.ds-modal) .ds-dropzone`, `.ds-upload`) — s'appliquent donc
à elle aussi. En 0.5.0 et 0.6.0 elles portaient la même spécificité (0,2,0) que
`.ds-card--screen .ds-inset` et venaient APRÈS dans le fichier : l'encart, le dépôt et l'envoi
d'un écran de Claude rendaient sur `--background`, le fond de la coque, donc invisibles. Et le
repos de la tuile panneau, `.ds-tile--panel:not(.is-checked):not(:has(…))`, à (0,4,1), battait
`.ds-card--screen .ds-tile` (0,2,0) à la spécificité, quel que soit l'ordre.

**Pourquoi la panne est muette.** Rien n'est invalide : chaque règle est correcte, chaque
jeton existe, les gardes de contraste mesurent des paires de jetons, pas des cascades. Seul
l'écran rendu dans Claude le montre, et mcp-ui l'a contourné dans son propre CSS — la forme 1
du piège 8, à l'envers : c'est le socle qui perd contre lui-même.

**La parade**, en trois phrases, depuis 0.6.1 (en tête de `patterns.css`) :
1. la coque est le PREMIER bloc du fichier : elle ne gagne sur un défaut qu'à la spécificité, et
   un état déclaré après elle (survol, coché, invalide, désactivé) la bat à égalité — les états
   survivent sans qu'on les recopie ;
2. une règle de contexte qui peint un descendant s'écrit `:where(.ds-card,.ds-modal) .ds-x`, au
   rang d'un défaut (0,1,0) : la coque, à (0,2,0), passe par-dessus quel que soit l'ordre ;
3. un défaut plus spécifique (le repos de la tuile panneau) ou un contexte emboîté qui garde la
   main (le rail d'un panneau, « La suite » en étapes compactes) a sa contrepartie dans la coque.

**Le garde.** [`check-coque.mjs`](../check-coque.mjs) calcule la spécificité de chaque règle de
`patterns.css`, vérifie l'ordre, que chaque défaut recouvert est battu, qu'aucun état n'est avalé
et qu'un état redit par la coque bat le même état écrit par un contexte. Il rejoue un jumeau de
falsification à chaque appel.

---

## 8 · La forme récurrente — une valeur du socle hors de portée de l'appelant

Ce n'est pas un cas, c'est **le moule** des autres. Trois formes d'un même mal, toutes
constatées en usage réel :

1. **la valeur est battue par la cascade** — `.accent`, `.mono` : la couche des utilitaires
   ou des composants gagne toujours, la panne est muette (pièges 2 et 3) ;
2. **la valeur est hors d'atteinte de la cascade** — un défaut de design écrit en style
   inline, un nœud sans aucune classe : aucun sélecteur ne peut la viser, même en théorie ;
3. **la valeur est atteignable mais non prévue pour varier** — les quatre mesures de
   `.ds-logo__dot` : une classe parfaitement ciblable, mais rien ne dit que ces valeurs
   sont censées changer, donc la seule façon d'en changer est de les recopier.

Même issue à chaque fois : **l'app recopie ou surcharge, et le socle ne le sait pas.** La
valeur part en double, et la prochaine version du socle ne la retrouvera pas. C'est la
doctrine prise à revers — le socle fournit les VALEURS, l'app écrit les NOMS.

**Les deux questions de revue**, sur tout nouveau composant comme sur tout écran :

> **1 · Cette valeur, l'appelant peut-il la reprendre ?**
> Si non, elle est mal placée, quel que soit le moyen.
>
> **2 · Si oui, le sait-il ?**
> Une valeur reprise en aveugle est une valeur recopiée. C'est la forme 3, et c'est celle
> qu'on ne voit pas.

**Le corollaire, pour le style inline** — il décide où une valeur a le droit de vivre :

- **légitime** quand la valeur vient de l'appelant à chaque rendu (`Skeleton`, `Avatar`,
  `Logo`, `Progress`) : la prop **est** la valeur, il n'y a rien à redéfinir ;
- **illégitime** dès qu'il porte un **défaut** — un défaut est un arbitrage de design, et
  l'écrire inline le range au seul endroit du langage que la cascade n'atteint pas. Le
  repli d'un `var(--x, défaut)` fait le même travail, du bon côté ;
- **sans excuse** quand il n'y a même pas de prop : une décision du socle qu'aucun
  sélecteur ne peut viser.

---

## Ajouter un piège

1. Passe-t-il le **critère d'admission** ? Sinon, écris-le dans le fichier qui lui revient.
2. Écris les quatre sections : **ce qui casse** · **pourquoi la panne est muette** · **la
   parade** · **le garde**. Si la panne n'est pas muette, ce n'est pas un piège, c'est un
   bug — corrige-le.
3. Un garde vaut mieux qu'un paragraphe. Les gardes de cette page vivent à la racine du
   dépôt (`check-*.mjs`), sont enchaînés par `npm run lint` — quatorze, plus
   `check-classes.mjs` que `npm run build` joue à part — et **prennent un dossier en
   argument** pour qu'une app les pointe sur son propre `src/` :

   ```bash
   node check-dead-utilities.mjs src
   node check-font-px.mjs src
   node check-fragile-classes.mjs src
   ```

   Chacun porte son **jumeau de falsification** et le rejoue à chaque appel : un motif qui
   ne reconnaît plus rien rend un garde toujours vert, donc décoratif — et ce mode de panne
   est silencieux, exactement comme les pièges qu'il surveille.
