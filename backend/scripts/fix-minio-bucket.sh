#!/bin/bash

echo "Setting MinIO bucket to public access..."
echo ""

# Check if mc is installed
if ! command -v mc &> /dev/null; then
    echo "MinIO Client (mc) is not installed."
    echo "Please install it first:"
    echo "  Linux/Mac: curl https://dl.min.io/client/mc/release/linux-amd64/mc -o mc && chmod +x mc"
    echo "  Windows: Download from https://dl.min.io/client/mc/release/windows-amd64/mc.exe"
    echo ""
    exit 1
fi

echo "Step 1: Configure MinIO alias"
mc alias set local http://localhost:9000 minioadmin minioadmin123

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to MinIO. Make sure MinIO is running on localhost:9000"
    echo "   Run: docker-compose up -d minio"
    exit 1
fi

echo "Step 2: Set bucket to public"
mc anonymous set public local/documents

if [ $? -eq 0 ]; then
    echo "✅ Bucket set to public successfully!"
    
    echo "Step 3: Verify access"
    mc anonymous list local/documents
    
    echo ""
    echo "Test access with:"
    echo "curl -I http://localhost:9000/documents/test.jpg"
    echo "(Should return 404, not 403)"
else
    echo "❌ Failed to set bucket policy"
fi