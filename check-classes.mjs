/* COUVERTURE DES CLASSES — toute classe écrite dans le JSX doit avoir produit une règle
 * dans la feuille émise par le build.
 *
 * POURQUOI IL EXISTE, en une ligne : `theme.css` supprime TROIS échelles natives de
 * Tailwind (`--text-*`, `--tracking-*`, `--radius-*: initial`) — `text-sm`, `text-base`,
 * `text-lg`, tout `tracking-*` natif, `rounded` nu et `rounded-3xl/4xl` ne rendent RIEN,
 * en silence (`rounded-none` et `rounded-full` survivent : ce sont des staticValues de
 * l'utilitaire, pas des entrées du namespace — mesuré sur tailwindcss 4.3.3). C'est
 * voulu — une régression doit casser au lieu de dériver — mais la panne d'une classe
 * muette est INVISIBLE : ni tsc, ni le lint, ni le build, ni les tests ne la voient.
 * Ce contrôle est le seul à regarder ce que la feuille émise contient vraiment.
 *
 * Il confronte les classes LITTÉRALES du code (src/ + demo/src/) à la feuille CSS émise
 * par `vite build` de la vitrine. Il se lance depuis la racine, APRÈS ce build —
 * `npm run check:classes` enchaîne les deux.
 *
 * Un design system né de ce gabarit l'emporte avec lui : chaque app devrait l'avoir à
 * son premier commit plutôt qu'à son quatrième lot.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const RACINE = process.argv[2] ?? '.';
const SOURCES = [join(RACINE, 'src'), join(RACINE, 'demo', 'src')];
const DIST = join(RACINE, 'demo', 'dist', 'assets');

/* ══════════════════════════════════════════════════════════════════════════════
 * L'EXTRACTEUR — les classes ÉCRITES dans le code.
 * Isolé dans une fonction pour être testable sur des cas synthétiques : c'est lui
 * qui décide ce que le contrôle voit, donc c'est lui qu'il faut pouvoir falsifier.
 * ══════════════════════════════════════════════════════════════════════════════ */

/** Lit la valeur qui suit `className=` / `class:` — soit "…", soit {…} équilibré. */
function valeurApres(src, i) {
  while (i < src.length && /\s/.test(src[i])) i++;
  if (src[i] === '"' || src[i] === "'") {
    const q = src[i]; const j = src.indexOf(q, i + 1);
    return j < 0 ? null : { texte: src.slice(i + 1, j), fin: j + 1, brut: true };
  }
  if (src[i] === '{') {
    let p = 0, j = i;
    for (; j < src.length; j++) {
      if (src[j] === '{') p++;
      else if (src[j] === '}') { p--; if (p === 0) break; }
    }
    return { texte: src.slice(i + 1, j), fin: j + 1, brut: false };
  }
  return null;
}

