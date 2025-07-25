/**
 * @fileoverview Composable for stock data management
 * @module composables/stocks/useStockData
 */

import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import stockFournisseurAPI from '../../api/stockFournisseur';

/**
 * Composable for managing stock data
 * Handles API calls, pagination, and state management for stocks
 */
export function useStockData() {
  const authStore = useAuthStore();

  // Core data state
  const stocks = ref([]);
  const selectedStock = ref(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref(null);

  // Current context
  const currentSupplierId = ref(null);
  const currentSiteId = ref(null);
  const selectedCampaign = ref('25-26'); // Default campaign

  // Computed properties
  const hasStocks = computed(() => stocks.value && stocks.value.length > 0);
  
  const currentSupplierData = computed(() => {
    return authStore.user?.entiteId || currentSupplierId.value;
  });

  // Store for supplier entity details
  const supplierEntity = ref(null);

  const availableSites = computed(() => {
    // For suppliers, first try to get sites from user entity details
    if (authStore.userRole === 'Fournisseur') {
      // Try from user's entiteDetails first
      if (authStore.user?.entiteDetails?.sites) {
        return authStore.user.entiteDetails.sites.filter(site => site.isActive !== false);
      }
      
      // Fallback to supplierEntity if available
      if (supplierEntity.value?.sites) {
        return supplierEntity.value.sites.filter(site => site.isActive !== false);
      }
    }
    
    // For other roles, check if sites are available in user details
    if (authStore.user?.entiteDetails?.sites) {
      return authStore.user.entiteDetails.sites.filter(site => site.isActive !== false);
    }
    
    return [];
  });

  /**
   * Initialize data for current user context
   */
  const initializeData = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // For supplier users, use their entity ID and fetch supplier data if needed
      if (authStore.userRole === 'Fournisseur') {
        currentSupplierId.value = authStore.user.entiteId;
        
        // If we don't have entity details in auth store, try to fetch supplier stocks
        // which should populate the supplier data
        if (!authStore.user?.entiteDetails?.sites && currentSupplierId.value) {
          try {
            await fetchAllSupplierStocks(currentSupplierId.value);
          } catch (stockError) {
            console.warn('Could not fetch supplier stocks:', stockError);
          }
        }
        
        // Set default site if only one available
        if (availableSites.value.length === 1) {
          currentSiteId.value = availableSites.value[0]._id;
          await fetchSiteStock(currentSupplierId.value, currentSiteId.value);
        }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'initialisation';
      console.error('Error initializing data:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch stock for a specific site
   */
  const fetchSiteStock = async (supplierId, siteId) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await stockFournisseurAPI.getSiteStock(supplierId, siteId);
      stocks.value = response.stocks || [];
      
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des stocks';
      console.error('Error fetching site stock:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch all stocks for a supplier (all sites)
   */
  const fetchAllSupplierStocks = async (supplierId) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await stockFournisseurAPI.getAllSiteStocks(supplierId);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des stocks';
      console.error('Error fetching all supplier stocks:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update stock for a specific article
   */
  const updateArticleStock = async (supplierId, siteId, articleId, quantity) => {
    try {
      isSaving.value = true;
      error.value = null;
      
      const response = await stockFournisseurAPI.updateArticleStock(
        supplierId, 
        siteId, 
        articleId, 
        { quantite: quantity }
      );

      // Update local state
      const stockIndex = stocks.value.findIndex(s => s.articleId._id === articleId);
      if (stockIndex !== -1) {
        stocks.value[stockIndex].quantite = quantity;
        stocks.value[stockIndex].derniereModificationLe = new Date();
      }

      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour';
      console.error('Error updating article stock:', err);
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Update weekly stock for a specific article and campaign
   */
  const updateWeeklyStock = async (supplierId, siteId, articleId, weekData) => {
    try {
      isSaving.value = true;
      error.value = null;
      
      const response = await stockFournisseurAPI.updateWeeklyStock(
        supplierId,
        siteId,
        articleId,
        weekData
      );

      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour hebdomadaire';
      console.error('Error updating weekly stock:', err);
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Get campaign history for an article
   */
  const getArticleCampaignHistory = async (supplierId, siteId, articleId, campaign) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await stockFournisseurAPI.getArticleCampaignHistory(
        supplierId,
        siteId,
        articleId,
        campaign
      );

      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement de l\'historique';
      console.error('Error fetching campaign history:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get campaign statistics for a site
   */
  const getCampaignStats = async (supplierId, siteId, campaign) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await stockFournisseurAPI.getCampaignStockStats(
        supplierId,
        siteId,
        campaign
      );

      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des statistiques';
      console.error('Error fetching campaign stats:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Submit complete stock inventory
   */
  const submitStockInventory = async (inventoryData) => {
    try {
      isSaving.value = true;
      error.value = null;
      
      const response = await stockFournisseurAPI.submitStock(inventoryData);
      
      // Refresh current site stock after submission
      if (currentSupplierId.value && currentSiteId.value) {
        await fetchSiteStock(currentSupplierId.value, currentSiteId.value);
      }

      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la soumission';
      console.error('Error submitting inventory:', err);
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Set current site context
   */
  const setCurrentSite = async (siteId) => {
    currentSiteId.value = siteId;
    if (currentSupplierId.value && siteId) {
      await fetchSiteStock(currentSupplierId.value, siteId);
    }
  };

  /**
   * Set current campaign
   */
  const setCurrentCampaign = (campaign) => {
    selectedCampaign.value = campaign;
  };

  /**
   * Reset all data
   */
  const resetData = () => {
    stocks.value = [];
    selectedStock.value = null;
    error.value = null;
    currentSiteId.value = null;
  };

  return {
    // State
    stocks,
    selectedStock,
    isLoading,
    isSaving,
    error,
    currentSupplierId,
    currentSiteId,
    selectedCampaign,
    
    // Computed
    hasStocks,
    currentSupplierData,
    availableSites,
    
    // Methods
    initializeData,
    fetchSiteStock,
    fetchAllSupplierStocks,
    updateArticleStock,
    updateWeeklyStock,
    getArticleCampaignHistory,
    getCampaignStats,
    submitStockInventory,
    setCurrentSite,
    setCurrentCampaign,
    resetData
  };
}