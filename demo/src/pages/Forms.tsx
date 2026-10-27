import { useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { IDENTITY } from '../identity';
import { Badge, Calendar, Checkbox, DatePicker, FormField, Icon, Input, Select, Switch, Textarea, cn } from '@yunary/ds';
import { Block, Grid, Row, Section, Stack } from '../ui';
import { PAYS } from '../pays';

/* Une vignette IMAGE de recette : un SVG en data-URI (aucun fichier, aucune requête), au format
   vertical pour que le `cover` ait quelque chose à rogner. */
const VIGNETTE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a4a3f"/><stop offset="1" stop-color="#1f1e1c"/></linearGradient></defs><rect width="90" height="160" fill="url(#g)"/><circle cx="45" cy="60" r="22" fill="#f08029" opacity=".9"/><rect x="18" y="104" width="54" height="8" rx="4" fill="#f6f2ec" opacity=".8"/><rect x="26" y="120" width="38" height="6" rx="3" fill="#f6f2ec" opacity=".5"/></svg>',
);

/* LA TUILE COCHABLE, EN CLASSES. Il n'y a pas de composant React : une app écrit le balisage
   elle-même, comme ci-dessous. Classes écrites EN CLAIR pour que check-classes.mjs les voie. */
type TuileProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'title'> & {
  radio?: boolean; title: ReactNode; description?: ReactNode; meta?: ReactNode; media?: ReactNode;
  start?: boolean; etat?: string; children?: ReactNode;
  compact?: boolean; chip?: boolean; lead?: ReactNode;
};
function Tuile({ radio = false, title, description, meta, media, start = false, etat, disabled, children, compact = false, chip = false, lead, ...rest }: TuileProps) {
  return (
    <label className={cn('ds-tile', Boolean(media) && 'ds-tile--media', !media && start && 'ds-tile--start', (compact || chip) && 'ds-tile--compact', chip && 'ds-tile--chip', disabled && 'is-disabled', etat)}>
      {media ? <span className="ds-tile__media" aria-hidden="true">{media}</span> : null}
      {chip ? <span className="ds-tile__check" aria-hidden="true"><Icon name="check" strokeWidth={3} /></span> : null}
      {lead ? <span className="ds-tile__lead" aria-hidden="true">{lead}</span> : null}
      <span className="ds-choice">
        <input type={radio ? 'radio' : 'checkbox'} disabled={disabled} {...rest} />
        {radio
          ? <span className="ds-choice__box ds-choice__box--radio" aria-hidden="true"><span className="ds-choice__dot" /></span>
          : <span className="ds-choice__box" aria-hidden="true"><Icon name="check" size="0.8125rem" strokeWidth={3} /></span>}
      </span>
      <span className="ds-tile__main">
        <span className="ds-tile__title">{title}</span>
        {description ? <span className="ds-tile__desc">{description}</span> : null}
        {children}
      </span>
      {meta ? <span className="ds-tile__meta">{meta}</span> : null}
    </label>
  );
}

/* LE ROND, EN CLASSES. Pas de composant React : `.ds-choice` + `.ds-choice__box--radio`, toujours dans
   un groupe nommé. */
type RondProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode; etat?: string };
function Rond({ label, etat, disabled, ...rest }: RondProps) {
  return (
    <label className={cn('ds-choice', disabled && 'is-disabled', etat)}>
      <input type="radio" disabled={disabled} {...rest} />
      <span className="ds-choice__box ds-choice__box--radio" aria-hidden="true"><span className="ds-choice__dot" /></span>
      <span>{label}</span>
    </label>
  );
}

const RESEAUX = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
];

/* LA LISTE OUVERTE, EN CLASSES — le spécimen figé de ce que Select ouvre (le composant la pose dans un
   portail, `.ds-dropdown--liste`, en position fixe). Classes écrites EN CLAIR pour check-classes.mjs. */