export function classesEcrites(src) {
  const out = new Map(); // classe -> Set(ligne)
  for (const m of src.matchAll(/\bclassName=|\bclass:\s*/g)) {
    const v = valeurApres(src, m.index + m[0].length);
    if (!v) continue;

    /* Les COMMENTAIRES d'abord. Un bloc `className={…}` en contient souvent, et leur
       prose est pleine d'apostrophes et de rétro-quotes que l'extracteur prendrait pour
       des littéraux : c'était 90 % du bruit du premier jet (97 signalements, 3 réels). */
    const nu = v.brut ? v.texte
      : v.texte.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
    /* Puis les OPÉRANDES DE COMPARAISON : `taille === 'sm'` ne pose pas la classe `sm`,
       il teste une valeur. Sans ça, chaque union de type traverse le contrôle. */
    const sansTests = v.brut ? nu : nu.replace(/[!=]==?\s*(['"`])(?:[^'"`]*)\1/g, ' ');

    const morceaux = v.brut ? [sansTests]
      : [...sansTests.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)].map(x => x[1] ?? x[2] ?? x[3] ?? '');

    for (const morceau of morceaux) {
      /* Un gabarit interpolé ne donne pas un nom de classe complet : on ne peut rien en
         conclure, donc on ne conclut rien. */
      if (/\$\{/.test(morceau)) continue;
      for (const c of morceau.split(/\s+/)) {
        if (!c) continue;
        /* Un fragment de CONCATÉNATION non plus — `'ds-input--' + size` écrit la moitié
           d'un nom : ce qui commence ou finit par un tiret n'est pas une classe complète,
           même raison que `${…}`. (Extension au socle : Dashboard n'écrivait pas de
           concaténation, les composants du socle si.) */
        if (c.startsWith('-') || c.endsWith('-')) continue;
        const ligne = src.slice(0, m.index).split('\n').length;
        if (!out.has(c)) out.set(c, new Set());
        out.get(c).add(ligne);
      }
    }
  }
  return out;
}

/** Toute classe qui a produit AU MOINS UNE RÈGLE dans la feuille émise. */
export function classesRendues(css) {
  const out = new Set();
  for (const m of css.matchAll(/\.((?:[^\s.,:>+~()[\]{}'"\\#]|\\.)+)/g)) {
    out.add(m[1].replace(/\\(.)/g, '$1')); // Tailwind échappe `:` `[` `(` `.` `%` `/`
  }
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════════
 * L'AUTO-TEST — l'extracteur sur des cas construits, y compris ceux que le code
 * n'exerce pas aujourd'hui. Un contrôle qui ne prouve pas ce qu'il voit ne prouve rien.
 * ══════════════════════════════════════════════════════════════════════════════ */
const CAS = [
  ['className="flex gap-2"',                            ['flex', 'gap-2']],
  ["className={cn('a-b', x && 'c-d')}",                 ['a-b', 'c-d']],
  ["className={cn('w-[var(--x)]', 'grid-cols-[repeat(7,2rem)]')}",
                                                        ['w-[var(--x)]', 'grid-cols-[repeat(7,2rem)]']],
  ["className={cn('[&_td:first-child]:pl-0')}",         ['[&_td:first-child]:pl-0']],
  ["className={taille === 'sm' ? 'p-1' : 'p-2'}",       ['p-1', 'p-2']],
  ["className={cn(/* pose `bg-x` d'un l'autre */ 'p-3')}", ['p-3']],
  ["className={`pt-${n}`}",                             []],
  ["className={cn('ds-input--' + taille, 'ds-input')}", ['ds-input']],
  ["class: 'ds-table'",                                 ['ds-table']],
];
let echecs = 0;
for (const [source, attendu] of CAS) {
  const vu = [...classesEcrites(source).keys()].sort();
  if (JSON.stringify(vu) !== JSON.stringify([...attendu].sort())) {
    echecs++;
    console.error(`  auto-test KO  ${source}`);
    console.error(`      attendu ${JSON.stringify(attendu)}`);
    console.error(`      obtenu  ${JSON.stringify(vu)}`);
  }
}
if (echecs > 0) {
  console.error(`\n✘ couverture des classes : l'EXTRACTEUR est cassé (${echecs}/${CAS.length} cas).`);
  console.error(`  Il ne voit plus ce qu'il prétend voir : tout résultat en dessous est sans valeur.`);
  console.error(`  → corrige \`classesEcrites()\` dans check-classes.mjs avant de lire la suite.\n`);
  process.exit(1);
}

/* ══════════════════════════════════════════════════════════════════════════════
 * LA CONFRONTATION
 * ══════════════════════════════════════════════════════════════════════════════ */
function fichiers(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...fichiers(p));
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

let sources = [];
for (const dir of SOURCES) {
  try {
    sources.push(...fichiers(dir));
  } catch {
    console.error(`\n✘ couverture des classes : ${dir} est introuvable.`);
    console.error(`  Ce contrôle se lance depuis la racine du dépôt.\n`);
    process.exit(1);
  }
}

const ecrites = new Map();
for (const f of sources) {
  const rel = relative(RACINE, f);
  for (const [c, lignes] of classesEcrites(readFileSync(f, 'utf8'))) {
    if (!ecrites.has(c)) ecrites.set(c, new Set());
    for (const l of lignes) ecrites.get(c).add(`${rel}:${l}`);
  }
}

let feuilles;
try {
  feuilles = readdirSync(DIST).filter(f => f.endsWith('.css'));
} catch {
  console.error(`\n✘ couverture des classes : ${DIST} est introuvable.`);
  console.error(`  Ce contrôle lit la feuille ÉMISE : il se lance APRÈS le \`vite build\` de la`);
  console.error(`  vitrine, jamais avant — \`npm run check:classes\` enchaîne les deux.\n`);
  process.exit(1);
}
if (feuilles.length === 0) {
  console.error(`\n✘ couverture des classes : aucune feuille .css dans ${DIST}.\n`);
  process.exit(1);
}
/* Vite vide `dist` à chaque build : les feuilles lues sont toujours celles de CE build.
   Une feuille périmée ne produirait de toute façon qu'un faux NÉGATIF, jamais un faux
   positif — elle ajouterait des classes rendues, elle n'en retirerait pas. */
const css = feuilles.map(f => readFileSync(join(DIST, f), 'utf8')).join('\n');
const rendues = classesRendues(css);

const muettes = [...ecrites.keys()].filter(c => !rendues.has(c)).sort();

/* Les TÉMOINS VIVANTS — des classes réellement posées dans le code, une par catégorie de
   faux positif redoutée. Elles doivent être VUES par l'extracteur ET TROUVÉES dans la
   feuille : « pas signalée » ne prouve rien si la classe n'a jamais été regardée.

   ⚠️ Un témoin DISPARU du code n'échoue PAS le build : une classe peut légitimement être
   retirée par un refactor, et bloquer une livraison là-dessus est le meilleur moyen de
   faire désactiver le contrôle. Il avertit, et il demande un témoin de remplacement — un
   contrôle qu'on apprend à ignorer est pire que pas de contrôle. Un témoin PRÉSENT mais
   non rendu, lui, apparaît déjà dans la liste des muettes ci-dessus. */
const TEMOINS = [
  ['caption',              'utilitaire de marque, layer(base)'],
  ['mono',                 'utilitaire de marque, layer(base)'],
  ['text-caption',         'palier du système — survivant de --text-*: initial'],
  ['rounded-xl',           'rayon du système — survivant de --radius-*: initial'],
  ['gap-space-4',          'échelle d’espacement nommée du thème'],
  ['ds-tabs',              'socle — patterns.css, pas la feuille de l’app'],
  ['is-hover',             'aide de démo du socle'],
  ['ds-dropdown--floating', 'conditionnelle (`x && …`), posée via cn()'],
  ['bg-brand-gradient',    '@utility du socle (theme.css)'],
];
const perimes = TEMOINS.filter(([c]) => !ecrites.has(c));

/* LES CLASSES RETIRÉES en 0.2.0 et en 0.11.0 — leur CSS est parti avec elles. Écrites de
   nouveau, elles seraient déjà muettes ci-dessous ; ce contrôle le dit avec la bonne cause, pour
   qu'un portage ne « répare » pas la panne en remettant la règle. La contrepartie côté CSS est
   dans check-catalogue.mjs (point 6). `.ds-tile*`, `.ds-dropdown*`, `.ds-navbar*`, `.ds-navlink`
   et `.ds-footer*` restent : seuls leurs composants React sont retirés. */
const RETIREES = [/^ds-actionsheet/, /^ds-scrim--sheet$/, /^bg-thumbnail$/, /^accent-hot$/, /^bg-tone-deep$/,
  /^grid-cards-tile$/, /^max-w-tile$/, /^aspect-video-portrait$/,
  /* 0.11.0 — l'ancienne offre et les composants sans consommateur */
  /^ds-offers?$/, /^ds-offer(__|--)/, /^ds-price__old/, /^ds-price__sr$/, /^ds-price--row$/, /^ds-price__aside$/,
  /^ds-price--sm$/, /^is-upcoming$/, /^is-locked$/, /^ds-switch__lock$/, /^ds-meters$/, /^ds-meter__note$/,
  /^ds-meter--center$/, /^ds-steps--bar$/, /^ds-tiles$/, /^ds-tile--span$/, /^ds-toast/, /^ds-tooltip/, /^ds-state-card/];
const revenues = [...ecrites.keys()].filter(c => RETIREES.some(r => r.test(c.split(':').pop()))).sort();
if (revenues.length > 0) {
  console.error('');
  console.error('✘ COUVERTURE DES CLASSES — classe RETIRÉE écrite de nouveau');
  for (const c of revenues) {
    console.error(`  ✘ ${c}`);
    for (const ou of [...ecrites.get(c)].sort()) console.error(`      ${ou}`);
  }
  console.error('');
  console.error('  Retirées en 0.2.0 ou en 0.11.0 (voir CHANGELOG) : ne remets pas leur CSS, change le code qui les écrit.');
  console.error('');
  process.exit(1);
}

if (muettes.length > 0) {
  console.error('');
  console.error('✘ COUVERTURE DES CLASSES — panne muette détectée');
  console.error('');
  console.error(`  ${muettes.length} classe(s) écrite(s) dans le code n'ont produit AUCUNE règle CSS.`);
  console.error("  Elles ne rendent rien, et rien d'autre ne le signale : ni tsc, ni le lint,");
  console.error('  ni le build, ni les tests. Le défaut est INVISIBLE tant qu\'on ne regarde');
  console.error("  pas l'écran.");
  console.error('');
  for (const c of muettes) {
    console.error(`  ✘ ${c}`);
    for (const ou of [...ecrites.get(c)].sort()) console.error(`      ${ou}`);
  }
  console.error('');
  console.error('  Causes habituelles, dans l\'ordre de fréquence :');
  console.error('    · le palier natif a disparu du socle — `theme.css` pose `--text-*`,');
  console.error('      `--tracking-*` et `--radius-*: initial` : `text-sm`, `tracking-tight`,');
  console.error('      `rounded-3xl`… n\'existent pas ici, seuls les paliers du système existent ;');
  console.error('    · le jeton n\'est pas exposé à Tailwind — un `--x` du socle ne devient un');
  console.error('      utilitaire que déclaré dans le `@theme inline` de theme.css ;');
  console.error('    · l\'@utility n\'existe pas (classe métier inventée) ;');
  console.error('    · faute de frappe dans un nom de classe.');
  console.error('');
  process.exit(1);
}

console.log(`✔ couverture des classes : ${ecrites.size} écrites, toutes rendues (${rendues.size} disponibles).`);
for (const [c, quoi] of perimes) {
  console.log(`  ⚠ témoin périmé : \`${c}\` (${quoi}) n'est plus dans le code — remplace-le,`);
  console.log('    sinon cette catégorie de faux positif n\'est plus prouvée.');
}
