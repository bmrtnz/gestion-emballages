/**
 * Base class for station management strategies
 * Defines the interface that all station role strategies must implement
 */
export class BaseStationManagementStrategy {
  constructor(userRole, userEntiteId = null) {
    this.userRole = userRole;
    this.userEntiteId = userEntiteId;
  }

  /**
   * Transform stations data based on role requirements
   * @param {Array} stations - Raw stations data
   * @returns {Array} - Transformed data for the specific role
   */
  transformTableData(stations) {
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
   * Get permission configuration for this role
   * @returns {Object} - Permission configuration
   */
  getPermissions() {
    return {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canActivate: false,
      canDeactivate: false,
      canExport: false,
      canViewAll: false,
      canViewDetails: true
    };
  }

  /**
   * Get available actions for a specific station
   * @param {Object} station - Station object
   * @returns {Array} - Array of available actions
   */
  getAvailableActions(station) {
    return [];
  }

  /**
   * Check if current user can perform action on target station
   * @param {string} action - Action to check
   * @param {Object} station - Target station
   * @returns {boolean} - Whether action is allowed
   */
  canPerformAction(action, station) {
    return false;
  }

  /**
   * Format station address for display
   * @param {Object} adresse - Address object
   * @returns {Object} - Formatted address with line1 and line2
   */
  formatAddress(adresse) {
    if (!adresse) return { line1: '', line2: '' };
    return {
      line1: adresse.rue || '',
      line2: `${adresse.codePostal || ''} ${adresse.ville || ''}${adresse.pays ? ', ' + adresse.pays : ''}`
    };
  }

  /**
   * Format contact information for display
   * @param {Object} station - Station object
   * @returns {string} - Formatted contact info
   */
  formatContact(station) {
    const parts = [];
    if (station.telephone) parts.push(station.telephone);
    if (station.email) parts.push(station.email);
    return parts.join(' • ');
  }
}