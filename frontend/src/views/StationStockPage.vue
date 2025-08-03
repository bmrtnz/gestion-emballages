<script setup>
import { computed, ref } from "vue";
import {
    CircleStackIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
} from "@heroicons/vue/24/outline";

// Components
import Button from "../components/ui/Button.vue";
import Select from "../components/ui/Select.vue";
import WeekPicker from "../components/ui/WeekPicker.vue";
import SlidePanel from "../components/ui/SlidePanel.vue";
import ConfirmModal from "../components/ui/ConfirmModal.vue";

// API and Composables
import articlesAPI from "../api/articles";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";
import { useStationStock } from "../composables/stocks/useStationStock";
import { useErrorHandler } from "../composables/useErrorHandler";

const authStore = useAuthStore();
const router = useRouter();
const { handleError } = useErrorHandler();

// Use the main orchestrator composable
const {
    // Data state
    availableArticles,
    stockQuantities,
    originalQuantities,
    isLoadingArticles,
    isLoadingStock,
    isSaving,
    hasChanges,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    currentCampaign,

    // UI state
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
    weekOptions,
    availableWeeks,
    currentYear,
    isWeekInPast,
    canShowForm,
    paginationPages,

    // Strategy-based data
    transformedArticles,
    permissions,
    uiBehavior,
    availableActions,
    quickActions,
    tableColumns,
    availableFilters,
    canGoToPreviousWeek,
    canGoToNextWeek,

    // Methods
    loadArticles,
    loadStockData,
    saveStockWithValidation,
    addArticleWithValidation,
    resetChangesWithNotification,
    handleWeekChange,
    handleConfirmedWeekChange,
    searchForArticles,
    debouncedArticleSearch,
    openAddArticlePanel,
    closeAddArticlePanel,
    requestWeekChange,
    confirmWeekChange,
    cancelWeekChange,
    goToPreviousWeek,
    goToNextWeek,
    goToPage,
    previousPage,
    nextPage,
    canAccessStock,
    canModifyStock,

    // Strategy instance
    strategy,
} = useStationStock();

// Check access permissions using strategy
const hasAccess = computed(() => {
    return permissions.value.canView && authStore.user?.role === "Station";
});

// Articles are already filtered and paginated by the server
const paginatedArticles = computed(() => {
    return transformedArticles.value;
});

// Add article form state
const selectedCategory = ref("");
const articleNameFilter = ref("");
const allAvailableArticles = ref([]);
const isLoadingAllArticles = ref(false);

// Get all categories dynamically from loaded articles
const allCategories = computed(() => {
    // Extract unique categories from all available articles
    const categories = new Set();
    allAvailableArticles.value.forEach((article) => {
        if (article.categorie) {
            categories.add(article.categorie);
        }
    });
    // Convert to array and sort alphabetically
    return Array.from(categories).sort();
});

// Get categories with article count for better UX
const categoriesWithCount = computed(() => {
    const categoryCount = {};

    // Count articles per category
    allAvailableArticles.value.forEach((article) => {
        if (article.categorie) {
            categoryCount[article.categorie] = (categoryCount[article.categorie] || 0) + 1;
        }
    });

    // Convert to array with count labels
    return Object.entries(categoryCount)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, count]) => ({
            value: category,
            label: `${category} (${count})`,
        }));
});

// Load all active articles when form opens
const loadAllArticles = async () => {
    if (isLoadingAllArticles.value) {
        return; // Prevent multiple simultaneous calls
    }

    try {
        isLoadingAllArticles.value = true;

        // Use the new dedicated endpoint that returns all active articles without pagination
        const response = await articlesAPI.getAllActiveArticles();
        allAvailableArticles.value = response.data || [];
    } catch (err) {
        handleError(err);
        allAvailableArticles.value = []; // Reset on error
    } finally {
        isLoadingAllArticles.value = false;
    }
};

