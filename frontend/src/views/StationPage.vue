<script setup>
import { ref } from 'vue';
import StationList from '../components/StationList.vue';
import StationCreateForm from '../components/stations/StationCreateForm.vue';
import Button from '../components/ui/Button.vue';
import SlidePanel from '../components/ui/SlidePanel.vue';

const isCreatePanelOpen = ref(false);
const stationListRef = ref(null);

const handleStationCreated = () => {
  isCreatePanelOpen.value = false;
  if (stationListRef.value) {
    stationListRef.value.fetchStations();
  }
};
</script>

<template>
    <div>
        <div class="sm:flex sm:items-center mb-8">
            <div class="sm:flex-auto">
                <h1 class="text-3xl font-bold text-gray-900">Stations</h1>
                <p class="mt-1 text-sm text-gray-500">Gérez toutes vos stations ici.</p>
            </div>
            <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Button variant="primary" size="md" @click="isCreatePanelOpen = true">Ajouter une Station</Button>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-soft p-6">
            <StationList ref="stationListRef" />
        </div>

        <SlidePanel :open="isCreatePanelOpen" @close="isCreatePanelOpen = false" title="Ajouter une nouvelle station" size="md">
            <StationCreateForm @created="handleStationCreated" @close="isCreatePanelOpen = false" />
        </SlidePanel>
    </div>
</template>