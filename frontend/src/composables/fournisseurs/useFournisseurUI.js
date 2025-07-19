import { ref, computed } from 'vue';
import { usePerformanceOptimization } from '../usePerformanceOptimization';

/**
 * Composable for managing fournisseur UI state and behavior
 * Handles panels, selections, and UI transformations
 */
export function useFournisseurUI() {
  const { memoize } = usePerformanceOptimization();
  
  // Panel states
  const isSiteCreatePanelOpen = ref(false);
  const isEditPanelOpen = ref(false);
  const isSiteEditPanelOpen = ref(false);
  
  // Selection states
  const selectedFournisseurForSite = ref(null);
  const selectedFournisseurForEdit = ref(null);
  const selectedSiteForEdit = ref(null);
  const selectedFournisseurIdForSiteEdit = ref(null);
  
  /**
   * Transform fournisseurs to table data structure
   */
  const tableDataSource = computed(() => {
    return (fournisseurs) => {
      return fournisseurs.map(f => ({
        ...f,
        key: f._id,
        children: f.sites || []
      }));
    };
  });
  
  /**
   * Format address for display
   */
  const formatAddress = memoize((adresse) => {
    if (!adresse) return { line1: '', line2: '' };
    return {
      line1: adresse.rue || '',
      line2: `${adresse.codePostal || ''} ${adresse.ville || ''}${adresse.pays ? ', ' + adresse.pays : ''}`
    };
  });
  
  /**
   * Edit fournisseur
   */
  const editFournisseur = (fournisseur) => {
    selectedFournisseurForEdit.value = fournisseur;
    isEditPanelOpen.value = true;
  };
  
  /**
   * Open site creation panel
   */
  const openSiteCreatePanel = (fournisseur) => {
    selectedFournisseurForSite.value = fournisseur;
    isSiteCreatePanelOpen.value = true;
  };
  
  /**
   * Edit site
   */
  const editSite = (site, fournisseurId) => {
    selectedSiteForEdit.value = site;
    selectedFournisseurIdForSiteEdit.value = fournisseurId;
    isSiteEditPanelOpen.value = true;
  };
  
  /**
   * Handle site created
   */
  const handleSiteCreated = () => {
    isSiteCreatePanelOpen.value = false;
    selectedFournisseurForSite.value = null;
  };
  
  /**
   * Handle fournisseur updated
   */
  const handleFournisseurUpdated = () => {
    isEditPanelOpen.value = false;
    selectedFournisseurForEdit.value = null;
  };

  /**
   * Handle fournisseur data updated without closing panel
   */
  const handleFournisseurDataUpdated = () => {
    // Only refresh data, don't close panel
    // This is used when documents are added/updated
  };
  
  /**
   * Handle site updated
   */
  const handleSiteUpdated = () => {
    isSiteEditPanelOpen.value = false;
    selectedSiteForEdit.value = null;
    selectedFournisseurIdForSiteEdit.value = null;
  };
  
  /**
   * Close all panels
   */
  const closeAllPanels = () => {
    isSiteCreatePanelOpen.value = false;
    isEditPanelOpen.value = false;
    isSiteEditPanelOpen.value = false;
    selectedFournisseurForSite.value = null;
    selectedFournisseurForEdit.value = null;
    selectedSiteForEdit.value = null;
    selectedFournisseurIdForSiteEdit.value = null;
  };
  
  return {
    // Panel states
    isSiteCreatePanelOpen,
    isEditPanelOpen,
    isSiteEditPanelOpen,
    
    // Selection states
    selectedFournisseurForSite,
    selectedFournisseurForEdit,
    selectedSiteForEdit,
    selectedFournisseurIdForSiteEdit,
    
    // Computed properties
    tableDataSource,
    
    // Methods
    formatAddress,
    editFournisseur,
    openSiteCreatePanel,
    editSite,
    handleSiteCreated,
    handleFournisseurUpdated,
    handleFournisseurDataUpdated,
    handleSiteUpdated,
    closeAllPanels
  };
}