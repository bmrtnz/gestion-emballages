import { ref, computed } from 'vue';

/**
 * Composable for managing UI state of prevision components
 * Handles panel states, form management, and UI interactions
 */
export function usePrevisionUI() {
  // Panel states
  const isCreatePanelOpen = ref(false);
  const isAddArticlePanelOpen = ref(false);
  const selectedPrevisionForArticle = ref(null);
  const selectedPrevisionForEdit = ref(null);
  
  // Create form state
  const createForm = ref({
    campagne: '',
    fournisseurId: '',
    siteId: ''
  });
  
  const isCreating = ref(false);
  const createError = ref(null);

  // Mobile view state
  const isMobileView = ref(false);

  /**
   * Check if form is valid
   */
  const isFormValid = computed(() => {
    return createForm.value.campagne && 
           createForm.value.fournisseurId && 
           createForm.value.siteId;
  });

  /**
   * Open create panel
   */
  const openCreatePanel = () => {
    resetCreateForm();
    isCreatePanelOpen.value = true;
  };

  /**
   * Close create panel
   */
  const closeCreatePanel = () => {
    isCreatePanelOpen.value = false;
    createError.value = null;
  };

  /**
   * Reset create form
   */
  const resetCreateForm = () => {
    createForm.value = {
      campagne: '',
      fournisseurId: '',
      siteId: ''
    };
    createError.value = null;
  };

  /**
   * Open add article panel
   * @param {Object} prevision - Prevision to add article to
   */
  const openAddArticlePanel = (prevision) => {
    selectedPrevisionForArticle.value = prevision;
    isAddArticlePanelOpen.value = true;
  };

  /**
   * Close add article panel
   */
  const closeAddArticlePanel = () => {
    isAddArticlePanelOpen.value = false;
    selectedPrevisionForArticle.value = null;
  };

  /**
   * Close all panels
   */
  const closeAllPanels = () => {
    closeCreatePanel();
    closeAddArticlePanel();
  };

  /**
   * Set creating state
   * @param {boolean} state - Loading state
   */
  const setCreating = (state) => {
    isCreating.value = state;
  };

  /**
   * Set create error
   * @param {string|null} error - Error message
   */
  const setCreateError = (error) => {
    createError.value = error;
  };

  /**
   * Update form field
   * @param {string} field - Field name
   * @param {any} value - Field value
   */
  const updateFormField = (field, value) => {
    if (field in createForm.value) {
      createForm.value[field] = value;
    }
  };

  /**
   * Handle fournisseur change
   * Reset site selection when supplier changes
   */
  const onFournisseurChange = () => {
    createForm.value.siteId = '';
  };

  /**
   * Set mobile view state
   * @param {boolean} isMobile - Mobile state
   */
  const setMobileView = (isMobile) => {
    isMobileView.value = isMobile;
  };

  /**
   * Format date for display
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  /**
   * Get visible pages for pagination
   * @param {number} currentPage - Current page
   * @param {number} totalPages - Total pages
   * @returns {Array<number>} Array of page numbers
   */
  const getVisiblePages = (currentPage, totalPages) => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  /**
   * Get confirmation message for deletion
   * @param {string} type - Type of deletion
   * @param {Object} item - Item to delete
   * @returns {string} Confirmation message
   */
  const getDeleteConfirmMessage = (type, item) => {
    if (type === 'prevision') {
      return `Êtes-vous sûr de vouloir supprimer la prévision ${item.campagne} ?`;
    } else if (type === 'article') {
      const articleInfo = item.articleId?.designation || 'cet article';
      return `Êtes-vous sûr de vouloir supprimer ${articleInfo} de cette prévision ?`;
    }
    return 'Êtes-vous sûr de vouloir supprimer cet élément ?';
  };

  return {
    // Panel states
    isCreatePanelOpen,
    isAddArticlePanelOpen,
    selectedPrevisionForArticle,
    selectedPrevisionForEdit,
    
    // Form state
    createForm,
    isCreating,
    createError,
    isFormValid,
    
    // UI state
    isMobileView,
    
    // Methods
    openCreatePanel,
    closeCreatePanel,
    resetCreateForm,
    openAddArticlePanel,
    closeAddArticlePanel,
    closeAllPanels,
    setCreating,
    setCreateError,
    updateFormField,
    onFournisseurChange,
    setMobileView,
    formatDate,
    getVisiblePages,
    getDeleteConfirmMessage
  };
}