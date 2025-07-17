import { UserRoleStrategy } from './UserRoleStrategy.js';

/**
 * Strategy for Fournisseur (Supplier) users
 * Handles data transformation and UI behavior specific to suppliers
 */
export class FournisseurStrategy extends UserRoleStrategy {
  constructor(userEntiteId) {
    super();
    this.userEntiteId = userEntiteId;
  }

  /**
   * Transform articles to flattened table data for Fournisseur users
   * Only shows articles linked to this supplier with their specific data
   */
  transformTableData(articles) {
    const flattenedData = [];
    
    articles.forEach(article => {
      if (article.fournisseurs && article.fournisseurs.length > 0) {
        article.fournisseurs.forEach(supplier => {
          flattenedData.push({
            _id: `${article._id}-${supplier._id}`,
            articleId: article._id,
            supplierId: supplier._id,
            codeArticle: article.codeArticle,
            designation: article.designation,
            categorie: article.categorie,
            referenceFournisseur: supplier.referenceFournisseur,
            uniteConditionnement: supplier.uniteConditionnement,
            quantiteParConditionnement: supplier.quantiteParConditionnement,
            prixUnitaire: supplier.prixUnitaire,
            imageUrl: supplier.imageUrl, // Include image URL for viewing
            supplierName: supplier.fournisseurId?.nom || 'Fournisseur',
            fournisseurId: supplier.fournisseurId, // Include full supplier object for modal
            isActive: article.isActive,
            // Store article data for modal display
            parentData: {
              _id: article._id,
              codeArticle: article.codeArticle,
              designation: article.designation,
              categorie: article.categorie
            }
          });
        });
      }
    });
    
    return flattenedData;
  }

  /**
   * Get available filters for Fournisseur users
   * Excludes status and supplier filters for privacy
   */
  getAvailableFilters() {
    return ['search', 'category'];
  }

  /**
   * Get table columns for Fournisseur simple table view
   */
  getTableColumns() {
    return [
      {
        key: 'article',
        title: 'Article',
        width: '25%',
        render: (item) => ({
          primary: item.codeArticle,
          secondary: item.designation
        })
      },
      {
        key: 'reference',
        title: 'Référence',
        width: '25%',
        render: (item) => ({
          primary: item.categorie || 'Non définie',
          secondary: item.referenceFournisseur || '-'
        })
      },
      {
        key: 'conditionnement',
        title: 'Conditionnement',
        width: '20%',
        render: (item) => this.formatConditionnement(item) || '-'
      },
      {
        key: 'prixConditionnement',
        title: 'Prix conditionnement',
        width: '15%',
        render: (item) => {
          const price = this.getConditionnementPrice(item);
          return price ? this.formatCurrency(price) : 'N/A';
        }
      },
      {
        key: 'prixUnitaire',
        title: 'Prix unitaire',
        width: '15%',
        render: (item) => item.prixUnitaire ? this.formatCurrency(item.prixUnitaire) : 'N/A'
      }
    ];
  }

  /**
   * Get UI behavior configuration for Fournisseur users
   */
  getUIBehavior() {
    return {
      useTreeView: false,
      showTreeControls: false,
      showExpandButtons: false,
      alwaysExpanded: true,
      allowRowActions: true, // Allow view actions like supplier images
      showStatusColumn: false,
      showSupplierColumn: false
    };
  }

  /**
   * Get permissions for Fournisseur users
   */
  getPermissions() {
    return {
      ...super.getPermissions(),
      canViewOwnData: true,
      canViewOtherSuppliers: false,
      canManageSuppliers: false,
      canViewSupplierDocuments: true
    };
  }

  /**
   * Get dynamic column title with supplier name
   */
  getDynamicColumnTitle(baseTitle, supplierName) {
    if (baseTitle === 'Référence' && supplierName) {
      return `${baseTitle} ${supplierName}`;
    }
    return baseTitle;
  }

  /**
   * Get action configurations for Fournisseur users
   * Limited to view-only actions for supplier images
   */
  getActionConfig(item, isParent) {
    const baseActions = [];

    // For supplier items (in flattened view), add view image action if image exists
    if (item.imageUrl) {
      baseActions.push({
        key: 'viewImage',
        icon: 'EyeIcon',
        title: 'Voir l\'image',
        variant: 'info',
        action: 'view-supplier-image'
      });
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