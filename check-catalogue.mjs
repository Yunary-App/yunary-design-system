#!/usr/bin/env node
/**
 * Filet de COHÉRENCE DU CATALOGUE — le code et sa doc doivent dire la même chose.
 *
 * LE DÉFAUT QU'IL FERME. Les autres gardes lisent le CSS ; aucun ne lisait les composants
 * ni la doc. Résultat mesuré : un composant FANTÔME (supprimé du dépôt, encore documenté)
 * a survécu deux versions dans trois fichiers différents, et deux exemples du catalogue
 * citaient des icônes sorties du type — un agent qui les recopiait produisait du code qui
 * ne compile pas.
 *
 * SEPT VÉRITÉS, vérifiées à chaque `npm run lint` :
 *   1. chaque composant exporté par src/index.ts a sa section `## <Nom>` dans
 *      docs/PROMPTS.md — un composant non documenté ne sera jamais bien utilisé ;
 *   2. chaque section de docs/PROMPTS.md correspond à un export réel — une section
 *      fantôme fait écrire du code qui n'existe pas ;
 *   3. chaque `<Icon name="…">` écrit dans la doc existe dans le type IconName ;
 *   4. le nombre de composants annoncé dans PORTAGE.md, README.md et
 *      src/styles/core.css est le décompte réel de src/components/[star][star]/*.tsx ;
 *   5. le nombre de GLYPHES annoncé dans README.md et docs/PROMPTS.md est la taille réelle
 *      du type IconName. Le point 3 vérifiait que chaque icône CITÉE existe, jamais le
 *      COMPTE : trois lignes ont annoncé 47 pour 48 glyphes pendant deux versions, dans
 *      les deux dépôts. Une liste dont on annonce la taille doit voir sa taille vérifiée.
 *   6. aucun élément RETIRÉ ne revient — composant, sous-chemin, jeton ou classe. Un portage
 *      depuis une maquette ou un autre gabarit les réintroduit sans bruit : ils compilent,
 *      ils rendent, et plus personne ne sait qu'ils avaient été retirés exprès ;
 *   7. chaque classe `.ds-*` citée dans « Classes sans composant » (docs/PROMPTS.md) existe
 *      dans patterns.css — ces motifs n'ont ni type ni composant pour les tenir.
 *
 * « Composant » = le FICHIER : les sous-exports d'un même fichier (THead, Tr, Td…)
 * appartiennent à la section de leur composant (Table) et n'exigent pas la leur.
 *
 * Usage : node check-catalogue.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const lire = f => fs.readFileSync(f, 'utf8');
const erreurs = [];

/* ── 1 · la liste faisant autorité : les composants exportés par src/index.ts ── */
const index = lire('src/index.ts');
const composants = new Set();
for (const m of index.matchAll(/^export \{[^}]+\} from '\.\/components\/[^/]+\/([A-Za-z]+)';/gm)) {
  composants.add(m[1]);
}

/* ── 2 · les sections du catalogue ────────────────────────────────────────── */
const doc = lire('docs/PROMPTS.md');
const sections = new Set();
for (const m of doc.matchAll(/^## (.+)$/gm)) sections.add(m[1].trim());

for (const c of [...composants].sort()) {
  if (!sections.has(c)) erreurs.push(
    `« ${c} » est exporté par src/index.ts mais n'a AUCUNE section dans docs/PROMPTS.md.\n`
    + `      Un composant absent du catalogue ne sera jamais bien utilisé : écris sa section`
    + ` (## ${c}) — à quoi il sert, quand ne pas l'utiliser, un exemple qui compile.`);
}
for (const s of [...sections].sort()) {
  if (!composants.has(s)) erreurs.push(
    `la section « ## ${s} » de docs/PROMPTS.md ne correspond à AUCUN export de src/index.ts.\n`
    + `      Une section fantôme fait écrire du code qui n'existe pas : supprime-la, ou`
    + ` corrige son titre pour qu'il nomme le composant réel.`);
}

/* ── 3 · les icônes citées par la doc existent dans le type ───────────────── */
/* Le scan ne lit que les BLOCS DE CODE tsx : c'est ce qu'un agent recopie. La prose
   peut mentionner <Icon name="…"> comme notation sans nommer un glyphe réel. */
const iconSrc = lire('src/components/icons/Icon.tsx');
const union = /export type IconName =([\s\S]*?);/.exec(iconSrc);
const noms = new Set([...(union ? union[1] : '').matchAll(/'([a-z0-9-]+)'/g)].map(m => m[1]));
const blocs = [...doc.matchAll(/```tsx\n([\s\S]*?)```/g)].map(m => m[1]).join('\n');
for (const m of blocs.matchAll(/<Icon\s+name="([^"]+)"/g)) {
  if (!noms.has(m[1])) erreurs.push(
    `docs/PROMPTS.md cite <Icon name="${m[1]}"> — ce nom n'existe pas dans IconName.\n`
    + `      Un agent qui recopie cet exemple a une erreur TypeScript. Corrige le nom, ou`
    + ` ajoute le glyphe au set (src/components/icons/Icon.tsx).`);
}

/* ── 4 · le compte annoncé = le compte réel ───────────────────────────────── */
let reel = 0;
(function compter(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) compter(full);
    else if (e.name.endsWith('.tsx')) reel += 1; /* useModalSurface.ts est un hook, pas un .tsx */
  }
})('src/components');

for (const f of ['PORTAGE.md', 'README.md', 'src/styles/core.css']) {
  const texte = lire(f);
  for (const m of texte.matchAll(/(\d+)\s+composants/g)) {
    if (Number(m[1]) !== reel) erreurs.push(
      `${f} annonce « ${m[0]} », le décompte réel de src/components/**/*.tsx est ${reel}.\n`
      + `      Un compte faux fait chercher un composant qui n'existe pas — ou en rate un.`);
  }
}

