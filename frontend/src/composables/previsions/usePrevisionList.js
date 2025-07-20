import { computed, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePrevisionData } from './usePrevisionData';
import { usePrevisionFilters } from './usePrevisionFilters';
import { usePrevisionUI } from './usePrevisionUI';
import { usePrevisionTreeState } from './usePrevisionTreeState';
import { useRoleStrategy } from './useRoleStrategy';
import { usePerformanceOptimization } from '../usePerformanceOptimization';

/**
 * Main orchestrator composable for prevision list management
 * Combines all specialized composables into a unified interface
 */
export function usePrevisionList() {
  const router = useRouter();
  
  // Modal states for confirmations
  const showDeletePrevisionModal = ref(false);
  const showDeleteArticleModal = ref(false);
  const selectedPrevisionToDelete = ref(null);
  const selectedArticleToDelete = ref(null);
  
  // Initialize specialized composables
  const dataComposable = usePrevisionData();
  const filtersComposable = usePrevisionFilters();
  const uiComposable = usePrevisionUI();
  const treeComposable = usePrevisionTreeState();
  const strategyComposable = useRoleStrategy();
  const { debounce, memoizedComputed, formatCurrency, formatNumber } = usePerformanceOptimization();
  
  // Destructure for easier access
  const {
    previsions,
    fournisseurs,
    fetchPrevisions,
    fetchFournisseurs,
    createPrevision,
    deletePrevision,
    deleteArticlePrevision,
    currentPage,
    goToPage,
    changePageSize,
    resetPagination,
    getTotalUnits,
    getSiteName,
    getArticleInfo,
    getTotalQuantityForArticle,
    getConditionnementConversion
  } = dataComposable;
  
  const {
    searchQuery,
    showFilters,
    filters,
    getAvailableCampaigns,
    getFilterValues,
    clearFilters
  } = filtersComposable;
  
  const {
    isCreatePanelOpen,
    isAddArticlePanelOpen,
    selectedPrevisionForArticle,
    createForm,
    isCreating,
    createError,
    isFormValid,
    openCreatePanel,
    closeCreatePanel,
    openAddArticlePanel,
    closeAddArticlePanel,
    closeAllPanels,
    setCreating,
    setCreateError,
    onFournisseurChange,
    formatDate,
    getVisiblePages
  } = uiComposable;
  
  const {
    isExpanded,
    toggleExpanded,
    initializePrevisionTree,
    computedIsTreeExpanded,
    toggleTreeState
  } = treeComposable;
  
  const {
    transformTableData,
    canCreate,
    canEdit,
    canDelete,
    canAddArticles,
    canEditArticles,
    canDeleteArticles,
    showCreateButton,
    canShowFilters,
    showSearch,
    allowTreeToggle,
    showPagination,
    tableColumns,
    isFilterAvailable,
    strategy,
    uiBehavior
  } = strategyComposable;
  
  // Transform previsions based on role
  const transformedPrevisions = memoizedComputed(
    () => transformTableData(previsions.value),
    [() => previsions.value, () => strategyComposable.strategy.value]
  );
  
  // Tree state management
  const isTreeExpanded = computedIsTreeExpanded(transformedPrevisions);
  
  /**
   * Wrapper function to toggle tree state with current previsions data
   */
  const handlePrevisionTreeToggle = () => {
    toggleTreeState(transformedPrevisions.value);
  };

  
  // Available campaigns
  const availableCampaigns = computed(() => getAvailableCampaigns());
  
  // Available sites for selected supplier
  const availableSites = computed(() => {
    const supplier = fournisseurs.value.find(f => f._id === createForm.value.fournisseurId);
    if (!supplier) return [];
    return supplier.sites?.filter(s => s.isActive) || [];
  });
  
  /**
   * Perform fetch with current filters
   */
  const performFetch = async () => {
    const filterValues = getFilterValues();
    await fetchPrevisions(filterValues, { page: currentPage.value });
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
   * Handle prevision creation
   */
  const handleCreatePrevision = async () => {
    try {
      setCreating(true);
      setCreateError(null);
      
      const prevision = await createPrevision(createForm.value);
      
      closeCreatePanel();
      await performFetch();
      
      // Success notification could be added here
      console.log('Prévision créée avec succès:', prevision);
      
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };
  
  /**
   * Handle article addition to prevision
   */
  const handleAddArticlePrevision = (previsionId) => {
    const prevision = transformedPrevisions.value.find(p => p._id === previsionId);
    if (prevision) {
      openAddArticlePanel(prevision);
    }
  };
  
  /**
   * Handle article added success
   */
  const handleArticleAdded = async () => {
    closeAddArticlePanel();
    await performFetch();
  };
  
  /**
   * Navigate to prevision view
   */
  const viewPrevision = (previsionId) => {
    router.push(`/previsions/${previsionId}`);
  };
  
  /**
   * Navigate to supplier previsions view
   */
  const viewSupplierPrevisions = (fournisseurId, campagne) => {
    router.push(`/previsions/supplier/${fournisseurId}/${campagne}`);
  };
  
  
  /**
   * Navigate to article prevision view
   */
  const viewArticlePrevision = (previsionId, articlePrevisionId) => {
    router.push(`/previsions/${previsionId}/articles/${articlePrevisionId}`);
  };
  
  /**
   * Navigate to article prevision edit
   */
  const editArticlePrevision = (previsionId, articlePrevisionId) => {
    router.push(`/previsions/${previsionId}/articles/${articlePrevisionId}/edit`);
  };
  
  /**
   * Show delete prevision confirmation modal
   */
  const confirmDeletePrevision = (prevision) => {
    selectedPrevisionToDelete.value = prevision;
    showDeletePrevisionModal.value = true;
  };

  /**
   * Handle delete prevision confirmation
   */
  const handleDeletePrevisionConfirm = async () => {
    if (selectedPrevisionToDelete.value) {
      await deletePrevision(selectedPrevisionToDelete.value._id);
      selectedPrevisionToDelete.value = null;
    }
    showDeletePrevisionModal.value = false;
  };

  /**
   * Handle delete prevision cancellation
   */
  const handleDeletePrevisionCancel = () => {
    selectedPrevisionToDelete.value = null;
    showDeletePrevisionModal.value = false;
  };
  
  /**
   * Show delete article confirmation modal
   */
  const confirmDeleteArticle = (previsionId, articlePrevision) => {
    selectedArticleToDelete.value = { previsionId, articlePrevision };
    showDeleteArticleModal.value = true;
  };

  /**
   * Handle delete article confirmation
   */
  const handleDeleteArticleConfirm = async () => {
    if (selectedArticleToDelete.value) {
      const { previsionId, articlePrevision } = selectedArticleToDelete.value;
      await deleteArticlePrevision(previsionId, articlePrevision._id);
      selectedArticleToDelete.value = null;
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
  watch(() => filters.value.status, debouncedFetch);
  
  // Initialize tree state when data changes
  watch(transformedPrevisions, (newPrevisions) => {
    if (newPrevisions.length > 0) {
      initializePrevisionTree(newPrevisions);
    }
  }, { immediate: true });
  
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
    previsions: transformedPrevisions,
    fournisseurs,
    ...dataComposable,
    
    // Filters
    ...filtersComposable,
    availableCampaigns,
    
    // UI
    ...uiComposable,
    availableSites,
    
    // Tree state
    isExpanded,
    toggleExpanded,
    isTreeExpanded,
    handlePrevisionTreeToggle,
    
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
    allowTreeToggle,
    showPagination,
    tableColumns,
    isFilterAvailable,
    
    // Methods
    initializeData,
    performFetch,
    handlePageChange,
    handlePageSizeChange,
    handleClearFilters,
    handleCreatePrevision,
    handleAddArticlePrevision,
    handleArticleAdded,
    viewPrevision,
    viewSupplierPrevisions,
    viewArticlePrevision,
    editArticlePrevision,
    confirmDeletePrevision,
    confirmDeleteArticle,
    handleDeletePrevisionConfirm,
    handleDeletePrevisionCancel,
    handleDeleteArticleConfirm,
    handleDeleteArticleCancel,
    showDeletePrevisionModal,
    showDeleteArticleModal,
    selectedPrevisionToDelete,
    selectedArticleToDelete,
    
    // Utilities
    formatCurrency,
    formatNumber,
    getVisiblePages
  };
}