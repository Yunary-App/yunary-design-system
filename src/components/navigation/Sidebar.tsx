import { Fragment, useState } from 'react';
import type { ElementType, HTMLAttributes, JSX, MouseEventHandler, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Logo } from '../brand/Logo';
import { Icon } from '../icons/Icon';

/**
 * App sidebar on --secondary: Logo head, nav sections, active item, footer (Avatar…).
 * Collapsible to icons-only, persisted in localStorage. Under 64rem it is a drawer
 * driven by `open`/`onClose` (scrim included).
 */
export interface SidebarItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  onClick?: MouseEventHandler;
  /** Entrée désactivée : grisée, non cliquable (`aria-disabled`). ADDED v0.1.2 */
  disabled?: boolean;
  /** Appoint à droite du libellé — un `Badge`, un compteur. Masqué en replié. ADDED v0.1.2 */
  badge?: ReactNode;
}

export interface SidebarSection { title?: ReactNode; items: SidebarItem[] }

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  sections?: SidebarSection[];
  /** Sidebar footer — typically Avatar + name. */
  footer?: ReactNode;
  /**
   * Des entrées posées EN PIED, rendues exactement comme celles de la navigation.
   *
   * POURQUOI ELLES NE PASSENT PAS PAR `footer`. Ce slot-là est une rangée horizontale à
   * filet haut, calibrée pour « avatar + nom ». Une app qui y met une déconnexion ou un
   * accès aux réglages doit alors redessiner l'apparence d'une entrée — donc s'appuyer sur
   * `.ds-sidenav`, une classe INTERNE, que le socle peut renommer sans prévenir. Le besoin
   * est pourtant universel : toute coque d'outil pose en bas ce qui n'est pas une
   * destination de contenu.
   *
   * Elles empruntent le MÊME rendu que `sections` — même classe, même état actif, même
   * `linkAs`. Elles ne peuvent donc pas diverger : c'est le point.
   */
  footerItems?: SidebarItem[];
  /** La marque, en tête, quand la barre est DÉPLIÉE. Défaut : le `Logo` en mot-marque. */
  brand?: ReactNode;
  /** La marque quand la barre est REPLIÉE. Défaut : le `Logo` en monogramme. */
  brandCollapsed?: ReactNode;
  /** Show the collapse toggle. Default true. */
  collapsible?: boolean;
  /** Overrides the persisted initial state. */
  defaultCollapsed?: boolean;
  /** localStorage key for the collapsed state. Default 'ds-sidebar-collapsed'. */
  storageKey?: string;
  /** Mobile drawer open state (under 64rem). */
  open?: boolean;
  onClose?: () => void;
  /** Opt out of the fixed-drawer behaviour (demos, embedded shells). */
  staticLayout?: boolean;
  /**
   * Le composant qui rend une entrée PORTANT UN `href`. Défaut : `'a'`.
   *
   * POURQUOI IL EXISTE. Une app à routeur client — react-router, TanStack Router — ne peut
   * pas se servir d'un `<a href>` nu : chaque clic RECHARGERAIT la page entière. Sans ce
   * point d'accroche il ne restait qu'à passer `onClick` sans `href`, ce qui rend un
   * `<button>` : la navigation marche, mais l'entrée cesse d'être un lien — plus de
   * clic-milieu, plus d'« ouvrir dans un onglet », et un lecteur d'écran annonce un bouton
   * là où il devrait annoncer un lien. Le composant devenait alors inutilisable dans son
   * cas d'usage principal, et chaque app réécrivait sa barre.
   *
   * L'app passe son propre lien — `linkAs={NavLink}` — et `href` lui arrive en `to`, la
   * prop que ces routeurs attendent tous. `className` et `aria-current` restent calculés
   * ici : le socle garde la main sur l'apparence et l'accessibilité, l'app ne fournit que
   * la mécanique de navigation.
   */
  linkAs?: ElementType;
}

