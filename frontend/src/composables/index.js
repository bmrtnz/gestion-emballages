// frontend/src/composables/index.js

// Export all composables for easier imports
export { useErrorHandler } from './useErrorHandler';
export { useLoading, useMultipleLoading } from './useLoading';
export { useFormValidation, commonValidationRules } from './useFormValidation';

// Re-export commonly used patterns
export const useCommonPatterns = () => {
  return {
    useErrorHandler: () => import('./useErrorHandler').then(m => m.useErrorHandler()),
    useLoading: () => import('./useLoading').then(m => m.useLoading()),
    useFormValidation: () => import('./useFormValidation').then(m => m.useFormValidation())
  };
};