import { Routes } from '@angular/router';

export const stocksRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./stock-list/stock-list.component').then(c => c.StockListComponent)
  }
];