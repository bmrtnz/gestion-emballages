<script setup>
// Vue and composables
import { computed, watch } from "vue";

// Main orchestrator composable
import { useListeAchat } from "../composables/listeAchat/useListeAchat";

// UI Components
import Button from "../components/ui/Button.vue";
import Select from "../components/ui/Select.vue";
import Input from "../components/ui/Input.vue";
import ConfirmModal from "../components/ui/ConfirmModal.vue";

// Icons
import {
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";

// Utilisation du composable principal orchestrateur
const {
  // État et données
  activeListeAchat,
  availableArticles,
  isLoading,
  isSubmitting,
  selectedArticle,
  selectedSupplier,
  quantityToAdd,
  deliveryDate,
  articleSearchFilter,
  showConfirmModal,
  
  // Filtres de recherche
  selectedCategory,
  articleNameFilter,
  
  // Computed values
  totalAmount,
  permissions,
  uiBehavior,
  articleOptions,
  categoriesWithCount,
  filteredArticlesCount,
  suppliersForSelectedArticle,
  transformedListData,
  
  // Méthodes principales
  handleArticleSelect,
  handleAddToCart,
  handleRemoveFromCart,
  handleValidateList,
  handleSupplierSelect,
  handleQuantityChange,
  handleDeliveryDateChange,
  openConfirmModal,
  closeConfirmModal,
  getArticleDetails,
  getSupplierDetails,
  calculateItemTotal,
  
  // Formatters optimisés
  formatCurrency,
  formatNumber,
  
  // Propriétés UI
  isValidSelection,
  selectedTotal
} = useListeAchat();

// Gestionnaires d'événements locaux
const confirmAndValidateListe = () => {
  if (!activeListeAchat.value?.articles?.length) {
    return;
  }
  if (isValidationBlocked.value) {
    return;
  }
  openConfirmModal();
};

const handleConfirmValidation = () => {
  closeConfirmModal();
  handleValidateList();
};

const handleCancelValidation = () => {
  closeConfirmModal();
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

// Date coloring helper based on supplier's delay
const getDateColorClass = (dateString, item = null) => {
  if (!dateString) return 'text-gray-500';
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  // If we have item information, use the supplier's delay for calculations
  if (item) {
    const supplierDetails = getSupplierDetails(item.articleId, item.fournisseurId);
    const supplierDelay = supplierDetails?.delaiIndicatifApprovisionnement;
    
    if (supplierDelay) {
      // Calculate earliest possible delivery date using working days
      const earliestPossibleDate = addWorkingDays(today, supplierDelay);
      earliestPossibleDate.setHours(0, 0, 0, 0);
      
      if (date.getTime() < today.getTime()) {
        return 'text-red-600 font-semibold'; // Passed date
      } else if (date.getTime() < earliestPossibleDate.getTime()) {
        return 'text-amber-600 font-semibold'; // Before minimum delay
      } else {
        return 'text-gray-700'; // Compatible with delay
      }
    }
  }
  
  // Fallback to calendar days logic if no supplier delay info
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'text-red-600 font-semibold'; // Passed date
  } else if (diffDays < 5) {
    return 'text-amber-600 font-semibold'; // Less than 5 days
  } else {
    return 'text-gray-700'; // Normal
  }
};

// Check if any item has a passed delivery date or incompatible with supplier delay
const hasPassedDeliveryDate = computed(() => {
  if (!activeListeAchat.value?.articles?.length) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return activeListeAchat.value.articles.some(item => {
    if (!item.dateSouhaiteeLivraison) return false;
    
    const deliveryDate = new Date(item.dateSouhaiteeLivraison);
    deliveryDate.setHours(0, 0, 0, 0);
    
    // Check if date is in the past
    if (deliveryDate.getTime() < today.getTime()) {
      return true;
    }
    
    // Check if date is incompatible with supplier delay
    const supplierDetails = getSupplierDetails(item.articleId, item.fournisseurId);
    const supplierDelay = supplierDetails?.delaiIndicatifApprovisionnement;
    
    if (supplierDelay) {
      const earliestPossibleDate = addWorkingDays(today, supplierDelay);
      earliestPossibleDate.setHours(0, 0, 0, 0);
      return deliveryDate.getTime() < earliestPossibleDate.getTime();
    }
    
    return false;
  });
});

// Check if validation is blocked due to passed dates
const isValidationBlocked = computed(() => {
  return hasPassedDeliveryDate.value;
});

// Helper function to add working days to a date (excludes weekends)
const addWorkingDays = (startDate, workingDays) => {
  const date = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < workingDays) {
    date.setDate(date.getDate() + 1);
    // Check if it's not a weekend (0 = Sunday, 6 = Saturday)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      daysAdded++;
    }
  }
  
  return date;
};

