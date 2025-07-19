<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { PlusIcon } from '@heroicons/vue/24/outline';
import { useFormValidation, commonValidationRules } from '../../composables/useFormValidation';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useLoading } from '../../composables/useLoading';
import { message } from 'ant-design-vue';
import FormGroup from '../forms/FormGroup.vue';
import Select from '../ui/Select.vue';
import Button from '../ui/Button.vue';
import api from '../../api/axios';

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['updated', 'close']);

// State
const availableSuppliers = ref([]);

// Chargement des fournisseurs
const { isLoading: suppliersLoading, execute: executeSuppliers } = useLoading();
const { withErrorHandling } = useErrorHandler();

const fetchSuppliers = async () => {
  await executeSuppliers(async () => {
    const response = await withErrorHandling(
      () => api.get('/fournisseurs', { 
        params: { 
          status: 'active',
          limit: 1000 // Get all active suppliers
        } 
      }),
      'Impossible de charger la liste des fournisseurs'
    );
    // Extract data from paginated response
    availableSuppliers.value = response.data.data || [];
  });
};

// Formulaire d'ajout de fournisseur
const { formData: addForm, validateForm: validateAddForm, resetForm: resetAddForm, getFieldMessage: getAddFieldMessage } = useFormValidation(
  {
    fournisseurId: null,
    prixUnitaire: 0,
    referenceFournisseur: '',
    uniteConditionnement: '',
    quantiteParConditionnement: 1
  },
  {
    fournisseurId: [
      (value) => !value ? 'Fournisseur requis' : null
    ],
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


// Fournisseurs disponibles pour liaison (non encore liés)
const availableSuppliersToLink = computed(() => {
  if (!props.article || !availableSuppliers.value || !Array.isArray(availableSuppliers.value)) return [];
  const linkedSupplierIds = props.article.fournisseurs?.map(f => f.fournisseurId?._id) || [];
  return availableSuppliers.value
    .filter(s => s.isActive && !linkedSupplierIds.includes(s._id))
    .map(s => ({ value: s._id, label: s.nom }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

// Helper function to format conditionnement (same as in ArticleList)
const formatConditionnement = (supplier) => {
  if (!supplier.quantiteParConditionnement || !supplier.uniteConditionnement) {
    return supplier.uniteConditionnement || '';
  }
  
  const quantity = supplier.quantiteParConditionnement;
  const unit = supplier.uniteConditionnement;
  
  // Special case for 'Unité'
  if (unit === 'Unité') {
    return `${quantity} par ${unit}`;
  }
  
  // Handle pluralization of 'unités'
  const unitText = quantity === 1 ? 'unité' : 'unités';
  return `${quantity} ${unitText} par ${unit}`;
};

// Actions
const { isLoading: actionLoading, execute: executeAction } = useLoading();

const handleAddSupplierLink = async () => {
  if (!validateAddForm()) {
    message.warning('Veuillez corriger les erreurs du formulaire');
    return;
  }

  await executeAction(async () => {
    await withErrorHandling(
      () => api.post(`/articles/${props.article._id}/fournisseurs`, addForm),
      'Erreur lors de la liaison'
    );
    
    message.success('Fournisseur lié avec succès.');
    resetAddForm();
    emit('updated');
  });
};


onMounted(fetchSuppliers);
</script>

<template>
  <div class="space-y-6">
    <!-- Fournisseurs associés -->
    <FormGroup title="Fournisseurs associés" variant="bordered">
      <div v-if="!article?.fournisseurs?.length" class="text-center py-8 text-gray-500">
        Aucun fournisseur n'est encore lié à cet article.
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="item in article.fournisseurs"
          :key="item._id"
          class="py-3 border-b border-gray-200 last:border-b-0"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">
                {{ item.fournisseurId?.nom || 'Fournisseur introuvable' }}
              </p>
              <div class="flex items-center space-x-4 mt-1">
                <span class="text-sm text-gray-500">
                  Prix: {{ item.prixUnitaire }} €
                </span>
                <span class="text-sm text-gray-500">
                  Réf: {{ item.referenceFournisseur || 'N/A' }}
                </span>
                <span class="text-sm text-gray-500">
                  {{ formatConditionnement(item) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormGroup>

    <!-- Lier un nouveau fournisseur -->
    <FormGroup title="Lier un nouveau fournisseur" variant="bordered">
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Fournisseur <span class="text-red-500">*</span>
          </label>
          <Select
            :model-value="addForm.fournisseurId"
            :options="availableSuppliersToLink"
            placeholder="Sélectionner un fournisseur"
            :loading="suppliersLoading"
            :error="getAddFieldMessage('fournisseurId')"
            @update:model-value="value => addForm.fournisseurId = value"
          />
        </div>
        
        <div>
          <label for="referenceFournisseur" class="block text-sm font-medium text-gray-700">
            Référence Fournisseur
          </label>
          <input 
            type="text" 
            v-model="addForm.referenceFournisseur" 
            id="referenceFournisseur" 
            name="referenceFournisseur"
            placeholder="Référence optionnelle"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
          />
          <p v-if="getAddFieldMessage('referenceFournisseur')" class="mt-1 text-sm text-red-600">
            {{ getAddFieldMessage('referenceFournisseur') }}
          </p>
        </div>
        
        <div>
          <label for="uniteConditionnement" class="block text-sm font-medium text-gray-700">
            Unité de Conditionnement <span class="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            v-model="addForm.uniteConditionnement" 
            id="uniteConditionnement" 
            name="uniteConditionnement"
            placeholder="Ex: carton, palette, kg"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            required
          />
          <p v-if="getAddFieldMessage('uniteConditionnement')" class="mt-1 text-sm text-red-600">
            {{ getAddFieldMessage('uniteConditionnement') }}
          </p>
        </div>
        
        <div>
          <label for="quantiteParConditionnement" class="block text-sm font-medium text-gray-700">
            Quantité par Conditionnement <span class="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            v-model="addForm.quantiteParConditionnement" 
            id="quantiteParConditionnement" 
            name="quantiteParConditionnement"
            min="1"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            required
          />
          <p v-if="getAddFieldMessage('quantiteParConditionnement')" class="mt-1 text-sm text-red-600">
            {{ getAddFieldMessage('quantiteParConditionnement') }}
          </p>
        </div>
        
        <div>
          <label for="prixUnitaire" class="block text-sm font-medium text-gray-700">
            Prix Unitaire (€) <span class="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            v-model="addForm.prixUnitaire" 
            id="prixUnitaire" 
            name="prixUnitaire"
            step="0.01"
            min="0"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            required
          />
          <p v-if="getAddFieldMessage('prixUnitaire')" class="mt-1 text-sm text-red-600">
            {{ getAddFieldMessage('prixUnitaire') }}
          </p>
        </div>
        
        <Button 
          variant="primary" 
          @click="handleAddSupplierLink"
          :loading="actionLoading"
          :disabled="!availableSuppliersToLink.length"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Ajouter ce fournisseur
        </Button>
      </div>
    </FormGroup>


    <!-- Footer -->
    <div class="flex justify-end pt-6 border-t">
      <Button variant="secondary" @click="emit('close')">
        Fermer
      </Button>
    </div>
  </div>
</template>