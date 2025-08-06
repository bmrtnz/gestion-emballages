@echo off
echo Testing Backend Endpoints...
echo ===========================
echo.

echo 1. Test endpoint:
curl http://localhost:3000/api/v1/auth/test
echo.
echo.

echo 2. Login with empty body:
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{}"
echo.
echo.

echo 3. Login with valid credentials:
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"nicole@embadif.com\",\"password\":\"password123\"}"
echo.
echo.

echo Check the BACKEND CONSOLE for detailed error messages!
pause