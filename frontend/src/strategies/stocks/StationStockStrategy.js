/**
 * @fileoverview Station stock strategy implementation
 * @module strategies/stocks/StationStockStrategy
 */

import { StockRoleStrategy } from './StockRoleStrategy.js';

/**
 * Stock strategy for station role
 * Implements station-specific stock management behavior with read-only access
 */
export class StationStockStrategy extends StockRoleStrategy {
  constructor(userEntiteId = null) {
    super(userEntiteId);
    this.role = 'Station';
  }

  /**
   * Transform stock data for station view
   * Stations have read-only access to relevant stock information
   */
  transformStockData(stocks) {
    if (!stocks) return [];

    return stocks.map(stock => ({
      ...stock,
      canEdit: false,
      canDelete: false,
      showWeeklyView: true,
      showHistory: true,
      showSupplierInfo: true,
      showContactInfo: true
    }));
  }

  /**
   * Get available filters for stations
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
        enabled: false // Stations see current stock only
      },
      supplier: {
        enabled: true,
        placeholder: 'Filtrer par fournisseur'
      },
      site: {
        enabled: false // Stations see all relevant sites
      },
      campaign: {
        enabled: false
      }
    };
  }

  /**
   * Get table columns for station view
   */
  getTableColumns() {
    return [
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
        label: 'Stock disponible',
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
        key: 'contact',
        label: 'Contact',
        sortable: false,
        width: '120px',
        visible: true,
        type: 'contact'
      }
      // No actions column for stations - read-only access
    ];
  }

  /**
   * Get UI behavior for stations
   */
  getUIBehavior() {
    return {
      showBulkActions: false,
      showQuickStats: true,
      showFilters: true,
      showExport: true,
      showViewModeToggle: false,
      showAdvancedFilters: false,
      defaultPageSize: 25,
      enableVirtualScrolling: false,
      showImages: false,
      compactView: true,
      stickyHeader: true,
      autoRefresh: true,
      autoRefreshInterval: 120000, // 2 minutes
      showSupplierColumn: true,
      showSiteColumn: true,
      readOnlyMode: true
    };
  }

  /**
   * Get permissions for station stock operations
   */
  getPermissions() {
    return {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canExport: true,
      canImport: false,
      canBulkUpdate: false,
      canCreateInventory: false,
      canViewHistory: true,
      canViewWeekly: true,
      canManageWeekly: false,
      canViewStatistics: true,
      canViewTrends: true,
      canViewAllSuppliers: true,
      canViewAllSites: true,
      canManageAlerts: false,
      canViewReports: false,
      canContactSupplier: true,
      canRequestStock: true,
      maxBulkSelection: 0,
      requireConfirmation: {
        delete: false,
        bulkUpdate: false,
        inventory: false
      }
    };
  }

  /**
   * Get available actions for stock items (minimal for stations)
   */
  getAvailableActions() {
    return [
      {
        key: 'view',
        label: 'Voir détails',
        icon: 'EyeIcon',
        variant: 'outline',
        permission: 'canView'
      },
      {
        key: 'contact',
        label: 'Contacter fournisseur',
        icon: 'PhoneIcon',
        variant: 'outline',
        permission: 'canContactSupplier'
      },
      {
        key: 'request',
        label: 'Demander stock',
        icon: 'PlusIcon',
        variant: 'primary',
        permission: 'canRequestStock'
      }
    ];
  }

  /**
   * Get quick actions for station stock page
   */
  getQuickActions() {
    return [
      {
        key: 'export',
        label: 'Exporter',
        icon: 'ArrowDownTrayIcon',
        variant: 'outline',
        permission: 'canExport'
      },
      {
        key: 'request',
        label: 'Demander stock',
        icon: 'PlusIcon',
        variant: 'primary',
        permission: 'canRequestStock'
      },
      {
        key: 'contact',
        label: 'Contacts fournisseurs',
        icon: 'PhoneIcon',
        variant: 'outline',
        permission: 'canContactSupplier'
      }
    ];
  }

  /**
   * Get available view modes for stations
   */
  getAvailableViewModes() {
    return [
      {
        key: 'list',
        label: 'Stock disponible',
        icon: 'CircleStackIcon',
        permission: 'canView'
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
   * Get export options for stations
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
      }
    ];
  }

  /**
   * Check if station can access specific stock data
   */
  canAccessStock(stock) {
    // Stations can view stock information for ordering purposes
    return true;
  }

  /**
   * Check if station can modify specific stock data
   */
  canModifyStock(stock) {
    // Stations cannot modify stock data
    return false;
  }

  /**
   * Get bulk actions for stations (none)
   */
  getBulkActions() {
    return [];
  }

  /**
   * Get dashboard widgets for stations
   */
  getDashboardWidgets() {
    return [
      {
        key: 'availableStock',
        title: 'Stock disponible',
        type: 'stats',
        permission: 'canView',
        size: 'large',
        priority: 1
      },
      {
        key: 'supplierContacts',
        title: 'Contacts fournisseurs',
        type: 'contacts',
        permission: 'canContactSupplier',
        size: 'medium',
        priority: 2
      },
      {
        key: 'stockAlerts',
        title: 'Alertes de stock',
        type: 'alerts',
        permission: 'canView',
        size: 'medium',
        priority: 3
      },
      {
        key: 'recentRequests',
        title: 'Demandes récentes',
        type: 'timeline',
        permission: 'canRequestStock',
        size: 'medium',
        priority: 4
      }
    ];
  }

  /**
   * Get status filter options for stations
   */
  getStatusFilterOptions() {
    return [
      { value: '', label: 'Tous les statuts' },
      { value: 'in_stock', label: 'Disponible' },
      { value: 'low_stock', label: 'Stock limité' },
      { value: 'out_of_stock', label: 'Non disponible' }
    ];
  }

  /**
   * Get default sort for stations
   */
  getDefaultSort() {
    return {
      field: 'articleId.designation',
      order: 'asc'
    };
  }
}