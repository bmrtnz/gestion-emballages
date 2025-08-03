// frontend/src/strategies/listeAchat/index.js
import { ListeAchatStationStrategy } from './ListeAchatStationStrategy.js';

/**
 * Factory pour créer les stratégies de liste d'achat selon le rôle utilisateur
 */
export class ListeAchatStrategyFactory {
  /**
   * Crée une stratégie appropriée selon le rôle utilisateur
   * @param {string} userRole - Rôle de l'utilisateur
   * @param {string} userEntiteId - ID de l'entité utilisateur
   * @returns {ListeAchatBaseStrategy} Instance de la stratégie appropriée
   */
  static createStrategy(userRole, userEntiteId = null) {
    switch (userRole) {
      case 'Station':
        return new ListeAchatStationStrategy(userEntiteId);
        
      case 'Manager':
      case 'Gestionnaire':
        // Pour l'instant, les managers utilisent la même stratégie que les stations
        // Cela pourra être étendu plus tard avec des stratégies spécifiques
        return new ListeAchatStationStrategy(userEntiteId);
        
      case 'Fournisseur':
        // Les fournisseurs n'ont pas accès aux listes d'achat pour l'instant
        // Retourne une stratégie par défaut avec permissions limitées
        return new ListeAchatStationStrategy(userEntiteId);
        
      default:
        console.warn(`Rôle non reconnu pour la liste d'achat: ${userRole}, utilisation de la stratégie Station par défaut`);
        return new ListeAchatStationStrategy(userEntiteId);
    }
  }
  
  /**
   * Vérifie si un rôle a accès aux listes d'achat
   * @param {string} userRole - Rôle de l'utilisateur
   * @returns {boolean}
   */
  static hasListeAchatAccess(userRole) {
    const allowedRoles = ['Station', 'Manager', 'Gestionnaire'];
    return allowedRoles.includes(userRole);
  }
  
  /**
   * Retourne les rôles supportés pour les listes d'achat
   * @returns {Array<string>}
   */
  static getSupportedRoles() {
    return ['Station', 'Manager', 'Gestionnaire'];
  }
}

// Exports pour faciliter l'importation
export { ListeAchatStationStrategy } from './ListeAchatStationStrategy.js';
export { ListeAchatBaseStrategy } from './ListeAchatBaseStrategy.js';