# 🔄 Backend Restart Guide - Fix 500 Error

## 🚨 Current Issue
Backend is returning 500 Internal Server Error because it needs to be restarted after our code changes.

## 🛑 Complete Restart Procedure

### Step 1: Stop Everything
```powershell
# Stop backend (Ctrl+C in backend terminal)
# Stop frontend (Ctrl+C in frontend terminal)

# Kill any lingering Node processes
taskkill /F /IM node.exe
```

### Step 2: Verify PostgreSQL is Running
```powershell
docker-compose -f docker-compose.windows.yml ps

# If not running, start it:
docker-compose -f docker-compose.windows.yml up -d postgres
```

### Step 3: Clear Backend Build Cache
```powershell
cd backend
rmdir /s /q dist
rmdir /s /q node_modules\.cache
```

### Step 4: Rebuild and Start Backend
```powershell
cd backend
npm run build
npm run start:dev
```

### Step 5: Watch for Startup Messages
Look for these CRITICAL messages:
```
[Nest] LOG [InstanceLoader] AuthModule dependencies initialized
[Nest] LOG [InstanceLoader] UsersModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
Application is running on: http://localhost:3000/api/v1
```

### Step 6: Test the Backend
```powershell
# Run the test script
cd backend
.\test-auth-detailed.ps1
```

Or manually test:
- Open http://localhost:3000/api/docs
- Find POST /api/v1/auth/login
- Click "Try it out"
- Use: nicole@embadif.com / password123

### Step 7: Start Frontend
```powershell
cd frontend
npm start
```

## 🔍 If Still Getting 500 Error

### Check Backend Console
Look for error messages like:
- `QueryFailedError` - Database issue
- `Cannot read property 'station'` - Our fix wasn't applied
- `jwt must be provided` - JWT configuration issue
- `bcrypt error` - Password hashing issue

### Common Fixes:

#### 1. Database Connection Lost
```powershell
# Restart PostgreSQL
docker-compose -f docker-compose.windows.yml restart postgres

# Wait 10 seconds, then restart backend
cd backend
npm run start:dev
```

#### 2. Missing Dependencies
```powershell
cd backend
npm install
npm rebuild bcrypt
```

#### 3. Users Not in Database
```powershell
# Re-run seeder
cd backend
npm run seed
```

#### 4. JWT Configuration Issue
Check `backend/.env` has:
```
JWT_SECRET=your-super-secret-jwt-key-for-development-change-in-production
JWT_EXPIRES_IN=1d
```

## 📊 Expected Success Flow

1. Backend starts without errors ✅
2. All modules initialize ✅
3. Swagger docs accessible ✅
4. Login endpoint returns JWT token ✅
5. Frontend can login successfully ✅

## 🆘 Emergency Reset

If nothing works, do a complete reset:

```powershell
# 1. Stop everything
taskkill /F /IM node.exe

# 2. Reset database
docker-compose -f docker-compose.windows.yml down
docker-compose -f docker-compose.windows.yml up -d postgres
Start-Sleep 5

# 3. Clean install backend
cd backend
rmdir /s /q node_modules
rmdir /s /q dist
npm install
npm run build

# 4. Run seeder
npm run seed

# 5. Start backend
npm run start:dev

# 6. Start frontend (new terminal)
cd frontend
npm start
```

## 💡 Key Point
The backend MUST be restarted after code changes. The 500 error is likely because the old code (trying to load station/fournisseur relations) is still running.