function ListeOuverte({ actif = 1, choisi = 0 }: { actif?: number; choisi?: number }) {
  return (
    <div role="listbox" aria-label="Spécimen de la liste ouverte" className="ds-dropdown">
      {RESEAUX.map((o, i) => (
        <div key={o.value} role="option" aria-selected={i === choisi} className={cn('ds-dropdown__item', i === choisi && 'is-checked', i === actif && 'is-hover')}>
          <span className="ds-dropdown__label">{o.label}</span>
          {i === choisi ? <span className="ds-dropdown__check" aria-hidden="true"><Icon name="check" size="1rem" /></span> : null}
        </div>
      ))}
    </div>
  );
}

/* Le Select en vrai : contrôlé, son `onChange` reçoit l'événement du <select> natif caché. */
function SelectEnVrai() {
  const [reseau, setReseau] = useState('instagram');
  const [pays, setPays] = useState('FR');
  return (
    <Grid cols={2}>
      <Stack label="contrôlé — e.target.value">
        <FormField label="Ton réseau" htmlFor="select-vrai" help={`onChange → e.target.value = « ${reseau} »`}>
          <Select id="select-vrai" options={RESEAUX} value={reseau} onChange={e => setReseau(e.target.value)} />
        </FormField>
      </Stack>
      <Stack label="longue liste, autoComplete=&quot;country&quot; — défile, premières lettres">
        <form onSubmit={e => e.preventDefault()}>
          <FormField label="Pays" htmlFor="select-pays" help={`Valeur de formulaire : ${pays}`}>
            <Select id="select-pays" name="country" autoComplete="country" options={PAYS} value={pays} onChange={e => setPays(e.target.value)} />
          </FormField>
        </form>
      </Stack>
      <Stack label="dans une carte qui coupe ce qui dépasse (overflow hidden) — la liste passe devant">
        <div className="overflow-hidden rounded-lg border border-border bg-card p-space-4">
          <Select aria-label="Visibilité YouTube" surface="card" options={[{ value: 'public', label: 'Publique' }, { value: 'unlisted', label: 'Non répertoriée' }, { value: 'private', label: 'Privée' }]} defaultValue="public" />
        </div>
      </Stack>
      <Stack label="dans un libellé qui l'enveloppe (comme la période de l'Admin)">
        <label className="flex flex-col gap-space-2">
          <span className="text-caption font-semibold">Période</span>
          <Select options={[{ value: '7', label: '7 jours' }, { value: '30', label: '30 jours' }, { value: '90', label: '90 jours' }, { value: '0', label: 'Depuis le lancement' }]} defaultValue="30" />
        </label>
      </Stack>
    </Grid>
  );
}

