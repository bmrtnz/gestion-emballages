import { computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useArticleData } from './useArticleData';
import { useArticleFilters } from './useArticleFilters';
import { useArticleTreeState } from './useArticleTreeState';
import { useRoleStrategy } from './useRoleStrategy';
import { usePerformanceOptimization } from './usePerformanceOptimization';

/**
 * Main composable for article list functionality
 * Orchestrates data fetching, filtering, and UI state
 */
export function useArticleList() {
  const authStore = useAuthStore();
  
  // Performance optimization utilities
  const { memoize, memoizedComputed, debounce, selectiveComputed, measure } = usePerformanceOptimization();
  
  // Initialize sub-composables
  const {
    articles,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    fetchArticles,
    fetchCategories,
    goToPage,
    goToPrevPage,
    goToNextPage,
    handlePageSizeChange,
    resetPagination
  } = useArticleData();
  
  const {
    searchQuery,
    categoryFilter,
    supplierFilter,
    statusFilter,
    showFilters,
    availableFilters: filterAvailableFilters,
    activeFiltersCount,
    statusOptions,
    categoryOptions,
    supplierOptions,
    getFilterValues,
    clearFilters,
    isFilterAvailable: isFilterAvailableFromFilters,
    setAvailableCategories,
    setSupplierOptions,
    validateFilters
  } = useArticleFilters();
  
  // Will be initialized after tableDataSource is defined
  let treeStateComposable;
  
  const {
    transformTableData,
    availableFilters: strategyAvailableFilters,
    uiBehavior,
    permissions,
    canEdit,
    useTreeView,
    showTreeControls: strategyShowTreeControls,
    showExpandButtons,
    alwaysExpanded,
    allowRowActions,
    getDynamicColumnTitle,
    getActionConfig,
    isFilterAvailable: isFilterAvailableFromStrategy
  } = useRoleStrategy();
  
  /**
   * Transform articles to table data structure using role strategy
   * Memoized for performance with large datasets
   */
  const tableDataSource = memoizedComputed(
    () => measure('Data Transformation', () => transformTableData(articles.value)),
    [() => articles.value, () => authStore.userRole]
  );
  
  /**
   * Get supplier name for column header (for Fournisseur users)
   * Memoized to avoid recalculation when table data structure changes
   */
  const supplierName = selectiveComputed(
    () => {
      if (authStore.userRole === 'Fournisseur' && tableDataSource.value.length > 0) {
        return tableDataSource.value[0].supplierName;
      }
      return 'Fournisseur';
    },
    [() => authStore.userRole, () => tableDataSource.value.length > 0 ? tableDataSource.value[0]?.supplierName : null]
  );

  // Initialize tree state with tableDataSource
  treeStateComposable = useArticleTreeState(tableDataSource);
  const {
    shouldShowSuppliers,
    initializeArticleTree,
    toggleTreeState: baseToggleTreeState,
    shouldShowTreeControls: baseShouldShowTreeControls,
    shouldShowExpandButton: baseShouldShowExpandButton,
    getChevronClass,
    isTreeExpanded,
    toggleExpanded
  } = treeStateComposable;
  
  /**
   * Combine filter availability from both sources
   */
  const availableFilters = computed(() => {
    return strategyAvailableFilters.value;
  });
  
  /**
   * Use strategy-based filter availability check
   */
  const isFilterAvailable = (filterName) => {
    return isFilterAvailableFromStrategy(filterName);
  };
  
  /**
   * Use strategy-based tree controls visibility
   */
  const shouldShowTreeControls = computed(() => {
    return strategyShowTreeControls.value;
  });
  
  /**
   * Use strategy-based expand button visibility
   */
  const shouldShowExpandButton = (article) => {
    if (!showExpandButtons.value) return false;
    return baseShouldShowExpandButton(article);
  };
  
  /**
   * Use strategy-based tree state toggle
   */
  const toggleTreeState = () => {
    if (!strategyShowTreeControls.value) return;
    return baseToggleTreeState(tableDataSource.value);
  };
  
  /**
   * Optimized debounced fetch articles function
   * Uses performance-optimized debouncing with smart delay adjustment
   */
  const debouncedFetchArticles = debounce(() => {
    resetPagination();
    performFetch();
  }, 250); // Reduced from 300ms for better responsiveness
  
  /**
   * Perform the actual fetch with current filter values
   */
  const performFetch = async () => {
    const filterValues = getFilterValues();
    const result = await fetchArticles(filterValues, { page: currentPage.value });
    
    // Update supplier options with data from API response
    if (result?.availableSuppliers) {
      setSupplierOptions(result.availableSuppliers);
    }
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
   * Handle filter clear
   */
  const handleClearFilters = async () => {
    clearFilters();
    await performFetch();
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
  
  /**
   * Memoized helper functions for formatting to avoid repeated calculations
   */
  const formatConditionnement = memoize((supplier) => {
    if (!supplier.quantiteParConditionnement || !supplier.uniteConditionnement) {
      return supplier.uniteConditionnement || '';
    }
    
    const quantity = supplier.quantiteParConditionnement;
    const unit = supplier.uniteConditionnement;
    
    // Special case for 'Unité'
    if (unit === 'Unité') {
      return `${quantity} par ${unit}`;
    }
    
    // Handle pluralization of 'unités'
    const unitText = quantity === 1 ? 'unité' : 'unités';
    return `${quantity} ${unitText} par ${unit}`;
  }, (args) => `${args[0]?.quantiteParConditionnement}-${args[0]?.uniteConditionnement}`);
  
  const getConditionnementPrice = memoize((supplier) => {
    if (!supplier.prixUnitaire || !supplier.quantiteParConditionnement) {
      return null;
    }
    return supplier.prixUnitaire * supplier.quantiteParConditionnement;
  }, (args) => `${args[0]?.prixUnitaire}-${args[0]?.quantiteParConditionnement}`);
  
  // Currency formatter singleton to avoid creating new formatters
  const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  const formatCurrency = memoize((amount) => {
    if (!amount && amount !== 0) return null;
    return currencyFormatter.format(amount);
  });
  
  // Date formatter singleton
  const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const formatDate = memoize((dateString) => {
    if (!dateString) return 'N/A';
    return dateFormatter.format(new Date(dateString));
  });
  
  // Watch for filter changes
  watch(searchQuery, debouncedFetchArticles);
  watch(categoryFilter, debouncedFetchArticles);
  
  // Watch filters based on role strategy
  watch(supplierFilter, () => {
    if (isFilterAvailable('supplier')) {
      debouncedFetchArticles();
    }
  });
  
  watch(statusFilter, () => {
    if (isFilterAvailable('status')) {
      debouncedFetchArticles();
    }
  });
  
  // Initialize tree state when data changes
  watch(tableDataSource, (data) => {
    if (data.length > 0) {
      initializeArticleTree(data);
    }
  }, { immediate: true });
  
  // Watch for authentication changes
  watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
    if (isAuthenticated) {
      await initializeData();
    }
  });
  
  /**
   * Initialize data on mount
   */
  const initializeData = async () => {
    if (!authStore.isAuthenticated) {
      console.warn('User not authenticated when initializing ArticleList');
      return;
    }
    
    // Fetch categories and set them
    const categories = await fetchCategories();
    setAvailableCategories(categories);
    
    // Fetch initial articles (this will also update supplier options)
    await performFetch();
  };
  
  onMounted(initializeData);
  
  return {
    // Data
    articles,
    tableDataSource,
    supplierName,
    isLoading,
    
    // Filters
    searchQuery,
    categoryFilter,
    supplierFilter,
    statusFilter,
    showFilters,
    availableFilters,
    activeFiltersCount,
    statusOptions,
    categoryOptions,
    supplierOptions,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    paginationPages,
    
    // Tree state
    shouldShowSuppliers,
    shouldShowTreeControls,
    shouldShowExpandButton,
    getChevronClass,
    isTreeExpanded,
    toggleExpanded,
    
    // Methods
    handlePageChange,
    handlePageSizeChange,
    handleClearFilters,
    toggleTreeState,
    isFilterAvailable,
    validateFilters,
    
    // Strategy-based methods
    getDynamicColumnTitle,
    getActionConfig,
    
    // UI behavior from strategy
    useTreeView,
    allowRowActions,
    permissions,
    
    // Helper functions
    formatConditionnement,
    getConditionnementPrice,
    formatCurrency,
    formatDate,
    
    // Expose for parent component
    fetchArticles: performFetch
  };
}