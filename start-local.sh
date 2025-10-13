#!/bin/bash
# Local development startup script
# Usage: ./start-local.sh YOUR_YAHOO_APP_PASSWORD

if [ -z "$1" ]; then
  echo "Error: Please provide your Yahoo app password"
  echo "Usage: ./start-local.sh YOUR_YAHOO_APP_PASSWORD"
  echo ""
  echo "To get a Yahoo app password:"
  echo "1. Go to https://login.yahoo.com/account/security"
  echo "2. Enable 2-factor authentication"
  echo "3. Generate an app password"
  echo "4. Run: ./start-local.sh your-app-password-here"
  exit 1
fi

export EMAIL_PASSWORD="$1"
echo "Starting server with email configuration..."
node server.js

