import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Password reset - accessible to anyone with a valid token
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/password-reset/password-reset.component').then(c => c.PasswordResetComponent)
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
        canActivate: [adminGuard],
        loadComponent: () => import('./features/users/user-page.component').then(c => c.UserPageComponent)
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
        path: 'platforms',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/platforms/platform-page.component').then(c => c.PlatformPageComponent)
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes)
      },
      {
        path: 'shopping-cart',
        loadComponent: () => import('./features/shopping-cart/shopping-cart.component').then(c => c.ShoppingCartComponent)
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