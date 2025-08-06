# Check PostgreSQL Database

Write-Host "🔍 Checking Database Status" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Check if PostgreSQL is running
Write-Host "`n1. PostgreSQL Container Status:" -ForegroundColor Yellow
docker-compose -f docker-compose.windows.yml ps postgres

# Connect to database and check users
Write-Host "`n2. Checking Users in Database:" -ForegroundColor Yellow
Write-Host "Running SQL query..." -ForegroundColor Gray

$query = "SELECT email, role, entite_type, is_active FROM users;"

try {
    docker-compose -f docker-compose.windows.yml exec -T postgres psql -U dev_user -d gestion_emballages_dev -c "$query"
} catch {
    Write-Host "❌ Could not connect to database" -ForegroundColor Red
    Write-Host "Make sure PostgreSQL is running!" -ForegroundColor Yellow
}

Write-Host "`n3. Quick Database Commands:" -ForegroundColor Cyan
Write-Host "- Connect to DB: docker-compose -f docker-compose.windows.yml exec postgres psql -U dev_user gestion_emballages_dev" -ForegroundColor White
Write-Host "- List tables: \dt" -ForegroundColor White
Write-Host "- Show users: SELECT * FROM users;" -ForegroundColor White
Write-Host "- Exit: \q" -ForegroundColor White