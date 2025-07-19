<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import api from '../../api/axios';
import Button from '../ui/Button.vue';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const emit = defineEmits(['created', 'close']);

const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

const roles = ['Manager', 'Gestionnaire', 'Station', 'Fournisseur'];

const formState = reactive({
  nomComplet: '',
  email: '',
  role: null,
  password: '',
  entiteId: null,
});

const stations = ref([]);
const fournisseurs = ref([]);
const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

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
        () => api.get('/stations', { params: { status: 'active', limit: 1000 } }),
        'Erreur lors du chargement des stations'
      ),
      withErrorHandling(
        () => api.get('/fournisseurs', { params: { status: 'active', limit: 1000 } }),
        'Erreur lors du chargement des fournisseurs'
      )
    ]);
    
    // Extract data from paginated response
    stations.value = stationsResponse.data.data || stationsResponse.data;
    fournisseurs.value = fournisseursResponse.data.data || fournisseursResponse.data;
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
      () => api.post('/users', formState),
      'Erreur lors de la création de l\'utilisateur'
    );
    emit('created');
  });
};

onMounted(fetchEntities);
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <div>
        <label for="nomComplet" class="block text-sm font-medium text-gray-700">Nom Complet</label>
        <input type="text" v-model="formState.nomComplet" id="nomComplet" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
      </div>
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" v-model="formState.email" id="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
      </div>
      <div>
        <label for="role" class="block text-sm font-medium text-gray-700">Rôle</label>
        <select v-model="formState.role" @change="handleRoleChange" id="role" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required>
            <option value="">Sélectionner un rôle</option>
            <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
        </select>
      </div>
      
      <!-- Entity selection field (appears when role is Station or Fournisseur) -->
      <div v-if="shouldShowEntitySelection">
        <label for="entiteId" class="block text-sm font-medium text-gray-700">{{ entityLabel }}</label>
        <select v-model="formState.entiteId" id="entiteId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required>
            <option value="">Sélectionner {{ entityLabel.toLowerCase() }}</option>
            <option v-for="entity in entityOptions" :key="entity._id" :value="entity._id">{{ entity.nom }}</option>
        </select>
      </div>
       <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
        <div class="relative mt-1">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            v-model="formState.password" 
            id="password" 
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pr-10 sm:text-sm" 
            required 
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            @click="togglePasswordVisibility"
          >
            <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-500" />
            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        </div>
      </div>
    </div>
    <div class="mt-8 flex justify-end space-x-3">
      <Button type="button" variant="secondary" @click="$emit('close')">Annuler</Button>
      <Button type="submit" variant="primary" :loading="isLoading">Créer</Button>
    </div>
  </form>
</template>