// Filter articles based on category and name search
const filteredArticles = computed(() => {
    // Start with all available articles
    let filtered = [...allAvailableArticles.value];

    // Filter by category if selected (skip if empty string which means "all categories")
    if (selectedCategory.value && selectedCategory.value !== "") {
        filtered = filtered.filter((article) => article.categorie === selectedCategory.value);
    }

    // Filter by name if entered
    if (articleNameFilter.value && articleNameFilter.value.trim()) {
        const searchTerm = articleNameFilter.value.toLowerCase().trim();
        filtered = filtered.filter(
            (article) =>
                article.designation.toLowerCase().includes(searchTerm) ||
                article.codeArticle.toLowerCase().includes(searchTerm)
        );
    }

    // Return formatted options for the select component
    return filtered.map((article) => ({
        value: article._id,
        label: `${article.designation} (${article.codeArticle})`,
        data: article,
    }));
});

// Handle article selection from dropdown
const handleArticleSelection = (selectedValue) => {
    const articleOption = filteredArticles.value.find((option) => option.value === selectedValue);
    if (articleOption) {
        selectedArticleToAdd.value = articleOption.data;
    }
};

// Reset form when panel closes
const resetAddArticleForm = () => {
    selectedCategory.value = "";
    articleNameFilter.value = "";
    selectedArticleToAdd.value = null;
    // Don't reset allAvailableArticles to avoid reloading
};

// Enhanced open panel method to load articles
const openAddArticlePanelWithData = async () => {
    openAddArticlePanel();
    // Force reload articles every time to ensure fresh data
    allAvailableArticles.value = [];
    await loadAllArticles();
};

// Helper method for adding articles to stock (using composable method)
const addArticleToStock = async () => {
    if (!selectedArticleToAdd.value) return;
    await addArticleWithValidation(selectedArticleToAdd.value);
    resetAddArticleForm();
};

// Get current week number (local implementation)
const getCurrentWeekNumber = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

const currentWeekNumber = computed(() => {
    return getCurrentWeekNumber();
});

// Helper to get the year for a week number
const getWeekYear = (weekNumber) => {
    if (!weekNumber) return '';
    
    // Calculate the year based on campaign and week number
    const campaignParts = currentCampaign.value.split('-');
    const firstYear = parseInt(`20${campaignParts[0]}`);
    const secondYear = parseInt(`20${campaignParts[1]}`);
    
    // Business year: weeks 27-52 are from firstYear, weeks 1-26 are from secondYear
    return weekNumber >= 27 ? firstYear : secondYear;
};

// Helper to get just the date range for a week
const getWeekDateRange = (weekNumber) => {
    if (!weekNumber) return '';
    
    const year = getWeekYear(weekNumber);
    
    // Create a date object for January 4th of the year (always in ISO week 1)
    const jan4 = new Date(year, 0, 4);
    
    // Find the Monday of week 1
    const dayOfWeek = jan4.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const week1Monday = new Date(jan4);
    week1Monday.setDate(jan4.getDate() + daysToMonday);
    
    // Calculate the Monday of the requested week
    const weekStartDate = new Date(week1Monday);
    weekStartDate.setDate(week1Monday.getDate() + (weekNumber - 1) * 7);
    
    // Calculate the Sunday of the same week (end of week)
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    
    // Format dates (DD mon)
    const formatDate = (date) => {
        const day = date.getDate();
        const monthNames = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
        const month = monthNames[date.getMonth()];
        return `${day} ${month}`;
    };
    
    return `(${formatDate(weekStartDate)} - ${formatDate(weekEndDate)})`;
};
</script>

