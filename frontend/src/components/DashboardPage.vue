<script setup>
import { ref, computed, onMounted } from 'vue';
import ArticleList from "./ArticleList.vue";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/vue/20/solid";
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CircleStackIcon
} from "@heroicons/vue/24/outline";
import Button from "./ui/Button.vue";
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import api from '../api/axios';

const authStore = useAuthStore();
const router = useRouter();

// Stock update status for suppliers
const stockUpdateStatus = ref(null);
const isLoadingStockStatus = ref(false);

const stats = [
    {
        name: "Revenu de Décembre",
        stat: "287,000 €",
        previousStat: "250,000 €",
        change: "12%",
        changeType: "increase",
        tags: ["Macbook m2", "iPhone 15"],
    },
    {
        name: "Ventes de Décembre",
        stat: "4,5k",
        previousStat: "4,2k",
        change: "9.18%",
        changeType: "increase",
        tags: ["1,272 iPhone 15", "675 Macbook"],
    },
];

// Check if user is a supplier or station (has stock management)
const isSupplier = computed(() => {
  const result = authStore.user?.role === 'Fournisseur';
  console.log('[Dashboard] isSupplier:', result, 'user role:', authStore.user?.role);
  return result;
});

const isStation = computed(() => {
  const result = authStore.user?.role === 'Station';
  console.log('[Dashboard] isStation:', result, 'user role:', authStore.user?.role);
  return result;
});

const hasStockManagement = computed(() => {
  // Only suppliers and stations show individual stock status
  // Gestionnaire/Manager have their own dashboard
  const result = isSupplier.value || isStation.value;
  console.log('[Dashboard] hasStockManagement:', result, 'isSupplier:', isSupplier.value, 'isStation:', isStation.value);
  return result;
});

// Fetch stock update status for suppliers and stations
const fetchStockUpdateStatus = async () => {
  if (!hasStockManagement.value) return;
  
  try {
    isLoadingStockStatus.value = true;
    const entiteId = authStore.user.entiteId;
    
    let response;
    if (isSupplier.value) {
      // Get the latest stock update date for this supplier
      response = await api.get(`/stocks-fournisseurs/status/${entiteId}`);
    } else if (isStation.value) {
      // Get the latest stock update date for this station
      response = await api.get(`/stocks-stations/status/${entiteId}`);
    }
    
    console.log('[DEBUG] API Response:', response.data);
    stockUpdateStatus.value = response.data.data; // Extract the data from the response
  } catch (error) {
    console.error('Error fetching stock status:', error);
    // Set default status if API fails
    stockUpdateStatus.value = {
      lastUpdateDate: null,
      daysSinceUpdate: null,
      status: 'unknown'
    };
  } finally {
    isLoadingStockStatus.value = false;
  }
};

// Computed properties for stock status display
const stockStatusConfig = computed(() => {
  if (!stockUpdateStatus.value) return null;
  
  const { daysSinceUpdate, lastUpdateDate, status } = stockUpdateStatus.value;
  
  console.log('[DEBUG Frontend] Stock status data:', { daysSinceUpdate, status, lastUpdateDate });
  
  // Use the backend's status determination directly
  switch (status) {
    case 'good':
      return {
        status: 'good',
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: CheckCircleIcon,
        title: 'Stocks à jour',
        message: daysSinceUpdate !== null ? 
          `Mis à jour il y a ${daysSinceUpdate} jour${daysSinceUpdate > 1 ? 's' : ''}` :
          'Stocks récemment mis à jour',
        actionText: 'Voir les stocks'
      };
      
    case 'warning':
      return {
        status: 'warning',
        color: 'amber',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        icon: ClockIcon,
        title: 'Mise à jour recommandée',
        message: daysSinceUpdate !== null ? 
          `Dernière mise à jour il y a ${daysSinceUpdate} jours` :
          'Mise à jour recommandée',
        actionText: 'Mettre à jour'
      };
      
    case 'critical':
      return {
        status: 'critical',
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: ExclamationTriangleIcon,
        title: 'Mise à jour critique',
        message: daysSinceUpdate !== null ? 
          `Dernière mise à jour il y a ${daysSinceUpdate} jours` :
          'Mise à jour urgente requise',
        actionText: 'Mettre à jour maintenant'
      };
      
    case 'never':
    default:
      return {
        status: 'never',
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: ExclamationTriangleIcon,
        title: 'Aucune mise à jour',
        message: 'Vos stocks n\'ont jamais été mis à jour',
        actionText: 'Mettre à jour maintenant'
      };
  }
});

