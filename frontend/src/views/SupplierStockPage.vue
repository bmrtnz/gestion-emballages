<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  CircleStackIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingStorefrontIcon
} from '@heroicons/vue/24/outline';

// Components
import Button from '../components/ui/Button.vue';
import WeekPicker from '../components/ui/WeekPicker.vue';

// Composables
import { useAuthStore } from '../stores/authStore';
import { useErrorHandler } from '../composables/useErrorHandler';
import { useNotification } from '../composables/useNotification';

// API
import api from '../api/axios';
import articlesAPI from '../api/articles';
import stockFournisseurAPI from '../api/stockFournisseur';

const authStore = useAuthStore();
const { handleError } = useErrorHandler();
const { success: notificationSuccess, info: notificationInfo } = useNotification();

// Local loading and error states
const isLoadingArticles = ref(false);
const isLoadingStock = ref(false);
const error = ref(null);

// Selection state
const selectedSiteId = ref('');
const selectedWeek = ref(getCurrentWeek());
const articleFilter = ref('');

// Data state
const availableArticles = ref([]);
const stockQuantities = ref({});
const originalQuantities = ref({});
const hasChanges = ref(false);
const isSaving = ref(false);
const supplierData = ref(null);

// Pagination state (server-side pagination)
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const totalPages = ref(0);
const hasNextPage = ref(false);
const hasPrevPage = ref(false);

// Get current campaign
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

// Get current week number
function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

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

// Generate week options with year info based on campaign
const weekOptions = computed(() => {
  const options = [];
  
  // Parse current campaign to get years
  const campaignParts = currentCampaign.value.split('-');
  if (campaignParts.length !== 2) return options;
  
  const firstYear = parseInt(`20${campaignParts[0]}`);
  const secondYear = parseInt(`20${campaignParts[1]}`);
  
  // Business year: weeks 27-52 are from firstYear, weeks 1-26 are from secondYear
  for (let i = 27; i <= 52; i++) {
    options.push({
      value: i,
      label: `${firstYear} - S${i}`
    });
  }
  
  for (let i = 1; i <= 26; i++) {
    options.push({
      value: i,
      label: `${secondYear} - S${i}`
    });
  }
  
  return options;
});

// Computed properties
const availableSites = computed(() => {
  // Use supplier data if available
  if (supplierData.value?.sites) {
    return supplierData.value.sites.filter(site => site.isActive !== false);
  }
  
  // Fallback to auth store
  if (authStore.user?.entiteDetails?.sites) {
    return authStore.user.entiteDetails.sites.filter(site => site.isActive !== false);
  }
  
  return [];
});

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

const selectedSite = computed(() => {
  return availableSites.value.find(site => site._id === selectedSiteId.value);
});

// Articles are already filtered and paginated by the server
const paginatedArticles = computed(() => {
  return availableArticles.value;
});

// Check if we can show the form
const canShowForm = computed(() => {
  return selectedSiteId.value && selectedWeek.value;
});

// Pagination pages for desktop view
const paginationPages = computed(() => {
  const pages = [];
  const maxVisible = 7;
  const ellipsis = '...';
  
  if (totalPages.value <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    if (currentPage.value <= 3) {
      // Near start
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push(ellipsis);
      pages.push(totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      // Near end
      pages.push(ellipsis);
      for (let i = totalPages.value - 4; i < totalPages.value; i++) {
        pages.push(i);
      }
      pages.push(totalPages.value);
    } else {
      // Middle
      pages.push(ellipsis);
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        pages.push(i);
      }
      pages.push(ellipsis);
      pages.push(totalPages.value);
    }
  }
  
  return pages;
});

// Methods
const fetchSupplierData = async () => {
  try {
    const fournisseurId = authStore.user.entiteId;
    if (!fournisseurId) {
      throw new Error('ID fournisseur non trouvé');
    }

    // Fetch supplier data including sites
    const response = await api.get(`/fournisseurs/${fournisseurId}`);
    supplierData.value = response.data;
    
    // Auto-select site if supplier has only one active site
    const activeSites = supplierData.value?.sites?.filter(site => site.isActive !== false) || [];
    if (activeSites.length === 1 && !selectedSiteId.value) {
      selectedSiteId.value = activeSites[0]._id;
    }
    
  } catch (err) {
    console.error('Error fetching supplier data:', err);
    // Fallback to auth store if supplier data fetch fails
    // Also check for auto-selection from auth store data
    const authSites = authStore.user?.entiteDetails?.sites?.filter(site => site.isActive !== false) || [];
    if (authSites.length === 1 && !selectedSiteId.value) {
      selectedSiteId.value = authSites[0]._id;
    }
  }
};

