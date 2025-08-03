/**
 * @fileoverview Station Stock Data Management Composable
 * Handles API calls, state management, and data operations for station stocks
 */

import { ref, computed } from 'vue';
import api from '../../api/axios';
import articlesAPI from '../../api/articles';
import { useAuthStore } from '../../stores/authStore';
import { useErrorHandler } from '../useErrorHandler';
import { useNotification } from '../useNotification';

export function useStationStockData() {
  const authStore = useAuthStore();
  const { handleError } = useErrorHandler();
  const { success: notificationSuccess } = useNotification();

  // State
  const availableArticles = ref([]);
  const trackedArticles = ref([]); // Articles that should persist across weeks
  const stockQuantities = ref({});
  const originalQuantities = ref({});
  const isLoadingArticles = ref(false);
  const isLoadingStock = ref(false);
  const isSaving = ref(false);
  const isLoadingTrackedArticles = ref(false);
  
  // Pagination state
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalItems = ref(0);
  const totalPages = ref(0);
  const hasNextPage = ref(false);
  const hasPrevPage = ref(false);

  // Computed
  const hasChanges = computed(() => {
    return Object.keys(stockQuantities.value).some(articleId => {
      const current = stockQuantities.value[articleId];
      const original = originalQuantities.value[articleId];
      
      // Handle null comparisons properly
      if (current === null && original === null) return false;
      if (current === null || original === null) return true;
      
      return current !== original;
    });
  });

  const paginatedArticles = computed(() => {
    return availableArticles.value;
  });

  // Campaign management
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

  const getCurrentWeekNumber = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  const currentCampaign = ref(getCurrentCampaign());

  // Load all tracked articles for the station's campaign
  const loadTrackedArticles = async () => {
    if (!authStore.user?.entiteId || isLoadingTrackedArticles.value) return;

    try {
      isLoadingTrackedArticles.value = true;
      
      // Get all stock entries for this station and campaign
      const response = await api.get(
        `/stocks-stations/stations/${authStore.user.entiteId}/campaign/${currentCampaign.value}`
      );

      const allStockEntries = response.data.data || [];
      const uniqueArticleIds = new Set();
      
      // Extract unique article IDs from all weeks
      allStockEntries.forEach(entry => {
        if (entry.weeklyStocks && Array.isArray(entry.weeklyStocks)) {
          entry.weeklyStocks.forEach(week => {
            if (week.articles && Array.isArray(week.articles)) {
              week.articles.forEach(stock => {
                if (stock.articleId) {
                  uniqueArticleIds.add(stock.articleId._id || stock.articleId);
                }
              });
            }
          });
        }
      });

      // Load article details for all tracked articles
      if (uniqueArticleIds.size > 0) {
        await loadArticlesByIds(Array.from(uniqueArticleIds));
        trackedArticles.value = [...availableArticles.value];
      }

    } catch (err) {
      // If no data exists yet, that's okay
      if (err.response?.status !== 404) {
        handleError(err);
      }
      trackedArticles.value = [];
    } finally {
      isLoadingTrackedArticles.value = false;
    }
  };

  // Load articles by their IDs (for stock articles)
  const loadArticlesByIds = async (articleIds) => {
    try {
      // For now, load all active articles and filter by IDs
      // TODO: Implement a backend endpoint to get articles by IDs
      const response = await articlesAPI.getAllActiveArticles();
      const allArticles = response.data || [];
      
      const stockArticles = allArticles.filter(article => 
        articleIds.includes(article._id)
      );
      
      // Add these articles to availableArticles if not already present
      stockArticles.forEach(article => {
        const existingArticle = availableArticles.value.find(a => a._id === article._id);
        if (!existingArticle) {
          availableArticles.value.push(article);
        }
      });
      
    } catch (err) {
      handleError(err);
    }
  };

  // Methods
  const loadArticles = async (searchQuery = '', page = currentPage.value) => {
    try {
      isLoadingArticles.value = true;

      const params = {
        page,
        limit: itemsPerPage.value,
        isActive: true
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await articlesAPI.getArticles(params);
      
      availableArticles.value = response.data.data || [];
      totalItems.value = response.data.pagination?.total || 0;
      totalPages.value = response.data.pagination?.totalPages || 0;
      hasNextPage.value = response.data.pagination?.hasNext || false;
      hasPrevPage.value = response.data.pagination?.hasPrev || false;

    } catch (err) {
      handleError(err);
    } finally {
      isLoadingArticles.value = false;
    }
  };

  const loadStockData = async (selectedWeek) => {
    if (!selectedWeek || !authStore.user?.entiteId) return;

    try {
      isLoadingStock.value = true;
      
      const response = await api.get(
        `/stocks-stations/stations/${authStore.user.entiteId}/weeks/${selectedWeek}`,
        { 
          params: { 
            campagne: currentCampaign.value 
          } 
        }
      );

      const stockData = response.data.data || [];
      
      
      // Start with tracked articles or empty array
      availableArticles.value = [...trackedArticles.value];
      stockQuantities.value = {};
      originalQuantities.value = {};

      // Initialize quantities for all tracked articles to empty (null)
      trackedArticles.value.forEach(article => {
        stockQuantities.value[article._id] = null; // null = empty/not entered
        originalQuantities.value[article._id] = null;
      });

      // Update quantities from loaded stock data
      const stockArticleIds = new Set();
      
      stockData.forEach((stock) => {
        // Handle both nested and flattened response formats
        const articleId = stock.articleId?._id || stock.articleId;
        const quantity = stock.quantiteStock || 0;
        if (articleId) {
          // Convert 0 to actual 0, and non-zero to the value
          stockQuantities.value[articleId] = quantity;
          originalQuantities.value[articleId] = quantity;
          stockArticleIds.add(articleId);
          
          // For flattened format (getWeeklyStock response), create article object
          if (typeof stock.articleId === 'string') {
            const articleObj = {
              _id: stock.articleId,
              designation: stock.designation,
              codeArticle: stock.codeArticle,
              categorie: stock.categorie
            };
            
            const existingArticle = availableArticles.value.find(a => a._id === articleId);
            if (!existingArticle) {
              availableArticles.value.push(articleObj);
              // Also add to tracked articles for persistence
              const trackedArticle = trackedArticles.value.find(a => a._id === articleId);
              if (!trackedArticle) {
                trackedArticles.value.push(articleObj);
              }
            }
          }
          // For nested format (campaign response), handle as before
          else if (stock.articleId && typeof stock.articleId === 'object') {
            const existingArticle = availableArticles.value.find(a => a._id === articleId);
            if (!existingArticle) {
              availableArticles.value.push(stock.articleId);
              // Also add to tracked articles for persistence
              const trackedArticle = trackedArticles.value.find(a => a._id === articleId);
              if (!trackedArticle) {
                trackedArticles.value.push(stock.articleId);
              }
            }
          }
        }
      });
      
      // If we have article IDs without full data, fetch them
      const articlesNeedingData = Array.from(stockArticleIds).filter(id => {
        return !availableArticles.value.find(a => a._id === id);
      });
      
      if (articlesNeedingData.length > 0) {
        await loadArticlesByIds(articlesNeedingData);
      }
      
      // Update pagination info
      totalItems.value = availableArticles.value.length;
      totalPages.value = 1;
      hasNextPage.value = false;
      hasPrevPage.value = false;

    } catch (err) {
      if (err.response?.status !== 404) {
        handleError(err);
      }
    } finally {
      isLoadingStock.value = false;
    }
  };

  const saveStock = async (selectedWeek) => {
    if (!selectedWeek || !authStore.user?.entiteId) return;

    try {
      isSaving.value = true;

      // Prepare articles data - only include articles with entered quantities (not empty/null)
      const articles = availableArticles.value
        .filter(article => {
          const quantity = stockQuantities.value[article._id];
          return quantity !== null && quantity !== undefined; // Include 0 but exclude null/undefined
        })
        .map(article => ({
          articleId: article._id,
          quantiteStock: stockQuantities.value[article._id]
        }));

      const payload = {
        campagne: currentCampaign.value,
        numeroSemaine: parseInt(selectedWeek),  // Ensure it's a number
        articles
      };

      const response = await api.put(
        `/stocks-stations/stations/${authStore.user.entiteId}/weekly`,
        payload
      );
      
      // Update original quantities to reflect saved state
      originalQuantities.value = { ...stockQuantities.value };

      notificationSuccess(
        `Stock de la semaine ${selectedWeek} sauvegardé avec succès`
      );

      return true;

    } catch (err) {
      handleError(err, 'Erreur lors de la sauvegarde du stock');
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const addArticleToStock = (article) => {
    if (!article) return false;

    const articleId = article._id;
    
    // Add to stock quantities with initial empty quantity (null)
    if (stockQuantities.value[articleId] === undefined) {
      stockQuantities.value[articleId] = null; // null = empty/not entered yet
    }
    
    // Add to available articles if not already present
    const existingArticle = availableArticles.value.find(a => a._id === articleId);
    if (!existingArticle) {
      availableArticles.value.push(article);
    }
    
    // Add to tracked articles for persistence across weeks
    const trackedArticle = trackedArticles.value.find(a => a._id === articleId);
    if (!trackedArticle) {
      trackedArticles.value.push(article);
    }

    notificationSuccess(`Article "${article.designation}" ajouté au suivi. Saisissez la quantité et sauvegardez.`);
    return true;
  };

  const resetChanges = () => {
    stockQuantities.value = { ...originalQuantities.value };
  };

  // Pagination methods
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      currentPage.value = page;
    }
  };

  const previousPage = () => {
    if (hasPrevPage.value) {
      currentPage.value--;
    }
  };

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++;
    }
  };

  return {
    // State
    availableArticles,
    trackedArticles,
    stockQuantities,
    originalQuantities,
    isLoadingArticles,
    isLoadingStock,
    isSaving,
    isLoadingTrackedArticles,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    currentCampaign,

    // Computed
    hasChanges,
    paginatedArticles,

    // Methods
    loadArticles,
    loadStockData,
    loadTrackedArticles,
    saveStock,
    addArticleToStock,
    resetChanges,
    goToPage,
    previousPage,
    nextPage
  };
}