const navigateToStocks = () => {
  // Navigate to appropriate stock management page based on user role
  console.log('[Dashboard] Navigation to stocks, user role:', authStore.user?.role);
  
  if (authStore.user?.role === 'Fournisseur') {
    console.log('[Dashboard] Navigating to supplier stocks');
    router.push('/stocks/supplier');
  } else if (authStore.user?.role === 'Station') {
    console.log('[Dashboard] Navigating to station stocks');
    router.push('/stocks/station');
  } else if (['Gestionnaire', 'Manager'].includes(authStore.user?.role)) {
    console.log('[Dashboard] Navigating to stations dashboard');
    router.push('/stocks/stations-dashboard');
  } else {
    console.log('[Dashboard] Navigating to default stocks page');
    router.push('/stocks');
  }
};

onMounted(() => {
  fetchStockUpdateStatus();
});
</script>

<template>
    <div>
        <!-- Page Title -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p class="mt-1 text-sm text-gray-500">Toutes les informations générales apparaissent dans ce champ</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Stock Status Card (Supplier & Station) -->
            <div v-if="hasStockManagement" class="lg:col-span-1 bg-white rounded-2xl shadow-soft p-6 border-l-4" :class="[stockStatusConfig?.borderColor || 'border-gray-200']">
                <!-- Loading State -->
                <div v-if="isLoadingStockStatus" class="flex flex-col items-center text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p class="text-sm text-gray-500">Vérification du statut des stocks...</p>
                </div>
                
                <!-- Stock Status Content -->
                <div v-else-if="stockStatusConfig" class="flex flex-col">
                    <div class="flex items-center mb-4">
                        <div class="flex-shrink-0 mr-3" :class="[stockStatusConfig.bgColor, 'p-2 rounded-full']">
                            <component :is="stockStatusConfig.icon" class="h-6 w-6" :class="stockStatusConfig.textColor" />
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900">{{ stockStatusConfig.title }}</h3>
                            <p :class="[stockStatusConfig.textColor, 'text-sm font-medium']">
                                Statut des stocks
                            </p>
                        </div>
                    </div>
                    
                    <div class="mb-6" :class="[stockStatusConfig.bgColor, 'p-4 rounded-lg']">
                        <div class="flex items-center">
                            <CircleStackIcon class="h-5 w-5 mr-2" :class="stockStatusConfig.textColor" />
                            <p :class="[stockStatusConfig.textColor, 'text-sm']">
                                {{ stockStatusConfig.message }}
                            </p>
                        </div>
                    </div>
                    
                    <Button 
                        variant="primary" 
                        size="md" 
                        @click="navigateToStocks"
                        class="w-full"
                    >
                        {{ stockStatusConfig.actionText }}
                    </Button>
                </div>
            </div>

            <!-- December Report Card (Non-Stock Management Users) -->
            <div v-if="!hasStockManagement" class="lg:col-span-1 bg-white rounded-2xl shadow-soft p-6 flex flex-col items-center text-center">
                <div class="relative w-24 h-24 mb-4">
                    <div class="absolute inset-0 bg-primary-100 rounded-full opacity-50"></div>
                    <div class="absolute inset-2 bg-primary-200 rounded-full opacity-60"></div>
                    <img src="@/assets/favicon.png" alt="Rocket" class="relative w-full h-full p-4" />
                </div>
                <h2 class="text-xl font-semibold text-gray-900">Rapport de Décembre</h2>
                <p class="text-sm text-gray-500 mt-1 mb-4">
                    Récupérez le rapport de décembre, analysez les données clés pour des décisions stratégiques
                    éclairées.
                </p>
                <div class="flex gap-x-4">
                    <Button variant="primary" size="md">Analyser</Button>
                    <Button variant="secondary" size="md">Télécharger</Button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div
                    v-for="item in stats"
                    :key="item.name"
                    class="relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft"
                >
                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-500">{{ item.name }}</p>
                            <p class="mt-1 text-3xl font-bold text-gray-900">{{ item.stat }}</p>
                        </div>
                        <div
                            :class="[
                                item.changeType === 'increase'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800',
                                'inline-flex items-baseline rounded-full px-2.5 py-1 text-sm font-medium',
                            ]"
                        >
                            <ArrowUpIcon
                                v-if="item.changeType === 'increase'"
                                class="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500"
                                aria-hidden="true"
                            />
                            <ArrowDownIcon
                                v-else
                                class="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500"
                                aria-hidden="true"
                            />
                            <span class="sr-only">
                                {{ item.changeType === "increase" ? "Augmenté" : "Diminué" }} de
                            </span>
                            {{ item.change }}
                        </div>
                    </div>
                    <div class="mt-4 flex space-x-2">
                        <span
                            v-for="tag in item.tags"
                            :key="tag"
                            class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                            ># {{ tag }}</span
                        >
                    </div>
                    <!-- Simple chart placeholder -->
                    <div class="mt-6 h-16 bg-gray-50 rounded-lg"></div>
                </div>
            </div>
        </div>
    </div>
</template>
