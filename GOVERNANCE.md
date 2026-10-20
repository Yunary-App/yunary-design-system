# Gouvernance — ce qui entre, ce qui reste dehors

Un design system pollué coûte plus cher qu'un design system incomplet.

Un composant en trop, personne ne le retire : il est publié, quelque chose l'importe
peut-être, et on ne sait pas quoi. Un composant manquant, on l'écrit dans l'app le jour où
on en a besoin, et on le promeut quand un deuxième produit le demande. **En cas de doute,
ça reste dans l'app.**

---

## L'arbre de décision — quatre tests, dans cet ordre

Un candidat doit passer **les quatre**. Un seul échec, et il reste dans l'app.

### 1 · Le test du NOM

> Peux-tu le nommer sans employer un mot de ton métier ?

`Card`, `Banner`, `Pagination` passent. `VideoCard`, `InvoiceRow`, `SprintPicker` échouent :
leur nom contient le produit.

**L'astuce qui ne marche pas** : renommer `VideoCard` en `MediaCard` pour passer le test.
Si tu as dû chercher un mot plus vague, la réponse est non — c'est le test 3 qui te
rattrapera.

### 2 · Le test de la RÉUTILISATION

> Un **deuxième** produit, qui ne partage pas le métier du premier, en aurait-il besoin
> tel quel ?

Deux, pas un. Un composant écrit pour un seul usage est toujours parfait pour cet usage-là
et inadapté au suivant — on ne découvre les bonnes coutures qu'au deuxième appelant.

**Deux écrans du même produit ne comptent pas pour deux.**

### 3 · Le test de la DÉPENDANCE

> A-t-il besoin de savoir ce que fait ton produit pour fonctionner ?

Un composant qui connaît une forme de données métier, appelle une API, lit un store, ou
contient une règle de gestion — échoue. Même s'il est joli, même s'il est réutilisé.

Le tri se fait souvent en deux : la **présentation** monte, la **connaissance** reste. Un
`Card` générique dans le système, un `VideoCard` dans l'app qui l'emploie et lui passe les
bons enfants.

### 4 · Le test du DOUBLON

> Est-ce qu'un composant existant, plus une prop, ne ferait pas la même chose ?

Une variante coûte une prop. Un composant coûte un fichier, un export, une entrée de
vitrine, une ligne de doc, et une décision à chaque fois qu'on hésite entre les deux.

**Mais une prop qui ment est pire qu'un composant en trop.** Si la prop existe et ne change
rien à l'écran, ce n'est pas une variante, c'est un mensonge — `IconButton` a rendu trois
carrés identiques pour `sm`, `md` et `lg` pendant quatre versions.

---

## Si les quatre passent

1. Il rejoint sa **famille** dans `src/components/` — `actions`, `forms`, `data-display`,
   `feedback`, `navigation`, `overlays`, `brand`, `icons`, `content`.
2. Il s'exporte depuis `src/index.ts`, **avec son type de props**.
3. Il **apparaît dans la vitrine le jour même**, avec ses états — repos, survol, focus,
   pressé, désactivé. Un composant qui n'est pas dans la démo n'existe pas : personne ne
   peut le voir, donc personne ne peut voir qu'il est cassé.
4. Il n'écrit **aucune valeur littérale** : ni couleur, ni ombre, ni durée. `check-literals.sh`
   le vérifie.
5. Si son rendu dépend d'une couleur ou d'une police, celle-ci vient du **fichier de
   marque**, et le jeton entre au **contrat** — `brand.template.css`. `check-contract.mjs`
   refuse un contrat incomplet.

---

## Les jetons — la même question, posée autrement

> Ce jeton décrit-il une **mesure** ou une **identité** ?

| | Où il vit | Substituable |
|---|---|---|
| espacement, largeur de contenu, **durée**, ombre d'élévation | `tokens/scales.css` | non |
| **rayon, rail de contrôles, dimension de composant** | `tokens/scales.css` | **oui, en redéclarant** |
| palier typo, interlettrage, interligne, graisse | `tokens/typography.css` | non |
| couleur, police, dégradé, **lueur**, régime de titrage | le fichier de **marque** | **oui, et obligatoire** |
| grille fine, halo de vignette, noir profond | le bloc **métier** du fichier de marque | oui, et optionnel |

La frontière qui se discute le plus, tranchée : **une durée est une mesure** — elle décrit
la vitesse à laquelle un survol répond, pas une identité. **Une lueur est une identité** —
c'est la chaleur d'une marque, et une marque sans lueur met les jetons à `none`.

**Deuxième ligne du tableau : deux régimes de substitution, pas un.** Une mesure peut porter
de l'identité sans porter de couleur — la hauteur d'une navbar, l'arrondi propre à une barre
d'onglets, la taille d'une case à cocher. Ces jetons-là restent déclarés dans le socle, qui
en tient les **défauts**, et le fichier de marque les **redéclare** quand il veut les
changer : une app importe `core.css` puis sa marque, la redéclaration arrive plus tard dans
l'ordre de source et gagne. Ils forment la **§ FACULTATIF** du contrat.

