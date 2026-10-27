/* Les tests de la géométrie du graphique (v0.8.0). `node --test tests/` — Node lit le TypeScript
   de src/chart/geometry.ts directement (fichier sans import ni syntaxe non effaçable).
   Le cas de référence REJOUE l'algorithme de la maquette Admin Web (onglet Évolution) sur ses
   propres données, et compare. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chartGeometry, niceStep, CHART_PADDING } from '../src/chart/geometry.ts';

/* ── les données et l'algorithme de la maquette (resources/screens/Yunary Admin Web.dc.html) ── */
const DAY = 86400000;
const D = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const LAUNCH = D('2026-07-01'), TODAY = D('2026-10-16');
const CLIENTS = [
  { amount: 14, since: '2026-07-03' }, { amount: 6, since: '2026-07-19' }, { amount: 14, since: '2026-08-08' },
  { amount: 8, since: '2026-08-27' }, { amount: 14, since: '2026-09-21' }, { amount: 6, since: '2026-10-02' },
  { amount: 8, since: '2026-10-11' },
];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const fmtJour = t => { const d = new Date(t); const n = d.getUTCDate(); return `${n === 1 ? '1er' : n} ${MONTHS[d.getUTCMonth()]}`; };

function serie(kind) {
  const n = Math.round((TODAY - LAUNCH) / DAY) + 1, out = [];
  for (let i = 0; i < n; i++) {
    const t = LAUNCH + i * DAY, on = CLIENTS.filter(c => D(c.since) <= t);
    out.push({ at: t, value: kind === 'mrr' ? on.reduce((a, c) => a + c.amount, 0) : on.length });
  }
  return out;
}

function maquette(points, W, H, kind) {
  const n = points.length, vals = points.map(p => p.value);
  const L = 40, R = 8, T = 8, B = 26;
  const max = kind === 'mrr' ? 80 : 8, steps = kind === 'mrr' ? 4 : 2;
  const x = i => L + (n === 1 ? 0 : i * (W - L - R) / (n - 1));
  const y = v => T + (H - T - B) * (1 - v / max);
  let line = `M${x(0).toFixed(1)} ${y(vals[0]).toFixed(1)}`;
  for (let i = 1; i < n; i++) line += ` H${x(i).toFixed(1)} V${y(vals[i]).toFixed(1)}`;
  const yt = [];
  for (let s = 0; s <= steps; s++) { const v = max * s / steps; yt.push({ y: Math.round(y(v)), v }); }
  const nt = W < 400 ? 3 : 5, xt = [];
  for (let k = 0; k < nt; k++) { const i = Math.round(k * (n - 1) / (nt - 1)); xt.push({ x: Math.round(x(i)), label: fmtJour(points[i].at) }); }
  xt[0].x = Math.max(xt[0].x, L + 22);
  xt[nt - 1].x = Math.min(xt[nt - 1].x, W - 26);
  return { line, yt, xt, ex: +x(n - 1).toFixed(1), ey: +y(vals[n - 1]).toFixed(1) };
}

/* Un tracé M/H/V → la suite de ses sommets, sans doublon ni point aligné : deux escaliers qui
   dessinent la même forme ont les mêmes sommets, quelle que soit leur écriture. */
function sommets(d) {
  const pts = []; let cx = 0, cy = 0;
  for (const [, c, a, b] of d.matchAll(/([MHVZ])\s*(-?[\d.]+)?\s*(-?[\d.]+)?/g)) {
    if (c === 'M') { cx = +a; cy = +b; } else if (c === 'H') cx = +a; else if (c === 'V') cy = +a; else continue;
    pts.push([cx, cy]);
  }
  const net = pts.filter((p, i) => i === 0 || Math.abs(p[0] - pts[i - 1][0]) > 0.05 || Math.abs(p[1] - pts[i - 1][1]) > 0.05);
  return net.filter((p, i) => {
    if (i === 0 || i === net.length - 1) return true;
    const a = net[i - 1], c = net[i + 1];
    return !((Math.abs(a[0] - p[0]) < 0.05 && Math.abs(c[0] - p[0]) < 0.05) || (Math.abs(a[1] - p[1]) < 0.05 && Math.abs(c[1] - p[1]) < 0.05));
  });
}
const proches = (a, b, tol) => a.length === b.length && a.every((p, i) => Math.abs(p[0] - b[i][0]) <= tol && Math.abs(p[1] - b[i][1]) <= tol);

