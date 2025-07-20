<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="sm:flex sm:items-center mb-8">
      <div class="sm:flex-auto">
        <h1 class="text-3xl font-bold text-gray-900">
          <span v-if="prevision">
            Prévisions {{ prevision.campagne }}
          </span>
          <span v-else>
            Prévisions
          </span>
        </h1>
        <div v-if="prevision" class="mt-1 text-xl font-medium text-gray-700">
          {{ prevision.fournisseurId?.nom }} ({{ getSiteName() }})
        </div>
        <p class="mt-1 text-sm text-gray-500">Tableau de bord des prévisions.</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <Button 
          variant="outline" 
          size="md"
          @click="router.push('/previsions')"
        >
          Retour
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-6">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2" />
          <span class="text-red-800">{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="prevision" class="space-y-6">
      <!-- First Row: Summary Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Articles Count Card -->
        <div class="bg-white rounded-2xl shadow-soft p-6 flex items-center justify-center">
          <div class="text-center">
            <div class="text-6xl font-bold text-primary-600 mb-2">
              {{ dashboardData.totalArticles }}
            </div>
            <div class="text-lg font-medium text-gray-900 mb-1">
              Articles concernés
            </div>
            <div class="text-sm text-gray-500">
              par les prévisions
            </div>
          </div>
        </div>

        <!-- Previsions by Category Card -->
        <div class="bg-white rounded-2xl shadow-soft p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Prévisions par catégorie</h3>
          <div class="space-y-3">
            <div 
              v-for="category in dashboardData.categorieStats" 
              :key="category.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-3" :style="{ backgroundColor: category.color }"></div>
                <span class="text-sm font-medium text-gray-700">{{ category.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-gray-900">{{ formatNumber(category.total) }}</div>
              </div>
            </div>
          </div>
          <div v-if="dashboardData.categorieStats.length === 0" class="text-center text-gray-500 text-sm py-4">
            Aucune donnée disponible
          </div>
        </div>

        <!-- Previsions by Conditioning Unit Card -->
        <div class="bg-white rounded-2xl shadow-soft p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Prévisions par unité de conditionnement</h3>
          <div class="space-y-3">
            <div 
              v-for="conditioning in dashboardData.conditionnementStats" 
              :key="conditioning.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-3" :style="{ backgroundColor: conditioning.color }"></div>
                <span class="text-sm font-medium text-gray-700">{{ conditioning.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-gray-900">{{ formatNumber(conditioning.total) }}</div>
              </div>
            </div>
          </div>
          <div v-if="dashboardData.conditionnementStats.length === 0" class="text-center text-gray-500 text-sm py-4">
            Aucune donnée disponible
          </div>
        </div>
      </div>

      <!-- Second Row: Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Volumes by Category Chart -->
        <div class="bg-white rounded-2xl shadow-soft p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Volumes par catégorie</h3>
          <div class="h-80">
            <canvas ref="categoryChartRef" class="w-full h-full"></canvas>
          </div>
        </div>

        <!-- Volumes by Conditioning Unit Chart -->
        <div class="bg-white rounded-2xl shadow-soft p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Volumes par unité de conditionnement</h3>
          <div class="h-80">
            <canvas ref="conditionnementChartRef" class="w-full h-full"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import Button from '../components/ui/Button.vue';
import previsionsAPI from '../api/previsions';

// Register Chart.js components
Chart.register(...registerables);

export default {
  name: 'SitePrevisionViewPage',
  components: {
    Button,
    ExclamationTriangleIcon
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    // Data
    const prevision = ref(null);
    const isLoading = ref(false);
    const error = ref(null);
    
    // Chart references
    const categoryChartRef = ref(null);
    const conditionnementChartRef = ref(null);
    const categoryChart = ref(null);
    const conditionnementChart = ref(null);

    // Colors for charts
    const chartColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
    ];

    /**
     * Get site name from prevision
     */
    const getSiteName = () => {
      if (!prevision.value?.fournisseurId?.sites || !prevision.value?.siteId) return 'N/A';
      const site = prevision.value.fournisseurId.sites.find(s => s._id === prevision.value.siteId);
      return site?.nomSite || 'N/A';
    };

    /**
     * Format number with French locale
     */
    const formatNumber = (number) => {
      if (!number && number !== 0) return '0';
      return new Intl.NumberFormat('fr-FR').format(number);
    };

    /**
     * Get conditioning info for an article
     */
    const getConditionnementInfo = (articlePrevision) => {
      if (!articlePrevision?.articleId?.fournisseurs || !prevision.value?.fournisseurId?._id) {
        return { uniteConditionnement: 'Unité', quantiteParConditionnement: 1 };
      }
      
      const supplierData = articlePrevision.articleId.fournisseurs.find(
        f => f.fournisseurId === prevision.value.fournisseurId._id || f.fournisseurId?._id === prevision.value.fournisseurId._id
      );
      
      return {
        uniteConditionnement: supplierData?.uniteConditionnement || 'Unité',
        quantiteParConditionnement: supplierData?.quantiteParConditionnement || 1
      };
    };

    /**
     * Calculate dashboard data
     */
    const dashboardData = computed(() => {
      if (!prevision.value?.articlesPrevisions) {
        console.log('No prevision or articles data available');
        return {
          totalArticles: 0,
          categorieStats: [],
          conditionnementStats: [],
          weeklyDataByCategory: {},
          weeklyDataByConditionnement: {}
        };
      }

      const articles = prevision.value.articlesPrevisions;
      console.log('Computing dashboard data for articles:', articles);
      const categorieMap = new Map();
      const conditionnementMap = new Map();
      const weeklyByCategory = {};
      const weeklyByConditionnement = {};

      // Process each article
      articles.forEach((articlePrevision, index) => {
        const categorie = articlePrevision.articleId?.categorie || 'Non catégorisé';
        const conditionnementInfo = getConditionnementInfo(articlePrevision);
        const conditionnement = conditionnementInfo.uniteConditionnement;

        // Calculate total for this article
        const total = articlePrevision.semaines?.reduce((sum, semaine) => 
          sum + (semaine.quantitePrevue || 0), 0) || 0;

        // Update category stats
        if (!categorieMap.has(categorie)) {
          categorieMap.set(categorie, {
            name: categorie,
            total: 0,
            color: chartColors[categorieMap.size % chartColors.length]
          });
          weeklyByCategory[categorie] = new Array(52).fill(0);
        }
        categorieMap.get(categorie).total += total;

        // Update conditioning stats
        if (!conditionnementMap.has(conditionnement)) {
          conditionnementMap.set(conditionnement, {
            name: conditionnement,
            total: 0,
            color: chartColors[conditionnementMap.size % chartColors.length]
          });
          weeklyByConditionnement[conditionnement] = new Array(52).fill(0);
        }
        conditionnementMap.get(conditionnement).total += total;

        // Update weekly data
        articlePrevision.semaines?.forEach(semaine => {
          const weekIndex = semaine.numeroSemaine - 1;
          if (weekIndex >= 0 && weekIndex < 52) {
            weeklyByCategory[categorie][weekIndex] += semaine.quantitePrevue || 0;
            weeklyByConditionnement[conditionnement][weekIndex] += semaine.quantitePrevue || 0;
          }
        });
      });

      const result = {
        totalArticles: articles.length,
        categorieStats: Array.from(categorieMap.values()).sort((a, b) => b.total - a.total),
        conditionnementStats: Array.from(conditionnementMap.values()).sort((a, b) => b.total - a.total),
        weeklyDataByCategory: weeklyByCategory,
        weeklyDataByConditionnement: weeklyByConditionnement
      };
      
      console.log('Dashboard data computed:', result);
      return result;
    });

    /**
     * Create category chart
     */
    const createCategoryChart = () => {
      if (!categoryChartRef.value) {
        console.log('Category chart ref not available');
        return;
      }
      
      // Destroy existing chart
      if (categoryChart.value) {
        categoryChart.value.destroy();
        categoryChart.value = null;
      }

      const data = dashboardData.value;
      if (!data.categorieStats.length) {
        console.log('No category stats available');
        return;
      }

      console.log('Creating category chart with data:', data.categorieStats);

      const ctx = categoryChartRef.value.getContext('2d');

      // Create labels in campaign order: weeks 27-52, then weeks 1-26
      const campaignLabels = [
        ...Array.from({ length: 26 }, (_, i) => `S${i + 27}`), // S27 to S52
        ...Array.from({ length: 26 }, (_, i) => `S${i + 1}`)   // S1 to S26
      ];

      // Reorder weekly data to match campaign sequence
      const reorderedDatasets = data.categorieStats.map(category => {
        const weeklyData = data.weeklyDataByCategory[category.name] || new Array(52).fill(0);
        // Reorder data: weeks 26-51 (indices for weeks 27-52), then weeks 0-25 (indices for weeks 1-26)
        const reorderedData = [
          ...weeklyData.slice(26, 52), // weeks 27-52
          ...weeklyData.slice(0, 26)   // weeks 1-26
        ];
        
        return {
          label: category.name,
          data: reorderedData,
          borderColor: category.color,
          backgroundColor: category.color + '20',
          borderWidth: 2,
          fill: false,
          tension: 0.1
        };
      });

      categoryChart.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: campaignLabels,
          datasets: reorderedDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Semaines'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Volumes (unités)'
              },
              beginAtZero: true
            }
          }
        }
      });
    };

    /**
     * Create conditioning chart
     */
    const createConditionnementChart = () => {
      if (!conditionnementChartRef.value) {
        console.log('Conditioning chart ref not available');
        return;
      }
      
      // Destroy existing chart
      if (conditionnementChart.value) {
        conditionnementChart.value.destroy();
        conditionnementChart.value = null;
      }

      const data = dashboardData.value;
      if (!data.conditionnementStats.length) {
        console.log('No conditioning stats available');
        return;
      }

      console.log('Creating conditioning chart with data:', data.conditionnementStats);

      const ctx = conditionnementChartRef.value.getContext('2d');

      // Create labels in campaign order: weeks 27-52, then weeks 1-26
      const campaignLabels = [
        ...Array.from({ length: 26 }, (_, i) => `S${i + 27}`), // S27 to S52
        ...Array.from({ length: 26 }, (_, i) => `S${i + 1}`)   // S1 to S26
      ];

      // Reorder weekly data to match campaign sequence
      const reorderedDatasets = data.conditionnementStats.map(conditionnement => {
        const weeklyData = data.weeklyDataByConditionnement[conditionnement.name] || new Array(52).fill(0);
        // Reorder data: weeks 26-51 (indices for weeks 27-52), then weeks 0-25 (indices for weeks 1-26)
        const reorderedData = [
          ...weeklyData.slice(26, 52), // weeks 27-52
          ...weeklyData.slice(0, 26)   // weeks 1-26
        ];
        
        return {
          label: conditionnement.name,
          data: reorderedData,
          borderColor: conditionnement.color,
          backgroundColor: conditionnement.color + '20',
          borderWidth: 2,
          fill: false,
          tension: 0.1
        };
      });

      conditionnementChart.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: campaignLabels,
          datasets: reorderedDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Semaines'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Volumes (unités)'
              },
              beginAtZero: true
            }
          }
        }
      });
    };

    /**
     * Create all charts
     */
    const createCharts = async () => {
      // Wait for multiple ticks to ensure DOM is fully rendered
      await nextTick();
      await nextTick();
      
      // Additional wait to ensure canvas elements are ready
      setTimeout(() => {
        createCategoryChart();
        createConditionnementChart();
      }, 100);
    };

    /**
     * Fetch prevision data
     */
    const fetchPrevision = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const response = await previsionsAPI.getPrevisionById(route.params.id);
        prevision.value = response;

        // Wait for DOM update and create charts
        await createCharts();

      } catch (err) {
        error.value = err.response?.data?.message || 'Erreur lors du chargement';
        console.error('Error fetching prevision:', err);
      } finally {
        isLoading.value = false;
      }
    };


    /**
     * Cleanup charts
     */
    const destroyCharts = () => {
      if (categoryChart.value) {
        categoryChart.value.destroy();
        categoryChart.value = null;
      }
      if (conditionnementChart.value) {
        conditionnementChart.value.destroy();
        conditionnementChart.value = null;
      }
    };

    // Watch dashboard data changes to recreate charts
    watch(
      () => dashboardData.value,
      async (newData, oldData) => {
        if (newData && newData.categorieStats.length > 0 && !isLoading.value && prevision.value) {
          console.log('Dashboard data changed, recreating charts');
          await createCharts();
        }
      },
      { deep: true }
    );

    // Watch for when prevision data is available to create charts
    watch(
      () => prevision.value,
      async (newPrevision) => {
        if (newPrevision && newPrevision.articlesPrevisions?.length > 0 && !isLoading.value) {
          console.log('Prevision data loaded, creating charts');
          await createCharts();
        }
      }
    );

    onMounted(() => {
      fetchPrevision();
    });

    onBeforeUnmount(() => {
      destroyCharts();
    });

    return {
      router,
      prevision,
      isLoading,
      error,
      dashboardData,
      categoryChartRef,
      conditionnementChartRef,
      getSiteName,
      formatNumber
    };
  }
};
</script>