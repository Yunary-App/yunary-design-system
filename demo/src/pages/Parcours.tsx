import { useState } from 'react';
import type { ReactNode } from 'react';
import { Badge, Banner, Button, Card, Dropzone, EmptyState, FormField, Icon, Pastille, Progress, Tabs, Textarea } from '@yunary/ds';
import { Block, Grid, Section, Stack } from '../ui';

/* La page des parcours (v0.4.0) : ce que partagent les outils à plusieurs étapes. Les libellés sont des
   exemples ; les statuts, leurs tons et les logos des réseaux appartiennent aux couches. */

function Coche() {
  return <Icon name="check" strokeWidth={3} />;
}

function Etapes({ courante }: { courante: number }) {
  const noms = ['Vidéo', 'Transcription', 'Textes', 'Miniature', 'Programmer'];
  return (
    <ol className="ds-steps" aria-label="Les étapes">
      {noms.map((n, i) => (
        <li key={n} className={i < courante ? 'ds-step is-done' : 'ds-step'} aria-current={i === courante ? 'step' : undefined}>
          <span className="ds-step__mark">{i < courante ? <Coche /> : i + 1}</span>{n}
        </li>
      ))}
    </ol>
  );
}

function Perk({ children, tone = 'success', icon = 'check' }: { children: ReactNode; tone?: 'success' | 'amber' | 'brand'; icon?: 'check' | 'zap' | 'file-text' | 'message-square' }) {
  return (
    <li className="ds-perk">
      <Pastille size="coche" tone={tone}><Icon name={icon} /></Pastille>
      {children}
    </li>
  );
}

function Offre() {
  return (
    <Card gap={4} style={{ maxWidth: '40rem' }}>
      <div className="flex flex-wrap items-start justify-between gap-space-4">
        <div className="flex min-w-0 flex-col gap-space-1">
          <span className="font-display text-subheading font-bold">Active l'outil</span>
          <span className="text-body-sm text-text-muted">Ce que l'outil fait pour toi, en une phrase.</span>
        </div>
        <div className="ds-price ds-price--end ds-price--accent">
          <span className="ds-price__line"><span className="ds-price__amount">12 €</span><span className="ds-price__period">/ mois</span></span>
          <span className="ds-price__note">Sans engagement</span>
        </div>
      </div>
      <ul className="ds-perks">
        <Perk>Connecter tes comptes</Perk>
        <Perk>Déposer ta vidéo</Perk>
        <Perk>Transcription et sous-titres</Perk>
        <Perk>Un texte pour chaque réseau</Perk>
      </ul>
      <Button variant="primary" fullWidth>Activer l'outil</Button>
    </Card>
  );
}

function Media({ width, duree, children }: { width: string; duree?: string; children?: ReactNode }) {
  return (
    <div style={{ width }}>
      <div className="ds-media">
        {children ?? <span className="ds-media__play"><Icon name="play" /></span>}
        {duree ? <span className="ds-media__badge">{duree}</span> : null}
      </div>
    </div>
  );
}

