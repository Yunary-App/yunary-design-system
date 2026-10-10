import { useState } from 'react';
import type { ReactNode } from 'react';
import { Badge, Banner, Button, Card, FormField, Icon, Input, Logo, Pastille, Progress, Switch, Tabs } from '@yunary/ds';
import { Block, Grid, Section, Stack } from '../ui';

/* La page des outils et des écrans (v0.5.0) : la carte d'outil et son offre, les compteurs, les badges, les
   étapes, la coque d'un écran de Claude et ce qui s'y pose. Les libellés sont des exemples ; les prix et les
   quotas viennent du serveur, les logos des réseaux restent aux couches. */

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

function Prix({ montant, periode = '/ mois', note = 'Sans engagement', accent = true, sm = false }: { montant: string; periode?: string; note?: string; accent?: boolean; sm?: boolean }) {
  return (
    <div className={['ds-price ds-price--end', accent && 'ds-price--accent', sm && 'ds-price--sm'].filter(Boolean).join(' ')}>
      <span className="ds-price__line"><span className="ds-price__amount">{montant}</span><span className="ds-price__period">{periode}</span></span>
      <span className="ds-price__note">{note}</span>
    </div>
  );
}

function Jauge({ label, value, max, note }: { label: string; value: number; max: number; note?: string }) {
  return (
    <div className="ds-meter">
      <div className="ds-meter__head"><span className="ds-meter__label">{label}</span></div>
      <Progress value={value} max={max} label={label} />
      {note ? <span className="ds-meter__note">{note}</span> : null}
    </div>
  );
}

function CarteOutil({ etat }: { etat: 'actif' | 'a-activer' | 'resilie' | 'a-venir' | 'inclus' }) {
  const badge = etat === 'actif' || etat === 'inclus' ? <Badge tone="success" pad="dense">Actif</Badge>
    : etat === 'resilie' ? <Badge tone="amber" pad="dense">Se termine le 26/10</Badge>
    : etat === 'a-venir' ? <Badge tone="amber" pad="dense">À venir</Badge> : null;
  const nom = etat === 'inclus' ? 'Script' : etat === 'a-venir' ? 'Métriques' : etat === 'a-activer' ? 'Programmation' : 'Analyse';
  return (
    <Card size="xl" upcoming={etat === 'a-venir'} icon={<Logo variant="monogram" height="2.75rem" />}
      title={<>Yunary <span className="accent">{nom}</span></>} titleSize="lg" badge={badge}>
      <div className="ds-offer">
        <div className="ds-offer__main">
          <p className="text-body-sm text-text-secondary">Ce que l'outil fait pour toi, en une phrase qui vient de la base.</p>
          <ul className="ds-perks">
            <Perk>Connecter Instagram, TikTok et YouTube</Perk>
            <Perk>Transcription et sous-titres automatiques</Perk>
            <Perk>Descriptions écrites pour chaque réseau</Perk>
            <Perk>Programmée en un message depuis Claude</Perk>
          </ul>
          {etat === 'actif' || etat === 'resilie' ? (
            <div className="ds-meters">
              <Jauge label="41 / 50 analyses" value={41} max={50} note="Ce mois · se renouvelle le 26 octobre" />
              <Jauge label="1 / 2 audits" value={1} max={2} note="Utilisables jusqu'à la fin" />
            </div>
          ) : null}
        </div>
        <div className="ds-offer__aside">
          {etat === 'inclus' ? <Prix montant="Gratuit" periode="" note="Toujours actif" accent={false} /> : etat === 'a-venir' ? <Prix montant="Bientôt" periode="" note="Arrive après le lancement" accent={false} /> : <Prix montant={etat === 'a-activer' ? '12 €' : '9 €'} />}
          {etat === 'inclus' ? <Switch label="Toujours actif" labelPosition="start" locked defaultChecked aria-label="Yunary Script, toujours actif" />
            : etat === 'a-venir' ? <Button variant="secondary" surface="card" disabled>Bientôt</Button>
            : etat === 'actif' ? <Button variant="secondary" surface="card">Ajouter des analyses</Button>
            : etat === 'resilie' ? <Button>Réactiver Analyse</Button>
            : <Button>Activer Programmation</Button>}
        </div>
      </div>
    </Card>
  );
}

