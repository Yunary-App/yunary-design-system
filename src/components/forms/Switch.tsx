import { forwardRef } from 'react';
import type { InputHTMLAttributes, JSX, MouseEvent, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../icons/Icon';

/** Binary toggle. Track 2.75rem x 1.625rem, pill radius, knob 1.25rem.
 *  `forwardRef` : la ref atteint l'<input> natif du switch (react-hook-form). */
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  /**
   * L'interrupteur VERROUILLÉ (v0.5.0) — « Toujours actif » : la piste reste pleine et lisible, un
   * cadenas dit pourquoi, l'<input> reste dans l'ordre de tabulation et annoncé (`aria-readonly`), et
   * le composant empêche le changement. Ce n'est pas `disabled` (estompé, hors tabulation).
   */
  locked?: boolean;
  /** `end` (défaut) : le libellé après la piste · `start` : avant la piste, la piste ferme la ligne. */
  labelPosition?: 'end' | 'start';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({
  label, disabled = false, locked = false, labelPosition = 'end', className = '', onClick, ...rest
}: SwitchProps, ref): JSX.Element {
  const bloquer = (e: MouseEvent<HTMLInputElement>) => {
    if (locked) { e.preventDefault(); return; }
    onClick?.(e);
  };
  return (
    <label className={cn('ds-switch', disabled && 'is-disabled', locked && 'is-locked', labelPosition === 'start' && 'ds-switch--label-start', className)}>
      <input ref={ref} type="checkbox" role="switch" disabled={disabled} aria-readonly={locked || undefined} onClick={bloquer} {...rest} />
      <span className="ds-switch__track"><span className="ds-switch__knob" /></span>
      {label ? <span>{label}</span> : null}
      {locked ? <span className="ds-switch__lock" aria-hidden="true"><Icon name="lock" /></span> : null}
    </label>
  );
});
Switch.displayName = 'Switch';
