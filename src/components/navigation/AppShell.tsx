import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Tool-app skeleton: grid [Sidebar | content]. Under 64rem the sidebar becomes a
 * drawer (Sidebar's `open`/`onClose`); `responsive={false}` pins the desktop layout.
 * `appbar` (v0.6.0) : la barre haute MOBILE (`.ds-appbar`), rendue au-dessus du contenu et visible
 * sous 64 rem seulement — le lockup à gauche (`.ds-appbar__brand`), le bouton de menu à droite
 * (`.ds-appbar__end`). Au-dessus du seuil, la barre latérale est là et l'app bar n'existe pas.
 */
export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** A <Sidebar> element. */
  sidebar?: ReactNode;
  /** Le contenu de la barre haute mobile : un lockup, puis `IconButton` menu dans `.ds-appbar__end`. */
  appbar?: ReactNode;
  /** Default true. False disables the drawer breakpoint (fixed two-column layout). */
  responsive?: boolean;
  children?: ReactNode;
}

export function AppShell({
  sidebar, appbar, responsive = true, className = '', children, ...rest
}: AppShellProps): JSX.Element {
  return (
    <div className={cn('ds-appshell', !responsive && 'ds-appshell--static', className)} {...rest}>
      {sidebar}
      <main className="ds-appshell__main">
        {appbar ? <header className="ds-appbar">{appbar}</header> : null}
        {children}
      </main>
    </div>
  );
}
