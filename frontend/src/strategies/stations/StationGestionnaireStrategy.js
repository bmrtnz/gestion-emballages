import { BaseStationManagementStrategy } from './BaseStationManagementStrategy';

/**
 * Gestionnaire strategy for station management
 * Similar to Manager but with some operational restrictions
 */
export class StationGestionnaireStrategy extends BaseStationManagementStrategy {
  /**
   * Transform stations data for Gestionnaire users
   * Shows all stations with full information
   */
  transformTableData(stations) {
    return stations.map(station => ({
      ...station,
      key: station._id
    }));
  }

  /**
   * Get available filters for Gestionnaire users
   * Has access to all filters
   */
  getAvailableFilters() {
    return ['search', 'status'];
  }

  /**
   * Get table columns for Gestionnaire view
   */
  getTableColumns() {
    return [
      {
        key: 'nom',
        title: 'Nom de la station',
        width: '25%',
        sortable: true,
        render: (station) => station.nom
      },
      {
        key: 'adresse',
        title: 'Adresse',
        width: '30%',
        render: (station) => {
          const formatted = this.formatAddress(station.adresse);
          return `${formatted.line1}\n${formatted.line2}`.trim();
        }
      },
      {
        key: 'contact',
        title: 'Contact',
        width: '25%',
        render: (station) => this.formatContact(station)
      },
      {
        key: 'statut',
        title: 'Statut',
        width: '10%',
        render: (station) => ({
          type: 'status',
          isActive: station.isActive
        })
      },
      {
        key: 'actions',
        title: 'Actions',
        width: '10%',
        render: (station) => ({
          type: 'actions',
          actions: this.getAvailableActions(station)
        })
      }
    ];
  }

  /**
   * Get UI behavior configuration for Gestionnaire users
   */
  getUIBehavior() {
    return {
      showCreateButton: true,
      showBulkActions: false, // Gestionnaire doesn't have bulk actions
      showAdvancedFilters: true,
      defaultPageSize: 25,
      enableExport: true,
      showStatusColumn: true,
      allowRowActions: true
    };
  }

  /**
   * Get permissions for Gestionnaire users
   */
  getPermissions() {
    return {
      ...super.getPermissions(),
      canCreate: true,
      canEdit: true,
      canDelete: false, // Soft delete only
      canActivate: true,
      canDeactivate: true,
      canExport: true,
      canViewAll: true
    };
  }

  /**
   * Get available actions for a station
   */
  getAvailableActions(station) {
    const actions = [
      {
        key: 'edit',
        icon: 'PencilSquareIcon',
        title: 'Modifier',
        variant: 'primary',
        action: 'edit'
      }
    ];

    if (station.isActive) {
      actions.push({
        key: 'deactivate',
        icon: 'PauseIcon',
        title: 'Désactiver',
        variant: 'warning',
        action: 'deactivate',
        requiresConfirmation: true
      });
    } else {
      actions.push({
        key: 'reactivate',
        icon: 'PlayIcon',
        title: 'Réactiver',
        variant: 'success',
        action: 'reactivate'
      });
    }

    return actions;
  }

  /**
   * Check if current user can perform action on target station
   */
  canPerformAction(action, station) {
    const permissions = this.getPermissions();
    
    switch (action) {
      case 'edit':
        return permissions.canEdit;
      case 'deactivate':
        return permissions.canDeactivate && station.isActive;
      case 'reactivate':
        return permissions.canActivate && !station.isActive;
      case 'view':
        return permissions.canViewDetails;
      default:
        return false;
    }
  }
}