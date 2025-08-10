# Development Guide - Blue Whale Portal V2

This guide provides detailed information for developers working on the Blue Whale Portal V2 project.

## 🏗️ Project Architecture

### Technology Stack Migration

This is a complete rewrite of the original Vue.js/MongoDB application using:

**From (V1)**:
- Vue.js 3 + Composition API
- MongoDB + Mongoose
- Express.js
- Pinia for state management

**To (V2)**:
- Angular 17 + Signals
- PostgreSQL + TypeORM
- NestJS + Modular architecture
- Standalone components

### Design Principles

1. **Domain-Driven Design**: Business logic organized by domain modules
2. **Clean Architecture**: Clear separation between layers
3. **Type Safety**: Strict TypeScript throughout the stack
4. **Performance First**: Optimizations from the ground up
5. **Testability**: Comprehensive test coverage

## 🔧 Development Environment Setup

### Prerequisites

```bash
# Install Node.js (use nvm for version management)
nvm install 18.19.0
nvm use 18.19.0

# Install global dependencies
npm install -g @angular/cli@17 @nestjs/cli@10

# Verify installations
node --version     # Should be 18.19.0
ng version        # Should be 17.x
nest --version    # Should be 10.x
```

### Database Setup

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create development database
sudo -u postgres psql
CREATE DATABASE gestion_emballages_dev;
CREATE USER dev_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE gestion_emballages_dev TO dev_user;
\q
```

### Backend Development Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your settings
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gestion_emballages_dev
DATABASE_USERNAME=dev_user
DATABASE_PASSWORD=dev_password
JWT_SECRET=development_jwt_secret_key
```

### Frontend Development Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Edit src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  minioUrl: 'http://localhost:9000'
};
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend**:
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
ng serve
```

**Terminal 3 - Database** (if using Docker):
```bash
docker run --name postgres-dev -e POSTGRES_DB=gestion_emballages_dev -e POSTGRES_USER=dev_user -e POSTGRES_PASSWORD=dev_password -p 5432:5432 -d postgres:15
```

### Access Points

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Database**: localhost:5432

## 📝 Code Standards & Conventions

### TypeScript Configuration

Both projects use strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Naming Conventions

**Backend (NestJS)**:
- **Files**: `kebab-case.ts` (e.g., `user-management.service.ts`)
- **Classes**: `PascalCase` (e.g., `UserManagementService`)
- **Methods**: `camelCase` (e.g., `getUsersByRole()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGE_SIZE`)
- **Interfaces**: `PascalCase` with `I` prefix (e.g., `IUserService`)
- **DTOs**: `PascalCase` with `Dto` suffix (e.g., `CreateUserDto`)

**Frontend (Angular)**:
- **Files**: `kebab-case.ts` (e.g., `user-list.component.ts`)
- **Components**: `PascalCase` + `Component` (e.g., `UserListComponent`)
- **Services**: `PascalCase` + `Service` (e.g., `UserService`)
- **Interfaces**: `PascalCase` (e.g., `User`, `UserFilters`)
- **Enums**: `PascalCase` (e.g., `UserRole`, `EntityType`)

### Directory Structure Conventions

**Backend Structure**:
```
src/
├── modules/                 # Feature modules
│   ├── auth/               # Authentication module
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── entities/      # TypeORM entities
│   │   ├── guards/        # Auth guards
│   │   ├── strategies/    # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   └── users/             # User management module
│       ├── dto/
│       ├── entities/
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── users.module.ts
├── common/                # Shared code
│   ├── dto/              # Common DTOs
│   ├── entities/         # Base entities
│   ├── enums/            # Application enums
│   ├── guards/           # Common guards
│   ├── interceptors/     # HTTP interceptors
│   └── services/         # Common services
└── main.ts              # Application bootstrap
```

**Frontend Structure**:
```
src/app/
├── core/                  # Core services (singletons)
│   ├── guards/           # Route guards
│   ├── interceptors/     # HTTP interceptors
│   ├── models/           # Data models
│   └── services/         # Core services
├── shared/               # Shared components
│   ├── components/       # Reusable components
│   ├── directives/       # Custom directives
│   └── pipes/            # Custom pipes
├── features/             # Feature modules
│   ├── auth/            # Authentication
│   ├── articles/        # Article management
│   ├── users/           # User management
│   ├── stations/        # Station management
│   └── fournisseurs/    # Supplier management
└── layout/              # Layout components
    ├── header/
    ├── sidebar/
    └── footer/
```

## 🧪 Testing Guidelines

### Backend Testing (Jest)

**Unit Tests**:
```typescript
// users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      nomComplet: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: UserRole.STATION
    };

    jest.spyOn(repository, 'create').mockReturnValue(mockUser);
    jest.spyOn(repository, 'save').mockResolvedValue(mockUser);

    const result = await service.create(createUserDto);
    expect(result).toEqual(mockUser);
  });
});
```

**Integration Tests**:
```typescript
// users.controller.e2e-spec.ts
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.total).toBeDefined();
      });
  });
});
```

### Frontend Testing (Jasmine/Karma)

**Component Tests**:
```typescript
// user-list.component.spec.ts
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getUsers']);

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should load users on init', fakeAsync(() => {
    const mockResponse = { data: [mockUser], total: 1 };
    userService.getUsers.and.returnValue(of(mockResponse));

    component.ngOnInit();
    tick();

    expect(component.users()).toEqual([mockUser]);
  }));
});
```

### Test Coverage Requirements

- **Backend**: Minimum 80% coverage
- **Frontend**: Minimum 70% coverage
- **Critical paths**: 100% coverage (auth, payments, orders)

## 🔄 Database Migrations

### Creating Migrations

```bash
# Generate migration from entity changes
npm run migration:generate -- --name AddUserRoleColumn

