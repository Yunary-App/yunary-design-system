import { useState } from 'react';
import { Badge, Button, Card, Chart, EmptyState, Icon, IconButton, Input, Logo, Pastille, Progress, Separator, StatCard, Table, TBody, Tabs, Td, Th, THead, Tooltip, Tr } from '@yunary/ds';
import type { ThSort } from '@yunary/ds';
import { Block, Grid, Row, Section, Stack } from '../ui';

const TONES = ['coral', 'amber', 'danger', 'warning', 'success', 'neutral', 'accent', 'outline'] as const;
const TAILLES = ['carte', 'dialogue', 'panneau', 'heros', 'ecran'] as const;
const TONS_PASTILLE = ['brand', 'brand-solid', 'coral', 'amber', 'success', 'warning', 'danger', 'neutral', 'inverse'] as const;

const CLIENTS = [
  { qui: 'Camille', montant: 14, depuis: '2026-07-03', label: '3 juil. 2026' },
  { qui: 'lea.martin@gmail.com', montant: 6, depuis: '2026-07-19', label: '19 juil. 2026' },
  { qui: 'Hugo', montant: 14, depuis: '2026-08-08', label: '8 août 2026' },
  { qui: 'Sarah', montant: 8, depuis: '2026-08-27', label: '27 août 2026' },
  { qui: 'Mathilde', montant: 8, depuis: '2026-10-11', label: '11 oct. 2026' },
];

/* Le tri vit dans l'app : Th reçoit l'état et prévient au clic. Même règle que la maquette Admin :
   une autre colonne repart en décroissant, la même bascule. */
function TableTriable() {
  const [tri, setTri] = useState<{ col: 'montant' | 'depuis'; sens: 'asc' | 'desc' }>({ col: 'montant', sens: 'desc' });
  const etat = (col: 'montant' | 'depuis'): ThSort => (tri.col === col ? tri.sens : 'none');
  const clic = (col: 'montant' | 'depuis') => () => setTri(t => (t.col === col ? { col, sens: t.sens === 'desc' ? 'asc' : 'desc' } : { col, sens: 'desc' }));
  const lignes = [...CLIENTS].sort((a, b) => {
    const d = tri.col === 'montant' ? a.montant - b.montant || a.depuis.localeCompare(b.depuis) : a.depuis.localeCompare(b.depuis);
    return tri.sens === 'asc' ? d : -d;
  });
  return (
    <div className="overflow-x-auto"><Table hoverable framed>
      <THead><Tr><Th>Client</Th><Th sort={etat('montant')} onSort={clic('montant')}>Montant / mois</Th><Th sort={etat('depuis')} onSort={clic('depuis')}>Client depuis</Th></Tr></THead>
      <TBody>{lignes.map(c => <Tr key={c.qui}><Td>{c.qui}</Td><Td>{c.montant} €</Td><Td>{c.label}</Td></Tr>)}</TBody>
    </Table></div>
  );
}

/* Les données de la maquette Admin (onglet Évolution) : le MRR et les clients payants, jour par jour.
   Le format des valeurs et des dates est celui de l'APP : le DS ne formate rien. */
const JOUR = 86400000;
const UTC = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const LANCEMENT = UTC('2026-07-01'), AUJOURDHUI = UTC('2026-10-16');
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const jourCourt = (t: number) => { const d = new Date(t); const n = d.getUTCDate(); return `${n === 1 ? '1er' : n} ${MOIS[d.getUTCMonth()]}`; };
const euros = (v: number) => `${v.toLocaleString('fr-FR')} €`;
const nombre = (v: number) => v.toLocaleString('fr-FR');
const ABONNES = [['2026-07-03', 14], ['2026-07-19', 6], ['2026-08-08', 14], ['2026-08-27', 8], ['2026-09-21', 14], ['2026-10-02', 6], ['2026-10-11', 8]] as const;
function serie(jours: number, kind: 'mrr' | 'cli') {
  const debut = jours === 0 ? LANCEMENT : Math.max(LANCEMENT, AUJOURDHUI - (jours - 1) * JOUR);
  const n = Math.round((AUJOURDHUI - debut) / JOUR) + 1;
  return Array.from({ length: n }, (_, i) => {
    const t = debut + i * JOUR, on = ABONNES.filter(([d]) => UTC(d) <= t);
    return { at: t, value: kind === 'mrr' ? on.reduce((a, [, m]) => a + m, 0) : on.length };
  });
}
const ANNEE = Array.from({ length: 365 }, (_, i) => ({ at: UTC('2025-10-17') + i * JOUR, value: 6 * Math.floor(i / 11) + (i % 23 < 4 ? 8 : 0) }));

