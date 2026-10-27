import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type {
  ButtonHTMLAttributes, ChangeEvent, FocusEvent, JSX, KeyboardEvent, MouseEvent, Ref, SelectHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { Icon } from '../icons/Icon';

/**
 * La liste déroulante — v0.12.0 (décision D-010) : le champ fermé est celui d'avant (`.ds-input` sur
 * le rail, chevron Lucide), mais il n'ouvre plus la liste du navigateur. Il ouvre une liste dessinée
 * avec les classes du menu (`.ds-dropdown`, `__item`, `__check`) : l'élément choisi coché, survol,
 * défilement quand elle est longue.
 *
 * LE MOTIF est le « combobox select-only » du W3C APG. Le champ est un `<button role="combobox">` :
 * un bouton est LABELLISABLE, donc un `<label htmlFor>` (FormField) ou un `<label>` qui l'enveloppe
 * le nomme comme il nommait le `<select>`. Le focus reste sur le champ ; l'option active est
 * désignée par `aria-activedescendant`. Clavier : ↓ ↑ Entrée Espace ouvrent ; dans la liste, ↓ ↑,
 * Début, Fin, Page ↑ ↓ déplacent, Entrée et Espace choisissent, Alt + ↑ choisit, Tab choisit et
 * passe au suivant, Échap ferme sans changer ; les premières lettres d'une option la trouvent
 * (accents ignorés), et ouvrent la liste si elle est fermée.
 *
 * UN `<select>` NATIF CACHÉ reste dans le champ, synchronisé : il porte `name`, `autoComplete`,
 * `required`, `form` et la valeur de formulaire, et c'est LUI qui émet `onChange`. Le choix d'une
 * option pose sa valeur puis déclenche un vrai événement `change` : l'appelant reçoit le même
 * `ChangeEvent<HTMLSelectElement>` qu'avant (`e.target.value`). L'autoremplissage du navigateur
 * (le pays d'une page de paiement) remplit ce `<select>` comme avant, et le champ suit. Il est
 * transparent, posé sous le champ (sans `display:none`, que les navigateurs n'autoremplissent pas),
 * hors de l'ordre de tabulation et masqué aux lecteurs d'écran ; un focus qui l'atteint (la ref,
 * une validation) passe au champ. La ref transmise est la sienne, comme avant.
 *
 * LA LISTE passe par un portail : une carte ou un tableau en `overflow:hidden` ne la coupe jamais. Elle
 * va dans la FENÊTRE MODALE qui contient le champ, sinon dans le `<body>` (v0.12.1, voir `couche`) : posée
 * dans le `<body>`, une feuille plein écran d'app à `aria-modal` (rang --z-modal) la cachait. Elle s'ouvre
 * sous le champ, au-dessus quand la place manque en bas, défile au-delà de `--dropdown-list-h`, ne sort
 * jamais de l'écran, suit le champ quand la page défile, et se ferme au clic dehors. Elle prend la
 * largeur du champ, ou celle de sa plus longue option si elle est plus large (v0.12.2), et le thème
 * sombre d'un ancêtre `.dark`. Sur une carte comme sur la page, elle est sur `--popover`, jamais la
 * couleur de sa surface. Ses options sont en semi-gras, l'option active se voit par sa plaque seule,
 * comme un onglet (v0.12.2, D-019).
 */
export interface SelectOption { value: string; label: string }

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options?: SelectOption[];
  invalid?: boolean;
  /** 'page' (default) = sits directly on the layout (fill --secondary) · 'card' = inside a card (fill --background). */
  surface?: 'page' | 'card';
}

/** Une option se compare sans casse ni accents (« e » trouve « États-Unis »). */
const plier = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Le texte d'un libellé sans le champ qu'il enveloppe (sa valeur, les options du <select> caché). */
function texteDuLibelle(label: HTMLLabelElement | undefined): string | undefined {
  if (!label) return undefined;
  let texte = '';
  const lire = (n: Node): void => {
    if (n instanceof HTMLElement && n.classList.contains('ds-select')) return;
    if (n.nodeType === Node.TEXT_NODE) texte += n.textContent ?? '';
    n.childNodes.forEach(lire);
  };
  lire(label);
  return texte.replace(/\s+/g, ' ').trim() || undefined;
}

