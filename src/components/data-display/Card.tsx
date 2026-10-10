import type { ElementType, HTMLAttributes, JSX, ReactNode } from 'react';
import { cva } from 'class-variance-authority';

/**
 * The signature surface: tinted --card fill, 1px --border, generous padding, tinted shadow.
 * Never pure white. Interactive cards lift translateY(-2px) to --shadow-md on hover.
 * Passing any header slot renders the header block; passing none renders exactly as before.
 */
/* Omit<'title'> : l'attribut HTML `title` est une string, notre slot est un ReactNode.
   Même traitement que EmptyStateProps, qui a le même conflit depuis la v0.1.0. */
export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /**
   * default = static · interactive = clickable (lift on hover) · feature = --grad-soft wash + orange border.
   * `plaque` (v0.5.0) = feature posée DANS une carte : sans ombre ni padding, le contenu dans `.ds-card__body`,
   * le pied (`foot`) sur un lavis. `screen` (v0.5.0) = la coque d'un écran de Claude : --background, sans
   * ombre, padding 18 / 20, une pile ; tout ce qui s'y pose se relève en --card.
   */
  variant?: 'default' | 'interactive' | 'feature' | 'plaque' | 'screen';
  /** md = radius lg / padding 24 · lg = radius xl / padding 28 · xl (v0.5.0) = radius lg / padding 28 / 32, la carte d'outil ou d'offre. */
  size?: 'md' | 'lg' | 'xl';
  /** Removes padding and clips children — for cards with a full-bleed media top. */
  flush?: boolean;
  /** À venir (v0.5.0) : la carte s'estompe (.7) et perd son ombre — l'outil annoncé. */
  upcoming?: boolean;
  /** Header slot — gradient caps line above the title. */
  eyebrow?: ReactNode;
  /** Header slot — pass a <Pastille size="carte">. */
  icon?: ReactNode;
  /** Header slot — display face, casse et graisse selon --heading-transform / --heading-weight, jamais sous 1.125rem. */
  title?: ReactNode;
  /** Header slot (v0.5.0) — un badge COLLÉ au titre (« Actif »), qui passe sous lui quand la place manque. Pas l'action. */
  badge?: ReactNode;
  /** Header slot — one muted line under the title. */
  subtitle?: ReactNode;
  /** Header slot — trailing control (IconButton, Button, chevron), pushed right. */
  action?: ReactNode;
  /** sm = --text-heading-sm (default) · lg = --text-subheading. */
  titleSize?: 'sm' | 'lg';
  /** normal = --space-4 gutter under the header · airy = --space-6, for a card of blocks. */
  headerGap?: 'normal' | 'airy';
  /**
   * LA PILE — opt-in. `.ds-card` est `display:block`, donc un `gap-*` posé en `className` ne
   * rend RIEN (0 px d'écart, en silence). `gap` passe la carte en colonne flex avec l'écart du
   * palier --space-N ; l'en-tête cède alors sa marge basse au gap. Sans `gap`, la carte reste un
   * bloc. Quatre paliers, exprès — pas de 20 px : l'espacement interne d'une carte reste sur
   * l'échelle.
   */
  gap?: 3 | 4 | 5 | 6;
  /** Le pied (v0.5.0) — `.ds-card__foot` : un filet haut, une phrase en sourdine, une action à droite. */
  foot?: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  children?: ReactNode;
}

const card = cva('ds-card', {
  variants: {
    variant: {
      default: '', interactive: 'ds-card--interactive', feature: 'ds-card--feature',
      plaque: 'ds-card--feature ds-card--plaque', screen: 'ds-card--screen',
    },
    size: { md: '', lg: 'ds-card--lg', xl: 'ds-card--xl' },
    flush: { true: 'ds-card--flush', false: '' },
    upcoming: { true: 'is-upcoming', false: '' },
  },
  defaultVariants: { variant: 'default', size: 'md', flush: false, upcoming: false },
});

export function Card({
  variant = 'default', size = 'md', as, flush = false, upcoming = false, gap,
  eyebrow, icon, title, badge, subtitle, action, titleSize = 'sm', headerGap = 'normal', foot,
  className = '', children, ...rest
}: CardProps): JSX.Element {
  const Tag = (as ?? 'div') as ElementType;
  const cls = [
    card({ variant, size, flush, upcoming }),
    gap ? `ds-card--stack ds-card--gap-${gap}` : '',
    className,
  ].filter(Boolean).join(' ');
  /* Aucun slot passé = aucun noeud d'en-tête émis. C'est la condition de non-régression :
     le DOM d'une Card sans en-tête est identique à celui d'avant la v0.4. */
  const hasHeader = Boolean(eyebrow || icon || title || badge || subtitle || action);
  const titre = title ? (
    <h3 className={['ds-card__title', titleSize === 'lg' ? 'ds-card__title--lg' : ''].filter(Boolean).join(' ')}>
      {title}
    </h3>
  ) : null;
  const header = hasHeader ? (
    /* L'alignement est DÉCIDÉ ICI, jamais au site d'appel (v0.4.0) : titre simple
       -> centré ; titre + sous-titre -> --stacked (flex-start), l'action s'aligne
       sur le titre au lieu de flotter entre les deux lignes. Voir la règle au-dessus de .ds-card__header dans patterns.css. */
    <div className={[
      'ds-card__header',
      subtitle ? 'ds-card__header--stacked' : '',
      headerGap === 'airy' ? 'ds-card__header--airy' : '',
    ].filter(Boolean).join(' ')}>
      {icon}
      {(eyebrow || title || badge || subtitle) ? (
        <div className="ds-card__header-main">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          {badge ? <div className="ds-card__title-row">{titre}<span className="ds-card__badge">{badge}</span></div> : titre}
          {subtitle ? <div className="ds-card__subtitle">{subtitle}</div> : null}
        </div>
      ) : null}
      {action ? <div className="ds-card__action">{action}</div> : null}
    </div>
  ) : null;
  const pied = foot ? <div className="ds-card__foot">{foot}</div> : null;
  /* La plaque range son en-tête et son contenu dans `.ds-card__body` : c'est lui qui porte le
     padding, le pied garde le sien sur son lavis. */
  if (variant === 'plaque') {
    return (
      <Tag className={cls} {...rest}>
        <div className="ds-card__body">{header}{children}</div>
        {pied}
      </Tag>
    );
  }
  return (
    <Tag className={cls} {...rest}>
      {header}
      {children}
      {pied}
    </Tag>
  );
}
