import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { chartGeometry, CHART_PADDING } from '../../chart/geometry';
import type { ChartCurve, ChartPoint } from '../../chart/geometry';

/**
 * Le graphique d'évolution — v0.8.0, maquette Admin Web (onglet Évolution), fait maison, sans
 * librairie. Une courbe par graphique : grille, aire, ligne, point final, graduations en valeurs à
 * gauche et en dates en bas. La ligne est en escalier par défaut ; `curve="monotone"` (v0.12.0,
 * décision D-011) l'arrondit sans jamais dépasser les valeurs réelles (voir `chartGeometry`). La
 * géométrie vient de `chartGeometry` (pure, exportée par l'index) ; l'apparence, des classes
 * `.ds-chart*`.
 *
 * LA LARGEUR est celle du conteneur : le composant l'observe (ResizeObserver) et se redessine quand
 * elle change. La hauteur est une taille (`md` 260 / 180, `sm` 150 / 120 sous 64 rem). Il MESURE ses
 * propres étiquettes : la colonne des valeurs fait au moins 40 et s'élargit pour la plus longue (+ 10), la bande des
 * dates leur hauteur (+ 11), et le nombre de dates s'adapte pour qu'elles ne se touchent jamais.
 *
 * v0.8.1 — STABLE EN MODE STRICT : chaque état n'est écrit que s'il change, les effets ont des
 * dépendances explicites, rien n'est écrit après démontage (voir `useEtatStable`).
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
  /**
   * Le tracé de la ligne (v0.12.0) : `step` (défaut) en escalier ; `monotone` arrondi, qui passe par
   * chaque point sans bosse au-dessus d'un palier ni passage sous zéro. Aire, point final et
   * graduations ne changent pas.
   */
  curve?: ChartCurve;
}

interface Taille { w: number; h: number }
/** Les étiquettes mesurées, et le contexte (taille, nombre de points) pour lequel elles l'ont été. */
interface Etiquettes { ctx: string; y: number; x: number; xh: number }

/**
 * Un état qu'on n'écrit QUE s'il change (v0.8.1). La comparaison se fait AVANT d'appeler React, sur
 * la dernière valeur posée (une ref tenue par le setter lui-même) : appeler un setter, même avec la
 * valeur qu'il a déjà, programme un rendu ; un effet qui le fait à chaque passage boucle en mode
 * strict de développement (« Maximum update depth exceeded », le défaut de la 0.8.0).
 */
function useEtatStable<S>(initial: S, egal: (a: S, b: S) => boolean): [S, (suivant: (precedent: S) => S) => void] {
  const [etat, setEtat] = useState(initial);
  const dernier = useRef(initial);
  const poser = useCallback((suivant: (precedent: S) => S) => {
    const v = suivant(dernier.current);
    if (egal(dernier.current, v)) return;
    dernier.current = v;
    setEtat(v);
  }, [egal]);
  return [etat, poser];
}

const tailleEgale = (a: Taille, b: Taille): boolean => Math.abs(a.w - b.w) < 0.5 && Math.abs(a.h - b.h) < 0.5;
const etiquettesEgales = (a: Etiquettes, b: Etiquettes): boolean =>
  a.ctx === b.ctx && Math.abs(a.y - b.y) < 1 && Math.abs(a.x - b.x) < 1 && Math.abs(a.xh - b.xh) < 1;

export function Chart<T = unknown>({
  points, formatValue, formatAt, label, summary, tone = 'primary', area, size = 'md', integer = false,
  maxXTicks, loading = false, curve = 'step', className = '', ...rest
}: ChartProps<T>): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const resumeId = useId();
  const [taille, poserTaille] = useEtatStable<Taille>({ w: 0, h: 0 }, tailleEgale);
  const [etiq, poserEtiq] = useEtatStable<Etiquettes>({ ctx: '', y: 0, x: 0, xh: 0 }, etiquettesEgales);

  /* LA TAILLE DU CONTENEUR, au montage puis à chaque changement (ResizeObserver). Débranché au
     démontage ; `actif` coupe tout rappel tardif : aucune écriture après démontage. */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let actif = true;
    const lire = () => {
      if (!actif) return;
      const r = el.getBoundingClientRect();
      poserTaille(() => ({ w: r.width, h: r.height }));
    };
    lire();
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(lire);
    ro?.observe(el);
    return () => { actif = false; ro?.disconnect(); };
  }, [poserTaille]);

  const geo = taille.w > 0 && taille.h > 0 && !loading
    ? chartGeometry({
      points, width: taille.w, height: taille.h, formatValue, formatAt, integer, maxXTicks, curve,
      padding: {
        /* au moins la colonne de la maquette (40) : deux graphiques empilés gardent leurs tracés alignés */
        left: Math.max(CHART_PADDING.left, Math.ceil(etiq.y) + 10),
        bottom: etiq.xh ? Math.ceil(etiq.xh) + 11 : CHART_PADDING.bottom,
      },
      xLabelWidth: etiq.x || undefined,
    })
    : null;

  /* LES ÉTIQUETTES RENDUES ajustent les marges : la colonne des valeurs, la largeur d'une date, la
     bande des dates. L'effet ne repasse que si ce qui est affiché change (la taille, les libellés) ;
     il n'écrit que si une mesure change. Pour une même taille et une même série, les mesures ne font
     que CROÎTRE : la boucle mesure → marges → libellés → mesure s'arrête forcément. Une seconde mesure
     suit le chargement des polices (une étiquette s'élargit quand la police arrive). */
  const ctx = `${Math.round(taille.w)}x${Math.round(taille.h)}:${points.length}`;
  const libelles = geo ? `${ctx}|${geo.yTicks.map(t => t.label).join('·')}|${geo.xTicks.map(t => t.label).join('·')}` : '';
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !libelles) return undefined;
    let actif = true;
    const mesurer = () => {
      if (!actif) return;
      const max = (sel: string, k: 'width' | 'height') =>
        Math.max(0, ...Array.from(el.querySelectorAll<HTMLElement>(sel), n => n.getBoundingClientRect()[k]));
      const y = max('.ds-chart__ytick', 'width'), x = max('.ds-chart__xtick', 'width'), xh = max('.ds-chart__xtick', 'height');
      poserEtiq(p => (p.ctx === ctx
        ? { ctx, y: Math.max(p.y, y), x: Math.max(p.x, x), xh: Math.max(p.xh, xh) }
        : { ctx, y, x, xh }));
    };
    mesurer();
    const polices = typeof document !== 'undefined' ? document.fonts : undefined;
    polices?.ready?.then(mesurer, () => undefined);
    return () => { actif = false; };
  }, [libelles, ctx, poserEtiq]);

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