La conséquence, et c'est ce qui les sépare vraiment de la ligne du bas : un jeton d'identité
oublié **casse à l'écran**, parce qu'un repli livrerait la couleur de quelqu'un d'autre ; un
jeton de forme oublié **retombe sur le socle**, et `4.5rem` n'est la marque de personne. Ne
pas aligner les deux comportements : chacun est la bonne réponse à sa question.

Ce qui n'entre PAS au § FACULTATIF, et la règle est nette : les espacements **internes** d'un
composant — le gap entre une icône et son libellé, le padding d'une cellule. Ce sont des
mesures de compacité, donc de la structure ; ils restent littéraux dans `patterns.css`. Un
contrat où l'on règle l'écart entre une icône et son libellé est un contrat que personne ne
remplit.

Un jeton ajouté à la marque par défaut sans être ajouté au gabarit fait naître le contrat
incomplet : le client remplit consciencieusement et livre une variable qui n'existe pas.
`check-contract.mjs` le refuse. Symétriquement, un jeton proposé au § FACULTATIF que le socle ne déclare pas
est un bouton qui ne branche rien : `check-contract.mjs` refuse les deux.

---

## Sortir quelque chose du système

Plus rare, et plus délicat : quelque chose est publié, on ne sait pas qui l'importe.

**Ne supprime pas sèchement quand un consommateur est possible. Déplace.** C'est le seul
choix réversible : un pan isolé dans une extension optionnelle ne coûte qu'une ligne
d'import à ceux qui s'en servent.

**Ce qu'on supprime vraiment** : ce dont on peut prouver que personne ne s'en sert — un
`grep` vert dans chaque consommateur (hub, mcp-ui, site). Si le site emploie les
CLASSES d'un motif sans son composant React, le composant part et les classes restent.
Chaque retrait est inscrit dans la liste `RETIRES` de `check-catalogue.mjs` (et, pour une
classe, dans `RETIREES` de `check-classes.mjs`) : un portage qui le réintroduirait fait
tomber le build.

---

## Procédure de version — à chaque publication

**La ligne d'installation du `README.md` se met à jour EN MÊME TEMPS que le tag.**

`npm i github:<compte>/<dépôt>#vX.Y.Z` : sur la voie git, **le tag EST le mécanisme
d'installation**. Une ligne restée sur la version précédente ne lève aucune erreur — elle
installe silencieusement l'ancienne, et l'app croit avoir la nouvelle. Ce n'est pas une
étourderie à surveiller, c'est une étape de la séquence.

L'ordre, sans exception :

1. `package.json` → `version`
2. `README.md` → la ligne `npm i …#vX.Y.Z`
3. `CHANGELOG.md` → la section de la version, avec ses **⚠ ruptures**
4. **les gardes, premier passage** — les TREIZE autres, plus `npm run demo:build` et
   `npm run build` (qui joue `check-classes.mjs` au passage). Voir ci-dessous :
   `check-version.mjs` ne peut pas passer à cette étape
5. le commit unique du lot
6. `git tag -a vX.Y.Z -m "…"` — **annoté** : un tag léger ne part pas avec `--follow-tags`
7. **les gardes, second passage** — `npm run lint` en ENTIER, les quatorze. Rien ne part sans
   les quatorze
8. `git push --follow-tags`

### À quel moment lancer les gardes — et pourquoi il y a DEUX passages

`check-version.mjs` **ne peut pas** passer avant le tag : il exige que `vX.Y.Z` existe.
C'est son travail — un README qui envoie sur un tag absent produit une installation qui
échoue chez l'utilisateur. Une fois `package.json` bumpé, ce garde est donc rouge par
construction jusqu'à l'étape 6.

Ce n'est pas une entorse à signaler à chaque lot, c'est la séquence :

| Quand | Quoi | Attendu |
|---|---|---|
| avant le tag (4) | les treize autres gardes + `npm run demo:build` + `npm run build` | tous verts |
| avant le tag (4) | `check-version.mjs` | **rouge**, et c'est correct : le tag n'existe pas encore |
| après le tag (7) | `npm run lint` en entier | **les quatorze verts** |
| puis (8) | `git push --follow-tags` | — |

Lancer `npm run lint` à l'étape 4 est utile quand même : il s'arrête sur `check-version` et
laisse les onze suivants non joués. Le premier passage se fait donc garde par garde, ou en
acceptant de relancer. **La règle qui compte est la dernière ligne : rien ne part sans les
quatorze verts, tag posé.**

⚠️ Le **quinzième** garde du dépôt, `check-classes.mjs`, n'est pas dans `lint` — et c'est
voulu : `lint` doit rester lançable sans construire la vitrine. Il est dans `npm run build`,
donc joué à l'étape 4. Ne conclus jamais de la lecture du seul script `lint` qu'un garde ne
tourne pas. Le dépôt n'a pas de CI : ces passages se lancent à la main, à chaque version.

**C'est un garde bloquant, pas une checklist.** `check-version.mjs` compare les trois —
version, README, existence du tag — et fait tomber le build s'ils divergent : une procédure
seulement écrite ne suffit pas.

```bash
node check-version.mjs
```
