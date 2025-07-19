import { ref } from 'vue';
import { useLoading } from '../useLoading';
import { useErrorHandler } from '../useErrorHandler';
import api from '../../api/axios';

/**
 * Composable for managing article data fetching
 * Handles API calls, loading states, and error management
 */
export function useArticleData() {
  // State
  const articles = ref([]);
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
   * Fetch available categories for current filter set (without category filter)
   * @param {Object} filterParams - Filter parameters (excluding category)
   */
  const fetchAvailableCategories = async (filterParams = {}) => {
    try {
      const params = {
        search: filterParams.search || '',
        status: filterParams.status || '',
        fournisseur: filterParams.fournisseur || '',
        // Explicitly exclude categorie filter to get all categories in the filtered dataset
        distinctField: 'categorie'
      };
      
      const response = await withErrorHandling(
        () => api.get('/articles/distinct-categories', { params }),
        'Erreur lors du chargement des catégories disponibles'
      );
      
      return response.data.categories || [];
    } catch (error) {
      console.warn('Failed to fetch available categories, using fallback');
      return [];
    }
  };

  /**
   * Fetch articles from the API
   * @param {Object} filterParams - Filter parameters
   * @param {Object} paginationParams - Pagination parameters
   */
  const fetchArticles = async (filterParams = {}, paginationParams = {}) => {
    return await execute(async () => {
      const params = {
        page: paginationParams.page || currentPage.value,
        limit: paginationParams.limit || itemsPerPage.value,
        search: filterParams.search || '',
        status: filterParams.status || '',
        categorie: filterParams.categorie || '',
        fournisseur: filterParams.fournisseur || '',
        sortBy: 'designation',
        sortOrder: 'asc'
      };
      
      const response = await withErrorHandling(
        () => api.get('/articles', { params }),
        'Erreur lors du chargement des articles'
      );
      
      
      // Update state
      articles.value = response.data.data;
      pagination.value = response.data.pagination;
      filters.value = response.data.filters;
      
      // Update pagination state
      currentPage.value = pagination.value.currentPage;
      totalPages.value = pagination.value.totalPages;
      totalItems.value = pagination.value.totalItems;
      itemsPerPage.value = pagination.value.itemsPerPage;
      hasNextPage.value = pagination.value.hasNextPage;
      hasPrevPage.value = pagination.value.hasPrevPage;
      
      // Return supplier data for parent component
      return {
        articles: response.data.data,
        pagination: response.data.pagination,
        filters: response.data.filters,
        availableSuppliers: response.data.filters?.availableSuppliers || []
      };
    });
  };
  
  /**
   * Fetch categories from the API
   */
  const fetchCategories = async () => {
    try {
      const response = await withErrorHandling(
        () => api.get('/articles/categories'),
        'Erreur lors du chargement des catégories'
      );
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch categories from API, using fallback', error);
      return ['Barquette', 'Cagette', 'Plateau', 'Film Plastique', 'Carton', 'Sac Plastique', 'Sac Papier', 'Emballage Isotherme', 'Etiquette', 'Autre'];
    }
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
    return fetchArticles();
  };
  
  /**
   * Reset pagination to first page
   */
  const resetPagination = () => {
    currentPage.value = 1;
  };
  
  return {
    // State
    articles,
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
    fetchArticles,
    fetchCategories,
    fetchAvailableCategories,
    goToPage,
    goToPrevPage,
    goToNextPage,
    handlePageSizeChange,
    resetPagination
  };
}