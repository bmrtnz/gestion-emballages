# Database Seeder Guide

This guide explains how to use the PostgreSQL database seeder for the Blue Whale Portal application.

## 🌱 What Gets Seeded

The seeder populates the database with realistic sample data:

### 🏢 **Stations (4 cooperatives)**
- **Val-de-Garonne** (Marmande) - VDG001
- **Coopérative des Pyrénées** (Pau) - PYR002  
- **Station Agricole Bordeaux** - BDX003
- **Coop Atlantique** (Biarritz) - ATL004

### 📦 **Suppliers (4 companies)**
- **Emballages du Sud-Ouest** (Toulouse) - Carton, Plastique
- **Plastiques Aquitaine** (Bayonne) - Film Plastique, Barquette
- **Cartons de France** (Tarbes) - Carton, Cagette
- **Eco-Emballages Nouvelle-Aquitaine** (Limoges) - Isotherme, Sac Papier

### 👥 **Users (9 users)**
- **1 Admin**: System administrator
- **1 Gestionnaire**: Operations manager
- **4 Station Users**: One per cooperative
- **2 Supplier Users**: Two supplier representatives
- **1 Test Station User**: For development/testing
- **1 Test Supplier User**: For development/testing

### 📋 **Articles (15 packaging items)**
- **Barquettes**: Plastic containers (500g, 1kg)
- **Cagettes**: Wooden/cardboard crates
- **Plateaux**: Cardboard trays
- **Films**: Plastic wrap and stretch film
- **Cartons**: Shipping and display boxes
- **Sacs**: Plastic and paper bags
- **Emballages isothermes**: Insulated packaging
- **Étiquettes**: Barcode labels
- **Autres**: Attachments, adhesive tape

### 💰 **Pricing & Relationships**
- Each article has 1-3 suppliers with different pricing
- Realistic price variations between suppliers (±15%)
- Proper packaging specifications and lead times

### 📊 **Initial Stock**
- Each station has stock for ~70% of articles
- Random quantities between 100-1099 units
- Alert thresholds set at 20% (warning) and 10% (critical)

## 🚀 How to Run the Seeder

### Prerequisites
1. **Database running**: PostgreSQL must be accessible
2. **Environment configured**: `.env` file with database connection
3. **Dependencies installed**: `npm install` completed

### Commands

```powershell
# Navigate to backend directory
cd backend

# Show seeder help
npm run seed:help

# Run the seeder (⚠️ This clears all existing data!)
npm run seed
```

### Expected Output
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

## 🔐 Default User Credentials

After seeding, you can login with these accounts:

### **System Users**
```
Admin (Full Access):
- Email: admin@dev.com
- Password: admin123

Manager (Operations):
- Email: nicole@embadif.com  
- Password: password123
```

### **Station Users**
```
Val-de-Garonne:
- Email: j.martin@valdegaronne.com
- Password: password123

Coopérative Pyrénées:
- Email: m.lebrun@coop-pyrenees.fr
- Password: password123

Station Bordeaux:
- Email: p.dubois@agri-station.fr
- Password: password123
```

### **Supplier Users**
```
Emballages Sud-Ouest:
- Email: f.martinez@emballages-so.fr
- Password: password123

Plastiques Aquitaine:
- Email: e.dubois@plastiques-aquitaine.com
- Password: password123
```

### **Test Users**
```
Test Station:
- Email: station@test.com
- Password: password123

Test Supplier:
- Email: supplier@test.com
- Password: password123
```

## 🎯 Role-Based Access

Each user role has different permissions:

### **Manager**
- ✅ Full system access
- ✅ User management
- ✅ All modules
- ✅ System configuration

### **Gestionnaire** 
- ✅ Operational management
- ✅ Order processing
- ✅ Stock management
- ✅ Reports

### **Station**
- ✅ Place orders
- ✅ Manage shopping lists
- ✅ View stock
- ✅ Request transfers
- ❌ Cannot manage other stations

### **Fournisseur**
- ✅ Manage orders from customers
- ✅ Update order status
- ✅ Manage stock levels
- ❌ Cannot see other suppliers' data

## 📊 Sample Data Details

### **Realistic Pricing**
- Barquettes: €0.10-0.20 each
- Cagettes: €0.30-0.60 each  
- Films: €10-15 per roll
- Cartons: €0.25-0.45 each
- Labels: €40-50 per 1000

### **Stock Levels**
- Each station starts with 100-1099 units per article
- Alert thresholds automatically calculated
- Covers approximately 70% of available articles

### **Business Relationships**
- Each article available from 1-3 suppliers
- Suppliers specialize in relevant categories
- Lead times vary from 5-14 days

## ⚠️ Important Notes

### **Data Destruction**
Running the seeder **CLEARS ALL EXISTING DATA**:
- All users will be deleted
- All orders will be lost
- All stock data will be reset
- This action is **IRREVERSIBLE**

### **Development vs Production**
- This seeder is for **DEVELOPMENT ONLY**
- Never run on production databases
- Contains test data and weak passwords

### **Database Requirements**
- PostgreSQL 12+ required
- Database must exist before running
- User needs CREATE/DROP permissions

## 🔧 Troubleshooting

### **Connection Issues**
```
Error: ECONNREFUSED
```
**Solution**: Ensure PostgreSQL is running and accessible

### **Permission Issues**
```
Error: permission denied for table
```
**Solution**: Verify database user has sufficient permissions

### **Missing Dependencies**
```
Error: Cannot find module
```
**Solution**: Run `npm install` in backend directory

### **Seeder Fails Mid-Process**
The seeder uses transactions - if it fails, no partial data is left in the database.

## 🎉 After Seeding

Once seeding completes successfully:

1. **Start the backend**: `npm run start:dev`
2. **Start the frontend**: `cd ../frontend && npm start` 
3. **Login**: Use any of the credentials above
4. **Explore**: Browse stations, suppliers, articles, and place test orders!

## 🔄 Re-seeding

To refresh the data:
```powershell
# Stop the backend if running
# Ctrl+C

# Re-run seeder
npm run seed

# Restart backend
npm run start:dev
```

The seeder can be run multiple times safely - it always starts with a clean slate.

---

**Happy coding! 🚀**