<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from './components/layout/AppLayout.vue';
import NotificationContainer from './components/ui/NotificationContainer.vue';

const route = useRoute();
const showLayout = computed(() => route.path !== '/login');
</script>

<template>
  <div>
    <AppLayout v-if="showLayout">
      <router-view />
    </AppLayout>
    <router-view v-else />
    <NotificationContainer />
  </div>
</template>
