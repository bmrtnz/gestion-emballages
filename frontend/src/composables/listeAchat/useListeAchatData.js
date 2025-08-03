// frontend/src/composables/listeAchat/useListeAchatData.js
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import api from '../../api/axios';
import { useListeAchatStore } from '../../stores/listeAchatStore';
import { useErrorHandler } from '../useErrorHandler';
import { notification } from '../useNotification';

/**
 * Composable pour la gestion des données de la liste d'achat
 * Responsable de: 
 * - Chargement des articles avec fournisseurs
 * - Gestion de l'état de la liste d'achat active
 * - Opérations CRUD sur les items de la liste
 */
export function useListeAchatData() {
  const listeAchatStore = useListeAchatStore();
  const { handleError } = useErrorHandler();
  
  const { activeList: activeListeAchat } = storeToRefs(listeAchatStore);
  
  // État local
  const availableArticles = ref([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  
  /**
   * Charge les articles avec les données des fournisseurs
   */
  const loadAvailableArticles = async () => {
    if (availableArticles.value.length > 0) {
      return; // Déjà chargés
    }
    
    try {
      const response = await api.get('/articles/all-active', {
        params: { includeSuppliers: 'true' }
      });
      
      // Gestion flexible de la structure de réponse
      let articlesData = [];
      if (response.data.success && response.data.data) {
        articlesData = response.data.data;
      } else if (response.data.data) {
        articlesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        articlesData = response.data;
      }
      
      availableArticles.value = articlesData;
      console.log(`Loaded ${articlesData.length} articles with suppliers`);
      
    } catch (error) {
      handleError(error, 'Erreur lors du chargement des articles');
      availableArticles.value = [];
    }
  };
  
  /**
   * Charge la liste d'achat active
   */
  const loadActiveList = async () => {
    try {
      await listeAchatStore.fetchActiveList();
    } catch (error) {
      handleError(error, 'Erreur lors du chargement de la liste d\'achat');
    }
  };
  
  /**
   * Charge toutes les données initiales
   */
  const loadInitialData = async () => {
    isLoading.value = true;
    try {
      await Promise.all([
        loadActiveList(),
        loadAvailableArticles()
      ]);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Ajoute un item à la liste d'achat
   */
  const addItemToList = async (itemData) => {
    try {
      await listeAchatStore.addItem(itemData);
      notification.success('Article ajouté à la liste d\'achat');
      return true;
    } catch (error) {
      handleError(error, 'Erreur lors de l\'ajout de l\'article');
      return false;
    }
  };
  
  /**
   * Supprime un item de la liste d'achat
   */
  const removeItemFromList = async (itemId) => {
    try {
      await listeAchatStore.removeItem(itemId);
      notification.success('Article supprimé de la liste');
      return true;
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de l\'article');
      return false;
    }
  };
  
  /**
   * Valide la liste et crée les commandes
   */
  const validateList = async () => {
    if (!activeListeAchat.value?.articles?.length) {
      notification.warning('Votre liste d\'achat est vide.');
      return false;
    }
    
    isSubmitting.value = true;
    try {
      await api.post('/listes-achat/validate');
      notification.success('Commandes créées avec succès ! Vous allez être redirigé.');
      await loadActiveList(); // Recharger la liste
      return true;
    } catch (error) {
      handleError(error, 'Erreur lors de la validation de la liste');
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };
  
  /**
   * Obtient les détails d'un article par son ID
   */
  const getArticleDetails = (articleId) => {
    return availableArticles.value.find(article => article._id === articleId);
  };
  
  /**
   * Obtient les détails d'un fournisseur pour un article donné
   */
  const getSupplierDetails = (articleId, fournisseurId) => {
    const article = getArticleDetails(articleId);
    if (!article?.fournisseurs) return null;
    
    return article.fournisseurs.find(f => f.fournisseurId._id === fournisseurId);
  };
  
  /**
   * Calcule le prix total d'un item du panier
   */
  const calculateItemTotal = (item) => {
    const article = getArticleDetails(item.articleId);
    const supplier = getSupplierDetails(item.articleId, item.fournisseurId);
    
    if (!article || !supplier) return 0;
    
    const quantiteParConditionnement = supplier.quantiteParConditionnement || 
                                       article.quantiteParConditionnement || 1;
    const prixUnitaire = supplier.prixUnitaire || 0;
    
    return item.quantite * quantiteParConditionnement * prixUnitaire;
  };
  
  /**
   * Calcule le montant total de la liste
   */
  const totalAmount = computed(() => {
    if (!activeListeAchat.value?.articles) return 0;
    
    return activeListeAchat.value.articles.reduce((total, item) => {
      return total + calculateItemTotal(item);
    }, 0);
  });
  
  /**
   * Indique si la liste peut être validée
   */
  const canValidateList = computed(() => {
    return activeListeAchat.value?.articles?.length > 0 && !isSubmitting.value;
  });
  
  return {
    // État
    availableArticles,
    activeListeAchat,
    isLoading,
    isSubmitting,
    
    // Computed
    totalAmount,
    canValidateList,
    
    // Méthodes
    loadInitialData,
    loadAvailableArticles,
    loadActiveList,
    addItemToList,
    removeItemFromList,
    validateList,
    getArticleDetails,
    getSupplierDetails,
    calculateItemTotal
  };
}