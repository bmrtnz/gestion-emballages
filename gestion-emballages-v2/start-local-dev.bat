@echo off
echo Starting Local Development Environment...
echo.

REM Copy .env.local to .env if it doesn't exist or is different
echo Copying environment configuration...
cd backend
copy /Y .env.local .env
cd ..

echo.
echo Starting Docker services (PostgreSQL, Redis, MinIO)...
docker-compose -f docker-compose.local.yml up -d

echo.
echo Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak > nul

echo.
echo Docker services status:
docker-compose -f docker-compose.local.yml ps

echo.
echo =========================================
echo Local development environment is ready!
echo =========================================
echo.
echo Next steps:
echo 1. Backend: cd backend && npm run migration:run && npm run start:dev
echo 2. Frontend: cd frontend && npm start
echo.
echo Development tools available at:
echo - Adminer (Database): http://localhost:8080
echo - MailHog (Email): http://localhost:8025
echo - Redis Commander: http://localhost:8081
echo - MinIO Console: http://localhost:9011
echo.