// Helper function to count working days between two dates
const countWorkingDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    // Check if it's not a weekend (0 = Sunday, 6 = Saturday)
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

// French pluralization helper for conditioning types
const pluralizeFrench = (word, quantity) => {
  if (quantity <= 1) return word;
  
  const lowerWord = word.toLowerCase();
  
  // Words ending in "eau" or "au" take "x" for plural
  if (lowerWord.endsWith('eau') || lowerWord.endsWith('au')) {
    return word + 'x';
  }
  
  // Words ending in "s", "x", or "z" don't change
  if (lowerWord.endsWith('s') || lowerWord.endsWith('x') || lowerWord.endsWith('z')) {
    return word;
  }
  
  // Default case: add "s"
  return word + 's';
};

// Computed pour vérifier la compatibilité de la date de livraison avec le délai d'approvisionnement (jours ouvrés)
const deliveryDateCompatibility = computed(() => {
  if (!selectedSupplier.value || !deliveryDate.value || !selectedSupplier.value.delaiIndicatifApprovisionnement) {
    return { isCompatible: true, message: null, earliestDate: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const selectedDate = new Date(deliveryDate.value);
  selectedDate.setHours(0, 0, 0, 0);
  
  const delayWorkingDays = selectedSupplier.value.delaiIndicatifApprovisionnement;
  
  // Calculate the earliest possible date using working days
  const earliestPossibleDate = addWorkingDays(today, delayWorkingDays);
  earliestPossibleDate.setHours(0, 0, 0, 0);
  
  const isCompatible = selectedDate >= earliestPossibleDate;
  
  return {
    isCompatible,
    message: isCompatible ? null : `La date souhaitée est trop proche. Délai minimum : ${delayWorkingDays} jour${delayWorkingDays > 1 ? 's' : ''} ouvré${delayWorkingDays > 1 ? 's' : ''}`,
    earliestDate: earliestPossibleDate.toISOString().split('T')[0],
    delayDays: delayWorkingDays
  };
});

// Computed pour calculer la date de livraison par défaut basée sur le délai du fournisseur
const defaultDeliveryDate = computed(() => {
  if (!selectedSupplier.value?.delaiIndicatifApprovisionnement) {
    // Fallback: 7 jours ouvrés si pas de délai spécifié
    const fallbackDate = addWorkingDays(new Date(), 7);
    return fallbackDate;
  }
  
  const today = new Date();
  const supplierDelay = selectedSupplier.value.delaiIndicatifApprovisionnement;
  // Délai exact du fournisseur sans marge supplémentaire
  const defaultDate = addWorkingDays(today, supplierDelay);
  
  return defaultDate;
});

// Computed pour le message informatif sous le sélecteur de date
const deliveryDateMessage = computed(() => {
  if (!selectedSupplier.value?.delaiIndicatifApprovisionnement) {
    return "Si non spécifiée, la livraison sera prévue dans 7 jours ouvrés";
  }
  
  const supplierDelay = selectedSupplier.value.delaiIndicatifApprovisionnement;
  const defaultDate = defaultDeliveryDate.value;
  const formattedDate = formatDate(defaultDate.toISOString().split('T')[0]);
  
  return `Date suggérée : ${formattedDate} (délai fournisseur ${supplierDelay} jour${supplierDelay > 1 ? 's' : ''} ouvré${supplierDelay > 1 ? 's' : ''})`;
});

// Computed pour l'affichage des données de la liste
const displayData = computed(() => {
  return transformedListData.value || {
    displayTitle: 'Ma Liste d\'Achat',
    displaySubtitle: 'Gérer votre liste d\'achat et créez vos commandes fournisseurs.'
  };
});

// Watcher pour définir automatiquement la date de livraison par défaut quand un fournisseur est sélectionné
watch(selectedSupplier, (newSupplier) => {
  if (newSupplier && newSupplier.delaiIndicatifApprovisionnement) {
    // Calculer la date par défaut : délai fournisseur + 1 jour ouvré
    const defaultDate = defaultDeliveryDate.value;
    const defaultDateString = defaultDate.toISOString().split('T')[0];
    
    // Définir la date par défaut seulement si aucune date n'est déjà sélectionnée
    if (!deliveryDate.value) {
      handleDeliveryDateChange(defaultDateString);
    }
  }
}, { immediate: false });
</script>

<template>
  <div>
    <!-- Header Section -->
    <div class="sm:flex sm:items-center mb-8">
      <div class="sm:flex-auto">
        <h1 class="text-3xl font-bold text-gray-900">{{ displayData.displayTitle }}</h1>
        <p class="mt-1 text-sm text-gray-500">{{ displayData.displaySubtitle }}</p>
      </div>
    </div>

    <div class="content-layout">
      <!-- Left side: Cart Content -->
      <div class="cart-section">
        <div class="panel">
          <div class="panel-header">
            <div class="flex flex-col gap-2">
              <Button
                variant="primary"
                :loading="isSubmitting"
                @click="confirmAndValidateListe"
                :disabled="!permissions.canValidateList || !activeListeAchat?.articles?.length || isValidationBlocked"
              >
                {{ uiBehavior.messages?.validateButton || 'Valider la Liste et Commander' }}
              </Button>
              <div v-if="isValidationBlocked" class="text-sm text-red-600 font-medium">
                ⚠️ Impossible de valider : des dates de livraison sont incompatibles avec les délais d'approvisionnement
              </div>
            </div>
            <div class="total-amount">
              <span>Total HT</span>
              <strong>{{ formatCurrency(totalAmount) }}</strong>
            </div>
          </div>
          <div class="panel-body">
            <div v-if="!activeListeAchat?.articles?.length && !isLoading" class="empty-cart">
              <div class="empty-cart-icon">🛒</div>
              <p>{{ uiBehavior.messages?.emptyList || 'Votre liste est vide' }}</p>
              <small>{{ uiBehavior.messages?.emptyListSubtext || 'Sélectionnez des articles à droite pour les ajouter' }}</small>
            </div>
            
            <div v-else class="cart-items">
              <table class="cart-table bg-white text-sm">
                <thead class="border-b border-gray-200">
                  <tr>
                    <th class="text-left text-sm py-2 px-2 align-bottom">
                      <div>Livraison</div>
                      <div>souhaitée</div>
                    </th>
                    <th class="text-left text-sm py-2 px-2 align-bottom">Article</th>
                    <th class="text-right text-sm py-2 px-2 align-bottom">Qté</th>
                    <th class="text-left text-sm py-2 px-2 align-bottom">Cond.</th>
                    <th class="text-right text-sm py-2 px-2 align-bottom">P.U.</th>
                    <th class="text-right py-2 px-2 align-bottom">Total</th>
                    <th class="py-2 px-2 align-bottom"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in activeListeAchat?.articles" :key="item._id">
                    <td class="align-top py-2 px-2">
                      <div class="text-sm font-medium" :class="getDateColorClass(item.dateSouhaiteeLivraison, item)">
                        {{ item.dateSouhaiteeLivraison ? formatDate(item.dateSouhaiteeLivraison) : 'N/A' }}
                      </div>
                    </td>
                    <td class="align-top py-2 px-2">
                      <div class="text-sm font-bold text-primary-600">{{ getArticleDetails(item.articleId)?.designation }}</div>
                      <div class="text-xs text-gray-500">{{ getArticleDetails(item.articleId)?.codeArticle }}</div>
                      <div class="text-xs text-gray-500">
                        ({{ getSupplierDetails(item.articleId, item.fournisseurId)?.referenceFournisseur || 'N/A' }} - 
                        {{ getSupplierDetails(item.articleId, item.fournisseurId)?.fournisseurId?.nom }})
                      </div>
                    </td>
                    <td class="align-top text-right text-sm font-bold text-primary-600 py-2 px-2">{{ formatNumber(item.quantite) }}</td>
                    <td class="align-top py-2 px-2">
                      <div class="text-sm font-medium">
                        {{ pluralizeFrench(
                            getSupplierDetails(item.articleId, item.fournisseurId)?.uniteConditionnement || 
                            getSupplierDetails(item.articleId, item.fournisseurId)?.conditionnement || 
                            getArticleDetails(item.articleId)?.conditionnement || "unité",
                            item.quantite
                        ) }}
                      </div>
                      <div class="text-xs text-gray-500">
                        de {{ getSupplierDetails(item.articleId, item.fournisseurId)?.quantiteParConditionnement || 1 }} unités
                      </div>
                    </td>
                    <td class="align-top text-right py-2 px-2">
                      <div class="text-sm font-bold text-primary-600">
                        {{ formatCurrency((getSupplierDetails(item.articleId, item.fournisseurId)?.prixUnitaire || 0) * (getSupplierDetails(item.articleId, item.fournisseurId)?.quantiteParConditionnement || 1)) }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ formatCurrency(getSupplierDetails(item.articleId, item.fournisseurId)?.prixUnitaire || 0) }} / unité
                      </div>
                    </td>
                    <td class="align-top text-right font-bold text-primary-600 py-2 px-2">{{ formatCurrency(calculateItemTotal(item)) }}</td>
                    <td class="align-top text-right py-2 px-2">
                      <button
                        v-if="permissions.canRemoveItems"
                        @click="() => handleRemoveFromCart(item._id)"
                        class="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon class="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Article Selector -->
      <div class="selector-section">
        <div class="panel">
          <div class="panel-body">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-section">
              <div class="loading-spinner">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p>Chargement des articles...</p>
              </div>
            </div>

            <!-- Article Selection -->
            <div v-else class="article-selection-section">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Sélectionner un article</h4>
              <div class="article-selector space-y-4">
                <!-- Category and Search Filters on same line -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Category Filter -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                    <Select
                      v-model="selectedCategory"
                      :options="[
                        { value: '', label: `Toutes les catégories (${availableArticles?.length || 0})` },
                        ...categoriesWithCount,
                      ]"
                      placeholder="Choisir une catégorie"
                      class="w-full"
                      :disabled="isLoading || !availableArticles?.length"
                    />
                  </div>
                  
                  <!-- Search Filter -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
                    <input
                      v-model="articleNameFilter"
                      type="text"
                      placeholder="Rechercher par nom ou code article..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 placeholder-gray-400 text-sm"
                      :disabled="isLoading || !availableArticles?.length"
                    />
                  </div>
                </div>
                
                <!-- Article Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Article <span class="text-red-500">*</span>
                  </label>
                  <Select
                    :model-value="selectedArticle?._id || ''"
                    @update:model-value="handleArticleSelect"
                    :options="[{ value: '', label: 'Sélectionner un article' }, ...articleOptions]"
                    placeholder="Choisir l'article à ajouter"
                    class="w-full"
                    :disabled="!permissions.canAddItems || articleOptions.length === 0"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    {{ isLoading ? "Chargement..." : `${filteredArticlesCount} article(s) disponible(s)` }}
                  </p>
                </div>
                
                <!-- Selected Article Preview -->
                <div v-if="selectedArticle" class="selected-article-info p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                  <!-- First Column: Article Details -->
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="inline-block px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full">
                        {{ selectedArticle.categorie }}
                      </span>
                      <span class="text-sm font-medium text-blue-900">{{ selectedArticle.designation }}</span>
                    </div>
                    <p class="text-sm text-blue-600">{{ selectedArticle.codeArticle }}</p>
                  </div>
                  
                  <!-- Vertical Separator -->
                  <div class="mx-4 h-12 w-px bg-blue-200"></div>
                  
                  <!-- Second Column: Supplier Count -->
                  <div class="flex items-center">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-blue-700">{{ suppliersForSelectedArticle.length }}</div>
                      <div class="text-xs text-blue-600">fournisseur{{ suppliersForSelectedArticle.length > 1 ? 's' : '' }}</div>
                    </div>
                  </div>
                </div>
                
                <!-- Show message if no articles are available -->
                <div v-if="!availableArticles?.length && !isLoading" class="no-articles-message">
                  <p>Aucun article disponible. Veuillez contacter l'administrateur.</p>
                </div>
              </div>
            </div>

            <!-- Suppliers for Selected Article -->
            <div v-if="selectedArticle" class="suppliers-section">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Sélectionner le Fournisseur</h4>
              <div class="suppliers-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="supplier in suppliersForSelectedArticle"
                  :key="supplier.fournisseurId._id"
                  :class="[
                    'supplier-card p-4 border rounded-lg cursor-pointer transition-all duration-200',
                    selectedSupplier?.fournisseurId._id === supplier.fournisseurId._id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                  @click="handleSupplierSelect(supplier)"
                >
                  <!-- Supplier Name -->
                  <div class="font-medium text-gray-900 mb-2 truncate">
                    {{ supplier.fournisseurId.nom }}
                  </div>
                  
                  <!-- Conditioning Price (highlighted) -->
                  <div class="text-lg font-bold text-primary-600 mb-2">
                    {{ formatCurrency(supplier.totalPrice) }}
                  </div>
                  
                  <!-- Units per conditioning -->
                  <div class="text-sm text-gray-600 mb-1">
                    {{ formatNumber(supplier.quantiteParConditionnement) }} unités par {{ supplier.uniteConditionnement || supplier.conditionnement || 'unité' }}
                  </div>
                  
                  <!-- Unit price -->
                  <div class="text-xs text-gray-500">
                    Prix unitaire: {{ formatCurrency(supplier.prixUnitaire) }}
                  </div>
                  
                  <!-- Supply delay -->
                  <div v-if="supplier.delaiIndicatifApprovisionnement" class="text-xs text-gray-500 mt-1">
                    Délai: {{ supplier.delaiIndicatifApprovisionnement }} jour{{ supplier.delaiIndicatifApprovisionnement > 1 ? 's' : '' }}
                  </div>
                </div>
              </div>

              <!-- Add to Cart Section -->
              <div v-if="selectedSupplier" class="add-to-cart-section">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">Entrer la quantité à commander</h4>
                <div class="add-to-cart-form">
                  <!-- Quantity and Total Row -->
                  <div class="quantity-row flex items-center gap-4 mb-4">
                    <div class="flex items-center gap-2">
                      <div class="flex flex-col">
                        <label class="text-sm font-medium text-gray-700">
                          Quantité
                        </label>
                        <span class="text-xs text-gray-500">
                          ({{ selectedSupplier.uniteConditionnement || selectedSupplier.conditionnement || 'unité' }})
                        </span>
                      </div>
                      <input
                        :value="quantityToAdd.toString()"
                        @input="handleQuantityChange($event.target.value)"
                        type="number"
                        :placeholder="uiBehavior.defaultQuantity?.toString() || '1'"
                        :max="uiBehavior.maxQuantityPerItem || 9999"
                        class="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div class="flex-1 text-right flex items-center justify-end gap-2">
                      <span class="text-sm text-gray-600">Total calculé:</span>
                      <span class="text-lg font-bold text-primary-600">
                        {{ formatCurrency(selectedTotal) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Delivery Date Field -->
                  <div class="delivery-date-row mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Date de livraison souhaitée
                    </label>
                    <input
                      :value="deliveryDate"
                      @input="handleDeliveryDateChange($event.target.value)"
                      type="date"
                      class="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      :min="new Date().toISOString().split('T')[0]"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                      {{ deliveryDateMessage }}
                    </p>
                    
                    <!-- Delivery Date Compatibility Warning -->
                    <div v-if="!deliveryDateCompatibility.isCompatible" class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                      <ExclamationTriangleIcon class="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div class="flex-1">
                        <p class="text-sm font-medium text-amber-800 mb-1">
                          Date de livraison incompatible
                        </p>
                        <p class="text-xs text-amber-700">
                          {{ deliveryDateCompatibility.message }}
                        </p>
                        <p class="text-xs text-amber-600 mt-1">
                          Date la plus proche possible : {{ formatDate(deliveryDateCompatibility.earliestDate) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    @click="handleAddToCart"
                    :disabled="!isValidSelection || !permissions.canAddItems"
                    class="w-full"
                  >
                    {{ uiBehavior.messages?.addToCartButton || 'Ajouter à la liste' }}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirmation Modal -->
  <ConfirmModal
    :open="showConfirmModal"
    title="Êtes-vous sûr de vouloir valider cette liste ?"
    message="Cette action créera les commandes fournisseurs correspondantes et la liste sera marquée comme traitée."
    confirm-text="Oui, valider et commander"
    cancel-text="Annuler"
    @confirm="handleConfirmValidation"
    @cancel="handleCancelValidation"
  />
</template>

<style scoped>
.content-layout {
  @apply grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6 min-h-[calc(100vh-300px)];
}

.panel {
  @apply bg-white rounded-2xl shadow-soft flex flex-col h-full;
}

/* Old book page background for cart section */
.paper-background {
  background-color: #fefcf0;
}

.panel-header {
  @apply p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0;
}

.panel-header h3 {
  @apply m-0 text-lg font-semibold text-gray-900;
}

.panel-body {
  @apply p-6 flex-1 overflow-y-auto;
}

/* Panel without header needs full padding */
.selector-section .panel .panel-body {
  @apply p-6;
}

.total-amount {
  @apply text-right;
}

.total-amount span {
  @apply block text-xs text-gray-500;
}

.total-amount strong {
  @apply text-xl text-primary-600 font-bold;
}

/* Cart Section */
.empty-cart {
  @apply text-center py-16 px-5 text-gray-400;
}

.empty-cart-icon {
  @apply text-5xl mb-4;
}

.cart-items {
  @apply flex flex-col gap-4;
}

.cart-item {
  @apply border border-gray-100 rounded-2xl p-4 flex justify-between items-start transition-all duration-200 hover:shadow-medium;
}

.cart-item-content {
  @apply flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4;
}

.item-info .item-code {
  @apply font-semibold text-gray-900 mb-1;
}

.item-info .item-designation {
  @apply text-gray-600 mb-2;
}

.item-info .item-supplier {
  @apply text-xs text-gray-400;
}

.item-quantities, .item-pricing {
  @apply flex flex-col gap-2;
}

.item-quantities .label, .item-pricing .label {
  @apply text-xs text-gray-400 font-medium;
}

.item-quantities .value, .item-pricing .value {
  @apply font-medium text-gray-900;
}

.item-pricing .value.total {
  @apply text-primary-600 font-semibold text-base;
}

.cart-item-actions {
  @apply ml-4;
}

/* Selector Section */
.loading-section {
  @apply flex justify-center items-center py-16 px-5;
}

.loading-spinner {
  @apply flex flex-col items-center gap-4;
}

.loading-spinner p {
  @apply text-gray-400 m-0;
}

.article-selection-section {
  @apply mb-6 pb-6 border-b border-gray-100;
}

.article-selector {
  @apply space-y-3;
}

.no-articles-message {
  @apply mt-4 p-4 bg-warning-50 border border-warning-200 rounded-2xl text-center;
}

.no-articles-message p {
  @apply m-0 text-warning-700 text-sm;
}

.selected-article-info {
  /* Styling handled by inline classes */
}

.article-details {
  @apply flex flex-col gap-1 mb-2;
}

.article-details .article-code {
  @apply font-semibold text-gray-900 text-base;
}

.article-details .article-designation {
  @apply text-gray-600 text-sm;
}

.article-details .article-category {
  @apply text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded-full inline-block w-fit;
}

.suppliers-info {
  @apply text-xs text-success-600 font-medium;
}

.suppliers-section h4, .add-to-cart-section h4 {
  @apply m-0 mb-4 text-base font-semibold text-gray-900;
}

/* Supplier grid layout */
.suppliers-grid {
  @apply mt-4;
}

.supplier-card {
  @apply hover:shadow-sm;
}

.add-to-cart-section {
  @apply mt-6 pt-6 border-t border-gray-100;
}

.add-to-cart-form {
  @apply flex flex-col gap-4;
}

.calculated-total {
  @apply flex justify-between items-center p-4 bg-success-50 border border-success-200 rounded-2xl;
}

.calculated-total .label {
  @apply font-medium text-gray-900;
}

.calculated-total .value {
  @apply font-semibold text-base text-success-600;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-layout {
    @apply grid-cols-1 gap-4;
  }
  
  .cart-item-content {
    @apply grid-cols-1 gap-3;
  }
}
</style>