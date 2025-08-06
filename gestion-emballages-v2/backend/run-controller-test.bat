@echo off
echo Running Controller Test...
echo =========================
echo.
npx ts-node -r tsconfig-paths/register src/test-controller-direct.ts
echo.
echo.
echo Running Validation Test...
echo =========================
echo.
npx ts-node -r tsconfig-paths/register src/test-validation.ts
echo.
pause