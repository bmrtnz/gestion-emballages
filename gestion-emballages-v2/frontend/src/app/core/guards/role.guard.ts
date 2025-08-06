import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { NotificationService } from '../services/notification.service';

export const createRoleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const userRole = authService.userRole();
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    notificationService.showError('Vous n\'avez pas les permissions nécessaires pour accéder à cette page');
    router.navigate(['/dashboard']);
    return false;
  };
};

// Predefined role guards
export const managerGuard = createRoleGuard([UserRole.MANAGER]);
export const gestionnaireGuard = createRoleGuard([UserRole.MANAGER, UserRole.GESTIONNAIRE]);
export const stationGuard = createRoleGuard([UserRole.STATION]);
export const fournisseurGuard = createRoleGuard([UserRole.FOURNISSEUR]);
export const adminGuard = createRoleGuard([UserRole.MANAGER, UserRole.GESTIONNAIRE]);