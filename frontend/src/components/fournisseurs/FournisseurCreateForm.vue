<script setup>
import { reactive, ref } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import api from '../../api/axios';
import Button from '../ui/Button.vue';
import FournisseurDocumentManager from './FournisseurDocumentManager.vue';

const emit = defineEmits(['created', 'close']);

const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Tab management
const activeTab = ref('details');

const formState = reactive({
  nom: '',
  siret: '',
  sites: [
    {
      nomSite: 'Site Principal',
      estPrincipal: true,
      adresse: { rue: '', codePostal: '', ville: '', pays: 'France' },
      contact: { nom: '', email: '', telephone: '' },
    },
  ],
});

// Created supplier data (for documents tab)
const createdFournisseur = ref(null);

const handleSubmit = async () => {
  await execute(async () => {
    const response = await withErrorHandling(
      () => api.post('/fournisseurs', formState),
      'Erreur lors de la création du fournisseur'
    );
    
    // Store created supplier for documents tab
    createdFournisseur.value = response.data;
    
    // Switch to documents tab after creation
    activeTab.value = 'documents';
  });
};

const handleDocumentUpdated = async () => {
  // Refresh supplier data to show new document
  if (createdFournisseur.value) {
    try {
      const response = await api.get(`/fournisseurs/${createdFournisseur.value._id}`);
      createdFournisseur.value = response.data;
    } catch (error) {
      console.error('Error refreshing supplier data:', error);
    }
  }
};

const handleFinish = () => {
  emit('created');
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
          :disabled="!createdFournisseur"
        >
          Documents
          <span v-if="!createdFournisseur" class="ml-1 text-xs text-gray-400">(créer d'abord)</span>
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
              <label for="nom" class="block text-sm font-medium text-gray-700">Nom du fournisseur</label>
              <input type="text" v-model="formState.nom" id="nom" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
            </div>
            <div>
              <label for="siret" class="block text-sm font-medium text-gray-700">N° SIRET</label>
              <input type="text" v-model="formState.siret" id="siret" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
            
            <!-- Site Principal Section -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Site Principal</h3>
              
              <!-- Site Information -->
              <div class="space-y-4">
                <div>
                  <label for="nomSite" class="block text-sm font-medium text-gray-700">Nom du site</label>
                  <input type="text" v-model="formState.sites[0].nomSite" id="nomSite" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>

                <!-- Address Section -->
                <div class="space-y-4">
                  <h4 class="text-sm font-medium text-gray-700">Adresse</h4>
                  <div>
                    <label for="rue" class="block text-sm font-medium text-gray-700">Rue</label>
                    <input type="text" v-model="formState.sites[0].adresse.rue" id="rue" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="codePostal" class="block text-sm font-medium text-gray-700">Code postal</label>
                      <input type="text" v-model="formState.sites[0].adresse.codePostal" id="codePostal" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                    </div>
                    <div>
                      <label for="ville" class="block text-sm font-medium text-gray-700">Ville</label>
                      <input type="text" v-model="formState.sites[0].adresse.ville" id="ville" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label for="pays" class="block text-sm font-medium text-gray-700">Pays</label>
                    <input type="text" v-model="formState.sites[0].adresse.pays" id="pays" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                  </div>
                </div>

                <!-- Contact Section -->
                <div class="space-y-4">
                  <h4 class="text-sm font-medium text-gray-700">Contact</h4>
                  <div>
                    <label for="contactNom" class="block text-sm font-medium text-gray-700">Nom du contact</label>
                    <input type="text" v-model="formState.sites[0].contact.nom" id="contactNom" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>
                  <div>
                    <label for="contactEmail" class="block text-sm font-medium text-gray-700">Email du contact</label>
                    <input type="email" v-model="formState.sites[0].contact.email" id="contactEmail" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>
                  <div>
                    <label for="contactTelephone" class="block text-sm font-medium text-gray-700">Téléphone du contact</label>
                    <input type="tel" v-model="formState.sites[0].contact.telephone" id="contactTelephone" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 flex justify-end space-x-3">
            <Button type="button" variant="secondary" @click="$emit('close')">Annuler</Button>
            <Button type="submit" variant="primary" :loading="isLoading">
              {{ createdFournisseur ? 'Modifier' : 'Créer' }}
            </Button>
          </div>
        </form>
      </div>

      <!-- Documents Tab -->
      <div v-if="activeTab === 'documents'">
        <div v-if="!createdFournisseur" class="text-center py-8">
          <p class="text-gray-500">Veuillez d'abord créer le fournisseur pour ajouter des documents</p>
        </div>
        <div v-else>
          <FournisseurDocumentManager
            :fournisseur="createdFournisseur"
            @updated="handleDocumentUpdated"
          />
          <div class="mt-8 flex justify-end space-x-3">
            <Button type="button" variant="primary" @click="handleFinish">
              Terminer
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
