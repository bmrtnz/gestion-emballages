# 🔧 Troubleshooting API 404 Error

## 🚨 Current Issue
Frontend is getting 404 when calling `http://localhost:3000/api/v1/auth/login`

## 🔍 Diagnostic Steps

### Step 1: Verify Backend is Actually Running
```powershell
# Run the PowerShell test script
cd backend
.\test-api.ps1
```

### Step 2: Check Backend Console Output
Look for these startup messages in your backend terminal:
```
Application is running on: http://localhost:3000/api/v1
Swagger documentation: http://localhost:3000/api/docs
```

If you see different URLs, that's the issue!

### Step 3: Restart Backend with Fresh Build
```powershell
# Stop the current backend (Ctrl+C)
# Then:
cd backend
npm run build
npm run start:dev
```

### Step 4: Check for TypeScript Compilation Errors
If the backend shows errors on startup, it might not be loading all modules properly.

## 🎯 Most Likely Causes

### 1. Backend Not Fully Restarted
**Solution**: Stop (Ctrl+C) and restart the backend completely:
```powershell
cd backend
npm run start:dev
```

### 2. Old Backend Process Still Running
**Solution**: Kill all Node processes and restart:
```powershell
# Find Node processes
tasklist | findstr node

# Kill them
taskkill /F /IM node.exe

# Restart backend
cd backend
npm run start:dev
```

### 3. Module Not Loading Due to Compilation Error
**Solution**: Check backend console for errors like:
- "Cannot find module"
- "TypeScript compilation error"
- "Nest can't resolve dependencies"

### 4. Environment Variable Issue
**Solution**: Verify .env file exists and has correct values:
```powershell
cd backend
type .env | findstr API
```

Should show:
```
API_PREFIX=api
API_VERSION=v1
```

## 🔄 Complete Reset Procedure

1. **Stop all services**:
   ```powershell
   # Stop frontend (Ctrl+C in frontend terminal)
   # Stop backend (Ctrl+C in backend terminal)
   ```

2. **Clear any cached builds**:
   ```powershell
   cd backend
   rmdir /s /q dist
   npm run build
   ```

3. **Start backend first**:
   ```powershell
   cd backend
   npm run start:dev
   ```
   
   **WAIT** for: "Nest application successfully started"

4. **Test the API**:
   ```powershell
   # Open browser
   # Go to: http://localhost:3000/api/docs
   # You should see Swagger UI
   ```

5. **Start frontend**:
   ```powershell
   cd frontend
   npm start
   ```

6. **Clear browser cache**:
   - Open DevTools (F12)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

## 📊 What the URLs Should Be

Based on the code configuration:
- Backend base: `http://localhost:3000`
- API prefix: `/api/v1`
- Auth endpoint: `http://localhost:3000/api/v1/auth/login`
- Swagger docs: `http://localhost:3000/api/docs`

## 🆘 If Still Not Working

1. **Check if it's a different app on port 3000**:
   ```powershell
   curl http://localhost:3000
   ```
   
   If you get HTML instead of JSON, it might be the old Vue app!

2. **Try a different port**:
   Edit `backend/.env`:
   ```
   PORT=3001
   ```
   
   Update `frontend/src/environments/environment.ts`:
   ```typescript
   apiUrl: 'http://localhost:3001/api/v1',
   ```

3. **Check Windows Firewall**:
   Sometimes Windows Firewall blocks Node.js. Check if there's a popup asking for permission.

## 💡 Quick Test Command
```powershell
# This should work if backend is running correctly:
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"nicole@embadif.com\",\"password\":\"password123\"}"
```

If this works but the browser doesn't, it's a CORS or browser cache issue.