# Design Patterns and Performance Optimization Guide

This document outlines the design principles, patterns, and performance optimizations implemented in the packaging management system, specifically demonstrated in the ArticleList component refactoring. These patterns should be reused for further component refactoring.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Architectural Patterns](#architectural-patterns)
3. [Performance Optimization Strategies](#performance-optimization-strategies)
4. [Component Architecture](#component-architecture)
5. [Implementation Guidelines](#implementation-guidelines)
6. [Best Practices](#best-practices)

## Design Principles

### 1. Separation of Concerns
**Principle**: Each composable and component should have a single, well-defined responsibility.

**Implementation**:
- **Data Management**: `useArticleData.js` - API calls, pagination, state management
- **Filtering Logic**: `useArticleFilters.js` - Filter state, validation, available filters
- **Tree State**: `useArticleTreeState.js` - Expansion/collapse logic
- **Role Strategy**: `useRoleStrategy.js` - Role-based behavior and permissions
- **Performance**: `usePerformanceOptimization.js` - Memoization, caching, optimization utilities

**Benefits**:
- Easier testing and debugging
- Better code reusability
- Cleaner component logic
- Simplified maintenance

### 2. Strategy Pattern for Role-Based Behavior
**Principle**: Encapsulate role-specific behavior in separate strategy classes instead of conditional logic.

**Implementation**:
```javascript
// Base strategy interface
export class UserRoleStrategy {
  transformTableData(articles) { /* Abstract method */ }
  getAvailableFilters() { /* Abstract method */ }
  getTableColumns() { /* Abstract method */ }
  getUIBehavior() { /* Abstract method */ }
  getPermissions() { /* Abstract method */ }
}

// Concrete strategies
export class FournisseurStrategy extends UserRoleStrategy { /* Implementation */ }
export class ManagerStrategy extends UserRoleStrategy { /* Implementation */ }
export class StationStrategy extends UserRoleStrategy { /* Implementation */ }
```

**Benefits**:
- Easy to add new user roles
- No complex conditional logic in components
- Role-specific behavior is centralized
- Better maintainability and testing

### 3. Composition over Inheritance
**Principle**: Use composables and composition to share functionality rather than inheritance.

**Implementation**:
```javascript
// Main orchestrator composable
export function useArticleList() {
  // Compose multiple specialized composables
  const dataComposable = useArticleData();
  const filtersComposable = useArticleFilters();
  const treeComposable = useArticleTreeState();
  const strategyComposable = useRoleStrategy();
  const performanceComposable = usePerformanceOptimization();
  
  // Return combined interface
  return {
    ...dataComposable,
    ...filtersComposable,
    ...treeComposable,
    ...strategyComposable
  };
}
```

**Benefits**:
- Flexible and reusable
- No inheritance complexity
- Easy to test individual pieces
- Better code organization

## Architectural Patterns

### 1. Factory Pattern for Strategy Creation
**Use Case**: Creating role-specific strategies based on user context.

**Implementation**:
```javascript
export class RoleStrategyFactory {
  static createStrategy(userRole, userEntiteId = null) {
    switch (userRole) {
      case 'Fournisseur':
        return new FournisseurStrategy(userEntiteId);
      case 'Manager':
      case 'Gestionnaire':
        return new ManagerStrategy(userRole);
      case 'Station':
        return new StationStrategy(userEntiteId);
      default:
        return new StationStrategy(userEntiteId);
    }
  }
}
```

**Benefits**:
- Centralized strategy creation
- Easy to modify strategy selection logic
- Type safety and validation
- Consistent strategy initialization

### 2. Observer Pattern with Vue Reactivity
**Use Case**: Watching for changes and updating dependent computations.

**Implementation**:
```javascript
// Watch filters based on role strategy
watch(supplierFilter, () => {
  if (isFilterAvailable('supplier')) {
    debouncedFetchArticles();
  }
});

// Memoized computed with custom dependencies
const tableDataSource = memoizedComputed(
  () => transformTableData(articles.value),
  [() => articles.value, () => authStore.userRole]
);
```

**Benefits**:
- Reactive updates
- Efficient dependency tracking
- Prevents unnecessary re-computations
- Clean separation of concerns

### 3. Virtual Proxy Pattern
**Use Case**: Virtual scrolling to handle large datasets efficiently.

**Implementation**:
```javascript
// Virtual list only renders visible items
const visibleItems = computed(() => {
  const { startIndex, endIndex } = visibleRange.value;
  return props.items.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    virtualIndex: startIndex + index,
    top: position.top,
    height: position.height
  }));
});
```

**Benefits**:
- Constant memory usage regardless of dataset size
- Smooth scrolling performance
- Reduced DOM manipulation
- Scalable to any dataset size

### 4. Decorator Pattern for Performance Enhancement
**Use Case**: Adding performance optimizations to existing functions.

**Implementation**:
```javascript
// Memoization decorator
const memoize = (fn, keyFn = JSON.stringify, maxSize = 100) => {
  const cache = new Map();
  return (...args) => {
    const key = keyFn(args);
    if (cache.has(key)) return cache.get(key);
    
    const result = fn.apply(this, args);
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(key, result);
    return result;
  };
};

// Usage
const formatCurrency = memoize((amount) => {
  return currencyFormatter.format(amount);
});
```

**Benefits**:
- Non-intrusive performance improvements
- Reusable optimization patterns
- Easy to apply to existing functions
- Configurable caching strategies

## Performance Optimization Strategies

### 1. Memoization and Caching

#### **Computed Property Memoization**
```javascript
const memoizedComputed = (computeFn, dependencies = []) => {
  const cache = ref(null);
  const isValid = ref(false);
  
  watchEffect(() => {
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
```

#### **Function Memoization with LRU Cache**
```javascript
const memoize = (fn, keyFn = JSON.stringify, maxSize = 100) => {
  const cache = new Map();
  return (...args) => {
    const key = keyFn(args);
    if (cache.has(key)) return cache.get(key);
    
    const result = fn.apply(this, args);
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(key, result);
    return result;
  };
};
```

#### **Selective Computed Properties**
```javascript
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
```

### 2. Virtual Scrolling Implementation

#### **Basic Virtual List Pattern**
```javascript
const visibleRange = computed(() => {
  const containerHeight = props.containerHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan);
  const visibleCount = Math.ceil(containerHeight / props.itemHeight);
  const endIndex = Math.min(props.items.length - 1, startIndex + visibleCount + props.overscan * 2);
  
  return { startIndex, endIndex };
});

const visibleItems = computed(() => {
  const { startIndex, endIndex } = visibleRange.value;
  return props.items.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    virtualIndex: startIndex + index,
    top: (startIndex + index) * props.itemHeight
  }));
});
```

#### **Dynamic Height Virtual Scrolling**
```javascript
const itemPositions = computed(() => {
  const positions = [];
  let offset = 0;
  
  for (let i = 0; i < props.items.length; i++) {
    positions.push({
      index: i,
      top: offset,
      height: getItemHeight(i)
    });
    offset += getItemHeight(i);
  }
  
  return positions;
});
```

### 3. Debouncing and Throttling

#### **Smart Debouncing**
```javascript
const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

// Usage with reduced delay for better UX
const debouncedFetchArticles = debounce(() => {
  resetPagination();
  performFetch();
}, 250); // Reduced from 300ms
```

#### **Throttling for Scroll Events**
```javascript
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
```

### 4. Singleton Pattern for Heavy Objects

#### **Formatter Singletons**
```javascript
// Create formatters once and reuse
const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

// Memoized formatting functions
const formatCurrency = memoize((amount) => {
  if (!amount && amount !== 0) return null;
  return currencyFormatter.format(amount);
});
```

### 5. Performance Measurement

#### **Development Performance Monitoring**
```javascript
const measure = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
};

// Usage
const tableDataSource = memoizedComputed(
  () => measure('Data Transformation', () => transformTableData(articles.value)),
  [() => articles.value, () => authStore.userRole]
);
```

## Component Architecture

### 1. Composable-Based Architecture

#### **Single Responsibility Composables**
- **Data Composables**: Handle API calls, state management, pagination
- **UI State Composables**: Manage component-specific UI state (filters, tree expansion)
- **Business Logic Composables**: Implement business rules and validation
- **Performance Composables**: Provide optimization utilities

#### **Orchestrator Pattern**
```javascript
// Main composable that orchestrates others
export function useFeatureList() {
  // Initialize specialized composables
  const dataComposable = useFeatureData();
  const filtersComposable = useFeatureFilters();
  const uiComposable = useFeatureUI();
  const strategyComposable = useRoleStrategy();
  
  // Combine and return unified interface
  return {
    ...dataComposable,
    ...filtersComposable,
    ...uiComposable,
    ...strategyComposable,
    // Add any cross-cutting concerns here
  };
}
```

### 2. Component Variants for Different Use Cases

#### **Performance-Optimized Variants**
- **Standard Component**: For normal datasets (<100 items)
- **Optimized Component**: With virtual scrolling for large datasets (100+ items)
- **Strategy Component**: With role-based behavior patterns

#### **Naming Convention**
- `ComponentName.vue` - Standard implementation
- `ComponentNameStrategy.vue` - Strategy pattern implementation
- `ComponentNameOptimized.vue` - Performance-optimized implementation

### 3. Prop Interface Design

#### **Consistent Prop Patterns**
```javascript
const props = defineProps({
  // Data props
  items: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  
  // Configuration props
  itemHeight: { type: [Number, Function], default: 60 },
  containerHeight: { type: Number, default: 400 },
  
  // Feature flags
  useVirtualScrolling: { type: Boolean, default: false },
  allowActions: { type: Boolean, default: true },
  
  // Customization props
  keyField: { type: String, default: '_id' },
  emptyMessage: { type: String, default: 'Aucun élément trouvé' }
});
```

## Implementation Guidelines

### 1. When to Use Each Pattern

#### **Strategy Pattern**
- **Use when**: Multiple user roles with different behaviors
- **Don't use when**: Simple conditional logic (2-3 conditions)
- **Examples**: User interfaces, permission systems, data transformations

#### **Virtual Scrolling**
- **Use when**: Datasets > 100 items or performance is critical
- **Don't use when**: Small datasets where simplicity is preferred
- **Consider**: Mobile vs desktop performance requirements

#### **Memoization**
- **Use when**: Expensive computations or frequent re-calculations
- **Don't use when**: Simple operations or rarely called functions
- **Monitor**: Cache hit rates and memory usage

#### **Composables**
- **Use when**: Reusable logic across components
- **Structure**: One responsibility per composable
- **Combine**: Use orchestrator pattern for complex features

### 2. Performance Optimization Checklist

#### **Before Optimization**
- [ ] Measure current performance
- [ ] Identify bottlenecks
- [ ] Set performance targets
- [ ] Consider user experience impact

#### **During Implementation**
- [ ] Use appropriate caching strategies
- [ ] Implement lazy loading where possible
- [ ] Optimize re-renders and computations
- [ ] Add performance monitoring in development

#### **After Optimization**
- [ ] Measure performance improvements
- [ ] Test with different dataset sizes
- [ ] Verify functionality is preserved
- [ ] Document performance characteristics

### 3. Code Organization

#### **File Structure**
```
src/
├── components/
│   ├── ComponentName.vue           # Standard implementation
│   ├── ComponentNameStrategy.vue   # Strategy pattern
│   └── ComponentNameOptimized.vue  # Performance optimized
├── composables/
│   ├── useComponentData.js         # Data management
│   ├── useComponentFilters.js      # Filter logic
│   ├── useComponentUI.js           # UI state
│   └── useComponent.js             # Main orchestrator
├── strategies/
│   ├── UserRoleStrategy.js         # Base strategy
│   ├── ConcreteStrategy.js         # Specific implementations
│   └── index.js                    # Factory and exports
└── utils/
    └── performance.js              # Performance utilities
```

#### **Import Organization**
```javascript
// 1. Vue imports
import { computed, ref, watch } from 'vue';

// 2. Store imports
import { useAuthStore } from '../stores/authStore';

// 3. Composable imports
import { useComponentData } from './useComponentData';

// 4. Utility imports
import { usePerformanceOptimization } from './usePerformanceOptimization';

// 5. Component imports
import Button from './ui/Button.vue';
```

## Best Practices

### 1. Performance

#### **Do's**
- ✅ Use virtual scrolling for large datasets
- ✅ Memoize expensive computations
- ✅ Implement proper caching strategies
- ✅ Use debouncing for user input
- ✅ Monitor performance in development
- ✅ Use singleton pattern for heavy objects
- ✅ Implement lazy loading where appropriate

#### **Don'ts**
- ❌ Premature optimization without measurement
- ❌ Over-engineering simple use cases
- ❌ Ignoring memory usage in caching
- ❌ Using complex patterns for simple problems
- ❌ Optimizing without understanding bottlenecks

### 2. Architecture

#### **Do's**
- ✅ Use strategy pattern for role-based behavior
- ✅ Keep composables focused and reusable
- ✅ Implement proper separation of concerns
- ✅ Use factories for complex object creation
- ✅ Design consistent component interfaces
- ✅ Document pattern usage and decisions

#### **Don'ts**
- ❌ Mix UI logic with business logic
- ❌ Create god objects or composables
- ❌ Use inheritance over composition
- ❌ Couple components tightly together
- ❌ Ignore error handling and edge cases

### 3. Code Quality

#### **Do's**
- ✅ Use TypeScript for better type safety
- ✅ Write comprehensive tests for patterns
- ✅ Document complex logic and patterns
- ✅ Use consistent naming conventions
- ✅ Implement proper error handling
- ✅ Follow Vue 3 Composition API best practices

#### **Don'ts**
- ❌ Skip testing of optimization logic
- ❌ Use unclear or inconsistent naming
- ❌ Ignore accessibility requirements
- ❌ Forget to handle loading and error states
- ❌ Implement patterns without team alignment

## Pattern Application Examples

### 1. Applying to Other List Components

```javascript
// UserList example
export function useUserList() {
  const { memoize, debounce } = usePerformanceOptimization();
  const strategy = useRoleStrategy();
  
  // Apply same patterns
  const transformedUsers = memoizedComputed(
    () => strategy.transformTableData(users.value),
    [() => users.value, () => authStore.userRole]
  );
  
  const debouncedSearch = debounce(performSearch, 250);
  
  return {
    transformedUsers,
    debouncedSearch,
    // ... other exports
  };
}
```

### 2. Adapting Strategy Pattern

```javascript
// OrderStrategy example
export class OrderStrategy extends UserRoleStrategy {
  transformTableData(orders) {
    // Role-specific order transformation
  }
  
  getAvailableActions() {
    // Role-specific order actions
  }
  
  getStatusFilters() {
    // Role-specific status options
  }
}
```

### 3. Implementing Virtual Scrolling

```javascript
// Any large dataset component
<VirtualList
  :items="largeDataset"
  :item-height="calculateItemHeight"
  :container-height="600"
  :overscan="3"
>
  <template #default="{ item, index }">
    <CustomItemComponent :item="item" />
  </template>
</VirtualList>
```

---

This design guide provides a comprehensive foundation for implementing scalable, performant, and maintainable components throughout the application. Follow these patterns consistently to ensure code quality and performance across the entire codebase.