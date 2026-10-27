/**
 * LA GÉOMÉTRIE D'UN GRAPHIQUE D'ÉVOLUTION — v0.8.0, maquette Admin Web (onglet Évolution).
 *
 * Une fonction PURE : ni React, ni DOM, ni format. Elle reçoit une série de points espacés
 * régulièrement (un par jour, par exemple), la taille du cadre en pixels CSS et deux fonctions de
 * format fournies par l'app ; elle rend les tracés SVG (grille, aire, ligne en ESCALIER), le point
 * final et la position des graduations. Le composant `Chart` la dessine ; elle est aussi exportée
 * par l'index, pour un écran qui pose les classes `.ds-chart*` sur son propre SVG. (Le sous-chemin
 * sans React de la 0.8.0, `@yunary/ds/chart-geometry`, est retiré en 0.11.0 : aucun consommateur.)
 *
 * L'ESCALIER (le tracé par défaut) : une valeur tient jusqu'au point suivant, puis la ligne monte ou
 * descend à la verticale (« H x V y ») — un MRR ou un nombre de clients change par marches, il ne
 * glisse pas. Les marches nulles ne sont pas écrites : le tracé d'une année jour par jour reste court.
 *
 * LA COURBE MONOTONE (`curve: 'monotone'`, v0.12.0, décision D-011) : une courbe arrondie qui passe par
 * CHAQUE point et ne dépasse jamais les valeurs réelles. Entre deux points, elle reste entre leurs deux
 * valeurs : aucune bosse au-dessus d'un palier, aucun creux en dessous, jamais sous zéro pour une série
 * positive. C'est une interpolation cubique monotone (Fritsch-Carlson, pentes de Steffen, celles de
 * `curveMonotoneX` de d3) : la pente en un point est nulle dès que la série y change de sens ou s'y
 * arrête (un palier), et bornée à deux fois la plus faible des deux pentes voisines ; aux extrémités,
 * la pente se déduit de la voisine. Les points de contrôle de chaque segment de Bézier restent entre
 * ses deux valeurs, la courbe aussi. Un palier (deux valeurs égales) est un segment droit : les
 * paliers successifs s'écrivent en un seul « H », comme les marches nulles de l'escalier. Deux points
 * se joignent d'un trait droit ; un point seul s'étale sur tout le tracé, comme en escalier. Aire,
 * point final et graduations ne changent pas : l'aire ferme sous la courbe comme sous l'escalier.
 *
 * LES GRADUATIONS EN VALEURS se calculent : le zéro est toujours dans le domaine, le pas est un
 * « joli » nombre (1, 2, 2,5, 4 ou 5 × 10ⁿ ; pas de 2,5 en `integer`), et il y a au plus une
 * graduation tous les `yTickGap` pixels de hauteur. Les maquettes : 0 → 80 € par 20 (260 de haut),
 * 0 → 8 par 4 (150 de haut, `integer`).
 *
 * LES GRADUATIONS EN DATES s'adaptent à la largeur : au plus `maxXTicks`, et deux étiquettes de
 * centre à centre jamais plus près que deux largeurs d'étiquette (`xLabelWidth`, mesurée par le
 * composant). La première et la dernière sont ramenées dans le cadre. 5 graduations à 984 de large,
 * 3 à 318 (les deux maquettes).
 */

export interface ChartPoint<T = unknown> {
  /** Ce qui situe le point (une date, un jour…) : l'app le formate en graduation. */
  at: T;
  /** La valeur, un nombre fini. */
  value: number;
}

export interface ChartPadding {
  /** La colonne des graduations en valeurs. */
  left: number;
  right: number;
  top: number;
  /** La bande des graduations en dates. */
  bottom: number;
}

export interface ChartGeometryInput<T = unknown> {
  /** Les points, dans l'ordre, espacés régulièrement. Vide : aucun tracé. */
  points: readonly ChartPoint<T>[];
  /** La largeur du cadre, en pixels CSS (celle du conteneur). */
  width: number;
  /** La hauteur du cadre, en pixels CSS. */
  height: number;
  /** Le format d'une graduation en valeur (« 80 € »), fourni par l'app. */
  formatValue: (value: number) => string;
  /** Le format d'une graduation en date (« 16 oct. »), fourni par l'app. */
  formatAt: (at: T) => string;
  /** Des graduations entières seulement (un nombre de clients). Défaut false. */
  integer?: boolean;
  /** Les marges du tracé. Défaut 40 / 8 / 8 / 26 (la maquette). */
  padding?: Partial<ChartPadding>;
  /** L'écart minimal entre deux graduations en valeurs, en pixels. Défaut 36. */
  yTickGap?: number;
  /** La largeur de la plus large étiquette de date, en pixels. Défaut 50. */
  xLabelWidth?: number;
  /** Le nombre maximal de graduations en dates. Défaut 5. */
  maxXTicks?: number;
  /** Le tracé : `step` (défaut) en escalier, `monotone` arrondi sans dépassement (v0.12.0). */
  curve?: ChartCurve;
}

