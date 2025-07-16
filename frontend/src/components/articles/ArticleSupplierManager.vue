<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { TrashIcon, PencilSquareIcon, PlusIcon } from '@heroicons/vue/24/outline';
import { useFormValidation, commonValidationRules } from '../../composables/useFormValidation';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useLoading } from '../../composables/useLoading';
import { message } from 'ant-design-vue';
import FormField from '../forms/FormField.vue';
import FormGroup from '../forms/FormGroup.vue';
import Select from '../ui/Select.vue';
import Button from '../ui/Button.vue';
import Card from '../ui/Card.vue';
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
const isEditModalVisible = ref(false);
const editingSupplierLink = ref(null);

// Chargement des fournisseurs
const { isLoading: suppliersLoading, execute: executeSuppliers } = useLoading();
const { withErrorHandling } = useErrorHandler();

const fetchSuppliers = async () => {
  await executeSuppliers(async () => {
    const response = await withErrorHandling(
      () => api.get('/fournisseurs'),
      'Impossible de charger la liste des fournisseurs'
    );
    availableSuppliers.value = response.data;
  });
};

// Formulaire d'ajout de fournisseur
const { formData: addForm, validateForm: validateAddForm, resetForm: resetAddForm, getFieldMessage: getAddFieldMessage } = useFormValidation(
  {
    fournisseurId: null,
    prixUnitaire: 0,
    referenceFournisseur: ''
  },
  {
    fournisseurId: [
      (value) => !value ? 'Fournisseur requis' : null
    ],
    prixUnitaire: commonValidationRules.prix,
    referenceFournisseur: [
      (value) => value && value.length > 50 ? 'Maximum 50 caractères' : null
    ]
  }
);

// Formulaire d'édition
const { formData: editForm, validateForm: validateEditForm, getFieldMessage: getEditFieldMessage } = useFormValidation(
  {
    prixUnitaire: 0,
    referenceFournisseur: ''
  },
  {
    prixUnitaire: commonValidationRules.prix,
    referenceFournisseur: [
      (value) => value && value.length > 50 ? 'Maximum 50 caractères' : null
    ]
  }
);

// Fournisseurs disponibles pour liaison (non encore liés)
const availableSuppliersToLink = computed(() => {
  if (!props.article || !availableSuppliers.value) return [];
  const linkedSupplierIds = props.article.fournisseurs?.map(f => f.fournisseurId?._id) || [];
  return availableSuppliers.value
    .filter(s => !linkedSupplierIds.includes(s._id))
    .map(s => ({ value: s._id, label: s.nom }));
});

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

const handleRemoveSupplierLink = async (fournisseurInfoId) => {
  await executeAction(async () => {
    await withErrorHandling(
      () => api.delete(`/articles/${props.article._id}/fournisseurs/${fournisseurInfoId}`),
      'Erreur lors de la suppression'
    );
    
    message.success('Lien fournisseur supprimé.');
    emit('updated');
  });
};

const openEditModal = (supplierLink) => {
  editingSupplierLink.value = supplierLink;
  editForm.prixUnitaire = supplierLink.prixUnitaire;
  editForm.referenceFournisseur = supplierLink.referenceFournisseur;
  isEditModalVisible.value = true;
};

const handleUpdateSupplierLink = async () => {
  if (!validateEditForm()) {
    message.warning('Veuillez corriger les erreurs du formulaire');
    return;
  }

  await executeAction(async () => {
    await withErrorHandling(
      () => api.put(`/articles/${props.article._id}/fournisseurs/${editingSupplierLink.value._id}`, editForm),
      'Erreur lors de la mise à jour'
    );
    
    message.success('Lien fournisseur mis à jour.');
    isEditModalVisible.value = false;
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
      
      <div v-else class="space-y-3">
        <Card
          v-for="item in article.fournisseurs"
          :key="item._id"
          padding="md"
          class="flex items-center justify-between"
        >
          <div>
            <p class="font-medium text-gray-900">
              {{ item.fournisseurId?.nom || 'Fournisseur introuvable' }}
            </p>
            <p class="text-sm text-gray-500">
              Prix: {{ item.prixUnitaire }} € - Réf: {{ item.referenceFournisseur || 'N/A' }}
            </p>
          </div>
          
          <div class="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              @click="openEditModal(item)"
              :loading="actionLoading"
            >
              <PencilSquareIcon class="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              @click="handleRemoveSupplierLink(item._id)"
              :loading="actionLoading"
              class="text-red-600 hover:text-red-700"
            >
              <TrashIcon class="h-4 w-4" />
            </Button>
          </div>
        </Card>
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
        
        <FormField
          name="referenceFournisseur"
          label="Référence Fournisseur"
          placeholder="Référence optionnelle"
          :model-value="addForm.referenceFournisseur"
          :error="getAddFieldMessage('referenceFournisseur')"
          @update:model-value="value => addForm.referenceFournisseur = value"
        />
        
        <FormField
          name="prixUnitaire"
          label="Prix Unitaire (€)"
          type="number"
          :model-value="addForm.prixUnitaire"
          :error="getAddFieldMessage('prixUnitaire')"
          @update:model-value="value => addForm.prixUnitaire = Number(value)"
        />
        
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

    <!-- Modal d'édition -->
    <div
      v-if="isEditModalVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="isEditModalVisible = false"
    >
      <Card
        padding="lg"
        class="w-full max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4">Modifier les informations du fournisseur</h3>
        
        <div class="space-y-4">
          <FormField
            name="referenceFournisseur"
            label="Référence Fournisseur"
            placeholder="Référence optionnelle"
            :model-value="editForm.referenceFournisseur"
            :error="getEditFieldMessage('referenceFournisseur')"
            @update:model-value="value => editForm.referenceFournisseur = value"
          />
          
          <FormField
            name="prixUnitaire"
            label="Prix Unitaire (€)"
            type="number"
            :model-value="editForm.prixUnitaire"
            :error="getEditFieldMessage('prixUnitaire')"
            @update:model-value="value => editForm.prixUnitaire = Number(value)"
          />
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" @click="isEditModalVisible = false">
            Annuler
          </Button>
          <Button 
            variant="primary" 
            @click="handleUpdateSupplierLink"
            :loading="actionLoading"
          >
            Mettre à jour
          </Button>
        </div>
      </Card>
    </div>

    <!-- Footer -->
    <div class="flex justify-end pt-6 border-t">
      <Button variant="secondary" @click="emit('close')">
        Fermer
      </Button>
    </div>
  </div>
</template>