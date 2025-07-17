import { UserRoleStrategy } from './UserRoleStrategy.js';

/**
 * Strategy for Station users
 * Handles data transformation and UI behavior for station users with limited permissions
 */
export class StationStrategy extends UserRoleStrategy {
  constructor(userEntiteId) {
    super();
    this.userEntiteId = userEntiteId;
  }

  /**
   * Transform articles to tree structure for Station users
   * Shows article hierarchy but with read-only access
   */
  transformTableData(articles) {
    return articles.map(article => ({
      ...article,
      key: article._id,
      children: article.fournisseurs || []
    }));
  }

  /**
   * Get available filters for Station users
   * Has access to most filters except some administrative ones
   */
  getAvailableFilters() {
    return ['search', 'category', 'status', 'supplier'];
  }

  /**
   * Get table columns for Station tree view
   * Similar to Manager but without action columns
   */
  getTableColumns() {
    return [
      {
        key: 'articleFournisseur',
        title: 'Article / Fournisseur',
        width: '30%',
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
        width: '25%',
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
        width: '12.5%',
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
        width: '12.5%',
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
      }
    ];
  }

  /**
   * Get UI behavior configuration for Station users
   */
  getUIBehavior() {
    return {
      useTreeView: true,
      showTreeControls: true,
      showExpandButtons: true,
      alwaysExpanded: false,
      allowRowActions: true, // Allow view actions like supplier images
      showStatusColumn: true,
      showSupplierColumn: true,
      enableBulkActions: false,
      enableAdvancedFilters: false,
      showViewOnlyActions: true // Can view supplier images/documents
    };
  }

  /**
   * Get permissions for Station users
   */
  getPermissions() {
    return {
      ...super.getPermissions(),
      canEdit: false,
      canDelete: false,
      canViewAllSuppliers: true,
      canManageSuppliers: false,
      canViewAllArticles: true,
      canManageArticles: false,
      canViewSupplierDocuments: true,
      canPlaceOrders: true,
      canViewPrices: true
    };
  }

  /**
   * Get action configurations for Station users
   * Limited to view-only actions
   */
  getActionConfig(item, isParent) {
    const baseActions = [];

    if (!isParent) {
      // Only supplier view actions allowed
      if (item.imageUrl) {
        baseActions.push({
          key: 'viewImage',
          icon: 'EyeIcon',
          title: 'Voir l\'image',
          variant: 'info',
          action: 'view-supplier-image'
        });
      }
    }

    return baseActions;
  }

  /**
   * Check if user can view supplier image/documents
   */
  canViewSupplierImage(supplier) {
    return Boolean(supplier.imageUrl);
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