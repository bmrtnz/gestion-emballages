<script setup>
import { ref, reactive, watchEffect, computed, onMounted } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useNotification } from '../../composables/useNotification';
import api from '../../api/axios';
import Button from '../ui/Button.vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['updated', 'close']);

const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();
const { success } = useNotification();

const roles = ['Manager', 'Gestionnaire', 'Station', 'Fournisseur'];

const formState = reactive({
  nomComplet: '',
  email: '',
  role: '',
  entiteId: null,
});

const stations = ref([]);
const fournisseurs = ref([]);

watchEffect(() => {
  if (props.user) {
    formState.nomComplet = props.user.nomComplet;
    formState.email = props.user.email;
    formState.role = props.user.role;
    // Handle both populated and non-populated entiteId
    if (props.user.entiteId) {
      formState.entiteId = props.user.entiteId._id || props.user.entiteId;
    } else {
      formState.entiteId = null;
    }
  }
});

// Computed property to determine if entity selection should be shown
const shouldShowEntitySelection = computed(() => {
  return formState.role === 'Station' || formState.role === 'Fournisseur';
});

// Computed property to get the appropriate entity list
const entityOptions = computed(() => {
  if (formState.role === 'Station') {
    return stations.value;
  } else if (formState.role === 'Fournisseur') {
    return fournisseurs.value;
  }
  return [];
});

// Computed property to get the appropriate entity label
const entityLabel = computed(() => {
  if (formState.role === 'Station') {
    return 'Station';
  } else if (formState.role === 'Fournisseur') {
    return 'Fournisseur';
  }
  return '';
});

// Fetch stations and fournisseurs
const fetchEntities = async () => {
  try {
    const [stationsResponse, fournisseursResponse] = await Promise.all([
      withErrorHandling(
        () => api.get('/stations'),
        'Erreur lors du chargement des stations'
      ),
      withErrorHandling(
        () => api.get('/fournisseurs'),
        'Erreur lors du chargement des fournisseurs'
      )
    ]);
    
    stations.value = stationsResponse.data;
    fournisseurs.value = fournisseursResponse.data;
  } catch (error) {
    console.error('Error fetching entities:', error);
  }
};

// Reset entiteId when role changes
const handleRoleChange = () => {
  formState.entiteId = null;
};

const handleSubmit = async () => {
  await execute(async () => {
    await withErrorHandling(
      () => api.put(`/users/${props.user._id}`, formState),
      'Erreur lors de la mise à jour de l\'utilisateur'
    );
    
    // Show success notification
    success('Utilisateur mis à jour avec succès');
    
    // Emit the success event with the updated user data
    emit('updated');
  });
};

onMounted(fetchEntities);
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <div>
        <label for="edit-nomComplet" class="block text-sm font-medium text-gray-700">Nom Complet</label>
        <input type="text" v-model="formState.nomComplet" id="edit-nomComplet" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
      </div>
      <div>
        <label for="edit-email" class="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" v-model="formState.email" id="edit-email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
      </div>
      <div>
        <label for="edit-role" class="block text-sm font-medium text-gray-700">Rôle</label>
        <select v-model="formState.role" @change="handleRoleChange" id="edit-role" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required>
            <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
        </select>
      </div>
      
      <!-- Entity selection field (appears when role is Station or Fournisseur) -->
      <div v-if="shouldShowEntitySelection">
        <label for="edit-entiteId" class="block text-sm font-medium text-gray-700">{{ entityLabel }}</label>
        <select v-model="formState.entiteId" id="edit-entiteId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required>
            <option v-for="entity in entityOptions" :key="entity._id" :value="entity._id">{{ entity.nom }}</option>
        </select>
      </div>
    </div>
    <div class="mt-8 flex justify-end space-x-3">
      <Button type="button" variant="secondary" @click="$emit('close')">Annuler</Button>
      <Button type="submit" variant="primary" :loading="isLoading">Mettre à jour</Button>
    </div>
  </form>
</template>
