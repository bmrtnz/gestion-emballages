import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/role.guard';

export const stationsRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./station-page.component').then(c => c.StationPageComponent)
  }
];