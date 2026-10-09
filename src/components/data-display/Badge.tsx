import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cva } from 'class-variance-authority';

/**
 * Small pill label. Semantic tones always carry an icon + text, never colour alone.
 * The pill radius is legal here (badges, counters, tabs) — never on a button or input.
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'coral' | 'amber' | 'danger' | 'warning' | 'success' | 'neutral' | 'accent' | 'outline';
  /**
   * Height rail. md = --badge-h (1.8125rem) · dense = --badge-h-dense (1.5rem), the height
   * that lines up with a status pill on the same row. Icons: 0.875rem in md, 0.75rem in dense.
   */
  pad?: 'md' | 'dense';
  icon?: ReactNode;
  /**
   * La languette de coin (v0.4.0) : le badge se colle au coin haut droit de son conteneur, qui porte
   * `position: relative` (« Recommandé » sur une carte de choix).
   */
  corner?: boolean;
  children?: ReactNode;
}

const badge = cva('ds-badge', {
  variants: {
    tone: {
      coral: 'ds-badge--coral',
      amber: 'ds-badge--amber',
      danger: 'ds-badge--danger',
      warning: 'ds-badge--warning',
      success: 'ds-badge--success',
      neutral: 'ds-badge--neutral',
      accent: 'ds-badge--accent',
      outline: 'ds-badge--outline',
    },
    pad: { md: '', dense: 'ds-badge--dense' },
    corner: { true: 'ds-badge--corner', false: '' },
  },
  defaultVariants: { tone: 'neutral', pad: 'md' },
});

export function Badge({ tone = 'neutral', pad = 'md', corner = false, icon, className = '', children, ...rest }: BadgeProps): JSX.Element {
  return (
    <span className={[badge({ tone, pad, corner }), className].filter(Boolean).join(' ')} {...rest}>
      {icon}{children}
    </span>
  );
}
