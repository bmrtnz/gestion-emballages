<script setup>
import { ref } from 'vue';
import FournisseurList from '../components/FournisseurList.vue';
import FournisseurCreateForm from '../components/fournisseurs/FournisseurCreateForm.vue';
import Button from '../components/ui/Button.vue';
import SlidePanel from '../components/ui/SlidePanel.vue';

const isCreatePanelOpen = ref(false);
const fournisseurListRef = ref(null);

const handleAddFournisseur = () => {
  isCreatePanelOpen.value = true;
};

const handleFournisseurCreated = () => {
  isCreatePanelOpen.value = false;
  // Refresh the fournisseur list after creation
  if (fournisseurListRef.value) {
    fournisseurListRef.value.fetchFournisseurs();
  }
};
</script>

<template>
    <div>
        <div class="sm:flex sm:items-center mb-8">
            <div class="sm:flex-auto">
                <h1 class="text-3xl font-bold text-gray-900">Fournisseurs</h1>
                <p class="mt-1 text-sm text-gray-500">Gérez tous vos fournisseurs ici.</p>
            </div>
            <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Button variant="primary" size="md" @click="handleAddFournisseur">Ajouter un Fournisseur</Button>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-soft p-6">
            <FournisseurList ref="fournisseurListRef" />
        </div>

        <SlidePanel :open="isCreatePanelOpen" @close="isCreatePanelOpen = false" title="Ajouter un nouveau fournisseur" size="md">
            <FournisseurCreateForm @created="handleFournisseurCreated" @close="isCreatePanelOpen = false" />
        </SlidePanel>
    </div>
</template>