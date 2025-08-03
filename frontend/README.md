# Gestion Emballages - Frontend Application

## Overview

The Gestion Emballages frontend is a modern Vue.js 3 application built with the Composition API that provides a responsive web interface for packaging procurement and inventory management. It features role-based UI behavior, performance optimizations, and a comprehensive design system.

## Architecture

- **Framework**: Vue.js 3 with Composition API and `<script setup>`
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Vue Router 4 with authentication guards
- **State Management**: Pinia with composition-style stores
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components with selective Ant Design Vue usage
- **Performance**: Virtual scrolling, memoization, debouncing

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **Backend API** running on `http://localhost:5000`

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd gestion-emballages/frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=10000

# Application Configuration
VITE_APP_NAME=Gestion Emballages
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_TOOLS=true
VITE_LOG_LEVEL=debug

# Performance Configuration
VITE_VIRTUAL_SCROLL_THRESHOLD=100
VITE_DEBOUNCE_DELAY=300
VITE_CACHE_TTL=300000
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Backend Connection

Ensure the backend API is running at `http://localhost:5000`. The frontend will automatically connect and handle authentication.

## Available Scripts

### Development
```bash
npm run dev                  # Start development server (port 3000)
npm run build               # Build for production
npm run preview             # Preview production build locally
```

### Code Quality
```bash
npm run lint                # Run ESLint
npm run lint:fix            # Fix ESLint issues automatically
npm run format              # Format code with Prettier
```

### Testing
```bash
npm run test               # Run unit tests (if configured)
npm run test:e2e           # Run end-to-end tests (if configured)
```

## Project Structure

```
frontend/
├── public/                  # Static assets
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── api/                # API integration layer
│   │   ├── axios.js       # Axios configuration
│   │   ├── articles.js    # Article API calls
│   │   ├── stockFournisseur.js
│   │   └── previsions.js
│   ├── assets/             # Images, fonts, global styles
│   │   ├── favicon.png
│   │   ├── main.css
│   │   └── tailwind.css
│   ├── components/         # Reusable Vue components
│   │   ├── ui/            # Generic UI components
│   │   │   ├── Button.vue
│   │   │   ├── Select.vue
│   │   │   ├── WeekPicker.vue
│   │   │   ├── VirtualList.vue
│   │   │   ├── Modal.vue
│   │   │   └── ConfirmDialog.vue
│   │   ├── articles/      # Article-specific components
│   │   ├── fournisseurs/  # Supplier components
│   │   ├── stations/      # Station components
│   │   ├── users/         # User management components
│   │   ├── previsions/    # Forecast components
│   │   ├── SideBar.vue
│   │   ├── DashboardPage.vue
│   │   └── ArticleList.vue
│   ├── composables/        # Vue composition functions
│   │   ├── articles/      # Article-specific composables
│   │   │   ├── useArticleList.js
│   │   │   ├── useArticleData.js
│   │   │   ├── useArticleFilters.js
│   │   │   └── useArticleTreeState.js
│   │   ├── fournisseurs/  # Supplier composables
│   │   ├── stations/      # Station composables
│   │   ├── stocks/        # Stock management composables
│   │   ├── users/         # User management composables
│   │   ├── listeAchat/    # Shopping cart composables
│   │   ├── previsions/    # Forecast composables
│   │   ├── useLoading.js  # Loading state management
│   │   ├── useErrorHandler.js
│   │   ├── useNotification.js
│   │   └── usePerformanceOptimization.js
│   ├── router/             # Vue Router configuration
│   │   └── index.js
│   ├── stores/             # Pinia stores
│   │   ├── authStore.js   # Authentication & user state
│   │   ├── listeAchatStore.js # Shopping cart state
│   │   └── documentViewerStore.js
│   ├── strategies/         # Role-based behavior patterns
│   │   ├── articles/      # Article management strategies
│   │   │   ├── ArticleRoleStrategy.js
│   │   │   ├── ArticleFournisseurStrategy.js
│   │   │   ├── ArticleManagerStrategy.js
│   │   │   └── ArticleStationStrategy.js
│   │   ├── fournisseurs/  # Supplier strategies
│   │   ├── previsions/    # Forecast strategies
│   │   ├── stations/      # Station strategies
│   │   ├── stocks/        # Stock strategies
│   │   └── users/         # User management strategies
│   ├── utils/              # Utility functions
│   │   ├── debugTreeState.js
│   │   ├── statusUtils.js
│   │   ├── styles.js
│   │   └── testUserFilters.js
│   ├── views/              # Page components (routes)
│   │   ├── LoginPage.vue
│   │   ├── ArticlePage.vue
│   │   ├── CommandePage.vue
│   │   ├── StockPage.vue
│   │   ├── ListeAchatPage.vue
│   │   ├── PrevisionPage.vue
│   │   ├── SupplierStockPage.vue
│   │   ├── WeeklyStockEditPage.vue
│   │   ├── WeeklyPrevisionEditPage.vue
│   │   └── UserPage.vue
│   ├── App.vue             # Root component
│   └── main.js             # Application entry point
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.js          # Vite build configuration
└── README.md               # This file
```

