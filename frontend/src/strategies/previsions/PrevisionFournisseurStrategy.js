import { PrevisionRoleStrategy } from './PrevisionRoleStrategy';

/**
 * Strategy for Fournisseur role in prevision management
 * Read-only access to their own previsions
 */
export class PrevisionFournisseurStrategy extends PrevisionRoleStrategy {
  constructor(userEntiteId) {
    super();
    this.userEntiteId = userEntiteId;
  }

  /**
   * Filter to show only previsions for the user's supplier
   */
  transformTableData(previsions) {
    // Filter previsions for this supplier
    return previsions.filter(prevision => 
      prevision.fournisseurId?._id === this.userEntiteId ||
      prevision.fournisseurId === this.userEntiteId
    );
  }

  /**
   * Limited filters for suppliers
   */
  getAvailableFilters() {
    return ['campagne', 'search'];
  }

  /**
   * Read-only column set for suppliers
   */
  getTableColumns() {
    return [
      { 
        key: 'campagne', 
        label: 'Campagne', 
        sortable: true,
        width: '15%'
      },
      { 
        key: 'article', 
        label: 'Article', 
        sortable: false,
        width: '45%'
      },
      { 
        key: 'site', 
        label: 'Site / Prévision annuelle', 
        sortable: false,
        width: '30%'
      },
      { 
        key: 'actions', 
        label: 'Actions', 
        sortable: false,
        width: '10%',
        align: 'right'
      }
    ];
  }

  /**
   * UI behavior for suppliers - read-only
   */
  getUIBehavior() {
    return {
      showCreateButton: false,
      showFilters: true,
      showSearch: true,
      showExport: true,
      showImport: false,
      defaultExpanded: true, // Expand by default for better visibility
      allowTreeToggle: true,
      showPagination: true,
      itemsPerPageOptions: [10, 25, 50]
    };
  }

  /**
   * Suppliers have read-only permissions
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
    return false; // Can only view their own
  }
}