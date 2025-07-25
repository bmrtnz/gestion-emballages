import { PrevisionRoleStrategy } from './PrevisionRoleStrategy';

/**
 * Strategy for Manager and Gestionnaire roles in prevision management
 * Full access to all prevision functionality
 */
export class PrevisionManagerStrategy extends PrevisionRoleStrategy {
  constructor(userRole) {
    super();
    this.userRole = userRole;
  }

  /**
   * Managers see all previsions without transformation
   */
  transformTableData(previsions) {
    return previsions;
  }

  /**
   * All filters are available for managers
   */
  getAvailableFilters() {
    return ['campagne', 'fournisseurId', 'status', 'search'];
  }

  /**
   * Full column set for managers
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
        key: 'fournisseur', 
        label: 'Fournisseur / Article', 
        sortable: true,
        width: '40%'
      },
      { 
        key: 'site', 
        label: 'Site / Prévision annuelle', 
        sortable: false,
        width: '30%'
      },
      { 
        key: 'actions', 
        label: '', 
        sortable: false,
        width: '15%',
        align: 'right'
      }
    ];
  }

  /**
   * UI behavior for managers - full functionality
   */
  getUIBehavior() {
    return {
      showCreateButton: true,
      showFilters: true,
      showSearch: true,
      showExport: true,
      showImport: true,
      defaultExpanded: false,
      allowTreeToggle: true,
      showPagination: true,
      itemsPerPageOptions: [10, 25, 50, 100]
    };
  }

  /**
   * Managers have full permissions
   */
  canCreate() {
    return true;
  }

  canEdit() {
    return true;
  }

  canDelete() {
    return true;
  }

  canViewAll() {
    return true;
  }
}