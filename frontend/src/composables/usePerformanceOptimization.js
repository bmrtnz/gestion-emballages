import { ref, computed, shallowRef, watchEffect } from 'vue';

/**
 * Composable for performance optimization utilities
 * Provides memoization, caching, and optimization helpers
 */
export function usePerformanceOptimization() {
  
  /**
   * Create a memoized function that caches results based on arguments
   * @param {Function} fn - Function to memoize
   * @param {Function} keyFn - Optional function to generate cache keys
   * @param {number} maxSize - Maximum cache size (default: 100)
   * @returns {Function} - Memoized function
   */
  const memoize = (fn, keyFn = JSON.stringify, maxSize = 100) => {
    const cache = new Map();
    
    return (...args) => {
      const key = keyFn(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn.apply(this, args);
      
      // Implement LRU cache behavior
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      cache.set(key, result);
      return result;
    };
  };

  /**
   * Create a memoized computed property with custom cache invalidation
   * @param {Function} computeFn - Function to compute value
   * @param {Array} dependencies - Dependencies to watch for cache invalidation
   * @returns {Object} - Computed ref with cache control
   */
  const memoizedComputed = (computeFn, dependencies = []) => {
    const cache = ref(null);
    const isValid = ref(false);
    
    // Watch dependencies and invalidate cache when they change
    watchEffect(() => {
      // Access dependencies to trigger reactivity
      dependencies.forEach(dep => {
        if (typeof dep === 'function') dep();
        else if (dep?.value !== undefined) dep.value;
      });
      
      isValid.value = false;
    });
    
    return computed(() => {
      if (!isValid.value) {
        cache.value = computeFn();
        isValid.value = true;
      }
      return cache.value;
    });
  };

  /**
   * Create a debounced function with configurable delay
   * @param {Function} fn - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} - Debounced function
   */
  const debounce = (fn, delay = 300) => {
    let timeoutId;
    
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  /**
   * Create a throttled function that limits execution frequency
   * @param {Function} fn - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} - Throttled function
   */
  const throttle = (fn, limit = 100) => {
    let inThrottle;
    
    return (...args) => {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  /**
   * Create a cached function that stores results for a specified time
   * @param {Function} fn - Function to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Function} - Cached function
   */
  const timeCache = (fn, ttl = 60000) => {
    const cache = new Map();
    
    return (...args) => {
      const key = JSON.stringify(args);
      const now = Date.now();
      
      if (cache.has(key)) {
        const { value, timestamp } = cache.get(key);
        if (now - timestamp < ttl) {
          return value;
        }
        cache.delete(key);
      }
      
      const result = fn.apply(this, args);
      cache.set(key, { value: result, timestamp: now });
      return result;
    };
  };

  /**
   * Create a shallow reactive array that only triggers updates when length changes
   * Useful for large arrays where item mutations don't need to trigger parent updates
   * @param {Array} initialValue - Initial array value
   * @returns {Ref} - Shallow reactive array
   */
  const shallowArray = (initialValue = []) => {
    return shallowRef([...initialValue]);
  };

  /**
   * Batch multiple reactive updates into a single update cycle
   * @param {Function} updateFn - Function containing multiple reactive updates
   */
  const batchUpdates = (updateFn) => {
    // Vue 3 automatically batches updates in the same tick
    // This is mainly for explicit batching if needed
    return new Promise(resolve => {
      updateFn();
      resolve();
    });
  };

  /**
   * Create a computed property that only updates when specific properties change
   * @param {Function} computeFn - Compute function
   * @param {Array} watchKeys - Specific keys to watch for changes
   * @returns {ComputedRef} - Optimized computed ref
   */
  const selectiveComputed = (computeFn, watchKeys = []) => {
    const cache = ref(null);
    const lastValues = ref(new Map());
    
    return computed(() => {
      let hasChanged = false;
      
      for (const key of watchKeys) {
        const currentValue = typeof key === 'function' ? key() : key.value;
        const lastValue = lastValues.value.get(key);
        
        if (currentValue !== lastValue) {
          lastValues.value.set(key, currentValue);
          hasChanged = true;
        }
      }
      
      if (hasChanged || cache.value === null) {
        cache.value = computeFn();
      }
      
      return cache.value;
    });
  };

  /**
   * Performance monitoring utility
   * @param {string} name - Operation name
   * @param {Function} fn - Function to measure
   * @returns {any} - Function result
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

  return {
    memoize,
    memoizedComputed,
    debounce,
    throttle,
    timeCache,
    shallowArray,
    batchUpdates,
    selectiveComputed,
    measure
  };
}