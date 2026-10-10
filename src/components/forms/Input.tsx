import { forwardRef } from 'react';
import type { InputHTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Single-line text field on the shared control rail, aligned with Button and the Select trigger.
 * Focus = the border turns --ring — ONE border, never an extra ring. Never a pill.
 * `forwardRef` : la ref atteint l'<input> natif — c'est ce qui rend le champ utilisable
 * avec une bibliothèque de formulaires (register() de react-hook-form pose une ref).
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  /** Red border + 3px destructive ring. Always pair with an error message. */
  invalid?: boolean;
  /** 'page' (default) = sits directly on the layout (fill --secondary, like navbar/tabs/search) · 'card' = inside a card (fill --background). */
  surface?: 'page' | 'card';
  /**
   * L'unité du champ — « kg », « € », « min » — posée DANS le champ, à droite, en
   * sourdine (v0.3.0). Trois caractères au plus : le
   * padding réservé est fixe (--space-7) ; plus long, c'est un suffixe de libellé, pas
   * une unité. `aria-hidden` : c'est au libellé du FormField de la nommer.
   */
  unit?: string;
  /**
   * L'icône de fin — un glyphe DANS le champ, à droite (le cadenas d'un champ verrouillé :
   * `<Icon name="lock" />`). Décorative (`aria-hidden`) : le sens se dit dans le libellé ou
   * l'aide du FormField. Sa taille est posée par le créneau (1rem). Avec `unit`, l'unité se
   * place à gauche de l'icône.
   */
  iconEnd?: ReactNode;
  /**
   * Le préfixe (v0.6.0) — un ou deux caractères fixes en TÊTE du champ (« @ » d'un identifiant), en
   * sourdine et en gras. Jumeau de `unit`, à gauche ; `aria-hidden`, le libellé le nomme.
   */
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  size = 'md', invalid = false, surface = 'page', unit, iconEnd, prefix, className = '', ...rest
}: InputProps, ref): JSX.Element {
  // surface: 'page' (default) = the input sits directly on the layout (fill --secondary) · 'card' = inside a card (fill --background).
  // Since the surface-inference rule in patterns.css, a field inside a Card, Modal, .ds-dropdown menu or DatePicker pop deduces --background by itself — the prop is only needed for other containers.
  /* Le rail passe par des classes, jamais par un style inline : `--control-sm`
     aliase `--control-md` depuis le rail unique, mais la classe reste pour l'API
     et pour le jour où le rail redivergerait. */
  const cls = cn(
    'ds-input',
    size !== 'md' && 'ds-input--' + size,
    surface === 'card' && 'ds-input--on-card',
    invalid && 'is-error',
    className,
  );
  const champ = <input ref={ref} className={cls} aria-invalid={invalid || undefined} {...rest} />;
  if (!unit && !iconEnd && !prefix) return champ;
  /* L'enveloppe n'existe QUE si `unit`, `iconEnd` ou `prefix` est passé : sans eux, le champ reste un
     <input> nu. */
  return (
    <span className={cn('ds-input-unit', Boolean(iconEnd) && 'ds-input-unit--icon', Boolean(prefix) && 'ds-input-unit--prefix')}>
      {prefix ? <span className="ds-input-unit__prefix" aria-hidden="true">{prefix}</span> : null}
      {champ}
      {unit ? <span className="ds-input-unit__label" aria-hidden="true">{unit}</span> : null}
      {iconEnd ? <span className="ds-input-unit__icon" aria-hidden="true">{iconEnd}</span> : null}
    </span>
  );
});
Input.displayName = 'Input';
