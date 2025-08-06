# Starting Gestion Emballages v2 on Windows

This guide provides step-by-step instructions for starting the Gestion Emballages v2 application on Windows systems.

## 🚀 Option 1: Docker Desktop (Recommended)

### Prerequisites
1. **Install Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Make sure to enable WSL 2 backend during installation
   - Restart your computer after installation

2. **Install Git for Windows** (if not already installed)
   - Download from: https://git-scm.com/download/win

### Quick Start with Docker

#### Option A: Infrastructure Only (Recommended for Windows)
```powershell
# Open PowerShell or Command Prompt as Administrator
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2

# Copy environment file
copy .env.example .env

# Start only the infrastructure services (PostgreSQL, Redis, MinIO)
docker-compose -f docker-compose.windows.yml up -d

# Check if services are running
docker-compose -f docker-compose.windows.yml ps
```

#### Option B: Full Docker Environment
```powershell
# If you want to run everything in Docker (may have build issues)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Check if services are running
docker-compose ps
```

### After Starting Infrastructure Services

#### Option A: Then Start Apps Locally (Recommended)
```powershell
# Start Backend (in first PowerShell window)
cd backend
npm install
npm run start:dev

# Start Frontend (in second PowerShell window)
cd frontend  
npm install
npm start
```

**Access Points:**
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api-docs
- **Database Admin (Adminer)**: http://localhost:8080
- **MinIO Console**: http://localhost:9001

#### Option B: Full Docker Access Points
- **Frontend**: http://localhost:4201
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api-docs
- **Database Admin (Adminer)**: http://localhost:8081
- **MinIO Console**: http://localhost:9002
- **Redis Commander**: http://localhost:8082

### Stopping the Application
```powershell
# Stop infrastructure services only
docker-compose -f docker-compose.windows.yml down

# Stop full Docker environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Stop and remove volumes (complete cleanup)
docker-compose -f docker-compose.windows.yml down -v
```

## 🛠️ Option 2: Local Development (Without Docker)

### Prerequisites
1. **Install Node.js 18+**
   - Download from: https://nodejs.org/
   - Choose the LTS version
   - Verify installation: `node --version` and `npm --version`

2. **Install PostgreSQL 15**
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, remember the password you set for the `postgres` user
   - Add PostgreSQL bin directory to your PATH environment variable

3. **Install Redis** (Optional, for caching)
   - Download from: https://github.com/microsoftarchive/redis/releases
   - Or use Redis on Docker: `docker run -d -p 6379:6379 redis:7-alpine`

### Setup Steps

#### 1. Configure Environment
```powershell
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2
copy .env.example .env
```

Edit the `.env` file with your local configuration:
```env
NODE_ENV=development
PORT=3000

# Database (adjust to your PostgreSQL installation)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=gestion_emballages
DB_SYNCHRONIZE=true
DB_LOGGING=true

# JWT
JWT_SECRET=dev-jwt-secret-key
JWT_EXPIRES_IN=7d

# Redis (if using local Redis)
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGIN=http://localhost:4200

# File uploads
UPLOADS_DIR=./uploads
TEMP_DIR=./temp
```

#### 2. Setup Database
```powershell
# Connect to PostgreSQL using psql
psql -U postgres -h localhost

# Create database
CREATE DATABASE gestion_emballages;

# Exit psql
\q
```

#### 3. Start Backend
```powershell
# Open first PowerShell window
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\backend

# Install dependencies
npm install

# Start development server
npm run start:dev
```

#### 4. Start Frontend
```powershell
# Open second PowerShell window
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Access the Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api-docs

### Stopping the Application
- Press `Ctrl+C` in each PowerShell window to stop the servers

## 🎯 Option 3: Windows Subsystem for Linux (WSL)

If you have WSL2 installed, you can use the Linux setup script:

### Prerequisites
1. **Install WSL2**
   - Open PowerShell as Administrator
   - Run: `wsl --install`
   - Restart your computer
   - Set up a Linux distribution (Ubuntu recommended)

2. **Install Docker Desktop with WSL2 integration**

### Setup Steps
```bash
# Open WSL2 terminal (Ubuntu)
cd /mnt/c/Users/bruno.martinez/Documents/Local-work/gestion-emballages/gestion-emballages-v2

# Make script executable
chmod +x scripts/setup.sh

# Run complete setup
./scripts/setup.sh setup dev
```

### Access the Application
Same URLs as Option 1 (Docker Desktop)

## 🔧 Troubleshooting Windows-Specific Issues

### Docker Desktop Issues

#### Docker Desktop Won't Start
```powershell
# 1. Enable required Windows features
# Go to "Turn Windows features on or off"
# Enable: Hyper-V, Windows Subsystem for Linux, Virtual Machine Platform

# 2. Enable WSL 2
wsl --install
wsl --set-default-version 2

# 3. Restart Windows

# 4. Verify Docker installation
docker --version
docker-compose --version
```

#### Docker Compose Issues
```powershell
# If you get "docker-compose: command not found"
# Docker Desktop includes docker-compose as a plugin
# Use: docker compose (without hyphen) instead of docker-compose

# Alternative commands:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker compose ps
docker compose down
```

### Port Conflicts
```powershell
# Check what's using a port (e.g., 3000)
netstat -ano | findstr :3000

# Kill process using port
taskkill /PID <PID_NUMBER> /F

