/**
 * Base class for article role strategies
 * Defines the interface that all role strategies must implement for article management
 */
export class ArticleRoleStrategy {
  /**
   * Transform articles data based on role requirements
   * @param {Array} articles - Raw articles data
   * @returns {Array} - Transformed data for the specific role
   */
  transformTableData(articles) {
    throw new Error('transformTableData must be implemented by subclasses');
  }

  /**
   * Get available filters for this role
   * @returns {Array} - Array of filter names available for this role
   */
  getAvailableFilters() {
    throw new Error('getAvailableFilters must be implemented by subclasses');
  }

  /**
   * Get table columns configuration for this role
   * @returns {Array} - Array of column configurations
   */
  getTableColumns() {
    throw new Error('getTableColumns must be implemented by subclasses');
  }

  /**
   * Get UI behavior configuration for this role
   * @returns {Object} - UI behavior configuration
   */
  getUIBehavior() {
    throw new Error('getUIBehavior must be implemented by subclasses');
  }

  /**
   * Check if user can perform edit actions
   * @returns {Boolean}
   */
  canEdit() {
    return false;
  }

  /**
   * Check if user can delete items
   * @returns {Boolean}
   */
  canDelete() {
    return false;
  }

  /**
   * Get permission configuration for this role
   * @returns {Object} - Permission configuration
   */
  getPermissions() {
    return {
      canEdit: this.canEdit(),
      canDelete: this.canDelete(),
      canViewAllSuppliers: false,
      canManageSuppliers: false,
      canViewSupplierDocuments: false
    };
  }
}