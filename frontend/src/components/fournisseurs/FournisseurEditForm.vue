<script setup>
import { reactive, watchEffect } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useNotification } from '../../composables/useNotification';
import api from '../../api/axios';
import Button from '../ui/Button.vue';

const props = defineProps({
  fournisseur: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['updated', 'close']);

const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();
const { success } = useNotification();

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
</script>

<template>
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
</template>