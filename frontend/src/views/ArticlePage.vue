<script setup>
import { ref, computed } from 'vue';
import ArticleList from '../components/ArticleList.vue';
import ArticleCreateForm from '../components/articles/ArticleCreateForm.vue';
import ArticleEditForm from '../components/articles/ArticleEditForm.vue';
import ArticleSupplierEditForm from '../components/articles/ArticleSupplierEditForm.vue';
import Button from '../components/ui/Button.vue';
import SlidePanel from '../components/ui/SlidePanel.vue';
import ConfirmDialog from '../components/ui/ConfirmDialog.vue';
import ImageModal from '../components/ui/ImageModal.vue';
import { useLoading } from '../composables/useLoading';
import { useErrorHandler } from '../composables/useErrorHandler';
import { useAuthStore } from '../stores/authStore';
import { message } from 'ant-design-vue';
import api from '../api/axios';

const isCreatePanelOpen = ref(false);
const isEditPanelOpen = ref(false);
const isSupplierEditPanelOpen = ref(false);
const isDeleteSupplierDialogOpen = ref(false);
const isImageModalOpen = ref(false);
const selectedArticle = ref(null);
const selectedSupplier = ref(null);
const supplierToDelete = ref(null);
const supplierImageData = ref(null);
const articleListRef = ref(null);

// Loading and error handling
const { isLoading: isProcessing, execute: executeAction } = useLoading();
const { withErrorHandling } = useErrorHandler();
const authStore = useAuthStore();

// Check if user can perform edit actions
const canEdit = computed(() => {
  return authStore.userRole === 'Manager' || authStore.userRole === 'Gestionnaire';
});

const handleArticleCreated = () => {
  isCreatePanelOpen.value = false;
  refreshArticleList();
};

const handleArticleUpdated = () => {
  isEditPanelOpen.value = false;
  selectedArticle.value = null;
  refreshArticleList();
};

const handleEditPanelClose = () => {
  isEditPanelOpen.value = false;
  selectedArticle.value = null;
  refreshArticleList();
};

const handleEditArticle = (article) => {
  selectedArticle.value = article;
  isEditPanelOpen.value = true;
};

const handleDeactivateArticle = async (articleId) => {
  await executeAction(async () => {
    await withErrorHandling(
      () => api.delete(`/articles/${articleId}`),
      'Erreur lors de la désactivation de l\'article'
    );
    
    message.success('Article désactivé avec succès');
    refreshArticleList();
  });
};

const handleReactivateArticle = async (articleId) => {
  await executeAction(async () => {
    await withErrorHandling(
      () => api.put(`/articles/${articleId}`, { isActive: true }),
      'Erreur lors de la réactivation de l\'article'
    );
    
    message.success('Article réactivé avec succès');
    refreshArticleList();
  });
};

const handleEditSupplier = (articleId, supplierId) => {
  selectedArticle.value = { _id: articleId };
  selectedSupplier.value = { _id: supplierId };
  isSupplierEditPanelOpen.value = true;
};

const handleSupplierUpdated = () => {
  isSupplierEditPanelOpen.value = false;
  selectedArticle.value = null;
  selectedSupplier.value = null;
  refreshArticleList();
};

const handleSupplierEditPanelClose = () => {
  isSupplierEditPanelOpen.value = false;
  selectedArticle.value = null;
  selectedSupplier.value = null;
};

const handleDeleteSupplier = async (articleId, supplierId) => {
  // First, get the article and supplier details for the confirmation dialog
  try {
    const response = await api.get(`/articles/${articleId}`);
    const article = response.data;
    const supplier = article.fournisseurs?.find(f => f._id === supplierId);
    
    if (supplier) {
      supplierToDelete.value = {
        articleId,
        supplierId,
        articleName: article.designation,
        supplierName: supplier.fournisseurId?.nom || 'Fournisseur inconnu'
      };
      isDeleteSupplierDialogOpen.value = true;
    }
  } catch (error) {
    message.error('Erreur lors du chargement des informations');
  }
};

const confirmDeleteSupplier = async () => {
  if (!supplierToDelete.value) return;
  
  await executeAction(async () => {
    await withErrorHandling(
      () => api.delete(`/articles/${supplierToDelete.value.articleId}/fournisseurs/${supplierToDelete.value.supplierId}`),
      'Erreur lors de la suppression du fournisseur'
    );
    
    message.success('Fournisseur supprimé avec succès');
    isDeleteSupplierDialogOpen.value = false;
    supplierToDelete.value = null;
    refreshArticleList();
  });
};

