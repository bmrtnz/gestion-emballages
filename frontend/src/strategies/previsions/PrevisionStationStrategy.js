import { PrevisionRoleStrategy } from './PrevisionRoleStrategy';

/**
 * Strategy for Station role in prevision management
 * Read-only access to all previsions
 */
export class PrevisionStationStrategy extends PrevisionRoleStrategy {
  constructor(userEntiteId) {
    super();
    this.userEntiteId = userEntiteId;
  }

  /**
   * Stations see all previsions without transformation
   */
  transformTableData(previsions) {
    return previsions;
  }

  /**
   * Limited filters for stations
   */
  getAvailableFilters() {
    return ['campagne', 'fournisseurId', 'search'];
  }

  /**
   * Read-only column set for stations
   */
  getTableColumns() {
    return [
      { 
        key: 'campagne', 
        label: 'Campagne', 
        sortable: true,
        width: '20%'
      },
      { 
        key: 'fournisseur', 
        label: 'Fournisseur / Article', 
        sortable: true,
        width: '40%'
      },
      { 
        key: 'site', 
        label: 'Site / Prévision annuelle', 
        sortable: false,
        width: '40%'
      }
      // No actions column for stations - read-only access
    ];
  }

  /**
   * UI behavior for stations - read-only with full visibility
   */
  getUIBehavior() {
    return {
      showCreateButton: false,
      showFilters: true,
      showSearch: true,
      showExport: true,
      showImport: false,
      defaultExpanded: false,
      allowTreeToggle: true,
      showPagination: true,
      itemsPerPageOptions: [10, 25, 50]
    };
  }

  /**
   * Stations have read-only permissions
   */
  canCreate() {
    return false;
  }

  canEdit() {
    return false;
  }

  canDelete() {
    return false;
  }

  canViewAll() {
    return true; // Can view all previsions
  }
}