import { ref, computed } from 'vue';

/**
 * Composable for managing fournisseur filters
 * Handles filter state, validation, and options
 */
export function useFournisseurFilters() {
  // Filter state
  const searchQuery = ref('');
  const statusFilter = ref('');
  const showFilters = ref(false);
  
  /**
   * Filter options for dropdowns
   */
  const statusOptions = [
    { value: '', label: 'Tout' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ];
  
  /**
   * Get current filter values as object
   */
  const getFilterValues = () => {
    return {
      search: searchQuery.value,
      status: statusFilter.value
    };
  };
  
  /**
   * Clear all filters
   */
  const clearFilters = () => {
    searchQuery.value = '';
    statusFilter.value = '';
    showFilters.value = false;
  };
  
  /**
   * Count active filters
   */
  const activeFiltersCount = computed(() => {
    let count = 0;
    if (searchQuery.value) count++;
    if (statusFilter.value) count++;
    return count;
  });
  
  /**
   * Validate filter values
   */
  const validateFilters = () => {
    const errors = {};
    
    // Add validation logic if needed
    if (searchQuery.value && searchQuery.value.length < 2) {
      errors.search = 'La recherche doit contenir au moins 2 caractères';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  return {
    // Filter state
    searchQuery,
    statusFilter,
    showFilters,
    
    // Computed properties
    activeFiltersCount,
    statusOptions,
    
    // Methods
    getFilterValues,
    clearFilters,
    validateFilters
  };
}