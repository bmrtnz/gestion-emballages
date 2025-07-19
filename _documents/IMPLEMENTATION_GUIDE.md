# Implementation Guide & Developer Onboarding
## Gestion Emballages Project

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure Understanding](#project-structure-understanding)
4. [Development Workflow](#development-workflow)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Process](#deployment-process)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
Before starting development, ensure you have:
- **Node.js 18+** installed
- **Docker & Docker Compose** for local development
- **Git** for version control
- **MongoDB Compass** (optional, for database inspection)
- **VS Code** with recommended extensions

### Quick Start (5 minutes)
```bash
# Clone the repository
git clone <repository-url>
cd gestion-emballages

# Start all services with Docker Compose
docker-compose up -d

# Setup backend
cd backend
npm install
npm run data:import  # Seed database with sample data

# Setup frontend
cd ../frontend
npm install
npm run dev

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# API Docs: http://localhost:5000/api-docs
# MinIO Console: http://localhost:9001
```

### Test Credentials
Use these pre-seeded accounts for testing:
- **Manager**: nicole@embadif.com / password123
- **Station A**: j.martin@valdegaronne.com / password123
- **Station B**: m.lebrun@coop-pyrenees.fr / password123
- **Supplier**: edn@supplier.com / password123

---

## Development Environment Setup

### Required Software

| Tool | Purpose | Installation |
|------|---------|-------------|
| **Node.js 18+** | Runtime environment | `nvm install 18` or download from nodejs.org |
| **Docker Desktop** | Container orchestration | Download from docker.com |
| **MongoDB Compass** | Database GUI | Download from mongodb.com |
| **Postman** | API testing | Download from postman.com |

### VS Code Extensions
Install these recommended extensions:
```
ms-vscode.vscode-typescript-next
bradlc.vscode-tailwindcss
Vue.volar
esbenp.prettier-vscode
ms-vscode.vscode-eslint
formulahendry.auto-rename-tag
```

### Environment Configuration

#### Backend Environment (.env)
```bash
# Copy and customize the environment file
cp backend/.env.example backend/.env

# Edit with your configuration
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/gestionEmballages
JWT_SECRET=your-jwt-secret-key
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

#### Frontend Environment (.env)
```bash
# Copy and customize the environment file
cp frontend/.env.example frontend/.env

# Edit with your configuration
VITE_API_URL=http://localhost:5000/api
VITE_MINIO_ENDPOINT=http://localhost:9000
```

### Docker Development Setup
The project includes a complete Docker Compose setup for development:

```yaml
# docker-compose.yml structure
services:
  - app (Node.js backend)
  - mongodb (Database)
  - minio (Object storage)
```

**Start all services:**
```bash
docker-compose up -d
```

**Monitor logs:**
```bash
docker-compose logs -f app
```

**Stop all services:**
```bash
docker-compose down
```

---

## Project Structure Understanding

### Backend Architecture
```
backend/
├── controllers/         # HTTP request handlers
│   ├── userController.js
│   ├── articleController.js
│   ├── commandeController.js
│   └── ...
├── models/             # Mongoose schemas
│   ├── User.js
│   ├── Article.js
│   ├── Commande.js
│   └── ...
├── routes/             # API route definitions
│   ├── users.js
│   ├── articles.js
│   └── ...
├── middleware/         # Cross-cutting concerns
│   ├── authMiddleware.js
│   ├── paginationMiddleware.js
│   └── errorMiddleware.js
├── utils/              # Utility functions
│   ├── constants.js
│   ├── helpers.js
│   └── ...
├── config/             # Configuration files
│   ├── database.js
│   ├── minioClient.js
│   └── swagger.js
└── tests/              # Test suites
    ├── controllers/
    ├── models/
    └── utils/
```

### Frontend Architecture
```
frontend/src/
├── components/         # Reusable Vue components
│   ├── ui/            # Base UI components
│   ├── forms/         # Form components
│   └── layout/        # Layout components
├── pages/             # Route-level components
│   ├── Dashboard.vue
│   ├── Articles.vue
│   └── ...
├── stores/            # Pinia state management
│   ├── authStore.js
│   ├── listeAchatStore.js
│   └── ...
├── composables/       # Composition API utilities
│   ├── useLoading.js
│   ├── useErrorHandler.js
│   └── ...
├── api/               # HTTP client and API calls
│   ├── axios.js
│   ├── auth.js
│   └── ...
├── router/            # Vue Router configuration
│   └── index.js
└── assets/            # Static assets
    ├── styles/
    └── images/
```

### Key Design Patterns

#### 1. Controller Pattern (Backend)
Controllers handle HTTP requests and coordinate between services:
```javascript
exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip, search, sortBy, sortOrder, filters } = req.pagination;
    
    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const users = await User.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
    
    const totalCount = await User.countDocuments(query);
    
    res.json(req.pagination.buildResponse(users, totalCount));
  } catch (error) {
    next(error);
  }
};
```

#### 2. Composition API Pattern (Frontend)
Use composables for reusable logic:
```javascript
// composables/useLoading.js
import { ref } from 'vue';

