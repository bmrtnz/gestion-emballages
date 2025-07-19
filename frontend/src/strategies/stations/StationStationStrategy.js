import { BaseStationManagementStrategy } from './BaseStationManagementStrategy';

/**
 * Station strategy for station management
 * Limited view for station users - can only see other stations, no management actions
 */
export class StationStationStrategy extends BaseStationManagementStrategy {
  /**
   * Transform stations data for Station users
   * Shows basic information about other stations
   */
  transformTableData(stations) {
    // Filter out own station for privacy/clarity
    return stations
      .filter(station => station._id !== this.userEntiteId)
      .map(station => ({
        ...station,
        key: station._id
      }));
  }

  /**
   * Get available filters for Station users
   * Limited filter access
   */
  getAvailableFilters() {
    return ['search']; // No status filter for stations
  }

  /**
   * Get table columns for Station view
   * Limited information columns
   */
  getTableColumns() {
    return [
      {
        key: 'nom',
        title: 'Nom de la station',
        width: '30%',
        sortable: true,
        render: (station) => station.nom
      },
      {
        key: 'adresse',
        title: 'Adresse',
        width: '40%',
        render: (station) => {
          const formatted = this.formatAddress(station.adresse);
          return `${formatted.line1}\n${formatted.line2}`.trim();
        }
      },
      {
        key: 'contact',
        title: 'Contact',
        width: '30%',
        render: (station) => this.formatContact(station)
      }
      // No status or actions columns for station users
    ];
  }

  /**
   * Get UI behavior configuration for Station users
   */
  getUIBehavior() {
    return {
      showCreateButton: false,
      showBulkActions: false,
      showAdvancedFilters: false,
      defaultPageSize: 10,
      enableExport: false,
      showStatusColumn: false,
      allowRowActions: false
    };
  }

  /**
   * Get permissions for Station users
   */
  getPermissions() {
    return {
      ...super.getPermissions(),
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canActivate: false,
      canDeactivate: false,
      canExport: false,
      canViewAll: false, // Can only see other active stations
      canViewDetails: true
    };
  }

  /**
   * Get available actions for a station
   * Station users have no actions on other stations
   */
  getAvailableActions(station) {
    return []; // No actions allowed
  }

  /**
   * Check if current user can perform action on target station
   */
  canPerformAction(action, station) {
    // Station users can only view, no other actions
    return action === 'view';
  }
}