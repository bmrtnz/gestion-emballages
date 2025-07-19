# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The "Gestion Emballages" system is a B2B packaging management platform designed for agricultural cooperatives. It facilitates the procurement, inventory management, and distribution of packaging materials (boxes, trays, plastic films, etc.) across a network of cooperative stations. The system consists of a Node.js/Express backend API and a Vue.js frontend application built with modern best practices and performance optimizations.

## Architecture

### Backend (Node.js/Express)
- **Express.js** API server with modular MVC architecture
- **MongoDB** with Mongoose ODM for data persistence
- **MinIO** for file storage (documents, PDFs, images)
- **JWT** authentication with role-based access control
- **Swagger** API documentation at `/api-docs`
- **JSDoc** code documentation at `/docs`
- **Jest** for unit testing with mocked dependencies
- **Custom middleware**: Pagination, authentication, error handling, validation
- **Service layer pattern** for complex business logic
- **Workflow engine** for state transitions

### Frontend (Vue.js 3)
- **Vue 3** with Composition API and script setup
- **Vue Router** for navigation with authentication guards
- **Pinia** for state management with composition style stores
- **Tailwind CSS** for styling with custom design system
- **Ant Design Vue** for selective UI components
- **Vite** for build tooling and fast HMR
- **Custom UI components** with CVA (class-variance-authority)
- **Performance optimizations**: Virtual scrolling, memoization, debouncing
- **Strategy pattern** for role-based UI behavior
- **Layered composables** architecture

### Key Business Entities

#### 1. **Stations** (Agricultural Cooperatives)
- Independent cooperative entities that consume packaging materials
- Physical locations with inventory management
- Can place orders and request inter-station transfers

#### 2. **Fournisseurs** (Suppliers)
- External suppliers with multiple sites/locations
- SIRET-registered businesses with specializations
- Maintain product catalogs with site-specific stock levels

#### 3. **Articles** (Products/Packaging Items)
- Packaging materials (Barquette, Cagette, Plateau, Film Plastique, Carton, etc.)
- Many-to-many supplier relationships with pricing
- Supplier-specific references, images, and documentation

#### 4. **Commandes** (Orders)
- Purchase orders with complex workflow states
- Support for partial deliveries and non-conformity tracking
- Grouped into CommandeGlobale for bulk ordering

#### 5. **Stock Management**
- **StockStation**: Real-time inventory at stations
- **StockFournisseur**: Inventory at supplier sites
- Point-in-time snapshots with audit trails

#### 6. **Demandes de Transfert** (Transfer Requests)
- Inter-station stock movements
- Multi-step approval workflow
- Shipping and reception tracking

#### 7. **Prévisions** (Demand Forecasting)
- Annual campaign-based (e.g., "25-26")
- Weekly granularity forecasting
- Per article, per supplier projections

## Constants and Enums

### Article Categories
Article categories are defined as constants in `backend/utils/constants.js` to ensure consistency across the application:
- Single source of truth for all category values
- Used in Mongoose schema validation
- Exposed via `/api/articles/categories` endpoint
- Frontend fetches categories from API to avoid hardcoding

### User Roles
User roles are also defined in constants to maintain consistency:
- Used in Mongoose schema validation
- Referenced in controllers for validation
- Ensures consistent role checking across the application

## Development Commands

### Backend
```bash
cd backend
npm start                    # Start server
npm test                     # Run Jest tests
npm run docs:generate        # Generate JSDoc documentation
npm run data:import          # Seed database with sample data
npm run data:destroy         # Clear database
```

### Frontend
```bash
cd frontend
npm run dev                  # Start development server (port 3000)
npm run build               # Build for production
npm run preview             # Preview production build
```

### Docker
```bash
docker-compose up           # Start all services (app, MongoDB, MinIO)
```

## API Structure

