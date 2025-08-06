# PowerShell script to test API endpoints

Write-Host "🔍 Testing Backend API Endpoints" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test base URL
Write-Host "`n1. Testing base URL:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -ErrorAction Stop
    Write-Host "✅ Base URL accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Base URL not accessible: $_" -ForegroundColor Red
}

# Test Swagger docs
Write-Host "`n2. Testing Swagger documentation:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/docs" -Method GET -ErrorAction Stop
    Write-Host "✅ Swagger docs accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Swagger docs not accessible: $_" -ForegroundColor Red
}

# Test auth endpoint with correct path
Write-Host "`n3. Testing auth endpoint (v1):" -ForegroundColor Yellow
try {
    $body = @{
        email = "nicole@embadif.com"
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ Auth endpoint working!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Auth endpoint v1 failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try without v1
    Write-Host "`n4. Testing auth endpoint (without v1):" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        Write-Host "⚠️  Auth endpoint works WITHOUT v1!" -ForegroundColor Yellow
        Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Auth endpoint without v1 also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# List all available routes
Write-Host "`n5. Checking what's actually running on port 3000:" -ForegroundColor Yellow
netstat -an | findstr :3000

Write-Host "`n📋 Recommendations:" -ForegroundColor Cyan
Write-Host "1. If all endpoints fail, restart the backend: cd backend && npm run start:dev" -ForegroundColor White
Write-Host "2. Check the backend console for startup errors" -ForegroundColor White
Write-Host "3. Ensure the database is running: docker-compose -f docker-compose.windows.yml ps" -ForegroundColor White