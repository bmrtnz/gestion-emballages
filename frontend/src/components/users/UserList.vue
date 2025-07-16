<script setup>
import { ref, onMounted, computed } from 'vue';
import { useLoading } from '../../composables/useLoading';
import { useErrorHandler } from '../../composables/useErrorHandler';
import api from '../../api/axios';
import { PencilSquareIcon, PlayIcon, PauseIcon } from '@heroicons/vue/24/outline';
import SlidePanel from '../ui/SlidePanel.vue';
import UserEditForm from './UserEditForm.vue';

// State
const users = ref([]);
const showInactive = ref(false);
const isEditPanelOpen = ref(false);
const selectedUser = ref(null);

// Loading and error handling
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Fetch data
const fetchUsers = async () => {
  await execute(async () => {
    const response = await withErrorHandling(
      () => api.get('/users'),
      'Failed to load users'
    );
    users.value = response.data;
  });
};

const openEditPanel = (user) => {
    selectedUser.value = user;
    isEditPanelOpen.value = true;
};

const handleUserUpdated = () => {
    isEditPanelOpen.value = false;
    fetchUsers();
};

const softDeleteUser = async (userId) => {
    await execute(async () => {
        await withErrorHandling(
            () => api.delete(`/users/${userId}`),
            'Failed to delete user'
        );
        await fetchUsers(); // Refresh the list
    });
};

const reactivateUser = async (userId) => {
    await execute(async () => {
        await withErrorHandling(
            () => api.patch(`/users/${userId}/reactivate`),
            'Failed to reactivate user'
        );
        await fetchUsers(); // Refresh the list
    });
};

onMounted(fetchUsers);

// Computed property to filter users based on active/inactive toggle
const filteredUsers = computed(() => {
  if (!showInactive.value) {
    return users.value.filter(user => user.isActive);
  }
  return users.value;
});

// Expose fetchUsers function for parent component
defineExpose({ fetchUsers });
</script>

<template>
  <div>
    <!-- Filter controls -->
    <div class="flex items-center justify-end mb-4">
      <!-- Show inactive toggle -->
      <div class="flex items-center">
        <input 
          id="show-inactive-users" 
          v-model="showInactive" 
          type="checkbox" 
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label for="show-inactive-users" class="ml-2 block text-sm text-gray-900">
          <span class="hidden sm:inline">Afficher les utilisateurs inactifs</span>
          <span class="sm:hidden">Afficher les inactifs</span>
        </label>
      </div>
    </div>
    <!-- Mobile card view -->
    <div class="block md:hidden">
      <div class="space-y-3">
        <div
          v-for="user in filteredUsers"
          :key="user._id"
          class="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-gray-900 truncate">{{ user.nomComplet }}</h3>
                <span 
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ml-2"
                  :class="user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
                >
                  {{ user.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </div>
              <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ user.role }}
                <span v-if="user.entiteId && user.entiteId.nom">({{ user.entiteId.nom }})</span>
              </p>
            </div>
          </div>
          <div class="mt-3 flex justify-end gap-x-2">
            <button 
              @click="openEditPanel(user)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <PencilSquareIcon class="h-5 w-5" />
            </button>
            <button 
              v-if="user.isActive"
              @click="softDeleteUser(user._id)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Désactiver"
            >
              <PauseIcon class="h-5 w-5" />
            </button>
            <button 
              v-else
              @click="reactivateUser(user._id)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Réactiver"
            >
              <PlayIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <!-- Loading state for mobile -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    </div>

    <!-- Desktop table view -->
    <div class="hidden md:block flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div class="relative">
            <table class="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                <tr>
                    <th scope="col" class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">Nom Complet</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rôle</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span class="sr-only">Actions</span>
                    </th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="user in filteredUsers" :key="user._id">
                    <td class="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">{{ user.nomComplet }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ user.email }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {{ user.role }}
                        <span v-if="user.entiteId && user.entiteId.nom" class="text-gray-400">({{ user.entiteId.nom }})</span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium" :class="user.isActive ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'">
                            {{ user.isActive ? 'Actif' : 'Inactif' }}
                        </span>
                    </td>
                    <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div class="flex items-center justify-end gap-x-2">
                            <button 
                                @click="openEditPanel(user)" 
                                class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Modifier"
                            >
                                <PencilSquareIcon class="h-5 w-5" />
                            </button>
                            <button 
                                v-if="user.isActive"
                                @click="softDeleteUser(user._id)" 
                                class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Désactiver"
                            >
                                <PauseIcon class="h-5 w-5" />
                            </button>
                            <button 
                                v-else
                                @click="reactivateUser(user._id)" 
                                class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Réactiver"
                            >
                                <PlayIcon class="h-5 w-5" />
                            </button>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
            <div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
            </div>
        </div>
        </div>
    </div>
    <SlidePanel :open="isEditPanelOpen" @close="isEditPanelOpen = false" title="Modifier l'utilisateur" size="md">
        <UserEditForm v-if="selectedUser" :user="selectedUser" @updated="handleUserUpdated" @close="isEditPanelOpen = false" />
    </SlidePanel>
  </div>
</template>