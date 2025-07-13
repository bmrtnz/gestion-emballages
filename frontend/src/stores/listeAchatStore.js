// frontend/src/stores/listeAchatStore.js
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import api from "../api/axios";
import { message } from "ant-design-vue";

export const useListeAchatStore = defineStore("listeAchat", () => {
  // STATE
  const activeList = ref(null);

  // GETTERS
  const itemCount = computed(() => activeList.value?.articles?.length || 0);

  // ACTIONS
  async function fetchActiveList() {
    try {
      const response = await api.get("/listes-achat");
      activeList.value = response.data;
    } catch (error) {
      console.error("Impossible de charger la liste d'achat active.", error);
    }
  }

  async function addItem(itemData) {
    try {
      const response = await api.post("/listes-achat", itemData);
      activeList.value = response.data; // Mettre à jour le state
      message.success("Article ajouté à la liste.");
    } catch (err) {
      message.error("Erreur lors de l'ajout de l'article.");
    }
  }

  async function removeItem(itemId) {
    try {
      const response = await api.delete(`/listes-achat/items/${itemId}`);
      activeList.value = response.data; // Mettre à jour le state
      message.success("Article retiré de la liste.");
    } catch (err) {
      message.error("Erreur lors de la suppression de l'article.");
    }
  }

  function clearList() {
    activeList.value = null;
  }

  return {
    activeList,
    itemCount,
    fetchActiveList,
    clearList,
    addItem,
    removeItem,
  };
});
