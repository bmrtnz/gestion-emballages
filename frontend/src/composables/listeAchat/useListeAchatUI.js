// frontend/src/composables/listeAchat/useListeAchatUI.js
import { ref, computed } from 'vue';

/**
 * Composable pour la gestion de l'état de l'interface utilisateur de la liste d'achat
 * Responsable de:
 * - État de sélection des articles et fournisseurs
 * - Gestion des modales
 * - Filtres et recherche (catégorie + nom/code)
 * - Validation des formulaires
 */
export function useListeAchatUI() {
  // État de sélection
  const selectedArticle = ref(null);
  const selectedSupplier = ref(null);
  const quantityToAdd = ref(1);
  
  // Filtres de recherche (pattern comme StationStockPage)
  const selectedCategory = ref('');
  const articleNameFilter = ref('');
  const articleSearchFilter = ref(''); // Maintenu pour compatibilité
  
  // État des modales
  const showConfirmModal = ref(false);
  
  /**
   * Réinitialise la sélection d'article
   */
  const resetArticleSelection = () => {
    selectedArticle.value = null;
    selectedSupplier.value = null;
    quantityToAdd.value = 1;
    articleSearchFilter.value = '';
  };
  
  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = () => {
    selectedCategory.value = '';
    articleNameFilter.value = '';
    articleSearchFilter.value = '';
  };
  
  /**
   * Gère la sélection d'un article depuis le dropdown
   */
  const handleArticleSelect = (articleId, availableArticles) => {
    if (!articleId) {
      resetArticleSelection();
      return;
    }
    
    const article = availableArticles.find(a => a._id === articleId);
    if (article) {
      selectedArticle.value = article;
      selectedSupplier.value = null; // Réinitialiser la sélection du fournisseur
    } else {
      resetArticleSelection();
    }
  };
  
  /**
   * Gère la sélection d'un fournisseur
   */
  const handleSupplierSelect = (supplier) => {
    selectedSupplier.value = supplier;
  };
  
  /**
   * Gère le changement de quantité
   */
  const handleQuantityChange = (value) => {
    const quantity = parseInt(value) || 1;
    quantityToAdd.value = Math.max(1, quantity);
  };
  
  /**
   * Ouvre la modale de confirmation
   */
  const openConfirmModal = () => {
    showConfirmModal.value = true;
  };
  
  /**
   * Ferme la modale de confirmation
   */
  const closeConfirmModal = () => {
    showConfirmModal.value = false;
  };
  
  /**
   * Extrait les catégories uniques des articles disponibles
   */
  const getAvailableCategories = (availableArticles) => {
    if (!availableArticles?.length) return [];
    
    const categories = new Set();
    availableArticles.forEach(article => {
      if (article.categorie) {
        categories.add(article.categorie);
      }
    });
    
    return Array.from(categories).sort();
  };
  
  /**
   * Génère les options de catégories avec comptage
   */
  const getCategoriesWithCount = (availableArticles) => {
    if (!availableArticles?.length) return [];
    
    const categoryCount = {};
    availableArticles.forEach(article => {
      if (article.categorie) {
        categoryCount[article.categorie] = (categoryCount[article.categorie] || 0) + 1;
      }
    });
    
    return Object.entries(categoryCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, count]) => ({
        value: category,
        label: `${category} (${count})`
      }));
  };
  
  /**
   * Filtre les articles selon la catégorie et le terme de recherche
   */
  const getFilteredArticles = (availableArticles) => {
    if (!availableArticles?.length) return [];
    
    let filtered = [...availableArticles];
    
    // Filtre par catégorie si sélectionnée
    if (selectedCategory.value && selectedCategory.value !== '') {
      filtered = filtered.filter(article => article.categorie === selectedCategory.value);
    }
    
    // Filtre par nom/code si saisi
    if (articleNameFilter.value && articleNameFilter.value.trim()) {
      const searchTerm = articleNameFilter.value.toLowerCase().trim();
      filtered = filtered.filter(article =>
        article.designation.toLowerCase().includes(searchTerm) ||
        article.codeArticle.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  };
  
  /**
   * Options pour le dropdown d'articles avec filtrage
   */
  const articleOptions = computed(() => {
    // Cette fonction sera utilisée avec les articles disponibles
    return (availableArticles) => {
      const filtered = getFilteredArticles(availableArticles);
      
      return filtered.map(article => ({
        value: article._id,
        label: `${article.designation} (${article.codeArticle})`,
        article: article
      }));
    };
  });
  
  /**
   * Fonction de filtrage pour le dropdown d'articles
   */
  const filterArticleOption = (input, option) => {
    const searchTerm = input.toLowerCase();
    return option.label.toLowerCase().includes(searchTerm);
  };
  
  /**
   * Fournisseurs disponibles pour l'article sélectionné
   */
  const suppliersForSelectedArticle = computed(() => {
    if (!selectedArticle.value?.fournisseurs) return [];
    
    return selectedArticle.value.fournisseurs
      .filter(f => f.fournisseurId?._id && f.fournisseurId?.nom)
      .map(f => ({
        ...f,
        fournisseurId: f.fournisseurId,
        conditionnement: f.uniteConditionnement || 
                        selectedArticle.value.conditionnement || 'Unité',
        quantiteParConditionnement: f.quantiteParConditionnement || 
                                   selectedArticle.value.quantiteParConditionnement || 1,
        prixUnitaire: f.prixUnitaire || 0,
        totalPrice: (f.quantiteParConditionnement || 
                    selectedArticle.value.quantiteParConditionnement || 1) * 
                   (f.prixUnitaire || 0)
      }));
  });
  
  /**
   * Vérifie si la sélection est valide pour l'ajout au panier
   */
  const isValidSelection = computed(() => {
    return selectedArticle.value && 
           selectedSupplier.value && 
           quantityToAdd.value > 0;
  });
  
  /**
   * Calcule le total pour la quantité sélectionnée
   */
  const selectedTotal = computed(() => {
    if (!selectedSupplier.value || quantityToAdd.value <= 0) return 0;
    return quantityToAdd.value * selectedSupplier.value.totalPrice;
  });
  
  /**
   * Données à envoyer lors de l'ajout au panier
   */
  const getItemDataForCart = () => {
    if (!isValidSelection.value) return null;
    
    return {
      articleId: selectedArticle.value._id,
      fournisseurId: selectedSupplier.value.fournisseurId._id,
      quantite: quantityToAdd.value,
      dateSouhaiteeLivraison: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 semaine par défaut
    };
  };
  
  return {
    // État
    selectedArticle,
    selectedSupplier,
    quantityToAdd,
    articleSearchFilter,
    showConfirmModal,
    
    // Filtres de recherche
    selectedCategory,
    articleNameFilter,
    
    // Computed
    suppliersForSelectedArticle,
    isValidSelection,
    selectedTotal,
    articleOptions,
    
    // Méthodes
    resetArticleSelection,
    resetFilters,
    handleArticleSelect,
    handleSupplierSelect,
    handleQuantityChange,
    openConfirmModal,
    closeConfirmModal,
    filterArticleOption,
    getItemDataForCart,
    
    // Méthodes de filtrage
    getAvailableCategories,
    getCategoriesWithCount,
    getFilteredArticles
  };
}