import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/role.guard';

export const articlesRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./article-list/article-list.component').then(c => c.ProductListComponent)
  }
];