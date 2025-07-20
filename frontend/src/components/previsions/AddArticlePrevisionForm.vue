<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Article Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Article <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.articleId"
          required
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Sélectionner un article</option>
          <option 
            v-for="article in filteredAvailableArticles" 
            :key="article._id" 
            :value="article._id"
          >
            {{ article.designation }} ({{ article.codeArticle }})
          </option>
        </select>
        <p v-if="availableArticles.length === 0" class="mt-1 text-sm text-orange-600">
          Aucun article disponible pour ce fournisseur
        </p>
        <p v-else-if="filteredAvailableArticles.length === 0" class="mt-1 text-sm text-orange-600">
          Tous les articles de ce fournisseur ont déjà une prévision
        </p>
        <p v-else class="mt-1 text-sm text-gray-500">
          {{ filteredAvailableArticles.length }} article(s) disponible(s) 
          <span v-if="availableArticles.length > filteredAvailableArticles.length">
            ({{ availableArticles.length - filteredAvailableArticles.length }} déjà ajouté(s))
          </span>
        </p>
      </div>


      <!-- Selected Article Info -->
      <div v-if="selectedArticle" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Article sélectionné</h4>
        <div class="text-sm text-gray-700 space-y-1">
          <p><strong>Code:</strong> {{ selectedArticle.codeArticle }}</p>
          <p><strong>Désignation:</strong> {{ selectedArticle.designation }}</p>
          <p><strong>Catégorie:</strong> {{ selectedArticle.categorie }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2" />
          <span class="text-red-800 text-sm">{{ error }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button 
          variant="outline" 
          size="md" 
          type="button"
          @click="$emit('close')"
          :disabled="isSubmitting"
        >
          Annuler
        </Button>
        <Button 
          variant="primary" 
          size="md" 
          type="submit"
          :loading="isSubmitting"
          :disabled="!isFormValid"
        >
          {{ isSubmitting ? 'Ajout...' : 'Ajouter l\'article' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import Button from '../ui/Button.vue';
import api from '../../api/axios';
import previsionsAPI from '../../api/previsions';

export default {
  name: 'AddArticlePrevisionForm',
  components: {
    Button,
    ExclamationTriangleIcon
  },
  props: {
    prevision: {
      type: Object,
      required: true
    }
  },
  emits: ['success', 'close'],
  setup(props, { emit }) {
    // Form state
    const form = ref({
      articleId: ''
    });
    
    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const error = ref(null);
    const availableArticles = ref([]);


    const filteredAvailableArticles = computed(() => {
      if (!availableArticles.value.length || !props.prevision?.articlesPrevisions) {
        return availableArticles.value;
      }

      // Get list of article IDs that already have previsions for this campagne/supplier/site
      const existingArticleIds = props.prevision.articlesPrevisions.map(ap => {
        // Handle both populated and non-populated articleId
        return ap.articleId?._id || ap.articleId;
      });
      
      console.log('Existing article IDs:', existingArticleIds);
      console.log('Available articles:', availableArticles.value.map(a => ({ id: a._id, designation: a.designation })));
      
      // Filter out articles that already have previsions
      return availableArticles.value.filter(article => 
        !existingArticleIds.includes(article._id)
      );
    });

    const selectedArticle = computed(() => {
      return filteredAvailableArticles.value.find(article => article._id === form.value.articleId);
    });

    const isFormValid = computed(() => {
      return form.value.articleId;
    });

    // Methods
    const fetchArticlesForSupplier = async () => {
      if (!props.prevision?.fournisseurId?._id) return;
      
      try {
        isLoading.value = true;
        error.value = null;
        
        const response = await api.get(`/articles/by-supplier/${props.prevision.fournisseurId._id}`);
        availableArticles.value = response.data.data || [];
        
        console.log('Available articles:', availableArticles.value.length);
      } catch (err) {
        console.error('Error fetching articles:', err);
        error.value = 'Erreur lors du chargement des articles';
      } finally {
        isLoading.value = false;
      }
    };

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;
        error.value = null;

        // Safety check - this should not happen since we filter the dropdown,
        // but keeping it as a backup validation
        const existingArticle = props.prevision.articlesPrevisions?.find(
          ap => (ap.articleId?._id || ap.articleId) === form.value.articleId
        );

        if (existingArticle) {
          error.value = 'Cet article existe déjà dans cette prévision';
          return;
        }

        const requestData = {
          articleId: form.value.articleId,
          semaines: [] // Empty weeks array initially
        };

        await previsionsAPI.addArticlePrevision(props.prevision._id, requestData);
        
        emit('success');
      } catch (err) {
        error.value = err.response?.data?.message || 'Erreur lors de l\'ajout de l\'article';
        console.error('Error adding article prevision:', err);
      } finally {
        isSubmitting.value = false;
      }
    };


    // Lifecycle
    onMounted(() => {
      fetchArticlesForSupplier();
    });

    return {
      form,
      isLoading,
      isSubmitting,
      error,
      availableArticles,
      filteredAvailableArticles,
      selectedArticle,
      isFormValid,
      handleSubmit
    };
  }
};
</script>