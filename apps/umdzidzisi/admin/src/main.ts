import { initFederation } from '@angular-architects/native-federation';

initFederation({ 'umdzidzisi-admin': './remoteEntry.json' })
  .catch(err => console.error(err))
  .then(() => import('./bootstrap'))
  .catch(err => console.error(err));
