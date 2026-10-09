import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { Icon, type IconName } from '../icons/Icon';

/**
 * Inline, persistent message inside a page or a card. Always colour + icon + text.
 * `inset` (v0.4.0) : l'encart d'information posé DANS une carte — rayon md, plus serré, texte en body-sm,
 * sans filet sur les tons colorés ; le neutre se creuse comme un champ.
 */
export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** `amber` : une contrainte à connaître, sans danger · `neutral` : une précision (v0.4.0). */
  tone?: 'danger' | 'warning' | 'success' | 'info' | 'amber' | 'neutral';
  title?: ReactNode;
  action?: ReactNode;
  /** L'encart d'information dans une carte (v0.4.0). */
  inset?: boolean;
  /** Remplace l'icône du ton (v0.4.0) — un glyphe qui dit mieux le sujet. Le bandeau garde toujours une icône. */
  icon?: ReactNode;
  children?: ReactNode;
}

const BANNER_ICONS: Record<string, IconName> = {
  danger: 'triangle-alert', warning: 'triangle-alert', success: 'circle-check', info: 'info',
  amber: 'triangle-alert', neutral: 'info',
};

const banner = cva('ds-banner', {
  variants: {
    tone: {
      danger: 'ds-banner--danger',
      warning: 'ds-banner--warning',
      success: 'ds-banner--success',
      info: 'ds-banner--info',
      amber: 'ds-banner--amber',
      neutral: '',
    },
    inset: { true: 'ds-banner--inset', false: '' },
  },
  defaultVariants: { tone: 'info', inset: false },
});

export function Banner({
  tone = 'info', title, children, action, inset = false, icon, className = '', ...rest
}: BannerProps): JSX.Element {
  return (
    <div className={[banner({ tone, inset }), className].filter(Boolean).join(' ')} role="note" {...rest}>
      {icon
        ? <span className="ds-banner__icon" aria-hidden="true">{icon}</span>
        : <Icon name={BANNER_ICONS[tone]} size={inset ? '1rem' : '1.125rem'} strokeWidth={2} className="ds-banner__icon" />}
      <div className="ds-banner__main">
        {title ? <span className="ds-banner__title">{title}</span> : null}
        {children ? <span className="ds-banner__text">{children}</span> : null}
      </div>
      {action}
    </div>
  );
}
