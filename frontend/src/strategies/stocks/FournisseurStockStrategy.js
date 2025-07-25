/**
 * @fileoverview Supplier stock strategy implementation
 * @module strategies/stocks/FournisseurStockStrategy
 */

import { StockRoleStrategy } from './StockRoleStrategy.js';

/**
 * Stock strategy for supplier (Fournisseur) role
 * Implements supplier-specific stock management behavior
 */
export class FournisseurStockStrategy extends StockRoleStrategy {
  constructor(userEntiteId = null) {
    super(userEntiteId);
    this.role = 'Fournisseur';
  }

  /**
   * Transform stock data for supplier view
   * Suppliers only see stocks for their own sites
   */
  transformStockData(stocks) {
    if (!stocks) return [];

    // Suppliers see all their stock data without filtering
    // The backend already filters by supplier ID
    return stocks.map(stock => ({
      ...stock,
      canEdit: true,
      canDelete: false, // Suppliers typically can't delete stock records
      showWeeklyView: true,
      showHistory: true
    }));
  }

  /**
   * Get available filters for suppliers
   */
  getAvailableFilters() {
    return {
      search: {
        enabled: true,
        placeholder: 'Rechercher par code article ou désignation...',
        fields: ['articleId.codeArticle', 'articleId.designation', 'articleId.category']
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
        enabled: false // Suppliers only see their own data
      },
      site: {
        enabled: false // Site selection is handled at page level
      }
    };
  }

  /**
   * Get table columns for supplier view
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
        width: '120px',
        visible: true,
        type: 'actions'
      }
    ];
  }

  /**
   * Get UI behavior for suppliers
   */
  getUIBehavior() {
    return {
      showBulkActions: true,
      showQuickStats: true,
      showFilters: true,
      showExport: true,
      showViewModeToggle: true,
      defaultPageSize: 25,
      enableVirtualScrolling: false,
      showImages: false,
      compactView: false,
      stickyHeader: true,
      autoRefresh: true,
      autoRefreshInterval: 30000 // 30 seconds
    };
  }

  /**
   * Get permissions for supplier stock operations
   */
  getPermissions() {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canExport: true,
      canImport: true,
      canBulkUpdate: true,
      canCreateInventory: true,
      canViewHistory: true,
      canViewWeekly: true,
      canManageWeekly: true,
      canViewStatistics: true,
      canViewTrends: true,
      maxBulkSelection: 50,
      requireConfirmation: {
        delete: true,
        bulkUpdate: true,
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
      }
    ];
  }

  /**
   * Get quick actions for supplier stock page
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
        label: 'Exporter',
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
      }
    ];
  }

  /**
   * Get available view modes for suppliers
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
      }
    ];
  }

  /**
   * Get export options for suppliers
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
      }
    ];
  }

  /**
   * Check if supplier can access specific stock data
   */
  canAccessStock(stock) {
    // Suppliers can access all their own stock data
    // Backend filtering ensures they only see their data
    return true;
  }

  /**
   * Check if supplier can modify specific stock data
   */
  canModifyStock(stock) {
    // Suppliers can modify their own stock data
    return true;
  }

  /**
   * Get bulk actions for suppliers
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
        key: 'export',
        label: 'Exporter sélection',
        icon: 'ArrowDownTrayIcon',
        permission: 'canExport'
      },
      {
        key: 'markLowStock',
        label: 'Marquer stock faible',
        icon: 'ExclamationTriangleIcon',
        permission: 'canEdit',
        variant: 'warning'
      }
    ];
  }

  /**
   * Get dashboard widgets for suppliers
   */
  getDashboardWidgets() {
    return [
      {
        key: 'stockSummary',
        title: 'Résumé des stocks',
        type: 'stats',
        permission: 'canView',
        size: 'large',
        priority: 1
      },
      {
        key: 'lowStockAlerts',
        title: 'Alertes stock faible',
        type: 'alerts',
        permission: 'canView',
        size: 'medium',
        priority: 2
      },
      {
        key: 'recentUpdates',
        title: 'Mises à jour récentes',
        type: 'timeline',
        permission: 'canViewHistory',
        size: 'medium',
        priority: 3
      },
      {
        key: 'stockTrends',
        title: 'Tendances',
        type: 'chart',
        permission: 'canViewTrends',
        size: 'large',
        priority: 4
      }
    ];
  }

  /**
   * Get default sort for suppliers
   */
  getDefaultSort() {
    return {
      field: 'articleId.designation',
      order: 'asc'
    };
  }
}