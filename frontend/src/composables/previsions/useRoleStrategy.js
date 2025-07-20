import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { PrevisionRoleStrategyFactory } from '../../strategies/previsions';

/**
 * Composable for managing role-based strategies in prevision management
 * Handles role-specific behavior, permissions, and data transformations
 */
export function useRoleStrategy() {
  const authStore = useAuthStore();
  
  // Current strategy instance
  const strategy = ref(null);
  
  /**
   * Initialize strategy based on current user
   */
  const initializeStrategy = () => {
    if (!authStore.user) {
      console.warn('No user found when initializing role strategy');
      return;
    }
    
    strategy.value = PrevisionRoleStrategyFactory.createStrategy(
      authStore.user.role,
      authStore.user.entiteId
    );
  };
  
  // Initialize on mount and when user changes
  watch(() => authStore.user, initializeStrategy, { immediate: true });
  
  /**
   * Transform table data based on role
   * @param {Array} previsions - Raw previsions data
   * @returns {Array} Transformed data
   */
  const transformTableData = (previsions) => {
    if (!strategy.value) return previsions;
    return strategy.value.transformTableData(previsions);
  };
  
  /**
   * Get available filters for current role
   * @returns {Array<string>} Available filter names
   */
  const getAvailableFilters = () => {
    if (!strategy.value) return [];
    return strategy.value.getAvailableFilters();
  };
  
  /**
   * Check if a specific filter is available
   * @param {string} filterName - Filter name to check
   * @returns {boolean} True if filter is available
   */
  const isFilterAvailable = (filterName) => {
    return getAvailableFilters().includes(filterName);
  };
  
  /**
   * Get table columns configuration
   * @returns {Array} Column configurations
   */
  const getTableColumns = () => {
    if (!strategy.value) return [];
    return strategy.value.getTableColumns();
  };
  
  /**
   * Get UI behavior configuration
   * @returns {Object} UI behavior settings
   */
  const getUIBehavior = () => {
    if (!strategy.value) {
      return {
        showCreateButton: false,
        showFilters: true,
        showSearch: true,
        showExport: false,
        showImport: false,
        defaultExpanded: false,
        allowTreeToggle: true,
        showPagination: true,
        itemsPerPageOptions: [10, 25, 50]
      };
    }
    return strategy.value.getUIBehavior();
  };
  
  /**
   * Get permissions for current role
   * @returns {Object} Permission configuration
   */
  const getPermissions = () => {
    if (!strategy.value) {
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canViewAll: false,
        canAddArticles: false,
        canEditArticles: false,
        canDeleteArticles: false
      };
    }
    return strategy.value.getPermissions();
  };
  
  // Computed permissions
  const permissions = computed(() => getPermissions());
  const uiBehavior = computed(() => getUIBehavior());
  const tableColumns = computed(() => getTableColumns());
  const availableFilters = computed(() => getAvailableFilters());
  
  // Permission shortcuts
  const canCreate = computed(() => permissions.value.canCreate);
  const canEdit = computed(() => permissions.value.canEdit);
  const canDelete = computed(() => permissions.value.canDelete);
  const canViewAll = computed(() => permissions.value.canViewAll);
  const canAddArticles = computed(() => permissions.value.canAddArticles);
  const canEditArticles = computed(() => permissions.value.canEditArticles);
  const canDeleteArticles = computed(() => permissions.value.canDeleteArticles);
  
  // UI behavior shortcuts
  const showCreateButton = computed(() => uiBehavior.value.showCreateButton);
  const canShowFilters = computed(() => uiBehavior.value.showFilters);
  const showSearch = computed(() => uiBehavior.value.showSearch);
  const showExport = computed(() => uiBehavior.value.showExport);
  const showImport = computed(() => uiBehavior.value.showImport);
  const defaultExpanded = computed(() => uiBehavior.value.defaultExpanded);
  const allowTreeToggle = computed(() => uiBehavior.value.allowTreeToggle);
  const showPagination = computed(() => uiBehavior.value.showPagination);
  const itemsPerPageOptions = computed(() => uiBehavior.value.itemsPerPageOptions);
  
  return {
    // Strategy instance
    strategy,
    
    // Methods
    transformTableData,
    getAvailableFilters,
    isFilterAvailable,
    getTableColumns,
    getUIBehavior,
    getPermissions,
    
    // Computed properties
    permissions,
    uiBehavior,
    tableColumns,
    availableFilters,
    
    // Permission shortcuts
    canCreate,
    canEdit,
    canDelete,
    canViewAll,
    canAddArticles,
    canEditArticles,
    canDeleteArticles,
    
    // UI behavior shortcuts
    showCreateButton,
    canShowFilters,
    showSearch,
    showExport,
    showImport,
    defaultExpanded,
    allowTreeToggle,
    showPagination,
    itemsPerPageOptions
  };
}