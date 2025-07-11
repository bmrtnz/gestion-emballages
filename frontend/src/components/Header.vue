<script setup>
import { MenuOutlined } from '@ant-design/icons-vue';

// Ce composant émet un événement quand on clique sur le menu
const emit = defineEmits(['toggle-sidebar']);
</script>

<template>
  <header class="app-header">
    <a-button type="text" class="hamburger-menu" @click="emit('toggle-sidebar')">
      <MenuOutlined />
    </a-button>
    
    <h1 class="page-title">{{ $route.meta.title || 'Application' }}</h1>
  </header>
</template>

<style scoped>
.app-header {
  height: 64px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}
.page-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}
.hamburger-menu {
  font-size: 1.25rem;
  margin-right: 1rem;
  display: none; /* Caché par défaut */
}

/* Media Query pour les écrans de moins de 768px (taille tablette/mobile) */
@media (max-width: 768px) {
  .hamburger-menu {
    display: inline-block; /* Visible sur mobile */
  }
}
</style>