## Key Features

### Authentication System
- JWT token-based authentication stored in localStorage
- Automatic token refresh and injection
- Role-based access control with route guards
- Persistent login state across browser sessions

### Role-Based UI
The application adapts its interface based on user roles:

- **Manager**: Full system access, all features enabled
- **Gestionnaire**: Operational management, limited financial access
- **Station**: Station-specific operations only
- **Fournisseur**: Supplier-specific operations only

### Performance Optimizations

#### Virtual Scrolling
- Automatically enabled for lists >100 items using `VirtualList.vue`
- Smooth scrolling with overscan for better UX
- Variable height item support
- Used in `ArticleList.vue`, `UserList.vue`, and other large datasets

#### Memoization & Caching
- Function result caching with LRU in `usePerformanceOptimization.js`
- Selective computed property updates with `memoizedComputed`
- Request deduplication to prevent duplicate API calls

#### Debouncing & Throttling
- Search inputs: 300ms debounce to reduce API calls
- Scroll events: 100ms throttle for smooth performance
- Form submissions: Request deduplication to prevent double-submits

### Design System

#### Color Palette
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;

/* Semantic Colors */
--success: #22c55e;    /* Green for positive actions */
--warning: #f59e0b;    /* Amber for warnings */
--error: #ef4444;      /* Red for errors */
--info: #06b6d4;       /* Cyan for information */
```

#### Typography
- Font family: Inter (with system fallback)
- Consistent scale: text-sm, text-base, text-lg, text-xl
- Semantic weights: font-normal, font-medium, font-semibold

#### Spacing
- Consistent 4px increment spacing scale
- Layout: space-y-4, space-x-4
- Padding: p-4, px-6, py-2
- Margins: m-4, mx-auto, my-6

## Component Architecture

### Layered Composables System

#### Core Composables
```javascript
// Loading state management
const { isLoading, withLoading } = useLoading();

// Error handling with user feedback
const { handleError, showError } = useErrorHandler();

// Toast notifications
const { showSuccess, showWarning, showError } = useNotification();

// Performance optimizations
const { memoize, debounce, throttle } = usePerformanceOptimization();
```

#### Feature Composables
Each domain has organized composables following established patterns:

```javascript
// Article management
const { 
  articles, 
  fetchArticles, 
  createArticle,
  updateArticle
} = useArticleData();

const { 
  searchQuery, 
  categoryFilter, 
  statusFilter,
  filteredArticles 
} = useArticleFilters();

const { 
  selectedArticles, 
  totalCount, 
  currentPage,
  itemsPerPage
} = useArticleList();
```

### Strategy Pattern Implementation

#### Role-Based Article Management
```javascript
// Article strategies handle role-specific behavior
import { ArticleRoleStrategyFactory } from '@/strategies/articles';

