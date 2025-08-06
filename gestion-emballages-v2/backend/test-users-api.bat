@echo off
echo Testing Users API...
echo ===================
echo.

echo First, let me get a JWT token:
echo.
FOR /F "tokens=*" %%i IN ('curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"nicole@embadif.com\",\"password\":\"password123\"}" ^| jq -r .accessToken') DO SET TOKEN=%%i

echo Token obtained (first 30 chars): %TOKEN:~0,30%...
echo.

echo Now testing users endpoint with token:
curl -H "Authorization: Bearer %TOKEN%" "http://localhost:3000/api/v1/users?page=1&limit=20&sortBy=nomComplet&sortOrder=ASC"

echo.
echo.
echo Check the BACKEND CONSOLE for any error messages!
pause