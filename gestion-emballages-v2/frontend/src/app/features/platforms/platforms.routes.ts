import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/role.guard';

export const platformsRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./platform-list/platform-list.component').then(c => c.PlatformListComponent)
  }
];