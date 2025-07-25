/**
 * @fileoverview Manager stock strategy implementation
 * @module strategies/stocks/GestionnaireStockStrategy
 */

import { StockRoleStrategy } from './StockRoleStrategy.js';

/**
 * Stock strategy for manager (Gestionnaire) role
 * Implements manager-specific stock management behavior with full access
 */
export class GestionnaireStockStrategy extends StockRoleStrategy {
  constructor(userEntiteId = null) {
    super(userEntiteId);
    this.role = 'Gestionnaire';
  }

  /**
   * Transform stock data for manager view
   * Managers see all stock data with full permissions
   */
  transformStockData(stocks) {
    if (!stocks) return [];

    return stocks.map(stock => ({
      ...stock,
      canEdit: true,
      canDelete: true,
      showWeeklyView: true,
      showHistory: true,
      showSupplierInfo: true,
      showSiteInfo: true
    }));
  }

  /**
   * Get available filters for managers
   */
  getAvailableFilters() {
    return {
      search: {
        enabled: true,
        placeholder: 'Rechercher par code, désignation, fournisseur...',
        fields: ['articleId.codeArticle', 'articleId.designation', 'articleId.category', 'fournisseurId.nom']
      },
      status: {
        enabled: true,
        options: this.getStatusFilterOptions()
      },
      category: {
        enabled: true,
        placeholder: 'Filtrer par catégorie'
      },
      dateRange: {
        enabled: true,
        label: 'Période'
      },
      supplier: {
        enabled: true,
        placeholder: 'Filtrer par fournisseur'
      },
      site: {
        enabled: true,
        placeholder: 'Filtrer par site'
      },
      campaign: {
        enabled: true,
        placeholder: 'Filtrer par campagne'
      }
    };
  }

  /**
   * Get table columns for manager view
   */
  getTableColumns() {
    return [
      {
        key: 'selection',
        label: '',
        sortable: false,
        width: '50px',
        visible: true,
        type: 'checkbox'
      },
      {
        key: 'supplier',
        label: 'Fournisseur',
        sortable: true,
        width: '150px',
        visible: true,
        field: 'fournisseurId.nom'
      },
      {
        key: 'site',
        label: 'Site',
        sortable: true,
        width: '120px',
        visible: true,
        field: 'siteId.nomSite'
      },
      {
        key: 'articleCode',
        label: 'Code Article',
        sortable: true,
        width: '120px',
        visible: true,
        field: 'articleId.codeArticle'
      },
      {
        key: 'articleName',
        label: 'Désignation',
        sortable: true,
        width: 'auto',
        visible: true,
        field: 'articleId.designation'
      },
      {
        key: 'category',
        label: 'Catégorie',
        sortable: true,
        width: '150px',
        visible: true,
        field: 'articleId.category'
      },
      {
        key: 'quantity',
        label: 'Stock',
        sortable: true,
        width: '120px',
        visible: true,
        field: 'quantite',
        type: 'number'
      },
      {
        key: 'status',
        label: 'Statut',
        sortable: false,
        width: '120px',
        visible: true,
        type: 'badge'
      },
      {
        key: 'lastUpdate',
        label: 'Dernière MAJ',
        sortable: true,
        width: '150px',
        visible: true,
        field: 'derniereModificationLe',
        type: 'date'
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        width: '150px',
        visible: true,
        type: 'actions'
      }
    ];
  }

  /**
   * Get UI behavior for managers
   */
  getUIBehavior() {
    return {
      showBulkActions: true,
      showQuickStats: true,
      showFilters: true,
      showExport: true,
      showViewModeToggle: true,
      showAdvancedFilters: true,
      defaultPageSize: 50,
      enableVirtualScrolling: true,
      showImages: false,
      compactView: false,
      stickyHeader: true,
      autoRefresh: true,
      autoRefreshInterval: 60000, // 1 minute
      showSupplierColumn: true,
      showSiteColumn: true
    };
  }

