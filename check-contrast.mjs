/**
 * Filet WCAG — le contraste du système, MESURÉ, à chaque `npm run lint`.
 *
 * LE DÉFAUT QU'IL FERME. `docs/accessibilite.md` liste des ratios. Un document qui
 * porte des nombres ment dès la première valeur de jeton qui bouge, et personne ne
 * le voit : rien dans `tsc`, dans tsup ni dans Vite ne calcule un contraste. Un audit
 * a déjà trouvé la couleur de TOUT le texte cliquable à 3,12 sur --background — un
 * remplissage de marque posé en couleur de texte — dans un dépôt qui passait toutes
 * ses commandes au vert. Une couleur de remplissage n'est pas lisible en texte, et
 * seul un contrôle qui MESURE peut l'attraper.
 *
 * POURQUOI IL COMPTE POUR UN TEMPLATE. Le socle ne porte plus aucune couleur : elles
 * viennent du fichier de marque, que le CLIENT écrit. Ce contrôle lit ce fichier-là.
 * Un client qui pose sa palette et casse une paire l'apprend de son build, pas de son
 * audit d'accessibilité six mois plus tard.
 *
 * LA RÈGLE. Toute paire contenu/porteuse doit tenir son seuil — 4,5:1 pour du texte
 * courant (WCAG 2.2 AA, 1.4.3), 3:1 pour du gros texte, une icône ou un contour de
 * contrôle (1.4.11). Une paire qui échoue DOIT être déclarée `@a11y-assume:` DANS LE
 * FICHIER DE MARQUE, avec sa raison, et reprise dans `docs/accessibilite.md`. Sinon le
 * build tombe. Le script porte la mécanique, la marque porte ses renoncements.
 *
 * Usage : node check-contrast.mjs [--table]   (STYLES=<dossiers séparés par des virgules>)
 * TOUTES LES MARQUES DU DÉPÔT, une ligne de verdict chacune, sortie non-zéro si l'une
 * échoue — aujourd'hui il n'y en a qu'une, `src/styles/brand-yunary.css`, mais le script
 * mesure tout `brand-*.css` qu'il trouve : un garde qu'il faut penser à invoquer n'est
 * pas un garde.
 * TOKENS=<chemin> mesure UN fichier isolé — celui d'un client avant de l'installer.
 */
import fs from 'node:fs';
import path from 'node:path';

/* ---------- WCAG ---------- */
const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = h => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (fg, alpha, bg) => { const f = hex(fg), b = hex(bg);
  return '#' + f.map((c, i) => Math.round(c * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, '0')).join(''); };

/* ---------- lecture des jetons ---------- */
/* Les marques à mesurer : tout `brand-*.css` des dossiers scannés, moins le gabarit (valeurs
   vides par construction).

   DEUX DOSSIERS SCANNÉS, exprès. `demo/` a déjà porté une palette de recette à côté de
   celle de `src/styles`, et ne scanner qu'un dossier a déjà produit une perte de
   couverture silencieuse. Le scan reste large : toute marque posée dans l'un ou l'autre
   est mesurée sans qu'on ait à y penser.

   Il a un temps lu l'entrée du paquet pour deviner « la » marque à mesurer. Il n'y a plus
   d'entrée qui monte une marque : le socle s'importe par `core.css`, une marque se monte
   à côté. Il n'y a donc rien à deviner — il les mesure toutes. */
const DOSSIERS = (process.env.STYLES || 'src/styles,demo').split(',');
function marquesLivrées() {
  const out = [];
  for (const d of DOSSIERS) {
    if (!fs.existsSync(d)) continue;
    for (const n of fs.readdirSync(d).sort()) {
      if (!/^brand-.*\.css$/.test(n)) continue;
      if (n === 'brand.template.css') continue;
      if (/-entry\.css$/.test(n)) continue;   // un montage, pas une marque
      out.push(path.join(d, n));
    }
  }
  return out;
}
const CIBLES = process.env.TOKENS ? [process.env.TOKENS] : marquesLivrées();
if (!CIBLES.length) {
  console.error(`\n✗ contraste — aucune marque trouvée dans ${DOSSIERS.join(', ')}.
  Un garde qui ne mesure rien passerait au vert sur un dépôt entièrement cassé.\n`);
  process.exit(1);
}
/* LES JETONS DÉRIVÉS DU SOCLE. Sept jetons ne sont plus dans le fichier de marque : le
   socle les CALCULE depuis des jetons de marque (tokens/derives.css). Ils comptent
   pourtant dans les paires mesurées — un fond de pastille en est un. On les préfixe donc
   à chaque marque lue, sans les écraser : une marque qui redéclare sa propre formule garde
   la sienne, puisque son fichier est parsé après. */
