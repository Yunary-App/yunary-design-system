import { useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { IDENTITY } from '../identity';
import { Badge, Calendar, Checkbox, DatePicker, FormField, Icon, Input, Radio, Select, Switch, Textarea, cn } from '@yunary/ds';
import { Block, Grid, Row, Section, Stack } from '../ui';

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

const SERIES = [
  { value: 'build', label: 'Build' },
  { value: 'tuto', label: 'Tuto' },
  { value: 'coulisses', label: 'Coulisses' },
];

export function FormsPage() {
  const [checked, setChecked] = useState(true);
  const [niveau, setNiveau] = useState('debutant');
  const [formule, setFormule] = useState<'solo' | 'equipe' | 'both'>('both');
  const [domaine, setDomaine] = useState('produit');
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
            <Textarea rows={3} placeholder="Décris ton idée d'app en deux phrases." />
            <Textarea rows={2} className="is-focus" defaultValue="Focus" />
            <Textarea rows={2} invalid defaultValue="Trop court" />
            <Textarea rows={2} disabled defaultValue="Indisponible" />
            <Textarea rows={2} surface="card" defaultValue="surface=card" />
          </Stack>
        </Block>
      </Section>

      <Section title="Select" note="Select natif sur le rail 3rem, avec un chevron Lucide.">
        <Block label="Repos, focus, erreur, désactivé">
          <Stack>
            <Select options={SERIES} defaultValue="build" />
            <Select options={SERIES} className="is-focus" defaultValue="tuto" />
            <Select options={SERIES} invalid defaultValue="build" />
            <Select options={SERIES} disabled defaultValue="build" />
            <Select options={SERIES} surface="card" defaultValue="coulisses" />
          </Stack>
        </Block>
      </Section>

      <Section title="Checkbox, Radio, Switch" note="Case 1.25rem, radio 1.25rem à point 0.625rem, switch 2.75 × 1.625rem à knob 1.25rem.">
        <Grid cols={3}>
          <Block label="Checkbox">
            <Stack>
              <Checkbox label="Je veux recevoir le prompt du build" checked={checked} onChange={e => setChecked(e.target.checked)} />
              <Checkbox label="Non coché" defaultChecked={false} />
              <Checkbox label="Indéterminée — sélection partielle" indeterminate />
              <Checkbox label="Hover" className="is-hover" />
              <Checkbox label="Focus" className="is-focus" defaultChecked />
              <Checkbox label="Option indisponible" disabled />
              <Checkbox label="Cochée et désactivée" disabled defaultChecked />
            </Stack>
          </Block>
          <Block label="Radio" hint="Toujours dans un groupe nommé.">
            <Stack>
              <Radio name="niveau" value="debutant" label="Je débute" checked={niveau === 'debutant'} onChange={() => setNiveau('debutant')} />
              <Radio name="niveau" value="avance" label="Je code déjà" checked={niveau === 'avance'} onChange={() => setNiveau('avance')} />
              <Radio name="niveau-demo" value="hover" label="Hover" className="is-hover" />
              <Radio name="niveau-demo" value="focus" label="Focus" className="is-focus" defaultChecked />
              <Radio name="niveau-off" value="off" label="Indisponible" disabled />
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
            <div role="radiogroup" aria-label="Quelle formule ?" className="flex flex-col gap-space-3">
              <Tuile radio name="formule" value="solo" checked={formule === 'solo'} onChange={() => setFormule('solo')}
                title="Solo" meta="1 projet"
                description="Un espace, un projet, tout ce qu'il faut pour livrer ton premier outil." />
              <Tuile radio name="formule" value="equipe" checked={formule === 'equipe'} onChange={() => setFormule('equipe')}
                title="Équipe" meta="5 projets"
                description="Plusieurs projets en parallèle, partagés avec ton équipe." />
              <Tuile radio name="formule" value="both" checked={formule === 'both'} onChange={() => setFormule('both')}
                title="Sur mesure" meta="Illimité"
                description="Autant de projets que nécessaire, avec un accompagnement." />
            </div>
          </Block>
          <Block label="Choix multiple, avec média — .ds-tile--media" hint="La vignette (.ds-tile__media) est collée aux bords haut, bas et gauche : la tuile perd son padding vertical, la zone de contenu le reprend (1 rem), la vignette s'étire à la hauteur de la rangée (au moins 6,5 rem) et le rognage de la tuile lui donne le rayon. Le titre tient sur une ligne, en ellipse. Vignette dégradé, vignette image (<img> en cover), puis cochée / non cochée / désactivée.">
            <div className="flex flex-col gap-space-3">
              <Tuile name="modele" value="api" defaultChecked title="Gabarit API"
                description="Un service prêt à déployer, avec ses tests."
                media={<span className="flex-1 bg-brand-gradient" />}
                meta={<Badge tone="amber">Officiel</Badge>} />
              <Tuile name="modele" value="dash" title="Tableau de bord interne — un titre de gabarit assez long pour dépasser la largeur de la tuile et finir en ellipse"
                description="Une vue de pilotage branchée sur ta base."
                media={<img src={VIGNETTE} alt="" />}
                meta={<Badge tone="accent">Importé</Badge>}>
                <span className="inline-flex items-center gap-space-2 text-caption font-semibold text-primary-readable"><Icon name="video" size="0.875rem" />Issu de « Le déploiement »</span>
              </Tuile>
              <Tuile name="modele" value="off" disabled title="Plafond atteint"
                description="Décoche un gabarit pour en choisir un autre."
                media={<span className="flex-1 bg-tone-dark-soft" />}
                meta={<Badge tone="neutral">Bientôt</Badge>} />
            </div>
          </Block>
          <Block label=".ds-tile--start — la case sur la première ligne" hint="Un texte de deux à quatre lignes sans titre distinct : la case s'aligne sur la PREMIÈRE ligne (align-items:start, 3 px pour la centrer sur la ligne). Sans la classe, le contrôle est centré (titre + description, ou une ligne seule). Sans effet avec un média.">
            <div className="grid grid-cols-1 gap-space-3 md:grid-cols-2">
              <Tuile name="titre" value="t1" start defaultChecked
                title={<span className="font-display text-body-lg font-bold leading-snug tracking-heading-sm">Ton outil interne tourne en local et personne ne s'en sert ? Ce n'est pas le code, c'est le déploiement.</span>}
                description="Ouvre sur la douleur et retourne la cause." />
              <Tuile name="titre" value="t2" start
                title={<span className="font-display text-body-lg font-bold leading-snug tracking-heading-sm">Trois erreurs qui cassent un déploiement avant la première requête.</span>}
                description="Le chiffre annonce une liste courte." />
              <Tuile radio name="align-demo" value="a" title="Solo" meta="1 projet"
                description="Centré (défaut) : le rond au milieu du titre et de la description." />
              <Tuile radio name="align-demo" value="b" start title="Solo" meta="1 projet"
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
            <div role="radiogroup" aria-label="Ton domaine" className="grid grid-cols-1 gap-space-3 md:grid-cols-2">
              {['Produit', 'Design', 'Données', 'Infrastructure', 'Marketing', 'Autre'].map(d => (
                <Tuile key={d} compact radio name="domaine" value={d.toLowerCase()} title={d}
                  checked={domaine === d.toLowerCase()} onChange={() => setDomaine(d.toLowerCase())} />
              ))}
            </div>
          </Block>
          <Block label="--compact --chip — choix multiple, glyphe de tête" hint="Pastille en pilule, case masquée, coche en tête une fois cochée. Le glyphe de tête est une Icon, ou un emoji quand l'emoji EST la donnée (ici « Écriture »), jamais une icône d'interface.">
            <div className="flex flex-wrap gap-space-2">
              {([['Voyage', <Icon key="i" name="rocket" />], ['Écriture', '✍️'], ['Lecture', <Icon key="i" name="book-open" />], ['Musique', null], ['Sport', <Icon key="i" name="dumbbell" />], ['Cinéma', <Icon key="i" name="video" />], ['Les coulisses de mon métier de créateur, racontées sans filtre', <Icon key="i" name="video" />]] as const).map(([v, g]) => (
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
            <FormField label="Ton email" htmlFor="mail-help" help="Un build décortiqué par semaine. Zéro spam.">
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
            <FormField label="Ta série" htmlFor="serie" help="Tu peux changer d'avis à tout moment.">
              <Select id="serie" options={SERIES} defaultValue="build" />
            </FormField>
          </Block>
        </Grid>
        <Row label="rail partagé — bouton md, input et select s'alignent à 3rem">
          <Input placeholder="ton@email.com" />
          <Select options={SERIES} defaultValue="build" />
        </Row>
      </Section>
    </div>
  );
}