# Create empty migration
npm run migration:create -- --name CustomBusinessLogic
```

### Migration Best Practices

```typescript
// Example migration
export class AddUserRoleColumn1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column with default value
    await queryRunner.addColumn('users', new TableColumn({
      name: 'role',
      type: 'varchar',
      length: '50',
      default: "'STATION'",
      isNullable: false
    }));

    // Update existing records
    await queryRunner.query(`UPDATE users SET role = 'STATION' WHERE role IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'role');
  }
}
```

## 🎨 UI/UX Guidelines

### Design System

**Color Palette**:
```css
:root {
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-900: #1e3a8a;
  
  --success-500: #10b981;
  --warning-500: #f59e0b;
  --error-500: #ef4444;
}
```

**Typography**:
```css
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
```

**Spacing**:
```css
.space-1 { margin: 0.25rem; }
.space-2 { margin: 0.5rem; }
.space-4 { margin: 1rem; }
.space-6 { margin: 1.5rem; }
.space-8 { margin: 2rem; }
```

### Component Guidelines

**Button Variants**:
```scss
.btn-primary {
  @apply inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.btn-outline {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.btn-danger {
  @apply inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500;
}
```

### Responsive Design

```scss
// Mobile-first approach
.container {
  @apply w-full px-4;
  
  @screen sm {
    @apply px-6;
  }
  
  @screen md {
    @apply px-8;
  }
  
  @screen lg {
    @apply max-w-7xl mx-auto;
  }
}
```

## 🚀 Performance Guidelines

### Backend Performance

**Database Optimization**:
```typescript
// Use select to limit fields
const users = await this.userRepository.find({
  select: ['id', 'nomComplet', 'email', 'role'],
  where: { isActive: true }
});

// Use pagination for large datasets
const [users, total] = await this.userRepository.findAndCount({
  skip: (page - 1) * limit,
  take: limit,
  order: { createdAt: 'DESC' }
});

// Use query builder for complex queries
const articles = await this.articleRepository
  .createQueryBuilder('article')
  .leftJoinAndSelect('article.articleFournisseurs', 'af')
  .leftJoinAndSelect('af.fournisseur', 'fournisseur')
  .where('article.isActive = :isActive', { isActive: true })
  .andWhere('fournisseur.isActive = :isActive', { isActive: true })
  .getMany();
```

**Response Optimization**:
```typescript
// Use DTOs to control response shape
@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  nomComplet: string;

  @Expose()
  email: string;

  @Expose()
  role: UserRole;

  // password field is automatically excluded
}
```

### Frontend Performance

**Change Detection Optimization**:
```typescript
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngFor="let user of users(); trackBy: trackByUserId">
      {{ user.nomComplet }}
    </div>
  `
})
export class UserListComponent {
  users = signal<User[]>([]);

  trackByUserId(index: number, user: User): string {
    return user.id;
  }
}
```

**Lazy Loading**:
```typescript
// Route configuration
const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./features/users/user-list/user-list.component')
      .then(m => m.UserListComponent)
  }
];
```

**Virtual Scrolling** (for lists > 100 items):
```typescript
@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let user of users()">
        {{ user.nomComplet }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class VirtualUserListComponent {
  users = signal<User[]>([]);
}
```

## 🔐 Security Guidelines

### Authentication

**JWT Implementation**:
```typescript
// Auth service
@Injectable()
export class AuthService {
  private readonly jwtService: JwtService;

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      entiteId: user.entiteId,
      entiteType: user.entiteType
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: this.sanitizeUser(user)
    };
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
```

### Authorization

**Role-Based Guards**:
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY, 
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
```

### Input Validation

**DTO Validation**:
```typescript
export class CreateUserDto {
  @IsNotEmpty()
  @Length(2, 100)
  nomComplet: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsUUID()
  stationId?: string;

  @IsOptional()
  @IsUUID()
  fournisseurId?: string;
}
```

## 🔄 Git Workflow

### Branch Naming

- **Feature**: `feature/user-management`
- **Bugfix**: `bugfix/login-validation`
- **Hotfix**: `hotfix/security-patch`
- **Release**: `release/v2.1.0`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add user role-based permissions

- Add RolesGuard for API endpoint protection
- Implement role hierarchy validation
- Add unit tests for permission logic

Closes #123
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
```

## 📊 Monitoring & Debugging

### Logging

**Backend Logging**:
```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    
    try {
      const user = await this.userRepository.save(createUserDto);
      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

**Frontend Logging**:
```typescript
// Development only
if (!environment.production) {
  console.log('User loaded:', user);
}

// Production-safe logging
this.logger.info('User action performed', { 
  userId: user.id, 
  action: 'create_order' 
});
```

### Error Handling

**Global Error Handler**:
```typescript
// Backend
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException 
      ? exception.getResponse() 
      : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message
    });
  }
}
```

## 🚀 Deployment Strategies

### Environment Configuration

**Development**:
```env
NODE_ENV=development
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/gestion_emballages_dev
JWT_SECRET=dev_jwt_secret
LOG_LEVEL=debug
```

**Staging**:
```env
NODE_ENV=staging
DATABASE_URL=postgresql://staging_user:staging_password@staging-db:5432/gestion_emballages_staging
JWT_SECRET=staging_jwt_secret
LOG_LEVEL=info
```

**Production**:
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:secure_password@prod-db:5432/gestion_emballages_prod
JWT_SECRET=super_secure_jwt_secret
LOG_LEVEL=warn
```

This development guide provides comprehensive information for developers working on the Blue Whale Portal V2 project. Follow these guidelines to maintain code quality, consistency, and performance across the application.