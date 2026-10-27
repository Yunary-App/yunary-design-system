import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Pastille } from '../data-display/Pastille';

/**
 * Dashed-border empty slot : l'icône dans la pastille de MARQUE des maquettes (v0.12.0, décision D-009 :
 * panneau · carrée · brand · outlined, le rendu du bundle qui dessine les maquettes du hub ; de la 0.6.0
 * à la 0.11.1 c'était un rond neutre), titre H4 en face display, one next step. `compact` (v0.6.0) : le
 * panneau d'état d'un écran de Claude ou d'une carte (20 / 16, gap 14, titre heading-sm, une pastille
 * pleine danger ou neutre passée par `tile`).
 */
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Un glyphe nu — la Pastille par défaut (panneau · carrée · brand · outlined) l'enveloppe. */
  icon?: ReactNode;
  /**
   * LA TUILE COMPLÈTE, quand celle par défaut ne convient pas — v0.3.0 : la Pastille était FIGÉE, aucun moyen d'en changer le ton ou la
   * taille. Passer ici sa propre <Pastille> (ou tout nœud) ; `icon` est alors ignoré.
   */
  tile?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Sans cadre ni fond (v0.4.0) : l'état vide remplit déjà une section bordée. */
  plain?: boolean;
  /** Le panneau d'état compact (v0.6.0). */
  compact?: boolean;
}

export function EmptyState({
  icon, tile, title, description, action, plain = false, compact = false, className = '', ...rest
}: EmptyStateProps): JSX.Element {
  return (
    <div className={cn('ds-empty', plain && 'ds-empty--plain', compact && 'ds-empty--compact', className)} {...rest}>
      {tile ?? (icon ? <Pastille size="panneau" tone="brand" outlined>{icon}</Pastille> : null)}
      <div className="ds-empty__main">
        <h4 className="ds-empty__title">{title}</h4>
        {description ? <p className="ds-empty__desc">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
