import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/role.guard';

export const stationsRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./station-list/station-list.component').then(c => c.StationListComponent)
  }
];