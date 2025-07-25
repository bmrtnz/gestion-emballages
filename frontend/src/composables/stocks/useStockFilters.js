import { ref, computed } from 'vue';

/**
 * Composable for managing stock filters
 * Handles filter state, validation, and available filter options
 */
export function useStockFilters() {
  // Filter state
  const searchQuery = ref('');
  const showFilters = ref(false);
  const filters = ref({
    campagne: '',
    fournisseurId: '',
    siteId: '',
    status: '', // '', 'in_stock', 'out_of_stock', 'low_stock'
    category: ''
  });

  /**
   * Count of active filters
   */
  const activeFiltersCount = computed(() => {
    let count = 0;
    if (searchQuery.value) count++;
    Object.values(filters.value).forEach(value => {
      if (value !== '') count++;
    });
    return count;
  });

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => {
    return activeFiltersCount.value > 0;
  });

  /**
   * Get available campaigns based on current date
   * Business rule: If >= July 1st, start with current year campaigns
   */
  const getAvailableCampaigns = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    let startYear;
    if (currentMonth >= 7) {
      // >= July 1st: start with current year
      startYear = currentYear;
    } else {
      // < July 1st: start with previous year
      startYear = currentYear - 1;
    }
    
    const campaigns = [];
    for (let i = 0; i < 4; i++) {
      const year1 = startYear + i;
      const year2 = year1 + 1;
      const shortYear1 = (year1 % 100).toString().padStart(2, '0');
      const shortYear2 = (year2 % 100).toString().padStart(2, '0');
      campaigns.push({
        value: `${shortYear1}-${shortYear2}`,
        label: `${year1}-${year2}`
      });
    }
    
    return campaigns;
  };

  /**
   * Get available stock status options
   */
  const getAvailableStatuses = () => {
    return [
      { value: 'in_stock', label: 'En stock' },
      { value: 'out_of_stock', label: 'Rupture de stock' },
      { value: 'low_stock', label: 'Stock faible' }
    ];
  };

  /**
   * Get filter values for API request
   * @returns {Object} Filter parameters
   */
  const getFilterValues = () => {
    const filterParams = {};
    
    // Add search query
    if (searchQuery.value) {
      filterParams.search = searchQuery.value;
    }
    
    // Add specific filters
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value) {
        filterParams[key] = value;
      }
    });
    
    return filterParams;
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    searchQuery.value = '';
    filters.value = {
      campagne: '',
      fournisseurId: '',
      siteId: '',
      status: '',
      category: ''
    };
  };

  /**
   * Reset filter state
   */
  const resetFilters = () => {
    clearFilters();
    showFilters.value = false;
  };

  /**
   * Toggle filters visibility
   */
  const toggleFilters = () => {
    showFilters.value = !showFilters.value;
  };

  /**
   * Update a specific filter
   * @param {string} filterName - Name of the filter
   * @param {any} value - New value
   */
  const updateFilter = (filterName, value) => {
    if (filterName in filters.value) {
      filters.value[filterName] = value;
    }
  };

  /**
   * Apply quick filter
   * @param {string} filterType - Type of filter
   * @param {any} value - Filter value
   */
  const applyQuickFilter = (filterType, value) => {
    switch (filterType) {
      case 'status':
        filters.value.status = value;
        break;
      case 'category':
        filters.value.category = value;
        break;
      case 'fournisseur':
        filters.value.fournisseurId = value;
        break;
      case 'site':
        filters.value.siteId = value;
        break;
      case 'campagne':
        filters.value.campagne = value;
        break;
      default:
        break;
    }
  };

  /**
   * Check if a filter is active
   * @param {string} filterName - Name of the filter
   * @returns {boolean} True if filter has a value
   */
  const isFilterActive = (filterName) => {
    if (filterName === 'search') return searchQuery.value !== '';
    return filters.value[filterName] !== '';
  };

  /**
   * Validate filter values
   * @returns {boolean} True if all filters are valid
   */
  const validateFilters = () => {
    // Add any validation logic here
    return true;
  };

  return {
    // State
    searchQuery,
    showFilters,
    filters,
    
    // Computed
    activeFiltersCount,
    hasActiveFilters,
    
    // Methods
    getAvailableCampaigns,
    getAvailableStatuses,
    getFilterValues,
    clearFilters,
    resetFilters,
    toggleFilters,
    updateFilter,
    applyQuickFilter,
    isFilterActive,
    validateFilters
  };
}