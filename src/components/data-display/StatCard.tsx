import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Badge } from './Badge';

/** Le sens d'une variation : `up` hausse (success), `flat` stable (neutral), `down` baisse (danger). */
export type StatTrend = 'up' | 'flat' | 'down';

const TON: Record<StatTrend, 'success' | 'neutral' | 'danger'> = { up: 'success', flat: 'neutral', down: 'danger' };

/**
 * La carte de chiffre — v0.7.0, maquette Admin Web ; l'écran Métriques de mcp-ui l'écrit en classes.
 * `.ds-card.ds-card--stat.ds-stat-card` : un libellé, une grande valeur (--text-heading-xl, 800), puis
 * un pied en sourdine : le badge de variation dense et une phrase. Paddings 24 / 28, puis 16 / 18 sous
 * 64 rem (jetons --card-pad-stat-*). `loading` : deux squelettes aux places de la valeur et du pied, le
 * libellé reste, la carte porte `aria-busy`. Le calcul de la variation et le choix d'afficher un
 * pourcentage restent à l'app : la carte reçoit un texte et un sens.
 */
export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Le libellé (« MRR », « Clients payants »). */
  label: ReactNode;
  /** La valeur, déjà formatée par l'app (« 84 € », « 7 »). Ignorée pendant le chargement. */
  value?: ReactNode;
  /** La variation : son texte (« +14 », « +12 € · +17 % ») et son sens. Facultative. */
  delta?: { text: ReactNode; trend: StatTrend };
  /** La phrase en sourdine du pied (« sur 30 jours »). Facultative. */
  note?: ReactNode;
  /** Chargement : squelettes aux positions finales. */
  loading?: boolean;
}

export function StatCard({
  label, value, delta, note, loading = false, className = '', ...rest
}: StatCardProps): JSX.Element {
  return (
    <div className={cn('ds-card ds-card--stat ds-stat-card', className)} aria-busy={loading || undefined} {...rest}>
      <span className="ds-stat-card__label">{label}</span>
      {loading ? (
        <>
          <span className="ds-skel ds-stat-card__skel-value" aria-hidden="true" />
          <span className="ds-skel ds-stat-card__skel-foot" aria-hidden="true" />
        </>
      ) : (
        <>
          <span className="ds-stat-card__value">{value}</span>
          {delta || note ? (
            <span className="ds-stat-card__foot">
              {delta ? <Badge tone={TON[delta.trend]} pad="dense">{delta.text}</Badge> : null}
              {note ? <span>{note}</span> : null}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