const strategy = ArticleRoleStrategyFactory.createStrategy(
  userRole, 
  userEntiteId
);

// Get role-specific columns, filters, and permissions
const columns = strategy.getTableColumns();
const filters = strategy.getAvailableFilters();
const permissions = strategy.getPermissions();
const canEdit = permissions.canEdit;
```

#### User Management Strategies
```javascript
// Separate system for user management
import { UserManagementStrategyFactory } from '@/strategies/users';

const userStrategy = UserManagementStrategyFactory.createStrategy(
  userRole, 
  userEntiteId
);

const userColumns = userStrategy.getTableColumns();
const userPermissions = userStrategy.getPermissions();
```

### UI Component Patterns

#### Standard List Page Structure
All list pages follow this consistent pattern:

```vue
<template>
  <div class="space-y-6">
    <!-- Search and Filters Section -->
    <div class="space-y-4">
      <div class="flex items-center space-x-4">
        <!-- Tree Toggle Button (if applicable) -->
        <button @click="toggleTreeState" class="btn-secondary">
          <ChevronDoubleUpIcon v-if="isTreeExpanded" />
          <ChevronDoubleDownIcon v-else />
        </button>
        
        <!-- Filters Button with Badge -->
        <button @click="showFilters = !showFilters" class="btn-secondary">
          <FunnelIcon />
          Filtres
          <span v-if="activeFiltersCount > 0" class="badge">
            {{ activeFiltersCount }}
          </span>
        </button>
        
        <!-- Search Input -->
        <div class="flex-1 relative">
          <MagnifyingGlassIcon class="search-icon" />
          <input 
            v-model="searchQuery" 
            placeholder="Rechercher..." 
            class="search-input"
          />
        </div>
      </div>
      
      <!-- Collapsible Filters Panel -->
      <div v-if="showFilters" class="filters-panel">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <!-- Status Filter (Always First) -->
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            label="Statut"
          />
          <!-- Additional filters... -->
        </div>
        <div class="flex justify-end">
          <Button @click="clearFilters" variant="secondary">
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Mobile View (Cards) -->
    <div class="block md:hidden">
      <div class="space-y-4">
        <div 
          v-for="item in items" 
          :key="item._id" 
          class="card-mobile"
        >
          <!-- Mobile card content -->
        </div>
      </div>
    </div>
    
    <!-- Desktop View (Table) -->
    <div class="hidden md:block">
      <div class="table-container">
        <table class="table-standard">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key">
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item._id">
              <!-- Table row content -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-container">
      <!-- Pagination controls -->
    </div>
  </div>
