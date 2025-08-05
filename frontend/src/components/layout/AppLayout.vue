<script setup>
import { ref } from 'vue';
import Sidebar from '../SideBar.vue';
import { Bars3Icon } from '@heroicons/vue/24/outline';

const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);

const toggleSidebarCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
};
</script>

<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- Animated gradient background -->
    <div class="absolute inset-0 bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20"></div>
    <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-sunshine-50/10 to-energy-50/10"></div>
    
    <!-- Content wrapper -->
    <div class="relative">
      <Sidebar 
        :sidebar-open="sidebarOpen" 
        :sidebar-collapsed="sidebarCollapsed"
        @close-sidebar="sidebarOpen = false" 
        @toggle-sidebar-collapse="toggleSidebarCollapse"
      />
    
    <!-- Mobile header -->
    <div class="sticky top-0 z-40 flex items-center gap-x-6 bg-white/95 backdrop-blur-sm px-4 py-4 shadow-sm sm:px-6 lg:hidden">
      <button
        type="button"
        class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        @click="sidebarOpen = true"
      >
        <span class="sr-only">Ouvrir le menu</span>
        <Bars3Icon class="h-6 w-6" aria-hidden="true" />
      </button>
      <div class="flex-1 text-sm font-semibold leading-6 text-gray-900">
        Gestion Emballages
      </div>
    </div>
    
    <div class="transition-all duration-300" :class="[sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-72']">
      <main class="py-10">
        <div class="px-4 sm:px-6 lg:px-8">
          <slot />
        </div>
      </main>
    </div>
    </div>
  </div>
</template>
