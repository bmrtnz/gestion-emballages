import { PrevisionRoleStrategy } from './PrevisionRoleStrategy';
import { PrevisionManagerStrategy } from './PrevisionManagerStrategy';
import { PrevisionFournisseurStrategy } from './PrevisionFournisseurStrategy';
import { PrevisionStationStrategy } from './PrevisionStationStrategy';

/**
 * Factory class for creating prevision role strategies
 */
export class PrevisionRoleStrategyFactory {
  /**
   * Create a strategy instance based on user role
   * @param {string} userRole - User role
   * @param {string} userEntiteId - User entity ID (for supplier/station)
   * @returns {PrevisionRoleStrategy} Strategy instance
   */
  static createStrategy(userRole, userEntiteId = null) {
    switch (userRole) {
      case 'Manager':
      case 'Gestionnaire':
        return new PrevisionManagerStrategy(userRole);
      
      case 'Fournisseur':
        if (!userEntiteId) {
          console.warn('No entity ID provided for Fournisseur role');
        }
        return new PrevisionFournisseurStrategy(userEntiteId);
      
      case 'Station':
        if (!userEntiteId) {
          console.warn('No entity ID provided for Station role');
        }
        return new PrevisionStationStrategy(userEntiteId);
      
      default:
        console.warn(`Unknown role: ${userRole}, defaulting to Station strategy`);
        return new PrevisionStationStrategy(userEntiteId);
    }
  }
}

export {
  PrevisionRoleStrategy,
  PrevisionManagerStrategy,
  PrevisionFournisseurStrategy,
  PrevisionStationStrategy
};