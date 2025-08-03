<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  CircleStackIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

// Components
import Button from '../components/ui/Button.vue';
import WeekPicker from '../components/ui/WeekPicker.vue';

// Composables
import { useAuthStore } from '../stores/authStore';
import { useErrorHandler } from '../composables/useErrorHandler';
import { useRouter } from 'vue-router';

// API
import api from '../api/axios';

const authStore = useAuthStore();
const { handleError } = useErrorHandler();
const router = useRouter();

// Check access permissions
const hasAccess = computed(() => {
  return ['Gestionnaire', 'Manager'].includes(authStore.user?.role);
});

// Redirect if no access
if (!hasAccess.value) {
  router.push('/dashboard');
}

// Local state
const isLoadingStations = ref(false);
const isLoadingStockData = ref(false);
const error = ref(null);

// Selection state
const selectedStationId = ref('');
const selectedWeek = ref(getCurrentWeek());
const stationFilter = ref('');
const articleFilter = ref('');

// Data state
const stations = ref([]);
const stockData = ref([]);
const stockSummaryData = ref([]);
const stationStockStatus = ref({});

// Pagination state
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

// Stations from article search
const stationsWithArticle = ref([]);
const stationsWithArticleIds = ref(new Set());
const isSearchingArticle = ref(false);

// Search for stations with article
const searchStationsWithArticle = async () => {
  if (!articleFilter.value.trim()) {
    stationsWithArticle.value = [];
    stationsWithArticleIds.value = new Set();
    return;
  }
  
  try {
    isSearchingArticle.value = true;
    const response = await api.get('/stocks-stations/stations-with-article', {
      params: {
        campagne: currentCampaign.value,
        search: articleFilter.value.trim()
      }
    });
    stationsWithArticle.value = response.data.data || [];
    // Create a set of station IDs that have the article
    stationsWithArticleIds.value = new Set(stationsWithArticle.value.map(s => s._id));
  } catch (err) {
    handleError(err);
    stationsWithArticle.value = [];
    stationsWithArticleIds.value = new Set();
  } finally {
    isSearchingArticle.value = false;
  }
};

// Debounced article search
const debouncedArticleSearch = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      searchStationsWithArticle();
    }, 300);
  };
})();

// Watch for article filter changes
watch(articleFilter, debouncedArticleSearch);

// Filtered and sorted stations - both filters work together
const filteredStations = computed(() => {
  let result = stations.value;
  
  // First, filter by article if provided
  if (articleFilter.value.trim()) {
    // If we're still searching, show loading state
    if (isSearchingArticle.value) {
      return [];
    }
    // If search is done, filter by stations that have the article
    result = result.filter(station => stationsWithArticleIds.value.has(station._id));
  }
  
  // Then, filter by station name if provided
  if (stationFilter.value.trim()) {
    const filter = stationFilter.value.toLowerCase();
    result = result.filter(station => 
      station.nom.toLowerCase().includes(filter)
    );
  }
  
  // Sort by name alphabetically
  return result.sort((a, b) => a.nom.localeCompare(b.nom));
});

// Selected station details
const selectedStation = computed(() => {
  return stations.value.find(station => station._id === selectedStationId.value);
});

// Check if we can show stock data
const canShowStockData = computed(() => {
  return selectedStationId.value;
});

// Stock status configuration
const getStockStatusConfig = (status, daysSinceUpdate) => {
  switch (status) {
    case 'good':
      return {
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: CheckCircleIcon,
        title: 'À jour',
        message: daysSinceUpdate !== null ? 
          `Mis à jour il y a ${daysSinceUpdate} jour${daysSinceUpdate > 1 ? 's' : ''}` :
          'Récemment mis à jour'
      };
      
    case 'warning':
      return {
        color: 'amber',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        icon: ClockIcon,
        title: 'Attention',
        message: daysSinceUpdate !== null ? 
          `Dernière mise à jour il y a ${daysSinceUpdate} jour${daysSinceUpdate > 1 ? 's' : ''}` :
          'Mise à jour recommandée'
      };
      
    case 'critical':
      return {
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: ExclamationTriangleIcon,
        title: 'Critique',
        message: daysSinceUpdate !== null ? 
          `Pas de mise à jour depuis ${daysSinceUpdate} jour${daysSinceUpdate > 1 ? 's' : ''}` :
          'Mise à jour urgente requise'
      };
      
    default:
      return {
        color: 'gray',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        icon: ExclamationTriangleIcon,
        title: 'Aucune donnée',
        message: 'Stocks jamais mis à jour'
      };
  }
};

