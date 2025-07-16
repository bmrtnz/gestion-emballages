<script setup>
import { reactive, ref } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useNotification } from '../../composables/useNotification';
import api from '../../api/axios';
import Button from '../ui/Button.vue';

const props = defineProps({
  fournisseurId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['created', 'close']);

const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();
const { success } = useNotification();

const formState = reactive({
  nomSite: '',
  estPrincipal: false,
  isActive: true,
  adresse: {
    rue: '',
    codePostal: '',
    ville: '',
    pays: 'France',
  },
  contact: {
    nom: '',
    email: '',
    telephone: '',
  },
});

const handleSubmit = async () => {
  await execute(async () => {
    await withErrorHandling(
      () => api.post(`/fournisseurs/${props.fournisseurId}/sites`, formState),
      'Erreur lors de la création du site'
    );
    
    // Show success notification
    success('Site créé avec succès');
    
    // Emit the success event
    emit('created');
  });
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <div>
        <label for="nomSite" class="block text-sm font-medium text-gray-700">Nom du site</label>
        <input type="text" v-model="formState.nomSite" id="nomSite" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
      </div>
      
      <div>
        <div class="flex items-center">
          <input 
            type="checkbox" 
            v-model="formState.estPrincipal" 
            id="estPrincipal" 
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="estPrincipal" class="ml-2 block text-sm text-gray-900">Site principal</label>
        </div>
      </div>

      <!-- Adresse -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Adresse</h3>
        
        <div>
          <label for="rue" class="block text-sm font-medium text-gray-700">Rue</label>
          <input type="text" v-model="formState.adresse.rue" id="rue" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="codePostal" class="block text-sm font-medium text-gray-700">Code postal</label>
            <input type="text" v-model="formState.adresse.codePostal" id="codePostal" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
          </div>
          <div>
            <label for="ville" class="block text-sm font-medium text-gray-700">Ville</label>
            <input type="text" v-model="formState.adresse.ville" id="ville" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
          </div>
        </div>
        
        <div>
          <label for="pays" class="block text-sm font-medium text-gray-700">Pays</label>
          <input type="text" v-model="formState.adresse.pays" id="pays" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
      </div>

      <!-- Contact -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Contact</h3>
        
        <div>
          <label for="contactNom" class="block text-sm font-medium text-gray-700">Nom du contact</label>
          <input type="text" v-model="formState.contact.nom" id="contactNom" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        
        <div>
          <label for="contactEmail" class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" v-model="formState.contact.email" id="contactEmail" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
        
        <div>
          <label for="contactTelephone" class="block text-sm font-medium text-gray-700">Téléphone</label>
          <input type="tel" v-model="formState.contact.telephone" id="contactTelephone" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
        </div>
      </div>
    </div>
    
    <div class="mt-8 flex justify-end space-x-3">
      <Button type="button" variant="secondary" @click="$emit('close')">Annuler</Button>
      <Button type="submit" variant="primary" :loading="isLoading">Créer le site</Button>
    </div>
  </form>
</template>