const euros = v => `${v} €`;
const nombre = v => `${v}`;

/* ── la référence : les quatre graphiques de la maquette ── */
for (const [nom, W, H, kind] of [['MRR ordinateur', 984, 260, 'mrr'], ['clients ordinateur', 984, 150, 'cli'], ['MRR mobile', 318, 180, 'mrr'], ['clients mobile', 318, 120, 'cli']]) {
  test(`maquette — ${nom} (${W} × ${H})`, () => {
    const points = serie(kind);
    const ref = maquette(points, W, H, kind);
    const g = chartGeometry({ points, width: W, height: H, formatValue: kind === 'mrr' ? euros : nombre, formatAt: fmtJour, integer: kind === 'cli', xLabelWidth: 48 });
    /* les graduations en valeurs : mêmes valeurs, mêmes hauteurs (la maquette arrondit au pixel) */
    assert.deepEqual(g.yTicks.map(t => t.label), ref.yt.map(t => (kind === 'mrr' ? euros : nombre)(t.v)));
    g.yTicks.forEach((t, i) => assert.ok(Math.abs(t.pos - ref.yt[i].y) <= 0.5, `graduation ${t.label} : ${t.pos} ≠ ${ref.yt[i].y}`));
    /* la ligne en escalier : la même forme */
    assert.ok(proches(sommets(g.line), sommets(ref.line), 0.15), 'la ligne en escalier diffère de la maquette');
    /* le point final */
    assert.deepEqual([g.end.x, g.end.y], [ref.ex, ref.ey]);
    /* les graduations en dates : mêmes jours, mêmes places (les deux extrêmes à 4 px près : la maquette les ramène à 22 et 26) */
    assert.deepEqual(g.xTicks.map(t => t.label), ref.xt.map(t => t.label));
    g.xTicks.forEach((t, i) => {
      const tol = i === 0 || i === g.xTicks.length - 1 ? 4 : 0.5;
      assert.ok(Math.abs(t.pos - ref.xt[i].x) <= tol, `date ${t.label} : ${t.pos} ≠ ${ref.xt[i].x}`);
    });
    /* l'aire ferme la ligne sur le zéro */
    assert.match(g.area, new RegExp(`V${g.plot.bottom} H${g.plot.left} Z$`));
  });
}

/* ── les cas limites ── */
test('un seul point : la valeur s\'étale sur tout le tracé, le point final à droite, une date', () => {
  const g = chartGeometry({ points: [{ at: TODAY, value: 72 }], width: 600, height: 260, formatValue: euros, formatAt: fmtJour });
  assert.equal(g.line, `M${g.plot.left} ${g.end.y} H${g.plot.right}`);
  assert.deepEqual(g.end, { x: g.plot.right, y: g.end.y });
  assert.equal(g.xTicks.length, 1);
  assert.equal(g.xTicks[0].label, '16 oct.');
  assert.ok(g.end.y > g.plot.top && g.end.y < g.plot.bottom);
});

test('une série toute à zéro : la ligne sur le zéro, deux graduations 0 et 1', () => {
  const points = serie('mrr').map(p => ({ ...p, value: 0 }));
  const g = chartGeometry({ points, width: 984, height: 260, formatValue: euros, formatAt: fmtJour });
  assert.deepEqual(g.domain, { min: 0, max: 1 });
  assert.deepEqual(g.yTicks.map(t => t.label), ['0 €', '1 €']);
  assert.equal(g.line, `M${g.plot.left} ${g.plot.bottom} H${g.plot.right}`);
  assert.equal(g.end.y, g.plot.bottom);
});

