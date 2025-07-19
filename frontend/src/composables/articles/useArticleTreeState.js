import { computed } from 'vue';
import { useTreeState } from '../useTreeState';
import { useAuthStore } from '../../stores/authStore';

/**
 * Composable for managing article tree state
 * Handles expansion/collapse logic with role-based behavior
 */
export function useArticleTreeState(articles = null) {
  const authStore = useAuthStore();
  
  // Base tree state functionality
  const { 
    isExpanded, 
    toggleExpanded, 
    initializeItems, 
    expandAll, 
    collapseAll,
    setExpanded 
  } = useTreeState('articles-tree-state', true);
  
  /**
   * Check if supplier lines should be shown for an article
   * For Fournisseur users, always show (they only see their own data)
   * For other users, respect the expansion state
   */
  const shouldShowSuppliers = (articleKey) => {
    return isExpanded(articleKey) || authStore.userRole === 'Fournisseur';
  };
  
  /**
   * Initialize tree state for articles
   * For Fournisseur users, force expansion of all items
   */
  const initializeArticleTree = (articles) => {
    if (articles.length > 0) {
      initializeItems(articles);
      
      // For Fournisseur users, always expand all items to show their supplier data
      if (authStore.userRole === 'Fournisseur') {
        expandAll(articles);
      }
    }
  };
  
  /**
   * Check if the tree is expanded (for UI indicators)
   */
  const isTreeExpanded = computed(() => {
    // For Fournisseur users, tree is always considered expanded
    if (authStore.userRole === 'Fournisseur') {
      return true;
    }
    
    // For other users, check actual expansion state
    const currentArticles = articles?.value || articles || [];
    return getIsTreeExpanded(currentArticles);
  });
  
  // Function to calculate if tree is expanded based on current data
  const getIsTreeExpanded = (articles = []) => {
    if (articles.length === 0) return false;
    
    // Count how many items with children are expanded
    const expandableItems = articles.filter(item => item.children && item.children.length > 0);
    if (expandableItems.length === 0) return false;
    
    const expandedCount = expandableItems.filter(item => isExpanded(item.key)).length;
    
    // Consider tree expanded if more than half of expandable items are expanded
    return expandedCount > expandableItems.length / 2;
  };
  
  /**
   * Toggle the entire tree state (expand all or collapse all)
   */
  const toggleTreeState = (articles) => {
    // Fournisseur users can't toggle tree state
    if (authStore.userRole === 'Fournisseur') {
      return;
    }
    
    if (isTreeExpanded.value) {
      collapseAll();
    } else {
      expandAll(articles);
    }
  };
  
  /**
   * Check if tree controls should be shown
   */
  const shouldShowTreeControls = computed(() => {
    return authStore.userRole !== 'Fournisseur';
  });
  
  /**
   * Check if expand/collapse button should be shown for an article
   */
  const shouldShowExpandButton = (article) => {
    return article.children?.length > 0 && authStore.userRole !== 'Fournisseur';
  };
  
  /**
   * Get the appropriate chevron icon class for an article
   */
  const getChevronClass = (articleKey) => {
    if (authStore.userRole === 'Fournisseur') {
      return 'h-4 w-4 text-gray-500 transform rotate-90';
    }
    
    return [
      'h-4 w-4 text-gray-500 transition-transform duration-200',
      isExpanded(articleKey) ? 'transform rotate-90' : ''
    ];
  };
  
  return {
    // Base tree state
    isExpanded,
    toggleExpanded,
    expandAll,
    collapseAll,
    setExpanded,
    
    // Article-specific methods
    shouldShowSuppliers,
    initializeArticleTree,
    toggleTreeState,
    
    // UI helpers
    shouldShowTreeControls,
    shouldShowExpandButton,
    getChevronClass,
    isTreeExpanded
  };
}