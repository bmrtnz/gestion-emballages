# Gestion Emballages - Packaging Management System

## Overview

Gestion Emballages is a comprehensive B2B packaging management platform designed for agricultural cooperatives. It facilitates the procurement, inventory management, and distribution of packaging materials (boxes, trays, plastic films, etc.) across a network of cooperative stations. The system features a Node.js/Express backend API and a Vue.js 3 frontend application, both built with modern best practices and performance optimizations.

## System Architecture

### Technology Stack

#### Backend
- **Node.js** with Express.js framework
- **MongoDB** database with Mongoose ODM
- **MinIO** object storage for documents and images
- **JWT** authentication with role-based access control
- **Swagger** API documentation
- **Jest** testing framework

#### Frontend
- **Vue.js 3** with Composition API
- **Vite** build tool for fast development
- **Pinia** state management
- **Tailwind CSS** for styling
- **Vue Router** for navigation
- **Axios** for API communication

### Key Features
- 🔐 **Role-based access control** (Manager, Gestionnaire, Station, Fournisseur)
- 📦 **Packaging inventory management** with real-time stock tracking
- 🛒 **Shopping cart system** for order placement
- 📊 **Demand forecasting** with weekly granularity
- 🚚 **Inter-station transfer requests** with approval workflow
- 📄 **Document management** with PDF viewer
- 📱 **Responsive design** for mobile and desktop
- ⚡ **Performance optimized** with virtual scrolling and caching

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **MongoDB** v5.0 or higher
- **MinIO** (or Docker for MinIO container)
- **Git** for version control

## Quick Start Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gestion-emballages
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment
Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGO_URI_LOCAL=mongodb://localhost:27017/gestionEmballages

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=1d

# MinIO Configuration (File Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=gestion-emballages
MINIO_USE_SSL=false
```

#### Start Services

1. **Start MongoDB**:
```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

2. **Start MinIO** (using Docker):
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

3. **Initialize Database** (optional - with sample data):
```bash
npm run data:import
```

4. **Start Backend Server**:
```bash
npm start
```

The backend API will be available at `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment
Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=10000

# Application Configuration
VITE_APP_NAME=Gestion Emballages
VITE_APP_VERSION=1.0.0
```

#### Start Development Server
```bash
npm run dev
```

The frontend application will be available at `http://localhost:3000`

### 4. Access the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Log in with one of the test accounts (see Test Users section below)
3. Explore the application features based on your user role

## Test Users

When you run `npm run data:import` in the backend, the following test users are created:

### Station Users
- **Station A**: `j.martin@valdegaronne.com` / `password123`
- **Station B**: `m.lebrun@coop-pyrenees.fr` / `password123`

### Supplier User
- **Supplier**: `edn@supplier.com` / `password123`

### Gestionnaire (Manager)
- **Admin**: `nicole@embadif.com` / `password123`

## Development Workflow

### Running Both Frontend and Backend

For convenience, you can run both services simultaneously:

1. **Option 1**: Use two terminal windows
   - Terminal 1: `cd backend && npm start`
   - Terminal 2: `cd frontend && npm run dev`

2. **Option 2**: Use a process manager like `concurrently`
   ```bash
   # From project root
   npm install -g concurrently
   concurrently "cd backend && npm start" "cd frontend && npm run dev"
   ```

### Available Scripts

#### Backend Scripts
```bash
cd backend
npm start                    # Start development server
npm test                     # Run Jest tests
npm run data:import          # Import sample data
npm run data:destroy         # Clear database
npm run docs:generate        # Generate JSDoc documentation
```

#### Frontend Scripts
```bash
cd frontend
npm run dev                  # Start development server
npm run build               # Build for production
npm run preview             # Preview production build
npm run lint                # Run ESLint
npm run lint:fix            # Fix linting issues
```

## API Documentation

### Swagger UI
When the backend is running, access the interactive API documentation at:
```
http://localhost:5000/api-docs
```

### Key API Endpoints

#### Authentication
- `POST /api/users/login` - User authentication
- `GET /api/users/profile` - Get current user profile

#### Resource Management
- `/api/stations` - Station management
- `/api/fournisseurs` - Supplier management
- `/api/articles` - Article/product catalog
- `/api/users` - User management

#### Business Operations
- `/api/listes-achat` - Shopping cart operations
- `/api/commandes` - Order management
- `/api/stocks` - Inventory management
- `/api/previsions` - Demand forecasting
- `/api/demandes-transfert` - Transfer requests

## Project Structure

```
gestion-emballages/
├── backend/                 # Backend API server
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utilities
│   ├── validators/        # Input validators
│   ├── tests/             # Jest tests
│   ├── scripts/           # Utility scripts
│   ├── server.js          # Entry point
│   └── README.md          # Backend documentation
├── frontend/               # Vue.js frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── api/          # API integration
│   │   ├── assets/       # Images, styles
│   │   ├── components/   # Vue components
│   │   ├── composables/  # Composition functions
│   │   ├── router/       # Vue Router config
│   │   ├── stores/       # Pinia stores
│   │   ├── strategies/   # Role strategies
│   │   ├── utils/        # Utilities
│   │   ├── views/        # Page components
│   │   ├── App.vue       # Root component
│   │   └── main.js       # Entry point
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS config
│   └── README.md          # Frontend documentation
├── _documents/             # Project documentation
│   ├── ARD.md            # Architecture Decision Records
│   ├── DD.md             # Design Document
│   └── IMPLEMENTATION_GUIDE.md
├── docker-compose.yml      # Docker configuration
├── .gitignore             # Git ignore rules
├── CLAUDE.md              # AI assistant guidelines
└── README.md              # This file
```

