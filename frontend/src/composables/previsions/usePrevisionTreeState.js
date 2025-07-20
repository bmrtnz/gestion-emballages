import { computed } from 'vue';
import { useTreeState } from '../useTreeState';

/**
 * Composable for managing prevision tree state
 * Handles expansion/collapse logic specific to prevision tree view
 */
export function usePrevisionTreeState() {
  // Base tree state functionality
  const { 
    isExpanded, 
    toggleExpanded, 
    initializeItems, 
    expandAll, 
    collapseAll 
  } = useTreeState('previsions-tree-state', true);
  
  /**
   * Initialize tree state for previsions
   * @param {Array} previsions - Array of previsions with articlesPrevisions
   */
  const initializePrevisionTree = (previsions) => {
    const keys = previsions.map(p => p._id);
    initializeItems(keys);
  };
  
  /**
   * Check if the tree is mostly expanded
   * @param {Array} previsions - Array of previsions
   * @returns {boolean} true if more than half are expanded
   */
  const getIsTreeExpanded = (previsions = []) => {
    if (previsions.length === 0) return false;
    
    // Only count previsions that have articles (expandable items)
    const expandablePrevisions = previsions.filter(p => p.articlesPrevisions && p.articlesPrevisions.length > 0);
    if (expandablePrevisions.length === 0) return false;
    
    // Count how many items are expanded
    const expandedCount = expandablePrevisions.filter(p => isExpanded(p._id)).length;
    
    // Consider tree expanded if more than half of expandable items are expanded
    return expandedCount > expandablePrevisions.length / 2;
  };
  
  /**
   * Computed property to check if tree is expanded
   * @param {Array} previsions - Array of previsions
   * @returns {import('vue').ComputedRef<boolean>}
   */
  const computedIsTreeExpanded = (previsions) => {
    return computed(() => getIsTreeExpanded(previsions.value));
  };
  
  /**
   * Toggle all items expand/collapse
   * @param {Array} previsions - Array of previsions
   */
  const toggleTreeState = (previsions) => {
    const isCurrentlyExpanded = getIsTreeExpanded(previsions);
    
    if (isCurrentlyExpanded) {
      handleCollapseAll();
    } else {
      handleExpandAll(previsions);
    }
  };
  
  /**
   * Expand all previsions that have articles
   * @param {Array} previsions - Array of previsions
   */
  const handleExpandAll = (previsions) => {
    const itemsToExpand = previsions
      .filter(p => p.articlesPrevisions && p.articlesPrevisions.length > 0)
      .map(p => ({ _id: p._id }));
    expandAll(itemsToExpand);
  };
  
  /**
   * Collapse all previsions
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
    
    // Prevision-specific methods
    initializePrevisionTree,
    computedIsTreeExpanded,
    toggleTreeState,
    handleExpandAll,
    handleCollapseAll
  };
}