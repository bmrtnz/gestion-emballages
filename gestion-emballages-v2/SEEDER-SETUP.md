# Complete Seeder Setup Guide

I've fixed the database seeder issues. Here's how to set it up properly:

## 🔧 Issues Fixed

1. **Missing .env file**: Created with proper database configuration
2. **Table synchronization**: Added database sync before seeding
3. **Error handling**: Improved error handling for non-existent tables
4. **Environment variables**: Aligned with app.module.ts configuration

## 🏗️ Prerequisites Setup

### Step 1: Ensure PostgreSQL is Running
```powershell
# Start PostgreSQL via Docker
docker-compose -f docker-compose.windows.yml up -d postgres

# Verify it's running
docker-compose -f docker-compose.windows.yml ps postgres
```

### Step 2: Verify Environment Configuration
I've created a `.env` file with these settings:
```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=dev_user
DB_PASSWORD=dev_password
DB_DATABASE=gestion_emballages_dev
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

This matches your Docker configuration in `docker-compose.windows.yml`.

## 🚀 Run the Seeder

```powershell
# Navigate to backend directory
cd C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\backend

# Run the seeder
npm run seed
```

## ✅ Expected Success Output

```
🚀 Starting NestJS application for seeding...
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized
[... NestJS initialization logs ...]
🌱 Running database seeder...
🌱 Starting database seeding...
⏳ Waiting for database synchronization...
✅ Database synchronized
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

## 🎯 What Gets Created

### Stations (4)
- Val-de-Garonne (Marmande)
- Coopérative des Pyrénées (Pau)
- Station Agricole Bordeaux
- Coop Atlantique (Biarritz)

### Suppliers (4)
- Emballages du Sud-Ouest (Toulouse)
- Plastiques Aquitaine (Bayonne)
- Cartons de France (Tarbes)  
- Eco-Emballages Nouvelle-Aquitaine (Limoges)

### Users (9 with different roles)
- 1 Admin, 1 Manager, 4 Station users, 2 Supplier users, 1 Test user

### Articles (15 packaging items)
- Barquettes, Cagettes, Plateaux, Films, Cartons, Sacs, etc.

### Relationships & Stock
- Article-supplier relationships with pricing
- Initial stock levels for each station

## 🔐 Login Credentials

After successful seeding:

```
🔑 Admin Access:
Email: admin@dev.com
Password: admin123

🏢 Station Test:
Email: station@test.com  
Password: password123

📦 Supplier Test:
Email: supplier@test.com
Password: password123

👨‍💼 Manager:
Email: nicole@embadif.com
Password: password123
```

## 🔧 Troubleshooting

### Database Connection Issues
```
Error: ECONNREFUSED
```
**Solution**: 
```powershell
# Check if PostgreSQL is running
docker-compose -f docker-compose.windows.yml ps

# Restart if needed
docker-compose -f docker-compose.windows.yml restart postgres
```

### Permission Issues
```
Error: permission denied
```
**Solution**: Verify the database user `dev_user` has sufficient permissions in PostgreSQL.

### Still Getting Table Errors?
If you still get "relation does not exist" errors:

1. **Check database exists**:
```powershell
# Connect to PostgreSQL
docker-compose -f docker-compose.windows.yml exec postgres psql -U dev_user gestion_emballages_dev -c "\dt"
```

2. **Manually create database** if it doesn't exist:
```powershell
docker-compose -f docker-compose.windows.yml exec postgres createdb -U dev_user gestion_emballages_dev
```

## 🎉 After Successful Seeding

1. **Start the backend**:
```powershell
npm run start:dev
```

2. **Test API endpoints**:
- Visit: http://localhost:3000/api-docs
- Login endpoint: POST http://localhost:3000/api/auth/login

3. **Start frontend** (in another terminal):
```powershell
cd ../frontend
npm start
```

4. **Login and explore**:
- Visit: http://localhost:4200
- Use any of the credentials above
- Browse stations, suppliers, articles, create orders!

## 🔄 Re-running the Seeder

The seeder can be run multiple times:
- It automatically clears existing data
- Creates fresh sample data each time
- Safe to run for testing/development

---

**Try running `npm run seed` now! 🚀**