export function useLoading() {
  const isLoading = ref(false);
  
  const setLoading = (value) => {
    isLoading.value = value;
  };
  
  const withLoading = async (promise) => {
    setLoading(true);
    try {
      return await promise;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    isLoading: readonly(isLoading),
    setLoading,
    withLoading
  };
}
```

#### 3. Store Pattern (State Management)
Pinia stores for centralized state:
```javascript
// stores/authStore.js
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token'));
  
  const login = async (credentials) => {
    const response = await api.post('/users/login', credentials);
    token.value = response.data.token;
    user.value = response.data.user;
    localStorage.setItem('token', token.value);
  };
  
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  };
  
  return { user, token, login, logout };
});
```

---

## Development Workflow

### 1. Feature Development Process

#### Step 1: Understanding Requirements
1. Read the **PRD** for business context
2. Check the **ARD** for technical constraints
3. Review the **DD** for design specifications
4. Identify affected components and services

#### Step 2: Backend Development
1. **Model First**: Define/update Mongoose schemas
2. **Controller Logic**: Implement business logic
3. **Route Setup**: Define API endpoints
4. **Validation**: Add input validation rules
5. **Testing**: Write unit and integration tests

#### Step 3: Frontend Development
1. **API Integration**: Update API service layer
2. **State Management**: Create/update Pinia stores
3. **Component Development**: Build Vue components
4. **Routing**: Configure Vue Router
5. **Styling**: Apply TailwindCSS classes

#### Step 4: Integration Testing
1. **API Testing**: Use Postman or automated tests
2. **Frontend Testing**: Manual testing in browser
3. **Cross-browser Testing**: Chrome, Firefox, Safari
4. **Mobile Testing**: Responsive design validation

### 2. Code Standards

#### Backend Standards
```javascript
// Use destructuring for cleaner code
const { email, password, role } = req.body;

// Use async/await consistently
const user = await User.findOne({ email });

// Proper error handling
try {
  const result = await someAsyncOperation();
  res.json(result);
} catch (error) {
  next(error); // Let error middleware handle it
}

// Use meaningful variable names
const isUserAuthenticated = Boolean(req.user);
const hasAdminPrivileges = req.user.role === 'Manager';
```

#### Frontend Standards
```javascript
// Use Composition API
import { ref, computed, onMounted } from 'vue';

// Destructure composables
const { isLoading, setLoading } = useLoading();
const { handleError } = useErrorHandler();

// Use reactive references
const users = ref([]);
const searchQuery = ref('');

