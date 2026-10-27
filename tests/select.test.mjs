/* Le Select à liste Yunary (v0.12.0, décision D-010) monté en MODE STRICT de développement — React de
 * développement, StrictMode, happy-dom (le banc de chart-strict.test.mjs). Ce qui ne doit pas casser
 * chez les appelants : `onChange` reçoit un vrai événement du <select> natif (`e.target.value`), la ref
 * est ce <select>, le formulaire et l'autoremplissage passent par lui ; et le clavier du combobox
 * select-only (W3C APG). La position, le portail devant une Modal et le rendu se recettent dans un
 * vrai navigateur (la vitrine) : happy-dom ne fait pas de mise en page. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Window } from 'happy-dom';
import { build } from 'esbuild';

const win = new Window({ url: 'http://localhost/', width: 1440, height: 900 });
for (const k of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'SVGElement', 'getComputedStyle',
  'MutationObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'Event', 'KeyboardEvent', 'MouseEvent', 'PointerEvent', 'FocusEvent']) {
  Object.defineProperty(globalThis, k, { value: k === 'window' ? win : win[k], configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { act, StrictMode, createElement: h, useState, createRef } = React;

const sortie = path.resolve('node_modules/.cache/ds-tests/Select.mjs');
fs.mkdirSync(path.dirname(sortie), { recursive: true });
await build({
  entryPoints: ['src/components/forms/Select.tsx'], bundle: true, format: 'esm', platform: 'node', jsx: 'automatic',
  outfile: sortie, external: ['react', 'react-dom', 'react/jsx-runtime', 'tailwind-merge', 'lucide-react'], logLevel: 'silent',
});
const { Select } = await import(`${pathToFileURL(sortie).href}?v=${Date.now()}`);

const RESEAUX = [{ value: 'instagram', label: 'Instagram' }, { value: 'tiktok', label: 'TikTok' }, { value: 'youtube', label: 'YouTube' }];
const PAYS = ['Allemagne', 'Belgique', 'Espagne', 'Estonie', 'États-Unis', 'France', 'Suède', 'Suisse'].map((label, i) => ({ value: `P${i}`, label }));

/** Un parent qui tient la valeur, comme les appels du hub : `onChange={e => poser(e.target.value)}`. */
function Controle({ options, initiale, recus, ...props }) {
  const [v, setV] = useState(initiale);
  return h(Select, { ...props, options, value: v, onChange: e => { recus.push({ value: e.target.value, tag: e.target.tagName, type: e.type }); setV(e.target.value); } });
}

async function monter(element) {
  const conteneur = win.document.createElement('div');
  win.document.body.appendChild(conteneur);
  const racine = createRoot(conteneur);
  const erreurs = [];
  const consoleErreur = console.error;
  console.error = (...a) => { erreurs.push(a.map(String).join(' ').slice(0, 200)); };
  await act(async () => { racine.render(h(StrictMode, null, element)); });
  const champ = () => conteneur.querySelector('[role="combobox"]');
  const liste = () => win.document.querySelector('[role="listbox"]');
  const actif = () => { const id = champ().getAttribute('aria-activedescendant'); return id ? win.document.getElementById(id)?.textContent : null; };
  const touche = async (key, extra = {}) => {
    await act(async () => { champ().dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra })); });
  };
  const clic = async el => {
    await act(async () => {
      el.dispatchEvent(new win.PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new win.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
    });
  };
  return {
    conteneur, erreurs, champ, liste, actif, touche, clic,
    natif: () => conteneur.querySelector('select'),
    demonter: async () => { await act(async () => { racine.unmount(); }); console.error = consoleErreur; conteneur.remove(); },
  };
}

