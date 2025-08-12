# PowerShell script to run the Station audit fields migration
Write-Host "Running Station audit fields migration..." -ForegroundColor Green

try {
    # Change to backend directory
    Set-Location "C:\Users\bruno.martinez\Documents\Local-work\gestion-emballages\gestion-emballages-v2\backend"
    
    # Run the migration
    Write-Host "Executing migration..." -ForegroundColor Yellow
    npm run migration:run
    
    Write-Host "Migration completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Migration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}