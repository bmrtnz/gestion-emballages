import { watch, onMounted } from 'vue';
import { useStationData } from './useStationData';
import { useStationFilters } from './useStationFilters';
import { usePerformanceOptimization } from '../usePerformanceOptimization';

export function useStationList() {
  // Compose specialized composables
  const dataComposable = useStationData();
  const filtersComposable = useStationFilters();
  const { debounce, memoize } = usePerformanceOptimization();
  
  const {
    stations,
    selectedStation,
    isLoading,
    fetchStations,
    deactivateStation,
    reactivateStation,
    resetPagination,
    goToPage,
    goToPrevPage,
    goToNextPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    paginationInfo
  } = dataComposable;
  
  const {
    searchQuery,
    statusFilter,
    showFilters,
    statusOptions,
    activeFiltersCount,
    hasActiveFilters,
    currentFilters,
    clearFilters,
    toggleFilters
  } = filtersComposable;
  
  // Create a debounced fetch function
  const debouncedFetchStations = debounce(() => {
    resetPagination();
    performFetch();
  }, 250); // Reduced from 300ms for better UX
  
  // Memoized address formatter
  const formatAddress = memoize((adresse) => {
    if (!adresse) return { line1: '', line2: '' };
    return {
      line1: adresse.rue || '',
      line2: `${adresse.codePostal || ''} ${adresse.ville || ''}${adresse.pays ? ', ' + adresse.pays : ''}`
    };
  });
  
  // Main fetch function that applies current filters
  const performFetch = async () => {
    await fetchStations(currentFilters.value);
  };
  
  // Handle filter changes
  const handleFilterChange = () => {
    debouncedFetchStations();
  };
  
  // Handle pagination
  const handlePageChange = async (page) => {
    if (goToPage(page)) {
      await performFetch();
    }
  };
  
  const handlePageSizeChange = async (newSize) => {
    changePageSize(newSize);
    await performFetch();
  };
  
  const handlePrevPage = async () => {
    if (goToPrevPage()) {
      await performFetch();
    }
  };
  
  const handleNextPage = async () => {
    if (goToNextPage()) {
      await performFetch();
    }
  };
  
  const handleFirstPage = async () => {
    if (goToFirstPage()) {
      await performFetch();
    }
  };
  
  const handleLastPage = async () => {
    if (goToLastPage()) {
      await performFetch();
    }
  };
  
  // Handle clear filters
  const handleClearFilters = async () => {
    clearFilters();
    resetPagination();
    await performFetch();
  };
  
  // Handle station actions
  const handleDeactivateStation = async (stationId) => {
    await deactivateStation(stationId);
    await performFetch(); // Refresh the list
  };
  
  const handleReactivateStation = async (stationId) => {
    await reactivateStation(stationId);
    await performFetch(); // Refresh the list
  };
  
  // Watch for filter changes
  watch(searchQuery, handleFilterChange);
  watch(statusFilter, handleFilterChange);
  
  // Initial fetch on mount
  onMounted(() => {
    performFetch();
  });
  
  // Public API
  return {
    // Data
    stations,
    selectedStation,
    isLoading,
    
    // Filters
    searchQuery,
    statusFilter,
    showFilters,
    statusOptions,
    activeFiltersCount,
    hasActiveFilters,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    paginationInfo,
    
    // Methods
    fetchStations: performFetch,
    toggleFilters,
    clearFilters: handleClearFilters,
    
    // Station actions
    deactivateStation: handleDeactivateStation,
    reactivateStation: handleReactivateStation,
    
    // Pagination methods
    goToPage: handlePageChange,
    goToPrevPage: handlePrevPage,
    goToNextPage: handleNextPage,
    goToFirstPage: handleFirstPage,
    goToLastPage: handleLastPage,
    changePageSize: handlePageSizeChange,
    
    // Utilities
    formatAddress
  };
}