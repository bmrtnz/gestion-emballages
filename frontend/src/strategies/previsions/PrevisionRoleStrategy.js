/**
 * Base class for prevision role strategies
 * Defines the interface that all role strategies must implement for prevision management
 */
export class PrevisionRoleStrategy {
  /**
   * Transform previsions data based on role requirements
   * @param {Array} previsions - Raw previsions data
   * @returns {Array} - Transformed data for the specific role
   */
  transformTableData(previsions) {
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
   * Check if user can create previsions
   * @returns {Boolean}
   */
  canCreate() {
    return false;
  }

  /**
   * Check if user can edit previsions
   * @returns {Boolean}
   */
  canEdit() {
    return false;
  }

  /**
   * Check if user can delete previsions
   * @returns {Boolean}
   */
  canDelete() {
    return false;
  }

  /**
   * Check if user can view all previsions
   * @returns {Boolean}
   */
  canViewAll() {
    return false;
  }

  /**
   * Get permission configuration for this role
   * @returns {Object} - Permission configuration
   */
  getPermissions() {
    return {
      canCreate: this.canCreate(),
      canEdit: this.canEdit(),
      canDelete: this.canDelete(),
      canViewAll: this.canViewAll(),
      canAddArticles: this.canEdit(),
      canEditArticles: this.canEdit(),
      canDeleteArticles: this.canEdit()
    };
  }
}