</template>
```

#### Responsive Design Principles
- **Mobile-first approach**: Base styles target mobile devices
- **Breakpoints**: `md:` (768px+) for desktop-specific features
- **Layout patterns**: Card layouts for mobile, table layouts for desktop
- **Touch-friendly**: Appropriate button sizes and spacing for mobile
- **Content priority**: Most important information visible on small screens

## API Integration

### Axios Configuration (`src/api/axios.js`)
```javascript
// Automatic JWT token injection in request headers
// Request/response interceptors for global error handling
// Configurable timeout and retry logic
// Base URL configuration from environment variables
```

### API Layer Organization
Each domain has its own API module:

```javascript
// Organized by feature domain
import { getArticles, createArticle, updateArticle } from '@/api/articles';
import { getSupplierStock, updateSupplierStock } from '@/api/stockFournisseur';
import { getPrevisions, updatePrevisions } from '@/api/previsions';
import { login, getProfile, logout } from '@/api/auth';
```

## State Management (Pinia)

### Authentication Store (`stores/authStore.js`)
```javascript
// JWT token management with localStorage persistence
// User profile caching and automatic refresh
// Role-based permissions and entity information
// Automatic token injection in API requests
// Login/logout state management
```

### Shopping Cart Store (`stores/listeAchatStore.js`)
```javascript
// Shopping cart item management
// Item count computations and total calculations
// Optimistic UI updates for better UX
// Persistent cart state across sessions
```

### Document Viewer Store (`stores/documentViewerStore.js`)
```javascript
// PDF document viewing state
// Document metadata management
// View history and bookmarks
```

## Development Guidelines

### Vue.js Best Practices
- **Composition API**: Use `<script setup>` syntax consistently
- **Reactivity**: `ref()` for primitives, `reactive()` for objects
- **Lifecycle**: Proper cleanup in `onUnmounted()` hooks
- **Performance**: Use `v-memo` for expensive list items
- **Props**: Define props with proper types and defaults

### Component Guidelines
- **Single File Components**: Use `.vue` files exclusively
- **Props validation**: Define props with TypeScript-style definitions
- **Event communication**: Use `emit` for parent-child communication
- **Slots**: Use slots for flexible content composition
- **Naming**: Use PascalCase for component names

### Performance Guidelines
- **Virtual scrolling**: Use `VirtualList.vue` for lists >100 items
- **Debouncing**: Debounce user inputs to reduce API calls
- **Memoization**: Memoize expensive computations
- **Lazy loading**: Implement lazy loading for routes and components
- **Bundle optimization**: Use dynamic imports for code splitting

### Code Style Standards
- **ESLint + Prettier**: Follow configured linting rules
- **Vue.js style guide**: Adhere to official Vue.js style guide
- **Naming conventions**: Use descriptive, consistent naming
- **Comments**: Document complex logic and business rules
- **File organization**: Group related files in feature directories

## Testing

### Unit Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Test specific components
npm run test -- ArticlePage.spec.js

# Generate coverage report
npm run test:coverage
```

### E2E Testing
```bash
# Run end-to-end tests
npm run test:e2e

# Run specific test suites
npm run test:e2e -- --spec="login.cy.js"

# Run tests in headless mode
npm run test:e2e:headless
```

### Testing Best Practices
- Test user interactions, not implementation details
- Use appropriate test utilities (Vue Test Utils, Testing Library)
- Mock external dependencies and API calls
- Test different user roles and permissions
- Include accessibility testing

## Build and Deployment

### Development Build
```bash
npm run dev
# Serves at http://localhost:3000
# Hot module replacement enabled
# Source maps included for debugging
# Development-specific optimizations
```

### Production Build
```bash
npm run build
# Creates optimized dist/ folder
# Assets are minified and hashed
# Tree-shaking removes unused code
# Generates service worker for caching
```

### Preview Production Build
```bash
npm run preview
# Serves production build locally
# Test production optimizations
# Verify build artifacts
```

### Environment Configuration
Create different `.env` files for different environments:

```bash
.env                    # Default values
.env.development        # Development overrides
.env.production         # Production settings
.env.local              # Local overrides (gitignored)
```

## Troubleshooting

### Common Development Issues

**API Connection Error**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Verify API URL in .env
VITE_API_BASE_URL=http://localhost:5000

# Check browser network tab for failed requests
```

**Authentication Issues**
```bash
# Check JWT token in browser dev tools
localStorage.getItem('token')

# Clear stored authentication data
localStorage.clear()
sessionStorage.clear()

# Check token expiration in authStore
```

**Build or Dependency Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force

# Update dependencies
npm update
```

**Styling Issues**
```bash
# Check Tailwind CSS compilation
npm run build:css

# Verify Tailwind config
npx tailwindcss -i ./src/assets/tailwind.css -o ./dist/output.css --watch

# Clear browser cache
Ctrl+Shift+R (hard refresh)
```

### Performance Issues

**Slow List Rendering**
- Enable virtual scrolling for lists >100 items
- Use `v-memo` directive for complex list items
- Implement proper pagination with backend support
- Check for unnecessary reactivity in large datasets

**Memory Leaks**
- Check for missing `onUnmounted()` cleanup
- Remove global event listeners properly
- Clear intervals and timeouts
- Dispose of reactive watchers

**Bundle Size Issues**
- Analyze bundle with `npm run build -- --analyze`
- Implement code splitting with dynamic imports
- Remove unused dependencies
- Optimize images and assets

