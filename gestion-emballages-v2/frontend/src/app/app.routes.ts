import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/main-layout.component').then(c => c.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'articles',
        loadChildren: () => import('./features/articles/articles.routes').then(m => m.articlesRoutes)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes)
      },
      {
        path: 'stations',
        loadChildren: () => import('./features/stations/stations.routes').then(m => m.stationsRoutes)
      },
      {
        path: 'fournisseurs',
        loadChildren: () => import('./features/fournisseurs/fournisseurs.routes').then(m => m.fournisseursRoutes)
      },
      {
        path: 'commandes',
        loadChildren: () => import('./features/commandes/commandes.routes').then(m => m.commandesRoutes)
      },
      {
        path: 'liste-achat',
        loadComponent: () => import('./features/liste-achat/liste-achat.component').then(c => c.ListeAchatComponent)
      },
      {
        path: 'stocks',
        loadChildren: () => import('./features/stocks/stocks.routes').then(m => m.stocksRoutes)
      },
      {
        path: 'transferts',
        loadChildren: () => import('./features/transferts/transferts.routes').then(m => m.transfertsRoutes)
      },
      {
        path: 'previsions',
        loadChildren: () => import('./features/previsions/previsions.routes').then(m => m.previsionsRoutes)
      }
    ]
  },

  // Fallback
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];