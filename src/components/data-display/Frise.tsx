import type { JSX, OlHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** L'état d'un jalon : `done` fait, `current` en cours, `upcoming` à venir (défaut). */
export type FriseState = 'done' | 'current' | 'upcoming';

/** Le ton de la pastille d'un jalon à venir (les tons de `Pastille`). */
export type FriseTone = 'amber' | 'coral' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

export interface FriseStep {
  /** La date, déjà formatée par l'app (« Aujourd'hui », « 24/10/2026 », « 17/10 »). */
  date: ReactNode;
  /** Le titre du jalon (« Ton abonnement démarre »). */
  title: ReactNode;
  /** Le glyphe de la pastille (`<Icon name="mail" />`, `<Icon glyph={CreditCard} />`) ; un jalon fait prend la coche. */
  icon: ReactNode;
  /** Le montant, facultatif (« 19 € par mois »). En `sm`, il suit le titre : « Premier paiement · 19 € ». */
  amount?: ReactNode;
  /** Le texte, facultatif, sous le titre. */
  text?: ReactNode;
  /** L'état. Défaut `upcoming`. */
  state?: FriseState;
  /** Le ton de la pastille d'un jalon à venir. Défaut `neutral` ; un jalon fait est `success`, un jalon en cours en dégradé. */
  tone?: FriseTone;
  /** Une clé stable, si le titre n'en est pas une. */
  id?: string;
}

/**
 * La frise à jalons — v0.10.0, maquettes Onboarding Web (« Comment se passe ton essai », verticale) et
 * Facturation Web (la frise de l'essai dans la carte d'abonnement, horizontale). Sur les classes
 * `.ds-frise*` : mcp-ui les écrit sans React.
 *
 * Chaque jalon : une pastille à icône, une date, un titre, un montant et un texte facultatifs, un trait
 * vers le suivant. États : fait (succès), en cours (dégradé plein, lueur), à venir (ton choisi) ; le
 * trait est coloré jusqu'au jalon fait. `horizontal` redevient vertical sous 64 rem : rien ne défile.
 * `sm` : la frise compacte d'une carte. `plaque` : la plaque --background encadrée qui la porte.
 * Le DS ne formate rien : dates et montants viennent de l'app ; les libellés d'état lus par un lecteur
 * d'écran sont surchargeables (`stateLabels`).
 */
export interface FriseProps extends Omit<OlHTMLAttributes<HTMLOListElement>, 'children'> {
  steps: readonly FriseStep[];
  /** `vertical` (défaut) · `horizontal` (vertical sous 64 rem). */
  orientation?: 'vertical' | 'horizontal';
  /** `md` (défaut) : la frise d'un parcours · `sm` : la frise compacte d'une carte. */
  size?: 'md' | 'sm';
  /** La plaque --background encadrée (la frise posée dans une carte). */
  plaque?: boolean;
  /** Les libellés d'état lus par un lecteur d'écran. */
  stateLabels?: Partial<Record<FriseState, string>>;
}

const ETATS: Record<FriseState, string> = { done: 'Fait', current: 'En cours', upcoming: 'À venir' };

export function Frise({
  steps, orientation = 'vertical', size = 'md', plaque = false, stateLabels, className = '', ...rest
}: FriseProps): JSX.Element {
  const libelles = { ...ETATS, ...stateLabels };
  return (
    <ol
      className={cn('ds-frise', orientation === 'horizontal' && 'ds-frise--horizontal', size === 'sm' && 'ds-frise--sm', plaque && 'ds-frise--plaque', className)}
      {...rest}
    >
      {steps.map((s, i) => {
        const etat = s.state ?? 'upcoming';
        const ton = etat === 'done' ? 'success' : s.tone ?? 'neutral';
        return (
          <li
            key={s.id ?? i}
            className={cn('ds-frise__step', etat === 'done' && 'is-done', etat === 'current' && 'is-current')}
            aria-current={etat === 'current' ? 'step' : undefined}
          >
            <span className="ds-frise__rail" aria-hidden="true">
              <span className={cn('ds-pastille ds-frise__mark', etat !== 'current' && `ds-pastille--${ton}`)}>{s.icon}</span>
              <span className="ds-frise__line" />
            </span>
            <div className="ds-frise__body">
              <span className="ds-frise__sr">{libelles[etat]} : </span>
              <span className="ds-frise__date">{s.date}</span>
              {size === 'sm'
                ? <span className="ds-frise__title">{s.title}{s.amount ? <> · <span className="ds-frise__amount">{s.amount}</span></> : null}</span>
                : <>
                  <span className="ds-frise__title">{s.title}</span>
                  {s.amount ? <span className="ds-frise__amount">{s.amount}</span> : null}
                </>}
              {s.text ? <p className="ds-frise__text">{s.text}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
