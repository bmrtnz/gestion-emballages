import { ref } from 'vue';
import { useLoading } from '../useLoading';
import { useErrorHandler } from '../useErrorHandler';
import api from '../../api/axios';

/**
 * Composable for managing fournisseur data fetching
 * Handles API calls, loading states, and error management
 */
export function useFournisseurData() {
  // State
  const fournisseurs = ref([]);
  const pagination = ref(null);
  const filters = ref({});
  
  // Pagination state
  const currentPage = ref(1);
  const totalPages = ref(0);
  const totalItems = ref(0);
  const itemsPerPage = ref(10);
  const hasNextPage = ref(false);
  const hasPrevPage = ref(false);
  
  // Loading and error handling
  const { isLoading, execute } = useLoading();
  const { withErrorHandling } = useErrorHandler();
  
  /**
   * Fetch fournisseurs from the API
   * @param {Object} filterParams - Filter parameters
   * @param {Object} paginationParams - Pagination parameters
   */
  const fetchFournisseurs = async (filterParams = {}, paginationParams = {}) => {
    return await execute(async () => {
      const params = {
        page: paginationParams.page || currentPage.value,
        limit: paginationParams.limit || itemsPerPage.value,
        search: filterParams.search || '',
        status: filterParams.status || '',
        sortBy: 'nom',
        sortOrder: 'asc'
      };
      
      const response = await withErrorHandling(
        () => api.get('/fournisseurs', { params }),
        'Erreur lors du chargement des fournisseurs'
      );
      
      // Update state
      fournisseurs.value = response.data.data;
      pagination.value = response.data.pagination;
      filters.value = response.data.filters;
      
      // Update pagination state
      currentPage.value = pagination.value.currentPage;
      totalPages.value = pagination.value.totalPages;
      totalItems.value = pagination.value.totalItems;
      itemsPerPage.value = pagination.value.itemsPerPage;
      hasNextPage.value = pagination.value.hasNextPage;
      hasPrevPage.value = pagination.value.hasPrevPage;
      
      return {
        fournisseurs: response.data.data,
        pagination: response.data.pagination,
        filters: response.data.filters
      };
    });
  };
  
  /**
   * Navigate to specific page
   * @param {number} page - Page number
   */
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      return true;
    }
    return false;
  };
  
  /**
   * Go to previous page
   */
  const goToPrevPage = () => {
    if (hasPrevPage.value) {
      return goToPage(currentPage.value - 1);
    }
    return false;
  };
  
  /**
   * Go to next page
   */
  const goToNextPage = () => {
    if (hasNextPage.value) {
      return goToPage(currentPage.value + 1);
    }
    return false;
  };

  /**
   * Change page size
   */
  const handlePageSizeChange = (newSize) => {
    itemsPerPage.value = parseInt(newSize);
    currentPage.value = 1;
    return fetchFournisseurs();
  };
  
  /**
   * Reset pagination to first page
   */
  const resetPagination = () => {
    currentPage.value = 1;
  };
  
  /**
   * Soft delete fournisseur
   */
  const softDeleteFournisseur = async (fournisseurId) => {
    await execute(async () => {
      await withErrorHandling(
        () => api.delete(`/fournisseurs/${fournisseurId}`),
        'Impossible de supprimer ce fournisseur'
      );
    });
  };
  
  /**
   * Reactivate fournisseur
   */
  const reactivateFournisseur = async (fournisseurId) => {
    await execute(async () => {
      await withErrorHandling(
        () => api.patch(`/fournisseurs/${fournisseurId}/reactivate`),
        'Impossible de réactiver ce fournisseur'
      );
    });
  };
  
  /**
   * Deactivate site
   */
  const deactivateSite = async (fournisseurId, siteId) => {
    await execute(async () => {
      await withErrorHandling(
        () => api.patch(`/fournisseurs/${fournisseurId}/sites/${siteId}/deactivate`),
        'Impossible de désactiver ce site'
      );
    });
  };
  
  /**
   * Reactivate site
   */
  const reactivateSite = async (fournisseurId, siteId) => {
    await execute(async () => {
      await withErrorHandling(
        () => api.patch(`/fournisseurs/${fournisseurId}/sites/${siteId}/reactivate`),
        'Impossible de réactiver ce site'
      );
    });
  };
  
  return {
    // State
    fournisseurs,
    pagination,
    filters,
    isLoading,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    
    // Methods
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
  };
}