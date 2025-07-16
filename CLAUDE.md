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