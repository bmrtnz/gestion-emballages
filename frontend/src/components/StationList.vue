<script setup>
import { ref, computed, onMounted } from 'vue';
import { useLoading } from '../composables/useLoading';
import { useErrorHandler } from '../composables/useErrorHandler';
import api from '../api/axios';
import { PencilSquareIcon, PauseIcon, PlayIcon } from '@heroicons/vue/24/outline';
import StationEditForm from './stations/StationEditForm.vue';
import SlidePanel from './ui/SlidePanel.vue';

// State
const stations = ref([]);
const showInactive = ref(false);
const isEditPanelOpen = ref(false);
const selectedStation = ref(null);

// Computed property to filter stations based on active/inactive toggle
const filteredStations = computed(() => {
  if (!showInactive.value) {
    return stations.value.filter(station => station.isActive);
  }
  return stations.value;
});

// Loading and error handling
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Fetch data
const fetchStations = async () => {
  await execute(async () => {
    const response = await withErrorHandling(
      () => api.get('/stations'),
      'Failed to load stations'
    );
    stations.value = response.data;
  });
};

onMounted(fetchStations);

// Expose fetchStations function for parent component
defineExpose({ fetchStations });

const formatAddress = (adresse) => {
    if (!adresse) return '';
    return `${adresse.rue}, ${adresse.codePostal} ${adresse.ville}, ${adresse.pays}`;
};

const openEditPanel = (station) => {
    selectedStation.value = station;
    isEditPanelOpen.value = true;
};

const handleStationUpdated = () => {
    isEditPanelOpen.value = false;
    selectedStation.value = null;
    fetchStations();
};

const closeEditPanel = () => {
    isEditPanelOpen.value = false;
    selectedStation.value = null;
};

const deactivateStation = async (stationId) => {
    await execute(async () => {
        await withErrorHandling(
            () => api.delete(`/stations/${stationId}`),
            'Failed to deactivate station'
        );
        await fetchStations(); // Refresh the list
    });
};

const reactivateStation = async (stationId) => {
    await execute(async () => {
        await withErrorHandling(
            () => api.patch(`/stations/${stationId}/reactivate`),
            'Failed to reactivate station'
        );
        await fetchStations(); // Refresh the list
    });
};
</script>

<template>
  <div>
    <!-- Controls -->
    <div class="flex items-center justify-end mb-4">
      <!-- Show inactive toggle -->
      <div class="flex items-center">
        <input 
          id="show-inactive-stations" 
          v-model="showInactive" 
          type="checkbox" 
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label for="show-inactive-stations" class="ml-2 block text-sm text-gray-900">
          <span class="hidden sm:inline">Afficher les stations inactives</span>
          <span class="sm:hidden">Afficher les inactifs</span>
        </label>
      </div>
    </div>

    <div class="flow-root">
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
              <tr v-for="station in filteredStations" :key="station._id">
                <td class="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">{{ station.nom }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ station.identifiantInterne }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatAddress(station.adresse) }}</td>
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
                        <button @click="openEditPanel(station)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" title="Modifier">
                          <PencilSquareIcon class="h-5 w-5" />
                        </button>
                        <button v-if="station.isActive" @click="deactivateStation(station._id)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" title="Désactiver">
                          <PauseIcon class="h-5 w-5" />
                        </button>
                        <button v-else @click="reactivateStation(station._id)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" title="Réactiver">
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

  <!-- Edit Panel -->
  <SlidePanel 
    :open="isEditPanelOpen" 
    @close="closeEditPanel" 
    title="Modifier la station"
    size="md"
  >
    <StationEditForm 
      v-if="selectedStation"
      :station="selectedStation"
      @updated="handleStationUpdated"
      @close="closeEditPanel"
    />
  </SlidePanel>
  </div>
</template>
