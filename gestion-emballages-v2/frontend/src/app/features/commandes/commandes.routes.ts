import { Routes } from '@angular/router';

export const commandesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./commande-list/commande-list.component').then(c => c.CommandeListComponent)
  }
];