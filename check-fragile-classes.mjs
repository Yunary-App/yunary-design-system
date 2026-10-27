#!/usr/bin/env node
/**
 * Filet des CLASSES FRAGILES — `.accent` et `.eyebrow` sont SEULES sur leur nœud.
 *
 * LE DÉFAUT QU'IL FERME, ET SES DEUX PANNES, TOUTES DEUX MUETTES. Les classes qui
 * découpent le dégradé de marque dans le texte tiennent par QUATRE DÉCLARATIONS
 * SOLIDAIRES : `background`, `background-clip:text`, `color:transparent`,
 * `width:fit-content`. Elles vivent en `layer(components)` (v0.12.0) ; les utilitaires
 * Tailwind vivent en `layer(utilities)` et gagnent donc TOUJOURS, quelle que soit la
 * spécificité.
 *
 *     un utilitaire de COULEUR   écrase `color:transparent`     → le dégradé disparaît,
 *                                                                 le mot reste lisible en
 *                                                                 gris. Aucune erreur.
 *     un utilitaire de LARGEUR   écrase `width:fit-content`     → le dégradé s'étale sur
 *                                                                 la gouttière au lieu
 *                                                                 des glyphes.
 *
 * Le second cas s'est produit sur le numéro des cartes de projet d'une app, et c'est
 * l'artboard ré-exporté qui l'a rattrapé — aucun contrôle. Cinq nœuds réels portent
 * `.accent` dans cette app-là : ce garde empêche cinq pannes muettes, pas une hypothèse.
 *
 * LA PARADE EST STRUCTURELLE, et elle tient en une phrase : un span EXTERNE porte la mise
 * en page et la typo — toutes deux HÉRITÉES par l'enfant — et un span INTERNE ne porte
 * que la classe et le texte.
 *
 * ⚠️ LA LISTE DES CLASSES FRAGILES EST DÉRIVÉE DU CSS, JAMAIS RECOPIÉE. Est fragile toute
 * règle à classe unique qui clippe un fond dans son texte ET pose `color:transparent` :
 * ce sont exactement les deux déclarations qui rendent la cohabitation mortelle. `.chip`,
 * `.mono` et `.caption` du même fichier ne clippent rien — leur piège à elles est la
 * COUCHE, pas la cohabitation, et il est traité ailleurs. Le jour où une troisième classe
 * clippée entre au socle, elle est couverte AVANT son premier usage ; un garde ajouté
 * après le premier appel arrive toujours après le premier défaut.
 *
 * NÉ DANS UNE APP, versé au squelette. Il vivait dans les tests d'architecture d'une app
 * consommatrice, sous vitest, avec sa paire écrite à la main. **Une app peut pointer
 * celui-ci sur son propre `src/`** — c'est la moitié de l'intérêt de le tenir au socle.
 * Un design system né de ce gabarit l'emporte avec lui, à son premier commit.
 *
 * CE QU'IL NE VOIT PAS, ET C'EST ÉCRIT PLUTÔT QUE CACHÉ : un `className` construit par
 * un TERNAIRE est jugé branche par branche, jamais en union — sinon
 * `cond ? 'accent' : 'text-muted'`, qui est correct, serait signalé. Le prix est qu'un
 * ternaire qui pose vraiment un utilitaire sur un nœud fragile passe. Les autres formes
 * (`cn('accent', x && 'w-full')`) sont bien vues en union.
 *
 * LA SECONDE MOITIÉ, v0.12.0 : UNE SEULE RÈGLE découpe le dégradé dans un texte. Les
 * déclarations étaient recopiées six fois (le prix, la semaine, la bande, la frise, le
 * sur-titre, `.accent`) ; elles vivent dans une seule liste de sélecteurs de patterns.css
 * (§ LE TEXTE EN DÉGRADÉ), qui porte `.accent`. Le garde refuse une deuxième règle à
 * `background-clip:text` dans les feuilles, et l'écriture du même effet en utilitaires
 * (`bg-clip-text`) ou en style en ligne (`backgroundClip`) dans le code.
 *
 * Usage : node check-fragile-classes.mjs [dossier…]     (défaut : src demo/src)
 *         STYLES=<dossier> node check-fragile-classes.mjs src
 */
import fs from 'node:fs';
import path from 'node:path';

