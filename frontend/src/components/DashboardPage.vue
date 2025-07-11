<script setup>
import StationList from './StationList.vue';
// Plus besoin de useRouter ici
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      </div>
    
    <StationList />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
</style>