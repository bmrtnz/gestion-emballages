<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import SupplierStockPage from './SupplierStockPage.vue';

const authStore = useAuthStore();

const currentComponent = computed(() => {
  switch (authStore.userRole) {
    case 'Fournisseur':
      return SupplierStockPage;
    case 'Station':
      // TODO: Implement StationStockPage
      return { template: '<div class="text-center py-12"><h2 class="text-xl font-medium text-gray-900 mb-2">Gestion des stocks station</h2><p class="text-gray-500">Fonctionnalité en développement</p></div>' };
    case 'Gestionnaire':
    case 'Manager':
      // TODO: Implement ManagerStockPage with overview of all stocks
      return { template: '<div class="text-center py-12"><h2 class="text-xl font-medium text-gray-900 mb-2">Vue d\'ensemble des stocks</h2><p class="text-gray-500">Fonctionnalité en développement</p></div>' };
    default:
      return { template: '<div class="text-center py-12"><h2 class="text-xl font-medium text-gray-900 mb-2">Accès non autorisé</h2><p class="text-gray-500">Votre rôle ne permet pas d\'accéder à cette page</p></div>' };
  }
});
</script>

<template>
  <component :is="currentComponent" />
</template>