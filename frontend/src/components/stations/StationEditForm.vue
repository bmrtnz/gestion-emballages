<script setup>
import { reactive, watchEffect } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import api from '../../api/axios';
import Button from '../ui/Button.vue';

const props = defineProps({
  station: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['updated', 'close']);

const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

const formState = reactive({
  nom: '',
  identifiantInterne: '',
  adresse: {
    rue: '',
    codePostal: '',
    ville: '',
    pays: ''
  },
  contactPrincipal: {
    nom: '',
    email: '',
    telephone: ''
  }
});

// Initialize form with existing station data
watchEffect(() => {
  if (props.station) {
    formState.nom = props.station.nom || '';
    formState.identifiantInterne = props.station.identifiantInterne || '';
    formState.adresse = {
      rue: props.station.adresse?.rue || '',
      codePostal: props.station.adresse?.codePostal || '',
      ville: props.station.adresse?.ville || '',
      pays: props.station.adresse?.pays || 'France'
    };
    formState.contactPrincipal = {
      nom: props.station.contactPrincipal?.nom || '',
      email: props.station.contactPrincipal?.email || '',
      telephone: props.station.contactPrincipal?.telephone || ''
    };
  }
});

const handleSubmit = async () => {
  await execute(async () => {
    await withErrorHandling(
      () => api.put(`/stations/${props.station._id}`, formState),
      'Erreur lors de la modification de la station'
    );
    emit('updated');
  });
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <div>
        <label for="nom" class="block text-sm font-medium text-gray-700">Nom de la station</label>
        <input 
          type="text" 
          v-model="formState.nom" 
          id="nom" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
          required 
        />
      </div>
      
      <div>
        <label for="identifiantInterne" class="block text-sm font-medium text-gray-700">Identifiant Interne</label>
        <input 
          type="text" 
          v-model="formState.identifiantInterne" 
          id="identifiantInterne" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
          required 
        />
      </div>

      <!-- Address Section -->
      <div class="border-t pt-4">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Adresse</h3>
        <div class="space-y-4">
          <div>
            <label for="rue" class="block text-sm font-medium text-gray-700">Rue</label>
            <input 
              type="text" 
              v-model="formState.adresse.rue" 
              id="rue" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="codePostal" class="block text-sm font-medium text-gray-700">Code Postal</label>
              <input 
                type="text" 
                v-model="formState.adresse.codePostal" 
                id="codePostal" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
              />
            </div>
            <div>
              <label for="ville" class="block text-sm font-medium text-gray-700">Ville</label>
              <input 
                type="text" 
                v-model="formState.adresse.ville" 
                id="ville" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
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
            />
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="border-t pt-4">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Contact Principal</h3>
        <div class="space-y-4">
          <div>
            <label for="contactNom" class="block text-sm font-medium text-gray-700">Nom du contact</label>
            <input 
              type="text" 
              v-model="formState.contactPrincipal.nom" 
              id="contactNom" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            />
          </div>
          <div>
            <label for="contactEmail" class="block text-sm font-medium text-gray-700">Email du contact</label>
            <input 
              type="email" 
              v-model="formState.contactPrincipal.email" 
              id="contactEmail" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            />
          </div>
          <div>
            <label for="contactTelephone" class="block text-sm font-medium text-gray-700">Téléphone du contact</label>
            <input 
              type="tel" 
              v-model="formState.contactPrincipal.telephone" 
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