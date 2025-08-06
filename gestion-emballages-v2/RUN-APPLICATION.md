# 🚀 Running the Application - Complete Guide

## Prerequisites Check

Before starting, ensure:
1. ✅ PostgreSQL is running (via Docker)
2. ✅ Database seeder has been run successfully
3. ✅ Both backend and frontend dependencies are installed

## 📋 Step-by-Step Startup Guide

### Step 1: Start PostgreSQL (if not already running)
```powershell
# From the gestion-emballages-v2 directory
docker-compose -f docker-compose.windows.yml up -d postgres
```

### Step 2: Start Backend Server
```powershell
# Open a new terminal/PowerShell window
cd backend
npm run start:dev
```

**Wait for backend to start completely!** You should see:
```
[Nest] LOG [NestApplication] Nest application successfully started
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/api-docs
```

### Step 3: Verify Backend is Running
Open browser and check:
- http://localhost:3000/api-docs - Should show Swagger UI
- http://localhost:3000/api/health - Should return `{"status":"ok"}`

### Step 4: Start Frontend Server
```powershell
# Open ANOTHER terminal/PowerShell window (keep backend running!)
cd frontend
npm start
```

**Wait for Angular to compile!** You should see:
```
✔ Compiled successfully.
✔ Browser application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200 **
```

### Step 5: Access the Application
Open browser: http://localhost:4200

## 🔍 Troubleshooting Common Issues

### Backend Not Starting (Port 3000 in use)
```powershell
# Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Frontend Not Starting (Port 4200 in use)
```powershell
# Find and kill process using port 4200
netstat -ano | findstr :4200
taskkill /PID <PID_NUMBER> /F
```

### 404 Error on Login
This means the backend is NOT running! Ensure:
1. Backend terminal shows "Nest application successfully started"
2. You can access http://localhost:3000/api-docs
3. Backend didn't crash due to database connection issues

### Database Connection Failed
```powershell
# Check if PostgreSQL is running
docker-compose -f docker-compose.windows.yml ps

# Restart if needed
docker-compose -f docker-compose.windows.yml restart postgres
```

## 🔐 Login Credentials
After successful seeding:
- **Manager**: nicole@embadif.com / password123
- **Admin**: admin@dev.com / admin123
- **Station**: station@test.com / password123
- **Supplier**: supplier@test.com / password123

## 📊 Quick Status Check Commands

### Check All Services
```powershell
# PostgreSQL status
docker-compose -f docker-compose.windows.yml ps

# Backend API test
curl http://localhost:3000/api/health

# Frontend status
curl http://localhost:4200
```

## 🎯 Important Notes

1. **ALWAYS start backend BEFORE frontend**
2. **Keep BOTH terminal windows open** (backend and frontend)
3. **Backend must show "successfully started" before opening frontend**
4. **If you see CORS errors**, backend is running but CORS not configured
5. **If you see 404 errors**, backend is NOT running

## 🚦 Visual Status Indicators

✅ **Everything Working:**
- Backend terminal: Shows logs for incoming requests
- Frontend terminal: Shows compilation success
- Browser: Login page loads without console errors
- Network tab: API calls return 200/201 status codes

❌ **Something Wrong:**
- Console shows red errors about failed API calls
- Network tab shows 404, 500, or CORS errors
- Login button does nothing when clicked
- Page loads but is blank/broken

## 💡 Pro Tip
Use two PowerShell/Terminal windows side by side:
- Left: Backend logs (npm run start:dev)
- Right: Frontend logs (npm start)

This way you can see both servers' status at once!