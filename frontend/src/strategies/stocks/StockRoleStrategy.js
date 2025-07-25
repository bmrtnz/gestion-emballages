/**
 * @fileoverview Base strategy class for stock role-based behavior
 * @module strategies/stocks/StockRoleStrategy
 */

/**
 * Base strategy interface for stock management role-based behavior
 * Defines the contract that all concrete stock role strategies must implement
 */
export class StockRoleStrategy {
  constructor(userEntiteId = null) {
    this.userEntiteId = userEntiteId;
  }

  /**
   * Transform stock data based on role-specific requirements
   * @param {Array} stocks - Raw stock data
   * @returns {Array} Transformed stock data
   */
  transformStockData(stocks) {
    throw new Error('transformStockData method must be implemented by concrete strategy');
  }

  /**
   * Get available filters for the role
   * @returns {Object} Available filters configuration
   */
  getAvailableFilters() {
    throw new Error('getAvailableFilters method must be implemented by concrete strategy');
  }

  /**
   * Get table columns configuration for the role
   * @returns {Array} Table columns configuration
   */
  getTableColumns() {
    throw new Error('getTableColumns method must be implemented by concrete strategy');
  }

  /**
   * Get UI behavior configuration for the role
   * @returns {Object} UI behavior settings
   */
  getUIBehavior() {
    throw new Error('getUIBehavior method must be implemented by concrete strategy');
  }

  /**
   * Get permissions for stock operations
   * @returns {Object} Permissions configuration
   */
  getPermissions() {
    throw new Error('getPermissions method must be implemented by concrete strategy');
  }

  /**
   * Get available actions for stock items
   * @returns {Array} Available actions
   */
  getAvailableActions() {
    throw new Error('getAvailableActions method must be implemented by concrete strategy');
  }

  /**
   * Get available quick actions for the stock page
   * @returns {Array} Quick actions configuration
   */
  getQuickActions() {
    throw new Error('getQuickActions method must be implemented by concrete strategy');
  }

  /**
   * Get view modes available for the role
   * @returns {Array} Available view modes
   */
  getAvailableViewModes() {
    throw new Error('getAvailableViewModes method must be implemented by concrete strategy');
  }

  /**
   * Get export options available for the role
   * @returns {Array} Export options
   */
  getExportOptions() {
    throw new Error('getExportOptions method must be implemented by concrete strategy');
  }

  /**
   * Check if user can access specific stock data
   * @param {Object} stock - Stock item
   * @returns {boolean} Access permission
   */
  canAccessStock(stock) {
    throw new Error('canAccessStock method must be implemented by concrete strategy');
  }

  /**
   * Check if user can modify specific stock data
   * @param {Object} stock - Stock item
   * @returns {boolean} Modify permission
   */
  canModifyStock(stock) {
    throw new Error('canModifyStock method must be implemented by concrete strategy');
  }

  /**
   * Get status filter options for the role
   * @returns {Array} Status filter options
   */
  getStatusFilterOptions() {
    return [
      { value: '', label: 'Tous les statuts' },
      { value: 'in_stock', label: 'En stock' },
      { value: 'low_stock', label: 'Stock faible' },
      { value: 'out_of_stock', label: 'Rupture' }
    ];
  }

  /**
   * Get default sort configuration
   * @returns {Object} Sort configuration
   */
  getDefaultSort() {
    return {
      field: 'articleId.designation',
      order: 'asc'
    };
  }

  /**
   * Get bulk actions available for the role
   * @returns {Array} Bulk actions
   */
  getBulkActions() {
    return [];
  }

  /**
   * Get dashboard widgets configuration
   * @returns {Array} Dashboard widgets
   */
  getDashboardWidgets() {
    return [];
  }
}