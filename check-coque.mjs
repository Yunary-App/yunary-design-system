#!/usr/bin/env node
/**
 * La COQUE D'UN ÉCRAN DE CLAUDE gagne toujours dans son périmètre — vérifié, pas supposé.
 *
 * LE DÉFAUT QU'IL FERME. `.ds-card--screen` est elle-même une `.ds-card`. En 0.5.0 et 0.6.0,
 * trois règles de CONTEXTE déclarées après elle — `.ds-card .ds-inset`,
 * `:is(.ds-card,.ds-modal) .ds-dropzone`, `:is(.ds-card,.ds-modal) .ds-upload` — portaient la
 * même spécificité (0,2,0) que `.ds-card--screen .ds-inset…` et repeignaient ces blocs en
 * --background à l'ordre de source ; et le repos de la tuile panneau,
 * `.ds-tile--panel:not(.is-checked):not(:has(…))` (0,4,1), battait `.ds-card--screen .ds-tile`
 * (0,2,0) à la spécificité. mcp-ui a dû contourner dans son propre CSS. Rien ne cassait : la
 * coque perdait en silence.
 *
 * LA DOCTRINE (0.6.1), en trois phrases, et c'est ce que ce garde mesure :
 *
 *   1. La coque est le PREMIER bloc de patterns.css. Déclarée AVANT les motifs, elle ne peut
 *      gagner sur un défaut qu'à la spécificité, et un ÉTAT déclaré après elle (survol, coché,
 *      invalide, désactivé) la bat à égalité : les états survivent dans la coque sans qu'on
 *      les recopie.
 *   2. Une règle de CONTEXTE qui peint un descendant (« dans une carte, l'encart se creuse »)
 *      s'écrit `:where(.ds-card,.ds-modal) .ds-x` : (0,1,0), le rang d'un défaut. La coque,
 *      à (0,2,0), passe par-dessus quel que soit l'ordre.
 *   3. Un défaut qui porte une spécificité plus haute (le repos de la tuile panneau), ou un
 *      contexte emboîté qui doit garder la main (le rail d'un panneau), a sa CONTREPARTIE dans
 *      la coque, à spécificité supérieure.
 *
 * CE QU'IL VÉRIFIE, règle par règle, par couple (forme, propriété développée) :
 *   (a) toute règle citant `.ds-card--screen` précède la première règle de motif ;
 *   (b) tout DÉFAUT de motif (sans état) qu'une règle de coque recouvre est strictement moins
 *       spécifique qu'elle — sinon la coque perd à l'ordre ;
 *   (c) tout ÉTAT de motif qu'un défaut de coque recouvre est au moins aussi spécifique que
 *       lui — sinon la coque l'avale — à moins que la coque exclue cet état (`:not()`) ou le
 *       redise elle-même (la tuile cochée, l'onglet choisi, le voile en dessous) ;
 *   (d) un ÉTAT que la coque redit est strictement plus spécifique que le même état écrit par
 *       un contexte de motif (`.ds-card .ds-tabs .ds-tab[aria-selected]`).
 *
 * L'HEURISTIQUE, écrite plutôt que cachée. La FORME d'une règle est sa chaîne de composés,
 * débarrassée de ses composés de contexte de tête (`.ds-card--screen`, `.ds-card`, `.ds-modal`,
 * `.ds-dropdown`, `.ds-panel`, `.ds-agenda__bar`…, seuls ou dans un `:is()` / `:where()`) ; deux
 * règles se recouvrent quand leurs formes ont la même longueur, bloc BEM pour bloc BEM, avec des
 * modificateurs compatibles (absent ou égal : `.ds-banner--info` ne concerne pas
 * `.ds-banner--inset`) et sans qu'un `:not(.x)` de la coque nomme une classe de l'autre. Une
 * règle qui part d'une autre variante de carte en enfant direct (`.ds-card--plaque>…`) est
 * disjointe de la coque. Un état est un `:hover`, `:focus*`, `:active`, `:disabled`, `:checked`,
 * `[aria-*]`, `[disabled]`, `[data-*]` ou `.is-*`, lu hors `:not()`. Un `background` est comparé
 * à un `background-color` et un `gap` à `column-gap` : les raccourcis sont développés.
 *
 * Il rejoue son jumeau de falsification à chaque appel : une feuille synthétique qui viole les
 * quatre règles doit lever exactement quatre écarts, sinon le garde est aveugle et le build tombe.
 *
 * Usage : node check-coque.mjs                      (src/styles/patterns.css)
 *         PATTERNS=<chemin> node check-coque.mjs    (une autre feuille de motifs)
 */
