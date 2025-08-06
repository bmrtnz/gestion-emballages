import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle different error statuses
      switch (error.status) {
        case 401:
          // Unauthorized - token expired or invalid
          if (!req.url.includes('/auth/login')) {
            authService.logout();
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          notificationService.showError('Vous n\'avez pas les permissions nécessaires');
          break;

        case 404:
          // Not found
          notificationService.showError('Ressource non trouvée');
          break;

        case 422:
          // Validation error
          if (error.error?.message) {
            notificationService.showError(error.error.message);
          } else {
            notificationService.showError('Données invalides');
          }
          break;

        case 500:
          // Server error
          notificationService.showError('Erreur serveur interne');
          break;

        case 0:
          // Network error
          notificationService.showError('Erreur de connexion au serveur');
          break;

        default:
          // Generic error
          const message = error.error?.message || error.message || 'Une erreur est survenue';
          notificationService.showError(message);
          break;
      }

      return throwError(() => error);
    })
  );
};