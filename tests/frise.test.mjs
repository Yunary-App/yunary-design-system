/* La frise à jalons (v0.10.0) montée en MODE STRICT de développement — React de développement,
 * StrictMode, happy-dom, un <Profiler> qui compte les rendus validés. Le banc de chart-strict.test.mjs,
 * appliqué à Frise : aucune erreur, un rendu stable, et le balisage que les classes `.ds-frise*`
 * attendent (mcp-ui écrit le même à la main). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Window } from 'happy-dom';
import { build } from 'esbuild';

const win = new Window({ url: 'http://localhost/', width: 1440, height: 900 });
for (const k of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'SVGElement', 'getComputedStyle', 'MutationObserver', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  Object.defineProperty(globalThis, k, { value: k === 'window' ? win : win[k], configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { act, StrictMode, Profiler, createElement: h } = React;

const sortie = path.resolve('node_modules/.cache/ds-tests/Frise.mjs');
fs.mkdirSync(path.dirname(sortie), { recursive: true });
await build({
  entryPoints: ['src/components/data-display/Frise.tsx'], bundle: true, format: 'esm', platform: 'node', jsx: 'automatic',
  outfile: sortie, external: ['react', 'react-dom', 'react/jsx-runtime', 'tailwind-merge', 'lucide-react'], logLevel: 'silent',
});
const { Frise } = await import(`${pathToFileURL(sortie).href}?v=${Date.now()}`);

const glyphe = () => h('svg', { 'data-glyphe': '' });
const ESSAI = [
  { state: 'done', icon: glyphe(), date: '17/10', title: 'Essai commencé' },
  { state: 'current', icon: glyphe(), date: 'Aujourd’hui', title: 'Tout Yunary débloqué', amount: '0 €', text: 'Analyse, Script et Programmation.' },
  { tone: 'amber', icon: glyphe(), date: '24/10', title: 'Premier paiement', amount: '19 €' },
];

async function monter(props) {
  const conteneur = win.document.createElement('div');
  win.document.body.appendChild(conteneur);
  const racine = createRoot(conteneur);
  const etat = { commits: 0, erreurs: [] };
  const consoleErreur = console.error;
  console.error = (...a) => { etat.erreurs.push(a.map(String).join(' ').slice(0, 200)); };
  const rendre = p => h(StrictMode, null, h(Profiler, { id: 'frise', onRender: () => { etat.commits += 1; } }, h(Frise, p)));
  try {
    await act(async () => { racine.render(rendre(props)); });
  } catch (e) { etat.erreurs.push(String(e?.message || e)); }
  return {
    etat, conteneur,
    rendre: async p => { await act(async () => { racine.render(rendre(p)); }); },
    demonter: async () => { await act(async () => { racine.unmount(); }); console.error = consoleErreur; conteneur.remove(); },
  };
}

test('Frise verticale en mode strict : balisage, états, aucune erreur, un rendu par changement', async () => {
  const m = await monter({ steps: ESSAI, 'aria-label': 'Ton essai' });
  try {
    assert.deepEqual(m.etat.erreurs, []);
    assert.equal(m.etat.commits, 1, 'un seul rendu validé au montage');
    const ol = m.conteneur.querySelector('ol');
    assert.equal(ol.className, 'ds-frise');
    assert.equal(ol.getAttribute('aria-label'), 'Ton essai');
    const li = [...ol.querySelectorAll(':scope > li.ds-frise__step')];
    assert.equal(li.length, 3);
    assert.deepEqual(li.map(x => x.className), ['ds-frise__step is-done', 'ds-frise__step is-current', 'ds-frise__step']);
    assert.deepEqual(li.map(x => x.getAttribute('aria-current')), [null, 'step', null]);
    /* la pastille : succès pour le fait, aucun ton pour l'en-cours (le dégradé vient de la frise), le ton choisi sinon */
    assert.deepEqual(li.map(x => x.querySelector('.ds-frise__mark').className),
      ['ds-pastille ds-frise__mark ds-pastille--success', 'ds-pastille ds-frise__mark', 'ds-pastille ds-frise__mark ds-pastille--amber']);
    assert.ok(li.every(x => x.querySelector('.ds-frise__rail').getAttribute('aria-hidden') === 'true'), 'le rail est masqué aux lecteurs d’écran');
    assert.deepEqual(li.map(x => x.querySelector('.ds-frise__sr').textContent), ['Fait : ', 'En cours : ', 'À venir : ']);
    /* md : le montant sur sa propre ligne, le texte en paragraphe dans un <div> */
    assert.equal(li[1].querySelector('.ds-frise__body').tagName, 'DIV');
    assert.equal(li[1].querySelector('.ds-frise__title + .ds-frise__amount').textContent, '0 €');
    assert.equal(li[1].querySelector('p.ds-frise__text').textContent, 'Analyse, Script et Programmation.');
    assert.equal(li[0].querySelector('.ds-frise__amount'), null, 'pas de montant, pas de nœud');

    /* un nouveau rendu du parent aux mêmes données : un rendu, toujours aucune erreur */
    const avant = m.etat.commits;
    await m.rendre({ steps: ESSAI, 'aria-label': 'Ton essai' });
    assert.equal(m.etat.commits - avant, 1);
    assert.deepEqual(m.etat.erreurs, []);
  } finally {
    await m.demonter();
  }
});

test('Frise horizontale compacte sur plaque : classes, montant dans le titre, libellés d’état surchargés', async () => {
  const m = await monter({ steps: ESSAI, orientation: 'horizontal', size: 'sm', plaque: true, stateLabels: { done: 'Terminé' } });
  try {
    assert.deepEqual(m.etat.erreurs, []);
    const ol = m.conteneur.querySelector('ol');
    assert.equal(ol.className, 'ds-frise ds-frise--horizontal ds-frise--sm ds-frise--plaque');
    const titre = ol.querySelectorAll('.ds-frise__step')[2].querySelector('.ds-frise__title');
    assert.equal(titre.textContent, 'Premier paiement · 19 €', 'en sm, le montant suit le titre');
    assert.equal(titre.querySelector('.ds-frise__amount').textContent, '19 €');
    assert.equal(ol.querySelector('.ds-frise__sr').textContent, 'Terminé : ');
  } finally {
    await m.demonter();
  }
});
