/**
 * @fileoverview Station Stock Management Strategy
 * Implements stock management behavior for Station role users
 */

import { StockRoleStrategy } from './StockRoleStrategy.js';

export class StationStockStrategy extends StockRoleStrategy {
  constructor(userEntiteId) {
    super(userEntiteId);
    this.userRole = 'Station';
  }

  /**
   * Transform stock data based on role-specific requirements
   * @param {Array} stocks - Raw stock data
   * @returns {Array} Transformed stock data
   */
  transformStockData(stocks) {
    return stocks.map(stock => ({
      ...stock,
      displayName: stock.articleId?.designation || 'Article inconnu',
      categoryBadge: this.getCategoryBadgeConfig(stock.articleId?.categorie),
      isEditable: true,
      canModify: this.canModifyStock(stock)
    }));
  }

  /**
   * Transform article data for station display
   * @param {Array} articles - Raw article data
   * @returns {Array} Transformed article data with station-specific formatting
   */
  transformArticleData(articles) {
    return articles.map(article => ({
      ...article,
      displayName: article.designation,
      categoryBadge: this.getCategoryBadgeConfig(article.categorie),
      isEditable: true,
      showQuantityInput: true
    }));
  }

  /**
   * Get category badge configuration for UI display
   * @param {string} category - Article category
   * @returns {Object} Badge configuration
   */
  getCategoryBadgeConfig(category) {
    const categoryConfig = {
      'Barquette': { color: 'blue', label: 'Barquette' },
      'Cagette': { color: 'green', label: 'Cagette' },
      'Plateau': { color: 'purple', label: 'Plateau' },
      'Film Plastique': { color: 'orange', label: 'Film' },
      'Carton': { color: 'brown', label: 'Carton' },
      'Autre': { color: 'gray', label: 'Autre' }
    };

    return categoryConfig[category] || { color: 'gray', label: category };
  }

  /**
   * Get available actions for station users
   * @returns {Array} Available actions
   */
  getAvailableActions() {
    return [
      {
        id: 'add_article',
        label: 'Ajouter un article',
        icon: 'PlusIcon',
        primary: true
      },
      {
        id: 'save_stock',
        label: 'Sauvegarder',
        icon: 'CheckIcon',
        variant: 'primary'
      },
      {
        id: 'reset_changes',
        label: 'Annuler',
        icon: 'XMarkIcon',
        variant: 'outline'
      }
    ];
  }

  /**
   * Get permissions for station stock operations
   * @returns {Object} Permission flags
   */
  getPermissions() {
    return {
      canView: true,
      canEdit: true,
      canAdd: true,
      canDelete: false, // Stations typically can't delete stock entries
      canExport: false, // Basic stations don't have export permissions
      canViewOwnStockOnly: true,
      canModifyCurrentWeek: true,
      canModifyPastWeeks: true, // Allow with warning
      canAddManualArticles: true
    };
  }

  /**
   * Get UI behavior configuration for stations
   * @returns {Object} UI behavior settings
   */
  getUIBehavior() {
    return {
      showAddButton: true,
      showBulkActions: false,
      showExportOptions: false,
      readOnly: false,
      showWeekSelector: true,
      showCampaignInfo: true,
      showPastWeekWarning: true,
      enableQuantityEditing: true,
      showSaveButton: true,
      showResetButton: true
    };
  }

  /**
   * Get navigation configuration for stations
   * @returns {Object} Navigation settings
   */
  getNavigationConfig() {
    return {
      redirectPath: '/stocks/station',
      allowAccess: true,
      breadcrumbs: [
        { label: 'Tableau de bord', path: '/dashboard' },
        { label: 'Gestion des Stocks', path: '/stocks/station' }
      ]
    };
  }

  /**
   * Validate stock operation permissions with station-specific rules
   * @param {string} operation - The operation to validate
   * @param {Object} context - Operation context
   * @returns {boolean} Whether operation is allowed
   */
  canPerformOperation(operation, context = {}) {
    const basePermissions = super.canPerformOperation(operation, context);
    
    // Station-specific validation
    switch (operation) {
      case 'edit_stock':
        // Stations can only edit their own stock
        return basePermissions && (
          !context.stationId || 
          context.stationId === this.userEntiteId
        );
      
      case 'add_article':
        // Stations can add articles to their own stock
        return basePermissions && context.selectedWeek;
      
      case 'save_stock':
        // Can save if there are changes and a week is selected
        return basePermissions && 
               context.hasChanges && 
               context.selectedWeek;
      
      case 'modify_past_week':
        // Allow with warning for past weeks
        return basePermissions;
      
      default:
        return basePermissions;
    }
  }

  /**
   * Get role-specific error messages for stations
   * @param {string} errorType - Type of error
   * @returns {string} Error message
   */
  getErrorMessage(errorType) {
    const stationMessages = {
      'access_denied': 'Seuls les utilisateurs de type Station peuvent accéder à cette page',
      'week_not_selected': 'Veuillez sélectionner une semaine pour continuer',
      'save_failed': 'Erreur lors de la sauvegarde des stocks',
      'load_failed': 'Erreur lors du chargement des stocks',
      'article_search_failed': 'Erreur lors de la recherche d\'articles',
      'past_week_warning': 'Attention : Vous modifiez les stocks d\'une semaine passée'
    };

    return stationMessages[errorType] || super.getErrorMessage(errorType);
  }