test('des valeurs qui ne bougent pas : un seul segment, plat, sous la graduation du haut', () => {
  const points = serie('mrr').map(p => ({ ...p, value: 14 }));
  const g = chartGeometry({ points, width: 984, height: 260, formatValue: euros, formatAt: fmtJour });
  assert.match(g.line, /^M[\d.]+ [\d.]+ H[\d.]+$/);
  assert.ok(g.domain.max >= 14 && g.domain.min === 0);
  assert.ok(g.end.y >= g.plot.top);
});

test('une année jour par jour : tracé compact, graduations sans chevauchement à 390 et à 1440', () => {
  const points = [];
  let v = 0;
  for (let i = 0; i < 365; i++) { if (i % 9 === 0) v += (i % 4) * 6; points.push({ at: LAUNCH + i * DAY, value: v }); }
  for (const W of [318, 1300]) { /* 318 : la largeur du graphique de la maquette à 390 */
    const g = chartGeometry({ points, width: W, height: 180, formatValue: euros, formatAt: fmtJour, xLabelWidth: 48 });
    const marches = (g.line.match(/V/g) || []).length;
    assert.ok(marches <= 41, `trop de marches écrites : ${marches}`);
    assert.ok(g.xTicks.length <= (W < 400 ? 3 : 5));
    for (let i = 1; i < g.xTicks.length; i++) assert.ok(g.xTicks[i].pos - g.xTicks[i - 1].pos >= 48, `dates qui se chevauchent à ${W}`);
  }
});

test('aucun chevauchement des dates, de 280 à 1400 px de large', () => {
  const points = serie('mrr');
  for (let W = 280; W <= 1400; W += 37) {
    for (const w of [40, 56, 72]) {
      const g = chartGeometry({ points, width: W, height: 180, formatValue: euros, formatAt: fmtJour, xLabelWidth: w });
      assert.ok(g.xTicks.length >= 1);
      g.xTicks.forEach(t => assert.ok(t.pos - w / 2 >= 0 && t.pos + w / 2 <= W, `étiquette hors cadre à ${W}`));
      for (let i = 1; i < g.xTicks.length; i++) assert.ok(g.xTicks[i].pos - g.xTicks[i - 1].pos >= w, `chevauchement à ${W} (${w})`);
    }
  }
});

test('aucun point, ou un cadre de largeur nulle : rien à tracer, aucune erreur', () => {
  const vide = chartGeometry({ points: [], width: 600, height: 260, formatValue: euros, formatAt: fmtJour });
  assert.equal(vide.line, ''); assert.equal(vide.area, ''); assert.equal(vide.end, null); assert.deepEqual(vide.xTicks, []);
  const nul = chartGeometry({ points: serie('mrr'), width: 0, height: 0, formatValue: euros, formatAt: fmtJour });
  assert.deepEqual(nul.xTicks, []);
});

test('des valeurs négatives : le zéro reste dans le domaine, l\'aire ferme sur lui', () => {
  const points = [-12, -4, 6, 18].map((value, i) => ({ at: i, value }));
  const g = chartGeometry({ points, width: 600, height: 260, formatValue: nombre, formatAt: String });
  assert.ok(g.domain.min <= -12 && g.domain.max >= 18);
  const zero = g.yTicks.find(t => t.label === '0');
  assert.ok(zero, 'le zéro est une graduation');
  assert.match(g.area, new RegExp(`V${zero.pos} H${g.plot.left} Z$`));
});

test('les marges par défaut sont celles de la maquette', () => {
  assert.deepEqual(CHART_PADDING, { left: 40, right: 8, top: 8, bottom: 26 });
});

test('le joli pas', () => {
  assert.equal(niceStep(12), 20);
  assert.equal(niceStep(18), 20);
  assert.equal(niceStep(7 / 3), 2.5);
  assert.equal(niceStep(7 / 3, true), 4);
  assert.equal(niceStep(0.17), 0.2);
  assert.equal(niceStep(0.17, true), 1);
  assert.equal(niceStep(240), 250);
  assert.equal(niceStep(240, true), 250);
  assert.equal(niceStep(0), 1);
});

/* ── la courbe monotone (v0.12.0, décision D-011) ── */
import { pentesMonotones } from '../src/chart/geometry.ts';