/** Le tracé de la ligne : en escalier (défaut) ou arrondi monotone. */
export type ChartCurve = 'step' | 'monotone';

export interface ChartTick {
  /** La position : `y` pour une valeur, `x` pour une date (centre de l'étiquette). */
  pos: number;
  /** Le libellé formaté par l'app. */
  label: string;
}

export interface ChartGeometry {
  width: number;
  height: number;
  /** `0 0 width height` : une unité du SVG = un pixel CSS. */
  viewBox: string;
  /** Le rectangle du tracé. */
  plot: { left: number; top: number; right: number; bottom: number };
  /** Le domaine des valeurs, graduations comprises. */
  domain: { min: number; max: number };
  /** Les lignes de la grille, une par graduation en valeur. */
  grid: string;
  /** L'aire sous la ligne, fermée sur le zéro. Vide sans point. */
  area: string;
  /** La ligne, en escalier ou arrondie (`curve`). Vide sans point. */
  line: string;
  /** Le point final (la dernière valeur), ou null sans point. */
  end: { x: number; y: number } | null;
  /** Les graduations en valeurs, du bas vers le haut. */
  yTicks: ChartTick[];
  /** Les graduations en dates, de gauche à droite. */
  xTicks: ChartTick[];
}

export const CHART_PADDING: ChartPadding = { left: 40, right: 8, top: 8, bottom: 26 };

const r1 = (n: number): number => Math.round(n * 10) / 10;
const propre = (n: number): number => Number(n.toPrecision(12));

/**
 * Les pentes d'une interpolation cubique monotone en chaque point (x régulièrement espacés, pas `h`),
 * celles de Steffen (`curveMonotoneX` de d3). Nulle là où la série change de sens ou s'arrête, bornée
 * à deux fois la plus faible pente voisine ; aux extrémités, déduite de la voisine. Exportée pour les
 * tests.
 */
export function pentesMonotones(ys: readonly number[], h: number): number[] {
  const n = ys.length;
  if (n < 2 || !(h > 0)) return ys.map(() => 0);
  const s: number[] = [];
  for (let i = 0; i < n - 1; i++) s.push((ys[i + 1] - ys[i]) / h);
  const m = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const a = s[i - 1], b = s[i];
    m[i] = a * b <= 0 ? 0 : Math.sign(b) * Math.min(2 * Math.abs(a), 2 * Math.abs(b), Math.abs(a + b) / 2);
  }
  if (n === 2) { m[0] = s[0]; m[1] = s[0]; return m; }
  m[0] = (3 * s[0] - m[1]) / 2;
  m[n - 1] = (3 * s[n - 2] - m[n - 2]) / 2;
  return m;
}

/** La ligne arrondie monotone : un segment de Bézier par intervalle, les paliers en « H ». */
function ligneMonotone(xs: readonly number[], ys: readonly number[]): string {
  const n = xs.length;
  let d = `M${r1(xs[0])} ${r1(ys[0])}`;
  if (n === 2) return `${d} L${r1(xs[1])} ${r1(ys[1])}`;
  const h = xs[1] - xs[0];
  const m = pentesMonotones(ys, h);
  for (let i = 0; i < n - 1; i++) {
    const plat = ys[i + 1] === ys[i] && m[i] === 0 && m[i + 1] === 0;
    if (plat) {
      /* un palier : un trait droit, fusionné avec le palier qui le suit */
      if (i + 2 < n && ys[i + 2] === ys[i + 1] && m[i + 2] === 0) continue;
      d += ` H${r1(xs[i + 1])}`;
      continue;
    }
    const t = (xs[i + 1] - xs[i]) / 3;
    d += ` C${r1(xs[i] + t)} ${r1(ys[i] + t * m[i])} ${r1(xs[i + 1] - t)} ${r1(ys[i + 1] - t * m[i + 1])} ${r1(xs[i + 1])} ${r1(ys[i + 1])}`;
  }
  return d;
}

/** Le plus petit « joli » pas supérieur ou égal à `brut`. */
export function niceStep(brut: number, integer = false): number {
  if (!(brut > 0) || !Number.isFinite(brut)) return 1;
  const p = 10 ** Math.floor(Math.log10(brut));
  for (const m of [1, 2, 2.5, 4, 5, 10]) {
    const s = propre(m * p);
    if (integer && !Number.isInteger(s)) continue;
    if (s >= brut - 1e-9) return s;
  }
  return propre(10 * p);
}

