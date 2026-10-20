import { useState } from 'react';
import type { ReactNode } from 'react';
import { Badge, Banner, Button, Card, Dropzone, EmptyState, FormField, Icon, Input, Logo, Pastille, Progress, Switch, Tabs } from '@yunary/ds';
import { Block, Grid, Section, Stack } from '../ui';

/* La page des outils et des écrans (v0.5.0, offre unique depuis 0.11.0) : la carte d'outil, son compteur,
   l'offre en plaque, les badges, les étapes, la coque d'un écran de Claude et ce qui s'y pose. Les libellés
   sont des exemples ; le prix et les quotas viennent du serveur, les logos des réseaux restent aux couches. */

function Coche() {
  return <Icon name="check" />;
}

function Perk({ children, tone = 'success', icon }: { children: ReactNode; tone?: 'success' | 'danger' | 'brand'; icon?: 'x' | 'zap' }) {
  return (
    <li className="ds-perk">
      <Pastille size="coche" tone={tone}>{icon ? <Icon name={icon} /> : <Coche />}</Pastille>
      {children}
    </li>
  );
}

function Prix({ montant, periode = '/ mois', note = 'Sans engagement' }: { montant: string; periode?: string; note?: string }) {
  return (
    <div className="ds-price ds-price--end ds-price--accent">
      <span className="ds-price__line"><span className="ds-price__amount">{montant}</span><span className="ds-price__period">{periode}</span></span>
      <span className="ds-price__note">{note}</span>
    </div>
  );
}

function Jauge({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="ds-meter">
      <div className="ds-meter__head"><span className="ds-meter__label">{label}</span></div>
      <Progress value={value} max={max} label={label} />
    </div>
  );
}

const OUTILS = [
  { nom: 'Analyse', phrase: 'Dépose une vidéo, on te dit pourquoi elle retient ou pas.', points: ['Transcription et sous-titres', 'Hook et structure décortiqués', 'Comparée à ce qui marche chez toi', 'Depuis Claude, en une phrase'], jauge: { label: '12 / 30 analyses ce mois-ci', value: 12, max: 30 } },
  { nom: 'Script', phrase: 'Ton script écrit avec Claude, prêt à tourner.', points: ['Des hooks qui arrêtent le scroll', 'Des structures qui captivent', 'Des scripts avec ta voix', 'Sans limite'] },
  { nom: 'Programmation', phrase: 'Programme chacune de tes vidéos depuis Claude.', points: ['Instagram, TikTok et YouTube', 'Une description par réseau', 'La miniature choisie dans la vidéo', 'Sans limite'] },
];

function CarteOutil({ o }: { o: (typeof OUTILS)[number] }) {
  return (
    <Card size="xl" gap={4} icon={<Logo variant="monogram" height="2.75rem" />}
      title={<>Yunary <span className="accent">{o.nom}</span></>} titleSize="lg" badge={<Badge tone="success" pad="dense">Actif</Badge>}>
      <p className="text-body-sm text-text-secondary">{o.phrase}</p>
      <ul className="ds-perks">{o.points.map(p => <Perk key={p}>{p}</Perk>)}</ul>
      {o.jauge ? <div className="max-w-narrow"><Jauge {...o.jauge} /></div> : null}
    </Card>
  );
}

/* La barre segmentée du parcours d'inscription : le rail, puis le compteur ; c'est l'app qui les place. */
function BarreEtapes({ total, faites, titre }: { total: number; faites: number; titre: string }) {
  return (
    <div className="flex items-center gap-space-3">
      <div className="ds-steps__track" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={faites} aria-label={`Étape ${faites} sur ${total}`}>
        {Array.from({ length: total }, (_, i) => <span key={i} className={i < faites ? 'ds-steps__seg is-done' : 'ds-steps__seg'} />)}
      </div>
      <p className="ds-steps__counter">Étape {faites} sur {total} <span className="ds-steps__counter-sub">· {titre}</span></p>
    </div>
  );
}

