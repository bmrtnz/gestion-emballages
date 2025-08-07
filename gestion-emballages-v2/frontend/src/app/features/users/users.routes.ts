import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/role.guard';

export const usersRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./user-list/user-list.component').then(c => c.UserListComponent)
  }
];