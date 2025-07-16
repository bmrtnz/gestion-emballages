<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useLoading } from '../composables/useLoading';
import { useErrorHandler } from '../composables/useErrorHandler';
import { useTreeState } from '../composables/useTreeState';
import api from '../api/axios';
import { PencilSquareIcon, PlusIcon, ChevronRightIcon, PlayIcon, PauseIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/outline';
import SlidePanel from './ui/SlidePanel.vue';
import SiteCreateForm from './fournisseurs/SiteCreateForm.vue';
import FournisseurEditForm from './fournisseurs/FournisseurEditForm.vue';
import SiteEditForm from './fournisseurs/SiteEditForm.vue';

const authStore = useAuthStore();

// State
const fournisseurs = ref([]);
const showInactive = ref(false);
const isSiteCreatePanelOpen = ref(false);
const isEditPanelOpen = ref(false);
const isSiteEditPanelOpen = ref(false);
const selectedFournisseurForSite = ref(null);
const selectedFournisseurForEdit = ref(null);
const selectedSiteForEdit = ref(null);
const selectedFournisseurIdForSiteEdit = ref(null);

// Loading and error handling
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Tree state management
const { isExpanded, toggleExpanded, initializeItems, expandAll, collapseAll } = useTreeState('fournisseurs-tree-state', true);

// Fetch data
const fetchFournisseurs = async () => {
  await execute(async () => {
    const response = await withErrorHandling(
      () => api.get('/fournisseurs'),
      'Failed to load fournisseurs'
    );
    fournisseurs.value = response.data;
  });
};

onMounted(fetchFournisseurs);

// Keep the hierarchical structure for tree view with filtering
const tableDataSource = computed(() => {
  let filteredFournisseurs = fournisseurs.value;
  
  // Filter based on active/inactive toggle
  if (!showInactive.value) {
    filteredFournisseurs = fournisseurs.value.filter(f => f.isActive);
  }
  
  return filteredFournisseurs.map(f => ({
    ...f,
    key: f._id,
    children: f.sites || []
  }));
});

// Initialize tree state when data changes
watch(tableDataSource, (data) => {
  if (data.length > 0) {
    initializeItems(data);
  }
}, { immediate: true });

const editFournisseur = (fournisseur) => {
  selectedFournisseurForEdit.value = fournisseur;
  isEditPanelOpen.value = true;
};

const openSiteCreatePanel = (fournisseur) => {
  selectedFournisseurForSite.value = fournisseur;
  isSiteCreatePanelOpen.value = true;
};

const handleSiteCreated = () => {
  isSiteCreatePanelOpen.value = false;
  selectedFournisseurForSite.value = null;
  fetchFournisseurs(); // Refresh the list to show the new site
};

const handleFournisseurUpdated = () => {
  isEditPanelOpen.value = false;
  selectedFournisseurForEdit.value = null;
  fetchFournisseurs(); // Refresh the list to show the updated fournisseur
};

const softDeleteFournisseur = async (fournisseurId) => {
  await execute(async () => {
    try {
      await withErrorHandling(
        () => api.delete(`/fournisseurs/${fournisseurId}`),
        'Impossible de supprimer ce fournisseur'
      );
      await fetchFournisseurs();
    } catch (error) {
      // Error already handled by withErrorHandling, just log it
      console.log('Supplier deletion failed:', error.response?.data?.message || error.message);
    }
  });
};

const reactivateFournisseur = async (fournisseurId) => {
  await execute(async () => {
    try {
      await withErrorHandling(
        () => api.patch(`/fournisseurs/${fournisseurId}/reactivate`),
        'Impossible de réactiver ce fournisseur'
      );
      await fetchFournisseurs();
    } catch (error) {
      // Error already handled by withErrorHandling, just log it
      console.log('Supplier reactivation failed:', error.response?.data?.message || error.message);
    }
  });
};

// Expose fetchFournisseurs function for parent component
defineExpose({ fetchFournisseurs });

const formatAddress = (adresse) => {
    if (!adresse) return '';
    return `${adresse.rue}, ${adresse.codePostal} ${adresse.ville}, ${adresse.pays}`;
};

// Tree control functions
const handleExpandAll = () => {
  expandAll(tableDataSource.value);
};

const handleCollapseAll = () => {
  collapseAll();
};

const editSite = (site, fournisseurId) => {
  selectedSiteForEdit.value = site;
  selectedFournisseurIdForSiteEdit.value = fournisseurId;
  isSiteEditPanelOpen.value = true;
};

const handleSiteUpdated = () => {
  isSiteEditPanelOpen.value = false;
  selectedSiteForEdit.value = null;
  selectedFournisseurIdForSiteEdit.value = null;
  fetchFournisseurs();
};

const deactivateSite = async (fournisseurId, siteId) => {
  await execute(async () => {
    try {
      await withErrorHandling(
        () => api.patch(`/fournisseurs/${fournisseurId}/sites/${siteId}/deactivate`),
        'Impossible de désactiver ce site'
      );
      await fetchFournisseurs();
    } catch (error) {
      console.log('Site deactivation failed:', error.response?.data?.message || error.message);
    }
  });
};

const reactivateSite = async (fournisseurId, siteId) => {
  await execute(async () => {
    try {
      await withErrorHandling(
        () => api.patch(`/fournisseurs/${fournisseurId}/sites/${siteId}/reactivate`),
        'Impossible de réactiver ce site'
      );
      await fetchFournisseurs();
    } catch (error) {
      console.log('Site reactivation failed:', error.response?.data?.message || error.message);
    }
  });
};
</script>

<template>
  <div>
    <!-- Mobile tree view controls -->
    <div class="block md:hidden mb-4 space-y-3">
      <div class="flex items-center justify-start gap-x-2">
        <button 
          @click="handleExpandAll"
          class="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
          title="Tout déplier"
        >
          <ChevronDownIcon class="h-3 w-3 mr-1" />
          Déplier
        </button>
        <button 
          @click="handleCollapseAll"
          class="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
          title="Tout replier"
        >
          <ChevronUpIcon class="h-3 w-3 mr-1" />
          Replier
        </button>
      </div>
      
      <!-- Show inactive toggle for mobile -->
      <div class="flex items-center">
        <input 
          id="show-inactive-mobile" 
          v-model="showInactive" 
          type="checkbox" 
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label for="show-inactive-mobile" class="ml-2 block text-sm text-gray-900">
          Afficher les inactifs
        </label>
      </div>
    </div>
    
    <!-- Mobile card view -->
    <div class="block md:hidden">
      <div class="space-y-3">
        <div
          v-for="fournisseur in tableDataSource"
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
              <p class="text-xs text-gray-400 mt-1">{{ formatAddress(fournisseur.adresse) }}</p>
              <div class="mt-2">
                <span v-if="fournisseur.isActive" class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Actif
                </span>
                <span v-else class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                  Inactif
                </span>
              </div>
            </div>
          </div>
          <div class="mt-3 flex justify-end gap-x-2">
            <button 
              @click="editFournisseur(fournisseur)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <PencilSquareIcon class="h-5 w-5" />
            </button>
            <button 
              v-if="fournisseur.isActive"
              @click="softDeleteFournisseur(fournisseur._id)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Désactiver"
            >
              <PauseIcon class="h-5 w-5" />
            </button>
            <button 
              v-else
              @click="reactivateFournisseur(fournisseur._id)" 
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
                  <h4 class="text-sm font-medium text-gray-700">{{ site.nomSite }}</h4>
                  <p class="text-xs text-gray-500">{{ formatAddress(site.adresse) }}</p>
                  <div v-if="site.contact" class="text-xs text-gray-400 mt-1">
                    {{ site.contact.nom }} - 
                    <a v-if="site.contact.email" :href="`mailto:${site.contact.email}`" class="text-blue-600 hover:text-blue-800 underline">{{ site.contact.email }}</a>
                    <span v-if="site.contact.email && site.contact.telephone"> / </span>
                    <span v-if="site.contact.telephone">{{ site.contact.telephone }}</span>
                  </div>
                  <span v-if="site.estPrincipal" class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mt-1">
                    Principal
                  </span>
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
                    @click="deactivateSite(fournisseur._id, site._id)"
                    class="p-1 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                    title="Désactiver"
                  >
                    <PauseIcon class="h-4 w-4" />
                  </button>
                  <button 
                    v-else
                    @click="reactivateSite(fournisseur._id, site._id)"
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

    <!-- Tree view controls -->
    <div class="hidden md:flex items-center justify-between mb-4">
      <div class="flex items-center gap-x-2">
        <button 
          @click="handleExpandAll"
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
          title="Tout déplier"
        >
          <ChevronDownIcon class="h-4 w-4 mr-1" />
          Tout déplier
        </button>
        <button 
          @click="handleCollapseAll"
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
          title="Tout replier"
        >
          <ChevronUpIcon class="h-4 w-4 mr-1" />
          Tout replier
        </button>
      </div>
      
      <!-- Show inactive toggle -->
      <div class="flex items-center">
        <input 
          id="show-inactive" 
          v-model="showInactive" 
          type="checkbox" 
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label for="show-inactive" class="ml-2 block text-sm text-gray-900">
          Afficher les fournisseurs inactifs
        </label>
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
                  <th scope="col" class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">Nom Fournisseur / Site</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SIRET / Principal</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Adresse</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <template v-for="parentItem in tableDataSource" :key="parentItem.key">
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
                      {{ formatAddress(parentItem.adresse) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <!-- Contact info for parent if needed -->
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span v-if="parentItem.isActive" class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Actif
                      </span>
                      <span v-else class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        Inactif
                      </span>
                    </td>
                    <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                      <div class="flex items-center justify-end gap-x-2">
                        <button 
                          @click="openSiteCreatePanel(parentItem)"
                          class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                          title="Ajouter un site"
                        >
                          <PlusIcon class="h-5 w-5" />
                        </button>
                        <button 
                          @click="editFournisseur(parentItem)" 
                          class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                          title="Modifier"
                        >
                          <PencilSquareIcon class="h-5 w-5" />
                        </button>
                        <button 
                          v-if="parentItem.isActive"
                          @click="softDeleteFournisseur(parentItem._id)" 
                          class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                          title="Désactiver"
                        >
                          <PauseIcon class="h-5 w-5" />
                        </button>
                        <button 
                          v-else
                          @click="reactivateFournisseur(parentItem._id)" 
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
                            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                          {{ childItem.nomSite }}
                        </div>
                      </td>
                      <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                        <span v-if="childItem.estPrincipal" class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Principal
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {{ formatAddress(childItem.adresse) }}
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
                        <!-- Status column empty for sites -->
                      </td>
                      <td class="whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div class="flex items-center justify-end gap-x-2">
                          <button 
                            @click="editSite(childItem, parentItem._id)"
                            class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                            title="Modifier"
                          >
                            <PencilSquareIcon class="h-5 w-5" />
                          </button>
                          <button 
                            v-if="childItem.isActive !== false"
                            @click="deactivateSite(parentItem._id, childItem._id)"
                            class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" 
                            title="Désactiver"
                          >
                            <PauseIcon class="h-5 w-5" />
                          </button>
                          <button 
                            v-else
                            @click="reactivateSite(parentItem._id, childItem._id)"
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
        @created="handleSiteCreated" 
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
        @updated="handleFournisseurUpdated" 
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
        @updated="handleSiteUpdated" 
        @close="isSiteEditPanelOpen = false" 
      />
    </SlidePanel>
  </div>
</template>