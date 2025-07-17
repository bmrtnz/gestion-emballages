import { UserRoleStrategy } from './UserRoleStrategy.js';

/**
 * Strategy for Manager and Gestionnaire users
 * Handles data transformation and UI behavior for administrative users
 */
export class ManagerStrategy extends UserRoleStrategy {
  constructor(userRole) {
    super();
    this.userRole = userRole;
  }

  /**
   * Transform articles to tree structure for Manager/Gestionnaire users
   * Shows full article hierarchy with all suppliers
   */
  transformTableData(articles) {
    return articles.map(article => ({
      ...article,
      key: article._id,
      children: article.fournisseurs || []
    }));
  }

  /**
   * Get available filters for Manager/Gestionnaire users
   * Has access to all filters including status and supplier
   */
  getAvailableFilters() {
    return ['search', 'category', 'status', 'supplier'];
  }

  /**
   * Get table columns for Manager/Gestionnaire tree view
   */
  getTableColumns() {
    return [
      {
        key: 'articleFournisseur',
        title: 'Article / Fournisseur',
        width: '25%',
        render: (item, isParent) => {
          if (isParent) {
            return {
              type: 'parent',
              content: item.designation,
              expandable: item.children?.length > 0
            };
          } else {
            return {
              type: 'child',
              content: item.fournisseurId?.nom || 'Fournisseur inconnu',
              indent: true
            };
          }
        }
      },
      {
        key: 'codeReference',
        title: 'Code / Référence',
        width: '20%',
        render: (item, isParent) => {
          return isParent ? item.codeArticle : (item.referenceFournisseur || '-');
        }
      },
      {
        key: 'categorieConditionnement',
        title: 'Catégorie / Conditionnement',
        width: '20%',
        render: (item, isParent) => {
          if (isParent) {
            return item.categorie || 'Non définie';
          } else {
            return this.formatConditionnement(item) || '-';
          }
        }
      },
      {
        key: 'prixConditionnement',
        title: 'Prix Conditionnement',
        width: '15%',
        render: (item, isParent) => {
          if (isParent) {
            const count = item.fournisseurs?.length || 0;
            return count > 0 ? `${count} fournisseur${count > 1 ? 's' : ''}` : 'Aucun';
          } else {
            const price = this.getConditionnementPrice(item);
            return price ? this.formatCurrency(price) : 'N/A';
          }
        }
      },
      {
        key: 'statutPrixUnitaire',
        title: 'Statut / Prix Unitaire',
        width: '15%',
        render: (item, isParent) => {
          if (isParent) {
            return {
              type: 'status',
              isActive: item.isActive
            };
          } else {
            return item.prixUnitaire ? this.formatCurrency(item.prixUnitaire) : 'N/A';
          }
        }
      },
      {
        key: 'actions',
        title: 'Actions',
        width: '5%',
        render: (item, isParent) => ({
          type: 'actions',
          isParent,
          canEdit: true,
          canDelete: true,
          item
        })
      }
    ];
  }

  /**
   * Get UI behavior configuration for Manager/Gestionnaire users
   */
  getUIBehavior() {
    return {
      useTreeView: true,
      showTreeControls: true,
      showExpandButtons: true,
      alwaysExpanded: false,
      allowRowActions: true,
      showStatusColumn: true,
      showSupplierColumn: true,
      enableBulkActions: true,
      enableAdvancedFilters: true
    };
  }

  /**
   * Check if user can perform edit actions
   */
  canEdit() {
    return this.userRole === 'Manager' || this.userRole === 'Gestionnaire';
  }

  /**
   * Check if user can delete items
   */
  canDelete() {
    return this.userRole === 'Manager' || this.userRole === 'Gestionnaire';
  }

  /**
   * Get permissions for Manager/Gestionnaire users
   */
  getPermissions() {
    return {
      ...super.getPermissions(),
      canEdit: this.canEdit(),
      canDelete: this.canDelete(),
      canViewAllSuppliers: true,
      canManageSuppliers: true,
      canViewAllArticles: true,
      canManageArticles: true,
      canViewSupplierDocuments: true,
      canAccessAdvancedFeatures: true,
      canExportData: true,
      canImportData: true
    };
  }

  /**
   * Get action configurations for different item types
   */
  getActionConfig(item, isParent) {
    const baseActions = [];

    if (isParent) {
      // Article actions
      baseActions.push(
        {
          key: 'edit',
          icon: 'PencilSquareIcon',
          title: 'Modifier',
          variant: 'primary',
          action: 'edit-article'
        }
      );

      if (item.isActive) {
        baseActions.push({
          key: 'deactivate',
          icon: 'PauseIcon',
          title: 'Désactiver',
          variant: 'primary',
          action: 'deactivate-article'
        });
      } else {
        baseActions.push({
          key: 'reactivate',
          icon: 'PlayIcon',
          title: 'Réactiver',
          variant: 'primary',
          action: 'reactivate-article'
        });
      }
    } else {
      // Supplier actions
      
      // Add view image action if image exists
      if (item.imageUrl) {
        baseActions.push({
          key: 'viewImage',
          icon: 'EyeIcon',
          title: 'Voir l\'image',
          variant: 'info',
          action: 'view-supplier-image'
        });
      }
      
      baseActions.push(
        {
          key: 'edit',
          icon: 'PencilSquareIcon',
          title: 'Modifier fournisseur',
          variant: 'primary',
          action: 'edit-supplier'
        },
        {
          key: 'delete',
          icon: 'TrashIcon',
          title: 'Supprimer fournisseur',
          variant: 'danger',
          action: 'delete-supplier',
          requiresConfirmation: true
        }
      );
    }

    return baseActions;
  }

  /**
   * Helper method to format conditionnement
   */
  formatConditionnement(supplier) {
    if (!supplier.quantiteParConditionnement || !supplier.uniteConditionnement) {
      return supplier.uniteConditionnement || '';
    }
    
    const quantity = supplier.quantiteParConditionnement;
    const unit = supplier.uniteConditionnement;
    
    // Special case for 'Unité'
    if (unit === 'Unité') {
      return `${quantity} par ${unit}`;
    }
    
    // Handle pluralization of 'unités'
    const unitText = quantity === 1 ? 'unité' : 'unités';
    return `${quantity} ${unitText} par ${unit}`;
  }

  /**
   * Helper method to calculate conditionnement price
   */
  getConditionnementPrice(supplier) {
    if (!supplier.prixUnitaire || !supplier.quantiteParConditionnement) {
      return null;
    }
    return supplier.prixUnitaire * supplier.quantiteParConditionnement;
  }

  /**
   * Helper method to format currency
   */
  formatCurrency(amount) {
    if (!amount && amount !== 0) return null;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}