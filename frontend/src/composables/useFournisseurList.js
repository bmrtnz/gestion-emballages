import { computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useFournisseurData } from './useFournisseurData';
import { useFournisseurFilters } from './useFournisseurFilters';
import { useFournisseurTreeState } from './useFournisseurTreeState';
import { useFournisseurUI } from './useFournisseurUI';
import { usePerformanceOptimization } from './usePerformanceOptimization';

/**
 * Main composable for fournisseur list functionality
 * Orchestrates data fetching, filtering, and UI state
 */
export function useFournisseurList() {
  const authStore = useAuthStore();
  
  // Performance optimization utilities
  const { debounce } = usePerformanceOptimization();
  
  // Initialize sub-composables
  const {
    fournisseurs,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    fetchFournisseurs,
    goToPage,
    goToPrevPage,
    goToNextPage,
    handlePageSizeChange,
    resetPagination,
    softDeleteFournisseur,
    reactivateFournisseur,
    deactivateSite,
    reactivateSite
  } = useFournisseurData();
  
  const {
    searchQuery,
    statusFilter,
    showFilters,
    activeFiltersCount,
    statusOptions,
    getFilterValues,
    clearFilters,
    validateFilters
  } = useFournisseurFilters();
  
  const {
    isExpanded,
    toggleExpanded,
    initializeFournisseurTree,
    toggleTreeState,
    handleExpandAll,
    handleCollapseAll,
    getIsTreeExpanded
  } = useFournisseurTreeState();
  
  const {
    isSiteCreatePanelOpen,
    isEditPanelOpen,
    isSiteEditPanelOpen,
    selectedFournisseurForSite,
    selectedFournisseurForEdit,
    selectedSiteForEdit,
    selectedFournisseurIdForSiteEdit,
    tableDataSource,
    formatAddress,
    editFournisseur,
    openSiteCreatePanel,
    editSite,
    handleSiteCreated,
    handleFournisseurUpdated,
    handleSiteUpdated,
    closeAllPanels
  } = useFournisseurUI();
  
  /**
   * Transform fournisseurs to table data structure
   */
  const transformedTableData = computed(() => {
    return tableDataSource.value(fournisseurs.value);
  });
  
  /**
   * Compute tree expanded state
   */
  const computedIsTreeExpanded = computed(() => {
    return getIsTreeExpanded(transformedTableData.value);
  });
  
  /**
   * Optimized debounced fetch fournisseurs function
   */
  const debouncedFetchFournisseurs = debounce(() => {
    resetPagination();
    performFetch();
  }, 300);
  
  /**
   * Perform the actual fetch with current filter values
   */
  const performFetch = async () => {
    const filterValues = getFilterValues();
    await fetchFournisseurs(filterValues, { page: currentPage.value });
  };
  
  /**
   * Handle page change
   */
  const handlePageChange = async (page) => {
    if (goToPage(page)) {
      await performFetch();
    }
  };
  
  /**
   * Handle clear filters
   */
  const handleClearFilters = async () => {
    clearFilters();
    await performFetch();
  };
  
  /**
   * Handle soft delete with refresh
   */
  const handleSoftDeleteFournisseur = async (fournisseurId) => {
    await softDeleteFournisseur(fournisseurId);
    await performFetch();
  };
  
  /**
   * Handle reactivate with refresh
   */
  const handleReactivateFournisseur = async (fournisseurId) => {
    await reactivateFournisseur(fournisseurId);
    await performFetch();
  };
  
  /**
   * Handle deactivate site with refresh
   */
  const handleDeactivateSite = async (fournisseurId, siteId) => {
    await deactivateSite(fournisseurId, siteId);
    await performFetch();
  };
  
  /**
   * Handle reactivate site with refresh
   */
  const handleReactivateSite = async (fournisseurId, siteId) => {
    await reactivateSite(fournisseurId, siteId);
    await performFetch();
  };
  
  /**
   * Handle site created with refresh
   */
  const handleSiteCreatedWithRefresh = async () => {
    handleSiteCreated();
    await performFetch();
  };
  
  /**
   * Handle fournisseur updated with refresh
   */
  const handleFournisseurUpdatedWithRefresh = async () => {
    handleFournisseurUpdated();
    await performFetch();
  };
  
  /**
   * Handle site updated with refresh
   */
  const handleSiteUpdatedWithRefresh = async () => {
    handleSiteUpdated();
    await performFetch();
  };
  
  /**
   * Handle page size change
   */
  const handlePageSizeChangeWithRefresh = async (newSize) => {
    await handlePageSizeChange(newSize);
  };
  
  /**
   * Pagination pages for UI
   */
  const paginationPages = computed(() => {
    const start = Math.max(1, currentPage.value - 2);
    const end = Math.min(totalPages.value, start + 4);
    const pages = [];
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  });
  
  // Watch for filter changes
  watch(searchQuery, debouncedFetchFournisseurs);
  watch(statusFilter, debouncedFetchFournisseurs);
  
  // Initialize tree state when data changes
  watch(transformedTableData, (data) => {
    if (data.length > 0) {
      initializeFournisseurTree(data);
    }
  }, { immediate: true });
  
  // Watch for authentication changes
  watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
    if (isAuthenticated) {
      await performFetch();
    }
  });
  
  /**
   * Initialize data on mount
   */
  const initializeData = async () => {
    if (!authStore.isAuthenticated) {
      console.warn('User not authenticated when initializing FournisseurList');
      return;
    }
    
    await performFetch();
  };
  
  onMounted(initializeData);
  
  return {
    // Data
    fournisseurs,
    transformedTableData,
    isLoading,
    
    // Filters
    searchQuery,
    statusFilter,
    showFilters,
    activeFiltersCount,
    statusOptions,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    paginationPages,
    
    // Tree state
    isExpanded,
    toggleExpanded,
    computedIsTreeExpanded,
    toggleTreeState: () => toggleTreeState(transformedTableData.value),
    handleExpandAll: () => handleExpandAll(transformedTableData.value),
    handleCollapseAll,
    
    // UI state
    isSiteCreatePanelOpen,
    isEditPanelOpen,
    isSiteEditPanelOpen,
    selectedFournisseurForSite,
    selectedFournisseurForEdit,
    selectedSiteForEdit,
    selectedFournisseurIdForSiteEdit,
    
    // Methods
    handlePageChange,
    handlePageSizeChangeWithRefresh,
    handleClearFilters,
    formatAddress,
    editFournisseur,
    openSiteCreatePanel,
    editSite,
    handleSiteCreatedWithRefresh,
    handleFournisseurUpdatedWithRefresh,
    handleSiteUpdatedWithRefresh,
    handleSoftDeleteFournisseur,
    handleReactivateFournisseur,
    handleDeactivateSite,
    handleReactivateSite,
    closeAllPanels,
    
    // Expose for parent component
    fetchFournisseurs: performFetch,
    goToPrevPage,
    goToNextPage
  };
}