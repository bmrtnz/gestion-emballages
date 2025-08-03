// frontend/src/strategies/listeAchat/ListeAchatStationStrategy.js
import { ListeAchatBaseStrategy } from './ListeAchatBaseStrategy.js';

/**
 * Stratégie pour les utilisateurs de type Station dans la gestion des listes d'achat
 * Implémente les comportements spécifiques aux stations
 */
export class ListeAchatStationStrategy extends ListeAchatBaseStrategy {
  constructor(userEntiteId) {
    super('Station', userEntiteId);
  }
  
  /**
   * Les stations peuvent créer des listes d'achat
   */
  canCreateList() {
    return true;
  }
  
  /**
   * Les stations peuvent ajouter des articles à leur liste
   */
  canAddItems() {
    return true;
  }
  
  /**
   * Les stations peuvent supprimer des articles de leur liste
   */
  canRemoveItems() {
    return true;
  }
  
  /**
   * Les stations peuvent valider leur liste pour créer des commandes
   */
  canValidateList() {
    return true;
  }
  
  /**
   * Les stations voient tous les articles actifs
   */
  getAvailableArticles(allArticles) {
    return allArticles.filter(article => article.isActive !== false);
  }
  
  /**
   * Les stations voient tous les fournisseurs actifs pour un article
   */
  getAvailableSuppliers(article) {
    if (!article?.fournisseurs) return [];
    
    return article.fournisseurs.filter(f => 
      f.fournisseurId?._id && 
      f.fournisseurId?.nom &&
      f.fournisseurId?.isActive !== false
    );
  }
  
  /**
   * Validations pour l'ajout d'items par une station
   */
  validateItemAddition(itemData) {
    const errors = [];
    
    if (!itemData.articleId) {
      errors.push('Un article doit être sélectionné');
    }
    
    if (!itemData.fournisseurId) {
      errors.push('Un fournisseur doit être sélectionné');
    }
    
    if (!itemData.quantite || itemData.quantite <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }
    
    if (itemData.quantite && itemData.quantite > 9999) {
      errors.push('La quantité ne peut pas dépasser 9999');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Configuration de l'interface pour les stations
   */
  getUIBehavior() {
    return {
      showPricing: true,
      showSupplierInfo: true,
      allowQuantityEdit: true,
      showValidateButton: true,
      showRemoveButton: true,
      enableArticleSearch: true,
      enableSupplierSelection: true,
      maxQuantityPerItem: 9999,
      defaultQuantity: 1,
      theme: {
        primaryColor: 'primary-600',
        successColor: 'success-600',
        errorColor: 'error-500'
      },
      messages: {
        emptyList: 'Votre liste est vide',
        emptyListSubtext: 'Sélectionnez des articles à droite pour les ajouter',
        addToCartButton: 'Ajouter à la liste',
        validateButton: 'Valider la Liste et Commander',
        removeButton: 'Supprimer',
        searchPlaceholder: 'Tapez pour rechercher un article...',
        quantityLabel: 'Nombre de conditionnements à commander:',
        totalLabel: 'Total calculé:'
      }
    };
  }
  
  /**
   * Transforme les données de la liste pour l'affichage station
   */
  transformListData(listeData) {
    if (!listeData) return null;
    
    return {
      ...listeData,
      displayTitle: 'Ma Liste d\'Achat',
      displaySubtitle: 'Gérer votre liste d\'achat et créez vos commandes fournisseurs.',
      showTotalAmount: true,
      showItemDetails: true,
      allowModification: true
    };
  }
  
  /**
   * Actions disponibles pour un item dans une station
   */
  getItemActions(item) {
    return [
      {
        id: 'remove',
        label: 'Supprimer',
        icon: 'TrashIcon',
        variant: 'ghost',
        colorClass: 'text-error-500 hover:text-error-600 hover:bg-error-50',
        permission: 'canRemoveItems'
      }
    ];
  }
  
  /**
   * Formatage spécifique des données d'item pour les stations
   */
  formatItemForDisplay(item, articleDetails, supplierDetails) {
    if (!articleDetails || !supplierDetails) return null;
    
    const conditionnement = supplierDetails.uniteConditionnement || 
                           articleDetails.conditionnement || 'Unité';
    const quantiteParConditionnement = supplierDetails.quantiteParConditionnement || 
                                      articleDetails.quantiteParConditionnement || 1;
    const prixUnitaire = supplierDetails.prixUnitaire || 0;
    
    return {
      id: item._id,
      article: {
        code: articleDetails.codeArticle,
        designation: articleDetails.designation,
        categorie: articleDetails.categorie
      },
      supplier: {
        nom: supplierDetails.fournisseurId?.nom || 'Fournisseur inconnu',
        id: supplierDetails.fournisseurId?._id
      },
      quantities: {
        commanded: item.quantite,
        conditioning: conditionnement,
        perConditioning: quantiteParConditionnement,
        totalUnits: item.quantite * quantiteParConditionnement
      },
      pricing: {
        unitPrice: prixUnitaire,
        conditioningPrice: quantiteParConditionnement * prixUnitaire,
        totalPrice: item.quantite * quantiteParConditionnement * prixUnitaire
      },
      metadata: {
        dateSouhaiteeLivraison: item.dateSouhaiteeLivraison,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    };
  }
  
  /**
   * Détermine si un article peut être ajouté par cette station
   */
  canAddArticle(article) {
    // Les stations peuvent ajouter tout article actif qui a des fournisseurs
    return article.isActive !== false && 
           article.fournisseurs && 
           article.fournisseurs.length > 0;
  }
  
  /**
   * Détermine si un fournisseur peut être sélectionné par cette station
   */
  canSelectSupplier(supplier) {
    // Les stations peuvent sélectionner tout fournisseur actif avec prix
    return supplier.fournisseurId?.isActive !== false && 
           supplier.prixUnitaire !== undefined && 
           supplier.prixUnitaire > 0;
  }
}