const cancelDeleteSupplier = () => {
  isDeleteSupplierDialogOpen.value = false;
  supplierToDelete.value = null;
};

const handleViewSupplierImage = (supplier, parentArticle) => {
  supplierImageData.value = {
    imageUrl: supplier.imageUrl,
    supplierName: supplier.fournisseurId?.nom || supplier.nom || 'Fournisseur',
    supplierReference: supplier.referenceFournisseur || '',
    articleCode: parentArticle?.codeArticle || '',
    articleDesignation: parentArticle?.designation || ''
  };
  isImageModalOpen.value = true;
};

const handleCloseImageModal = () => {
  isImageModalOpen.value = false;
  supplierImageData.value = null;
};

const refreshArticleList = () => {
  if (articleListRef.value && articleListRef.value.fetchArticles) {
    articleListRef.value.fetchArticles();
  }
};
</script>

<template>
    <div>
        <div class="sm:flex sm:items-center mb-8">
            <div class="sm:flex-auto">
                <h1 class="text-3xl font-bold text-gray-900">Catalogue des Articles</h1>
                <p v-if="authStore.userRole !== 'Fournisseur'" class="mt-1 text-sm text-gray-500">Parcourez et gérez tous les articles ici.</p>
                <p v-else class="mt-1 text-sm text-gray-500">Parcourez les articles auxquels vous êtes associé.</p>
            </div>
            <div v-if="canEdit" class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Button variant="primary" size="md" @click="isCreatePanelOpen = true">Ajouter un Article</Button>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-soft p-6">
            <ArticleList 
              ref="articleListRef"
              @edit-article="handleEditArticle"
              @deactivate-article="handleDeactivateArticle"
              @reactivate-article="handleReactivateArticle"
              @edit-supplier="handleEditSupplier"
              @delete-supplier="handleDeleteSupplier"
              @view-supplier-image="handleViewSupplierImage"
            />
        </div>

        <SlidePanel :open="isCreatePanelOpen" @close="isCreatePanelOpen = false" title="Ajouter un nouvel article" size="md">
            <ArticleCreateForm @created="handleArticleCreated" @close="isCreatePanelOpen = false" />
        </SlidePanel>

        <SlidePanel 
          :open="isEditPanelOpen" 
          @close="handleEditPanelClose" 
          title="Modifier l'article"
          size="lg"
        >
            <ArticleEditForm 
              v-if="selectedArticle"
              :article="selectedArticle"
              @updated="handleArticleUpdated" 
              @close="handleEditPanelClose" 
            />
        </SlidePanel>

        <SlidePanel 
          :open="isSupplierEditPanelOpen" 
          @close="handleSupplierEditPanelClose" 
          title="Modifier le fournisseur lié"
          size="md"
        >
            <ArticleSupplierEditForm 
              v-if="selectedArticle && selectedSupplier" 
              :article-id="selectedArticle._id"
              :supplier-id="selectedSupplier._id"
              @updated="handleSupplierUpdated" 
              @close="handleSupplierEditPanelClose" 
            />
        </SlidePanel>

        <ConfirmDialog
          :open="isDeleteSupplierDialogOpen"
          :loading="isProcessing"
          title="Supprimer le fournisseur lié"
          :message="`Êtes-vous sûr de vouloir supprimer le fournisseur '${supplierToDelete?.supplierName}' de l'article '${supplierToDelete?.articleName}' ? Cette action est irréversible et supprimera également l'image associée si elle existe.`"
          confirm-text="Supprimer"
          cancel-text="Annuler"
          variant="danger"
          @confirm="confirmDeleteSupplier"
          @cancel="cancelDeleteSupplier"
        />

        <ImageModal
          :open="isImageModalOpen"
          :image-url="supplierImageData?.imageUrl"
          :supplier-name="supplierImageData?.supplierName"
          :supplier-reference="supplierImageData?.supplierReference"
          :article-code="supplierImageData?.articleCode"
          :article-designation="supplierImageData?.articleDesignation"
          @close="handleCloseImageModal"
        />

    </div>
</template>