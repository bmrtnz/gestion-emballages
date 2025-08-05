<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLoading } from '../composables/useLoading';
import { useErrorHandler } from '../composables/useErrorHandler';
import { ArrowLeftIcon, BuildingStorefrontIcon, DocumentTextIcon, CalendarDaysIcon, CreditCardIcon, DocumentIcon, DocumentCheckIcon, TruckIcon, ArrowDownOnSquareIcon, CircleStackIcon, DocumentCurrencyEuroIcon, ArchiveBoxIcon } from '@heroicons/vue/24/outline';
import WorkflowStateFlow from '../components/ui/WorkflowStateFlow.vue';
import { getStatusTagColor } from "../utils/statusUtils";
import api from '../api/axios';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();

// State
const commandeGlobale = ref(null);

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

// Summary calculations
const summaryData = computed(() => {
  if (!commandeGlobale.value) return null;
  
  const commandes = commandeGlobale.value.commandesFournisseurs || [];
  const totalSuppliers = commandes.length;
  const totalAmount = commandeGlobale.value.montantTotalHT || 0;
  
  // Count articles across all supplier orders
  const totalArticles = commandes.reduce((sum, cmd) => {
    return sum + (cmd.articles?.length || 0);
  }, 0);
  
  // Count quantities across all articles
  const totalQuantity = commandes.reduce((sum, cmd) => {
    return sum + (cmd.articles?.reduce((artSum, art) => artSum + (art.quantite || 0), 0) || 0);
  }, 0);
  
  return {
    totalSuppliers,
    totalArticles,
    totalQuantity,
    totalAmount
  };
});

// Creator information - the backend now guarantees this will be an object
const creatorInfo = computed(() => {
  if (!commandeGlobale.value?.creeParId) {
    return {
      name: 'Non renseigné',
      email: 'Non renseigné'
    };
  }
  
  const creator = commandeGlobale.value.creeParId;
  
  return {
    name: creator.nomComplet || 'Non renseigné',
    email: creator.email || 'Non renseigné'
  };
});

// Fetch data
const fetchCommandeGlobale = async () => {
  const id = route.params.id;
  await execute(async () => {
    const response = await withErrorHandling(
      () => api.get(`/commandes-globales/${id}`),
      'Erreur lors du chargement de la commande globale'
    );
    commandeGlobale.value = response.data;
  });
};

const goBack = () => {
  router.push('/commandes');
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

onMounted(fetchCommandeGlobale);
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
            {{ commandeGlobale?.referenceGlobale || 'Chargement...' }}
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            Détail de la commande globale
          </p>
        </div>
      </div>
      
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Content -->
    <div v-else-if="commandeGlobale" class="space-y-6">

      <!-- Workflow State Flow -->
      <div class="pt-8">
        <WorkflowStateFlow 
          :current-status="commandeGlobale?.statutGeneral" 
          workflow-type="commande"
          :created-at="commandeGlobale?.createdAt"
        />
      </div>

      <!-- Information Blocks Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- General Information -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Référence globale</label>
              <p class="text-sm text-gray-900">{{ commandeGlobale.referenceGlobale }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
              <p class="text-sm text-gray-900">{{ formatDate(commandeGlobale.createdAt) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Créé par</label>
              <p class="text-sm text-gray-900">{{ creatorInfo.name }}</p>
              <p class="text-xs text-gray-500">{{ creatorInfo.email }}</p>
            </div>
          </div>
        </div>

        <!-- Station Information -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Commanditaire</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Station</label>
              <p class="text-sm text-primary-600 font-medium">
                {{ commandeGlobale.stationId?.nom || 'Non renseigné' }}
                <span v-if="commandeGlobale.stationId?.identifiantInterne" class="text-xs text-gray-500 font-normal">
                  ({{ commandeGlobale.stationId.identifiantInterne }})
                </span>
              </p>
              <p class="text-sm text-gray-900">{{ formatAddress(commandeGlobale.stationId?.adresse) }}</p>
            </div>
            <div v-if="commandeGlobale.stationId?.contactPrincipal">
              <label class="block text-sm font-medium text-gray-500 mb-1">Contact principal</label>
              <p class="text-sm text-gray-900">{{ commandeGlobale.stationId.contactPrincipal.nom }}</p>
              <p class="text-xs text-gray-500">{{ commandeGlobale.stationId.contactPrincipal.email }}</p>
              <p v-if="commandeGlobale.stationId.contactPrincipal.telephone" class="text-xs text-gray-500">
                {{ commandeGlobale.stationId.contactPrincipal.telephone }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Supplier Orders Section -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Commandes fournisseurs</h2>
          <div class="text-right">
            <div class="text-xl font-bold text-primary-600">{{ formatCurrency(summaryData?.totalAmount || 0) }}</div>
            <div class="text-xs text-gray-500">Total HT</div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" class="px-6 py-2.5 text-left text-sm font-semibold text-gray-900">N° Commande</th>
                <th scope="col" class="px-6 py-2.5 text-left text-sm font-semibold text-gray-900">Fournisseur</th>
                <th scope="col" class="px-6 py-2.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th scope="col" class="px-6 py-2.5 text-right text-sm font-semibold text-gray-900">Montant HT</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-for="commande in commandeGlobale.commandesFournisseurs" :key="commande._id">
                <!-- Supplier main row -->
                <tr class="bg-gray-50 hover:bg-gray-100">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ commande.numeroCommande }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-primary-600">{{ commande.fournisseurId?.nom || 'Fournisseur inconnu' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <component 
                        :is="getStatusIcon(commande.statut)" 
                        class="h-4 w-4 mr-2 text-primary-600" 
                      />
                      <span class="text-sm font-medium text-primary-600">
                        {{ commande.statut }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="text-sm font-semibold text-gray-900">{{ formatCurrency(commande.montantTotalHT) }}</div>
                  </td>
                </tr>
                
                <!-- Articles sub-rows -->
                <template v-if="commande.articles && commande.articles.length > 0">
                  <tr 
                    v-for="article in commande.articles" 
                    :key="article._id"
                  >
                    <td class="px-6 py-2 whitespace-nowrap">
                      <div class="pl-8">
                        <div class="text-sm text-gray-900">{{ article.articleId?.designation || 'Article inconnu' }}</div>
                        <div class="text-xs text-gray-500">{{ article.articleId?.codeArticle || 'Code non disponible' }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-2 whitespace-nowrap">
                      <div class="text-sm text-gray-900">Réf. fournisseur</div>
                      <div class="text-xs text-gray-500">{{ article.referenceFournisseur || '-' }}</div>
                    </td>
                    <td class="px-6 py-2 whitespace-nowrap">
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
                    <td class="px-6 py-2 whitespace-nowrap text-right">
                      <div class="text-sm font-semibold text-gray-900">
                        {{ formatCurrency((article.quantiteCommandee || 0) * (article.prixUnitaire || 0) * (article.quantiteParConditionnement || 1)) }}
                      </div>
                      <div class="text-xs text-gray-500">{{ formatCurrency(article.prixUnitaire) }} unitaire</div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">Commande globale non trouvée</p>
    </div>
  </div>
</template>