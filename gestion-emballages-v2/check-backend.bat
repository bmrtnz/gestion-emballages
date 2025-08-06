@echo off
echo Checking Backend Server Status...
echo ================================

echo.
echo Checking port 3000...
netstat -an | findstr :3000

echo.
echo Testing API endpoints...
echo.
echo 1. Testing Swagger docs:
curl -s -o nul -w "Swagger Docs Status: %%{http_code}\n" http://localhost:3000/api/docs

echo.
echo 2. Testing Auth endpoint:
curl -s -o nul -w "Auth Endpoint Status: %%{http_code}\n" -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{}"

echo.
echo If you see "Backend Status: 200" above, the backend is running!
echo If not, start the backend with: cd backend && npm run start:dev
echo.
pause