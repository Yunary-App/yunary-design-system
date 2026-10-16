/* Chart en MODE STRICT de développement (v0.8.1) — le garde-fou du défaut de la 0.8.0.
 *
 * LE DÉFAUT. En 0.8.0, le second useLayoutEffect de Chart, sans tableau de dépendances, appelait son
 * setter à CHAQUE passage, même quand la mesure n'avait pas changé (la comparaison se faisait dans
 * la fonction de mise à jour, donc après que l'appel eut programmé un rendu). En mode strict de
 * développement, ce rendu relançait l'effet, qui rappelait le setter : « Maximum update depth
 * exceeded » dès le montage, le graphique ne s'affichait pas. Le build de production, lui, passait.
 *
 * LE BANC. React de développement + StrictMode + happy-dom ; la mise en page est simulée (la
 * largeur du conteneur, la largeur d'une étiquette selon son texte) et le ResizeObserver est piloté
 * par le test. Un <Profiler> compte les rendus réellement validés (commits).
 *
 * LE JUMEAU DE FALSIFICATION. tests/fixtures/Chart-0.8.0.tsx, la version fautive, DOIT boucler dans
 * ce banc : un banc qui ne reproduit plus le défaut ne protège de rien.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Window } from 'happy-dom';
import { build } from 'esbuild';

/* ── le DOM, avant React (react-dom lit `window` au chargement) ── */
const win = new Window({ url: 'http://localhost/', width: 1440, height: 900 });
for (const k of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'SVGElement', 'getComputedStyle', 'MutationObserver', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  Object.defineProperty(globalThis, k, { value: k === 'window' ? win : win[k], configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/* ── la mise en page simulée ── */
let LARGEUR = 964;
const HAUTEUR = 260;
const boite = (w, h) => ({ width: w, height: h, top: 0, left: 0, right: w, bottom: h, x: 0, y: 0, toJSON() { return this; } });
win.HTMLElement.prototype.getBoundingClientRect = function () {
  const c = typeof this.className === 'string' ? this.className : '';
  if (/ds-chart__(x|y)tick/.test(c)) return boite(this.textContent.length * 6.6, 15);
  if (/\bds-chart\b/.test(c)) return boite(LARGEUR, HAUTEUR);
  return boite(0, 0);
};
const observateurs = new Set();
globalThis.ResizeObserver = class {
  constructor(cb) { this.cb = cb; }
  observe() { observateurs.add(this); }
  unobserve() {}
  disconnect() { observateurs.delete(this); }
};
const redimensionner = w => { LARGEUR = w; for (const o of [...observateurs]) o.cb([], o); };

/* ── React de développement, après le DOM ── */
const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { act, StrictMode, Profiler, createElement: h } = React;

/* ── le composant, compilé à la volée (le TSX ne se lit pas tel quel) ── */
async function charger(source) {
  const sortie = path.resolve('node_modules/.cache/ds-tests', `${path.basename(source, '.tsx')}.mjs`);
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  await build({
    entryPoints: [source], bundle: true, format: 'esm', platform: 'node', jsx: 'automatic', outfile: sortie,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'tailwind-merge', 'lucide-react'], logLevel: 'silent',
  });
  return (await import(`${pathToFileURL(sortie).href}?v=${Date.now()}`)).Chart;
}

const JOUR = 86400000;
const POINTS = Array.from({ length: 108 }, (_, i) => ({ at: Date.UTC(2026, 6, 1) + i * JOUR, value: 14 * Math.floor(i / 20) }));
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const jour = t => { const d = new Date(t); return `${d.getUTCDate()} ${MOIS[d.getUTCMonth()]}`; };

/* Monte un Chart en StrictMode ; rend le compte des commits, les erreurs, et de quoi le piloter. */
async function monter(Chart, props = {}) {
  const conteneur = win.document.createElement('div');
  win.document.body.appendChild(conteneur);
  const racine = createRoot(conteneur);
  const etat = { commits: 0, erreurs: [] };
  const consoleErreur = console.error;
  console.error = (...a) => { etat.erreurs.push(a.map(String).join(' ').slice(0, 200)); };
  const rendre = extra => h(StrictMode, null, h(Profiler, { id: 'chart', onRender: () => { etat.commits += 1; } },
    h(Chart, {
      points: POINTS, formatAt: jour, label: 'Courbe du MRR', summary: '84 € aujourd’hui.',
      /* des formateurs RECRÉÉS à chaque rendu du parent, comme les écrit une app */
      formatValue: v => `${v} €`, ...props, ...extra,
    })));
  try {
    await act(async () => { racine.render(rendre()); });
    await act(async () => { await new Promise(r => setTimeout(r, 0)); });
  } catch (e) {
    etat.erreurs.push(String(e && e.message || e));
  }
  return {
    etat, conteneur,
    rendre: async extra => { await act(async () => { racine.render(rendre(extra)); }); },
    vider: async () => { await act(async () => { await new Promise(r => setTimeout(r, 0)); }); },
    demonter: async () => { await act(async () => { racine.unmount(); }); console.error = consoleErreur; conteneur.remove(); },
    finir: () => { console.error = consoleErreur; },
  };
}

const svgLargeur = c => Number(c.querySelector('svg.ds-chart__svg')?.getAttribute('width') || 0);

test('le jumeau : le Chart de la 0.8.0 boucle dans ce banc (« Maximum update depth exceeded »)', async () => {
  const Ancien = await charger('tests/fixtures/Chart-0.8.0.tsx');
  LARGEUR = 964;
  const m = await monter(Ancien);
  m.finir();
  assert.ok(m.etat.erreurs.some(e => /Maximum update depth exceeded/.test(e)),
    `le banc ne reproduit plus le défaut de la 0.8.0 — il ne protège de rien (${m.etat.commits} commits, erreurs : ${m.etat.erreurs.slice(0, 2).join(' / ')})`);
  observateurs.clear();
});

test('Chart en mode strict : se stabilise au montage, après un changement de largeur et un nouveau rendu du parent', async t => {
  const Chart = await charger('src/components/data-display/Chart.tsx');
  LARGEUR = 964;
  const m = await monter(Chart);
  try {
    assert.deepEqual(m.etat.erreurs, [], 'aucune erreur au montage');
    assert.equal(svgLargeur(m.conteneur), 964, 'le graphique est dessiné à la largeur du conteneur');
    assert.ok(m.etat.commits <= 6, `montage : ${m.etat.commits} commits (borne 6)`);
    const auMontage = m.etat.commits;
    await m.vider();
    assert.equal(m.etat.commits, auMontage, 'au repos, plus aucun rendu');

    /* la largeur change : un redessin borné, puis le repos */
    await act(async () => { redimensionner(318); });
    await m.vider();
    assert.deepEqual(m.etat.erreurs, [], 'aucune erreur après un changement de largeur');
    assert.equal(svgLargeur(m.conteneur), 318, 'redessiné à la nouvelle largeur');
    assert.equal(m.conteneur.querySelectorAll('.ds-chart__xtick').length, 3, '3 dates à 318 de large, comme la maquette');
    const apresLargeur = m.etat.commits - auMontage;
    assert.ok(apresLargeur <= 5, `changement de largeur : ${apresLargeur} commits (borne 5)`);
    await m.vider();
    assert.equal(m.etat.commits - auMontage, apresLargeur, 'au repos après le changement de largeur');

    /* la même largeur annoncée de nouveau : aucun rendu */
    const avant = m.etat.commits;
    await act(async () => { redimensionner(318); });
    assert.equal(m.etat.commits, avant, 'une largeur inchangée ne provoque aucun rendu');

    /* le parent se redessine, formateurs recréés : borné, pas de boucle */
    await m.rendre({ formatValue: v => `${v} €` });
    await m.vider();
    assert.deepEqual(m.etat.erreurs, [], 'aucune erreur après un nouveau rendu du parent');
    assert.ok(m.etat.commits - avant <= 3, `nouveau rendu du parent : ${m.etat.commits - avant} commits (borne 3)`);
    t.diagnostic(`commits : montage ${auMontage}, changement de largeur ${apresLargeur}, nouveau rendu du parent ${m.etat.commits - avant}`);
  } finally {
    await m.demonter();
  }
  assert.equal(observateurs.size, 0, 'le ResizeObserver est débranché au démontage');
});

test('après démontage : un rappel tardif n’écrit rien, aucune erreur', async () => {
  const Chart = await charger('src/components/data-display/Chart.tsx');
  LARGEUR = 964;
  const m = await monter(Chart);
  const garde = [...observateurs];
  await m.demonter();
  const erreurs = [];
  const consoleErreur = console.error;
  console.error = (...a) => { erreurs.push(a.map(String).join(' ')); };
  try {
    await act(async () => { LARGEUR = 500; for (const o of garde) o.cb([], o); });
  } finally {
    console.error = consoleErreur;
  }
  assert.deepEqual(erreurs, [], 'un rappel après démontage ne déclenche ni mise à jour ni avertissement');
  assert.equal(observateurs.size, 0);
});
