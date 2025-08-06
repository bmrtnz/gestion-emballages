import { Routes } from '@angular/router';

export const previsionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./prevision-list/prevision-list.component').then(c => c.PrevisionListComponent)
  }
];