test('le champ : un combobox fermé, le <select> natif caché porte nom, autoremplissage et valeur', async () => {
  const ref = createRef();
  const m = await monter(h(Select, { ref, id: 'pays', name: 'country', autoComplete: 'country', options: PAYS, defaultValue: 'P5', 'aria-describedby': 'aide' }));
  try {
    const c = m.champ();
    assert.equal(c.tagName, 'BUTTON');
    assert.equal(c.getAttribute('type'), 'button');
    assert.equal(c.id, 'pays', 'l\'id va au champ visible : un <label htmlFor> le nomme');
    assert.equal(c.getAttribute('aria-expanded'), 'false');
    assert.equal(c.getAttribute('aria-haspopup'), 'listbox');
    assert.equal(c.getAttribute('aria-describedby'), 'aide');
    assert.equal(c.textContent, 'France');
    const s = m.natif();
    assert.equal(ref.current, s, 'la ref transmise est le <select> natif, comme avant');
    assert.equal(s.name, 'country');
    assert.equal(s.getAttribute('autocomplete'), 'country');
    assert.equal(s.getAttribute('aria-hidden'), 'true');
    assert.equal(s.getAttribute('tabindex'), '-1');
    assert.equal(s.value, 'P5');
    assert.equal(m.liste(), null, 'aucune liste tant qu\'elle est fermée');
    assert.deepEqual(m.erreurs, []);
  } finally { await m.demonter(); }
});

test('la souris : la liste s\'ouvre dans un portail, l\'option choisie cochée ; un clic choisit et onChange reçoit e.target.value', async () => {
  const recus = [];
  const m = await monter(h(Controle, { options: RESEAUX, initiale: 'instagram', recus, 'aria-label': 'Réseau' }));
  try {
    await m.clic(m.champ());
    const l = m.liste();
    assert.ok(l, 'ouverte');
    assert.equal(l.parentElement, win.document.body, 'posée par un portail dans le <body>');
    assert.ok(l.classList.contains('ds-dropdown') && l.classList.contains('ds-dropdown--liste'));
    assert.equal(l.getAttribute('aria-label'), 'Réseau');
    assert.equal(m.champ().getAttribute('aria-expanded'), 'true');
    assert.equal(m.champ().getAttribute('aria-controls'), l.id);
    const options = [...l.querySelectorAll('[role="option"]')];
    assert.deepEqual(options.map(o => o.getAttribute('aria-selected')), ['true', 'false', 'false']);
    assert.ok(options[0].classList.contains('is-checked'));
    assert.equal(options[0].querySelectorAll('.ds-dropdown__check').length, 1);
    await m.clic(options[1]);
    assert.deepEqual(recus, [{ value: 'tiktok', tag: 'SELECT', type: 'change' }]);
    assert.equal(m.liste(), null, 'fermée après le choix');
    assert.equal(m.champ().textContent, 'TikTok');
    assert.equal(m.natif().value, 'tiktok');
    assert.equal(win.document.activeElement, m.champ(), 'le focus revient au champ');
    /* choisir l'option déjà choisie ne déclenche rien, comme un <select> natif */
    await m.clic(m.champ());
    await m.clic(m.liste().querySelectorAll('[role="option"]')[1]);
    assert.equal(recus.length, 1);
    assert.deepEqual(m.erreurs, []);
  } finally { await m.demonter(); }
});

test('le clavier (APG) : ↓ ouvre, ↓ ↑ Début Fin déplacent, Entrée choisit, Échap ferme sans changer, Tab choisit', async () => {
  const recus = [];
  const m = await monter(h(Controle, { options: RESEAUX, initiale: 'tiktok', recus, 'aria-label': 'Réseau' }));
  try {
    m.champ().focus();
    await m.touche('ArrowDown');
    assert.ok(m.liste());
    assert.equal(m.actif(), 'TikTok', 'ouverte sur l\'option choisie');
    await m.touche('ArrowDown'); assert.equal(m.actif(), 'YouTube');
    await m.touche('ArrowDown'); assert.equal(m.actif(), 'YouTube', 'arrêt en bas');
    await m.touche('Home'); assert.equal(m.actif(), 'Instagram');
    await m.touche('ArrowUp'); assert.equal(m.actif(), 'Instagram', 'arrêt en haut');
    await m.touche('End'); assert.equal(m.actif(), 'YouTube');
    assert.ok(m.liste().querySelector('[role="option"].is-hover')?.textContent === 'YouTube', 'l\'option active est marquée');
    await m.touche('Escape');
    assert.equal(m.liste(), null);
    assert.deepEqual(recus, [], 'Échap ne change rien');
    await m.touche('Enter');
    assert.ok(m.liste(), 'Entrée ouvre');
    await m.touche('ArrowUp');
    await m.touche('Enter');
    assert.deepEqual(recus.map(r => r.value), ['instagram']);
    assert.equal(m.liste(), null);
    await m.touche(' ');
    assert.ok(m.liste(), 'Espace ouvre');
    await m.touche('End');
    await m.touche('Tab');
    assert.deepEqual(recus.map(r => r.value), ['instagram', 'youtube'], 'Tab choisit l\'option active');
    assert.equal(m.liste(), null);
    await m.touche('ArrowUp');
    assert.equal(m.actif(), 'YouTube', '↑ ouvre sans bouger');
    await m.touche('ArrowUp');
    await m.touche('ArrowUp', { altKey: true });
    assert.deepEqual(recus.map(r => r.value), ['instagram', 'youtube', 'tiktok'], 'Alt + ↑ choisit');
    assert.deepEqual(m.erreurs, []);
  } finally { await m.demonter(); }
});

