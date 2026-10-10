import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { Icon } from '../icons/Icon';

/**
 * Small pill label. L'icône est FACULTATIVE (décision du 10/10/2026 : la maquette fait foi, et elle
 * dessine ses statuts sans icône) ; quand elle est là, le créneau du badge la dimensionne (0.875rem,
 * 0.75rem en dense). The pill radius is legal here (badges, counters, tabs) — never on a button or input.
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** `brand` (v0.5.0) : le dégradé plein, texte blanc — « À connecter », « 12 € / mois ». */
  tone?: 'coral' | 'amber' | 'danger' | 'warning' | 'success' | 'neutral' | 'accent' | 'outline' | 'brand';
  /**
   * Height rail. md = --badge-h (1.8125rem) · dense = --badge-h-dense (1.5rem), the height
   * that lines up with a status pill on the same row. Icons: 0.875rem in md, 0.75rem in dense.
   */
  pad?: 'md' | 'dense';
  icon?: ReactNode;
  /**
   * La tête (v0.5.0) : une tuile de 28 px en tête du libellé — une `<Pastille size="puce">`, un logo.
   * Le badge prend la hauteur de la tuile (« Demandé depuis Claude », une adresse e-mail).
   */
  lead?: ReactNode;
  /**
   * La croix de retrait (v0.5.0) : un `<button>` rond de 20 px en fin de badge, pour une pastille de
   * filtre (« @julien.crea × »). `removeLabel` est son nom accessible (défaut « Retirer »).
   */
  onRemove?: () => void;
  removeLabel?: string;
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
      brand: 'ds-badge--brand',
    },
    pad: { md: '', dense: 'ds-badge--dense' },
    lead: { true: 'ds-badge--lead', false: '' },
  },
  defaultVariants: { tone: 'neutral', pad: 'md' },
});

export function Badge({
  tone = 'neutral', pad = 'md', icon, lead, onRemove, removeLabel = 'Retirer', className = '', children, ...rest
}: BadgeProps): JSX.Element {
  return (
    <span className={[badge({ tone, pad, lead: Boolean(lead) }), className].filter(Boolean).join(' ')} {...rest}>
      {lead}{icon}{children}
      {onRemove ? (
        <button type="button" className="ds-badge__remove" aria-label={removeLabel} onClick={onRemove}>
          <Icon name="x" strokeWidth={2.5} />
        </button>
      ) : null}
    </span>
  );
}