const DERIVES = 'src/styles/tokens/derives.css';
function lireDerives() {
  if (!fs.existsSync(DERIVES)) return { ROOT: {}, DARK: {} };
  const src = fs.readFileSync(DERIVES, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const bloc = sel => { const i = src.indexOf(sel + '{'); if (i < 0) return {};
    const t = src.slice(i + sel.length + 1); let d = 1, j = 0;
    while (d > 0 && j < t.length) { if (t[j] === '{') d++; if (t[j] === '}') d--; j++; }
    return Object.fromEntries([...t.slice(0, j - 1).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
      .map(m => [m[1], m[2].trim()])); };
  return { ROOT: bloc(':root'), DARK: bloc('.dark') };
}
const DER = lireDerives();
if (!Object.keys(DER.ROOT).length) {
  console.error(`\n✗ contraste — ${DERIVES} n'a livré aucun jeton.
  Les jetons dérivés du socle entrent dans les paires mesurées : sans eux, la mesure serait
  partielle et passerait au vert en ayant sauté des paires. Refus.\n`);
  process.exit(1);
}

function lireMarque(fichier) {
  const brut = fs.readFileSync(fichier, 'utf8');
  const src = brut.replace(/\/\*[\s\S]*?\*\//g, '');
  const block = sel => { const i = src.indexOf(sel + '{');
    if (i < 0) throw new Error(`${fichier} : bloc ${sel} introuvable`);
    const s = src.slice(i + sel.length + 1); let d = 1, j = 0;
    while (d > 0) { if (s[j] === '{') d++; if (s[j] === '}') d--; j++; }
    return s.slice(0, j - 1); };
  const parse = t => Object.fromEntries([...t.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
  /* Les renoncements de CETTE marque, lus dans ses propres blocs @a11y-assume. */
  const assumées = Object.fromEntries(
    [...brut.matchAll(/@a11y-assume:[ \t]*(.+?)[ \t]*\r?\n([\s\S]*?)\*\//g)]
      .map(m => [m[1].trim(), m[2].replace(/\s+/g, ' ').trim()]));
  return { ROOT: { ...DER.ROOT, ...parse(block(':root')) },
           DARK: { ...DER.DARK, ...parse(block('.dark')) }, assumées };
}

function resolve(v, scope, ROOT, fichier, d = 0) {
  if (d > 12) throw new Error('référence circulaire : ' + v);
  v = String(v).trim();
  let m = /^var\((--[\w-]+)\)$/.exec(v);
  if (m) { const next = scope[m[1]] ?? ROOT[m[1]];
    if (next === undefined) throw new Error(`${fichier} : jeton ${m[1]} absent du contrat`);
    return resolve(next, scope, ROOT, fichier, d + 1); }
  m = /^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+?)\s*\)$/.exec(v);
  if (m) { const a = resolve(m[1], scope, ROOT, fichier, d + 1), p = +m[2] / 100, b = m[3].trim();
    return b === 'transparent' ? { c: a, alpha: p } : over(a, p, resolve(b, scope, ROOT, fichier, d + 1)); }
  m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(v);
  if (m) { const h = '#' + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, '0')).join('');
    return m[4] !== undefined ? { c: h, alpha: +m[4] } : h; }
  return v;
}

/* ---------- les paires du système ---------- */
// [zone, règle, contenu, porteuse, seuil, taille]
// `on(jeton, porteuse)` aplatit un fond translucide sur sa surface porteuse.
function pairs(theme, { ROOT, DARK }, fichier) {
  const scope = theme === 'dark' ? { ...ROOT, ...DARK } : ROOT;
  const g = n => resolve(`var(${n})`, scope, ROOT, fichier);
  const on = (n, carrier) => { const v = g(n); return typeof v === 'object' ? over(v.c, v.alpha, g(carrier)) : v; };
  const B = '--background', C = '--card', P = [];
  const add = (zone, regle, fg, bg, min, taille) => P.push({ zone, regle, fg, bg, min, taille, r: ratio(fg, bg) });
  const softAlpha = theme === 'dark' ? [.14, .10] : [.08, .06];

  add('Texte', 'texte courant sur --background', g('--foreground'), g(B), 4.5, '16 / 400');
  add('Texte', 'texte courant sur --card', g('--foreground'), g(C), 4.5, '16 / 400');
  add('Texte', '--text-secondary sur --card', g('--text-secondary'), g(C), 4.5, '16 / 400');
  add('Texte', '.caption — --text-muted sur --card', g('--text-muted'), g(C), 4.5, '13 / 500');
  add('Texte', '.ds-input::placeholder', g('--text-muted'), g('--secondary'), 4.5, '15 / 400');
  add('Texte', '.ds-tooltip__bubble', theme === 'light' ? g('--text-inverted') : g('--tone-dark'),
                                      theme === 'light' ? g('--tone-dark') : g('--tone-light-alt'), 4.5, '13 / 600');

  add('Lien', 'a{} au repos sur --background', g('--primary-readable'), g(B), 4.5, '16 / 400');
  add('Lien', 'a{} au repos sur --card', g('--primary-readable'), g(C), 4.5, '16 / 400');
  add('Lien', 'a:hover — dérivé vers --foreground', over(g('--primary-readable'), .8, g('--foreground')), g(B), 4.5, '16 / 400');

  /* LA CONVENTION DE L'ÉLÉMENT SÉLECTIONNÉ : plaque --accent, texte --primary — la couleur de
     REMPLISSAGE posée en texte —, partout : l'entrée de Sidebar, l'onglet (aussi sur carte, où la
     plaque est --card), la page courante, l'item de menu coché, l'option cochée, le lien de barre.
     Les sept paires sont mesurées telles que le CSS les pose : elles passent SOUS 4,5 dans les
     deux thèmes, et chacune est un écart ASSUMÉ dans brand-yunary.css (@a11y-assume, un bloc par
     paire — décision de marque de Julien du 11/09/2026). Le garde ne masque rien : il refuse la
     première paire dont le bloc manquerait. Une taille de texte par composant, d'où sept lignes. */
  add('Marque-contenu', '.ds-navlink.is-active', g('--primary'), g('--secondary'), 4.5, '16 / 500');
  add('Marque-contenu', '.ds-sidenav.is-active', g('--primary'), g('--accent'), 4.5, '15 / 500');
  add('Marque-contenu', '.ds-tab[aria-selected]', g('--primary'), g('--accent'), 4.5, '15 / 600');
  add('Marque-contenu', '.ds-tabs--on-card .ds-tab[aria-selected]', g('--primary'), g(C), 4.5, '15 / 600');
  add('Marque-contenu', '.ds-page[aria-current]', g('--primary'), g('--accent'), 4.5, '15 / 600');
  add('Marque-contenu', '.ds-dropdown__item[aria-checked]', g('--primary'), g('--accent'), 4.5, '15 / 400');
  add('Marque-contenu', '.ds-select option:checked', g('--primary'), g('--accent'), 4.5, '15 / 400');
  /* Les ICÔNES de la convention (seuil 3) : le bouton-icône accent et le bouton-icône enfoncé.
     3,00 en clair — au seuil, pas dessous. */
  add('Marque-contenu', '.ds-icon-btn--accent — icône', g('--primary'), g('--accent'), 3, 'icône');
  add('Marque-contenu', '.ds-badge--accent', g('--primary-readable'), g('--accent'), 4.5, '12 / 700');
  add('Marque-contenu', '.ds-banner--info', g('--primary-readable'), g('--accent'), 4.5, '15 / 400');
  /* La règle pose `color:var(--primary)` (patterns.css) — pas le jumeau lisible. */
  add('Marque-contenu', '.ds-cal__day.is-today', g('--primary'), g(C), 4.5, '14 / 700');
  /* La règle pose `background:var(--pill-coral-bg);color:var(--primary)` — la plaque n'est
     plus --grad-soft mais le dérivé color-mix(--primary 12%), composité sur la porteuse. */
  add('Marque-contenu', '.ds-pastille--brand — icône', g('--primary'), over(g('--primary'), .12, g(C)), 3, 'icône');
  /* Le ton PLEIN : le glyphe est --primary-foreground sur le dégradé opaque, donc mesuré
     sur ses trois arrêts et pas sur un aplat. Seuil 3 comme sa jumelle douce — un glyphe de
     pastille est un graphique non textuel. */
  for (const arret of ['--brand-from', '--brand-via', '--brand-to'])
    add('Marque-contenu', `.ds-pastille--brand-solid — glyphe sur ${arret}`, g('--primary-foreground'), g(arret), 3, 'icône');
  add('Marque-contenu', '.ds-icon-btn[aria-pressed] — icône', g('--primary'), g('--accent'), 3, 'icône');
  add('Marque-contenu', '.ds-error', g('--destructive-readable'), g(C), 4.5, '13 / 500');
  add('Marque-contenu', '.ds-dropdown__item--danger', g('--destructive-readable'), g('--popover'), 4.5, '15 / 400');
  /* Le danger DOUX du bouton-icône : la paire de la pilule danger, sur les deux porteuses. */
  add('Marque-contenu', '.ds-icon-btn--danger-soft sur --card — glyphe', g('--pill-danger-fg'), on('--pill-danger-bg', C), 3, 'icône');
  add('Marque-contenu', '.ds-icon-btn--danger-soft sur --background — glyphe', g('--pill-danger-fg'), on('--pill-danger-bg', B), 3, 'icône');
  /* La tuile cochée : son contenu reste en encre sur la plaque, son filet est --primary. */
  add('Marque-contenu', '.ds-tile cochée — titre sur --accent', g('--foreground'), g('--accent'), 4.5, '16 / 600');
  add('Marque-contenu', '.ds-tile cochée — description sur --accent', g('--text-secondary'), g('--accent'), 4.5, '14 / 400');
  /* La tuile compacte : son libellé au repos est --text-secondary sur --background. */
  add('Marque-contenu', '.ds-tile--compact — libellé au repos', g('--text-secondary'), g(B), 4.5, '15 / 500');
  /* Le danger doux du Button : la paire de la pilule danger, sur les deux porteuses. */
  add('Marque-contenu', '.ds-btn--danger-soft sur --card — label', g('--pill-danger-fg'), on('--pill-danger-bg', C), 4.5, '14 / 600');
  add('Marque-contenu', '.ds-btn--danger-soft sur --background — label', g('--pill-danger-fg'), on('--pill-danger-bg', B), 4.5, '14 / 600');
  /* Les textes en sourdine des ajouts : le champ en lecture seule, l'encart vide. */
  add('Texte', '.ds-input[readonly] — texte sur --background', g('--text-muted'), g(B), 4.5, '15 / 400');
  add('Texte', '.ds-input[readonly] — texte sur --secondary', g('--text-muted'), g('--secondary'), 4.5, '15 / 400');
  add('Texte', '.ds-inset--dashed — texte sur --background', g('--text-muted'), g(B), 4.5, '14 / 400');
  /* v0.4.0 — les parcours : l'encart ambre, les repères d'étape, l'agenda, le média, les avantages. */
  add('Marque-contenu', '.ds-banner--amber — texte sur --card', g('--pill-amber-fg'), on('--pill-amber-bg', C), 4.5, '14 / 400');
  add('Marque-aplat', '.ds-step en cours — chiffre sur --brand-from (pire arrêt)', g('--primary-foreground'), g('--brand-from'), 4.5, '13 / 700');
  add('Marque-aplat', '.ds-agenda__cell.is-today — numéro sur --brand-from (pire arrêt)', g('--primary-foreground'), g('--brand-from'), 4.5, '13 / 600');
  add('Texte', '.ds-week__wd — jour sur --muted', g('--text-secondary'), g('--muted'), 4.5, '12 / 700');
  add('Marque-contenu', '.ds-week__day.is-today — jour et numéro', g('--primary-readable'), over(g('--primary'), .12, g('--accent')), 4.5, '12 / 700');
  add('Texte', '.ds-agenda__cell.is-outside — numéro sur --muted', g('--text-muted'), g('--muted'), 4.5, '13 / 600');
  add('Texte', '.ds-media__badge — durée sur la vidéo', g('--tone-light'), on('--overlay-play-bg', '--tone-dark'), 4.5, '11 / 600');
  add('Texte', '.ds-perk — libellé sur --card', g('--foreground'), g(C), 4.5, '14 / 400');
  /* v0.5.0 — le badge de marque et le montant en dégradé : du texte sur le dégradé plein ou clippé,
     mesuré sur l'arrêt clair, le pire. Le compteur et le repère d'étape à venir : du texte en sourdine
     et un contour sur la porteuse. */
  add('Marque-aplat', '.ds-badge--brand — texte sur --brand-from (pire arrêt)', g('--primary-foreground'), g('--brand-from'), 4.5, '12 / 700');
  add('Marque-aplat', '.ds-price--accent — montant sur --brand-from (pire arrêt)', g('--brand-from'), g(C), 3, '36 / 800');
  add('Texte', '.ds-meter__of — texte sur --background', g('--text-muted'), g(B), 4.5, '14 / 400');
  add('Texte', '.ds-steps__counter-sub — texte sur --background', g('--text-muted'), g(B), 4.5, '18 / 400');
  add('Non-texte', '.ds-tile--choice — coche --primary-readable sur --accent', g('--primary-readable'), g('--accent'), 3, 'icône');

  for (const n of ['coral', 'amber', 'danger', 'warning', 'success', 'neutral']) {
    add('Pill', `.ds-badge--${n} sur --card`, g(`--pill-${n}-fg`), on(`--pill-${n}-bg`, C), 4.5, '12 / 700');
    add('Pill', `.ds-badge--${n} sur --background`, g(`--pill-${n}-fg`), on(`--pill-${n}-bg`, B), 4.5, '12 / 700');
  }
  add('Pill', '.ds-badge--outline', g('--text-secondary'), g(C), 4.5, '12 / 700');

  add('Surface', 'survol — --foreground sur --surface-alt', g('--foreground'), g('--surface-alt'), 4.5, '15 / 600');

  add('Marque-aplat', '.ds-btn--primary — label sur --primary à plat', g('--primary-foreground'), g('--primary'), 4.5, '15 / 600');
  add('Marque-aplat', '.ds-btn--primary — label sur --brand-from (pire arrêt)', g('--primary-foreground'), g('--brand-from'), 4.5, '15 / 600');
  add('Marque-aplat', '.ds-btn--primary — label sur --brand-via', g('--primary-foreground'), g('--brand-via'), 4.5, '15 / 600');
  add('Marque-aplat', '.ds-btn--primary — label sur --brand-to', g('--primary-foreground'), g('--brand-to'), 4.5, '15 / 600');
  add('Marque-aplat', '.ds-btn--danger — label sur --destructive', g('--destructive-foreground'), g('--destructive'), 4.5, '15 / 600');
  add('Marque-aplat', '.ds-cal__day.is-selected', g('--primary-foreground'), g('--primary'), 4.5, '14 / 600');
  add('Marque-aplat', '.eyebrow / .accent — dégradé clippé en texte', g('--brand-from'), g(B), 4.5, '12 / 600');

  add('Non-texte', 'anneau de focus --ring sur --background', g('--ring'), g(B), 3, 'contour 2px');
  add('Non-texte', '.ds-choice coché — aplat --primary', g('--primary'), g(B), 3, 'contrôle');
  add('Non-texte', '.ds-switch actif — piste --primary', g('--primary'), g(B), 3, 'contrôle');
  add('Non-texte', '.ds-progress__bar sur son rail', g('--primary'), g('--surface-alt'), 3, 'graphique');
  add('Non-texte', '.ds-input.is-error — bordure --destructive', g('--destructive'), g('--secondary'), 3, 'contour 1.5px');
  add('Non-texte', '.ds-tile cochée — filet --primary vs --card', g('--primary'), g(C), 3, 'contour 1.5px');
  add('Non-texte', '.ds-tile cochée — filet --primary vs --background', g('--primary'), g(B), 3, 'contour 1.5px');
  add('Non-texte', '.ds-input — bordure --input vs page', g('--input'), g(B), 3, 'contour 1.5px');
  add('Non-texte', '.ds-input — bordure --input vs remplissage', g('--input'), g('--secondary'), 3, 'contour 1.5px');
  add('Non-texte', '.ds-input — remplissage vs page', g('--secondary'), g(B), 3, 'aplat');
  add('Non-texte', '.ds-card — bordure --border vs page', g('--border'), g(B), 3, 'contour 1px');
  add('Non-texte', '.ds-sep — filet --border sur --card', g('--border'), g(C), 3, 'filet 1px');
  return P;
}

/* ---------- les écarts ASSUMÉS ----------
   Ils ne sont PAS ici. Ils appartiennent à la MARQUE, pas au socle : les renoncements
   d'une marque ne sont pas ceux de la suivante, et un client qui apporte son brand-*.css
   ne doit hériter d'aucune dérogation qu'il n'a pas prise — sans quoi une paire qui le
   fait échouer à son audit passerait au vert chez lui.
   Ce script porte la MÉCANIQUE ; chaque fichier de marque porte SES renoncements, sous
   forme de blocs de commentaire lus par `lireMarque` :

       /* @a11y-assume: <clé exacte de la paire>
          <la raison, sur autant de lignes qu'il faut> * /

   Une liste vide est un état normal — et même l'état de départ de brand.template.css. */

/* ---------- rapport ---------- */
const F = n => n.toFixed(2).replace('.', ',');

function mesurer(fichier) {
  const marque = lireMarque(fichier);
  const light = pairs('light', marque, fichier), dark = pairs('dark', marque, fichier);
  const rows = light.map((p, i) => ({ ...p, rl: p.r, rd: dark[i].r,
    ko: p.r < p.min || dark[i].r < dark[i].min }));
  return { marque, rows };
}

if (process.argv.includes('--table')) {
  /* Un seul fichier pour le tableau : TOKENS= s'il est posé, sinon la première marque —
     `brand-yunary.css`, celle que documente docs/accessibilite.md. */
  const fichier = process.env.TOKENS || CIBLES[0];
  const { rows } = mesurer(fichier);
  const md = sel => { const out = ['| Paire | contenu | seuil | clair | sombre |', '|---|---|--:|--:|--:|'];
    for (const p of rows.filter(sel)) out.push(
      `| \`${p.regle}\` | ${p.taille} | ${String(p.min).replace('.', ',')} | ${F(p.rl)}${p.rl < p.min ? ' ✗' : ''} | ${F(p.rd)}${p.rd < p.min ? ' ✗' : ''} |`);
    return out.join('\n'); };
  console.log('<!-- CONFORMES -->\n' + md(p => !p.ko));
  console.log('\n<!-- ASSUMÉES -->\n' + md(p => p.ko));
  process.exit(0);
}

let codeSortie = 0;

for (const fichier of CIBLES) {
  const { marque, rows } = mesurer(fichier);
  const nom = path.basename(fichier);
  const nonDéclarées = rows.filter(p => p.ko && !(p.regle in marque.assumées));
  const périmées = rows.filter(p => !p.ko && (p.regle in marque.assumées));

  if (nonDéclarées.length) {
    codeSortie = 1;
    console.error(`\n✗ contraste — ${nom} : ${nonDéclarées.length} paire(s) sous le seuil sans décision écrite :\n`);
    for (const p of nonDéclarées) console.error(
      `    ${p.regle}\n      contenu ${p.taille} · seuil ${p.min}:1 · clair ${F(p.rl)} · sombre ${F(p.rd)}`);
    console.error(`
  Deux issues, pas trois :
    · corriger le jeton fautif — c'est presque toujours une couleur de REMPLISSAGE
      (--primary, --destructive) posée comme couleur de CONTENU. Le socle a un jumeau
      lisible pour ça : --primary-readable, --destructive-readable ;
    · ou ASSUMER l'écart : ajouter dans ${fichier}, en commentaire, le bloc

          /* @a11y-assume: <la clé exacte ci-dessus>
             <pourquoi la marque impose cet écart, et ce qui l'atténue> */

      et le reprendre dans docs/accessibilite.md. Un écart assumé est une décision écrite.
`);
    continue;
  }
  for (const p of périmées) console.warn(
    `⚠ contraste — ${nom} : « ${p.regle} » passe désormais (${F(p.rl)} / ${F(p.rd)}), retire son @a11y-assume.`);
  const ko = rows.filter(p => p.ko).length;
  console.log(`✓ contraste — ${nom} : ${rows.length} paires × 2 thèmes · ${rows.length - ko} conformes · ${ko} écart${ko > 1 ? 's' : ''} assumé${ko > 1 ? 's' : ''} et documenté${ko > 1 ? 's' : ''}`);
}

process.exit(codeSortie);
