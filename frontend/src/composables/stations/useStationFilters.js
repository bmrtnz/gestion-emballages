import { ref, computed, watch } from 'vue';

export function useStationFilters() {
  // Filter state
  const searchQuery = ref('');
  const statusFilter = ref(''); // '', 'active', 'inactive'
  const showFilters = ref(false);
  
  // Filter options
  const statusOptions = [
    { value: '', label: 'Tout' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ];
  
  // Computed properties
  const activeFiltersCount = computed(() => {
    let count = 0;
    if (searchQuery.value) count++;
    if (statusFilter.value) count++;
    return count;
  });
  
  const hasActiveFilters = computed(() => activeFiltersCount.value > 0);
  
  const currentFilters = computed(() => ({
    search: searchQuery.value,
    status: statusFilter.value
  }));
  
  // Methods
  const clearFilters = () => {
    searchQuery.value = '';
    statusFilter.value = '';
    showFilters.value = false;
  };
  
  const toggleFilters = () => {
    showFilters.value = !showFilters.value;
  };
  
  // Debounced filter change handler
  const createDebouncedHandler = (callback, delay = 300) => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(callback, delay);
    };
  };
  
  return {
    // Filter state
    searchQuery,
    statusFilter,
    showFilters,
    
    // Options
    statusOptions,
    
    // Computed
    activeFiltersCount,
    hasActiveFilters,
    currentFilters,
    
    // Methods
    clearFilters,
    toggleFilters,
    createDebouncedHandler
  };
}