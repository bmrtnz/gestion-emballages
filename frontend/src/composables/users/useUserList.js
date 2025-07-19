import { watch, onMounted, computed } from 'vue';
import { useUserData } from './useUserData';
import { useUserFilters } from './useUserFilters';
import { useUserRoleStrategy } from './useUserRoleStrategy';
import { useAuthStore } from '../../stores/authStore';

export function useUserList() {
  // Composables
  const authStore = useAuthStore();
  const dataComposable = useUserData();
  const filtersComposable = useUserFilters();
  const strategyComposable = useUserRoleStrategy();

  // Extract all exports from composables
  const {
    // Data
    users,
    selectedUser,
    isLoading,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    paginationInfo,
    
    // Data methods
    fetchUsers,
    createUser,
    updateUser,
    deactivateUser,
    reactivateUser,
    goToPage,
    goToPrevPage,
    goToNextPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    resetPagination,
    selectUser,
    clearSelection
  } = dataComposable;

  const {
    // Filter state
    searchQuery,
    statusFilter,
    roleFilter,
    showFilters,
    
    // Filter options
    statusOptions,
    roleOptions,
    
    // Filter computed
    activeFiltersCount,
    currentFilters,
    hasActiveFilters,
    
    // Filter methods
    toggleFilters,
    clearFilters,
    applyFilters,
    isFilterAvailable,
    getFilterValue,
    setFilterValue,
    createDebouncedSearch
  } = filtersComposable;

  const {
    // Strategy data transformation
    transformTableData,
    
    // Strategy filters
    showStatusFilter,
    showRoleFilter,
    
    // Strategy UI behavior
    showCreateButton,
    showBulkActions,
    showAdvancedFilters,
    defaultPageSize,
    enableExport,
    
    // Strategy permissions
    canCreateUser,
    canEditUser,
    canDeactivateUser,
    canReactivateUser,
    canExportUsers,
    canViewAllUsers,
    
    // Strategy actions
    getAvailableActions,
    canPerformAction
  } = strategyComposable;

  // Transformed data based on role strategy
  const transformedUsers = computed(() => {
    return transformTableData(users.value);
  });

  // Create debounced fetch function
  const debouncedFetchUsers = createDebouncedSearch(() => {
    resetPagination();
    performFetch();
  }, 300);

  // Enhanced fetch function with filters
  const performFetch = () => {
    const params = {
      search: searchQuery.value.trim(),
      status: statusFilter.value,
      role: roleFilter.value
    };

    // Remove empty parameters
    Object.keys(params).forEach(key => {
      if (!params[key]) {
        delete params[key];
      }
    });

    fetchUsers(params);
  };


  // Enhanced clear filters
  const clearAllFilters = () => {
    clearFilters();
    resetPagination();
    performFetch();
  };

  // Watch for filter changes
  watch(searchQuery, () => {
    if (searchQuery.value.length === 0 || searchQuery.value.length >= 2) {
      debouncedFetchUsers();
    }
  });

  watch([statusFilter, roleFilter], () => {
    resetPagination();
    performFetch();
  });

  // Initialize on mount
  onMounted(() => {
    performFetch();
  });

  return {
    // Data
    users,
    transformedUsers,
    selectedUser,
    isLoading,
    
    // Filters
    searchQuery,
    statusFilter,
    roleFilter,
    showFilters,
    statusOptions,
    roleOptions,
    activeFiltersCount,
    currentFilters,
    hasActiveFilters,
    
    // Strategy-based filter visibility
    showStatusFilter,
    showRoleFilter,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    paginationInfo,
    
    // Strategy-based UI behavior
    showCreateButton,
    showBulkActions,
    showAdvancedFilters,
    defaultPageSize,
    enableExport,
    
    // Strategy-based permissions
    canCreateUser,
    canExportUsers,
    canViewAllUsers,
    
    // Methods
    fetchUsers: performFetch,
    createUser,
    updateUser,
    deactivateUser,
    reactivateUser,
    toggleFilters,
    clearFilters: clearAllFilters,
    goToPage,
    goToPrevPage,
    goToNextPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    selectUser,
    clearSelection,
    
    // Strategy-based action methods
    getAvailableActions,
    canPerformAction,
    canEditUser,
    canDeactivateUser,
    canReactivateUser
  };
}