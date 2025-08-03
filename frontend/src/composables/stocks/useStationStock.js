/**
 * @fileoverview Main Station Stock Orchestrator Composable
 * Combines all station stock composables following the orchestrator pattern from DESIGN.md
 */

import { computed, watch } from 'vue';
import { useStationStockData } from './useStationStockData.js';
import { useStationStockUI } from './useStationStockUI.js';
import { useAuthStore } from '../../stores/authStore.js';
import { StockRoleStrategyFactory } from '../../strategies/stocks/StockRoleStrategyFactory.js';
import { useErrorHandler } from '../useErrorHandler.js';
import { useNotification } from '../useNotification.js';

export function useStationStock() {
  const authStore = useAuthStore();
  const { handleError } = useErrorHandler();
  const { warning } = useNotification();

  // Initialize specialized composables
  const dataComposable = useStationStockData();
  const uiComposable = useStationStockUI();

  // Create strategy instance using factory
  const strategy = StockRoleStrategyFactory.createStrategy(
    authStore.user?.role, 
    authStore.user?.entiteId
  );

  // Strategy-based computed properties
  const permissions = computed(() => strategy.getPermissions());
  const uiBehavior = computed(() => strategy.getUIBehavior());
  const availableActions = computed(() => strategy.getAvailableActions());
  const quickActions = computed(() => strategy.getQuickActions());
  const tableColumns = computed(() => strategy.getTableColumns());
  const availableFilters = computed(() => strategy.getAvailableFilters());

  // Combined data transformations using strategy
  const transformedArticles = computed(() => {
    if (!dataComposable.availableArticles.value) return [];
    return strategy.transformArticleData(dataComposable.availableArticles.value);
  });

  // Enhanced save operation with strategy validation
  const saveStockWithValidation = async () => {
    // Basic validation
    if (!uiComposable.selectedWeek.value) {
      handleError(new Error('Veuillez sélectionner une semaine'));
      return false;
    }

    if (!dataComposable.hasChanges.value) {
      handleError(new Error('Aucune modification à sauvegarder'));
      return false;
    }

    // Show warning for past weeks
    if (uiComposable.isWeekInPast.value) {
      warning('Attention : Vous modifiez les stocks d\'une semaine passée');
    }


    // Perform save operation
    return await dataComposable.saveStock(uiComposable.selectedWeek.value);
  };

  // Enhanced add article operation with validation and auto-save
  const addArticleWithValidation = async (article) => {
    if (!uiComposable.selectedWeek.value) {
      handleError(new Error('Veuillez sélectionner une semaine avant d\'ajouter un article'));
      return false;
    }

    const result = dataComposable.addArticleToStock(article);
    
    if (result) {
      uiComposable.closeAddArticlePanel();
      
      // Automatically save the stock after adding the article
      try {
        await dataComposable.saveStock(uiComposable.selectedWeek.value);
      } catch (error) {
        handleError(error, 'Erreur lors de la sauvegarde automatique');
      }
    }

    return result;
  };

  // Enhanced reset operation
  const resetChangesWithNotification = () => {
    dataComposable.resetChanges();
  };

  // Load tracked articles on mount
  dataComposable.loadTrackedArticles();

  // Enhanced week change handler with confirmation
  const handleWeekChange = (newWeek) => {
    const hasChanges = dataComposable.hasChanges.value;
    const changeAllowed = uiComposable.requestWeekChange(newWeek, hasChanges);
    
    if (changeAllowed && newWeek) {
      dataComposable.loadStockData(newWeek);
    }
  };

  // Handle confirmed week change
  const handleConfirmedWeekChange = () => {
    uiComposable.confirmWeekChange();
    if (uiComposable.selectedWeek.value) {
      dataComposable.loadStockData(uiComposable.selectedWeek.value);
    }
  };

  // Watchers for reactive updates
  watch(uiComposable.selectedWeek, (newWeek) => {
    if (newWeek) {
      dataComposable.loadStockData(newWeek);
    }
  }, { immediate: true });

  // Load articles on mount (only if no week is selected yet)
  watch(() => uiComposable.canShowForm.value, (canShow) => {
    if (canShow && !uiComposable.selectedWeek.value && dataComposable.trackedArticles.value.length === 0) {
      // Only load generic articles if no week is selected and no tracked articles
      // When a week is selected, loadStockData handles loading the right articles
      dataComposable.loadArticles();
    }
  }, { immediate: true });

  // Role-based checks
  const canAccessStock = (stock) => strategy.canAccessStock(stock);
  const canModifyStock = (stock) => strategy.canModifyStock(stock);

  return {
    // Data from dataComposable
    ...dataComposable,
    
    // UI state from uiComposable
    ...uiComposable,
    
    // Strategy-enhanced computed
    transformedArticles,
    permissions,
    uiBehavior,
    availableActions,
    quickActions,
    tableColumns,
    availableFilters,
    
    // Enhanced methods
    saveStockWithValidation,
    addArticleWithValidation,
    resetChangesWithNotification,
    handleWeekChange,
    handleConfirmedWeekChange,
    canAccessStock,
    canModifyStock,
    
    // Strategy instance (for advanced usage)
    strategy
  };
}