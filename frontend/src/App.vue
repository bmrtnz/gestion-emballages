<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import SideBar from './components/SideBar.vue';
import Header from './components/Header.vue';

const route = useRoute();
const authStore = useAuthStore();

// --- Logique d'affichage du layout ---
// On n'affiche le layout principal (sidebar + header) que si l'on n'est pas sur la page de login
const showLayout = computed(() => route.path !== '/login');

// --- Logique pour le responsive ---
const isMobile = ref(window.innerWidth < 769);
const isDrawerOpen = ref(false);

const handleResize = () => {
  isMobile.value = window.innerWidth < 769;
};

// --- Cycle de vie du composant ---
// Essayer de récupérer les infos de l'utilisateur au démarrage si un token existe
authStore.fetchUser();

// Écouter les changements de taille de la fenêtre pour le responsive
onMounted(() => window.addEventListener('resize', handleResize));
onUnmounted(() => window.removeEventListener('resize', handleResize));
</script>

<template>
  <a-config-provider component-size="large">
    <div v-if="showLayout" class="app-layout">
      
      <SideBar 
        :is-drawer-mode="isMobile"
        :open="isDrawerOpen"
        @close="isDrawerOpen = false"
      />
      
      <div class="main-content" :class="{ 'shifted': !isMobile }">
        <Header @toggle-sidebar="isDrawerOpen = true" />
        <div class="view-container">
          <router-view />
        </div>
      </div>

    </div>
    
    <router-view v-else />

  </a-config-provider>
</template>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
}
.main-content {
  flex-grow: 1;
  transition: margin-left 0.2s;
  min-width: 0; /* Correction pour éviter les dépassements de flexbox */
}

.view-container {
  padding: 2rem;
}

/* Sur mobile, le layout principal ne doit pas être en flex pour que le header passe au-dessus */
@media (max-width: 768px) {
  .app-layout {
    display: block;
  }
}
</style>