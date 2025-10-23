#!/bin/bash
# StarTraders Complete Automated Setup Script
# Just copy-paste this entire script in VPS terminal

echo "🚀 Starting StarTraders Complete Setup..."
echo "📋 This will setup: PM2 + Backend + NGINX + Domain + SSL"
echo "⏳ Please wait, this might take 5-10 minutes..."

# Step 1: Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Step 2: Start Backend with PM2
echo "🔧 Starting Backend with PM2..."
cd ~/Startraders
pm2 start server.js --name startraders-backend --watch
pm2 save

# Step 3: Setup PM2 Auto-start
echo "🔄 Setting up PM2 auto-start..."
pm2 startup
echo "⚠️  IMPORTANT: Copy and run the command that PM2 shows above!"
read -p "Press Enter after running the PM2 startup command..."

# Step 4: Check if backend is running
echo "✅ Checking backend status..."
pm2 status
sleep 3

# Step 5: Create NGINX Configuration
echo "🌐 Creating NGINX configuration..."
sudo tee /etc/nginx/sites-available/startraders > /dev/null <<EOF
server {
    listen 80;
    server_name startradersindia.in www.startradersindia.in 31.97.207.160;
    
    # Root directory for React build files
    root /var/www/html;
    index index.html;

    # Frontend - Serve React app
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Backend auth routes
    location /auth {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Step 6: Enable NGINX site
echo "🔗 Enabling NGINX site..."
sudo ln -sf /etc/nginx/sites-available/startraders /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Step 7: Test and reload NGINX
echo "🧪 Testing NGINX configuration..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ NGINX config is valid!"
    sudo systemctl reload nginx
    echo "🔄 NGINX reloaded successfully!"
else
    echo "❌ NGINX config has errors!"
    exit 1
fi

# Step 8: Copy frontend build to nginx
echo "📂 Copying frontend files..."
sudo cp -r ~/Startraders/client/build/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Step 9: Install Certbot for SSL
echo "🔒 Installing SSL certificate (Certbot)..."
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Step 10: Get SSL Certificate
echo "🔐 Getting SSL certificate for startradersindia.in..."
echo "⚠️  Make sure your domain DNS is pointing to this VPS IP: 31.97.207.160"
read -p "Press Enter if DNS is configured, or Ctrl+C to cancel..."

sudo certbot --nginx -d startradersindia.in -d www.startradersindia.in --non-interactive --agree-tos --email admin@startradersindia.in --redirect

# Step 11: Test auto-renewal
echo "🔄 Setting up SSL auto-renewal..."
sudo certbot renew --dry-run

# Step 12: Final status check
echo "📊 Final Status Check:"
echo "========================"
echo "🔧 PM2 Status:"
pm2 status
echo ""
echo "🌐 NGINX Status:"
sudo systemctl status nginx --no-pager -l
echo ""
echo "🔒 SSL Status:"
sudo systemctl status certbot.timer --no-pager
echo ""

# Step 13: Test website
echo "🧪 Testing website..."
curl -I http://startradersindia.in
curl -I https://startradersindia.in

echo ""
echo "🎉 ================================="
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "🌐 Website: https://startradersindia.in"
echo "🔧 Backend API: https://startradersindia.in/api"
echo "🔒 SSL: Enabled & Auto-renewal setup"
echo "⚡ PM2: Backend running automatically"
echo "🎉 ================================="
echo ""
echo "🔧 Useful commands for management:"
echo "pm2 status              - Check backend status"  
echo "pm2 restart all         - Restart backend"
echo "pm2 logs                - View backend logs"
echo "sudo systemctl status nginx - Check nginx status"
echo "sudo certbot certificates - Check SSL certificates"
