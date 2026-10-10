import { useEffect, useState } from 'react';
import { IDENTITY } from './identity';

/* Le titre de l'onglet fait partie de la vitrine : si la marque montée change, il doit
   changer aussi. */
document.title = IDENTITY.titre;
import { Logo, Switch, Tabs } from '@yunary/ds';
/* Le contenu VERBATIM du module opt-in, injecté à la demande par l'interrupteur
   « Échelle d'app ». La vitrine ne l'importe jamais en dur : c'est justement la
   règle du module (jamais le site public, les e-mails ou les slides). */
import appScaleCss from '../../src/styles/app-scale.css?inline';
import { Foundations } from './pages/Foundations';
import { IconsPage } from './pages/Icons';
import { ActionsPage } from './pages/Actions';
import { FormsPage } from './pages/Forms';
import { DataDisplayPage } from './pages/DataDisplay';
import { FeedbackPage } from './pages/Feedback';
import { OverlaysPage } from './pages/Overlays';
import { NavigationPage } from './pages/Navigation';
import { BrandPage } from './pages/Brand';
import { ParcoursPage } from './pages/Parcours';
import { OutilsPage } from './pages/Outils';
import { FichesPage } from './pages/Fiches';

const PAGES = [
  { value: 'brand', label: 'Marque', render: () => <BrandPage /> },
  { value: 'foundations', label: 'Fondations', render: () => <Foundations /> },
  { value: 'icons', label: 'Icônes', render: () => <IconsPage /> },
  { value: 'actions', label: 'Actions', render: () => <ActionsPage /> },
  { value: 'forms', label: 'Formulaires', render: () => <FormsPage /> },
  { value: 'data', label: 'Data display', render: () => <DataDisplayPage /> },
  { value: 'feedback', label: 'Feedback', render: () => <FeedbackPage /> },
  { value: 'overlays', label: 'Overlays', render: () => <OverlaysPage /> },
  { value: 'navigation', label: 'Navigation', render: () => <NavigationPage /> },
  { value: 'parcours', label: 'Parcours', render: () => <ParcoursPage /> },
  { value: 'outils', label: 'Outils et écrans', render: () => <OutilsPage /> },
  { value: 'fiches', label: 'Fiches et rangées', render: () => <FichesPage /> },
];

const THEMES = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'split', label: 'Côte à côte' },
];

export function App() {
  const [page, setPage] = useState('brand');
  const [theme, setTheme] = useState('light');
  const [appScale, setAppScale] = useState(false);
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!appScale) return;
    const el = document.createElement('style');
    el.id = 'ds-app-scale';
    el.textContent = appScaleCss;
    document.head.appendChild(el);
    return () => el.remove();
  }, [appScale]);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const current = PAGES.find(p => p.value === page) ?? PAGES[0];
  const body = current.render();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Chrome de la vitrine : la barre de marque seule. La Navbar du DS est
          présentée comme spécimen, page Navigation. */}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="page flex flex-wrap items-center justify-between gap-space-4 py-space-3">
          <div className="flex items-baseline gap-space-3">
            <Logo variant="wordmark" wordmark={IDENTITY.wordmark} height="1.375rem" />
            <span className="caption">Design system · recette visuelle</span>
          </div>
          <div className="flex flex-wrap items-center gap-space-5">
            <Switch
              label="Échelle d'app"
              checked={appScale}
              onChange={e => setAppScale(e.target.checked)}
            />
            <Tabs onCard items={THEMES} value={theme} onChange={setTheme} />
          </div>
        </div>
        {appScale ? (
          <div className="page pb-space-3">
            <p className="caption">
              Module opt-in <span className="mono">app-scale.css</span> actif · racine {scaleLabel(width)} ·
              largeur effective ≈ {Math.round(width / factor(width))} px. Quatre bandes (103 / 112 /
              126 / 130 %), celles de la 0.1.2, restaurées en 0.1.6. Pour les apps — jamais le site,
              les e-mails ni les slides.
            </p>
          </div>
        ) : null}
      </header>

      <main className="page flex flex-col gap-space-6 py-space-7">
        {/* Les familles vivent dans le layout, pas dans le chrome : aucun fond,
            aucune bordure. Le groupe d'onglets est posé sur --background, il garde
            donc son fond --secondary et contraste avec la page.
            La marge négative empêche le scroll horizontal de rogner l'anneau de
            focus ; elle est imbriquée pour ne pas casser le centrage de .page. */}
        <nav aria-label="Familles de composants" className="-mx-space-1 overflow-x-auto px-space-1">
          <Tabs items={PAGES.map(p => ({ value: p.value, label: p.label }))} value={page} onChange={setPage} />
        </nav>

        {theme === 'split' ? (
          <div className="grid grid-cols-1 gap-space-5 lg:grid-cols-2">
            <Panel label="Clair">{body}</Panel>
            <Panel label="Sombre" dark>{current.render()}</Panel>
          </div>
        ) : body}
      </main>
    </div>
  );
}

/* Paliers lus dans app-scale.css — aucune valeur n'est décidée ici. */
function factor(w: number) { return w >= 2400 ? 1.30 : w >= 1920 ? 1.26 : w >= 1600 ? 1.12 : 1.03; }
function scaleLabel(w: number) { return Math.round(factor(w) * 100) + ' %'; }

function Panel({ label, dark, children }: { label: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <div className={`${dark ? 'dark' : ''} rounded-xl border border-border bg-background text-foreground shadow-sm`}>
      <div className="border-b border-border px-space-5 py-space-3">
        <span className="eyebrow">{label}</span>
      </div>
      <div className="p-space-5">{children}</div>
    </div>
  );
}
