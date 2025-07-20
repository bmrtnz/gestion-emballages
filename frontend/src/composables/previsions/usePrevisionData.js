import { ref, computed } from 'vue';
import { useLoading } from '../useLoading';
import { useErrorHandler } from '../useErrorHandler';
import previsionsAPI from '../../api/previsions';
import api from '../../api/axios';

/**
 * Composable for managing prevision data, API calls, and state
 * Follows single responsibility principle for data management
 */
export function usePrevisionData() {
  const { isLoading, setLoading, setSuccess, setError: setLoadingError } = useLoading();
  const { handleError } = useErrorHandler();

  // Data state
  const previsions = ref([]);
  const fournisseurs = ref([]);
  const error = ref(null);

  // Pagination state
  const currentPage = ref(1);
  const totalPages = ref(0);
  const totalItems = ref(0);
  const itemsPerPage = ref(10);
  const hasNextPage = ref(false);
  const hasPrevPage = ref(false);

  /**
   * Fetch previsions with pagination and filters
   * @param {Object} filters - Filter parameters
   * @param {Object} options - Additional options like page
   */
  const fetchPrevisions = async (filters = {}, options = {}) => {
    try {
      setLoading();
      error.value = null;

      const params = {
        page: options.page || currentPage.value,
        limit: itemsPerPage.value,
        ...filters
      };

      const response = await previsionsAPI.getPrevisions(params);
      
      // Update data
      previsions.value = response.data || [];
      
      // Update pagination
      currentPage.value = response.page || 1;
      totalPages.value = response.totalPages || 1;
      totalItems.value = response.totalCount || 0;
      hasNextPage.value = response.hasNextPage || false;
      hasPrevPage.value = response.hasPrevPage || false;

      setSuccess();
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des prévisions';
      setLoadingError(error.value);
      handleError(err);
      console.error('Error fetching previsions:', err);
    }
  };

  /**
   * Fetch available suppliers
   */
  const fetchFournisseurs = async () => {
    try {
      const response = await api.get('/fournisseurs', {
        params: { limit: 100, status: 'active' }
      });
      fournisseurs.value = response.data.data || [];
    } catch (err) {
      console.error('Error fetching fournisseurs:', err);
      handleError(err);
    }
  };

  /**
   * Create a new prevision
   * @param {Object} previsionData - Prevision data
   * @returns {Promise<Object>} Created prevision
   */
  const createPrevision = async (previsionData) => {
    try {
      setLoading();
      error.value = null;
      
      const response = await previsionsAPI.createPrevision(previsionData);
      setSuccess();
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création';
      setLoadingError(error.value);
      throw err;
    }
  };

  /**
   * Delete a prevision
   * @param {string} previsionId - Prevision ID
   */
  const deletePrevision = async (previsionId) => {
    try {
      await previsionsAPI.deletePrevision(previsionId);
      // Refresh list after deletion
      await fetchPrevisions();
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  /**
   * Delete an article from a prevision
   * @param {string} previsionId - Prevision ID
   * @param {string} articlePrevisionId - Article prevision ID
   */
  const deleteArticlePrevision = async (previsionId, articlePrevisionId) => {
    try {
      await previsionsAPI.removeArticlePrevision(previsionId, articlePrevisionId);
      // Refresh list after deletion
      await fetchPrevisions();
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  /**
   * Pagination helpers
   */
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      currentPage.value = page;
      return true;
    }
    return false;
  };

  const goToPrevPage = () => goToPage(currentPage.value - 1);
  const goToNextPage = () => goToPage(currentPage.value + 1);

  const changePageSize = (newSize) => {
    itemsPerPage.value = newSize;
    currentPage.value = 1; // Reset to first page
  };

  const resetPagination = () => {
    currentPage.value = 1;
  };

  /**
   * Get total units for a prevision
   * @param {Object} prevision - Prevision object
   * @returns {number} Total units
   */
  const getTotalUnits = (prevision) => {
    if (!prevision?.articlesPrevisions) return 0;
    
    return prevision.articlesPrevisions.reduce((total, ap) => {
      const articleTotal = ap.semaines?.reduce((sum, s) => sum + (s.quantitePrevue || 0), 0) || 0;
      return total + articleTotal;
    }, 0);
  };

  /**
   * Get site name from prevision
   * @param {Object} prevision - Prevision object
   * @returns {string} Site name
   */
  const getSiteName = (prevision) => {
    if (!prevision?.fournisseurId?.sites || !prevision?.siteId) return 'N/A';
    const site = prevision.fournisseurId.sites.find(s => s._id === prevision.siteId);
    return site?.nomSite || 'N/A';
  };

  /**
   * Get article info from article prevision
   * @param {Object} articlePrevision - Article prevision object
   * @returns {Object} Article info
   */
  const getArticleInfo = (articlePrevision) => {
    return {
      codeArticle: articlePrevision?.articleId?.codeArticle || 'N/A',
      designation: articlePrevision?.articleId?.designation || 'Article non trouvé',
      categorie: articlePrevision?.articleId?.categorie || 'N/A'
    };
  };

  /**
   * Get total quantity for an article prevision
   * @param {Object} articlePrevision - Article prevision object
   * @returns {number} Total quantity
   */
  const getTotalQuantityForArticle = (articlePrevision) => {
    if (!articlePrevision?.semaines) return 0;
    return articlePrevision.semaines.reduce((sum, s) => sum + (s.quantitePrevue || 0), 0);
  };

  /**
   * Get conditioning conversion for an article prevision
   * @param {Object} articlePrevision - Article prevision object
   * @param {string} fournisseurId - Supplier ID
   * @returns {string} Conversion text
   */
  const getConditionnementConversion = (articlePrevision, fournisseurId) => {
    if (!articlePrevision?.articleId?.fournisseurs || !fournisseurId) return '';
    
    // Find the supplier data for this article
    const supplierData = articlePrevision.articleId.fournisseurs.find(
      f => f.fournisseurId === fournisseurId || f.fournisseurId?._id === fournisseurId
    );
    
    if (!supplierData?.quantiteParConditionnement || !supplierData?.uniteConditionnement) return '';
    
    const totalUnits = getTotalQuantityForArticle(articlePrevision);
    if (totalUnits === 0) return '';
    
    const conditioningQuantity = Math.ceil(totalUnits / supplierData.quantiteParConditionnement);
    
    // Handle plurals for conditioning units
    const getPlural = (unit, quantity) => {
      if (quantity <= 1) return unit;
      
      // Handle specific French plurals
      switch (unit.toLowerCase()) {
        case 'palette':
          return 'palettes';
        case 'carton':
          return 'cartons';
        case 'sac':
          return 'sacs';
        case 'boîte':
        case 'boite':
          return 'boîtes';
        case 'paquet':
          return 'paquets';
        case 'rouleau':
          return 'rouleaux';
        case 'caisse':
          return 'caisses';
        case 'bac':
          return 'bacs';
        case 'bidon':
          return 'bidons';
        case 'fût':
        case 'fut':
          return 'fûts';
        default:
          // Generic plural rule: add 's' if not ending with 's', 'x', or 'z'
          if (unit.endsWith('s') || unit.endsWith('x') || unit.endsWith('z')) {
            return unit;
          }
          return unit + 's';
      }
    };
    
    const pluralUnit = getPlural(supplierData.uniteConditionnement, conditioningQuantity);
    
    return `${conditioningQuantity} ${pluralUnit} de ${supplierData.quantiteParConditionnement}`;
  };

  return {
    // Data
    previsions,
    fournisseurs,
    error,
    isLoading,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    
    // Methods
    fetchPrevisions,
    fetchFournisseurs,
    createPrevision,
    deletePrevision,
    deleteArticlePrevision,
    goToPage,
    goToPrevPage,
    goToNextPage,
    changePageSize,
    resetPagination,
    
    // Helpers
    getTotalUnits,
    getSiteName,
    getArticleInfo,
    getTotalQuantityForArticle,
    getConditionnementConversion
  };
}