const RACINES = process.argv.slice(2).length ? process.argv.slice(2) : ['src', 'demo/src'];
const EXTENSIONS = /\.(?:tsx?|jsx?|mjs)$/;
const STYLES = process.env.STYLES || [
  'src/styles',
  'node_modules/@acme/ds/src/styles',
].find(p => fs.existsSync(p));

/* ══════════════════════════════════════════════════════════════════════════════
 * LA DÉRIVATION — quelles classes clippent un dégradé dans leur texte.
 * ══════════════════════════════════════════════════════════════════════════════ */
function feuilles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const complet = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...feuilles(complet));
    else if (e.name.endsWith('.css')) out.push(complet);
  }
  return out;
}

/** Les règles d'une feuille (commentaires retirés) qui découpent un fond dans leur texte. */
export function reglesClippees(css, fichier = '') {
  const out = [];
  const propre = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of propre.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    if (/(^|[^-])background-clip\s*:\s*text/.test(m[2]) && /(^|;)\s*color\s*:\s*transparent/.test(m[2]))
      out.push({ fichier, selecteurs: m[1].split(',').map(x => x.trim()).filter(Boolean) });
  return out;
}

function deriverFragiles(regles) {
  const fragiles = new Set();
  /* Une classe SEULE : `.accent`. Un sélecteur composé ou descendant décrit un contexte, pas
     une classe qu'une app pose sur un nœud. Depuis la v0.12.0 la règle est une LISTE de
     sélecteurs : chacun est jugé à part. */
  for (const r of regles)
    for (const sel of r.selecteurs)
      if (/^\.[a-z][a-z0-9-]*$/i.test(sel)) fragiles.add(sel.slice(1));
  return fragiles;
}