/** Les segments d'un tracé « M … C … H … L … » : chacun avec ses deux extrémités et ses points de contrôle. */
function segments(d) {
  const jetons = d.match(/[MCHL]|-?[\d.]+/g);
  const out = [];
  let x = 0, y = 0;
  for (let i = 0; i < jetons.length;) {
    const c = jetons[i++];
    const nb = () => Number(jetons[i++]);
    if (c === 'M') { x = nb(); y = nb(); }
    else if (c === 'H') { const x1 = nb(); out.push({ a: [x, y], b: [x1, y], ctrl: [] }); x = x1; }
    else if (c === 'L') { const x1 = nb(), y1 = nb(); out.push({ a: [x, y], b: [x1, y1], ctrl: [] }); x = x1; y = y1; }
    else if (c === 'C') { const c1 = [nb(), nb()], c2 = [nb(), nb()], b = [nb(), nb()]; out.push({ a: [x, y], b, ctrl: [c1, c2] }); [x, y] = b; }
  }
  return out;
}
const bezier = (s, t) => {
  const [p0, p1, p2, p3] = [s.a, ...(s.ctrl.length ? s.ctrl : [s.a, s.b]), s.b];
  const u = 1 - t;
  return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
};

const CAS_MONOTONES = {
  maquette: serie('mrr').map(p => p.value),
  clients: serie('clients').map(p => p.value),
  'pic puis creux': [0, 0, 14, 20, 20, 6, 6, 30, 2, 0, 0, 9],
  'zéro, un saut, zéro': [0, 0, 0, 80, 0, 0, 0],
  'en dents de scie': [5, 40, 5, 40, 5, 40, 5],
};

for (const [nom, valeurs] of Object.entries(CAS_MONOTONES)) {
  test(`monotone (${nom}) : passe par chaque point, jamais au-delà de ses deux voisins, jamais sous zéro`, () => {
    const points = valeurs.map((value, i) => ({ at: LAUNCH + i * DAY, value }));
    for (const W of [318, 984]) {
      const g = chartGeometry({ points, width: W, height: 260, formatValue: euros, formatAt: fmtJour, curve: 'monotone' });
      const n = valeurs.length;
      const xs = valeurs.map((_, i) => g.plot.left + (i * (g.plot.right - g.plot.left)) / (n - 1));
      const zero = g.yTicks.find(t => t.label === '0 €').pos;
      const segs = segments(g.line);
      /* chaque point du tracé, à 0,1 px (l'arrondi d'écriture) */
      const sommets = [segs[0].a, ...segs.map(s => s.b)];
      for (const [i, v] of valeurs.entries()) {
        const yy = g.plot.top + ((g.plot.bottom - g.plot.top) * (g.domain.max - v)) / (g.domain.max - g.domain.min);
        const s = sommets.find(p => Math.abs(p[0] - xs[i]) < 0.06);
        if (!s) { /* un point au milieu d'un palier fusionné : il est sur le trait droit */
          const seg = segs.find(sg => sg.ctrl.length === 0 && sg.a[0] <= xs[i] && xs[i] <= sg.b[0]);
          assert.ok(seg, `point ${i} absent du tracé à ${W}`);
          assert.ok(Math.abs(seg.a[1] - yy) <= 0.06, `palier ${i} hors de sa valeur`);
          continue;
        }
        assert.ok(Math.abs(s[1] - yy) <= 0.06, `point ${i} : ${s[1]} au lieu de ${yy} à ${W}`);
      }
      /* entre deux points, la courbe reste entre leurs deux valeurs : ni bosse ni creux */
      for (const s of segs) {
        const lo = Math.min(s.a[1], s.b[1]), hi = Math.max(s.a[1], s.b[1]);
        for (const c of s.ctrl) assert.ok(c[1] >= lo - 1e-9 && c[1] <= hi + 1e-9, `contrôle hors de [${lo}, ${hi}] : ${c[1]}`);
        for (let t = 0; t <= 1; t += 0.05) {
          const [bx, by] = bezier(s, t);
          assert.ok(by >= lo - 1e-9 && by <= hi + 1e-9, `bosse à x=${bx} : ${by} hors de [${lo}, ${hi}]`);
          assert.ok(by <= zero + 1e-9, `sous zéro à x=${bx}`);
        }
      }
      /* l'aire ferme sous la même ligne, le point final est le dernier point */
      assert.ok(g.area.startsWith(g.line));
      assert.match(g.area, new RegExp(`V${zero} H${g.plot.left} Z$`));
      assert.deepEqual(g.end, { x: g.plot.right, y: sommets.at(-1)[1] });
    }
  });
}

