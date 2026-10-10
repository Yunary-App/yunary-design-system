import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { BRAND_MONOGRAM, BRAND_NAME } from '../../brand';

/**
 * L'avatar — v0.6.0, réécrit sur les classes `.ds-avatar*` : rond, aux tailles des pastilles ; une photo
 * en cover, ou des initiales. Trois tons d'initiales : `muted` (défaut, en sourdine), `neutral` (sur
 * --secondary, à l'encre), `brand` (sur le dégradé, en blanc, face display). `ring` : l'anneau de
 * 2 px en dégradé (la créatrice analysée) ; `badge` : une pastille de réseau en bas à droite ; `halo` :
 * le halo de marque derrière un portrait détouré (était le défaut : il ne l'est plus, le portrait de
 * page le demande, les sept autres usages des maquettes non).
 *
 * Le monogramme de repli vient de `src/brand.ts` ; la prop `initials` l'emporte.
 */
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** La photo (cover, rond). */
  src?: string;
  /** Texte alternatif. Défaut : `BRAND_NAME` de `src/brand.ts`. */
  alt?: string;
  /** Les initiales de repli, sans `src` (une ou deux lettres). Défaut : `BRAND_MONOGRAM`. */
  initials?: string;
  /** puce 28 · carte 36 · dialogue 42 · panneau 52 · heros 64 (défaut) · ecran 80. Une longueur rem reste acceptée. */
  size?: 'puce' | 'carte' | 'dialogue' | 'panneau' | 'heros' | 'ecran' | (string & {});
  /** Le ton des initiales. */
  tone?: 'muted' | 'neutral' | 'brand';
  /** L'anneau de 2 px en dégradé. */
  ring?: boolean;
  /** Une pastille en bas à droite — `<Reseau size="sm" />`. */
  badge?: ReactNode;
  /** Le halo de marque derrière (portrait détouré d'une page). Défaut false. */
  halo?: boolean;
  /** La surface qui détoure le badge : `card` (défaut) ou `page`. */
  surface?: 'card' | 'page';
}

const TAILLES = new Set(['puce', 'carte', 'dialogue', 'panneau', 'heros', 'ecran']);

export function Avatar({
  src, alt = BRAND_NAME, initials = BRAND_MONOGRAM, size = 'heros', tone = 'muted', ring = false,
  badge, halo = false, surface = 'card', className = '', style, ...rest
}: AvatarProps): JSX.Element {
  const nommee = TAILLES.has(size);
  return (
    <span
      className={cn(
        'ds-avatar', nommee && `ds-avatar--${size}`, tone !== 'muted' && `ds-avatar--${tone}`,
        ring && 'ds-avatar--ring', surface === 'page' && 'ds-avatar--on-page', className,
      )}
      style={nommee ? style : { width: size, height: size, ...style }}
      {...rest}
    >
      {halo ? <span className="ds-avatar__halo" aria-hidden="true" /> : null}
      {src
        ? <img className="ds-avatar__img" src={src} alt={alt} />
        : <span className="ds-avatar__initials" role="img" aria-label={alt}>{initials}</span>}
      {badge ? <span className="ds-avatar__badge">{badge}</span> : null}
    </span>
  );
}
