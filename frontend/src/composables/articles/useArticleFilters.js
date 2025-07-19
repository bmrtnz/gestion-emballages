import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../../stores/authStore';

/**
 * Composable for managing article filters
 * Handles filter state, validation, and role-based configuration
 */
export function useArticleFilters() {
  const authStore = useAuthStore();
  
  // Filter state
  const searchQuery = ref('');
  const categoryFilter = ref('');
  const supplierFilter = ref('');
  const statusFilter = ref('');
  const showFilters = ref(false);
  
  // Available categories (will be populated from API)
  const availableCategories = ref([]);
  
  // Categories from current dataset (dynamic based on displayed data)
  const datasetCategories = ref([]);
  
  // Available suppliers (will be populated from API)
  const availableSuppliers = ref([]);
  
  /**
   * Get available filters based on user role
   */
  const availableFilters = computed(() => {
    const baseFilters = ['search', 'category'];
    
    if (authStore.userRole !== 'Fournisseur') {
      baseFilters.push('status', 'supplier');
    }
    
    return baseFilters;
  });
  
  /**
   * Filter options for dropdowns
   */
  const statusOptions = [
    { value: '', label: 'Tout' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ];
  
  const categoryOptions = computed(() => {
    // Use categories from current dataset if available, otherwise fallback to API categories
    const categoriesToUse = datasetCategories.value.length > 0 ? datasetCategories.value : availableCategories.value;
    
    return [
      { value: '', label: 'Toutes les catégories' },
      ...categoriesToUse.map(cat => ({ value: cat, label: cat }))
    ];
  });
  
  const supplierOptions = computed(() => {
    return [
      { value: '', label: 'Tous les fournisseurs' },
      ...availableSuppliers.value.map(name => ({ value: name, label: name }))
    ];
  });
  
  /**
   * Get current filter values as object
   */
  const getFilterValues = () => {
    const filters = {
      search: searchQuery.value,
      categorie: categoryFilter.value
    };
    
    // Only include role-specific filters
    if (authStore.userRole !== 'Fournisseur') {
      filters.status = statusFilter.value;
      filters.fournisseur = supplierFilter.value;
    }
    
    return filters;
  };
  
  /**
   * Clear all filters
   */
  const clearFilters = () => {
    searchQuery.value = '';
    categoryFilter.value = '';
    
    if (authStore.userRole !== 'Fournisseur') {
      supplierFilter.value = '';
      statusFilter.value = '';
    }
    
    showFilters.value = false;
  };
  
  /**
   * Count active filters
   */
  const activeFiltersCount = computed(() => {
    let count = 0;
    
    if (searchQuery.value) count++;
    if (categoryFilter.value) count++;
    
    if (authStore.userRole !== 'Fournisseur') {
      if (supplierFilter.value) count++;
      if (statusFilter.value) count++;
    }
    
    return count;
  });
  
  /**
   * Check if a specific filter is available for current user
   */
  const isFilterAvailable = (filterName) => {
    return availableFilters.value.includes(filterName);
  };
  
  /**
   * Set available categories (called from parent component)
   */
  const setAvailableCategories = (categories) => {
    availableCategories.value = categories;
  };
  
  /**
   * Update categories based on current dataset (called from parent component)
   */
  const updateDatasetCategories = (articles) => {
    if (!articles || articles.length === 0) {
      datasetCategories.value = [];
      return;
    }
    
    // Extract unique categories from current articles dataset
    const categories = new Set();
    articles.forEach(article => {
      if (article.categorie && article.categorie.trim()) {
        categories.add(article.categorie.trim());
      }
    });
    
    // Sort categories alphabetically
    datasetCategories.value = Array.from(categories).sort();
  };
  
  /**
   * Set dataset categories directly (called from parent component)
   */
  const setDatasetCategories = (categories) => {
    if (Array.isArray(categories)) {
      datasetCategories.value = categories.filter(cat => cat && cat.trim()).sort();
    } else {
      datasetCategories.value = [];
    }
  };
  
  /**
   * Set supplier options (called from parent component)
   */
  const setSupplierOptions = (suppliers) => {
    availableSuppliers.value = suppliers || [];
  };
  
  /**
   * Validate filter values
   */
  const validateFilters = () => {
    const errors = {};
    
    // Add validation logic if needed
    // For example, check if search query is too short
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
    categoryFilter,
    supplierFilter,
    statusFilter,
    showFilters,
    availableCategories,
    availableSuppliers,
    datasetCategories,
    
    // Computed properties
    availableFilters,
    activeFiltersCount,
    statusOptions,
    categoryOptions,
    supplierOptions,
    
    // Methods
    getFilterValues,
    clearFilters,
    isFilterAvailable,
    setAvailableCategories,
    updateDatasetCategories,
    setDatasetCategories,
    setSupplierOptions,
    validateFilters
  };
}