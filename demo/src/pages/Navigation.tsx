import { useState } from 'react';
import type { ReactNode } from 'react';
import { IDENTITY } from '../identity';
import { AppShell, Avatar, Button, Icon, IconButton, Pagination, Sidebar, Tabs, Logo } from '@yunary/ds';
import { Block, Row, Section } from '../ui';

const STATUTS = [
  { value: 'tous', label: 'Tous' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'programme', label: 'Programmé' },
  { value: 'publie', label: 'Publié' },
];

/* LA BARRE DE NAVIGATION, EN CLASSES (0.11.0) : plus de composant React, le site l'écrit en HTML.
   `.is-scrolled` est posé par l'app au défilement. */
function Barre({ scrolled = false }: { scrolled?: boolean }) {
  return (
    <header className={scrolled ? 'ds-navbar is-scrolled' : 'ds-navbar'}>
      <div className="page ds-navbar__inner">
        <a href="#navigation" aria-label={`${IDENTITY.personne}, accueil`}><Logo variant="wordmark" wordmark={IDENTITY.wordmark} height="1.375rem" /></a>
        <nav className="ds-navbar__links">
          <a href="#navigation" className="ds-navlink is-active">Les outils</a>
          <a href="#navigation" className="ds-navlink">L'offre</a>
          <a href="#navigation" className="ds-navlink">Se connecter</a>
        </nav>
        <div className="ds-navbar__cta"><Button size="sm">Essayer gratuitement</Button></div>
      </div>
    </header>
  );
}

/* LE PIED DE PAGE, EN CLASSES (0.11.0) : même régime que la barre. */
function Pied({ social }: { social?: ReactNode }) {
  const colonnes = [
    { titre: 'Outils', liens: ['Yunary Analyse', 'Yunary Script', 'Yunary Programmation'] },
    { titre: 'Yunary', liens: ["L'offre", 'Se connecter'] },
    { titre: 'Légal', liens: ['CGV', 'Confidentialité', 'Mentions légales'] },
  ];
  return (
    <footer className="ds-footer">
      <div className="page ds-footer__inner">
        <div className="ds-footer__brand">
          <Logo variant="wordmark" wordmark={IDENTITY.wordmark} height="1.25rem" />
          <p className="ds-footer__note">{IDENTITY.lieu}</p>
        </div>
        <div className="ds-footer__cols">
          {colonnes.map(c => (
            <div key={c.titre} className="ds-footer__col">
              <span className="eyebrow">{c.titre}</span>
              {c.liens.map(l => <a key={l} href="#navigation" className="ds-footer__link">{l}</a>)}
            </div>
          ))}
        </div>
      </div>
      {social ? <div className="page ds-footer__social">{social}</div> : null}
    </footer>
  );
}