# Example: if process 1234 is using port 3000
taskkill /PID 1234 /F
```

### Node.js Issues

#### Permission Errors
```powershell
# Run PowerShell as Administrator for npm global installs
# Or configure npm to use a different directory for global packages
npm config set prefix "%USERPROFILE%\npm-global"

# Add %USERPROFILE%\npm-global to your PATH environment variable
```

#### Module Installation Issues
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json, then reinstall
rmdir /s node_modules
del package-lock.json
npm install
```

#### Build Issues
```powershell
# If you encounter node-gyp errors, install build tools
npm install -g windows-build-tools

# Or install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
```

### PowerShell Execution Policy
```powershell
# If you get "execution of scripts is disabled" error
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify the change
Get-ExecutionPolicy -List
```

### PostgreSQL Connection Issues
```powershell
# Check if PostgreSQL service is running
services.msc
# Look for "postgresql-x64-15" service and start it if stopped

# Test connection
psql -U postgres -h localhost -p 5432

# If authentication fails, check pg_hba.conf file
# Located at: C:\Program Files\PostgreSQL\15\data\pg_hba.conf
# Ensure it has: host all all 127.0.0.1/32 md5
```

### Firewall Issues
```powershell
# If you can't access the application from other devices on your network
# Add Windows Firewall exceptions for the ports:
netsh advfirewall firewall add rule name="Node.js App" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Angular App" dir=in action=allow protocol=TCP localport=4200
```

## 📝 Windows Environment Configuration

### Complete .env File for Windows
```env
# =================
# Application Settings
# =================
NODE_ENV=development
PORT=3001
API_PREFIX=api
API_VERSION=v1

# =================
# Security Settings
# =================
JWT_SECRET=dev-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# =================
# Database Configuration
# =================
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=gestion_emballages_dev
DB_SYNCHRONIZE=true
DB_LOGGING=true

# =================
# Redis Configuration (if using local Redis)
# =================
REDIS_HOST=localhost
REDIS_PORT=6379

# =================
# MinIO Configuration (if using local MinIO)
# =================
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=gestion-emballages-dev
MINIO_USE_SSL=false

# =================
# CORS Configuration
# =================
CORS_ORIGIN=http://localhost:4200
CORS_CREDENTIALS=true

# =================
# File Upload Configuration
# =================
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,xls,xlsx
UPLOADS_DIR=./uploads
TEMP_DIR=./temp

# =================
# Development Settings
# =================
HOT_RELOAD=true
DEBUG=true
SWAGGER_ENABLED=true
SEED_DATABASE=true
SEED_ADMIN_EMAIL=admin@dev.com
SEED_ADMIN_PASSWORD=admin123

# =================
# Logging Configuration
# =================
LOG_LEVEL=debug
LOG_FILE=./logs/application.log
```

## 🎯 Recommended Approach for Windows

**For development, I recommend Option 1 (Docker Desktop)** because:
- ✅ Consistent environment across all platforms
- ✅ All services (PostgreSQL, Redis, MinIO) included automatically
- ✅ No need to install and configure PostgreSQL locally
- ✅ Easy to reset and clean up
- ✅ Matches production environment exactly
- ✅ Isolated from your local system

### Quick Start Commands (Copy & Paste)

#### Recommended: Infrastructure + Local Apps
```powershell
# Navigate to project directory
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2

# Copy environment file
copy .env.example .env

# Start infrastructure services only
docker-compose -f docker-compose.windows.yml up -d

# Wait for services to start, then check status
docker-compose -f docker-compose.windows.yml ps

# In first PowerShell window - Start Backend
cd backend
npm install
npm run start:dev

# In second PowerShell window - Start Frontend  
cd frontend
npm install
npm start
```

#### Alternative: Full Docker (if build issues are resolved)
```powershell
# Navigate to project directory
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2

# Copy environment file
copy .env.example .env

# Start everything with Docker
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait about 60 seconds, then check status
docker-compose ps

# View logs (optional)
docker-compose logs -f
```

### Default Login Credentials
Once the application is running, you can log in with:
- **Email**: admin@dev.com
- **Password**: admin123

### Useful Docker Commands
```powershell
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a specific service
docker-compose restart backend

# Access database directly
docker-compose exec postgres psql -U dev_user gestion_emballages_dev

# Access backend container shell
docker-compose exec backend bash

# Clean up everything (including volumes)
docker-compose down -v
docker system prune -a
```

## 🆘 Getting Help

If you encounter issues:

1. **Check Service Status**
   ```powershell
   docker-compose ps
   ```

2. **View Logs**
   ```powershell
   docker-compose logs -f [service-name]
   ```

3. **Common Issues**
   - **Port conflicts**: Change ports in docker-compose.dev.yml
   - **Docker not starting**: Restart Docker Desktop
   - **Services not responding**: Wait longer for startup (can take 1-2 minutes)

4. **Reset Everything**
   ```powershell
   docker-compose down -v
   docker system prune -a
   # Then restart with the setup commands
   ```

## 🎉 Success!

Once everything is running, you should see:
- ✅ Frontend accessible at http://localhost:4201
- ✅ Backend API at http://localhost:3001/api
- ✅ Database admin at http://localhost:8081
- ✅ All services showing "Up" status in `docker-compose ps`

**You're ready to start developing!** 🚀