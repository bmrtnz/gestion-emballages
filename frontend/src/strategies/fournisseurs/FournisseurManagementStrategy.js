import { FournisseurManagerStrategy } from './FournisseurManagerStrategy';
import { FournisseurGestionnaireStrategy } from './FournisseurGestionnaireStrategy';
import { FournisseurStationStrategy } from './FournisseurStationStrategy';
import { FournisseurFournisseurStrategy } from './FournisseurFournisseurStrategy';

/**
 * Factory for creating fournisseur management role strategies
 * Handles role-based strategy instantiation for supplier management
 */
export class FournisseurManagementStrategyFactory {
  /**
   * Create a strategy instance based on user role
   * @param {string} userRole - The user's role (Manager, Gestionnaire, Station, Fournisseur)
   * @param {string} userEntiteId - The user's entity ID
   * @returns {BaseFournisseurManagementStrategy} - The appropriate strategy instance
   */
  static createStrategy(userRole, userEntiteId = null) {
    switch (userRole) {
      case 'Manager':
        return new FournisseurManagerStrategy(userRole, userEntiteId);
      
      case 'Gestionnaire':
        return new FournisseurGestionnaireStrategy(userRole, userEntiteId);
      
      case 'Station':
        return new FournisseurStationStrategy(userRole, userEntiteId);
      
      case 'Fournisseur':
        return new FournisseurFournisseurStrategy(userRole, userEntiteId);
      
      default:
        console.warn(`Unknown user role: ${userRole}, falling back to Station strategy`);
        return new FournisseurStationStrategy(userRole, userEntiteId);
    }
  }

  /**
   * Get available roles for fournisseur management
   * @returns {Array} - Array of available role names
   */
  static getAvailableRoles() {
    return ['Manager', 'Gestionnaire', 'Station', 'Fournisseur'];
  }

  /**
   * Check if a role has administrative privileges for fournisseurs
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role has admin privileges
   */
  static isAdminRole(userRole) {
    return ['Manager', 'Gestionnaire'].includes(userRole);
  }

  /**
   * Check if a role has limited privileges for fournisseurs
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role has limited privileges
   */
  static isLimitedRole(userRole) {
    return ['Station', 'Fournisseur'].includes(userRole);
  }

  /**
   * Get role hierarchy level for fournisseurs (higher number = more privileges)
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
   * Check if a role can manage fournisseurs
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role can manage fournisseurs
   */
  static canManageFournisseurs(userRole) {
    return ['Manager', 'Gestionnaire'].includes(userRole);
  }

  /**
   * Check if a role can view all fournisseurs
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role can view all fournisseurs
   */
  static canViewAllFournisseurs(userRole) {
    return ['Manager', 'Gestionnaire', 'Station'].includes(userRole);
  }

  /**
   * Check if a role can manage sites
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role can manage sites
   */
  static canManageSites(userRole) {
    return ['Manager', 'Gestionnaire', 'Fournisseur'].includes(userRole);
  }

  /**
   * Check if a role can only manage own data
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role can only manage own data
   */
  static canOnlyManageOwnData(userRole) {
    return userRole === 'Fournisseur';
  }
}