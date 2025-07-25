<template>
  <div>
    <!-- Header Section -->
    <div class="sm:flex sm:items-center mb-8">
      <div class="sm:flex-auto">
        <h1 class="text-3xl font-bold text-gray-900">
          <span v-if="stockData && selectedSite && selectedArticle">
            Stock {{ currentCampaign }}
          </span>
          <span v-else>
            Stock hebdomadaire
          </span>
        </h1>
        <div v-if="stockData && selectedSite && selectedArticle" class="mt-1 text-xl font-medium text-gray-700">
          {{ selectedSite.nomSite }} - {{ selectedArticle.designation }}
        </div>
        <p class="mt-1 text-sm text-gray-500">Édition des stocks hebdomadaires.</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <div class="flex space-x-3">
          <Button 
            variant="outline" 
            size="md"
            @click="handleCancel"
            class="w-auto"
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            size="md"
            @click="handleSave"
            :loading="isSaving"
            :disabled="!hasChanges"
            class="w-auto"
          >
            {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2" />
          <span class="text-red-800">{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content Card -->
    <div v-else-if="selectedSite && selectedArticle" class="bg-white rounded-2xl shadow-soft p-6">
      <!-- Quick Actions -->
      <div class="bg-gray-50 rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Actions rapides</h3>
        </div>
        <!-- Desktop Layout -->
        <div class="hidden md:flex justify-between items-center flex-wrap gap-4">
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="sm" @click="applyBulkValue" class="w-auto">
              Appliquer
            </Button>
            <input 
              v-model.number="bulkValue" 
              type="number" 
              min="0" 
              class="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Valeur"
            >
            <span class="text-sm text-gray-700">à</span>
            <select 
              v-model="bulkApplyTarget"
              class="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tout</option>
              <option v-for="quarter in quarterOptions" :key="quarter.id" :value="quarter.id">
                {{ quarter.label }}
              </option>
            </select>
          </div>
          <Button variant="outline" size="sm" @click="confirmReset" class="w-auto">
            Remettre à zéro
          </Button>
        </div>

        <!-- Mobile Layout -->
        <div class="md:hidden space-y-4">
          <div class="flex justify-center">
            <Button variant="outline" size="sm" @click="applyBulkValue" class="w-full max-w-xs">
              Appliquer
            </Button>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <input 
              v-model.number="bulkValue" 
              type="number" 
              min="0" 
              class="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Valeur"
            >
            <span class="text-sm text-gray-700">à</span>
            <select 
              v-model="bulkApplyTarget"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tout</option>
              <option v-for="quarter in quarterOptions" :key="quarter.id" :value="quarter.id">
                {{ quarter.label }}
              </option>
            </select>
          </div>
          <div class="flex justify-center">
            <Button variant="outline" size="sm" @click="confirmReset" class="w-full max-w-xs">
              Remettre à zéro
            </Button>
          </div>
        </div>
      </div>

      <!-- Weekly Values Grid -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Quarter Column -->
          <div v-for="quarter in quarters" :key="quarter.id" class="space-y-4">
            <!-- Quarter Header -->
            <div class="text-center">
              <h3 class="text-lg font-medium text-gray-900">{{ quarter.name }}</h3>
              <div class="text-sm text-gray-500 mt-1">
                Total: {{ getQuarterTotal(quarter.range).toLocaleString('fr-FR') }} unités
              </div>
            </div>
            
            <!-- Week Inputs -->
            <div class="space-y-1">
              <div 
                v-for="week in getQuarterWeeks(quarter.range)" 
                :key="week.numero"
                class="flex items-center space-x-1"
              >
                <label class="text-xs font-medium text-gray-600 w-6 flex-shrink-0">
                  S{{ week.numero }}
                </label>
                <input 
                  v-model.number="getWeekData(week.numero).quantiteStock"
                  type="number" 
                  min="0"
                  class="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary-500 focus:border-transparent text-center"
                  :class="{ 'bg-yellow-50 border-yellow-300': hasWeekChanged(week.numero) }"
                  @input="markAsChanged"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Total Summary -->
      <div class="mt-6 bg-gray-50 rounded-lg p-4">
        <div class="text-center">
          <span class="text-lg font-medium text-gray-900">Total actuel: </span>
          <span class="text-xl font-semibold text-primary-600">{{ currentTotal.toLocaleString('fr-FR') }}</span>
          <span class="text-lg text-gray-600"> unités</span>
        </div>
      </div>
    </div>

    <!-- Unsaved Changes Warning -->
    <div v-if="hasChanges" class="fixed bottom-4 right-4 bg-orange-100 border border-orange-400 rounded-lg p-4 shadow-lg">
      <div class="flex items-center">
        <ExclamationTriangleIcon class="h-5 w-5 text-orange-500 mr-2" />
        <span class="text-orange-800 text-sm">Vous avez des modifications non sauvegardées</span>
      </div>
    </div>

    <!-- Reset Confirmation Modal -->
    <ConfirmDialog
      :open="showResetConfirm"
      title="Remettre à zéro"
      message="Êtes-vous sûr de vouloir remettre toutes les semaines à zéro ? Cette action ne peut pas être annulée."
      confirm-text="Remettre à zéro"
      cancel-text="Annuler"
      variant="warning"
      @confirm="handleResetConfirm"
      @cancel="handleResetCancel"
    />

    <!-- Cancel Confirmation Modal -->
    <ConfirmDialog
      :open="showCancelConfirm"
      title="Modifications non sauvegardées"
      message="Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter sans sauvegarder ?"
      confirm-text="Quitter sans sauvegarder"
      cancel-text="Continuer l'édition"
      variant="warning"
      @confirm="handleCancelConfirm"
      @cancel="handleCancelCancel"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import Button from '../components/ui/Button.vue';
import ConfirmDialog from '../components/ui/ConfirmDialog.vue';
import stockFournisseurAPI from '../api/stockFournisseur';
import articlesAPI from '../api/articles';
import { useAuthStore } from '../stores/authStore';

export default {
  name: 'WeeklyStockEditPage',
  components: {
    Button,
    ConfirmDialog,
    ExclamationTriangleIcon
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    // Data
    const stockData = ref(null);
    const selectedSite = ref(null);
    const selectedArticle = ref(null);
    const weeklyStocks = ref([]);
    const originalWeeklyStocks = ref([]);
    const currentCampaign = ref('25-26'); // Default campaign
    const isLoading = ref(false);
    const isSaving = ref(false);
    const error = ref(null);
    const hasChanges = ref(false);
    const bulkValue = ref(0);
    const bulkApplyTarget = ref('all');
    
    // Modal states
    const showResetConfirm = ref(false);
    const showCancelConfirm = ref(false);

    // Quarters configuration
    const quarters = [
      { id: 'Q3', name: 'Q3 (S27-S39)', range: [27, 39] },
      { id: 'Q4', name: 'Q4 (S40-S52)', range: [40, 52] },
      { id: 'Q1', name: 'Q1 (S1-S13)', range: [1, 13] },
      { id: 'Q2', name: 'Q2 (S14-S26)', range: [14, 26] }
    ];

    // Quarter options for bulk apply (computed based on campaign)
    const quarterOptions = computed(() => {
      if (!currentCampaign.value) return [];
      
      // Parse campaign string (e.g., "24-25" -> 2024, 2025)
      const campaignParts = currentCampaign.value.split('-');
      if (campaignParts.length !== 2) return [];
      
      const firstYear = parseInt(`20${campaignParts[0]}`);
      const secondYear = parseInt(`20${campaignParts[1]}`);
      
      return [
        { id: 'Q3', label: `${firstYear} Q3` },
        { id: 'Q4', label: `${firstYear} Q4` },
        { id: 'Q1', label: `${secondYear} Q1` },
        { id: 'Q2', label: `${secondYear} Q2` }
      ];
    });

    // Computed
    const currentTotal = computed(() => {
      if (!weeklyStocks.value) return 0;
      return weeklyStocks.value.reduce((sum, week) => sum + (week.quantiteStock || 0), 0);
    });

    // Methods
    const initializeData = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        // Get route params
        const { siteId, articleId, campagne } = route.params;
        
        if (campagne) {
          currentCampaign.value = campagne;
        }

        // Get site info from user's entity details
        if (authStore.user?.entiteDetails?.sites) {
          selectedSite.value = authStore.user.entiteDetails.sites.find(s => s._id === siteId);
        }

        if (!selectedSite.value) {
          throw new Error('Site non trouvé');
        }

        // Get article info from API
        try {
          const articleResponse = await articlesAPI.getArticleById(articleId);
          selectedArticle.value = articleResponse;
        } catch (articleError) {
          console.error('Error fetching article:', articleError);
          selectedArticle.value = {
            _id: articleId,
            designation: 'Article non trouvé',
            codeArticle: 'N/A'
          };
        }

        // Try to get existing stock data
        try {
          const stockResponse = await stockFournisseurAPI.getSiteStock(
            authStore.user.entiteId,
            siteId
          );
          
          // Find stock for this campaign
          const campaignStock = stockResponse.stocks?.find(s => s.campagne === currentCampaign.value);
          if (campaignStock) {
            stockData.value = campaignStock;
            // Find weekly stocks for this article
            const articleWeeklyStocks = [];
            campaignStock.weeklyStocks?.forEach(weekStock => {
              const articleStock = weekStock.articles?.find(a => a.articleId === articleId);
              if (articleStock) {
                articleWeeklyStocks.push({
                  numeroSemaine: weekStock.numeroSemaine,
                  quantiteStock: articleStock.quantiteStock
                });
              }
            });
            weeklyStocks.value = articleWeeklyStocks;
          }
        } catch (stockError) {
          console.warn('No existing stock found, will create new:', stockError);
          stockData.value = null;
          weeklyStocks.value = [];
        }

        // Initialize all 52 weeks if not exist
        if (!weeklyStocks.value) {
          weeklyStocks.value = [];
        }

        for (let i = 1; i <= 52; i++) {
          const existingWeek = weeklyStocks.value.find(w => w.numeroSemaine === i);
          if (!existingWeek) {
            weeklyStocks.value.push({
              numeroSemaine: i,
              quantiteStock: 0
            });
          }
        }

        // Sort weeks
        weeklyStocks.value.sort((a, b) => a.numeroSemaine - b.numeroSemaine);

        // Store original data for change detection
        originalWeeklyStocks.value = JSON.parse(JSON.stringify(weeklyStocks.value));

      } catch (err) {
        error.value = err.response?.data?.message || err.message || 'Erreur lors du chargement';
        console.error('Error fetching data:', err);
      } finally {
        isLoading.value = false;
      }
    };

    const getQuarterWeeks = (range) => {
      if (!weeklyStocks.value) return [];
      
      const [start, end] = range;
      return weeklyStocks.value
        .filter(week => week.numeroSemaine >= start && week.numeroSemaine <= end)
        .map(week => ({
          numero: week.numeroSemaine,
          quantite: week.quantiteStock || 0
        }))
        .sort((a, b) => a.numero - b.numero);
    };

    const getWeekData = (weekNumber) => {
      return weeklyStocks.value.find(w => w.numeroSemaine === weekNumber) || { quantiteStock: 0 };
    };

    const getQuarterTotal = (range) => {
      return getQuarterWeeks(range).reduce((sum, week) => sum + (week.quantite || 0), 0);
    };

    const hasWeekChanged = (weekNumber) => {
      if (!originalWeeklyStocks.value) return false;
      const original = originalWeeklyStocks.value.find(w => w.numeroSemaine === weekNumber);
      const current = weeklyStocks.value.find(w => w.numeroSemaine === weekNumber);
      return (original?.quantiteStock || 0) !== (current?.quantiteStock || 0);
    };

    const markAsChanged = () => {
      hasChanges.value = true;
    };

    const setAllWeeks = (value) => {
      if (!weeklyStocks.value) return;
      
      weeklyStocks.value.forEach(week => {
        week.quantiteStock = value || 0;
      });
      markAsChanged();
    };

    const applyBulkValue = () => {
      if (!weeklyStocks.value || (bulkValue.value !== 0 && !bulkValue.value)) return;
      
      if (bulkApplyTarget.value === 'all') {
        // Apply to all weeks
        setAllWeeks(bulkValue.value);
      } else {
        // Apply to specific quarter
        const quarter = quarters.find(q => q.id === bulkApplyTarget.value);
        if (quarter) {
          const [start, end] = quarter.range;
          weeklyStocks.value.forEach(week => {
            if (week.numeroSemaine >= start && week.numeroSemaine <= end) {
              week.quantiteStock = bulkValue.value;
            }
          });
          markAsChanged();
        }
      }
    };

    const confirmReset = () => {
      showResetConfirm.value = true;
    };

    const handleResetConfirm = () => {
      setAllWeeks(0);
      showResetConfirm.value = false;
    };

    const handleResetCancel = () => {
      showResetConfirm.value = false;
    };

    const handleSave = async () => {
      try {
        isSaving.value = true;
        error.value = null;

        const { siteId, articleId } = route.params;
        const fournisseurId = authStore.user.entiteId;

        // Group weekly stocks by week number for API call
        const weeklyUpdates = weeklyStocks.value.map(week => ({
          numeroSemaine: week.numeroSemaine,
          articles: [{
            articleId: articleId,
            quantiteStock: week.quantiteStock || 0
          }]
        }));

        // Update each week that has changes
        for (const weekUpdate of weeklyUpdates) {
          if (weekUpdate.articles[0].quantiteStock > 0 || hasWeekChanged(weekUpdate.numeroSemaine)) {
            await stockFournisseurAPI.updateWeeklyStock(
              fournisseurId,
              siteId,
              articleId,
              {
                campagne: currentCampaign.value,
                numeroSemaine: weekUpdate.numeroSemaine,
                quantite: weekUpdate.articles[0].quantiteStock
              }
            );
          }
        }

        hasChanges.value = false;
        originalWeeklyStocks.value = JSON.parse(JSON.stringify(weeklyStocks.value));
        
        // Go back to the stock list
        router.push('/stocks');
        
      } catch (err) {
        error.value = err.response?.data?.message || 'Erreur lors de la sauvegarde';
        console.error('Error saving:', err);
      } finally {
        isSaving.value = false;
      }
    };

    const handleCancel = () => {
      if (hasChanges.value) {
        showCancelConfirm.value = true;
      } else {
        router.push('/stocks');
      }
    };

    const handleCancelConfirm = () => {
      router.push('/stocks');
      showCancelConfirm.value = false;
    };

    const handleCancelCancel = () => {
      showCancelConfirm.value = false;
    };

    // Prevent navigation if there are unsaved changes
    const beforeUnloadHandler = (event) => {
      if (hasChanges.value) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    onMounted(() => {
      initializeData();
      window.addEventListener('beforeunload', beforeUnloadHandler);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    });

    return {
      stockData,
      selectedSite,
      selectedArticle,
      weeklyStocks,
      currentCampaign,
      isLoading,
      isSaving,
      error,
      hasChanges,
      bulkValue,
      bulkApplyTarget,
      quarters,
      quarterOptions,
      currentTotal,
      getQuarterWeeks,
      getQuarterTotal,
      getWeekData,
      hasWeekChanged,
      markAsChanged,
      setAllWeeks,
      applyBulkValue,
      confirmReset,
      handleResetConfirm,
      handleResetCancel,
      handleCancelConfirm,
      handleCancelCancel,
      showResetConfirm,
      showCancelConfirm,
      handleSave,
      handleCancel
    };
  }
};
</script>