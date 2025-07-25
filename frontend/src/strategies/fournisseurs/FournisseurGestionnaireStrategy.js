import { BaseFournisseurManagementStrategy } from './BaseFournisseurManagementStrategy';

/**
 * Gestionnaire strategy for fournisseur management
 * Similar to Manager but with some operational restrictions
 */
export class FournisseurGestionnaireStrategy extends BaseFournisseurManagementStrategy {
  /**
   * Transform fournisseurs data for Gestionnaire users
   * Shows hierarchical tree view with sites
   */
  transformTableData(fournisseurs) {
    return fournisseurs.map(fournisseur => ({
      ...fournisseur,
      key: fournisseur._id,
      children: fournisseur.sites || []
    }));
  }

  /**
   * Get available filters for Gestionnaire users
   * Has access to all filters
   */
  getAvailableFilters() {
    return ['search', 'status', 'specialisation'];
  }

  /**
   * Get table columns for Gestionnaire tree view
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
        width: '25%',
        render: (item, isParent) => {
          if (isParent) {
            return this.formatSpecialisations(item.specialisations);
          } else {
            return this.formatContact(item);
          }
        }
      },
      {
        key: 'statutInfo',
        title: 'Statut / Info',
        width: '15%',
        render: (item, isParent) => {
          if (isParent) {
            return {
              type: 'status',
              isActive: item.isActive
            };
          } else {
            const sitesCount = item.sites?.length || 0;
            return sitesCount > 0 ? `${sitesCount} site${sitesCount > 1 ? 's' : ''}` : '';
          }
        }
      },
      {
        key: 'actions',
        title: '',
        width: '10%',
        render: (item, isParent) => ({
          type: 'actions',
          actions: this.getAvailableActions(item, isParent)
        })
      }
    ];
  }

  /**
   * Get UI behavior configuration for Gestionnaire users
   */
  getUIBehavior() {
    return {
      ...super.getTreeViewConfig(),
      showCreateButton: true,
      showBulkActions: false, // Gestionnaire doesn't have bulk actions
      showAdvancedFilters: true,
      defaultPageSize: 25,
      enableExport: true,
      showStatusColumn: true,
      allowRowActions: true,
      showSiteManagement: true
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
      canViewAll: true,
      canManageSites: true,
      canCreateSites: true,
      canEditSites: true,
      canDeleteSites: true
    };
  }

  /**
   * Get available actions for a fournisseur or site
   */
  getAvailableActions(item, isParent = true) {
    const actions = [];

    if (isParent) {
      // Fournisseur actions
      actions.push(
        {
          key: 'edit',
          icon: 'PencilSquareIcon',
          title: 'Modifier',
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

      if (item.isActive) {
        actions.push({
          key: 'deactivate',
          icon: 'PauseIcon',
          title: 'Désactiver',
          variant: 'warning',
          action: 'deactivate-fournisseur',
          requiresConfirmation: true
        });
      } else {
        actions.push({
          key: 'reactivate',
          icon: 'PlayIcon',
          title: 'Réactiver',
          variant: 'success',
          action: 'reactivate-fournisseur'
        });
      }
    } else {
      // Site actions
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
    const permissions = this.getPermissions();
    
    switch (action) {
      case 'edit-fournisseur':
      case 'edit':
        return permissions.canEdit;
      case 'deactivate-fournisseur':
        return permissions.canDeactivate && target.isActive;
      case 'reactivate-fournisseur':
        return permissions.canActivate && !target.isActive;
      case 'add-site':
        return permissions.canCreateSites;
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