## User Roles and Permissions

The system implements four distinct user roles with specific permissions:

### Manager
- Full system access and administrative privileges
- Can manage all entities (users, stations, suppliers, articles)
- Can create and process orders for any station
- Access to all financial data and reports
- Can approve inter-station transfers

### Gestionnaire
- Operational management capabilities
- Can manage stations, suppliers, and articles
- Can process orders and transfer requests
- Limited financial data access
- Cannot create Manager accounts

### Station
- Station-specific operations only
- Can manage their own shopping cart and place orders
- Can view their own stock levels and order history
- Can request transfers from other stations
- Cannot access other stations' data

### Fournisseur (Supplier)
- Supplier-specific operations only
- Can view and update their own orders
- Can manage their product catalog and pricing
- Can update stock levels at their sites
- Cannot access other suppliers' data

## Key Business Workflows

### Order Management
1. **Shopping Cart** - Stations add items to their cart
2. **Order Creation** - Cart is converted to supplier orders
3. **Order Confirmation** - Suppliers confirm orders
4. **Shipping** - Suppliers ship orders
5. **Reception** - Stations receive and validate deliveries
6. **Invoicing** - Financial processing by managers

### Stock Management
- **Real-time tracking** at station level
- **Supplier inventory** tracking at site level
- **Transfer requests** between stations
- **Stock snapshots** for historical analysis

### Demand Forecasting
- **Annual campaigns** (e.g., "25-26")
- **Weekly granularity** for planning
- **Per-article forecasts** by supplier
- **Station-level aggregation**

## Development Best Practices

### Backend Development
- Use `paginationMiddleware` for all list endpoints
- Implement comprehensive search functionality
- Follow RESTful API conventions
- Use proper error handling with AppError class
- Validate all inputs with express-validator
- Implement soft deletes with `isActive` field

### Frontend Development
- Use Composition API with `<script setup>`
- Follow the established composables pattern
- Implement responsive design (mobile-first)
- Use the strategy pattern for role-based UI
- Enable virtual scrolling for large lists
- Debounce user inputs (300ms default)

### Code Quality
- Run linters before committing
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Follow existing code patterns
- Test with different user roles
- Update documentation for new features

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB if needed
sudo systemctl start mongod
```

#### MinIO Connection Error
```bash
# Check if MinIO container is running
docker ps | grep minio

# Restart MinIO if needed
docker restart <container-id>
```

#### Port Already in Use
```bash
# Find process using port 5000 (backend)
lsof -i :5000

# Find process using port 3000 (frontend)
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Authentication Issues
- Clear browser localStorage
- Check JWT token expiration
- Verify user credentials
- Check CORS configuration

### Getting Help

1. Check the detailed README files:
   - [Backend Documentation](./backend/README.md)
   - [Frontend Documentation](./frontend/README.md)

2. Review the architecture documents:
   - [Design Document](./_documents/DD.md)
   - [Implementation Guide](./_documents/IMPLEMENTATION_GUIDE.md)

3. Check API documentation at `http://localhost:5000/api-docs`

## Docker Development (Optional)

If you prefer using Docker for development:

```bash
# Start all services (app, MongoDB, MinIO)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

## Testing

### Backend Testing
```bash
cd backend
npm test                     # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report
```

### Frontend Testing
```bash
cd frontend
npm run test                # Run unit tests
npm run test:e2e           # Run end-to-end tests
```

## Production Deployment

### Environment Variables
Update `.env` files with production values:
- Use strong JWT secrets
- Configure production MongoDB URI
- Set up proper MinIO credentials
- Enable HTTPS/SSL
- Configure CORS for your domain

### Build Process
```bash
# Build frontend for production
cd frontend
npm run build

# The backend doesn't require building
# Just ensure NODE_ENV=production
```

### Security Checklist
- [ ] Change all default passwords
- [ ] Use environment-specific JWT secrets
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up MongoDB authentication
- [ ] Implement rate limiting
- [ ] Enable CORS for specific domains only
- [ ] Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code patterns
- Add tests for new features
- Update documentation
- Test all user roles
- Run linters before submitting

## License

[Your License Here]

## Support

For questions or issues:
- Check the documentation files in `_documents/`
- Review existing issues in the repository
- Contact the development team

---

## Quick Reference

### Start Development Environment
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Access Points
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- API Docs: `http://localhost:5000/api-docs`
- MinIO Console: `http://localhost:9001`

### Default Credentials
- MinIO: `minioadmin` / `minioadmin`
- Test Station User: `j.martin@valdegaronne.com` / `password123`
- Test Admin: `nicole@embadif.com` / `password123`

Happy coding! 🚀