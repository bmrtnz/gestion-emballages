# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a packaging management system ("gestion-emballages") for managing suppliers, articles, orders, and stock transfers in a cooperative network. The system consists of a Node.js/Express backend API and a Vue.js frontend application.

## Architecture

### Backend (Node.js/Express)
- **Express.js** API server with modular MVC architecture
- **MongoDB** with Mongoose ODM for data persistence
- **MinIO** for file storage (documents, PDFs)
- **JWT** authentication with role-based access control
- **Swagger** API documentation at `/api-docs`
- **JSDoc** code documentation at `/docs`

### Frontend (Vue.js 3)
- **Vue 3** with Composition API
- **Vue Router** for navigation with authentication guards
- **Pinia** for state management
- **Tailwind CSS** for styling
- **Ant Design Vue** for UI components
- **Vite** for build tooling

### Key Business Entities
- **Stations**: Cooperative entities that place orders
- **Fournisseurs**: Suppliers that provide articles
- **Articles**: Products/packaging items with supplier relationships
- **Commandes**: Orders placed by stations
- **Stock**: Inventory management across stations
- **Transferts**: Stock transfer requests between stations
- **Prévisions**: Demand forecasting

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

### Authentication
- JWT tokens stored in localStorage
- Role-based access: `gestionnaire`, `station`, `fournisseur`
- Authentication middleware validates tokens on protected routes

### Core API Endpoints
- `/api/users` - User management and authentication
- `/api/stations` - Station management
- `/api/fournisseurs` - Supplier management  
- `/api/articles` - Article/product management
- `/api/commandes` - Order management
- `/api/stocks` - Stock management
- `/api/demandes-transfert` - Transfer requests
- `/api/previsions` - Demand forecasting
- `/api/upload` - File upload to MinIO

## Database Models

### Key Relationships
- **Articles** have multiple **Fournisseurs** (many-to-many with pricing)
- **Commandes** belong to **Stations** and contain **Articles**
- **Stocks** track inventory at **Stations** for **Articles**
- **DemandeTransfert** manages stock transfers between **Stations**

### Important Schema Features
- Most models use soft deletes (`deleted: Boolean`)
- Audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
- Status enums for workflow management
- Population hooks for related data

## Frontend State Management

### Pinia Stores
- **authStore**: Authentication, user session management
- **listeAchatStore**: Shopping cart functionality
- **documentViewerStore**: Document viewing state

### Composables
- **useLoading**: Loading state management
- **useErrorHandler**: Centralized error handling
- **useNotification**: Toast notifications
- **useFormValidation**: Form validation utilities

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

## List Page Design Patterns

This section documents the established patterns for Users, Suppliers, and Stations list pages that should be followed for consistency across the application.

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

## Important Development Rules

### List Page Implementation
- **ALWAYS** use the established patterns documented above for any list page
- **NEVER** deviate from the UI/UX design rules without explicit approval
- **ALWAYS** implement server-side pagination with the standard middleware
- **ALWAYS** use status filters with the standard 'Tout'/'Actif'/'Inactif' pattern
- **ALWAYS** implement 4-column filter layouts
- **ALWAYS** use debounced search with 300ms delay
- **ALWAYS** follow the three-section pagination layout

### Backend API Standards
- **ALWAYS** use `paginationMiddleware` for list endpoints
- **ALWAYS** implement comprehensive search across relevant fields
- **ALWAYS** use consistent status filtering logic
- **ALWAYS** return data using `req.pagination.buildResponse()`

### Frontend Component Standards
- **ALWAYS** use the established component structure and state management patterns
- **ALWAYS** implement both mobile and desktop responsive views
- **ALWAYS** use the standard import patterns and composables
- **ALWAYS** follow the visual consistency rules for colors, spacing, and typography