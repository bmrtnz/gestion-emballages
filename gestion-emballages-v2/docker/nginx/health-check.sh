#!/bin/sh

# Health check script for Nginx container
# This script checks if Nginx is responding properly

set -e

# Check if Nginx is running
if ! pgrep nginx > /dev/null; then
    echo "Nginx process not found"
    exit 1
fi

# Check if the health endpoint responds
if ! curl -f http://localhost/health > /dev/null 2>&1; then
    echo "Health endpoint not responding"
    exit 1
fi

# Check if the main application is serving files
if ! curl -f http://localhost/ > /dev/null 2>&1; then
    echo "Main application not responding"
    exit 1
fi

echo "Health check passed"
exit 0