  /**
   * Get permissions for manager stock operations
   */
  getPermissions() {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canExport: true,
      canImport: true,
      canBulkUpdate: true,
      canCreateInventory: true,
      canViewHistory: true,
      canViewWeekly: true,
      canManageWeekly: true,
      canViewStatistics: true,
      canViewTrends: true,
      canViewAllSuppliers: true,
      canViewAllSites: true,
      canManageAlerts: true,
      canViewReports: true,
      maxBulkSelection: 100,
      requireConfirmation: {
        delete: true,
        bulkUpdate: false,
        inventory: false
      }
    };
  }

  /**
   * Get available actions for stock items
   */
  getAvailableActions() {
    return [
      {
        key: 'edit',
        label: 'Modifier',
        icon: 'PencilSquareIcon',
        variant: 'outline',
        permission: 'canEdit'
      },
      {
        key: 'weekly',
        label: 'Vue hebdomadaire',
        icon: 'CalendarDaysIcon',
        variant: 'outline',
        permission: 'canViewWeekly'
      },
      {
        key: 'history',
        label: 'Historique',
        icon: 'ClockIcon',
        variant: 'outline',
        permission: 'canViewHistory'
      },
      {
        key: 'delete',
        label: 'Supprimer',
        icon: 'TrashIcon',
        variant: 'danger',
        permission: 'canDelete'
      }
    ];
  }

  /**
   * Get quick actions for manager stock page
   */
  getQuickActions() {
    return [
      {
        key: 'inventory',
        label: 'Nouvel inventaire',
        icon: 'ClipboardDocumentListIcon',
        variant: 'primary',
        permission: 'canCreateInventory'
      },
      {
        key: 'export',
        label: 'Exporter tout',
        icon: 'ArrowDownTrayIcon',
        variant: 'outline',
        permission: 'canExport'
      },
      {
        key: 'import',
        label: 'Importer',
        icon: 'ArrowUpTrayIcon',
        variant: 'outline',
        permission: 'canImport'
      },
      {
        key: 'reports',
        label: 'Rapports',
        icon: 'DocumentChartBarIcon',
        variant: 'outline',
        permission: 'canViewReports'
      },
      {
        key: 'alerts',
        label: 'Alertes',
        icon: 'ExclamationTriangleIcon',
        variant: 'outline',
        permission: 'canManageAlerts'
      }
    ];
  }

  /**
   * Get available view modes for managers
   */
  getAvailableViewModes() {
    return [
      {
        key: 'list',
        label: 'Stock',
        icon: 'CircleStackIcon',
        permission: 'canView'
      },
      {
        key: 'weekly',
        label: 'Hebdomadaire',
        icon: 'CalendarDaysIcon',
        permission: 'canViewWeekly'
      },
      {
        key: 'trends',
        label: 'Tendances',
        icon: 'ChartBarIcon',
        permission: 'canViewTrends'
      },
      {
        key: 'dashboard',
        label: 'Tableau de bord',
        icon: 'Squares2X2Icon',
        permission: 'canViewStatistics'
      },
      {
        key: 'alerts',
        label: 'Alertes',
        icon: 'ExclamationTriangleIcon',
        permission: 'canManageAlerts'
      }
    ];
  }

  /**
   * Get export options for managers
   */
  getExportOptions() {
    return [
      {
        key: 'xlsx',
        label: 'Excel (.xlsx)',
        icon: 'DocumentIcon',
        permission: 'canExport'
      },
      {
        key: 'csv',
        label: 'CSV (.csv)',
        icon: 'DocumentTextIcon',
        permission: 'canExport'
      },
      {
        key: 'pdf',
        label: 'PDF (.pdf)',
        icon: 'DocumentIcon',
        permission: 'canExport'
      },
      {
        key: 'report',
        label: 'Rapport détaillé',
        icon: 'DocumentChartBarIcon',
        permission: 'canViewReports'
      }
    ];
  }

  /**
   * Check if manager can access specific stock data
   */
  canAccessStock(stock) {
    // Managers can access all stock data
    return true;
  }

  /**
   * Check if manager can modify specific stock data
   */
  canModifyStock(stock) {
    // Managers can modify all stock data
    return true;
  }

  /**
   * Get bulk actions for managers
   */
  getBulkActions() {
    return [
      {
        key: 'updateQuantity',
        label: 'Mettre à jour quantité',
        icon: 'PencilSquareIcon',
        permission: 'canBulkUpdate',
        requiresInput: true,
        inputType: 'number',
        inputLabel: 'Nouvelle quantité'
      },
      {
        key: 'transferStock',
        label: 'Transférer stock',
        icon: 'ArrowsRightLeftIcon',
        permission: 'canEdit',
        requiresInput: true,
        inputType: 'select',
        inputLabel: 'Site de destination'
      },
      {
        key: 'export',
        label: 'Exporter sélection',
        icon: 'ArrowDownTrayIcon',
        permission: 'canExport'
      },
      {
        key: 'delete',
        label: 'Supprimer',
        icon: 'TrashIcon',
        permission: 'canDelete',
        variant: 'danger',
        requiresConfirmation: true
      },
      {
        key: 'markLowStock',
        label: 'Marquer stock faible',
        icon: 'ExclamationTriangleIcon',
        permission: 'canEdit',
        variant: 'warning'
      },
      {
        key: 'createAlert',
        label: 'Créer alerte',
        icon: 'BellIcon',
        permission: 'canManageAlerts'
      }
    ];
  }

  /**
   * Get dashboard widgets for managers
   */
  getDashboardWidgets() {
    return [
      {
        key: 'globalStockSummary',
        title: 'Vue d\'ensemble globale',
        type: 'stats',
        permission: 'canView',
        size: 'extra-large',
        priority: 1
      },
      {
        key: 'supplierComparison',
        title: 'Comparaison fournisseurs',
        type: 'chart',
        permission: 'canViewAllSuppliers',
        size: 'large',
        priority: 2
      },
      {
        key: 'criticalAlerts',
        title: 'Alertes critiques',
        type: 'alerts',
        permission: 'canManageAlerts',
        size: 'medium',
        priority: 3
      },
      {
        key: 'stockMovements',
        title: 'Mouvements de stock',
        type: 'timeline',
        permission: 'canViewHistory',
        size: 'large',
        priority: 4
      },
      {
        key: 'performanceMetrics',
        title: 'Métriques de performance',
        type: 'metrics',
        permission: 'canViewStatistics',
        size: 'medium',
        priority: 5
      },
      {
        key: 'stockTrends',
        title: 'Tendances par site',
        type: 'chart',
        permission: 'canViewTrends',
        size: 'large',
        priority: 6
      }
    ];
  }

  /**
   * Get default sort for managers
   */
  getDefaultSort() {
    return {
      field: 'fournisseurId.nom',
      order: 'asc'
    };
  }
}