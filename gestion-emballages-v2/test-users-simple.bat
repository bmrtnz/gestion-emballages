@echo off
echo Testing Users API (Windows Compatible)...
echo ========================================
echo.

echo Step 1: Test login endpoint
echo ----------------------------
echo Login request:
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"nicole@embadif.com\",\"password\":\"password123\"}"
echo.
echo.

echo Step 2: Manual token test (copy token from above)
echo --------------------------------------------------
echo Please copy the accessToken from the login response above, then run:
echo curl -H "Authorization: Bearer YOUR_TOKEN_HERE" "http://localhost:3000/api/v1/users?page=1&limit=20"
echo.

echo Step 3: Quick test with hardcoded token
echo ----------------------------------------
echo Testing with a sample request format...
echo curl -H "Authorization: Bearer SAMPLE_TOKEN" "http://localhost:3000/api/v1/users"
curl -H "Authorization: Bearer SAMPLE_TOKEN" "http://localhost:3000/api/v1/users"
echo.
echo.

echo Instructions:
echo 1. Copy the accessToken from Step 1
echo 2. Replace SAMPLE_TOKEN in the curl command with your actual token
echo 3. Run the curl command manually
echo 4. Check backend console for any TypeORM errors
echo.
pause