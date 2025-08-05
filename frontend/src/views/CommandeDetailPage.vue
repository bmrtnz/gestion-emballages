<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLoading } from '../composables/useLoading';
import { useErrorHandler } from '../composables/useErrorHandler';
import { ArrowLeftIcon, DocumentIcon, DocumentCheckIcon, TruckIcon, ArrowDownOnSquareIcon, CircleStackIcon, DocumentCurrencyEuroIcon, ArchiveBoxIcon } from '@heroicons/vue/24/outline';
import WorkflowStateFlow from '../components/ui/WorkflowStateFlow.vue';
import { getStatusTagColor } from "../utils/statusUtils";
import api from "../api/axios";
import { useAuthStore } from "../stores/authStore";
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const commande = ref(null);

// Loading and error handling
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Computed properties
const formatCurrency = (number) => {
  if (typeof number !== "number") return "0,00 €";
  return new Intl.NumberFormat("fr-FR", { style: 'currency', currency: 'EUR' }).format(number);
};

const formatDate = (dateString) => {
  if (!dateString) return "Non définie";
  return dayjs(dateString).format('DD/MM/YYYY à HH:mm');
};

const formatAddress = (adresse) => {
  if (!adresse) return "Adresse non renseignée";
  const parts = [];
  if (adresse.rue) parts.push(adresse.rue);
  if (adresse.codePostal) parts.push(adresse.codePostal);
  if (adresse.ville) parts.push(adresse.ville);
  return parts.join(', ') || "Adresse non renseignée";
};

// Get icon for status (same as WorkflowStateFlow component)
const getStatusIcon = (status) => {
  const statusIcons = {
    'Enregistrée': DocumentIcon,
    'Confirmée': DocumentCheckIcon,
    'Expédiée': TruckIcon,
    'Réceptionnée': ArrowDownOnSquareIcon,
    'Clôturée': CircleStackIcon,
    'Facturée': DocumentCurrencyEuroIcon,
    'Archivée': ArchiveBoxIcon
  };
  return statusIcons[status] || DocumentIcon;
};

const principalSite = computed(() => {
  if (!commande.value?.fournisseurId?.sites) return null;
  return (
    commande.value.fournisseurId.sites.find((s) => s.estPrincipal) ||
    commande.value.fournisseurId.sites[0]
  );
});

const fetchCommandeDetails = async () => {
  const commandeId = route.params.id;
  await execute(async () => {
    const response = await withErrorHandling(
      () => api.get(`/commandes/${commandeId}`),
      'Erreur lors du chargement du détail de la commande'
    );
    commande.value = response.data;
  });
};


const goBack = () => {
  router.push('/commandes');
};

onMounted(fetchCommandeDetails);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button 
          @click="goBack"
          class="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeftIcon class="h-4 w-4 mr-2" />
          Retour aux commandes
        </button>
        <div class="h-6 border-l border-gray-300"></div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ commande?.numeroCommande || 'Chargement...' }}
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            Détail de la commande
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Content -->
    <div v-else-if="commande" class="space-y-6">

      <!-- Workflow State Flow -->
      <div class="pt-8">
        <WorkflowStateFlow 
          :current-status="commande?.statut" 
          workflow-type="commande" 
        />
      </div>

      <!-- Information Blocks Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- General Information -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">N° Commande</label>
              <p class="text-sm text-gray-900">{{ commande.numeroCommande }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
              <p class="text-sm text-gray-900">{{ formatDate(commande.createdAt) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Statut</label>
              <div class="flex items-center">
                <component 
                  :is="getStatusIcon(commande.statut)" 
                  class="h-4 w-4 mr-2 text-primary-600" 
                />
                <span class="text-sm font-medium text-primary-600">
                  {{ commande.statut }}
                </span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Montant Total HT</label>
              <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(commande.montantTotalHT) }}</p>
            </div>
          </div>
        </div>

        <!-- Supplier Information -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Fournisseur</h2>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Fournisseur</label>
              <p class="text-sm text-primary-600 font-medium">
                {{ commande.fournisseurId?.nom || 'Non renseigné' }}
              </p>
              <p class="text-sm text-gray-900" v-if="principalSite?.adresse">{{ formatAddress(principalSite.adresse) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Station</label>
              <p class="text-sm text-primary-600 font-medium">
                {{ commande.stationId?.nom || 'Non renseigné' }}
              </p>
              <p class="text-sm text-gray-900" v-if="commande.stationId?.adresse">{{ formatAddress(commande.stationId.adresse) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Articles Section -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Articles commandés</h2>
          <div class="text-right">
            <div class="text-xl font-bold text-primary-600">{{ formatCurrency(commande.montantTotalHT) }}</div>
            <div class="text-xs text-gray-500">Total HT</div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" class="px-6 py-2.5 text-left text-sm font-semibold text-gray-900">Article</th>
                <th scope="col" class="px-6 py-2.5 text-left text-sm font-semibold text-gray-900">Réf. Fournisseur</th>
                <th scope="col" class="px-6 py-2.5 text-left text-sm font-semibold text-gray-900">Quantité</th>
                <th scope="col" class="px-6 py-2.5 text-right text-sm font-semibold text-gray-900">Montant HT</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="article in commande.articles" :key="article._id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ article.articleId?.designation || 'Article inconnu' }}</div>
                  <div class="text-xs text-gray-500">{{ article.articleId?.codeArticle || 'Code non disponible' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">Réf. fournisseur</div>
                  <div class="text-xs text-gray-500">{{ article.referenceFournisseur || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ article.quantiteCommandee || 0 }}
                    <span v-if="article.uniteConditionnement">
                      {{ article.quantiteCommandee > 1 ? (article.uniteConditionnement + 's') : article.uniteConditionnement }}
                      <span v-if="article.quantiteParConditionnement"> de {{ article.quantiteParConditionnement }}</span>
                    </span>
                    <span v-else>
                      pièce{{ article.quantiteCommandee > 1 ? 's' : '' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="text-sm font-semibold text-gray-900">
                    {{ formatCurrency((article.quantiteCommandee || 0) * (article.prixUnitaire || 0) * (article.quantiteParConditionnement || 1)) }}
                  </div>
                  <div class="text-xs text-gray-500">{{ formatCurrency(article.prixUnitaire) }} unitaire</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">Commande non trouvée</p>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
}
.page-header-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
.back-button {
  font-size: 1.2rem;
}
.page-header h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
}
.order-document {
  background: #fff;
  padding: 2rem 3rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow-color);
  max-width: 1000px;
  margin: auto;
}
.document-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}
.header-left h2 {
  margin: 0;
  font-size: 1.75rem;
}
.meta-info {
  margin-top: 8px;
  color: var(--text-color-light);
}
.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.status-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.status-tag span {
  color: var(--text-color-light);
}
.header-actions {
  margin-top: 1rem;
}
.info-section {
  margin: 2rem 0;
}
.info-section h4 {
  font-weight: 500;
  color: var(--text-color-light);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.totals-section {
  margin-top: 2rem;
}
.total-line {
  padding: 0.5rem 0;
}
.total-value {
  text-align: right;
  font-weight: 500;
  font-size: 1.1rem;
}
</style>
