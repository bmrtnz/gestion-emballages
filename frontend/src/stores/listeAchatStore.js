// frontend/src/stores/listeAchatStore.js
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useLoading } from "../composables/useLoading";
import { useErrorHandler } from "../composables/useErrorHandler";
import api from "../api/axios";
import { message } from "ant-design-vue";

export const useListeAchatStore = defineStore("listeAchat", () => {
  // STATE
  const activeList = ref(null);

  // Composables
  const { isLoading: fetchLoading, execute: executeFetch } = useLoading();
  const { isLoading: actionLoading, execute: executeAction } = useLoading();
  const { withErrorHandling } = useErrorHandler();

  // GETTERS
  const itemCount = computed(() => activeList.value?.articles?.length || 0);
  const isLoading = computed(() => fetchLoading.value || actionLoading.value);

  // ACTIONS
  async function fetchActiveList() {
    return executeFetch(async () => {
      const response = await withErrorHandling(
        () => api.get("/listes-achat"),
        "Impossible de charger la liste d'achat active",
        false // Ne pas afficher de notification d'erreur par défaut
      );
      activeList.value = response.data;
      return response.data;
    });
  }

  async function addItem(itemData) {
    return executeAction(async () => {
      const response = await withErrorHandling(
        () => api.post("/listes-achat", itemData),
        "Erreur lors de l'ajout de l'article"
      );
      activeList.value = response.data;
      message.success("Article ajouté à la liste.");
      return response.data;
    });
  }

  async function removeItem(itemId) {
    return executeAction(async () => {
      const response = await withErrorHandling(
        () => api.delete(`/listes-achat/items/${itemId}`),
        "Erreur lors de la suppression de l'article"
      );
      activeList.value = response.data;
      message.success("Article retiré de la liste.");
      return response.data;
    });
  }

  function clearList() {
    activeList.value = null;
  }

  return {
    activeList,
    itemCount,
    isLoading,
    fetchLoading,
    actionLoading,
    fetchActiveList,
    clearList,
    addItem,
    removeItem,
  };
});