export function NavigationPage() {
  const [tab, setTab] = useState('programme');
  const [ton, setTon] = useState('naturel');
  const [rythme, setRythme] = useState('pose');
  const [page, setPage] = useState(4);
  const [longPage, setLongPage] = useState(12);

  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Barre de navigation — classes .ds-navbar" note="Sans composant React depuis la 0.11.0 : le site l'écrit en HTML. Posée sur --secondary avec une bordure basse en permanence, jamais transparente. Au défilement, l'app pose .is-scrolled : la barre se teinte, prend un blur(10px) et une ombre. Seul endroit du système qui utilise backdrop-filter. Liens .ds-navlink, l'actif en --primary.">
        <Block label="Au repos">
          <div className="overflow-x-auto rounded-xl border border-border"><Barre /></div>
        </Block>
        <Block label="État défilé (.is-scrolled)" hint="Teinte color-mix sur --secondary + blur + ombre.">
          <div className="overflow-x-auto rounded-xl border border-border bg-card"><Barre scrolled /></div>
        </Block>
        <Block label="Sur une section sombre" hint="Le logo suit --foreground : sur une surface sombre, il s'éclaircit tout seul.">
          <div className="dark overflow-x-auto rounded-xl border border-border bg-background"><Barre scrolled /></div>
        </Block>
      </Section>

      <Section title="Tabs" note="Groupe d'onglets sur --secondary. L'onglet actif porte LA convention de l'élément sélectionné du socle : plaque --accent, texte --primary (le corail, écart de contraste assumé dans la marque), même graisse que ses voisins — celle de l'entrée de Sidebar, de la page courante, de l'item de menu coché. Jamais noir gras.">
        <Block label="Interactif">
          <Row><Tabs items={STATUTS} value={tab} onChange={setTab} /></Row>
          <p className="caption">Onglet actif : {STATUTS.find(s => s.value === tab)?.label}</p>
        </Block>
        <Block label="onCard" hint="La barre contraste avec sa surface porteuse ET l'onglet actif contraste avec la barre : il descend d'un cran de surface, jamais au niveau de la barre. Sur la page : barre --secondary, actif --background. Sur une card : barre --background, actif --card. Vérifie les deux en clair ET en sombre — en sombre, --card et --secondary valent tous les deux #2b2a28, un actif en --card y serait invisible.">
          <Row label="sur la page (défaut)"><Tabs items={STATUTS} value="programme" onChange={() => undefined} /></Row>
          <Row label="sur une card — onCard">
            <span className="inline-flex max-w-full rounded-lg border border-border bg-card p-space-4">
              <Tabs onCard items={STATUTS} value="programme" onChange={() => undefined} />
            </span>
          </Row>
        </Block>
        <Block label="États">
          <Row label="sélection sur chaque item">
            <Tabs items={STATUTS} value="tous" onChange={() => undefined} />
          </Row>
          <Row label="survol forcé sur le deuxième item">
            <div className="ds-tabs">
              <button type="button" className="ds-tab" aria-selected="true">Tous</button>
              <button type="button" className="ds-tab is-hover">Brouillon</button>
              <button type="button" className="ds-tab">Programmé</button>
            </div>
          </Row>
        </Block>
        <Block label="mode=&quot;choice&quot; — choisir une valeur" hint="Même rendu, sémantique radiogroup / radio + aria-checked : un seul arrêt de tabulation (la valeur choisie), les flèches ← → ↑ ↓ et Début / Fin déplacent le choix, comme un groupe de radios. fullWidth partage la largeur à parts égales. Le groupe se nomme par aria-label.">
          <Row label="interactif, pleine largeur">
            <div className="flex w-full flex-col gap-space-2">
              <Tabs mode="choice" fullWidth aria-label="Ton" value={ton} onChange={setTon}
                items={[{ value: 'soutenu', label: 'Soutenu' }, { value: 'naturel', label: 'Naturel' }, { value: 'familier', label: 'Familier' }, { value: 'direct', label: 'Direct' }]} />
              <p className="caption">Choisi : {ton}</p>
            </div>
          </Row>
          <Row label="dans une carte">
            <span className="flex w-full rounded-lg border border-border bg-card p-space-4 ds-card">
              <Tabs mode="choice" fullWidth aria-label="Rythme" value={rythme} onChange={setRythme}
                items={[{ value: 'lent', label: 'Lent' }, { value: 'pose', label: 'Posé' }, { value: 'rapide', label: 'Rapide' }]} />
            </span>
          </Row>
          <Row label="lecture seule (aria-readonly : focusable, ne change pas)">
            <Tabs mode="choice" readOnly aria-label="Rythme (lecture seule)" value="pose" onChange={() => undefined}
              items={[{ value: 'lent', label: 'Lent' }, { value: 'pose', label: 'Posé' }, { value: 'rapide', label: 'Rapide' }]} />
          </Row>
          <Row label="désactivé · un item désactivé">
            <Tabs mode="choice" disabled aria-label="Rythme (désactivé)" value="pose" onChange={() => undefined}
              items={[{ value: 'lent', label: 'Lent' }, { value: 'pose', label: 'Posé' }, { value: 'rapide', label: 'Rapide' }]} />
            <Tabs mode="choice" aria-label="Rythme (un item désactivé)" value="lent" onChange={() => undefined}
              items={[{ value: 'lent', label: 'Lent' }, { value: 'pose', label: 'Posé', disabled: true }, { value: 'rapide', label: 'Rapide' }]} />
          </Row>
        </Block>
      </Section>

      <Section title="Pagination" note="Contrôlée. Barre --secondary, même traitement que les onglets ; la page courante reprend l'onglet actif. Au-delà de 7 pages, une ellipsis en icône — jamais le caractère.">
        <Block label="Peu de pages">
          <Row><Pagination page={page} pageCount={5} onPageChange={setPage} /></Row>
          <p className="caption">Page {page} sur 5.</p>
        </Block>
        <Block label="Beaucoup de pages" hint="Ellipsis des deux côtés selon la position.">
          <Row><Pagination page={longPage} pageCount={40} onPageChange={setLongPage} /></Row>
          <Row label="première page"><Pagination page={1} pageCount={40} onPageChange={() => undefined} /></Row>
          <Row label="dernière page"><Pagination page={40} pageCount={40} onPageChange={() => undefined} /></Row>
        </Block>
        <Block label="Page unique" hint="Les deux flèches sont désactivées.">
          <Row><Pagination page={1} pageCount={1} onPageChange={() => undefined} /></Row>
        </Block>
      </Section>

      <Section title="AppShell et Sidebar" note="Le squelette d'une app (le hub) : grille [barre latérale | contenu]. La barre est sur --secondary, repliable en icônes seules, et l'état est persisté en localStorage. L'entrée active : plaque --accent, libellé --primary (corail), graisse inchangée, icône en currentColor — jamais surface-alt + gras.">
        <Block label="Complet" hint="responsive={false} et staticLayout épinglent la mise en page à deux colonnes pour la vitrine. Chaque section est un groupe : 16px les séparent, avec ou sans titre — le dernier groupe, sans titre, ne se colle plus au précédent.">
          <div className="overflow-hidden rounded-xl border border-border">
            <AppShell
              responsive={false}
              sidebar={
                <Sidebar
                  brand={<Logo variant="wordmark" wordmark={IDENTITY.wordmark} height="1.25rem" />}
                  brandCollapsed={<Logo variant="monogram" wordmark={IDENTITY.wordmark} height="1.5rem" />}
                  staticLayout
                  storageKey="ds-demo-sidebar"
                  sections={[
                    { title: 'Yunary', items: [
                      { label: 'Mes outils', icon: <Icon name="layout-dashboard" />, active: true },
                      { label: 'Mes contenus', icon: <Icon name="video" /> },
                      { label: 'Historique', icon: <Icon name="clock" /> },
                    ] },
                    { title: 'Compte', items: [
                      { label: 'Facturation', icon: <Icon name="file-text" /> },
                    ] },
                    { items: [
                      { label: 'Paramètres', icon: <Icon name="settings" /> },
                    ] },
                  ]}
                  footer={
                    <span className="flex items-center gap-space-3">
                      <Avatar size="2rem" halo={false} initials={IDENTITY.monogram} alt={IDENTITY.personne} />
                      <span className="flex flex-col">
                        <span className="text-caption font-semibold">{IDENTITY.personne}</span>
                        <span className="caption">{IDENTITY.lieu}</span>
                      </span>
                    </span>
                  }
                />
              }
            >
              <div className="flex flex-col gap-space-4 p-space-5">
                <h3>Mes outils</h3>
                <p className="caption">Le contenu de la page vit ici. Replie la barre avec le bouton en tête pour voir le mode icônes seules : l'état est retenu.</p>
                <Row><Button size="sm" icon={<Icon name="plus" />}>Nouveau contenu</Button></Row>
              </div>
            </AppShell>
          </div>
        </Block>
        <Block label="Sidebar repliée" hint="defaultCollapsed force l'état initial sans toucher au localStorage.">
          <div className="overflow-hidden rounded-xl border border-border">
            <AppShell
              responsive={false}
              sidebar={
                <Sidebar
                  brand={<Logo variant="wordmark" wordmark={IDENTITY.wordmark} height="1.25rem" />}
                  brandCollapsed={<Logo variant="monogram" wordmark={IDENTITY.wordmark} height="1.5rem" />}
                  staticLayout
                  defaultCollapsed
                  collapsible={false}
                  storageKey="ds-demo-sidebar-collapsed"
                  sections={[{ items: [
                    { label: 'Mes outils', icon: <Icon name="layout-dashboard" />, active: true },
                    { label: 'Mes contenus', icon: <Icon name="video" /> },
                    { label: 'Paramètres', icon: <Icon name="settings" /> },
                  ] }]}
                />
              }
            >
              <div className="p-space-5"><p className="caption">Mode icônes seules : le libellé est masqué, il passe en title.</p></div>
            </AppShell>
          </div>
        </Block>
      </Section>

      <Section title="Pied de page — classes .ds-footer" note={`Sans composant React depuis la 0.11.0 : le site l'écrit en HTML. La marque et sa ligne de localisation (le point médian : ${IDENTITY.lieu}), des colonnes de liens titrées en eyebrow, une rangée sociale facultative.`}>
        <Block label="Complet" hint="Comme la barre de navigation, le logo suit --foreground.">
          <div className="overflow-x-auto rounded-xl border border-border">
            <Pied social={<IconButton label="Écrire"><Icon name="mail" /></IconButton>} />
          </div>
        </Block>
      </Section>
    </div>
  );
}
