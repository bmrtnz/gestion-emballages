<script setup>
import { reactive, watchEffect } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import api from '../../api/axios';
import Button from '../ui/Button.vue';

const props = defineProps({
  fournisseurId: {
    type: String,
    required: true
  },
  site: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['updated', 'close']);

const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

const formState = reactive({
  nomSite: '',
  estPrincipal: false,
  isActive: true,
  adresse: {
    rue: '',
    codePostal: '',
    ville: '',
    pays: ''
  },
  contact: {
    nom: '',
    email: '',
    telephone: ''
  }
});

// Initialize form with existing site data
watchEffect(() => {
  if (props.site) {
    formState.nomSite = props.site.nomSite || '';
    formState.estPrincipal = props.site.estPrincipal || false;
    formState.isActive = props.site.isActive !== undefined ? props.site.isActive : true;
    formState.adresse = {
      rue: props.site.adresse?.rue || '',
      codePostal: props.site.adresse?.codePostal || '',
      ville: props.site.adresse?.ville || '',
      pays: props.site.adresse?.pays || 'France'
    };
    formState.contact = {
      nom: props.site.contact?.nom || '',
      email: props.site.contact?.email || '',
      telephone: props.site.contact?.telephone || ''
    };
  }
});

const handleSubmit = async () => {
  await execute(async () => {
    await withErrorHandling(
      () => api.put(`/fournisseurs/${props.fournisseurId}/sites/${props.site._id}`, formState),
      'Erreur lors de la modification du site'
    );
    emit('updated');
  });
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <!-- Site Information -->
      <div>
        <label for="nomSite" class="block text-sm font-medium text-gray-700">Nom du site</label>
        <input 
          type="text" 
          v-model="formState.nomSite" 
          id="nomSite" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
          required 
        />
      </div>

      <div class="flex items-center">
        <input 
          type="checkbox" 
          v-model="formState.estPrincipal" 
          id="estPrincipal" 
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label for="estPrincipal" class="ml-2 block text-sm text-gray-900">
          Site principal
        </label>
      </div>

      <!-- Address Section -->
      <div class="border-t pt-4">
        <h4 class="text-sm font-medium text-gray-900 mb-4">Adresse</h4>
        <div class="space-y-4">
          <div>
            <label for="rue" class="block text-sm font-medium text-gray-700">Rue</label>
            <input 
              type="text" 
              v-model="formState.adresse.rue" 
              id="rue" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
              required 
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="codePostal" class="block text-sm font-medium text-gray-700">Code postal</label>
              <input 
                type="text" 
                v-model="formState.adresse.codePostal" 
                id="codePostal" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                required 
              />
            </div>
            <div>
              <label for="ville" class="block text-sm font-medium text-gray-700">Ville</label>
              <input 
                type="text" 
                v-model="formState.adresse.ville" 
                id="ville" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                required 
              />
            </div>
          </div>
          <div>
            <label for="pays" class="block text-sm font-medium text-gray-700">Pays</label>
            <input 
              type="text" 
              v-model="formState.adresse.pays" 
              id="pays" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
              required 
            />
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="border-t pt-4">
        <h4 class="text-sm font-medium text-gray-900 mb-4">Contact</h4>
        <div class="space-y-4">
          <div>
            <label for="contactNom" class="block text-sm font-medium text-gray-700">Nom du contact</label>
            <input 
              type="text" 
              v-model="formState.contact.nom" 
              id="contactNom" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            />
          </div>
          <div>
            <label for="contactEmail" class="block text-sm font-medium text-gray-700">Email du contact</label>
            <input 
              type="email" 
              v-model="formState.contact.email" 
              id="contactEmail" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            />
          </div>
          <div>
            <label for="contactTelephone" class="block text-sm font-medium text-gray-700">Téléphone du contact</label>
            <input 
              type="tel" 
              v-model="formState.contact.telephone" 
              id="contactTelephone" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3">
      <Button type="button" variant="secondary" @click="$emit('close')">Annuler</Button>
      <Button type="submit" variant="primary" :loading="isLoading">Enregistrer</Button>
    </div>
  </form>
</template>