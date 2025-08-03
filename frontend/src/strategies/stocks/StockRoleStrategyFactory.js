/**
 * @fileoverview Factory for creating stock role strategies
 * @module strategies/stocks/StockRoleStrategyFactory
 */

import { FournisseurStockStrategy } from './FournisseurStockStrategy.js';
import { GestionnaireStockStrategy } from './GestionnaireStockStrategy.js';
import { StationStockStrategy } from './StationStockStrategy.js';

/**
 * Factory class for creating role-specific stock strategies
 * Implements the Factory Pattern as described in DESIGN.md
 */
export class StockRoleStrategyFactory {
  /**
   * Create a strategy instance based on user role
   * @param {string} userRole - The user's role
   * @param {string|null} userEntiteId - The user's entity ID (optional)
   * @returns {StockRoleStrategy} Strategy instance for the role
   */
  static createStrategy(userRole, userEntiteId = null) {
    switch (userRole) {
      case 'Fournisseur':
        return new FournisseurStockStrategy(userEntiteId);
      
      case 'Manager':
      case 'Gestionnaire':
        return new GestionnaireStockStrategy(userEntiteId);
      
      case 'Station':
        return new StationStockStrategy(userEntiteId);
      
      default:
        // Default to Station strategy for unknown roles (read-only access)
        return new StationStockStrategy(userEntiteId);
    }
  }

  /**
   * Get available roles for stock management
   * @returns {Array<string>} Array of available roles
   */
  static getAvailableRoles() {
    return ['Fournisseur', 'Gestionnaire', 'Manager', 'Station'];
  }

  /**
   * Check if a role is valid for stock management
   * @param {string} userRole - The role to validate
   * @returns {boolean} True if role is valid
   */
  static isValidRole(userRole) {
    return this.getAvailableRoles().includes(userRole);
  }

  /**
   * Get role capabilities summary
   * @param {string} userRole - The user's role
   * @returns {Object} Role capabilities summary
   */
  static getRoleCapabilities(userRole) {
    const strategy = this.createStrategy(userRole);
    const permissions = strategy.getPermissions();
    
    return {
      role: userRole,
      canManageStock: permissions.canCreate || permissions.canEdit || permissions.canDelete,
      canViewStock: permissions.canView,
      canExport: permissions.canExport,
      canImport: permissions.canImport,
      canBulkUpdate: permissions.canBulkUpdate,
      canCreateInventory: permissions.canCreateInventory,
      canViewHistory: permissions.canViewHistory,
      canViewWeekly: permissions.canViewWeekly,
      canManageWeekly: permissions.canManageWeekly,
      accessLevel: this.getAccessLevel(userRole)
    };
  }

  /**
   * Get access level for a role
   * @param {string} userRole - The user's role
   * @returns {string} Access level (full, limited, read-only)
   */
  static getAccessLevel(userRole) {
    switch (userRole) {
      case 'Manager':
      case 'Gestionnaire':
        return 'full';
      case 'Fournisseur':
        return 'limited';
      case 'Station':
        return 'read-only';
      default:
        return 'read-only';
    }
  }

  /**
   * Get strategy configuration for debugging/testing
   * @param {string} userRole - The user's role
   * @param {string|null} userEntiteId - The user's entity ID (optional)
   * @returns {Object} Strategy configuration
   */
  static getStrategyConfig(userRole, userEntiteId = null) {
    const strategy = this.createStrategy(userRole, userEntiteId);
    
    return {
      role: userRole,
      entityId: userEntiteId,
      permissions: strategy.getPermissions(),
      uiBehavior: strategy.getUIBehavior(),
      availableFilters: strategy.getAvailableFilters(),
      tableColumns: strategy.getTableColumns(),
      availableActions: strategy.getAvailableActions(),
      quickActions: strategy.getQuickActions(),
      viewModes: strategy.getAvailableViewModes(),
      exportOptions: strategy.getExportOptions(),
      bulkActions: strategy.getBulkActions(),
      dashboardWidgets: strategy.getDashboardWidgets(),
      defaultSort: strategy.getDefaultSort()
    };
  }

  /**
   * Create strategy with validation
   * @param {string} userRole - The user's role
   * @param {string|null} userEntiteId - The user's entity ID (optional)
   * @param {boolean} strict - Whether to throw error for invalid roles
   * @returns {StockRoleStrategy|null} Strategy instance or null if invalid and not strict
   */
  static createStrategyWithValidation(userRole, userEntiteId = null, strict = true) {
    if (!userRole) {
      if (strict) {
        throw new Error('User role is required');
      }
      return null;
    }

    if (strict && !this.isValidRole(userRole)) {
      throw new Error(`Invalid user role: ${userRole}`);
    }

    return this.createStrategy(userRole, userEntiteId);
  }

  /**
   * Get strategy for comparison purposes
   * @param {string} userRole - The user's role
   * @param {string} compareWithRole - Role to compare with
   * @returns {Object} Comparison result
   */
  static compareStrategies(userRole, compareWithRole) {
    const strategy1 = this.createStrategy(userRole);
    const strategy2 = this.createStrategy(compareWithRole);
    
    const permissions1 = strategy1.getPermissions();
    const permissions2 = strategy2.getPermissions();
    
    const comparison = {
      role1: userRole,
      role2: compareWithRole,
      permissionDifferences: {},
      hasMorePermissions: null,
      accessLevelComparison: {
        role1Level: this.getAccessLevel(userRole),
        role2Level: this.getAccessLevel(compareWithRole)
      }
    };
    
    // Compare permissions
    const allPermissionKeys = new Set([
      ...Object.keys(permissions1),
      ...Object.keys(permissions2)
    ]);
    
    let role1MorePermissions = 0;
    let role2MorePermissions = 0;
    
    allPermissionKeys.forEach(key => {
      const perm1 = permissions1[key];
      const perm2 = permissions2[key];
      
      if (perm1 !== perm2) {
        comparison.permissionDifferences[key] = {
          [userRole]: perm1,
          [compareWithRole]: perm2
        };
        
        if (perm1 && !perm2) role1MorePermissions++;
        if (perm2 && !perm1) role2MorePermissions++;
      }
    });
    
    if (role1MorePermissions > role2MorePermissions) {
      comparison.hasMorePermissions = userRole;
    } else if (role2MorePermissions > role1MorePermissions) {
      comparison.hasMorePermissions = compareWithRole;
    } else {
      comparison.hasMorePermissions = 'equal';
    }
    
    return comparison;
  }
}