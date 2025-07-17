<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useFormValidation, commonValidationRules } from '../../composables/useFormValidation';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useLoading } from '../../composables/useLoading';
import FormGroup from '../forms/FormGroup.vue';
import Select from '../ui/Select.vue';
import Button from '../ui/Button.vue';
import ArticleSupplierManager from './ArticleSupplierManager.vue';
import ArticleVisuelManager from './ArticleVisuelManager.vue';
import api from '../../api/axios';

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['updated', 'close']);

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

// Reactive article data
const articleData = ref({ ...props.article });

// Watch for article changes
watch(() => props.article, (newArticle) => {
  articleData.value = { ...newArticle };
}, { deep: true });

// Validation du formulaire
const { formData, validateForm, resetForm, getFieldProps, getFieldStatus, getFieldMessage } = useFormValidation(
  {
    codeArticle: articleData.value.codeArticle || '',
    designation: articleData.value.designation || '',
    categorie: articleData.value.categorie || null,
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

// Update form data when article changes
watch(articleData, (newData) => {
  formData.codeArticle = newData.codeArticle || '';
  formData.designation = newData.designation || '';
  formData.categorie = newData.categorie || null;
}, { immediate: true });

// Gestion du loading et des erreurs
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Tabs management
const activeTab = ref('details');

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  await execute(async () => {
    const response = await withErrorHandling(
      () => api.put(`/articles/${props.article._id}`, formData),
      'Erreur lors de la mise à jour de l\'article'
    );
    
    articleData.value = response.data;
    // Emit 'updated' to close panel and refresh article list
    emit('updated', response.data);
  });
};

const handleSupplierUpdated = () => {
  // Refresh article data without closing the panel
  refreshArticleData(false);
};

const refreshArticleData = async (shouldEmitUpdated = true) => {
  await execute(async () => {
    const response = await withErrorHandling(
      () => api.get(`/articles/${props.article._id}`),
      'Erreur lors du rechargement des données'
    );
    
    articleData.value = response.data;
    // Only emit 'updated' if explicitly requested (for article details updates)
    if (shouldEmitUpdated) {
      emit('updated', response.data);
    }
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
  <div class="space-y-6">
    <!-- Tab Navigation -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'details'"
          :class="[
            activeTab === 'details'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Détails de l'article
        </button>
        <button
          @click="activeTab = 'suppliers'"
          :class="[
            activeTab === 'suppliers'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Fournisseurs
        </button>
        <button
          @click="activeTab = 'visuel'"
          :class="[
            activeTab === 'visuel'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Visuel
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'details'">
      <FormGroup title="Modifier l'article" spacing="lg">
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
      </FormGroup>
    </div>

    <div v-if="activeTab === 'suppliers'">
      <ArticleSupplierManager 
        :article="articleData" 
        @updated="handleSupplierUpdated"
        @close="emit('close')"
      />
    </div>

    <div v-if="activeTab === 'visuel'">
      <ArticleVisuelManager 
        :article="articleData" 
        @updated="handleSupplierUpdated"
        @close="emit('close')"
      />
    </div>

    <!-- Actions -->
    <div v-if="activeTab === 'details'" class="flex justify-end space-x-3 pt-6 border-t">
      <Button variant="secondary" @click="handleCancel">
        Annuler
      </Button>
      <Button 
        variant="primary" 
        @click="handleSubmit" 
        :loading="isLoading"
      >
        Mettre à jour
      </Button>
    </div>
  </div>
</template>