function CarteEvolution() {
  const [periode, setPeriode] = useState('0');
  const jours = Number(periode);
  const mrr = serie(jours, 'mrr'), cli = serie(jours, 'cli');
  const libelle = { '30': '30 derniers jours', '90': '90 derniers jours', '0': 'Depuis le lancement, le 1er juil. 2026' }[periode];
  const fin = mrr[mrr.length - 1].value, ecart = fin - mrr[0].value;
  return (
    <Card size="lg">
      <div className="flex flex-col gap-space-5">
        <div className="flex flex-wrap items-start justify-between gap-space-4">
          <div className="flex flex-col gap-space-1"><span className="text-body-sm font-semibold">MRR, jour par jour</span><span className="caption text-text-muted">{libelle}</span></div>
          <Tabs size="sm" value={periode} onChange={setPeriode} items={[{ value: '30', label: '30 jours' }, { value: '90', label: '90 jours' }, { value: '0', label: 'Depuis le lancement' }]} />
        </div>
        <Chart points={mrr} formatValue={euros} formatAt={jourCourt} label="Courbe du MRR"
          summary={`${euros(fin)} aujourd'hui, ${ecart >= 0 ? '+' : ''}${euros(ecart)} sur la période.`} />
        <Separator />
        <div className="flex flex-col gap-space-1"><span className="text-body-sm font-semibold">Clients payants</span><span className="caption text-text-muted">Même période</span></div>
        <Chart points={cli} formatValue={nombre} formatAt={jourCourt} label="Courbe des clients payants" tone="ink" size="sm" integer
          summary={`${cli[cli.length - 1].value} clients payants aujourd'hui.`} />
      </div>
    </Card>
  );
}

