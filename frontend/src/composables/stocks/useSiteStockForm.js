/**
 * @fileoverview Composable for site stock creation form
 * @module composables/stocks/useSiteStockForm
 */

import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import stockFournisseurAPI from '../../api/stockFournisseur';
import { useLoading } from '../useLoading';
import { useErrorHandler } from '../useErrorHandler';
import { notification } from '../useNotification';

/**
 * Composable for managing site stock creation form
 * Handles form state, validation, and submission
 */
export function useSiteStockForm() {
  const authStore = useAuthStore();
  const { isLoading, execute } = useLoading();
  const { withErrorHandling } = useErrorHandler();

  // Form state
  const formData = ref({
    campagne: '', // Will be set to first available campaign
    siteId: '',
    dateInventaire: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
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

  // Available campaigns
  const availableCampaigns = computed(() => getAvailableCampaigns());

  const formErrors = ref({});

  // Computed properties
  const availableSites = computed(() => {
    // For suppliers, get sites from their entity details
    if (authStore.userRole === 'Fournisseur' && authStore.user?.entiteDetails?.sites) {
      return authStore.user.entiteDetails.sites.filter(site => site.isActive);
    }
    return [];
  });

  const isFormValid = computed(() => {
    return formData.value.campagne &&
           formData.value.siteId && 
           formData.value.dateInventaire && 
           Object.keys(formErrors.value).length === 0;
  });

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.value.campagne) {
      errors.campagne = 'Veuillez sélectionner une campagne';
    }

    if (!formData.value.siteId) {
      errors.siteId = 'Veuillez sélectionner un site';
    }

    if (!formData.value.dateInventaire) {
      errors.dateInventaire = 'Veuillez sélectionner une date d\'inventaire';
    } else {
      // Check if date is not in the future
      const today = new Date().toISOString().split('T')[0];
      if (formData.value.dateInventaire > today) {
        errors.dateInventaire = 'La date d\'inventaire ne peut pas être dans le futur';
      }
    }

    formErrors.value = errors;
    return Object.keys(errors).length === 0;
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    const campaigns = getAvailableCampaigns();
    formData.value = {
      campagne: campaigns.length > 0 ? campaigns[0].value : '',
      siteId: '',
      dateInventaire: new Date().toISOString().split('T')[0]
    };
    formErrors.value = {};
  };

  /**
   * Get site name by ID
   */
  const getSiteName = (siteId) => {
    const site = availableSites.value.find(s => s._id === siteId);
    return site ? site.nomSite : '';
  };

  /**
   * Submit form to create site stock
   */
  const submitForm = async () => {
    if (!validateForm()) {
      return false;
    }

    return execute(async () => {
      try {
        const inventoryData = {
          campagne: formData.value.campagne,
          fournisseurId: authStore.user.entiteId,
          siteId: formData.value.siteId,
          dateInventaire: formData.value.dateInventaire,
          stocks: [] // Initial empty stock - articles will be added later
        };

        const response = await withErrorHandling(
          () => stockFournisseurAPI.submitStock(inventoryData),
          'Erreur lors de la création du stock de site'
        );

        notification.success(`Stock créé avec succès pour ${getSiteName(formData.value.siteId)} - Campagne ${formData.value.campagne}`);
        resetForm();
        return response;
      } catch (error) {
        throw error;
      }
    });
  };

  /**
   * Set form data
   */
  const setFormData = (data) => {
    formData.value = { ...formData.value, ...data };
  };

  /**
   * Initialize form with default values
   */
  const initializeForm = () => {
    const campaigns = getAvailableCampaigns();
    if (!formData.value.campagne && campaigns.length > 0) {
      formData.value.campagne = campaigns[0].value;
    }
  };

  // Initialize form on creation
  initializeForm();

  return {
    // State
    formData,
    formErrors,
    isLoading,
    
    // Computed
    availableSites,
    availableCampaigns,
    isFormValid,
    
    // Methods
    validateForm,
    resetForm,
    submitForm,
    getSiteName,
    setFormData
  };
}