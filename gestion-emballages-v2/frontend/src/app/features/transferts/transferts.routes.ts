import { Routes } from '@angular/router';

export const transfertsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./transfert-list/transfert-list.component').then(c => c.TransfertListComponent)
  }
];