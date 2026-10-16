/* FIXTURE — le Chart de la 0.8.0, TEL QUEL (seuls les chemins d'import changent). Il boucle en mode strict de
   développement ; tests/chart-strict.test.mjs exige qu'il boucle dans le banc : un banc qui ne reproduit plus
   le défaut ne prouve rien. Ne pas corriger ce fichier. */
import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../../src/lib/cn';
import { chartGeometry, CHART_PADDING } from '../../src/chart/geometry';
import type { ChartPoint } from '../../src/chart/geometry';

/**
 * Le graphique d'évolution — v0.8.0, maquette Admin Web (onglet Évolution), fait maison, sans
 * librairie. Une courbe par graphique : grille, aire, ligne en escalier, point final, graduations en
 * valeurs à gauche et en dates en bas. La géométrie vient de `chartGeometry` (pure, exportée seule
 * par `@yunary/ds/chart-geometry`) ; l'apparence, des classes `.ds-chart*`.
 *
 * LA LARGEUR est celle du conteneur : le composant l'observe (ResizeObserver) et se redessine quand
 * elle change. La hauteur est une taille (`md` 260 / 180, `sm` 150 / 120 sous 64 rem). Il MESURE ses
 * propres étiquettes : la colonne des valeurs fait au moins 40 et s'élargit pour la plus longue (+ 10), la bande des
 * dates leur hauteur (+ 11), et le nombre de dates s'adapte pour qu'elles ne se touchent jamais.
 *
 * LE DS NE FORMATE RIEN : `formatValue` et `formatAt` viennent de l'app, comme `label` (aria-label)
 * et `summary` (la phrase lue par un lecteur d'écran : « 72 € aujourd'hui, +72 € sur 30 jours »).
 * Pas d'infobulle ni de survol dans cette version.
 */
export interface ChartProps<T = unknown> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Les points, dans l'ordre, espacés régulièrement (un par jour). */
  points: readonly ChartPoint<T>[];
  /** Le format d'une graduation en valeur (« 80 € »). */
  formatValue: (value: number) => string;
  /** Le format d'une graduation en date (« 16 oct. »). */
  formatAt: (at: T) => string;
  /** Le nom du graphique pour un lecteur d'écran (« Courbe du MRR »). */
  label: string;
  /** La phrase de résumé, lue par un lecteur d'écran, masquée à l'œil. */
  summary: ReactNode;
  /** `primary` (défaut) : la courbe de marque, trait 2,5 ; `ink` : à l'encre, trait 2. */
  tone?: 'primary' | 'ink';
  /** L'aire sous la ligne. Défaut : oui en `primary`, non en `ink` (la maquette). */
  area?: boolean;
  /** `md` 260 (180 sous 64 rem, défaut) · `sm` 150 (120). */
  size?: 'md' | 'sm';
  /** Des graduations entières seulement (un nombre de clients). */
  integer?: boolean;
  /** Le nombre maximal de dates. Défaut 5. */
  maxXTicks?: number;
  /** Chargement : un squelette aux dimensions finales. */
  loading?: boolean;
}

interface Mesures { w: number; h: number; yLabel: number; xLabel: number; xLabelH: number }

export function Chart<T = unknown>({
  points, formatValue, formatAt, label, summary, tone = 'primary', area, size = 'md', integer = false,
  maxXTicks, loading = false, className = '', ...rest
}: ChartProps<T>): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const resumeId = useId();
  const [m, setM] = useState<Mesures>({ w: 0, h: 0, yLabel: 0, xLabel: 0, xLabelH: 0 });

  /* La taille du conteneur, puis à chaque changement. */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const lire = () => {
      const r = el.getBoundingClientRect();
      setM(p => (Math.abs(p.w - r.width) < 0.5 && Math.abs(p.h - r.height) < 0.5 ? p : { ...p, w: r.width, h: r.height }));
    };
    lire();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(lire);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = m.w > 0 && m.h > 0 && !loading
    ? chartGeometry({
      points, width: m.w, height: m.h, formatValue, formatAt, integer, maxXTicks,
      padding: {
        /* au moins la colonne de la maquette (40) : deux graphiques empilés gardent leurs tracés alignés */
        left: Math.max(CHART_PADDING.left, Math.ceil(m.yLabel) + 10),
        bottom: m.xLabelH ? Math.ceil(m.xLabelH) + 11 : CHART_PADDING.bottom,
      },
      xLabelWidth: m.xLabel || undefined,
    })
    : null;

  /* Les étiquettes rendues : leur plus grande largeur et hauteur ajustent les marges. */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !geo) return;
    const max = (sel: string, k: 'width' | 'height') =>
      Math.max(0, ...Array.from(el.querySelectorAll<HTMLElement>(sel), n => n.getBoundingClientRect()[k]));
    const yLabel = max('.ds-chart__ytick', 'width');
    const xLabel = max('.ds-chart__xtick', 'width');
    const xLabelH = max('.ds-chart__xtick', 'height');
    setM(p => (Math.abs(p.yLabel - yLabel) < 1 && Math.abs(p.xLabel - xLabel) < 1 && Math.abs(p.xLabelH - xLabelH) < 1
      ? p : { ...p, yLabel, xLabel: Math.max(xLabel, p.xLabel * 0.9), xLabelH }));
  });

  const aire = area ?? tone === 'primary';

  return (
    <div
      ref={ref}
      className={cn('ds-chart', size === 'sm' && 'ds-chart--sm', tone === 'ink' && 'ds-chart--ink', className)}
      role="img"
      aria-label={label}
      aria-describedby={resumeId}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="ds-skel ds-chart__skel" aria-hidden="true" /> : null}
      {geo ? (
        <>
          <svg className="ds-chart__svg" width={geo.width} height={geo.height} viewBox={geo.viewBox} aria-hidden="true" focusable="false">
            <path className="ds-chart__grid" d={geo.grid} />
            {aire && geo.area ? <path className="ds-chart__area" d={geo.area} /> : null}
            {geo.line ? <path className="ds-chart__line" d={geo.line} /> : null}
            {geo.end ? <circle className="ds-chart__dot" cx={geo.end.x} cy={geo.end.y} r={tone === 'ink' ? 4 : 4.5} /> : null}
          </svg>
          {geo.yTicks.map((t, i) => <span key={`y${i}`} className="ds-chart__ytick" style={{ top: t.pos }}>{t.label}</span>)}
          {geo.xTicks.map((t, i) => <span key={`x${i}`} className="ds-chart__xtick" style={{ left: t.pos }}>{t.label}</span>)}
        </>
      ) : null}
      <span id={resumeId} className="ds-chart__summary">{summary}</span>
    </div>
  );
}