const fetchSupplierArticles = async (resetPage = false) => {
  try {
    isLoadingArticles.value = true;
    error.value = null;
    
    if (resetPage) {
      currentPage.value = 1;
    }
    
    const fournisseurId = authStore.user.entiteId;
    if (!fournisseurId) {
      throw new Error('ID fournisseur non trouvé');
    }

    // Build pagination parameters
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      sortBy: 'codeArticle',
      sortOrder: 'asc'
    };

    // Add search filter if provided
    if (articleFilter.value) {
      params.search = articleFilter.value;
    }

    // Fetch paginated articles linked to this supplier
    const response = await articlesAPI.getArticlesBySupplier(fournisseurId, params);
    
    
    // Update articles and pagination info using the standardized pagination format
    availableArticles.value = response.data || [];
    
    // Extract pagination info from standardized response
    if (response.pagination) {
      totalItems.value = response.pagination.totalItems || 0;
      totalPages.value = response.pagination.totalPages || 0;
      hasNextPage.value = response.pagination.hasNextPage || false;
      hasPrevPage.value = response.pagination.hasPrevPage || false;
      currentPage.value = response.pagination.currentPage || 1;
    } else {
      // Fallback for old response format (shouldn't be needed now)
      totalItems.value = response.totalCount || response.count || availableArticles.value.length;
      totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value);
      hasNextPage.value = currentPage.value < totalPages.value;
      hasPrevPage.value = currentPage.value > 1;
    }
    
    // Initialize stock quantities for new articles
    availableArticles.value.forEach(article => {
      if (!stockQuantities.value.hasOwnProperty(article._id)) {
        stockQuantities.value[article._id] = 0;
      }
    });
    
  } catch (err) {
    const errorInfo = handleError(err, 'Erreur lors du chargement des articles');
    error.value = errorInfo.message;
  } finally {
    isLoadingArticles.value = false;
  }
};

const fetchExistingStock = async () => {
  if (!selectedSiteId.value || !selectedWeek.value || availableArticles.value.length === 0) return;
  
  try {
    isLoadingStock.value = true;
    error.value = null;
    
    const fournisseurId = authStore.user.entiteId;
    
    // Get existing stock for this site/campaign
    const response = await stockFournisseurAPI.getWeeklyStock(
      fournisseurId,
      selectedSiteId.value,
      selectedWeek.value,
      currentCampaign.value
    );
    
    // Reset quantities for current page articles first
    availableArticles.value.forEach(article => {
      stockQuantities.value[article._id] = 0;
    });
    
    // If we have existing stock data, populate the quantities for current page articles
    if (response && response.articles) {
      response.articles.forEach(articleStock => {
        // Handle both populated objects and string IDs
        const articleId = typeof articleStock.articleId === 'object' 
          ? articleStock.articleId._id 
          : articleStock.articleId;
        
        // Only update if this article is in the current page
        if (stockQuantities.value.hasOwnProperty(articleId)) {
          stockQuantities.value[articleId] = articleStock.quantiteStock;
        }
      });
    }
    
    // Store original values for change detection (only for current page articles)
    const currentPageQuantities = {};
    availableArticles.value.forEach(article => {
      currentPageQuantities[article._id] = stockQuantities.value[article._id];
    });
    originalQuantities.value = { ...originalQuantities.value, ...currentPageQuantities };
    hasChanges.value = false;
    
  } catch (err) {
    // It's ok if no stock exists yet - silently handle this case
    // Reset quantities to 0 for current page articles
    availableArticles.value.forEach(article => {
      stockQuantities.value[article._id] = 0;
      originalQuantities.value[article._id] = 0;
    });
    hasChanges.value = false;
  } finally {
    isLoadingStock.value = false;
  }
};

const handleQuantityChange = (articleId) => {
  // Check if any value has changed
  hasChanges.value = Object.keys(stockQuantities.value).some(
    id => stockQuantities.value[id] !== originalQuantities.value[id]
  );
};

const setQuickQuantity = (articleId, quantity) => {
  stockQuantities.value[articleId] = quantity;
  handleQuantityChange(articleId);
};

