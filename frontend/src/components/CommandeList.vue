<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useLoading } from '../composables/useLoading';
import { useErrorHandler } from '../composables/useErrorHandler';
import { useTreeState } from '../composables/useTreeState';
import api from '../api/axios';
import { EyeIcon, PencilSquareIcon, TrashIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/outline';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { getStatusTagColor } from "../utils/statusUtils";
import ConfirmDialog from './ui/ConfirmDialog.vue';
import { notification } from '../composables/useNotification';
import dayjs from "dayjs";

const authStore = useAuthStore();

// State
const commandesGlobales = ref([]);
const selectedCommandes = ref([]);

// Delete confirmation dialog state
const showDeleteDialog = ref(false);
const commandeToDelete = ref(null);

// Loading and error handling
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Tree state management
const { isExpanded, toggleExpanded, initializeItems, expandAll, collapseAll } = useTreeState('commandes-tree-state', true);

// Fetch data
const fetchCommandesGlobales = async () => {
  await execute(async () => {
    const response = await withErrorHandling(
      () => api.get('/commandes-globales'),
      'Failed to load commandes'
    );
    commandesGlobales.value = response.data;
  });
};

onMounted(fetchCommandesGlobales);

// Keep the original hierarchical structure instead of flattening
const tableDataSource = computed(() => {
  return commandesGlobales.value.map(cg => ({
    ...cg,
    key: cg._id,
    children: cg.commandesFournisseurs || []
  }));
});

// Initialize tree state when data changes
watch(tableDataSource, (data) => {
  if (data.length > 0) {
    initializeItems(data);
  }
}, { immediate: true });

const formatCurrency = (number) => {
  if (typeof number !== "number") return number;
  return new Intl.NumberFormat("fr-FR", { style: 'currency', currency: 'EUR' }).format(number);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return dayjs(dateString).format('DD/MM/YYYY');
};

// Tree control functions
const handleExpandAll = () => {
  expandAll(tableDataSource.value);
};

const handleCollapseAll = () => {
  collapseAll();
};

// Check if user can delete global commands (Manager/Gestionnaire only)
const canDeleteGlobalCommand = computed(() => {
  return authStore.userRole === 'Manager' || authStore.userRole === 'Gestionnaire';
});

// Delete functions
const confirmDeleteGlobalCommand = (commandeGlobale) => {
  commandeToDelete.value = commandeGlobale;
  showDeleteDialog.value = true;
};

const handleDeleteConfirm = async () => {
  if (!commandeToDelete.value) return;
  
  await execute(async () => {
    await withErrorHandling(
      () => api.delete(`/commandes-globales/${commandeToDelete.value._id}`),
      'Erreur lors de la suppression de la commande globale'
    );
    
    notification.success('Commande globale supprimée avec succès');
    showDeleteDialog.value = false;
    commandeToDelete.value = null;
    
    // Refresh the list
    await fetchCommandesGlobales();
  });
};

const handleDeleteCancel = () => {
  showDeleteDialog.value = false;
  commandeToDelete.value = null;
};
</script>

<template>
  <div>
    <!-- Tree view controls -->
    <div class="flex items-center justify-start gap-x-2 mb-4">
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
    
    <div class="flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="relative">
          <table class="min-w-full table-fixed divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">Référence</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Entité</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Montant HT</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <template v-for="parentItem in tableDataSource" :key="parentItem.key">
                <!-- Parent row (Commande Globale) -->
                <tr class="bg-gray-50 border-b border-gray-200">
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
                      <span class="font-semibold">{{ parentItem.referenceGlobale }}</span>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 font-medium">
                    {{ parentItem.stationId?.nom }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium" :class="getStatusTagColor(parentItem.statutGeneral)">
                      {{ parentItem.statutGeneral }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 font-medium">
                    {{ formatCurrency(parentItem.montantTotalHT) }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ formatDate(parentItem.createdAt) }}
                  </td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                    <button class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" title="Voir">
                      <EyeIcon class="h-5 w-5" />
                    </button>
                    <button 
                      v-if="canDeleteGlobalCommand"
                      @click="confirmDeleteGlobalCommand(parentItem)"
                      class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors ml-2" 
                      title="Supprimer"
                    >
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </td>
                </tr>

                <!-- Child rows (Commandes Fournisseurs) -->
                <template v-if="isExpanded(parentItem.key)">
                  <tr v-for="childItem in parentItem.children" :key="childItem._id" class="bg-white hover:bg-gray-25 border-b border-gray-100">
                    <td class="whitespace-nowrap py-3 pr-3 text-sm text-gray-700">
                      <div class="flex items-center pl-8">
                        <div class="w-4 h-4 mr-2 flex items-center justify-center">
                          <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                        {{ childItem.numeroCommande }}
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                      {{ childItem.fournisseurId?.nom }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                      <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium" :class="getStatusTagColor(childItem.statut)">
                        {{ childItem.statut }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                      {{ formatCurrency(childItem.montantTotalHT) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                      {{ formatDate(childItem.createdAt) }}
                    </td>
                    <td class="whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                      <button class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors" title="Voir">
                        <EyeIcon class="h-5 w-5" />
                      </button>
                      <button class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors ml-2" title="Modifier">
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors ml-2" title="Supprimer">
                        <TrashIcon class="h-5 w-5" />
                      </button>
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

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :open="showDeleteDialog"
      title="Supprimer la commande globale"
      :message="`Êtes-vous sûr de vouloir supprimer la commande globale '${commandeToDelete?.referenceGlobale}' ? Cette action supprimera également toutes les commandes fournisseurs associées et ne peut pas être annulée.`"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      variant="danger"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>