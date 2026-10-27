/* Une longue liste, comme celle des pays de la page de paiement (valeurs ISO, libellés en français) :
   les Formulaires et la feuille plein écran des Overlays la partagent. */
export const PAYS = [
  ['DE', 'Allemagne'], ['AD', 'Andorre'], ['AT', 'Autriche'], ['BE', 'Belgique'], ['BJ', 'Bénin'], ['BG', 'Bulgarie'],
  ['BF', 'Burkina Faso'], ['CM', 'Cameroun'], ['CA', 'Canada'], ['CY', 'Chypre'], ['CI', 'Côte d\u2019Ivoire'], ['HR', 'Croatie'],
  ['DK', 'Danemark'], ['ES', 'Espagne'], ['EE', 'Estonie'], ['US', 'États-Unis'], ['FI', 'Finlande'], ['FR', 'France'],
  ['GA', 'Gabon'], ['GR', 'Grèce'], ['GP', 'Guadeloupe'], ['GF', 'Guyane'], ['HU', 'Hongrie'], ['IE', 'Irlande'],
  ['IT', 'Italie'], ['LV', 'Lettonie'], ['LT', 'Lituanie'], ['LU', 'Luxembourg'], ['MG', 'Madagascar'], ['ML', 'Mali'],
  ['MT', 'Malte'], ['MA', 'Maroc'], ['MQ', 'Martinique'], ['MC', 'Monaco'], ['NL', 'Pays-Bas'], ['PL', 'Pologne'],
  ['PT', 'Portugal'], ['RE', 'La Réunion'], ['RO', 'Roumanie'], ['GB', 'Royaume-Uni'], ['SN', 'Sénégal'], ['SK', 'Slovaquie'],
  ['SI', 'Slovénie'], ['SE', 'Suède'], ['CH', 'Suisse'], ['CZ', 'Tchéquie'], ['TN', 'Tunisie'],
].map(([value, label]) => ({ value, label }));
