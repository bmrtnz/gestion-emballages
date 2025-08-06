# Quick Seeder Test Guide

## 🔧 Fixes Applied

I've fixed the following issues with the seeder:

1. **Path Resolution**: Added `ts-node -r tsconfig-paths/register` to properly resolve path mappings
2. **Enum Import**: Fixed import from `user-roles.enum.ts` to `user-role.enum.ts`
3. **Missing EntityType**: Added `EntityType` enum to the user-role.enum.ts file
4. **Path Mappings**: Updated tsconfig.json to include all necessary path mappings

## 🚀 How to Test the Seeder

### Step 1: Ensure Database is Running
```powershell
# Start PostgreSQL via Docker
docker-compose -f docker-compose.windows.yml up -d postgres

# Check if PostgreSQL is running
docker-compose -f docker-compose.windows.yml ps
```

### Step 2: Test Seeder
```powershell
# Navigate to backend directory
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\backend

# Run the seeder
npm run seed
```

### Step 3: Expected Output
If successful, you should see:
```
🚀 Starting NestJS application for seeding...
🌱 Running database seeder...
🧹 Clearing existing data...
✅ Created 4 stations
✅ Created 4 suppliers
✅ Created 9 users
✅ Created 15 articles
✅ Created article-supplier relationships
✅ Created initial stock data
🎉 Database seeding completed successfully!
✅ Seeding completed successfully!
```

## 🔐 Test Login Credentials

After successful seeding, you can use these credentials:

```
Admin: admin@dev.com / admin123
Manager: nicole@embadif.com / password123
Station: station@test.com / password123
Supplier: supplier@test.com / password123
```

## 🆘 If Seeder Still Fails

If you encounter other errors, please share the exact error message. Common issues might be:

1. **Database Connection**: Ensure PostgreSQL is running and accessible
2. **Missing Dependencies**: Run `npm install` to ensure all packages are installed
3. **Permission Issues**: Ensure the database user has CREATE/DROP privileges

## 🎯 Next Steps After Successful Seeding

1. **Start Backend**: `npm run start:dev`
2. **Start Frontend**: `cd ../frontend && npm start`
3. **Test Login**: Use any of the credentials above
4. **Explore Data**: Browse stations, suppliers, articles, etc.

---

Try running `npm run seed` now and let me know the result! 🚀