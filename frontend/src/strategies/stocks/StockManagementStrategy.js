/**
 * @fileoverview Base Strategy for Stock Management
 * Defines the interface for role-based stock management behavior
 */

export class StockManagementStrategy {
  constructor(userRole, userEntiteId = null) {
    this.userRole = userRole;
    this.userEntiteId = userEntiteId;
  }

  /**
   * Transform article data for display based on role
   * @param {Array} articles - Raw article data
   * @returns {Array} Transformed article data
   */
  transformArticleData(articles) {
    return articles;
  }

  /**
   * Get available actions for the current role
   * @returns {Array} Available actions
   */
  getAvailableActions() {
    return [];
  }

  /**
   * Get permissions for stock operations
   * @returns {Object} Permission flags
   */
  getPermissions() {
    return {
      canView: false,
      canEdit: false,
      canAdd: false,
      canDelete: false,
      canExport: false
    };
  }

  /**
   * Get UI behavior configuration
   * @returns {Object} UI behavior settings
   */
  getUIBehavior() {
    return {
      showAddButton: false,
      showBulkActions: false,
      showExportOptions: false,
      readOnly: true
    };
  }

  /**
   * Get navigation configuration
   * @returns {Object} Navigation settings
   */
  getNavigationConfig() {
    return {
      redirectPath: '/dashboard',
      allowAccess: false
    };
  }

  /**
   * Validate stock operation permissions
   * @param {string} operation - The operation to validate
   * @param {Object} context - Operation context
   * @returns {boolean} Whether operation is allowed
   */
  canPerformOperation(operation, context = {}) {
    const permissions = this.getPermissions();
    
    switch (operation) {
      case 'view':
        return permissions.canView;
      case 'edit':
        return permissions.canEdit;
      case 'add':
        return permissions.canAdd;
      case 'delete':
        return permissions.canDelete;
      case 'export':
        return permissions.canExport;
      default:
        return false;
    }
  }

  /**
   * Get role-specific error messages
   * @param {string} errorType - Type of error
   * @returns {string} Error message
   */
  getErrorMessage(errorType) {
    const messages = {
      'access_denied': 'Accès non autorisé pour votre rôle',
      'operation_not_allowed': 'Opération non autorisée',
      'data_not_found': 'Données non trouvées'
    };

    return messages[errorType] || 'Une erreur est survenue';
  }
}