<template>
    <div class="space-y-6">
        <!-- Access Control Check -->
        <div v-if="!hasAccess" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                    <h3 class="text-sm font-medium text-red-800">Accès non autorisé</h3>
                    <p class="text-sm text-red-700 mt-1">
                        Seuls les utilisateurs de type Station peuvent accéder à cette page.
                    </p>
                    <p class="text-sm text-red-600 mt-2">
                        Votre rôle actuel: {{ authStore.user?.role || "Non défini" }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Main Content for Station users -->
        <div v-if="hasAccess">
            <!-- Header Section -->
            <div class="sm:flex sm:items-center justify-between mb-8">
                <div class="sm:flex-auto">
                    <h1 class="text-3xl font-bold text-gray-900">Gestion des Stocks</h1>
                    <p class="mt-1 text-sm text-gray-500">
                        Sélectionnez une semaine pour saisir les stocks de votre station
                    </p>
                </div>
            </div>

            <!-- Main Stock Management Card -->
            <div class="bg-white rounded-2xl shadow-soft p-6 mt-4">
                <!-- Campaign and Week Selection Header -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mb-6 pb-6 border-b border-gray-200">
                    <!-- Campaign Info -->
                    <div class="p-4 bg-blue-50 rounded-lg">
                        <div class="flex items-center">
                            <CalendarIcon class="h-5 w-5 text-blue-600 mr-2" />
                            <span class="text-sm font-medium text-blue-900"> Campagne: {{ currentCampaign }} </span>
                        </div>
                    </div>

                    <!-- Week Navigation -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2 text-center">
                            Semaine
                        </label>
                        <div class="flex items-center space-x-3">
                            <!-- Previous Week Button -->
                            <button
                                @click="() => canGoToPreviousWeek && handleWeekChange(availableWeeks[availableWeeks.indexOf(selectedWeek) - 1])"
                                :disabled="!canGoToPreviousWeek"
                                class="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeftIcon class="h-5 w-5" />
                            </button>
                            
                            <!-- Current Week Display -->
                            <div class="flex-1 text-center">
                                <div :class="[
                                    'px-4 py-2 border border-gray-300 rounded-md',
                                    selectedWeek === currentWeekNumber ? 'bg-white' : 'bg-gray-100'
                                ]">
                                    <span v-if="selectedWeek">
                                        <span :class="selectedWeek === currentWeekNumber ? 'font-bold text-primary-600' : 'font-medium text-gray-900'">
                                            {{ getWeekYear(selectedWeek) }} - S{{ selectedWeek }}
                                        </span>
                                        <span class="text-sm text-gray-600 ml-1">{{ getWeekDateRange(selectedWeek) }}</span>
                                    </span>
                                    <span v-else class="text-gray-900">Aucune semaine</span>
                                </div>
                            </div>
                            
                            <!-- Next Week Button -->
                            <button
                                @click="() => canGoToNextWeek && handleWeekChange(availableWeeks[availableWeeks.indexOf(selectedWeek) + 1])"
                                :disabled="!canGoToNextWeek"
                                class="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRightIcon class="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Past Week Warning (if applicable) -->
                <div v-if="isWeekInPast && canShowForm" class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start">
                        <ExclamationTriangleIcon class="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 class="text-sm font-medium text-amber-800">Attention</h3>
                            <p class="text-sm text-amber-700 mt-1">
                                Vous modifiez les stocks d'une semaine passée. Assurez-vous que ces modifications sont
                                justifiées.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Content based on week selection -->
                <div v-if="canShowForm">
                    <!-- Articles Search and Filter -->
                    <div class="flex flex-col sm:flex-row gap-4 mb-6">
                        <div class="flex-1">
                            <div class="relative">
                                <MagnifyingGlassIcon
                                    class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                                />
                                <input
                                    v-model="articleFilter"
                                    type="text"
                                    placeholder="Rechercher un article..."
                                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <!-- Add Article Button -->
                        <div>
                            <Button @click="openAddArticlePanelWithData" variant="primary" class="whitespace-nowrap">
                                Ajouter un article au suivi
                            </Button>
                        </div>
                    </div>

                    <!-- Loading States -->
                    <div v-if="isLoadingArticles || isLoadingStock" class="flex justify-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="false" class="text-center py-8">
                        <p class="text-red-600">Une erreur est survenue</p>
                        <Button @click="loadArticles" variant="outline" class="mt-4"> Réessayer </Button>
                    </div>

                    <!-- Articles List -->
                    <div v-else-if="paginatedArticles.length > 0">
                        <!-- Mobile View -->
                        <div class="block md:hidden space-y-4">
                            <div
                                v-for="article in paginatedArticles"
                                :key="article._id"
                                class="border border-gray-200 rounded-lg p-4"
                            >
                                <div class="space-y-3">
                                    <div>
                                        <h3 class="font-medium text-gray-900">{{ article.designation }}</h3>
                                        <p class="text-sm text-gray-500">{{ article.codeArticle }}</p>
                                        <span
                                            class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full mt-1"
                                        >
                                            {{ article.categorie }}
                                        </span>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            Quantité en stock
                                        </label>
                                        <input
                                            :value="stockQuantities[article._id] === null ? '' : stockQuantities[article._id]"
                                            @input="stockQuantities[article._id] = $event.target.value === '' ? null : Number($event.target.value)"
                                            type="number"
                                            min="0"
                                            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-right"
                                            placeholder="Quantité"
                                        />
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
                                            <th
                                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Article
                                            </th>
                                            <th
                                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Code
                                            </th>
                                            <th
                                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Catégorie
                                            </th>
                                            <th
                                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Quantité en stock
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        <tr v-for="article in paginatedArticles" :key="article._id">
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="text-sm font-medium text-gray-900">
                                                    {{ article.designation }}
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {{ article.codeArticle }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
                                                >
                                                    {{ article.categorie }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    :value="stockQuantities[article._id] === null ? '' : stockQuantities[article._id]"
                                                    @input="stockQuantities[article._id] = $event.target.value === '' ? null : Number($event.target.value)"
                                                    type="number"
                                                    min="0"
                                                    class="block w-24 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-right"
                                                    placeholder="Qté"
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div v-if="totalPages > 1" class="mt-6">
                            <!-- Mobile Pagination -->
                            <div class="flex justify-between items-center md:hidden">
                                <Button @click="previousPage" :disabled="!hasPrevPage" variant="outline" size="sm">
                                    <ChevronLeftIcon class="h-4 w-4" />
                                    Précédent
                                </Button>
                                <span class="text-sm text-gray-700"> Page {{ currentPage }} sur {{ totalPages }} </span>
                                <Button @click="nextPage" :disabled="!hasNextPage" variant="outline" size="sm">
                                    Suivant
                                    <ChevronRightIcon class="h-4 w-4 ml-1" />
                                </Button>
                            </div>

                            <!-- Desktop Pagination -->
                            <div class="hidden md:flex items-center justify-between">
                                <div class="text-sm text-gray-700">
                                    Affichage de {{ (currentPage - 1) * itemsPerPage + 1 }} à
                                    {{ Math.min(currentPage * itemsPerPage, totalItems) }} sur
                                    {{ totalItems }} résultats
                                </div>
                                <div class="flex items-center space-x-2">
                                    <Button @click="previousPage" :disabled="!hasPrevPage" variant="outline" size="sm">
                                        <ChevronLeftIcon class="h-4 w-4" />
                                    </Button>
                                    <template v-for="page in paginationPages" :key="page">
                                        <Button
                                            v-if="page !== '...'"
                                            @click="goToPage(page)"
                                            :variant="page === currentPage ? 'primary' : 'outline'"
                                            size="sm"
                                            class="min-w-[40px]"
                                        >
                                            {{ page }}
                                        </Button>
                                        <span v-else class="px-2 text-gray-500">...</span>
                                    </template>
                                    <Button @click="nextPage" :disabled="!hasNextPage" variant="outline" size="sm">
                                        <ChevronRightIcon class="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- No Articles State -->
                    <div v-else class="text-center py-8">
                        <CircleStackIcon class="mx-auto h-12 w-12 text-gray-400" />
                        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun article trouvé</h3>
                        <p class="mt-1 text-sm text-gray-500">
                            {{
                                articleFilter
                                    ? "Aucun article ne correspond à votre recherche."
                                    : "Aucun article disponible."
                            }}
                        </p>
                    </div>

                    <!-- Action Buttons -->
                    <div
                        v-if="paginatedArticles.length > 0"
                        class="flex flex-col sm:flex-row gap-4 justify-end mt-6 pt-6 border-t border-gray-200"
                    >
                        <Button
                            v-if="hasChanges"
                            @click="resetChangesWithNotification"
                            variant="outline"
                            :disabled="isSaving"
                        >
                            Annuler les modifications
                        </Button>
                        <Button
                            @click="saveStockWithValidation"
                            :disabled="isSaving || !hasChanges"
                            :loading="isSaving"
                            class="w-full sm:w-auto"
                        >
                            {{ isSaving ? "Sauvegarde..." : "Sauvegarder les stocks" }}
                        </Button>
                    </div>
                </div>

                <!-- Selection Required Message -->
                <div v-else class="text-center py-12">
                    <CircleStackIcon class="mx-auto h-12 w-12 text-gray-400" />
                    <h3 class="mt-2 text-lg font-medium text-gray-900">Sélection requise</h3>
                    <p class="mt-1 text-sm text-gray-500">
                        Veuillez sélectionner une semaine pour commencer la saisie des stocks.
                    </p>
                </div>
            </div>
            <!-- End of Main Stock Management Card -->
        </div>
        <!-- End of hasAccess check -->

        <!-- Add Article Panel -->
        <SlidePanel
            :open="showAddArticlePanel"
            @close="
                () => {
                    closeAddArticlePanel();
                    resetAddArticleForm();
                }
            "
            title="Ajouter un article en stock"
            size="lg"
        >
            <div class="space-y-6">
                <!-- Category Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2"> Catégorie </label>
                    <Select
                        v-model="selectedCategory"
                        :options="[
                            { value: '', label: `Toutes les catégories (${allAvailableArticles.length})` },
                            ...categoriesWithCount,
                        ]"
                        placeholder="Choisir une catégorie"
                        class="w-full"
                        :disabled="isLoadingAllArticles || allAvailableArticles.length === 0"
                    />
                </div>

                <!-- Search Filter -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2"> Recherche </label>
                    <div class="relative">
                        <MagnifyingGlassIcon
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                        />
                        <input
                            v-model="articleNameFilter"
                            type="text"
                            placeholder="Filtrer par nom ou code d'article..."
                            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <!-- Article Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Article <span class="text-red-500">*</span>
                    </label>
                    <Select
                        :model-value="selectedArticleToAdd?._id || ''"
                        @update:model-value="handleArticleSelection"
                        :options="[{ value: '', label: 'Sélectionner un article' }, ...filteredArticles]"
                        placeholder="Choisir l'article à ajouter"
                        class="w-full"
                        :disabled="isLoadingAllArticles || filteredArticles.length === 0"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                        {{
                            isLoadingAllArticles
                                ? "Chargement..."
                                : `${filteredArticles.length} article(s) disponible(s)`
                        }}
                    </p>
                </div>

                <!-- Selected Article Preview -->
                <div v-if="selectedArticleToAdd" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 class="font-medium text-blue-900">Article sélectionné :</h4>
                    <p class="text-sm text-blue-800 mt-1">{{ selectedArticleToAdd.designation }}</p>
                    <p class="text-sm text-blue-600">{{ selectedArticleToAdd.codeArticle }}</p>
                    <span class="inline-block px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full mt-2">
                        {{ selectedArticleToAdd.categorie }}
                    </span>
                </div>

                <!-- Loading State -->
                <div v-if="isLoadingAllArticles" class="flex justify-center py-8">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span class="ml-2 text-sm text-gray-600">Chargement des articles...</span>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end space-x-3 pt-6 border-t">
                    <Button
                        @click="
                            () => {
                                closeAddArticlePanel();
                                resetAddArticleForm();
                            }
                        "
                        variant="outline"
                    >
                        Annuler
                    </Button>
                    <Button @click="addArticleToStock" :disabled="!selectedArticleToAdd" variant="primary">
                        Ajouter dans le suivi du stock
                    </Button>
                </div>
            </div>
        </SlidePanel>

        <!-- Week Change Confirmation Modal -->
        <ConfirmModal
            :open="showWeekChangeConfirmModal"
            title="Modifications non sauvegardées"
            message="Vous avez des modifications non sauvegardées. Si vous changez de semaine maintenant, ces modifications seront perdues. Êtes-vous sûr de vouloir continuer ?"
            confirm-text="Changer de semaine"
            cancel-text="Rester sur cette semaine"
            @confirm="handleConfirmedWeekChange"
            @cancel="cancelWeekChange"
        />
    </div>
</template>