function BarreEtapes({ total, faites, titre }: { total: number; faites: number; titre: string }) {
  return (
    <div className="ds-steps ds-steps--bar">
      <div className="ds-steps__track" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={faites} aria-label={`Étape ${faites} sur ${total}`}>
        {Array.from({ length: total }, (_, i) => <span key={i} className={i < faites ? 'ds-steps__seg is-done' : 'ds-steps__seg'} />)}
      </div>
      <p className="ds-steps__counter">Étape {faites} / {total} <span className="ds-steps__counter-sub">· {titre}</span></p>
    </div>
  );
}

function Avancement() {
  return (
    <ol className="ds-steps ds-steps--vertical" aria-label="L'avancement">
      <li className="ds-step is-done"><span className="ds-step__mark"><Icon name="check" strokeWidth={3} /></span>Compte trouvé<span className="ds-step__meta">public</span></li>
      <li className="ds-step is-done"><span className="ds-step__mark"><Icon name="check" strokeWidth={3} /></span>Profil lu<span className="ds-step__meta">12,4 k</span></li>
      <li className="ds-step" aria-current="step"><span className="ds-step__mark"><span className="ds-spinner" /></span>Vidéos récupérées<span className="ds-step__meta">14 sur 20</span></li>
      <li className="ds-step"><span className="ds-step__mark" />Analyse</li>
      <li className="ds-step"><span className="ds-step__mark" />Bilan</li>
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
          <div className="ds-card__header"><Lockup /><h3 className="ds-card__title">Yunary Script</h3><span className="ds-card__action ds-help">Gratuit</span></div>
          <p className="text-body-sm">Ton script écrit avec Claude, prêt à tourner, et pensé pour captiver l'attention.</p>
          <div className="ds-panel__actions">
            <Button variant="secondary" size="sm" surface="card" icon={<Icon name="pencil" />}>Écrire un script</Button>
            <Button variant="secondary" size="sm" surface="card" icon={<Icon name="list" />}>Mes scripts</Button>
          </div>
        </div>
        <div className="ds-panel is-locked">
          <div className="ds-card__header"><Lockup /><h3 className="ds-card__title">Yunary Analyse</h3><span className="ds-card__action ds-help">9 € / mois</span></div>
          <p className="text-body-sm">Dépose une vidéo, on te dit pourquoi elle retient ou pas.</p>
          <div className="ds-panel__actions" aria-hidden="true">
            <Button variant="secondary" size="sm" surface="card">Analyser une vidéo</Button>
            <Button variant="secondary" size="sm" surface="card">Mes analyses</Button>
          </div>
          <Button size="sm" fullWidth>Activer Analyse</Button>
        </div>
        <div className="ds-meters">
          <Jauge label="41 / 50 analyses" value={41} max={50} note="Ce mois" />
          <Jauge label="1 / 2 audits" value={1} max={2} note="Ce mois" />
        </div>
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
        <FormField label="Description" htmlFor={dark ? 'desc-s' : 'desc'} action={<Button variant="ghost" size="xs" icon={<Icon name="copy" />}>Copier</Button>}>
          <Input id={dark ? 'desc-s' : 'desc'} defaultValue="Trois erreurs qui tuent ta rétention, et comment les corriger." />
        </FormField>
      </Card>
    </div>
  );
}

