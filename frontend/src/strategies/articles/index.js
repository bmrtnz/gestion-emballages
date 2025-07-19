import { ArticleFournisseurStrategy } from './ArticleFournisseurStrategy.js';
import { ArticleManagerStrategy } from './ArticleManagerStrategy.js';
import { ArticleStationStrategy } from './ArticleStationStrategy.js';

/**
 * Strategy factory for creating article role-specific strategies
 * Centralizes strategy creation and role mapping for article management
 */
export class ArticleRoleStrategyFactory {
  /**
   * Create a strategy instance based on user role
   * @param {string} userRole - The user's role
   * @param {string} userEntiteId - The user's entity ID (for role-specific data filtering)
   * @returns {ArticleRoleStrategy} - The appropriate strategy instance
   */
  static createStrategy(userRole, userEntiteId = null) {
    switch (userRole) {
      case 'Fournisseur':
        return new ArticleFournisseurStrategy(userEntiteId);
      
      case 'Manager':
      case 'Gestionnaire':
        return new ArticleManagerStrategy(userRole);
      
      case 'Station':
        return new ArticleStationStrategy(userEntiteId);
      
      default:
        console.warn(`Unknown user role: ${userRole}, falling back to Station strategy`);
        return new ArticleStationStrategy(userEntiteId);
    }
  }

  /**
   * Get available roles
   * @returns {Array} - Array of available role names
   */
  static getAvailableRoles() {
    return ['Fournisseur', 'Manager', 'Gestionnaire', 'Station'];
  }

  /**
   * Check if a role has administrative privileges
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role has admin privileges
   */
  static isAdminRole(userRole) {
    return ['Manager', 'Gestionnaire'].includes(userRole);
  }

  /**
   * Check if a role has limited privileges
   * @param {string} userRole - The user's role
   * @returns {boolean} - True if the role has limited privileges
   */
  static isLimitedRole(userRole) {
    return ['Fournisseur', 'Station'].includes(userRole);
  }

  /**
   * Get role hierarchy level (higher number = more privileges)
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
}

// Export strategies individually for direct imports if needed
export { ArticleFournisseurStrategy } from './ArticleFournisseurStrategy.js';
export { ArticleManagerStrategy } from './ArticleManagerStrategy.js';
export { ArticleStationStrategy } from './ArticleStationStrategy.js';
export { ArticleRoleStrategy } from './ArticleRoleStrategy.js';