/**
 * Debug utility for tree state persistence
 */
export function debugTreeState() {
  const storageKey = 'commandes-tree-state';
  
  console.group('🌳 Tree State Debug');
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📦 Stored state:', parsed);
      console.log('📊 Expanded items count:', parsed.length);
    } else {
      console.log('❌ No stored state found');
    }
  } catch (error) {
    console.error('💥 Error reading stored state:', error);
  }
  
  console.log('🔑 Storage key:', storageKey);
  console.log('💾 localStorage available:', typeof Storage !== 'undefined');
  
  console.groupEnd();
}

/**
 * Clear tree state from localStorage
 */
export function clearTreeState() {
  const storageKey = 'commandes-tree-state';
  localStorage.removeItem(storageKey);
  console.log('🗑️ Tree state cleared');
}

// Add to window for console debugging
if (typeof window !== 'undefined') {
  window.debugTreeState = debugTreeState;
  window.clearTreeState = clearTreeState;
}