// Computed properties for derived state
const filteredUsers = computed(() => {
  return users.value.filter(user => 
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
```

### 3. Git Workflow

#### Branch Naming Convention
```
feature/user-management-crud
bugfix/order-status-validation
hotfix/critical-auth-issue
```

#### Commit Message Format
```
feat: add user role management functionality

- Implement role-based access control
- Add user activation/deactivation
- Update user list with status filters

Closes #123
```

#### Pull Request Process
1. Create feature branch from `main`
2. Implement feature with tests
3. Ensure all tests pass
4. Create pull request with description
5. Code review and approval
6. Merge to `main`

---

## Testing Strategy

### Backend Testing

#### Unit Tests (Jest)
```javascript
// tests/controllers/userController.test.js
describe('User Controller', () => {
  test('should create new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      role: 'Station'
    };
    
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);
    
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.password).toBeUndefined();
  });
});
```

#### Integration Tests
```javascript
// tests/integration/auth.test.js
describe('Authentication Flow', () => {
  test('should authenticate user and return token', async () => {
    // Create user
    const user = await User.create({
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'Station'
    });
    
    // Login
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);
    
    expect(response.body.token).toBeDefined();
  });
});
```

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- userController.test.js
```

### Frontend Testing (Recommended)
```javascript
// Component testing with Vue Test Utils
import { mount } from '@vue/test-utils';
import UserList from '@/components/UserList.vue';

describe('UserList.vue', () => {
  test('renders user list correctly', () => {
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];
    
    const wrapper = mount(UserList, {
      props: { users }
    });
    
    expect(wrapper.text()).toContain('John Doe');
  });
});
```

---

## Deployment Process

### Local Development Deployment
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

### Production Build
```bash
# Frontend production build
cd frontend
npm run build

# Backend production start
cd backend
NODE_ENV=production npm start
```

### Docker Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Render.io Deployment
The project is configured for Render.io deployment:

1. **Static Site** (Frontend): Builds from `frontend/` directory
2. **Web Service** (Backend): Deploys Node.js application
3. **Private Services**: MongoDB and MinIO instances

### Environment-Specific Configuration

#### Development
- Hot reload enabled
- Debug logging
- Seed data available
- CORS allows localhost

#### Production
- Optimized builds
- Error logging only
- Security headers enabled
- CORS restricted to production domains

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
**Problem**: `MongoNetworkError: failed to connect to server`
**Solution**:
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

#### 2. Authentication Token Issues
**Problem**: `401 Unauthorized` errors
**Solution**:
```javascript
// Check token in localStorage
console.log(localStorage.getItem('token'));

// Verify token format
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires:', new Date(payload.exp * 1000));
```

#### 3. File Upload Issues
**Problem**: MinIO connection errors
**Solution**:
```bash
# Check MinIO status
docker-compose ps minio

# Access MinIO console
open http://localhost:9001

# Check bucket permissions
mc ls minio/documents
```

#### 4. Frontend Build Issues
**Problem**: Build failures or runtime errors
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Clear Vite cache
rm -rf .vite
```

### Debug Tools

#### Backend Debugging
```bash
# Enable debug logging
DEBUG=app:* npm start

# Use Node.js inspector
node --inspect-brk server.js
```

#### Frontend Debugging
```bash
# Vue DevTools browser extension
# Network tab for API calls
# Console for component state
```

### Performance Monitoring

#### Database Performance
```javascript
// Enable MongoDB profiling
db.setProfilingLevel(2, { slowms: 100 });

// Check slow queries
db.system.profile.find().limit(5).sort({ ts: -1 });
```

#### API Performance
```javascript
// Add request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  
  next();
});
```

---

## Additional Resources

### Documentation
- **PRD**: Complete business requirements and user stories
- **ARD**: Technical architecture and implementation details
- **DD**: Design system and component specifications
- **API Docs**: Available at `/api-docs` when backend is running

### External Dependencies
- [Vue.js 3 Documentation](https://vuejs.org/guide/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)

### Code Quality Tools
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit validation
- **Jest**: Testing framework

This implementation guide provides everything a new developer needs to understand, set up, and contribute to the Gestion Emballages project effectively.