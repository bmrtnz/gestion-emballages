# Quick Start Frontend Only (Windows)

This guide helps you start just the Angular frontend after fixing TypeScript compilation errors.

## 🚀 Quick Start

### Step 1: Navigate to Frontend Directory
```powershell
# Navigate to frontend directory
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\frontend
```

### Step 2: Install Dependencies (if needed)
```powershell
# Install dependencies
npm install
```

### Step 3: Start Development Server
```powershell
# Start Angular development server
npm start
```

## ✅ Expected Results

After starting, you should see:
- ✅ Angular CLI starting development server
- ✅ Webpack compilation successful
- ✅ Application running on http://localhost:4200
- ✅ No TypeScript compilation errors

## 🔧 Recently Fixed Issues

### TypeScript Compilation Errors Fixed
- ✅ Created missing `station.model.ts` file
- ✅ Created missing `fournisseur.model.ts` file  
- ✅ Created missing `user.model.ts` file (already existed)
- ✅ Created missing `article.model.ts` file (already existed)
- ✅ Created missing `station-list.component.ts` file
- ✅ Created missing `fournisseur-list.component.ts` file
- ✅ Created missing `station.service.ts` file
- ✅ Created missing `fournisseur.service.ts` file
- ✅ Created missing `toast.service.ts` file
- ✅ Fixed environment API URL (changed from port 4000 to 3000)

### New Components Created
- **Station List Component**: Complete list view with pagination, search, and filters
- **Fournisseur List Component**: Complete list view with specialties and site management
- **Service Files**: Full CRUD operations for stations and suppliers
- **Toast Service**: User notification system

## 🌐 Access Points

Once frontend is running:
- **Frontend Application**: http://localhost:4200
- **Login Page**: http://localhost:4200/login
- **Dashboard**: http://localhost:4200/dashboard (after login)

## 🔗 Backend Connection

The frontend is configured to connect to:
- **Backend API**: http://localhost:3000/api

Make sure your backend is running on port 3000 for full functionality.

## 🧪 Test the Frontend

### Health Check
```powershell
# Open browser to
http://localhost:4200
```

### Login Test
Use these default credentials (created by backend seeder):
- **Admin**: admin@dev.com / admin123
- **Station**: station@test.com / password123
- **Supplier**: supplier@test.com / password123

## 📱 Features Available

### Navigation
- Dashboard with role-based widgets
- Station management (list, create, edit)
- Supplier management (list, create, edit)
- Article management with supplier relationships
- User management with role permissions
- Order management workflow
- Stock tracking
- Transfer requests

### UI Features
- Responsive design (mobile + desktop)
- Toast notifications
- Loading states
- Pagination
- Search and filtering
- Role-based permissions
- Status workflows

## 🔧 Troubleshooting

### Port Already in Use
```powershell
# Check what's using port 4200
netstat -ano | findstr :4200

# Kill process if needed
taskkill /PID <PID> /F
```

### Compilation Errors
All major TypeScript errors have been fixed. If you encounter new errors:

1. **Check imports**: Make sure all imports point to existing files
2. **Check models**: Verify interface properties match backend DTOs
3. **Check services**: Ensure service methods return correct types
4. **Clear cache**: Delete `node_modules` and run `npm install`

### Browser Errors
```powershell
# Clear browser cache
# Press F12 → Application → Storage → Clear storage

# Or use incognito mode
# Ctrl+Shift+N
```

## 🔄 Full Stack Development

For full development workflow:

1. **Start Backend**:
   ```powershell
   # Terminal 1: Infrastructure
   docker-compose -f docker-compose.windows.yml up -d
   
   # Terminal 2: Backend
   cd backend && npm run start:dev
   ```

2. **Start Frontend**:
   ```powershell
   # Terminal 3: Frontend
   cd frontend && npm start
   ```

3. **Access Application**:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000/api
   - API Docs: http://localhost:3000/api-docs

## 🛑 Stopping Frontend

```powershell
# Stop development server
# Press Ctrl+C in frontend terminal
```

---

**The frontend should now compile and start without TypeScript errors! 🎉**

**Next steps**: Test the application with backend running for full functionality.