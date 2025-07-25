/**
 * @fileoverview Composable for stock UI state management
 * @module composables/stocks/useStockUI
 */

import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/authStore';

/**
 * Composable for managing stock UI state
 * Handles panels, modals, forms, and UI interactions
 */
export function useStockUI() {
  const authStore = useAuthStore();
  // Panel state
  const isCreatePanelOpen = ref(false);
  const isEditPanelOpen = ref(false);
  const isWeeklyEditPanelOpen = ref(false);
  const showInventoryPanel = ref(false);

  // Selection state
  const selectedStockForEdit = ref(null);
  const selectedArticles = ref(new Set());
  const selectAll = ref(false);

  // Form state - auto-populate fournisseurId for suppliers
  const createForm = ref({
    campagne: '',
    fournisseurId: authStore.userRole === 'Fournisseur' ? authStore.user?.entiteId || '' : '',
    siteId: ''
  });
  const isCreating = ref(false);
  const createError = ref(null);

  // View preferences
  const viewMode = ref('list'); // 'list', 'weekly', 'campaign'
  const compactView = ref(false);
  const showImages = ref(true);
  const showBulkActions = ref(false);

  // Column visibility
  const columnsVisible = ref({
    image: true,
    code: true,
    designation: true,
    category: true,
    quantity: true,
    lastUpdate: true,
    actions: true
  });

  // Computed properties
  const hasSelection = computed(() => selectedArticles.value.size > 0);
  const selectedCount = computed(() => selectedArticles.value.size);
  const isAllSelected = computed(() => selectAll.value);

  const isFormValid = computed(() => {
    return createForm.value.campagne &&
           createForm.value.fournisseurId &&
           createForm.value.siteId &&
           !createError.value;
  });

  // Panel methods
  const openCreatePanel = () => {
    isCreatePanelOpen.value = true;
    createError.value = null;
  };

  const closeCreatePanel = () => {
    isCreatePanelOpen.value = false;
    resetCreateForm();
  };

  const openEditPanel = (stock) => {
    selectedStockForEdit.value = stock;
    isEditPanelOpen.value = true;
  };

  const closeEditPanel = () => {
    isEditPanelOpen.value = false;
    selectedStockForEdit.value = null;
  };

  const openWeeklyEditPanel = (stock) => {
    selectedStockForEdit.value = stock;
    isWeeklyEditPanelOpen.value = true;
  };

  const closeWeeklyEditPanel = () => {
    isWeeklyEditPanelOpen.value = false;
    selectedStockForEdit.value = null;
  };

  const closeAllPanels = () => {
    closeCreatePanel();
    closeEditPanel();
    closeWeeklyEditPanel();
    showInventoryPanel.value = false;
  };

  // Form methods
  const resetCreateForm = () => {
    createForm.value = {
      campagne: '',
      fournisseurId: authStore.userRole === 'Fournisseur' ? authStore.user?.entiteId || '' : '',
      siteId: ''
    };
    createError.value = null;
  };

  const setCreating = (loading) => {
    isCreating.value = loading;
  };

  const setCreateError = (error) => {
    createError.value = error;
  };

  const onFournisseurChange = () => {
    // Reset site when supplier changes
    createForm.value.siteId = '';
  };

  // View mode methods
  const setViewMode = (mode) => {
    viewMode.value = mode;
    clearSelection();
  };

  const toggleBulkActions = () => {
    showBulkActions.value = !showBulkActions.value;
    if (!showBulkActions.value) {
      clearSelection();
    }
  };

  // Selection methods
  const toggleArticleSelection = (articleId) => {
    if (selectedArticles.value.has(articleId)) {
      selectedArticles.value.delete(articleId);
    } else {
      selectedArticles.value.add(articleId);
    }
    updateSelectAllState();
  };

  const selectAllArticles = (articleIds) => {
    if (selectAll.value) {
      selectedArticles.value.clear();
      selectAll.value = false;
    } else {
      articleIds.forEach(id => selectedArticles.value.add(id));
      selectAll.value = true;
    }
  };

  const clearSelection = () => {
    selectedArticles.value.clear();
    selectAll.value = false;
  };

  const updateSelectAllState = () => {
    // This would need the total count from parent component
    // selectAll.value = selectedArticles.value.size === totalArticles;
  };

  // Layout methods
  const toggleCompactView = () => {
    compactView.value = !compactView.value;
  };

  const toggleImages = () => {
    showImages.value = !showImages.value;
  };

  const toggleColumn = (columnKey) => {
    if (columnKey in columnsVisible.value) {
      columnsVisible.value[columnKey] = !columnsVisible.value[columnKey];
    }
  };

  // Utility methods
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getVisiblePages = (currentPage, totalPages) => {
    const pages = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return {
    // Panel state
    isCreatePanelOpen,
    isEditPanelOpen,
    isWeeklyEditPanelOpen,
    showInventoryPanel,
    selectedStockForEdit,

    // Selection state
    selectedArticles,
    selectAll,
    hasSelection,
    selectedCount,
    isAllSelected,

    // Form state
    createForm,
    isCreating,
    createError,
    isFormValid,

    // View preferences
    viewMode,
    compactView,
    showImages,
    showBulkActions,
    columnsVisible,

    // Panel methods
    openCreatePanel,
    closeCreatePanel,
    openEditPanel,
    closeEditPanel,
    openWeeklyEditPanel,
    closeWeeklyEditPanel,
    closeAllPanels,

    // Form methods
    resetCreateForm,
    setCreating,
    setCreateError,
    onFournisseurChange,

    // View mode methods
    setViewMode,
    toggleBulkActions,

    // Selection methods
    toggleArticleSelection,
    selectAllArticles,
    clearSelection,
    updateSelectAllState,

    // Layout methods
    toggleCompactView,
    toggleImages,
    toggleColumn,

    // Utility methods
    formatDate,
    getVisiblePages
  };
}