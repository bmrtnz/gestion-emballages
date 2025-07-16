// frontend/src/composables/useLoading.js
import { ref, computed } from 'vue';

/**
 * Composable pour la gestion standardisée des états de chargement
 * @param {string} initialState - État initial ('idle', 'loading', 'success', 'error')
 * @returns {Object} État et méthodes de gestion du loading
 */
export function useLoading(initialState = 'idle') {
  const state = ref(initialState);
  const error = ref(null);

  // États calculés
  const isLoading = computed(() => state.value === 'loading');
  const isIdle = computed(() => state.value === 'idle');
  const isSuccess = computed(() => state.value === 'success');
  const isError = computed(() => state.value === 'error');

  // Actions
  const setLoading = () => {
    state.value = 'loading';
    error.value = null;
  };

  const setSuccess = () => {
    state.value = 'success';
    error.value = null;
  };

  const setError = (errorMessage) => {
    state.value = 'error';
    error.value = errorMessage;
  };

  const setIdle = () => {
    state.value = 'idle';
    error.value = null;
  };

  const reset = () => {
    state.value = 'idle';
    error.value = null;
  };

  /**
   * Wrapper pour exécuter une fonction asynchrone avec gestion automatique du loading
   * @param {Function} asyncFn - Fonction asynchrone à exécuter
   * @param {Object} options - Options de configuration
   */
  const execute = async (asyncFn, options = {}) => {
    const { onSuccess, onError, resetOnStart = true } = options;

    if (resetOnStart) {
      setLoading();
    }

    try {
      const result = await asyncFn();
      setSuccess();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    }
  };

  return {
    // État
    state: computed(() => state.value),
    error: computed(() => error.value),
    
    // États calculés
    isLoading,
    isIdle,
    isSuccess,
    isError,
    
    // Actions
    setLoading,
    setSuccess,
    setError,
    setIdle,
    reset,
    execute
  };
}

/**
 * Composable pour gérer plusieurs états de loading simultanés
 * @returns {Object} Gestion de multiples loadings
 */
export function useMultipleLoading() {
  const loadingStates = ref(new Map());

  const setLoading = (key, isLoading) => {
    loadingStates.value.set(key, isLoading);
  };

  const isLoading = (key) => {
    return loadingStates.value.get(key) || false;
  };

  const isAnyLoading = computed(() => {
    return Array.from(loadingStates.value.values()).some(loading => loading);
  });

  const getLoadingKeys = computed(() => {
    return Array.from(loadingStates.value.entries())
      .filter(([, isLoading]) => isLoading)
      .map(([key]) => key);
  });

  const clearAll = () => {
    loadingStates.value.clear();
  };

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    getLoadingKeys,
    clearAll
  };
}