test('les premières lettres : accents ignorés, la même lettre passe à la suivante, plusieurs lettres affinent', async () => {
  const recus = [];
  const m = await monter(h(Controle, { options: PAYS, initiale: 'P5', recus, 'aria-label': 'Pays' }));
  try {
    m.champ().focus();
    await m.touche('e');
    assert.ok(m.liste(), 'une lettre ouvre la liste');
    assert.equal(m.actif(), 'Espagne');
    await m.touche('e'); assert.equal(m.actif(), 'Estonie');
    await m.touche('e'); assert.equal(m.actif(), 'États-Unis', '« e » trouve « É »');
    await new Promise(r => setTimeout(r, 550));
    await m.touche('s');
    await m.touche('u');
    await m.touche('i');
    assert.equal(m.actif(), 'Suisse');
    await m.touche('Enter');
    assert.deepEqual(recus.map(r => r.value), ['P7']);
  } finally { await m.demonter(); }
});

test('sans valeur contrôlée : defaultValue, puis le champ suit le choix et l\'autoremplissage du <select>', async () => {
  const recus = [];
  const m = await monter(h(Select, { options: RESEAUX, defaultValue: 'youtube', 'aria-label': 'Réseau', onChange: e => recus.push(e.target.value) }));
  try {
    assert.equal(m.champ().textContent, 'YouTube');
    await m.clic(m.champ());
    await m.clic(m.liste().querySelectorAll('[role="option"]')[0]);
    assert.equal(m.champ().textContent, 'Instagram');
    /* l'autoremplissage d'un navigateur : la valeur posée sur le <select>, puis input et change */
    await act(async () => {
      const s = m.natif();
      s.value = 'tiktok';
      s.dispatchEvent(new win.Event('input', { bubbles: true }));
      s.dispatchEvent(new win.Event('change', { bubbles: true }));
    });
    assert.equal(m.champ().textContent, 'TikTok');
    assert.deepEqual(recus, ['instagram', 'tiktok']);
  } finally { await m.demonter(); }
});

test('désactivé : le champ et le <select> le sont, rien ne s\'ouvre', async () => {
  const m = await monter(h(Select, { options: RESEAUX, defaultValue: 'tiktok', disabled: true, 'aria-label': 'Réseau' }));
  try {
    assert.ok(m.champ().disabled);
    assert.ok(m.natif().disabled);
    await m.touche('ArrowDown');
    assert.equal(m.liste(), null);
  } finally { await m.demonter(); }
});

test('surface carte, erreur, classe de l\'appelant : sur le champ, comme avant', async () => {
  const m = await monter(h(Select, { options: RESEAUX, surface: 'card', invalid: true, className: 'is-focus', 'aria-label': 'Réseau' }));
  try {
    const c = m.champ();
    for (const k of ['ds-input', 'ds-select__trigger', 'ds-input--on-card', 'is-error', 'is-focus']) assert.ok(c.classList.contains(k), k);
    assert.equal(c.getAttribute('aria-invalid'), 'true');
    assert.equal(c.textContent, 'Instagram', 'sans valeur : la première option, comme un <select> natif');
  } finally { await m.demonter(); }
});
