import { Card } from '@yunary/ds';
import { Block, Grid, Section, Spec, Swatch } from '../ui';

const SURFACES = ['--background', '--foreground', '--card', '--popover', '--secondary', '--muted', '--accent', '--border', '--input'];
const TEXT = ['--foreground', '--text-secondary', '--text-muted', '--text-inverted', '--muted-foreground'];
const BRAND = ['--primary', '--ring', '--brand-from', '--brand-via', '--brand-to', '--destructive'];
const PILLS = ['--pill-coral-bg', '--pill-amber-bg', '--pill-danger-bg', '--pill-warning-bg', '--pill-success-bg', '--pill-neutral-bg'];
const SPACES = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-7', '--space-8'];
const RADII = ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-2xl', '--radius-pill'];
const RAIL = ['--control-sm', '--control-md', '--control-lg', '--icon-control-sm', '--icon-control-md', '--icon-control-lg'];
/* Les dimensions de composants du § FACULTATIF. Rendues en var() DIRECT, comme tout le reste
   de cette page : ce Block est un miroir du socle, pas une troisième source qui pourrait
   diverger de lui. Les trois derniers sont des ARRONDIS propres à un composant — ils ne
   suivent pas l'échelle --radius-*, d'où le rendu séparé. */
const DIMENSIONS = ['--navbar-h', '--sidebar-w', '--sidebar-w-collapsed', '--sidebar-head-h', '--sidenav-h', '--page-min', '--modal-w', '--modal-w-lg', '--modal-close', '--dropdown-w', '--dropdown-item-h', '--toast-w-min', '--toast-w-max', '--choice-box', '--choice-dot', '--progress-h', '--cal-day', '--cal-nav'];
const DIMENSIONS_RADII = ['--tabs-radius', '--pagination-radius', '--choice-box-radius'];
const SHADOWS = ['--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-glow', '--shadow-glow-lg'];
const WIDTHS = ['--container-app', '--container-shell', '--container-wide', '--container-read', '--container-narrow', '--container-dialog', '--container-aside'];

