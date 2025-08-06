# PowerShell script to test Users API after UUID casting fix
Write-Host "Testing Users API after UUID casting fix..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Step 1: Get JWT token
Write-Host "Step 1: Getting JWT token" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

$loginBody = @{
    email = "nicole@embadif.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.accessToken
    
    if ($token) {
        Write-Host "✅ Token obtained successfully" -ForegroundColor Green
        Write-Host "Token (first 30 chars): $($token.Substring(0, [Math]::Min(30, $token.Length)))..." -ForegroundColor Cyan
        Write-Host ""
        
        # Step 2: Test users endpoint
        Write-Host "Step 2: Testing users endpoint" -ForegroundColor Yellow
        Write-Host "------------------------------" -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/users?page=1&limit=20" -Method Get -Headers $headers
        
        Write-Host "✅ Users API call successful!" -ForegroundColor Green
        Write-Host "Response data:" -ForegroundColor Cyan
        $usersResponse | ConvertTo-Json -Depth 3
        
        Write-Host ""
        Write-Host "✅ SUCCESS: The UUID casting fix worked!" -ForegroundColor Green
        Write-Host "Users API is now working properly." -ForegroundColor Green
        
    } else {
        Write-Host "❌ Failed to get token from login response" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 500) {
            Write-Host ""
            Write-Host "🔍 This is a 500 Internal Server Error." -ForegroundColor Yellow
            Write-Host "Check the BACKEND CONSOLE for detailed error messages." -ForegroundColor Yellow
            Write-Host "Look for TypeORM query errors or UUID casting issues." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check the backend console for any error messages" -ForegroundColor White
Write-Host "2. If successful, test the users page in the frontend" -ForegroundColor White
Write-Host "3. Verify no more 500 errors on user management" -ForegroundColor White

Read-Host "Press Enter to continue..."