const saveStock = async () => {
  if (!canShowForm.value) return;
  
  try {
    isSaving.value = true;
    error.value = null;
    
    const fournisseurId = authStore.user.entiteId;
    
    // Prepare articles data - only include articles with quantity > 0 or that have changed
    const articlesData = [];
    Object.keys(stockQuantities.value).forEach(articleId => {
      const quantity = stockQuantities.value[articleId];
      const originalQuantity = originalQuantities.value[articleId] || 0;
      
      // Only include if quantity > 0 or if it changed from a non-zero value to zero
      if (quantity > 0 || (originalQuantity > 0 && quantity === 0)) {
        articlesData.push({
          articleId,
          quantiteStock: quantity || 0
        });
      }
    });
    
    // If no articles to update, just mark as saved
    if (articlesData.length === 0) {
      hasChanges.value = false;
      notificationInfo('Aucune quantité à enregistrer');
      return;
    }
    
    // Update weekly stock
    await stockFournisseurAPI.updateCompleteWeeklyStock(
      fournisseurId,
      selectedSiteId.value,
      {
        campagne: currentCampaign.value,
        numeroSemaine: selectedWeek.value,
        articles: articlesData
      }
    );
    
    // Update original quantities and reset changes flag
    originalQuantities.value = { ...stockQuantities.value };
    hasChanges.value = false;
    
    notificationSuccess(`Stock enregistré avec succès (${articlesData.length} articles)`);
    
  } catch (err) {
    const errorInfo = handleError(err, 'Erreur lors de l\'enregistrement du stock');
    error.value = errorInfo.message;
  } finally {
    isSaving.value = false;
  }
};

const goToPage = async (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    await fetchSupplierArticles();
    if (selectedSiteId.value && selectedWeek.value) {
      await fetchExistingStock();
    }
  }
};

const handlePageSizeChange = async () => {
  // Reset to first page when changing page size
  currentPage.value = 1;
  // Recalculate total pages
  totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value);
  // Fetch new data
  await fetchSupplierArticles();
  if (selectedSiteId.value && selectedWeek.value) {
    await fetchExistingStock();
  }
};

// Debounced search function
const debouncedSearch = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      await fetchSupplierArticles(true); // Reset to page 1
      if (selectedSiteId.value && selectedWeek.value) {
        await fetchExistingStock();
      }
    }, 300);
  };
})();

const cancelChanges = () => {
  // Reset to original values
  stockQuantities.value = { ...originalQuantities.value };
  hasChanges.value = false;
};

// Watch for site or week changes to reload data
watch([selectedSiteId, selectedWeek], async () => {
  if (selectedSiteId.value) {
    // Always reload articles when site or week changes
    await fetchSupplierArticles(true); // Reset to page 1
    
    // If both site and week are selected, also load existing stock
    if (selectedWeek.value) {
      await fetchExistingStock();
    }
  }
});

// Watch for search filter changes with debouncing
watch(articleFilter, () => {
  debouncedSearch();
});

