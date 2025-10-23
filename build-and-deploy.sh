#!/bin/bash
# Complete Client Build and Deploy Script for VPS

echo "🚀 StarTraders Frontend Build & Deploy Script"
echo "=============================================="

# Step 1: Navigate to client directory
echo "📂 Step 1: Navigating to client directory..."
cd client

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm install

# Step 3: Build for production
echo "🏗️ Step 3: Building for production..."
npm run build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Build completed successfully!"
    echo "📊 Build size:"
    du -sh build/
    echo ""
    
    echo "📋 Next steps for VPS deployment:"
    echo "1. Copy build files to VPS:"
    echo "   scp -r build/* root@31.97.207.160:/var/www/html/"
    echo ""
    echo "2. Or if already on VPS:"
    echo "   sudo cp -r ~/Startraders/client/build/* /var/www/html/"
    echo "   sudo chown -R www-data:www-data /var/www/html/"
    echo "   sudo chmod -R 755 /var/www/html/"
    echo ""
    echo "3. Restart nginx:"
    echo "   sudo systemctl reload nginx"
    echo ""
    echo "4. Test the website:"
    echo "   https://startradersindia.in"
    echo ""
    echo "✅ Frontend ready for deployment!"
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi
