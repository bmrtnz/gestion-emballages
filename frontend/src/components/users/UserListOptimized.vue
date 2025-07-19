<script setup>
import { ref, computed } from 'vue';
import { useUserList } from '../../composables/users/useUserList';
import { PencilSquareIcon, PlayIcon, PauseIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import SlidePanel from '../ui/SlidePanel.vue';
import UserEditForm from './UserEditForm.vue';
import Select from '../ui/Select.vue';
import Button from '../ui/Button.vue';
import VirtualList from '../ui/VirtualList.vue';

// Props
const props = defineProps({
  useVirtualScrolling: {
    type: Boolean,
    default: true
  },
  virtualItemHeight: {
    type: Number,
    default: 80 // Height for table row
  },
  virtualContainerHeight: {
    type: Number,
    default: 600
  },
  virtualOverscan: {
    type: Number,
    default: 3
  }
});

// Use the composable
const {
  // Data
  transformedUsers,
  selectedUser,
  isLoading,
  
  // Filters
  searchQuery,
  statusFilter,
  roleFilter,
  showFilters,
  statusOptions,
  roleOptions,
  activeFiltersCount,
  showStatusFilter,
  showRoleFilter,
  
  // Pagination
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPrevPage,
  paginationInfo,
  
  // Strategy-based UI behavior
  showCreateButton,
  showAdvancedFilters,
  
  // Methods
  fetchUsers,
  deactivateUser,
  reactivateUser,
  toggleFilters,
  clearFilters,
  goToPage,
  goToPrevPage,
  goToNextPage,
  goToFirstPage,
  goToLastPage,
  changePageSize,
  selectUser,
  
  // Strategy-based action methods
  getAvailableActions,
  canEditUser,
  canDeactivateUser,
  canReactivateUser
} = useUserList();

// Local UI state
const isEditPanelOpen = ref(false);
const editingUser = ref(null);

// Check if we should use virtual scrolling
const shouldUseVirtualScrolling = computed(() => {
  return props.useVirtualScrolling && transformedUsers.value.length > 100;
});

// UI methods
const openEditPanel = (user) => {
  editingUser.value = user;
  isEditPanelOpen.value = true;
};

const handleUserUpdated = () => {
  isEditPanelOpen.value = false;
  editingUser.value = null;
  fetchUsers();
};

const closeEditPanel = () => {
  isEditPanelOpen.value = false;
  editingUser.value = null;
};

// Expose fetchUsers for parent component
defineExpose({ fetchUsers });
</script>

<template>
  <div class="space-y-6">
    <!-- Search and Filters -->
    <div class="space-y-4">
      <!-- Search Bar and Filter Toggle -->
      <div class="flex items-center space-x-4">
        <button
          @click="toggleFilters"
          class="flex-shrink-0 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FunnelIcon class="h-4 w-4 mr-2" />
          Filtres
          <span v-if="activeFiltersCount > 0" class="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-600 bg-primary-100 rounded-full">
            {{ activeFiltersCount }}
          </span>
          <ChevronDownIcon 
            class="ml-2 h-4 w-4 transition-transform duration-200" 
            :class="{ 'rotate-180': showFilters }"
          />
        </button>
        
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Rechercher par nom, email ou entité..."
          />
        </div>
      </div>

      <!-- Filters Panel -->
      <div v-if="showFilters" class="p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div v-if="showStatusFilter">
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <Select
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Sélectionner un statut"
            />
          </div>
          
          <div v-if="showRoleFilter">
            <label class="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
            <Select
              v-model="roleFilter"
              :options="roleOptions"
              placeholder="Sélectionner un rôle"
            />
          </div>
          
          <!-- Two empty columns for future filters -->
          <div></div>
          <div></div>
        </div>
        
        <div class="flex justify-end">
          <Button variant="secondary" size="sm" @click="clearFilters">
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    </div>

    <!-- Mobile View -->
    <div class="block md:hidden">
      <div class="space-y-3">
        <div
          v-for="user in transformedUsers"
          :key="user._id"
          class="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-gray-900 truncate">{{ user.nomComplet }}</h3>
                <span 
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ml-2"
                  :class="user.statusClass"
                >
                  {{ user.displayStatus }}
                </span>
              </div>
              <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ user.displayRole }}
                <span v-if="user.displayEntity && user.displayEntity !== '-'">
                  ({{ user.displayEntity }})
                </span>
              </p>
            </div>
          </div>
          <div class="mt-3 flex justify-end gap-x-2">
            <button 
              v-if="canEditUser(user)"
              @click="openEditPanel(user)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <PencilSquareIcon class="h-5 w-5" />
            </button>
            <button 
              v-if="canDeactivateUser(user)"
              @click="deactivateUser(user._id)" 
              class="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              title="Désactiver"
            >
              <PauseIcon class="h-5 w-5" />
            </button>
            <button 
              v-if="canReactivateUser(user)"
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

    <!-- Desktop View -->
    <div class="hidden md:block flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="relative">
            <!-- Table Header (always visible) -->
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
            </table>
            
            <!-- Table Body with Virtual Scrolling -->
            <div v-if="shouldUseVirtualScrolling">
              <VirtualList
                :items="transformedUsers"
                :item-height="virtualItemHeight"
                :container-height="virtualContainerHeight"
                :overscan="virtualOverscan"
                :key-field="'_id'"
              >
                <template #default="{ item: user }">
                  <table class="min-w-full table-fixed">
                    <tbody>
                      <tr class="border-t border-gray-200">
                        <td class="min-w-[12rem] whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">{{ user.nomComplet }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ user.email }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {{ user.displayRole }}
                          <span v-if="user.displayEntity && user.displayEntity !== '-'" class="text-gray-400">
                            ({{ user.displayEntity }})
                          </span>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm">
                          <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset" :class="user.statusClass">
                            {{ user.displayStatus }}
                          </span>
                        </td>
                        <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                          <div class="flex items-center justify-end gap-x-2">
                            <button v-if="canEditUser(user)" @click="openEditPanel(user)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors" title="Modifier">
                              <PencilSquareIcon class="h-5 w-5" />
                            </button>
                            <button v-if="canDeactivateUser(user)" @click="deactivateUser(user._id)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors" title="Désactiver">
                              <PauseIcon class="h-5 w-5" />
                            </button>
                            <button v-if="canReactivateUser(user)" @click="reactivateUser(user._id)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors" title="Réactiver">
                              <PlayIcon class="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </template>
              </VirtualList>
            </div>
            
            <!-- Regular Table Body (no virtual scrolling) -->
            <table v-else class="min-w-full table-fixed divide-y divide-gray-300">
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="user in transformedUsers" :key="user._id">
                  <td class="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">{{ user.nomComplet }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ user.email }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ user.displayRole }}
                    <span v-if="user.displayEntity && user.displayEntity !== '-'" class="text-gray-400">
                      ({{ user.displayEntity }})
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset" :class="user.statusClass">
                      {{ user.displayStatus }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                    <div class="flex items-center justify-end gap-x-2">
                      <button v-if="canEditUser(user)" @click="openEditPanel(user)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors" title="Modifier">
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button v-if="canDeactivateUser(user)" @click="deactivateUser(user._id)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors" title="Désactiver">
                        <PauseIcon class="h-5 w-5" />
                      </button>
                      <button v-if="canReactivateUser(user)" @click="reactivateUser(user._id)" class="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors" title="Réactiver">
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
    
    <!-- Virtual Scrolling Indicator -->
    <div v-if="shouldUseVirtualScrolling" class="text-center text-sm text-gray-500 mt-2">
      <span class="inline-flex items-center">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        Défilement virtuel activé pour optimiser les performances
      </span>
    </div>
    
    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          @click="goToPrevPage"
          :disabled="!hasPrevPage"
          class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button
          @click="goToNextPage"
          :disabled="!hasNextPage"
          class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Affichage de <span class="font-medium">{{ paginationInfo.start }}</span> à 
            <span class="font-medium">{{ paginationInfo.end }}</span> sur 
            <span class="font-medium">{{ paginationInfo.total }}</span> résultats
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <label for="page-size" class="text-sm text-gray-700">Afficher:</label>
          <select
            id="page-size"
            @change="changePageSize(parseInt($event.target.value))"
            :value="itemsPerPage"
            class="rounded-md border-gray-300 py-1 text-sm"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span class="text-sm text-gray-700">par page</span>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <!-- First page button -->
            <button
              @click="goToFirstPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Première page"
            >
              <span class="sr-only">Première page</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Previous page button -->
            <button
              @click="goToPrevPage"
              :disabled="!hasPrevPage"
              class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Précédent</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Page numbers -->
            <template v-for="page in Array.from({length: Math.min(5, totalPages)}, (_, i) => {
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, start + 4);
              return start + i;
            }).filter(p => p <= totalPages)" :key="page">
              <button
                @click="goToPage(page)"
                :class="[
                  page === currentPage
                    ? 'relative z-10 inline-flex items-center bg-primary-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                    : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                ]"
              >
                {{ page }}
              </button>
            </template>
            
            <!-- Next page button -->
            <button
              @click="goToNextPage"
              :disabled="!hasNextPage"
              class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Suivant</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Last page button -->
            <button
              @click="goToLastPage"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Dernière page"
            >
              <span class="sr-only">Dernière page</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.21 5.23a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08L8.168 10 4.23 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08L14.168 10 10.23 6.29a.75.75 0 01-.02-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Panel -->
  <SlidePanel 
    :open="isEditPanelOpen" 
    @close="closeEditPanel" 
    title="Modifier l'utilisateur"
    size="md"
  >
    <UserEditForm 
      v-if="editingUser"
      :user="editingUser"
      @updated="handleUserUpdated"
      @close="closeEditPanel"
    />
  </SlidePanel>
</template>