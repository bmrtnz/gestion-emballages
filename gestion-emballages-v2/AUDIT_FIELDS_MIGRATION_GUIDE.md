# Station Audit Fields Migration Guide

## Problem
The Station and StationContact entities have been updated to include audit fields (`created_by` and `updated_by`), but these columns don't exist in the database yet. This causes a 500 error when trying to fetch stations.

## Solution Options

### Option 1: Run TypeORM Migration (Recommended)
```bash
cd backend
npm run migration:run
```

### Option 2: Apply SQL Script Directly
If the migration doesn't work, you can run the SQL script directly:

1. Connect to your PostgreSQL database:
   - Host: localhost
   - Port: 5433
   - Database: gestion_emballages_dev
   - Username: dev_user
   - Password: dev_password

2. Run the SQL script: `backend/add-audit-fields.sql`

### Option 3: PowerShell Script (Windows)
```powershell
cd backend
.\run-migration.ps1
```

## What the Migration Does
1. Adds `created_by` and `updated_by` columns to `stations` table
2. Adds `created_by` and `updated_by` columns to `station_contacts` table
3. Sets existing records to use the first admin user as creator
4. Creates foreign key constraints to the `users` table

## Verification
After running the migration, the stations API should work correctly:
```
GET http://localhost:3001/api/v1/stations?page=1&limit=10&sortBy=name&sortOrder=ASC&status=active
```

## Files Created
- `backend/src/migrations/1754769000000-AddAuditFieldsToStations.ts` - TypeORM migration
- `backend/add-audit-fields.sql` - Raw SQL script  
- `backend/run-migration.ps1` - PowerShell script

## Code Changes Made
1. **Station Entity** (`stations.entity.ts`):
   - Added `createdById` and `updatedById` columns
   - Added User relations for audit fields

2. **StationContact Entity** (`station-contact.entity.ts`):
   - Added `createdById` and `updatedById` columns
   - Added User relations for audit fields

3. **Services** (`stations.service.ts`, `station-contacts.service.ts`):
   - Updated all CRUD methods to accept `userId` parameter
   - Set audit fields when creating/updating records

4. **Controllers** (`stations.controller.ts`, `station-contacts.controller.ts`):
   - Extract user ID from JWT token (`req.user.id`)
   - Pass user context to service methods

## Compliance Achieved
✅ **User Attribution**: All Station and StationContact changes tracked with user context  
✅ **Audit Trail**: Complete change history with timestamps and user IDs  
✅ **CLAUDE.md Compliance**: Follows established audit patterns from other entities  
✅ **Data Integrity**: Proper foreign key relationships to User entity