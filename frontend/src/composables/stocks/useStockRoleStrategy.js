/**
 * @fileoverview Role strategy composable for stock management
 * @module composables/stocks/useStockRoleStrategy
 */

import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { StockRoleStrategyFactory } from '../../strategies/stocks/StockRoleStrategyFactory';

/**
 * Composable for managing stock role-based strategies
 * Implements the Strategy Pattern as described in DESIGN.md
 */
export function useStockRoleStrategy() {
  const authStore = useAuthStore();
  
  // Strategy instance
  const strategy = ref(null);
  const isStrategyLoaded = ref(false);

  // Create strategy based on current user
  const createStrategy = () => {
    try {
      strategy.value = StockRoleStrategyFactory.createStrategy(
        authStore.userRole,
        authStore.user?.entiteId
      );
      isStrategyLoaded.value = true;
    } catch (error) {
      console.error('Error creating stock strategy:', error);
      // Fallback to Station strategy (read-only)
      strategy.value = StockRoleStrategyFactory.createStrategy('Station');
      isStrategyLoaded.value = true;
    }
  };

  // Initialize strategy
  if (authStore.userRole) {
    createStrategy();
  }

  // Watch for role changes
  watch(
    () => authStore.userRole,
    (newRole) => {
      if (newRole) {
        createStrategy();
      }
    },
    { immediate: true }
  );

  // Computed properties based on strategy
  const permissions = computed(() => {
    return strategy.value?.getPermissions() || {};
  });

  const uiBehavior = computed(() => {
    return strategy.value?.getUIBehavior() || {};
  });

  const availableFilters = computed(() => {
    return strategy.value?.getAvailableFilters() || {};
  });

  const tableColumns = computed(() => {
    return strategy.value?.getTableColumns() || [];
  });

  const availableActions = computed(() => {
    return strategy.value?.getAvailableActions() || [];
  });

  const quickActions = computed(() => {
    return strategy.value?.getQuickActions() || [];
  });

  const viewModes = computed(() => {
    return strategy.value?.getAvailableViewModes() || [];
  });

  const exportOptions = computed(() => {
    return strategy.value?.getExportOptions() || [];
  });

  const bulkActions = computed(() => {
    return strategy.value?.getBulkActions() || [];
  });

  const dashboardWidgets = computed(() => {
    return strategy.value?.getDashboardWidgets() || [];
  });

  const defaultSort = computed(() => {
    return strategy.value?.getDefaultSort() || { field: 'id', order: 'asc' };
  });

  const statusFilterOptions = computed(() => {
    return strategy.value?.getStatusFilterOptions() || [];
  });

  // Permission checking methods
  const hasPermission = (permission) => {
    return permissions.value[permission] === true;
  };

  const canAccessStock = (stock) => {
    return strategy.value?.canAccessStock(stock) || false;
  };

  const canModifyStock = (stock) => {
    return strategy.value?.canModifyStock(stock) || false;
  };

  // Data transformation method
  const transformStockData = (stocks) => {
    if (!strategy.value || !stocks) return [];
    return strategy.value.transformStockData(stocks);
  };

  // Filter checking methods
  const isFilterAvailable = (filterKey) => {
    return availableFilters.value[filterKey]?.enabled === true;
  };

  const getFilterConfig = (filterKey) => {
    return availableFilters.value[filterKey] || null;
  };

  // Action filtering methods
  const getAvailableActionsForStock = (stock) => {
    if (!strategy.value) return [];
    
    return availableActions.value.filter(action => {
      // Check if user has permission for this action
      if (action.permission && !hasPermission(action.permission)) {
        return false;
      }
      
      // Check stock-specific permissions
      if (action.key === 'edit' || action.key === 'delete') {
        return canModifyStock(stock);
      }
      
      return canAccessStock(stock);
    });
  };

  const getAvailableQuickActions = () => {
    return quickActions.value.filter(action => {
      return !action.permission || hasPermission(action.permission);
    });
  };

  const getAvailableBulkActions = () => {
    return bulkActions.value.filter(action => {
      return !action.permission || hasPermission(action.permission);
    });
  };

  // Column filtering methods
  const getVisibleColumns = () => {
    return tableColumns.value.filter(column => column.visible !== false);
  };

  const getColumnByKey = (key) => {
    return tableColumns.value.find(column => column.key === key);
  };

  // View mode methods
  const getAvailableViewModes = () => {
    return viewModes.value.filter(mode => {
      return !mode.permission || hasPermission(mode.permission);
    });
  };

  const isViewModeAvailable = (modeKey) => {
    const mode = viewModes.value.find(m => m.key === modeKey);
    return mode && (!mode.permission || hasPermission(mode.permission));
  };

  // Export methods
  const getAvailableExportOptions = () => {
    return exportOptions.value.filter(option => {
      return !option.permission || hasPermission(option.permission);
    });
  };

  // Dashboard methods
  const getAvailableDashboardWidgets = () => {
    return dashboardWidgets.value
      .filter(widget => !widget.permission || hasPermission(widget.permission))
      .sort((a, b) => (a.priority || 99) - (b.priority || 99));
  };

  // Role information methods
  const getCurrentRole = () => {
    return authStore.userRole;
  };

  const getAccessLevel = () => {
    return StockRoleStrategyFactory.getAccessLevel(authStore.userRole);
  };

  const getRoleCapabilities = () => {
    return StockRoleStrategyFactory.getRoleCapabilities(authStore.userRole);
  };

  // Utility methods
  const getMaxBulkSelection = () => {
    return permissions.value.maxBulkSelection || 0;
  };

  const requiresConfirmation = (action) => {
    const confirmationRules = permissions.value.requireConfirmation || {};
    return confirmationRules[action] === true;
  };

  // Strategy comparison (for debugging/admin purposes)
  const compareWithRole = (otherRole) => {
    return StockRoleStrategyFactory.compareStrategies(authStore.userRole, otherRole);
  };

  // Get full strategy config (for debugging)
  const getStrategyConfig = () => {
    if (!isStrategyLoaded.value) return null;
    
    return StockRoleStrategyFactory.getStrategyConfig(
      authStore.userRole,
      authStore.user?.entiteId
    );
  };

  return {
    // Strategy state
    strategy,
    isStrategyLoaded,
    
    // Computed properties
    permissions,
    uiBehavior,
    availableFilters,
    tableColumns,
    availableActions,
    quickActions,
    viewModes,
    exportOptions,
    bulkActions,
    dashboardWidgets,
    defaultSort,
    statusFilterOptions,
    
    // Permission methods
    hasPermission,
    canAccessStock,
    canModifyStock,
    
    // Data transformation
    transformStockData,
    
    // Filter methods
    isFilterAvailable,
    getFilterConfig,
    
    // Action methods
    getAvailableActionsForStock,
    getAvailableQuickActions,
    getAvailableBulkActions,
    
    // Column methods
    getVisibleColumns,
    getColumnByKey,
    
    // View mode methods
    getAvailableViewModes,
    isViewModeAvailable,
    
    // Export methods
    getAvailableExportOptions,
    
    // Dashboard methods
    getAvailableDashboardWidgets,
    
    // Role information
    getCurrentRole,
    getAccessLevel,
    getRoleCapabilities,
    
    // Utility methods
    getMaxBulkSelection,
    requiresConfirmation,
    compareWithRole,
    getStrategyConfig
  };
}