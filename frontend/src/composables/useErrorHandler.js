// frontend/src/composables/useErrorHandler.js
import { notification } from './useNotification';
import { useAuthStore } from '../stores/authStore';

/**
 * Composable pour la gestion centralisée des erreurs
 * @returns {Object} Fonctions de gestion d'erreur
 */
export function useErrorHandler() {
  const authStore = useAuthStore();

  /**
   * Gère les erreurs API de manière centralisée
   * @param {Error} error - L'erreur à traiter
   * @param {string} defaultMessage - Message par défaut si aucun message spécifique
   * @param {boolean} showNotification - Afficher ou non une notification
   */
  const handleError = (error, defaultMessage = 'Une erreur est survenue', showNotification = true) => {
    console.error('Error occurred:', error);

    let errorMessage = defaultMessage;
    let shouldLogout = false;

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data.message || 'Données invalides';
          break;
        case 401:
          errorMessage = 'Session expirée, veuillez vous reconnecter';
          shouldLogout = true;
          break;
        case 403:
          errorMessage = 'Accès non autorisé';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 409:
          errorMessage = data.message || 'Conflit de données';
          break;
        case 422:
          errorMessage = data.message || 'Données de validation incorrectes';
          break;
        case 500:
          errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
          break;
        default:
          errorMessage = data.message || defaultMessage;
      }
    } else if (error.request) {
      errorMessage = 'Impossible de contacter le serveur';
    }

    if (showNotification) {
      notification.error(errorMessage);
    }

    if (shouldLogout) {
      authStore.logout();
    }

    return {
      message: errorMessage,
      status: error.response?.status,
      shouldLogout
    };
  };

  /**
   * Gère les erreurs de validation avec des messages spécifiques par champ
   * @param {Object} validationErrors - Erreurs de validation par champ
   */
  const handleValidationErrors = (validationErrors) => {
    if (validationErrors && typeof validationErrors === 'object') {
      const firstError = Object.values(validationErrors)[0];
      if (Array.isArray(firstError)) {
        notification.error(firstError[0]);
      } else {
        notification.error(firstError);
      }
    }
  };

  /**
   * Wrapper pour les appels API avec gestion d'erreur intégrée
   * @param {Function} apiCall - Fonction d'appel API
   * @param {string} errorMessage - Message d'erreur personnalisé
   * @param {boolean} showError - Afficher ou non l'erreur
   */
  const withErrorHandling = async (apiCall, errorMessage, showError = true) => {
    try {
      return await apiCall();
    } catch (error) {
      handleError(error, errorMessage, showError);
      throw error;
    }
  };

  return {
    handleError,
    handleValidationErrors,
    withErrorHandling
  };
}