## Browser Support

### Supported Browsers
- **Chrome**: 90+ (primary development target)
- **Firefox**: 88+ (full feature support)
- **Safari**: 14+ (iOS and macOS)
- **Edge**: 90+ (Chromium-based)

### Polyfills and Compatibility
- Vite automatically includes necessary polyfills
- ES2020+ features are used throughout
- Modern JavaScript syntax (optional chaining, nullish coalescing)
- CSS Grid and Flexbox for layouts

## Performance Metrics

### Target Performance Goals
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.5s
- **Cumulative Layout Shift**: <0.1
- **Bundle size**: <500KB gzipped

### Monitoring and Optimization
- Use browser dev tools for performance profiling
- Implement Web Vitals monitoring in production
- Regular bundle size analysis
- Performance budget enforcement

## Contributing

### Development Workflow
1. **Branch creation**: Create feature branch from `main`
2. **Development**: Follow established patterns and conventions
3. **Testing**: Add/update tests for new functionality
4. **Code quality**: Run `npm run lint:fix` before commits
5. **Testing**: Test thoroughly with different user roles
6. **Documentation**: Update documentation for significant changes
7. **Pull request**: Submit PR with clear description and testing notes

### Code Review Checklist
- [ ] Follows Vue.js best practices and conventions
- [ ] Uses established component patterns and structure
- [ ] Implements proper error handling and loading states
- [ ] Includes responsive design for mobile and desktop
- [ ] Tests role-based behavior for all user types
- [ ] Performance considerations for large datasets
- [ ] Accessibility guidelines followed
- [ ] Documentation updated if needed

## Design System Resources

### Icons
- **Heroicons**: Primary icon library (24px outline, 20px solid)
- **Usage**: Import specific icons to reduce bundle size
- **Consistency**: Use outline icons for most interfaces
- **Actions**: Use solid icons for primary action buttons

### Component Library
- **Button**: CVA variant system with consistent styling
- **Select**: Custom dropdown with search and keyboard navigation
- **Modal**: HeadlessUI-based with proper accessibility
- **Forms**: Consistent validation display and error handling
- **VirtualList**: High-performance list rendering

### Animation Guidelines
- **Transitions**: CSS transitions for hover and focus states
- **Page transitions**: Vue Router transitions between views
- **Loading states**: Skeleton screens and loading spinners
- **Micro-interactions**: Subtle animations for user feedback

## Accessibility

### Standards Compliance
- **WCAG 2.1 AA**: Target compliance level
- **Keyboard navigation**: Full keyboard accessibility
- **Screen readers**: Proper ARIA labels and descriptions
- **Color contrast**: Minimum 4.5:1 ratio for text
- **Focus management**: Visible focus indicators

### Testing Tools
- **axe-core**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation
- **Screen readers**: Test with NVDA, JAWS, VoiceOver
- **Keyboard only**: Test all functionality without mouse

## Security Considerations

### Client-Side Security
- **XSS prevention**: Proper input sanitization
- **CSRF protection**: API token validation
- **Content Security Policy**: Restrict resource loading
- **Secure storage**: Sensitive data handling

### Authentication Security
- **JWT storage**: localStorage with expiration handling
- **Token refresh**: Automatic token renewal
- **Route protection**: Authentication guards on protected routes
- **Role validation**: Client and server-side role checks

## License

[Your License Here]

## Support and Resources

### Development Support
- **Component examples**: Check existing implementations in codebase
- **Composable patterns**: Review established composable structures
- **Role testing**: Use different test accounts for role-based features
- **Browser tools**: Use Vue DevTools for state inspection

### External Resources
- **Vue.js Documentation**: https://vuejs.org/
- **Vite Documentation**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Pinia State Management**: https://pinia.vuejs.org/
- **Vue Router**: https://router.vuejs.org/

### Community and Help
- Check existing issues and discussions in the repository
- Follow Vue.js community guidelines and best practices
- Contribute back improvements and bug fixes
- Share knowledge with team members