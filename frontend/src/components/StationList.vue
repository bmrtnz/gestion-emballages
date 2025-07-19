<script setup>
import { ref } from 'vue';
import { useStationList } from '../composables/stations/useStationList';
import { PencilSquareIcon, PauseIcon, PlayIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import StationEditForm from './stations/StationEditForm.vue';
import SlidePanel from './ui/SlidePanel.vue';
import Button from './ui/Button.vue';
import Select from './ui/Select.vue';

// Use the composable
const {
  // Data
  stations,
  selectedStation,
  isLoading,
  
  // Filters
  searchQuery,
  statusFilter,
  showFilters,
  statusOptions,
  activeFiltersCount,
  
  // Pagination
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPrevPage,
  paginationInfo,
  
  // Methods
  fetchStations,
  toggleFilters,
  clearFilters,
  deactivateStation,
  reactivateStation,
  goToPage,
  goToPrevPage,
  goToNextPage,
  goToFirstPage,
  goToLastPage,
  changePageSize,
  formatAddress
} = useStationList();

// Local UI state
const isEditPanelOpen = ref(false);
const editingStation = ref(null);

// UI methods
const openEditPanel = (station) => {
  editingStation.value = station;
  isEditPanelOpen.value = true;
};

const handleStationUpdated = () => {
  isEditPanelOpen.value = false;
  editingStation.value = null;
  fetchStations();
};

const closeEditPanel = () => {
  isEditPanelOpen.value = false;
  editingStation.value = null;
};

// Expose fetchStations for parent component
defineExpose({ fetchStations });
</script>

<template>
  <div class="space-y-6">
    <!-- Search and Filters -->
    <div class="space-y-4">
      <!-- Search Bar and Filter Toggle -->
      <div class="flex items-center space-x-4">
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
        
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Rechercher par nom, référence, adresse ou contact..."
          />
        </div>
      </div>

      <!-- Filters Panel -->
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
          <Button variant="secondary" size="sm" @click="clearFilters">
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    </div>

    <!-- Mobile View -->
    <div class="block md:hidden">
      <div class="space-y-3">
        <div
          v-for="station in stations"
          :key="station._id"
          class="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-gray-900 truncate">{{ station.nom }}</h3>
                <span 
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ml-2"
                  :class="station.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
                >
                  {{ station.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </div>
              <p class="text-sm text-gray-500 truncate">{{ station.identifiantInterne }}</p>
              <div v-if="formatAddress(station.adresse).line1" class="text-xs text-gray-400 mt-1">
                <div>{{ formatAddress(station.adresse).line1 }}</div>
                <div>{{ formatAddress(station.adresse).line2 }}</div>
              </div>
              <div v-if="station.contactPrincipal" class="mt-2 text-xs text-gray-500">
                <div>{{ station.contactPrincipal.nom }}</div>
                <div v-if="station.contactPrincipal.email" class="text-blue-600">
                  {{ station.contactPrincipal.email }}
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex justify-end gap-x-2">
            <button 
              @click="openEditPanel(station)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <PencilSquareIcon class="h-5 w-5" />
            </button>
            <button 
              v-if="station.isActive"
              @click="deactivateStation(station._id)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Désactiver"
            >
              <PauseIcon class="h-5 w-5" />
            </button>
            <button 
              v-else
              @click="reactivateStation(station._id)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Réactiver"
            >
              <PlayIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <!-- Loading state for mobile -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    </div>

    <!-- Desktop View -->
    <div class="hidden md:block flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="relative">
            <table class="min-w-full table-fixed divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">Nom</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Identifiant Interne</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Adresse</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="station in stations" :key="station._id">
                  <td class="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">{{ station.nom }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ station.identifiantInterne }}</td>
                  <td class="px-3 py-4 text-sm text-gray-500">
                    <div v-if="formatAddress(station.adresse).line1">
                      <div>{{ formatAddress(station.adresse).line1 }}</div>
                      <div class="text-xs">{{ formatAddress(station.adresse).line2 }}</div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div v-if="station.contactPrincipal">
                      <div>{{ station.contactPrincipal.nom }}</div>
                      <div class="text-gray-400">
                        <a v-if="station.contactPrincipal.email" :href="`mailto:${station.contactPrincipal.email}`" class="text-blue-600 hover:text-blue-800 underline">{{ station.contactPrincipal.email }}</a>
                        <span v-if="station.contactPrincipal.email && station.contactPrincipal.telephone"> / </span>
                        <span v-if="station.contactPrincipal.telephone">{{ station.contactPrincipal.telephone }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span v-if="station.isActive" class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Actif
                    </span>
                    <span v-else class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                      Inactif
                    </span>
                  </td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                    <div class="flex items-center justify-end gap-x-2">
                      <button @click="openEditPanel(station)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors" title="Modifier">
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button v-if="station.isActive" @click="deactivateStation(station._id)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors" title="Désactiver">
                        <PauseIcon class="h-5 w-5" />
                      </button>
                      <button v-else @click="reactivateStation(station._id)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors" title="Réactiver">
                        <PlayIcon class="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          @click="goToPrevPage"
          :disabled="!hasPrevPage"
          class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button
          @click="goToNextPage"
          :disabled="!hasNextPage"
          class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Affichage de <span class="font-medium">{{ paginationInfo.start }}</span> à 
            <span class="font-medium">{{ paginationInfo.end }}</span> sur 
            <span class="font-medium">{{ paginationInfo.total }}</span> résultats
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <label for="page-size" class="text-sm text-gray-700">Afficher:</label>
          <select
            id="page-size"
            @change="changePageSize($event.target.value)"
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
              @click="goToFirstPage"
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
            >
              <span class="sr-only">Précédent</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Page numbers -->
            <template v-for="page in Array.from({length: Math.min(5, totalPages)}, (_, i) => {
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, start + 4);
              return start + i;
            }).filter(p => p <= totalPages)" :key="page">
              <button
                @click="goToPage(page)"
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
            >
              <span class="sr-only">Suivant</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Last page button -->
            <button
              @click="goToLastPage"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Dernière page"
            >
              <span class="sr-only">Dernière page</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.21 5.23a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08L8.168 10 4.23 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08L14.168 10 10.23 6.29a.75.75 0 01-.02-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Panel -->
  <SlidePanel 
    :open="isEditPanelOpen" 
    @close="closeEditPanel" 
    title="Modifier la station"
    size="md"
  >
    <StationEditForm 
      v-if="editingStation"
      :station="editingStation"
      @updated="handleStationUpdated"
      @close="closeEditPanel"
    />
  </SlidePanel>
</template>