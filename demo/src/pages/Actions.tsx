import { useState } from 'react';
import { Button, Icon, IconButton } from '@yunary/ds';
import { Block, Row, Section } from '../ui';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger', 'danger-soft'] as const;
/* `accent` n'existe que sur IconButton — Button attend son deuxième appelant. */
const ICON_VARIANTS = ['primary', 'secondary', 'ghost', 'danger', 'danger-soft', 'accent'] as const;

/* Le choix liste / calendrier de Mes contenus, cliquable : l'actif est enfoncé. */
function ChoixVue() {
  const [vue, setVue] = useState<'liste' | 'calendrier'>('calendrier');
  return (
    <Row>
      <div role="group" aria-label="Vue" className="flex gap-space-2">
        <IconButton label="Vue liste" variant="secondary" aria-pressed={vue === 'liste'} onClick={() => setVue('liste')}><Icon name="list" /></IconButton>
        <IconButton label="Vue calendrier" variant="secondary" aria-pressed={vue === 'calendrier'} onClick={() => setVue('calendrier')}><Icon name="calendar" /></IconButton>
      </div>
    </Row>
  );
}

export function ActionsPage() {
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Button" note="Rayon toujours --radius-md. Jamais un pill. Un seul bouton primaire par vue.">
        <Block label="Variantes" hint="primary porte seul le glow de marque ; secondary, ghost, danger et danger-soft n'en ont aucun. danger-soft = l'action destructrice secondaire (retirer, se déconnecter), la recette de l'IconButton du même nom ; danger reste l'action destructrice unique.">
          <Row>
            <Button variant="primary">Démarrer mes 7 jours</Button>
            <Button variant="secondary">Voir l'offre</Button>
            <Button variant="ghost">Annuler</Button>
            <Button variant="danger">Supprimer</Button>
            <Button variant="danger-soft" icon={<Icon name="trash-2" />}>Retirer</Button>
          </Row>
        </Block>

        <Block label="Tailles" hint="sm 2.375rem · md 3rem (aligné sur Input et Select) · lg 3.25rem.">
          {VARIANTS.map(v => (
            <Row key={v} label={v}>
              <Button variant={v} size="sm">Petite</Button>
              <Button variant={v} size="md">Moyenne</Button>
              <Button variant={v} size="lg">Grande</Button>
            </Row>
          ))}
        </Block>

        <Block label="États" hint="Les états forcés utilisent les classes de démonstration is-hover / is-active / is-focus de patterns.css.">
          {VARIANTS.map(v => (
            <Row key={v} label={v}>
              <Button variant={v}>Repos</Button>
              <Button variant={v} className="is-hover">Hover</Button>
              <Button variant={v} className="is-active">Press</Button>
              <Button variant={v} className="is-focus">Focus</Button>
              <Button variant={v} disabled>Désactivé</Button>
              <Button variant={v} loading>Génération…</Button>
            </Row>
          ))}
        </Block>

        <Block label="Icônes" hint="icon en tête, iconRight en fin. L'icône du chargement remplace celle de tête.">
          <Row>
            <Button variant="primary" size="lg" iconRight={<Icon name="arrow-right" />}>Démarrer mes 7 jours</Button>
            <Button variant="secondary" icon={<Icon name="external-link" />}>Voir la page</Button>
            <Button variant="ghost" size="sm" icon={<Icon name="copy" />}>Copier</Button>
            <Button variant="danger" icon={<Icon name="triangle-alert" />}>Supprimer</Button>
          </Row>
        </Block>

        <Block label="Surface" hint="Le squelette ne déduit pas la surface : secondary porte --secondary partout, donc auto est l'état normal. card force --background pour un conteneur qui n'a que l'apparence d'une carte. page force --secondary — inerte ici, prêt pour le jour où patterns.css déduira la surface et peindra un bouton posé sur un panneau imbriqué de la couleur de ce panneau.">
          <Row label="auto · card · page">
            <Button variant="secondary">auto</Button>
            <Button variant="secondary" surface="card">surface=card</Button>
            <Button variant="secondary" surface="page">surface=page</Button>
            <IconButton label="Fermer" variant="secondary" surface="card"><Icon name="x" /></IconButton>
          </Row>
        </Block>

        <Block label="Pleine largeur et lien">
          <Button variant="primary" fullWidth iconRight={<Icon name="arrow-right" />}>Brancher Yunary dans Claude</Button>
          <Button as="a" variant="secondary" href="#actions" icon={<Icon name="external-link" />}>Rendu en balise a</Button>
        </Block>
      </Section>

      <Section title="IconButton" note="Carré, rayon --radius-md. md fait 2.625rem — la cible de touche minimale. Jamais un pill.">
        <Block label="Variantes et tailles" hint="Les icônes ne portent aucun size : le créneau les dimensionne (sm 1rem · md 1.125rem). accent = fond --accent, sans bordure, icône --primary (corail) — l'état « sélectionné doux » d'un lien-icône. danger-soft = la corbeille : la paire de la pilule danger, sans bordure.">
          {ICON_VARIANTS.map(v => (
            <Row key={v} label={v}>
              <IconButton label="Copier" variant={v} size="sm"><Icon name="copy" /></IconButton>
              <IconButton label="Copier" variant={v} size="md"><Icon name="copy" /></IconButton>
              <IconButton label="Copier" variant={v} size="lg"><Icon name="copy" /></IconButton>
            </Row>
          ))}
        </Block>

        <Block label="Lien-icône" hint="as=a + href : clic-milieu, ouvrir dans un onglet, annonce de lien au lecteur d'écran. La variante accent remplace le détournement d'is-active + style inline.">
          <Row>
            <IconButton label="Boutique" variant="accent" as="a" href="#actions"><Icon name="external-link" /></IconButton>
            <IconButton label="Écrire" variant="secondary" as="a" href="#actions"><Icon name="mail" /></IconButton>
          </Row>
        </Block>

        <Block label="Choix de vue (aria-pressed)" hint="Le choix liste / calendrier de Mes contenus : deux secondaires, l'actif enfoncé. Plaque --accent, filet --primary, icône --primary-readable (0.11.1, la maquette).">
          <ChoixVue />
        </Block>

        <Block label="La corbeille" hint="danger-soft à côté de chaque ligne supprimable ; le danger plein reste l'action destructrice unique d'une vue (la modale de confirmation).">
          <Row>
            <IconButton label="Supprimer la vidéo" variant="danger-soft"><Icon name="trash-2" /></IconButton>
            <IconButton label="Supprimer la vidéo" variant="danger-soft" size="sm"><Icon name="trash-2" /></IconButton>
            <IconButton label="Supprimer la vidéo" variant="danger-soft" className="is-hover"><Icon name="trash-2" /></IconButton>
            <IconButton label="Supprimer" variant="danger"><Icon name="trash-2" /></IconButton>
          </Row>
        </Block>

        <Block label="États">
          {ICON_VARIANTS.map(v => (
            <Row key={v} label={v}>
              <IconButton label="Repos" variant={v}><Icon name="menu" /></IconButton>
              <IconButton label="Hover" variant={v} className="is-hover"><Icon name="menu" /></IconButton>
              <IconButton label="Focus" variant={v} className="is-focus"><Icon name="menu" /></IconButton>
              <IconButton label="Actif" variant={v} className="is-active"><Icon name="menu" /></IconButton>
              <IconButton label="Désactivé" variant={v} disabled><Icon name="menu" /></IconButton>
            </Row>
          ))}
        </Block>
      </Section>
    </div>
  );
}
