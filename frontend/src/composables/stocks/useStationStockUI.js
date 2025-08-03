/**
 * @fileoverview Station Stock UI State Management Composable
 * Handles UI state, filters, selections, and component interactions
 */

import { ref, computed, watch } from 'vue';
import articlesAPI from '../../api/articles';
import { useErrorHandler } from '../useErrorHandler';
import { usePerformanceOptimization } from '../usePerformanceOptimization';

export function useStationStockUI() {
  const { handleError } = useErrorHandler();
  const { debounce } = usePerformanceOptimization();

  // UI State
  const selectedWeek = ref(null); // Will be set after weekOptions are computed
  const pendingWeekChange = ref(null);
  const articleFilter = ref('');
  
  // Modal state
  const showWeekChangeConfirmModal = ref(false);
  
  // Add article panel state
  const showAddArticlePanel = ref(false);
  const searchArticles = ref([]);
  const articleSearchQuery = ref('');
  const isLoadingArticleSearch = ref(false);
  const selectedArticleToAdd = ref(null);
  const articleSearchPage = ref(1);
  const articleSearchTotalPages = ref(0);

  // Week management
  function getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }

  const getCurrentCampaign = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (currentMonth >= 7) {
      const nextYear = currentYear + 1;
      return `${currentYear.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;
    } else {
      const prevYear = currentYear - 1;
      return `${prevYear.toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
    }
  };

  const currentCampaign = ref(getCurrentCampaign());

  // Available weeks (from campaign start to current week)
  const availableWeeks = computed(() => {
    const weeks = [];
    
    // Get current week number
    const currentWeekNumber = getCurrentWeek();
    
    // For campaign 25-26, start from week 27 (July) up to current week
    // Campaign starts at week 27 and goes to current week (no future weeks)
    const campaignStartWeek = 27;
    const maxWeek = Math.min(currentWeekNumber, 52); // Don't go beyond current week or week 52
    
    for (let i = campaignStartWeek; i <= maxWeek; i++) {
      weeks.push(i);
    }
    
    return weeks;
  });

  // Week options for picker (for compatibility)
  const weekOptions = computed(() => {
    const campaignParts = currentCampaign.value.split('-');
    if (campaignParts.length !== 2) return [];
    
    const firstYear = parseInt(`20${campaignParts[0]}`);
    
    return availableWeeks.value.map(week => ({
      value: week,
      label: `S${week}`
    }));
  });

  // Navigation helpers
  const canGoToPreviousWeek = computed(() => {
    if (!selectedWeek.value) return false;
    const currentIndex = availableWeeks.value.indexOf(selectedWeek.value);
    return currentIndex > 0;
  });

  const canGoToNextWeek = computed(() => {
    if (!selectedWeek.value) return false;
    const currentIndex = availableWeeks.value.indexOf(selectedWeek.value);
    return currentIndex < availableWeeks.value.length - 1;
  });

  const goToPreviousWeek = () => {
    if (!canGoToPreviousWeek.value) return;
    const currentIndex = availableWeeks.value.indexOf(selectedWeek.value);
    if (currentIndex > 0) {
      selectedWeek.value = availableWeeks.value[currentIndex - 1];
    }
  };

  const goToNextWeek = () => {
    if (!canGoToNextWeek.value) return;
    const currentIndex = availableWeeks.value.indexOf(selectedWeek.value);
    if (currentIndex < availableWeeks.value.length - 1) {
      selectedWeek.value = availableWeeks.value[currentIndex + 1];
    }
  };

  const currentYear = computed(() => {
    // Parse campaign to determine which year to use for week calculations
    const campaignParts = currentCampaign.value.split('-');
    if (campaignParts.length !== 2) return new Date().getFullYear();
    
    const firstYear = parseInt(`20${campaignParts[0]}`);
    const secondYear = parseInt(`20${campaignParts[1]}`);
    
    // For business year logic: use first year for weeks 27-52, second year for weeks 1-26
    if (selectedWeek.value && selectedWeek.value >= 27) {
      return firstYear;
    } else {
      return secondYear;
    }
  });

  // Check if selected week is in the past
  const isWeekInPast = computed(() => {
    if (!selectedWeek.value) return false;
    
    const currentWeek = getCurrentWeek();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Get the year for the selected week based on business logic
    const selectedWeekYear = currentYear.value;
    
    // If selected week is in a different year than current
    if (selectedWeekYear < currentYear) {
      return true;
    } else if (selectedWeekYear > currentYear) {
      return false;
    }
    
    // Same year, compare week numbers
    return selectedWeek.value < currentWeek;
  });

  const canShowForm = computed(() => {
    return selectedWeek.value;
  });

  // Article search methods
  const searchForArticles = async () => {
    if (!articleSearchQuery.value.trim()) {
      searchArticles.value = [];
      return;
    }

    try {
      isLoadingArticleSearch.value = true;
      
      const params = {
        page: articleSearchPage.value,
        limit: 10,
        isActive: true,
        search: articleSearchQuery.value.trim()
      };

      const response = await articlesAPI.getArticles(params);
      
      searchArticles.value = response.data.data || [];
      articleSearchTotalPages.value = response.data.pagination?.totalPages || 0;

    } catch (err) {
      handleError(err);
    } finally {
      isLoadingArticleSearch.value = false;
    }
  };

  // Debounced search with reduced delay for better UX
  const debouncedArticleSearch = debounce(() => {
    articleSearchPage.value = 1;
    searchForArticles();
  }, 250);

  // Watch for article search query changes
  watch(articleSearchQuery, debouncedArticleSearch);

  // Panel management
  const openAddArticlePanel = () => {
    showAddArticlePanel.value = true;
    articleSearchQuery.value = '';
    searchArticles.value = [];
    selectedArticleToAdd.value = null;
    articleSearchPage.value = 1;
  };

  const closeAddArticlePanel = () => {
    showAddArticlePanel.value = false;
    articleSearchQuery.value = '';
    searchArticles.value = [];
    selectedArticleToAdd.value = null;
  };

  // Week change confirmation methods
  const requestWeekChange = (newWeek, hasUnsavedChanges) => {
    if (hasUnsavedChanges && selectedWeek.value !== newWeek) {
      pendingWeekChange.value = newWeek;
      showWeekChangeConfirmModal.value = true;
      return false; // Don't change immediately
    }
    selectedWeek.value = newWeek;
    return true; // Change immediately
  };

  const confirmWeekChange = () => {
    selectedWeek.value = pendingWeekChange.value;
    showWeekChangeConfirmModal.value = false;
    pendingWeekChange.value = null;
  };

  const cancelWeekChange = () => {
    showWeekChangeConfirmModal.value = false;
    pendingWeekChange.value = null;
  };

  // Set default selected week to current week (if available)
  watch(availableWeeks, (weeks) => {
    if (!selectedWeek.value && weeks.length > 0) {
      const currentWeekNumber = getCurrentWeek();
      // If current week is in available weeks, select it, otherwise select the last available
      if (weeks.includes(currentWeekNumber)) {
        selectedWeek.value = currentWeekNumber;
      } else {
        selectedWeek.value = weeks[weeks.length - 1];
      }
    }
  }, { immediate: true });

  // Pagination for desktop view
  const paginationPages = computed(() => {
    const { totalPages } = { totalPages: articleSearchTotalPages.value };
    const { currentPage } = { currentPage: articleSearchPage.value };
    const pages = [];
    const maxVisible = 7;
    const ellipsis = '...';
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage <= 3) {
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(ellipsis);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(ellipsis);
        for (let i = totalPages - 4; i <= totalPages; i++) {
          if (i > 1) pages.push(i);
        }
      } else {
        pages.push(ellipsis);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(ellipsis);
        pages.push(totalPages);
      }
    }
    
    return pages;
  });

  return {
    // State
    selectedWeek,
    pendingWeekChange,
    articleFilter,
    showAddArticlePanel,
    showWeekChangeConfirmModal,
    searchArticles,
    articleSearchQuery,
    isLoadingArticleSearch,
    selectedArticleToAdd,
    articleSearchPage,
    articleSearchTotalPages,
    currentCampaign,

    // Computed
    weekOptions,
    availableWeeks,
    currentYear,
    isWeekInPast,
    canShowForm,
    paginationPages,
    canGoToPreviousWeek,
    canGoToNextWeek,

    // Methods
    searchForArticles,
    debouncedArticleSearch,
    openAddArticlePanel,
    closeAddArticlePanel,
    requestWeekChange,
    confirmWeekChange,
    cancelWeekChange,
    goToPreviousWeek,
    goToNextWeek,
    getCurrentWeek
  };
}