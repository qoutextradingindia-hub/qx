#!/bin/bash
# StarTraders Complete VPS Setup - ALL IN ONE
# This script will setup everything automatically

set -e  # Exit on any error

echo "🚀 ================================="
echo "   STARTRADERS VPS COMPLETE SETUP"  
echo "================================="
echo ""

# Step 1: System Setup
echo "📋 Step 1/4: System & Dependencies Setup..."
echo "🔄 Updating system..."
sudo apt update && sudo apt upgrade -y

echo "📦 Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "🔧 Installing essential tools..."
sudo apt install -y git nginx certbot python3-certbot-nginx ufw curl

echo "⚡ Installing PM2..."
sudo npm install -g pm2

echo "✅ Step 1 completed!"
echo ""

# Step 2: Project Setup
echo "📋 Step 2/4: Project Clone & Build..."
cd ~
if [ -d "Startraders" ]; then
    echo "📂 Updating existing project..."
    cd Startraders
    git pull
else
    echo "📥 Cloning StarTraders project..."
    git clone https://github.com/luckyparihar3111-crypto/Startraders.git
    cd Startraders
fi

echo "📦 Installing backend dependencies..."
npm install

echo "🏗️ Building frontend..."
cd client
npm install
npm run build
cd ..

echo "📂 Deploying frontend to nginx..."
sudo rm -rf /var/www/html/*
sudo cp -r client/build/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

echo "🚀 Starting backend with PM2..."
pm2 delete startraders-backend 2>/dev/null || true
pm2 start server.js --name startraders-backend
pm2 save

echo "✅ Step 2 completed!"
echo ""

# Step 3: NGINX Configuration
echo "📋 Step 3/4: NGINX Configuration..."
sudo tee /etc/nginx/sites-available/startraders > /dev/null <<'EOF'
server {
    listen 80;
    server_name startradersindia.in www.startradersindia.in 31.97.207.160;
    
    root /var/www/html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location ~ ^/(auth|login|register|user) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
EOF

sudo ln -sf /etc/nginx/sites-available/startraders /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo "🧪 Testing NGINX configuration..."
sudo nginx -t && sudo systemctl restart nginx

echo "🔒 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "✅ Step 3 completed!"
echo ""

# Step 4: SSL Setup
echo "📋 Step 4/4: SSL Certificate Setup..."
echo "🔍 Checking if domain points to this server..."

# Check if running SSL setup is requested
echo "🔒 Do you want to setup SSL now? Domain must be pointing to this IP."
echo "Current server IP: $(curl -s ifconfig.me 2>/dev/null || echo '31.97.207.160')"
echo ""
read -p "Setup SSL certificate? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ]; then
    echo "🔐 Setting up SSL certificate..."
    sudo certbot --nginx \
        -d startradersindia.in \
        -d www.startradersindia.in \
        --non-interactive \
        --agree-tos \
        --email admin@startradersindia.in \
        --redirect || echo "⚠️  SSL setup failed - domain might not be pointing to this server yet"
    
    sudo certbot renew --dry-run 2>/dev/null && echo "✅ SSL auto-renewal test passed"
    sudo systemctl enable certbot.timer
fi

echo "✅ Step 4 completed!"
echo ""

# Final Status
echo "🎉 ================================="
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "================================="
echo "🌐 Website: http://31.97.207.160"
if [ "$setup_ssl" = "y" ]; then
    echo "🔒 HTTPS: https://startradersindia.in"
fi
echo "🔧 Backend: Running on PM2"
echo ""

echo "📊 Current Status:"
echo "=================="
pm2 status
echo ""
sudo systemctl status nginx --no-pager -l | head -n 3
echo ""

echo "🔧 Useful Commands:"
echo "pm2 status              - Check backend"
echo "pm2 logs startraders-backend - View logs"  
echo "pm2 restart startraders-backend - Restart backend"
echo "sudo systemctl status nginx - Check nginx"
echo "sudo nginx -t           - Test nginx config"

echo ""
echo "🎯 Next Steps:"
if [ "$setup_ssl" != "y" ]; then
    echo "1. Configure DNS: startradersindia.in -> 31.97.207.160"
    echo "2. Wait for DNS propagation (5-30 minutes)"
    echo "3. Run: sudo certbot --nginx -d startradersindia.in -d www.startradersindia.in"
fi
echo "✅ Your StarTraders application is now LIVE!"
