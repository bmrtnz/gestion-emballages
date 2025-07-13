<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "./stores/authStore";
import { useListeAchatStore } from "./stores/listeAchatStore";
import SideBar from "./components/SideBar.vue";
import Header from "./components/Header.vue";
import DocumentViewer from "./components/DocumentViewer.vue";

const route = useRoute();
const authStore = useAuthStore();
const listeAchatStore = useListeAchatStore();

// Détermine si le layout principal doit être affiché (tout sauf /login)
const showLayout = computed(() => route.path !== "/login");

// --- Logique pour le responsive ---
const isMobile = ref(window.innerWidth < 769);
const isDrawerOpen = ref(false);

const handleResize = () => {
  isMobile.value = window.innerWidth < 769;
};

// --- Cycle de vie ---
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser && newUser.role === "Station") {
      listeAchatStore.fetchActiveList();
    } else {
      listeAchatStore.clearList();
    }
  },
  { immediate: true }
);

onMounted(() => {
  authStore.fetchUser(); // S'assurer que les infos utilisateur sont chargées
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => window.removeEventListener("resize", handleResize));
</script>

<template>
  <a-config-provider component-size="large">
    <div class="app-container">
      <SideBar
        v-if="showLayout"
        :is-drawer-mode="isMobile"
        :open="isDrawerOpen"
        @close="isDrawerOpen = false"
      />

      <div class="main-layout">
        <Header v-if="showLayout" @toggle-sidebar="isDrawerOpen = true" />

        <main
          class="main-content"
          :class="{ 'login-page-padding': !showLayout }"
        >
          <router-view v-slot="{ Component }">
            <keep-alive include="CommandePage">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </router-view>
        </main>

        <DocumentViewer />
      </div>
    </div>
  </a-config-provider>
</template>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: var(--content-bg);
}
.main-layout {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.main-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 2rem;
}
/* Supprime le padding pour la page de login */
.main-content.login-page-padding {
  padding: 0;
}
</style>
