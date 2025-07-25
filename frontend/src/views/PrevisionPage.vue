<template>
  <div>
    <!-- Header Section -->
    <div class="sm:flex sm:items-center mb-8">
      <div class="sm:flex-auto">
        <h1 class="text-3xl font-bold text-gray-900">Prévisions</h1>
        <p class="mt-1 text-sm text-gray-500">Gestion des prévisions de consommation par campagne.</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <Button 
          v-if="showCreateButton"
          variant="primary" 
          size="md"
          @click="openCreatePanel"
        >
          Ajouter une prévision
        </Button>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="bg-white rounded-2xl shadow-soft p-6 space-y-6">
      <!-- Search and Filters -->
      <div class="space-y-4">
        <!-- Control Bar -->
        <div class="flex items-center space-x-4">
          <!-- Tree Toggle -->
          <button 
            v-if="allowTreeToggle"
            @click="handlePrevisionTreeToggle"
            class="flex-shrink-0 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            title="Tout développer/réduire"
          >
            <ChevronDoubleUpIcon v-if="isTreeExpanded" class="h-4 w-4" />
            <ChevronDoubleDownIcon v-else class="h-4 w-4" />
          </button>
          
          <!-- Filters Toggle -->
          <button 
            @click="toggleFilters"
            class="flex-shrink-0 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FunnelIcon class="h-4 w-4 mr-2" />
            Filtres
            <span v-if="activeFiltersCount > 0" class="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-600 bg-primary-100 rounded-full">
              {{ activeFiltersCount }}
            </span>
            <ChevronDownIcon 
              class="ml-2 h-4 w-4 transition-transform duration-200" 
              :class="{ 'rotate-180': showFilters }"
            />
          </button>
          
          <!-- Search Input -->
          <div v-if="showSearch" class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Rechercher par campagne, fournisseur, article ou site..."
            />
          </div>
        </div>
        
        <!-- Filters Panel -->
        <div v-if="showFilters" class="p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <!-- Campagne Filter -->
            <div v-if="isFilterAvailable('campagne')">
              <label class="block text-sm font-medium text-gray-700 mb-2">Campagne</label>
              <select 
                v-model="filters.campagne"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Toutes les campagnes</option>
                <option 
                  v-for="campaign in availableCampaigns" 
                  :key="campaign.value"
                  :value="campaign.value"
                >
                  {{ campaign.label }}
                </option>
              </select>
            </div>

            <!-- Fournisseur Filter -->
            <div v-if="isFilterAvailable('fournisseurId')">
              <label class="block text-sm font-medium text-gray-700 mb-2">Fournisseur</label>
              <select 
                v-model="filters.fournisseurId"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Tous les fournisseurs</option>
                <option v-for="fournisseur in fournisseurs" 
                        :key="fournisseur._id" 
                        :value="fournisseur._id">
                  {{ fournisseur.nom }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              @click="handleClearFilters"
            >
              Réinitialiser les filtres
            </Button>
          </div>
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

      <!-- Desktop Table View -->
      <div v-else-if="previsions.length > 0" class="hidden md:block">
        <table class="min-w-full table-fixed divide-y divide-gray-300">
          <thead>
            <tr>
              <th 
                v-for="column in tableColumns" 
                :key="column.key"
                scope="col"
                :class="[
                  'py-3.5 text-left text-sm font-semibold text-gray-900',
                  column.align === 'right' ? 'text-right pl-3 pr-4 sm:pr-3' : 'px-3',
                  column.key === tableColumns[0].key ? 'pr-3' : ''
                ]"
                :style="{ width: column.width }"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-for="prevision in previsions" :key="prevision._id">
              <!-- Main Prevision Row -->
              <tr class="bg-gray-50 hover:bg-gray-100">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center">
                    <div class="mr-2 w-6 h-6 flex items-center justify-center">
                      <button 
                        v-if="prevision.articlesPrevisions?.length > 0"
                        @click="toggleExpanded(prevision._id)"
                        class="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                        :title="isExpanded(prevision._id) ? 'Réduire' : 'Développer'"
                      >
                        <ChevronRightIcon 
                          :class="isExpanded(prevision._id) ? 'rotate-90' : ''"
                          class="h-4 w-4 text-gray-500 transition-transform duration-200" 
                        />
                      </button>
                    </div>
                    {{ prevision.campagne }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center">
                    <button 
                      v-if="prevision.fournisseurId?._id"
                      @click="viewSupplierPrevisions(prevision.fournisseurId._id, prevision.campagne)"
                      class="mr-2 p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                      title="Voir toutes les prévisions du fournisseur"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                    <span>{{ prevision.fournisseurId?.nom || 'N/A' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center">
                    <button 
                      @click="viewPrevision(prevision._id)"
                      class="mr-2 p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                      title="Voir les prévisions du site"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                    <span>{{ getSiteName(prevision) }}</span>
                  </div>
                </td>
                <td v-if="hasActionsColumn" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-x-2">
                    <button 
                      v-if="canEdit"
                      @click="handleAddArticlePrevision(prevision._id)"
                      class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                      title="Ajouter un article"
                    >
                      <PlusIcon class="h-5 w-5" />
                    </button>
                    <button 
                      v-if="canDelete"
                      @click="confirmDeletePrevision(prevision)"
                      class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Article Prevision Sub-rows -->
              <template v-if="isExpanded(prevision._id) && prevision.articlesPrevisions?.length > 0">
                <tr 
                  v-for="articlePrevision in prevision.articlesPrevisions"
                  :key="articlePrevision._id"
                  class="bg-white hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <!-- Empty for sub-row -->
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="flex items-center">
                      <div class="ml-8">
                        <div class="font-medium">{{ getArticleInfo(articlePrevision).designation }}</div>
                        <div class="text-gray-500 text-xs">{{ getArticleInfo(articlePrevision).codeArticle }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatNumber(getTotalQuantityForArticle(articlePrevision)) }} unités
                    <div v-if="getTotalQuantityForArticle(articlePrevision) > 0" class="text-xs text-gray-500">
                      équivalent {{ getConditionnementConversion(articlePrevision, prevision.fournisseurId._id) }}
                    </div>
                  </td>
                  <td v-if="hasActionsColumn" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end gap-x-2">
                      <button 
                        v-if="canEditArticles"
                        @click="editArticlePrevision(prevision._id, articlePrevision._id)"
                        class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                        title="Éditer"
                      >
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button 
                        v-if="canDeleteArticles"
                        @click="confirmDeleteArticle(prevision._id, articlePrevision)"
                        class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon class="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div v-else-if="previsions.length > 0" class="block md:hidden space-y-4">
        <div 
          v-for="prevision in previsions" 
          :key="prevision._id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
        >
          <!-- Mobile prevision card content -->
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ prevision.campagne }}</h3>
              <p class="text-sm text-gray-600">{{ prevision.fournisseurId?.nom }}</p>
              <p class="text-sm text-gray-500">{{ getSiteName(prevision) }}</p>
            </div>
          </div>
          
          <!-- Mobile actions -->
          <div class="flex justify-end space-x-2 mt-4">
            <Button 
              v-if="hasActionsColumn && canEdit"
              variant="outline" 
              size="sm"
              @click="handleAddArticlePrevision(prevision._id)"
            >
              <PlusIcon class="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              @click="viewPrevision(prevision._id)"
            >
              Consulter
            </Button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune prévision</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery || hasActiveFilters ? 'Aucune prévision ne correspond à vos critères.' : 'Commencez par créer votre première prévision.' }}
        </p>
      </div>

      <!-- Pagination -->
      <div v-if="showPagination && totalPages > 1" class="mt-6">
        <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <!-- Results Info -->
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Affichage de 
                <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span>
                à 
                <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
                sur 
                <span class="font-medium">{{ totalItems }}</span>
                résultats
              </p>
            </div>
            
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-700">Afficher:</label>
              <select 
                v-model="itemsPerPage"
                @change="handlePageSizeChange(itemsPerPage)"
                class="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option v-for="size in itemsPerPageOptions" :key="size" :value="size">
                  {{ size }}
                </option>
              </select>
              <span class="text-sm text-gray-700">par page</span>
            </div>
            
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button 
                  @click="handlePageChange(currentPage - 1)"
                  :disabled="!hasPrevPage"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon class="h-5 w-5" />
                </button>
                
                <button 
                  v-for="page in getVisiblePages(currentPage, totalPages)" 
                  :key="page"
                  @click="handlePageChange(page)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === currentPage 
                      ? 'z-10 bg-primary-600 border-primary-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                
                <button 
                  @click="handlePageChange(currentPage + 1)"
                  :disabled="!hasNextPage"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Prevision Slide Panel -->
    <SlidePanel 
      :open="isCreatePanelOpen" 
      @close="closeCreatePanel" 
      title="Créer une nouvelle prévision" 
      size="lg"
    >
      <form @submit.prevent="handleCreatePrevision" class="space-y-6">
        <!-- Campagne Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Campagne <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="createForm.campagne"
            required
            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Sélectionner une campagne</option>
            <option 
              v-for="campaign in availableCampaigns" 
              :key="campaign.value"
              :value="campaign.value"
            >
              {{ campaign.label }}
            </option>
          </select>
        </div>

        <!-- Fournisseur Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fournisseur <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="createForm.fournisseurId"
            @change="onFournisseurChange"
            required
            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Sélectionner un fournisseur</option>
            <option 
              v-for="fournisseur in fournisseurs" 
              :key="fournisseur._id" 
              :value="fournisseur._id"
            >
              {{ fournisseur.nom }}
            </option>
          </select>
        </div>

        <!-- Site Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Site <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="createForm.siteId"
            required
            :disabled="!createForm.fournisseurId"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
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

        <!-- Error Message -->
        <div v-if="createError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2" />
            <span class="text-red-800 text-sm">{{ createError }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            size="md" 
            type="button"
            @click="closeCreatePanel"
            :disabled="isCreating"
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            type="submit"
            :loading="isCreating"
            :disabled="!isFormValid"
          >
            {{ isCreating ? 'Création...' : 'Créer la prévision' }}
          </Button>
        </div>
      </form>
    </SlidePanel>

    <!-- Add Article Prevision Slide Panel -->
    <SlidePanel 
      :open="isAddArticlePanelOpen" 
      @close="closeAddArticlePanel" 
      title="Ajouter un article à la prévision" 
      size="lg"
    >
      <!-- Context Card -->
      <div v-if="selectedPrevisionForArticle" class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-2">Contexte de la prévision</h4>
        <div class="text-sm text-blue-800 space-y-1">
          <p><strong>Campagne:</strong> {{ selectedPrevisionForArticle.campagne }}</p>
          <p><strong>Fournisseur:</strong> {{ selectedPrevisionForArticle.fournisseurId?.nom }}</p>
          <p><strong>Site:</strong> {{ getSiteName(selectedPrevisionForArticle) }}</p>
        </div>
      </div>

      <!-- Article Selection Form -->
      <AddArticlePrevisionForm 
        v-if="selectedPrevisionForArticle"
        :prevision="selectedPrevisionForArticle"
        @success="handleArticleAdded"
        @close="closeAddArticlePanel"
      />
    </SlidePanel>

    <!-- Delete Prevision Confirmation Modal -->
    <ConfirmDialog
      :open="showDeletePrevisionModal"
      title="Supprimer la prévision"
      :message="selectedPrevisionToDelete ? `Êtes-vous sûr de vouloir supprimer la prévision ${selectedPrevisionToDelete.campagne} ?` : ''"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      variant="danger"
      @confirm="handleDeletePrevisionConfirm"
      @cancel="handleDeletePrevisionCancel"
    />

    <!-- Delete Article Confirmation Modal -->
    <ConfirmDialog
      :open="showDeleteArticleModal"
      title="Supprimer l'article"
      :message="selectedArticleToDelete ? `Êtes-vous sûr de vouloir supprimer ${getArticleInfo(selectedArticleToDelete.articlePrevision).designation} de cette prévision ?` : ''"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      variant="danger"
      @confirm="handleDeleteArticleConfirm"
      @cancel="handleDeleteArticleCancel"
    />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { usePrevisionList } from '../composables/previsions/usePrevisionList';
import Button from '../components/ui/Button.vue';
import SlidePanel from '../components/ui/SlidePanel.vue';
import ConfirmDialog from '../components/ui/ConfirmDialog.vue';
import AddArticlePrevisionForm from '../components/previsions/AddArticlePrevisionForm.vue';

// Icons
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon
} from '@heroicons/vue/24/outline';

