import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cva } from 'class-variance-authority';

/**
 * The system's icon tile — one component for every tinted square-or-round icon holder.
 * Replaces the two internal tiles (Modal's 2.625rem tile, EmptyState's --grad-soft tile).
 * Sizes are named BY CONTEXT, never by measure, so a call site never hard-codes a rem.
 */
export interface PastilleProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * coche 1.5 · puce 1.75 · carte 2.25 · dialogue 2.625 · panneau 3.25 · héros 4 · écran 5rem — radius steps with the size.
   * `puce` (v0.4.0) : un numéro d'étape — son chiffre est en body-sm gras.
   * `coche` (v0.5.0) : la coche d'un avantage, l'étape faite d'une liste — 24 px, glyphe 0.875rem, trait 3.
   */
  size?: 'coche' | 'puce' | 'carte' | 'dialogue' | 'panneau' | 'heros' | 'ecran';
  /** square = softened square (radius follows size) · round = --radius-pill. */
  shape?: 'square' | 'round';
  /**
   * brand (--grad-soft + --primary) · brand-solid (the full --brand-gradient +
   * --primary-foreground) · the 6 semantic pairs · inverse (--foreground on --background).
   *
   * `brand-solid` carries NO glow, and that is deliberate: in this system the glow marks
   * what can be PRESSED — only .ds-btn--primary and .ds-icon-btn--primary have it. The five
   * other places the gradient fills something (progress bar, checkbox, radio dot, switch
   * track, selected calendar day) carry none, and a Pastille is never pressable. A caller
   * that wants the halo adds it at the call site, knowingly.
   */
  tone?: 'brand' | 'brand-solid' | 'coral' | 'amber' | 'success' | 'warning' | 'danger' | 'neutral' | 'inverse';
  /** 1px currentColor @22% contour — EmptyState's hairline, generalised to every tone. */
  outlined?: boolean;
  children?: ReactNode;
}

const pastille = cva('ds-pastille', {
  variants: {
    size: {
      coche: 'ds-pastille--coche',
      puce: 'ds-pastille--puce',
      carte: 'ds-pastille--carte',
      dialogue: 'ds-pastille--dialogue',
      panneau: 'ds-pastille--panneau',
      heros: 'ds-pastille--heros',
      ecran: 'ds-pastille--ecran',
    },
    shape: { square: '', round: 'ds-pastille--rond' },
    tone: {
      brand: 'ds-pastille--brand',
      'brand-solid': 'ds-pastille--brand-solid',
      coral: 'ds-pastille--coral',
      amber: 'ds-pastille--amber',
      success: 'ds-pastille--success',
      warning: 'ds-pastille--warning',
      danger: 'ds-pastille--danger',
      neutral: 'ds-pastille--neutral',
      inverse: 'ds-pastille--inverse',
    },
    outlined: { true: 'ds-pastille--outlined', false: '' },
  },
  defaultVariants: { size: 'dialogue', shape: 'square', tone: 'brand', outlined: false },
});

export function Pastille({
  size = 'dialogue', shape = 'square', tone = 'brand', outlined = false,
  className = '', children, ...rest
}: PastilleProps): JSX.Element {
  const cls = [pastille({ size, shape, tone, outlined }), className].filter(Boolean).join(' ');
  return <span className={cls} {...rest}>{children}</span>;
}
