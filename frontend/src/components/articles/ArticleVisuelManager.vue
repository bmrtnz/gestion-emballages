<script setup>
import { ref, computed } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { message } from 'ant-design-vue';
import { CloudArrowUpIcon, PhotoIcon, TrashIcon } from '@heroicons/vue/24/outline';
import FormGroup from '../forms/FormGroup.vue';
import Button from '../ui/Button.vue';
import api from '../../api/axios';

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['updated', 'close']);

// Loading and error handling
const { isLoading: uploadLoading, execute: executeUpload } = useLoading();
const { isLoading: deleteLoading, execute: executeDelete } = useLoading();
const { withErrorHandling } = useErrorHandler();

// File input references
const fileInputs = ref({});

// Handle file upload for a specific supplier
const handleFileUpload = async (supplierLink, event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    message.error('Seuls les fichiers image (JPEG, PNG, GIF, WebP, SVG) sont autorisés');
    return;
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    message.error('La taille du fichier ne peut pas dépasser 5 MB');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  await executeUpload(async () => {
    const response = await withErrorHandling(
      () => api.post(`/articles/${props.article._id}/fournisseurs/${supplierLink._id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }),
      'Erreur lors du téléchargement de l\'image'
    );
    
    message.success('Image téléchargée avec succès');
    emit('updated');
  });

  // Clear the file input
  if (fileInputs.value[supplierLink._id]) {
    fileInputs.value[supplierLink._id].value = '';
  }
};

// Handle image deletion
const handleDeleteImage = async (supplierLink) => {
  await executeDelete(async () => {
    await withErrorHandling(
      () => api.delete(`/articles/${props.article._id}/fournisseurs/${supplierLink._id}/image`),
      'Erreur lors de la suppression de l\'image'
    );
    
    message.success('Image supprimée avec succès');
    emit('updated');
  });
};

// Get image URL for a supplier
const getImageUrl = (supplierLink) => {
  if (!supplierLink.imageUrl) return null;
  
  // If it's already a full URL (http/https), return as is
  if (supplierLink.imageUrl.startsWith('http://') || supplierLink.imageUrl.startsWith('https://')) {
    return supplierLink.imageUrl;
  }
  
  // Otherwise, construct MinIO URL
  // Get MinIO endpoint from environment or use default
  const minioHost = import.meta.env.VITE_MINIO_HOST || 'localhost';
  const minioPort = import.meta.env.VITE_MINIO_PORT || '9000';
  const bucketName = 'documents';
  
  return `http://${minioHost}:${minioPort}/${bucketName}/${supplierLink.imageUrl}`;
};

// Computed property to get suppliers with images
const suppliersWithImages = computed(() => {
  return props.article?.fournisseurs || [];
});
</script>

<template>
  <div class="space-y-6">
    <!-- Images des fournisseurs -->
    <FormGroup title="Images des fournisseurs" variant="bordered">
      <div v-if="!suppliersWithImages.length" class="text-center py-8 text-gray-500">
        Aucun fournisseur lié à cet article.
      </div>
      
      <div v-else class="space-y-6">
        <div
          v-for="supplier in suppliersWithImages"
          :key="supplier._id"
          class="p-4 border border-gray-200 rounded-lg"
        >
          <!-- Supplier name -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ supplier.fournisseurId?.nom || 'Fournisseur inconnu' }}
            </h3>
            <span class="text-sm text-gray-500">
              {{ supplier.referenceFournisseur || 'Pas de référence' }}
            </span>
          </div>

          <!-- Image display and upload -->
          <div class="flex items-start space-x-6">
            <!-- Image preview -->
            <div class="flex-shrink-0">
              <div v-if="getImageUrl(supplier)" class="relative">
                <img
                  :src="getImageUrl(supplier)"
                  :alt="`Image de ${supplier.fournisseurId?.nom}`"
                  class="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  @click="handleDeleteImage(supplier)"
                  :disabled="deleteLoading"
                  class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  title="Supprimer l'image"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
              
              <div v-else class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <PhotoIcon class="h-12 w-12 text-gray-400" />
                <span class="sr-only">Aucune image</span>
              </div>
            </div>

            <!-- Upload controls -->
            <div class="flex-1">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ getImageUrl(supplier) ? 'Remplacer l\'image' : 'Télécharger une image' }}
                  </label>
                  <div class="flex items-center space-x-3">
                    <input
                      :ref="el => fileInputs[supplier._id] = el"
                      type="file"
                      accept="image/*"
                      @change="handleFileUpload(supplier, $event)"
                      class="hidden"
                      :id="`file-${supplier._id}`"
                    />
                    <label
                      :for="`file-${supplier._id}`"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50"
                      :class="{ 'opacity-50 cursor-not-allowed': uploadLoading }"
                    >
                      <CloudArrowUpIcon class="h-4 w-4 mr-2" />
                      {{ uploadLoading ? 'Téléchargement...' : 'Choisir une image' }}
                    </label>
                  </div>
                </div>
                
                <div class="text-xs text-gray-500">
                  <p>• Formats acceptés: JPEG, PNG, GIF, WebP</p>
                  <p>• Taille maximum: 5 MB</p>
                  <p>• Recommandé: 400x400px minimum</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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