export function chartGeometry<T>(input: ChartGeometryInput<T>): ChartGeometry {
  const width = Math.max(0, input.width);
  const height = Math.max(0, input.height);
  const pad: ChartPadding = { ...CHART_PADDING, ...input.padding };
  const integer = input.integer ?? false;
  const yTickGap = input.yTickGap ?? 36;
  const xLabelWidth = input.xLabelWidth ?? 50;
  const maxXTicks = Math.max(1, Math.floor(input.maxXTicks ?? 5));
  const curve: ChartCurve = input.curve ?? 'step';

  const left = pad.left, top = pad.top;
  const right = Math.max(left, width - pad.right);
  const bottom = Math.max(top, height - pad.bottom);
  const plotW = right - left, plotH = bottom - top;

  const valeurs = input.points.map(p => (Number.isFinite(p.value) ? p.value : 0));
  const n = valeurs.length;

  /* ── le domaine et les graduations en valeurs ── */
  let lo = Math.min(0, ...valeurs);
  let hi = Math.max(0, ...valeurs);
  const plat = hi === lo; /* une série toute à zéro, ou aucun point */
  if (plat) hi = lo + 1;
  const pasMax = plat ? 1 : Math.max(1, Math.floor(plotH / yTickGap));
  const pas = niceStep((hi - lo) / pasMax, integer);
  lo = propre(Math.floor(propre(lo / pas)) * pas);
  hi = propre(Math.ceil(propre(hi / pas)) * pas);
  if (hi === lo) hi = propre(lo + pas);

  const y = (v: number): number => top + (plotH * (hi - v)) / (hi - lo);
  const x = (i: number): number => (n <= 1 ? right : left + (i * plotW) / (n - 1));

  const yTicks: ChartTick[] = [];
  const grid: string[] = [];
  const nPas = Math.round((hi - lo) / pas);
  for (let k = 0; k <= nPas; k++) {
    const v = propre(lo + k * pas);
    const yy = r1(y(v));
    yTicks.push({ pos: yy, label: input.formatValue(v) });
    grid.push(`M${r1(left)} ${yy} H${r1(right)}`);
  }

  /* ── la ligne (en escalier ou monotone), l'aire, le point final ── */
  let line = '';
  let area = '';
  let end: ChartGeometry['end'] = null;
  if (n > 0) {
    const x0 = n === 1 ? left : x(0);
    const xFin = x(n - 1);
    if (curve === 'monotone' && n > 1) {
      line = ligneMonotone(valeurs.map((_, i) => x(i)), valeurs.map(v => y(v)));
    } else {
      line = `M${r1(x0)} ${r1(y(valeurs[0]))}`;
      let prec = valeurs[0];
      let dernierX = r1(x0);
      for (let i = 1; i < n; i++) {
        if (valeurs[i] === prec) continue;
        dernierX = r1(x(i));
        line += ` H${dernierX} V${r1(y(valeurs[i]))}`;
        prec = valeurs[i];
      }
      /* la dernière marche court jusqu'au dernier point ; un point seul s'étale sur tout le tracé */
      if (dernierX !== r1(xFin)) line += ` H${r1(xFin)}`;
    }
    area = `${line} V${r1(y(Math.min(Math.max(0, lo), hi)))} H${r1(x0)} Z`;
    end = { x: r1(xFin), y: r1(y(valeurs[n - 1])) };
  }

  /* ── les graduations en dates ── */
  const xTicks: ChartTick[] = [];
  if (n > 0 && plotW > 0) {
    const place = Math.floor(plotW / Math.max(1, 2 * xLabelWidth)) + 1;
    const nombre = Math.max(1, Math.min(maxXTicks, n, place));
    const indices: number[] = [];
    if (nombre === 1) indices.push(n - 1);
    else for (let k = 0; k < nombre; k++) {
      const i = Math.round((k * (n - 1)) / (nombre - 1));
      if (!indices.includes(i)) indices.push(i);
    }
    const demi = xLabelWidth / 2;
    const gauche = Math.min(left + demi, width / 2), droite = Math.max(width - demi, width / 2);
    for (const i of indices) {
      const pos = Math.round(Math.min(Math.max(x(i), gauche), droite));
      xTicks.push({ pos, label: input.formatAt(input.points[i].at) });
    }
  }

  return {
    width, height, viewBox: `0 0 ${width} ${height}`,
    plot: { left: r1(left), top: r1(top), right: r1(right), bottom: r1(bottom) },
    domain: { min: lo, max: hi },
    grid: grid.join(' '), area, line, end, yTicks, xTicks,
  };
}
