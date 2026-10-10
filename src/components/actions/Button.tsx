import type { ButtonHTMLAttributes, ElementType, JSX, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { Spinner } from '../feedback/Spinner';

/**
 * The system's primary action. Primary carries the brand glow and is the only
 * orange accent allowed in a view; secondary / ghost / danger carry none.
 * Radius is always --radius-md — NEVER a pill.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primary = brand CTA (glow) · secondary = white/ink outline · ghost = bare · danger = destructive.
   * danger-soft = l'action destructrice SECONDAIRE (retirer, se déconnecter) : la paire de la pilule
   * danger, sans bordure — la recette de l'IconButton du même nom. `danger` reste l'action
   * destructrice unique et définitive d'une vue.
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-soft';
  /**
   * Shared control rail: every size has min-height 3rem (2.75rem under 64rem); sm tightens padding + type; lg (3.25rem) is the hero CTA.
   * `xs` (v0.5.0) : 28 px (`--control-xs`), caption, icône 0.875rem — « Copier » dans l'en-tête d'un champ,
   * une action de méta. Jamais un CTA ni un bouton de pied : ceux-là restent sur le rail.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * The surface the button sits on — the escape hatch to the surface deduction of
   * patterns.css, and the exact twin of Input's `surface`. `auto` (default) lets the
   * deduction do its job: a secondary button inside a Card / Modal / .ds-dropdown menu
   * fills with --background so it detaches from its carrier. `page` forces
   * --secondary — for a secondary button sitting on a --background PANEL nested inside a
   * card, where the deduction would paint it the colour of that panel. `card` forces
   * --background outside of a real .ds-card, e.g. in a container that only looks like one.
   * Only `secondary` carries a fill: ghost, primary and danger ignore this prop.
   */
  surface?: 'auto' | 'page' | 'card';
  /** Leading icon node — use <Icon />. */
  icon?: ReactNode;
  /** Trailing icon node. */
  iconRight?: ReactNode;
  /** Swaps the leading icon for a spinner and disables the button. */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Render as another tag, e.g. 'a' for a link-button. */
  as?: keyof JSX.IntrinsicElements;
  /** Link target — only meaningful with as="a". */
  href?: string;
  children?: ReactNode;
}

const button = cva('ds-btn', {
  variants: {
    variant: {
      primary: 'ds-btn--primary',
      secondary: 'ds-btn--secondary',
      ghost: 'ds-btn--ghost',
      danger: 'ds-btn--danger',
      'danger-soft': 'ds-btn--danger-soft',
    },
    size: { xs: 'ds-btn--xs', sm: 'ds-btn--sm', md: 'ds-btn--md', lg: 'ds-btn--lg' },
    surface: { auto: '', page: 'ds-btn--on-page', card: 'ds-btn--on-card' },
    fullWidth: { true: 'ds-btn--block', false: '' },
    loading: { true: 'is-loading', false: '' },
  },
  defaultVariants: { variant: 'primary', size: 'md', surface: 'auto', fullWidth: false, loading: false },
});

export function Button({
  variant = 'primary', size = 'md', surface = 'auto', icon, iconRight, loading = false,
  disabled = false, fullWidth = false, as, className = '', children, ...rest
}: ButtonProps): JSX.Element {
  const Tag = (as ?? 'button') as ElementType;
  const cls = [button({ variant, size, surface, fullWidth, loading }), className].filter(Boolean).join(' ');
  return (
    <Tag
      className={cls}
      disabled={Tag === 'button' ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {/* Sans taille : le créneau du bouton (--ds-icon-size, patterns.css) dimensionne le
          spinner COMME l'icône qu'il remplace — le même bouton rend pareil en chargement
          et au repos. La constante JS qui vivait ici disait md -> 1.25rem quand le créneau dit
          1.125 : c'est la règle CSS qui porte la bonne valeur. */}
      {loading ? <Spinner /> : icon}
      <span>{children}</span>
      {!loading && iconRight}
    </Tag>
  );
}
