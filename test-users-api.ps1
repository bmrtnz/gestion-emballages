# Test Users API Endpoint
# This script tests the users API after all TypeORM fixes

Write-Host "Testing Users API Endpoint..." -ForegroundColor Green
Write-Host "=" * 50

# Step 1: Login to get JWT token
Write-Host "`n1. Logging in to get JWT token..." -ForegroundColor Yellow

$loginUrl = "http://localhost:3000/api/v1/auth/login"
$loginData = @{
    email = "nicole@embadif.com"
    password = "password123"
} | ConvertTo-Json

$loginHeaders = @{
    "Content-Type" = "application/json"
}

try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginData -Headers $loginHeaders
    
    if ($loginResponse.accessToken) {
        Write-Host "✓ Login successful!" -ForegroundColor Green
        Write-Host "User: $($loginResponse.user.nom) $($loginResponse.user.prenom)" -ForegroundColor Cyan
        Write-Host "Role: $($loginResponse.user.role)" -ForegroundColor Cyan
        
        $token = $loginResponse.accessToken
    } else {
        Write-Host "✗ Login failed - no access token received" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Test Users API endpoint
Write-Host "`n2. Testing Users API endpoint..." -ForegroundColor Yellow

$usersUrl = "http://localhost:3000/api/v1/users"
$usersHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $usersResponse = Invoke-RestMethod -Uri $usersUrl -Method GET -Headers $usersHeaders
    
    Write-Host "✓ Users API call successful!" -ForegroundColor Green
    Write-Host "Total users: $($usersResponse.totalCount)" -ForegroundColor Cyan
    Write-Host "Users per page: $($usersResponse.limit)" -ForegroundColor Cyan
    Write-Host "Current page: $($usersResponse.page)" -ForegroundColor Cyan
    
    Write-Host "`nFirst few users:" -ForegroundColor Cyan
    foreach ($user in $usersResponse.data | Select-Object -First 3) {
        Write-Host "  - $($user.nom) $($user.prenom) ($($user.email)) - Role: $($user.role)" -ForegroundColor White
        if ($user.entiteName) {
            Write-Host "    Entity: $($user.entiteName) ($($user.entiteType))" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "✗ Users API failed: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Step 3: Test Users API with search
Write-Host "`n3. Testing Users API with search..." -ForegroundColor Yellow

$searchUrl = "http://localhost:3000/api/v1/users?search=martin"

try {
    $searchResponse = Invoke-RestMethod -Uri $searchUrl -Method GET -Headers $usersHeaders
    
    Write-Host "✓ Search API call successful!" -ForegroundColor Green
    Write-Host "Search results for 'martin': $($searchResponse.totalCount) users" -ForegroundColor Cyan
    
    if ($searchResponse.data.Count -gt 0) {
        foreach ($user in $searchResponse.data) {
            Write-Host "  - $($user.nom) $($user.prenom) ($($user.email))" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "✗ Search API failed: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Test Users API with pagination
Write-Host "`n4. Testing Users API with pagination..." -ForegroundColor Yellow

$paginationUrl = "http://localhost:3000/api/v1/users?page=1&limit=2"

try {
    $paginationResponse = Invoke-RestMethod -Uri $paginationUrl -Method GET -Headers $usersHeaders
    
    Write-Host "✓ Pagination API call successful!" -ForegroundColor Green
    Write-Host "Page 1 with limit 2: $($paginationResponse.data.Count) users returned" -ForegroundColor Cyan
    Write-Host "Has next page: $($paginationResponse.hasNextPage)" -ForegroundColor Cyan
    
} catch {
    Write-Host "✗ Pagination API failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n" + "=" * 50
Write-Host "All Users API tests completed successfully! ✓" -ForegroundColor Green
Write-Host "The TypeORM polymorphic relationship fixes are working correctly." -ForegroundColor Green