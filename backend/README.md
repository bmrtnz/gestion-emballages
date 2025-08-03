# Gestion Emballages - Backend API

## Overview

The Gestion Emballages backend is a Node.js/Express API server that manages packaging procurement and inventory for agricultural cooperatives. It provides a complete RESTful API with JWT authentication, role-based access control, and comprehensive business logic for order management, stock tracking, and supplier relationships.

## Architecture

- **Framework**: Express.js with MVC architecture
- **Database**: MongoDB with Mongoose ODM
- **Storage**: MinIO for file storage (documents, PDFs, images)
- **Authentication**: JWT tokens with role-based permissions
- **Documentation**: Swagger API docs at `/api-docs`
- **Testing**: Jest with mocked dependencies

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v5.0 or higher)
- **MinIO** (for file storage)
- **Git**

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd gestion-emballages/backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGO_URI_LOCAL=mongodb://localhost:27017/gestionEmballages
MONGO_URI_PROD=mongodb://localhost:27017/gestionEmballages

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

# Email Configuration (Optional)
EMAIL_FROM=noreply@gestion-emballages.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 3. Database Setup

Start MongoDB service, then run:

```bash
# Import sample data (includes users, stations, suppliers, articles)
npm run data:import

# Or start with a clean database
npm run data:destroy
```

### 4. MinIO Setup

Start MinIO server:

```bash
# Using Docker (recommended)
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"

# Or install locally and run
minio server ~/minio-data --console-address ":9001"
```

### 5. Start Development Server

```bash
npm start
```

The API will be available at `http://localhost:5000`

## Available Scripts

### Development
```bash
npm start                    # Start development server with nodemon
npm run dev                  # Alternative start command
```

### Testing
```bash
npm test                     # Run Jest test suite
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage report
```

### Database Management
```bash
npm run data:import          # Import sample data
npm run data:destroy         # Clear all data from database  
```

### Documentation
```bash
npm run docs:generate        # Generate JSDoc documentation
npm run docs:serve           # Serve documentation at http://localhost:8080
```

## API Documentation

### Swagger UI
Visit `http://localhost:5000/api-docs` when the server is running to access interactive API documentation.

### JSDoc Documentation
Generate and view detailed code documentation:
```bash
npm run docs:generate
npm run docs:serve
```

## Key API Endpoints

### Authentication
```
POST /api/users/login        # User login
GET  /api/users/profile      # Get current user profile
```

### User Management
```
GET    /api/users            # List users (paginated)
POST   /api/users            # Create user
PUT    /api/users/:id        # Update user
DELETE /api/users/:id        # Deactivate user
```

### Stations & Suppliers
```
GET    /api/stations         # List stations
POST   /api/stations         # Create station
GET    /api/fournisseurs     # List suppliers
POST   /api/fournisseurs     # Create supplier
```

### Articles & Catalog
```
GET    /api/articles         # List articles with filters
POST   /api/articles         # Create article
GET    /api/articles/categories # Get article categories
```

### Order Management
```
GET    /api/listes-achat     # Get shopping list
POST   /api/listes-achat     # Add item to cart
POST   /api/listes-achat/validate # Convert cart to orders
GET    /api/commandes        # List orders
GET    /api/commandes-globales # List global orders
```

### Stock Management
```
GET    /api/stocks           # Get stock levels
POST   /api/stocks           # Update stock
```

## Project Structure

