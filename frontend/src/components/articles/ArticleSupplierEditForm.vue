<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useFormValidation, commonValidationRules } from '../../composables/useFormValidation';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useLoading } from '../../composables/useLoading';
import { message } from 'ant-design-vue';
import Button from '../ui/Button.vue';
import api from '../../api/axios';

const props = defineProps({
  articleId: {
    type: String,
    required: true
  },
  supplierId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['updated', 'close']);

// State
const supplierData = ref(null);
const articleData = ref(null);
const isDataLoading = ref(false);

// Form validation
const { formData, validateForm, resetForm, getFieldMessage } = useFormValidation(
  {
    prixUnitaire: 0,
    referenceFournisseur: '',
    uniteConditionnement: '',
    quantiteParConditionnement: 1
  },
  {
    prixUnitaire: commonValidationRules.prix,
    referenceFournisseur: [
      (value) => value && value.length > 50 ? 'Maximum 50 caractères' : null
    ],
    uniteConditionnement: [
      (value) => !value || !value.trim() ? 'Unité de conditionnement requise' : null,
      (value) => value && value.length > 30 ? 'Maximum 30 caractères' : null
    ],
    quantiteParConditionnement: [
      (value) => !value || value <= 0 ? 'La quantité doit être supérieure à 0' : null
    ]
  }
);

// Loading and error handling
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Load supplier data
const loadSupplierData = async () => {
  isDataLoading.value = true;
  try {
    const response = await withErrorHandling(
      () => api.get(`/articles/${props.articleId}`),
      'Erreur lors du chargement des données'
    );
    
    const article = response.data;
    const supplier = article.fournisseurs?.find(f => f._id === props.supplierId);
    
    if (supplier) {
      articleData.value = article;
      supplierData.value = supplier;
      
      // Populate form with current data
      formData.prixUnitaire = supplier.prixUnitaire || 0;
      formData.referenceFournisseur = supplier.referenceFournisseur || '';
      formData.uniteConditionnement = supplier.uniteConditionnement || '';
      formData.quantiteParConditionnement = supplier.quantiteParConditionnement || 1;
    }
  } catch (error) {
    console.error('Error loading supplier data:', error);
    message.error('Impossible de charger les données du fournisseur');
  } finally {
    isDataLoading.value = false;
  }
};

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  await execute(async () => {
    await withErrorHandling(
      () => api.put(`/articles/${props.articleId}/fournisseurs/${props.supplierId}`, formData),
      'Erreur lors de la modification du fournisseur'
    );
    
    message.success('Fournisseur modifié avec succès');
    emit('updated');
    emit('close');
  });
};

const handleCancel = () => {
  resetForm();
  emit('close');
};

// Load data on mount
onMounted(loadSupplierData);
</script>

<template>
  <div class="space-y-6">
    <div v-if="isDataLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else-if="supplierData && articleData" class="space-y-6">
      <!-- Article and Supplier info -->
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-sm text-gray-600">
          {{ articleData.designation }} ({{ articleData.codeArticle }})
        </p>
        <h3 class="text-lg font-medium text-gray-900 mt-1">
          {{ supplierData.fournisseurId?.nom || 'Fournisseur inconnu' }}
        </h3>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <div>
          <label for="referenceFournisseur" class="block text-sm font-medium text-gray-700">
            Référence Fournisseur
          </label>
          <input 
            type="text" 
            v-model="formData.referenceFournisseur" 
            id="referenceFournisseur" 
            name="referenceFournisseur"
            placeholder="Référence optionnelle"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
          />
          <p v-if="getFieldMessage('referenceFournisseur')" class="mt-1 text-sm text-red-600">
            {{ getFieldMessage('referenceFournisseur') }}
          </p>
        </div>
        
        <div>
          <label for="uniteConditionnement" class="block text-sm font-medium text-gray-700">
            Unité de Conditionnement <span class="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            v-model="formData.uniteConditionnement" 
            id="uniteConditionnement" 
            name="uniteConditionnement"
            placeholder="Ex: carton, palette, kg"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            required
          />
          <p v-if="getFieldMessage('uniteConditionnement')" class="mt-1 text-sm text-red-600">
            {{ getFieldMessage('uniteConditionnement') }}
          </p>
        </div>
        
        <div>
          <label for="quantiteParConditionnement" class="block text-sm font-medium text-gray-700">
            Quantité par Conditionnement <span class="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            v-model="formData.quantiteParConditionnement" 
            id="quantiteParConditionnement" 
            name="quantiteParConditionnement"
            min="1"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            required
          />
          <p v-if="getFieldMessage('quantiteParConditionnement')" class="mt-1 text-sm text-red-600">
            {{ getFieldMessage('quantiteParConditionnement') }}
          </p>
        </div>
        
        <div>
          <label for="prixUnitaire" class="block text-sm font-medium text-gray-700">
            Prix Unitaire (€) <span class="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            v-model="formData.prixUnitaire" 
            id="prixUnitaire" 
            name="prixUnitaire"
            step="0.01"
            min="0"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            required
          />
          <p v-if="getFieldMessage('prixUnitaire')" class="mt-1 text-sm text-red-600">
            {{ getFieldMessage('prixUnitaire') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end space-x-3 pt-6 border-t">
      <Button variant="secondary" @click="handleCancel">
        Annuler
      </Button>
      <Button 
        variant="primary" 
        @click="handleSubmit" 
        :loading="isLoading"
        :disabled="isDataLoading"
      >
        Modifier
      </Button>
    </div>
  </div>
</template>