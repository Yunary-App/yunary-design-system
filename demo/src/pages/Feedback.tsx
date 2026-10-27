import { Banner, Button, EmptyState, Icon, Pastille, Progress, Skeleton, Spinner } from '@yunary/ds';
import { Block, Grid, Row, Section, Stack } from '../ui';

export function FeedbackPage() {
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Banner" note="Message inline persistant, dans une page ou une card.">
        <Block label="Tons">
          <Stack>
            <Banner tone="info" title="Ton essai est lancé">Analyse, Script et Programmation sont ouverts pendant 7 jours.</Banner>
            <Banner tone="warning" title="Ta carte expire ce mois-ci">Mets-la à jour pour garder Yunary après ton essai.</Banner>
            <Banner tone="success" title="Analyse terminée">La fiche de ta vidéo est prête dans Claude.</Banner>
            <Banner tone="danger" title="Le paiement n'est pas passé">Ta banque l'a refusé. Rien n'a été débité.</Banner>
          </Stack>
        </Block>
        <Block label="Avec action">
          <Banner tone="warning" title="Ta carte expire ce mois-ci" action={<Button size="sm" variant="secondary">Mettre à jour</Button>}>
            Mets-la à jour pour garder Yunary après ton essai.
          </Banner>
        </Block>
      </Section>

      <Section title="EmptyState" note="Nommer le vide et donner l'étape suivante. Bordure pointillée, l'icône dans la pastille de marque des maquettes (panneau, carrée, brand, outlined — v0.12.0).">
        <Grid cols={2}>
          <Block label="Complet">
            <EmptyState
              icon={<Icon name="video" />}
              title="Aucune analyse ici"
              description="Demande à Claude d'analyser une vidéo : elle apparaîtra ici."
              action={<Button variant="secondary">Voir tout</Button>}
            />
          </Block>
          <Block label="Sans action">
            <EmptyState
              icon={<Icon name="search" />}
              title="Rien ne correspond"
              description="Essaie un autre mot-clé, ou repars de la liste complète."
            />
          </Block>
          <Block label="Tuile composée" hint="tile remplace la Pastille par défaut (panneau brand outlined) quand elle ne convient pas : icon est alors ignoré.">
            <EmptyState
              tile={<Pastille size="dialogue" tone="neutral"><Icon name="search" /></Pastille>}
              title="Aucun résultat"
              description="Essaie un autre mot-clé."
            />
          </Block>
        </Grid>
      </Section>

      <Section title="Spinner" note="Anneau en currentColor. C'est lui que Button affiche quand loading est vrai.">
        <Block label="Tailles">
          <Row>
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="2.5rem" />
          </Row>
          <Row label="couleur, suit currentColor">
            <span style={{ color: 'var(--primary)' }}><Spinner size="lg" /></span>
            <span style={{ color: 'var(--text-muted)' }}><Spinner size="lg" /></span>
            <span style={{ color: 'var(--destructive)' }}><Spinner size="lg" /></span>
          </Row>
        </Block>
        <Block label="Dans un bouton" hint="loading remplace l'icône de tête et désactive le bouton.">
          <Row>
            <Button loading>Génération…</Button>
            <Button variant="secondary" loading>Génération…</Button>
            <Button variant="ghost" size="sm" loading>Chargement</Button>
            <Button variant="danger" size="lg" loading>Suppression…</Button>
          </Row>
        </Block>
      </Section>

      <Section title="Progress" note="Rail teinté --accent, valeur en --primary. Indéterminé = barre qui glisse.">
        <Block label="Valeurs">
          <Stack>
            <Progress value={0} label="Aucune progression" />
            <Progress value={35} label="Analyse en cours" />
            <Progress value={72} label="Analyse en cours" />
            <Progress value={100} label="Analyse terminée" />
          </Stack>
        </Block>
        <Block label="Indéterminé" hint="Quand la durée est inconnue.">
          <Progress indeterminate label="Transcription de la vidéo" />
        </Block>
        <Block label="Échelle personnalisée" hint="value et max.">
          <Progress value={12} max={30} label="12 analyses sur 30" />
        </Block>
      </Section>

      <Section title="Skeleton" note="Placeholder de chargement sur --muted, shimmer de 1.4s.">
        <Block label="Formes">
          <Stack>
            <Skeleton width="12rem" height="1.25rem" />
            <Skeleton width="20rem" height="0.75rem" />
            <Skeleton height="9rem" radius="var(--radius-lg)" />
            <Skeleton width="5.5rem" height="1.125rem" radius="var(--radius-pill)" />
          </Stack>
        </Block>
      </Section>
    </div>
  );
}
