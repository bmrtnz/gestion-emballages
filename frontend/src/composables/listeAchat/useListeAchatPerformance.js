// frontend/src/composables/listeAchat/useListeAchatPerformance.js
import { computed } from 'vue';

/**
 * Composable pour les optimisations de performance de la liste d'achat
 * Responsable de:
 * - Formatage memoizé des nombres et devises
 * - Fonctions utilitaires optimisées
 */
export function useListeAchatPerformance() {
  // Formatters singleton pour éviter de les recréer
  const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  const numberFormatter = new Intl.NumberFormat('fr-FR');
  
  // Cache pour le formatage des devises
  const currencyCache = new Map();
  const numberCache = new Map();
  
  /**
   * Formate un montant en devise avec mise en cache
   */
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0,00 €';
    
    const key = amount.toString();
    if (currencyCache.has(key)) {
      return currencyCache.get(key);
    }
    
    const formatted = currencyFormatter.format(amount);
    
    // Limiter la taille du cache (LRU simple)
    if (currencyCache.size >= 100) {
      const firstKey = currencyCache.keys().next().value;
      currencyCache.delete(firstKey);
    }
    
    currencyCache.set(key, formatted);
    return formatted;
  };
  
  /**
   * Formate un nombre avec mise en cache
   */
  const formatNumber = (number) => {
    if (typeof number !== 'number') return number;
    
    const key = number.toString();
    if (numberCache.has(key)) {
      return numberCache.get(key);
    }
    
    const formatted = numberFormatter.format(number);
    
    // Limiter la taille du cache
    if (numberCache.size >= 100) {
      const firstKey = numberCache.keys().next().value;
      numberCache.delete(firstKey);
    }
    
    numberCache.set(key, formatted);
    return formatted;
  };
  
  /**
   * Fonction memoizée pour calculer le prix total d'un conditionnement
   */
  const memoizedConditionnementPrice = (() => {
    const cache = new Map();
    
    return (quantiteParConditionnement, prixUnitaire) => {
      const key = `${quantiteParConditionnement}-${prixUnitaire}`;
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = (quantiteParConditionnement || 1) * (prixUnitaire || 0);
      
      if (cache.size >= 50) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      cache.set(key, result);
      return result;
    };
  })();
  
  /**
   * Fonction memoizée pour calculer le total d'un item
   */
  const memoizedItemTotal = (() => {
    const cache = new Map();
    
    return (quantite, quantiteParConditionnement, prixUnitaire) => {
      const key = `${quantite}-${quantiteParConditionnement}-${prixUnitaire}`;
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = quantite * (quantiteParConditionnement || 1) * (prixUnitaire || 0);
      
      if (cache.size >= 50) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      cache.set(key, result);
      return result;
    };
  })();
  
  /**
   * Debounce optimisé pour les interactions utilisateur
   */
  const debounce = (fn, delay = 250) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };
  
  /**
   * Mesure les performances en mode développement
   */
  const measure = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
  
  /**
   * Vide les caches de formatage
   */
  const clearCaches = () => {
    currencyCache.clear();
    numberCache.clear();
    console.log('[Performance] Caches cleared');
  };
  
  return {
    // Formatters
    formatCurrency,
    formatNumber,
    
    // Calculateurs memoizés
    memoizedConditionnementPrice,
    memoizedItemTotal,
    
    // Utilitaires
    debounce,
    measure,
    clearCaches
  };
}