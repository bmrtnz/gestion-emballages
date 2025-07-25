<script setup>
import { useFournisseurList } from '../composables/fournisseurs/useFournisseurList';
import { PencilSquareIcon, PlusIcon, ChevronRightIcon, PlayIcon, PauseIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDoubleDownIcon, ChevronDoubleUpIcon, DocumentIcon } from '@heroicons/vue/24/outline';
import SlidePanel from './ui/SlidePanel.vue';
import SiteCreateForm from './fournisseurs/SiteCreateForm.vue';
import FournisseurEditForm from './fournisseurs/FournisseurEditForm.vue';
import SiteEditForm from './fournisseurs/SiteEditForm.vue';
import Button from './ui/Button.vue';
import Select from './ui/Select.vue';

// Use the main fournisseur list composable
const {
  // Data
  fournisseurs,
  transformedTableData,
  isLoading,
  
  // Filters
  searchQuery,
  statusFilter,
  showFilters,
  activeFiltersCount,
  statusOptions,
  
  // Pagination
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPrevPage,
  paginationPages,
  
  // Tree state
  isExpanded,
  toggleExpanded,
  computedIsTreeExpanded,
  toggleTreeState,
  handleExpandAll,
  handleCollapseAll,
  
  // UI state
  isSiteCreatePanelOpen,
  isEditPanelOpen,
  isSiteEditPanelOpen,
  selectedFournisseurForSite,
  selectedFournisseurForEdit,
  selectedSiteForEdit,
  selectedFournisseurIdForSiteEdit,
  
  // Role-based configuration
  allowRowActions,
  
  // Permissions
  canCreateFournisseur,
  canEditFournisseur,
  canDeactivateFournisseur,
  canReactivateFournisseur,
  canCreateSites,
  canEditSite,
  canDeleteSite,
  
  // Methods
  handlePageChange,
  handlePageSizeChangeWithRefresh,
  handleClearFilters,
  formatAddress,
  editFournisseur,
  openSiteCreatePanel,
  editSite,
  handleSiteCreatedWithRefresh,
  handleFournisseurUpdatedWithRefresh,
  handleFournisseurDataUpdatedWithRefresh,
  handleSiteUpdatedWithRefresh,
  handleSoftDeleteFournisseur,
  handleReactivateFournisseur,
  handleDeactivateSite,
  handleReactivateSite,
  closeAllPanels,
  
  // Expose for parent component
  fetchFournisseurs,
  goToPrevPage,
  goToNextPage
} = useFournisseurList();

// Expose fetchFournisseurs function for parent component
defineExpose({ fetchFournisseurs });

// Helper functions for document status
const isDocumentExpired = (doc) => {
  if (!doc.dateExpiration) return false;
  return new Date(doc.dateExpiration) < new Date();
};

const isDocumentExpiringSoon = (doc) => {
  if (!doc.dateExpiration) return false;
  const expirationDate = new Date(doc.dateExpiration);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  return expirationDate <= thirtyDaysFromNow && expirationDate > now;
};

const getDocumentStatusColor = (doc) => {
  if (isDocumentExpired(doc)) return 'text-red-500';
  if (isDocumentExpiringSoon(doc)) return 'text-amber-500';
  return 'text-green-500';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Aucune date';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getDocumentTooltip = (doc) => {
  return `${doc.typeDocument} - ${doc.nomDocument}\nValide jusqu'au: ${formatDate(doc.dateExpiration)}`;
};

const handleViewDocument = (document) => {
  // Open document in new tab
  window.open(document.urlStockage, '_blank');
};
</script>

