@echo off
echo Running Direct Auth Test...
echo ==========================
echo.
npx ts-node -r tsconfig-paths/register src/test-auth-direct.ts
echo.
pause