@echo off
echo Setting MinIO bucket to public access...
echo.

echo Step 1: Download MinIO Client (if not already installed)
echo Download from: https://dl.min.io/client/mc/release/windows-amd64/mc.exe
echo Place mc.exe in your PATH or current directory
echo.

echo Step 2: Configure MinIO alias
mc alias set local http://localhost:9000 minioadmin minioadmin123

echo Step 3: Set bucket to public
mc anonymous set public local/documents

echo Step 4: Verify access
mc anonymous list local/documents

echo.
echo Done! The documents bucket should now be public.
pause