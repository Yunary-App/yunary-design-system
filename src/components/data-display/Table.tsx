import type {
  HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';
import type { JSX } from 'react';
import { Icon } from '../icons/Icon';

/**
 * Composable data table: Table > THead/TBody > Tr > Th/Td. Tokens only — typo caption
 * for headers, 1px --border rows. Empty state: render EmptyState INSTEAD of the table.
 * `framed` gives the table its own contour — no Card wrapper needed. All four flags compose.
 */
export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Even rows get a muted wash. */
  striped?: boolean;
  /** Rows tint to --accent on hover. */
  hoverable?: boolean;
  /** Self-contained frame: 1px --border contour, radius-lg, --card fill, header on --background. */
  framed?: boolean;
  /** Vertical 1px --border dividers between columns. */
  columns?: boolean;
}

export function Table({
  striped = false, hoverable = false, framed = false, columns = false, className = '', children, ...rest
}: TableProps): JSX.Element {
  return (
    <table
      className={cn(
        'ds-table',
        striped && 'ds-table--striped',
        hoverable && 'ds-table--hoverable',
        framed && 'ds-table--framed',
        columns && 'ds-table--columns',
        className,
      )}
      {...rest}
    >
      {children}
    </table>
  );
}

export function THead(props: HTMLAttributes<HTMLTableSectionElement>): JSX.Element { return <thead {...props} />; }
export function TBody(props: HTMLAttributes<HTMLTableSectionElement>): JSX.Element { return <tbody {...props} />; }
export function Tr(props: HTMLAttributes<HTMLTableRowElement>): JSX.Element { return <tr {...props} />; }
/** L'état de tri d'une colonne : `desc` décroissant, `asc` croissant, `none` non triée. */
export type ThSort = 'asc' | 'desc' | 'none';

export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * v0.7.0 — l'en-tête TRIABLE, contrôlé. Avec `sort`, le contenu passe dans un <button>
   * (`.ds-table__sort`) suivi du glyphe de l'état (arrow-down, arrow-up, arrow-up-down) ; le <th>
   * porte `aria-sort` (ascending / descending, absent si `none`) et la colonne active passe en
   * --foreground. Le composant ne trie rien : il reçoit l'état et prévient au clic.
   */
  sort?: ThSort;
  /** Appelé au clic sur l'en-tête triable. L'app décide du nouvel état et trie. */
  onSort?: () => void;
  children?: ReactNode;
}

const GLYPHE_TRI = { desc: 'arrow-down', asc: 'arrow-up', none: 'arrow-up-down' } as const;
const ARIA_TRI = { desc: 'descending', asc: 'ascending', none: undefined } as const;

export function Th({ sort, onSort, children, ...rest }: ThProps): JSX.Element {
  if (!sort) return <th {...rest}>{children}</th>;
  return (
    <th aria-sort={ARIA_TRI[sort]} {...rest}>
      <button type="button" className="ds-table__sort" onClick={onSort}>
        {children}
        <Icon name={GLYPHE_TRI[sort]} />
      </button>
    </th>
  );
}
export function Td(props: TdHTMLAttributes<HTMLTableCellElement>): JSX.Element { return <td {...props} />; }
