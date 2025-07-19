import { ref, computed, watch } from 'vue';

export function useUserFilters() {
  // Filter state
  const searchQuery = ref('');
  const statusFilter = ref(''); // '', 'active', 'inactive'
  const roleFilter = ref(''); // '', 'Manager', 'Gestionnaire', 'Station', 'Fournisseur'
  const showFilters = ref(false);

  // Filter options
  const statusOptions = [
    { label: 'Tout', value: '' },
    { label: 'Actif', value: 'active' },
    { label: 'Inactif', value: 'inactive' }
  ];

  const roleOptions = [
    { label: 'Tous les rôles', value: '' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Gestionnaire', value: 'Gestionnaire' },
    { label: 'Station', value: 'Station' },
    { label: 'Fournisseur', value: 'Fournisseur' }
  ];

  // Computed properties
  const activeFiltersCount = computed(() => {
    let count = 0;
    if (statusFilter.value) count++;
    if (roleFilter.value) count++;
    return count;
  });

  const currentFilters = computed(() => ({
    search: searchQuery.value.trim(),
    status: statusFilter.value,
    role: roleFilter.value
  }));

  const hasActiveFilters = computed(() => {
    return activeFiltersCount.value > 0 || searchQuery.value.trim() !== '';
  });

  // Methods
  const toggleFilters = () => {
    showFilters.value = !showFilters.value;
  };

  const clearFilters = () => {
    searchQuery.value = '';
    statusFilter.value = '';
    roleFilter.value = '';
  };

  const applyFilters = (fetchCallback) => {
    if (typeof fetchCallback === 'function') {
      fetchCallback(currentFilters.value);
    }
  };

  // Utility functions
  const isFilterAvailable = (filterName) => {
    const availableFilters = ['status', 'role'];
    return availableFilters.includes(filterName);
  };

  const getFilterValue = (filterName) => {
    switch (filterName) {
      case 'status':
        return statusFilter.value;
      case 'role':
        return roleFilter.value;
      default:
        return '';
    }
  };

  const setFilterValue = (filterName, value) => {
    switch (filterName) {
      case 'status':
        statusFilter.value = value;
        break;
      case 'role':
        roleFilter.value = value;
        break;
    }
  };

  // Search debouncing
  const createDebouncedSearch = (callback, delay = 300) => {
    let timeoutId;
    
    return (searchTerm) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(searchTerm);
      }, delay);
    };
  };

  return {
    // Filter state
    searchQuery,
    statusFilter,
    roleFilter,
    showFilters,
    
    // Filter options
    statusOptions,
    roleOptions,
    
    // Computed properties
    activeFiltersCount,
    currentFilters,
    hasActiveFilters,
    
    // Methods
    toggleFilters,
    clearFilters,
    applyFilters,
    isFilterAvailable,
    getFilterValue,
    setFilterValue,
    createDebouncedSearch
  };
}