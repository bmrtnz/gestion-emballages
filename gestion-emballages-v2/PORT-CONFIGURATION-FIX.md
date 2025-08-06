# 🔧 Port Configuration Fix - CRITICAL

## 🚨 Problem Identified
**Both frontend and backend were configured to use port 3000!** This causes a conflict where only one can run at a time.

## ✅ Fix Applied
- **Backend**: Port 3000 (unchanged)
- **Frontend**: Changed from 3000 to 4200 (standard Angular port)

## 📋 Complete Port Configuration

### Backend (NestJS)
- **Port**: 3000
- **API Base URL**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Config location**: `backend/.env` → `PORT=3000`

### Frontend (Angular)
- **Port**: 4200 (FIXED!)
- **App URL**: http://localhost:4200
- **Config location**: `frontend/angular.json` → `"port": 4200`
- **API calls to**: http://localhost:3000/api/v1

### Database (PostgreSQL)
- **Port**: 5432
- **Running via**: Docker

## 🚀 Steps to Apply the Fix

### 1. Stop ALL Running Services
```powershell
# Stop everything with Ctrl+C in all terminals
# Or kill all Node processes:
taskkill /F /IM node.exe
```

### 2. Check What's Using the Ports
```powershell
# Check port 3000 (should be free for backend)
netstat -an | findstr :3000

# Check port 4200 (should be free for frontend)
netstat -an | findstr :4200

# Check port 5432 (should show PostgreSQL)
netstat -an | findstr :5432
```

### 3. Start Backend FIRST
```powershell
# Terminal 1
cd backend
npm run start:dev
```

**WAIT** for: "Application is running on: http://localhost:3000/api/v1"

### 4. Verify Backend is Working
Open browser and check:
- http://localhost:3000/api/docs (should show Swagger UI)

### 5. Start Frontend in NEW Terminal
```powershell
# Terminal 2 (keep backend running!)
cd frontend
npm start
```

**WAIT** for: "Angular Live Development Server is listening on localhost:4200"

### 6. Access the Application
- Open browser: http://localhost:4200
- Login with: nicole@embadif.com / password123

## 🔍 Port Usage Summary

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Backend | 3000 | http://localhost:3000 | NestJS API Server |
| Frontend | 4200 | http://localhost:4200 | Angular Dev Server |
| PostgreSQL | 5432 | localhost:5432 | Database |
| MinIO (optional) | 9000 | http://localhost:9000 | File Storage |

## 🛠️ Troubleshooting

### "Port already in use" Errors
```powershell
# Find what's using a port (e.g., 3000)
netstat -ano | findstr :3000
# Note the PID in the last column

# Kill that process
taskkill /PID [PID_NUMBER] /F
```

### Frontend Still Trying to Use Port 3000
If you see "Port 3000 is already in use", the Angular config wasn't reloaded:
1. Stop the frontend (Ctrl+C)
2. Clear Angular cache: `rmdir /s /q .angular`
3. Start again: `npm start`

### API Calls Still Failing
1. Check browser DevTools Network tab
2. Verify calls go to `http://localhost:3000/api/v1/...`
3. If going to wrong port, clear browser cache completely

## ✅ Verification Checklist

- [ ] Backend runs on port 3000
- [ ] Frontend runs on port 4200
- [ ] Can access http://localhost:3000/api/docs
- [ ] Can access http://localhost:4200
- [ ] Login form appears at http://localhost:4200
- [ ] No "port in use" errors
- [ ] API calls in Network tab show port 3000

## 📝 Important Notes

1. **NEVER** run frontend with `ng serve --port 3000`
2. **ALWAYS** start backend before frontend
3. **KEEP** both terminals open while developing
4. The backend terminal should show incoming API requests
5. The frontend terminal should show compilation status

## 🎯 Quick Test After Fix

1. Both servers running? Check terminals
2. Swagger working? http://localhost:3000/api/docs
3. Angular working? http://localhost:4200
4. Can you see the login page? Success!
5. Try logging in with the test credentials

The port conflict was the main issue. With frontend on 4200 and backend on 3000, everything should work correctly now!