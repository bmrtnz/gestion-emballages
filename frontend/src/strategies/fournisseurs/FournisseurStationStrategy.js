import { BaseFournisseurManagementStrategy } from './BaseFournisseurManagementStrategy';

/**
 * Station strategy for fournisseur management
 * Limited view for station users - can see suppliers for ordering purposes
 */
export class FournisseurStationStrategy extends BaseFournisseurManagementStrategy {
  /**
   * Transform fournisseurs data for Station users
   * Shows simplified tree view, active suppliers only
   */
  transformTableData(fournisseurs) {
    // Only show active suppliers to stations
    return fournisseurs
      .filter(fournisseur => fournisseur.isActive)
      .map(fournisseur => ({
        ...fournisseur,
        key: fournisseur._id,
        children: (fournisseur.sites || []).filter(site => site.isActive !== false)
      }));
  }

  /**
   * Get available filters for Station users
   * Limited filter access
   */
  getAvailableFilters() {
    return ['search', 'specialisation']; // No status filter
  }

  /**
   * Get table columns for Station tree view
   * Simplified information for ordering purposes
   */
  getTableColumns() {
    return [
      {
        key: 'fournisseurSite',
        title: 'Fournisseur / Site',
        width: '30%',
        render: (item, isParent) => {
          if (isParent) {
            return {
              type: 'parent',
              content: item.nom,
              expandable: item.children?.length > 0
            };
          } else {
            return {
              type: 'child',
              content: item.nom || 'Site sans nom',
              indent: true
            };
          }
        }
      },
      {
        key: 'specialisationAdresse',
        title: 'Spécialisations / Localisation',
        width: '35%',
        render: (item, isParent) => {
          if (isParent) {
            return this.formatSpecialisations(item.specialisations);
          } else {
            // Show city/region only for privacy
            const adresse = item.adresse;
            if (!adresse) return '';
            const parts = [];
            if (adresse.codePostal || adresse.ville) {
              const cityPart = [adresse.codePostal, adresse.ville].filter(Boolean).join(' ');
              if (cityPart) parts.push(cityPart);
            }
            return parts.join(', ') || 'Non spécifiée';
          }
        }
      },
      {
        key: 'contact',
        title: 'Contact',
        width: '25%',
        render: (item, isParent) => {
          if (isParent) {
            return this.formatContact(item);
          } else {
            return this.formatContact(item);
          }
        }
      },
      {
        key: 'info',
        title: 'Info',
        width: '10%',
        render: (item, isParent) => {
          if (isParent) {
            const sitesCount = item.children?.length || 0;
            return sitesCount > 0 ? `${sitesCount} site${sitesCount > 1 ? 's' : ''}` : '';
          } else {
            return ''; // No additional info for sites
          }
        }
      }
      // No actions column for station users
    ];
  }

  /**
   * Get UI behavior configuration for Station users
   */
  getUIBehavior() {
    return {
      ...super.getTreeViewConfig(),
      showCreateButton: false,
      showBulkActions: false,
      showAdvancedFilters: false,
      defaultPageSize: 15,
      enableExport: false,
      showStatusColumn: false,
      allowRowActions: false,
      showSiteManagement: false,
      defaultExpanded: true // Expand for better visibility
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
      canViewAll: false, // Can only see active suppliers
      canViewDetails: true,
      canManageSites: false,
      canCreateSites: false,
      canEditSites: false,
      canDeleteSites: false
    };
  }

  /**
   * Get available actions for a fournisseur or site
   * Station users have no management actions
   */
  getAvailableActions(item, isParent = true) {
    return []; // No actions allowed
  }

  /**
   * Check if current user can perform action on target fournisseur/site
   */
  canPerformAction(action, target, isParent = true) {
    // Station users can only view for ordering purposes
    return action === 'view';
  }
}