export function Sidebar({
  sections = [], footer, footerItems = [], brand, brandCollapsed, collapsible = true, defaultCollapsed,
  storageKey = 'ds-sidebar-collapsed',
  open = false, onClose, staticLayout = false, linkAs, className = '', children, ...rest
}: SidebarProps): JSX.Element {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (defaultCollapsed !== undefined) return defaultCollapsed;
    try { return localStorage.getItem(storageKey) === '1'; } catch { return false; }
  });
  const toggle = () => setCollapsed(c => {
    const n = !c;
    try { localStorage.setItem(storageKey, n ? '1' : '0'); } catch { /* stockage indisponible */ }
    return n;
  });
  /* LE rendu d'une entrée — partagé par la navigation ET le pied. Les deux passent
     forcément par ici : c'est ce qui rend une divergence impossible. */
  const rendreEntree = (it: SidebarItem): JSX.Element => {
    /* Avec `linkAs`, la destination part en `to` — la prop des routeurs clients. Sans lui,
       on retombe sur `<a href>`, et sans destination du tout sur un `<button>`. */
    /* Désactivée : jamais un lien (rien à suivre), un <button> inerte qui garde sa place. */
    const Tag = (it.href && !it.disabled ? (linkAs ?? 'a') : 'button') as ElementType;
    const destination = it.href && !it.disabled
      ? (linkAs ? { to: it.href } : { href: it.href })
      : { type: 'button' as const };
    return (
      <Tag
        key={it.label}
        {...destination}
        className={cn('ds-sidenav', it.active && 'is-active', it.disabled && 'is-disabled')}
        aria-current={it.active ? 'page' : undefined}
        aria-disabled={it.disabled || undefined}
        disabled={it.disabled && Tag === 'button' ? true : undefined}
        title={collapsed ? it.label : undefined}
        onClick={it.disabled ? undefined : it.onClick}
      >
        {it.icon}<span className="ds-sidenav__label">{it.label}</span>
        {it.badge ? <span className="ds-sidenav__badge">{it.badge}</span> : null}
      </Tag>
    );
  };

  return (
    <Fragment>
      {open ? <div className="ds-appshell__scrim" onClick={onClose} /> : null}
      <aside
        className={cn('ds-sidebar', collapsed && 'is-collapsed', open && 'is-open', staticLayout && 'ds-sidebar--static', className)}
        {...rest}
      >
        <div className="ds-sidebar__head">
          {collapsed
            ? brandCollapsed ?? <Logo variant="monogram" height="1.5rem" />
            : brand ?? <Logo variant="wordmark" height="1.25rem" />}
          {collapsible ? (
            <button
              type="button"
              className="ds-sidebar__toggle"
              aria-label={collapsed ? 'Déplier la navigation' : 'Replier la navigation'}
              aria-expanded={!collapsed}
              onClick={toggle}
            >
              <Icon name="panel-left" />
            </button>
          ) : null}
        </div>
        <nav className="ds-sidebar__nav">
          {/* Chaque section est un GROUPE — v0.3.0. C'est le gap de la nav qui sépare
              les groupes, celui du groupe qui sépare ses entrées : deux sections SANS
              titre se distinguent désormais aussi (avant, seule la marge du titre les
              espaçait). Voir le commentaire de .ds-sidebar__nav dans patterns.css. */}
          {sections.map((s, i) => (
            <div key={i} className="ds-sidebar__group">
              {s.title ? <span className="ds-sidebar__title">{s.title}</span> : null}
              {(s.items || []).map(rendreEntree)}
            </div>
          ))}
        </nav>
        {footerItems.length ? (
          <div className="ds-sidebar__footnav">{footerItems.map(rendreEntree)}</div>
        ) : null}
        {footer ? <div className="ds-sidebar__foot">{footer}</div> : null}
        {children}
      </aside>
    </Fragment>
  );
}
