import { computed, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStockData } from './useStockData';
import { useStockFilters } from './useStockFilters';
import { useStockUI } from './useStockUI';
import { useStockRoleStrategy } from './useStockRoleStrategy';
import { usePerformanceOptimization } from '../usePerformanceOptimization';

/**
 * Main orchestrator composable for stock list management
 * Combines all specialized composables into a unified interface
 */
export function useStockList() {
  const router = useRouter();
  
  // Modal states for confirmations
  const showDeleteStockModal = ref(false);
  const showDeleteArticleModal = ref(false);
  const selectedStockToDelete = ref(null);
  const selectedArticleToDelete = ref(null);
  
  // Additional state needed for the list
  const fournisseurs = ref([]);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const totalItems = ref(0);
  const itemsPerPage = ref(10);
  const hasNextPage = ref(false);
  const hasPrevPage = ref(false);
  const itemsPerPageOptions = ref([10, 25, 50, 100]);
  
  // Initialize specialized composables
  const dataComposable = useStockData();
  const filtersComposable = useStockFilters();
  const uiComposable = useStockUI();
  const strategyComposable = useStockRoleStrategy();
  const { debounce, memoizedComputed, formatCurrency, formatNumber } = usePerformanceOptimization();
  
  // Destructure for easier access
  const {
    stocks,
    selectedStock,
    isLoading,
    isSaving,
    error,
    currentSupplierId,
    currentSiteId,
    selectedCampaign,
    hasStocks,
    currentSupplierData,
    availableSites,
    initializeData: initializeStockData,
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
  } = dataComposable;
  
  const {
    searchQuery,
    showFilters,
    filters,
    getAvailableCampaigns,
    getAvailableStatuses,
    getFilterValues,
    clearFilters
  } = filtersComposable;
  
  const {
    isCreatePanelOpen,
    isEditPanelOpen,
    isWeeklyEditPanelOpen,
    selectedStockForEdit,
    createForm,
    isCreating,
    createError,
    isFormValid,
    openCreatePanel,
    closeCreatePanel,
    openEditPanel,
    closeEditPanel,
    openWeeklyEditPanel,
    closeWeeklyEditPanel,
    closeAllPanels,
    setCreating,
    setCreateError,
    onFournisseurChange,
    formatDate,
    getVisiblePages
  } = uiComposable;
  
  const {
    transformStockData,
    permissions,
    uiBehavior,
    availableFilters,
    tableColumns,
    availableActions,
    hasPermission,
    canAccessStock,
    canModifyStock,
    isFilterAvailable,
    strategy
  } = strategyComposable;
  
  // Map permissions to UI capabilities with safe fallbacks
  const canCreate = computed(() => {
    try {
      return hasPermission ? hasPermission('create') : true;
    } catch {
      return true; // Default to allowing create
    }
  });
  
  const canEdit = computed(() => {
    try {
      return hasPermission ? hasPermission('edit') : true;
    } catch {
      return true;
    }
  });
  
  const canDelete = computed(() => {
    try {
      return hasPermission ? hasPermission('delete') : true;
    } catch {
      return true;
    }
  });
  
  const canAddArticles = computed(() => {
    try {
      return hasPermission ? hasPermission('add_articles') : true;
    } catch {
      return true;
    }
  });
  
  const canEditArticles = computed(() => {
    try {
      return hasPermission ? hasPermission('edit_articles') : true;
    } catch {
      return true;
    }
  });
  
  const canDeleteArticles = computed(() => {
    try {
      return hasPermission ? hasPermission('delete_articles') : true;
    } catch {
      return true;
    }
  });
  
  const showCreateButton = computed(() => canCreate.value);
  const canShowFilters = computed(() => true); // Always show filters
  const showSearch = computed(() => true); // Always show search
  const showPagination = computed(() => true); // Always show pagination
  
  // Safe wrapper for isFilterAvailable
  const safeIsFilterAvailable = (filterKey) => {
    try {
      return isFilterAvailable ? isFilterAvailable(filterKey) : true;
    } catch {
      return true; // Default to showing all filters
    }
  };
  
  // Transform stocks based on role
  const transformedStocks = memoizedComputed(
    () => {
      if (!stocks.value) return [];
      // Simple fallback if transformStockData is not available
      try {
        return transformStockData ? transformStockData(stocks.value) : stocks.value;
      } catch (error) {
        console.warn('Transform stock data failed, using raw data:', error);
        return stocks.value;
      }
    },
    [() => stocks.value, () => strategy.value]
  );
  
  // Available campaigns
  const availableCampaigns = computed(() => getAvailableCampaigns());
  
  // Available status options
  const availableStatuses = computed(() => getAvailableStatuses());
  
  // Available sites for selected supplier
  const computedAvailableSites = computed(() => {
    // Get all sites from the data composable (supplier's sites)
    let allSites = [];
    
    if (availableSites.value && availableSites.value.length > 0) {
      allSites = availableSites.value.filter(s => s.isActive !== false);
    }
    
    // If no sites from data composable, return empty array
    if (allSites.length === 0) {
      return [];
    }
    
    // If no campaign selected yet, return all active sites
    if (!createForm.value.campagne) {
      return allSites;
    }
    
    // Filter out sites that already have stock for the selected campaign
    const sitesWithStock = stocks.value
      .filter(stock => stock.campagne === createForm.value.campagne)
      .map(stock => stock.siteId || stock.site?._id)
      .filter(Boolean);
    
    return allSites.filter(site => !sitesWithStock.includes(site._id));
  });
  
  /**
   * Perform fetch with current filters
   */
  const performFetch = async () => {
    try {
      // For now, just call the stock data initialize method
      await initializeStockData();
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };
  
  /**
   * Fetch fournisseurs (dummy implementation for now)
   */
  const fetchFournisseurs = async () => {
    // For now, just return empty array since this is supplier-specific page
    return [];
  };
  
  /**
   * Create stock
   */
  const createStock = async (stockData) => {
    return await submitStockInventory(stockData);
  };
  
  /**
   * Delete stock (placeholder)
   */
  const deleteStock = async (stockId) => {
    console.log('Delete stock:', stockId);
    // Implementation needed
  };
  
  /**
   * Delete article stock (placeholder)
   */
  const deleteArticleStock = async (stockId, articleId) => {
    console.log('Delete article stock:', stockId, articleId);
    // Implementation needed
  };
  
  /**
   * Pagination methods
   */
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      return true;
    }
    return false;
  };
  
  const changePageSize = (newSize) => {
    itemsPerPage.value = newSize;
    currentPage.value = 1;
  };
  
  const resetPagination = () => {
    currentPage.value = 1;
  };
  
  /**
   * Helper methods
   */
  const getSiteName = (stock) => {
    // Implementation will depend on the stock structure
    return stock.siteName || stock.site?.nomSite || 'Site inconnu';
  };
  
  const getArticleInfo = (article) => {
    return {
      designation: article.designation || article.articleId?.designation || '',
      codeArticle: article.codeArticle || article.articleId?.codeArticle || ''
    };
  };
  
  const getTotalQuantityForArticle = (article) => {
    return article.quantity || article.quantiteStock || 0;
  };
  
  /**
   * Debounced fetch for search and filters
   */
  const debouncedFetch = debounce(() => {
    resetPagination();
    performFetch();
  }, 250);
  
  /**
   * Handle page change
   */
  const handlePageChange = async (page) => {
    if (goToPage(page)) {
      await performFetch();
    }
  };
  
  /**
   * Handle page size change
   */
  const handlePageSizeChange = async (newSize) => {
    changePageSize(newSize);
    await performFetch();
  };
  
  /**
   * Handle clear filters
   */
  const handleClearFilters = async () => {
    clearFilters();
    await performFetch();
  };
  
  /**
   * Handle stock creation
   */
  const handleCreateStock = async () => {
    try {
      setCreating(true);
      setCreateError(null);
      
      // Transform form data to match API expectations
      const stockData = {
        campagne: createForm.value.campagne,
        fournisseurId: createForm.value.fournisseurId,
        siteId: createForm.value.siteId,
        stocks: [] // Initial empty stock - articles will be added later
      };
      
      console.log('Creating stock with data:', stockData);
      
      const stock = await createStock(stockData);
      
      closeCreatePanel();
      await performFetch();
      
      // Success notification could be added here
      console.log('Stock créé avec succès:', stock);
      
    } catch (err) {
      console.error('Stock creation error:', err);
      setCreateError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };
  
  /**
   * Handle stock edit
   */
  const handleEditStock = (stockId) => {
    const stock = transformedStocks.value.find(s => s._id === stockId);
    if (stock) {
      openEditPanel(stock);
    }
  };
  
  /**
   * Handle weekly stock edit
   */
  const handleEditWeeklyStock = (stockId) => {
    const stock = transformedStocks.value.find(s => s._id === stockId);
    if (stock) {
      openWeeklyEditPanel(stock);
    }
  };
  
  /**
   * Handle stock edit success
   */
  const handleStockEdited = async () => {
    closeEditPanel();
    closeWeeklyEditPanel();
    await performFetch();
  };
  
  /**
   * Navigate to stock view
   */
  const viewStock = (stockId) => {
    router.push(`/stocks/${stockId}`);
  };
  
  /**
   * Navigate to supplier stocks view
   */
  const viewSupplierStocks = (fournisseurId, campagne) => {
    router.push(`/stocks/supplier/${fournisseurId}/${campagne}`);
  };
  
  /**
   * Show delete stock confirmation modal
   */
  const confirmDeleteStock = (stock) => {
    selectedStockToDelete.value = stock;
    showDeleteStockModal.value = true;
  };

  /**
   * Handle delete stock confirmation
   */
  const handleDeleteStockConfirm = async () => {
    if (selectedStockToDelete.value) {
      await deleteStock(selectedStockToDelete.value._id);
      selectedStockToDelete.value = null;
      await performFetch();
    }
    showDeleteStockModal.value = false;
  };

  /**
   * Handle delete stock cancellation
   */
  const handleDeleteStockCancel = () => {
    selectedStockToDelete.value = null;
    showDeleteStockModal.value = false;
  };
  
  /**
   * Show delete article confirmation modal
   */
  const confirmDeleteArticle = (stockId, article) => {
    selectedArticleToDelete.value = { stockId, article };
    showDeleteArticleModal.value = true;
  };

  /**
   * Handle delete article confirmation
   */
  const handleDeleteArticleConfirm = async () => {
    if (selectedArticleToDelete.value) {
      const { stockId, article } = selectedArticleToDelete.value;
      await deleteArticleStock(stockId, article._id);
      selectedArticleToDelete.value = null;
      await performFetch();
    }
    showDeleteArticleModal.value = false;
  };

  /**
   * Handle delete article cancellation
   */
  const handleDeleteArticleCancel = () => {
    selectedArticleToDelete.value = null;
    showDeleteArticleModal.value = false;
  };
  
  // Watch filters and search
  watch(searchQuery, debouncedFetch);
  watch(() => filters.value.campagne, debouncedFetch);
  watch(() => filters.value.fournisseurId, debouncedFetch);
  watch(() => filters.value.siteId, debouncedFetch);
  watch(() => filters.value.status, debouncedFetch);
  watch(() => filters.value.category, debouncedFetch);
  
  // Watch for campaign changes in create form to reset site selection
  watch(() => createForm.value.campagne, (newCampagne, oldCampagne) => {
    if (newCampagne !== oldCampagne && createForm.value.siteId) {
      // Check if the currently selected site is still available
      const isCurrentSiteAvailable = computedAvailableSites.value.some(
        site => site._id === createForm.value.siteId
      );
      
      // If the current site is no longer available (has stock for this campaign), reset it
      if (!isCurrentSiteAvailable) {
        createForm.value.siteId = '';
      }
    }
  });
  
  /**
   * Initialize data
   */
  const initializeData = async () => {
    await Promise.all([
      performFetch(),
      fetchFournisseurs()
    ]);
  };
  
  return {
    // Data
    stocks: transformedStocks,
    fournisseurs,
    isLoading,
    error,
    selectedStock,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    itemsPerPageOptions,
    
    // Filters
    ...filtersComposable,
    availableCampaigns,
    availableStatuses,
    
    // UI
    ...uiComposable,
    availableSites: computedAvailableSites,
    
    // Permissions and UI behavior
    canCreate,
    canEdit,
    canDelete,
    canAddArticles,
    canEditArticles,
    canDeleteArticles,
    showCreateButton,
    canShowFilters,
    showSearch,
    showPagination,
    tableColumns,
    isFilterAvailable: safeIsFilterAvailable,
    
    // Methods
    initializeData,
    performFetch,
    fetchFournisseurs,
    createStock,
    deleteStock,
    deleteArticleStock,
    goToPage,
    changePageSize,
    resetPagination,
    getSiteName,
    getArticleInfo,
    getTotalQuantityForArticle,
    handlePageChange,
    handlePageSizeChange,
    handleClearFilters,
    handleCreateStock,
    handleEditStock,
    handleEditWeeklyStock,
    handleStockEdited,
    viewStock,
    viewSupplierStocks,
    confirmDeleteStock,
    confirmDeleteArticle,
    handleDeleteStockConfirm,
    handleDeleteStockCancel,
    handleDeleteArticleConfirm,
    handleDeleteArticleCancel,
    showDeleteStockModal,
    showDeleteArticleModal,
    selectedStockToDelete,
    selectedArticleToDelete,
    
    // Direct access to data composable methods
    currentSupplierData,
    
    // Utilities
    formatCurrency,
    formatNumber,
    getVisiblePages
  };
}