import fs from 'node:fs';

const COQUE = 'ds-card--screen';
const CONTEXTES = /^ds-(card|modal|dropdown|datepicker__pop|panel|agenda__bar)$/;
const ETATS = /^(?::(?:hover|focus-visible|focus-within|focus|active|disabled|checked|invalid|indeterminate|placeholder-shown)\b|\[(?:aria-|data-)[\w-]+|\[(?:disabled|open|hidden)\b|\.is-[\w-]+)/;

/* ---------- lecture : règles, dans l'ordre, @media aplatis ---------- */
const RACCOURCIS = {
  background: ['background-color', 'background-image'],
  border: ['border-width', 'border-style', 'border-color'],
  'border-top': ['border-top-width', 'border-top-style', 'border-top-color'],
  'border-bottom': ['border-bottom-width', 'border-bottom-style', 'border-bottom-color'],
  gap: ['row-gap', 'column-gap'],
  padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
  'padding-inline': ['padding-left', 'padding-right'],
  'padding-block': ['padding-top', 'padding-bottom'],
  margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  'margin-inline': ['margin-left', 'margin-right'],
  'margin-block': ['margin-top', 'margin-bottom'],
  font: ['font-family', 'font-size', 'font-weight', 'line-height'],
  flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
};
const developper = nom => RACCOURCIS[nom] || [nom];

function regles(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  let i = 0, ordre = 0;
  const lire = (fin) => {
    while (i < src.length) {
      const deb = i;
      while (i < src.length && src[i] !== '{' && src[i] !== '}') i++;
      if (i >= src.length) return;
      if (src[i] === '}') { i++; if (fin) return; continue; }
      const prelude = src.slice(deb, i).trim(); i++;
      if (prelude.startsWith('@')) {
        if (/^@(media|supports|layer|container)\b/.test(prelude)) { lire(true); continue; }
        let prof = 1; while (i < src.length && prof) { if (src[i] === '{') prof++; else if (src[i] === '}') prof--; i++; }
        continue; /* @property, @keyframes, @font-face… : bloc sauté */
      }
      const d = i; while (i < src.length && src[i] !== '}') i++;
      const decls = src.slice(d, i); i++;
      const props = new Set();
      for (const decl of decls.split(';')) {
        const nom = decl.split(':')[0].trim().toLowerCase();
        if (nom) for (const p of developper(nom)) props.add(p);
      }
      for (const sel of scinder(prelude)) out.push({ sel: sel.trim(), props, ordre: ordre++ });
    }
  };
  lire(false);
  return out;
}

/* scinde une liste de sélecteurs sur la virgule, hors parenthèses et crochets */
function scinder(s) {
  const out = []; let prof = 0, deb = 0;
  for (let k = 0; k < s.length; k++) {
    const c = s[k];
    if (c === '(' || c === '[') prof++;
    else if (c === ')' || c === ']') prof--;
    else if (prof === 0 && c === ',') { out.push(s.slice(deb, k)); deb = k + 1; }
  }
  out.push(s.slice(deb));
  return out.filter(x => x.trim());
}

/* scinde un sélecteur complexe en composés, en gardant le combinateur qui précède chacun */
function composes(sel) {
  const out = []; let prof = 0, deb = 0, comb = '';
  const s = sel.trim();
  for (let k = 0; k < s.length; k++) {
    const c = s[k];
    if (c === '(' || c === '[') prof++;
    else if (c === ')' || c === ']') prof--;
    else if (prof === 0 && /[\s>+~]/.test(c)) {
      if (k > deb) { out.push({ txt: s.slice(deb, k), comb }); comb = ' '; }
      if (/[>+~]/.test(c)) comb = c;
      deb = k + 1;
    }
  }
  if (deb < s.length) out.push({ txt: s.slice(deb), comb });
  return out.filter(x => x.txt.trim());
}

/* ---------- spécificité (a, b, c) d'un sélecteur complexe ---------- */
function spec(sel) {
  let a = 0, b = 0, c = 0, k = 0;
  const s = sel.trim();
  const ident = () => { const m = /^-?[\w-]+/.exec(s.slice(k)); k += m ? m[0].length : 1; return m ? m[0] : ''; };
  const args = () => { let prof = 1, d = k; while (k < s.length && prof) { if (s[k] === '(') prof++; else if (s[k] === ')') prof--; k++; } return s.slice(d, k - 1); };
  while (k < s.length) {
    const ch = s[k];
    if (/[\s>+~]/.test(ch) || ch === '*') { k++; continue; }
    if (ch === '#') { k++; ident(); a++; continue; }
    if (ch === '.') { k++; ident(); b++; continue; }
    if (ch === '[') { while (k < s.length && s[k] !== ']') k++; k++; b++; continue; }
    if (ch === ':') {
      if (s[k + 1] === ':') { k += 2; ident(); c++; continue; }
      k++; const nom = ident();
      if (s[k] === '(') {
        k++; const inner = args();
        if (nom === 'where') continue;
        if (/^(is|not|has|matches)$/.test(nom)) {
          let max = [0, 0, 0];
          for (const alt of scinder(inner)) { const v = spec(alt.replace(/^[\s>+~]+/, '')); if (cmp(v, max) > 0) max = v; }
          a += max[0]; b += max[1]; c += max[2]; continue;
        }
        b++; continue; /* :nth-child(…) et consorts */
      }
      b++; continue;
    }
    ident(); c++; /* sélecteur de type */
  }
  return [a, b, c];
}
const cmp = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
const fmt = v => `(${v.join(',')})`;

/* ---------- la cible d'une règle : forme (composés hors contexte de tête), états ---------- */
const sansArgs = txt => txt.replace(/\((?:[^()]|\([^()]*\))*\)/g, '');
const classesDe = (txt, dedans) => [...(dedans ? txt : sansArgs(txt)).matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]);
const bloc = cl => cl.replace(/--[\w-]+$/, '');
const mod = cl => /--([\w-]+)$/.exec(cl)?.[1] || null;

function marquer(txt, dansNot, etats, exclus, exclusClasses) {
  let k = 0;
  while (k < txt.length) {
    const reste = txt.slice(k);
    const m = /^:(not|where|is|has|matches)\(/.exec(reste);
    if (m) {
      k += m[0].length; let prof = 1, d = k;
      while (k < txt.length && prof) { if (txt[k] === '(') prof++; else if (txt[k] === ')') prof--; k++; }
      const inner = txt.slice(d, k - 1);
      if (m[1] === 'not') for (const cl of classesDe(inner, true)) exclusClasses.add(cl);
      marquer(inner, dansNot || m[1] === 'not', etats, exclus, exclusClasses); continue;
    }
    const e = ETATS.exec(reste);
    if (e) { (dansNot ? exclus : etats).add(e[0]); k += e[0].length; continue; }
    k++;
  }
}

function cible(sel) {
  const parts = composes(sel);
  const etats = new Set(), exclus = new Set();
  const decrits = parts.map(p => {
    const exclusClasses = new Set();
    marquer(p.txt, false, etats, exclus, exclusClasses);
    const hautes = classesDe(p.txt, false);          /* classes au premier niveau du composé */
    const toutes = classesDe(p.txt, true);           /* dont celles d'un :is()/:where() */
    const estCoque = hautes.includes(COQUE);
    const contexte = toutes.length > 0 && toutes.every(cl => CONTEXTES.test(bloc(cl)) || cl === COQUE);
    const ds = hautes.find(cl => cl !== COQUE) || toutes.find(cl => cl !== COQUE) || null;
    return { ...p, contexte, estCoque, bloc: ds ? bloc(ds) : `<${sansArgs(p.txt).replace(/[.:[].*$/, '') || '?'}>`, mod: ds ? mod(ds) : null, classes: hautes, exclusClasses };
  });
  /* la forme : on ôte les contextes de TÊTE ; une autre variante de carte en enfant direct est disjointe */
  let forme = decrits.slice(), disjointe = false;
  while (forme.length > 1 && forme[0].contexte) {
    const tete = forme[0];
    if (tete.bloc === 'ds-card' && tete.mod && tete.mod !== 'screen' && forme[1].comb === '>') disjointe = true;
    forme = forme.slice(1);
  }
  /* la règle de coque elle-même (`.ds-card.ds-card--screen`) : la carte, variante screen */
  if (forme.length === 1 && forme[0].estCoque) forme = [{ ...forme[0], bloc: 'ds-card', mod: 'screen' }];
  return { forme, etats, exclus, disjointe };
}

/* deux règles se recouvrent-elles ? (même forme, modificateurs compatibles, pas d'exclusion) */
function recouvre(c, r) {
  if (r.disjointe || c.forme.length !== r.forme.length) return false;
  return c.forme.every((fc, i) => {
    const fr = r.forme[i];
    if (fc.bloc !== fr.bloc) return false;
    if (fc.mod && fr.mod && fc.mod !== fr.mod) return false;
    if ([...fc.exclusClasses].some(cl => fr.classes.includes(cl))) return false;
    return true;
  });
}
const partage = (x, y) => [...x].some(e => y.has(e));
const inclus = (x, y) => [...x].every(e => y.has(e));

/* ---------- l'analyse ---------- */
function analyser(css) {
  const toutes = regles(css).map(r => ({ ...r, coque: r.sel.includes(`.${COQUE}`), spec: spec(r.sel), ...cible(r.sel) }));
  const ecarts = new Map();
  const noter = (cle, p) => ecarts.set(cle, [...(ecarts.get(cle) || []), p]);
  const rendu = () => [...ecarts].map(([cle, props]) => (props.length ? `${cle} — sur ${[...new Set(props)].join(', ')}` : cle));
  const coque = toutes.filter(r => r.coque), motifs = toutes.filter(r => !r.coque);
  if (!coque.length) return { ecarts: ['aucune règle de coque trouvée — le sélecteur a changé ?'], coque, motifs };

  /* (a) la coque d'abord */
  const premierMotif = Math.min(...motifs.map(r => r.ordre));
  for (const r of coque) if (r.ordre > premierMotif) ecarts.set(`(a) hors du bloc de tête : \`${r.sel}\``, []);

  for (const r of motifs) {
    for (const p of r.props) {
      const defautsCoque = coque.filter(c => !c.etats.size && c.props.has(p) && recouvre(c, r));
      const etatsCoque = coque.filter(c => c.etats.size && c.props.has(p) && recouvre(c, r));
      if (!r.etats.size) {
        /* (b) un défaut : la coque doit être STRICTEMENT plus spécifique */
        if (!defautsCoque.length) continue;
        const meilleure = defautsCoque.reduce((m, c) => (cmp(c.spec, m.spec) > 0 ? c : m));
        if (cmp(meilleure.spec, r.spec) <= 0)
          noter(`(b) la coque perd contre un défaut : \`${r.sel}\` ${fmt(r.spec)} ≥ \`${meilleure.sel}\` ${fmt(meilleure.spec)}`, p);
        continue;
      }
      /* (c) un état face à un défaut de coque : il survit, ou la coque l'exclut / le redit */
      for (const c of defautsCoque) {
        if (cmp(r.spec, c.spec) >= 0) continue;
        if (partage(c.exclus, r.etats)) continue;
        if (etatsCoque.some(k => partage(k.etats, r.etats) && cmp(k.spec, c.spec) >= 0)) continue;
        noter(`(c) la coque avale un état : \`${c.sel}\` ${fmt(c.spec)} > \`${r.sel}\` ${fmt(r.spec)}`, p);
      }
      /* (d) un état que la coque redit bat le même état écrit par un contexte de motif */
      for (const k of etatsCoque) {
        if (!inclus(r.etats, k.etats)) continue;
        if (cmp(k.spec, r.spec) > 0) continue;
        noter(`(d) l'état de la coque perd contre un motif : \`${r.sel}\` ${fmt(r.spec)} ≥ \`${k.sel}\` ${fmt(k.spec)}`, p);
      }
    }
  }
  return { ecarts: rendu(), coque, motifs };
}

/* ---------- le jumeau de falsification ---------- */
const FAUX = `
.ds-card.ds-card--screen{background:var(--background)}
.ds-card--screen .ds-x{background:var(--card);border-color:var(--border)}
.ds-card--screen .ds-y:not(.ds-y--bare){background:var(--card)}
.ds-card--screen .ds-w.ds-w--big{border-color:var(--border)}
.ds-card--screen .ds-v[aria-selected="true"]{color:var(--primary)}
.ds-card{background:var(--card)}
.ds-card--stack>.ds-x{background:var(--muted)}
.ds-x{background:var(--secondary)}
.ds-card .ds-x{background:var(--background)}
.ds-x.is-dragover{border-color:var(--primary);background:var(--accent)}
.ds-x:hover{border-color:var(--primary)}
.ds-w--big:hover{border-color:var(--primary)}
.ds-y{background:var(--card)}
.ds-y--bare{background:transparent}
.ds-v[aria-selected="true"]{color:var(--foreground)}
.ds-card .ds-v[aria-selected="true"]{color:var(--foreground)}
.ds-card--screen .ds-z{background:var(--card)}
`;
{
  const { ecarts } = analyser(FAUX);
  const attendus = [/^\(a\).*ds-z/, /^\(b\).*`\.ds-card \.ds-x`/, /^\(c\).*ds-w--big:hover/, /^\(d\).*`\.ds-card \.ds-v/];
  const manques = attendus.filter(re => !ecarts.some(e => re.test(e)));
  const intrus = ecarts.filter(e => !attendus.some(re => re.test(e)));
  if (manques.length || intrus.length) {
    console.error('✗ coque — le jumeau de falsification ne rend pas exactement les quatre écarts attendus, le garde est aveugle :');
    for (const e of ecarts) console.error(`    ${e}`);
    process.exit(2);
  }
}

/* ---------- la feuille réelle ---------- */
const FICHIER = process.env.PATTERNS || 'src/styles/patterns.css';
const { ecarts, coque, motifs } = analyser(fs.readFileSync(FICHIER, 'utf8'));
if (ecarts.length) {
  console.error(`✗ coque — ${ecarts.length} écart(s) dans ${FICHIER} : la coque d'écran ne gagne pas partout dans son périmètre.`);
  for (const e of ecarts) console.error(`    ${e}`);
  console.error('    Remède : une règle de contexte s\'écrit `:where(.ds-card,.ds-modal) .ds-x` ; un défaut plus spécifique a sa');
  console.error('    contrepartie dans le bloc de tête ; un état avalé se laisse passer (`:not(:hover)`) ou se redit dans la coque.');
  process.exit(1);
}
const recouverts = new Set(motifs.filter(r => coque.some(c => recouvre(c, r) && [...r.props].some(p => c.props.has(p)))).map(r => r.sel)).size;
console.log(`✓ coque — ${coque.length} règles de coque en tête de ${FICHIER}, ${recouverts} règles de motif recouvertes :`);
console.log('          chaque défaut est battu à la spécificité, chaque état survit (ou est redit), aucun contexte ne repeint la coque.');
