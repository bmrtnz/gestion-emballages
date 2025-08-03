// frontend/src/composables/listeAchat/useListeAchat.js
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useListeAchatData } from './useListeAchatData';
import { useListeAchatUI } from './useListeAchatUI';
import { useListeAchatPerformance } from './useListeAchatPerformance';
import { ListeAchatStrategyFactory } from '../../strategies/listeAchat';

/**
 * Composable principal orchestrant toute la fonctionnalité de la liste d'achat
 * Suit le pattern d'orchestration défini dans DESIGN.md
 * Combine les composables spécialisés et applique la stratégie selon le rôle
 */
export function useListeAchat() {
  const router = useRouter();
  const authStore = useAuthStore();
  
  // Initialisation des composables spécialisés
  const dataComposable = useListeAchatData();
  const uiComposable = useListeAchatUI();
  const performanceComposable = useListeAchatPerformance();
  
  // Création de la stratégie selon le rôle utilisateur
  const strategy = computed(() => {
    return ListeAchatStrategyFactory.createStrategy(
      authStore.userRole,
      authStore.userEntiteId
    );
  });
  
  // Vérification d'accès
  const hasAccess = computed(() => {
    return ListeAchatStrategyFactory.hasListeAchatAccess(authStore.userRole);
  });
  
  // Configuration UI selon la stratégie
  const uiBehavior = computed(() => {
    return strategy.value.getUIBehavior();
  });
  
  // Options d'articles avec transformation selon la stratégie
  const articleOptions = computed(() => {
    const availableArticles = strategy.value.getAvailableArticles(
      dataComposable.availableArticles.value
    );
    
    // articleOptions.value returns a function that we need to call with availableArticles
    return uiComposable.articleOptions.value(availableArticles);
  });
  
  // Options de catégories avec comptage
  const categoriesWithCount = computed(() => {
    const availableArticles = strategy.value.getAvailableArticles(
      dataComposable.availableArticles.value
    );
    
    return uiComposable.getCategoriesWithCount(availableArticles);
  });
  
  // Articles filtrés (pour affichage du nombre)
  const filteredArticlesCount = computed(() => {
    const availableArticles = strategy.value.getAvailableArticles(
      dataComposable.availableArticles.value
    );
    
    return uiComposable.getFilteredArticles(availableArticles).length;
  });
  
  // Fournisseurs disponibles selon la stratégie
  const availableSuppliers = computed(() => {
    if (!uiComposable.selectedArticle.value) return [];
    
    return strategy.value.getAvailableSuppliers(uiComposable.selectedArticle.value);
  });
  
  // Données de la liste transformées selon la stratégie
  const transformedListData = computed(() => {
    return strategy.value.transformListData(dataComposable.activeListeAchat.value);
  });
  
  // Permissions selon la stratégie
  const permissions = computed(() => ({
    canCreateList: strategy.value.canCreateList(),
    canAddItems: strategy.value.canAddItems(),
    canRemoveItems: strategy.value.canRemoveItems(),
    canValidateList: strategy.value.canValidateList()
  }));
  
  /**
   * Gère la sélection d'un article avec validation selon la stratégie
   */
  const handleArticleSelect = (articleId) => {
    const availableArticles = strategy.value.getAvailableArticles(
      dataComposable.availableArticles.value
    );
    
    uiComposable.handleArticleSelect(articleId, availableArticles);
  };
  
  /**
   * Ajoute un item au panier avec validation selon la stratégie
   */
  const handleAddToCart = async () => {
    if (!permissions.value.canAddItems) {
      console.warn('Utilisateur non autorisé à ajouter des items');
      return false;
    }
    
    const itemData = uiComposable.getItemDataForCart();
    if (!itemData) {
      console.warn('Données d\'item invalides');
      return false;
    }
    
    // Validation selon la stratégie
    const validation = strategy.value.validateItemAddition(itemData);
    if (!validation.isValid) {
      console.error('Validation échouée:', validation.errors);
      return false;
    }
    
    const success = await dataComposable.addItemToList(itemData);
    if (success) {
      uiComposable.resetArticleSelection();
    }
    
    return success;
  };
  
  /**
   * Supprime un item du panier avec vérification des permissions
   */
  const handleRemoveFromCart = async (itemId) => {
    if (!permissions.value.canRemoveItems) {
      console.warn('Utilisateur non autorisé à supprimer des items');
      return false;
    }
    
    return await dataComposable.removeItemFromList(itemId);
  };
  
  /**
   * Valide la liste avec vérification des permissions
   */
  const handleValidateList = async () => {
    if (!permissions.value.canValidateList) {
      console.warn('Utilisateur non autorisé à valider la liste');
      return false;
    }
    
    const success = await dataComposable.validateList();
    if (success) {
      router.push('/commandes');
    }
    
    return success;
  };
  
  /**
   * Obtient les détails formatés d'un item selon la stratégie
   */
  const getFormattedItemDetails = (item) => {
    const articleDetails = dataComposable.getArticleDetails(item.articleId);
    const supplierDetails = dataComposable.getSupplierDetails(item.articleId, item.fournisseurId);
    
    if (strategy.value.formatItemForDisplay) {
      return strategy.value.formatItemForDisplay(item, articleDetails, supplierDetails);
    }
    
    // Fallback par défaut
    return {
      article: articleDetails,
      supplier: supplierDetails,
      total: dataComposable.calculateItemTotal(item)
    };
  };
  
  /**
   * Obtient les actions disponibles pour un item selon la stratégie
   */
  const getItemActions = (item) => {
    return strategy.value.getItemActions(item);
  };
  
  // Initialisation
  onMounted(async () => {
    if (!hasAccess.value) {
      console.warn('Accès non autorisé à la liste d\'achat');
      router.push('/');
      return;
    }
    
    await dataComposable.loadInitialData();
  });
  
  return {
    // Composables spécialisés
    ...dataComposable,
    ...uiComposable,
    ...performanceComposable,
    
    // État et computed spécifiques à l'orchestrateur
    strategy,
    hasAccess,
    uiBehavior,
    articleOptions,
    categoriesWithCount,
    filteredArticlesCount,
    availableSuppliers,
    transformedListData,
    permissions,
    
    // Méthodes orchestrées
    handleArticleSelect,
    handleAddToCart,
    handleRemoveFromCart,
    handleValidateList,
    getFormattedItemDetails,
    getItemActions,
    
    // Méthodes de performance
    formatCurrency: performanceComposable.formatCurrency,
    formatNumber: performanceComposable.formatNumber
  };
}