export function DataDisplayPage() {
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="Graphique d'évolution — Chart" note="Chart (0.8.0, maquette Admin Web, onglet Évolution), sans librairie : grille, aire, ligne en escalier, point final, graduations en valeurs et en dates (--text-axis, 12). La géométrie vient de chartGeometry (@yunary/ds/chart-geometry, sans React) ; la largeur est celle du conteneur, la hauteur md 260 / 180 ou sm 150 / 120 sous 64 rem. tone=primary (aire, trait 2,5) ou ink (trait 2). Le format et le résumé lu par un lecteur d'écran viennent de l'app. L'assemblage de la carte (titres, période) reste à l'app.">
        <Block label="La carte Évolution de la maquette, assemblée par l'app" hint="Change la période : 30 jours, 90 jours, depuis le lancement.">
          <CarteEvolution />
        </Block>
        <Block label="Cas limites">
          <Grid cols={2}>
            <Card gap={3}><span className="caption text-text-muted">Un seul point</span><Chart points={[{ at: AUJOURDHUI, value: 72 }]} formatValue={euros} formatAt={jourCourt} label="Courbe du MRR" summary="72 € aujourd'hui." size="sm" /></Card>
            <Card gap={3}><span className="caption text-text-muted">Toute à zéro</span><Chart points={serie(30, 'mrr').map(p => ({ ...p, value: 0 }))} formatValue={euros} formatAt={jourCourt} label="Courbe du MRR" summary="0 € aujourd'hui, aucun abonnement sur 30 jours." size="sm" integer /></Card>
            <Card gap={3}><span className="caption text-text-muted">Valeurs qui ne bougent pas</span><Chart points={serie(30, 'mrr').map(p => ({ ...p, value: 14 }))} formatValue={euros} formatAt={jourCourt} label="Courbe du MRR" summary="14 € aujourd'hui, stable sur 30 jours." size="sm" /></Card>
            <Card gap={3}><span className="caption text-text-muted">Une année jour par jour</span><Chart points={ANNEE} formatValue={euros} formatAt={jourCourt} label="Courbe du MRR" summary="Une année de MRR, jour par jour." size="sm" /></Card>
          </Grid>
        </Block>
        <Block label="Chargement" hint="Un squelette aux dimensions finales.">
          <Grid cols={2}>
            <Card><Chart points={[]} formatValue={euros} formatAt={jourCourt} label="Courbe du MRR" summary="Chargement." loading /></Card>
            <Card><Chart points={[]} formatValue={nombre} formatAt={jourCourt} label="Courbe des clients payants" summary="Chargement." loading size="sm" tone="ink" /></Card>
          </Grid>
        </Block>
      </Section>

      <Section title="Carte de chiffre — StatCard" note=".ds-card.ds-card--stat.ds-stat-card (0.7.0, maquette Admin Web) : libellé, valeur en --text-heading-xl 800, pied en sourdine (badge de variation dense + phrase). Hausse = success, stable = neutral, baisse = danger ; le texte et le sens viennent de l'app. Paddings 24 / 28 puis 16 / 18 sous 64 rem (--card-pad-stat-*). En chargement, deux squelettes aux places finales, le libellé reste.">
        <Block label="Les trois sens de variation">
          <Grid cols={3}>
            <StatCard label="MRR" value="84 €" delta={{ text: '+12 € · +17 %', trend: 'up' }} note="sur 30 jours" />
            <StatCard label="Clients payants" value="7" delta={{ text: '0', trend: 'flat' }} note="aucun nouveau sur 30 jours" />
            <StatCard label="Désabonnements" value="2" delta={{ text: '−1', trend: 'down' }} note="sur 30 jours" />
          </Grid>
        </Block>
        <Block label="Sans variation, et en chargement">
          <Grid cols={3}>
            <StatCard label="Inscrits" value="120" note="comptes créés, payants ou non" />
            <StatCard label="MRR" loading />
            <StatCard label="Clients payants" loading />
          </Grid>
        </Block>
      </Section>

      <Section title="En-tête de tableau triable — Th sort" note="Th avec sort (asc · desc · none) et onSort (0.7.0) : un bouton .ds-table__sort, le glyphe de l'état (arrow-down décroissant, arrow-up croissant, arrow-up-down non trié), aria-sort sur le th, la colonne active en --foreground. Contrôlé : l'app trie.">
        <Block label="Les trois états">
          <div className="overflow-x-auto"><Table framed>
            <THead><Tr><Th sort="desc" onSort={() => {}}>Décroissant</Th><Th sort="asc" onSort={() => {}}>Croissant</Th><Th sort="none" onSort={() => {}}>Non trié</Th></Tr></THead>
            <TBody><Tr><Td>14 €</Td><Td>3 juil. 2026</Td><Td>instagram</Td></Tr></TBody>
          </Table></div>
        </Block>
        <Block label="Un tableau qui trie" hint="Clique sur Montant ou Client depuis : une autre colonne repart en décroissant, la même bascule.">
          <TableTriable />
        </Block>
      </Section>

      <Section title="Chiffres d'une carte produit — .ds-stat--lg, .ds-stats--bare" note="0.7.0 : la valeur en --text-heading 800 (--text-subheading sous 64 rem), le libellé au-dessus ; la rangée en colonnes égales, sans filet. .ds-stats / .ds-stat sans modificateur ne bougent pas (Fiches et rangées).">
        <Grid cols={2}>
          <Card size="xl">
            <div className="flex flex-col gap-space-5">
              <div className="flex items-center gap-space-3"><Logo variant="monogram" height="2rem" /><span className="font-display text-subheading font-bold">Yunary <span className="accent">Analyse</span></span></div>
              <div className="ds-stats ds-stats--bare">
                <div className="ds-stat ds-stat--lg"><span className="ds-stat__value">4</span><span className="ds-stat__label">Abonnés</span></div>
                <div className="ds-stat ds-stat--lg"><span className="ds-stat__value">24 €</span><span className="ds-stat__label">MRR de l'outil</span></div>
                <div className="ds-stat ds-stat--lg"><span className="ds-stat__value">43 %</span><span className="ds-stat__label">Part du MRR</span></div>
              </div>
              <Progress value={43} max={100} label="Part du MRR" />
              <span className="caption text-text-muted">Prix de lancement : 6 € / mois à vie, au lieu de 9 €</span>
            </div>
          </Card>
          <Card>
            <div className="ds-stats">
              <div className="ds-stat"><span className="ds-stat__value">12,4 k</span><span className="ds-stat__label">abonnés</span></div>
              <div className="ds-stat"><span className="ds-stat__value">318</span><span className="ds-stat__label">publications</span></div>
            </div>
          </Card>
        </Grid>
      </Section>

      <Section title="Card" note="La surface signature : fond --card teinté, bordure 1px, rayon lg ou xl, ombre teintée. Jamais une card blanche.">
        <Block label="Variantes" hint="Les gaps de grille entre cards sont ≥ 1.5rem.">
          <Grid cols={3}>
            <Card>
              <h4>Card par défaut</h4>
              <p className="caption">Statique, --shadow-sm au repos.</p>
            </Card>
            <Card variant="interactive">
              <h4>Card interactive</h4>
              <p className="caption">translateY(-2px) vers --shadow-md au survol.</p>
            </Card>
            <Card variant="feature">
              <h4>Card feature</h4>
              <p className="caption">Lavis --grad-soft et bordure teintée de --primary.</p>
            </Card>
          </Grid>
        </Block>

        <Block label="États d'une card interactive">
          <Grid cols={3}>
            <Card variant="interactive" className="is-hover"><h4>Hover</h4><p className="caption">--shadow-md</p></Card>
            <Card variant="interactive" className="is-active"><h4>Press</h4><p className="caption">retour à --shadow-sm</p></Card>
            <Card variant="interactive" className="is-focus"><h4>Focus</h4><p className="caption">anneau 3px --ring</p></Card>
          </Grid>
        </Block>

        <Block label="Tailles et flush" hint="md = rayon lg / padding 1.5rem · lg = rayon xl / padding 1.75rem.">
          <Grid cols={3}>
            <Card size="md"><h4>Taille md</h4><p className="caption">--card-pad</p></Card>
            <Card size="lg"><h4>Taille lg</h4><p className="caption">--card-pad-lg</p></Card>
            <Card flush>
              <span className="block h-space-8 bg-grad-soft" />
              <div className="p-card-pad">
                <h4>Flush</h4>
                <p className="caption">Média pleine largeur, padding porté par le contenu.</p>
              </div>
            </Card>
          </Grid>
        </Block>

        <Block label="La pile et le filet de bord à bord" hint="gap={3|4|5|6} passe la carte en colonne flex avec l'écart du palier — sans lui, .ds-card est display:block et un gap-* en className rend 0 px. Separator bleed, enfant direct, annule le --card-pad et va d'un bord à l'autre sans déborder ; en lg il lit --card-pad-lg.">
          <Grid cols={3}>
            <Card gap={4} title="gap={4}" subtitle="--space-4 entre les blocs">
              <p className="caption">Premier bloc</p>
              <Separator bleed />
              <p className="caption">Second bloc — le filet touche les deux bords</p>
              <Separator bleed />
              <Button variant="secondary" size="sm">Action</Button>
            </Card>
            <Card gap={6} size="lg" title="gap={6} · lg" subtitle="--space-6, filet sur --card-pad-lg">
              <p className="caption">Premier bloc</p>
              <Separator bleed />
              <p className="caption">Second bloc</p>
            </Card>
            <Card className="flex flex-col gap-space-4">
              <h4>Sans gap : className</h4>
              <p className="caption">Ce qu'écrivaient les apps — flex + gap posés en utilitaires. Ça marche parce que layer(utilities) gagne, mais c'est la carte qui doit le savoir : gap={4}.</p>
              <Separator />
              <p className="caption">Un Separator SANS bleed s'arrête au padding.</p>
            </Card>
          </Grid>
        </Block>

        <Block label="En-tête à slots" hint="eyebrow · icon · title · subtitle · action, tous optionnels. Aucun slot passé = AUCUN noeud d'en-tête émis. L'ALIGNEMENT est décidé par le socle, jamais par une prop : titre simple = rangée centrée ; titre + sous-titre = flex-start, l'action s'aligne sur le titre au lieu de flotter entre les deux lignes.">
          <Grid cols={2}>
            <Card
              icon={<Pastille size="carte" tone="brand"><Icon name="terminal" /></Pastille>}
              title="Titre simple — rangée centrée"
              action={<IconButton size="sm" label="Actions"><Icon name="ellipsis" /></IconButton>}
            >
              <p className="caption">Le cas majoritaire : icône, titre et action partagent un axe.</p>
            </Card>
            <Card
              eyebrow="Build"
              icon={<Pastille size="carte" tone="brand"><Icon name="rocket" /></Pastille>}
              title="Premier outil interne"
              subtitle="Créé il y a deux jours"
              action={<IconButton size="sm" label="Actions"><Icon name="ellipsis" /></IconButton>}
            >
              <p className="caption">Avec un sous-titre : flex-start — l'action tient la ligne du haut.</p>
            </Card>
            <Card
              size="lg"
              titleSize="lg"
              headerGap="airy"
              eyebrow="Série"
              title="Trois vidéos, un outil"
              subtitle="Du zéro au premier déploiement"
            >
              <Stack>
                <p className="caption">titleSize=&quot;lg&quot; passe le titre en --text-subheading.</p>
                <p className="caption">headerGap=&quot;airy&quot; ouvre la gouttière à --space-6, pour une carte à blocs.</p>
              </Stack>
            </Card>
          </Grid>
        </Block>
      </Section>

      <Section title="Encart de valeur — classes .ds-inset" note="Une valeur posée DANS une carte : une ligne de texte sur une surface creusée, rayon md, action facultative à droite. Ni une Card (on n'imbrique pas de carte), ni un EmptyState (colonne centrée à pastille). La surface se déduit comme celle d'un champ : --secondary sur la page, --background dans une carte.">
        <Card title="Dans une carte">
          <div className="flex flex-col gap-space-4">
            <Row label="bordé — une valeur remplie">
              <p className="ds-inset w-full"><span className="ds-inset__value">Développeuse indépendante, je construis des outils internes pour des équipes de dix personnes.</span></p>
            </Row>
            <Row label="--dashed — un champ vide, avec action">
              <div className="ds-inset ds-inset--dashed w-full">
                <span className="ds-inset__value">Comment tu en es arrivée là, en deux ou trois phrases.</span>
                <a className="ds-inset__action" href="#data-display">Compléter</a>
              </div>
            </Row>
            <Row label="--bare — une matière en lecture seule">
              <p className="ds-inset ds-inset--bare"><span className="ds-inset__value">« Je vais être directe. »</span></p>
              <p className="ds-inset ds-inset--bare"><span className="ds-inset__value">« Voilà. Simple, pas facile. »</span></p>
            </Row>
            <Row label="action en bouton">
              <div className="ds-inset w-full">
                <span className="ds-inset__value">Un tableau de bord par équipe.</span>
                <span className="ds-inset__action"><Button variant="ghost" size="sm" icon={<Icon name="copy" />}>Copier</Button></span>
              </div>
            </Row>
          </div>
        </Card>
        <Block label="Sur la page" hint="Hors carte, l'encart prend --secondary pour rester visible sur la page.">
          <div className="ds-inset ds-inset--dashed">
            <span className="ds-inset__value">Ce qui la bloque aujourd'hui, en une phrase.</span>
            <a className="ds-inset__action" href="#data-display">Compléter</a>
          </div>
        </Block>
      </Section>

      <Section title="Pastille" note="La tuile d'icône du système — une seule pour toutes les tuiles teintées. Les tailles sont nommées PAR CONTEXTE, jamais par mesure : un site d'appel n'écrit jamais un rem.">
        <Block label="Tailles" hint="carte 2.25 · dialogue 2.625 · panneau 3.25 · héros 4 · écran 5rem. Le rayon suit la taille : sm · md · lg · xl · 2xl.">
          <Row>
            {TAILLES.map(t => (
              <div key={t} className="flex flex-col items-center gap-space-2">
                <Pastille size={t}><Icon name="rocket" size="1.25rem" /></Pastille>
                <span className="mono text-caption text-text-muted">{t}</span>
              </div>
            ))}
          </Row>
          <Row label="shape=&quot;round&quot; — le rayon passe à --radius-pill">
            {TAILLES.map(t => <Pastille key={t} size={t} shape="round"><Icon name="user" size="1.25rem" /></Pastille>)}
          </Row>
        </Block>

        <Block label="Tons" hint="brand (--grad-soft) + les 6 paires sémantiques + inverse. Les mêmes paires que Badge, Banner et Toast — une seule source.">
          <Row>
            {TONS_PASTILLE.map(t => (
              <div key={t} className="flex flex-col items-center gap-space-2">
                <Pastille tone={t}><Icon name="circle-check" size="1.25rem" /></Pastille>
                <span className="mono text-caption text-text-muted">{t}</span>
              </div>
            ))}
          </Row>
          <Row label="outlined — le filet 1px currentColor à 22 %, celui d'EmptyState, généralisé">
            {TONS_PASTILLE.map(t => <Pastille key={t} tone={t} outlined><Icon name="zap" size="1.25rem" /></Pastille>)}
          </Row>
        </Block>
      </Section>

      <Section title="Badge" note="Le rayon pill est légal ici. Les tons sémantiques portent toujours une icône + du texte.">
        <Block label="Tous les tons">
          <Row>
            <Badge tone="success" icon={<Icon name="circle-check" size="0.875rem" strokeWidth={2.5} />}>En ligne</Badge>
            <Badge tone="danger" icon={<Icon name="circle-alert" size="0.875rem" strokeWidth={2.5} />}>Échec</Badge>
            <Badge tone="warning" icon={<Icon name="triangle-alert" size="0.875rem" strokeWidth={2.5} />}>À vérifier</Badge>
            <Badge tone="coral" icon={<Icon name="zap" size="0.875rem" strokeWidth={2.5} />}>Nouveau</Badge>
            <Badge tone="amber" icon={<Icon name="clock" size="0.875rem" strokeWidth={2.5} />}>Bientôt</Badge>
            <Badge tone="accent" icon={<Icon name="rocket" size="0.875rem" strokeWidth={2.5} />}>Mis en avant</Badge>
            <Badge tone="neutral">Brouillon</Badge>
            <Badge tone="outline">Archivé</Badge>
          </Row>
          <Row label="sans icône">
            {TONES.map(t => <Badge key={t} tone={t}>{t}</Badge>)}
          </Row>
        </Block>

        <Block label="Rembourrages" hint="md = --badge-h (29 px), la hauteur historique, figée pour non-régression · dense = --badge-h-dense (24 px), celle qui s'aligne sur une pilule d'état de la même rangée. Icône 0.875rem en md, 0.75rem en dense.">
          <Row label="md — posé à côté d'un Button sm et d'un Input sm">
            <Badge tone="success" icon={<Icon name="circle-check" size="0.875rem" strokeWidth={2.5} />}>En ligne</Badge>
            <Button size="sm" variant="secondary">Action</Button>
            <Input size="sm" defaultValue="Champ sm" style={{ width: '9rem' }} />
          </Row>
          <Row label="dense — même rangée, alignement retrouvé">
            <Badge pad="dense" tone="success" icon={<Icon name="circle-check" size="0.75rem" strokeWidth={2.5} />}>En ligne</Badge>
            <Badge pad="dense" tone="coral" icon={<Icon name="zap" size="0.75rem" strokeWidth={2.5} />}>Nouveau</Badge>
            <Badge pad="dense" tone="neutral">Brouillon</Badge>
          </Row>
        </Block>
      </Section>

      <Section title="Separator" note="Filet fin en --border. Avec label, le texte est centré sur la ligne.">
        <Block label="Orientations et libellé">
          <Stack>
            <Separator />
            <Separator label="ou" />
            <Separator label="Publié le 24 septembre" />
          </Stack>
          <Row label="vertical">
            <span className="flex h-space-6 items-center gap-space-4">
              <span className="caption">Build</span>
              <Separator orientation="vertical" />
              <span className="caption">Tuto</span>
              <Separator orientation="vertical" />
              <span className="caption">Coulisses</span>
            </span>
          </Row>
        </Block>
      </Section>

      <Section title="Table" note="Composable : Table > THead/TBody > Tr > Th/Td. L'état vide se rend À LA PLACE de la table, jamais dedans.">
        <Block label="Simple, rayée, survolable">
          <Table hoverable striped>
            <THead>
              <Tr><Th>Vidéo</Th><Th>Série</Th><Th>Publiée</Th><Th>Statut</Th></Tr>
            </THead>
            <TBody>
              <Tr><Td>Construire une app en un week-end</Td><Td>Build</Td><Td>il y a 3 j</Td><Td><Badge tone="success" icon={<Icon name="circle-check" size="0.875rem" strokeWidth={2.5} />}>En ligne</Badge></Td></Tr>
              <Tr><Td>Cadrer une idée en une phrase</Td><Td>Tuto</Td><Td>il y a 9 j</Td><Td><Badge tone="success" icon={<Icon name="circle-check" size="0.875rem" strokeWidth={2.5} />}>En ligne</Badge></Td></Tr>
              <Tr><Td>Le prompt que j'utilise tous les jours</Td><Td>Build</Td><Td>il y a 16 j</Td><Td><Badge tone="neutral">Brouillon</Badge></Td></Tr>
              <Tr><Td>Ce que Claude Code ne sait pas faire</Td><Td>Coulisses</Td><Td>il y a 24 j</Td><Td><Badge tone="warning" icon={<Icon name="triangle-alert" size="0.875rem" strokeWidth={2.5} />}>À revoir</Badge></Td></Tr>
            </TBody>
          </Table>
        </Block>
        <Block label="Sans option">
          <Table>
            <THead><Tr><Th>Palier</Th><Th>Valeur</Th></Tr></THead>
            <TBody>
              <Tr><Td>Rayon des contrôles</Td><Td className="mono">--radius-md</Td></Tr>
              <Tr><Td>Rail de hauteur</Td><Td className="mono">--control-md</Td></Tr>
            </TBody>
          </Table>
        </Block>
        <Block label="framed" hint="Contour autonome : bordure 1px --border, rayon lg, fond --card, en-tête sur --background. Plus besoin de l'envelopper dans une Card flush.">
          <Table framed>
            <THead><Tr><Th>Série</Th><Th>Vidéos</Th><Th>Dernière</Th></Tr></THead>
            <TBody>
              <Tr><Td>Build</Td><Td>14</Td><Td>il y a 3 j</Td></Tr>
              <Tr><Td>Tuto</Td><Td>9</Td><Td>il y a 9 j</Td></Tr>
              <Tr><Td>Coulisses</Td><Td>4</Td><Td>il y a 24 j</Td></Tr>
            </TBody>
          </Table>
        </Block>
        <Block label="framed columns" hint="Les séparateurs verticaux rendent la structure des colonnes lisible.">
          <Table framed columns>
            <THead><Tr><Th>Série</Th><Th>Vidéos</Th><Th>Dernière</Th></Tr></THead>
            <TBody>
              <Tr><Td>Build</Td><Td>14</Td><Td>il y a 3 j</Td></Tr>
              <Tr><Td>Tuto</Td><Td>9</Td><Td>il y a 9 j</Td></Tr>
              <Tr><Td>Coulisses</Td><Td>4</Td><Td>il y a 24 j</Td></Tr>
            </TBody>
          </Table>
        </Block>
        <Block label="framed columns striped hoverable" hint="Les quatre options se composent librement.">
          <Table framed columns striped hoverable>
            <THead><Tr><Th>Vidéo</Th><Th>Série</Th><Th>Publiée</Th><Th>Statut</Th></Tr></THead>
            <TBody>
              <Tr><Td>Construire une app en un week-end</Td><Td>Build</Td><Td>il y a 3 j</Td><Td><Badge tone="success" icon={<Icon name="circle-check" size="0.875rem" strokeWidth={2.5} />}>En ligne</Badge></Td></Tr>
              <Tr><Td>Cadrer une idée en une phrase</Td><Td>Tuto</Td><Td>il y a 9 j</Td><Td><Badge tone="success" icon={<Icon name="circle-check" size="0.875rem" strokeWidth={2.5} />}>En ligne</Badge></Td></Tr>
              <Tr><Td>Le prompt que j'utilise tous les jours</Td><Td>Build</Td><Td>il y a 16 j</Td><Td><Badge tone="neutral">Brouillon</Badge></Td></Tr>
              <Tr><Td>Ce que Claude Code ne sait pas faire</Td><Td>Coulisses</Td><Td>il y a 24 j</Td><Td><Badge tone="warning" icon={<Icon name="triangle-alert" size="0.875rem" strokeWidth={2.5} />}>À revoir</Badge></Td></Tr>
            </TBody>
          </Table>
        </Block>
        <Block label="État vide" hint="La table disparaît, l'EmptyState prend sa place.">
          <EmptyState
            icon={<Icon name="folder" size="1.5rem" />}
            title="Aucune vidéo"
            description="Publie ton premier build pour voir la liste se remplir."
          />
        </Block>
      </Section>

      <Section title="Tooltip" note="Bulle --tone-dark au survol et au focus ; elle s'inverse en --tone-light-alt en thème sombre. Libellé court uniquement.">
        <Block label="Placement et ouverture forcée">
          <Row>
            <Tooltip content="Copier le prompt">
              <IconButton label="Copier"><Icon name="copy" /></IconButton>
            </Tooltip>
            <Tooltip content="Ouvrir la vidéo" placement="bottom">
              <IconButton label="Lire"><Icon name="play" /></IconButton>
            </Tooltip>
          </Row>
          <Row label="open — pour la recette">
            <span className="inline-flex pt-space-6">
              <Tooltip content="Copier le prompt" open>
                <IconButton label="Copier" variant="secondary"><Icon name="copy" /></IconButton>
              </Tooltip>
            </span>
            <span className="inline-flex pb-space-6">
              <Tooltip content="Ouvrir la vidéo" placement="bottom" open>
                <IconButton label="Lire" variant="secondary"><Icon name="play" /></IconButton>
              </Tooltip>
            </span>
          </Row>
        </Block>
      </Section>
    </div>
  );
}