// Pagination
const paginationPages = computed(() => {
  const pages = [];
  const maxVisible = 7;
  const ellipsis = '...';
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    
    if (currentPage.value <= 3) {
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push(ellipsis);
      pages.push(totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      pages.push(ellipsis);
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) {
        if (i > 1) pages.push(i);
      }
    } else {
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

// Watch for selection changes
watch(selectedStationId, async () => {
  if (selectedStationId.value) {
    await loadStockData();
  }
}, { immediate: false });

// Methods
const loadStations = async () => {
  try {
    isLoadingStations.value = true;
    error.value = null;

    const response = await api.get('/stations', {
      params: {
        page: 1,
        limit: 1000, // Load all stations for selection
        isActive: true
      }
    });
    
    stations.value = response.data.data || [];

    // Load stock status for all stations
    await loadStationsStockStatus();

  } catch (err) {
    handleError(err);
    error.value = 'Erreur lors du chargement des stations';
    handleError(err);
  } finally {
    isLoadingStations.value = false;
  }
};

const loadStationsStockStatus = async () => {
  try {
    const statusPromises = stations.value.map(async (station) => {
      try {
        const response = await api.get(`/stocks-stations/status/${station._id}`);
        return {
          stationId: station._id,
          status: response.data.data
        };
      } catch (err) {
        return {
          stationId: station._id,
          status: { status: 'never', daysSinceUpdate: null, lastUpdateDate: null }
        };
      }
    });

    const results = await Promise.all(statusPromises);
    
    const statusMap = {};
    results.forEach(result => {
      statusMap[result.stationId] = result.status;
    });
    
    stationStockStatus.value = statusMap;

  } catch (err) {
  }
};

const loadStockData = async () => {
  if (!selectedStationId.value) return;

  try {
    isLoadingStockData.value = true;
    

    // Load the summary of all articles with their last updated quantities
    const response = await api.get(
      `/stocks-stations/stations/${selectedStationId.value}/campaign/${currentCampaign.value}/summary`
    );

    stockSummaryData.value = response.data.data || [];

  } catch (err) {
    handleError(err);
    if (err.response?.status !== 404) {
      handleError(err);
    } else {
      stockSummaryData.value = [];
    }
  } finally {
    isLoadingStockData.value = false;
  }
};

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

// Initialize component
onMounted(async () => {
  
  if (hasAccess.value) {
    await loadStations();
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="sm:flex sm:items-center justify-between">
      <div class="sm:flex-auto">
        <h1 class="text-3xl font-bold text-gray-900">Tableau de Bord - Stocks Stations</h1>
        <p class="mt-1 text-sm text-gray-500">
          Vue d'ensemble des stocks des stations (lecture seule)
        </p>
      </div>
    </div>

    <!-- Access Control Check -->
    <div v-if="!hasAccess" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 class="text-sm font-medium text-red-800">Accès non autorisé</h3>
          <p class="text-sm text-red-700 mt-1">
            Seuls les gestionnaires et managers peuvent accéder à cette page.
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="hasAccess">
      
      <!-- Compact Stations Overview -->
      <div class="bg-white rounded-xl shadow-soft p-4">
        <div class="mb-3">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Sélectionnez une station</h2>
          
          <!-- Double Search Filters -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Station Filter -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Filtrer par station</label>
              <div class="relative">
                <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  v-model="stationFilter"
                  type="text"
                  placeholder="Nom de la station..."
                  class="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <!-- Article Filter -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Filtrer par article en stock</label>
              <div class="relative">
                <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  v-model="articleFilter"
                  type="text"
                  placeholder="Nom ou code de l'article..."
                  class="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <!-- Active filters display -->
          <div v-if="stationFilter || articleFilter" class="mt-2 text-xs text-gray-600">
            <span v-if="stationFilter && articleFilter">
              Stations contenant "{{ stationFilter }}" avec l'article "{{ articleFilter }}" en stock
            </span>
            <span v-else-if="stationFilter">
              Stations contenant "{{ stationFilter }}"
            </span>
            <span v-else-if="articleFilter">
              Stations ayant l'article "{{ articleFilter }}" en stock
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingStations || isSearchingArticle" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>

        <!-- Compact Stations Grid -->
        <div v-else-if="filteredStations.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          <button
            v-for="station in filteredStations"
            :key="station._id"
            class="px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            :class="{ 
              'border-primary-500 bg-primary-50 ring-1 ring-primary-500': selectedStationId === station._id,
              'border-gray-200': selectedStationId !== station._id
            }"
            @click="selectedStationId = station._id"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-900 truncate flex-1 mr-2">{{ station.nom }}</h3>
              
              <!-- Stock Status Indicator -->
              <div class="flex-shrink-0">
                <div 
                  :class="[
                    'w-2.5 h-2.5 rounded-full',
                    stationStockStatus[station._id]?.status === 'good' ? 'bg-green-500' :
                    stationStockStatus[station._id]?.status === 'warning' ? 'bg-amber-500' :
                    'bg-red-500'
                  ]"
                  :title="getStockStatusConfig(stationStockStatus[station._id]?.status || 'never', stationStockStatus[station._id]?.daysSinceUpdate).message"
                ></div>
              </div>
            </div>
          </button>
        </div>

        <!-- No Stations -->
        <div v-else class="text-center py-4">
          <BuildingStorefrontIcon class="mx-auto h-8 w-8 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            <template v-if="stationFilter && articleFilter">
              Aucune station ne correspond aux critères
            </template>
            <template v-else-if="stationFilter">
              Aucune station trouvée
            </template>
            <template v-else-if="articleFilter">
              Aucun article trouvé dans les stocks
            </template>
            <template v-else>
              Aucune station disponible
            </template>
          </h3>
        </div>
      </div>

      <!-- Stock Detail View -->
      <div v-if="selectedStation" class="mt-4">
        <div class="bg-white rounded-2xl shadow-soft p-6">
          <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">
                  Stocks - {{ selectedStation.nom }}
                </h2>
                <div class="flex items-center gap-4 mt-1">
                  <p class="text-sm text-gray-500">
                    Campagne: {{ currentCampaign }}
                  </p>
                  <!-- Stock Status Badge -->
                  <div v-if="stationStockStatus[selectedStation._id]" :class="[
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    getStockStatusConfig(stationStockStatus[selectedStation._id].status, stationStockStatus[selectedStation._id].daysSinceUpdate).bgColor,
                    getStockStatusConfig(stationStockStatus[selectedStation._id].status, stationStockStatus[selectedStation._id].daysSinceUpdate).textColor
                  ]">
                    {{ getStockStatusConfig(stationStockStatus[selectedStation._id].status, stationStockStatus[selectedStation._id].daysSinceUpdate).title }}
                  </div>
                </div>
              </div>
              
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingStockData" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <!-- Stock Data -->
            <div v-else-if="canShowStockData">
              <div v-if="stockSummaryData.length > 0">
                
                <!-- Mobile View -->
                <div class="block md:hidden space-y-4">
                  <div
                    v-for="stock in stockSummaryData"
                    :key="stock.articleId"
                    class="border border-gray-200 rounded-lg p-4"
                  >
                    <div class="space-y-3">
                      <div>
                        <h3 class="font-medium text-gray-900">{{ stock.designation }}</h3>
                        <p class="text-sm text-gray-500">{{ stock.codeArticle }}</p>
                        <span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full mt-1">
                          {{ stock.categorie }}
                        </span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-gray-700">Stock:</span>
                        <span class="text-lg font-semibold text-primary-600">
                          {{ stock.quantiteStock || 0 }}
                        </span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-gray-700">Dernière MAJ:</span>
                        <span class="text-sm text-gray-500">
                          S{{ stock.derniereMAJ }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Desktop View -->
                <div class="hidden md:block">
                  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Article
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantité en stock
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dernière MAJ
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="stock in stockSummaryData" :key="stock.articleId">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">
                              {{ stock.designation }}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ stock.codeArticle }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {{ stock.categorie }}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-sm font-semibold text-primary-600">
                              {{ stock.quantiteStock || 0 }}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            S{{ stock.derniereMAJ }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              <!-- No Stock Data -->
              <div v-else class="text-center py-8">
                <CircleStackIcon class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun stock trouvé</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Cette station n'a pas encore saisi de stocks pour cette campagne.
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>

      <!-- No Station Selected -->
      <div v-else class="mt-4">
        <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <BuildingStorefrontIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-lg font-medium text-gray-900">Sélectionnez une station</h3>
          <p class="mt-1 text-sm text-gray-500">
            Choisissez une station dans la liste ci-dessus pour consulter ses stocks.
          </p>
        </div>
      </div>

    </div>
  </div>
</template>