<script setup>
import { reactive, watchEffect, ref } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useNotification } from '../../composables/useNotification';
import api from '../../api/axios';
import Button from '../ui/Button.vue';
import FournisseurDocumentManager from './FournisseurDocumentManager.vue';

const props = defineProps({
  fournisseur: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['updated', 'close', 'document-updated']);

const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();
const { success } = useNotification();

// Tab management
const activeTab = ref('details');

const formState = reactive({
  nom: '',
  siret: '',
});

watchEffect(() => {
  if (props.fournisseur) {
    formState.nom = props.fournisseur.nom;
    formState.siret = props.fournisseur.siret || '';
  }
});

const handleSubmit = async () => {
  await execute(async () => {
    await withErrorHandling(
      () => api.put(`/fournisseurs/${props.fournisseur._id}`, formState),
      'Erreur lors de la mise à jour du fournisseur'
    );
    
    // Show success notification
    success('Fournisseur mis à jour avec succès');
    
    // Emit the success event
    emit('updated');
  });
};

const handleDocumentUpdated = async () => {
  // Documents have been updated, emit a specific event for document updates
  // This won't close the panel but will refresh the data
  emit('document-updated');
};
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
          type="button"
        >
          Détails du fournisseur
        </button>
        <button
          @click="activeTab = 'documents'"
          :class="[
            activeTab === 'documents'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
          type="button"
        >
          Documents
          <span v-if="fournisseur.documents && fournisseur.documents.length > 0" class="ml-1 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
            {{ fournisseur.documents.length }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="mt-6">
      <!-- Details Tab -->
      <div v-if="activeTab === 'details'">
        <form @submit.prevent="handleSubmit">
          <div class="space-y-6">
            <div>
              <label for="edit-nom" class="block text-sm font-medium text-gray-700">Nom du fournisseur</label>
              <input type="text" v-model="formState.nom" id="edit-nom" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
            </div>
            <div>
              <label for="edit-siret" class="block text-sm font-medium text-gray-700">N° SIRET</label>
              <input type="text" v-model="formState.siret" id="edit-siret" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
          </div>
          <div class="mt-8 flex justify-end space-x-3">
            <Button type="button" variant="secondary" @click="$emit('close')">Annuler</Button>
            <Button type="submit" variant="primary" :loading="isLoading">Mettre à jour</Button>
          </div>
        </form>
      </div>

      <!-- Documents Tab -->
      <div v-if="activeTab === 'documents'">
        <FournisseurDocumentManager
          :fournisseur="fournisseur"
          @updated="handleDocumentUpdated"
        />
        <div class="mt-8 flex justify-end space-x-3">
          <Button type="button" variant="secondary" @click="$emit('close')">Fermer</Button>
        </div>
      </div>
    </div>
  </div>
</template>