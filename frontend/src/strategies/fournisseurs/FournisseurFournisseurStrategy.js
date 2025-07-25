import { BaseFournisseurManagementStrategy } from './BaseFournisseurManagementStrategy';

/**
 * Fournisseur strategy for fournisseur management
 * Self-management view - can only see and manage own supplier data
 */
export class FournisseurFournisseurStrategy extends BaseFournisseurManagementStrategy {
  /**
   * Transform fournisseurs data for Fournisseur users
   * Shows only own supplier data with sites
   */
  transformTableData(fournisseurs) {
    // Only show own supplier data
    const ownFournisseur = fournisseurs.find(f => f._id === this.userEntiteId);
    
    if (!ownFournisseur) return [];
    
    return [{
      ...ownFournisseur,
      key: ownFournisseur._id,
      children: ownFournisseur.sites || []
    }];
  }

  /**
   * Get available filters for Fournisseur users
   * Very limited filters for own data
   */
  getAvailableFilters() {
    return ['search']; // Only search within own data
  }

  /**
   * Get table columns for Fournisseur self-management view
   * Full details for own data management
   */
  getTableColumns() {
    return [
      {
        key: 'fournisseurSite',
        title: 'Fournisseur / Site',
        width: '25%',
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
        key: 'siretAdresse',
        title: 'SIRET / Adresse',
        width: '25%',
        render: (item, isParent) => {
          if (isParent) {
            return item.siret;
          } else {
            const formatted = this.formatAddress(item.adresse);
            return `${formatted.line1}\n${formatted.line2}`.trim();
          }
        }
      },
      {
        key: 'specialisationContact',
        title: 'Spécialisations / Contact',
        width: '50%',
        render: (item, isParent) => {
          if (isParent) {
            return this.formatSpecialisations(item.specialisations);
          } else {
            return this.formatContact(item);
          }
        }
      }
      // No actions column for fournisseur self-view
    ];
  }

  /**
   * Get UI behavior configuration for Fournisseur users
   */
  getUIBehavior() {
    return {
      ...super.getTreeViewConfig(),
      showCreateButton: false, // Cannot create new suppliers
      showBulkActions: false,
      showAdvancedFilters: false,
      defaultPageSize: 10,
      enableExport: false,
      showStatusColumn: false,
      allowRowActions: false,
      showSiteManagement: false,
      alwaysExpanded: true, // Always show sites for own management
      defaultExpanded: true
    };
  }

  /**
   * Get permissions for Fournisseur users
   */
  getPermissions() {
    return {
      ...super.getPermissions(),
      canCreate: false, // Cannot create new suppliers
      canEdit: false, // Cannot edit through this interface
      canDelete: false,
      canActivate: false,
      canDeactivate: false,
      canExport: false,
      canViewAll: false, // Only own data
      canViewDetails: true,
      canManageSites: false, // Cannot manage sites through this interface
      canCreateSites: false, // Cannot add sites through this interface
      canEditSites: false, // Cannot edit sites through this interface
      canDeleteSites: false // Cannot delete sites through this interface
    };
  }

  /**
   * Get available actions for own fournisseur or site
   */
  getAvailableActions(item, isParent = true) {
    const actions = [];

    if (isParent) {
      // Own fournisseur actions
      actions.push(
        {
          key: 'edit',
          icon: 'PencilSquareIcon',
          title: 'Modifier mes informations',
          variant: 'primary',
          action: 'edit-fournisseur'
        },
        {
          key: 'addSite',
          icon: 'PlusIcon',
          title: 'Ajouter un site',
          variant: 'success',
          action: 'add-site'
        }
      );
    } else {
      // Own site actions
      actions.push(
        {
          key: 'editSite',
          icon: 'PencilSquareIcon',
          title: 'Modifier le site',
          variant: 'primary',
          action: 'edit-site'
        },
        {
          key: 'deleteSite',
          icon: 'TrashIcon',
          title: 'Supprimer le site',
          variant: 'danger',
          action: 'delete-site',
          requiresConfirmation: true
        }
      );
    }

    return actions;
  }

  /**
   * Check if current user can perform action on target fournisseur/site
   */
  canPerformAction(action, target, isParent = true) {
    // Only allow actions on own data
    if (isParent && target._id !== this.userEntiteId) {
      return false;
    }
    
    const permissions = this.getPermissions();
    
    switch (action) {
      case 'edit-fournisseur':
      case 'edit':
        return permissions.canEdit && target._id === this.userEntiteId;
      case 'add-site':
        return permissions.canCreateSites && target._id === this.userEntiteId;
      case 'edit-site':
        return permissions.canEditSites;
      case 'delete-site':
        return permissions.canDeleteSites;
      case 'view':
        return permissions.canViewDetails;
      default:
        return false;
    }
  }
}