/* `inert` n'est pas encore typé par React 18 : l'attribut passe tel quel. */
const INERTE = { inert: '', 'aria-hidden': true } as Record<string, unknown>;

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function Mois({ compact = false }: { compact?: boolean }) {
  /* Octobre 2026 commence un jeudi : trois jours de septembre en tête. */
  const cases = Array.from({ length: 35 }, (_, i) => i - 2);
  const marques: Record<number, { ton: 'amber' | 'success' | 'danger'; icone: 'clock' | 'circle-check' | 'circle-alert'; texte: string }> = {
    3: { ton: 'danger', icone: 'circle-alert', texte: '19:00 Mon preset' },
    6: { ton: 'success', icone: 'circle-check', texte: '18:00 La routine' },
    12: { ton: 'amber', icone: 'clock', texte: '18:00 Trois erreurs' },
    14: { ton: 'amber', icone: 'clock', texte: '12:30 Le micro' },
  };
  return (
    <div className={compact ? 'ds-agenda ds-agenda--compact' : 'ds-agenda'}>
      <div className="ds-agenda__head">{JOURS.map(j => <span key={j} className="ds-agenda__wd">{j}</span>)}</div>
      <div className="ds-agenda__grid">
        {cases.map(n => {
          const dehors = n < 1 || n > 31;
          const num = n < 1 ? 30 + n : n > 31 ? n - 31 : n;
          const m = dehors ? undefined : marques[n];
          const cls = ['ds-agenda__cell', dehors && 'is-outside', n === 9 && 'is-today', n === 12 && compact && 'is-selected'].filter(Boolean).join(' ');
          return (
            <button key={n} type="button" className={cls} aria-label={`${num} octobre`}>
              <span className="ds-agenda__num">{num}</span>
              {m ? (
                <span className={`ds-agenda__event ds-agenda__event--${m.ton}`}>
                  <Icon name={m.icone} /><span className="ds-agenda__event-label">{compact ? m.texte.slice(0, 5) : m.texte}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ElementSemaine({ titre, heure, ton = 'amber', statut = 'Programmé' }: { titre: string; heure: string; ton?: 'amber' | 'success' | 'danger'; statut?: string }) {
  return (
    <a className="ds-week__item" href="#parcours" onClick={e => e.preventDefault()}>
      <Media width="2.5rem" />
      <span className="flex min-w-0 flex-col gap-space-1">
        <span className="text-body-sm font-semibold">{titre}</span>
        <span className="flex flex-wrap items-center gap-space-2">
          <Badge tone={ton} pad="dense" icon={<Icon name={ton === 'success' ? 'circle-check' : ton === 'danger' ? 'circle-alert' : 'clock'} />}>{statut}</Badge>
          <span className="text-caption text-text-muted">{heure}</span>
        </span>
      </span>
    </a>
  );
}

function Semaine({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={compact ? 'ds-week ds-week--compact' : 'ds-week'}>
      <li className="ds-week__day">
        <div className="ds-week__date"><span className="ds-week__num">8</span><span className="ds-week__wd">Jeu</span></div>
        <span className="ds-week__empty">Rien de prévu</span>
      </li>
      <li className="ds-week__day is-today">
        <div className="ds-week__date"><span className="ds-week__num">9</span><span className="ds-week__wd">Ven · auj.</span>{compact ? null : <span className="ds-week__meta">2 publications</span>}</div>
        <div className="ds-week__items">
          <ElementSemaine titre="Trois erreurs qui tuent ta rétention" heure="18:00" />
          <ElementSemaine titre="Ma routine de montage en 20 minutes" heure="20:00" />
        </div>
      </li>
      <li className="ds-week__day">
        <div className="ds-week__date"><span className="ds-week__num">10</span><span className="ds-week__wd">Sam</span></div>
        <div className="ds-week__items"><ElementSemaine titre="Mon preset de montage" heure="19:00" ton="danger" statut="Échec" /></div>
      </li>
    </ol>
  );
}

export function ParcoursPage() {
  const [miniature, setMiniature] = useState('moment');
  const [moment, setMoment] = useState('2');
  const [fichier, setFichier] = useState<string | null>(null);
  const [filtre, setFiltre] = useState('tous');

  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Barre d'étapes" note=".ds-steps : faite (coche success), en cours (aria-current, dégradé plein, libellé gras), à venir (corail doux). La rangée passe à la ligne à 390 px.">
        <Stack>
          <Block label="Étape 3 sur 5"><Etapes courante={2} /></Block>
          <Block label="Première étape"><Etapes courante={0} /></Block>
          <Block label="Tout est fait"><Etapes courante={5} /></Block>
        </Stack>
      </Section>

      <Section title="Le voile d'un outil non activé" note=".ds-veil : le contenu reste visible, estompé et inerte (inert + aria-hidden), la carte d'offre posée dessus. --below empile pour un écran de Claude.">
        <Block label="Recouvre (une page du hub)">
          <div className="ds-veil">
            <div className="ds-veil__content" {...INERTE}>
              <Card gap={4}>
                <Etapes courante={0} />
                <div className="ds-inset ds-inset--stack"><span className="ds-inset__value">La matière de la fiche, visible mais inerte.</span></div>
                <div className="ds-inset ds-inset--stack"><span className="ds-inset__value">Une deuxième section.</span></div>
                <div className="ds-inset ds-inset--stack"><span className="ds-inset__value">Une troisième section.</span></div>
              </Card>
            </div>
            <div className="ds-veil__panel"><Offre /></div>
          </div>
        </Block>
        <Block label="Empile (un écran de Claude)">
          <Card gap={4} style={{ maxWidth: '42.5rem' }}>
            <div className="ds-veil ds-veil--below">
              <div className="ds-veil__content" {...INERTE}><Etapes courante={0} /></div>
              <div className="ds-veil__panel"><Offre /></div>
            </div>
          </Card>
        </Block>
      </Section>

      <Section title="Prix et avantages" note=".ds-price (montant, période, note ; le montant vient du serveur ; --accent le met en dégradé) et .ds-perks (une Pastille coche + un libellé), deux colonnes fixes, même à 390.">
        <Grid cols={2}>
          <Block label="Colonne prix">
            <div className="ds-price ds-price--accent">
              <span className="ds-price__line"><span className="ds-price__amount">9 €</span><span className="ds-price__period">/ mois</span></span>
              <span className="ds-price__note">50 analyses par mois</span>
            </div>
          </Block>
          <Block label="--sm (écran de Claude)">
            <div className="ds-price ds-price--sm">
              <span className="ds-price__line"><span className="ds-price__amount">Gratuit</span></span>
              <span className="ds-price__note">Inclus pour tout le monde</span>
            </div>
          </Block>
        </Grid>
        <Block label="Avantages : coches, ou icônes de tons choisis">
          <Card>
            <ul className="ds-perks">
              <Perk>Transcription et sous-titres</Perk>
              <Perk tone="brand" icon="zap">Cinq hooks à ta voix</Perk>
              <Perk tone="amber" icon="file-text">Un script en blocs nommés</Perk>
              <Perk tone="success" icon="message-square">Depuis Claude</Perk>
            </ul>
          </Card>
        </Block>
      </Section>

      <Section title="Dépôt et envoi" note="Dropzone (React) ou .ds-dropzone (balisage) : repos, survol, fichier tenu au-dessus, focus, invalide, désactivée. L'envoi .ds-upload remplace la zone : en cours, en pause, interrompu.">
        <Grid cols={2}>
          <Block label="Repos" hint="Glisse un fichier dessus pour voir l'état « tenu au-dessus ».">
            <Card>
              <Dropzone
                title="Dépose ta vidéo ici" dragTitle="Lâche pour envoyer" hint="Depuis ton ordinateur ou ton téléphone."
                tile={<Pastille size="dialogue" shape="round" tone="coral"><Icon name="upload" /></Pastille>}
                actionLabel="Choisir ma vidéo" accept="video/*" onFiles={f => setFichier(f[0]?.name ?? null)}>
                <div className="flex flex-wrap justify-center gap-space-2">
                  <Badge tone="amber" pad="dense">MP4 ou MOV</Badge><Badge tone="amber" pad="dense">Vertical 9:16</Badge><Badge tone="amber" pad="dense">3 min maximum</Badge>
                </div>
              </Dropzone>
              {fichier ? <p className="mt-space-3 text-caption text-text-muted">Reçu : {fichier}</p> : null}
            </Card>
          </Block>
          <Block label="Fichier tenu au-dessus (.is-dragover)">
            <div className="ds-dropzone is-dragover">
              <Pastille size="dialogue" shape="round" tone="brand"><Icon name="upload" /></Pastille>
              <div className="ds-dropzone__main"><p className="ds-dropzone__title">Lâche pour envoyer</p><p className="ds-dropzone__hint">routine-montage-v3.mp4 · 486 Mo</p></div>
            </div>
          </Block>
          <Block label="Invalide : la contrainte fautive passe au rouge">
            <Stack>
              <Dropzone invalid title="Dépose ta vidéo ici" actionLabel="Choisir une autre vidéo"
                tile={<Pastille size="dialogue" shape="round" tone="coral"><Icon name="upload" /></Pastille>} onFiles={() => {}}>
                <div className="flex flex-wrap justify-center gap-space-2">
                  <Badge tone="amber" pad="dense">MP4 ou MOV</Badge><Badge tone="danger" pad="dense" icon={<Icon name="circle-alert" />}>3 min maximum</Badge>
                </div>
              </Dropzone>
              <Banner inset tone="danger" title="Ta vidéo dure 4 min 12 s">Coupe-la sous 3 minutes, puis dépose-la de nouveau.</Banner>
            </Stack>
          </Block>
          <Block label="Désactivée">
            <Dropzone disabled title="Dépose ta vidéo ici" actionLabel="Choisir ma vidéo" onFiles={() => {}}
              tile={<Pastille size="dialogue" shape="round" tone="neutral"><Icon name="upload" /></Pastille>} />
          </Block>
        </Grid>
        <Grid cols={2}>
          <Block label="Envoi en cours">
            <div className="ds-upload">
              <div className="ds-file">
                <Pastille size="dialogue" tone="neutral"><Icon name="video" /></Pastille>
                <span className="ds-file__main"><span className="ds-file__name">routine-montage-v3.mp4</span><span className="ds-file__meta">312 Mo sur 486 Mo · environ 1 min</span></span>
              </div>
              <Progress value={64} label="Envoi de la vidéo" />
              <div className="ds-upload__foot"><span>Si la connexion coupe, l'envoi reprend où il s'est arrêté.</span><Button variant="ghost" size="sm">Annuler l'envoi</Button></div>
            </div>
          </Block>
          <Block label="Interrompu (.is-interrupted)">
            <div className="ds-upload is-interrupted">
              <div className="ds-file">
                <Pastille size="dialogue" tone="warning"><Icon name="triangle-alert" /></Pastille>
                <span className="ds-file__main"><span className="ds-file__name">Envoi interrompu à 64 %</span><span className="ds-file__meta">La connexion a coupé. Rien n'est perdu.</span></span>
              </div>
              <Progress value={64} label="Envoi de la vidéo" />
              <div className="ds-upload__foot"><span>312 Mo sur 486 Mo</span><Button variant="secondary" size="sm">Reprendre l'envoi</Button></div>
            </div>
          </Block>
        </Grid>
        <Block label="Un fichier joint (.ds-file)">
          <Card>
            <div className="ds-file">
              <Pastille size="dialogue" tone="amber"><Icon name="file-text" /></Pastille>
              <span className="ds-file__main"><span className="ds-file__name">routine-montage.srt</span><span className="ds-file__meta">38 répliques · 4 Ko</span></span>
              <span className="ds-file__actions">
                <Button variant="secondary" size="sm" icon={<Icon name="download" />}>Télécharger</Button>
                <Button variant="secondary" size="sm" icon={<Icon name="upload" />}>Remplacer</Button>
              </span>
            </div>
          </Card>
        </Block>
      </Section>

      <Section title="Média vertical et miniature" note=".ds-media (9:16, largeur posée par l'appelant, durée en bas à gauche, --unavailable) · .ds-frames (un moment parmi quelques images) · .ds-tile--panel (un choix riche).">
        <div className="flex flex-wrap items-end gap-space-5">
          <Block label="120"><Media width="7.5rem" duree="00:45" /></Block>
          <Block label="64"><Media width="4rem" duree="00:52" /></Block>
          <Block label="40"><Media width="2.5rem" /></Block>
          <Block label="Plus disponible">
            <div style={{ width: '12rem' }}>
              <div className="ds-media ds-media--unavailable">
                <Pastille size="panneau" shape="round" tone="neutral"><Icon name="video-off" /></Pastille>
                <span><strong className="text-foreground">Vidéo plus disponible</strong><br />Elle est gardée 30 jours après la publication.</span>
              </div>
            </div>
          </Block>
        </div>
        <Block label="Choisir la miniature">
          <div role="radiogroup" aria-label="La miniature" className="grid gap-space-3" style={{ maxWidth: '42rem', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,16rem),1fr))' }}>
            <div className="ds-tile ds-tile--panel">
              <label className="ds-tile__row"><span className="ds-choice"><input type="radio" name="miniature" value="moment" checked={miniature === 'moment'} onChange={() => setMiniature('moment')} /><span className="ds-choice__box ds-choice__box--radio" aria-hidden="true"><span className="ds-choice__dot" /></span></span>
                <span className="ds-tile__title">Un moment de la vidéo</span><span className="ds-tile__check" aria-hidden="true"><Icon name="circle-check" /></span></label>
              <span className="ds-frames" role="radiogroup" aria-label="Le moment">
                {['0', '1', '2', '3', '4'].map(v => (
                  <label key={v} className="ds-frame">
                    <input type="radio" name="moment" value={v} checked={moment === v} onChange={() => { setMoment(v); setMiniature('moment'); }} aria-label={`00:0${v}`} />
                  </label>
                ))}
              </span>
              <span className="flex flex-wrap items-center gap-space-2"><Badge tone="amber" pad="dense">00:0{moment}</Badge><span className="ds-tile__desc">Le seul choix accepté par TikTok</span></span>
            </div>
            <label className="ds-tile ds-tile--panel">
              <span className="ds-choice"><input type="radio" name="miniature" value="image" checked={miniature === 'image'} onChange={() => setMiniature('image')} /><span className="ds-choice__box ds-choice__box--radio" aria-hidden="true"><span className="ds-choice__dot" /></span></span>
              <span className="ds-tile__row"><span className="ds-tile__title">Une image</span><span className="ds-tile__check" aria-hidden="true"><Icon name="circle-check" /></span></span>
              <span className="ds-tile__desc">JPG ou PNG, vertical 9:16.</span>
            </label>
          </div>
        </Block>
        <Block label="Un choix parmi trois, le premier recommandé (.is-recommended), le deuxième choisi">
          <div role="radiogroup" aria-label="Le créneau" className="grid gap-space-3" style={{ maxWidth: '42rem', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,10rem),1fr))' }}>
            {[['Mardi 13', '18:00', 'reco'], ['Jeudi 15', '12:30', 'choisi'], ['Samedi 17', '10:00', '']].map(([j, h, etat]) => (
              <label key={j} className={etat === 'reco' ? 'ds-tile ds-tile--panel is-recommended' : 'ds-tile ds-tile--panel'}>
                <span className="ds-choice"><input type="radio" name="creneau" defaultChecked={etat === 'choisi'} /><span className="ds-choice__box ds-choice__box--radio" aria-hidden="true"><span className="ds-choice__dot" /></span></span>
                <span className="ds-tile__row"><span className="ds-tile__title">{j}</span>{etat === 'reco' ? <Badge tone="accent" pad="dense">Le plus proche</Badge> : null}</span>
                <span className="font-mono text-body">{h}</span>
              </label>
            ))}
          </div>
        </Block>
      </Section>

      <Section title="Agenda" note=".ds-agenda (le mois : marques par statut, aujourd'hui, jour retenu, hors du mois) et .ds-week (la semaine : un jour par rangée, deux éléments par ligne, un seul en --compact). Les tons et libellés de statut appartiennent aux couches.">
        <Block label="Mois"><Mois /></Block>
        <Grid cols={2}>
          <Block label="Mois --compact (écran de Claude)"><Card style={{ maxWidth: '42.5rem' }}><Mois compact /></Card></Block>
          <Block label="Semaine --compact (écran de Claude)"><Card style={{ maxWidth: '42.5rem' }}><Semaine compact /></Card></Block>
        </Grid>
        <Block label="Semaine"><Semaine /></Block>
        <Block label="Une bande de semaine (une rangée du mois)">
          <div className="ds-agenda ds-agenda--compact" style={{ maxWidth: '42.5rem' }}>
            <div className="ds-agenda__head">{JOURS.map(j => <span key={j} className="ds-agenda__wd">{j}</span>)}</div>
            <div className="ds-agenda__grid">
              {[12, 13, 14, 15, 16, 17, 18].map(n => <span key={n} className={n === 13 ? 'ds-agenda__cell is-selected' : 'ds-agenda__cell'}><span className="ds-agenda__num">{n}</span></span>)}
            </div>
          </div>
        </Block>
      </Section>

      <Section title="Encarts et marques de texte" note="Banner inset (amber, neutral, icon), .ds-inset--stack (en-tête + Copier), FormField action, Tabs size sm, EmptyState plain, et les marques .ds-mark, .ds-snippet, .ds-cues, .ds-dl, .ds-diff.">
        <Grid cols={2}>
          <Block label="Encarts d'information dans une carte">
            <Card gap={3}>
              <Banner inset tone="info" icon={<Icon name="user" />}>Ces hooks sont génériques : avec ton profil créateur, ils seraient à ta voix.</Banner>
              <Banner inset tone="amber">TikTok n'accepte qu'un moment de la vidéo comme miniature.</Banner>
              <Banner inset tone="success" title="Corrigé">« Yuna-ri » devient « Yunary » partout, sous-titres compris.</Banner>
              <Banner inset tone="danger">Vidéo trop lourde pour Instagram : 300 Mo maximum.</Banner>
              <Banner inset tone="neutral">Chaque réseau se règle à part.</Banner>
            </Card>
          </Block>
          <Block label="Encart en pile + filtre compact">
            <Card gap={4}>
              <Tabs size="sm" value={filtre} onChange={setFiltre} items={[{ value: 'tous', label: 'Tous' }, { value: 'brouillon', label: 'Brouillon' }, { value: 'programme', label: 'Programmé' }, { value: 'publie', label: 'Publié' }]} />
              <div className="ds-inset ds-inset--stack">
                <div className="ds-inset__head">
                  <Badge tone="coral" pad="dense">Hook</Badge><Badge tone="amber" pad="dense">Contre-pied</Badge>
                  <Button variant="ghost" size="xs" className="ds-inset__action" icon={<Icon name="copy" />}>Copier</Button>
                </div>
                <p className="ds-inset__value font-display text-heading-sm font-bold">Tes vidéos ne sont pas trop longues. Elles sont trop lentes à démarrer.</p>
                <dl className="ds-dl">
                  <div><dt>À l'écran</dt><dd><span className="ds-snippet ds-snippet--mono">« Pas trop longues »</span></dd></div>
                  <div><dt>Contraste</dt><dd>Croit : il faut couper. Découvre : il faut accélérer le début.</dd></div>
                </dl>
              </div>
            </Card>
          </Block>
          <Block label="Champ à action, répliques horodatées">
            <Card gap={4}>
              <FormField label="Description" htmlFor="desc" help="Pensé pour la recherche." action={<Button variant="ghost" size="xs" icon={<Icon name="copy" />}>Copier</Button>}>
                <Textarea id="desc" rows={3} defaultValue="Trois erreurs qui tuent ta rétention, et comment les corriger." />
              </FormField>
              <ol className="ds-cues">
                <li className="ds-cue"><span className="ds-cue__time">00:00</span><span className="ds-cue__text">Tes vidéos ne sont pas trop longues.</span></li>
                <li className="ds-cue"><span className="ds-cue__time">00:04</span><span className="ds-cue__text">Je te montre sur <mark className="ds-mark">Yuna-ri</mark> ce que je change.</span></li>
                <li className="ds-cue"><span className="ds-cue__time">00:09</span><span className="ds-cue__text">Et sur <mark className="ds-mark ds-mark--success">Yunary</mark>, ça part tout seul.</span></li>
              </ol>
              <p className="text-body-sm">En janvier je faisais <mark className="ds-mark">[à compléter]</mark> vues.</p>
            </Card>
          </Block>
          <Block label="Avant / après, état vide nu, puces">
            <Card gap={4}>
              <div className="ds-inset">
                <span className="ds-inset__value font-semibold">Heure de publication</span>
                <span className="ds-diff">
                  <Badge tone="neutral" pad="dense">18:00</Badge>
                  <span className="ds-diff__arrow" aria-label="devient"><Icon name="arrow-right" /></span>
                  <Badge tone="accent" pad="dense">20:00</Badge>
                </span>
              </div>
              <EmptyState plain tile={<Pastille size="dialogue" shape="round" tone="coral"><Icon name="message-square" /></Pastille>}
                title="Textes pas encore écrits" description="Claude les écrit avec toi, réseau par réseau."
                action={<Button variant="primary" size="sm">Écrire mes textes</Button>} />
              <div className="flex flex-wrap gap-space-2">
                {[1, 2, 3].map(n => <Pastille key={n} size="puce" shape="round" tone={n === 1 ? 'brand-solid' : 'coral'}>{n}</Pastille>)}
              </div>
            </Card>
          </Block>
        </Grid>
      </Section>
    </div>
  );
}
