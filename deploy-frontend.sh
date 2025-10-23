#!/bin/bash
# One-Command StarTraders Frontend Deployment for VPS
# Usage: curl -sSL https://raw.githubusercontent.com/luckyparihar3111-crypto/Startraders/main/deploy-frontend.sh | bash

set -e  # Exit on any error

echo "🚀========================================"
echo "  StarTraders Frontend Deployment"
echo "========================================"

# Function to print colored output
print_status() {
    echo "🔵 $1"
}

print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
}

# Check if we're on VPS
if [ ! -d "~/Startraders" ] && [ ! -d "/root/Startraders" ]; then
    print_error "Startraders project not found. Make sure you're on the VPS and project is cloned."
    exit 1
fi

# Navigate to project directory
print_status "Navigating to project directory..."
cd ~/Startraders 2>/dev/null || cd /root/Startraders

# Pull latest changes
print_status "Pulling latest changes from GitHub..."
git pull origin main

# Navigate to client
print_status "Entering client directory..."
cd client

# Clean build
print_status "Cleaning previous build..."
rm -rf build node_modules/.cache 2>/dev/null || true

# Install dependencies
print_status "Installing dependencies..."
npm install --production

# Build project
print_status "Building production build..."
export NODE_ENV=production
npm run build

# Verify build
if [ ! -d "build" ]; then
    print_error "Build failed! No build directory found."
    exit 1
fi

print_success "Build completed successfully!"

# Backup current site
print_status "Creating backup of current site..."
sudo mkdir -p /var/backups/startraders
sudo cp -r /var/www/html /var/backups/startraders/backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Deploy new build
print_status "Deploying new build..."
sudo rm -rf /var/www/html/*
sudo cp -r build/* /var/www/html/

# Set permissions
print_status "Setting proper permissions..."
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Test and reload nginx
print_status "Testing nginx configuration..."
sudo nginx -t

print_status "Reloading nginx..."
sudo systemctl reload nginx

# Final checks
print_success "Deployment completed successfully!"
echo ""
echo "🌐 Test your website:"
echo "   • http://31.97.207.160"
echo "   • https://startradersindia.in"
echo ""
echo "🔧 API should now connect to:"
echo "   • https://startradersindia.in/api"
echo ""
echo "📊 Deployment info:"
echo "   • Build size: $(du -sh /var/www/html/ | cut -f1)"
echo "   • Files: $(find /var/www/html -type f | wc -l) files deployed"
echo ""
print_success "Frontend deployment complete! 🎉"
