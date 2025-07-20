import { ref, computed } from 'vue';

/**
 * Composable for managing prevision filters
 * Handles filter state, validation, and available filter options
 */
export function usePrevisionFilters() {
  // Filter state
  const searchQuery = ref('');
  const showFilters = ref(false);
  const filters = ref({
    campagne: '',
    fournisseurId: '',
    status: ''
  });

  /**
   * Count of active filters
   */
  const activeFiltersCount = computed(() => {
    return Object.values(filters.value).filter(value => value !== '').length;
  });

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => {
    return activeFiltersCount.value > 0 || searchQuery.value !== '';
  });

  /**
   * Get available campaigns based on current date
   * Business rule: After July 1st, start with current year campaigns
   */
  const getAvailableCampaigns = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    let startYear;
    if (currentMonth >= 7) {
      // After July 1st: start with current year
      startYear = currentYear;
    } else {
      // Before July 1st: start with previous year
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
    if (filters.value.campagne) {
      filterParams.campagne = filters.value.campagne;
    }
    
    if (filters.value.fournisseurId) {
      filterParams.fournisseurId = filters.value.fournisseurId;
    }
    
    if (filters.value.status) {
      filterParams.status = filters.value.status;
    }
    
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
      status: ''
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
   * Check if a filter is active
   * @param {string} filterName - Name of the filter
   * @returns {boolean} True if filter has a value
   */
  const isFilterActive = (filterName) => {
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
    getFilterValues,
    clearFilters,
    resetFilters,
    toggleFilters,
    updateFilter,
    isFilterActive,
    validateFilters
  };
}