import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/* Un élément sorti de l'ordre de tabulation (`tabindex="-1"`) n'est pas un bord du piège : le <select>
   natif caché d'un Select (v0.12.0) en est un, et Tab doit boucler sur ce que la personne atteint. */
const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]',
].map(s => `${s}:not([tabindex="-1"])`).join(',');

export interface ModalSurfaceOptions {
  open?: boolean;
  /** Modal phase="loading" — keeps the focus trap, kills Escape. */
  locked?: boolean;
  onClose?: () => void;
  /** Specimen card: no scrim, no trap, no scroll lock. */
  inline?: boolean;
  /**
   * Where the focus lands on open.
   *
   * `container` (default) — the panel itself. It carries `role="dialog"`, `aria-modal` and an
   * accessible name, so a screen reader announces the dialog and reads its content. That is what
   * `Modal` needs: on a destructive confirmation, the TEXT must be heard before the action.
   * `first` — the first focusable child. For a sheet of actions with no message to hear, where
   * the first row is the right destination.
   *
   * Not a detail: in `Modal` the close button precedes the title in DOM order, so `first` would
   * land on « Fermer » before the question has been read out.
   */
  initialFocus?: 'container' | 'first';
}

/* ---------------------------------------------------------------------------
   Verrou de défilement — compteur de références.
   Une feuille basse ouverte alors que la page défile derrière elle est LE bug
   classique du bottom sheet, et il est certain ici puisque c'est l'usage visé.
   `overflow:hidden` et non `position:fixed` : le premier CONSERVE la position de
   défilement, le second l'écrase et impose une restauration qui scintille.
   La largeur de la barre est compensée, sinon la page saute de ~15 px à l'ouverture.
   Compteur : plusieurs surfaces modales peuvent coexister, on ne déverrouille qu'à la dernière.
   LIMITE CONNUE : sur iOS Safari, `overflow:hidden` sur `body` laisse passer le
   défilement par inertie dans certains cas. Le remède fiable est `position:fixed`,
   qui coûte le saut de position. Assumé et documenté plutôt que masqué.
   --------------------------------------------------------------------------- */
let verrous = 0;
let restaurer: { overflow: string; paddingRight: string } | null = null;

function verrouiller(): void {
  if (verrous++ > 0) return;
  const body = document.body;
  restaurer = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
  const barre = window.innerWidth - document.documentElement.clientWidth;
  if (barre > 0) {
    const actuel = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${actuel + barre}px`;
  }
  body.style.overflow = 'hidden';
}

function deverrouiller(): void {
  if (verrous > 0) verrous -= 1;
  if (verrous > 0 || !restaurer) return;
  document.body.style.overflow = restaurer.overflow;
  document.body.style.paddingRight = restaurer.paddingRight;
  restaurer = null;
}

/**
 * The system's ONE modal-surface behaviour: focus moved in, focus trapped, Escape closes,
 * focus restored to the opener on unmount, document scroll locked while open.
 * `locked` keeps the trap and kills Escape. Shared — any modal surface reuses this, it never rolls its own.
 */
export function useModalSurface({
  open = true, locked = false, onClose, inline = false, initialFocus = 'container',
}: ModalSurfaceOptions): RefObject<HTMLDivElement | null> {
  /* Le | null n'est pas décoratif : depuis @types/react 19, useRef<T>(null) rend
     RefObject<T | null> — l'annotation sans null ne compile plus sous 19, et elle
     reste correcte sous 18 (où RefObject<T>.current était déjà nullable). */
  const ref = useRef<HTMLDivElement>(null);

  /* `onClose` est presque toujours une lambda inline (`onClose={() => setOpen(false)}`) :
     nouvelle identité à chaque rendu du parent. Dans les dépendances de l'effet, elle
     forçait un cleanup/setup à CHAQUE rendu — le cleanup rendait le focus au déclencheur,
     le setup le reprenait au panneau : une frappe dans un champ de la modale perdait le
     focus. La ref porte la version courante sans relancer l'effet. */
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (inline || !open) return;
    const node = ref.current;
    const opener = document.activeElement as HTMLElement | null;
    const list = (): HTMLElement[] => (node ? Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)) : []);

    const first = list()[0];
    if (initialFocus === 'first' && first) first.focus();
    else if (node) { node.setAttribute('tabindex', '-1'); node.focus(); }
    else if (first) first.focus();

    verrouiller();

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') { e.preventDefault(); if (!locked) onCloseRef.current?.(); return; }
      if (e.key !== 'Tab') return;
      const f = list();
      if (f.length === 0) { e.preventDefault(); return; }
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      deverrouiller();
      opener?.focus?.();
    };
  }, [inline, open, locked, initialFocus]);

  return ref;
}
