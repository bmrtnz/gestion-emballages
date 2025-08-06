# Troubleshooting Angular Development Server

You're getting "Ce site est inaccessible" (This site can't be reached) error. Let's debug this step by step.

## 🔍 Step 1: Check If Server is Actually Running

### Check Terminal Output
When you ran `npm start`, did you see:
- ✅ **Success**: "Angular Live Development Server is listening on localhost:4200"
- ❌ **Error**: Compilation errors or server startup failures

### Check Terminal Status
Look at your PowerShell terminal where you ran `npm start`:
- Is the process still running?
- Are there any error messages?
- Did the process exit unexpectedly?

## 🔧 Step 2: Common Fixes

### Fix 1: Check Port Conflict
```powershell
# Check if port 4200 is in use
netstat -ano | findstr :4200

# If something is using port 4200, kill it
# Find the PID and run:
taskkill /PID <PID_NUMBER> /F
```

### Fix 2: Try Different Port
```powershell
# Navigate to frontend directory
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\frontend

# Start on different port
npx ng serve --port 4201

# Then try: http://localhost:4201
```

### Fix 3: Clear Node Cache
```powershell
# Navigate to frontend directory
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\frontend

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
del package-lock.json
npm install

# Try starting again
npm start
```

### Fix 4: Check Windows Firewall
```powershell
# Run as Administrator
# Allow Node.js through Windows Firewall
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe"
```

## 🚀 Step 3: Alternative Startup Methods

### Method 1: Explicit Host Binding
```powershell
cd frontend
npx ng serve --host 0.0.0.0 --port 4200
```

### Method 2: Force Open Browser
```powershell
cd frontend
npx ng serve --open --port 4200
```

### Method 3: Verbose Output
```powershell
cd frontend
npx ng serve --verbose --port 4200
```

## 🔍 Step 4: Check Angular Configuration

### Verify angular.json
The file should have correct serve configuration:

```json
{
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
      "buildTarget": "gestion-emballages-frontend:build",
      "port": 4200,
      "host": "localhost"
    }
  }
}
```

## 🌐 Step 5: Network Diagnostics

### Check Network Connectivity
```powershell
# Test if localhost resolves
ping localhost

# Test if you can connect to any local port
telnet localhost 80
```

### Check Browser Issues
- Try different browser (Chrome, Firefox, Edge)
- Try incognito/private mode
- Clear browser cache and cookies
- Disable browser extensions

## 📋 Step 6: Manual Debug Process

### 1. Fresh Terminal
Open a new PowerShell window as Administrator:

```powershell
# Navigate to project
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\frontend

# Check Node.js version
node --version
npm --version

# Install dependencies fresh
npm install

# Start development server with verbose output
npm start -- --verbose --port 4200
```

### 2. Check Process Status
In another terminal:
```powershell
# Check if Angular process is running
tasklist | findstr node
```

### 3. Test Port Accessibility
```powershell
# Test if port is accessible
curl http://localhost:4200
# OR
Invoke-WebRequest -Uri http://localhost:4200
```

## 🔄 Step 7: Full Reset Procedure

If nothing above works, try this complete reset:

```powershell
# 1. Stop all Node processes
taskkill /f /im node.exe

# 2. Navigate to frontend
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\frontend

# 3. Complete cleanup
rmdir /s /q node_modules
rmdir /s /q .angular
del package-lock.json

# 4. Fresh install
npm cache clean --force
npm install

# 5. Try starting
npm start
```

## 🎯 Step 8: Expected Success Output

When working correctly, you should see:
```
✔ Browser application bundle generation complete.
Initial chunk files   | Names         |  Raw size
vendor.js             | vendor        |   2.74 MB | 
polyfills.js          | polyfills     | 262.60 kB | 
styles.css, styles.js | styles        | 204.13 kB | 
main.js               | main          |  52.02 kB | 
runtime.js            | runtime       |  12.66 kB | 

** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **

✔ Compiled successfully.
```

## 🆘 If Still Not Working

### Check System Requirements
- Node.js version 18 or higher
- npm version 9 or higher  
- Windows 10/11 with PowerShell 5.1+

### Try Minimal Test
Create a simple test to verify Angular CLI:
```powershell
# Create test app in temp directory
cd %TEMP%
npx @angular/cli new test-app --routing=false --style=css --skip-git
cd test-app
npm start
```

If this works, the issue is project-specific.
If this fails, the issue is with your Angular/Node setup.

## 📞 Report Back

Please run these commands and share the output:

```powershell
# From frontend directory:
node --version
npm --version
npx ng version
npm start
```

And let me know:
1. What exactly do you see in the terminal?
2. Any error messages?
3. Does the process stay running or exit?
4. What happens when you try different ports?

This will help pinpoint the exact issue! 🔍