```
backend/
├── config/                  # Configuration files
│   ├── database.js         # MongoDB connection
│   ├── minioClient.js      # MinIO client setup
│   └── jest.config.js      # Jest test configuration
├── controllers/             # Request handlers
│   ├── userController.js
│   ├── articleController.js
│   ├── commandeController.js
│   └── ...
├── middleware/              # Custom middleware
│   ├── authMiddleware.js   # JWT authentication
│   ├── errorMiddleware.js  # Error handling
│   └── paginationMiddleware.js
├── models/                  # Mongoose schemas
│   ├── userModel.js
│   ├── articleModel.js
│   ├── commandeModel.js
│   └── ...
├── routes/                  # API route definitions
│   ├── userRoutes.js
│   ├── articleRoutes.js
│   └── ...
├── services/                # Business logic layer
│   └── ...
├── utils/                   # Helper functions
│   ├── constants.js        # Application constants
│   ├── appError.js         # Custom error classes
│   └── ...
├── validators/              # Request validation
│   ├── userValidators.js
│   └── ...
├── tests/                   # Jest test files
│   ├── controllers/
│   ├── models/
│   └── ...
└── scripts/                 # Utility scripts
    ├── seedData.js         # Database seeding
    └── ...
```

## User Roles & Permissions

The system supports four user roles with different access levels:

### Manager
- Full system access
- Can manage all entities (users, stations, suppliers, articles)
- Can create and process orders
- Can access all financial data

### Gestionnaire  
- Operational management access
- Can manage stations, suppliers, and articles
- Can process orders and transfers
- Limited financial data access

### Station
- Station-specific operations only
- Can place orders and manage their shopping list
- Can view their own stock and orders
- Cannot access other stations' data

### Fournisseur (Supplier)
- Supplier-specific operations only
- Can view and update their own orders
- Can manage their product catalog
- Cannot access other suppliers' data

## Test Data

When you run `npm run data:import`, the following test users are created:

```
Station Users:
- j.martin@valdegaronne.com / password123 (Station A)
- m.lebrun@coop-pyrenees.fr / password123 (Station B)

Supplier User:
- edn@supplier.com / password123

Gestionnaire:
- nicole@embadif.com / password123

Manager:
- (Created as needed)
```

## Development Guidelines

### Code Style
- Use JSDoc for function documentation
- Follow existing naming conventions
- Implement proper error handling with AppError class
- Use express-validator for input validation

### Database Guidelines
- All models use soft deletes (`isActive` field)
- Include audit fields (`createdBy`, `updatedBy`) where appropriate
- Use proper indexes for performance
- Implement cascading deactivation for related entities

### API Guidelines
- Use `paginationMiddleware` for all list endpoints
- Implement comprehensive search across relevant fields
- Use consistent error responses
- Include proper HTTP status codes

### Security Best Practices
- Never expose sensitive data in API responses
- Validate all inputs
- Use proper authentication middleware
- Implement role-based access control

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check connection string in .env
MONGO_URI_LOCAL=mongodb://localhost:27017/gestionEmballages
```

**MinIO Connection Error**
```bash
# Check MinIO is running
docker ps | grep minio

# Verify MinIO configuration in .env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
```

**Port Already in Use**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

**JWT Token Issues**
```bash
# Ensure JWT_SECRET is set in .env
JWT_SECRET=your-super-secret-jwt-key

# Check token expiration
JWT_EXPIRE=1d
```

### Performance Optimization

For large datasets:
- Use pagination for all list endpoints
- Implement proper database indexes
- Use aggregation pipelines for complex queries
- Enable MongoDB connection pooling

### Logging

The application uses built-in console logging. For production, consider implementing structured logging with Winston or similar.

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the established patterns
3. Add/update tests for new functionality
4. Run the test suite: `npm test`
5. Update documentation as needed
6. Submit a pull request

## Production Deployment

### Environment Variables
Update `.env` for production:
```env
NODE_ENV=production
PORT=5000
MONGO_URI_PROD=mongodb://your-prod-server:27017/gestionEmballages
JWT_SECRET=strong-production-secret
```

### Security Checklist
- Use strong JWT secrets
- Enable CORS for specific domains only
- Use HTTPS in production
- Implement rate limiting
- Set up proper MongoDB authentication
- Secure MinIO with proper access keys

### Monitoring
Consider implementing:
- Health check endpoints
- Performance monitoring
- Error tracking (e.g., Sentry)
- Log aggregation

## License

[Your License Here]

## Support

For development support or questions:
- Check the API documentation at `/api-docs`
- Review the codebase documentation
- Check existing issues and tests for examples