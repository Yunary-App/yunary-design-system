import type { JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../icons/Icon';

/**
 * Label + control + help/error wrapper. An error replaces the help text and is
 * always colour + icon + text — never colour alone.
 */
export interface FormFieldProps {
  label?: ReactNode;
  htmlFor?: string;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Une action à droite du libellé (v0.4.0) — « Copier », un lien. Le libellé et elle partagent une rangée. */
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function FormField({
  label, htmlFor, help, error, required = false, action, className = '', children,
}: FormFieldProps): JSX.Element {
  const labelNode = label ? (
    <label className="ds-label" htmlFor={htmlFor}>
      {label}{required ? <span className="ds-label__required"> *</span> : null}
    </label>
  ) : null;
  return (
    <div className={cn('ds-field', className)}>
      {action ? <div className="ds-field__head">{labelNode}{action}</div> : labelNode}
      {children}
      {error ? (
        <span className="ds-error"><Icon name="circle-alert" size="0.875rem" strokeWidth={2.5} />{error}</span>
      ) : help ? <span className="ds-help">{help}</span> : null}
    </div>
  );
}
