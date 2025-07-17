import { computed, ref, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { RoleStrategyFactory } from '../strategies';

/**
 * Composable for managing role-based strategies
 * Provides role-specific behavior and data transformation
 */
export function useRoleStrategy() {
  const authStore = useAuthStore();
  
  // Current strategy instance
  const currentStrategy = ref(null);
  
  /**
   * Create strategy based on current user
   */
  const createStrategy = () => {
    if (!authStore.isAuthenticated || !authStore.userRole) {
      return null;
    }
    
    return RoleStrategyFactory.createStrategy(
      authStore.userRole,
      authStore.user?.entiteId
    );
  };
  
  /**
   * Initialize strategy
   */
  const initializeStrategy = () => {
    currentStrategy.value = createStrategy();
  };
  
  /**
   * Watch for authentication changes and update strategy
   */
  watch(
    () => [authStore.isAuthenticated, authStore.userRole],
    () => {
      initializeStrategy();
    },
    { immediate: true }
  );
  
  /**
   * Transform data using current strategy
   */
  const transformTableData = (articles) => {
    if (!currentStrategy.value || !articles) {
      return [];
    }
    
    return currentStrategy.value.transformTableData(articles);
  };
  
  /**
   * Get available filters for current role
   */
  const availableFilters = computed(() => {
    if (!currentStrategy.value) {
      return [];
    }
    
    return currentStrategy.value.getAvailableFilters();
  });
  
  /**
   * Get table columns configuration for current role
   */
  const tableColumns = computed(() => {
    if (!currentStrategy.value) {
      return [];
    }
    
    return currentStrategy.value.getTableColumns();
  });
  
  /**
   * Get UI behavior configuration for current role
   */
  const uiBehavior = computed(() => {
    if (!currentStrategy.value) {
      return {};
    }
    
    return currentStrategy.value.getUIBehavior();
  });
  
  /**
   * Get permissions for current role
   */
  const permissions = computed(() => {
    if (!currentStrategy.value) {
      return {};
    }
    
    return currentStrategy.value.getPermissions();
  });
  
  /**
   * Check if current user can edit
   */
  const canEdit = computed(() => {
    return permissions.value.canEdit || false;
  });
  
  /**
   * Check if current user can delete
   */
  const canDelete = computed(() => {
    return permissions.value.canDelete || false;
  });
  
  /**
   * Check if current role should use tree view
   */
  const useTreeView = computed(() => {
    return uiBehavior.value.useTreeView || false;
  });
  
  /**
   * Check if tree controls should be shown
   */
  const showTreeControls = computed(() => {
    return uiBehavior.value.showTreeControls || false;
  });
  
  /**
   * Check if current role should show expand buttons
   */
  const showExpandButtons = computed(() => {
    return uiBehavior.value.showExpandButtons || false;
  });
  
  /**
   * Check if tree is always expanded for current role
   */
  const alwaysExpanded = computed(() => {
    return uiBehavior.value.alwaysExpanded || false;
  });
  
  /**
   * Check if row actions should be shown
   */
  const allowRowActions = computed(() => {
    return uiBehavior.value.allowRowActions || false;
  });
  
  /**
   * Get dynamic column title (e.g., for supplier-specific columns)
   */
  const getDynamicColumnTitle = (baseTitle, ...args) => {
    if (!currentStrategy.value || !currentStrategy.value.getDynamicColumnTitle) {
      return baseTitle;
    }
    
    return currentStrategy.value.getDynamicColumnTitle(baseTitle, ...args);
  };
  
  /**
   * Get action configuration for an item
   */
  const getActionConfig = (item, isParent = false) => {
    if (!currentStrategy.value || !currentStrategy.value.getActionConfig) {
      return [];
    }
    
    return currentStrategy.value.getActionConfig(item, isParent);
  };
  
  /**
   * Check if a filter is available for current role
   */
  const isFilterAvailable = (filterName) => {
    return availableFilters.value.includes(filterName);
  };
  
  /**
   * Get role hierarchy level
   */
  const roleHierarchy = computed(() => {
    return RoleStrategyFactory.getRoleHierarchy(authStore.userRole);
  });
  
  /**
   * Check if current role is admin
   */
  const isAdminRole = computed(() => {
    return RoleStrategyFactory.isAdminRole(authStore.userRole);
  });
  
  /**
   * Check if current role is limited
   */
  const isLimitedRole = computed(() => {
    return RoleStrategyFactory.isLimitedRole(authStore.userRole);
  });
  
  return {
    // Strategy management
    currentStrategy: computed(() => currentStrategy.value),
    initializeStrategy,
    
    // Data transformation
    transformTableData,
    
    // Configuration
    availableFilters,
    tableColumns,
    uiBehavior,
    permissions,
    
    // Permission checks
    canEdit,
    canDelete,
    
    // UI behavior
    useTreeView,
    showTreeControls,
    showExpandButtons,
    alwaysExpanded,
    allowRowActions,
    
    // Helper methods
    getDynamicColumnTitle,
    getActionConfig,
    isFilterAvailable,
    
    // Role information
    roleHierarchy,
    isAdminRole,
    isLimitedRole
  };
}