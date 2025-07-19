<script setup>
import { ref, reactive, computed } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useNotification } from '../../composables/useNotification';
import api from '../../api/axios';
import Button from '../ui/Button.vue';
import Select from '../ui/Select.vue';
import FormGroup from '../forms/FormGroup.vue';
import { 
  DocumentIcon, 
  TrashIcon, 
  CloudArrowUpIcon, 
  EyeIcon,
  CalendarDaysIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  fournisseur: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['updated', 'close']);

const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();
const { success, error } = useNotification();

// Document types
const documentTypes = [
  { value: 'Certificat BRC', label: 'Certificat BRC' },
  { value: 'Autre type', label: 'Autre type' }
];

// Form state for new document
const newDocumentForm = reactive({
  nomDocument: '',
  typeDocument: 'Certificat BRC',
  dateExpiration: '',
  file: null
});

// UI state
const showAddForm = ref(false);
const uploadLoading = ref(false);
const fileInput = ref(null);

// Computed properties
const documents = computed(() => props.fournisseur.documents || []);

const hasExpiredDocuments = computed(() => {
  return documents.value.some(doc => {
    if (!doc.dateExpiration) return false;
    return new Date(doc.dateExpiration) < new Date();
  });
});

const isDocumentExpired = (doc) => {
  if (!doc.dateExpiration) return false;
  return new Date(doc.dateExpiration) < new Date();
};

const isDocumentExpiringSoon = (doc) => {
  if (!doc.dateExpiration) return false;
  const expirationDate = new Date(doc.dateExpiration);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  return expirationDate <= thirtyDaysFromNow && expirationDate > now;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Aucune date';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const resetForm = () => {
  newDocumentForm.nomDocument = '';
  newDocumentForm.typeDocument = 'Certificat BRC';
  newDocumentForm.dateExpiration = '';
  newDocumentForm.file = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type - only PDF allowed
  const allowedTypes = ['application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    error('Seuls les fichiers PDF sont autorisés');
    return;
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    error('La taille du fichier ne doit pas dépasser 10 Mo');
    return;
  }

  newDocumentForm.file = file;
  
  // Auto-fill document name if empty
  if (!newDocumentForm.nomDocument) {
    newDocumentForm.nomDocument = file.name.replace(/\.[^/.]+$/, '');
  }
};

const handleUploadDocument = async () => {
  console.log('handleUploadDocument called');
  console.log('Form data:', {
    file: newDocumentForm.file,
    nomDocument: newDocumentForm.nomDocument,
    typeDocument: newDocumentForm.typeDocument,
    dateExpiration: newDocumentForm.dateExpiration
  });
  
  if (!newDocumentForm.file) {
    error('Veuillez sélectionner un fichier');
    return;
  }

  if (!newDocumentForm.nomDocument.trim()) {
    error('Veuillez saisir un nom pour le document');
    return;
  }

  if (!newDocumentForm.dateExpiration) {
    error('Veuillez saisir une date d\'expiration');
    return;
  }

  uploadLoading.value = true;
  
  try {
    await execute(async () => {
      const formData = new FormData();
      formData.append('document', newDocumentForm.file);
      formData.append('nomDocument', newDocumentForm.nomDocument.trim());
      formData.append('typeDocument', newDocumentForm.typeDocument);
      if (newDocumentForm.dateExpiration) {
        formData.append('dateExpiration', newDocumentForm.dateExpiration);
      }

      await withErrorHandling(
        () => api.post(`/fournisseurs/${props.fournisseur._id}/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
        'Erreur lors de l\'ajout du document'
      );

      success('Document ajouté avec succès');
      resetForm();
      showAddForm.value = false;
      emit('updated');
    });
  } finally {
    uploadLoading.value = false;
  }
};

const handleDeleteDocument = async (documentId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
    return;
  }

  await execute(async () => {
    await withErrorHandling(
      () => api.delete(`/fournisseurs/${props.fournisseur._id}/documents/${documentId}`),
      'Erreur lors de la suppression du document'
    );

    success('Document supprimé avec succès');
    emit('updated');
  });
};

const handleViewDocument = (document) => {
  // Open document in new tab
  window.open(document.urlStockage, '_blank');
};

const cancelAddDocument = () => {
  resetForm();
  showAddForm.value = false;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header with status indicators -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h3 class="text-lg font-medium text-gray-900">Documents</h3>
        <div v-if="hasExpiredDocuments" class="flex items-center text-red-600">
          <CalendarDaysIcon class="h-5 w-5 mr-1" />
          <span class="text-sm font-medium">Documents expirés</span>
        </div>
      </div>
      <Button 
        v-if="!showAddForm"
        type="button" 
        variant="primary" 
        @click="showAddForm = true"
      >
        <CloudArrowUpIcon class="h-4 w-4 mr-2" />
        Ajouter un document
      </Button>
    </div>

    <!-- Add Document Form -->
    <FormGroup v-if="showAddForm" title="Ajouter un document" variant="bordered">
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nom du document *
            </label>
            <input
              v-model="newDocumentForm.nomDocument"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nom du document"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Type de document *
            </label>
            <Select
              v-model="newDocumentForm.typeDocument"
              :options="documentTypes"
              class="w-full"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Date d'expiration *
          </label>
          <input
            v-model="newDocumentForm.dateExpiration"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fichier *
          </label>
          <input
            ref="fileInput"
            type="file"
            accept=".pdf"
            @change="handleFileSelect"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
          <p class="text-sm text-gray-500 mt-1">
            Format accepté: PDF uniquement (max 10 Mo)
          </p>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="secondary" 
            @click="cancelAddDocument"
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            @click="handleUploadDocument"
            :loading="uploadLoading"
          >
            <CloudArrowUpIcon class="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>
    </FormGroup>

    <!-- Documents List -->
    <FormGroup title="Documents existants" variant="bordered">
      <div v-if="documents.length === 0" class="text-center py-8">
        <DocumentIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">Aucun document ajouté</p>
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="document in documents"
          :key="document._id"
          class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          :class="{
            'border-red-300 bg-red-50': isDocumentExpired(document),
            'border-orange-300 bg-orange-50': isDocumentExpiringSoon(document),
            'border-gray-200': !isDocumentExpired(document) && !isDocumentExpiringSoon(document)
          }"
        >
          <div class="flex items-center space-x-3">
            <DocumentIcon 
              class="h-8 w-8 text-gray-400" 
              :class="{
                'text-red-500': isDocumentExpired(document),
                'text-orange-500': isDocumentExpiringSoon(document)
              }"
            />
            <div>
              <h4 class="font-medium text-gray-900">
                {{ document.nomDocument }}
              </h4>
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span class="px-2 py-1 bg-gray-100 rounded-full">
                  {{ document.typeDocument }}
                </span>
                <span class="flex items-center">
                  <CalendarDaysIcon class="h-4 w-4 mr-1" />
                  {{ formatDate(document.dateExpiration) }}
                </span>
              </div>
              <div v-if="isDocumentExpired(document)" class="text-red-600 text-sm font-medium">
                ⚠️ Document expiré
              </div>
              <div v-else-if="isDocumentExpiringSoon(document)" class="text-orange-600 text-sm font-medium">
                ⚠️ Expire bientôt
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              @click="handleViewDocument(document)"
            >
              <EyeIcon class="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              @click="handleDeleteDocument(document._id)"
              :loading="isLoading"
            >
              <TrashIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </FormGroup>
  </div>
</template>