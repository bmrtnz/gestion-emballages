<script setup>
import { useDocumentViewerStore } from '../stores/documentViewerStore';
import VuePdfEmbed from 'vue-pdf-embed';

const documentViewerStore = useDocumentViewerStore();
</script>

<template>
    <a-drawer
        :open="documentViewerStore.isOpen"
        :title="documentViewerStore.title"
        width="50%"
        @close="documentViewerStore.close"
    >
        <vue-pdf-embed 
            v-if="documentViewerStore.documentUrl" 
            :source="documentViewerStore.documentUrl" 
        />
        <a-empty v-else description="Aucun document à afficher." />
    </a-drawer>
</template>

<style scoped>
iframe {
    border-radius: 8px;
}
</style>
