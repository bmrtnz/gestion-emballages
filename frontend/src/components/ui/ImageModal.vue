<script setup>
import { computed } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'Image'
  },
  supplierName: {
    type: String,
    default: ''
  },
  articleCode: {
    type: String,
    default: ''
  },
  articleDesignation: {
    type: String,
    default: ''
  },
  supplierReference: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};

const handleBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    handleClose();
  }
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    handleClose();
  }
};

const articleInfo = computed(() => {
  const parts = [];
  if (props.articleCode) parts.push(props.articleCode);
  if (props.articleDesignation) parts.push(props.articleDesignation);
  return parts.join(' - ');
});

const supplierInfo = computed(() => {
  const parts = [];
  if (props.supplierName) parts.push(props.supplierName);
  if (props.supplierReference) parts.push(`Réf: ${props.supplierReference}`);
  return parts.join(' - ');
});

// Process the image URL to handle MinIO storage
const processedImageUrl = computed(() => {
  if (!props.imageUrl) return null;
  
  // If it's already a full URL (http/https), return as is
  if (props.imageUrl.startsWith('http://') || props.imageUrl.startsWith('https://')) {
    return props.imageUrl;
  }
  
  // Otherwise, construct MinIO URL
  const minioHost = import.meta.env.VITE_MINIO_HOST || 'localhost';
  const minioPort = import.meta.env.VITE_MINIO_PORT || '9000';
  const bucketName = 'documents';
  
  return `http://${minioHost}:${minioPort}/${bucketName}/${props.imageUrl}`;
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 overflow-y-auto"
      @keydown="handleKeydown"
      tabindex="-1"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="handleBackdropClick"
      ></div>

      <!-- Modal container -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div
          class="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full flex flex-col"
          @click.stop
        >
          <!-- Modal header -->
          <div class="flex items-start justify-between p-4 border-b border-gray-200">
            <div class="flex-1">
              <!-- Article info (first line - small and gray) -->
              <div v-if="articleInfo" class="text-sm text-gray-500 mb-1">
                {{ articleInfo }}
              </div>
              <!-- Supplier info (second line - normal size and black) -->
              <h3 class="text-lg font-semibold text-gray-900">
                {{ supplierInfo || 'Image du fournisseur' }}
              </h3>
            </div>
            <button
              @click="handleClose"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-4"
              title="Fermer"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <!-- Modal body -->
          <div class="flex-1 p-4 overflow-hidden">
            <div class="flex items-center justify-center h-full">
              <img
                v-if="processedImageUrl"
                :src="processedImageUrl"
                :alt="supplierInfo || 'Image'"
                class="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                @error="$emit('close')"
              />
              <div
                v-else
                class="flex flex-col items-center justify-center text-gray-500 space-y-2"
              >
                <svg
                  class="h-16 w-16 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p class="text-sm">Aucune image disponible</p>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="flex items-center justify-end p-4 border-t border-gray-200 space-x-3">
            <button
              @click="handleClose"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>