export function Foundations() {
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Couleur" note="Tout se pose sur les surfaces neutres. La seule couleur saturée est le dégradé de marque, rationné à l'accent : logo, un mot de titre, sur-titre, CTA primaire, halo.">
        <Block label="Surfaces et neutres chauds">
          <div className="grid grid-cols-3 gap-space-4 sm:grid-cols-5 lg:grid-cols-9">
            {SURFACES.map(t => <Swatch key={t} token={t} border />)}
          </div>
        </Block>
        <Block label="Texte">
          <div className="grid grid-cols-3 gap-space-4 sm:grid-cols-5">
            {TEXT.map(t => <Swatch key={t} token={t} border />)}
          </div>
        </Block>
        <Block label="Marque" hint="Accent uniquement : logo, un mot de titre, eyebrow, numéro d'étape, CTA primaire, halo, glow.">
          <div className="grid grid-cols-3 gap-space-4 sm:grid-cols-6">
            {BRAND.map(t => <Swatch key={t} token={t} />)}
          </div>
          <Spec token="--brand-gradient · --brand-gradient-diagonal · --grad-soft">
            <span className="h-space-7 flex-1 rounded-md bg-brand-gradient" />
            <span className="h-space-7 flex-1 rounded-md bg-brand-gradient-diagonal" />
            <span className="h-space-7 flex-1 rounded-md border border-border bg-grad-soft" />
          </Spec>
        </Block>
        <Block label="Pills sémantiques" hint="Toujours couleur + icône + texte, jamais la couleur seule.">
          <div className="grid grid-cols-3 gap-space-4 sm:grid-cols-6">
            {PILLS.map(t => <Swatch key={t} token={t} border />)}
          </div>
        </Block>
      </Section>

      <Section title="Typographie" note="--font-display sur tous les titres, avec la casse et la graisse de --heading-transform / --heading-weight. --font-body pour le corps et l'UI. --font-mono pour le code et les métadonnées techniques.">
        <Block label="Affiche et titres">
          <Spec token="--text-display-xl · affiche"><span className="display-xl">Crée avec méthode</span></Spec>
          <Spec token="--text-display · hero du site"><span className="display">Crée avec méthode</span></Spec>
          <Spec token="--text-heading-xl · h1"><h1>Tes vidéos, analysées</h1></Spec>
          <Spec token="--text-heading · h2"><h2>La méthode, pas la chance</h2></Spec>
          <Spec token="--text-subheading · h3"><h3>Écris ton hook</h3></Spec>
          <Spec token="--text-heading-sm · h4"><h4>Trois secondes pour accrocher</h4></Spec>
        </Block>
        <Block label="Mot en dégradé" hint="Un seul mot par titre, jamais deux.">
          <h2>Ta prochaine vidéo, <span className="accent">analysée</span> en deux minutes</h2>
        </Block>
        <Block label="Corps, contrôles et méta">
          <Spec token="--text-body-lg"><p className="text-body-lg">Analyse tes vidéos, écris tes scripts et programme tes posts, sans quitter Claude.</p></Spec>
          <Spec token="--text-body"><p>Une méthode pas à pas, la même à chaque vidéo.</p></Spec>
          <Spec token="--text-control · boutons, champs, chips, onglets"><span className="text-control font-semibold">Voir l'offre</span></Spec>
          <Spec token="--text-caption"><span className="caption">il y a 3 j · 18,2 k vues</span></Spec>
          <Spec token="--text-eyebrow"><span className="eyebrow">Méthode · 03</span></Spec>
          <Spec token="--text-chip"><span className="chip text-text-muted">Analyse</span></Spec>
          <Spec token="--font-mono"><span className="mono text-caption">00:04 · 1080 × 1920</span></Spec>
        </Block>
        <Block label="Interlignes" hint="Interface 1.5 · lecture suivie 1.7 (classe .prose).">
          <p className="max-w-read">Interface — 1.5. Le ton d'écriture appartient au projet ; ce qui appartient au système, c'est l'interligne : 1.5 en interface, 1.7 en colonne de lecture suivie.</p>
          <p className="prose max-w-read">Lecture suivie — 1.7. Une colonne de lecture continue respire davantage : mentions légales, article de fond, page à lire de bout en bout.</p>
        </Block>
      </Section>

      <Section title="Espacement, rayons, rail et dimensions" note="Base 4px, tout en rem. Généreux : gaps de grille de cards ≥ 1.5rem.">
        <Block label="Échelle d'espacement">
          {SPACES.map(t => (
            <Spec key={t} token={t}>
              <span className="h-space-4 rounded-xs bg-primary" style={{ width: `var(${t})` }} />
            </Spec>
          ))}
        </Block>
        <Block label="Rayons" hint="pill est légal sur les onglets, badges et compteurs — jamais sur un bouton ni un input.">
          <div className="grid grid-cols-2 gap-space-4 sm:grid-cols-4 lg:grid-cols-7">
            {RADII.map(t => (
              <div key={t} className="flex flex-col gap-space-2">
                <span className="h-space-7 w-full border border-border bg-background" style={{ borderRadius: `var(${t})` }} />
                <span className="mono text-caption text-text-muted truncate">{t}</span>
              </div>
            ))}
          </div>
        </Block>
        <Block label="Rail de hauteur des contrôles" hint="Bouton md, Input et le trigger de Select s'alignent tous à 3rem.">
          {RAIL.map(t => (
            <Spec key={t} token={t}>
              <span className="w-space-8 rounded-md border border-border bg-background" style={{ height: `var(${t})` }} />
            </Spec>
          ))}
        </Block>
        <Block label="Dimensions de composants" hint="Le § FACULTATIF du contrat : le socle en tient les défauts, un fichier de marque les redéclare pour les changer. Un jeton non redéclaré retombe ici — contrairement à une couleur, qui elle casse.">
          {DIMENSIONS.map(t => (
            <Spec key={t} token={t}>
              <span className="h-space-4 rounded-xs bg-primary" style={{ width: `var(${t})` }} />
            </Spec>
          ))}
          <div className="grid grid-cols-3 gap-space-4">
            {DIMENSIONS_RADII.map(t => (
              <div key={t} className="flex flex-col gap-space-2">
                <span className="h-space-7 w-full border border-border bg-background" style={{ borderRadius: `var(${t})` }} />
                <span className="mono text-caption text-text-muted truncate">{t}</span>
              </div>
            ))}
          </div>
        </Block>
        <Block label="Largeurs de contenu par rôle" hint="Six largeurs maximales de colonne et la colonne latérale (--container-aside, w-aside). app : la colonne de contenu d'une app, 100 rem (0.9.0) ; shell : le site ; wide : les pages étroites d'une app (Paramètres, Profil) ; read : la lecture. Chacune peut aussi servir de largeur MINIMALE à la grille auto-fill ci-dessous.">
          {WIDTHS.map(t => (
            <Spec key={t} token={t}>
              <span className="h-space-2 w-full rounded-pill bg-accent" style={{ maxWidth: `var(${t})` }} />
            </Spec>
          ))}
        </Block>
        <Block label="La colonne d'une app et celle du site" hint="max-w-app (100 rem) remplit la colonne principale d'une app jusqu'à environ 2500 px de fenêtre, alignée à gauche ; max-w-shell (70 rem) est la largeur du site, centrée. Classes écrites en clair (check-classes.mjs).">
          <Spec token="max-w-app · la colonne de contenu d'une app">
            <div className="h-space-2 w-full max-w-app rounded-pill bg-primary" />
          </Spec>
          <Spec token="max-w-shell · le site">
            <div className="mx-auto h-space-2 w-full max-w-shell rounded-pill bg-accent" />
          </Spec>
        </Block>
        <Block label="Grille de cartes en auto-fill" hint="grid-cards-<rôle> : autant de colonnes que l'écran en tient, aucune carte sous la largeur du rôle, jamais de débordement. À composer avec `grid` et un gap — il ne pose pas display:grid, comme grid-cols-*.">
          {/* Classes écrites EN CLAIR, pas interpolées : c'est ainsi que check-classes.mjs
              vérifie que l'utilitaire paramétré produit sa règle. */}
          <Spec token="grid-cards-dialog · minmax(min(--container-dialog, 100%), 1fr)">
            <div className="grid w-full grid-cards-dialog gap-space-3"><Tiles n={4} /></div>
          </Spec>
        </Block>
      </Section>

      <Section title="Ombres et élévation" note="Trois niveaux teintés --tone-dark, jamais noir pur : la géométrie est au socle, la teinte suit l'encre de la marque. Le glow est réservé au CTA primaire et aux éléments de marque.">
        <Grid cols={3}>
          {SHADOWS.map(t => (
            <Card key={t} className="flex flex-col gap-space-3" style={{ boxShadow: `var(${t})` }}>
              <span className="mono text-caption text-text-muted">{t}</span>
              <span className="caption">
                {t === '--shadow-sm' ? 'Card au repos'
                  : t === '--shadow-md' ? 'Flottant, hover de card'
                    : t === '--shadow-lg' ? 'Modale, dropdown, popover'
                      : 'Marque — CTA primaire'}
              </span>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section title="Motion" note="Retenue. Une règle globale prefers-reduced-motion écrase toutes les durées.">
        <Block label="Courbe et durées">
          <Spec token="--ease-standard"><span className="mono text-caption">cubic-bezier(0.2, 0, 0, 1)</span></Spec>
          <Spec token="durées littérales"><span className="mono text-caption">150ms hover · 200ms standard · 300ms modales · 1.4s shimmer</span></Spec>
        </Block>
      </Section>
    </div>
  );
}

/* Les cases numérotées d'un spécimen de grille — le contenu le plus neutre possible, pour que
   seul le comportement des colonnes se lise. */
function Tiles({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="flex h-space-7 items-center justify-center rounded-md border border-border bg-background">
          <span className="mono text-caption text-text-muted">{i + 1}</span>
        </span>
      ))}
    </>
  );
}
