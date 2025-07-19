/**
 * Base class for fournisseur (supplier) management strategies
 * Defines the interface that all supplier role strategies must implement
 */
export class BaseFournisseurManagementStrategy {
  constructor(userRole, userEntiteId = null) {
    this.userRole = userRole;
    this.userEntiteId = userEntiteId;
  }

  /**
   * Transform fournisseurs data based on role requirements
   * @param {Array} fournisseurs - Raw fournisseurs data
   * @returns {Array} - Transformed data for the specific role
   */
  transformTableData(fournisseurs) {
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
      canViewDetails: true,
      canManageSites: false,
      canCreateSites: false,
      canEditSites: false,
      canDeleteSites: false
    };
  }

  /**
   * Get available actions for a specific fournisseur
   * @param {Object} fournisseur - Fournisseur object
   * @param {boolean} isParent - Whether this is a parent row (fournisseur) or child (site)
   * @returns {Array} - Array of available actions
   */
  getAvailableActions(fournisseur, isParent = true) {
    return [];
  }

  /**
   * Check if current user can perform action on target fournisseur/site
   * @param {string} action - Action to check
   * @param {Object} target - Target fournisseur or site
   * @param {boolean} isParent - Whether target is fournisseur (true) or site (false)
   * @returns {boolean} - Whether action is allowed
   */
  canPerformAction(action, target, isParent = true) {
    return false;
  }

  /**
   * Format fournisseur address for display
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
   * @param {Object} fournisseur - Fournisseur object
   * @returns {string} - Formatted contact info
   */
  formatContact(fournisseur) {
    const parts = [];
    if (fournisseur.telephone) parts.push(fournisseur.telephone);
    if (fournisseur.email) parts.push(fournisseur.email);
    return parts.join(' • ');
  }

  /**
   * Format specializations for display
   * @param {Array} specialisations - Array of specializations
   * @returns {string} - Formatted specializations
   */
  formatSpecialisations(specialisations) {
    if (!specialisations || !specialisations.length) return 'Aucune';
    return specialisations.join(', ');
  }

  /**
   * Get tree view behavior configuration
   * @returns {Object} - Tree view configuration
   */
  getTreeViewConfig() {
    return {
      useTreeView: true,
      showTreeControls: true,
      showExpandButtons: true,
      alwaysExpanded: false,
      defaultExpanded: false
    };
  }
}