export function FormsPage() {
  const [checked, setChecked] = useState(true);
  const [niveau, setNiveau] = useState('debutant');
  const [reseau, setReseau] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');
  const [niche, setNiche] = useState('food');
  const [themes, setThemes] = useState<string[]>(['Voyage', 'Écriture']);
  const basculer = (v: string) => setThemes(l => (l.includes(v) ? l.filter(x => x !== v) : [...l, v]));
  const [sombre, setSombre] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 8, 24));

  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Input" note="Rail de contrôle partagé, bordure 1.5px. Le focus se lit sur la bordure seule, qui passe en --ring — jamais d'anneau en plus. Jamais un pill.">
        <Block label="Tailles">
          <Stack>
            <Input size="sm" placeholder="Petite — 2.375rem" />
            <Input size="md" placeholder="ton@email.com" />
            <Input size="lg" placeholder="Grande — 3.25rem" />
          </Stack>
        </Block>
        <Block label="États">
          <Stack>
            <Input placeholder="Repos" />
            <Input className="is-focus" defaultValue="Focus" />
            <Input invalid defaultValue="pas-un-email" />
            <Input disabled defaultValue="Indisponible" />
            <Input readOnly defaultValue="Lecture seule — se sélectionne, reste focusable" />
          </Stack>
        </Block>
        <Block label="Surfaces" hint="page (défaut) = le champ est posé à même le layout, fond --secondary — comme la navbar, les onglets et la recherche · card = dans une card, fond --background.">
          <Stack>
            <Input surface="page" placeholder="surface=page (défaut)" />
            <Input surface="card" placeholder="surface=card" />
          </Stack>
        </Block>
        <Block label="Unité" hint="unit pose l'unité dans le champ, à droite, en sourdine — trois caractères au plus. aria-hidden : c'est le libellé du FormField qui la nomme.">
          <Stack>
            <Input unit="kg" inputMode="decimal" placeholder="72" />
            <Input unit="€" inputMode="decimal" placeholder="49" />
            <Input unit="min" inputMode="numeric" invalid defaultValue="beaucoup" />
          </Stack>
        </Block>
        <Block label="Icône de fin" hint="iconEnd pose un glyphe dans le champ, à droite, en sourdine, à 1rem. Décoratif (aria-hidden) : le sens se dit dans le libellé ou l'aide. Le cas type : le champ verrouillé, readOnly + cadenas.">
          <Stack>
            <FormField label="E-mail" htmlFor="demo-verrou" help="Sert d'identifiant, ne se change pas.">
              <Input id="demo-verrou" type="email" readOnly defaultValue="julien@exemple.com" iconEnd={<Icon name="lock" />} />
            </FormField>
            <Input placeholder="Rechercher" iconEnd={<Icon name="search" />} />
            <Input className="is-focus" defaultValue="Focus" iconEnd={<Icon name="lock" />} />
            <Input disabled defaultValue="Désactivé" iconEnd={<Icon name="lock" />} />
            <Input unit="€" inputMode="decimal" placeholder="49" iconEnd={<Icon name="lock" />} />
          </Stack>
        </Block>
      </Section>

      <Section title="Textarea" note="Hauteur automatique — jamais de min-height. Redimensionnement vertical uniquement. Même règle de surface que l'Input.">
        <Block label="Repos, focus, erreur, désactivé">
          <Stack>
            <Textarea rows={3} placeholder="Décris ta vidéo en deux phrases." />
            <Textarea rows={2} className="is-focus" defaultValue="Focus" />
            <Textarea rows={2} invalid defaultValue="Trop court" />
            <Textarea rows={2} disabled defaultValue="Indisponible" />
            <Textarea rows={2} surface="card" defaultValue="surface=card" />
          </Stack>
        </Block>
      </Section>

      <Section title="Select" note="Le champ sur le rail 3rem, avec un chevron Lucide ; il ouvre la liste Yunary (0.12.0), plus celle du navigateur : les classes du menu (.ds-dropdown--liste), l'élément choisi coché, posée par un portail. Clavier du combobox select-only (APG) : ↓ ↑ Entrée Espace ouvrent, ↓ ↑ Début Fin déplacent, Entrée Espace choisissent, Échap ferme, les premières lettres trouvent. Un <select> natif caché garde e.target.value, le formulaire et l'autoremplissage.">
        <Block label="Repos, focus, erreur, désactivé">
          <Stack>
            <Select aria-label="Réseau, repos" options={RESEAUX} defaultValue="instagram" />
            <Select aria-label="Réseau, focus" options={RESEAUX} className="is-focus" defaultValue="tiktok" />
            <Select aria-label="Réseau, erreur" options={RESEAUX} invalid defaultValue="instagram" />
            <Select aria-label="Réseau, désactivé" options={RESEAUX} disabled defaultValue="instagram" />
            <Select aria-label="Réseau, surface carte" options={RESEAUX} surface="card" defaultValue="youtube" />
          </Stack>
        </Block>
        <Block label="En vrai" hint="Clique, ou Tab puis ↓. La liste s'ouvre au-dessus quand la place manque en bas, défile quand elle est longue, se ferme au clic dehors et à Échap, rend le focus au champ.">
          <SelectEnVrai />
        </Block>
        <Block label="La liste ouverte, figée" hint="Le spécimen de ce que le champ ouvre : l'item choisi sur la plaque --accent avec sa coche, l'item actif au clavier (ou survolé) sur --surface-alt, cerclé de l'anneau de focus (--ring, 2 px, à l'intérieur). Sur la page comme sur une carte, la liste est sur --popover, jamais la couleur de sa surface.">
          <Row>
            <ListeOuverte />
            <div className="rounded-lg border border-border bg-card p-space-4"><ListeOuverte actif={2} choisi={1} /></div>
          </Row>
        </Block>
      </Section>

      <Section title="Checkbox, rond, Switch" note="Case 1.25rem, rond 1.25rem à point 0.625rem (classes .ds-choice, sans composant), switch 2.75 × 1.625rem à knob 1.25rem.">
        <Grid cols={3}>
          <Block label="Checkbox">
            <Stack>
              <Checkbox label="Je veux recevoir les actualités de Yunary" checked={checked} onChange={e => setChecked(e.target.checked)} />
              <Checkbox label="Non coché" defaultChecked={false} />
              <Checkbox label="Indéterminée — sélection partielle" indeterminate />
              <Checkbox label="Hover" className="is-hover" />
              <Checkbox label="Focus" className="is-focus" defaultChecked />
              <Checkbox label="Option indisponible" disabled />
              <Checkbox label="Cochée et désactivée" disabled defaultChecked />
            </Stack>
          </Block>
          <Block label="Rond — classes .ds-choice" hint="Toujours dans un groupe nommé. Le hub l'écrit dans ses tuiles de choix.">
            <Stack>
              <Rond name="niveau" value="debutant" label="Je débute" checked={niveau === 'debutant'} onChange={() => setNiveau('debutant')} />
              <Rond name="niveau" value="avance" label="Je publie déjà chaque semaine" checked={niveau === 'avance'} onChange={() => setNiveau('avance')} />
              <Rond name="niveau-demo" value="hover" label="Hover" etat="is-hover" />
              <Rond name="niveau-demo" value="focus" label="Focus" etat="is-focus" defaultChecked />
              <Rond name="niveau-off" value="off" label="Indisponible" disabled />
            </Stack>
          </Block>
          <Block label="Switch" hint="Bascule instantanée — pas de bouton Enregistrer.">
            <Stack>
              <Switch label="Thème sombre" checked={sombre} onChange={e => setSombre(e.target.checked)} />
              <Switch label="Non activé" />
              <Switch label="Hover" className="is-hover" />
              <Switch label="Focus" className="is-focus" defaultChecked />
              <Switch label="Indisponible" disabled />
              <Switch label="Activé et indisponible" disabled defaultChecked />
            </Stack>
          </Block>
        </Grid>
      </Section>

      <Section title="Tuile cochable — classes .ds-tile" note="UNE anatomie pour tous les choix en tuile, sans composant React : le balisage s'écrit dans l'app. Fond --background, radius md, filet 1,5 px ; cochée : filet --primary + plaque --accent, le titre reste en encre à sa graisse. La tuile est le label : toute sa surface coche, clavier et formulaire sont ceux de l'input natif, le contrôle .ds-choice rend dedans.">
        <Grid cols={2}>
          <Block label="Choix unique — input radio" hint="Dans un role=radiogroup, même name. La méta en fin de ligne (.ds-tile__meta).">
            <div role="radiogroup" aria-label="Ton réseau principal" className="flex flex-col gap-space-3">
              <Tuile radio name="reseau" value="instagram" checked={reseau === 'instagram'} onChange={() => setReseau('instagram')}
                title="Instagram" meta="12,4 k"
                description="Tes Reels, programmés et décrits depuis Claude." />
              <Tuile radio name="reseau" value="tiktok" checked={reseau === 'tiktok'} onChange={() => setReseau('tiktok')}
                title="TikTok" meta="8 k"
                description="Tes vidéos, avec la miniature choisie dans la vidéo." />
              <Tuile radio name="reseau" value="youtube" checked={reseau === 'youtube'} onChange={() => setReseau('youtube')}
                title="YouTube" meta="1,2 k"
                description="Tes Shorts, avec un titre et une description pour la recherche." />
            </div>
          </Block>
          <Block label="Choix multiple, avec média — .ds-tile--media" hint="La vignette (.ds-tile__media) est collée aux bords haut, bas et gauche : la tuile perd son padding vertical, la zone de contenu le reprend (1 rem), la vignette s'étire à la hauteur de la rangée (au moins 6,5 rem) et le rognage de la tuile lui donne le rayon. Le titre tient sur une ligne, en ellipse. Vignette dégradé, vignette image (<img> en cover), puis cochée / non cochée / désactivée.">
            <div className="flex flex-col gap-space-3">
              <Tuile name="video" value="retention" defaultChecked title="Trois erreurs qui tuent ta rétention"
                description="42 s, prête à programmer."
                media={<span className="flex-1 bg-brand-gradient" />}
                meta={<Badge tone="amber">Programmée</Badge>} />
              <Tuile name="video" value="routine" title="Ma routine de montage en 20 minutes, un titre assez long pour dépasser la largeur de la tuile et finir en ellipse"
                description="1 min 12 s, déposée hier."
                media={<img src={VIGNETTE} alt="" />}
                meta={<Badge tone="accent">Nouvelle</Badge>}>
                <span className="inline-flex items-center gap-space-2 text-caption font-semibold text-primary-readable"><Icon name="video" size="0.875rem" />Issue de « Ma routine »</span>
              </Tuile>
              <Tuile name="video" value="off" disabled title="Plafond atteint"
                description="Décoche une vidéo pour en choisir une autre."
                media={<span className="flex-1 bg-tone-dark-soft" />}
                meta={<Badge tone="neutral">Brouillon</Badge>} />
            </div>
          </Block>
          <Block label=".ds-tile--start — la case sur la première ligne" hint="Un texte de deux à quatre lignes sans titre distinct : la case s'aligne sur la PREMIÈRE ligne (align-items:start, 3 px pour la centrer sur la ligne). Sans la classe, le contrôle est centré (titre + description, ou une ligne seule). Sans effet avec un média.">
            <div className="grid grid-cols-1 gap-space-3 md:grid-cols-2">
              <Tuile name="titre" value="t1" start defaultChecked
                title={<span className="font-display text-body-lg font-bold leading-snug tracking-heading-sm">Tes vidéos ne sont pas trop longues ? Elles sont trop lentes à démarrer, et ça se corrige en trois secondes.</span>}
                description="Ouvre sur la douleur et retourne la cause." />
              <Tuile name="titre" value="t2" start
                title={<span className="font-display text-body-lg font-bold leading-snug tracking-heading-sm">Trois erreurs qui tuent ta rétention avant la troisième seconde.</span>}
                description="Le chiffre annonce une liste courte." />
              <Tuile radio name="align-demo" value="a" title="Instagram" meta="12,4 k"
                description="Centré (défaut) : le rond au milieu du titre et de la description." />
              <Tuile radio name="align-demo" value="b" start title="Instagram" meta="12,4 k"
                description=".ds-tile--start sur le même contenu : le rond monte sur la ligne du titre." />
            </div>
          </Block>
          <Block label="États" hint="Repos, survol (filet --input, contrôle --primary), cochée, focus-visible (anneau sur la tuile, pas sur la case), désactivée.">
            <div className="flex flex-col gap-space-3">
              <Tuile name="etat" value="a" title="Repos" description="Filet --border sur --background." />
              <Tuile name="etat" value="b" title="Survol" description="Le filet passe à --input, la case à --primary." etat="is-hover" />
              <Tuile name="etat" value="c" title="Cochée" description="Filet --primary, plaque --accent." defaultChecked />
              <Tuile name="etat" value="d" title="Focus" description="L'anneau est porté par la tuile." etat="is-focus" />
              <Tuile name="etat" value="e" title="Désactivée" description="Inerte, à 50 %." disabled />
            </div>
          </Block>
        </Grid>
      </Section>

      <Section title="Tuile compacte et pastille de choix — .ds-tile--compact, .ds-tile--chip" note="La même tuile pour une LISTE de choix : une ligne, un glyphe de tête optionnel (.ds-tile__lead). --compact garde la case (choix simple : une valeur parmi une dizaine). --compact + --chip en fait une pastille en pilule dont la case est masquée visuellement — l'input reste focusable et annoncé — et la coche .ds-tile__check apparaît en tête une fois cochée. La limite max d'un choix multiple reste à l'app.">
        <Grid cols={2}>
          <Block label="--compact — choix simple, input radio" hint="Libellé --text-control/500, --text-secondary au repos, encre une fois coché. Grille auto-fill à composer par l'app.">
            <div role="radiogroup" aria-label="Ta niche" className="grid grid-cols-1 gap-space-3 md:grid-cols-2">
              {['Food', 'Beauté', 'Sport', 'Voyage', 'Tech', 'Autre'].map(d => (
                <Tuile key={d} compact radio name="niche" value={d.toLowerCase()} title={d}
                  checked={niche === d.toLowerCase()} onChange={() => setNiche(d.toLowerCase())} />
              ))}
            </div>
          </Block>
          <Block label="--compact --chip — choix multiple, glyphe de tête" hint="Pastille en pilule, case masquée, coche en tête une fois cochée. Le glyphe de tête est une Icon, ou un emoji quand l'emoji EST la donnée (ici « Écriture »), jamais une icône d'interface.">
            <div className="flex flex-wrap gap-space-2">
              {([['Voyage', null], ['Écriture', '✍️'], ['Lecture', <Icon key="i" name="book-open" />], ['Musique', null], ['Sport', null], ['Cinéma', <Icon key="i" name="video" />], ['Les coulisses de mon métier de créateur, racontées sans filtre', <Icon key="i" name="video" />]] as const).map(([v, g]) => (
                <Tuile key={v} chip name="themes" value={v} title={v} lead={g}
                  checked={themes.includes(v)} onChange={() => basculer(v)} />
              ))}
            </div>
          </Block>
          <Block label="États — --compact" hint="Repos, survol, coché, focus-visible (anneau sur la tuile), désactivé, lecture seule (.is-readonly : le survol ne l'invite plus, l'app ignore le changement).">
            <div className="flex flex-col gap-space-3">
              <Tuile compact radio name="etat-c" value="a" title="Repos" />
              <Tuile compact radio name="etat-c" value="b" title="Survol" etat="is-hover" />
              <Tuile compact radio name="etat-c" value="c" title="Coché" defaultChecked />
              <Tuile compact radio name="etat-c2" value="d" title="Focus" etat="is-focus" />
              <Tuile compact radio name="etat-c3" value="e" title="Désactivé" disabled />
              <Tuile compact radio name="etat-c4" value="f" title="Lecture seule, coché" etat="is-readonly" aria-readonly="true" checked readOnly />
            </div>
          </Block>
          <Block label="États — --chip" hint="Mêmes états. Cochée : filet --primary, fond inchangé, coche en tête.">
            <div className="flex flex-wrap gap-space-2">
              <Tuile chip name="etat-p" value="a" title="Repos" />
              <Tuile chip name="etat-p" value="b" title="Survol" etat="is-hover" />
              <Tuile chip name="etat-p" value="c" title="Cochée" defaultChecked />
              <Tuile chip name="etat-p" value="d" title="Focus" etat="is-focus" />
              <Tuile chip name="etat-p" value="e" title="Désactivée" disabled />
              <Tuile chip name="etat-p" value="f" title="Lecture seule" etat="is-readonly" aria-readonly="true" checked readOnly />
            </div>
          </Block>
        </Grid>
      </Section>

      <Section title="DatePicker" note="Déclencheur façon Input (même règle de surface) + Calendar en popover. Clic extérieur ou Échap pour fermer. Date unique, pas de plage.">
        <Block label="Vide, rempli, surfaces, états">
          <Stack>
            <DatePicker value={date} onChange={setDate} />
            <DatePicker />
            <DatePicker surface="card" value={date} onChange={setDate} />
            <DatePicker invalid value={date} onChange={setDate} />
            <DatePicker disabled />
          </Stack>
        </Block>
        <Block label="Déclencheur composé" hint="trigger rend l'élément de l'app, qui ÉTALE triggerProps — le socle garde la ref (retour de focus sur Échap et sélection) et pose l'ARIA. Un élément qui reçoit ref : un <button> nu, pas un composant sans forwardRef.">
          <Stack>
            <DatePicker
              value={date}
              onChange={setDate}
              trigger={({ value, triggerProps }) => (
                <button
                  type="button"
                  className="ds-btn ds-btn--secondary"
                  /* Contenu de démo, pas une règle du socle : la date choisie passe en medium,
                     le placeholder garde le semibold du bouton. */
                  style={value ? { fontWeight: 'var(--weight-medium)' } : undefined}
                  {...triggerProps}
                >
                  {value ? value.toLocaleDateString('fr-FR') : 'Choisir une date'}
                  <Icon name="calendar" />
                </button>
              )}
            />
          </Stack>
        </Block>
      </Section>

      <Section title="Calendar" note="Vue mois, lundi d'abord, locale fr-FR. Date natif et Intl uniquement — aucune dépendance.">
        <Grid cols={3}>
          <Block label="Par défaut">
            <Calendar value={date} onChange={setDate} />
          </Block>
          <Block label="Bornes et dates désactivées" hint="min, max et disabledDates.">
            <Calendar
              value={date}
              onChange={setDate}
              min={new Date(2026, 7, 1)}
              max={new Date(2026, 9, 31)}
              disabledDates={[new Date(2026, 8, 12), new Date(2026, 8, 13)]}
            />
          </Block>
          <Block label="Aujourd'hui" hint="Sans value, la vue s'ouvre sur le mois courant et le jour du jour est marqué (.is-today).">
            <Calendar />
          </Block>
        </Grid>
      </Section>

      <Section title="FormField" note="Une erreur remplace le texte d'aide et porte toujours couleur + icône + texte.">
        <Grid cols={2}>
          <Block label="Aide">
            <FormField label="Ton email" htmlFor="mail-help" help="Une astuce de création par semaine. Zéro spam.">
              <Input id="mail-help" placeholder="ton@email.com" />
            </FormField>
          </Block>
          <Block label="Erreur">
            <FormField label="Ton email" htmlFor="mail-err" error="Ça a planté, on réessaie ?">
              <Input id="mail-err" invalid defaultValue="pas-un-email" />
            </FormField>
          </Block>
          <Block label="Obligatoire">
            <FormField label="Ton prénom" htmlFor="prenom" required help="Utilisé uniquement dans l'email.">
              <Input id="prenom" placeholder={IDENTITY.prenom} />
            </FormField>
          </Block>
          <Block label="Composé">
            <FormField label="Ton réseau" htmlFor="reseau" help="Tu peux changer d'avis à tout moment.">
              <Select id="reseau" options={RESEAUX} defaultValue="instagram" />
            </FormField>
          </Block>
        </Grid>
        <Row label="rail partagé — bouton md, input et select s'alignent à 3rem">
          <Input placeholder="ton@email.com" />
          <Select options={RESEAUX} defaultValue="instagram" />
        </Row>
      </Section>
    </div>
  );
}