// Use the main composable
const {
  // Data
  previsions,
  fournisseurs,
  isLoading,
  error,
  
  // Filters
  searchQuery,
  showFilters,
  filters,
  activeFiltersCount,
  hasActiveFilters,
  availableCampaigns,
  toggleFilters,
  isFilterAvailable,
  
  // UI
  isCreatePanelOpen,
  isAddArticlePanelOpen,
  selectedPrevisionForArticle,
  createForm,
  isCreating,
  createError,
  isFormValid,
  availableSites,
  openCreatePanel,
  closeCreatePanel,
  closeAddArticlePanel,
  onFournisseurChange,
  formatDate,
  
  // Tree state
  isExpanded,
  toggleExpanded,
  isTreeExpanded,
  handlePrevisionTreeToggle,
  
  // Permissions
  canCreate,
  canEdit,
  canDelete,
  canEditArticles,
  canDeleteArticles,
  showCreateButton,
  showSearch,
  allowTreeToggle,
  showPagination,
  tableColumns,
  
  // Pagination
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPrevPage,
  itemsPerPageOptions,
  
  // Methods
  initializeData,
  handlePageChange,
  handlePageSizeChange,
  handleClearFilters,
  handleCreatePrevision,
  handleAddArticlePrevision,
  handleArticleAdded,
  viewPrevision,
  viewSupplierPrevisions,
  viewArticlePrevision,
  editArticlePrevision,
  confirmDeletePrevision,
  confirmDeleteArticle,
  handleDeletePrevisionConfirm,
  handleDeletePrevisionCancel,
  handleDeleteArticleConfirm,
  handleDeleteArticleCancel,
  showDeletePrevisionModal,
  showDeleteArticleModal,
  selectedPrevisionToDelete,
  selectedArticleToDelete,
  getVisiblePages,
  getSiteName,
  getArticleInfo,
  getTotalUnits,
  getTotalQuantityForArticle,
  getConditionnementConversion,
  formatNumber
} = usePrevisionList();

// Check if actions column should be displayed
const hasActionsColumn = computed(() => {
  return tableColumns.value.some(col => col.key === 'actions');
});

// Initialize data on mount
onMounted(() => {
  initializeData();
});
</script>