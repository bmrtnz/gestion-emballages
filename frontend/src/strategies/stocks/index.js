/**
 * @fileoverview Stock strategies entry point
 * @module strategies/stocks
 */

// Export base strategy
export { StockRoleStrategy } from './StockRoleStrategy.js';

// Export concrete strategies
export { FournisseurStockStrategy } from './FournisseurStockStrategy.js';
export { GestionnaireStockStrategy } from './GestionnaireStockStrategy.js';
export { StationStockStrategy } from './StationStockStrategy.js';

// Export factory
export { StockRoleStrategyFactory } from './StockRoleStrategyFactory.js';