<template>
  <div class="space-y-6">
    <!-- Search and Filters -->
    <div class="space-y-4">
      <!-- Search Bar and Filter Toggle -->
      <div class="flex items-center space-x-4">
        <!-- Tree toggle button -->
        <button
          @click="toggleTreeState"
          class="flex-shrink-0 inline-flex items-center justify-center p-2 border border-gray-300 shadow-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          :title="computedIsTreeExpanded ? 'Tout replier' : 'Tout déplier'"
        >
          <ChevronDoubleUpIcon v-if="computedIsTreeExpanded" class="h-4 w-4" />
          <ChevronDoubleDownIcon v-else class="h-4 w-4" />
        </button>
        
        <button
          @click="showFilters = !showFilters"
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
        
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Rechercher par nom, spécialisation, sites ou contacts..."
          />
        </div>
      </div>

      <!-- Filters -->
      <div v-if="showFilters" class="p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <Select
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Sélectionner un statut"
            />
          </div>
          
          <!-- Three empty columns for future filters -->
          <div></div>
          <div></div>
          <div></div>
        </div>
        
        <div class="flex justify-end">
          <Button variant="secondary" size="sm" @click="handleClearFilters">
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Mobile tree view controls -->
    <div class="block md:hidden mb-4">
      <div class="flex items-center justify-start">
        <button 
          @click="toggleTreeState"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
          :title="computedIsTreeExpanded ? 'Tout replier' : 'Tout déplier'"
        >
          <ChevronDoubleUpIcon v-if="isTreeExpanded" class="h-4 w-4 mr-2" />
          <ChevronDoubleDownIcon v-else class="h-4 w-4 mr-2" />
          {{ computedIsTreeExpanded ? 'Replier tout' : 'Déplier tout' }}
        </button>
      </div>
    </div>
    
    <!-- Mobile card view -->
    <div class="block md:hidden">
      <div class="space-y-3">
        <div
          v-for="fournisseur in transformedTableData"
          :key="fournisseur.key"
          class="p-4 rounded-lg border bg-white border-gray-200"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <h3 class="text-sm font-semibold truncate text-gray-900">{{ fournisseur.nom }}</h3>
                </div>
                <button
                  v-if="fournisseur.children.length > 0"
                  @click="toggleExpanded(fournisseur.key)"
                  class="flex items-center p-1 hover:bg-gray-100 rounded transition-colors"
                  :title="isExpanded(fournisseur.key) ? 'Réduire' : 'Étendre'"
                >
                  <ChevronRightIcon 
                    :class="['h-4 w-4 text-gray-500 transition-transform duration-200', isExpanded(fournisseur.key) ? 'transform rotate-90' : '']"
                  />
                </button>
              </div>
              <p class="text-sm text-gray-500 truncate">{{ fournisseur.siret }}</p>
              <div v-if="formatAddress(fournisseur.adresse).line1" class="text-xs text-gray-400 mt-1">
                <div>{{ formatAddress(fournisseur.adresse).line1 }}</div>
                <div>{{ formatAddress(fournisseur.adresse).line2 }}</div>
              </div>
              <div class="mt-2 flex items-center justify-between">
                <div>
                  <span v-if="fournisseur.isActive" class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Actif
                  </span>
                  <span v-else class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                    Inactif
                  </span>
                </div>
                <!-- Documents icons for mobile -->
                <div v-if="fournisseur.documents && fournisseur.documents.length > 0" class="flex items-center space-x-1">
                  <div
                    v-for="document in fournisseur.documents"
                    :key="document._id"
                    class="relative group"
                  >
                    <DocumentIcon
                      class="h-4 w-4 cursor-pointer hover:scale-110 transition-transform duration-200"
                      :class="getDocumentStatusColor(document)"
                      @click="handleViewDocument(document)"
                    />
                    <!-- Custom tooltip -->
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      <div class="text-center">
                        <div class="font-medium">{{ document.typeDocument }}</div>
                        <div>{{ document.nomDocument }}</div>
                        <div class="text-gray-300">Valide jusqu'au: {{ formatDate(document.dateExpiration) }}</div>
                        <div class="text-gray-300 text-xs mt-1">Cliquez pour ouvrir</div>
                      </div>
                      <!-- Tooltip arrow -->
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="allowRowActions" class="mt-3 flex justify-end gap-x-2">
            <button 
              v-if="canEditFournisseur(fournisseur)"
              @click="editFournisseur(fournisseur)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <PencilSquareIcon class="h-5 w-5" />
            </button>
            <button 
              v-if="fournisseur.isActive && canDeactivateFournisseur(fournisseur)"
              @click="handleSoftDeleteFournisseur(fournisseur._id)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Désactiver"
            >
              <PauseIcon class="h-5 w-5" />
            </button>
            <button 
              v-else-if="!fournisseur.isActive && canReactivateFournisseur(fournisseur)"
              @click="handleReactivateFournisseur(fournisseur._id)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Réactiver"
            >
              <PlayIcon class="h-5 w-5" />
            </button>
          </div>
          
          <!-- Sites (children) for mobile -->
          <div v-if="isExpanded(fournisseur.key) && fournisseur.children.length > 0" class="mt-4 pl-4 border-l-2 border-gray-200">
            <div v-for="site in fournisseur.children" :key="site._id" class="py-2 border-b border-gray-100 last:border-b-0">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center">
                    <div class="w-4 h-4 mr-2 flex items-center justify-center">
                      <div 
                        class="w-2 h-2 rounded-full"
                        :class="site.estPrincipal ? 'bg-green-500' : 'bg-gray-300'"
                      ></div>
                    </div>
                    <h4 class="text-sm font-medium text-gray-700">{{ site.nomSite }}</h4>
                  </div>
                  <div v-if="formatAddress(site.adresse).line1" class="text-xs text-gray-500 mt-1">
                    <div>{{ formatAddress(site.adresse).line1 }}</div>
                    <div>{{ formatAddress(site.adresse).line2 }}</div>
                  </div>
                  <div v-if="site.contact" class="text-xs text-gray-400 mt-1">
                    {{ site.contact.nom }} - 
                    <a v-if="site.contact.email" :href="`mailto:${site.contact.email}`" class="text-blue-600 hover:text-blue-800 underline">{{ site.contact.email }}</a>
                    <span v-if="site.contact.email && site.contact.telephone"> / </span>
                    <span v-if="site.contact.telephone">{{ site.contact.telephone }}</span>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <span v-if="site.estPrincipal" class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Principal
                    </span>
                    <span v-if="site.isActive !== false" class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Actif
                    </span>
                    <span v-else class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                      Inactif
                    </span>
                  </div>
                </div>
                <div class="flex gap-x-1">
                  <button 
                    @click="editSite(site, fournisseur._id)"
                    class="p-1 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                    title="Modifier"
                  >
                    <PencilSquareIcon class="h-4 w-4" />
                  </button>
                  <button 
                    v-if="site.isActive !== false"
                    @click="handleDeactivateSite(fournisseur._id, site._id)"
                    class="p-1 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                    title="Désactiver"
                  >
                    <PauseIcon class="h-4 w-4" />
                  </button>
                  <button 
                    v-else
                    @click="handleReactivateSite(fournisseur._id, site._id)"
                    class="p-1 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                    title="Réactiver"
                  >
                    <PlayIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Loading state for mobile -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
                  <th scope="col" class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">Fournisseur / Site</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SIRET / Adresse</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Documents / Contact</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                  <th v-if="allowRowActions" scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <template v-for="parentItem in transformedTableData" :key="parentItem.key">
                  <!-- Parent row (Fournisseur) -->
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <td class="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
                      <div class="flex items-center">
                        <button
                          v-if="parentItem.children.length > 0"
                          @click="toggleExpanded(parentItem.key)"
                          class="flex items-center p-1 hover:bg-gray-100 rounded transition-colors mr-2"
                          :title="isExpanded(parentItem.key) ? 'Réduire' : 'Étendre'"
                        >
                          <ChevronRightIcon 
                            :class="['h-4 w-4 text-gray-500 transition-transform duration-200', isExpanded(parentItem.key) ? 'transform rotate-90' : '']"
                          />
                        </button>
                        <span class="font-semibold text-gray-900">{{ parentItem.nom }}</span>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 font-medium">
                      {{ parentItem.siret }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <!-- Documents icons for supplier -->
                      <div v-if="parentItem.documents && parentItem.documents.length > 0" class="flex items-center space-x-1">
                        <div
                          v-for="document in parentItem.documents"
                          :key="document._id"
                          class="relative group"
                        >
                          <DocumentIcon
                            class="h-4 w-4 cursor-pointer hover:scale-110 transition-transform duration-200"
                            :class="getDocumentStatusColor(document)"
                            @click="handleViewDocument(document)"
                          />
                          <!-- Custom tooltip -->
                          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            <div class="text-center">
                              <div class="font-medium">{{ document.typeDocument }}</div>
                              <div>{{ document.nomDocument }}</div>
                              <div class="text-gray-300">Valide jusqu'au: {{ formatDate(document.dateExpiration) }}</div>
                              <div class="text-gray-300 text-xs mt-1">Cliquez pour ouvrir</div>
                            </div>
                            <!-- Tooltip arrow -->
                            <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span v-if="parentItem.isActive" class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Actif
                      </span>
                      <span v-else class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        Inactif
                      </span>
                    </td>
                    <td v-if="allowRowActions" class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                      <div class="flex items-center justify-end gap-x-2">
                        <button 
                          v-if="canCreateSites(parentItem)"
                          @click="openSiteCreatePanel(parentItem)"
                          class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                          title="Ajouter un site"
                        >
                          <PlusIcon class="h-5 w-5" />
                        </button>
                        <button 
                          v-if="canEditFournisseur(parentItem)"
                          @click="editFournisseur(parentItem)" 
                          class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                          title="Modifier"
                        >
                          <PencilSquareIcon class="h-5 w-5" />
                        </button>
                        <button 
                          v-if="parentItem.isActive && canDeactivateFournisseur(parentItem)"
                          @click="handleSoftDeleteFournisseur(parentItem._id)" 
                          class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                          title="Désactiver"
                        >
                          <PauseIcon class="h-5 w-5" />
                        </button>
                        <button 
                          v-else-if="!parentItem.isActive && canReactivateFournisseur(parentItem)"
                          @click="handleReactivateFournisseur(parentItem._id)" 
                          class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                          title="Réactiver"
                        >
                          <PlayIcon class="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Child rows (Sites) -->
                  <template v-if="isExpanded(parentItem.key)">
                    <tr v-for="childItem in parentItem.children" :key="childItem._id" class="bg-white hover:bg-gray-25 border-b border-gray-100">
                      <td class="whitespace-nowrap py-3 pr-3 text-sm text-gray-700">
                        <div class="flex items-center pl-8">
                          <div class="w-4 h-4 mr-2 flex items-center justify-center">
                            <div 
                              class="w-2 h-2 rounded-full"
                              :class="childItem.estPrincipal ? 'bg-green-500' : 'bg-gray-300'"
                            ></div>
                          </div>
                          {{ childItem.nomSite }}
                        </div>
                      </td>
                      <td class="px-3 py-3 text-sm text-gray-600">
                        <div v-if="formatAddress(childItem.adresse).line1">
                          <div>{{ formatAddress(childItem.adresse).line1 }}</div>
                          <div>{{ formatAddress(childItem.adresse).line2 }}</div>
                        </div>
                      </td>
                      <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        <div v-if="childItem.contact">
                          <div>{{ childItem.contact.nom }}</div>
                          <div class="text-gray-400">
                            <a v-if="childItem.contact.email" :href="`mailto:${childItem.contact.email}`" class="text-blue-600 hover:text-blue-800 underline">{{ childItem.contact.email }}</a>
                            <span v-if="childItem.contact.email && childItem.contact.telephone"> / </span>
                            <span v-if="childItem.contact.telephone">{{ childItem.contact.telephone }}</span>
                          </div>
                        </div>
                      </td>
                      <td class="whitespace-nowrap px-3 py-3 text-sm">
                        <span v-if="childItem.isActive !== false" class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Actif
                        </span>
                        <span v-else class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                          Inactif
                        </span>
                      </td>
                      <td v-if="allowRowActions" class="whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div class="flex items-center justify-end gap-x-2">
                          <button 
                            v-if="canEditSite(childItem)"
                            @click="editSite(childItem, parentItem._id)"
                            class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                            title="Modifier"
                          >
                            <PencilSquareIcon class="h-5 w-5" />
                          </button>
                          <button 
                            v-if="childItem.isActive !== false && canDeleteSite(childItem)"
                            @click="handleDeactivateSite(parentItem._id, childItem._id)"
                            class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                            title="Désactiver"
                          >
                            <PauseIcon class="h-5 w-5" />
                          </button>
                          <button 
                            v-else-if="childItem.isActive === false && canDeleteSite(childItem)"
                            @click="handleReactivateSite(parentItem._id, childItem._id)"
                            class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                            title="Réactiver"
                          >
                            <PlayIcon class="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
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
    
    <!-- Pagination controls -->
    <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div class="flex items-center justify-between w-full">
        <!-- Mobile pagination -->
        <div class="flex justify-between flex-1 sm:hidden">
          <button
            @click="goToPrevPage"
            :disabled="!hasPrevPage"
            class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            @click="goToNextPage"
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
              @change="handlePageSizeChangeWithRefresh($event.target.value)"
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
                @click="goToPrevPage"
                :disabled="!hasPrevPage"
                class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Page précédente"
              >
                <span class="sr-only">Précédent</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <template v-for="page in paginationPages" :key="page">
                <button
                  @click="handlePageChange(page)"
                  :class="[
                    page === currentPage
                      ? 'relative z-10 inline-flex items-center bg-primary-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                      : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  ]"
                >
                  {{ page }}
                </button>
              </template>
              
              <!-- Next page button -->
              <button
                @click="goToNextPage"
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
    
    <!-- Site creation slide panel -->
    <SlidePanel 
      :open="isSiteCreatePanelOpen" 
      @close="isSiteCreatePanelOpen = false" 
      :title="selectedFournisseurForSite ? `Ajouter un site - ${selectedFournisseurForSite.nom}` : 'Ajouter un site'" 
      size="md"
    >
      <SiteCreateForm 
        v-if="selectedFournisseurForSite" 
        :fournisseur-id="selectedFournisseurForSite._id" 
        @created="handleSiteCreatedWithRefresh" 
        @close="isSiteCreatePanelOpen = false" 
      />
    </SlidePanel>
    
    <!-- Fournisseur edit slide panel -->
    <SlidePanel 
      :open="isEditPanelOpen" 
      @close="isEditPanelOpen = false" 
      title="Modifier le fournisseur" 
      size="md"
    >
      <FournisseurEditForm 
        v-if="selectedFournisseurForEdit" 
        :fournisseur="selectedFournisseurForEdit" 
        @updated="handleFournisseurUpdatedWithRefresh" 
        @document-updated="handleFournisseurDataUpdatedWithRefresh"
        @close="isEditPanelOpen = false" 
      />
    </SlidePanel>
    
    <!-- Site edit slide panel -->
    <SlidePanel 
      :open="isSiteEditPanelOpen" 
      @close="isSiteEditPanelOpen = false" 
      title="Modifier le site" 
      size="md"
    >
      <SiteEditForm 
        v-if="selectedSiteForEdit && selectedFournisseurIdForSiteEdit" 
        :fournisseur-id="selectedFournisseurIdForSiteEdit"
        :site="selectedSiteForEdit" 
        @updated="handleSiteUpdatedWithRefresh" 
        @close="isSiteEditPanelOpen = false" 
      />
    </SlidePanel>
  </div>
</template>