// Initialize on mount
onMounted(async () => {
  // Fetch supplier data first to get sites
  await fetchSupplierData();
  // Then fetch first page of articles
  await fetchSupplierArticles(true);
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="sm:flex sm:items-center justify-between">
      <div class="sm:flex-auto">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Stocks</h1>
        <p class="mt-1 text-sm text-gray-500">
          Sélectionnez un site et une semaine pour saisir les stocks
        </p>
      </div>
    </div>

    <!-- Selection Card -->
    <div class="bg-white rounded-2xl shadow-soft p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        
        <!-- Campaign Info -->
        <div class="p-4 bg-blue-50 rounded-lg">
          <div class="flex items-center">
            <CalendarIcon class="h-5 w-5 text-blue-600 mr-2" />
            <span class="text-sm font-medium text-blue-900">
              Campagne: {{ currentCampaign }}
            </span>
          </div>
        </div>

        <!-- Site Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Site <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="selectedSiteId"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Sélectionner un site</option>
            <option 
              v-for="site in availableSites" 
              :key="site._id"
              :value="site._id"
            >
              {{ site.nomSite }}
            </option>
          </select>
        </div>

        <!-- Week Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Semaine <span class="text-red-500">*</span>
          </label>
          <WeekPicker
            v-model="selectedWeek"
            :year="currentYear"
            :campaign-format="currentCampaign"
          />
        </div>
      </div>
    </div>

    <!-- No Site Selected Card -->
    <div v-if="!selectedSiteId" class="bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-soft p-8">
      <div class="text-center">
        <BuildingStorefrontIcon class="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h3 class="text-lg font-medium text-amber-800 mb-2">Sélectionnez un site</h3>
        <p class="text-amber-800 mb-6">
          Veuillez sélectionner un site dans la liste déroulante ci-dessus pour gérer les stocks.
        </p>
      </div>
    </div>

    <!-- Stock Entry Form -->
    <div v-else-if="canShowForm && !isLoadingStock" class="bg-white rounded-2xl shadow-soft overflow-hidden">
      <div class="px-6 py-4">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Saisie des stocks</h3>
              <p class="text-sm text-gray-600">
                {{ selectedSite?.nomSite }} - Semaine {{ selectedWeek }}
              </p>
            </div>
          </div>
          
          <!-- Article Filter and Actions -->
          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                v-model="articleFilter"
                type="text"
                placeholder="Rechercher un article..."
                class="w-full pl-10 pr-4 py-3 lg:py-2 text-base lg:text-sm border border-gray-300 rounded-lg lg:rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
            </div>
            <!-- Desktop action buttons -->
            <div class="hidden lg:flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                @click="cancelChanges"
                :disabled="!hasChanges || isSaving"
              >
                Annuler les modifications
              </Button>
              <Button
                variant="primary"
                size="sm"
                @click="saveStock"
                :loading="isSaving"
                :disabled="!hasChanges"
              >
                Enregistrer le stock
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile-Optimized Stock Entry -->
      <!-- Desktop Table View -->
      <div class="hidden lg:block">
        <div class="px-6 pb-4 pt-6">
          <table class="min-w-full table-fixed">
            <thead>
              <tr class="border-b border-gray-200">
                <th scope="col" class="min-w-[8rem] pb-3 pr-3 text-left text-sm font-semibold text-gray-900">
                  Code Article
                </th>
                <th scope="col" class="px-3 pb-3 text-left text-sm font-semibold text-gray-900">
                  Désignation
                </th>
                <th scope="col" class="px-3 pb-3 text-left text-sm font-semibold text-gray-900">
                  Catégorie
                </th>
                <th scope="col" class="px-3 pb-3 text-right text-sm font-semibold text-gray-900">
                  Quantité en Stock
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr v-for="article in paginatedArticles" :key="article._id" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-900">
                  {{ article.codeArticle }}
                </td>
                <td class="px-3 py-2 text-sm text-gray-900">
                  {{ article.designation }}
                </td>
                <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                  {{ article.categorie }}
                </td>
                <td class="whitespace-nowrap px-3 py-2 text-right">
                  <input
                    v-model.number="stockQuantities[article._id]"
                    type="number"
                    min="0"
                    @input="handleQuantityChange(article._id)"
                    class="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    :class="{ 
                      'bg-yellow-50 border-yellow-300': stockQuantities[article._id] !== originalQuantities[article._id] && !isWeekInPast,
                      'bg-gray-100': isWeekInPast && stockQuantities[article._id] === originalQuantities[article._id],
                      'bg-yellow-100 border-yellow-300': isWeekInPast && stockQuantities[article._id] !== originalQuantities[article._id]
                    }"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Card View -->
      <div class="lg:hidden px-6 pb-4 pt-6 space-y-3">
        <div 
          v-for="article in paginatedArticles" 
          :key="article._id"
          class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          :class="{ 'border-yellow-400 bg-yellow-50': stockQuantities[article._id] !== originalQuantities[article._id] }"
        >
          <!-- Article Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center mb-1">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                  {{ article.codeArticle }}
                </span>
                <span v-if="article.categorie" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {{ article.categorie }}
                </span>
              </div>
              <h3 class="text-sm font-medium text-gray-900 leading-5">
                {{ article.designation }}
              </h3>
            </div>
          </div>

          <!-- Stock Input Section -->
          <div class="flex items-center justify-between pt-3 border-t border-gray-100">
            <label class="text-sm font-medium text-gray-700">
              Quantité en stock
            </label>
            <div class="flex items-center space-x-3">
              <!-- Quick action buttons for common quantities -->
              <div class="flex items-center space-x-1">
                <button
                  @click="setQuickQuantity(article._id, 0)"
                  class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  :class="{ 'bg-primary-100 text-primary-800': stockQuantities[article._id] === 0 }"
                >
                  0
                </button>
                <button
                  @click="setQuickQuantity(article._id, 10)"
                  class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  :class="{ 'bg-primary-100 text-primary-800': stockQuantities[article._id] === 10 }"
                >
                  10
                </button>
                <button
                  @click="setQuickQuantity(article._id, 50)"
                  class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  :class="{ 'bg-primary-100 text-primary-800': stockQuantities[article._id] === 50 }"
                >
                  50
                </button>
              </div>
              <!-- Custom input -->
              <input
                v-model.number="stockQuantities[article._id]"
                type="number"
                min="0"
                @input="handleQuantityChange(article._id)"
                class="w-20 px-3 py-2 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center font-medium"
                :class="{ 
                  'bg-yellow-50 border-yellow-400': stockQuantities[article._id] !== originalQuantities[article._id] && !isWeekInPast,
                  'bg-gray-100': isWeekInPast && stockQuantities[article._id] === originalQuantities[article._id],
                  'bg-yellow-100 border-yellow-400': isWeekInPast && stockQuantities[article._id] !== originalQuantities[article._id]
                }"
                placeholder="0"
              >
            </div>
          </div>

          <!-- Change indicator -->
          <div v-if="stockQuantities[article._id] !== originalQuantities[article._id]" class="mt-2 pt-2 border-t border-yellow-200">
            <div class="flex items-center text-xs text-yellow-700">
              <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
              <span>
                Modifié : {{ originalQuantities[article._id] || 0 }} → {{ stockQuantities[article._id] || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div class="flex items-center justify-between w-full">
          <!-- Mobile pagination -->
          <div class="flex justify-between flex-1 sm:hidden">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="!hasPrevPage"
              class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="!hasNextPage"
              class="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          
          <!-- Desktop pagination -->
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Affichage de <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span> à 
                <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> sur 
                <span class="font-medium">{{ totalItems }}</span> résultats
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <label for="page-size" class="text-sm text-gray-700">Afficher:</label>
              <select
                id="page-size"
                v-model="itemsPerPage"
                @change="handlePageSizeChange"
                class="rounded-md border-gray-300 py-1 text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span class="text-sm text-gray-700">par page</span>
            </div>
            <div>
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <!-- First page button -->
                <button
                  @click="goToPage(1)"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Première page"
                >
                  <span class="sr-only">Première page</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z" clip-rule="evenodd" />
                  </svg>
                </button>

                <!-- Previous page button -->
                <button
                  @click="goToPage(currentPage - 1)"
                  :disabled="!hasPrevPage"
                  class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page précédente"
                >
                  <span class="sr-only">Précédent</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <!-- Page numbers -->
                <button
                  v-for="page in paginationPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    page === currentPage
                      ? 'relative z-10 inline-flex items-center bg-primary-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                      : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  ]"
                >
                  {{ page }}
                </button>
                
                <!-- Next page button -->
                <button
                  @click="goToPage(currentPage + 1)"
                  :disabled="!hasNextPage"
                  class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page suivante"
                >
                  <span class="sr-only">Suivant</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                  </svg>
                </button>

                <!-- Last page button -->
                <button
                  @click="goToPage(totalPages)"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Dernière page"
                >
                  <span class="sr-only">Dernière page</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M4.21 5.23a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L8.168 10 10.23 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L14.168 10 10.23 6.29a.75.75 0 01-.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Actions Only -->
      <div class="lg:hidden px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-3">
        <Button
          variant="primary"
          @click="saveStock"
          :loading="isSaving"
          :disabled="!hasChanges"
          class="w-full py-4 text-base font-medium"
        >
          Enregistrer le stock
        </Button>
        <Button
          variant="outline"
          @click="cancelChanges"
          :disabled="!hasChanges || isSaving"
          class="w-full py-3"
        >
          Annuler les modifications
        </Button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoadingArticles && availableArticles.length === 0" class="bg-white rounded-2xl shadow-soft p-12 text-center">
      <CircleStackIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun article disponible</h3>
      <p class="text-gray-500 mb-6">
        Vous n'avez pas d'articles liés à votre compte fournisseur.
      </p>
    </div>

    <!-- Unsaved Changes Warning -->
    <div v-if="hasChanges" class="fixed bottom-4 right-4 bg-orange-100 border border-orange-400 rounded-lg p-4 shadow-lg">
      <div class="flex items-center">
        <ExclamationTriangleIcon class="h-5 w-5 text-orange-500 mr-2" />
        <span class="text-orange-800 text-sm">Vous avez des modifications non sauvegardées</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2" />
        <span class="text-red-800">{{ error }}</span>
      </div>
    </div>

    <!-- Loading States -->
    <div v-if="isLoadingArticles" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
    
    <!-- Loading Stock Spinner -->
    <div v-if="canShowForm && isLoadingStock" class="bg-white rounded-2xl shadow-soft p-12">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-sm text-gray-500">Chargement des stocks existants...</p>
      </div>
    </div>
  </div>
</template>