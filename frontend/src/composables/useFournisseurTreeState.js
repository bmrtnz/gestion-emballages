import { computed } from 'vue';
import { useTreeState } from './useTreeState';

/**
 * Composable for managing fournisseur tree state
 * Handles expansion/collapse logic specific to fournisseur tree view
 */
export function useFournisseurTreeState() {
  // Base tree state functionality
  const { 
    isExpanded, 
    toggleExpanded, 
    initializeItems, 
    expandAll, 
    collapseAll 
  } = useTreeState('fournisseurs-tree-state', true);
  
  /**
   * Initialize tree state for fournisseurs
   */
  const initializeFournisseurTree = (fournisseurs) => {
    if (fournisseurs.length > 0) {
      initializeItems(fournisseurs);
    }
  };
  
  /**
   * Check if the tree is expanded (for UI indicators)
   */
  const getIsTreeExpanded = (fournisseurs = []) => {
    if (fournisseurs.length === 0) return false;
    
    // Count how many items are expanded
    const expandedCount = fournisseurs.filter(item => isExpanded(item.key)).length;
    
    // Consider tree expanded if more than half of items are expanded
    return expandedCount > fournisseurs.length / 2;
  };
  
  /**
   * Toggle the entire tree state (expand all or collapse all)
   */
  const toggleTreeState = (fournisseurs) => {
    if (getIsTreeExpanded(fournisseurs)) {
      collapseAll();
    } else {
      expandAll(fournisseurs);
    }
  };
  
  /**
   * Handle expand all
   */
  const handleExpandAll = (fournisseurs) => {
    expandAll(fournisseurs);
  };
  
  /**
   * Handle collapse all
   */
  const handleCollapseAll = () => {
    collapseAll();
  };
  
  return {
    // Base tree state
    isExpanded,
    toggleExpanded,
    expandAll,
    collapseAll,
    
    // Fournisseur-specific methods
    initializeFournisseurTree,
    toggleTreeState,
    handleExpandAll,
    handleCollapseAll,
    
    // UI helpers
    getIsTreeExpanded
  };
}