/* ── 5 · le compte de GLYPHES annoncé = la taille du type ─────────────────── */
/* Le compte vient du TYPE IconName, pas de la table ICONS : c'est le type qui décide ce
   qu'un appelant a le droit d'écrire. (`noms` est lu au point 3.) */
for (const f of ['README.md', 'docs/PROMPTS.md']) {
  const texte = lire(f);
  for (const m of texte.matchAll(/(\d+)\s+glyphes/g)) {
    if (Number(m[1]) !== noms.size) erreurs.push(
      `${f} annonce « ${m[0]} », le type IconName en compte ${noms.size}.\n`
      + `      Un compte faux fait chercher un glyphe qui n'existe pas — ou en rate un.`);
  }
}

/* ── 6 · rien de ce qui a été retiré ne revient ──────────────────────────────── */
/* La liste fait autorité : un élément n'en sort que sur décision de Julien, écrite au
   CHANGELOG. `.ds-tile*`, `.ds-choice*` et `.ds-dropdown*` NE SONT PAS dedans : seuls leurs
   composants React sont retirés, les classes restent (le site les emploie). */
const RETIRES = {
  composants: ['ChoiceTile', 'CheckTile', 'RadioTile', 'ActionSheet', 'Dropdown', 'HaloHot', 'ContentIcon'],
  fichiers: ['src/brand-content.tsx', 'src/styles/brand-content.css', 'src/components/forms/ChoiceTile.tsx',
             'src/components/overlays/ActionSheet.tsx', 'src/components/overlays/Dropdown.tsx'],
  /* motifs cherchés dans le CSS du paquet, commentaires retirés */
  css: [/--tone-deep\b/, /--gradient-thumbnail\b/, /--shadow-accent-hot\b/, /\.accent-hot\b/, /\bbg-thumbnail\b/,
        /--container-tile\b/, /--aspect-video-portrait\b/, /\.ds-actionsheet/, /--actionsheet-/, /\.ds-scrim--sheet\b/,
        /* 0.5.0 — la languette de coin de 0.4.0, retirée : « Recommandé » est revenu en fin de rangée. */
        /\.ds-badge--corner\b/],
};
for (const c of RETIRES.composants) {
  if (new RegExp(`\\b${c}\\b`).test(index)) erreurs.push(
    `« ${c} » est de nouveau exporté par src/index.ts — il a été RETIRÉ en 0.2.0 (voir CHANGELOG).\n`
    + `      Un composant retiré ne revient que sur décision explicite : retire l'export.`);
}
for (const f of RETIRES.fichiers) {
  if (fs.existsSync(f)) erreurs.push(
    `${f} existe de nouveau — il a été RETIRÉ en 0.2.0 (voir CHANGELOG). Supprime-le.`);
}
if (/brand-content/.test(lire('package.json'))) erreurs.push(
  `package.json expose de nouveau le sous-chemin brand-content — retiré en 0.2.0. Retire l'entrée d'exports.`);
(function scanCss(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { scanCss(full); continue; }
    if (!e.name.endsWith('.css')) continue;
    const src = lire(full).replace(/\/\*[\s\S]*?\*\//g, '');
    for (const motif of RETIRES.css) if (motif.test(src)) erreurs.push(
      `${full} déclare de nouveau ${motif.source.replace(/\\b/g, '').replace(/\\/g, '')} — retiré en 0.2.0 (voir CHANGELOG).`);
  }
})('src/styles');

/* ── 7 · les classes documentées sans composant existent ───────────────────── */
/* La partie « Classes sans composant » de PROMPTS.md est le SEUL contrat de ces motifs : pas
   de type, pas de composant pour trahir une classe renommée. Chaque `.ds-*` qu'elle cite (hors
   blocs de code, qui ne font qu'illustrer) doit exister comme sélecteur dans patterns.css. */
const partie = doc.split(/^# Classes sans composant$/m)[1] ?? '';
if (!partie) erreurs.push(`docs/PROMPTS.md n'a plus de partie « # Classes sans composant ».`);
const css = lire('src/styles/patterns.css');
const prose = partie.replace(/```[\s\S]*?```/g, '');
const citees = new Set([...prose.matchAll(/`\.(ds-[a-z0-9_-]+)`/g)].map(m => m[1]));
for (const c of [...citees].sort()) {
  if (!new RegExp(`\\.${c.replace(/[-]/g, '\\-')}(?![a-z0-9_-])`).test(css)) erreurs.push(
    `docs/PROMPTS.md (« Classes sans composant ») cite \`.${c}\`, absente de patterns.css.\n`
    + `      Une classe documentée qui n'existe pas fait écrire un balisage qui ne rend rien.`);
}

/* ── verdict ──────────────────────────────────────────────────────────────── */
if (erreurs.length) {
  console.error(`\n✗ catalogue — ${erreurs.length} incohérence(s) entre le code et sa doc :\n`);
  for (const e of erreurs) console.error('    · ' + e + '\n');
  console.error(
    '  La règle : src/index.ts est la liste faisant autorité. La doc suit le code,\n'
    + '  jamais l\'inverse — et ce contrôle est là pour qu\'aucun des deux ne dérive.\n');
  process.exit(1);
}
console.log(`✓ catalogue — ${composants.size} composants exportés, ${sections.size} sections, `
  + `icônes de la doc toutes dans IconName, comptes « ${reel} composants » et `
  + `« ${noms.size} glyphes » exacts partout, ${citees.size} classes sans composant présentes`);
