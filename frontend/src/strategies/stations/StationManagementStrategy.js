import { StationManagerStrategy } from './StationManagerStrategy';
import { StationGestionnaireStrategy } from './StationGestionnaireStrategy';
import { StationStationStrategy } from './StationStationStrategy';
import { StationFournisseurStrategy } from './StationFournisseurStrategy';

/**
 * Factory for creating station management role strategies
 * Handles role-based strategy instantiation for station management
 */
export class StationManagementStrategyFactory {
  /**
   * Create a strategy instance based on user role
   * @param {string} userRole - The user's role (Manager, Gestionnaire, Station, Fournisseur)
   * @param {string} userEntiteId - The user's entity ID
   * @returns {BaseStationManagementStrategy} - The appropriate strategy instance
   */
  static createStrategy(userRole, userEntiteId = null) {
    switch (userRole) {
      case 'Manager':
        return new StationManagerStrategy(userRole, userEntiteId);
      
      case 'Gestionnaire':
        return new StationGestionnaireStrategy(userRole, userEntiteId);
      
      case 'Station':
        return new StationStationStrategy(userRole, userEntiteId);
      
      case 'Fournisseur':
        return new StationFournisseurStrategy(userRole, userEntiteId);
      
      default:
        console.warn(`Unknown user role: ${userRole}, falling back to Station strategy`);
        return new StationStationStrategy(userRole, userEntiteId);
    }
  }

  /**
   * Get available roles for station management
   * @returns {Array} - Array of available role names
   */
  static getAvailableRoles() {
    return ['Manager', 'Gestionnaire', 'Station', 'Fournisseur'];
  }

  /**
   * Check if a role has administrative privileges for stations
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role has admin privileges
   */
  static isAdminRole(userRole) {
    return ['Manager', 'Gestionnaire'].includes(userRole);
  }

  /**
   * Check if a role has limited privileges for stations
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role has limited privileges
   */
  static isLimitedRole(userRole) {
    return ['Station', 'Fournisseur'].includes(userRole);
  }

  /**
   * Get role hierarchy level for stations (higher number = more privileges)
   * @param {string} userRole - The user's role
   * @returns {number} - Hierarchy level
   */
  static getRoleHierarchy(userRole) {
    const hierarchy = {
      'Manager': 100,
      'Gestionnaire': 90,
      'Station': 50,
      'Fournisseur': 30
    };
    
    return hierarchy[userRole] || 0;
  }

  /**
   * Check if a role can manage stations
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role can manage stations
   */
  static canManageStations(userRole) {
    return ['Manager', 'Gestionnaire'].includes(userRole);
  }

  /**
   * Check if a role can view all stations
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role can view all stations
   */
  static canViewAllStations(userRole) {
    return ['Manager', 'Gestionnaire'].includes(userRole);
  }
}