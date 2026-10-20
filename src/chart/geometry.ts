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
 * L'ESCALIER : une valeur tient jusqu'au point suivant, puis la ligne monte ou descend à la verticale
 * (« H x V y ») — un MRR ou un nombre de clients change par marches, il ne glisse pas. Les
 * marches nulles ne sont pas écrites : le tracé d'une année jour par jour reste court.
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
}

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
  /** La ligne en escalier. Vide sans point. */
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

  /* ── la ligne en escalier, l'aire, le point final ── */
  let line = '';
  let area = '';
  let end: ChartGeometry['end'] = null;
  if (n > 0) {
    const x0 = n === 1 ? left : x(0);
    line = `M${r1(x0)} ${r1(y(valeurs[0]))}`;
    let prec = valeurs[0];
    let dernierX = r1(x0);
    for (let i = 1; i < n; i++) {
      if (valeurs[i] === prec) continue;
      dernierX = r1(x(i));
      line += ` H${dernierX} V${r1(y(valeurs[i]))}`;
      prec = valeurs[i];
    }
    const xFin = x(n - 1);
    /* la dernière marche court jusqu'au dernier point ; un point seul s'étale sur tout le tracé */
    if (dernierX !== r1(xFin)) line += ` H${r1(xFin)}`;
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
