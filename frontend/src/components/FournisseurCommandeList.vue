<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useLoading } from '../composables/useLoading';
import { useErrorHandler } from '../composables/useErrorHandler';
import api from '../api/axios';
import { EyeIcon, PencilSquareIcon, TrashIcon, CheckCircleIcon, PaperAirplaneIcon } from '@heroicons/vue/24/outline';
import { getStatusTagColor } from "../utils/statusUtils";
import dayjs from "dayjs";

const authStore = useAuthStore();

// State
const commandes = ref([]);

// Loading and error handling
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Fetch data
const fetchCommandesFournisseur = async () => {
  await execute(async () => {
    const response = await withErrorHandling(
      () => api.get('/commandes'),
      'Failed to load commandes'
    );
    commandes.value = response.data;
  });
};

onMounted(fetchCommandesFournisseur);

const tableDataSource = computed(() => {
  return commandes.value.flatMap(c => [
    { ...c, isParent: true, key: c._id },
    ...c.articles.map(a => ({ ...a, isParent: false, key: a._id, parentRef: c.numeroCommande }))
  ]);
});

const formatCurrency = (number) => {
  if (typeof number !== "number") return "0,00";
  return new Intl.NumberFormat("fr-FR", { style: 'currency', currency: 'EUR' }).format(number);
};
</script>

<template>
  <div class="flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="relative">
          <table class="min-w-full table-fixed divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">Commande / Article</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Station / Qté</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut / P.U.</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Montant Total / Total Ligne</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <template v-for="item in tableDataSource" :key="item.key">
                <tr :class="[item.isParent ? 'bg-gray-50' : '']">
                  <td class="whitespace-nowrap py-4 pr-3 text-sm font-medium" :class="[item.isParent ? 'text-gray-900' : 'pl-8 text-gray-700']">
                    {{ item.isParent ? item.numeroCommande : (item.referenceFournisseur || `${item.articleId.codeArticle} - ${item.articleId.designation}`) }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ item.isParent ? item.stationId?.nom : new Intl.NumberFormat("fr-FR").format(item.quantiteCommandee) }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span v-if="item.isParent" class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium" :class="getStatusTagColor(item.statut)">
                      {{ item.statut }}
                    </span>
                    <span v-else>{{ formatCurrency(item.prixUnitaire) }}</span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <!-- Uses frozen montantTotalHT for orders, and frozen prixUnitaire for article lines -->
                    {{ formatCurrency(item.isParent ? item.montantTotalHT : (item.prixUnitaire * item.quantiteCommandee)) }}
                  </td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                    <div v-if="item.isParent" class="flex items-center justify-end gap-x-2">
                        <button :disabled="item.statut !== 'Enregistrée'" class="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent" title="Confirmer">
                          <CheckCircleIcon class="h-4 w-4" />
                        </button>
                        <button :disabled="item.statut !== 'Confirmée'" class="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent" title="Envoyer">
                          <PaperAirplaneIcon class="h-4 w-4" />
                        </button>
                    </div>
                  </td>
                </tr>
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
</template>