<script setup>
import { ref, onMounted } from 'vue';
import { useFormValidation, commonValidationRules } from '../../composables/useFormValidation';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useLoading } from '../../composables/useLoading';
import FormGroup from '../forms/FormGroup.vue';
import Select from '../ui/Select.vue';
import Button from '../ui/Button.vue';
import api from '../../api/axios';

const emit = defineEmits(['created', 'close']);

// Catégories d'articles
const categories = ref([]);
const isCategoriesLoading = ref(false);

// Fetch categories from backend
const fetchCategories = async () => {
  isCategoriesLoading.value = true;
  try {
    const response = await withErrorHandling(
      () => api.get('/articles/categories'),
      'Erreur lors du chargement des catégories'
    );
    categories.value = response.data.map(cat => ({ value: cat, label: cat }));
  } catch (error) {
    // Fallback to hardcoded categories if API fails
    console.warn('Failed to fetch categories, using fallback', error);
    categories.value = [
      { value: 'Barquette', label: 'Barquette' },
      { value: 'Cagette', label: 'Cagette' },
      { value: 'Plateau', label: 'Plateau' },
      { value: 'Film Plastique', label: 'Film Plastique' },
      { value: 'Carton', label: 'Carton' },
      { value: 'Sac Plastique', label: 'Sac Plastique' },
      { value: 'Sac Papier', label: 'Sac Papier' },
      { value: 'Emballage Isotherme', label: 'Emballage Isotherme' },
      { value: 'Etiquette', label: 'Etiquette' },
      { value: 'Autre', label: 'Autre' },
    ];
  } finally {
    isCategoriesLoading.value = false;
  }
};

// Validation du formulaire
const { formData, validateForm, resetForm, getFieldProps, getFieldStatus, getFieldMessage } = useFormValidation(
  {
    codeArticle: '',
    designation: '',
    categorie: null,
  },
  {
    codeArticle: commonValidationRules.codeArticle,
    designation: [
      (value) => !value || !value.trim() ? 'Désignation requise' : null,
      (value) => value && value.length > 100 ? 'Maximum 100 caractères' : null
    ],
    categorie: [
      (value) => !value ? 'Catégorie requise' : null
    ]
  }
);

// Gestion du loading et des erreurs
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  await execute(async () => {
    await withErrorHandling(
      () => api.post('/articles', formData),
      'Erreur lors de la création de l\'article'
    );
    
    emit('created');
    resetForm();
  });
};

const handleCancel = () => {
  resetForm();
  emit('close');
};

// Fetch categories when component mounts
onMounted(fetchCategories);
</script>

<template>
  <FormGroup title="Nouvel Article" spacing="lg">
    <div>
      <label for="codeArticle" class="block text-sm font-medium text-gray-700">
        Code Article <span class="text-red-500">*</span>
      </label>
      <input 
        type="text" 
        v-model="formData.codeArticle" 
        id="codeArticle" 
        name="codeArticle"
        placeholder="Ex: BARQ-001"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
        required
        @blur="() => getFieldProps('codeArticle').onBlur?.()"
      />
      <p v-if="getFieldMessage('codeArticle')" class="mt-1 text-sm text-red-600">
        {{ getFieldMessage('codeArticle') }}
      </p>
    </div>
    
    <div>
      <label for="designation" class="block text-sm font-medium text-gray-700">
        Désignation <span class="text-red-500">*</span>
      </label>
      <input 
        type="text" 
        v-model="formData.designation" 
        id="designation" 
        name="designation"
        placeholder="Description de l'article"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
        required
        @blur="() => getFieldProps('designation').onBlur?.()"
      />
      <p v-if="getFieldMessage('designation')" class="mt-1 text-sm text-red-600">
        {{ getFieldMessage('designation') }}
      </p>
    </div>
    
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        Catégorie <span class="text-red-500">*</span>
      </label>
      <Select
        :model-value="formData.categorie"
        :options="categories"
        placeholder="Sélectionnez une catégorie"
        :error="getFieldMessage('categorie')"
        :loading="isCategoriesLoading"
        @update:model-value="value => formData.categorie = value"
      />
    </div>
    
    <div class="flex justify-end space-x-3 pt-6 border-t">
      <Button variant="secondary" @click="handleCancel">
        Annuler
      </Button>
      <Button 
        variant="primary" 
        @click="handleSubmit" 
        :loading="isLoading"
      >
        Créer
      </Button>
    </div>
  </FormGroup>
</template>