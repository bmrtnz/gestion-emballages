<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useArticleList } from "../composables/articles/useArticleList";
import {
    PencilSquareIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronDoubleDownIcon,
    ChevronDoubleUpIcon,
    PauseIcon,
    PlayIcon,
    CameraIcon,
} from "@heroicons/vue/24/outline";
import Button from "./ui/Button.vue";
import Select from "./ui/Select.vue";
import VirtualList from "./ui/VirtualList.vue";

const authStore = useAuthStore();

// Use the main article list composable with strategy pattern and performance optimizations
const {
    // Data
    tableDataSource,
    supplierName,
    isLoading,

    // Filters
    searchQuery,
    categoryFilter,
    supplierFilter,
    statusFilter,
    showFilters,
    availableFilters,
    activeFiltersCount,
    statusOptions,
    categoryOptions,
    supplierOptions,

    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    paginationPages,

    // Tree state
    shouldShowSuppliers,
    shouldShowTreeControls,
    shouldShowExpandButton,
    getChevronClass,
    isTreeExpanded,
    toggleExpanded,

    // Methods
    handlePageChange,
    handleClearFilters,
    toggleTreeState,
    isFilterAvailable,

    // Strategy-based methods
    getDynamicColumnTitle,
    getActionConfig,

    // UI behavior from strategy
    useTreeView,
    allowRowActions,
    permissions,

    // Helper functions
    formatConditionnement,
    getConditionnementPrice,
    formatCurrency,
    formatDate,

    // Expose for parent component
    fetchArticles,
} = useArticleList();

// Virtual scrolling configuration
const virtualListRef = ref(null);
const containerHeight = ref(500);
const itemHeight = ref(useTreeView.value ? 80 : 120); // Dynamic based on view type

// Check if user can perform edit actions (from strategy)
const canEdit = computed(() => {
    return permissions.value.canEdit || false;
});

// Development mode check for template
const isDev = import.meta.env.DEV;

// Note: Using existing viewSupplierImage function for camera icon functionality

// Calculate dynamic item height based on content
const calculateItemHeight = (item, index) => {
    if (!useTreeView.value) {
        // Simple table view for Fournisseur - fixed height
        return 60;
    }

    // Tree view - variable height based on expanded state and children
    let height = 50; // Base height for parent row

    if (shouldShowSuppliers(item.key) && item.children?.length > 0) {
        height += item.children.length * 45; // Add height for each child
    }

    return height;
};

// Flattened data for virtual scrolling
const virtualData = computed(() => {
    if (!useTreeView.value) {
        // For simple table view, use data as-is
        return tableDataSource.value.map((item) => ({
            ...item,
            type: "simple",
            height: 60,
        }));
    }

    // For tree view, flatten the tree structure
    const flattened = [];

    tableDataSource.value.forEach((article) => {
        // Add parent article
        flattened.push({
            ...article,
            type: "parent",
            height: 50,
            level: 0,
        });

        // Add children if expanded
        if (shouldShowSuppliers(article.key) && article.children?.length > 0) {
            article.children.forEach((supplier) => {
                flattened.push({
                    ...supplier,
                    type: "child",
                    height: 45,
                    level: 1,
                    parentId: article._id,
                    parentData: article,
                });
            });
        }
    });

    return flattened;
});

// Watch for view type changes and update item height
watch(useTreeView, (newValue) => {
    itemHeight.value = newValue ? 80 : 120;
    // Reset virtual list scroll position
    if (virtualListRef.value) {
        virtualListRef.value.scrollToTop("auto");
    }
});

// Event emissions
const emit = defineEmits([
    "edit-article",
    "deactivate-article",
    "reactivate-article",
    "edit-supplier",
    "delete-supplier",
    "view-supplier-image",
]);

const editArticle = (article) => {
    emit("edit-article", article);
};

const deactivateArticle = (articleId) => {
    emit("deactivate-article", articleId);
};

const reactivateArticle = (articleId) => {
    emit("reactivate-article", articleId);
};

const editSupplier = (articleId, supplierId) => {
    emit("edit-supplier", articleId, supplierId);
};

const deleteSupplier = (articleId, supplierId) => {
    emit("delete-supplier", articleId, supplierId);
};

const viewSupplierImage = (supplier, parentArticle) => {
    emit("view-supplier-image", supplier, parentArticle);
};

