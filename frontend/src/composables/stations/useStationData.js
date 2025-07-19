import { ref, computed } from 'vue';
import { useLoading } from '../useLoading';
import { useErrorHandler } from '../useErrorHandler';
import api from '../../api/axios';

export function useStationData() {
  // State
  const stations = ref([]);
  const selectedStation = ref(null);
  
  // Pagination state
  const currentPage = ref(1);
  const totalPages = ref(0);
  const totalItems = ref(0);
  const itemsPerPage = ref(10);
  const hasNextPage = ref(false);
  const hasPrevPage = ref(false);
  const pagination = ref(null);
  
  // Loading and error handling
  const { isLoading, execute } = useLoading();
  const { withErrorHandling } = useErrorHandler();
  
  // Fetch stations with filters
  const fetchStations = async (filters = {}) => {
    await execute(async () => {
      const params = {
        page: currentPage.value,
        limit: itemsPerPage.value,
        ...filters,
        sortBy: filters.sortBy || 'nom',
        sortOrder: filters.sortOrder || 'asc'
      };
      
      const response = await withErrorHandling(
        () => api.get('/stations', { params }),
        'Échec du chargement des stations'
      );
      
      stations.value = response.data.data;
      pagination.value = response.data.pagination;
      
      // Update pagination state
      currentPage.value = pagination.value.currentPage;
      totalPages.value = pagination.value.totalPages;
      totalItems.value = pagination.value.totalItems;
      itemsPerPage.value = pagination.value.itemsPerPage;
      hasNextPage.value = pagination.value.hasNextPage;
      hasPrevPage.value = pagination.value.hasPrevPage;
    });
  };
  
  // Station CRUD operations
  const deactivateStation = async (stationId) => {
    await execute(async () => {
      await withErrorHandling(
        () => api.delete(`/stations/${stationId}`),
        'Échec de la désactivation de la station'
      );
    });
  };
  
  const reactivateStation = async (stationId) => {
    await execute(async () => {
      await withErrorHandling(
        () => api.patch(`/stations/${stationId}/reactivate`),
        'Échec de la réactivation de la station'
      );
    });
  };
  
  // Pagination methods
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      return true;
    }
    return false;
  };
  
  const goToPrevPage = () => {
    if (hasPrevPage.value) {
      return goToPage(currentPage.value - 1);
    }
    return false;
  };
  
  const goToNextPage = () => {
    if (hasNextPage.value) {
      return goToPage(currentPage.value + 1);
    }
    return false;
  };
  
  const goToFirstPage = () => {
    return goToPage(1);
  };
  
  const goToLastPage = () => {
    return goToPage(totalPages.value);
  };
  
  const changePageSize = (newSize) => {
    itemsPerPage.value = parseInt(newSize);
    currentPage.value = 1;
  };
  
  const resetPagination = () => {
    currentPage.value = 1;
  };
  
  // Computed properties
  const paginationInfo = computed(() => ({
    start: ((currentPage.value - 1) * itemsPerPage.value) + 1,
    end: Math.min(currentPage.value * itemsPerPage.value, totalItems.value),
    total: totalItems.value
  }));
  
  return {
    // State
    stations,
    selectedStation,
    isLoading,
    
    // Pagination state
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    pagination,
    paginationInfo,
    
    // Methods
    fetchStations,
    deactivateStation,
    reactivateStation,
    
    // Pagination methods
    goToPage,
    goToPrevPage,
    goToNextPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    resetPagination
  };
}