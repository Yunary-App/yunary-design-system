import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button, FormField, Icon, Input, Modal, Select, cn } from '@yunary/ds';
import { Block, Row, Section } from '../ui';

/* Une ligne d'appoint — une COMPOSITION d'app (fond --background, radius md, body-sm), pas un
   composant du socle : elle est là pour recetter le rythme de la modale. */
function LigneAppoint() {
  return (
    <div className="flex items-center gap-space-3 rounded-md bg-background px-space-4 py-space-3 text-body-sm text-text-secondary">
      <span className="inline-flex text-primary"><Icon name="zap" size="1rem" /></span>
      <span>Cette vidéo utilisera <span className="mono font-semibold text-foreground">1 analyse</span> · il t'en reste <span className="mono font-semibold text-foreground">18</span></span>
    </div>
  );
}

/* LE MENU DÉROULANT, EN CLASSES. Il n'y a pas de composant React : une app écrit le balisage
   elle-même, comme ci-dessous. Classes écrites EN CLAIR pour que check-classes.mjs les voie. */
type ItemMenu = { label?: ReactNode; icon?: ReactNode; hint?: ReactNode; danger?: boolean; separator?: boolean; checked?: boolean; className?: string; onSelect?: () => void };
function Menu({ items, floating = false, end = false }: { items: ItemMenu[]; floating?: boolean; end?: boolean }) {
  return (
    <div role="menu" className={cn('ds-dropdown', floating && 'ds-dropdown--floating', floating && end && 'ds-dropdown--end')}>
      {items.map((it, i) => it.separator
        ? <hr key={i} className="ds-dropdown__sep" />
        : (
          <button key={i} type="button" onClick={it.onSelect}
            role={it.checked === undefined ? 'menuitem' : 'menuitemradio'}
            aria-checked={it.checked === undefined ? undefined : it.checked}
            className={cn('ds-dropdown__item', it.danger && 'ds-dropdown__item--danger', it.className)}>
            {it.icon}
            <span className="ds-dropdown__label">{it.label}</span>
            {it.hint ? <span className="ds-dropdown__hint">{it.hint}</span> : null}
            {it.checked ? <span className="ds-dropdown__check" aria-hidden="true"><Icon name="check" size="1rem" /></span> : null}
          </button>
        ))}
    </div>
  );
}

