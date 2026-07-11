import { initFederation } from '@angular-architects/native-federation';

initFederation({ 'umtengesi-client': './remoteEntry.json' })
  .catch(err => console.error(err))
  .then(() => import('./bootstrap'))
  .catch(err => console.error(err));