  /**
   * Get validation rules for stock operations
   * @returns {Object} Validation rules
   */
  getValidationRules() {
    return {
      stockQuantity: {
        min: 0,
        max: 999999,
        required: false,
        type: 'number'
      },
      weekSelection: {
        required: true,
        min: 1,
        max: 52
      },
      campaign: {
        required: true,
        pattern: /^\d{2}-\d{2}$/
      }
    };
  }

  /**
   * Get notification messages for different operations
   * @param {string} operation - Operation type
   * @param {Object} context - Operation context
   * @returns {Object} Notification configuration
   */
  getNotificationConfig(operation, context = {}) {
    const configs = {
      'stock_saved': {
        type: 'success',
        title: 'Stock sauvegardé',
        message: `Stock de la semaine ${context.week} sauvegardé avec succès`
      },
      'article_added': {
        type: 'success',
        title: 'Article ajouté',
        message: `Article "${context.articleName}" ajouté à la liste des stocks`
      },
      'changes_reset': {
        type: 'info',
        title: 'Modifications annulées',
        message: 'Toutes les modifications ont été annulées'
      },
      'past_week_warning': {
        type: 'warning',
        title: 'Attention',
        message: 'Vous modifiez les stocks d\'une semaine passée. Assurez-vous que ces modifications sont justifiées.'
      }
    };

    return configs[operation] || {
      type: 'info',
      title: 'Information',
      message: 'Opération effectuée'
    };
  }

  /**
   * Get available filters for the station role
   * @returns {Object} Available filters configuration
   */
  getAvailableFilters() {
    return {
      week: {
        enabled: true,
        required: true,
        label: 'Semaine'
      },
      campaign: {
        enabled: true,
        required: true,
        label: 'Campagne'
      },
      category: {
        enabled: true,
        required: false,
        label: 'Catégorie'
      },
      search: {
        enabled: true,
        required: false,
        label: 'Recherche'
      }
    };
  }

  /**
   * Get table columns configuration for the station role
   * @returns {Array} Table columns configuration
   */
  getTableColumns() {
    return [
      {
        key: 'designation',
        label: 'Désignation',
        sortable: true,
        width: '30%'
      },
      {
        key: 'categorie',
        label: 'Catégorie',
        sortable: true,
        width: '20%'
      },
      {
        key: 'quantiteStock',
        label: 'Quantité en Stock',
        sortable: true,
        width: '20%',
        type: 'number'
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        width: '30%'
      }
    ];
  }

  /**
   * Get available quick actions for station stock page
   * @returns {Array} Quick actions configuration
   */
  getQuickActions() {
    return [
      {
        id: 'add_article',
        label: 'Ajouter un article',
        icon: 'PlusIcon',
        action: 'openAddArticlePanel',
        primary: true
      },
      {
        id: 'save_all',
        label: 'Sauvegarder tout',
        icon: 'CheckIcon',
        action: 'saveAllStock',
        variant: 'primary'
      }
    ];
  }

  /**
   * Get view modes available for station role
   * @returns {Array} Available view modes
   */
  getAvailableViewModes() {
    return [
      {
        id: 'table',
        label: 'Tableau',
        icon: 'TableCellsIcon',
        default: true
      },
      {
        id: 'cards',
        label: 'Cartes',
        icon: 'Squares2X2Icon'
      }
    ];
  }

  /**
   * Get export options available for station role
   * @returns {Array} Export options
   */
  getExportOptions() {
    // Stations typically don't have export permissions
    return [];
  }

  /**
   * Check if user can access specific stock data
   * @param {Object} stock - Stock item
   * @returns {boolean} Access permission
   */
  canAccessStock(stock) {
    // Stations can only access their own stock
    return stock.stationId === this.userEntiteId;
  }

  /**
   * Check if user can modify specific stock data
   * @param {Object} stock - Stock item
   * @returns {boolean} Modify permission
   */
  canModifyStock(stock) {
    // Stations can modify their own stock
    return this.canAccessStock(stock);
  }

  /**
   * Get bulk actions available for station role
   * @returns {Array} Bulk actions
   */
  getBulkActions() {
    return [
      {
        id: 'update_quantities',
        label: 'Mettre à jour les quantités',
        icon: 'PencilSquareIcon',
        action: 'bulkUpdateQuantities'
      },
      {
        id: 'reset_selected',
        label: 'Remettre à zéro',
        icon: 'ArrowPathIcon',
        action: 'bulkResetQuantities',
        variant: 'outline'
      }
    ];
  }

  /**
   * Get dashboard widgets configuration for station role
   * @returns {Array} Dashboard widgets
   */
  getDashboardWidgets() {
    return [
      {
        id: 'total_articles',
        title: 'Articles en stock',
        type: 'counter',
        icon: 'CubeIcon'
      },
      {
        id: 'low_stock_alerts',
        title: 'Alertes stock faible',
        type: 'counter',
        icon: 'ExclamationTriangleIcon',
        variant: 'warning'
      },
      {
        id: 'last_update',
        title: 'Dernière mise à jour',
        type: 'date',
        icon: 'ClockIcon'
      }
    ];
  }
}