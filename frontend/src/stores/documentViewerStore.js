// frontend/src/stores/documentViewerStore.js
import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useDocumentViewerStore = defineStore('documentViewer', () => {
    const isOpen = ref(false);
    const documentUrl = ref(null);
    const title = ref('');

    function open(url, docTitle = 'Document') {
        documentUrl.value = url;
        title.value = docTitle;
        isOpen.value = true;
    }

    function close() {
        isOpen.value = false;
        documentUrl.value = null;
        title.value = '';
    }

    return { isOpen, documentUrl, title, open, close };
});
