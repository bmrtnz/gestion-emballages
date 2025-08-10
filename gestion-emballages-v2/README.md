# Blue Whale Portal

A modern B2B supply chain management platform for agricultural cooperatives, built with NestJS, Angular, and PostgreSQL.

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based with role-based access control
- **File Storage**: MinIO for documents and images
- **Caching**: Redis for session management and caching
- **API Documentation**: Swagger/OpenAPI

### Frontend (Angular)
- **Framework**: Angular 17 with TypeScript
- **UI Library**: TailwindCSS with custom components
- **State Management**: Angular Signals and Services
- **Routing**: Angular Router with guards
- **Build Tool**: Angular CLI with Vite

### Infrastructure
- **Containerization**: Docker with Docker Compose
- **Reverse Proxy**: Nginx with SSL support
- **Database**: PostgreSQL 15
- **File Storage**: MinIO
- **Caching**: Redis 7

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gestion-emballages-v2
   ```

2. **Run the setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh setup dev
   ```

3. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000/api
   - API Documentation: http://localhost:3000/api-docs
   - Database Admin: http://localhost:8080
   - MinIO Console: http://localhost:9001

### Manual Setup

1. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

3. **Start Services**
   ```bash
   # Development
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   
   # Production
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## 📋 Available Scripts

### Setup Script Commands
```bash
# Complete development setup
./scripts/setup.sh setup dev

# Complete production setup
./scripts/setup.sh setup prod

# Install dependencies only
./scripts/setup.sh install

# Build Docker images
./scripts/setup.sh build [dev|prod]

# Start services
./scripts/setup.sh start [dev|prod]

# Stop services
./scripts/setup.sh stop

# Show service status
./scripts/setup.sh status

# Show logs
./scripts/setup.sh logs [service-name]

# Health checks
./scripts/setup.sh health

# Database backup
./scripts/setup.sh backup

# Database restore
./scripts/setup.sh restore backup.sql

# Cleanup
./scripts/setup.sh clean
```

### Docker Compose Commands
```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# View logs
docker-compose logs -f [service-name]

# Execute commands in containers
docker-compose exec backend npm run migration:run
docker-compose exec postgres psql -U postgres gestion_emballages
```

## 🏢 Business Modules

### Core Entities
- **Stations**: Agricultural cooperative locations
- **Fournisseurs**: Suppliers with multiple sites
- **Articles**: Packaging products and materials
- **Users**: Role-based user management

### Operational Modules
- **Commandes**: Order management with workflow
- **Stocks**: Inventory tracking and management
- **Transferts**: Inter-station transfer requests
- **Listes Achat**: Shopping list management

### User Roles
- **Manager**: Full system access and administration
- **Gestionnaire**: Operational management capabilities
- **Station**: Station-specific operations and orders
- **Fournisseur**: Supplier-specific inventory and orders

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Angular CLI 17+
- NestJS CLI 10+

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Run database migrations:
   ```bash
   npm run migration:run
   ```

5. Start development server:
   ```bash
   npm run start:dev
   ```

Backend will be available at: `http://localhost:3000`
API Documentation: `http://localhost:3000/api-docs`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   # Update src/environments/environment.ts
   ```

4. Start development server:
   ```bash
   ng serve
   ```

Frontend will be available at: `http://localhost:4200`

## 🏗️ Architecture Overview

### Backend Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │───▶│    Services     │───▶│   Repositories  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      DTOs       │    │   Entities      │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │───▶│    Services     │───▶│   HTTP Client   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Signals      │    │     Models      │    │  Backend API    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 Authentication & Authorization

### User Roles
- **Manager** - Full system access and configuration
- **Gestionnaire** - Operational management across entities
- **Station** - Station-specific operations and orders
- **Fournisseur** - Supplier catalog and order management

### Security Features
- JWT-based authentication with refresh tokens
- Role-based route protection
- Entity-based data isolation
- Password complexity requirements
- Session management with auto-logout

## 📊 Database Schema

### Key Entities
- **Users** - System users with role-based access
- **Stations** - Agricultural cooperative locations
- **Fournisseurs** - Supplier organizations with multiple sites
- **Articles** - Packaging products with supplier relationships
- **Commandes** - Purchase orders with workflow states
- **Stocks** - Inventory tracking per location
- **DemandeTransfert** - Inter-station transfer requests

### Relationships
- Users belong to Stations or Fournisseurs
- Articles have many-to-many relationships with Fournisseurs
- Commandes link Articles to Stations with quantities
- Stocks track inventory levels per Article per Station

## 🔄 API Endpoints

### Authentication
```
POST   /auth/login              # User login
POST   /auth/refresh            # Refresh token
POST   /auth/logout             # User logout
```

### User Management
```
GET    /users                   # List users (paginated)
POST   /users                   # Create user
GET    /users/:id               # Get user details
PATCH  /users/:id               # Update user
DELETE /users/:id               # Deactivate user
PATCH  /users/:id/reactivate    # Reactivate user
```

### Article Management
```
GET    /articles                # List articles (paginated)
GET    /articles/categories     # Get categories
POST   /articles                # Create article
GET    /articles/:id            # Get article details
PATCH  /articles/:id            # Update article
DELETE /articles/:id            # Deactivate article
PATCH  /articles/:id/reactivate # Reactivate article
```

### Station Management
```
GET    /stations                # List stations (paginated)
GET    /stations/active         # Get active stations
POST   /stations                # Create station
GET    /stations/:id            # Get station details
PATCH  /stations/:id            # Update station
DELETE /stations/:id            # Deactivate station
PATCH  /stations/:id/reactivate # Reactivate station
```

### Supplier Management
```
GET    /fournisseurs            # List suppliers (paginated)
GET    /fournisseurs/active     # Get active suppliers
POST   /fournisseurs            # Create supplier
GET    /fournisseurs/:id        # Get supplier details
PATCH  /fournisseurs/:id        # Update supplier
DELETE /fournisseurs/:id        # Deactivate supplier
PATCH  /fournisseurs/:id/reactivate # Reactivate supplier
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Coverage report
```

### Frontend Testing
```bash
cd frontend
ng test                   # Unit tests
ng e2e                    # End-to-end tests
```

## 📦 Production Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

#### Backend
```bash
cd backend
npm run build
npm run start:prod
```

#### Frontend
```bash
cd frontend
ng build --configuration production
# Serve dist/ with your web server
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gestion_emballages
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=1d

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=documents
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  minioUrl: 'http://localhost:9000'
};
```

## 📈 Performance Features

### Backend Optimizations
- Database indexing on frequently queried fields
- Query optimization with TypeORM relations
- Pagination for large datasets
- Response caching where appropriate
- Connection pooling

### Frontend Optimizations
- Angular signals for reactive updates
- OnPush change detection strategy
- Lazy loading of feature modules
- Virtual scrolling for large lists
- Debounced search inputs
- Image optimization and lazy loading

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit pull request

### Code Style
- Backend: Follow NestJS conventions with ESLint
- Frontend: Follow Angular style guide with Prettier
- Use TypeScript strict mode
- Document public APIs with JSDoc/TSDoc

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api-docs`