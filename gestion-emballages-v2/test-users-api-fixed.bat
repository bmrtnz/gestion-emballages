@echo off
echo Testing Users API after UUID casting fix...
echo ==========================================
echo.

echo Step 1: Get JWT token
echo ----------------------
FOR /F "tokens=*" %%i IN ('curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"nicole@embadif.com\",\"password\":\"password123\"}" ^| jq -r .accessToken') DO SET TOKEN=%%i

if "%TOKEN%"=="null" (
    echo ERROR: Failed to get token. Is the backend running?
    pause
    exit /b 1
)

echo Token obtained: %TOKEN:~0,30%...
echo.

echo Step 2: Test users endpoint
echo ---------------------------
echo Making request to: http://localhost:3000/api/v1/users?page=1&limit=20
echo.

curl -w "HTTP Status: %%{http_code}\n" -H "Authorization: Bearer %TOKEN%" "http://localhost:3000/api/v1/users?page=1&limit=20"

echo.
echo.
echo Step 3: Check results
echo ---------------------
echo If you see HTTP Status: 200 and user data above, the fix worked!
echo If you see HTTP Status: 500, check the backend console for errors.
echo.
echo BACKEND CONSOLE should show successful TypeORM queries instead of errors.
echo.
pause