function Avancement() {
  return (
    <ol className="ds-steps ds-steps--vertical" aria-label="L'avancement">
      <li className="ds-step is-done"><span className="ds-step__mark"><Icon name="check" strokeWidth={3} /></span>Vidéo récupérée<span className="ds-step__meta">42 s</span></li>
      <li className="ds-step is-done"><span className="ds-step__mark"><Icon name="check" strokeWidth={3} /></span>Transcription<span className="ds-step__meta">relue</span></li>
      <li className="ds-step" aria-current="step"><span className="ds-step__mark"><span className="ds-spinner" /></span>Analyse visuelle<span className="ds-step__meta">14 sur 20</span></li>
      <li className="ds-step"><span className="ds-step__mark" />Performance</li>
      <li className="ds-step"><span className="ds-step__mark" />Fiche</li>
    </ol>
  );
}

function Lockup({ height = '1.375rem' }: { height?: string }) {
  return <Logo variant="monogram" height={height} />;
}

function EcranClaude({ dark = false }: { dark?: boolean }) {
  const [onglet, setOnglet] = useState('semaine');
  return (
    <div className={dark ? 'dark rounded-xl bg-background p-space-4' : 'rounded-xl bg-secondary p-space-4'} style={{ maxWidth: '42.5rem' }}>
      <Card variant="screen" icon={<Lockup />} title="Yunary Programmation" action={<span className="ds-help">Étape 2 sur 5</span>}
        foot={<><span>Dis « Prends le créneau de mardi » pour continuer.</span><Button variant="secondary" size="sm">Ouvrir dans Yunary</Button></>}>
        <ol className="ds-steps" aria-label="Les étapes">
          <li className="ds-step is-done"><span className="ds-step__mark"><Icon name="check" strokeWidth={3} /></span>Vidéo</li>
          <li className="ds-step" aria-current="step"><span className="ds-step__mark">2</span>Transcription</li>
          <li className="ds-step"><span className="ds-step__mark">3</span>Textes</li>
          <li className="ds-step"><span className="ds-step__mark">4</span>Miniature</li>
          <li className="ds-step"><span className="ds-step__mark">5</span>Programmer</li>
        </ol>
        <Tabs size="sm" value={onglet} onChange={setOnglet} items={[{ value: 'semaine', label: 'Semaine' }, { value: 'mois', label: 'Mois' }]} />
        <div className="ds-panel">
          <div className="ds-card__header"><Lockup /><h3 className="ds-card__title">Yunary Script</h3><span className="ds-card__action ds-help">Sans limite</span></div>
          <p className="text-body-sm">Ton script écrit avec Claude, prêt à tourner, et pensé pour captiver l'attention.</p>
          <div className="ds-panel__actions">
            <Button variant="secondary" size="sm" surface="card" icon={<Icon name="pencil" />}>Écrire un script</Button>
            <Button variant="secondary" size="sm" surface="card" icon={<Icon name="list" />}>Mes scripts</Button>
          </div>
        </div>
        <div className="ds-panel">
          <div className="ds-card__header"><Lockup /><h3 className="ds-card__title">Yunary Analyse</h3><span className="ds-card__action ds-help">12 / 30 ce mois-ci</span></div>
          <p className="text-body-sm">Dépose une vidéo, on te dit pourquoi elle retient ou pas.</p>
          <div className="ds-panel__actions">
            <Button variant="secondary" size="sm" surface="card" icon={<Icon name="video" />}>Analyser une vidéo</Button>
            <Button variant="secondary" size="sm" surface="card" icon={<Icon name="list" />}>Mes analyses</Button>
          </div>
          <Progress value={12} max={30} label="Analyses du mois" />
        </div>
        <Jauge label="12 / 30 analyses ce mois-ci" value={12} max={30} />
        <div role="radiogroup" aria-label="Le créneau" className="grid grid-cols-3 gap-space-2">
          {[['Mar 13', '18:00', 'reco'], ['Jeu 15', '12:30', 'choisi'], ['Sam 17', '10:00', '']].map(([j, h, etat]) => (
            <label key={j} className={etat === 'reco' ? 'ds-tile ds-tile--panel is-recommended' : 'ds-tile ds-tile--panel'}>
              <span className="ds-choice"><input type="radio" name={dark ? 'creneau-sombre' : 'creneau'} defaultChecked={etat === 'choisi'} /><span className="ds-choice__box ds-choice__box--radio" aria-hidden="true"><span className="ds-choice__dot" /></span></span>
              <span className="ds-tile__row"><span className="ds-tile__title">{j}</span>{etat === 'reco' ? <Badge tone="accent" pad="dense">Le plus proche</Badge> : null}</span>
              <span className="font-mono text-body">{h}</span>
            </label>
          ))}
        </div>
        <Banner inset tone="amber">TikTok n'accepte qu'un moment de la vidéo comme miniature.</Banner>
        <Banner inset tone="neutral">Chaque réseau se règle à part.</Banner>
        {/* 0.6.1 : encart, dépôt, envoi et état vide se relèvent en --card quoi qu'en disent les règles de contexte d'une carte (check-coque.mjs) */}
        <p className="ds-inset"><span className="ds-inset__value">« Trois erreurs qui tuent ta rétention » · 42 s · 1080 × 1920</span></p>
        <Dropzone variant="compact" title="Dépose ta vidéo" linkLabel="ou choisis un fichier" hint="MP4 ou MOV, 500 Mo max." onFiles={() => {}} />
        <div className="ds-upload">
          <div className="ds-file"><Pastille size="dialogue" shape="round" tone="neutral"><Icon name="video" /></Pastille><div className="ds-file__main"><span className="ds-file__name">retention-3-erreurs.mp4</span><span className="ds-file__meta">38 Mo · 61 %</span></div></div>
          <Progress value={61} max={100} label="Envoi" />
          <div className="ds-upload__foot"><span>Tu peux continuer à parler à Claude pendant l'envoi.</span></div>
        </div>
        <EmptyState compact icon={<Icon name="video" />} title="Aucune analyse ce mois" description="Dépose une vidéo pour commencer." />
        <FormField label="Description" htmlFor={dark ? 'desc-s' : 'desc'} action={<Button variant="ghost" size="xs" icon={<Icon name="copy" />}>Copier</Button>}>
          <Input id={dark ? 'desc-s' : 'desc'} defaultValue="Trois erreurs qui tuent ta rétention, et comment les corriger." />
        </FormField>
      </Card>
    </div>
  );
}

