# Detailed Auth Testing Script

Write-Host "🔍 Detailed Auth Endpoint Testing" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test with verbose error output
Write-Host "`n1. Testing login endpoint with full error details:" -ForegroundColor Yellow

$body = @{
    email = "nicole@embadif.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ Error $statusCode" -ForegroundColor Red
    
    # Try to get error details from response
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $responseBody = $reader.ReadToEnd()
    
    Write-Host "`nError Response Body:" -ForegroundColor Yellow
    try {
        $responseBody | ConvertFrom-Json | ConvertTo-Json -Depth 5
    } catch {
        Write-Host $responseBody
    }
}

Write-Host "`n2. Testing with empty credentials:" -ForegroundColor Yellow
$emptyBody = @{} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $emptyBody `
        -ErrorAction Stop
} catch {
    Write-Host "Expected validation error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n3. Checking if database has users:" -ForegroundColor Yellow
Write-Host "Run this SQL in PostgreSQL to check:" -ForegroundColor Gray
Write-Host "SELECT email, role, entite_type FROM users;" -ForegroundColor White

Write-Host "`n📋 Common 500 Error Causes:" -ForegroundColor Cyan
Write-Host "1. Database connection lost - check PostgreSQL is running" -ForegroundColor White
Write-Host "2. JWT secret not configured - check .env file" -ForegroundColor White
Write-Host "3. bcrypt module issues - might need npm rebuild" -ForegroundColor White
Write-Host "4. Entity relations issue - backend needs restart after fixes" -ForegroundColor White

Write-Host "`n🔧 Quick Fixes to Try:" -ForegroundColor Cyan
Write-Host "1. Restart backend: cd backend && npm run start:dev" -ForegroundColor Yellow
Write-Host "2. Check PostgreSQL: docker-compose -f docker-compose.windows.yml ps postgres" -ForegroundColor Yellow
Write-Host "3. Re-run seeder: cd backend && npm run seed" -ForegroundColor Yellow
Write-Host "4. Rebuild backend: cd backend && npm run build" -ForegroundColor Yellow