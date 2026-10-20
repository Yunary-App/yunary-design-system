import type { CSSProperties, JSX } from 'react';
import {
  ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, ArrowUpRight, BookOpen, Calendar, Check, ChevronDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleAlert, CircleCheck,
  CircleX, Clock, Code, Copy, Ellipsis, ExternalLink, FileText,
  Download, Info, LayoutDashboard, List, Lock, Mail, Menu, MessageSquare, Minus,
  PanelLeft, Pause, Pencil, Play, Plus, Search, Settings,
  Trash2, TrendingUp, TriangleAlert, Upload, User, Users, Video, VideoOff, X, Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Lucide icon renderer — the ONLY icon system in this design system.
 * BANNED: `sparkles` — the AI-slop star. Never reintroduce it, in the set or in an app.
 * Aucune marque dans le set : les réseaux et Claude sont des logos, dessinés par `Reseau`.
 * Le catalogue ne porte que les glyphes que les couches emploient (0.11.0) ; un tracé hors
 * catalogue passe par `glyph`.
 * Sizes are CSS lengths in rem (1rem / 1.25rem / 1.5rem); the 24x24 viewBox stays unitless.
 * stroke-width 2 by default, 2.5 inside pills, 3 for the check.
 */
export type IconName =
  | 'check' | 'x' | 'chevron-down' | 'chevron-right' | 'chevron-left'
  | 'arrow-right' | 'arrow-up-right' | 'arrow-down' | 'arrow-up' | 'arrow-up-down' | 'play' | 'clock'
  | 'calendar' | 'copy' | 'search' | 'menu' | 'mail' | 'triangle-alert' | 'info'
  | 'circle-check' | 'circle-alert' | 'circle-x' | 'code' | 'zap'
  | 'plus' | 'minus' | 'trash-2' | 'external-link'
  | 'trending-up' | 'user' | 'book-open'
  | 'message-square' | 'file-text'
  | 'chevrons-left' | 'chevrons-right' | 'ellipsis' | 'panel-left'
  | 'layout-dashboard' | 'video' | 'settings' | 'lock'
  | 'upload' | 'download' | 'pause' | 'video-off' | 'list' | 'pencil'
  | 'users';

/** Ce que tout rendu d'icône partage, quelle que soit la provenance du tracé. */
export interface IconBaseProps {
  /**
   * CSS length — always rem. OMISE, c'est la voie normale : le CRÉNEAU décide
   * (`--ds-icon-size` posé par une règle CSS — bouton sm, badge dense, pastille de
   * dialogue… — repli 1.25rem). Passée, elle écrit la propriété inline et GAGNE sur
   * le créneau : c'est la surcharge optique au site d'appel, et elle doit le rester.
   */
  size?: string;
  /** SVG stroke width in px (2 · 2.5 in pills · 3 for check). Default 2. */
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * DEUX FAÇONS DE NOMMER UN TRACÉ, ET UNE SEULE À LA FOIS.
 *
 * `name` puise dans le CATALOGUE — le jeu curé, celui qu'on relit, celui dont la doc
 * garantit qu'il existe. C'est la voie normale, et elle le reste.
 *
 * `glyph` prend un tracé lucide QUELCONQUE, importé par l'app. Il existe parce que le
 * manque n'était pas dans la librairie — lucide en compte ~1500 — mais dans la PORTE :
 * une icône absente du catalogue obligeait à publier une version du design system pour
 * une ligne. Désormais l'app importe son tracé et le socle lui applique ses propres
 * règles de taille et d'épaisseur. Le tree-shaking est conservé : l'import reste
 * statique, côté app.
 *
 * ⚠️ Les deux sont MUTUELLEMENT EXCLUSIFS, et c'est le TYPE qui l'impose (`?: never`) :
 * passer les deux est une erreur de compilation, pas une surprise au rendu où l'un
 * gagnerait silencieusement sur l'autre.
 *
 * ⚠️ Ce que `glyph` n'autorise PAS : dessiner son propre SVG. Le rendu reste celui du
 * socle — même grille 24, même épaisseur, même `aria-hidden`. Ce qui s'ouvre, c'est le
 * choix du tracé dans lucide, pas la liberté graphique.
 */
export type IconProps =
  | (IconBaseProps & {
      /** Lucide icon name, kebab-case (e.g. "circle-check", "arrow-right"). */
      name: IconName;
      glyph?: never;
    })
  | (IconBaseProps & {
      /** Tracé lucide importé par l'app, pour ce que le catalogue ne couvre pas. */
      glyph: LucideIcon;
      name?: never;
    });

/* Même jeu de noms que le composant Icon source — tracés fournis par lucide-react. */
const ICONS: Record<IconName, LucideIcon> = {
  'check': Check,
  'x': X,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'arrow-down': ArrowDown,
  /* v0.7.0 — les deux autres états d'un en-tête triable (Th sort) : croissant, non trié. */
  'arrow-up': ArrowUp,
  'arrow-up-down': ArrowUpDown,
  'play': Play,
  'clock': Clock,
  'calendar': Calendar,
  'copy': Copy,
  'search': Search,
  'menu': Menu,
  'mail': Mail,
  'triangle-alert': TriangleAlert,
  'info': Info,
  'circle-check': CircleCheck,
  'circle-alert': CircleAlert,
  'circle-x': CircleX,
  'code': Code,
  'zap': Zap,
  'trash-2': Trash2,
  'plus': Plus,
  'minus': Minus,
  'external-link': ExternalLink,
  'trending-up': TrendingUp,
  'user': User,
  'book-open': BookOpen,
  'message-square': MessageSquare,
  'file-text': FileText,
  'chevrons-left': ChevronsLeft,
  'chevrons-right': ChevronsRight,
  'ellipsis': Ellipsis,
  'panel-left': PanelLeft,
  /* `layout-dashboard` — les quatre tuiles — annonce une GRILLE DE WIDGETS : un vrai tableau de bord. */
  'layout-dashboard': LayoutDashboard,
  'video': Video,
  'settings': Settings,
  /* Le cadenas d'un champ verrouillé (`Input iconEnd`) — une valeur qui se lit sans se changer. */
  'lock': Lock,
  /* v0.4.0 — le dépôt et l'envoi d'un fichier, la vidéo absente, la vue en liste, modifier : attestés
     dans le hub ET dans les écrans de Claude (maquettes Script et Programmation). */
  'upload': Upload,
  'download': Download,
  'pause': Pause,
  'video-off': VideoOff,
  'list': List,
  'pencil': Pencil,
  'users': Users,
};

export function Icon({
  name, glyph, size, strokeWidth = 2, className = '', style, ...rest
}: IconProps): JSX.Element | null {
  /* `glyph` d'abord : quand il est là, `name` est `never` — il n'y a rien à départager. */
  const Icône = glyph ?? (name ? ICONS[name] : undefined);
  if (!Icône) return null;
  /* ⚠️ PAS DE DÉFAUT SUR `size`, et c'est le cœur de la v0.3.0 : un défaut de paramètre
     écrit inline aurait existé À CHAQUE RENDU — aucune règle CSS n'aurait jamais pu
     dimensionner un créneau. Le défaut vit dans le repli de `var(--ds-icon-size, 1.25rem)`,
     côté cascade, où un créneau peut le battre. */
  return <Glyph glyph={Icône} size={size} strokeWidth={strokeWidth} className={className} style={style} {...rest} />;
}

/**
 * Le RENDU nu, pour un tracé lucide quelconque. Interne au paquet : `name` et `glyph`
 * passent tous deux par lui, avec exactement les mêmes règles de taille et d'épaisseur.
 */
/* ⚠️ Étend `IconBaseProps`, PAS `Omit<IconProps, 'name'>` : depuis qu'`IconProps` est une
   union, un `Omit` dessus ne garderait que les clés COMMUNES aux deux branches et
   perdrait silencieusement `size`, `strokeWidth`, `className` et `style`. */
export interface GlyphProps extends IconBaseProps { glyph: LucideIcon }

export function Glyph({
  glyph: G, size, strokeWidth = 2, className, style, ...rest
}: GlyphProps): JSX.Element {
  /* Les QUATRE déclarations qui vivaient ici en inline — width, height, flex, display —
     sont parties dans `.ds-icon` (patterns.css) : inline, elles étaient hors de portée
     de toute règle. Ne reste inline que l'écriture de `--ds-icon-size`, et SEULEMENT
     quand l'appelant passe `size` : c'est le style inline légitime — la valeur vient de
     l'appelant à ce rendu — et c'est ce qui fait gagner le site d'appel sur le créneau. */
  const taille = size !== undefined
    ? ({ '--ds-icon-size': size } as CSSProperties)
    : undefined;
  return (
    <G
      className={className ? `ds-icon ${className}` : 'ds-icon'}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      focusable="false"
      /* La taille est une longueur CSS (rem) — le viewBox 24x24 reste sans unité. */
      style={taille || style ? { ...taille, ...style } : undefined}
      {...rest}
    />
  );
}