test('monotone : mêmes domaine, graduations et point final que l\'escalier', () => {
  const points = serie('mrr');
  const esc = chartGeometry({ points, width: 984, height: 260, formatValue: euros, formatAt: fmtJour });
  const mon = chartGeometry({ points, width: 984, height: 260, formatValue: euros, formatAt: fmtJour, curve: 'monotone' });
  assert.deepEqual(mon.domain, esc.domain);
  assert.deepEqual(mon.yTicks, esc.yTicks);
  assert.deepEqual(mon.xTicks, esc.xTicks);
  assert.deepEqual(mon.end, esc.end);
  assert.equal(mon.grid, esc.grid);
  assert.notEqual(mon.line, esc.line);
  assert.match(mon.line, / C/);
});

test('l\'escalier reste le tracé par défaut', () => {
  const points = serie('mrr');
  const defaut = chartGeometry({ points, width: 984, height: 260, formatValue: euros, formatAt: fmtJour });
  const step = chartGeometry({ points, width: 984, height: 260, formatValue: euros, formatAt: fmtJour, curve: 'step' });
  assert.equal(defaut.line, step.line);
  assert.doesNotMatch(defaut.line, /C/);
});

test('monotone : les paliers sont des traits droits fusionnés, une année reste courte', () => {
  const points = [];
  let v = 0;
  for (let i = 0; i < 365; i++) { if (i % 9 === 0) v += (i % 4) * 6; points.push({ at: LAUNCH + i * DAY, value: v }); }
  const g = chartGeometry({ points, width: 1300, height: 180, formatValue: euros, formatAt: fmtJour, curve: 'monotone' });
  const courbes = (g.line.match(/C/g) || []).length;
  const traits = (g.line.match(/H/g) || []).length;
  assert.ok(courbes <= 2 * 41, `trop de segments courbes : ${courbes}`);
  assert.ok(traits <= 41, `paliers non fusionnés : ${traits}`);
});

test('monotone : un point s\'étale, deux points se joignent d\'un trait, une série plate reste plate', () => {
  const un = chartGeometry({ points: [{ at: TODAY, value: 72 }], width: 600, height: 260, formatValue: euros, formatAt: fmtJour, curve: 'monotone' });
  assert.equal(un.line, `M${un.plot.left} ${un.end.y} H${un.plot.right}`);
  const deux = chartGeometry({ points: [{ at: 0, value: 10 }, { at: 1, value: 30 }], width: 600, height: 260, formatValue: euros, formatAt: String, curve: 'monotone' });
  assert.match(deux.line, /^M[\d.]+ [\d.]+ L[\d.]+ [\d.]+$/);
  const plate = chartGeometry({ points: serie('mrr').map(p => ({ ...p, value: 14 })), width: 984, height: 260, formatValue: euros, formatAt: fmtJour, curve: 'monotone' });
  assert.match(plate.line, /^M[\d.]+ [\d.]+ H[\d.]+$/);
});

test('les pentes monotones : nulles aux paliers et aux changements de sens, bornées ailleurs', () => {
  assert.deepEqual(pentesMonotones([0, 0, 0], 1), [0, 0, 0]);
  const m = pentesMonotones([0, 10, 0, 10], 1);
  assert.equal(m[1], 0); assert.equal(m[2], 0);
  const r = pentesMonotones([0, 1, 10, 11], 1);
  assert.ok(r[1] > 0 && r[1] <= 2 * 1);
  assert.ok(r[2] > 0 && r[2] <= 2 * 1);
});