function PiedTrois({ dark = false }: { dark?: boolean }) {
  return (
    <div className={dark ? 'dark rounded-xl bg-background p-space-4' : 'rounded-xl bg-secondary p-space-4'} style={{ maxWidth: '42.5rem' }}>
      <Card variant="screen" icon={<Lockup />} title="Yunary Script" action={<span className="ds-help">Deux idées</span>}
        foot={<><span>Dis laquelle tu gardes.</span><span className="ds-card__foot-actions"><Button variant="secondary">Reprendre le hook 1</Button><Button variant="secondary">Changer l'accroche</Button><Button>Garder cette version</Button></span></>}>
        <p className="text-body-sm">Deux idées de hook, prêtes à tourner. Dis laquelle tu gardes, ou demande une troisième.</p>
      </Card>
    </div>
  );
}

export function OutilsPage() {
  const [reseau, setReseau] = useState('instagram');
  const [filtres, setFiltres] = useState(['@julien.crea', '15 derniers jours']);

  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Cartes d'outil" note="La carte d'un outil de l'offre Yunary (Mes outils) : Card size=xl (28 / 32) + badge collé au titre, une phrase, .ds-perks (deux colonnes tant que chacune a sa place) et, pour un outil à quota, une .ds-meter. Pas de prix par outil : l'offre est unique. Les cartes s'empilent à 16.">
        <div className="flex flex-col gap-space-4" style={{ maxWidth: '65rem' }}>
          {OUTILS.map(o => <CarteOutil key={o.nom} o={o} />)}
        </div>
      </Section>

      <Section title="L'offre en plaque, prix" note="Card variant=plaque : la carte feature posée DANS une carte, sans ombre, avec son pied (.ds-card__foot) sur un lavis --card 60 %. .ds-price--end --accent : le montant en dégradé, la période, la note.">
        <Grid cols={2}>
          <Block label="Dans la carte Comptes connectés">
            <Card title="Comptes connectés" subtitle="Les réseaux où Yunary publie." gap={4}>
              <Card variant="plaque" eyebrow="Compris dans Yunary"
                title={<>Yunary <span className="accent">Programmation</span></>} subtitle="Ce que tu débloques :"
                action={<Prix montant="19 €" note="Tout Yunary" />}
                foot={<><span>7 jours gratuits, puis 19 € par mois · sans engagement</span><Button size="sm">Démarrer mes 7 jours</Button></>}>
                <ul className="ds-perks">
                  <Perk>Connecter Instagram, TikTok et YouTube</Perk>
                  <Perk>Transcription et sous-titres</Perk>
                  <Perk>Descriptions pour chaque réseau</Perk>
                  <Perk>Programmée depuis Claude</Perk>
                </ul>
              </Card>
            </Card>
          </Block>
          <Block label="Une plaque d'information">
            <Card variant="plaque" eyebrow="Depuis Claude" title="« Prépare-moi une vidéo sur les 3 erreurs qui tuent la rétention »">
              <p className="text-body-sm text-text-secondary">Claude écrit le script avec toi, puis l'enregistre ici.</p>
              <div><Button variant="secondary" size="sm" surface="card">Connecter Claude</Button></div>
            </Card>
          </Block>
        </Grid>
      </Section>

      <Section title="Badges" note="L'icône est facultative ; le créneau du badge la dimensionne (0.875rem, 0.75rem en dense). tone=brand (dégradé), lead (tuile de tête 28 px), onRemove (croix de retrait).">
        <Card gap={4}>
          <div className="flex flex-wrap gap-space-2">
            <Badge tone="neutral" pad="dense">Brouillon</Badge><Badge tone="amber" pad="dense">Programmé</Badge><Badge tone="success" pad="dense">Publié</Badge><Badge tone="danger" pad="dense">Échec</Badge>
            <Badge tone="success" pad="dense" icon={<Icon name="check" strokeWidth={3} />}>Actif</Badge><Badge tone="outline" pad="dense">Verrouillé</Badge>
            <Badge tone="brand" pad="dense">À connecter</Badge><Badge tone="brand" pad="dense">19 € / mois</Badge>
          </div>
          <div className="flex flex-wrap gap-space-2">
            <Badge tone="success" icon={<Icon name="circle-check" />}>Au-dessus de sa moyenne</Badge><Badge tone="warning">En dessous de sa moyenne</Badge>
            <Badge tone="amber" icon={<Icon name="clock" />}>Encore quelques minutes</Badge><Badge tone="brand">Yunary Programmation</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-space-2">
            <Badge tone="outline" lead={<Pastille size="puce" tone="neutral"><Icon name="message-square" /></Pastille>}>Demandé depuis Claude</Badge>
            <Badge tone="outline" lead={<Pastille size="puce" tone="brand"><Icon name="mail" /></Pastille>}>julien@exemple.com</Badge>
            {filtres.map(f => <Badge key={f} tone={f.startsWith('@') ? 'accent' : 'amber'} icon={<Icon name={f.startsWith('@') ? 'user' : 'calendar'} />} onRemove={() => setFiltres(x => x.filter(y => y !== f))} removeLabel={`Retirer le filtre ${f}`}>{f}</Badge>)}
            {filtres.length < 2 ? <Button variant="ghost" size="xs" onClick={() => setFiltres(['@julien.crea', '15 derniers jours'])}>Remettre les filtres</Button> : null}
          </div>
        </Card>
      </Section>

      <Section title="Étapes" note=".ds-steps__track (segments pill, un seul dégradé continu) et .ds-steps__counter pour la coque du parcours d'inscription, placés par l'app ; .ds-steps--vertical (faite, en cours, à venir, méta mono) pour un traitement.">
        <Grid cols={2}>
          <Block label="Barre segmentée : 2 / 3, 3 / 3, 1 / 3">
            <Stack>
              <BarreEtapes total={3} faites={2} titre="Ton offre" />
              <BarreEtapes total={3} faites={3} titre="Installation" />
              <BarreEtapes total={3} faites={1} titre="Ton compte" />
            </Stack>
          </Block>
          <Block label="Liste verticale"><Card><Avancement /></Card></Block>
        </Grid>
      </Section>

      <Section title="Tuiles de choix" note=".ds-tile--choice (padding 16 / 18, titre body-lg gras, coche 18 px --primary-readable), en <button aria-pressed> ou en <label> ; .ds-tile--lift (choisie, elle remonte au niveau de la carte) ; .is-recommended. La grille qui les porte est à l'app.">
        <Grid cols={2}>
          <Block label="Ton réseau (aria-pressed)">
            <Card>
              <div className="grid grid-cols-1 gap-space-4 sm:grid-cols-2" role="group" aria-label="Ton réseau">
                {['instagram', 'tiktok'].map(r => (
                  <button key={r} type="button" className="ds-tile ds-tile--choice" aria-pressed={reseau === r} onClick={() => setReseau(r)}>
                    <span className="ds-tile__lead" aria-hidden="true"><Icon name={r === 'instagram' ? 'user' : 'video'} /></span>
                    <span className="ds-tile__main"><span className="ds-tile__title">{r === 'instagram' ? 'Instagram' : 'TikTok'}</span></span>
                    <span className="ds-tile__check" aria-hidden="true"><Icon name="check" strokeWidth={2.5} /></span>
                  </button>
                ))}
              </div>
            </Card>
          </Block>
          <Block label="Nouveau contenu (--lift, chevron) et recommandée">
            <Card gap={3}>
              <a className="ds-tile ds-tile--choice ds-tile--lift is-checked" href="#outils" onClick={e => e.preventDefault()}>
                <span className="ds-tile__lead"><Pastille size="dialogue" tone="brand" outlined><Icon name="zap" /></Pastille></span>
                <span className="ds-tile__main"><span className="ds-tile__title">Écrire un script avec Claude</span><span className="ds-tile__desc">Hooks, structure, script : tout dans la conversation.</span></span>
                <span className="ds-tile__check" aria-hidden="true"><Icon name="circle-check" /></span>
              </a>
              <a className="ds-tile ds-tile--choice" href="#outils" onClick={e => e.preventDefault()}>
                <span className="ds-tile__lead"><Pastille size="dialogue" tone="neutral"><Icon name="video" /></Pastille></span>
                <span className="ds-tile__main"><span className="ds-tile__title">J'ai déjà ma vidéo</span><span className="ds-tile__desc">Dépose-la, on écrit les textes.</span></span>
                <span className="ds-tile__end" aria-hidden="true"><Icon name="chevron-right" /></span>
              </a>
              <label className="ds-tile ds-tile--choice is-recommended">
                <span className="ds-choice"><input type="radio" name="hook" /><span className="ds-choice__box ds-choice__box--radio" aria-hidden="true"><span className="ds-choice__dot" /></span></span>
                <span className="ds-tile__main">
                  <span className="ds-tile__row"><span className="ds-tile__title">Tes vidéos ne sont pas trop longues</span><Badge tone="accent" pad="dense">Recommandé</Badge></span>
                  <span className="ds-tile__desc">Elles sont trop lentes à démarrer.</span>
                </span>
              </label>
            </Card>
          </Block>
        </Grid>
      </Section>

      <Section title="Encarts, bouton xs, interrupteur" note="Banner inset : titre en body gras, une Pastille à la place de l'icône ; Banner align=start ; Button size=xs (28 px) ; Switch labelPosition=start (le libellé avant la piste, la rangée d'un réglage).">
        <Grid cols={2}>
          <Block label="Encarts">
            <Card gap={3}>
              <Banner inset tone="danger" title="Ta vidéo dure 4 min 12 s">Coupe-la sous 3 minutes, puis dépose-la de nouveau.</Banner>
              <Banner inset tone="neutral" icon={<Pastille size="carte" tone="amber"><Icon name="calendar" /></Pastille>} title="Ton compteur repart le 26 octobre">Il te reste 18 analyses ce mois-ci.</Banner>
              <Banner inset tone="info" icon={<Pastille size="carte" tone="brand" outlined><Icon name="zap" /></Pastille>} title="Ton essai se termine dans 5 jours">Rien n'est prélevé avant le 24/10/2026.</Banner>
              <Banner tone="warning" align="start" title="Cette vidéo est privée">On ne peut lire que les vidéos publiques. Passe-la en public le temps de l'analyse, tu la refermes après.</Banner>
            </Card>
          </Block>
          <Block label="Copier, interrupteur">
            <Card gap={4}>
              <FormField label="Serveur Yunary" htmlFor="srv" action={<Button variant="ghost" size="xs" icon={<Icon name="copy" />}>Copier</Button>}>
                <Input id="srv" readOnly defaultValue="https://auth.yunary.com/functions/v1/mcp" />
              </FormField>
              <div className="flex flex-wrap items-center gap-space-4">
                <Button size="xs" variant="secondary" surface="card" icon={<Icon name="copy" />}>Copier</Button>
                <Button size="xs" variant="ghost" icon={<Icon name="pencil" />}>Modifier</Button>
                <Button size="xs" variant="ghost" loading>Copié</Button>
              </div>
              <div className="flex flex-col gap-space-3">
                <Switch label="Rappels avant publication" labelPosition="start" defaultChecked />
                <Switch label="Actualités de Yunary" labelPosition="start" />
              </div>
            </Card>
          </Block>
        </Grid>
      </Section>

      <Section title="La coque d'un écran de Claude" note="Card variant=screen : --background, sans ombre, padding 18 / 20, pile ; tout ce qui s'y pose se relève en --card (panneau, champ, encart, dépôt, envoi, état vide, barre, tuile au repos) quoi qu'en disent les règles de contexte d'une carte (0.6.1, mesuré par check-coque.mjs) ; la tuile choisie redescend sur --background. Le pied .ds-card__foot. À gauche sur la crème de l'hôte, à droite en sombre.">
        <Grid cols={2}>
          <Block label="Clair"><EcranClaude /></Block>
          <Block label="Sombre (forcé, même quand la vitrine est claire)"><EcranClaude dark /></Block>
        </Grid>
      </Section>
      <Section title="Le pied d'un écran à trois boutons" note="Dans la coque, les boutons md du pied (.ds-card__foot) serrent leur rembourrage à 16 de côté : trois actions sur une ligne à 680 (0.6.2). Les crans sm, xs et lg ne bougent pas, les boutons hors de la coque non plus. Plusieurs boutons vont dans .ds-card__foot-actions : à droite avec la gouttière, et toujours à droite quand ils passent dessous à 390.">
        <div className="flex flex-col gap-space-4">
          <Block label="Clair"><PiedTrois /></Block>
          <Block label="Sombre"><PiedTrois dark /></Block>
        </div>
      </Section>
    </div>
  );
}
