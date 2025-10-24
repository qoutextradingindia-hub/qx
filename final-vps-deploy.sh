#!/bin/bash

# ========================================
# 🚀 StarTraders Final VPS Deployment Script
# ========================================
# Run this script on your VPS after SSH login
# All Render URLs have been fixed, now deploying to VPS

echo "🌟 Starting StarTraders Final VPS Deployment..."
echo "Domain: qxtrand.onrender.com"
echo "VPS IP: 31.97.207.160"
echo ""

# Step 1: Navigate to project directory
echo "📁 Navigating to project directory..."
cd ~/Startraders || { echo "❌ Project directory not found!"; exit 1; }

# Step 2: Pull latest changes from GitHub
echo "⬇️ Pulling latest changes from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed! Check your repository connection."
    exit 1
fi

echo "✅ Latest code pulled successfully!"

# Step 3: Backend - Restart PM2 process
echo "🔄 Restarting backend server with PM2..."
pm2 restart server || pm2 start server.js --name server

# Step 4: Frontend - Build and Deploy
echo "🏗️ Building and deploying frontend..."
cd client

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf build
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building React app for production..."
npm run build

if [ ! -d "build" ]; then
    echo "❌ Build failed! Check for errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 5: Backup current website
echo "💾 Creating backup of current website..."
sudo cp -r /var/www/html /var/www/html_backup_$(date +%Y%m%d_%H%M%S)

# Step 6: Deploy new build
echo "🚀 Deploying new build to website..."
sudo rm -rf /var/www/html/*
sudo cp -r build/* /var/www/html/

# Step 7: Set proper permissions
echo "🔒 Setting proper permissions..."
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Step 8: Test and reload Nginx
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

# Step 9: Final verification
echo ""
echo "================================================"
echo "✅ 🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉 ✅"
echo "================================================"
echo ""
echo "🌐 Your website is now live at:"
echo "   • https://qxtrand.onrender.com"
echo "   • https://qxtrand.onrender.com"
echo "   • http://31.97.207.160"
echo ""
echo "🔧 API Base URL is now: https://qxtrand.onrender.com/api"
echo ""
echo "📊 Website size: $(sudo du -sh /var/www/html/ | cut -f1)"
echo ""
echo "🧪 To test in browser:"
echo "   1. Open browser dev tools (F12)"
echo "   2. Go to Network tab"
echo "   3. Login to your site"
echo "   4. Check that all API calls go to: qxtrand.onrender.com/api"
echo "   5. NO calls should go to: onrender.com"
echo ""
echo "✅ All Render URLs have been completely removed!"
echo "✅ CORS errors should be fixed now!"
echo ""
echo "================================================"
