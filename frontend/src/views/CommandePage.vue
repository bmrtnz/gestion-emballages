<script>
// Ce bloc est nécessaire pour nommer le composant pour KeepAlive
export default {
  name: "CommandePage",
};
</script>

<script setup>
import { useAuthStore } from "../stores/authStore";
import CommandeList from "../components/CommandeList.vue";
import FournisseurCommandeList from "../components/FournisseurCommandeList.vue";

const authStore = useAuthStore();
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>
        <span v-if="authStore.userRole === 'Fournisseur'"
          >Mes Commandes à Traiter</span
        >
        <span v-else>Suivi des Commandes</span>
      </h1>
    </div>

    <FournisseurCommandeList
      v-if="authStore.isAuthenticated && authStore.userRole === 'Fournisseur'"
    />
    <CommandeList
      v-if="authStore.isAuthenticated && authStore.userRole !== 'Fournisseur'"
    />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}
h1 {
  font-size: 1.5rem;
  font-weight: 500;
}
</style>