export function OverlaysPage() {
  const [open, setOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [triOpen, setTriOpen] = useState(false);
  const [tri, setTri] = useState<'recent' | 'ancien' | 'nom'>('recent');
  const TRIS = [
    { value: 'recent' as const, label: 'Plus récents' },
    { value: 'ancien' as const, label: 'Plus anciens' },
    { value: 'nom' as const, label: 'Par nom' },
  ];
  const [phase, setPhase] = useState<'confirm' | 'loading' | 'result'>('confirm');
  const [statut, setStatut] = useState<'success' | 'error'>('success');
  const ouvrir = (p: 'confirm' | 'loading' | 'result', s?: 'success' | 'error') => {
    setPhase(p);
    if (s) setStatut(s);
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Modal" note="Panneau sur --popover, rayon 2xl, --shadow-lg, au-dessus d'un scrim --tone-dark à 45 % avec blur(2px). Largeur 23.75rem au-dessus de 64 rem ; en dessous, la MÊME modale devient une feuille basse — pleine largeur, coins hauts arrondis, poignée, entrée par le bas. Aucun JS de point de rupture : c'est du CSS.">
        <Block label="En vrai" hint="Le focus entre dans le panneau, y est piégé, Échap ferme, le focus revient au déclencheur, et le défilement de la page est verrouillé tant que la modale est ouverte. Réduis la fenêtre sous 1024 px pour la voir en feuille basse.">
          <Row>
            <Button variant="danger" onClick={() => ouvrir('confirm')}>Supprimer ce contenu</Button>
          </Row>
          <Row label="ouvrir directement dans une phase — en loading, rien ne ferme">
            <Button variant="secondary" size="sm" onClick={() => ouvrir('loading')}>loading</Button>
            <Button variant="secondary" size="sm" onClick={() => ouvrir('result', 'success')}>result succès</Button>
            <Button variant="secondary" size="sm" onClick={() => ouvrir('result', 'error')}>result erreur</Button>
          </Row>
          <Modal
            open={open}
            phase={phase}
            onClose={() => setOpen(false)}
            icon={<Icon name="triangle-alert" />}
            title={phase === 'loading' ? 'Suppression en cours' : 'Supprimer ce contenu ?'}
            description={phase === 'loading' ? 'Ne ferme pas cette fenêtre.' : 'Cette action est définitive.'}
            result={{
              status: statut,
              title: statut === 'error' ? 'La suppression a échoué' : 'Contenu supprimé',
              message: statut === 'error'
                ? 'Le service n’a pas répondu dans le délai imparti. Ta vidéo et ses textes sont intacts : réessaie dans un instant, ou vérifie la connexion avant de relancer.'
                : 'Ta vidéo et ses textes ont été retirés de Mes contenus.',
              onRetry: statut === 'error' ? () => ouvrir('confirm') : undefined,
            }}
            footer={phase === 'result' ? undefined : (
              phase === 'loading'
                ? <><Button variant="ghost" disabled>Annuler</Button><Button variant="danger" loading>Suppression…</Button></>
                : <><Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button><Button variant="danger" onClick={() => ouvrir('loading')}>Supprimer</Button></>
            )}
          />
        </Block>

        <Block label="Les trois phases" hint="confirm → loading → result, dans UN seul dialogue. En loading rien ne ferme : Échap, clic dehors et croix sont inertes, le piège de focus tient toujours. Le « Fermer » du résultat est un secondaire sur la surface carte, jamais de la couleur de la fenêtre (0.11.1).">
          <div className="flex flex-wrap gap-space-5">
            <Modal inline iconVariant="danger" icon={<Icon name="trash-2" />}
              title="Supprimer ce contenu ?" description="Cette action est définitive."
              footer={<><Button variant="ghost" size="sm">Annuler</Button><Button variant="danger" size="sm">Supprimer</Button></>} />
            <Modal inline phase="loading" iconVariant="danger" icon={<Icon name="trash-2" />}
              onClose={() => undefined}
              title="Suppression en cours" description="Ne ferme pas cette fenêtre."
              footer={<><Button variant="ghost" size="sm" disabled>Annuler</Button><Button variant="danger" size="sm" loading>Suppression…</Button></>} />
            <Modal inline phase="result" onClose={() => undefined}
              result={{ status: 'success', title: 'Contenu supprimé', message: 'Ta vidéo et ses textes ont été retirés de Mes contenus.' }} />
            <Modal inline phase="result" iconVariant="danger" onClose={() => undefined}
              result={{
                status: 'error',
                title: 'La suppression a échoué',
                message: 'Le service n’a pas répondu dans le délai imparti. Ta vidéo et ses textes sont intacts : réessaie dans un instant, ou vérifie la connexion avant de relancer.',
                onRetry: () => undefined,
              }} />
          </div>
        </Block>

        <Block label="Variantes de tuile d'icône" hint="La tuile est une <Pastille size=&quot;dialogue&quot;>. neutral lit la paire --pill-neutral-* comme Badge et Banner : une seule source sémantique.">
          <div className="flex flex-wrap gap-space-5">
            <Modal inline iconVariant="danger" icon={<Icon name="triangle-alert" />}
              title="Supprimer ce contenu ?" description="Cette action est définitive."
              footer={<><Button variant="ghost" size="sm">Annuler</Button><Button variant="danger" size="sm">Supprimer</Button></>} />
            <Modal inline iconVariant="brand" icon={<Icon name="zap" />}
              title="Programmer ta vidéo ?" description="Elle partira mardi à 18:00 sur Instagram et TikTok."
              footer={<><Button variant="ghost" size="sm">Plus tard</Button><Button size="sm">Programmer</Button></>} />
            <Modal inline iconVariant="neutral" icon={<Icon name="info" />}
              title="Ce que contient une analyse" description="La transcription, l'analyse visuelle et la performance, en une fiche."
              footer={<Button variant="secondary" size="sm">Compris</Button>} />
            <Modal inline iconVariant="warning" icon={<Icon name="clock" />}
              title="Plus que 3 analyses ce mois-ci" description="Ton compteur repart à zéro le 26 octobre."
              footer={<Button variant="secondary" size="sm">Compris</Button>} />
            <Modal inline iconVariant="success" icon={<Icon name="circle-check" />}
              title="Programmation confirmée" description="Ta vidéo partira mardi à 18:00."
              footer={<Button variant="secondary" size="sm">Voir</Button>} />
          </div>
        </Block>

        <Block label="Sans icône, avec fermeture" hint="Sans pastille, le titre partage la ligne de la croix, centré verticalement — seule sur sa rangée, la croix ferait tomber le titre 46-56 px sous le bord.">
          <Modal inline onClose={() => undefined} title="Ta session a expiré" description="Reconnecte-toi pour reprendre là où tu en étais."
            footer={<Button size="sm">Se reconnecter</Button>} />
        </Block>

        <Block label="size=lg — la modale à formulaire" hint="32,5 rem (--modal-w-lg) : un formulaire, un contenu riche. md (23,75 rem) reste la confirmation et le résultat. Sous 64 rem, les deux sont la même feuille en pleine largeur. Rythme interne : --space-5 (24) entre l'en-tête, le champ, la ligne d'appoint et le pied.">
          <Row>
            <Button variant="primary" icon={<Icon name="plus" />} onClick={() => setFormOpen(true)}>Nouveau contenu</Button>
          </Row>
          <Modal
            open={formOpen}
            size="lg"
            onClose={() => setFormOpen(false)}
            title="Nouveau contenu"
            footer={<><Button variant="secondary" onClick={() => setFormOpen(false)}>Annuler</Button><Button onClick={() => setFormOpen(false)}>Analyser la vidéo</Button></>}
          >
            <FormField label="Lien de la vidéo" htmlFor="demo-video" help="Instagram ou TikTok, une vidéo publique.">
              <Input id="demo-video" type="url" placeholder="Colle le lien d'une vidéo Instagram ou TikTok" />
            </FormField>
            <FormField label="Réseau" htmlFor="demo-video-reseau" help="Un Select dans une fenêtre : sa liste passe devant, Échap la ferme sans fermer la fenêtre.">
              <Select id="demo-video-reseau" options={[{ value: 'instagram', label: 'Instagram' }, { value: 'tiktok', label: 'TikTok' }]} defaultValue="instagram" />
            </FormField>
            <LigneAppoint />
          </Modal>
          <div className="flex flex-wrap items-start gap-space-5">
            <Modal inline size="lg" onClose={() => undefined} title="Nouveau contenu"
              footer={<><Button variant="secondary" size="sm">Annuler</Button><Button size="sm">Analyser la vidéo</Button></>}>
              <FormField label="Lien de la vidéo" htmlFor="demo-video-inline" help="Instagram ou TikTok, une vidéo publique.">
                <Input id="demo-video-inline" type="url" placeholder="Colle le lien d'une vidéo Instagram ou TikTok" />
              </FormField>
              <LigneAppoint />
            </Modal>
            <Modal inline size="lg" onClose={() => undefined} iconVariant="brand" icon={<Icon name="video" />} title="Nouveau contenu"
              description="Avec pastille : la rangée pastille + croix, le titre dessous, puis le champ."
              footer={<><Button variant="secondary" size="sm">Annuler</Button><Button size="sm">Analyser la vidéo</Button></>}>
              <FormField label="Lien de la vidéo" htmlFor="demo-video-pastille" help="Instagram ou TikTok, une vidéo publique.">
                <Input id="demo-video-pastille" type="url" placeholder="Colle le lien d'une vidéo Instagram ou TikTok" />
              </FormField>
              <LigneAppoint />
            </Modal>
            <Modal inline onClose={() => undefined} title="Renommer le contenu"
              footer={<><Button variant="ghost" size="sm">Annuler</Button><Button size="sm">Renommer</Button></>}>
              <FormField label="Nom du contenu" htmlFor="demo-rename-md" help="Visible dans Mes contenus.">
                <Input id="demo-rename-md" placeholder="Ma routine de montage" />
              </FormField>
              <LigneAppoint />
            </Modal>
          </div>
        </Block>

        <Block label="Croix et gestes de fuite découplés" hint="closeButton={false} retire la croix en gardant Échap et le clic-voile ; dismissable={false} fait l'inverse — la croix devient le seul geste de fermeture, pour une saisie qu'un clic à côté ne doit pas jeter. Défauts à true : comportement historique.">
          <div className="flex flex-wrap gap-space-4">
            <Modal inline onClose={() => undefined} closeButton={false} title="Sans croix"
              description="Échap et le clic-voile ferment toujours — la croix seule a disparu."
              footer={<Button variant="secondary" size="sm">Fermer</Button>} />
            <Modal inline onClose={() => undefined} dismissable={false} title="Croix seule"
              description="Échap et le clic-voile sont inertes : on ne jette pas une saisie d'un clic à côté."
              footer={<Button size="sm">Enregistrer</Button>} />
          </div>
        </Block>

        <Block label="Avec un champ contrôlé" hint="Le cas de recette du focus : chaque frappe re-rend le parent (état contrôlé) ET recrée la lambda onClose. Si l'effet du piège de focus se relançait à chaque rendu, le focus sauterait du champ après chaque caractère — tape plusieurs caractères d'affilée pour le vérifier. Échap ferme et rend le focus au bouton déclencheur.">
          <Row>
            <Button variant="secondary" onClick={() => setRenameOpen(true)}>Renommer le contenu</Button>
          </Row>
          <Modal
            open={renameOpen}
            onClose={() => setRenameOpen(false)}
            title="Renommer le contenu"
            description="Le nom apparaît dans Mes contenus et dans Claude."
            footer={
              <>
                <Button variant="ghost" onClick={() => setRenameOpen(false)}>Annuler</Button>
                <Button onClick={() => setRenameOpen(false)} disabled={projectName.trim() === ''}>Renommer</Button>
              </>
            }
          >
            <FormField label="Nom du contenu" htmlFor="demo-rename">
              <Input
                id="demo-rename"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Ma routine de montage"
                surface="card"
              />
            </FormField>
          </Modal>
        </Block>
      </Section>

      <Section title="Menu déroulant — classes .ds-dropdown" note="Pas de composant React : le balisage s'écrit dans l'app (role=menu, puis menuitem ou menuitemradio). Panneau rayon lg, --shadow-lg. Les items s'éclairent sur --surface-alt ; l'item coché porte la convention de l'élément sélectionné.">
        <Block label="Ancré sous son déclencheur — .ds-dropdown--floating.ds-dropdown--end" hint="Flottant, le panneau se pose juste sous le bouton, dans un parent position:relative (à poser par l'app). --end colle les bords droits — le menu d'un bouton en bout de ligne. Un menu de CHOIX : role=menuitemradio + aria-checked, texte --primary (corail) sur --accent à la même graisse, coche en currentColor en fin de ligne, rail de 44 px.">
          <div className="flex justify-end">
            <span className="relative inline-flex">
              <Button variant="secondary" iconRight={<Icon name="chevron-down" />} aria-haspopup="menu" aria-expanded={triOpen} onClick={() => setTriOpen(o => !o)}>
                {TRIS.find(r => r.value === tri)?.label}
              </Button>
              {triOpen ? (
                <Menu floating end items={TRIS.map(r => ({
                  label: r.label, checked: r.value === tri,
                  onSelect: () => { setTri(r.value); setTriOpen(false); },
                }))} />
              ) : null}
            </span>
          </div>
        </Block>

        <Block label="Dans le flux — .ds-dropdown seul" hint="Le filet sépare l'action destructrice du reste. Le troisième mélange choix cochés et action : les deux coexistent dans un même menu.">
          <Row>
            <Menu items={[
              { label: 'Copier le lien', icon: <Icon name="copy" size="1rem" /> },
              { label: 'Ouvrir la vidéo', icon: <Icon name="play" size="1rem" />, hint: '⏎' },
              { label: 'Voir les stats', icon: <Icon name="trending-up" size="1rem" /> },
              { separator: true },
              { label: 'Supprimer', icon: <Icon name="trash-2" size="1rem" />, danger: true },
            ]} />
            <Menu items={[
              { label: 'Item au repos', icon: <Icon name="file-text" size="1rem" /> },
              { label: 'Item survolé', icon: <Icon name="file-text" size="1rem" />, className: 'is-hover' },
              { separator: true },
              { label: 'Action risquée', icon: <Icon name="triangle-alert" size="1rem" />, danger: true },
            ]} />
            <Menu items={[
              { label: 'Tous les contenus', checked: true },
              { label: 'Publiés', checked: false },
              { label: 'Brouillons', checked: false, className: 'is-hover' },
              { separator: true },
              { label: 'Réinitialiser les filtres', icon: <Icon name="x" size="1rem" /> },
            ]} />
          </Row>
        </Block>
      </Section>

    </div>
  );
}
