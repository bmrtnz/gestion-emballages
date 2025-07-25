# Database Maintenance Scripts

This directory contains utility scripts for database maintenance and data cleanup.

## Duplicate Designations Cleanup

### Problem
Over time, articles with identical designations (product names) may be created, leading to confusion and data inconsistency. This commonly happens when:
- Multiple users create similar products
- Data imports create duplicates
- Manual entry errors occur

### Solution
These scripts help identify and fix duplicate article designations by:
1. Finding articles with identical designations
2. Keeping the first active article (oldest creation date)
3. Marking all other duplicates as inactive (`isActive: false`)

---

## Scripts Available

### 1. Preview Script (Safe - No Changes)
**File:** `preview-duplicate-designations.js`
**Purpose:** Analyze and preview what would be changed without making modifications

```bash
# Using npm script (recommended)
npm run fix:duplicates:preview

# Or direct execution
node scripts/preview-duplicate-designations.js
```

**Output Example:**
```
📊 PREVIEW: Found 3 designations with duplicates:
🔍 This is what WOULD be changed (NO MODIFICATIONS MADE)

📝 Designation: "Bottle 500ml" (3 articles)
   ✅ WOULD KEEP: BTL001 (ID: 507f1f77bcf86cd799439011)
      📅 Created: 12/1/2023
      🔄 Currently Active: true
      🏪 Suppliers: 2
   ❌ WOULD DEACTIVATE: BTL002 (ID: 507f1f77bcf86cd799439012)
      📅 Created: 12/15/2023
      🏪 Suppliers: 1
   ❌ WOULD DEACTIVATE: BTL003 (ID: 507f1f77bcf86cd799439013)
      📅 Created: 1/5/2024
      🏪 Suppliers: 0
```

### 2. Fix Script (Makes Changes)
**File:** `fix-duplicate-designations.js`
**Purpose:** Actually fix the duplicates by deactivating them

```bash
# Using npm script (recommended)
npm run fix:duplicates:apply

# Or direct execution
node scripts/fix-duplicate-designations.js
```

**Interactive Confirmation:**
```
🚀 Starting duplicate designation cleanup...
⚠️  This script will mark duplicate articles as inactive (isActive = false)
📋 Strategy: Keep the first active article, deactivate all others with same designation

Do you want to proceed? (y/N):
```

---

## Logic & Strategy

### Selection Criteria
The script uses this priority order to choose which article to keep:

1. **Active Status**: Active articles are preferred over inactive ones
2. **Creation Date**: Among articles with the same active status, the oldest is kept
3. **First Match**: If all else is equal, the first one found is kept

### What Gets Updated
For each duplicate article that gets deactivated:
- `isActive` → `false`
- `updatedAt` → current timestamp
- `notes` array → adds a system note explaining the deactivation

### Safety Features
- **Preview Mode**: Always preview changes before applying
- **Interactive Confirmation**: Requires user confirmation before making changes
- **Detailed Logging**: Shows exactly what will be/was changed
- **Verification**: Checks results after completion
- **Rollback Info**: Maintains audit trail for potential rollbacks

---

## Before Running

### Prerequisites
1. **Backup Database**: Always backup your database before running data modification scripts
2. **Environment Setup**: Ensure your `.env` file is configured with correct `MONGO_URI`
3. **Node Dependencies**: Run `npm install` to ensure all dependencies are available

### Recommended Workflow
```bash
# Step 1: Preview what would be changed (safe)
npm run fix:duplicates:preview

# Step 2: Review the output carefully
# Step 3: If you're satisfied, run the fix
npm run fix:duplicates:apply

# Step 4: Verify results
npm run fix:duplicates:preview  # Should show no duplicates
```

---

## Output Interpretation

### Icons & Status Indicators
- ✅ **KEEPING**: Article that will remain active
- ❌ **DEACTIVATED**: Article that was marked inactive
- ⚪ **ALREADY INACTIVE**: Article that was already inactive
- 🔍 **PREVIEW MODE**: No changes made, showing analysis only
- 📊 **Statistics**: Summary of changes made/to be made

### Statistics Section
```
📈 SUMMARY:
   • Duplicate designations found: 5
   • Total duplicate articles processed: 12
   • Articles deactivated: 8
   • Articles already inactive: 4
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```
❌ MongoDB connection error: MongooseServerSelectionError: getaddrinfo ENOTFOUND mongodb
```
**Solutions**:
- **Check MongoDB is running**: Ensure MongoDB service is started locally
- **Local vs Docker**: Scripts use `MONGO_URI_LOCAL` first, then fallback to `MONGO_URI`
- **Connection string**: Verify the correct connection string in `.env`:
  ```env
  # For local MongoDB
  MONGO_URI_LOCAL=mongodb://localhost:27017/gestionEmballages
  
  # For Docker MongoDB (container name "mongodb")
  MONGO_URI=mongodb://mongodb:27017/gestionEmballages
  ```

**2. Check MongoDB Status**:
```bash
# On Windows (if MongoDB installed as service)
net start MongoDB

# Or check if process is running
tasklist /fi "imagename eq mongod.exe"

# Test connection manually
mongo --eval "db.version()"
```

**2. Permission Issues**
```
❌ Error fixing duplicate designations: MongoError: not authorized
```
**Solution**: Ensure your database user has write permissions

**3. No Duplicates Found**
```
✅ No duplicate designations found. Database is clean!
```
**Solution**: This is good! Your database has no duplicate designations

### Recovery Options
If you need to rollback changes:
1. Check the system notes added to deactivated articles
2. Query articles with specific system notes: `db.articles.find({"notes.type": "system", "notes.text": /duplicate designation/})`
3. Reactivate articles if needed: `db.articles.updateMany({...}, {$set: {isActive: true}})`

---

## Environment Variables Required

```env
MONGO_URI=mongodb://localhost:27017/gestion-emballages
```

---

## Contact & Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the detailed console output for specific error messages
3. Ensure you have proper database backups before running fixes

**Remember**: Always run the preview script first to understand what changes will be made!