/**
 * La couche de la liste (v0.12.1) : la fenêtre modale la plus proche du champ, sinon le `<body>`. Une Modal
 * du DS la reçoit dans son voile (`.ds-scrim`, comme en 0.12.0 : son panneau glisse en transform à
 * l'ouverture) ; toute autre fenêtre à `aria-modal="true"` (une feuille plein écran d'app) ou un `<dialog>`
 * ouvert, en elle-même. Dans sa fenêtre, la liste passe au-dessus d'elle quel que soit son rang, et reste
 * dans ce qu'un lecteur d'écran laisse joindre (`aria-modal` rend le reste inerte).
 */
function couche(champ: HTMLElement): HTMLElement {
  const fenetre = champ.closest<HTMLElement>('.ds-scrim, [aria-modal="true"], dialog[open]');
  if (!fenetre) return document.body;
  return (fenetre.matches('.ds-modal') && fenetre.closest<HTMLElement>('.ds-scrim')) || fenetre;
}

/** L'option dont le libellé commence par `cherche`, à partir de `depart`, en bouclant. */
function trouver(options: readonly SelectOption[], cherche: string, depart: number): number {
  const n = options.length;
  for (let k = 0; k < n; k++) {
    const i = (depart + k) % n;
    if (plier(options[i].label).startsWith(cherche)) return i;
  }
  return -1;
}

