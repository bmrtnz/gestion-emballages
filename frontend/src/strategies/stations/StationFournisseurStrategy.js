import { BaseStationManagementStrategy } from './BaseStationManagementStrategy';

/**
 * Fournisseur strategy for station management
 * Limited view for supplier users - can see stations for business purposes
 */
export class StationFournisseurStrategy extends BaseStationManagementStrategy {
  /**
   * Transform stations data for Fournisseur users
   * Shows basic information about active stations only
   */
  transformTableData(stations) {
    // Only show active stations to suppliers
    return stations
      .filter(station => station.isActive)
      .map(station => ({
        ...station,
        key: station._id
      }));
  }

  /**
   * Get available filters for Fournisseur users
   * Very limited filter access
   */
  getAvailableFilters() {
    return ['search']; // Only search, no status filter
  }

  /**
   * Get table columns for Fournisseur view
   * Minimal information for business purposes
   */
  getTableColumns() {
    return [
      {
        key: 'nom',
        title: 'Nom de la station',
        width: '35%',
        sortable: true,
        render: (station) => station.nom
      },
      {
        key: 'adresse',
        title: 'Localisation',
        width: '40%',
        render: (station) => {
          // Show city/region only for privacy
          const adresse = station.adresse;
          if (!adresse) return '';
          const parts = [];
          if (adresse.codePostal || adresse.ville) {
            const cityPart = [adresse.codePostal, adresse.ville].filter(Boolean).join(' ');
            if (cityPart) parts.push(cityPart);
          }
          if (adresse.pays) parts.push(adresse.pays);
          return parts.join(', ') || 'Non spécifiée';
        }
      },
      {
        key: 'contact',
        title: 'Contact',
        width: '25%',
        render: (station) => {
          // Show only general contact, not full details
          return station.email || station.telephone || 'Non disponible';
        }
      }
    ];
  }

  /**
   * Get UI behavior configuration for Fournisseur users
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
   * Get permissions for Fournisseur users
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
      canViewAll: false, // Can only see active stations
      canViewDetails: false // Limited details only
    };
  }

  /**
   * Get available actions for a station
   * Fournisseur users have no actions on stations
   */
  getAvailableActions(station) {
    return []; // No actions allowed
  }

  /**
   * Check if current user can perform action on target station
   */
  canPerformAction(action, station) {
    // Fournisseur users have very limited access
    return false;
  }
}