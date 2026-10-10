import { useState } from 'react';
import type { ReactNode } from 'react';
import { Avatar, Badge, Banner, Button, Card, Dropzone, EmptyState, FormField, Icon, IconButton, Input, Logo, Modal, Pastille, Progress, Reseau, Switch, TBody, THead, Table, Tabs, Td, Th, Tr } from '@yunary/ds';
import { Block, Grid, Section, Stack } from '../ui';

/* La page des fiches et des rangées (v0.6.0) : la seconde moitié de l'arbitrage du 10/10. Les libellés sont des
   exemples ; les contenus, les dates et les quotas viennent du serveur. */

function Media({ width, duree, sm = false, brand = false }: { width: string; duree?: string; sm?: boolean; brand?: boolean }) {
  return (
    <div style={{ width }}>
      <div className={['ds-media', sm && 'ds-media--sm', brand && 'ds-media--brand'].filter(Boolean).join(' ')}>
        {brand ? <Icon name="video" /> : <span className="ds-media__play"><Icon name="play" /></span>}
        {duree ? <span className="ds-media__badge">{duree}</span> : null}
      </div>
    </div>
  );
}

function Rangee({ reseau, nom, handle, badge, end, plate = false, danger = false, editing = false }: {
  reseau: 'instagram' | 'tiktok' | 'youtube'; nom: string; handle?: string; badge?: ReactNode; end?: ReactNode; plate?: boolean; danger?: boolean; editing?: boolean;
}) {
  return (
    <li className={['ds-row', plate && 'ds-row--plate', danger && 'ds-row--danger', editing && 'is-editing'].filter(Boolean).join(' ')}>
      <span className="ds-row__lead"><Reseau name={reseau} size="lg" /></span>
      <span className="ds-row__main"><span className="ds-row__title">{nom}</span>{handle ? <span className="ds-row__meta">{handle}</span> : null}</span>
      {badge}
      {end ? <span className="ds-row__end">{end}</span> : null}
    </li>
  );
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function Semaine() {
  return (
    <ol className="ds-week">
      <li className="ds-week__day">
        <div className="ds-week__date"><span className="ds-week__num">8</span><span className="ds-week__wd">Jeu</span></div>
        <span className="ds-week__empty">Rien de prévu</span>
      </li>
      <li className="ds-week__day is-today">
        <div className="ds-week__date"><span className="ds-week__num">9</span><span className="ds-week__wd">Ven</span><span className="ds-week__meta">2 publications</span></div>
        <div className="ds-week__items">
          <a className="ds-week__item" href="#fiches" onClick={e => e.preventDefault()}>
            <Media width="2.5rem" sm />
            <span className="flex min-w-0 flex-col gap-space-1">
              <span className="text-body-sm font-semibold">Trois erreurs qui tuent ta rétention</span>
              <span className="flex flex-wrap items-center gap-space-2"><Badge tone="amber" pad="dense">Programmé</Badge><span className="text-caption text-text-muted">18:00</span><span className="ds-reseaux"><Reseau name="instagram" size="xs" /><Reseau name="tiktok" size="xs" /></span></span>
              <span className="ds-week__note"><Icon name="clock" />TikTok à 20:00</span>
            </span>
          </a>
          <a className="ds-week__item" href="#fiches" onClick={e => e.preventDefault()}>
            <Media width="2.5rem" brand />
            <span className="flex min-w-0 flex-col gap-space-1">
              <span className="text-body-sm font-semibold">Combien je gagne avec 10 000 abonnés</span>
              <span className="flex flex-wrap items-center gap-space-2"><Badge tone="neutral" pad="dense">Brouillon</Badge><span className="text-caption text-text-muted">20:00</span></span>
              <span className="ds-week__note ds-week__note--danger"><Icon name="triangle-alert" />Vidéo à déposer</span>
            </span>
          </a>
        </div>
      </li>
      <li className="ds-week__day">
        <div className="ds-week__date"><span className="ds-week__num">10</span><span className="ds-week__wd">Sam</span></div>
        <div className="ds-week__items">
          <a className="ds-week__item" href="#fiches" onClick={e => e.preventDefault()}>
            <Media width="2.5rem" sm />
            <span className="flex min-w-0 flex-col gap-space-1">
              <span className="text-body-sm font-semibold">Mon preset de montage</span>
              <span className="flex flex-wrap items-center gap-space-2"><Badge tone="danger" pad="dense">Échec</Badge><span className="text-caption text-text-muted">19:00</span></span>
              <span className="ds-week__note ds-week__note--danger"><Icon name="triangle-alert" />Compte TikTok à reconnecter</span>
            </span>
          </a>
        </div>
      </li>
    </ol>
  );
}

function BarreAgenda({ onglet, setOnglet }: { onglet: string; setOnglet: (v: string) => void }) {
  return (
    <div className="ds-agenda__bar">
      <span className="ds-agenda__nav">
        <IconButton label="Semaine précédente" size="sm" variant="secondary" surface="card"><Icon name="chevron-left" /></IconButton>
        <IconButton label="Semaine suivante" size="sm" variant="secondary" surface="card"><Icon name="chevron-right" /></IconButton>
      </span>
      <h3 className="ds-agenda__title">5 – 11 octobre 2026</h3>
      <Button variant="ghost" size="sm">Aujourd'hui</Button>
      <span className="ds-agenda__legend">
        <Badge tone="amber" pad="dense" icon={<Icon name="clock" />}>Programmé</Badge>
        <Badge tone="success" pad="dense" icon={<Icon name="circle-check" />}>Publié</Badge>
        <Badge tone="danger" pad="dense" icon={<Icon name="circle-alert" />}>Échec</Badge>
      </span>
      <Tabs size="sm" value={onglet} onChange={setOnglet} items={[{ value: 'semaine', label: 'Semaine' }, { value: 'mois', label: 'Mois' }]} />
    </div>
  );
}

function Tuiles() {
  return (
    <div className="ds-agenda ds-agenda--tiles" style={{ maxWidth: '40rem' }}>
      <div className="ds-agenda__grid">
        {[12, 13, 14, 15, 16, 17, 18].map((n, i) => (
          <span key={n} className={n === 13 ? 'ds-agenda__cell is-today' : 'ds-agenda__cell'}>
            <span className="ds-agenda__day-label">{JOURS[i]}</span>
            <span className="ds-agenda__num">{n}</span>
            {n === 13 || n === 15 ? <span className="ds-agenda__marks"><Reseau name="instagram" size="xs" />{n === 13 ? <Reseau name="tiktok" size="xs" /> : null}</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}

function Etapes({ compact = false }: { compact?: boolean }) {
  const items = compact
    ? [['Dépose ta vidéo', 'Sur Yunary, en un clic.'], ['Transcription', 'Relue, corrigée.'], ['Textes', 'Un par réseau.'], ['Programmer', 'Depuis Claude.']]
    : [['Clique sur le lien', 'Il ouvre Claude avec Yunary déjà choisi.'], ['Autorise Yunary', 'Une fois, avec ton compte.'], ['Parle à Claude', '« Analyse ma dernière vidéo ».']];
  return (
    <ol className={compact ? 'ds-etapes ds-etapes--compact' : 'ds-etapes'}>
      {items.map(([t, x], i) => (
        <li key={t} className="ds-etape">
          <span className="ds-etape__lead">{compact ? <Pastille size="puce" shape="round" tone="coral">{i + 1}</Pastille> : <Pastille size="carte" tone="brand" outlined>{i + 1}</Pastille>}</span>
          <span className="ds-etape__title">{t}</span>
          <span className="ds-etape__text">{x}</span>
        </li>
      ))}
    </ol>
  );
}

export function FichesPage() {
  const [onglet, setOnglet] = useState('semaine');
  const [ongletParam, setOngletParam] = useState('infos');
  const [modale, setModale] = useState<'' | 'lg' | 'xl' | '2xl'>('');

  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Dépôt compact, envoi sans cadre" note="Dropzone variant=compact (tuile ronde neutre, titre body-sm + lien, contraintes en caption, sans bouton) ; .ds-upload--bare dans un écran de Claude ; un fichier refusé remplace la zone par un Banner danger.">
        <Grid cols={2}>
          <Block label="Colonne d'une fiche">
            <Card gap={4}>
              <Dropzone variant="compact" title="Dépose ta vidéo ici" dragTitle="Lâche pour envoyer" linkLabel="ou choisis un fichier"
                hint="MP4 ou MOV · 9:16 · 3 min · 500 Mo max" accept="video/*" onFiles={() => {}}
                tile={<Pastille size="dialogue" shape="round" tone="neutral"><Icon name="upload" /></Pastille>} />
              <Banner inset tone="danger" title="Ta vidéo est horizontale (16:9)" action={<Button variant="secondary" size="sm" surface="card">Choisir une autre vidéo</Button>}>Yunary ne publie que des vidéos verticales.</Banner>
            </Card>
          </Block>
          <Block label="Dans un écran de Claude : envoi à nu">
            <Card variant="screen" icon={<Logo variant="monogram" height="1.375rem" />} title="Yunary Programmation"
              foot={<><span>L'envoi continue si tu changes de sujet.</span><Button variant="secondary" size="sm">Annuler l'envoi</Button></>}>
              <div className="ds-upload ds-upload--bare">
                <div className="ds-file">
                  <Pastille size="dialogue" tone="amber"><Icon name="video" /></Pastille>
                  <span className="ds-file__main"><span className="ds-file__name">routine-montage-v3.mp4</span><span className="ds-file__meta">312 Mo sur 486 Mo · environ 1 min</span></span>
                </div>
                <Progress value={64} label="Envoi de la vidéo" />
                <div className="ds-upload__foot"><span>Tu peux continuer à discuter pendant l'envoi.</span></div>
              </div>
            </Card>
          </Block>
        </Grid>
      </Section>

      <Section title="Média : un seul dessin" note=".ds-media__play (disque clair, glyphe plein en corail ; --sm sous 64 px), .ds-media--brand (pas encore de vidéo), .ds-media--wide + __title + __note (plus disponible, en panneau large). Les cadres .ds-frame se détourent en sombre.">
        <div className="flex flex-wrap items-end gap-space-5">
          <Block label="120"><Media width="7.5rem" duree="00:45" /></Block>
          <Block label="64, --sm"><Media width="4rem" duree="00:52" sm /></Block>
          <Block label="40, --sm"><Media width="2.5rem" sm /></Block>
          <Block label="Pas encore de vidéo"><Media width="4rem" brand /></Block>
          <Block label="Bande d'images (vide)">
            <div className="ds-frames" style={{ width: '16rem' }} role="radiogroup" aria-label="Le moment">
              {['0', '1', '2', '3', '4'].map(v => <label key={v} className="ds-frame"><input type="radio" name="moment-fiches" defaultChecked={v === '2'} aria-label={`00:0${v}`} /></label>)}
            </div>
          </Block>
        </div>
        <Block label="Plus disponible, en panneau large">
          <Card>
            <div className="ds-media ds-media--unavailable ds-media--wide">
              <Pastille size="panneau" shape="round" tone="neutral"><Icon name="video-off" /></Pastille>
              <span className="ds-media__title">Vidéo plus disponible</span>
              <span className="ds-media__note">Elle est gardée 30 jours après la publication, puis effacée. Tes textes et ta transcription restent.</span>
            </div>
          </Card>
        </Block>
      </Section>

      <Section title="Agenda" note="Semaine : colonne du jour sur --accent, numéro en dégradé, aujourd'hui en plaque dégradée, notes .ds-week__note ; .ds-agenda__bar (navigation, titre, légende, onglets) ; .ds-agenda--tiles (la bande d'un récapitulatif). Les jours hors du mois ne sont plus grisés.">
        <Stack>
          <BarreAgenda onglet={onglet} setOnglet={setOnglet} />
          <Semaine />
          <Block label="Bande de semaine en tuiles (récap dans Claude)"><Tuiles /></Block>
        </Stack>
      </Section>

      <Section title="Rangées et réglages" note=".ds-rows / .ds-row (tête, titre, méta, fin, actions ; --plate, --danger, .is-editing, --lg), .ds-settings / .ds-setting (libellé et aide, contrôle, empilés à 390), tr.is-danger.">
        <Grid cols={2}>
          <Block label="Comptes connectés, une rangée en échec, une en édition">
            <Card title="Comptes connectés" subtitle="Les réseaux où Yunary publie." action={<Button variant="secondary" size="sm" surface="card">Gérer</Button>}>
              <ul className="ds-rows">
                <Rangee reseau="instagram" nom="Instagram" handle="@julien.fernandes" badge={<Badge tone="success" pad="dense">Connecté</Badge>} end={<Switch defaultChecked aria-label="Publier sur Instagram" />} />
                <Rangee reseau="tiktok" nom="TikTok" handle="@julien.crea" badge={<Badge tone="danger" pad="dense">À reconnecter</Badge>} end={<Button variant="secondary" size="sm" surface="card">Reconnecter</Button>} danger />
                <Rangee reseau="youtube" nom="YouTube" badge={<Badge tone="brand" pad="dense">À connecter</Badge>} end={<Button variant="ghost" size="sm">Connecter</Button>} />
                <li className="ds-row is-editing">
                  <span className="ds-row__main"><span className="ds-row__title">Jamais de hashtag en majuscules</span><span className="ds-row__meta">Règle de style · modifiée il y a 2 min</span></span>
                  <span className="ds-row__actions"><Button variant="ghost" size="xs" icon={<Icon name="pencil" />}>Modifier</Button><IconButton label="Supprimer la règle" size="sm" variant="danger-soft"><Icon name="trash-2" /></IconButton></span>
                </li>
              </ul>
            </Card>
          </Block>
          <Block label="Plaques cliquables, réglages">
            <Stack>
              <Card gap={3}>
                <ul className="ds-rows ds-rows--plates">
                  <li><a className="ds-row ds-row--plate" href="#fiches" onClick={e => e.preventDefault()}>
                    <span className="ds-row__lead"><Pastille size="carte" tone="coral"><Icon name="calendar" /></Pastille></span>
                    <span className="ds-row__main"><span className="ds-row__title">Voir le calendrier</span><span className="ds-row__meta">3 publications cette semaine</span></span>
                    <span className="ds-row__chevron"><Icon name="chevron-right" /></span>
                  </a></li>
                  <li><a className="ds-row ds-row--plate" href="#fiches" onClick={e => e.preventDefault()}>
                    <span className="ds-row__lead"><Media width="2rem" sm /></span>
                    <span className="ds-row__main"><span className="ds-row__title">Trois erreurs qui tuent ta rétention</span><span className="ds-row__meta">48 200 vues · <Badge tone="outline" pad="dense">Hors Yunary</Badge></span></span>
                    <span className="ds-row__chevron"><Icon name="chevron-right" /></span>
                  </a></li>
                </ul>
              </Card>
              <Card>
                <div className="ds-settings">
                  <div className="ds-setting">
                    <div className="ds-setting__label"><span className="ds-setting__title">E-mail</span><span className="ds-setting__help">Celui de ton compte Yunary.</span></div>
                    <div className="ds-setting__control"><Input readOnly defaultValue="julien@exemple.com" iconEnd={<Icon name="lock" />} /></div>
                  </div>
                  <div className="ds-setting ds-setting--end">
                    <div className="ds-setting__label"><span className="ds-setting__title">Mot de passe</span><span className="ds-setting__help">Changé il y a 3 mois.</span></div>
                    <div className="ds-setting__control"><Button variant="secondary" size="sm" surface="card">Changer le mot de passe</Button></div>
                  </div>
                </div>
              </Card>
            </Stack>
          </Block>
        </Grid>
        <Block label="Table : la ligne en échec">
          <Table framed hoverable>
            <THead><Tr><Th>Contenu</Th><Th>Réseaux</Th><Th>Statut</Th></Tr></THead>
            <TBody>
              <Tr><Td>Trois erreurs qui tuent ta rétention</Td><Td><span className="ds-reseaux"><Reseau name="instagram" size="sm" /><Reseau name="tiktok" size="sm" /></span></Td><Td><Badge tone="amber" pad="dense">Programmé</Badge></Td></Tr>
              <Tr className="is-danger"><Td>Mon preset de montage</Td><Td><span className="ds-reseaux"><Reseau name="tiktok" size="sm" /></span></Td><Td><Badge tone="danger" pad="dense">Échec</Badge></Td></Tr>
              <Tr><Td>Ma routine de montage en 20 minutes</Td><Td><span className="ds-reseaux"><Reseau name="youtube" size="sm" /></span></Td><Td><Badge tone="success" pad="dense">Publié</Badge></Td></Tr>
            </TBody>
          </Table>
        </Block>
      </Section>

      <Section title="États vides, têtes de section, barre de fiche, étapes" note="EmptyState : pastille ronde neutre par défaut, compact ; .ds-card__band (+ __num en dégradé, __band-meta, --muted --bleed) ; .ds-topbar ; .eyebrow--muted ; .ds-etapes (centrées, ou --compact pour « La suite » dans Claude).">
        <Grid cols={2}>
          <Block label="États vides">
            <Stack>
              <EmptyState icon={<Icon name="video" />} title="Aucun contenu pour l'instant" description="Dépose une vidéo ou écris un script avec Claude." action={<Button size="sm">Nouveau contenu</Button>} />
              <EmptyState compact tile={<Pastille size="heros" shape="round" tone="danger"><Icon name="circle-alert" size="1.5rem" /></Pastille>} title="L'analyse n'a pas abouti" description="C'est de notre côté, pas du tien. Aucune analyse décomptée." action={<Button variant="secondary" size="sm" surface="card">Réessayer</Button>} />
            </Stack>
          </Block>
          <Block label="Étapes en tuiles">
            <Stack>
              <Card variant="feature" size="lg"><Etapes /></Card>
              <Card variant="screen"><span className="eyebrow--muted">La suite · Yunary Programmation</span><Etapes compact /></Card>
            </Stack>
          </Block>
        </Grid>
        <Block label="Une fiche : la barre, puis une section numérotée et une bande de réseau">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="ds-topbar">
              <IconButton label="Retour" variant="ghost"><Icon name="chevron-left" /></IconButton>
              <div className="ds-topbar__main">
                <div className="ds-topbar__row"><h1 className="ds-topbar__title">Trois erreurs qui tuent ta rétention</h1><Badge tone="neutral" pad="dense">Brouillon</Badge></div>
                <span className="ds-topbar__meta">Créé le 03/10 depuis Claude · modifié il y a 12 min</span>
              </div>
              <div className="ds-topbar__end"><Button variant="danger-soft" size="sm" icon={<Icon name="trash-2" />}>Supprimer</Button></div>
              <div className="ds-topbar__end ds-topbar__end--mobile"><IconButton label="Supprimer" variant="ghost-danger"><Icon name="trash-2" /></IconButton></div>
            </div>
            <div className="bg-background p-space-5">
              <Card flush>
                <div className="ds-card__band">
                  <span className="ds-card__num">05</span>
                  <h2 className="ds-card__title">Textes de publication</h2>
                  <span className="ds-card__band-meta">Une base commune, une version par réseau</span>
                  <Button variant="secondary" size="sm" surface="card">Écrire avec Claude</Button>
                </div>
                <div className="flex flex-col gap-space-4 p-space-5">
                  <div className="ds-card__band ds-card__band--muted ds-card__band--bleed">
                    <Reseau name="instagram" size="md" />
                    <h3 className="ds-card__title">Instagram</h3>
                    <span className="ds-card__band-meta">@julien.fernandes</span>
                    <Badge tone="coral" pad="dense">Prérempli</Badge>
                  </div>
                  <FormField label="Description" htmlFor="desc-f" action={<Button variant="ghost" size="xs" icon={<Icon name="copy" />}>Copier</Button>}>
                    <Input id="desc-f" defaultValue="Trois erreurs qui tuent ta rétention, et comment les corriger." />
                  </FormField>
                </div>
              </Card>
            </div>
          </div>
        </Block>
      </Section>

      <Section title="Onglets, modales, danger doux" note="La barre d'onglets défile quand elle est trop étroite (390), --sm à 36 px ; Modal lg 480 / xl 560 / 2xl 600, gap 20, sous-titre dans la tête ; danger-soft avec son filet, ghost-danger en icône seule.">
        <Grid cols={2}>
          <Block label="Onglets de Paramètres (réduis la fenêtre)">
            <Card gap={4}>
              <Tabs value={ongletParam} onChange={setOngletParam} items={[{ value: 'infos', label: 'Infos' }, { value: 'comptes', label: 'Comptes connectés' }, { value: 'claude', label: 'Claude' }, { value: 'legal', label: 'Légal' }]} />
              <div className="flex flex-wrap items-center gap-space-3">
                <Button variant="danger-soft" size="sm" icon={<Icon name="trash-2" />}>Retirer</Button>
                <IconButton label="Supprimer" variant="danger-soft" size="sm"><Icon name="trash-2" /></IconButton>
                <IconButton label="Supprimer" variant="ghost-danger" size="sm"><Icon name="trash-2" /></IconButton>
                <Button variant="danger" size="sm">Supprimer mon compte</Button>
              </div>
            </Card>
          </Block>
          <Block label="Modales : trois largeurs">
            <Card gap={3}>
              <div className="flex flex-wrap gap-space-2">
                <Button variant="secondary" size="sm" surface="card" onClick={() => setModale('lg')}>480 · Activer</Button>
                <Button variant="secondary" size="sm" surface="card" onClick={() => setModale('xl')}>560 · Nouveau contenu</Button>
                <Button variant="secondary" size="sm" surface="card" onClick={() => setModale('2xl')}>600 · Formulaire</Button>
              </div>
              <Modal inline size="lg" title="Activer Programmation" subtitle="12 € / mois, sans engagement." onClose={() => {}}
                footer={<><Button variant="ghost" size="sm">Annuler</Button><Button size="sm">Activer Programmation</Button></>}>
                <p className="text-body-sm">Ta carte Visa •••• 4242 sera débitée aujourd'hui.</p>
              </Modal>
            </Card>
            {modale ? (
              <Modal size={modale} title="Nouveau contenu" subtitle="Par quoi tu commences ?" onClose={() => setModale('')}
                footer={<><Button variant="ghost" onClick={() => setModale('')}>Annuler</Button><Button onClick={() => setModale('')}>Continuer</Button></>}>
                <p className="text-body-sm text-text-secondary">Une fenêtre de {modale === 'lg' ? '480' : modale === 'xl' ? '560' : '600'} px, qui devient une feuille sous 64 rem.</p>
              </Modal>
            ) : null}
          </Block>
        </Grid>
      </Section>

      <Section title="Avatars, chiffres, champs, réseaux" note="Avatar (tailles des pastilles ; muted, neutral, brand ; ring ; badge) ; .ds-stats / .ds-stat ; Pastille tone=accent ; Input prefix, champ invalide à anneau, .ds-error et .ds-note ; .ds-meter--center ; Reseau (Instagram, TikTok, YouTube, Claude, cinq tailles, jumeaux sombres) ; .ds-sidebar__account ; .ds-appbar.">
        <Grid cols={2}>
          <Block label="Avatars">
            <Card gap={4}>
              <div className="flex flex-wrap items-end gap-space-4">
                <Avatar size="puce" initials="JF" tone="brand" alt="Julien Fernandes" />
                <Avatar size="carte" initials="JF" tone="brand" alt="Julien Fernandes" />
                <Avatar size="dialogue" initials="JC" ring badge={<Reseau name="instagram" size="xs" />} alt="Julien Créateur" />
                <Avatar size="panneau" initials="J" tone="neutral" alt="Julien" />
                <Avatar size="heros" initials="JF" tone="brand" alt="Julien Fernandes" />
                <Avatar size="ecran" initials="JF" alt="Julien Fernandes" />
              </div>
              <div className="ds-stats">
                <div className="ds-stat"><span className="ds-stat__value">12,4 k</span><span className="ds-stat__label">abonnés</span></div>
                <div className="ds-stat"><span className="ds-stat__value">318</span><span className="ds-stat__label">publications</span></div>
                <div className="ds-stat"><span className="ds-stat__value">4,2 %</span><span className="ds-stat__label">engagement</span></div>
              </div>
              <div className="flex flex-wrap gap-space-2">
                <Pastille size="puce" shape="round" tone="accent"><Icon name="eye" /></Pastille>
                <Pastille size="puce" shape="round" tone="amber"><Icon name="heart" /></Pastille>
                <Pastille size="puce" shape="round" tone="success"><Icon name="share" /></Pastille>
                <Pastille size="puce" shape="round" tone="neutral"><Icon name="bookmark" /></Pastille>
                <Pastille size="puce" shape="round" tone="coral"><Icon name="users" /></Pastille>
              </div>
            </Card>
          </Block>
          <Block label="Champs et notes">
            <Card gap={4}>
              <FormField label="Ton identifiant" htmlFor="handle" help="Tu peux aussi coller le lien de ton profil.">
                <Input id="handle" prefix="@" placeholder="julien.crea" />
              </FormField>
              <FormField label="Ton identifiant" htmlFor="handle-ko" error="On ne trouve pas ce compte. Vérifie l'orthographe.">
                <Input id="handle-ko" prefix="@" defaultValue="julien.craa" invalid />
              </FormField>
              <span className="ds-note"><Icon name="clock" />TikTok à 20:00 · même légende</span>
              <div className="ds-meter ds-meter--center">
                <div className="ds-meter__head"><span className="ds-meter__label">5 publications récentes sur 8</span></div>
                <Progress value={5} max={8} label="Publications récentes" />
                <span className="ds-meter__note">Encore 3 et on te dit tout.</span>
              </div>
            </Card>
          </Block>
        </Grid>
        <Grid cols={2}>
          <Block label="Réseaux : cinq tailles, quatre marques">
            <Card gap={3}>
              {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(s => (
                <div key={s} className="flex items-center gap-space-3">
                  <span className="w-space-6 text-caption text-text-muted">{s}</span>
                  <Reseau name="instagram" size={s} /><Reseau name="tiktok" size={s} /><Reseau name="youtube" size={s} /><Reseau name="claude" size={s} label="Claude" />
                </div>
              ))}
              <div className="flex items-center gap-space-3">
                <Logo variant="monogram" height="2.5rem" />
                <span aria-hidden="true" className="inline-flex items-center gap-space-1 text-text-muted"><span className="size-1.5 rounded-pill bg-current" /><span className="size-1.5 rounded-pill bg-current opacity-60" /><span className="size-1.5 rounded-pill bg-current opacity-30" /></span>
                <Reseau name="claude" size="xl" label="Claude" />
              </div>
            </Card>
          </Block>
          <Block label="Carte du compte (barre latérale) et barre haute mobile (réduis la fenêtre)">
            <Stack>
              <div className="ds-sidebar" style={{ width: '16rem', padding: 'var(--space-3)' }}>
                <a className="ds-sidebar__account" href="#fiches" onClick={e => e.preventDefault()}>
                  <Avatar size="carte" initials="JF" tone="brand" alt="Julien Fernandes" />
                  <span className="ds-sidebar__account-main"><span className="ds-sidebar__account-name">Julien Fernandes</span><span className="ds-sidebar__account-caption">1 abonnement · 2 outils</span></span>
                </a>
              </div>
              <header className="ds-appbar" style={{ display: 'flex', position: 'static' }}>
                <span className="ds-appbar__brand"><Logo variant="wordmark" height="1.25rem" /></span>
                <span className="ds-appbar__end"><IconButton label="Menu" variant="ghost"><Icon name="menu" /></IconButton></span>
              </header>
            </Stack>
          </Block>
        </Grid>
      </Section>

      <Section title="Encarts en ton doux" note="Banner tone=soft : la plaque crème rosée et le texte à l'encre, l'icône en sourdine. info reste le message de marque (texte corail), amber la contrainte, warning l'orange de ce qui risque d'échouer.">
        <Card gap={3} style={{ maxWidth: '40rem' }}>
          <Banner inset tone="soft" title="Pas d'audit, pas de souci.">Tu pourras le lancer plus tard, depuis Claude ou depuis Mes outils.</Banner>
          <Banner inset tone="amber">Certains comptes prennent un peu plus de temps, on y est presque.</Banner>
          <Banner inset tone="info">Ces hooks sont génériques : avec ton profil créateur, ils seraient à ta voix.</Banner>
          <Banner tone="soft" title="Tes 20 dernières vidéos ont aussi été analysées." icon={<Pastille size="carte" tone="success"><Icon name="check" strokeWidth={3} /></Pastille>} action={<Button variant="secondary" size="sm" surface="card">Voir</Button>} />
        </Card>
      </Section>
    </div>
  );
}
