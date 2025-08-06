@echo off
echo Testing Auth Endpoint...
echo.

echo 1. Testing with valid credentials:
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"nicole@embadif.com\",\"password\":\"password123\"}" -v

echo.
echo 2. Testing Swagger:
curl http://localhost:3000/api/docs -I

echo.
echo Check the BACKEND CONSOLE for error details!
pause