### Authentication & Authorization
- JWT tokens stored in localStorage (1-day expiration)
- Role-based access: `Manager`, `Gestionnaire`, `Station`, `Fournisseur`
- Entity-based permissions (users see only their entity's data)
- `protect` middleware for authentication
- `authorize` middleware for role-based access control

### Complete API Endpoints

#### User Management (`/api/users`)
- `POST /api/users` - Create new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get current user profile
- `GET /api/users` - List users with pagination
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `PATCH /api/users/:id/reactivate` - Reactivate user

#### Station Management (`/api/stations`)
- `GET /api/stations` - List with pagination
- `POST /api/stations` - Create (Manager/Gestionnaire)
- `GET /api/stations/:id` - Get by ID
- `PUT /api/stations/:id` - Update
- `DELETE /api/stations/:id` - Deactivate
- `PATCH /api/stations/:id/reactivate` - Reactivate

#### Supplier Management (`/api/fournisseurs`)
- `GET /api/fournisseurs` - List with pagination
- `POST /api/fournisseurs` - Create (Manager/Gestionnaire)
- `GET /api/fournisseurs/:id` - Get by ID
- `PUT /api/fournisseurs/:id` - Update
- `DELETE /api/fournisseurs/:id` - Deactivate
- `PATCH /api/fournisseurs/:id/reactivate` - Reactivate

#### Article Management (`/api/articles`)
- `GET /api/articles/categories` - Get categories
- `GET /api/articles` - List with pagination
- `POST /api/articles` - Create
- `GET /api/articles/:id` - Get by ID
- `PUT /api/articles/:id` - Update
- `DELETE /api/articles/:id` - Deactivate
- `POST /api/articles/:id/fournisseurs` - Add supplier
- `PUT /api/articles/:id/fournisseurs/:fournisseurInfoId` - Update supplier info
- `DELETE /api/articles/:id/fournisseurs/:fournisseurInfoId` - Remove supplier
- `POST /api/articles/:id/fournisseurs/:fournisseurId/image` - Upload image
- `DELETE /api/articles/:id/fournisseurs/:fournisseurId/image` - Delete image

#### Shopping List (`/api/listes-achat`)
- `GET /api/listes-achat` - Get current list (Station)
- `POST /api/listes-achat` - Add/update item
- `POST /api/listes-achat/validate` - Convert to orders
- `DELETE /api/listes-achat/items/:itemId` - Remove item

#### Order Management (`/api/commandes`)
- `GET /api/commandes` - List orders
- `GET /api/commandes/:id` - Get details
- `PUT /api/commandes/:id/statut` - Update status
- `DELETE /api/commandes/:id` - Cancel order

#### Transfer Requests (`/api/demandes-transfert`)
- Full CRUD with status workflow
- Role-based status transitions

#### Other Endpoints
- `/api/commandes-globales` - Global order management
- `/api/stocks` - Stock level management
- `/api/previsions` - Demand forecasting
- `/api/upload` - File uploads to MinIO

## Database Models

### Key Relationships
- **Articles** have multiple **Fournisseurs** (many-to-many with pricing)
- **Commandes** belong to **Stations** and contain **Articles**
- **Stocks** track inventory at **Stations** for **Articles**
- **DemandeTransfert** manages stock transfers between **Stations**

### Important Schema Features
- Soft deletes with `isActive` field (not `deleted`)
- Automatic timestamps: `createdAt`, `updatedAt`
- Audit fields: `createdBy`, `updatedBy` (on some models)
- Status enums for workflow state machines
- Auto-population hooks for related data
- Dynamic references using `refPath` (User model)
- Cascading deactivation (suppliers/stations → users)
- Indexed fields for performance

## Frontend State Management

### Pinia Stores (Composition API Style)
- **authStore**: 
  - JWT token management with localStorage
  - User profile caching
  - Role-based permissions
  - Auto token injection in API calls
- **listeAchatStore**: 
  - Shopping cart state management
  - Item count computations
  - Optimistic UI updates
  - Active list persistence
- **documentViewerStore**: 
  - PDF viewing state
  - Document metadata handling

### Layered Composables Architecture

#### Core Composables
- **useLoading**: Async operation wrapper with loading states
- **useErrorHandler**: Centralized error handling with user feedback
- **useNotification**: Toast notifications (success/error/warning/info)
- **useFormValidation**: Advanced validation with rules engine

#### Feature Composables (Organized by Domain)
- **Articles** (`composables/articles/`)
  - **useArticleList**: Orchestrates article list functionality
  - **useArticleData**: Data fetching and state management
  - **useArticleFilters**: Filter state and validation
  - **useArticleTreeState**: Hierarchical view management
- **Users** (`composables/users/`)
  - **useUserList**: User list orchestration
  - **useUserData**: User data management
  - **useUserFilters**: User filtering logic
  - **useUserRoleStrategy**: User role-based behavior
- **Suppliers** (`composables/fournisseurs/`)
  - **useFournisseurList**: Supplier list management
  - **useFournisseurData**: Supplier data operations
- **Stations** (`composables/stations/`)
  - **useStationList**: Station list functionality
  - **useStationData**: Station data management
- **Cross-cutting**
  - **useRoleStrategy**: Article role-based UI behavior
  - **usePerformanceOptimization**: Memoization, debouncing, caching

#### Performance Composables
- **memoize**: Function result caching with LRU
- **memoizedComputed**: Selective computed updates
- **debounce**: Delayed function execution
- **throttle**: Rate-limited execution
- **measure**: Performance monitoring in dev

## File Storage

- **MinIO** integration for PDF uploads and document management
- Configuration in `backend/config/minioClient.js`
- Upload endpoint at `/api/upload`
- Documents accessible via pre-signed URLs

## Testing

### Backend Tests
- **Jest** test framework
- Configuration in `backend/config/jest.config.js`
- Test files in `backend/tests/`
- Tests cover controllers, validation, and business logic

### Test Users (from seeder)
- **Station A**: j.martin@valdegaronne.com / password123
- **Station B**: m.lebrun@coop-pyrenees.fr / password123  
- **Fournisseur**: edn@supplier.com / password123
- **Gestionnaire**: nicole@embadif.com / password123

## Development Notes

### Error Handling
- Custom `AppError` class for consistent error responses
- Validation errors use `express-validator`
- Global error middleware in `backend/middleware/errorMiddleware.js`

### Security
- JWT tokens with configurable expiration
- CORS enabled for frontend communication
- Input validation on all API endpoints
- Role-based route protection

### Documentation
- Swagger UI available at `/api-docs` when server is running
- JSDoc documentation at `/docs`
- API endpoints documented with JSDoc comments

## Design Patterns and Performance Optimizations

### Architecture Principles

#### 1. Separation of Concerns
- Each composable has single responsibility
- Business logic separated from UI components
- Strategy pattern for role-based behavior
- Service layer for complex operations

#### 2. Composition over Inheritance
- Composables composed together
- No class inheritance chains
- Flexible feature combinations
- Reusable across components

#### 3. Performance First
- Virtual scrolling for large datasets (>100 items)
- Memoization for expensive computations
- Debounced user inputs (250-300ms)
- Singleton formatters (Intl.NumberFormat, DateFormat)

### Component Architecture Patterns

#### Standard Component Variants
- `ComponentName.vue` - Standard implementation
- `ComponentNameStrategy.vue` - Strategy pattern implementation  
- `ComponentNameOptimized.vue` - Performance optimized version

#### Virtual Scrolling Implementation
- Custom `VirtualList` component
- Support for variable height items
- Horizontal and vertical scrolling
- Overscan for smooth experience
- Used when datasets exceed 100 items

#### Role-Based Strategy Pattern

The application uses two distinct strategy systems organized in separate directories:

#### Article Management Strategies (`strategies/articles/`)
```javascript
// Base strategy for article management
class ArticleRoleStrategy {
  transformTableData(articles) {}
  getAvailableFilters() {}
  getTableColumns() {}
  getUIBehavior() {}
  getPermissions() {}
}

// Concrete implementations
class ArticleFournisseurStrategy extends ArticleRoleStrategy {}
class ArticleManagerStrategy extends ArticleRoleStrategy {}
class ArticleStationStrategy extends ArticleRoleStrategy {}

// Factory for creating article strategies
class ArticleRoleStrategyFactory {
  static createStrategy(userRole, userEntiteId) {}
}
```

#### User Management Strategies (`strategies/users/`)
```javascript
// Base strategy for user management
class UserManagementStrategy {
  transformTableData(users) {}
  getAvailableFilters() {}
  getTableColumns() {}
  getUIBehavior() {}
  getPermissions() {}
  canPerformAction(action, user) {}
}

// Concrete implementations
class UserManagerStrategy extends UserManagementStrategy {}
class UserGestionnaireStrategy extends UserManagementStrategy {}
class UserStationStrategy extends UserManagementStrategy {}
class UserFournisseurStrategy extends UserManagementStrategy {}

// Factory for creating user management strategies
class UserManagementStrategyFactory {
  static createStrategy(userRole, userEntiteId) {}
}
```

#### Strategy Directory Structure
```
strategies/
├── articles/           # Article management strategies
│   ├── ArticleRoleStrategy.js
│   ├── ArticleFournisseurStrategy.js
│   ├── ArticleManagerStrategy.js
│   ├── ArticleStationStrategy.js
│   └── index.js
└── users/             # User management strategies
    ├── BaseUserManagementStrategy.js
    ├── UserManagementStrategy.js
    ├── UserManagerStrategy.js
    ├── UserGestionnaireStrategy.js
    ├── UserStationStrategy.js
    └── UserFournisseurStrategy.js
```

### Performance Optimization Utilities

#### Memoization Patterns
- Function memoization with configurable cache size
- Memoized computed properties with dependencies
- Time-based cache invalidation
- LRU cache implementation

#### Debouncing and Throttling
- Search inputs: 250-300ms debounce
- Scroll events: 100ms throttle
- API calls: Request deduplication

### List Page Design Patterns

This section documents the established patterns for all list pages that must be followed for consistency.

### Backend API Patterns

#### Pagination Implementation
- **Middleware**: Use `paginationMiddleware` for all list endpoints
- **Controller Pattern**: Accept `{ page, limit, skip, search, sortBy, sortOrder, filters }` from `req.pagination`
- **Response Format**: Use `req.pagination.buildResponse(data, totalCount)` for consistent response structure
- **Default Sorting**: Implement sensible defaults (e.g., `sortBy: 'nom', sortOrder: 'asc'`)

#### Search Implementation
- **Multi-field Search**: Always implement comprehensive search across relevant fields
- **Case Insensitive**: Use `{ $regex: search, $options: 'i' }` for text search
- **Cross-Collection Search**: For entities with relationships, search related collections (e.g., users search in station/supplier names)
- **OR Queries**: Use `$or` arrays for multi-field searches

#### Filtering Patterns
- **Status Filter**: Implement consistent status filtering with values: `'active'`, `'inactive'`, or empty for all
- **Filter Logic**: 
  ```javascript
  if (filters.status === 'active') {
    query.isActive = true;
  } else if (filters.status === 'inactive') {
    query.isActive = false;
  }
  // Empty status shows all items
  ```

#### Example Controller Pattern
```javascript
exports.getItems = async (req, res, next) => {
  try {
    const { page, limit, skip, search, sortBy, sortOrder, filters } = req.pagination;
    
    let query = {};
    
    // Status filtering
    if (filters.status === 'active') {
      query.isActive = true;
    } else if (filters.status === 'inactive') {
      query.isActive = false;
    }
    
    // Search implementation
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        // Add other searchable fields
      ];
    }
    
    const items = await Model.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
    
    const totalCount = await Model.countDocuments(query);
    
    res.json(req.pagination.buildResponse(items, totalCount));
  } catch (error) {
    next(error);
  }
};
```

### Frontend Component Patterns

#### Component Structure
```vue
<template>
  <div class="space-y-6">
    <!-- Search and Filters -->
    <div class="space-y-4">
      <!-- Search Bar and Controls -->
      <div class="flex items-center space-x-4">
        <!-- Toggle Button (for tree views) -->
        <button @click="toggleTreeState" class="...">
          <ChevronDoubleUpIcon v-if="isTreeExpanded" />
          <ChevronDoubleDownIcon v-else />
        </button>
        
        <!-- Filters Button -->
        <button @click="showFilters = !showFilters" class="...">
          <FunnelIcon />
          Filtres
          <span v-if="activeFiltersCount > 0" class="...">
            {{ activeFiltersCount }}
          </span>
        </button>
        
        <!-- Search Input -->
        <div class="flex-1 relative">
          <MagnifyingGlassIcon />
          <input v-model="searchQuery" placeholder="..." />
        </div>
      </div>
      
      <!-- Filters Panel -->
      <div v-if="showFilters" class="p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <!-- Filter controls -->
        </div>
        <div class="flex justify-end">
          <Button @click="clearFilters">Réinitialiser les filtres</Button>
        </div>
      </div>
    </div>
    
    <!-- Mobile View -->
    <div class="block md:hidden">
      <!-- Mobile cards -->
    </div>
    
    <!-- Desktop View -->
    <div class="hidden md:block">
      <!-- Desktop table -->
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="...">
      <!-- Pagination controls -->
    </div>
  </div>
</template>
```

#### State Management Pattern
```javascript
// Pagination state
const currentPage = ref(1);
const totalPages = ref(0);
const totalItems = ref(0);
const itemsPerPage = ref(10);
const hasNextPage = ref(false);
const hasPrevPage = ref(false);
const pagination = ref(null);
const filters = ref({});

// UI state
const searchQuery = ref('');
const statusFilter = ref(''); // '', 'active', 'inactive'
const showFilters = ref(false);

// Data fetching
const fetchData = async () => {
  const params = {
    page: currentPage.value,
    limit: itemsPerPage.value,
    search: searchQuery.value,
    status: statusFilter.value, // NOT showInactive
    sortBy: 'nom',
    sortOrder: 'asc'
  };
  
  const response = await api.get('/endpoint', { params });
  // Update pagination state from response
};

// Debounced search
const debouncedFetch = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      currentPage.value = 1;
      fetchData();
    }, 300);
  };
})();

// Watchers
watch(searchQuery, debouncedFetch);
watch(statusFilter, debouncedFetch);
```

### UI/UX Design Rules

#### Search Bar Design
- **Layout**: `[Toggle Button] [Filters Button] [Search Input]`
- **Toggle Button**: Icon-only for desktop, with text for mobile
- **Filters Button**: Always include filter count badge when filters are active
- **Search Input**: Full-width with search icon and descriptive placeholder

#### Filter Panel Design
- **Layout**: 4-column grid on desktop (`grid-cols-1 md:grid-cols-4`)
- **Background**: Light gray background (`bg-gray-50`)
- **Spacing**: Consistent padding (`p-4`) and gap (`gap-4`)
- **Reset Button**: Always positioned bottom-right
- **Filter Controls**: Use Select dropdowns, not checkboxes

#### Status Filter Standard
- **Options**: Always use `['Tout', 'Actif', 'Inactif']`
- **Values**: `['', 'active', 'inactive']`
- **Implementation**: Use Select component, not checkbox
- **Placement**: First column in filter grid

#### Pagination Design
- **Layout**: Three-section layout on desktop
  - **Left**: Results information ("Affichage de X à Y sur Z résultats")
  - **Center**: Page size selector with "Afficher: [dropdown] par page"
  - **Right**: Page navigation buttons
- **Selected Page**: Primary color background (`bg-primary-600`) with white text
- **Unselected Pages**: Gray border with hover effects
- **Mobile**: Simple Previous/Next buttons

#### Tree View Controls (Suppliers)
- **Toggle Button**: Double chevron icons (`ChevronDoubleUpIcon`/`ChevronDoubleDownIcon`)
- **Position**: Before filters button in search bar
- **State**: Computed from actual tree state, not separate state
- **Persistence**: Tree state is preserved across navigation
- **Mobile**: Include text with icon for better UX

#### Responsive Design
- **Mobile**: Card-based layout with essential information
- **Desktop**: Table layout with full information
- **Breakpoint**: Use `md:` prefix for desktop-specific styles
- **Touch Targets**: Ensure buttons are appropriately sized for mobile

#### Visual Consistency
- **Colors**: Use primary color (`primary-600`) for active states
- **Spacing**: Consistent spacing using Tailwind classes
- **Typography**: Consistent font sizes and weights
- **Icons**: Use Heroicons for consistency
- **Shadows**: Subtle shadows for depth (`shadow-sm`)

### Data Handling Rules

#### Search Functionality
- **Debouncing**: 300ms delay for search input
- **Multi-field**: Search across all relevant text fields
- **Placeholder Text**: Describe what fields are searchable
- **Case Insensitive**: Always case-insensitive search

#### Error Handling
- **Composables**: Use `useErrorHandler` for consistent error handling
- **Loading States**: Use `useLoading` for loading management
- **User Feedback**: Show appropriate error messages to users

#### Performance
- **Pagination**: Always implement server-side pagination
- **Debouncing**: Prevent excessive API calls during typing
- **Caching**: Consider caching strategies for frequently accessed data

### Component Imports Standard
```javascript
// Vue imports
import { ref, computed, onMounted, watch } from 'vue';

// Composables
import { useLoading } from '../composables/useLoading';
import { useErrorHandler } from '../composables/useErrorHandler';

// API
import api from '../api/axios';

// Icons (Heroicons)
import { 
  PencilSquareIcon, 
  PlusIcon, 
  PlayIcon, 
  PauseIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ChevronDownIcon 
} from '@heroicons/vue/24/outline';

// Components
import Button from './ui/Button.vue';
import Select from './ui/Select.vue';
import SlidePanel from './ui/SlidePanel.vue';
```

These patterns ensure consistency across all list pages and should be followed when creating new list components or modifying existing ones.

## Business Workflows and Rules

### Order Management Workflow

#### Status Progression
1. **Enregistrée** (Registered) - Initial state when order created
2. **Confirmée** (Confirmed) - Supplier confirms the order
3. **Expédiée** (Shipped) - Supplier ships the order
4. **Réceptionnée** (Received) - Station confirms receipt
5. **Clôturée** (Closed) - Station closes the order
6. **Facturée** (Invoiced) - Manager/Gestionnaire processes invoice
7. **Archivée** (Archived) - Final archived state

#### Workflow Rules
- Only supplier users can confirm/ship orders
- Only station users can receive/close orders
- Only Manager/Gestionnaire can invoice/archive
- Supports partial deliveries
- Non-conformity tracking at reception

### Stock Transfer Workflow

#### Status Progression
1. **Enregistrée** - Initial transfer request
2. **Confirmée/Rejetée** - Source station approves/rejects
3. **Traitée logistique** - Gestionnaire processes logistics
4. **Expédiée** - Source station ships
5. **Réceptionnée** - Destination receives
6. **Clôturée** - Destination closes
7. **Traitée comptabilité** - Accounting processed
8. **Archivée** - Final state

#### Transfer Rules
- Only between stations (no suppliers)
- Quantities adjustable during confirmation
- Gestionnaire approval for logistics
- Full audit trail maintained

### Security and Permissions

#### Role Hierarchy
1. **Manager** - Full system access
2. **Gestionnaire** - Operational management
3. **Station** - Station-specific operations
4. **Fournisseur** - Supplier-specific operations

#### Permission Model
- JWT-based authentication (1-day expiration)
- Role-based API endpoint protection
- Entity-based data filtering
- Cascading deactivation rules

### Business Constraints

#### User Management
- Unique email addresses required
- Users tied to entities (Station/Fournisseur)
- Soft deletes preserve data integrity
- Password complexity requirements

#### Article Management  
- Multiple suppliers per article allowed
- Supplier-specific pricing and packaging
- Images stored in MinIO
- Category validation against constants

#### Inventory Rules
- Point-in-time stock snapshots
- Audit trail with user tracking
- Separate station/supplier inventories
- No negative stock allowed

## Important Development Rules

### Code Organization Standards

#### File Structure
```
backend/
├── controllers/     # Request handlers
├── models/         # Mongoose schemas
├── routes/         # API route definitions
├── middleware/     # Custom middleware
├── services/       # Business logic layer
├── utils/          # Helpers and constants
├── config/         # Configuration files
└── tests/          # Jest unit tests

frontend/
├── components/     # Reusable components
│   ├── ui/        # Generic UI components
│   └── [feature]/ # Feature-specific
├── views/          # Page components
├── composables/    # Vue composition functions
│   ├── articles/  # Article-specific composables
│   ├── fournisseurs/  # Supplier-specific composables
│   ├── stations/  # Station-specific composables
│   └── users/     # User-specific composables
├── stores/         # Pinia stores
├── strategies/     # Role strategies
│   ├── articles/  # Article management strategies
│   └── users/     # User management strategies
├── api/           # API integration
└── utils/         # Utilities
```

### Development Standards

#### Backend Requirements
- **ALWAYS** use `paginationMiddleware` for list endpoints
- **ALWAYS** implement comprehensive multi-field search
- **ALWAYS** use consistent status filtering patterns
- **ALWAYS** validate requests with express-validator
- **ALWAYS** handle errors with AppError class
- **NEVER** expose sensitive data in responses
- **NEVER** allow unauthorized role transitions

#### Frontend Requirements  
- **ALWAYS** use established list page patterns
- **ALWAYS** implement responsive mobile/desktop views
- **ALWAYS** use composables for shared logic
- **ALWAYS** follow the design system (colors, spacing)
- **ALWAYS** implement loading and error states
- **ALWAYS** debounce search inputs (250-300ms)
- **NEVER** hardcode business logic in components
- **NEVER** skip performance optimizations for large datasets

#### Performance Guidelines
- Use virtual scrolling for lists >100 items
- Memoize expensive computations
- Implement request caching where appropriate
- Monitor performance in development mode
- Use shallow reactivity for large arrays
- Batch state updates when possible

#### Testing Standards
- Unit test all service layer functions
- Mock external dependencies in tests
- Test error scenarios and edge cases
- Maintain >80% code coverage
- Use descriptive test names

### Design System

#### Color Palette
- Primary: Blue shades for main actions
- Accent: Green for positive states
- Sunshine: Yellow for warnings
- Energy: Orange for attention
- Error: Red for errors/deletion

#### Component Patterns
- Buttons use CVA variant system
- Forms use consistent validation UI
- Tables have mobile card variants
- Modals use HeadlessUI patterns
- Icons from Heroicons library

#### Responsive Breakpoints
- Mobile: default (<640px)
- Tablet: sm (≥640px)
- Desktop: md (≥768px)
- Large: lg (≥1024px)
- Extra Large: xl (≥1280px)

### Strategy System Implementation Rules

#### Separation of Concerns
- **Article Strategies** (`strategies/articles/`): Handle article list display, filtering, and permissions
- **User Management Strategies** (`strategies/users/`): Handle user list display, role-based actions, and permissions
- **Never mix**: These two systems are completely separate and should never reference each other

#### Naming Conventions
- **Article Strategies**: Prefix with `Article` (e.g., `ArticleManagerStrategy`)
- **User Strategies**: Prefix with `User` or use descriptive names (e.g., `UserManagerStrategy`)
- **Base Classes**: Clear names indicating purpose (`ArticleRoleStrategy`, `UserManagementStrategy`)
- **Factories**: Include domain in name (`ArticleRoleStrategyFactory`, `UserManagementStrategyFactory`)

#### Import Rules
- **Article Components**: Import from `'../strategies/articles'`
- **User Components**: Import from `'../strategies/users/UserManagementStrategy'`
- **Composables**: Use appropriate strategy factory for their domain
- **Never cross-import**: Article strategies should not import user strategies and vice versa

#### Extension Guidelines
- **New Roles**: Add to appropriate strategy system based on context
- **New Features**: Create new strategy system if different domain
- **Modifications**: Update base class and all concrete implementations
- **Testing**: Verify both systems work independently

### Future Extensibility

#### Planned Features
- Group management for stations
- Advanced analytics dashboard
- Mobile application support
- Real-time notifications
- Webhook integrations
- API versioning implementation

#### Architecture Considerations
- Modular design supports new entities
- Workflow engine handles new flows
- Dual strategy pattern enables role-based features
- Organized composables architecture aids reuse
- Performance patterns scale with data
- Clear separation prevents strategy system conflicts