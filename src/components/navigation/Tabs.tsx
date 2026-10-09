import { useRef } from 'react';
import type { HTMLAttributes, JSX, KeyboardEvent, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Segmented tab group on the control rail. The bar ALWAYS contrasts with its host
 * surface: --secondary on the page; inside a Card the bar deduces --background by itself
 * (patterns.css) — set `onCard` only for other containers that need the recessed regime.
 * Rectangle radii (0.875rem bar · --radius-sm tab) — never a pill, never blended in.
 *
 * DEUX MODES, UN RENDU. `tabs` (défaut) filtre un contenu en place : `tablist` / `tab` +
 * `aria-selected`. `choice` choisit UNE VALEUR parmi trois ou quatre (un niveau de langue, un
 * degré) : `radiogroup` / `radio` + `aria-checked`, un seul arrêt de tabulation (la valeur
 * choisie), et les flèches déplacent le choix — la sémantique d'un groupe de radios, le
 * visuel de la barre d'onglets. Le groupe se nomme par `aria-label` (ou `aria-labelledby`).
 */
export interface TabItem { value: string; label: ReactNode; disabled?: boolean }

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items?: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  /** The bar sits on a Card — swaps the background to --background for contrast. */
  onCard?: boolean;
  /** `tabs` (défaut) : onglets qui filtrent un contenu · `choice` : choix d'une valeur (radiogroup). */
  mode?: 'tabs' | 'choice';
  /** La barre prend toute la largeur, les onglets se la partagent à parts égales. */
  fullWidth?: boolean;
  /** Tout le groupe inerte. Un item seul se désactive par `items[i].disabled`. */
  disabled?: boolean;
  /**
   * Mode `choice` : la valeur se lit et reste focusable, mais ne change ni au clic ni au
   * clavier (`aria-readonly`). Les flèches déplacent encore le focus.
   */
  readOnly?: boolean;
  /** `sm` (v0.4.0) : la barre compacte, sur le rail sm — un filtre posé dans une carte d'écran. */
  size?: 'md' | 'sm';
}

export function Tabs({
  items = [], value, onChange, onCard = false, mode = 'tabs', fullWidth = false,
  disabled = false, readOnly = false, size = 'md', className = '', ...rest
}: TabsProps): JSX.Element {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const choice = mode === 'choice';
  const actifs = items.map((it, i) => (disabled || it.disabled ? -1 : i)).filter(i => i >= 0);
  /* Le seul arrêt de tabulation d'un groupe de choix : la valeur choisie, ou le premier item
     actif si aucune ne l'est. */
  const arret = Math.max(items.findIndex(it => it.value === value && !it.disabled), -1);
  const tabStop = arret >= 0 ? arret : actifs[0] ?? -1;

  const choisir = (v: string) => { if (!readOnly && onChange) onChange(v); };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (!choice || actifs.length === 0) return;
    const pos = actifs.indexOf(i);
    let cible: number | undefined;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') cible = actifs[(pos + 1) % actifs.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') cible = actifs[(pos - 1 + actifs.length) % actifs.length];
    else if (e.key === 'Home') cible = actifs[0];
    else if (e.key === 'End') cible = actifs[actifs.length - 1];
    if (cible === undefined) return;
    e.preventDefault();
    refs.current[cible]?.focus();
    /* Comme un groupe de radios natif : le choix suit le focus. */
    choisir(items[cible].value);
  };

  return (
    <div
      className={cn('ds-tabs', onCard && 'ds-tabs--on-card', fullWidth && 'ds-tabs--block', size === 'sm' && 'ds-tabs--sm', className)}
      role={choice ? 'radiogroup' : 'tablist'}
      aria-disabled={disabled || undefined}
      aria-readonly={choice && readOnly ? true : undefined}
      {...rest}
    >
      {items.map((it, i) => {
        const on = value === it.value;
        return (
          <button
            key={it.value}
            ref={el => { refs.current[i] = el; }}
            type="button"
            role={choice ? 'radio' : 'tab'}
            className="ds-tab"
            aria-selected={choice ? undefined : on}
            aria-checked={choice ? on : undefined}
            tabIndex={choice ? (i === tabStop ? 0 : -1) : undefined}
            disabled={disabled || it.disabled}
            onClick={() => (choice ? choisir(it.value) : onChange && onChange(it.value))}
            onKeyDown={e => onKeyDown(e, i)}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
