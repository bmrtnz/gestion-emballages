import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/role.guard';

export const fournisseursRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./fournisseur-list/fournisseur-list.component').then(c => c.SupplierListComponent)
  }
];