import { Icon, type IconName } from '@yunary/ds';
import { Block, Section, Spec } from '../ui';

const NAMES: IconName[] = [
  'check', 'x', 'chevron-down', 'chevron-right', 'chevron-left', 'arrow-right',
  'arrow-up-right', 'arrow-down', 'arrow-up', 'arrow-up-down', 'play', 'clock', 'calendar', 'copy',
  'search', 'menu', 'mail', 'triangle-alert', 'info', 'circle-check',
  'circle-alert', 'circle-x', 'code', 'zap', 'plus', 'minus', 'trash-2',
  'external-link', 'trending-up', 'user', 'book-open', 'message-square', 'file-text',
  'chevrons-left', 'chevrons-right', 'ellipsis', 'panel-left',
  'layout-dashboard', 'video', 'settings', 'lock',
  'upload', 'download', 'pause', 'video-off', 'list', 'pencil', 'users',
];

export function IconsPage() {
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Icônes" note="Lucide, exclusivement. Aucun emoji, aucun caractère unicode décoratif — sauf le point médian.">
        <Block label="Tailles" hint="1rem · 1.25rem (défaut) · 1.5rem. Toujours en rem, jamais en px.">
          <Spec token="size=&quot;1rem&quot;"><Icon name="circle-check" size="1rem" /></Spec>
          <Spec token="size=&quot;1.25rem&quot; (défaut)"><Icon name="circle-check" size="1.25rem" /></Spec>
          <Spec token="size=&quot;1.5rem&quot;"><Icon name="circle-check" size="1.5rem" /></Spec>
        </Block>

        <Block label="Graisses" hint="2 standard · 2.5 dans les pills · 3 pour le check.">
          <Spec token="strokeWidth={2}"><Icon name="check" size="1.5rem" strokeWidth={2} /></Spec>
          <Spec token="strokeWidth={2.5}"><Icon name="check" size="1.5rem" strokeWidth={2.5} /></Spec>
          <Spec token="strokeWidth={3}"><Icon name="check" size="1.5rem" strokeWidth={3} /></Spec>
        </Block>

        <Block label="Couleur" hint="currentColor — --foreground par défaut, --primary seulement pour une icône active ou un CTA.">
          <div className="flex flex-wrap items-center gap-space-5">
            <Icon name="zap" size="1.5rem" />
            <Icon name="zap" size="1.5rem" style={{ color: 'var(--primary)' }} />
            <Icon name="zap" size="1.5rem" style={{ color: 'var(--text-muted)' }} />
            <Icon name="zap" size="1.5rem" style={{ color: 'var(--destructive)' }} />
          </div>
        </Block>

        <Block label="Jeu complet" hint={`${NAMES.length} icônes disponibles.`}>
          <div className="grid grid-cols-2 gap-space-3 sm:grid-cols-4 lg:grid-cols-6">
            {NAMES.map(name => (
              <div key={name} className="flex flex-col items-center gap-space-2 rounded-md border border-border bg-card p-space-3">
                <Icon name={name} size="1.25rem" />
                <span className="mono text-caption text-text-muted w-full truncate text-center">{name}</span>
              </div>
            ))}
          </div>
        </Block>
      </Section>
    </div>
  );
}