export function OutilsPage() {
  const [reseau, setReseau] = useState('instagram');
  const [filtres, setFiltres] = useState(['@julien.crea', '15 derniers jours']);

  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Cartes d'outil" note="Card size=xl (28 / 32) + badge collé au titre, .ds-offer (contenu · colonne prix de 15 rem, empilée sous 64 rem), .ds-perks (deux colonnes, même à 390), .ds-meters, Card upcoming, Switch locked. Les cartes s'empilent à 16 (.ds-offers).">
        <div className="ds-offers" style={{ maxWidth: '65rem' }}>
          <CarteOutil etat="inclus" />
          <CarteOutil etat="actif" />
          <CarteOutil etat="a-activer" />
          <CarteOutil etat="resilie" />
          <CarteOutil etat="a-venir" />
        </div>
      </Section>

      <Section title="Offre en plaque, prix" note="Card variant=plaque : la carte feature posée DANS une carte, sans ombre, avec son pied (.ds-card__foot) sur un lavis --card 60 %. .ds-price--accent (montant en dégradé), --row (période et note à droite du montant).">
        <Grid cols={2}>
          <Block label="Dans la carte Comptes connectés">
            <Card title="Comptes connectés" subtitle="Les réseaux où Yunary publie." gap={4}>
              <Card variant="plaque" eyebrow="Disponible avec Yunary Programmation"
                title={<>Yunary <span className="accent">Programmation</span></>} subtitle="Ce que tu débloques :"
                action={<Prix montant="12 €" sm />}
                foot={<><span>Sans engagement · résiliable à tout moment</span><Button size="sm">Activer Programmation</Button></>}>
                <ul className="ds-perks">
                  <Perk>Connecter Instagram, TikTok et YouTube</Perk>
                  <Perk>Transcription et sous-titres</Perk>
                  <Perk>Descriptions pour chaque réseau</Perk>
                  <Perk>Programmée depuis Claude</Perk>
                </ul>
              </Card>
            </Card>
          </Block>
          <Block label="Prix en rangée, prix d'écran">
            <Stack>
              <Card>
                <div className="ds-price ds-price--row ds-price--accent">
                  <span className="ds-price__amount">Offert</span>
                  <span className="ds-price__aside"><span className="ds-price__period">avec un outil payant</span><span className="ds-price__note">Programmation 12 € / mois · Analyse 9 € / mois</span></span>
                </div>
              </Card>
              <Card variant="plaque" eyebrow="Depuis Claude" title="« Prépare-moi une vidéo sur les 3 erreurs qui tuent la rétention »">
                <p className="text-body-sm text-text-secondary">Claude écrit le script avec toi, puis l'enregistre ici.</p>
                <div><Button variant="secondary" size="sm" surface="card">Connecter Claude</Button></div>
              </Card>
            </Stack>
          </Block>
        </Grid>
      </Section>

      <Section title="Badges" note="L'icône est facultative ; le créneau du badge la dimensionne (0.875rem, 0.75rem en dense). tone=brand (dégradé), lead (tuile de tête 28 px), onRemove (croix de retrait).">
        <Card gap={4}>
          <div className="flex flex-wrap gap-space-2">
            <Badge tone="neutral" pad="dense">Brouillon</Badge><Badge tone="amber" pad="dense">Programmé</Badge><Badge tone="success" pad="dense">Publié</Badge><Badge tone="danger" pad="dense">Échec</Badge>
            <Badge tone="success" pad="dense" icon={<Icon name="check" strokeWidth={3} />}>Actif</Badge><Badge tone="outline" pad="dense">Verrouillé</Badge>
            <Badge tone="brand" pad="dense">À connecter</Badge><Badge tone="brand" pad="dense">12 € / mois</Badge>
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

      <Section title="Étapes" note=".ds-steps--bar (segments pill, un seul dégradé continu, compteur) pour le shell de l'onboarding ; .ds-steps--vertical (faite, en cours, à venir, méta mono) pour un traitement.">
        <Grid cols={2}>
          <Block label="Barre segmentée : 2 / 4, 3 / 3, 1 / 5">
            <Stack>
              <BarreEtapes total={4} faites={2} titre="Tes outils" />
              <BarreEtapes total={3} faites={3} titre="Installation" />
              <BarreEtapes total={5} faites={1} titre="Toi" />
            </Stack>
          </Block>
          <Block label="Liste verticale"><Card><Avancement /></Card></Block>
        </Grid>
      </Section>

      <Section title="Tuiles de choix" note=".ds-tile--choice (padding 16 / 18, titre body-lg gras, coche 18 px --primary-readable), en <button aria-pressed> ou en <label> ; .ds-tiles, .ds-tile--span ; .ds-tile--lift (choisie, elle remonte au niveau de la carte) ; .is-recommended.">
        <Grid cols={2}>
          <Block label="Ton réseau (aria-pressed)">
            <Card>
              <div className="ds-tiles" role="group" aria-label="Ton réseau">
                {['instagram', 'tiktok'].map(r => (
                  <button key={r} type="button" className="ds-tile ds-tile--choice" aria-pressed={reseau === r} onClick={() => setReseau(r)}>
                    <span className="ds-tile__lead" aria-hidden="true"><Icon name={r === 'instagram' ? 'user' : 'video'} /></span>
                    <span className="ds-tile__main"><span className="ds-tile__title">{r === 'instagram' ? 'Instagram' : 'TikTok'}</span></span>
                    <span className="ds-tile__check" aria-hidden="true"><Icon name="check" strokeWidth={2.5} /></span>
                  </button>
                ))}
                <button type="button" className="ds-tile ds-tile--choice ds-tile--span" aria-pressed={reseau === 'aucun'} onClick={() => setReseau('aucun')}>
                  <span className="ds-tile__main"><span className="ds-tile__title">Je n'ai pas de compte / je ne veux pas d'audit</span></span>
                  <span className="ds-tile__check" aria-hidden="true"><Icon name="check" strokeWidth={2.5} /></span>
                </button>
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

      <Section title="Encarts, bouton xs, interrupteur verrouillé" note="Banner inset : titre en body gras, une Pastille à la place de l'icône ; Banner align=start ; Button size=xs (28 px) ; Switch locked (piste pleine, cadenas, aria-readonly) et labelPosition=start.">
        <Grid cols={2}>
          <Block label="Encarts">
            <Card gap={3}>
              <Banner inset tone="danger" title="Ta vidéo dure 4 min 12 s">Coupe-la sous 3 minutes, puis dépose-la de nouveau.</Banner>
              <Banner inset tone="neutral" icon={<Pastille size="carte" tone="amber"><Icon name="calendar" /></Pastille>} title="Recharge le 23 octobre">Il te reste 12 jours.</Banner>
              <Banner inset tone="info" icon={<Pastille size="carte" tone="brand" outlined><Icon name="zap" /></Pastille>} title="Besoin de plus ?">Tu peux acheter 20 analyses de plus pour 3 €, une fois.</Banner>
              <Banner tone="warning" align="start" title="Ce compte est privé">On ne peut lire que les comptes publics. Passe-le en public le temps de l'audit, tu le refermes après.</Banner>
            </Card>
          </Block>
          <Block label="Copier, verrouillé">
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
                <Switch label="Toujours actif" labelPosition="start" locked defaultChecked aria-label="Yunary Script, toujours actif" />
                <Switch label="Activer" labelPosition="start" />
                <Switch label="Activé" labelPosition="start" defaultChecked />
              </div>
            </Card>
          </Block>
        </Grid>
      </Section>

      <Section title="La coque d'un écran de Claude" note="Card variant=screen : --background, sans ombre, padding 18 / 20, pile ; tout ce qui s'y pose se relève en --card (panneau, champ, encart, barre, tuile au repos) ; la tuile choisie redescend sur --background. Le pied .ds-card__foot. À gauche sur la crème de l'hôte, à droite en sombre.">
        <Grid cols={2}>
          <Block label="Clair"><EcranClaude /></Block>
          <Block label="Sombre (forcé, même quand la vitrine est claire)"><EcranClaude dark /></Block>
        </Grid>
      </Section>
    </div>
  );
}
