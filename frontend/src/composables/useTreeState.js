import { ref, watch } from 'vue';

/**
 * Composable for managing tree-view expand/collapse state with localStorage persistence
 * @param {string} storageKey - Unique key for localStorage
 * @param {boolean} defaultOpen - Default state for new items
 */
export function useTreeState(storageKey = 'tree-state', defaultOpen = true) {
  // Load state immediately and synchronously
  let initialExpandedItems = new Set();
  let hasInitialState = false;
  
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      initialExpandedItems = new Set(parsed);
      hasInitialState = true;
    }
  } catch (error) {
    console.warn('Failed to load tree state:', error);
  }

  const expandedItems = ref(initialExpandedItems);
  const hasStoredState = ref(hasInitialState);

  // Save state to localStorage
  const saveState = () => {
    try {
      const stateArray = Array.from(expandedItems.value);
      localStorage.setItem(storageKey, JSON.stringify(stateArray));
    } catch (error) {
      console.warn('Failed to save tree state:', error);
    }
  };

  // Check if item is expanded
  const isExpanded = (itemId) => {
    // If we have stored state, use it
    if (hasStoredState.value) {
      return expandedItems.value.has(itemId);
    }
    // If no stored state, use default for new items
    return defaultOpen;
  };

  // Toggle item expansion state
  const toggleExpanded = (itemId) => {
    // Mark that we now have stored state
    hasStoredState.value = true;
    
    const newSet = new Set(expandedItems.value);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    expandedItems.value = newSet;
  };

  // Set expansion state for item
  const setExpanded = (itemId, expanded) => {
    hasStoredState.value = true;
    
    const newSet = new Set(expandedItems.value);
    if (expanded) {
      newSet.add(itemId);
    } else {
      newSet.delete(itemId);
    }
    expandedItems.value = newSet;
  };

  // Initialize items with default state (only for new items without stored state)
  const initializeItems = (items) => {
    if (hasStoredState.value) return; // Don't initialize if we have stored state
    
    const newSet = new Set(expandedItems.value);
    items.forEach(item => {
      const itemId = item.key || item._id;
      if (itemId && defaultOpen) {
        newSet.add(itemId);
      }
    });
    
    expandedItems.value = newSet;
    // Mark that we now have state (even if it's just the default)
    hasStoredState.value = true;
  };

  // Clear all state
  const clearState = () => {
    expandedItems.value = new Set();
    hasStoredState.value = false;
  };

  // Expand all items
  const expandAll = (items) => {
    hasStoredState.value = true;
    const newSet = new Set(expandedItems.value);
    items.forEach(item => {
      const itemId = item.key || item._id;
      if (itemId) {
        newSet.add(itemId);
      }
    });
    expandedItems.value = newSet;
  };

  // Collapse all items
  const collapseAll = () => {
    hasStoredState.value = true;
    expandedItems.value = new Set();
  };

  // Restore user state (reload from localStorage)
  const restoreUserState = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        expandedItems.value = new Set(parsed);
        hasStoredState.value = true;
      } else {
        // If no saved state, reset to default
        expandedItems.value = new Set();
        hasStoredState.value = false;
      }
    } catch (error) {
      console.warn('Failed to restore tree state:', error);
      expandedItems.value = new Set();
      hasStoredState.value = false;
    }
  };

  // Watch for changes and save to localStorage
  watch(expandedItems, saveState, { deep: true });

  return {
    expandedItems,
    isExpanded,
    toggleExpanded,
    setExpanded,
    initializeItems,
    clearState,
    expandAll,
    collapseAll,
    restoreUserState
  };
}