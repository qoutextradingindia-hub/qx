#!/bin/bash

echo "🔍 StarTraders VPS Email Diagnostics"
echo "====================================="

echo ""
echo "1. 🌐 Checking Email Port (587)..."
echo "-----------------------------------"
nc -zv smtp.gmail.com 587

echo ""
echo "2. 📦 Checking Node.js & Files..."
echo "--------------------------------"
echo "Node.js version: $(node -v 2>/dev/null || echo 'Node.js not found')"
echo "test-email.js exists: $([ -f "test-email.js" ] && echo "✅ Yes" || echo "❌ No")"
echo "utils/sendMail.js exists: $([ -f "utils/sendMail.js" ] && echo "✅ Yes" || echo "❌ No")"

echo ""
echo "3. 📤 Running Node.js Email Test..."
echo "----------------------------------"
if [ -f "test-email.js" ]; then
    node test-email.js
else
    echo "❌ test-email.js file not found!"
    echo "Create it with:"
    echo "nano test-email.js"
fi

echo ""
echo "🎯 Diagnostics Complete!"ash

echo "🔍 Checking Email Port (587)..."
nc -zv smtp.gmail.com 587

echo ""
echo "� Sending test email using Node.js script..."
node test-email.js