const PAGE = 10;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({
  options = [], invalid = false, surface = 'page', className = '', style, id, disabled,
  value, defaultValue, onChange, onInput, onInvalid, name, autoComplete, required, form,
  multiple: _multiple, size: _size,
  onClick, onKeyDown, onKeyUp, onFocus, onBlur, onMouseDown,
  ...rest
}: SelectProps, ref): JSX.Element {
  const champRef = useRef<HTMLButtonElement>(null);
  const natifRef = useRef<HTMLSelectElement | null>(null);
  const listeRef = useRef<HTMLDivElement>(null);
  const listeId = useId();
  const optionId = (i: number): string => `${listeId}-o${i}`;

  const controle = value !== undefined;
  const [interne, setInterne] = useState<string>(() => (defaultValue !== undefined ? String(defaultValue) : ''));
  const courant = controle ? String(value) : interne;
  /* Comme un <select> natif : une valeur qui ne correspond à aucune option affiche la première. */
  const trouve = options.findIndex(o => o.value === courant);
  const choisi = trouve >= 0 ? trouve : options.length ? 0 : -1;

  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(-1);
  const [cadre, setCadre] = useState<{ cible: HTMLElement; sombre: boolean; nom?: string } | null>(null);
  const tampon = useRef({ texte: '', minuteur: 0 as ReturnType<typeof setTimeout> | 0 });
  const plafond = useRef(0);
  const centrer = useRef(false);
  const souris = useRef(false);

  const poserNatif = useCallback((el: HTMLSelectElement | null) => {
    natifRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as { current: HTMLSelectElement | null }).current = el;
  }, [ref]);

  const ouvrir = (i: number): void => {
    const champ = champRef.current;
    if (!champ || disabled || !options.length) return;
    const nomRelie = texteDuLibelle(champ.labels?.[0]);
    setCadre({
      cible: couche(champ),
      sombre: !!champ.closest('.dark'),
      nom: rest['aria-label'] ?? (rest['aria-labelledby'] ? undefined : nomRelie),
    });
    centrer.current = true;
    souris.current = false;
    setActif(Math.min(Math.max(i, 0), options.length - 1));
    setOuvert(true);
    if (document.activeElement !== champ) champ.focus({ preventScroll: true });
  };

  const fermer = (rendreFocus: boolean): void => {
    setOuvert(false);
    if (rendreFocus) champRef.current?.focus({ preventScroll: true });
  };

  /** Le choix d'une option : la valeur posée sur le <select> natif, puis un vrai `change`. */
  const choisir = (i: number): void => {
    fermer(true);
    const natif = natifRef.current;
    if (!natif || i < 0 || i >= options.length || i === natif.selectedIndex) return;
    natif.selectedIndex = i;
    natif.dispatchEvent(new Event('input', { bubbles: true }));
    natif.dispatchEvent(new Event('change', { bubbles: true }));
  };

  /** Les premières lettres : un tampon de 500 ms ; une même lettre répétée passe à l'option suivante. */
  const chercher = (car: string): void => {
    const t = tampon.current;
    clearTimeout(t.minuteur);
    t.texte += plier(car);
    t.minuteur = setTimeout(() => { t.texte = ''; }, 500);
    const base = ouvert ? actif : choisi;
    let i = trouver(options, t.texte, t.texte.length === 1 ? base + 1 : Math.max(base, 0));
    if (i < 0 && [...t.texte].every(c => c === t.texte[0])) i = trouver(options, t.texte[0], base + 1);
    if (i < 0) return;
    if (ouvert) setActif(i);
    else ouvrir(i);
  };

  const surTouche = (e: KeyboardEvent<HTMLButtonElement>): void => {
    (onKeyDown as ((ev: KeyboardEvent<HTMLButtonElement>) => void) | undefined)?.(e);
    if (e.defaultPrevented || disabled) return;
    souris.current = false;
    const dernier = options.length - 1;
    const lettre = e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (!ouvert) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); ouvrir(choisi); }
      else if (e.key === 'Home') { e.preventDefault(); ouvrir(0); }
      else if (e.key === 'End') { e.preventDefault(); ouvrir(dernier); }
      else if (lettre) { e.preventDefault(); chercher(e.key); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActif(a => Math.min(a + 1, dernier)); break;
      case 'ArrowUp':
        e.preventDefault();
        if (e.altKey) choisir(actif);
        else setActif(a => Math.max(a - 1, 0));
        break;
      case 'Home': e.preventDefault(); setActif(0); break;
      case 'End': e.preventDefault(); setActif(dernier); break;
      case 'PageUp': e.preventDefault(); setActif(a => Math.max(a - PAGE, 0)); break;
      case 'PageDown': e.preventDefault(); setActif(a => Math.min(a + PAGE, dernier)); break;
      case 'Enter': case ' ': e.preventDefault(); choisir(actif); break;
      case 'Tab': choisir(actif); break;
      default: if (lettre) { e.preventDefault(); chercher(e.key); }
    }
  };

  /* Espace active un bouton au relâchement : le geste est déjà traité à l'appui. */
  const surRelache = (e: KeyboardEvent<HTMLButtonElement>): void => {
    (onKeyUp as ((ev: KeyboardEvent<HTMLButtonElement>) => void) | undefined)?.(e);
    if (e.key === ' ') e.preventDefault();
  };

  const surClic = (e: MouseEvent<HTMLButtonElement>): void => {
    (onClick as ((ev: MouseEvent<HTMLButtonElement>) => void) | undefined)?.(e);
    if (e.defaultPrevented || disabled) return;
    if (ouvert) fermer(true);
    else ouvrir(choisi);
  };

  const surSortie = (e: FocusEvent<HTMLButtonElement>): void => {
    (onBlur as ((ev: FocusEvent<HTMLButtonElement>) => void) | undefined)?.(e);
    if (ouvert && !listeRef.current?.contains(e.relatedTarget as Node | null)) fermer(false);
  };

  const surNatif = (e: ChangeEvent<HTMLSelectElement>): void => {
    if (!controle) setInterne(e.target.value);
    onChange?.(e);
  };

  /* La liste se place sous le champ, ou au-dessus si la place manque, sans jamais sortir de l'écran. */
  const placer = useCallback(() => {
    const champ = champRef.current, liste = listeRef.current;
    if (!champ || !liste) return;
    const r = champ.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const ecart = 0.375 * rem, marge = 0.5 * rem;
    /* Au moins la largeur du champ, et celle de sa plus longue option (v0.12.2, D-019 : un champ étroit à
       390 coupait « Toutes les sources » en deux lignes), sans dépasser l'écran moins ses marges. Arrondie au
       pixel supérieur : `offsetWidth` arrondit au plus proche, et une fraction de pixel en moins renvoie le
       dernier mot à la ligne. */
    liste.style.width = 'max-content';
    const largeur = Math.min(Math.max(r.width, Math.ceil(liste.getBoundingClientRect().width)), vw - 2 * marge);
    liste.style.width = `${largeur}px`;
    const naturelle = Math.min(liste.scrollHeight + liste.offsetHeight - liste.clientHeight, plafond.current || Infinity);
    const dessous = vh - r.bottom - ecart - marge, dessus = r.top - ecart - marge;
    const enHaut = naturelle > dessous && dessus > dessous;
    const h = Math.max(0, Math.min(naturelle, enHaut ? dessus : dessous));
    liste.style.maxHeight = `${h}px`;
    const x = Math.max(marge, Math.min(r.left, vw - marge - largeur)), y = enHaut ? r.top - ecart - h : r.bottom + ecart;
    liste.style.left = `${x}px`;
    liste.style.top = `${y}px`;
    /* Dans une fenêtre transformée ou filtrée (un panneau qui glisse, un voile en backdrop-filter), le repère
       de `position:fixed` est la fenêtre, plus l'écran : l'écart mesuré se rattrape. */
    const p = liste.getBoundingClientRect();
    if (Math.abs(p.left - x) > 0.5 || Math.abs(p.top - y) > 0.5) {
      liste.style.left = `${2 * x - p.left}px`;
      liste.style.top = `${2 * y - p.top}px`;
    }
  }, []);

  /* À l'ouverture : le plafond de la feuille (lu avant que la place ne le réduise), la place. */
  useLayoutEffect(() => {
    const liste = listeRef.current;
    if (!ouvert || !liste) return;
    if (!liste.style.maxHeight) plafond.current = parseFloat(getComputedStyle(liste).maxHeight) || 0;
    placer();
  }, [ouvert, cadre, options.length, placer]);

  /* L'option active reste visible : au centre à l'ouverture, au plus près ensuite — pas quand c'est la
     souris qui la désigne (la liste glisserait sous elle). */
  useLayoutEffect(() => {
    const liste = listeRef.current;
    if (!ouvert || !liste || actif < 0 || souris.current) return;
    const o = liste.children[actif] as HTMLElement | undefined;
    if (!o) return;
    if (centrer.current) {
      centrer.current = false;
      liste.scrollTop = o.offsetTop - (liste.clientHeight - o.offsetHeight) / 2;
    } else if (o.offsetTop < liste.scrollTop) liste.scrollTop = o.offsetTop - liste.clientTop;
    else if (o.offsetTop + o.offsetHeight > liste.scrollTop + liste.clientHeight)
      liste.scrollTop = o.offsetTop + o.offsetHeight - liste.clientHeight;
  }, [ouvert, actif]);

  /* Ouverte : Échap (avant le piège d'une Modal, qui la fermerait), clic dehors, défilement, taille. */
  useEffect(() => {
    if (!ouvert) return undefined;
    let image = 0;
    const replacer = (e?: Event): void => {
      if (e && e.target === listeRef.current) return;
      cancelAnimationFrame(image);
      image = requestAnimationFrame(placer);
    };
    const echap = (e: globalThis.KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      fermer(true);
    };
    /* Le libellé du champ compte comme le champ : son clic referme la liste, comme le champ. Il ne
       prend pas le focus en passant (sinon la liste se fermerait au départ du focus, puis le clic du
       libellé la rouvrirait). */
    const surLibelle = (cible: Node): boolean =>
      !!champRef.current?.labels && Array.from(champRef.current.labels).some(l => l.contains(cible));
    const dehors = (e: PointerEvent): void => {
      const cible = e.target as Node;
      if (champRef.current?.contains(cible) || listeRef.current?.contains(cible) || surLibelle(cible)) return;
      setOuvert(false);
    };
    const garderFocus = (e: globalThis.MouseEvent): void => {
      if (surLibelle(e.target as Node) && !champRef.current?.contains(e.target as Node)) e.preventDefault();
    };
    window.addEventListener('keydown', echap, true);
    document.addEventListener('pointerdown', dehors, true);
    document.addEventListener('mousedown', garderFocus, true);
    window.addEventListener('resize', replacer);
    window.addEventListener('scroll', replacer, true);
    return () => {
      cancelAnimationFrame(image);
      window.removeEventListener('keydown', echap, true);
      document.removeEventListener('pointerdown', dehors, true);
      document.removeEventListener('mousedown', garderFocus, true);
      window.removeEventListener('resize', replacer);
      window.removeEventListener('scroll', replacer, true);
    };
  }, [ouvert, placer]);

  /* Désactivé ou vidé pendant qu'elle est ouverte : elle se ferme ; l'option active reste dans la liste. */
  useEffect(() => {
    if (ouvert && (disabled || !options.length)) setOuvert(false);
    else if (ouvert && actif > options.length - 1) setActif(options.length - 1);
  }, [ouvert, disabled, options.length, actif]);

  useEffect(() => () => clearTimeout(tampon.current.minuteur), []);

  const bouton = rest as unknown as ButtonHTMLAttributes<HTMLButtonElement>;
  const libelle = choisi >= 0 ? options[choisi].label : '';

  return (
    <span className="ds-select">
      <button
        {...bouton}
        ref={champRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        aria-controls={ouvert ? listeId : undefined}
        aria-activedescendant={ouvert && actif >= 0 ? optionId(actif) : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        className={cn('ds-input ds-select__trigger', surface === 'card' && 'ds-input--on-card', invalid && 'is-error', className)}
        style={style}
        onClick={surClic}
        onKeyDown={surTouche}
        onKeyUp={surRelache}
        onFocus={onFocus as ((ev: FocusEvent<HTMLButtonElement>) => void) | undefined}
        onBlur={surSortie}
        onMouseDown={onMouseDown as ((ev: MouseEvent<HTMLButtonElement>) => void) | undefined}
      >
        <span className="ds-select__value">{libelle}</span>
      </button>
      <select
        ref={poserNatif as Ref<HTMLSelectElement>}
        className="ds-select__native"
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        autoComplete={autoComplete}
        required={required}
        form={form}
        disabled={disabled}
        {...(controle ? { value: courant } : { defaultValue })}
        onChange={surNatif}
        onInput={onInput}
        onInvalid={onInvalid}
        onFocus={() => champRef.current?.focus()}
      >
        {options.map((o, i) => <option key={`${i}:${o.value}`} value={o.value}>{o.label}</option>)}
      </select>
      {/* Sans taille : le créneau du déclencheur rend 1rem (patterns.css, v0.3.0). */}
      <Icon name="chevron-down" className="ds-select__chev" />
      {ouvert && cadre ? createPortal(
        <div
          ref={listeRef}
          id={listeId}
          role="listbox"
          aria-label={cadre.nom}
          aria-labelledby={cadre.nom ? undefined : rest['aria-labelledby']}
          tabIndex={-1}
          className={cn('ds-dropdown ds-dropdown--liste', cadre.sombre && 'dark')}
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
          onClick={e => e.stopPropagation()}
        >
          {options.map((o, i) => (
            <div
              key={`${i}:${o.value}`}
              id={optionId(i)}
              role="option"
              aria-selected={i === choisi}
              className={cn('ds-dropdown__item', i === choisi && 'is-checked', i === actif && 'is-hover')}
              onClick={() => choisir(i)}
              onMouseMove={() => { if (i !== actif) { souris.current = true; setActif(i); } }}
            >
              <span className="ds-dropdown__label">{o.label}</span>
              {i === choisi ? <span className="ds-dropdown__check" aria-hidden="true"><Icon name="check" size="1rem" /></span> : null}
            </div>
          ))}
        </div>,
        cadre.cible,
      ) : null}
    </span>
  );
});
Select.displayName = 'Select';
