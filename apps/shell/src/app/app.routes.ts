import { Routes } from '@angular/router';
import { authGuard } from '@org/data-access-auth';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'app1',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('app1', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'app2',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('app2', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
