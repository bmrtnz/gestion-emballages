# Quick Start Backend Only (Windows)

This guide helps you start just the backend with infrastructure services, avoiding Docker build issues.

## 🚀 Quick Start

### Step 1: Start Infrastructure Services
```powershell
# Navigate to project directory
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2

# Copy environment file
copy .env.example .env

# Start only PostgreSQL, Redis, and MinIO
docker-compose -f docker-compose.windows.yml up -d

# Check services are running
docker-compose -f docker-compose.windows.yml ps
```

### Step 2: Verify Database Connection
```powershell
# Test PostgreSQL connection
docker-compose -f docker-compose.windows.yml exec postgres psql -U dev_user gestion_emballages_dev -c "SELECT version();"
```

### Step 3: Start Backend
```powershell
# Open new PowerShell window
cd backend

# Install dependencies (if not done already)
npm install

# Start development server
npm run start:dev
```

## ✅ Expected Results

After starting, you should see:
- ✅ Webpack compilation successful
- ✅ NestFactory starting Nest application
- ✅ TypeOrmModule dependencies initialized
- ✅ All modules loaded successfully
- ✅ Application listening on port 3000

## 🌐 Access Points

Once running:
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api-docs  
- **Database Admin**: http://localhost:8080
- **MinIO Console**: http://localhost:9001

## 🔧 Troubleshooting

### TypeScript Errors Fixed
- ✅ Added `status` property to PaginationDto
- ✅ Fixed auth configuration imports
- ✅ Created missing enum files
- ✅ Fixed DTO inheritance issues
- ✅ Made MinIO service error-tolerant

### Database Connection Issues
```powershell
# If database connection fails
docker-compose -f docker-compose.windows.yml restart postgres

# Check database logs
docker-compose -f docker-compose.windows.yml logs postgres
```

### MinIO Connection Issues
The backend will now start even if MinIO is not available. File uploads will fail gracefully with error messages.

### Port Conflicts
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F
```

## 🧪 Test the Backend

### Health Check
```powershell
# Test basic API response
curl http://localhost:3000/api

# Test API documentation
curl http://localhost:3000/api-docs
```

### Database Test
```powershell
# Connect to database via Adminer
# Go to: http://localhost:8080
# Server: postgres
# Username: dev_user  
# Password: dev_password
# Database: gestion_emballages_dev
```

## 📝 Default Credentials

The system will auto-create these test users:
- **Admin**: admin@dev.com / admin123
- **Station**: station@test.com / password123
- **Supplier**: supplier@test.com / password123

## 🔄 Next Steps

Once backend is running successfully:
1. Start frontend in another window: `cd frontend && npm start`
2. Access full application at: http://localhost:4200
3. Login with default credentials above

## 🛑 Stopping Services

```powershell
# Stop backend
# Press Ctrl+C in backend terminal

# Stop infrastructure services
docker-compose -f docker-compose.windows.yml down
```

---

**The backend should now start without TypeScript errors! 🎉**