/** L'effet écrit à la main dans du code : en utilitaires Tailwind ou en style en ligne. */
export function recopiesDansLeCode(src) {
  const out = [];
  for (const m of src.matchAll(/\bbg-clip-text\b|\b(?:Webkit)?[bB]ackgroundClip\s*:\s*['"]text['"]|background-clip\s*:\s*text/g))
    out.push({ ligne: src.slice(0, m.index).split('\n').length, texte: m[0] });
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════════
 * LE LECTEUR — les LISTES DE CLASSES d'un nœud, pas les classes en vrac.
 * ══════════════════════════════════════════════════════════════════════════════
 * Ici le nœud compte : la faute n'est pas d'écrire `accent`, c'est de l'écrire À CÔTÉ
 * d'autre chose. Le découpage en mots écarte au passage `bg-accent` et `text-eyebrow`,
 * qui nomment le jeton de surface et le palier typographique — une recherche de
 * sous-chaîne les attraperait, et le garde crierait sur du code correct.
 */
function valeurApres(src, i) {
  while (i < src.length && /\s/.test(src[i])) i++;
  if (src[i] === '"' || src[i] === "'") {
    const q = src[i]; const j = src.indexOf(q, i + 1);
    return j < 0 ? null : { litteraux: [src.slice(i + 1, j)], union: true };
  }
  if (src[i] === '{') {
    let p = 0, j = i;
    for (; j < src.length; j++) {
      if (src[j] === '{') p++;
      else if (src[j] === '}') { p--; if (p === 0) break; }
    }
    const bloc = src.slice(i + 1, j);
    const litteraux = [...bloc.matchAll(/'([^']*)'|"([^"]*)"|`([^`$\\]*)`/g)].map(m => m[1] ?? m[2] ?? m[3]);
    /* Un ternaire décrit des branches EXCLUSIVES : les unir inventerait un nœud qui
       n'existe jamais. Voir « CE QU'IL NE VOIT PAS », en tête. */
    return { litteraux, union: !bloc.includes('?') };
  }
  return null;
}

/** Les listes de classes d'un nœud, telles qu'elles se posent ensemble. */
export function listesDeClasses(src) {
  const out = [];
  for (const m of src.matchAll(/\bclassName=|\bclass=/g)) {
    const v = valeurApres(src, m.index + m[0].length);
    if (!v) continue;
    const ligne = src.slice(0, m.index).split('\n').length;
    const listes = v.union ? [v.litteraux.join(' ')] : v.litteraux;
    for (const liste of listes) if (liste.trim()) out.push({ liste: liste.trim(), ligne });
  }
  return out;
}

export function fautives(src, fragiles) {
  return listesDeClasses(src).filter(({ liste }) => {
    const mots = liste.split(/\s+/).filter(Boolean);
    return mots.some(c => fragiles.has(c)) && mots.length > 1;
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
 * LE JUMEAU DE FALSIFICATION — il tourne à chaque appel, avant le scan.
 * ══════════════════════════════════════════════════════════════════════════════
 * ⚠️ Les exemples sont ASSEMBLÉS. Ce fichier vit à la racine, hors des dossiers scannés
 * par défaut — mais rien n'empêche de pointer le garde sur `.`, et il se signalerait
 * lui-même. La discipline coûte deux lignes ; l'exclusion de soi qu'elle évite, on finit
 * toujours par l'élargir.
 */
const A = ['acc', 'ent'].join('');
const E = ['eye', 'brow'].join('');
const CAS = [
  /* reconnaît une violation… */
  [`<i className="${A} font-display" />`, 1],
  [`<i className="chip ${A}" />`, 1],
  [`<i className="${E} mb-2" />`, 1],
  [`<i className={cn('${A}', flag && 'w-full')} />`, 1],
  /* …et laisse passer ce qui est légitime. */
  [`<i className="${A}" />`, 0],
  [`<i className="${E}" />`, 0],
  [`<i className={cn('${A}')} />`, 0],
  /* Le jeton de SURFACE et le PALIER typographique ne sont pas la classe de dégradé. */
  [`<i className="bg-${A} px-3" />`, 0],
  [`<i className="text-${A}" />`, 0],
  [`<i className="text-${E} font-semibold" />`, 0],
  /* Les branches d'un ternaire ne cohabitent pas — voir « CE QU'IL NE VOIT PAS ». */
  [`<i className={on ? '${A}' : 'text-muted'} />`, 0],
];
const DOIT_ETRE_FRAGILE = [A, E];
const NE_DOIT_PAS = ['chip', 'mono', 'caption', 'display', 'heading', 'page', 'halo'];

/* La seconde moitié se prouve aussi : une feuille à deux règles clippées en compte deux, une
   règle `-webkit-` seule n'est pas comptée deux fois, et les trois écritures dans le code sont vues. */
const BG = ['bg-clip', 'text'].join('-');
const CLIP = ['background', 'clip'].join('-');
const CAS_REGLES = [
  [`.a,.b{background:x;-webkit-${CLIP}:text;${CLIP}:text;color:transparent}`, 1],
  [`.a{background:x;${CLIP}:text;color:transparent} .b .c{background:x;${CLIP}:text;color:transparent}`, 2],
  [`.a{background:x;${CLIP}:border-box;color:red}`, 0],
];
const CAS_CODE = [
  [`<i className="${BG} text-transparent" />`, 1],
  [`<i style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />`, 2],
  [`<i className="bg-clip-padding" />`, 0],
];

function seProuver(fragiles) {
  const ratés = [];
  for (const [css, attendu] of CAS_REGLES) {
    const n = reglesClippees(css).length;
    if (n !== attendu) ratés.push(`« ${css} » donne ${n} règle(s) clippée(s), attendu ${attendu}`);
  }
  for (const [source, attendu] of CAS_CODE) {
    const n = recopiesDansLeCode(source).length;
    if (n !== attendu) ratés.push(`« ${source} » donne ${n} recopie(s), attendu ${attendu}`);
  }
  for (const c of DOIT_ETRE_FRAGILE)
    if (!fragiles.has(c)) ratés.push(`« .${c} » clippe un dégradé dans son texte : il devrait être DÉRIVÉ fragile`);
  for (const c of NE_DOIT_PAS)
    if (fragiles.has(c)) ratés.push(`« .${c} » ne clippe aucun dégradé : le garde le déclare fragile à tort`);
  for (const [source, attendu] of CAS) {
    const n = fautives(source, fragiles).length;
    if (n !== attendu) ratés.push(`« ${source} » donne ${n} faute(s), attendu ${attendu}`);
  }
  if (!ratés.length) return;
  console.error('\n✗ classes fragiles — LE GARDE NE SE PROUVE PLUS :\n');
  for (const r of ratés) console.error('    · ' + r);
  console.error(`
  Un garde qu'on n'a jamais vu échouer ne garde rien. Ces cas décrivent ce que la règle
  attrape ET ce qu'elle doit laisser passer : les deux moitiés comptent, un garde qui
  crie sur du code correct se fait désactiver aussi sûrement qu'un garde muet.
`);
  process.exit(1);
}

function fichiers(racine) {
  const out = [];
  if (!fs.existsSync(racine)) return out;
  for (const e of fs.readdirSync(racine, { withFileTypes: true })) {
    const complet = path.join(racine, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'dist') out.push(...fichiers(complet)); }
    else if (EXTENSIONS.test(e.name)) out.push(complet);
  }
  return out;
}

/* ── verdict ──────────────────────────────────────────────────────────────── */
if (!STYLES) {
  console.error(`\n✗ classes fragiles — dossier de styles introuvable. Pose STYLES=<dossier>.\n`);
  process.exit(1);
}
const REGLES = feuilles(STYLES).flatMap(f => reglesClippees(fs.readFileSync(f, 'utf8'), f));
const FRAGILES = deriverFragiles(REGLES);
if (!FRAGILES.size) {
  console.error(`\n✗ classes fragiles — aucune classe clippée trouvée dans ${STYLES}.\n`
    + `  Une dérivation qui rend un ensemble vide rend le garde toujours vert : il ne\n`
    + `  garderait plus rien, en silence. Vérifie le chemin, ou le sélecteur attendu.\n`);
  process.exit(1);
}
seProuver(FRAGILES);

const cibles = RACINES.flatMap(fichiers);
if (!cibles.length) {
  console.error(`\n✗ classes fragiles — aucun fichier lu dans : ${RACINES.join(', ')}\n`
    + `  Un scanner qui ne lit rien passe au vert en ne prouvant rien.\n`);
  process.exit(1);
}

/* ── une seule règle découpe le dégradé, et le code ne le réécrit pas ──────── */
const recopies = [];
if (REGLES.length !== 1 || !REGLES[0].selecteurs.includes('.accent'))
  for (const r of REGLES) recopies.push(`${r.fichier} — ${r.selecteurs.join(', ')}`);
for (const f of cibles)
  for (const { ligne, texte } of recopiesDansLeCode(fs.readFileSync(f, 'utf8')))
    recopies.push(`${f}:${ligne} — ${texte}`);
if (recopies.length) {
  console.error(`\n✗ texte en dégradé — l'effet est réécrit hors de LA règle de ${STYLES}/patterns.css`
    + ` (§ LE TEXTE EN DÉGRADÉ, qui porte \`.accent\`) :\n`);
  for (const r of recopies) console.error('    · ' + r);
  console.error(`
  Une seule règle découpe le dégradé de marque dans un texte. Un motif qui en a besoin
  rejoint SA liste de sélecteurs ; un nœud d'app pose \`.accent\` (seul sur son nœud).
  Jamais \`bg-brand-gradient bg-clip-text text-transparent\` ni un style en ligne.
`);
  process.exit(1);
}

const erreurs = [];
for (const f of cibles)
  for (const { liste, ligne } of fautives(fs.readFileSync(f, 'utf8'), FRAGILES))
    erreurs.push(`${f}:${ligne} — className="${liste}"`);

if (erreurs.length) {
  console.error(`\n✗ classes fragiles — ${erreurs.length} nœud(s) où un utilitaire cohabite avec`
    + ` ${[...FRAGILES].map(c => `\`.${c}\``).join(' ou ')} :\n`);
  for (const e of erreurs) console.error('    · ' + e);
  console.error(`
  La panne est MUETTE : une classe de couleur écrase \`color:transparent\` et le dégradé
  disparaît (le mot reste lisible, en gris) ; une classe de largeur écrase
  \`width:fit-content\` et le dégradé s'étale sur la gouttière.
  La parade : deux spans. L'EXTERNE porte la mise en page et la typo — l'enfant en hérite —
  l'INTERNE ne porte que la classe et le texte.

      <span className="mb-2 font-display"><span className="${[...FRAGILES][0]}">…</span></span>
`);
  process.exit(1);
}
console.log(`✓ classes fragiles — ${[...FRAGILES].map(c => `.${c}`).join(' ')} dérivées de ${STYLES},`
  + ` seules sur leur nœud dans ${cibles.length} fichiers · une seule règle clippée, aucune recopie`
  + ` · garde prouvé sur ${CAS.length + DOIT_ETRE_FRAGILE.length + NE_DOIT_PAS.length + CAS_REGLES.length + CAS_CODE.length} cas`);
