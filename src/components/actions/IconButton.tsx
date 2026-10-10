import type { ButtonHTMLAttributes, ElementType, JSX, ReactNode } from 'react';
import { cva } from 'class-variance-authority';

/**
 * Square icon-only button on the shared control rail: every size renders the same
 * square (3rem, 2.75rem under 64rem) — `size` is kept for API compatibility.
 * Always pass `label` — it becomes aria-label and title. Never a pill.
 */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `accent` (v0.3.0) : fond `--accent`, sans bordure, icône `--primary-readable` — l'état
   * « sélectionné doux » d'un lien-icône ou d'un raccourci. La variante que les apps
   * recomposaient à la main en détournant l'aide de démo `is-active` et en annulant la
   * bordure en inline.
   * `danger-soft` (v0.1.4) : la corbeille — fond `--pill-danger-bg`, glyphe `--pill-danger-fg`, filet
   * 1,5 px à 30 % du rouge (v0.6.0, la maquette fait foi). Le `danger` plein reste l'action destructrice
   * UNIQUE d'une vue (une modale de confirmation) ; à côté de chaque ligne supprimable, c'est le doux.
   * `ghost-danger` (v0.6.0) : la corbeille NUE — le glyphe seul en rouge lisible, pour le 390 où la
   * plaque n'a plus sa place (la barre d'une fiche).
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-soft' | 'ghost-danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  /**
   * The surface the button sits on — the twin of Button's `surface`, same three values,
   * same reason. `auto` (default) leaves the deduction of patterns.css alone; `page`
   * forces --secondary on a --background panel nested inside a card; `card` forces
   * --background outside a real .ds-card. Only `secondary` carries a fill.
   */
  surface?: 'auto' | 'page' | 'card';
  /** Accessible name. Required. */
  label: string;
  /**
   * Render as another tag — le jumeau exact du `as` de Button, et pour le même besoin :
   * un lien-icône (`as="a"` + `href`) reste un LIEN — clic-milieu, « ouvrir dans un
   * onglet », annonce correcte au lecteur d'écran — là où un `<button onClick>` qui
   * navigue n'en est pas un. (v0.3.0)
   */
  as?: keyof JSX.IntrinsicElements;
  /** Link target — only meaningful with as="a". */
  href?: string;
  children?: ReactNode;
}

const iconButton = cva('ds-icon-btn', {
  variants: {
    variant: {
      primary: 'ds-icon-btn--primary',
      secondary: 'ds-icon-btn--secondary',
      ghost: 'ds-icon-btn--ghost',
      danger: 'ds-icon-btn--danger',
      'danger-soft': 'ds-icon-btn--danger-soft',
      'ghost-danger': 'ds-icon-btn--ghost-danger',
      accent: 'ds-icon-btn--accent',
    },
    size: { sm: 'ds-icon-btn--sm', md: 'ds-icon-btn--md', lg: 'ds-icon-btn--lg' },
    surface: { auto: '', page: 'ds-icon-btn--on-page', card: 'ds-icon-btn--on-card' },
  },
  defaultVariants: { variant: 'ghost', size: 'md', surface: 'auto' },
});

export function IconButton({
  variant = 'ghost', size = 'md', surface = 'auto', label, as, disabled,
  className = '', children, ...rest
}: IconButtonProps): JSX.Element {
  const Tag = (as ?? 'button') as ElementType;
  const cls = [iconButton({ variant, size, surface }), className].filter(Boolean).join(' ');
  /* Même contrat que Button : `type` et `disabled` n'existent que sur un vrai <button> ;
     ailleurs, l'état désactivé passe par aria-disabled. */
  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      disabled={Tag === 'button' ? disabled : undefined}
      aria-disabled={disabled || undefined}
      className={cls}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children}
    </Tag>
  );
}