// Handle virtual list scroll for infinite loading potential
const handleVirtualScroll = ({ scrollTop, startIndex, endIndex, visibleItems }) => {
    // Could implement infinite loading here if needed
    // For now, we're using pagination
};

// Update container height based on screen size
const updateContainerHeight = () => {
    if (typeof window !== "undefined") {
        const vh = window.innerHeight;
        containerHeight.value = Math.min(vh * 0.6, 600); // 60% of viewport height, max 600px
    }
};

onMounted(() => {
    updateContainerHeight();
    window.addEventListener("resize", updateContainerHeight);
});

// Expose fetchArticles method to parent
defineExpose({
    fetchArticles,
});
</script>

<template>
    <div class="space-y-6">
        <!-- Search and Filters -->
        <div class="space-y-4">
            <!-- Search Bar and Filter Toggle -->
            <div class="flex items-center space-x-4">
                <!-- Tree toggle button (only for tree view roles) -->
                <button
                    v-if="shouldShowTreeControls"
                    @click="toggleTreeState"
                    class="flex-shrink-0 inline-flex items-center justify-center p-2 border border-gray-300 shadow-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    :title="isTreeExpanded ? 'Tout replier' : 'Tout déplier'"
                >
                    <ChevronDoubleUpIcon v-if="isTreeExpanded" class="h-4 w-4" />
                    <ChevronDoubleDownIcon v-else class="h-4 w-4" />
                </button>

                <button
                    @click="showFilters = !showFilters"
                    class="flex-shrink-0 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <FunnelIcon class="h-4 w-4 mr-2" />
                    Filtres
                    <span
                        v-if="activeFiltersCount > 0"
                        class="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-600 bg-primary-100 rounded-full"
                    >
                        {{ activeFiltersCount }}
                    </span>
                    <ChevronDownIcon
                        class="ml-2 h-4 w-4 transition-transform duration-200"
                        :class="{ 'rotate-180': showFilters }"
                    />
                </button>

                <div class="flex-1 relative">
                    <input
                        v-model="searchQuery"
                        type="text"
                        class="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Rechercher un article..."
                    />
                    <MagnifyingGlassIcon
                        class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    />
                </div>
            </div>

            <!-- Filters -->
            <div v-if="showFilters" class="p-4 bg-gray-50 rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div v-if="isFilterAvailable('status')">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                        <Select v-model="statusFilter" :options="statusOptions" placeholder="Sélectionner un statut" />
                    </div>

                    <div v-if="isFilterAvailable('category')">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                        <Select
                            v-model="categoryFilter"
                            :options="categoryOptions"
                            placeholder="Sélectionner une catégorie"
                        />
                    </div>

                    <div v-if="isFilterAvailable('supplier')">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Fournisseur</label>
                        <Select
                            v-model="supplierFilter"
                            :options="supplierOptions"
                            placeholder="Sélectionner un fournisseur"
                        />
                    </div>

                    <!-- Empty column for future filters -->
                    <div></div>
                </div>

                <div class="flex justify-end">
                    <Button variant="secondary" size="sm" @click="handleClearFilters">
                        Réinitialiser les filtres
                    </Button>
                </div>
            </div>
        </div>


        <!-- Desktop table view -->
        <div class="hidden md:block flow-root">
            <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div class="relative">
                        <table class="min-w-full table-fixed divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" class="min-w-[12rem] py-2.5 pr-3 text-left text-sm font-semibold text-gray-900">
                                        <template v-if="!useTreeView">Article</template>
                                        <template v-else>Article / Fournisseur</template>
                                    </th>
                                    <th scope="col" class="px-3 py-2.5 text-left text-sm font-semibold text-gray-900">
                                        <template v-if="!useTreeView">{{ getDynamicColumnTitle("Référence", supplierName) }}</template>
                                        <template v-else>Code / Référence</template>
                                    </th>
                                    <th scope="col" class="px-3 py-2.5 text-left text-sm font-semibold text-gray-900">
                                        <template v-if="!useTreeView">Conditionnement</template>
                                        <template v-else>Catégorie / Conditionnement</template>
                                    </th>
                                    <th scope="col" class="px-3 py-2.5 text-left text-sm font-semibold text-gray-900">Prix Conditionnement</th>
                                    <th scope="col" class="px-3 py-2.5 text-left text-sm font-semibold text-gray-900">
                                        <template v-if="!useTreeView">Prix unitaire</template>
                                        <template v-else>Statut / Prix Unitaire</template>
                                    </th>
                                    <th v-if="allowRowActions" scope="col" class="relative py-2.5 pl-3 pr-4 sm:pr-3">
                                        <span class="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white">
                                <!-- Simple view (Fournisseur) -->
                                <template v-if="!useTreeView">
                                    <tr v-for="item in tableDataSource" :key="item._id" class="border-b border-gray-100 hover:bg-gray-50">
                                        <td class="whitespace-nowrap py-2 pr-3 text-sm">
                                            <div class="text-gray-500">{{ item.codeArticle }}</div>
                                            <div class="flex items-center justify-between">
                                                <div class="text-gray-900 font-medium">{{ item.designation }}</div>
                                                <div v-if="item.imageUrl && permissions.canViewSupplierDocuments" class="relative group">
                                                    <CameraIcon
                                                        class="h-4 w-4 cursor-pointer hover:scale-110 transition-transform duration-200 text-primary-600"
                                                        @click="viewSupplierImage(item, item.parentData)"
                                                    />
                                                    <!-- Custom tooltip -->
                                                    <div class="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                                        <div class="text-center">
                                                            <div class="font-medium">Visuel produit</div>
                                                            <div class="text-gray-300 text-xs mt-1">Cliquez pour voir</div>
                                                        </div>
                                                        <!-- Tooltip arrow -->
                                                        <div class="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="whitespace-nowrap px-3 py-2 text-sm">
                                            <div class="text-gray-500">{{ item.categorie || "Non définie" }}</div>
                                            <div class="text-gray-900">{{ item.referenceFournisseur || "-" }}</div>
                                        </td>
                                        <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                                            {{ formatConditionnement(item) || "-" }}
                                        </td>
                                        <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                                            <span v-if="getConditionnementPrice(item)">{{ formatCurrency(getConditionnementPrice(item)) }}</span>
                                            <span v-else class="text-gray-400">N/A</span>
                                        </td>
                                        <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                                            <div>
                                                <span v-if="item.prixUnitaire">{{ formatCurrency(item.prixUnitaire) }}</span>
                                                <span v-else class="text-gray-400">N/A</span>
                                            </div>
                                            <div v-if="item.delaiIndicatifApprovisionnement" class="text-xs text-gray-400 mt-1">
                                                Délai: {{ item.delaiIndicatifApprovisionnement }} jour{{ item.delaiIndicatifApprovisionnement > 1 ? 's' : '' }}
                                            </div>
                                        </td>
                                        <td v-if="allowRowActions" class="whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                            <div v-if="canEdit" class="flex items-center justify-end gap-x-2">
                                                <!-- Edit actions (only for managers) -->
                                                <button
                                                    v-if="canEdit"
                                                    class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Modifier"
                                                    @click="editArticle(item)"
                                                >
                                                    <PencilSquareIcon class="h-5 w-5" />
                                                </button>
                                                <button
                                                    v-if="canEdit && item.isActive"
                                                    @click="deactivateArticle(item._id)"
                                                    class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                                                    title="Désactiver"
                                                >
                                                    <PauseIcon class="h-5 w-5" />
                                                </button>
                                                <button
                                                    v-if="canEdit && !item.isActive"
                                                    @click="reactivateArticle(item._id)"
                                                    class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                                                    title="Réactiver"
                                                >
                                                    <PlayIcon class="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </template>

                                <!-- Tree view -->
                                <template v-else>
                                    <template v-for="parentItem in tableDataSource" :key="parentItem.key">
                                        <!-- Parent row (Article) -->
                                        <tr class="border-b border-gray-200 bg-gray-50">
                                            <td class="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-900">
                                                <div class="flex items-center">
                                                    <button
                                                        v-if="shouldShowExpandButton(parentItem)"
                                                        @click="toggleExpanded(parentItem.key)"
                                                        class="flex items-center p-1 hover:bg-gray-100 rounded transition-colors mr-2"
                                                        :title="shouldShowSuppliers(parentItem.key) ? 'Réduire' : 'Étendre'"
                                                    >
                                                        <ChevronRightIcon :class="getChevronClass(parentItem.key)" />
                                                    </button>
                                                    <div
                                                        v-if="parentItem.children?.length > 0 && !shouldShowExpandButton(parentItem)"
                                                        class="flex items-center p-1 mr-2"
                                                    >
                                                        <ChevronRightIcon class="h-4 w-4 text-gray-500 transform rotate-90" />
                                                    </div>
                                                    <span class="font-semibold text-gray-900">{{ parentItem.designation }}</span>
                                                </div>
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{{ parentItem.codeArticle }}</td>
                                            <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{{ parentItem.categorie || "Non définie" }}</td>
                                            <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                                                <div v-if="parentItem.fournisseurs?.length" class="flex items-center">
                                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                                        {{ parentItem.fournisseurs.length }}
                                                    </span>
                                                    <span class="text-sm text-gray-500">fournisseur{{ parentItem.fournisseurs.length > 1 ? "s" : "" }}</span>
                                                </div>
                                                <span v-else class="text-gray-400">-</span>
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-2 text-sm">
                                                <span
                                                    v-if="parentItem.isActive"
                                                    class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                                                >
                                                    Actif
                                                </span>
                                                <span
                                                    v-else
                                                    class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20"
                                                >
                                                    Inactif
                                                </span>
                                            </td>
                                            <td v-if="allowRowActions" class="whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                                <div v-if="canEdit" class="flex items-center justify-end gap-x-2">
                                                    <button
                                                        class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                                                        title="Modifier"
                                                        @click="editArticle(parentItem)"
                                                    >
                                                        <PencilSquareIcon class="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        v-if="parentItem.isActive"
                                                        @click="deactivateArticle(parentItem._id)"
                                                        class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                                                        title="Désactiver"
                                                    >
                                                        <PauseIcon class="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        v-else
                                                        @click="reactivateArticle(parentItem._id)"
                                                        class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                                                        title="Réactiver"
                                                    >
                                                        <PlayIcon class="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Child rows (Suppliers) -->
                                        <template v-if="shouldShowSuppliers(parentItem.key)">
                                            <tr v-for="childItem in parentItem.children" :key="childItem._id" class="bg-white hover:bg-gray-25 border-b border-gray-100">
                                                <td class="whitespace-nowrap py-2 pr-3 text-sm text-gray-700">
                                                    <div class="flex items-center justify-between pl-8">
                                                        <div class="flex items-center">
                                                            <div class="w-4 h-4 mr-2 flex items-center justify-center">
                                                                <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
                                                            </div>
                                                            <span>{{ childItem.fournisseurId?.nom || "Fournisseur inconnu" }}</span>
                                                        </div>
                                                        <div v-if="childItem.imageUrl && permissions.canViewSupplierDocuments" class="relative group">
                                                            <CameraIcon
                                                                class="h-4 w-4 cursor-pointer hover:scale-110 transition-transform duration-200 text-primary-600"
                                                                @click="viewSupplierImage(childItem, parentItem)"
                                                            />
                                                            <!-- Custom tooltip -->
                                                            <div class="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                                                <div class="text-center">
                                                                    <div class="font-medium">Visuel produit</div>
                                                                    <div class="text-gray-300 text-xs mt-1">Cliquez pour voir</div>
                                                                </div>
                                                                <!-- Tooltip arrow -->
                                                                <div class="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{{ childItem.referenceFournisseur || "-" }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{{ formatConditionnement(childItem) || "-" }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                                                    <span v-if="getConditionnementPrice(childItem)">{{ formatCurrency(getConditionnementPrice(childItem)) }}</span>
                                                    <span v-else class="text-gray-400">N/A</span>
                                                </td>
                                                <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                                                    <div>
                                                        <span v-if="childItem.prixUnitaire">{{ formatCurrency(childItem.prixUnitaire) }}</span>
                                                        <span v-else class="text-gray-400">N/A</span>
                                                    </div>
                                                    <div v-if="childItem.delaiIndicatifApprovisionnement" class="text-xs text-gray-400 mt-1">
                                                        Délai: {{ childItem.delaiIndicatifApprovisionnement }} jour{{ childItem.delaiIndicatifApprovisionnement > 1 ? 's' : '' }}
                                                    </div>
                                                </td>
                                                <td v-if="allowRowActions" class="whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                                    <div v-if="canEdit" class="flex items-center justify-end gap-x-2">
                                                        <button
                                                            v-if="canEdit"
                                                            @click="editSupplier(parentItem._id, childItem._id)"
                                                            class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                                                            title="Modifier fournisseur"
                                                        >
                                                            <PencilSquareIcon class="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            v-if="canEdit"
                                                            @click="deleteSupplier(parentItem._id, childItem._id)"
                                                            class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                                            title="Supprimer fournisseur"
                                                        >
                                                            <TrashIcon class="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </template>
                                    </template>
                                </template>
                            </tbody>
                        </table>
                        <div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile card view -->
        <div class="block md:hidden">
            <VirtualList
                :items="virtualData"
                :item-height="useTreeView ? 120 : 100"
                :container-height="containerHeight"
                :overscan="2"
                key-field="_id"
                @scroll="handleVirtualScroll"
            >
                <template #default="{ item, index }">
                    <!-- Simple card for Fournisseur users -->
                    <div v-if="item.type === 'simple'" class="bg-white p-4 rounded-lg border border-gray-200 mb-3">
                        <div class="space-y-3">
                            <div>
                                <p class="text-sm text-gray-500">{{ item.codeArticle }}</p>
                                <div class="flex items-center justify-between">
                                    <h3 class="text-sm font-semibold text-gray-900">{{ item.designation }}</h3>
                                    <div v-if="item.imageUrl && permissions.canViewSupplierDocuments" class="relative group">
                                        <CameraIcon
                                            class="h-4 w-4 cursor-pointer hover:scale-110 transition-transform duration-200 text-primary-600"
                                            @click="viewSupplierImage(item, item.parentData)"
                                        />
                                        <!-- Custom tooltip -->
                                        <div class="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                            <div class="text-center">
                                                <div class="font-medium">Visuel produit</div>
                                                <div class="text-gray-300 text-xs mt-1">Cliquez pour voir</div>
                                            </div>
                                            <!-- Tooltip arrow -->
                                            <div class="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">{{ item.categorie || "Non définie" }}</p>
                            </div>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p class="text-gray-500">{{ getDynamicColumnTitle("Référence", supplierName) }}</p>
                                    <p class="text-gray-900">{{ item.referenceFournisseur || "-" }}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Conditionnement</p>
                                    <p class="text-gray-900">{{ formatConditionnement(item) || "-" }}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Prix conditionnement</p>
                                    <p class="text-gray-900">
                                        <span v-if="getConditionnementPrice(item)">{{
                                            formatCurrency(getConditionnementPrice(item))
                                        }}</span>
                                        <span v-else class="text-gray-400">N/A</span>
                                    </p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Prix unitaire</p>
                                    <p class="text-gray-900">
                                        <span v-if="item.prixUnitaire">{{ formatCurrency(item.prixUnitaire) }}</span>
                                        <span v-else class="text-gray-400">N/A</span>
                                    </p>
                                    <p v-if="item.delaiIndicatifApprovisionnement" class="text-xs text-gray-400 mt-1">
                                        Délai: {{ item.delaiIndicatifApprovisionnement }} jour{{ item.delaiIndicatifApprovisionnement > 1 ? 's' : '' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tree cards for other users -->
                    <div v-else-if="item.type === 'parent'" class="bg-white p-4 rounded-lg border border-gray-200 mb-3">
                        <div class="flex items-start justify-between">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center">
                                        <button
                                            v-if="shouldShowExpandButton(item)"
                                            @click="toggleExpanded(item.key)"
                                            class="flex items-center p-1 hover:bg-gray-100 rounded transition-colors mr-2"
                                            :title="shouldShowSuppliers(item.key) ? 'Réduire' : 'Étendre'"
                                        >
                                            <ChevronRightIcon :class="getChevronClass(item.key)" />
                                        </button>
                                        <h3 class="text-sm font-semibold text-gray-900 truncate">
                                            {{ item.designation }}
                                        </h3>
                                    </div>
                                    <span
                                        v-if="item.isActive"
                                        class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                                    >
                                        Actif
                                    </span>
                                    <span
                                        v-else
                                        class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20"
                                    >
                                        Inactif
                                    </span>
                                </div>
                                <p class="text-sm text-gray-500 truncate">{{ item.codeArticle }}</p>
                                <p class="text-xs text-gray-400 mt-1">{{ item.categorie || "Non définie" }}</p>
                                <div class="mt-2 flex items-center space-x-4">
                                    <div v-if="item.fournisseurs?.length" class="flex items-center">
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                                        >
                                            {{ item.fournisseurs.length }}
                                        </span>
                                        <span class="text-sm text-gray-500"
                                            >fournisseur{{ item.fournisseurs.length > 1 ? "s" : "" }}</span
                                        >
                                    </div>
                                    <span v-else class="text-xs text-gray-400">Aucun fournisseur</span>
                                </div>
                            </div>
                        </div>

                        <div v-if="allowRowActions && canEdit" class="mt-3 flex justify-end gap-x-2">
                            <button
                                @click="editArticle(item)"
                                class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Modifier"
                            >
                                <PencilSquareIcon class="h-5 w-5" />
                            </button>
                            <button
                                v-if="item.isActive"
                                @click="deactivateArticle(item._id)"
                                class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Désactiver"
                            >
                                <PauseIcon class="h-5 w-5" />
                            </button>
                            <button
                                v-else
                                @click="reactivateArticle(item._id)"
                                class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Réactiver"
                            >
                                <PlayIcon class="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <!-- Child supplier cards -->
                    <div
                        v-else-if="item.type === 'child'"
                        class="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-2 ml-4"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="flex items-center">
                                    <h4 class="text-sm font-medium text-gray-700 mr-2">
                                        {{ item.fournisseurId?.nom || "Fournisseur inconnu" }}
                                    </h4>
                                    <div v-if="item.imageUrl && permissions.canViewSupplierDocuments" class="relative group">
                                        <CameraIcon
                                            class="h-4 w-4 cursor-pointer hover:scale-110 transition-transform duration-200 text-primary-600"
                                            @click="viewSupplierImage(item, item.parentData)"
                                        />
                                        <!-- Custom tooltip -->
                                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                            <div class="text-center">
                                                <div class="font-medium">Visuel produit</div>
                                                <div class="text-gray-300 text-xs mt-1">Cliquez pour voir</div>
                                            </div>
                                            <!-- Tooltip arrow -->
                                            <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500">
                                    {{ item.referenceFournisseur || "Pas de référence" }}
                                </p>
                                <div class="text-xs text-gray-400 mt-1">
                                    <span v-if="getConditionnementPrice(item)">{{
                                        formatCurrency(getConditionnementPrice(item))
                                    }}</span>
                                    <span v-if="formatConditionnement(item)"> ({{ formatConditionnement(item) }})</span>
                                    <span v-if="item.delaiIndicatifApprovisionnement" class="block mt-1">
                                        Délai: {{ item.delaiIndicatifApprovisionnement }} jour{{ item.delaiIndicatifApprovisionnement > 1 ? 's' : '' }}
                                    </span>
                                </div>
                            </div>
                            <div
                                v-if="allowRowActions && canEdit"
                                class="flex gap-x-1"
                            >
                                <button
                                    v-if="canEdit"
                                    @click="editSupplier(item.parentId, item._id)"
                                    class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                                    title="Modifier fournisseur"
                                >
                                    <PencilSquareIcon class="h-5 w-5" />
                                </button>
                                <button
                                    v-if="canEdit"
                                    @click="deleteSupplier(item.parentId, item._id)"
                                    class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer fournisseur"
                                >
                                    <TrashIcon class="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </template>
            </VirtualList>

            <!-- Loading state for mobile -->
            <div v-if="isLoading" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200 sm:px-6">
            <div class="flex items-center justify-between w-full">
                <!-- Mobile pagination -->
                <div class="flex justify-between flex-1 sm:hidden">
                    <button
                        @click="handlePageChange(currentPage - 1)"
                        :disabled="!hasPrevPage"
                        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Précédent
                    </button>
                    <button
                        @click="handlePageChange(currentPage + 1)"
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
                            @change="handlePageSizeChange($event.target.value)"
                            :value="itemsPerPage"
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
                                @click="handlePageChange(1)"
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
                                @click="handlePageChange(currentPage - 1)"
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
                                @click="handlePageChange(page)"
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
                                @click="handlePageChange(currentPage + 1)"
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
                                @click="handlePageChange(totalPages)"
                                :disabled="currentPage === totalPages"
                                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Dernière page"
                            >
                                <span class="sr-only">Dernière page</span>
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M4.21 5.23a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L8.168 10 4.23 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L14.168 10 10.23 6.29a.75.75 0 01-.02-1.06z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom scrollbar for better aesthetics */
:deep(.virtual-list-container::-webkit-scrollbar) {
    width: 6px;
}

:deep(.virtual-list-container::-webkit-scrollbar-track) {
    background: #f1f5f9;
}

:deep(.virtual-list-container::-webkit-scrollbar-thumb) {
    background: #cbd5e1;
    border-radius: 3px;
}

:deep(.virtual-list-container::-webkit-scrollbar-thumb:hover) {
    background: #94a3b8;
}
</style>
