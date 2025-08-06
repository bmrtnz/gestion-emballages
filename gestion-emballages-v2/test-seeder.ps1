# Test the database seeder after fixing User entity foreign key constraint issue
# PowerShell script to run seeder

Write-Host "🔧 Testing Database Seeder - Foreign Key Fix Applied" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Navigate to backend directory
Set-Location "C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\backend"

Write-Host "📍 Current directory:" (Get-Location) -ForegroundColor Yellow

# Check if PostgreSQL is running
Write-Host "🔍 Checking PostgreSQL status..." -ForegroundColor Blue
try {
    $psqlStatus = docker-compose -f ../docker-compose.windows.yml ps postgres
    Write-Host "PostgreSQL Status:" -ForegroundColor Green
    Write-Host $psqlStatus
} catch {
    Write-Host "❌ Error checking PostgreSQL status: $_" -ForegroundColor Red
    Write-Host "💡 Starting PostgreSQL..." -ForegroundColor Yellow
    docker-compose -f ../docker-compose.windows.yml up -d postgres
    Start-Sleep 5
}

# Run the seeder
Write-Host "🌱 Running database seeder..." -ForegroundColor Green
Write-Host "This should now work without foreign key constraint errors" -ForegroundColor Cyan

try {
    npm run seed
    Write-Host "✅ Seeder completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Seeder failed: $_" -ForegroundColor Red
    Write-Host "📝 Check the error output above for details" -ForegroundColor Yellow
}

Write-Host "🏁 Test completed. Check output above for results." -ForegroundColor Cyan