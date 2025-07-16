<script>
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
    <div>
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">
                <span v-if="authStore.userRole === 'Fournisseur'">Mes Commandes à Traiter</span>
                <span v-else>Suivi des Commandes</span>
            </h1>
            <p class="mt-1 text-sm text-gray-500">Suivez et gérez toutes les commandes des stations ici.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-soft p-6">
            <FournisseurCommandeList v-if="authStore.isAuthenticated && authStore.userRole === 'Fournisseur'" />
            <CommandeList v-if="authStore.isAuthenticated && authStore.userRole !== 'Fournisseur'" />
        </div>
    </div>
</template>
